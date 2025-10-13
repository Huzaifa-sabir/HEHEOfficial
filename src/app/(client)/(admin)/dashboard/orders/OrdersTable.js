"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  CreditCard,
  DollarSign,
  Calendar,
  Database,
  RefreshCw,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Edit, // Add this import
  Save, // Add this import
  X, // Add this import
} from "lucide-react";

// Enhanced Card components with dark theme
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm ${className}`}
  >
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`px-6 py-5 border-b border-white/10 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold text-white/95 ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`px-6 py-5 ${className}`}>{children}</div>
);

// Enhanced Button component
const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  icon: Icon,
  loading = false,
}) => {
  const baseClasses =
    "font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  const variantClasses = {
    primary:
      "bg-[#8abcb9] text-[#0a0a0a] hover:bg-[#a4cbc8] focus:ring-[#8abcb9]",
    secondary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    warning:
      "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "bg-transparent text-white/85 hover:bg-white/5 focus:ring-white/20",
    sync: "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      ) : (
        Icon && <Icon size={16} />
      )}
      {children}
    </button>
  );
};

// Status badge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      color: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
      icon: CheckCircle,
      label: "Pending",
    },
    kit_paid: {
      color: "bg-blue-600/20 text-blue-400 border-blue-600/30",
      icon: CheckCircle,
      label: "Kit Paid",
    },
    full_paid: {
      color: "bg-green-600/20 text-green-400 border-green-600/30",
      icon: CheckCircle,
      label: "Full Paid",
    },
    kit_received: {
      color: "bg-purple-600/20 text-purple-400 border-purple-600/30",
      icon: CheckCircle,
      label: "Kit Received",
    },
    aligner_ready: {
      color: "bg-indigo-600/20 text-indigo-400 border-indigo-600/30",
      icon: CheckCircle,
      label: "Aligner Ready",
    },
    subscription_active: {
      color: "bg-[#8abcb9]/20 text-[#8abcb9] border-[#8abcb9]/30",
      icon: CheckCircle,
      label: "Subscription Active",
    },
    completed: {
      color: "bg-emerald-600/20 text-emerald-400 border-emerald-600/30",
      icon: CheckCircle,
      label: "Completed",
    },
    cancelled: {
      color: "bg-red-600/20 text-red-400 border-red-600/30",
      icon: XCircle,
      label: "Cancelled",
    },
    past_due: {
      color: "bg-red-600/20 text-red-400 border-red-600/30",
      icon: XCircle,
      label: "Past Due",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}
    >
      <Icon size={14} />
      {config.label}
    </span>
  );
};

// Helper function to format address
const formatAddress = (address) => {
  if (!address) return null;

  const parts = [];
  if (address.line1) parts.push(address.line1);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.postal_code) parts.push(address.postal_code);
  if (address.country) parts.push(address.country);

  return parts.length > 0 ? parts.join(", ") : null;
};

// Helper functions
const calculateInstallmentAmount = (order) => {
  if (!order.installment_plan_id) return 0;
  const remainingAmount = order.total_amount - order.initial_payment_amount;
  return remainingAmount / order.installment_plan_id.num_installments;
};

const getNextInstallmentDate = (order) => {
  if (!order.subscription || !order.subscription.next_billing_date) return null;
  return new Date(order.subscription.next_billing_date);
};

const getPaymentProgress = (order) => {
  if (!order.subscription || !order.installment_plan_id) {
    return {
      paidInstallments: 0,
      totalInstallments: 0,
      remainingInstallments: 0,
      amountPaid: order.initial_payment_amount || 0,
      amountRemaining:
        (order.total_amount || 0) - (order.initial_payment_amount || 0),
    };
  }

  const paidInstallments = order.subscription.completed_installments || 0;
  const totalInstallments = order.installment_plan_id.num_installments || 0;
  const remainingInstallments = totalInstallments - paidInstallments;
  const installmentAmount = calculateInstallmentAmount(order);
  const amountPaid =
    (order.initial_payment_amount || 0) + paidInstallments * installmentAmount;
  const amountRemaining = (order.total_amount || 0) - amountPaid;

  return {
    paidInstallments,
    totalInstallments,
    remainingInstallments,
    amountPaid,
    amountRemaining,
    installmentAmount,
  };
};

