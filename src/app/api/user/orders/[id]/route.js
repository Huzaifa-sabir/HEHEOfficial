import { NextResponse } from 'next/server';
import connectDB from '@lib/mongodb';
import { authMiddleware } from '@lib/auth';
import Order from '@app/models/Order';
import Payment from '@app/models/Payment';
import Subscription from '@app/models/Subscription';


// GET /api/user/orders/[id] - Get specific order by ID for authenticated user
export async function GET(request, { params }) {

  try {
    await connectDB();
    
    // Get user ID from headers
    const decoded = await authMiddleware(request);
    const userId = decoded.id
    const { id } = await params;
    
    // Find order that belongs to the authenticated user and populate related data
    const order = await Order.findOne({ _id: id, user_id: userId })
      .populate('user_id', 'name email')
      .populate('impression_kit_product_id', 'name price description')
      .populate('aligner_product_id', 'name price description discountPrice')
      .populate('installment_plan_id', 'frequency num_installments description');
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found or access denied' },
        { status: 404 }
      );
    }

    // Get all payments for this order
    const payments = await Payment.find({
      order_id: id,
      status: 'succeeded'
    }).sort({ paid_at: 1 });

    // Calculate payment details
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const remainingAmount = order.total_amount - totalPaid;
    const completedInstallments = payments.filter(p => !p.is_initial).length;
    const remainingInstallments = order.installment_plan_id.num_installments - completedInstallments;
    
    // Add payment information to the response
    const orderResponse = order.toObject();
    orderResponse.payment_details = {
      total_amount: order.total_amount,
      total_paid: totalPaid,
      remaining_amount: remainingAmount,
      initial_payment: order.initial_payment_amount,
      completed_installments: completedInstallments,
      remaining_installments: remainingInstallments,
      installment_frequency: order.installment_plan_id.frequency,
      total_installments: order.installment_plan_id.num_installments,
      payment_history: payments.map(p => ({
        amount: p.amount,
        paid_at: p.paid_at,
        installment_number: p.installment_number,
        is_initial: p.is_initial
      }))
    };

    return NextResponse.json({
      success: true,
      data: orderResponse
    });
  } catch (error) {
    if (error.message.includes('token') || error.message.includes('authorization')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


// DELETE /api/user/orders/[id] 
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    // Get user ID from headers
    const decoded = await authMiddleware(request);
    const userId = decoded.id;
    const { id } = await params;
    
    // Check if order exists and belongs to user
    const existingOrder = await Order.findOne({ _id: id, user_id: userId });
    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found or access denied' },
        { status: 404 }
      );
    }

    // Check if order can be cancelled
    const nonCancellableStatuses = ['completed', 'cancelled'];
    if (nonCancellableStatuses.includes(existingOrder.status)) {
      return NextResponse.json(
        { success: false, error: `Cannot cancel order with status: ${existingOrder.status}` },
        { status: 400 }
      );
    }

    // Check if subscription exists and cancel it
    const subscription = await Subscription.findOne({ order_id: id });
    
    if (subscription && subscription.status === 'active') {
      try {
        // For PayPal subscriptions, we'll handle cancellation differently
        // For now, just update the subscription status in database
        await Subscription.findByIdAndUpdate(
          subscription._id,
          { status: 'cancelled', updated_at: new Date() }
        );
      } catch (error) {
        console.error('Error cancelling subscription:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to cancel subscription' },
          { status: 500 }
        );
      }
    }
    
    const order = await Order.findOneAndUpdate(
      { _id: id, user_id: userId },
      { status: 'cancelled', updated_at: new Date() },
      { new: true }
    ).populate('user_id', 'name email')
     .populate('impression_kit_product_id', 'name price description')
     .populate('aligner_product_id', 'name price description discountPrice')
     .populate('installment_plan_id', 'frequency num_installments description');
    
    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    if (error.message.includes('token') || error.message.includes('authorization')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}