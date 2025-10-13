import mongoose, { Schema } from "mongoose";
import Order from "./Order";

const SubscriptionSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
    unique: true,
  },
  provider_subscription_id: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "active", "completed", "cancelled"],
    default: "pending",
  },
  total_installments: {
    type: Number,
    required: true,
    min: 1,
  },
  completed_installments: {
    type: Number,
    default: 0,
    min: 0,
  },
  next_billing_date: Date,
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

SubscriptionSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});


export default mongoose.models.Subscription ||
  mongoose.model("Subscription", SubscriptionSchema);
