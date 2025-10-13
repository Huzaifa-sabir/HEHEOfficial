import { NextResponse } from 'next/server';
import connectDB from '@lib/mongodb';
import User from '@app/models/User';

// GET /api/users/[id]/payment-methods - Get user's payment methods
export async function GET(request, { params }) {
  try {
    await connectDB();
    const {id} = await params
    const user = await User.findById(id).select('payment_methods');
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user.payment_methods
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/users/[id]/payment-methods - Add payment method
export async function POST(request, { params }) {
  try {
    await connectDB();
    
    const body = await request.json();
    console.log('🔍 Payment Methods API - Request body:', body);
    const { provider, token, customer_id, last_four, is_default, address, vault_id } = body;

    if (!provider || !token) {
      return NextResponse.json(
        { success: false, error: 'Provider and token are required' },
        { status: 400 }
      );
    }
    const {id} = await params
    const user = await User.findById(id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // If this is set as default, remove default from others
    if (is_default) {
      user.payment_methods.forEach(pm => {
        pm.is_default = false;
      });
    }

    const newPaymentMethod = {
      provider,
      token,
      customer_id,
      last_four,
      is_default: is_default || false,
      address,
      vault_id
    };

    user.payment_methods.push(newPaymentMethod);
    const savedPayment = await user.save();
    

    return NextResponse.json({
      success: true,
      data: user.payment_methods[user.payment_methods.length - 1]
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id]/payment-methods - Update payment method
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { payment_method_id, is_default } = body;

    if (!payment_method_id) {
      return NextResponse.json(
        { success: false, error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    const user = await User.findById(params.id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const paymentMethod = user.payment_methods.id(payment_method_id);
    
    if (!paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'Payment method not found' },
        { status: 404 }
      );
    }

    // If setting as default, remove default from others
    if (is_default) {
      user.payment_methods.forEach(pm => {
        pm.is_default = false;
      });
      paymentMethod.is_default = true;
    }

    paymentMethod.updated_at = new Date();
    await user.save();

    return NextResponse.json({
      success: true,
      data: paymentMethod
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id]/payment-methods/[payment_method_id] - Delete payment method
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const payment_method_id = searchParams.get('payment_method_id');

    if (!payment_method_id) {
      return NextResponse.json(
        { success: false, error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    const user = await User.findById(params.id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const paymentMethod = user.payment_methods.id(payment_method_id);
    
    if (!paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'Payment method not found' },
        { status: 404 }
      );
    }

    user.payment_methods.pull({ _id: payment_method_id });
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Payment method deleted successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}