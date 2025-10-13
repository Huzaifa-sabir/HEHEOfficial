import { NextResponse } from 'next/server';
import connectDB from '@lib/mongodb';
import { verifyPassword, verifyToken } from '@lib/auth';
import User from '@app/models/User';

// GET - Fetch user profile
export async function GET(request) {
  try {
    await connectDB();
    
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' }, 
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' }, 
        { status: 401 }
      );
    }

    // Find user by ID
    const user = await User.findById(decoded.id).select('-password -otp -resetPasswordToken');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request) {
  try {
    await connectDB();
    
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' }, 
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' }, 
        { status: 401 }
      );
    }

    const { fullName, contactNumber } = await request.json();

    // Validate input
    if (!fullName  || !contactNumber) {
      return NextResponse.json(
        { error: 'All fields are required' }, 
        { status: 400 }
      );
    }


    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      {
        fullName: fullName.trim(),
        contactNumber: contactNumber.trim()
      },
      { 
        new: true,
        runValidators: true
      }
    ).select('-password -otp -resetPasswordToken');

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUser, { status: 200 });

  } catch (error) {
    console.error('Profile update error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Invalid input data' }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}


export async function DELETE(request) {
  try {
    await connectDB();
    
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' }, 
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' }, 
        { status: 401 }
      );
    }

    const { password } = await request.json();

    // Validate password is provided
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required to delete account' }, 
        { status: 400 }
      );
    }

    // Find user by ID (include password for verification)
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid password' }, 
        { status: 401 }
      );
    }

    // Delete user account
    await User.findByIdAndDelete(decoded.id);

    return NextResponse.json(
      { message: 'Account deleted successfully' }, 
      { status: 200 }
    );

  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
