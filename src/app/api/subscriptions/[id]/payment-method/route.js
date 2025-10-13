import { NextResponse } from "next/server";
import connectDB from "@lib/mongodb";
import Subscription from "@app/models/Subscription";
import Order from "@app/models/Order";
import User from "@app/models/User";
import { authMiddleware } from "@lib/auth";
import stripeService from "@lib/stripe";

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const decoded = await authMiddleware(request);
    const userId = decoded.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const orderId = id
    const { payment_method_token } = await request.json();
    console.log('payment_method_token::: ', payment_method_token);

    // Validate required fields
    if (!payment_method_token) {
      return NextResponse.json(
        { success: false, error: "Payment method token is required" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Verify payment method belongs to user
    const paymentMethod = user.payment_methods.find(
      (pm) => pm.token === payment_method_token
    );
    if (!paymentMethod) {
      return NextResponse.json(
        { success: false, error: "Payment method not found for user" },
        { status: 404 }
      );
    }

    // Verify order exists and belongs to user
    const order = await Order.findOne({
        _id: orderId,
        user_id: userId,
    });
    console.log('order::: ', order);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found or not authorized" },
        { status: 404 }
      );
    }

    // Verify subscription exists
    const subscription = await Subscription.findOne({
      order_id: orderId,
    });
    
    if (!subscription) {
      return NextResponse.json(
        { success: false, error: "Subscription not found for this order" },
        { status: 404 }
      );
    }

    // Update subscription payment method via Stripe
    const result = await stripeService.updateSubscriptionPaymentMethod(
      subscription.provider_subscription_id,
      payment_method_token
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Failed to update payment method" },
        { status: 500 }
      );
    }

    const updatedOrder = await Order.findByIdAndUpdate(orderId,{
        payment_method_token : payment_method_token
    })
    console.log('updatedOrder::: ', updatedOrder);



    return NextResponse.json({
      success: true,
      data: result.subscription,
      message: "Payment method updated successfully",
    });
  } catch (error) {
    if (
      error.message.includes("token") ||
      error.message.includes("authorization")
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
