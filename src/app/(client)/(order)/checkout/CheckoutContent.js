"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShoppingCart,
  CreditCard,
  Clock,
  CheckCircle,
  ArrowLeft,
  AlertCircle,
  Plus,
  X,
  Star,
  Package,
} from "lucide-react";
import { Toast, ConfirmationModal } from "@components/ui";
import PayPalPaymentForm from "@components/payments/PayPalPaymentForm";
import AddPayPalMethodModal from "@components/payments/AddPayPalMethodModal";

export default function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [processing, setProcessing] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [products, setProducts] = useState({ impressionKit: null, aligner: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [userPaymentMethods, setUserPaymentMethods] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [confirmModal, setConfirmModal] = useState({ show: false, title: "", message: "" });

  const orderCreationRef = useRef(false);
  const orderIdempotencyKeyRef = useRef(null);

  const userId = searchParams.get("user_id");
  const planId = searchParams.get("plan_id");

  // Memoized toast handling with debouncing
  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  }, []);

  // Memoized calculations
  const isInstantPlan = useMemo(() => selectedPlan?.frequency === "instant", [selectedPlan]);
  const hasDiscount = useMemo(() => products.aligner?.discountPrice > 0, [products.aligner]);
  const showSavings = useMemo(() => isInstantPlan && hasDiscount, [isInstantPlan, hasDiscount]);

  const getAlignerDiscountedPrice = useMemo(() => {
    if (!products.aligner) return 0;
    const originalPrice = products.aligner.price;
    const discountPercent = products.aligner.discountPrice || 0;
    return originalPrice - (originalPrice * discountPercent) / 100;
  }, [products.aligner]);

  const calculateInstallmentAmount = useMemo(() => {
    if (!products.aligner || !selectedPlan) return 0;
    const originalPrice = products.aligner.price;
    return isInstantPlan ? getAlignerDiscountedPrice : originalPrice / selectedPlan.num_installments;
  }, [products.aligner, selectedPlan, isInstantPlan, getAlignerDiscountedPrice]);

  const getTotalWithPlan = useMemo(() => {
    if (!products.impressionKit || !products.aligner || !selectedPlan) return 0;
    const impressionCost = products.impressionKit.price;
    return isInstantPlan ? impressionCost + getAlignerDiscountedPrice : impressionCost + products.aligner.price;
  }, [products.impressionKit, products.aligner, selectedPlan, isInstantPlan, getAlignerDiscountedPrice]);

  const getSavingsAmount = useMemo(() => {
    if (!products.aligner || !selectedPlan || !isInstantPlan) return 0;
    return (products.aligner.price * (products.aligner.discountPrice || 0)) / 100;
  }, [products.aligner, selectedPlan, isInstantPlan]);

  const fetchUserProfile = useCallback(async (token) => {
    try {
      const response = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(response.status === 401 ? "Unauthorized" : "Failed to fetch profile");
      const userData = await response.json();
      if (!userData.isVerified) {
        router.push("/verifyemailpage");
        return null;
      }
      return userData;
    } catch (error) {
      console.error("Profile fetch error:", error);
      setError("Network error while fetching profile");
      return null;
    }
  }, [router]);

  const loadUserPaymentMethods = useCallback(async (userIdToUse, token) => {
    try {
      const response = await fetch(`/api/user/${userIdToUse}/payment-methods`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to load payment methods");
      const result = await response.json();
      if (result.success) {
        setUserPaymentMethods(result.data || []);
        const defaultMethod = result.data?.find((method) => method.is_default);
        if (defaultMethod) setSelectedPaymentMethod(defaultMethod);
      }
    } catch (err) {
      console.error("Payment methods error:", err);
      showToast("Failed to load payment methods", "error");
    }
  }, [showToast]);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token || !userId || !planId) {
        router.push("/login");
        return;
      }

      const [userData, productsRes, planRes] = await Promise.all([
        fetchUserProfile(token),
        fetch("/api/products"),
        fetch(`/api/installment-plans/${planId}`),
      ]);

      if (!userData) return;

      if (!productsRes.ok) throw new Error("Failed to fetch products");
      const productsData = await productsRes.json();
      const impression = productsData.find((p) => p.type === "impression-kit");
      const aligner = productsData.find((p) => p.type === "aligners");
      if (!impression || !aligner) throw new Error("Required products not found");
      setProducts({ impressionKit: impression, aligner });

      if (!planRes.ok) throw new Error("Failed to fetch payment plan");
      const planData = await planRes.json();
      if (!planData.success) throw new Error("Invalid payment plan selected");
      setSelectedPlan(planData.data);

      await loadUserPaymentMethods(userData._id, token);
    } catch (err) {
      console.error("Data loading error:", err);
      setError(err.message || "Failed to load checkout data");
      showToast(err.message || "Failed to load checkout data", "error");
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile, loadUserPaymentMethods, router, userId, planId, showToast]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const createOrder = useCallback(async () => {
    if (orderCreationRef.current || orderData) return orderData;
    if (!products.impressionKit || !products.aligner || !selectedPlan || !selectedPaymentMethod) {
      const errorMsg = "Missing required data for order creation";
      setError(errorMsg);
      showToast(errorMsg, "error");
      return null;
    }

    orderCreationRef.current = true;
    const finalUserId = userProfile?._id || userId;
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      return null;
    }

    if (!orderIdempotencyKeyRef.current) {
      orderIdempotencyKeyRef.current = `order_${finalUserId}_${planId}_${Date.now()}`;
    }

    try {
      const existingOrdersRes = await fetch(
        `/api/user/orders?user_id=${finalUserId}&status=pending`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (existingOrdersRes.ok) {
        const existingOrders = await existingOrdersRes.json();
        if (existingOrders.success && existingOrders.data.length > 0) {
          const matchingOrder = existingOrders.data.find(
            (order) =>
              order.impression_kit_product_id === products.impressionKit._id &&
              order.aligner_product_id === products.aligner._id &&
              order.installment_plan_id === selectedPlan._id
          );
          if (matchingOrder) {
            showToast("Using existing order", "success");
            return matchingOrder;
          }
        }
      }

      const response = await fetch("/api/user/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": orderIdempotencyKeyRef.current,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: finalUserId,
          impression_kit_product_id: products.impressionKit._id,
          aligner_product_id: products.aligner._id,
          installment_plan_id: selectedPlan._id,
          payment_method_token: selectedPaymentMethod.token,
          idempotency_key: orderIdempotencyKeyRef.current,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Failed to create order");

      showToast("Order created successfully", "success");
      return result.data;
    } catch (err) {
      console.error("Order creation error:", err);
      setError(err.message || "Failed to create order");
      showToast(err.message || "Failed to create order", "error");
      return null;
    } finally {
      orderCreationRef.current = false;
    }
  }, [orderData, products, selectedPlan, selectedPaymentMethod, userProfile, userId, router, showToast]);

  const handlePaymentMethodSelect = useCallback((method) => {
    setSelectedPaymentMethod(method);
  }, []);

  const handlePaymentSuccess = useCallback(
    (paymentData) => {
      setProcessing(true);
      showToast("Payment processed successfully", "success");
      
      // Use the payment ID from the response
      const paymentId = paymentData.payment?._id || paymentData.payment?.provider_transaction_id || paymentData.capture?.id || 'paypal_' + Date.now();
      
      console.log('🎉 Payment success - redirecting to success page:', {
        orderId: orderData._id,
        paymentId: paymentId,
        paymentData: paymentData
      });
      
      router.push(`/checkout/success?order_id=${orderData._id}&payment_id=${paymentId}`);
    },
    [orderData, router, showToast]
  );

  const handlePaymentError = useCallback((error) => {
    setError(error);
    showToast(error, "error");
    setProcessing(false);
  }, [showToast]);

  const proceedToOrderConfirmation = useCallback(async () => {
    if (!selectedPaymentMethod || processing) {
      setError("Please select a payment method to continue");
      showToast("Please select a payment method to continue", "error");
      return;
    }

    setProcessing(true);
    const order = await createOrder();
    if (order) {
      setOrderData(order);
      setCurrentStep(2);
    }
    setProcessing(false);
  }, [selectedPaymentMethod, processing, createOrder, showToast]);

  const handleAddPaymentMethod = useCallback((paymentMethodData) => {
    setUserPaymentMethods((prev) => [...prev, paymentMethodData]);
    setSelectedPaymentMethod(paymentMethodData);
    setShowAddPaymentModal(false);
    showToast("Payment method added successfully", "success");
  }, [showToast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8abcb9]"></div>
          <span className="ml-4 text-white">Loading checkout...</span>
        </div>
      </div>
    );
  }

  if (error && !products.impressionKit) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Unable to Load Checkout</h2>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-[#8abcb9] text-[#0a0a0a] rounded-lg hover:bg-[#a4cbc8] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-[#8abcb9] hover:text-[#a4cbc8] mb-4 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-white/95">Complete Your Order</h1>
          <div className="mt-6 flex items-center">
            <div className={`flex items-center ${currentStep >= 1 ? "text-[#8abcb9]" : "text-white/60"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 1 ? "bg-[#8abcb9] text-[#0a0a0a]" : "bg-white/20 text-white/60"
                }`}
              >
                1
              </div>
              <span className="ml-2 font-medium">Payment Method</span>
            </div>
            <div className="flex-1 mx-4 h-1 bg-white/20 rounded-full">
              <div
                className={`h-full transition-all rounded-full ${
                  currentStep >= 2 ? "bg-[#8abcb9]" : "bg-white/20"
                }`}
                style={{ width: currentStep >= 2 ? "100%" : "0%" }}
              ></div>
            </div>
            <div className={`flex items-center ${currentStep >= 2 ? "text-[#8abcb9]" : "text-white/60"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 2 ? "bg-[#8abcb9] text-[#0a0a0a]" : "bg-white/20 text-white/60"
                }`}
              >
                2
              </div>
              <span className="ml-2 font-medium">Confirmation & Payment</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-600/20 border border-red-600/30 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-400">{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 1 && (
              <>
                {selectedPlan && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white/95 mb-4">{selectedPlan.description}</h2>
                    <div className="mt-4 p-4 bg-[#8abcb9]/10 border border-[#8abcb9]/20 rounded-lg">
                      <h4 className="font-medium text-[#8abcb9] mb-2">How it works:</h4>
                      <ol className="text-sm text-white/85 space-y-1">
                        {isInstantPlan ? (
                          <li>1. Pay ${getTotalWithPlan} now for both your impression kit and aligners</li>
                        ) : (
                          <li>1. Pay ${products.impressionKit?.price} now for your impression kit</li>
                        )}
                        <li>2. Create impressions and send them back to us</li>
                        <li>3. We&apos;ll create your custom aligner</li>
                        {isInstantPlan ? (
                          <li>4. Start your treatment without any delay</li>
                        ) : (
                          <li>4. Start your {selectedPlan.frequency} payment plan of ${calculateInstallmentAmount} each</li>
                        )}
                      </ol>
                    </div>
                  </div>
                )}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-white/95 mb-4">Select Payment Method</h2>
                  {userPaymentMethods.length > 0 && (
                    <div className="space-y-3 mb-6">
                      <h3 className="font-medium text-white/85">Saved Payment Methods</h3>
                      {userPaymentMethods.map((method) => (
                        <div
                          key={method._id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            selectedPaymentMethod?._id === method._id
                              ? "border-[#8abcb9]/50 bg-[#8abcb9]/10"
                              : "border-white/20 hover:border-white/30"
                          }`}
                          onClick={() => handlePaymentMethodSelect(method)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {method.provider === 'paypal' ? (
                                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="#00457C">
                                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.76-4.852a.932.932 0 0 1 .922-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.755-4.461z"/>
                                </svg>
                              ) : (
                                <CreditCard className="w-5 h-5 text-white/70 mr-3" />
                              )}
                              <div>
                                <span className="font-medium text-white/95 capitalize">{method.provider}</span>
                                {method.last_four && (
                                  <span className="text-white/70 ml-2">•••• {method.last_four}</span>
                                )}
                                {method.is_default && (
                                  <span className="ml-2 px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full border border-green-600/30">
                                    Default
                                  </span>
                                )}
                              </div>
                            </div>
                            {selectedPaymentMethod?._id === method._id && (
                              <CheckCircle className="w-5 h-5 text-[#8abcb9]" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => setShowAddPaymentModal(true)}
                    disabled={processing}
                    className="w-full p-4 border-2 border-dashed border-white/30 rounded-lg text-white/70 hover:border-[#8abcb9]/50 hover:text-[#8abcb9] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add PayPal Account
                  </button>
                  {userPaymentMethods.length === 0 && (
                    <div className="mt-4 p-4 bg-yellow-600/20 border border-yellow-600/30 rounded-lg">
                      <p className="text-sm text-yellow-400">
                        You need to add a PayPal account to continue with your order.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-white/95 mb-4">Order Confirmation</h2>
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center text-green-400">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span className="font-medium">Order Created Successfully</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="text-sm text-white/70 space-y-2">
                        <div>
                          <span className="font-medium text-white/85">Order ID:</span> {orderData?._id}
                        </div>
                        <div>
                          <span className="font-medium text-white/85">Payment Method:</span>{" "}
                          {selectedPaymentMethod?.provider} {selectedPaymentMethod?.last_four && `•••• ${selectedPaymentMethod.last_four}`}
                        </div>
                        <div>
                          <span className="font-medium text-white/85">Payment Plan:</span>{" "}
                          {selectedPlan?.description}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <PayPalPaymentForm
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  amount={isInstantPlan ? parseFloat(getTotalWithPlan) : products.impressionKit?.price || 5}
                  orderId={orderData?._id}
                  userId={userProfile?._id || userId}
                  processing={processing}
                  setProcessing={setProcessing}
                  isInstantPlan={isInstantPlan}
                  selectedPaymentMethod={selectedPaymentMethod}
                />
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-white/95 mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-white/70">Impression Kit</span>
                  <span className="font-medium text-white/95">${products.impressionKit?.price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Custom Aligner</span>
                  <span className="font-medium text-white/95">
                    ${showSavings ? getAlignerDiscountedPrice : products.aligner?.price}
                  </span>
                </div>
                {showSavings && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount savings:</span>
                    <span className="font-medium">-${getSavingsAmount}</span>
                  </div>
                )}
                <hr className="my-3 border-white/20" />
                <div className="flex justify-between font-semibold text-lg">
                  <span className="text-white/95">Total</span>
                  <span className="text-white/95">${getTotalWithPlan}</span>
                </div>
              </div>
              {selectedPlan && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-white/95 mb-2">Payment Schedule</h4>
                  <div className="space-y-2 text-sm">
                    {isInstantPlan ? (
                      <div className="flex justify-between">
                        <span className="text-white/70">Pay Now</span>
                        <span className="font-medium text-white/95">${getTotalWithPlan}</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-white/70">Today (Impression Kit)</span>
                          <span className="font-medium text-green-400">${products.impressionKit?.price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70 text-nowrap">{selectedPlan.description}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70 text-nowrap">{selectedPlan.num_installments} Installments</span>
                          <span className="font-medium text-white/95 text-nowrap">${calculateInstallmentAmount} each</span>
                        </div>
                      </>
                    )}
                    {showSavings && (
                      <div className="flex justify-between text-green-400 pt-2 border-t border-white/10">
                        <span className="font-medium">Total Savings:</span>
                        <span className="font-medium">${getSavingsAmount}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {currentStep === 1 && (
                <button
                  onClick={proceedToOrderConfirmation}
                  disabled={!selectedPaymentMethod || processing}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    !selectedPaymentMethod || processing
                      ? "bg-white/20 cursor-not-allowed text-white/60"
                      : "bg-[#8abcb9] hover:bg-[#a4cbc8] text-[#0a0a0a]"
                  }`}
                >
                  {processing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                      Creating Order...
                    </div>
                  ) : (
                    "Create Order & Pay"
                  )}
                </button>
              )}
              {currentStep === 2 && (
                <div className="text-sm text-white/70">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    <span>Order created successfully</span>
                  </div>
                  <p>Your payment is being processed. Please wait.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <AddPayPalMethodModal
          isOpen={showAddPaymentModal}
          onClose={() => setShowAddPaymentModal(false)}
          onSuccess={handleAddPaymentMethod}
          onError={(error) => showToast(error, "error")}
          userId={userProfile?._id || userId}
        />
        {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: "", type: "" })} />}
        <ConfirmationModal
          isOpen={confirmModal.show}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={() => setConfirmModal({ show: false, title: "", message: "" })}
          onCancel={() => setConfirmModal({ show: false, title: "", message: "" })}
          actionText="OK"
          type="info"
        />
      </div>
    </div>
  );
}