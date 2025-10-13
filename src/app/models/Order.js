// models/Order.js
import mongoose, { Schema } from "mongoose";
import User from "./User";
import Product from "./Product";
import InstallmentPlan from "./InstallmentPlan";

const OrderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  impression_kit_product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  aligner_product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  installment_plan_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstallmentPlan",
    required: true,
  },
  payment_method_token: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    default: "",
  },
  provider: {
    type: String,
    enum: ["stripe", "paypal"],
    required: true,
  },
  status: {
    type: String,
    enum: [
      "pending",
      "kit_paid",
      "full_paid",
      "kit_received",
      "aligner_ready",
      "subscription_active",
      "completed",
      "cancelled",
    ],
    default: "pending",
  },
  total_amount: {
    type: Number,
    required: true,
    min: 0,
  },
  initial_payment_amount: {
    type: Number,
    default: 5.0,
    min: 0,
  },
  address: {
    line1: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    postal_code: {
      type: String,
    },
    country: {
      type: String,
    },
  },
  subscription_start_date: Date,
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

OrderSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
