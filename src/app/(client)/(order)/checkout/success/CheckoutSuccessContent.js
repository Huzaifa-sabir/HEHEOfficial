"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle,
  Package,
  Calendar,
  CreditCard,
  ArrowRight,
  Download,
  Mail,
  X,
  Clock,
  Truck,
  Star,
  AlertCircle,
  Copy,
  Check,
  Phone,
  MessageCircle,
} from "lucide-react";
import { Toast, ConfirmationModal } from "@components/ui";

export default function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState({
    download: false,
    email: false,
  });

  // Toast and Modal states
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const orderId = searchParams.get("order_id");
  const paymentId = searchParams.get("payment_id");
  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken");
    }
    return null;
  };
  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  // Hide toast
  const hideToast = () => {
    setToast({ show: false, message: "", type: "" });
  };

  // Show confirmation modal
  const showConfirmModal = (title, message, onConfirm = null) => {
    setConfirmModal({ show: true, title, message, onConfirm });
  };

  // Hide confirmation modal
  const hideConfirmModal = () => {
    setConfirmModal({ show: false, title: "", message: "", onConfirm: null });
  };

  useEffect(() => {
    if (!orderId) {
      setError("Order ID not found");
      setLoading(false);
      return;
    }
    loadOrderData();
  }, [orderId]);

  const loadOrderData = async () => {
    const token = getAuthToken();
    if (!token) {
      setError("Please log in to view your order");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`/api/user/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setOrderData(result.data);
        setError(null);
      } else {
        throw new Error(result.error || "Order not found");
      }
    } catch (err) {
      console.error("Failed to load order:", err);
      const errorMsg =
        err.message === "HTTP error! status: 404"
          ? "Order not found"
          : "Failed to load order details";
      setError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const copyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      showToast("Order ID copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      showToast("Failed to copy order ID", "error");
    }
  };

  const calculateInstallmentAmount = () => {
    if (!orderData?.installment_plan_id || !orderData?.aligner_product_id)
      return 0;

    const planNumInstallments = orderData.installment_plan_id.num_installments;
    if (planNumInstallments === 0) return 0;

    return orderData.aligner_product_id.price / planNumInstallments;
  };

  const getEstimatedDeliveryDate = () => {
    const now = new Date();
    // Estimate 3-5 business days for shipping
    const deliveryDate = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);

    return deliveryDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleTrackOrder = () => {
    router.push(`/orders/${orderId}`);
  };

  const handleBackToHome = () => {
    showConfirmModal(
      "Leave This Page?",
      "Are you sure you want to leave? You can always track your order from your account dashboard.",
      () => {
        router.push("/");
        hideConfirmModal();
      }
    );
  };
  const getOrderStatusColor = (status) => {
    switch (status) {
      case "kit_paid":
      case "confirmed":
        return "text-green-400 bg-green-600/20 border-green-600/30";
      case "processing":
        return "text-blue-400 bg-blue-600/20 border-blue-600/30";
      case "shipped":
        return "text-purple-400 bg-purple-600/20 border-purple-600/30";
      default:
        return "text-white/70 bg-white/10 border-white/20";
    }
  };

  const getOrderStatusText = (status) => {
    switch (status) {
      case "kit_paid":
        return "Payment Confirmed";
      case "confirmed":
        return "Order Confirmed";
      case "processing":
        return "Processing";
      case "shipped":
        return "Shipped";
      default:
        return status || "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8abcb9] mb-4"></div>
          <p className="text-white/70">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (error && !orderData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">
            Order Not Found
          </h2>
          <p className="text-white/70 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/orders")}
              className="w-full px-6 py-3 bg-[#8abcb9] text-[#0a0a0a] rounded-lg hover:bg-[#a4cbc8] transition-colors font-medium"
            >
              View All Orders
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full px-6 py-3 border border-white/20 text-white/95 rounded-lg hover:bg-white/5 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isInstantPayment =
    orderData?.installment_plan_id?.frequency === "instant" ||
    orderData?.installment_plan_id?.num_installments === 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-green-600/20 border border-green-600/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white/95 mb-3">
            Payment Successful!
          </h1>
          <p className="text-xl text-white/85 mb-2">
            Thank you for choosing our aligner treatment.
          </p>
          <p className="text-white/70">
            Your impression kit will be shipped within 3-4 business days.
          </p>

          {/* Order ID with copy functionality */}
          <div className="mt-6 inline-flex items-center bg-white/5 border border-white/10 rounded-lg px-4 py-2 backdrop-blur-sm">
            <span className="text-white/70 mr-2">Order ID:</span>
            <span className="font-mono text-white/95 mr-2">
              #{orderId?.slice(-8).toUpperCase()}
            </span>
            <button
              onClick={copyOrderId}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              title="Copy order ID"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-white/60" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-600/20 border border-red-600/30 rounded-lg flex items-center justify-between backdrop-blur-sm">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-400">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Details */}
            <div className="bg-white/5 border border-white/10 rounded-xl shadow-lg p-6 backdrop-blur-sm">
              <h2 className="text-xl font-semibold text-white/95 mb-6">
                Order Confirmation
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
                  <div className="flex items-center">
                    <Package className="w-5 h-5 text-green-400 mr-3" />
                    <div>
                      <h3 className="font-medium text-white/95">
                        Order #{orderId?.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-white/70">
                        Placed on{" "}
                        {new Date(orderData?.created_at).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-lg border ${getOrderStatusColor(
                      orderData?.status
                    )}`}
                  >
                    {getOrderStatusText(orderData?.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <div className="flex items-center mb-3">
                      <Package className="w-5 h-5 text-[#8abcb9] mr-2" />
                      <span className="font-medium text-white/95">
                        Impression Kit
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/60">Status</span>
                        <span className="text-sm font-medium text-white/95">
                          Paid Today
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/60">Amount</span>
                        <span className="font-semibold text-white/95">
                          ${orderData?.initial_payment_amount?.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/60">
                          Est. Delivery
                        </span>
                        <span className="text-sm text-white/95">
                          {getEstimatedDeliveryDate()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <div className="flex items-center mb-3">
                      <Star className="w-5 h-5 text-[#8abcb9] mr-2" />
                      <span className="font-medium text-white/95">
                        Custom Aligner
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/60">
                          Production
                        </span>
                        <span className="text-sm font-medium text-orange-400">
                          Pending Impressions
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/60">
                          Payment Plan
                        </span>
                        <span className="text-sm text-white/95">
                          {isInstantPayment
                            ? "Paid in Full"
                            : `${
                                orderData?.installment_plan_id?.num_installments
                              }x ${orderData?.installment_plan_id?.frequency?.slice(
                                0,
                                -2
                              )}`}
                        </span>
                      </div>
                      {!isInstantPayment && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white/60">
                            Per Payment
                          </span>
                          <span className="font-semibold text-[#8abcb9]">
                            ${calculateInstallmentAmount()?.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Payment Schedule - only show if not instant payment */}
            {!isInstantPayment &&
              orderData?.installment_plan_id?.num_installments > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-xl shadow-lg p-6 backdrop-blur-sm">
                  <h2 className="text-xl font-semibold text-white/95 mb-6">
                    Payment Schedule
                  </h2>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-green-600/10 border border-green-600/30 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                        <div>
                          <span className="font-medium text-white/95">
                            Initial Payment
                          </span>
                          <p className="text-sm text-white/70">
                            Impression Kit - Paid Today
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-green-400">
                        ${orderData?.initial_payment_amount?.toFixed(2)}
                      </span>
                    </div>

                    {Array.from(
                      {
                        length:
                          orderData?.installment_plan_id?.num_installments || 0,
                      },
                      (_, index) => {
                        const paymentDate = new Date();
                        paymentDate.setDate(
                          paymentDate.getDate() + 14 + index * 30
                        ); // Estimate: 2 weeks + monthly intervals

                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg"
                          >
                            <div className="flex items-center">
                              <Calendar className="w-5 h-5 text-white/70 mr-3" />
                              <div>
                                <span className="font-medium text-white/95">
                                  Payment {index + 1} of{" "}
                                  {
                                    orderData?.installment_plan_id
                                      ?.num_installments
                                  }
                                </span>
                                <p className="text-sm text-white/70">
                                  Estimated:{" "}
                                  {paymentDate.toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>
                            <span className="font-semibold text-white/95">
                              ${calculateInstallmentAmount()?.toFixed(2)}
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>

                  <div className="mt-6 p-4 bg-[#8abcb9]/10 border border-[#8abcb9]/20 rounded-lg backdrop-blur-sm">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-[#8abcb9] mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-white/85 mb-2">
                          <strong className="text-[#8abcb9]">Important:</strong>{" "}
                          Your subscription payments will automatically start
                          once your custom aligner is ready for shipping.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            {/* Timeline/What's Next */}
            <div className="bg-white/5 border border-white/10 rounded-xl shadow-lg p-6 backdrop-blur-sm">
              <h2 className="text-xl font-semibold text-white/95 mb-6">
                Your Treatment Timeline
              </h2>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                    ✓
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-green-400 mb-1">
                      Payment Confirmed
                    </h3>
                    <p className="text-white/70 text-sm mb-2">
                      Your payment has been processed successfully and your
                      order is confirmed.
                    </p>
                    <div className="text-xs text-green-400">
                      Completed just now
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#8abcb9] text-[#0a0a0a] rounded-full flex items-center justify-center text-sm font-bold mr-4">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white/95 mb-1">
                      Impression Kit Shipping
                    </h3>
                    <p className="text-white/70 text-sm mb-2">
                      Your impression kit will be prepared and shipped within
                      1-2 business days. You&apos;ll receive tracking
                      information via email.
                    </p>
                    <div className="flex items-center text-xs text-[#8abcb9]">
                      <Clock className="w-3 h-3 mr-1" />
                      Expected by {getEstimatedDeliveryDate()}
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-white/20 text-white/70 rounded-full flex items-center justify-center text-sm font-bold mr-4">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white/95 mb-1">
                      Create Your Impressions
                    </h3>
                    <p className="text-white/70 text-sm mb-2">
                      Follow our step-by-step guide to create accurate dental
                      impressions. Use the prepaid return label to send them
                      back.
                    </p>
                    <div className="flex items-center text-xs text-white/60">
                      <Package className="w-3 h-3 mr-1" />
                      Takes about 15-20 minutes
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-white/20 text-white/70 rounded-full flex items-center justify-center text-sm font-bold mr-4">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white/95 mb-1">
                      Aligner Creation & Delivery
                    </h3>
                    <p className="text-white/70 text-sm mb-2">
                      Our lab will create your custom aligner and ship it
                      directly to you.
                      {!isInstantPayment &&
                        " Your payment plan will begin once it's ready for shipping."}
                    </p>
                    <div className="flex items-center text-xs text-white/60">
                      <Truck className="w-3 h-3 mr-1" />
                      2-3 weeks after we receive your impressions
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 border border-white/10 rounded-xl shadow-lg p-6 sticky top-8 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white/95 mb-6">
                Order Summary
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-white/70">Impression Kit</span>
                  <span className="font-medium text-white/95">
                    ${orderData?.impression_kit_product_id?.price?.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-white/70">Custom Aligner</span>
                  <span className="font-medium text-white/95">
                    ${orderData?.aligner_product_id?.price?.toFixed(2)}
                  </span>
                </div>
                {isInstantPayment &&
                  orderData?.aligner_product_id.discountPrice > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount</span>
                      <span>
                        -$
                        {(orderData?.aligner_product_id.price *
                          orderData?.aligner_product_id.discountPrice) /
                          100}
                      </span>
                    </div>
                  )}

                <hr className="my-4 border-white/20" />

                <div className="flex justify-between font-semibold text-lg">
                  <span className="text-white/95">Total</span>
                  <span className="text-white/95">
                    ${orderData?.total_amount?.toFixed(2)}
                  </span>
                </div>

                {!isInstantPayment && (
                  <div className="pt-2 text-sm text-white/60">
                    <div className="flex justify-between">
                      <span>Paid today:</span>
                      <span>
                        ${orderData?.initial_payment_amount?.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining:</span>
                      <span>
                        $
                        {(
                          orderData?.total_amount -
                          orderData?.initial_payment_amount
                        )?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={handleTrackOrder}
                  className="w-full flex items-center justify-center py-3 px-4 bg-[#8abcb9] text-[#0a0a0a] rounded-lg text-sm font-medium hover:bg-[#a4cbc8] transition-colors duration-200"
                >
                  <span>Track Your Order</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>

              {/* Support Section */}
              <div className="pt-6 border-t border-white/20">
                <h4 className="font-medium text-white/95 mb-4">Need Help?</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Mail className="w-4 h-4 text-[#8abcb9] mr-2" />
                      <span className="text-sm font-medium text-white/95">
                        Email Support
                      </span>
                    </div>
                    <p className="text-sm text-white/70 mb-2">
                      support@alignercompany.com
                    </p>
                    <p className="text-xs text-white/60">
                      Response within 24 hours
                    </p>
                  </div>

                  <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Phone className="w-4 h-4 text-[#8abcb9] mr-2" />
                      <span className="text-sm font-medium text-white/95">
                        Phone Support
                      </span>
                    </div>
                    <p className="text-sm text-white/70 mb-2">1-800-ALIGNER</p>
                    <p className="text-xs text-white/60">
                      Mon-Fri, 9AM-6PM EST
                    </p>
                  </div>

                  <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                    <div className="flex items-center mb-2">
                      <MessageCircle className="w-4 h-4 text-[#8abcb9] mr-2" />
                      <span className="text-sm font-medium text-white/95">
                        Live Chat
                      </span>
                    </div>
                    <p className="text-sm text-white/70 mb-2">
                      Available on our website
                    </p>
                    <p className="text-xs text-white/60">
                      Mon-Fri, 9AM-9PM EST
                    </p>
                  </div>
                </div>
              </div>

              {/* Back to Home */}
              <div className="mt-6 pt-6 border-t border-white/20">
                <button
                  onClick={handleBackToHome}
                  className="w-full py-3 px-4 text-sm font-medium text-white/70 hover:text-white/95 transition-colors duration-200"
                >
                  ← Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmModal.show}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm || hideConfirmModal}
          onCancel={hideConfirmModal}
          actionText="Yes, Leave"
          cancelText="Stay Here"
          type="warning"
        />
      </div>
    </div>
  );
}
