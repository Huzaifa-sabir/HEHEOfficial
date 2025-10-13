// app/api/stripe/attach-payment-method/route.js

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20', // Use the latest API version
});

export async function POST(request) {
  try {
    const { paymentMethodId, customerId } = await request.json();

    if (!paymentMethodId || !customerId) {
      return Response.json(
        { 
          success: false, 
          error: 'Payment method ID and customer ID are required' 
        },
        { status: 400 }
      );
    }

    // Attach the payment method to the customer
    const attachedPaymentMethod = await stripe.paymentMethods.attach(
      paymentMethodId,
      {
        customer: customerId,
      }
    );

    return Response.json({
      success: true,
      data: attachedPaymentMethod,
    });

  } catch (error) {
    console.error('Error attaching payment method:', error);
    return Response.json(
      {
        success: false,
        error: error.message || 'Failed to attach payment method',
      },
      { status: 500 }
    );
  }
}

// Optional: Handle other HTTP methods
export async function GET() {
  return Response.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}