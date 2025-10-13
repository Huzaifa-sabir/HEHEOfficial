import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@lib/mongodb';
import { verifyAdminToken } from 'middleware/adminAuth';
import User from '@app/models/User';

export async function POST(request) {
  try {
    // Verify admin privileges
    const adminUser = await verifyAdminToken(request);
    
    await connectDB();
    
    const body = await request.json();
    const { action, userIds } = body;
    
    if (!action || !userIds || !Array.isArray(userIds)) {
      return NextResponse.json({
        success: false,
        message: 'Action and userIds array are required'
      }, { status: 400 });
    }

    // Remove admin's own ID from bulk operations
    const filteredUserIds = userIds.filter(id => id !== adminUser._id.toString());
    
    if (filteredUserIds.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No valid user IDs provided (cannot perform bulk actions on your own account)'
      }, { status: 400 });
    }

    let result;
    
    switch (action) {
      case 'delete':
        result = await User.deleteMany({ _id: { $in: filteredUserIds } });
        break;
        
      case 'verify':
        result = await User.updateMany(
          { _id: { $in: filteredUserIds } }, 
          { isVerified: true, updatedAt: new Date() }
        );
        break;
        
      case 'unverify':
        result = await User.updateMany(
          { _id: { $in: filteredUserIds } }, 
          { isVerified: false, updatedAt: new Date() }
        );
        break;
        
      case 'promote':
        result = await User.updateMany(
          { _id: { $in: filteredUserIds } }, 
          { isAdmin: true, updatedAt: new Date() }
        );
        break;
        
      case 'demote':
        result = await User.updateMany(
          { _id: { $in: filteredUserIds } }, 
          { isAdmin: false, updatedAt: new Date() }
        );
        break;
        
      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action. Supported actions: delete, verify, unverify, promote, demote'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Bulk ${action} operation completed`,
      data: {
        modifiedCount: result.modifiedCount || result.deletedCount,
        requestedCount: filteredUserIds.length
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Bulk operation error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Failed to perform bulk operation' 
    }, { status: 500 });
  }
}
