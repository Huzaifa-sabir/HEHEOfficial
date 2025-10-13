import Subscription from '@app/models/Subscription';
import connectDB from '@lib/mongodb';
import { NextResponse } from 'next/server';


// GET /api/subscriptions - Get all subscriptions
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const order_id = searchParams.get('order_id');
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;
    if (order_id) query.order_id = order_id;

    const subscriptions = await Subscription.find(query)
      .populate({
        path: 'order_id',
        select: 'user_id status total_amount',
        populate: {
          path: 'user_id',
          select: 'name email'
        }
      })
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 });

    const total = await Subscription.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: subscriptions,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions - Create new subscription
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { 
      order_id, 
      provider_subscription_id, 
      total_installments,
      next_billing_date
    } = body;

    if (!order_id || !provider_subscription_id || !total_installments) {
      return NextResponse.json(
        { success: false, error: 'Order ID, provider subscription ID, and total installments are required' },
        { status: 400 }
      );
    }

    if (total_installments < 1) {
      return NextResponse.json(
        { success: false, error: 'Total installments must be at least 1' },
        { status: 400 }
      );
    }

    // Check if subscription already exists for this order
    const existingSubscription = await Subscription.findOne({ order_id });
    if (existingSubscription) {
      return NextResponse.json(
        { success: false, error: 'Subscription already exists for this order' },
        { status: 400 }
      );
    }

    const subscription = new Subscription({
      order_id,
      provider_subscription_id,
      total_installments,
      next_billing_date: next_billing_date ? new Date(next_billing_date) : undefined
    });

    await subscription.save();

    const populatedSubscription = await Subscription.findById(subscription._id)
      .populate({
        path: 'order_id',
        select: 'user_id status total_amount',
        populate: {
          path: 'user_id',
          select: 'name email'
        }
      });

    return NextResponse.json({
      success: true,
      data: populatedSubscription
    }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Subscription already exists for this order' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}