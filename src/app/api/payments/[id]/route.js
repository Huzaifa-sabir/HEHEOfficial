import Payment from '@app/models/Payment';
import connectDB from '@lib/mongodb';
import { NextResponse } from 'next/server';


// GET /api/payments/[id] - Get payment by ID
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const payment = await Payment.findById(params.id)
      .populate('order_id', 'user_id status total_amount');
    
    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: payment
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/payments/[id] - Update payment
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { 
      amount,
      provider_transaction_id,
      status,
      installment_number,
      due_date,
      paid_at
    } = body;

    const updateData = {};
    if (amount !== undefined) {
      if (amount < 0) {
        return NextResponse.json(
          { success: false, error: 'Amount cannot be negative' },
          { status: 400 }
        );
      }
      updateData.amount = amount;
    }
    
    if (provider_transaction_id !== undefined) updateData.provider_transaction_id = provider_transaction_id;
    
    if (status !== undefined) {
      const validStatuses = ['pending', 'succeeded', 'failed', 'refunded'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status' },
          { status: 400 }
        );
      }
      updateData.status = status;
      
      // Set paid_at when status becomes succeeded
      if (status === 'succeeded' && !paid_at) {
        updateData.paid_at = new Date();
      }
    }
    
    if (installment_number !== undefined) updateData.installment_number = installment_number;
    if (due_date !== undefined) updateData.due_date = new Date(due_date);
    if (paid_at !== undefined) updateData.paid_at = new Date(paid_at);

    const payment = await Payment.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('order_id', 'user_id status total_amount');

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: payment
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/payments/[id] - Delete payment
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const payment = await Payment.findByIdAndDelete(params.id);
    
    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}