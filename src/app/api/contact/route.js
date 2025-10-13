// app/api/contact/route.js
import { NextResponse } from 'next/server';
import connectDB from '@lib/mongodb';
import Contact from '@app/models/Contact';
import { sendEmail } from '@lib/nodemailer';

export async function POST(request) {
  try {
    await connectDB();
    
    const { name, email, phone, message } = await request.json();
    
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }
    
    const contact = new Contact({
      fullName: name,
      email,
      phone,
      message
    });
    
    await contact.save();
    
    // Send instant reply email to user
    const userEmailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8abcb9;">Thank you for contacting HeHe Aligners!</h2>
        <p>Dear ${name},</p>
        <p>We have received your message and will get back to you within 24 hours.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Your Message:</h3>
          <p>${message}</p>
        </div>
        <p>Best regards,<br>HeHe Aligners Team</p>
      </div>
    `;
    
    await sendEmail({
      to: email,
      subject: 'Thank you for contacting HeHe Aligners',
      html: userEmailTemplate
    });
    
    // Send notification email to admin
    const adminEmailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8abcb9;">New Contact Form Submission</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        </div>
        <p>Submitted at: ${new Date().toLocaleString()}</p>
      </div>
    `;
    
    await sendEmail({
      to: process.env.EMAIL_USER,
      subject: 'New Contact Form Submission - HeHe Aligners',
      html: adminEmailTemplate
    });
    
    return NextResponse.json({ success: true, message: 'Message sent successfully' });
    
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    
    const contacts = await Contact.find({})
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({ contacts });
    
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}