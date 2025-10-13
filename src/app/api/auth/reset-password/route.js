// app/api/auth/reset-password-with-otp/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import connectDB from '@lib/mongodb';
import User from '@app/models/User';


export async function POST(request) {
  try {
    await connectDB();

    const { email, otp, newPassword, confirmPassword } = await request.json();
    
    if (!email || !otp || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or OTP' },
        { status: 400 }
      );
    }

    // Check if OTP exists and hasn't expired
    if (!user.otp || !user.otpGeneratedAt) {
      return NextResponse.json(
        { error: 'No OTP found. Please request a new one' },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    if (new Date() > user.OtpGeneratedAt) {
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one' },
        { status: 400 }
      );
    }

    // Verify OTP
    const isOtpValid = otp === user.otp;

    if (!isOtpValid) {
      // Increment failed attempts
      user.OtpAttempts = (user.OtpAttempts || 0) + 1;
      await user.save();

      const remainingAttempts = 5 - user.OtpAttempts;
      
      if (remainingAttempts <= 0) {
        return NextResponse.json(
          { error: 'Too many failed attempts. Please request a new OTP after 15 minutes' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: `Invalid OTP. ${remainingAttempts} attempts remaining` },
        { status: 400 }
      );
    }

    // Hash new password
     const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP data
    user.password = hashedPassword;
    user.otp = undefined;
    user.OtpGeneratedAt = undefined;
    user.OtpAttempts = 0;
    user.updatedAt = new Date();

    await user.save();

    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Reset password with OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}