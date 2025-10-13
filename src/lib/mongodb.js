const mongoose = require('mongoose');

let isConnected = false; // Track connection state

const connectDB = async (retries = 5, delay = 2000) => {
  if (isConnected) {
    console.log('MongoDB already connected');
    return mongoose.connection;
  }

  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {

        maxPoolSize: 10, // Better performance handling
      });

      isConnected = true;
      console.log('✅ MongoDB connected');
      return mongoose.connection;
    } catch (error) {
      console.error(`❌ MongoDB connection failed (attempt ${i + 1}/${retries}):`, error.message);

      if (i < retries - 1) {
        console.log(`🔄 Retrying in ${delay / 1000} seconds...`);
        await new Promise(res => setTimeout(res, delay));
        delay *= 2; // Exponential backoff
      } else {
        console.error('🚨 All connection attempts failed. Exiting.');
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;
