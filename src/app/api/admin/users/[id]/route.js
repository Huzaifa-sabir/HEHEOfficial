import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import connectDB from '@lib/mongodb';
import User from '@app/models/User';
import { verifyAdminToken } from 'middleware/adminAuth';

export async function PUT(request, { params }) {
  const { id } = await params;
  
  if (!id) {
    return NextResponse.json({ 
      success: false, 
      message: 'User ID is required' 
    }, { status: 400 });
  }

  try {
    // Verify admin privileges
    const adminUser = await verifyAdminToken(request);
    
    await connectDB();

    const body = await request.json();
    const { 
      fullName, 
      email, 
      contactNumber, 
      password, 
      isVerified, 
      isAdmin 
    } = body;

    // Prevent admin from removing their own admin privileges
    if (id === adminUser._id.toString() && isAdmin === false) {
      return NextResponse.json({
        success: false,
        message: 'Cannot remove your own admin privileges'
      }, { status: 400 });
    }

    // Build update object
    const updateData = {};
    
    if (fullName !== undefined) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email.toLowerCase();
    if (contactNumber !== undefined) updateData.contactNumber = contactNumber;
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (isAdmin !== undefined) updateData.isAdmin = isAdmin;
    
    // Hash password if provided
    if (password && password.trim() !== '') {
      const saltRounds = 12;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    updateData.updatedAt = new Date();

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id, 
      updateData, 
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-password -otp -resetPasswordToken');

    if (!updatedUser) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    }, { status: 200 });

  } catch (error) {
    console.error('User update error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email already exists' 
      }, { status: 400 });
    } else if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({ 
        success: false, 
        message: 'Validation error', 
        errors: validationErrors 
      }, { status: 400 });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: error.message || 'Server error' 
      }, { status: 500 });
    }
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ 
      success: false, 
      message: 'User ID is required' 
    }, { status: 400 });
  }

  try {
    // Verify admin privileges
    const adminUser = await verifyAdminToken(request);
    
    await connectDB();
    
    // Prevent admin from deleting their own account
    if (id === adminUser._id.toString()) {
      return NextResponse.json({
        success: false,
        message: 'Cannot delete your own account'
      }, { status: 400 });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
      data: { deletedUserId: id }
    }, { status: 200 });

  } catch (error) {
    console.error('User delete error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Server error' 
    }, { status: 500 });
  }
}
