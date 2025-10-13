import mongoose, { Schema } from "mongoose";
import Order from "./Order";

const PaymentSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  payment_method_token: {
    type: String,
    required: true,
  },
  provider_transaction_id: String,
  invoice_id: String,
  status: {
    type: String,
    enum: ["pending", "succeeded", "failed", "refunded"],
    default: "pending",
  },
  is_initial: {
    type: Boolean,
    default: false,
  },
  installment_number: { type: Number, default: 0 },
  due_date: Date,
  paid_at: Date,
  created_at: {
    type: Date,
    default: Date.now,
  },
});

PaymentSchema.index({ order_id: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ order_id: 1, status: 1 });

export default mongoose.models.Payment ||
  mongoose.model("Payment", PaymentSchema);
