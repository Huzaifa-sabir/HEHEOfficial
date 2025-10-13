// Fix test users - set isVerified to true
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function fixUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Update test user
    const testResult = await mongoose.connection.db.collection('users').updateOne(
      { email: 'test@example.com' },
      { $set: { isVerified: true } }
    );

    // Update admin user
    const adminResult = await mongoose.connection.db.collection('users').updateOne(
      { email: 'admin@example.com' },
      { $set: { isVerified: true, isAdmin: true } }
    );

    console.log('📝 Update Results:');
    console.log('   Test User:', testResult.matchedCount > 0 ? '✅ UPDATED' : '❌ NOT FOUND');
    console.log('   Admin User:', adminResult.matchedCount > 0 ? '✅ UPDATED' : '❌ NOT FOUND');

    if (testResult.matchedCount === 0 && adminResult.matchedCount === 0) {
      console.log('\n⚠️  No users found! Run: npm run create:admin first\n');
    } else {
      console.log('\n✅ Users fixed! You can now login:\n');
      console.log('   Admin: admin@example.com / admin123');
      console.log('   Test: test@example.com / password123');
      console.log('\n🌐 Login at: http://localhost:3000/login\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔧 Database connection closed');
  }
}

fixUsers();

