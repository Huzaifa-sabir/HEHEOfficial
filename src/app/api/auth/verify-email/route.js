import { NextResponse } from 'next/server';
import User from '@app/models/User';
import connectDB from '@lib/mongodb';

export async function POST(request) {
  await connectDB();
  const { email, otp } = await request.json();

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    user.isVerified = true;
    user.otp = null;
    await user.save();

    return NextResponse.json({ message: 'Email verified' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}