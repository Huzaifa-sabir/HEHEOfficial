import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import connectDB from '@lib/mongodb';
import User from '@app/models/User';
import { sendVerificationEmail } from '@lib/nodemailer';
import { generateToken } from '@lib/auth';



export async function POST(request) {
  
  await connectDB();
  const { fullName, email, contactNumber, password } = await request.json();
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const user = new User({
      fullName,
      email,
      contactNumber,
      password: hashedPassword,
      otp,
    });

    await user.save();
    await sendVerificationEmail(email, otp);

    const token = generateToken(user);

    return NextResponse.json({ token }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}