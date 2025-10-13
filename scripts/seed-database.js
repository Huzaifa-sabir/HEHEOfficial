// Database Seeding Script - Run this to populate your database with sample data
// Usage: node scripts/seed-database.js

require('dotenv').config();
const mongoose = require('mongoose');

// Define schemas inline
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  discountPrice: { type: Number, default: 0 },
  type: {
    type: String,
    enum: ["impression-kit", "aligners"],
    required: true,
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const InstallmentPlanSchema = new mongoose.Schema({
  frequency: {
    type: String,
    enum: ['weekly', 'monthly', 'instant'],
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

InstallmentPlanSchema.index({ frequency: 1, num_installments: 1 }, { unique: true });

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
const InstallmentPlan = mongoose.models.InstallmentPlan || mongoose.model("InstallmentPlan", InstallmentPlanSchema);

// Sample data
const products = [
  {
    name: "Impression Kit",
    description: "Professional dental impression kit shipped to your door. Includes everything you need to create accurate dental molds.",
    price: 5.00,
    discountPrice: 0,
    type: "impression-kit",
    isActive: true
  },
  {
    name: "Custom Clear Aligners",
    description: "Personalized clear aligners crafted specifically for your smile. FDA-approved materials, precision-manufactured.",
    price: 1800.00,
    discountPrice: 10, // 10% discount for instant payment
    type: "aligners",
    isActive: true
  }
];

const installmentPlans = [
  {
    frequency: "instant",
    num_installments: 0,
    description: "Pay in Full (Save 10%)"
  },
  {
    frequency: "monthly",
    num_installments: 3,
    description: "3 Monthly Payments"
  },
  {
    frequency: "monthly",
    num_installments: 6,
    description: "6 Monthly Payments"
  },
  {
    frequency: "weekly",
    num_installments: 4,
    description: "4 Weekly Payments"
  }
];

async function seedDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Product.deleteMany({});
    await InstallmentPlan.deleteMany({});
    console.log('✅ Cleared existing data\n');

    // Insert products
    console.log('📦 Inserting products...');
    const insertedProducts = await Product.insertMany(products);
    console.log(`✅ Inserted ${insertedProducts.length} products:`);
    insertedProducts.forEach(p => {
      console.log(`   - ${p.name}: $${p.price} (${p.type})`);
    });
    console.log('');

    // Insert installment plans
    console.log('💳 Inserting installment plans...');
    const insertedPlans = await InstallmentPlan.insertMany(installmentPlans);
    console.log(`✅ Inserted ${insertedPlans.length} installment plans:`);
    insertedPlans.forEach(plan => {
      console.log(`   - ${plan.description}`);
    });
    console.log('');

    // Summary
    console.log('🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Products: ${insertedProducts.length}`);
    console.log(`   Installment Plans: ${insertedPlans.length}`);
    console.log('\n🚀 Your database is now ready to use!');
    console.log('\n🌐 Test the APIs:');
    console.log('   GET http://localhost:3000/api/products');
    console.log('   GET http://localhost:3000/api/installment-plans');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the seeder
seedDatabase();
