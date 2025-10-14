import { NextResponse } from 'next/server';
import connectDB from '@lib/mongodb';
import Subscription from '@app/models/Subscription';
import Order from '@app/models/Order';
import User from '@app/models/User';
import { authMiddleware } from '@lib/auth';
// import { updateSubscriptionPaymentMethod } from "@lib/stripe"; // Stripe disabled - using PayPal only 


// GET /api/subscriptions/[id] - Get subscription by ID
export async function GET(request, { params }) {
  try {
    await connectDB();
    const {id} = await params
    const decoded = await authMiddleware(request)
    const userId = decoded.id

    const subscription = await Subscription.find({order_id:id})
    .populate({
      path: 'order_id',
      select: 'user_id status total_amount',
      populate: {
        path: 'user_id',
        select: 'fullName email'
      }
    });
    
    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    if(userId !== (subscription[0].order_id.user_id._id).toString()){
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: subscription[0]
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/subscriptions/[id] - Update subscription
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { 
      status,
      completed_installments,
      next_billing_date
    } = body;

    const updateData = { updated_at: new Date() };
    
    if (status !== undefined) {
      const validStatuses = ['pending', 'active', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status' },
          { status: 400 }
        );
      }
      updateData.status = status;
    }
    
    if (completed_installments !== undefined) {
      if (completed_installments < 0) {
        return NextResponse.json(
          { success: false, error: 'Completed installments cannot be negative' },
          { status: 400 }
        );
      }
      updateData.completed_installments = completed_installments;
    }
    
    if (next_billing_date !== undefined) {
      updateData.next_billing_date = new Date(next_billing_date);
    }

    const subscription = await Subscription.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate({
      path: 'order_id',
      select: 'user_id status total_amount',
      populate: {
        path: 'user_id',
        select: 'name email'
      }
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/subscriptions/[id] - Cancel subscription
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const subscription = await Subscription.findByIdAndUpdate(
      params.id,
      { status: 'cancelled', updated_at: new Date() },
      { new: true }
    );
    
    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: subscription
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

