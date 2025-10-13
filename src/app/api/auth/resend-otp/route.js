import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@lib/mongodb';
import User from '@app/models/User';
import { sendVerificationEmail } from '@lib/nodemailer';

export async function POST(request) {
  await connectDB();
  
  try {
    const { email } = await request.json();
    
    // Validate email input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' }, 
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }

    // Check if user is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' }, 
        { status: 400 }
      );
    }

    // Generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Update user with new OTP and reset attempt timestamp
    user.otp = newOtp;
    user.otpGeneratedAt = new Date();
    user.otpAttempts = 0;
    
    await user.save();

    // Send verification email with new OTP
    await sendVerificationEmail(email, newOtp);

    return NextResponse.json(
      { 
        success: true,
        message: 'OTP has been resent to your email address' 
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to resend OTP. Please try again.' }, 
      { status: 500 }
    );
  }
}

// Optional: Add rate limiting logic
export async function rateLimit(email) {
  const user = await User.findOne({ email });
  if (!user) return false;

  const now = new Date();
  const lastOtpTime = user.otpGeneratedAt || new Date(0);
  const timeDiff = now - lastOtpTime;
  const oneMinute = 60 * 1000; // 1 minute in milliseconds

  // Allow resend only after 1 minute
  return timeDiff < oneMinute;
}

// Enhanced version with rate limiting
export async function POST_WITH_RATE_LIMIT(request) {
  await connectDB();
  
  try {
    const { email } = await request.json();
    
    // Validate email input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' }, 
        { status: 400 }
      );
    }

    // Check rate limiting
    const isRateLimited = await rateLimit(email);
    if (isRateLimited) {
      return NextResponse.json(
        { error: 'Please wait at least 1 minute before requesting another OTP' }, 
        { status: 429 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }

    // Check if user is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' }, 
        { status: 400 }
      );
    }

    // Generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Update user with new OTP and timestamp
    user.otp = newOtp;
    user.otpGeneratedAt = new Date();
    user.otpAttempts = (user.otpAttempts || 0) + 1; // Track attempts
    await user.save();

    // Send verification email with new OTP
    await sendVerificationEmail(email, newOtp);

    return NextResponse.json(
      { 
        success: true,
        message: 'OTP has been resent to your email address' 
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to resend OTP. Please try again.' }, 
      { status: 500 }
    );
  }
}