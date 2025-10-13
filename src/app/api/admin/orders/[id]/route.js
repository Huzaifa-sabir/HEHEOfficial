import { NextResponse } from 'next/server';
import connectDB from '@lib/mongodb';
import InstallmentPlan from '@app/models/InstallmentPlan';
import Product from '@app/models/Product';
import User from '@app/models/User';
import Order from '@app/models/Order';
import Subscription from '@app/models/Subscription';
import stripeService from "@lib/stripe";


// GET /api/admin/orders/[id] - Get order by ID with populated data
// export async function GET(request, { params }) {
//   try {
//     await connectDB();
//     const { id } = await params;
//     const order = await Order.findById(id)
//       .populate('user_id', 'fullName email')
//       .populate('impression_kit_product_id', 'name price')
//       .populate('aligner_product_id', 'name price discountPrice')
//       .populate('installment_plan_id', 'frequency num_installments description');
    
//     if (!order) {
//       return NextResponse.json(
//         { success: false, error: 'Order not found' },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       data: order
//     });
//   } catch (error) {
//     return NextResponse.json(
//       { success: false, error: error.message },
//       { status: 500 }
//     );
//   }
// }

// PUT /api/admin/orders/[id] - Update order (mainly status updates)
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { status, subscription_start_date, notes } = body;

    const updateData = {};
    if (status !== undefined) {
      const validStatuses = ['pending', 'kit_paid', 'full_paid', 'kit_received', 'aligner_ready', 'subscription_active', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status' },
          { status: 400 }
        );
      }
      
      updateData.status = status;
    }
    
    if (subscription_start_date !== undefined) {
      updateData.subscription_start_date = new Date(subscription_start_date);
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    updateData.updated_at = new Date();
    const { id } = await params;

    // Check if status is being changed to 'cancelled' and handle subscription cancellation
    if (status === 'cancelled') {
      const subscription = await Subscription.findOne({ order_id: id });
      
      if (subscription && subscription.status === 'active') {
        try {
          // Cancel the Stripe subscription
          await stripeService.cancelSubscription(subscription.provider_subscription_id, true);
          
          // Update subscription status in database
          await Subscription.findByIdAndUpdate(
            subscription._id,
            { status: 'cancelled', updated_at: new Date() }
          );
        } catch (stripeError) {
          console.error('Error cancelling Stripe subscription:', stripeError);
          return NextResponse.json(
            { success: false, error: 'Failed to cancel subscription in Stripe' },
            { status: 500 }
          );
        }
      }
    }

    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user_id', 'fullName email')
     .populate('impression_kit_product_id', 'name price')
     .populate('aligner_product_id', 'name price discountPrice')
     .populate('installment_plan_id', 'frequency num_installments description');

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}