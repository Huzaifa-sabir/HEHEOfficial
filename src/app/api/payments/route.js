import Payment from '@app/models/Payment';
import connectDB from '@lib/mongodb';
import { NextResponse } from 'next/server';


// GET /api/payments - Get all payments
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const order_id = searchParams.get('order_id');
    const status = searchParams.get('status');
    const is_initial = searchParams.get('is_initial');
    const skip = (page - 1) * limit;

    let query = {};
    if (order_id) query.order_id = order_id;
    if (status) query.status = status;
    if (is_initial !== null && is_initial !== undefined) {
      query.is_initial = is_initial === 'true';
    }

    const payments = await Payment.find(query)
      .populate('order_id', 'user_id status total_amount')
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 });

    const total = await Payment.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: payments,
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

// POST /api/payments - Create new payment
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { 
      order_id, 
      amount, 
      payment_method_token, 
      provider_transaction_id,
      status,
      is_initial,
      installment_number,
      due_date
    } = body;

    if (!order_id || !amount || !payment_method_token) {
      return NextResponse.json(
        { success: false, error: 'Order ID, amount, and payment method token are required' },
        { status: 400 }
      );
    }

    if (amount < 0) {
      return NextResponse.json(
        { success: false, error: 'Amount cannot be negative' },
        { status: 400 }
      );
    }

    const paymentData = {
      order_id,
      amount,
      payment_method_token,
      provider_transaction_id,
      status: status || 'pending',
      is_initial: is_initial || false,
      installment_number,
      due_date: due_date ? new Date(due_date) : undefined
    };

    const payment = new Payment(paymentData);
    await payment.save();

    const populatedPayment = await Payment.findById(payment._id)
      .populate('order_id', 'user_id status total_amount');

    return NextResponse.json({
      success: true,
      data: populatedPayment
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}