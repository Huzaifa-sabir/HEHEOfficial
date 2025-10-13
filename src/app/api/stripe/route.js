import connectDB from "@lib/mongodb";
import { NextResponse } from "next/server";
import stripeService from "@lib/stripe";

// POST /api/stripe - Handle Stripe actions
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case "initial_payment":
        return await handleInitialPayment(data);

      case "create_subscription":
        return await handleCreateSubscription(data);

      case "cancel_subscription":
        return await handleCancelSubscription(data);

      case "update_payment_method":
        return await handleUpdatePaymentMethod(data);

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

// GET /api/stripe - Handle Stripe queries
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "customer_subscriptions":
        return await handleGetCustomerSubscriptions(searchParams);

      case "subscription_details":
        return await handleGetSubscriptionDetails({
          schedule_id: searchParams.get("schedule_id"),
          subscription_id: searchParams.get("subscription_id")
        });

      case "payment_history":
        return await handleGetPaymentHistory({
          order_id: searchParams.get("order_id")
        });

      case "upcoming_invoice":
        return await handleGetUpcomingInvoice({
          subscription_id: searchParams.get("subscription_id")
        });

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

// Handle initial payment processing
async function handleInitialPayment(data) {
  const { user_id, payment_method_id, order_id } = data;

  if (!user_id || !payment_method_id || !order_id) {
    return NextResponse.json(
      {
        success: false,
        error: "User ID, payment method ID, and order ID are required",
      },
      { status: 400 }
    );
  }

  try {
    const result = await stripeService.handleInitialPayment(
      user_id,
      payment_method_id,
      order_id
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Handle subscription creation
async function handleCreateSubscription(data) {

  const { order_id } = data;

  if (!order_id) {
    return NextResponse.json(
      { success: false, error: "Order ID is required" },
      { status: 400 }
    );
  }

  try {
    const result = await stripeService.createInstallmentSubscriptionSchedule(
      order_id
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Handle subscription cancellation
async function handleCancelSubscription(data) {
  const { subscription_id, cancel_at_period_end = true } = data;

  if (!subscription_id) {
    return NextResponse.json(
      { success: false, error: "Subscription ID is required" },
      { status: 400 }
    );
  }

  try {
    const result = await stripeService.cancelSubscription(subscription_id, cancel_at_period_end);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


// Handle payment method update
async function handleUpdatePaymentMethod(data) {
  const { subscription_id, payment_method_id } = data;

  if (!subscription_id || !payment_method_id) {
    return NextResponse.json(
      { success: false, error: "Subscription ID and payment method ID are required" },
      { status: 400 }
    );
  }

  try {
    const result = await stripeService.updateSubscriptionPaymentMethod(
      subscription_id,
      payment_method_id
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


// Handle get subscription details
async function handleGetSubscriptionDetails(data) {
  const { schedule_id, subscription_id } = data;

  if (!schedule_id && !subscription_id) {
    return NextResponse.json(
      { success: false, error: "Schedule ID or Subscription ID is required" },
      { status: 400 }
    );
  }

  try {
    let result;
    if (schedule_id) {
      result = await stripeService.getSubscriptionScheduleDetails(schedule_id);
    } else {
      result = await stripeService.getUpcomingInvoice(subscription_id);
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Handle get payment history
async function handleGetPaymentHistory(data) {
  const { order_id } = data;

  if (!order_id) {
    return NextResponse.json(
      { success: false, error: "Order ID is required" },
      { status: 400 }
    );
  }

  try {
    const result = await stripeService.getInstallmentPaymentHistory(order_id);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Handle get upcoming invoice
async function handleGetUpcomingInvoice(data) {
  const { subscription_id } = data;

  if (!subscription_id) {
    return NextResponse.json(
      { success: false, error: "Subscription ID is required" },
      { status: 400 }
    );
  }

  try {
    const result = await stripeService.getUpcomingInvoice(subscription_id);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Handle get customer subscriptions
async function handleGetCustomerSubscriptions(searchParams) {
  const customer_id = searchParams.get("customer_id");

  if (!customer_id) {
    return NextResponse.json(
      { success: false, error: "Customer ID is required" },
      { status: 400 }
    );
  }

  try {
    const result = await stripeService.getCustomerSubscriptions(customer_id);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
