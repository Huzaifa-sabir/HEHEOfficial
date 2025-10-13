// Create Test User Script - Run this to add a test user for login testing
// Usage: node scripts/create-test-user.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// User Schema (same as in models/User.js)
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
  customer_id: String,
  last_four: String,
  is_default: {
    type: Boolean,
    default: false,
  },
  address: {
    line1: String,
    city: String,
    state: String,
    postal_code: String,
    country: String,
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
      default: true, // Set to true for test user
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
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

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function createTestUser() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing test users
    console.log('🧹 Clearing existing test users...');
    await User.deleteMany({ email: { $in: ['test@example.com', 'admin@example.com'] } });
    console.log('✅ Cleared existing test users');

    // Hash passwords
    const saltRounds = 10;
    const testUserPassword = await bcrypt.hash('password123', saltRounds);
    const adminPassword = await bcrypt.hash('admin123', saltRounds);

    console.log('👤 Creating test users...');

    // Create regular test user
    const testUser = new User({
      fullName: 'Test User',
      email: 'test@example.com',
      contactNumber: '1234567890',
      password: testUserPassword,
      isVerified: true,
      isAdmin: false,
    });

    // Create admin test user
    const adminUser = new User({
      fullName: 'Admin User',
      email: 'admin@example.com',
      contactNumber: '0987654321',
      password: adminPassword,
      isVerified: true,
      isAdmin: true,
    });

    await testUser.save();
    await adminUser.save();

    console.log('✅ Created test users successfully!');
    console.log('');
    console.log('📧 Test User Credentials:');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');
    console.log('   Role: Regular User');
    console.log('');
    console.log('👑 Admin User Credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    console.log('   Role: Admin User');
    console.log('');
    console.log('🌐 You can now login at: http://localhost:3000/login');
    console.log('');
    console.log('🔧 Database connection closed');

  } catch (error) {
    console.error('❌ Error creating test users:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

createTestUser();

