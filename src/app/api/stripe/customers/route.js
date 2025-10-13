import User from '@app/models/User';
import connectDB from '@lib/mongodb';
import { NextResponse } from 'next/server';


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// POST /api/stripe/customers - Create or get Stripe customer
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { user_id, email, name } = body;

    if (!user_id || !email || !name) {
      return NextResponse.json(
        { success: false, error: 'User ID, email, and name are required' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await User.findById(user_id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has a Stripe customer
    const existingStripePayment = user.payment_methods.find(
      pm => pm.provider === 'stripe' && pm.customer_id
    );

    if (existingStripePayment) {
      return NextResponse.json({
        success: true,
        data: {
          customer_id: existingStripePayment.customer_id,
          existing: true
        }
      });
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email: email,
      name: name,
      metadata: {
        user_id: user_id
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        customer_id: customer.id,
        existing: false
      }
    });

  } catch (error) {
    console.error('Stripe customer creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}