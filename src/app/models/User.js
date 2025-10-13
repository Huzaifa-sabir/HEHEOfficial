const mongoose = require("mongoose");

const PaymentMethodSchema = new mongoose.Schema({
  provider: {
    type: String,
    enum: ["stripe", "paypal"],
    required: true,
  },
  token: {
    type: String,
    require: true,
  },
  customer_id: String, // Stripe customer ID or PayPal customer ID
  last_four: String,
  is_default: {
    type: Boolean,
    default: false,
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
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters long"],
      maxlength: [50, "Full name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
      trim: true,
      minlength: [10, "Contact number must be at least 10 digits"],
      maxlength: [15, "Contact number cannot exceed 15 digits"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },

    otp: {
      type: String,
    },
    otpGeneratedAt: {
      type: Date,
      default: null,
    },
    OtpAttempts: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    // Stripe / Payment
    payment_methods: {
      type: [PaymentMethodSchema],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Update the updatedAt field before saving
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Prevent model re-compilation during development
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
