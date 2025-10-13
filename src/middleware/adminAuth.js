import User from '@app/models/User';
import connectDB from '@lib/mongodb';
import jwt from 'jsonwebtoken';


export async function verifyAdminToken(req) {
  try {
    const token = req.headers.get('Authorization').split(' ')[1].trim();
    if (!token) {
      throw new Error('No token provided');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    await connectDB();
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isAdmin) {
      throw new Error('Access denied. Admin privileges required.');
    }

    return user;
  } catch (error) {
    throw new Error('Invalid token or insufficient privileges');
  }
}

export async function verifyAdminPage(token) {
  try {
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    await connectDB();
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isAdmin) {
      throw new Error('Access denied. Admin privileges required.');
    }

    return user;
  } catch (error) {
    throw new Error('Invalid token or insufficient privileges');
  }
}

