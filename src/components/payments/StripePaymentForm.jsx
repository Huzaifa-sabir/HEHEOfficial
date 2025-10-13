import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, Lock, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function StripePaymentForm({ 
  onSuccess, 
  onError, 
  amount, 
  orderId, 
  userId, 
  processing, 
  setProcessing, 
  paymentMethodToken,
  selectedPaymentMethod 
}) {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const paymentProcessedRef = useRef(false); // Prevent duplicate processing
  const idempotencyKeyRef = useRef(null);

  useEffect(() => {
    // Generate idempotency key once when component mounts
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = `payment_${orderId}_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Auto-process payment when component mounts with a payment method
    if (paymentMethodToken && !processing && !success && !error && !paymentProcessedRef.current) {
      paymentProcessedRef.current = true; // Mark as processing to prevent duplicates
      processPaymentWithSavedMethod();
    }
  }, [paymentMethodToken]); // Remove other dependencies to prevent re-runs

  const processPaymentWithSavedMethod = async () => {
    // Double-check to prevent duplicate processing
    if (paymentProcessedRef.current !== true || processing || success) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Process payment through your API with existing payment method
      const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKeyRef.current // Add idempotency key
        },
        body: JSON.stringify({
          action: 'initial_payment',
          user_id: userId,
          payment_method_id: paymentMethodToken,
          order_id: orderId,
          idempotency_key: idempotencyKeyRef.current
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        paymentProcessedRef.current = 'completed'; // Mark as completed
        setTimeout(() => {
          onSuccess(result.data);
        }, 1500); // Small delay to show success state
      } else {
        setError(result.error || 'Payment failed');
        paymentProcessedRef.current = false; // Reset to allow retry
        onError && onError(result.error);
      }
    } catch (err) {
      const errorMessage = 'Payment processing failed. Please try again.';
      setError(errorMessage);
      paymentProcessedRef.current = false; // Reset to allow retry
      onError && onError(errorMessage);
    }

    setProcessing(false);
  };

  const handleRetryPayment = () => {
    // Reset states and generate new idempotency key for retry
    setError(null);
    paymentProcessedRef.current = false;
    idempotencyKeyRef.current = `payment_retry_${orderId}_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Small delay to ensure state updates
    setTimeout(() => {
      processPaymentWithSavedMethod();
    }, 100);
  };

  return (
    <div className="max-w-md mx-auto bg-white/5 border border-white/20 rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <CreditCard className="w-6 h-6 text-[#8abcb9] mr-2" />
        <h2 className="text-xl font-semibold text-white/95">Payment Processing</h2>
      </div>

      {/* Payment Method Display */}
      {selectedPaymentMethod && (
        <div className="mb-6 p-4 bg-white/10 border border-white/20 rounded-lg">
          <h3 className="text-sm font-medium text-white/80 mb-2">Payment Method</h3>
          <div className="flex items-center">
            <CreditCard className="w-4 h-4 text-neutral-400 mr-2" />
            <span className="text-sm text-white/95 capitalize">
              {selectedPaymentMethod.provider}
            </span>
            <span className="text-sm text-white/60 ml-2">
              •••• {selectedPaymentMethod.last_four}
            </span>
            {selectedPaymentMethod.is_default && (
              <span className="ml-2 px-2 py-1 bg-[#8abcb9]/10 border border-[#8abcb9]/20 text-[#8abcb9] text-xs rounded-full">
                Default
              </span>
            )}
          </div>
        </div>
      )}

      {/* Payment Amount */}
      <div className="bg-white/10 border border-white/20 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-[#8abcb9]">Amount to be charged:</span>
          <span className="text-2xl font-bold text-[#8abcb9]">${amount}</span>
        </div>
        <div className="flex items-center text-sm text-white/80">
          <Lock className="w-4 h-4 mr-1" />
          <span>Secure payment processing</span>
        </div>
      </div>

      {/* Processing State */}
      {processing && !error && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a4cbc8] mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-white/95 mb-2">Processing Payment</h3>
          <p className="text-neutral-600">Please wait while we securely process your payment...</p>
          <div className="mt-4 p-3 bg-yellow-600/20 border border-yellow-600/40 rounded-md">
            <p className="text-sm text-white/90">
              <strong>Please don't close this window</strong> - Your payment is being processed.
            </p>
          </div>
        </div>
      )}

      {/* Success State */}
      {success && !processing && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-white/95 mb-2">Payment Successful!</h3>
          <p className="text-neutral-600 mb-4">Your payment has been processed successfully.</p>
          <div className="p-3 bg-green-600/20 border border-green-600/40 rounded-md">
            <p className="text-sm text-white/90">
              You will be redirected to the confirmation page shortly...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !processing && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600/60" />
          </div>
          <h3 className="text-lg font-semibold text-white/95 mb-2">Payment Failed</h3>
          <div className="mb-6 p-4 bg-red-600/20 border border-red-600/40 rounded-md">
            <p className="text-sm text-white/90">{error}</p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleRetryPayment}
              disabled={processing}
              className={`w-full py-3 px-4 rounded-md font-medium text-neutral-800 transition-colors ${
                processing 
                  ? 'bg-neutral-400 cursor-not-allowed' 
                  : 'bg-[#8abcb9] hover:bg-[#a4cbc8]'
              }`}
            >
              {processing ? 'Retrying...' : 'Try Again'}
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 px-4 border border-neutral-300 text-white/80 rounded-md font-medium hover:bg-white/10 transition-colors"
            >
              Start Over
            </button>
          </div>

          <div className="mt-6 p-3 bg-white/10 rounded-md">
            <p className="text-xs text-white/70">
              If you continue to experience issues, please contact support at{' '}
              <a href="mailto:support@alignercompany.com" className="text-[#a4cbc8] hover:underline">
                support@alignercompany.com
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Initial State - Show instructions while waiting */}
      {!processing && !success && !error && (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white/95 mb-2">Ready to Process</h3>
          <p className="text-white/60">Your payment will be processed automatically using your selected payment method.</p>
        </div>
      )}

      {/* Security Footer */}
      <div className="mt-6 pt-6 border-t border-white/50">
        <div className="flex items-center justify-center text-sm text-white/60">
          <Lock className="w-4 h-4 mr-2" />
          <span>256-bit SSL encryption • PCI DSS compliant • Powered by Stripe</span>
        </div>
      </div>
    </div>
  );
}