const getNextStatus = (order) => {
  if (order.status === "pending") {
    return "kit_paid";
  } else if (order.status === "kit_paid") {
    return "kit_received";
  } else if (order.status === "full_paid") {
    return "kit_received";
  } else if (order.status === "kit_received") {
    return "aligner_ready";
  } else if (
    order.status === "aligner_ready" &&
    order.total_amount !== order.initial_payment_amount
  ) {
    return "subscription_active";
  } else if (
    order.status === "aligner_ready" &&
    order.total_amount === order.initial_payment_amount
  ) {
    return "completed";
  } else if (order.status === "subscription_active") {
    return "completed";
  }
};

const getNextStatusLabel = (order) => {
  if (order.status === "pending") {
    return "Mark as Kit Paid";
  } else if (order.status === "kit_paid") {
    return "Mark as Kit Received";
  } else if (order.status === "full_paid") {
    return "Mark as Kit Received";
  } else if (order.status === "kit_received") {
    return "Mark as Aligner Ready";
  } else if (
    order.status === "aligner_ready" &&
    order.total_amount !== order.initial_payment_amount
  ) {
    return "Activate Subscription";
  } else if (
    order.status === "aligner_ready" &&
    order.total_amount === order.initial_payment_amount
  ) {
    return "Complete Order";
  } else if (order.status === "subscription_active") {
    return "Complete Order";
  }
};

const canSyncSubscription = (order) => {
  return ["subscription_active", "completed"].includes(order.status);
};

