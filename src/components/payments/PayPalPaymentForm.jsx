"use client";

import React, { useState, useRef } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { CreditCard, Lock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function PayPalPaymentForm({
  onSuccess,
  onError,
  amount,
  orderId,
  userId,
  processing,
  setProcessing,
  selectedPaymentMethod = null
}) {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [autoProcessing, setAutoProcessing] = useState(false);
  const [{ isPending }] = usePayPalScriptReducer();
  const paymentProcessedRef = useRef(false);

  const createOrder = async () => {
    try {
      setError(null);
      const response = await fetch('/api/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initial_payment',
          user_id: userId,
          order_id: orderId,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to create PayPal order');
      }
      return result.order_id;
    } catch (err) {
      setError(err.message);
      onError && onError(err.message);
      throw err;
    }
  };

  const onApprove = async (data) => {
    try {
      setProcessing(true);
      console.log('🎉 PayPal approval received, capturing payment:', data);
      
      const response = await fetch('/api/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'capture_payment',
          paypal_order_id: data.orderID,
          order_id: orderId,
        }),
      });

      console.log('📡 PayPal capture response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Payment capture failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('📦 PayPal capture result:', result);
      
      if (result.success) {
        console.log('✅ Real PayPal payment captured successfully!');
        setSuccess(true);
        setTimeout(() => {
          onSuccess(result);
        }, 1500);
      } else {
        throw new Error(result.error || 'Payment capture failed');
      }
    } catch (err) {
      console.error('❌ PayPal approval error:', err);
      setError(err.message);
      onError && onError(err.message);
      setProcessing(false);
    }
  };

  const onErrorHandler = (err) => {
    console.error('PayPal Error:', err);
    // Only show error for actual failures, not user cancellations
    if (err.toString().includes('USER_CANCELLED') || err.toString().includes('cancelled')) {
      setError(null); // Don't show error for user cancellations
      return;
    }
    setError('Payment was cancelled or failed. Please try again.');
    onError && onError('Payment was cancelled or failed');
  };

  // Auto-process payment with saved PayPal method using simple approach
  const processPaymentWithSavedMethod = async () => {
    if (!selectedPaymentMethod || !selectedPaymentMethod.token || paymentProcessedRef.current) {
      return;
    }

    try {
      paymentProcessedRef.current = true;
      setAutoProcessing(true);
      setError(null);

      console.log('🚀 Starting auto-payment with saved method:', {
        token: selectedPaymentMethod.token.substring(0, 10) + '...',
        amount,
        orderId,
        email: selectedPaymentMethod.details?.email
      });

      // For saved PayPal methods, we need user interaction
      // Show PayPal buttons instead of auto-processing
      console.log('💰 Saved PayPal method detected - showing PayPal buttons for user approval');
      
      // Don't auto-process, let the user click PayPal buttons
      setAutoProcessing(false);
      paymentProcessedRef.current = false;
      
      // The PayPal buttons will handle the payment flow
    } catch (err) {
      console.error('Auto payment error:', err);
      setError(err.message);
      onError && onError(err.message);
      paymentProcessedRef.current = false;
    } finally {
      setAutoProcessing(false);
    }
  };

  // No auto-processing - user must click PayPal buttons for interaction

  return (
    <div className="max-w-md mx-auto bg-white/5 border border-white/20 rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <CreditCard className="w-6 h-6 text-[#8abcb9] mr-2" />
        <h2 className="text-xl font-semibold text-white/95">Complete Payment</h2>
      </div>

      {/* Payment Method Display (if saved method) */}
      {selectedPaymentMethod && (
        <div className="mb-4 p-4 bg-[#8abcb9]/10 border border-[#8abcb9]/20 rounded-lg">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="#00457C">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.76-4.852a.932.932 0 0 1 .922-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.755-4.461z"/>
            </svg>
            <div className="flex-1">
              <span className="text-sm font-medium text-white/95">
                {selectedPaymentMethod.details?.email || 'PayPal Account'}
              </span>
              {selectedPaymentMethod.is_default && (
                <span className="ml-2 px-2 py-0.5 bg-[#8abcb9] text-zinc-950 text-xs rounded-full font-medium">
                  Default
                </span>
              )}
            </div>
            <CheckCircle className="w-5 h-5 text-[#8abcb9]" />
          </div>
        </div>
      )}

      {/* Payment Amount */}
      <div className="bg-white/10 border border-white/20 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-[#8abcb9]">Amount to pay:</span>
          <span className="text-2xl font-bold text-[#8abcb9]">${amount}</span>
        </div>
        <div className="flex items-center text-sm text-white/80">
          <Lock className="w-4 h-4 mr-1" />
          <span>Secure payment processing</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-600/20 border border-red-600/40 rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" />
          <span className="text-sm text-red-300">{error}</span>
        </div>
      )}

      {/* Success State */}
      {success && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-white/95 mb-2">Payment Successful!</h3>
          <p className="text-white/60 mb-4">Your payment has been processed successfully.</p>
          <div className="p-3 bg-green-600/20 border border-green-600/40 rounded-md">
            <p className="text-sm text-white/90">
              You will be redirected to the confirmation page shortly...
            </p>
          </div>
        </div>
      )}

      {/* PayPal Buttons - Always show for user interaction */}
      {!success && (
        <>
          <p className="text-sm text-white/70 mb-4 text-center">
            {selectedPaymentMethod 
              ? `Click the button below to complete your payment with your saved PayPal account (${selectedPaymentMethod.details?.email || 'PayPal Account'})`
              : 'Click the button below to complete your payment with PayPal'
            }
          </p>
          <PayPalButtons
            createOrder={createOrder}
            onApprove={onApprove}
            onError={onErrorHandler}
            disabled={processing}
            style={{
              layout: 'vertical',
              color: 'gold',
              shape: 'rect',
              label: 'pay',
              height: 50,
            }}
            forceReRender={[amount, orderId]}
          />
        </>
      )}


      {/* Processing Indicator */}
      {processing && !success && (
        <div className="mt-4 p-4 bg-yellow-600/20 border border-yellow-600/40 rounded-md">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-400 mr-3"></div>
            <p className="text-sm text-white/90">
              Processing your payment, please wait...
            </p>
          </div>
        </div>
      )}

      {/* Security Footer */}
      <div className="mt-6 pt-6 border-t border-white/20">
        <div className="flex items-center justify-center text-sm text-white/60">
          <Lock className="w-4 h-4 mr-2" />
          <span>Secured by PayPal • Buyer Protection included</span>
        </div>
      </div>
    </div>
  );
}
