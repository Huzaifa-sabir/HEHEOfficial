import Order from "@app/models/Order";
import Payment from "@app/models/Payment";
import Subscription from "@app/models/Subscription";
import User from "@app/models/User";

// ============================================================
// PayPal Configuration & Security Validation
// ============================================================

// Validate environment variables on module load
if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_SECRET) {
  throw new Error(
    '❌ PayPal credentials not configured! ' +
    'Please set PAYPAL_CLIENT_ID and PAYPAL_SECRET in your .env.local file. ' +
    'Run: node setup-paypal-live.js for guided setup.'
  );
}

// Security check: Ensure secret is not exposed to frontend
if (typeof window !== 'undefined') {
  throw new Error(
    '🚨 CRITICAL SECURITY ERROR: PayPal service should never run in the browser! ' +
    'This module contains secrets and must only be used server-side.'
  );
}

// Determine API endpoint based on mode
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';
const PAYPAL_API = PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// Log configuration on startup (safe - only shows mode and masked credentials)
console.log('\n' + '='.repeat(60));
console.log('🔐 PayPal Service Initialized');
console.log('='.repeat(60));
console.log(`Mode: ${PAYPAL_MODE.toUpperCase()}`);
console.log(`API: ${PAYPAL_API}`);
console.log(`Client ID: ${process.env.PAYPAL_CLIENT_ID.substring(0, 15)}...`);
console.log(`Secret: ${process.env.PAYPAL_SECRET.substring(0, 10)}... (SECURED)`);
if (PAYPAL_MODE === 'live') {
  console.log('⚠️  WARNING: LIVE MODE - Real money transactions enabled!');
}
console.log('='.repeat(60) + '\n');

// Retry helper function with exponential backoff
const fetchWithRetry = async (url, options, maxRetries = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries} for ${url}`);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeout);
      return response;
    } catch (error) {
      lastError = error;
      console.error(`❌ Attempt ${attempt} failed:`, error.message);

      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

const getAccessToken = async () => {
  try {
    // Debug: Log credentials (first 10 chars only for security)
    console.log('🔐 PayPal Backend Auth:');
    console.log('  Client ID:', process.env.PAYPAL_CLIENT_ID ? process.env.PAYPAL_CLIENT_ID.substring(0, 10) + '...' : 'MISSING');
    console.log('  Secret:', process.env.PAYPAL_SECRET ? process.env.PAYPAL_SECRET.substring(0, 10) + '...' : 'MISSING');
    console.log('  API URL:', PAYPAL_API);

    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64');

    const res = await fetchWithRetry(`${PAYPAL_API}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials',
    });

    if (!res.ok) {
      const error = await res.text();
      console.error('❌ PayPal Auth Failed:', error);
      throw new Error(`PayPal auth failed: ${error}`);
    }

    const data = await res.json();
    console.log('✅ PayPal Auth Success');
    return data.access_token;
  } catch (error) {
    console.error('❌ PayPal getAccessToken error:', error);
    throw error;
  }
};

