// Debug script to check users in database
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  contactNumber: String,
  password: String,
  isVerified: Boolean,
  isAdmin: Boolean,
  createdAt: Date,
  updatedAt: Date,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function debugUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find test users
    const testUser = await User.findOne({ email: 'test@example.com' });
    const adminUser = await User.findOne({ email: 'admin@example.com' });

    console.log('📊 USER STATUS:\n');

    if (testUser) {
      console.log('✅ Test User Found:');
      console.log('   Email:', testUser.email);
      console.log('   Full Name:', testUser.fullName);
      console.log('   Is Verified:', testUser.isVerified);
      console.log('   Is Admin:', testUser.isAdmin);
      console.log('   Password Hash:', testUser.password ? 'EXISTS' : 'MISSING');
      
      // Test password
      const testPassword = await bcrypt.compare('password123', testUser.password);
      console.log('   Password "password123" valid:', testPassword ? '✅ YES' : '❌ NO');
    } else {
      console.log('❌ Test User NOT FOUND');
    }

    console.log('');

    if (adminUser) {
      console.log('✅ Admin User Found:');
      console.log('   Email:', adminUser.email);
      console.log('   Full Name:', adminUser.fullName);
      console.log('   Is Verified:', adminUser.isVerified);
      console.log('   Is Admin:', adminUser.isAdmin);
      console.log('   Password Hash:', adminUser.password ? 'EXISTS' : 'MISSING');
      
      // Test password
      const adminPassword = await bcrypt.compare('admin123', adminUser.password);
      console.log('   Password "admin123" valid:', adminPassword ? '✅ YES' : '❌ NO');
    } else {
      console.log('❌ Admin User NOT FOUND');
    }

    console.log('\n📝 RECOMMENDATIONS:\n');

    if (!testUser || !adminUser) {
      console.log('⚠️  Users missing! Run: npm run create:admin');
    } else if (!testUser.isVerified || !adminUser.isVerified) {
      console.log('⚠️  Users not verified! This will block login.');
    } else {
      console.log('✅ Users look good! Login should work.');
      console.log('\n🔐 Try logging in with:');
      console.log('   Admin: admin@example.com / admin123');
      console.log('   Test: test@example.com / password123');
    }

    console.log('\n🌐 Login URL: http://localhost:3000/login\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔧 Database connection closed');
  }
}

debugUsers();

