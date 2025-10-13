import InstallmentPlan from "@app/models/InstallmentPlan";
import Order from "@app/models/Order";
import Payment from "@app/models/Payment";
import Subscription from "@app/models/Subscription";
import User from "@app/models/User";
 
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

class StripeService {
  // Create or get Stripe customer for user
  async createOrGetCustomer(userId, userEmail, userName) {
    try {
      const user = await User.findById(userId);

      // Check if user already has a Stripe customer
      const stripePaymentMethod = user.payment_methods.find(
        (pm) => pm.provider === "stripe" && pm.customer_id
      );

      if (stripePaymentMethod && stripePaymentMethod.customer_id) {
        return stripePaymentMethod.customer_id;
      }

      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: userEmail,
        name: userName,
        metadata: { user_id: userId.toString() },
      });

      return customer.id;
    } catch (error) {
      throw new Error(`Failed to create Stripe customer: ${error.message}`);
    }
  }

  // Add payment method and charge initial $5
  async handleInitialPayment(userId, paymentMethodId, orderId) {
    try {
      const user = await User.findById(userId);
      const order = await Order.findById(orderId).populate(
        "installment_plan_id"
      );

      if (!user || !order) {
        throw new Error("User or order not found");
      }

      // Create or get customer
      const customerId = await this.createOrGetCustomer(
        userId,
        user.email,
        user.name
      );

      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Get payment method details for storing
      // const paymentMethod = await stripe.paymentMethods.retrieve(
      //   paymentMethodId
      // );

      // // Add to user's payment methods
      // const newPaymentMethod = {
      //   provider: "stripe",
      //   token: paymentMethodId,
      //   customer_id: customerId,
      //   last_four: paymentMethod.card.last4,
      //   is_default: user.payment_methods.length === 0, // First payment method is default
      // };

      // user.payment_methods.push(newPaymentMethod);
      // await user.save();

      // Create PaymentIntent for initial $5 charge
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.initial_payment_amount * 100), // Convert to cents
        currency: "usd",
        customer: customerId,
        payment_method: paymentMethodId,
        off_session: true,
        confirm: true,
        description:
          order.installment_plan_id.frequency === "instant"
            ? "Complete Order Payment"
            : "Impression Kit Payment",
        metadata: {
          order_id: orderId.toString(),
          user_id: userId.toString(),
        },
      });

      // Create payment record
      const payment = new Payment({
        order_id: orderId,
        amount: order.initial_payment_amount,
        payment_method_token: paymentMethodId,
        provider_transaction_id: paymentIntent.id,
        status: paymentIntent.status === "succeeded" ? "succeeded" : "pending",
        is_initial: true,
        paid_at: paymentIntent.status === "succeeded" ? new Date() : undefined,
      });

      await payment.save();

      // Update order if payment succeeded
      if (paymentIntent.status === "succeeded") {
        await Order.findByIdAndUpdate(orderId, {
          status:
            order.installment_plan_id.frequency === "instant"
              ? "full_paid"
              : "kit_paid",
          payment_method_token: paymentMethodId,
          updated_at: new Date(),
        });
      }

      return {
        success: paymentIntent.status === "succeeded",
        payment_intent: paymentIntent,
        payment: payment,
      };
    } catch (error) {
      throw new Error(`Initial payment failed: ${error.message}`);
    }
  }

  // Create subscription schedule for aligner installments (ENHANCED VERSION)
  async createInstallmentSubscriptionSchedule(orderId) {
    try {
      const order = await Order.findById(orderId)
        .populate("installment_plan_id")
        .populate("aligner_product_id");

      if (!order) {
        throw new Error("Order not found");
      }

      const user = await User.findById(order.user_id);
      const paymentMethod = user.payment_methods.find(
        (pm) => pm.token === order.payment_method_token
      );

      if (!paymentMethod) {
        throw new Error("Payment method not found");
      }

      const plan = order.installment_plan_id;
      const alignerPrice = order.aligner_product_id.price;
      const installmentAmount = alignerPrice / plan.num_installments;

      // Create or get price for this installment amount
      const priceId = await this.createOrGetPrice(
        installmentAmount,
        plan.frequency
      );

      // Calculate billing phases for subscription schedule
      const phases = await this.calculateInstallmentPhases(
        priceId,
        plan.num_installments,
        plan.frequency,
        installmentAmount
      );

      // Create subscription schedule
      const subscriptionSchedule = await stripe.subscriptionSchedules.create({
        customer: paymentMethod.customer_id,
        start_date: Math.floor(Date.now() / 1000), // start in 1 minute
        end_behavior: "cancel", // Cancel subscription after schedule ends
        phases: phases,
        default_settings: {
          default_payment_method: order.payment_method_token,
          collection_method: "charge_automatically",
        },
        metadata: {
          order_id: orderId.toString(),
          total_installments: plan.num_installments.toString(),
          installment_amount: installmentAmount.toString(),
          type: "aligner_installments",
        },
      });
      // Create subscription record in database
      const subscriptionRecord = new Subscription({
        order_id: orderId,
        provider_subscription_id: subscriptionSchedule.subscription, // This will be set when schedule activates
        provider_schedule_id: subscriptionSchedule.id, // Store schedule ID
        total_installments: plan.num_installments,
        installment_amount: installmentAmount,
        next_billing_date: new Date(
          subscriptionSchedule.phases[0].start_date * 1000
        ),
        status: "active", // New status for scheduled subscriptions
      });

      await subscriptionRecord.save();

      // Create pending payment records for each installment with precise due dates
      await this.createInstallmentPaymentRecords(
        orderId,
        subscriptionSchedule,
        plan.num_installments,
        installmentAmount,
        order.payment_method_token
      );

      // Update order status
      await Order.findByIdAndUpdate(orderId, {
        status: "subscription_active",
        subscription_start_date: new Date(
          subscriptionSchedule.phases[0].start_date * 1000
        ),
        updated_at: new Date(),
      });

      return {
        success: true,
        subscription_schedule: subscriptionSchedule,
        subscription_record: subscriptionRecord,
        phases: phases,
      };
    } catch (error) {
      throw new Error(
        `Subscription schedule creation failed: ${error.message}`
      );
    }
  }

  // Calculate phases for subscription schedule
  async calculateInstallmentPhases(
    priceId,
    totalInstallments,
    frequency,
    installmentAmount
  ) {
    const phases = [];
    const intervalMap = { weekly: "week", monthly: "month" };
    const interval = intervalMap[frequency] || "month";

    // Single phase with iterations for fixed installments
    phases.push({
      items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      iterations: totalInstallments, // This ensures exactly N payments
      collection_method: "charge_automatically",
      // Remove invoice_settings for automatic charging
      metadata: {
        phase_type: "installments",
        installment_amount: installmentAmount.toString(),
      },
    });

    return phases;
  }

  // Create payment records for each installment with precise timing
  async createInstallmentPaymentRecords(
    orderId,
    subscriptionSchedule,
    totalInstallments,
    installmentAmount,
    paymentMethodToken
  ) {
    const startDate = new Date(
      subscriptionSchedule.phases[0].start_date * 1000
    );
    const frequency = subscriptionSchedule.metadata.frequency || "monthly";

    for (let i = 1; i <= totalInstallments; i++) {
      const dueDate = new Date(startDate);

      if (frequency === "weekly") {
        dueDate.setDate(dueDate.getDate() + (i - 1) * 7);
      } else {
        dueDate.setMonth(dueDate.getMonth() + (i - 1));
      }

      const payment = new Payment({
        order_id: orderId,
        amount: installmentAmount,
        payment_method_token: paymentMethodToken,
        status: "pending", // New status for scheduled payments
        is_initial: false,
        installment_number: i,
        due_date: dueDate,
        provider_schedule_id: subscriptionSchedule.id, // Link to schedule
      });

      await payment.save();
    }
  }

  // Cancel subscription schedule
  async cancelSubscriptionSchedule(scheduleId) {
    try {
      const cancelledSchedule = await stripe.subscriptionSchedules.cancel(
        scheduleId
      );

      // Update database records
      await Subscription.findOneAndUpdate(
        { provider_schedule_id: scheduleId },
        {
          status: "cancelled",
          updated_at: new Date(),
        }
      );

      // Update pending payments
      const subscription = await Subscription.findOne({
        provider_schedule_id: scheduleId,
      });
      if (subscription) {
        await Payment.updateMany(
          {
            order_id: subscription.order_id,
            status: { $in: ["scheduled", "pending"] },
            is_initial: false,
          },
          { status: "cancelled" }
        );
      }

      return {
        success: true,
        schedule: cancelledSchedule,
      };
    } catch (error) {
      throw new Error(
        `Failed to cancel subscription schedule: ${error.message}`
      );
    }
  }

  // Get subscription schedule details
  async getSubscriptionScheduleDetails(scheduleId) {
    try {
      const stripeSchedule = await stripe.subscriptionSchedules.retrieve(
        scheduleId,
        {
          expand: ["subscription", "phases.items.price.product"],
        }
      );

      const dbSubscription = await Subscription.findOne({
        provider_schedule_id: scheduleId,
      }).populate("order_id");

      // Calculate next payment date from current phase
      let nextPaymentDate = null;
      if (
        stripeSchedule.subscription &&
        stripeSchedule.subscription.current_period_end
      ) {
        nextPaymentDate = new Date(
          stripeSchedule.subscription.current_period_end * 1000
        );
      } else if (stripeSchedule.current_phase) {
        nextPaymentDate = new Date(
          stripeSchedule.current_phase.start_date * 1000
        );
      }

      return {
        stripe_schedule: stripeSchedule,
        db_subscription: dbSubscription,
        next_payment_date: nextPaymentDate,
        remaining_installments: stripeSchedule.phases[0]?.iterations || 0,
        current_phase: stripeSchedule.current_phase,
        status: stripeSchedule.status,
      };
    } catch (error) {
      throw new Error(
        `Failed to get subscription schedule details: ${error.message}`
      );
    }
  }

  // Sync subscription schedule status
  async syncSubscriptionScheduleStatus(scheduleId) {
    try {
      const stripeSchedule = await stripe.subscriptionSchedules.retrieve(
        scheduleId,
        {
          expand: ["subscription"],
        }
      );

      const dbSubscription = await Subscription.findOne({
        provider_schedule_id: scheduleId,
      });

      if (!dbSubscription) {
        throw new Error("Subscription not found in database");
      }

      // Determine status based on schedule and subscription status
      let dbStatus = "scheduled";
      if (stripeSchedule.status === "canceled") {
        dbStatus = "cancelled";
      } else if (stripeSchedule.status === "completed") {
        dbStatus = "completed";
      } else if (stripeSchedule.subscription) {
        switch (stripeSchedule.subscription.status) {
          case "active":
            dbStatus = "active";
            break;
          case "canceled":
            dbStatus = "cancelled";
            break;
          case "past_due":
            dbStatus = "past_due";
            break;
          default:
            dbStatus = "active";
        }
      }

      // Update subscription record
      const updatedSubscription = await Subscription.findByIdAndUpdate(
        dbSubscription._id,
        {
          status: dbStatus,
          provider_subscription_id: stripeSchedule.subscription || null,
          next_billing_date: stripeSchedule.subscription
            ? new Date(stripeSchedule.subscription.current_period_end * 1000)
            : null,
          updated_at: new Date(),
        },
        { new: true }
      );

      return {
        success: true,
        subscription: updatedSubscription,
        stripe_schedule: stripeSchedule,
      };
    } catch (error) {
      throw new Error(`Failed to sync subscription schedule: ${error.message}`);
    }
  }

  // Create or get Stripe price for installment amount and frequency
  async createOrGetPrice(amount, frequency) {
    try {
      const amountInCents = Math.round(amount * 100);

      // Check if price already exists (you might want to cache these)
      const prices = await stripe.prices.list({
        lookup_keys: [`aligner_${frequency}_${amountInCents}`],
        limit: 1,
      });

      if (prices.data.length > 0) {
        return prices.data[0].id;
      }

      // Create new price
      const product = await stripe.products.create({
        name: `Aligner Installment - ${frequency}`,
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: amountInCents,
        currency: "usd",
        recurring: {
          interval: frequency === "weekly" ? "week" : "month",
          interval_count: 1,
        },
        lookup_key: `aligner_${frequency}_${amountInCents}`,
      });

      return price.id;
    } catch (error) {
      throw new Error(`Failed to create price: ${error.message}`);
    }
  }

  // Update subscription payment method
  async updateSubscriptionPaymentMethod(subscriptionId, newPaymentMethodId) {
    try {
      // Get the subscription first to get customer info
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscriptionId
      );

      // Attach new payment method to customer
      await stripe.paymentMethods.attach(newPaymentMethodId, {
        customer: stripeSubscription.customer,
      });

      // Update subscription with new payment method
      const updatedSubscription = await stripe.subscriptions.update(
        subscriptionId,
        {
          default_payment_method: newPaymentMethodId,
        }
      );

      // Update order record with new payment method
      const subscription = await Subscription.findOne({
        provider_subscription_id: subscriptionId,
      });

      if (subscription) {
        await Order.findByIdAndUpdate(subscription.order_id, {
          payment_method_token: newPaymentMethodId,
          updated_at: new Date(),
        });
      }

      return {
        success: true,
        subscription: updatedSubscription,
      };
    } catch (error) {
      throw new Error(`Failed to update payment method: ${error.message}`);
    }
  }

  // Get upcoming invoice for subscription
  async getUpcomingInvoice(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
        customer: subscription.customer,
        subscription: subscriptionId,
      });

      return {
        invoice: upcomingInvoice,
        amount_due: upcomingInvoice.amount_due / 100, // Convert from cents
        due_date: new Date(upcomingInvoice.next_payment_attempt * 1000),
        period_start: new Date(upcomingInvoice.period_start * 1000),
        period_end: new Date(upcomingInvoice.period_end * 1000),
      };
    } catch (error) {
      throw new Error(`Failed to get upcoming invoice: ${error.message}`);
    }
  }

  // Retry failed payment
  async retryFailedPayment(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ["latest_invoice"],
      });

      if (
        subscription.latest_invoice &&
        subscription.latest_invoice.status !== "paid"
      ) {
        const invoice = await stripe.invoices.pay(
          subscription.latest_invoice.id
        );

        // Update database subscription status
        await this.updateSubscriptionFromStripe(subscriptionId);

        return {
          success: true,
          invoice,
          payment_status: invoice.status,
        };
      }

      return {
        success: false,
        message: "No failed payment to retry",
      };
    } catch (error) {
      throw new Error(`Failed to retry payment: ${error.message}`);
    }
  }

  async updateSubscriptionFromStripe(subscriptionId) {
    try {
      // Fetch subscription data from Stripe
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscriptionId
      );
      // Get all paid invoices for this subscription to count completed installments
      const invoices = await stripe.invoices.list({
        subscription: subscriptionId,
        status: "paid",
        limit: 100,
      });

      const completedInstallments = invoices.data.length;

      // Find the subscription in your database
      const subscription = await Subscription.findOne({
        provider_subscription_id: subscriptionId,
      });

      const order = await Order.findById(subscription.order_id);
      const installmentPlan = await InstallmentPlan.findById(
        order.installment_plan_id
      );

      if (!subscription) {
        throw new Error("Subscription not found in database");
      }

      // Map Stripe status to your enum values
      let dbStatus = subscription.status;
      switch (stripeSubscription.status) {
        case "active":
          // Check if all installments are completed
          if (completedInstallments >= subscription.total_installments) {
            dbStatus = "completed";
          } else {
            dbStatus = "active";
          }
          break;
        case "canceled":
        case "cancelled":
          dbStatus = "cancelled";
          break;
        case "incomplete":
        case "incomplete_expired":
        case "past_due":
          dbStatus = "pending";
          break;
        case "trialing":
          dbStatus = "active";
          break;
        default:
          dbStatus = "pending";
      }
      let nextBillingDate = null;

      if (dbStatus === "active" && invoices.data.length > 0) {
        const lastInvoice = invoices.data[invoices.data.length - 1];

        if (lastInvoice && lastInvoice.period_end) {
          nextBillingDate = new Date(lastInvoice.period_end * 1000);

          if (installmentPlan.frequency === "weekly") {
            nextBillingDate.setDate(nextBillingDate.getDate() + 7);
          } else if (installmentPlan.frequency === "monthly") {
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
          }
        }
      }

      // Update subscription record
      const updatedSubscription = await Subscription.findByIdAndUpdate(
        subscription._id,
        {
          status: dbStatus,
          completed_installments: completedInstallments,
          next_billing_date: nextBillingDate,
          updated_at: new Date(),
        },
        { new: true }
      );

      return {
        success: true,
        subscription: updatedSubscription,
        stripe_data: stripeSubscription,
        completed_installments: completedInstallments,
      };
    } catch (error) {
      throw new Error(`Failed to update subscription: ${error.message}`);
    }
  }

  // Sync all subscriptions with Stripe (batch operation)
  async syncAllSubscriptionsWithStripe(limit = 200) {
    try {
      const subscriptions = await Subscription.find({
        status: { $in: ["active", "pending"] },
      }).limit(limit);

      const results = [];
      for (const subscription of subscriptions) {
        try {
          let result;
          if (subscription.provider_schedule_id) {
            result = await this.syncSubscriptionScheduleStatus(
              subscription.provider_schedule_id
            );
          } else if (subscription.provider_subscription_id) {
            result = await this.updateSubscriptionFromStripe(
              subscription.provider_subscription_id
            );
          } else {
            throw new Error("No provider ID found");
          }

          results.push({
            subscription_id: subscription._id,
            success: true,
            result,
          });
        } catch (error) {
          results.push({
            subscription_id: subscription._id,
            success: false,
            error: error.message,
          });
        }
      }

      return {
        total_processed: subscriptions.length,
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        results,
      };
    } catch (error) {
      throw new Error(`Failed to sync subscriptions: ${error.message}`);
    }
  }

  // Get customer's all subscriptions (enhanced for schedules)
  async getCustomerSubscriptions(customerId) {
    try {
      // Get regular subscriptions
      const stripeSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "all",
        expand: ["data.default_payment_method"],
      });

      // Get subscription schedules
      const stripeSchedules = await stripe.subscriptionSchedules.list({
        customer: customerId,
        expand: ["data.subscription", "data.phases.items.price"],
      });

      // Get database subscriptions
      const scheduleIds = stripeSchedules.data.map((s) => s.id);
      const subscriptionIds = stripeSubscriptions.data.map((s) => s.id);

      const dbSubscriptions = await Subscription.find({
        $or: [
          { provider_subscription_id: { $in: subscriptionIds } },
          { provider_schedule_id: { $in: scheduleIds } },
        ],
      }).populate("order_id");

      return {
        stripe_subscriptions: stripeSubscriptions.data,
        stripe_schedules: stripeSchedules.data,
        db_subscriptions: dbSubscriptions,
        total_count:
          stripeSubscriptions.data.length + stripeSchedules.data.length,
      };
    } catch (error) {
      throw new Error(`Failed to get customer subscriptions: ${error.message}`);
    }
  }

  // Update completed installments count (enhanced for schedules)
  async updateCompletedInstallments(scheduleId) {
    try {
      let subscription;

      if (scheduleId) {
        subscription = await Subscription.findOne({
          provider_schedule_id: scheduleId,
        });
      }

      if (!subscription) {
        throw new Error("Subscription not found");
      }

      // Count successful payments for this subscription
      const successfulPayments = await Payment.countDocuments({
        order_id: subscription.order_id,
        status: "succeeded",
        is_initial: false, // Only count installment payments
      });

      // Determine if subscription should be completed
      const isCompleted = successfulPayments >= subscription.total_installments;
      let newStatus = subscription.status;

      if (isCompleted && subscription.status !== "completed") {
        newStatus = "completed";

        // If there's an active schedule, complete it
        if (subscription.provider_schedule_id) {
          try {
            await stripe.subscriptionSchedules.cancel(
              subscription.provider_schedule_id
            );
          } catch (error) {}
        }
      }

      // Update the subscription record
      const updatedSubscription = await Subscription.findByIdAndUpdate(
        subscription._id,
        {
          completed_installments: successfulPayments,
          status: newStatus,
          ...(isCompleted && { completion_date: new Date() }),
          updated_at: new Date(),
        },
        { new: true }
      );

      return {
        success: true,
        subscription: updatedSubscription,
        completed_installments: successfulPayments,
        is_completed: isCompleted,
      };
    } catch (error) {
      throw new Error(
        `Failed to update completed installments: ${error.message}`
      );
    }
  }

  // Handle subscription schedule webhook events
  async handleScheduleWebhook(event) {
    try {
      const schedule = event.data.object;
      const scheduleId = schedule.id;

      switch (event.type) {
        case "subscription_schedule.created":
          // Schedule created - already handled in createInstallmentSubscriptionSchedule
          break;

        case "subscription_schedule.updated":
          await this.syncSubscriptionScheduleStatus(scheduleId);
          break;

        case "subscription_schedule.canceled":
          await this.cancelSubscriptionSchedule(scheduleId);
          break;

        case "subscription_schedule.completed":
          // Mark subscription as completed
          await Subscription.findOneAndUpdate(
            { provider_schedule_id: scheduleId },
            {
              status: "completed",
              completion_date: new Date(),
              updated_at: new Date(),
            }
          );
          break;

        case "subscription_schedule.released":
          // Schedule was released and converted to regular subscription
          await Subscription.findOneAndUpdate(
            { provider_schedule_id: scheduleId },
            {
              provider_subscription_id: schedule.subscription,
              status: "active",
              updated_at: new Date(),
            }
          );
          break;

        default:
      }

      return { success: true, event_type: event.type };
    } catch (error) {
      throw new Error(`Failed to handle schedule webhook: ${error.message}`);
    }
  }

  // Get installment payment history
  async getInstallmentPaymentHistory(orderId) {
    try {
      const payments = await Payment.find({
        order_id: orderId,
        is_initial: false,
      }).sort({ installment_number: 1 });

      const subscription = await Subscription.findOne({ order_id: orderId });

      let stripeData = null;
      if (subscription?.provider_schedule_id) {
        stripeData = await this.getSubscriptionScheduleDetails(
          subscription.provider_schedule_id
        );
      } else if (subscription?.provider_subscription_id) {
        stripeData = await this.getSubscriptionDetails(
          subscription.provider_subscription_id
        );
      }

      return {
        payments,
        subscription,
        stripe_data: stripeData,
        total_installments: subscription?.total_installments || 0,
        completed_installments: subscription?.completed_installments || 0,
      };
    } catch (error) {
      throw new Error(`Failed to get payment history: ${error.message}`);
    }
  }

  async cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
    try {
      let canceledSubscription;

      if (cancelAtPeriodEnd) {
        // Cancel at end of billing period
        canceledSubscription = await stripe.subscriptions.update(
          subscriptionId,
          {
            cancel_at_period_end: true,
          }
        );
      } else {
        // Cancel immediately
        canceledSubscription = await stripe.subscriptions.cancel(
          subscriptionId
        );
      }

      return {
        subscription: canceledSubscription,
        canceled_immediately: !cancelAtPeriodEnd,
        message: cancelAtPeriodEnd
          ? "Subscription will cancel at end of billing period"
          : "Subscription canceled immediately",
      };
    } catch (error) {
      console.error("Error canceling subscription:", error);

      // If subscription cancellation fails, try to find and cancel the subscription schedule
      try {
        // Get the subscription to find its schedule
        const subscription = await stripe.subscriptions.retrieve(
          subscriptionId
        );

        if (subscription.schedule) {
          // Cancel the subscription schedule
          const canceledSchedule = await stripe.subscriptionSchedules.cancel(
            subscription.schedule
          );

          return {
            subscription: null,
            schedule: canceledSchedule,
            canceled_immediately: true,
            message: "Subscription schedule canceled successfully",
          };
        } else {
          // No schedule found, re-throw original error
          throw new Error(`Failed to cancel subscription: ${error.message}`);
        }
      } catch (scheduleError) {
        console.error("Error canceling subscription schedule:", scheduleError);
        throw new Error(
          `Failed to cancel subscription and schedule: ${error.message}, ${scheduleError.message}`
        );
      }
    }
  }
}

export default new StripeService();
