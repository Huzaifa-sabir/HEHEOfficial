import User from '@app/models/User';
import connectDB from '@lib/mongodb';
import { verifyAdminToken } from 'middleware/adminAuth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Verify admin privileges
    await verifyAdminToken(request);
    
    await connectDB();
    
    // Get query parameters from URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const isVerified = searchParams.get('isVerified');
    const isAdmin = searchParams.get('isAdmin');
    
    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (isVerified !== null && isVerified !== undefined) {
      filter.isVerified = isVerified === 'true';
    }
    
    if (isAdmin !== null && isAdmin !== undefined) {
      filter.isAdmin = isAdmin === 'true';
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Get users with pagination
    const users = await User.find(filter)
      .select('-password -otp -resetPasswordToken') // Exclude sensitive fields
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination info
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);
    
    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Failed to fetch users' 
    }, { status: 401 });
  }
}
