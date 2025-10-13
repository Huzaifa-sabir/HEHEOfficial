// Create admin user only
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function createAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Hash password
    const saltRounds = 10;
    const adminPassword = await bcrypt.hash('admin123', saltRounds);

    // Delete existing admin if exists
    await mongoose.connection.db.collection('users').deleteOne({ email: 'admin@example.com' });

    // Create admin user directly
    const result = await mongoose.connection.db.collection('users').insertOne({
      fullName: 'Admin User',
      email: 'admin@example.com',
      contactNumber: '0987654321',
      password: adminPassword,
      isVerified: true,
      isAdmin: true,
      otp: null,
      otpGeneratedAt: null,
      OtpAttempts: 0,
      payment_methods: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (result.insertedId) {
      console.log('✅ Admin user created successfully!\n');
      console.log('👑 Admin Credentials:');
      console.log('   Email: admin@example.com');
      console.log('   Password: admin123');
      console.log('   Role: Admin\n');
      console.log('🌐 Login at: http://localhost:3000/login\n');
    } else {
      console.log('❌ Failed to create admin user\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔧 Database connection closed');
  }
}

createAdmin();

