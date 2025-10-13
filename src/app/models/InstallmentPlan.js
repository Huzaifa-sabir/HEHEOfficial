// models/InstallmentPlan.js
import mongoose, { Schema } from "mongoose";

const InstallmentPlanSchema = new mongoose.Schema({
  frequency: {
    type: String,
    enum: ['weekly', 'monthly','instant'],
    required: true
  },
  num_installments: {
    type: Number,
    required: true,
    min: 0,
    max: 7
  },
  description: {
    type: String,
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Compound unique index
InstallmentPlanSchema.index({ frequency: 1, num_installments: 1 }, { unique: true });


export default mongoose.models.InstallmentPlan ||
  mongoose.model("InstallmentPlan", InstallmentPlanSchema);
