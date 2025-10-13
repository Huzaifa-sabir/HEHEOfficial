import { NextResponse } from "next/server";
import connectDB from "@lib/mongodb";
import User from "@app/models/User";
import Order from "@app/models/Order";

// DELETE - Delete payment method
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id, subId } = await params;

    if (!id || !subId) {
      return NextResponse.json(
        { success: false, error: "User ID and Method ID are required" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Find the payment method in user's payment_methods array
    const paymentMethodIndex = user.payment_methods.findIndex(
      (method) => method._id.toString() === subId
    );

    if (paymentMethodIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Payment method not found" },
        { status: 404 }
      );
    }

    const paymentMethod = user.payment_methods[paymentMethodIndex];

    const userOrders = await Order.find({ user_id: id });

    // Check if payment method token is in use by any non-completed order
    let isTokenInUse = false;

    for (const order of userOrders) {
      if (order.payment_method_token === paymentMethod.token) {
        // User CAN remove card if:
        if (order.initial_payment_amount === order.total_amount) {
          // Order is completed - allow removal
          continue;
        } else if (order.status === "completed") {
          // Order is fully paid - allow removal
          continue;
        } else if (order.status === "cancelled") {
          // Order is fully paid - allow removal
          continue;
        } else {
          // Order is not completed AND has remaining balance - block removal
          isTokenInUse = true;
          break;
        }
      }
    }

    if (isTokenInUse) {
      return NextResponse.json(
        { success: false, error: "Your Card is attach with under going order" },
        { status: 400 }
      );
    }

    // If deleting the default method and there are other methods, set another as default
    if (paymentMethod.is_default && user.payment_methods.length > 1) {
      // Find the most recently created method (excluding the one being deleted)
      const otherMethods = user.payment_methods.filter(
        (_, index) => index !== paymentMethodIndex
      );
      const nextDefaultMethod = otherMethods.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )[0];

      // Set the next method as default
      const nextDefaultIndex = user.payment_methods.findIndex(
        (method) => method._id.toString() === nextDefaultMethod._id.toString()
      );
      user.payment_methods[nextDefaultIndex].is_default = true;
    }

    // Remove the payment method from the array
    user.payment_methods.splice(paymentMethodIndex, 1);

    // Update the updatedAt timestamp
    user.updatedAt = new Date();

    // Save the user
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Payment method deleted successfully",
    });
  } catch (error) {
    console.error("Delete payment method error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id]/payment-methods - Update payment method
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id, subId } = await params;

    if (!id || !subId) {
      return NextResponse.json(
        { success: false, error: "Payment method ID is required" },
        { status: 400 }
      );
    }

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const paymentMethod = user.payment_methods.id(subId);

    if (!paymentMethod) {
      return NextResponse.json(
        { success: false, error: "Payment method not found" },
        { status: 404 }
      );
    }

    // If setting as default, remove default from others
    if (subId) {
      user.payment_methods.forEach((pm) => {
        pm.is_default = false;
      });
      paymentMethod.is_default = true;
    }

    paymentMethod.updated_at = new Date();
    await user.save();

    return NextResponse.json({
      success: true,
      data: paymentMethod,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
