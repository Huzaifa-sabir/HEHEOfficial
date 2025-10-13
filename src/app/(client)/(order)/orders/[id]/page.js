"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Package,
  User,
  CreditCard,
  Calendar,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Edit,
  Truck,
  DollarSign,
  X,
  PlayCircle,
  PauseCircle,
  Plus,
  MoreVertical,
  Check,
} from "lucide-react";
import { Toast, ConfirmationModal } from "@components/ui";

export default function UserOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [updatingPaymentMethod, setUpdatingPaymentMethod] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  console.log("selectedPaymentMethod::: ", selectedPaymentMethod);

  // Toast and Modal states
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: "",
    message: "",
  });

  // Get auth token from localStorage
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

  // Check authentication and load order data
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/login");
      return;
    }
    loadOrderData();
  }, [params.id]);

  const loadOrderData = async () => {
    const token = getAuthToken();
    if (!token) {
      setError("Please log in to view your order");
      setLoading(false);
      return;
    }

    try {
      // Load order details
      const orderResponse = await fetch(`/api/user/orders/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (orderResponse.status === 401) {
        localStorage.removeItem("authToken");
        router.push("/login");
        return;
      }

      const orderResult = await orderResponse.json();

      if (orderResult.success) {
        setOrder(orderResult.data);
        setError(null);

        // Load subscription details if order has active subscription
        if (
          orderResult.data.status === "subscription_active" ||
          orderResult.data.subscription_start_date
        ) {
          await loadSubscriptionData(orderResult.data._id);
        }
      } else {
        setError(orderResult.error || "Order not found");
        showToast(orderResult.error || "Order not found", "error");
      }
    } catch (err) {
      console.error("Error loading order:", err);
      setError("Failed to load order details");
      showToast("Failed to load order details", "error");
    }

    setLoading(false);
  };

  const loadSubscriptionData = async (orderId) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`/api/subscriptions/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSubscription(result.data);
        }
      }
    } catch (err) {
      console.error("Error loading subscription:", err);
    }
  };

  const handleCancelOrder = () => {
    setConfirmModal({
      show: true,
      title: "Cancel Order",
      message:
        "Are you sure you want to cancel this order? This action cannot be undone and will stop all future payments and processing.",
    });
  };

  const confirmCancelOrder = async () => {
    const token = getAuthToken();
    if (!token) return;

    setCancelling(true);
    try {
      const response = await fetch(`/api/user/orders/${params.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success) {
        setOrder(result.data);
        showToast("Order cancelled successfully", "success");
      } else {
        showToast(result.error || "Failed to cancel order", "error");
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      showToast("Failed to cancel order", "error");
    }
    setCancelling(false);
    setConfirmModal({ show: false, title: "", message: "" });
  };

  const cancelConfirmModal = () => {
    setConfirmModal({ show: false, title: "", message: "" });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
      kit_paid: "bg-blue-600/20 text-blue-400 border-blue-600/30",
      full_paid: "bg-emerald-600/20 text-emerald-400 border-emerald-600/30",
      kit_received: "bg-purple-600/20 text-purple-400 border-purple-600/30",
      aligner_ready: "bg-indigo-600/20 text-indigo-400 border-indigo-600/30",
      subscription_active: "bg-green-600/20 text-green-400 border-green-600/30",
      completed: "bg-emerald-600/20 text-emerald-400 border-emerald-600/30",
      cancelled: "bg-red-600/20 text-red-400 border-red-600/30",
    };
    return colors[status] || "bg-white/10 text-white/70 border-white/20";
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "Order Pending",
      kit_paid: "Kit Payment Received",
      full_paid: "Full Payment Received",
      kit_received: "Impressions Received",
      aligner_ready: "Aligner Ready for Shipping",
      subscription_active: "Active Subscription",
      completed: "Order Completed",
      cancelled: "Order Cancelled",
    };
    return texts[status] || status;
  };

  const getStatusDescription = (status) => {
    const descriptions = {
      pending:
        "Your order has been created and is waiting for initial payment processing.",
      kit_paid:
        "Your impression kit payment has been processed. The kit will be shipped to you soon.",
      full_paid:
        "Your impression kit payment has been processed. The kit will be shipped to you soon.",
      kit_received:
        "We have received your dental impressions and are creating your custom aligner.",
      aligner_ready:
        "Your custom aligner is ready and will be shipped to you soon.",
      subscription_active:
        "Your subscription is active and installments are being processed.",
      completed: "Your order has been completed successfully.",
      cancelled: "This order has been cancelled.",
    };
    return descriptions[status] || "Order status updated.";
  };

  const calculateInstallmentAmount = () => {
    if (
      !order?.aligner_product_id?.price ||
      !order?.installment_plan_id?.num_installments
    )
      return 0;
    return (
      order.aligner_product_id.price /
      order.installment_plan_id.num_installments
    ).toFixed(2);
  };

  const calculateRemainingAmount = () => {
    if (!subscription || !order) return 0;
    const installmentAmount = parseFloat(calculateInstallmentAmount());
    const remainingInstallments =
      subscription.total_installments - subscription.completed_installments;
    return (installmentAmount * remainingInstallments).toFixed(2);
  };

  const formatNextBillingDate = () => {
    if (!subscription?.next_billing_date) return "Not scheduled";
    return new Date(subscription.next_billing_date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  const loadPaymentMethods = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(
        `/api/user/${order?.user_id?._id}/payment-methods`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setPaymentMethods(result.data || []);
        } else {
          showToast("Failed to load payment methods", "error");
        }
      }
    } catch (err) {
      console.error("Error loading payment methods:", err);
      showToast("Failed to load payment methods", "error");
    }
  };

  // Handle updating payment method
  const handleUpdatePaymentMethod = async (methodId) => {
    if (updatingPaymentMethod) return;

    setUpdatingPaymentMethod(true);
    const token = getAuthToken();
    if (!token) {
      showToast("Please log in to update payment method", "error");
      setUpdatingPaymentMethod(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/subscriptions/${params.id}/payment-method`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ payment_method_token: methodId }),
        }
      );

      const result = await response.json();

      if (result.success) {
        showToast("Payment method updated successfully", "success");
        setOrder((prev) => ({
          ...prev,
          payment_method_token: methodId,
        }));
        await loadSubscriptionData(params.id); // Refresh subscription data
      } else {
        showToast(result.error || "Failed to update payment method", "error");
      }
    } catch (err) {
      console.error("Error updating payment method:", err);
      showToast("Failed to update payment method", "error");
    } finally {
      setUpdatingPaymentMethod(false);
      setShowPaymentMethodModal(false);
      setSelectedPaymentMethod(null);
    }
  };

  // Load payment methods when order is loaded
  useEffect(() => {
    if (order?.user_id?._id) {
      loadPaymentMethods();
    }
  }, [order?.user_id?._id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8abcb9]"></div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white/95 mb-2">
            Error Loading Order
          </h2>
          <p className="text-white/70 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="text-[#8abcb9] hover:text-[#a4cbc8] transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.back()}
                className="flex items-center text-[#8abcb9] hover:text-[#a4cbc8] mb-4 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>

              <div className="flex items-center">
                <Package className="w-8 h-8 text-white/70 mr-3" />
                <div>
                  <h1 className="text-3xl font-bold text-white/95">
                    Order #{order?._id.slice(-8)}
                  </h1>
                  <p className="text-white/85">
                    Placed on{" "}
                    {new Date(order?.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span
                className={`inline-flex px-3 py-1 text-sm font-medium rounded-lg border ${getStatusColor(
                  order?.status
                )}`}
              >
                {getStatusText(order?.status)}
              </span>

              <button
                onClick={loadOrderData}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 disabled:opacity-50 text-white/95 transition-colors duration-200"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-600/20 border border-red-600/30 rounded-lg flex items-center justify-between backdrop-blur-sm">
            <span className="text-red-400">{error}</span>
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
            {/* Order Status & Progress */}
            {/* Subscription Details - Only show if subscription exists */}
            {subscription &&
              (order?.status === "subscription_active" ||
                order?.subscription_start_date) && (
                <div className="bg-white/5 border border-white/10 rounded-xl shadow-lg p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white/95">
                      Subscription Details
                    </h2>
                    <span
                      className={`inline-flex px-3 py-1 text-sm font-medium rounded-lg border ${
                        subscription.status === "active"
                          ? "bg-green-600/20 text-green-400 border-green-600/30"
                          : subscription.status === "cancelled"
                          ? "bg-red-600/20 text-red-400 border-red-600/30"
                          : "bg-yellow-600/20 text-yellow-400 border-yellow-600/30"
                      }`}
                    >
                      {subscription.status === "active"
                        ? "Active"
                        : subscription.status === "cancelled"
                        ? "Cancelled"
                        : subscription.status === "completed"
                        ? "Completed"
                        : "Pending"}
                    </span>
                    {subscription.status === "active" && (
                      <button
                        onClick={() => setShowPaymentMethodModal(true)}
                        className="flex items-center px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white/95 hover:bg-white/20 transition-colors"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Change Payment Method
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-[#8abcb9]/10 border border-[#8abcb9]/20 rounded-lg p-4">
                        <h4 className="font-medium text-[#8abcb9] mb-2">
                          Payment Progress
                        </h4>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-white/70">
                            Installments Paid
                          </span>
                          <span className="font-medium text-white/95">
                            {subscription.completed_installments} /{" "}
                            {subscription.total_installments}
                          </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className="bg-[#8abcb9] h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${
                                (subscription.completed_installments /
                                  subscription.total_installments) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-white/60 mt-2">
                          {Math.round(
                            (subscription.completed_installments /
                              subscription.total_installments) *
                              100
                          )}
                          % Complete
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-white/95 mb-3">
                          Payment Schedule
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-white/70">
                              Amount per installment:
                            </span>
                            <span className="font-medium text-white/95">
                              ${calculateInstallmentAmount()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Frequency:</span>
                            <span className="font-medium text-white/95 capitalize">
                              {order?.installment_plan_id?.frequency}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">
                              Remaining installments:
                            </span>
                            <span className="font-medium text-white/95">
                              {subscription.total_installments -
                                subscription.completed_installments}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">
                              Remaining amount:
                            </span>
                            <span className="font-medium text-white/95">
                              ${calculateRemainingAmount()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4">
                        <h4 className="font-medium text-blue-400 mb-2">
                          Next Payment
                        </h4>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-blue-400 mr-2" />
                          <span className="text-white/95">
                            {formatNextBillingDate()}
                          </span>
                        </div>
                        {subscription.next_billing_date && (
                          <p className="text-xs text-white/60 mt-1">
                            Amount: ${calculateInstallmentAmount()}
                          </p>
                        )}
                      </div>

                      <div>
                        <h4 className="font-medium text-white/95 mb-3">
                          Subscription Info
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-white/70">Started:</span>
                            <span className="font-medium text-white/95">
                              {order?.subscription_start_date
                                ? new Date(
                                    order.subscription_start_date
                                  ).toLocaleDateString()
                                : "Not started"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Provider ID:</span>
                            <span className="font-medium text-white/95 text-xs">
                              {subscription.provider_subscription_id.slice(
                                0,
                                12
                              )}
                              ...
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Last updated:</span>
                            <span className="font-medium text-white/95">
                              {new Date(
                                subscription.updated_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {subscription.status === "active" &&
                    subscription.completed_installments <
                      subscription.total_installments && (
                      <div className="mt-4 p-3 bg-green-600/10 border border-green-600/20 rounded-lg">
                        <p className="text-sm text-green-400">
                          Your subscription is active and payments will be
                          automatically processed{" "}
                          {order?.installment_plan_id?.frequency}.
                        </p>
                      </div>
                    )}
                </div>
              )}

            <div className="bg-white/5 border border-white/10 rounded-xl shadow-lg p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white/95">
                  Order Progress
                </h2>
                {order?.status !== "cancelled" &&
                  order?.status !== "completed" && (
                    <button
                      onClick={handleCancelOrder}
                      disabled={cancelling}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors duration-200 font-medium"
                    >
                      {cancelling ? "Cancelling..." : "Cancel Order"}
                    </button>
                  )}
              </div>

              {/* Current Status Info */}
              <div className="bg-[#8abcb9]/10 border border-[#8abcb9]/20 rounded-lg p-4 mb-6 backdrop-blur-sm">
                <h3 className="font-medium text-[#8abcb9] mb-2">
                  {getStatusText(order?.status)}
                </h3>
                <p className="text-sm text-white/85">
                  {getStatusDescription(order?.status)}
                </p>
              </div>

              {/* Status Timeline */}
              {order.total_amount !== order.initial_payment_amount && (
                <div className="space-y-4">
                  {[
                    {
                      status: "pending",
                      label: "Order Created",
                      icon: Package,
                      description: "Your order has been placed",
                    },
                    {
                      status: "kit_paid",
                      label: "Payment Received",
                      icon: CreditCard,
                      description: "Initial payment processed",
                    },
                    {
                      status: "kit_received",
                      label: "Impressions Received",
                      icon: Truck,
                      description: "We received your dental impressions",
                    },
                    {
                      status: "aligner_ready",
                      label: "Aligner Manufacturing Complete",
                      icon: CheckCircle,
                      description: "Your custom aligner is ready",
                    },
                    {
                      status: "subscription_active",
                      label: "Subscription Started",
                      icon: RefreshCw,
                      description: "Monthly payments active",
                    },
                    {
                      status: "completed",
                      label: "Order Completed",
                      icon: CheckCircle,
                      description: "Treatment completed successfully",
                    },
                  ].map((step, index) => {
                    const Icon = step.icon;
                    const statusOrder = [
                      "pending",
                      "kit_paid",
                      "kit_received",
                      "aligner_ready",
                      "subscription_active",
                      "completed",
                    ];
                    const currentIndex = statusOrder.indexOf(order?.status);
                    const stepIndex = statusOrder.indexOf(step.status);

                    const isCompleted = currentIndex >= stepIndex;
                    const isCurrent = order?.status === step.status;
                    const isPending = currentIndex < stepIndex;

                    return (
                      <div key={step.status} className="flex items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            order?.status === "cancelled"
                              ? "bg-red-600/20 text-red-400"
                              : isCompleted
                              ? isCurrent
                                ? "bg-[#8abcb9] text-[#0a0a0a]"
                                : "bg-green-600 text-white"
                              : "bg-white/20 text-white/60"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="ml-4 flex-1">
                          <p
                            className={`font-medium ${
                              order?.status === "cancelled"
                                ? "text-white/60"
                                : isCompleted
                                ? "text-white/95"
                                : "text-white/60"
                            }`}
                          >
                            {step.label}
                          </p>
                          <p
                            className={`text-sm ${
                              order?.status === "cancelled"
                                ? "text-white/50"
                                : isCurrent
                                ? "text-[#8abcb9]"
                                : isCompleted
                                ? "text-white/70"
                                : "text-white/50"
                            }`}
                          >
                            {isCurrent && order?.status !== "cancelled"
                              ? "Current step"
                              : step.description}
                          </p>
                        </div>
                        {isCompleted && order?.status !== "cancelled" && (
                          <div className="text-green-400">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {order.total_amount === order.initial_payment_amount && (
                <div className="space-y-4">
                  {[
                    {
                      status: "pending",
                      label: "Order Created",
                      icon: Package,
                      description: "Your order has been placed",
                    },
                    {
                      status: "full_paid",
                      label: "Full Payment Received",
                      icon: CreditCard,
                      description: "Your all payment has been received",
                    },
                    {
                      status: "kit_received",
                      label: "Impressions Received",
                      icon: Truck,
                      description: "We received your dental impressions",
                    },
                    {
                      status: "aligner_ready",
                      label: "Aligner Manufacturing Complete",
                      icon: CheckCircle,
                      description: "Your custom aligner is ready",
                    },
                    {
                      status: "completed",
                      label: "Order Completed",
                      icon: CheckCircle,
                      description: "Treatment completed successfully",
                    },
                  ].map((step, index) => {
                    const Icon = step.icon;
                    const statusOrder = [
                      "pending",
                      "full_paid",
                      "kit_received",
                      "aligner_ready",
                      "completed",
                    ];
                    const currentIndex = statusOrder.indexOf(order?.status);
                    const stepIndex = statusOrder.indexOf(step.status);

                    const isCompleted = currentIndex >= stepIndex;
                    const isCurrent = order?.status === step.status;
                    const isPending = currentIndex < stepIndex;

                    return (
                      <div key={step.status} className="flex items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            order?.status === "cancelled"
                              ? "bg-red-600/20 text-red-400"
                              : isCompleted
                              ? isCurrent
                                ? "bg-[#8abcb9] text-[#0a0a0a]"
                                : "bg-green-600 text-white"
                              : "bg-white/20 text-white/60"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="ml-4 flex-1">
                          <p
                            className={`font-medium ${
                              order?.status === "cancelled"
                                ? "text-white/60"
                                : isCompleted
                                ? "text-white/95"
                                : "text-white/60"
                            }`}
                          >
                            {step.label}
                          </p>
                          <p
                            className={`text-sm ${
                              order?.status === "cancelled"
                                ? "text-white/50"
                                : isCurrent
                                ? "text-[#8abcb9]"
                                : isCompleted
                                ? "text-white/70"
                                : "text-white/50"
                            }`}
                          >
                            {isCurrent && order?.status !== "cancelled"
                              ? "Current step"
                              : step.description}
                          </p>
                        </div>
                        {isCompleted && order?.status !== "cancelled" && (
                          <div className="text-green-400">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white/5 border border-white/10 rounded-xl shadow-lg p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white/95 mb-4">
                  Order Summary
                </h3>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-white/70">Impression Kit</span>
                    <span className="font-medium text-white/95">
                      ${order?.impression_kit_product_id?.price?.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-white/70">Custom Aligner</span>
                    <span className="font-medium text-white/95">
                      $
                      {order?.total_amount === order?.initial_payment_amount
                        ? (
                            order?.aligner_product_id?.price -
                            (order?.aligner_product_id?.price *
                              order?.aligner_product_id?.discountPrice) /
                              100
                          )?.toFixed(2)
                        : order?.aligner_product_id?.price?.toFixed(2)}
                    </span>
                  </div>

                  <hr className="my-3 border-white/20" />

                  <div className="flex justify-between font-semibold text-lg">
                    <span className="text-white/95">Total</span>
                    <span className="text-white/95">
                      ${order?.total_amount?.toFixed(2)}
                    </span>
                  </div>
                </div>

                {order?.total_amount !== order?.initial_payment_amount && (
                  <div className="bg-[#8abcb9]/10 border border-[#8abcb9]/20 rounded-lg p-4 backdrop-blur-sm">
                    <h4 className="font-medium text-[#8abcb9] mb-2">
                      Payment Plan
                    </h4>
                    <p className="text-sm text-white/85">
                      {order?.installment_plan_id?.num_installments}x{" "}
                      {order?.installment_plan_id?.frequency} payments of $
                      {calculateInstallmentAmount()} each
                    </p>
                    <p className="text-xs text-white/70 mt-1">
                      After ${order?.initial_payment_amount?.toFixed(2)} initial
                      payment
                    </p>
                    {subscription && (
                      <div className="mt-2 pt-2 border-t border-[#8abcb9]/20">
                        <p className="text-xs text-white/70">
                          {subscription.completed_installments} of{" "}
                          {subscription.total_installments} payments completed
                        </p>
                        <p className="text-xs text-[#8abcb9]">
                          ${calculateRemainingAmount()} remaining
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Product Information */}
              <div className="bg-white/5 border border-white/10 rounded-xl shadow-lg p-6 backdrop-blur-sm">
                <h2 className="text-xl font-semibold text-white/95 mb-4">
                  Ordered Products
                </h2>

                <div className="space-y-4">
                  {/* Impression Kit */}
                  <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium text-white/95">
                          {order?.impression_kit_product_id?.name ||
                            "Impression Kit"}
                        </h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white/95">
                        ${order?.impression_kit_product_id?.price?.toFixed(2)}
                      </p>
                      <p className="text-sm text-white/70">One-time</p>
                    </div>
                  </div>

                  {/* Custom Aligner */}
                  <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                        <Truck className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium text-white/95">
                          {order?.aligner_product_id?.name || "Custom Aligner"}
                        </h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white/95">
                        $
                        {order?.total_amount === order?.initial_payment_amount
                          ? (
                              order?.aligner_product_id?.price -
                              (order?.aligner_product_id?.price *
                                order?.aligner_product_id?.discountPrice) /
                                100
                            )?.toFixed(2)
                          : order?.aligner_product_id?.price?.toFixed(2)}
                      </p>
                      {order?.total_amount !== order?.initial_payment_amount ? (
                        <p className="text-sm text-white/70">Subscription</p>
                      ) : (
                        <p className="text-sm text-white/70">Paid</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Information */}
              <div className="bg-white/5 border border-white/10 rounded-xl shadow-lg p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white/95 mb-4">
                  Order Information
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Order ID:</span>
                    <span className="font-medium text-white/95 text-xs">
                      {order?._id}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-white/70">Provider:</span>
                    <span className="font-medium text-white/95 capitalize">
                      {order?.provider}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-white/70">Created:</span>
                    <span className="font-medium text-white/95">
                      {new Date(order?.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {order?.updated_at &&
                    order.updated_at !== order.created_at && (
                      <div className="flex justify-between">
                        <span className="text-white/70">Last Updated:</span>
                        <span className="font-medium text-white/95">
                          {new Date(order?.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                  {order?.subscription_start_date && (
                    <div className="flex justify-between">
                      <span className="text-white/70">
                        Subscription Started:
                      </span>
                      <span className="font-medium text-white/95">
                        {new Date(
                          order?.subscription_start_date
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cancelled Order Notice */}
              {order?.status === "cancelled" && (
                <div className="bg-red-600/20 border border-red-600/30 rounded-xl p-6 backdrop-blur-sm">
                  <div className="flex items-center">
                    <AlertCircle className="w-6 h-6 text-red-400 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-red-400">
                        Order Cancelled
                      </h3>
                      <p className="text-sm text-white/70 mt-1">
                        This order was cancelled on{" "}
                        {new Date(order?.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Payment Method Selection Modal */}
      {showPaymentMethodModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white/95">
                Select Payment Method
              </h2>
              <button
                onClick={() => setShowPaymentMethodModal(false)}
                className="text-white/70 hover:text-white/95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {paymentMethods.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/70 mb-4">
                  No payment methods available. Please add a payment method
                  first.
                </p>
                <button
                  onClick={() => router.push("/payment-methods")}
                  className="bg-[#8abcb9] hover:bg-[#a4cbc8] text-[#0a0a0a] px-4 py-2 rounded-lg font-medium transition-colors flex items-center mx-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment Method
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {paymentMethods.map((method) => (
                  <div
                    key={method.token}
                    className={`flex items-center justify-between p-4 bg-white/5 border ${
                      selectedPaymentMethod === method._id
                        ? "border-[#8abcb9]"
                        : "border-white/10"
                    } rounded-lg cursor-pointer hover:bg-white/10 transition-colors`}
                    onClick={() => setSelectedPaymentMethod(method.token)}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mr-3">
                        <CreditCard className="w-5 h-5 text-white/70" />
                      </div>
                      <div>
                        <p className="font-medium text-white/95 capitalize">
                          {method.provider} •••• {method.last_four}
                        </p>
                        <p className="text-sm text-white/60">
                          {method.address.line1}, {method.address.city}
                        </p>
                      </div>
                    </div>
                    {method._id === order?.payment_method_token && (
                      <Check className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {paymentMethods.length > 0 && (
              <div className="mt-6 flex justify-end space-x-3 text-sm">
                <button
                  onClick={() => {
                    router.push("/profile/paymentmethods");
                    setShowPaymentMethodModal(false);
                  }}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 hover:bg-white/20"
                >
                  Add New Method
                </button>
                <button
                  onClick={() => setShowPaymentMethodModal(false)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleUpdatePaymentMethod(selectedPaymentMethod)
                  }
                  disabled={!selectedPaymentMethod || updatingPaymentMethod}
                  className="px-4 py-2 bg-[#8abcb9] text-[#0a0a0a] rounded-lg hover:bg-[#a4cbc8] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingPaymentMethod
                    ? "Updating..."
                    : "Update Payment Method"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.show}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmCancelOrder}
        onCancel={cancelConfirmModal}
        actionText="Cancel Order"
        type="danger"
      />
    </div>
  );
}
