import connectDB from "@lib/mongodb";
import { NextResponse } from "next/server";
import paypalService from "@lib/paypal";

export async function POST(request) {
  try {
    // Debug: Check environment variables
    console.log('\n' + '='.repeat(60));
    console.log('🔍 PayPal API Route - Environment Check');
    console.log('='.repeat(60));
    console.log('PAYPAL_CLIENT_ID:', process.env.PAYPAL_CLIENT_ID ? process.env.PAYPAL_CLIENT_ID.substring(0, 20) + '...' : '❌ MISSING');
    console.log('PAYPAL_SECRET:', process.env.PAYPAL_SECRET ? process.env.PAYPAL_SECRET.substring(0, 20) + '...' : '❌ MISSING');
    console.log('PAYPAL_MODE:', process.env.PAYPAL_MODE || '❌ MISSING');
    console.log('='.repeat(60) + '\n');

    await connectDB();
    const { action, ...data } = await request.json();

    console.log(`PayPal API - Action: ${action}`, data);

    switch (action) {
      case "initial_payment":
        const initialResult = await paypalService.handleInitialPayment(
          data.user_id, 
          data.order_id, 
          data.amount, 
          data.saved_payment_method
        );
        return NextResponse.json(initialResult);

      case "capture_payment":
        const captureResult = await paypalService.capturePayment(
          data.paypal_order_id,
          data.order_id
        );
        return NextResponse.json(captureResult);

      case "create_subscription":
        const subscriptionResult = await paypalService.createSubscription(data.order_id);
        return NextResponse.json(subscriptionResult);

      case "cancel_subscription":
        const cancelResult = await paypalService.cancelSubscription(data.subscription_id);
        return NextResponse.json(cancelResult);

      case "create_authorization":
        const authResult = await paypalService.createAuthorization(data.user_id, data.amount);
        return NextResponse.json(authResult);

      case "get_order_details":
        const orderDetailsResult = await paypalService.getOrderDetails(data.order_id);
        return NextResponse.json(orderDetailsResult);

      case "create_vault_setup":
        const vaultSetupResult = await paypalService.createVaultSetup(data.user_id);
        return NextResponse.json(vaultSetupResult);

      case "create_payment_token":
        const tokenResult = await paypalService.createPaymentToken(data.setup_token);
        return NextResponse.json(tokenResult);

      case "charge_saved_method":
        const chargeResult = await paypalService.chargeSavedMethod(
          data.payment_method_token,
          data.amount,
          data.order_id
        );
        return NextResponse.json(chargeResult);

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("❌ PayPal API Error:", error);

    // Provide user-friendly error messages
    let errorMessage = error.message;
    let statusCode = 500;

    if (error.message.includes('EAI_AGAIN') || error.message.includes('ENOTFOUND')) {
      errorMessage = 'Unable to connect to PayPal. Please check your internet connection and try again.';
      statusCode = 503; // Service Unavailable
    } else if (error.message.includes('ETIMEDOUT') || error.message.includes('aborted')) {
      errorMessage = 'PayPal request timed out. Please try again.';
      statusCode = 504; // Gateway Timeout
    } else if (error.message.includes('auth failed')) {
      errorMessage = 'PayPal authentication failed. Please check your credentials.';
      statusCode = 401; // Unauthorized
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: statusCode }
    );
  }
}
