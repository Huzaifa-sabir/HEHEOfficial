import { NextResponse } from "next/server";
import connectDB from "@lib/mongodb";
import User from "@app/models/User";
import Product from "@app/models/Product";
import InstallmentPlan from "@app/models/InstallmentPlan";
import Order from "@app/models/Order";
import Subscription from "@app/models/Subscription";


// GET /api/admin/orders - Get all orders with populated data including subscription
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const user_id = searchParams.get("user_id");
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;
    if (user_id) query.user_id = user_id;

    const orders = await Order.find(query)
      .populate("user_id", "fullName email")
      .populate("impression_kit_product_id", "name price")
      .populate("aligner_product_id", "name price discountPrice")
      .populate("installment_plan_id", "frequency num_installments description")
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 });

    // Get all order IDs to find related subscriptions
    const orderIds = orders.map((order) => order._id);

    // Find subscriptions that reference these orders
    const subscriptions = await Subscription.find({
      order_id: { $in: orderIds },
    });

    // Create a map of order_id to subscription for quick lookup
    const subscriptionMap = subscriptions.reduce((map, subscription) => {
      map[subscription.order_id.toString()] = subscription;
      return map;
    }, {});

    // Add subscription to each order
    const ordersWithSubscription = orders.map((order) => {
      const orderObj = order.toObject();
      orderObj.subscription = subscriptionMap[order._id.toString()] || null;
      return orderObj;
    });

    const total = await Order.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: ordersWithSubscription,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}