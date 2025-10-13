// app/api/contact/[id]/reply/route.js
import { NextResponse } from 'next/server';
import connectDB from '@lib/mongodb';
import Contact from '@app/models/Contact';
import { sendEmail } from '@lib/nodemailer';

export async function POST(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Reply message is required' },
        { status: 400 }
      );
    }
    
    const contact = await Contact.findById(id);
    
    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }
    
    // Add reply to contact
    contact.replies.push({
      message,
      sentAt: new Date(),
      sentBy: 'admin'
    });
    
    contact.status = 'replied';
    await contact.save();
    
    // Send reply email to user
    const replyEmailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8abcb9;">Reply from HeHe Aligners</h2>
        <p>Dear ${contact.fullName},</p>
        <p>Thank you for your inquiry. Here's our response:</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>${message}</p>
        </div>
        <div style="border-left: 4px solid #8abcb9; padding-left: 20px; margin: 20px 0;">
          <p><strong>Your Original Message:</strong></p>
          <p style="color: #666;">${contact.message}</p>
        </div>
        <p>If you have any further questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>HeHe Aligners Team</p>
      </div>
    `;
    
    await sendEmail({
      to: contact.email,
      subject: 'Reply from HeHe Aligners',
      html: replyEmailTemplate
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Reply sent successfully',
      contact 
    });
    
  } catch (error) {
    console.error('Error sending reply:', error);
    return NextResponse.json(
      { error: 'Failed to send reply' },
      { status: 500 }
    );
  }
}