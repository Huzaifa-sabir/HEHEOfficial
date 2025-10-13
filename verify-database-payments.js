#!/usr/bin/env node

/**
 * Database Payment Verification Script
 * 
 * This script checks your local database for payment records
 * and order status to verify if payments are being recorded correctly.
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import your models
const Order = require('./src/app/models/Order');
const Payment = require('./src/app/models/Payment');

console.log('🔍 Database Payment Verification Tool');
console.log('=====================================');

async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

async function verifyDatabasePayments() {
  try {
    await connectDB();
    
    console.log('\n📊 Recent Orders:');
    console.log('=================');
    
    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user_id', 'email fullName')
      .populate('impression_kit_product_id', 'name price')
      .populate('aligner_product_id', 'name price')
      .populate('installment_plan_id', 'description frequency')
      .sort({ createdAt: -1 })
      .limit(5);
    
    if (recentOrders.length === 0) {
      console.log('No orders found in database');
      return;
    }
    
    for (const order of recentOrders) {
      console.log(`\n📋 Order ID: ${order._id}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Total Amount: $${order.total_amount}`);
      console.log(`   Initial Payment: $${order.initial_payment_amount}`);
      console.log(`   Created: ${order.createdAt.toLocaleString()}`);
      console.log(`   User: ${order.user_id?.email || 'Unknown'}`);
      console.log(`   Plan: ${order.installment_plan_id?.description || 'Unknown'}`);
      
      // Get payments for this order
      const payments = await Payment.find({ order_id: order._id });
      console.log(`   Payments: ${payments.length} found`);
      
      payments.forEach((payment, index) => {
        console.log(`     ${index + 1}. Amount: $${payment.amount} | Status: ${payment.status} | Provider: ${payment.provider || 'Unknown'}`);
        console.log(`        Transaction ID: ${payment.provider_transaction_id || 'N/A'}`);
        console.log(`        Paid At: ${payment.paid_at ? payment.paid_at.toLocaleString() : 'N/A'}`);
      });
    }
    
    console.log('\n📊 Payment Summary:');
    console.log('===================');
    
    const totalPayments = await Payment.countDocuments();
    const successfulPayments = await Payment.countDocuments({ status: 'succeeded' });
    const totalOrderValue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]);
    const totalPaidValue = await Payment.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    console.log(`Total Orders: ${recentOrders.length}`);
    console.log(`Total Payments: ${totalPayments}`);
    console.log(`Successful Payments: ${successfulPayments}`);
    console.log(`Total Order Value: $${totalOrderValue[0]?.total || 0}`);
    console.log(`Total Paid Value: $${totalPaidValue[0]?.total || 0}`);
    
    console.log('\n✅ Database verification complete');
    
  } catch (error) {
    console.error('❌ Database verification error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run verification
verifyDatabasePayments();
