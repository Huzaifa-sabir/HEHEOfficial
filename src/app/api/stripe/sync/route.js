import { NextResponse } from "next/server";
import connectDB from "@lib/mongodb";
import stripeService from "@lib/stripe";
import { authMiddleware } from "@lib/auth";
import Order from "@app/models/Order";
import Subscription from "@app/models/Subscription";
import Payment from "@app/models/Payment";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// POST /api/sync/stripe - Sync data from Stripe to database
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case "sync_all_subscriptions":
        return await handleSyncAllSubscriptions(data);
      
      case "sync_subscription":
        return await handleSyncSingleSubscription(data);
      
      case "sync_payments":
        return await handleSyncPayments(data);
      
      case "update_from_webhook":
        return await handleWebhookUpdate(data);
      
      case "retry_failed_payment":
        return await handleRetryFailedPayment(data);

      case "sync_customer_data":
        return await handleSyncCustomerData(data);

      case "sync_all_user_data":
        return await handleSyncAllUserData(request);

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Sync all user's payments and subscriptions
async function handleSyncAllUserData(request) {
  try {
    const decoded = await authMiddleware(request);
    const userId = decoded.id;
    
    const User = (await import("@app/models/User")).default;
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Get all user's orders
    const orders = await Order.find({ user_id: userId });
    
    if (orders.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No orders found for user",
        data: {
          synced_subscriptions: 0,
          synced_payments: 0,
          orders_processed: 0
        }
      });
    }
    
    let syncedSubscriptions = 0;
    let syncedPayments = 0;
    const results = [];
    
    for (const order of orders) {
      try {
        const subscription = await Subscription.findOne({ order_id: order._id });
        
        if (!subscription) {
          continue;
        }
        
        let subscriptionResult = null;
        let paymentResult = null;
        
        // Sync subscription status
        if (subscription.provider_schedule_id) {
          subscriptionResult = await stripeService.syncSubscriptionScheduleStatus(subscription.provider_schedule_id);
          syncedSubscriptions++;
        } else if (subscription.provider_subscription_id) {
          subscriptionResult = await stripeService.updateSubscriptionFromStripe(subscription.provider_subscription_id);
          syncedSubscriptions++;
        }
        
        // Sync payments for this order
        let paidInvoices = [];
        
        if (subscription.provider_schedule_id) {
          const stripeData = await stripeService.getSubscriptionScheduleDetails(subscription.provider_schedule_id);
          if (stripeData.invoices && stripeData.invoices.data) {
            paidInvoices = stripeData.invoices.data.filter(invoice => invoice.status === 'paid');
          }
        } else if (subscription.provider_subscription_id) {
          const stripeSubscription = await stripe.subscriptions.retrieve(subscription.provider_subscription_id);
          const invoices = await stripe.invoices.list({
            customer: stripeSubscription.customer,
            subscription: subscription.provider_subscription_id,
            limit: 100
          });
          paidInvoices = invoices.data.filter(invoice => invoice.status === 'paid');
        }
        
        // Sort paid invoices by creation date (oldest first)
        paidInvoices.sort((a, b) => a.created - b.created);
        
        // Get payment records for this order, excluding initial payments
        const paymentRecords = await Payment.find({ 
          order_id: order._id,
          is_initial: { $ne: true }
        }).sort({ installment_number: 1 });
        
        const updatedPayments = [];
        
        // Apply paid invoices to payment records by installment number
        for (let i = 0; i < Math.min(paidInvoices.length, paymentRecords.length); i++) {
          const invoice = paidInvoices[i];
          const paymentRecord = paymentRecords[i];
          
          const updatedPayment = await Payment.findByIdAndUpdate(
            paymentRecord._id,
            {
              status: 'succeeded',
              invoice_id: invoice.id,
              paid_at: new Date(invoice.status_transitions.paid_at * 1000)
            },
            { new: true }
          );
          
          if (updatedPayment) {
            updatedPayments.push(updatedPayment);
          }
        }
        
        if (updatedPayments.length > 0) {
          syncedPayments += updatedPayments.length;
        }
        
        paymentResult = {
          updated_payments: updatedPayments.length,
          payments: updatedPayments
        };
        
        results.push({
          order_id: order._id,
          subscription_sync: subscriptionResult,
          payment_sync: paymentResult
        });
        
      } catch (orderError) {
        results.push({
          order_id: order._id,
          error: orderError.message
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        user_id: userId,
        orders_processed: orders.length,
        synced_subscriptions: syncedSubscriptions,
        synced_payments: syncedPayments,
        results: results
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Sync all subscriptions from Stripe
async function handleSyncAllSubscriptions(data) {
  const { limit = 100 } = data;
  
  try {
    const result = await stripeService.syncAllSubscriptionsWithStripe(limit);
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Sync single subscription
async function handleSyncSingleSubscription(data) {
  const { subscription_id, schedule_id, order_id } = data;
  
  try {
    let result;
    
    if (schedule_id) {
      result = await stripeService.syncSubscriptionScheduleStatus(schedule_id);
    } else if (subscription_id) {
      result = await stripeService.updateSubscriptionFromStripe(subscription_id);
    } else if (order_id) {
      // Find subscription by order_id
      const subscription = await Subscription.findOne({ order_id });
      if (!subscription) {
        throw new Error("Subscription not found for order");
      }
      
      if (subscription.provider_schedule_id) {
        result = await stripeService.syncSubscriptionScheduleStatus(subscription.provider_schedule_id);
      } else if (subscription.provider_subscription_id) {
        result = await stripeService.updateSubscriptionFromStripe(subscription.provider_subscription_id);
      } else {
        throw new Error("No provider ID found for subscription");
      }
    } else {
      throw new Error("Either subscription_id, schedule_id, or order_id is required");
    }
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Sync payments for an order
async function handleSyncPayments(data) {
  const { order_id } = data;

  if (!order_id) {
    return NextResponse.json(
      { success: false, error: "Order ID is required" },
      { status: 400 }
    );
  }
  
  try {
    const order = await Order.findById(order_id);
    
    if (!order) {
      throw new Error("Order not found");
    }
    
    const subscription = await Subscription.findOne({ order_id });
   
    if (!subscription) {
      throw new Error("Subscription not found for order");
    }
    
    let paidInvoices = [];
    
    if (subscription.provider_schedule_id) {
      const stripeData = await stripeService.getSubscriptionScheduleDetails(subscription.provider_schedule_id);
      if (stripeData.invoices && stripeData.invoices.data) {
        paidInvoices = stripeData.invoices.data.filter(invoice => invoice.status === 'paid');
      }
    } else if (subscription.provider_subscription_id) {
      const stripeSubscription = await stripe.subscriptions.retrieve(subscription.provider_subscription_id);
      const invoices = await stripe.invoices.list({
        customer: stripeSubscription.customer,
        subscription: subscription.provider_subscription_id,
        limit: 100
      });
      paidInvoices = invoices.data.filter(invoice => invoice.status === 'paid');
    }
    
    // Sort paid invoices by creation date (oldest first)
    paidInvoices.sort((a, b) => a.created - b.created);
    
    // Get payment records for this order, excluding initial payments
    const paymentRecords = await Payment.find({ 
      order_id,
      is_initial: { $ne: true }
    }).sort({ installment_number: 1 });
    
    const updatedPayments = [];
    
    // Apply paid invoices to payment records by installment number
    for (let i = 0; i < Math.min(paidInvoices.length, paymentRecords.length); i++) {
      const invoice = paidInvoices[i];
      const paymentRecord = paymentRecords[i];
      
      
      const updatedPayment = await Payment.findByIdAndUpdate(
        paymentRecord._id,
        {
          status: 'succeeded',
          invoice_id: invoice.id,
          paid_at: new Date(invoice.status_transitions.paid_at * 1000)
        },
        { new: true }
      );


      
      if (updatedPayment) {
        updatedPayments.push(updatedPayment);
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        updated_payments: updatedPayments.length,
        payments: updatedPayments
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Handle webhook updates
async function handleWebhookUpdate(data) {
  const { event_type, event_data } = data;
  
  try {
    let result;
    
    switch (event_type) {
      case 'invoice.payment_succeeded':
        result = await handleInvoicePaymentSucceeded(event_data);
        break;
      
      case 'invoice.payment_failed':
        result = await handleInvoicePaymentFailed(event_data);
        break;
      
      case 'subscription.updated':
        result = await handleSubscriptionUpdated(event_data);
        break;
      
      case 'subscription_schedule.updated':
        result = await handleSubscriptionScheduleUpdated(event_data);
        break;
      
      default:
        return NextResponse.json({
          success: true,
          message: `Event type ${event_type} not handled`
        });
    }
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Handle invoice payment succeeded
async function handleInvoicePaymentSucceeded(invoice) {
  const subscriptionId = invoice.subscription;
  
  if (subscriptionId) {
    const subscription = await Subscription.findOne({
      provider_subscription_id: subscriptionId
    });
    
    if (subscription) {
      // Create or update payment record
      await Payment.findOneAndUpdate(
        {
          order_id: subscription.order_id,
          provider_transaction_id: invoice.payment_intent
        },
        {
          status: 'succeeded',
          paid_at: new Date(invoice.status_transitions.paid_at * 1000),
          amount: invoice.amount_paid / 100
        },
        { upsert: true, new: true }
      );
      
      // Update completed installments
      await stripeService.updateCompletedInstallments(null, subscriptionId);
    }
  }
  
  return { message: "Payment success processed" };
}

// Handle invoice payment failed
async function handleInvoicePaymentFailed(invoice) {
  const subscriptionId = invoice.subscription;
  
  if (subscriptionId) {
    const subscription = await Subscription.findOne({
      provider_subscription_id: subscriptionId
    });
    
    if (subscription) {
      // Update payment record
      await Payment.findOneAndUpdate(
        {
          order_id: subscription.order_id,
          provider_transaction_id: invoice.payment_intent
        },
        {
          status: 'failed',
          amount: invoice.amount_due / 100
        },
        { upsert: true, new: true }
      );
      
      // Update subscription status to past_due
      await Subscription.findByIdAndUpdate(subscription._id, {
        status: 'past_due'
      });
    }
  }
  
  return { message: "Payment failure processed" };
}

// Handle subscription updated
async function handleSubscriptionUpdated(stripeSubscription) {
  const subscription = await Subscription.findOne({
    provider_subscription_id: stripeSubscription.id
  });
  
  if (subscription) {
    let status = 'active';
    
    switch (stripeSubscription.status) {
      case 'canceled':
        status = 'cancelled';
        break;
      case 'past_due':
        status = 'past_due';
        break;
      case 'unpaid':
        status = 'past_due';
        break;
      default:
        status = 'active';
    }
    
    await Subscription.findByIdAndUpdate(subscription._id, {
      status,
      next_billing_date: stripeSubscription.current_period_end 
        ? new Date(stripeSubscription.current_period_end * 1000) 
        : null,
      updated_at: new Date()
    });
  }
  
  return { message: "Subscription updated" };
}

// Handle subscription schedule updated
async function handleSubscriptionScheduleUpdated(schedule) {
  return await stripeService.handleScheduleWebhook({
    type: 'subscription_schedule.updated',
    data: { object: schedule }
  });
}

// Retry failed payment
async function handleRetryFailedPayment(data) {
  const { order_id, payment_id } = data;
  
  if (!order_id && !payment_id) {
    return NextResponse.json(
      { success: false, error: "Either order_id or payment_id is required" },
      { status: 400 }
    );
  }
  
  try {
    let subscription;
    
    if (order_id) {
      subscription = await Subscription.findOne({ order_id });
    } else {
      const payment = await Payment.findById(payment_id);
      if (payment) {
        subscription = await Subscription.findOne({ order_id: payment.order_id });
      }
    }
    
    if (!subscription) {
      throw new Error("Subscription not found");
    }
    
    let result;
    if (subscription.provider_subscription_id) {
      result = await stripeService.retryFailedPayment(subscription.provider_subscription_id);
    } else {
      throw new Error("Cannot retry payment for subscription schedule");
    }
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Sync customer data
async function handleSyncCustomerData(data) {
  const { customer_id, user_id } = data;
  
  if (!customer_id && !user_id) {
    return NextResponse.json(
      { success: false, error: "Either customer_id or user_id is required" },
      { status: 400 }
    );
  }
  
  try {
    let customerId = customer_id;
    
    if (user_id && !customerId) {
      const User = (await import("@app/models/User")).default;
      const user = await User.findById(user_id);
      const stripePaymentMethod = user?.payment_methods?.find(
        pm => pm.provider === 'stripe' && pm.customer_id
      );
      customerId = stripePaymentMethod?.customer_id;
    }
    
    if (!customerId) {
      throw new Error("Customer ID not found");
    }
    
    const result = await stripeService.getCustomerSubscriptions(customerId);
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}