// Pagination component
const Pagination = ({ pagination, onPageChange }) => {
  const { page, pages, total } = pagination;

  if (pages <= 1) return null;

  const getPageNumbers = () => {
    const pages_array = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(pages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages_array.push(i);
    }

    return pages_array;
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
      <div className="text-sm text-white/85">
        Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total}{" "}
        orders
      </div>

      <div className="flex items-center space-x-2">
        <Button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          variant="ghost"
          size="sm"
          icon={ChevronLeft}
        >
          Previous
        </Button>

        {getPageNumbers().map((pageNum) => (
          <Button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            variant={page === pageNum ? "primary" : "ghost"}
            size="sm"
            className="min-w-[40px]"
          >
            {pageNum}
          </Button>
        ))}

        <Button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          variant="ghost"
          size="sm"
          icon={ChevronRightIcon}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export const OrdersTable = ({
  orders,
  updating,
  syncing,
  pagination,
  onUpdateOrderStatus,
  onUpdateOrderNotes,
  onSyncSubscription,
  onSyncPayments,
  onConfirmAction,
  onPageChange,
}) => {
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [editingNotes, setEditingNotes] = useState({});
  const [notesText, setNotesText] = useState({});

  const toggleOrderExpansion = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const startEditingNotes = (orderId, currentNotes) => {
    setEditingNotes((prev) => ({ ...prev, [orderId]: true }));
    setNotesText((prev) => ({ ...prev, [orderId]: currentNotes || "" }));
  };

  const saveNotes = (orderId) => {
    onUpdateOrderNotes(orderId, notesText[orderId] || "");
    setEditingNotes((prev) => ({ ...prev, [orderId]: false }));
  };

  const cancelEditingNotes = (orderId) => {
    setEditingNotes((prev) => ({ ...prev, [orderId]: false }));
    setNotesText((prev) => ({ ...prev, [orderId]: "" }));
  };

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-20">
          <div className="text-white/40 mb-6">
            <svg
              className="mx-auto h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white/85 mb-2">
            No orders found
          </h3>
          <p className="text-white/60">No orders have been created yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-0">
        {orders.map((order) => {
          const isExpanded = expandedOrders.has(order._id);
          const paymentProgress = getPaymentProgress(order);
          const nextInstallmentDate = getNextInstallmentDate(order);
          const formattedAddress = formatAddress(order.address);

          return (
            <div
              key={order._id}
              className="border-b border-white/5 last:border-b-0"
            >
              {/* Order Header - Always Visible */}
              <div
                className="cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => toggleOrderExpansion(order._id)}
              >
                <CardHeader className="border-b-0 p-3 sm:p-4 lg:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown
                            size={20}
                            className="text-white/60 transition-transform"
                          />
                        ) : (
                          <ChevronRight
                            size={20}
                            className="text-white/60 transition-transform"
                          />
                        )}
                        <CardTitle className="text-sm sm:text-base">
                          Order #{order._id.slice(-8)}
                        </CardTitle>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={order.status} />

                        {/* Payment Progress Indicator */}
                        {order.subscription && (
                          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 bg-[#8abcb9]/10 border border-[#8abcb9]/30 rounded-full text-xs sm:text-sm">
                            <CreditCard
                              size={12}
                              className="text-[#8abcb9] sm:w-4 sm:h-4"
                            />
                            <span className="text-[#8abcb9] font-medium">
                              {paymentProgress.paidInstallments}/
                              {paymentProgress.totalInstallments} paid
                            </span>
                          </div>
                        )}
                        {order.total_amount ===
                          order.initial_payment_amount && (
                          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 bg-[#8abcb9]/10 border border-[#8abcb9]/30 rounded-full text-xs sm:text-sm">
                            <span className="text-[#8abcb9] font-medium text-nowrap">
                              Instant paid
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-white/85">
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail
                          size={12}
                          className="text-white/60 flex-shrink-0 sm:w-4 sm:h-4"
                        />
                        <span className="text-white/70 truncate">
                          {order.user_id?.email || "N/A"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between sm:justify-start sm:gap-4 lg:gap-6">
                        <div className="flex items-center gap-2">
                          <DollarSign
                            size={12}
                            className="text-white/60 flex-shrink-0 sm:w-4 sm:h-4"
                          />
                          <span className="font-semibold text-[#8abcb9]">
                            ${order.total_amount?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar
                            size={12}
                            className="text-white/60 flex-shrink-0 sm:w-4 sm:h-4"
                          />
                          <span className="text-xs sm:text-sm">
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
                  {/* Customer Information */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-white/95 flex items-center gap-2 text-sm sm:text-base">
                        <User size={14} className="sm:w-4 sm:h-4" />
                        Customer Details
                      </h4>
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <User
                            size={12}
                            className="text-white/60 flex-shrink-0 sm:w-4 sm:h-4"
                          />
                          <span className="text-white/85">Name:</span>
                          <span className="font-medium text-white truncate">
                            {order.user_id?.fullName || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <Mail
                            size={12}
                            className="text-white/60 flex-shrink-0 sm:w-4 sm:h-4"
                          />
                          <span className="text-white/85">Email:</span>
                          <span className="font-medium text-white truncate">
                            {order.user_id?.email || "N/A"}
                          </span>
                        </div>
                        {order.user_id?.phone && (
                          <div className="flex items-center gap-2">
                            <Phone
                              size={12}
                              className="text-white/60 flex-shrink-0 sm:w-4 sm:h-4"
                            />
                            <span className="text-white/85">Phone:</span>
                            <span className="font-medium text-white">
                              {order.user_id.phone}
                            </span>
                          </div>
                        )}
                        {formattedAddress && (
                          <div className="flex items-start gap-2">
                            <MapPin
                              size={12}
                              className="text-white/60 flex-shrink-0 mt-0.5 sm:w-4 sm:h-4"
                            />
                            <span className="text-white/85">Address:</span>
                            <span className="font-medium text-white text-xs sm:text-sm leading-relaxed">
                              {formattedAddress}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 text-white/95 flex items-center gap-2 text-sm sm:text-base">
                        <Package size={14} className="sm:w-4 sm:h-4" />
                        Order Information
                      </h4>
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className="text-white/85">Order ID:</span>
                          <span className="font-mono text-[#8abcb9] text-xs break-all">
                            {order._id}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white/85">Provider:</span>
                          <span className="font-medium text-white capitalize">
                            {order.provider}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className="text-white/85">Created:</span>
                          <span className="font-medium text-white text-xs">
                            {new Date(order.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className="text-white/85">Last Updated:</span>
                          <span className="font-medium text-white text-xs">
                            {new Date(order.updated_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Products */}
                  <div>
                    <h4 className="font-semibold mb-4 text-white/95 flex items-center gap-2 text-sm sm:text-base">
                      <Package size={14} className="sm:w-4 sm:h-4" />
                      Products
                    </h4>
                    <div className="flex flex-col sm:grid sm:grid-cols-2 lg:flex lg:flex-row gap-3 sm:gap-4">
                      <div className="flex justify-between items-center p-3 sm:p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                        <div className="space-y-2 w-full">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <span className="font-medium text-white/95 text-sm">
                              {order.impression_kit_product_id?.name ||
                                "Impression Kit"}
                            </span>
                            <span className="font-semibold text-white/95 text-base sm:text-lg">
                              $
                              {order.impression_kit_product_id?.price?.toFixed(
                                2
                              ) || "50.00"}
                            </span>
                          </div>

                          <div>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                order.status !== "pending"
                                  ? "bg-emerald-600/20 text-emerald-400"
                                  : "bg-yellow-600/20 text-yellow-400"
                              }`}
                            >
                              {order.status !== "pending" ? "PAID" : "PENDING"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-3 sm:p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                        <div className="space-y-2 w-full">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <span className="font-medium text-white/95 text-sm">
                              {order.aligner_product_id?.name || "Aligner"}
                            </span>
                            <span className="font-semibold text-white/95 text-base sm:text-lg">
                              $
                              {order.installment_plan_id.frequency === "instant"
                                ? (
                                    order.aligner_product_id?.price -
                                    (order.aligner_product_id?.price *
                                      order.aligner_product_id?.discountPrice) /
                                      100
                                  ).toFixed(2)
                                : order.aligner_product_id?.price?.toFixed(2)}
                            </span>
                          </div>

                          <div>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                order.status === "completed"
                                  ? "bg-emerald-600/20 text-emerald-400"
                                  : order.status === "subscription_active"
                                  ? "bg-[#8abcb9]/20 text-[#8abcb9]"
                                  : "bg-emerald-600/20 text-emerald-400"
                              }`}
                            >
                              {order.status === "completed" ||
                              order.initial_payment_amount ===
                                order.total_amount
                                ? "PAID"
                                : order.status === "subscription_active"
                                ? "ACTIVE SUBSCRIPTION"
                                : "INSTALLMENTS"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-3 sm:p-4 bg-white/[0.02] border border-white/5 rounded-lg lg:min-w-0 lg:flex-1">
                        <div className="space-y-2 w-full">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <span className="font-medium text-white/95 text-sm">
                              Total
                            </span>
                            <span className="font-semibold text-white/95 text-base sm:text-lg">
                              $
                              {order.installment_plan_id.frequency === "instant"
                                ? (
                                    order.aligner_product_id?.price -
                                    (order.aligner_product_id?.price *
                                      order.aligner_product_id?.discountPrice) /
                                      100 +
                                    order.impression_kit_product_id?.price
                                  ).toFixed(2)
                                : (
                                    order.aligner_product_id?.price +
                                    order.impression_kit_product_id?.price
                                  ).toFixed(2)}
                            </span>
                          </div>

                          <div>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                order.status === "completed"
                                  ? "bg-emerald-600/20 text-emerald-400"
                                  : order.status === "subscription_active"
                                  ? "bg-[#8abcb9]/20 text-[#8abcb9]"
                                  : "bg-emerald-600/20 text-emerald-400"
                              }`}
                            >
                              {order.status === "completed" ||
                              order.initial_payment_amount ===
                                order.total_amount
                                ? "PAID"
                                : order.status === "subscription_active"
                                ? "ACTIVE SUBSCRIPTION"
                                : "INSTALLMENTS"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Plan */}
                  {order.installment_plan_id &&
                    order.installment_plan_id.frequency !== "instant" && (
                      <div>
                        <h4 className="font-semibold mb-3 text-white/95 flex items-center gap-2 text-sm sm:text-base">
                          <CreditCard size={14} className="sm:w-4 sm:h-4" />
                          Payment Plan & Progress
                        </h4>
                        <div
                          className={`p-3 sm:p-4 rounded-lg border ${
                            order.status === "subscription_active"
                              ? "bg-[#8abcb9]/10 border-[#8abcb9]/30"
                              : "bg-white/[0.02] border-white/10"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                            <div>
                              <p className="font-medium text-white/95 text-sm sm:text-base">
                                {order.installment_plan_id.description}
                              </p>
                              <p className="text-xs sm:text-sm text-white/70 mt-1">
                                {order.installment_plan_id.num_installments}{" "}
                                {order.installment_plan_id.frequency} payments
                                of $
                                {paymentProgress.installmentAmount?.toFixed(
                                  2
                                ) ||
                                  (
                                    order.aligner_product_id.price /
                                    order.installment_plan_id.num_installments
                                  ).toFixed(2)}{" "}
                                each
                              </p>
                            </div>
                            {order.status === "subscription_active" && (
                              <span className="px-3 py-1 text-xs bg-[#8abcb9]/20 text-[#8abcb9] rounded-full font-medium">
                                ACTIVE
                              </span>
                            )}
                          </div>

                          {/* Payment Progress Bar */}
                          {order.subscription && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs sm:text-sm text-white/85">
                                  Payment Progress
                                </span>
                                <span className="text-xs sm:text-sm text-[#8abcb9] font-medium">
                                  {paymentProgress.paidInstallments} of{" "}
                                  {paymentProgress.totalInstallments} completed
                                </span>
                              </div>
                              <div className="w-full bg-white/10 rounded-full h-2">
                                <div
                                  className="bg-[#8abcb9] h-2 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${
                                      (paymentProgress.paidInstallments /
                                        paymentProgress.totalInstallments) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {/* Plan Details */}
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm mb-4">
                            <div>
                              <span className="text-white/60">Frequency:</span>
                              <p className="font-medium text-white capitalize">
                                {order.installment_plan_id.frequency}
                              </p>
                            </div>
                            <div>
                              <span className="text-white/60">
                                Total Installments:
                              </span>
                              <p className="font-medium text-white">
                                {paymentProgress.totalInstallments ||
                                  order.installment_plan_id.num_installments}
                              </p>
                            </div>
                            <div>
                              <span className="text-white/60">
                                Per Payment:
                              </span>
                              <p className="font-medium text-[#8abcb9]">
                                $
                                {paymentProgress.installmentAmount?.toFixed(
                                  2
                                ) ||
                                  order.aligner_product_id.price /
                                    order.installment_plan_id.num_installments}
                              </p>
                            </div>
                            <div>
                              <span className="text-white/60">Remaining:</span>
                              <p className="font-medium text-yellow-400">
                                {paymentProgress.remainingInstallments ||
                                  order.installment_plan_id.num_installments}
                              </p>
                            </div>
                          </div>

                          {/* Next Payment Info */}
                          {nextInstallmentDate &&
                            order.status === "subscription_active" && (
                              <div className="pt-3 border-t border-white/10">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs sm:text-sm text-white/85">
                                    Next Payment:
                                  </span>
                                  <div className="text-right">
                                    <p className="text-xs sm:text-sm font-medium text-[#8abcb9]">
                                      $
                                      {paymentProgress.installmentAmount?.toFixed(
                                        2
                                      ) || "0.00"}
                                    </p>
                                    <p className="text-xs text-white/70">
                                      {nextInstallmentDate.toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    )}

                  {/* Payment Summary */}
                  <div>
                    <h4 className="font-semibold mb-3 text-white/95 flex items-center gap-2 text-sm sm:text-base">
                      <DollarSign size={14} className="sm:w-4 sm:h-4" />
                      Payment Summary
                    </h4>
                    <div className="bg-white/[0.02] border border-white/10 p-3 sm:p-4 rounded-lg space-y-3">
                      <div className="flex justify-between text-white/85 text-xs sm:text-sm">
                        <span>Initial Payment:</span>
                        <span className="font-medium">
                          ${order.initial_payment_amount?.toFixed(2) || "0.00"}
                        </span>
                      </div>

                      {order.subscription && (
                        <>
                          <div className="flex justify-between text-white/85 text-xs sm:text-sm">
                            <span>Installments Paid:</span>
                            <span className="font-medium text-[#8abcb9]">
                              $
                              {(
                                paymentProgress.paidInstallments *
                                (paymentProgress.installmentAmount || 0)
                              ).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-white/85 text-xs sm:text-sm">
                            <span>Total Paid:</span>
                            <span className="font-medium text-emerald-400">
                              $
                              {paymentProgress.amountPaid?.toFixed(2) || "0.00"}
                            </span>
                          </div>
                          <div className="flex justify-between text-white/85 text-xs sm:text-sm">
                            <span>Remaining Amount:</span>
                            <span className="font-medium text-yellow-400">
                              $
                              {paymentProgress.amountRemaining?.toFixed(2) ||
                                "0.00"}
                            </span>
                          </div>
                        </>
                      )}

                      {!order.subscription && (
                        <div className="flex justify-between text-white/85 text-xs sm:text-sm">
                          <span>Remaining Amount:</span>
                          <span className="font-medium">
                            $
                            {(
                              (order.total_amount || 0) -
                              (order.initial_payment_amount || 0)
                            ).toFixed(2)}
                          </span>
                        </div>
                      )}

                      <div className="border-t border-white/10 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-white/95 text-sm sm:text-lg">
                            Total Amount:
                          </span>
                          <span className="font-bold text-lg sm:text-xl text-[#8abcb9]">
                            ${order.total_amount?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Details */}
                  {order.subscription && (
                    <div>
                      <h4 className="font-semibold mb-3 text-white/95 flex items-center gap-2 text-sm sm:text-base">
                        <Database size={14} className="sm:w-4 sm:h-4" />
                        Subscription Details
                      </h4>
                      <div className="bg-[#8abcb9]/5 border border-[#8abcb9]/20 p-3 sm:p-4 rounded-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                            <span className="text-white/60">
                              Subscription ID:
                            </span>
                            <p className="font-mono text-xs text-[#8abcb9] break-all">
                              {order.subscription.provider_subscription_id}
                            </p>
                          </div>
                          <div>
                            <span className="text-white/60">Status:</span>
                            <p className="font-medium text-white capitalize">
                              {order.subscription.status}
                            </p>
                          </div>
                          <div>
                            <span className="text-white/60">Started:</span>
                            <p className="font-medium text-white">
                              {order.subscription_start_date
                                ? new Date(
                                    order.subscription_start_date
                                  ).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                          {nextInstallmentDate && (
                            <div>
                              <span className="text-white/60">
                                Next Billing:
                              </span>
                              <p className="font-medium text-[#8abcb9]">
                                {nextInstallmentDate.toLocaleDateString()}
                              </p>
                            </div>
                          )}
                          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                            <span className="text-white/60">Last Updated:</span>
                            <p className="font-medium text-white text-xs">
                              {new Date(
                                order.subscription.updated_at
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes Section */}
                  <div>
                    <h4 className="font-semibold mb-3 text-white/95 flex items-center gap-2 text-sm sm:text-base">
                      <Edit size={14} className="sm:w-4 sm:h-4" />
                      Notes
                    </h4>
                    <div className="bg-white/[0.02] border border-white/10 p-3 sm:p-4 rounded-lg">
                      {editingNotes[order._id] ? (
                        <div className="space-y-3">
                          <textarea
                            value={notesText[order._id] || ""}
                            onChange={(e) =>
                              setNotesText((prev) => ({
                                ...prev,
                                [order._id]: e.target.value,
                              }))
                            }
                            placeholder="Add notes about this order..."
                            className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white/95 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#8abcb9] focus:border-transparent resize-none text-sm"
                            rows="4"
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => saveNotes(order._id)}
                              variant="primary"
                              size="sm"
                              disabled={updating[`${order._id}_notes`]}
                              loading={updating[`${order._id}_notes`]}
                              icon={Save}
                              className="w-auto"
                            >
                              Save Notes
                            </Button>
                            <Button
                              onClick={() => cancelEditingNotes(order._id)}
                              variant="ghost"
                              size="sm"
                              icon={X}
                              className="w-auto"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="min-h-[60px] p-3 bg-white/[0.02] border border-white/5 rounded text-sm text-white/85">
                            {order.notes ? (
                              <p className="whitespace-pre-wrap">
                                {order.notes}
                              </p>
                            ) : (
                              <p className="text-white/50 italic">
                                No notes added yet
                              </p>
                            )}
                          </div>
                          <Button
                            onClick={() =>
                              startEditingNotes(order._id, order.notes)
                            }
                            variant="ghost"
                            size="sm"
                            icon={Edit}
                            className="w-auto"
                          >
                            {order.notes ? "Edit Notes" : "Add Notes"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                      {getNextStatus(order) && (
                        <Button
                          onClick={() =>
                            onUpdateOrderStatus(order._id, getNextStatus(order))
                          }
                          variant="primary"
                          disabled={updating[order._id]}
                          loading={updating[order._id]}
                          icon={CheckCircle}
                          className="w-full sm:w-auto"
                        >
                          {getNextStatusLabel(order)}
                        </Button>
                      )}
                      {order.status !== "completed" &&
                        order.status !== "cancelled" && (
                          <Button
                            onClick={() =>
                              onConfirmAction(
                                order._id,
                                "cancel",
                                "Cancel Order",
                                "Are you sure you want to cancel this order? This action cannot be undone and will notify the customer.",
                                "Yes, Cancel"
                              )
                            }
                            variant="danger"
                            disabled={updating[order._id]}
                            icon={XCircle}
                            className="w-full sm:w-auto"
                          >
                            Cancel Order
                          </Button>
                        )}
                    </div>

                    {/* Stripe Sync Actions */}
                    {canSyncSubscription(order) && (
                      <div className="pt-3 border-t border-white/5">
                        <h5 className="text-xs sm:text-sm font-medium text-white/85 mb-3 flex items-center gap-2">
                          <Database size={12} className="sm:w-4 sm:h-4" />
                          Stripe Management
                        </h5>
                        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                          <Button
                            onClick={() => onSyncSubscription(order._id)}
                            variant="secondary"
                            size="sm"
                            disabled={syncing[order._id]}
                            loading={syncing[order._id]}
                            icon={RefreshCw}
                            className="w-full sm:w-auto"
                          >
                            Sync Subscription
                          </Button>
                          <Button
                            onClick={() => onSyncPayments(order._id)}
                            variant="secondary"
                            size="sm"
                            disabled={syncing[`${order._id}_payments`]}
                            loading={syncing[`${order._id}_payments`]}
                            icon={DollarSign}
                            className="w-full sm:w-auto"
                          >
                            Sync Payments
                          </Button>
                        </div>
                      </div>
                    )}

                    {(updating[order._id] ||
                      syncing[order._id] ||
                      syncing[`${order._id}_payments`]) && (
                      <div className="flex items-center gap-2 text-[#8abcb9] text-xs sm:text-sm pt-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#8abcb9] border-t-transparent"></div>
                        Processing...
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </div>
          );
        })}
      </div>

      <Pagination pagination={pagination} onPageChange={onPageChange} />
    </Card>
  );
};
