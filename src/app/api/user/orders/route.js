import { NextResponse } from "next/server";
import connectDB from "@lib/mongodb";
import { authMiddleware } from "@lib/auth";
import Order from "@app/models/Order";
import Payment from "@app/models/Payment";
import mongoose from "mongoose";
import User from "@app/models/User";
import InstallmentPlan from "@app/models/InstallmentPlan";
import Product from "@app/models/Product";

// GET /api/user/orders - Get all orders for authenticated user
export async function GET(request) {
  try {
    await connectDB();

    // Get user ID from headers
    const decoded = await authMiddleware(request);
    const userId = decoded.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 400 }
      );
    }

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    // Build query filter
    const filter = { user_id: userId };
    if (status) {
      filter.status = status;
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get orders with pagination and populate necessary fields
    const orders = await Order.find(filter)
      .populate("installment_plan_id", "frequency num_installments description")
      .populate("user_id", "fullName email")
      .populate("impression_kit_product_id", "name price description")
      .populate("aligner_product_id", "name price description discountPrice")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    // Get all payments for these orders
    const orderIds = orders.map((order) => order._id);
    const allPayments = await Payment.find({
      order_id: { $in: orderIds },
      status: "succeeded",
    });

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / limit);

    // Calculate order statistics
    const stats = await Order.aggregate([
      { $match: { user_id: new mongoose.Types.ObjectId(userId) } }, // <-- Use 'new mongoose.Types.ObjectId'
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$total_amount" },
        },
      },
    ]);

    // Process orders with payment information
    const ordersWithPayments = orders.map((order) => {
      const orderPayments = allPayments.filter(
        (p) => p.order_id.toString() === order._id.toString()
      );
      const totalPaid = orderPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );
      const completedInstallments = orderPayments.filter(
        (p) => !p.is_initial
      ).length;
      const remainingInstallments =
        order.installment_plan_id.num_installments - completedInstallments;

      const orderObj = order.toObject();
      orderObj.payment_details = {
        total_amount: order.total_amount,
        total_paid: totalPaid,
        remaining_amount: order.total_amount - totalPaid,
        initial_payment: order.initial_payment_amount,
        completed_installments: completedInstallments,
        remaining_installments: remainingInstallments,
        installment_frequency: order.installment_plan_id.frequency,
        total_installments: order.installment_plan_id.num_installments,
      };
      return orderObj;
    });

    return NextResponse.json({
      success: true,
      data: {
        orders: ordersWithPayments,
        pagination: {
          currentPage: page,
          totalPages,
          totalOrders,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        statistics: stats.reduce((acc, stat) => {
          acc[stat._id] = {
            count: stat.count,
            totalAmount: stat.totalAmount,
          };
          return acc;
        }, {}),
      },
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

export async function POST(request) {
  try {
    await connectDB();
    const decoded = await authMiddleware(request);
    const userId = decoded.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      user_id,
      impression_kit_product_id,
      aligner_product_id,
      installment_plan_id,
      payment_method_token,
    } = body;

    // Validate required fields
    if (
      !user_id ||
      !impression_kit_product_id ||
      !aligner_product_id ||
      !installment_plan_id ||
      !payment_method_token
    ) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // Verify user exists and has the payment method
    const user = await User.findById(user_id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const paymentMethod = user.payment_methods.find(
      (pm) => pm.token === payment_method_token
    );

    if (!paymentMethod) {
      return NextResponse.json(
        { success: false, error: "Payment method not found for user" },
        { status: 404 }
      );
    }

    // Verify products exist
    const impressionKit = await Product.findById(impression_kit_product_id);
    const aligner = await Product.findById(aligner_product_id);
    const plan = await InstallmentPlan.findById(installment_plan_id);

    if (!impressionKit || !aligner || !plan) {
      return NextResponse.json(
        { success: false, error: "Product or installment plan not found" },
        { status: 404 }
      );
    }

    // Calculate total amount
    const total_amount = impressionKit.price + aligner.price;

    const order = new Order({
      user_id,
      impression_kit_product_id,
      aligner_product_id,
      installment_plan_id,
      payment_method_token,
      address: paymentMethod.address,
      provider: paymentMethod.provider,
      total_amount:
        plan.frequency === "instant"
          ? impressionKit.price +
            (aligner.price - (aligner.price * aligner.discountPrice) / 100)
          : total_amount,
      initial_payment_amount:
        plan.frequency === "instant"
          ? impressionKit.price +
            (aligner.price - (aligner.price * aligner.discountPrice) / 100)
          : impressionKit.price,
    });

    await order.save();

    // Populate the created order for response
    const populatedOrder = await Order.findById(order._id)
      .populate("user_id", "fullName email")
      .populate("impression_kit_product_id", "name price")
      .populate("aligner_product_id", "name price discountPrice")
      .populate(
        "installment_plan_id",
        "frequency num_installments description"
      );

    return NextResponse.json(
      {
        success: true,
        data: populatedOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