class PayPalService {
  async handleInitialPayment(userId, orderId, amount = null, savedPaymentMethod = null) {
    const token = await getAccessToken();
    const order = await Order.findById(orderId).populate("installment_plan_id");
    
    // Use provided amount or fall back to order amount
    const paymentAmount = amount || order.initial_payment_amount;
    
    console.log('💰 Creating PayPal order:', {
      userId,
      orderId,
      amount: paymentAmount,
      savedPaymentMethod: savedPaymentMethod ? 'yes' : 'no'
    });
    
    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'AUTHORIZE',
        purchase_units: [{ 
          amount: { currency_code: 'USD', value: paymentAmount.toFixed(2) },
          description: `HeHe Aligners Order ${orderId}`
        }],
      }),
    });
    
    if (!res.ok) {
      const error = await res.json();
      console.error('❌ PayPal order creation failed:', error);
      throw new Error(error.message || 'Failed to create PayPal order');
    }
    
    const paypalOrder = await res.json();
    console.log('✅ PayPal order created:', paypalOrder.id);
    
    return { 
      success: true, 
      order_id: paypalOrder.id, 
      approval_url: paypalOrder.links.find(l => l.rel === 'approve')?.href 
    };
  }

  async capturePayment(paypalOrderId, orderId) {
    try {
      const token = await getAccessToken();
      
      console.log('🎯 Processing PayPal payment:', {
        paypalOrderId,
        orderId
      });
      
      // First, authorize the approved order
      const authorizeRes = await fetchWithRetry(`${PAYPAL_API}/v2/checkout/orders/${paypalOrderId}/authorize`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      
      if (!authorizeRes.ok) {
        const error = await authorizeRes.json();
        console.error('❌ PayPal authorization failed:', error);
        throw new Error(error.message || 'Payment authorization failed');
      }
      
      const authorizationResult = await authorizeRes.json();
      console.log('🔐 PayPal authorization result:', authorizationResult);
      
      // Find the authorization from the result
      const authorization = authorizationResult.purchase_units?.[0]?.payments?.authorizations?.[0];
      
      if (!authorization || !authorization.id) {
        throw new Error('No authorization ID found after authorization');
      }
      
      console.log('✅ Found authorization ID:', authorization.id);
      console.log('💵 Authorization amount:', authorization.amount);
      
      // Now capture the authorization
      const captureRes = await fetchWithRetry(`${PAYPAL_API}/v2/payments/authorizations/${authorization.id}/capture`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: {
            currency_code: authorization.amount.currency_code,
            value: authorization.amount.value
          },
          is_final_capture: true
        }),
      });
      
      if (!captureRes.ok) {
        const error = await captureRes.json();
        console.error('❌ PayPal authorization capture failed:', error);
        throw new Error(error.message || 'Payment capture failed');
      }
      
      const capture = await captureRes.json();
      console.log('✅ PayPal authorization captured:', capture);
      
      const order = await Order.findById(orderId).populate("installment_plan_id");
      
      // PayPal capture response uses 'status' not 'state'
      if (capture.status === 'COMPLETED') {
        console.log('💰 Payment completed, creating payment record...');
        
        // Get the actual capture amount from the response
        const captureAmount = capture.amount?.value || authorization.amount.value;
        const finalAmount = captureAmount ? parseFloat(captureAmount) : order.initial_payment_amount;
        
        // Create payment record
        const payment = await new Payment({
          order_id: orderId,
          amount: finalAmount,
          payment_method_token: paypalOrderId,
          provider_transaction_id: capture.id,
          status: 'succeeded',
          is_initial: true,
          paid_at: new Date(),
        }).save();
        
        // Update order status
        await Order.findByIdAndUpdate(orderId, {
          status: order.installment_plan_id.frequency === 'instant' ? 'full_paid' : 'kit_paid',
        });
        
        console.log('✅ Payment record created:', payment._id);
        
        return { 
          success: true, 
          capture,
          payment: {
            _id: payment._id,
            amount: finalAmount,
            status: 'succeeded',
            provider: 'paypal',
            provider_transaction_id: payment.provider_transaction_id,
            created_at: payment.created_at,
            paid_at: payment.paid_at
          }
        };
      }
      
      console.error('❌ Payment not completed, status:', capture.status);
      throw new Error(`Payment not completed. Status: ${capture.status}`);
    } catch (error) {
      console.error('❌ capturePayment error:', error);
      throw error;
    }
  }

  async createSubscription(orderId) {
    const token = await getAccessToken();
    const order = await Order.findById(orderId).populate(['installment_plan_id', 'aligner_product_id']);
    const installmentAmount = order.aligner_product_id.price / order.installment_plan_id.num_installments;
    
    const planRes = await fetch(`${PAYPAL_API}/v1/billing/plans`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: process.env.PAYPAL_PRODUCT_ID,
        name: `Aligner ${order.installment_plan_id.frequency} Plan`,
        billing_cycles: [{
          frequency: { interval_unit: order.installment_plan_id.frequency === 'weekly' ? 'WEEK' : 'MONTH', interval_count: 1 },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: order.installment_plan_id.num_installments,
          pricing_scheme: { fixed_price: { value: installmentAmount.toFixed(2), currency_code: 'USD' } },
        }],
      }),
    });
    
    const plan = await planRes.json();
    const subRes = await fetch(`${PAYPAL_API}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan_id: plan.id }),
    });
    
    const sub = await subRes.json();
    await new Subscription({
      order_id: orderId,
      provider_subscription_id: sub.id,
      total_installments: order.installment_plan_id.num_installments,
      installment_amount: installmentAmount,
      status: 'active',
    }).save();
    
    return { success: true, approval_url: sub.links.find(l => l.rel === 'approve').href };
  }

  async cancelSubscription(subscriptionId) {
    const token = await getAccessToken();
    await fetch(`${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Customer requested' }),
    });

    await Subscription.findOneAndUpdate({ provider_subscription_id: subscriptionId }, { status: 'cancelled' });
    return { success: true };
  }

  // SIMPLIFIED: Create an authorization order (not vault) to save PayPal account
  async createAuthorization(userId, amount = 0.01) {
    try {
      const token = await getAccessToken();

      console.log(`💰 Creating $${amount} authorization order for user:`, userId);

      const res = await fetchWithRetry(`${PAYPAL_API}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: 'AUTHORIZE',
          purchase_units: [{
            amount: {
              currency_code: 'USD',
              value: amount.toFixed(2)
            },
            description: 'Verify PayPal Account for HeHe Aligners'
          }]
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error('❌ Authorization failed:', error);
        throw new Error(error.message || 'Failed to create authorization');
      }

      const data = await res.json();
      console.log('✅ Authorization order created:', data.id);
      return { success: true, order_id: data.id };
    } catch (error) {
      console.error('❌ createAuthorization error:', error);
      throw error;
    }
  }

  // Get PayPal order details (for getting payer info after approval)
  async getOrderDetails(orderId) {
    try {
      const token = await getAccessToken();

      console.log(`📋 Fetching order details for:`, orderId);

      const res = await fetchWithRetry(`${PAYPAL_API}/v2/checkout/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const error = await res.json();
        console.error('❌ Failed to get order details:', error);
        throw new Error(error.message || 'Failed to get order details');
      }

      const data = await res.json();
      console.log('✅ Order details retrieved for:', data.payer?.email_address || 'unknown');
      return { success: true, data };
    } catch (error) {
      console.error('❌ getOrderDetails error:', error);
      throw error;
    }
  }

  // Create vault setup token for saving payment method
  async createVaultSetup(userId) {
    try {
      const token = await getAccessToken();

      console.log('🔐 Creating vault setup token for user:', userId);

      const res = await fetchWithRetry(`${PAYPAL_API}/v3/vault/setup-tokens`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_source: {
            paypal: {
              description: 'HeHe Aligners Payment Method',
              usage_type: 'MERCHANT',
              customer_type: 'CONSUMER',
              permit_multiple_payment_tokens: false,
            }
          }
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error('❌ Vault setup failed:', error);
        throw new Error(error.message || 'Failed to create vault setup');
      }

      const data = await res.json();
      console.log('✅ Vault setup created:', data.id);
      return { success: true, setup_token: data.id };
    } catch (error) {
      console.error('❌ createVaultSetup error:', error);
      throw error;
    }
  }

  // Create payment token from vault setup
  async createPaymentToken(setupToken) {
    try {
      const token = await getAccessToken();

      console.log('🔐 Creating payment token from setup token:', setupToken);

      const res = await fetchWithRetry(`${PAYPAL_API}/v3/vault/payment-tokens`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_source: {
            token: {
              id: setupToken,
              type: 'SETUP_TOKEN'
            }
          }
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error('❌ Payment token creation failed:', error);
        throw new Error(error.message || 'Failed to create payment token');
      }

      const data = await res.json();
      console.log('✅ Payment token created:', data.id);
      return { success: true, payment_token: data };
    } catch (error) {
      console.error('❌ createPaymentToken error:', error);
      throw error;
    }
  }

  // Charge a saved payment method using vault payment token
  async chargeSavedMethod(paymentToken, amount, orderId) {
    try {
      const token = await getAccessToken();
      const order = await Order.findById(orderId).populate("installment_plan_id");

      console.log('💰 Charging saved payment method:', {
        paymentToken: paymentToken.substring(0, 10) + '...',
        amount,
        orderId
      });

      // Use the correct API endpoint for charging vault payment tokens
      // We need to create an order first, then capture it
      const res = await fetchWithRetry(`${PAYPAL_API}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: 'USD',
              value: amount.toFixed(2)
            },
            reference_id: orderId,
            description: `HeHe Aligners Order ${orderId}`,
          }],
          payment_source: {
            token: {
              id: paymentToken,
              type: 'PAYMENT_METHOD_TOKEN'
            }
          }
        }),
      });

      if (!res.ok) {
        let errorMessage = 'Failed to charge saved method';
        try {
          const error = await res.json();
          console.error('❌ Charge saved method failed:', error);
          errorMessage = error.message || errorMessage;
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
          errorMessage = `HTTP ${res.status}: ${res.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const paypalOrder = await res.json();
      console.log('✅ PayPal order created:', paypalOrder.id);

      // Auto-capture the order
      const captureRes = await fetchWithRetry(`${PAYPAL_API}/v2/checkout/orders/${paypalOrder.id}/capture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!captureRes.ok) {
        let errorMessage = 'Failed to capture payment';
        try {
          const error = await captureRes.json();
          console.error('❌ Payment capture failed:', error);
          errorMessage = error.message || errorMessage;
        } catch (parseError) {
          console.error('❌ Failed to parse capture error response:', parseError);
          errorMessage = `HTTP ${captureRes.status}: ${captureRes.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const capture = await captureRes.json();
      console.log('✅ Payment captured successfully:', capture.id);

      if (capture.status === 'COMPLETED') {
        // Create payment record
        const payment = await new Payment({
          order_id: orderId,
          amount: amount,
          payment_method_token: paymentToken,
          provider_transaction_id: capture.id,
          status: 'succeeded',
          is_initial: true,
          paid_at: new Date(),
        }).save();

        // Update order status
        await Order.findByIdAndUpdate(orderId, {
          status: order.installment_plan_id.frequency === 'instant' ? 'full_paid' : 'kit_paid',
        });

        return { success: true, capture, payment };
      }

      throw new Error('Payment not completed');
    } catch (error) {
      console.error('chargeSavedMethod error:', error);
      throw error;
    }
  }
}

const paypalService = new PayPalService();
export default paypalService;