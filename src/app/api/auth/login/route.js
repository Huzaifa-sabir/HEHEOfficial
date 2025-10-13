import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import connectDB from '@lib/mongodb';
import User from '@app/models/User';
import { generateToken } from '@lib/auth';

export async function POST(request) {
  await connectDB();
  
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ 
        error: 'Email and password are required' 
      }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ 
        error: 'Invalid email or password' 
      }, { status: 401 });
    }

    if (!user.isVerified) {
      return NextResponse.json({ 
        error: 'Email not verified. Please verify your email before logging in.' 
      }, { status: 403 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ 
        error: 'Invalid email or password' 
      }, { status: 401 });
    }

    const token = generateToken(user);

    // Create user object without sensitive information
    const userResponse = {
      _id: user._id,
      email: user.email,
      contactNumber: user.contactNumber,
      fullName: user.fullName,
      isVerified: user.isVerified,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      // Add any other user fields you want to include, but exclude password
    };

    // Return response in the format expected by authSlice
    return NextResponse.json({ 
      token, 
      user: userResponse,
      message: 'Login successful'
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      error: 'An error occurred during login. Please try again.' 
    }, { status: 500 });
  }
}