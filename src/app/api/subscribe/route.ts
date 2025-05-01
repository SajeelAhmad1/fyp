// app/api/subscribe/route.ts
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

// Get email credentials from environment variables
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD;

// Function to send subscription confirmation email
async function sendSubscriptionEmail(email: string, token: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_APP_PASSWORD
    }
  });
  
  // Generate secure unsubscribe URL with token and email
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe?token=${token}&email=${encodeURIComponent(email)}`;
  
  await transporter.sendMail({
    from: '"Lyalla and Lora" <sajeelashiq1@gmail.com>',
    to: email,
    subject: "Subscription Confirmation - Lyalla and Lora",
    html: `
      <div>
        <h1>Lyalla and Lora</h1>
        <p>Thank you for subscribing to Lyalla and Lora newsletter!</p>
        <p>Your subscription has been confirmed.</p>
        <p>If you did not request this subscription, you can unsubscribe by clicking the link below:</p>
        <a href="${unsubscribeUrl}">Unsubscribe</a>
        <p>© 2025 Lyalla and Lora. All rights reserved.</p>
      </div>
    `,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { message: 'Valid email is required' }, 
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingSubscriber = await prisma.subscriber.findUnique({
      where: { email }
    });

    // Generate unique token for unsubscribe verification
    const token = uuidv4();

    if (existingSubscriber) {
      // If already subscribed but unsubscribed before (unsubscribeDate is not null)
      if (existingSubscriber.unsubscribeDate) {
        await prisma.subscriber.update({
          where: { email },
          data: {
            token: token, // Update token for security
            unsubscribeDate: null // Set to null to indicate active status
          }
        });
        
        // Send resubscription email with new token
        await sendSubscriptionEmail(email, token);
        
        return NextResponse.json(
          { message: 'Subscription reactivated' }, 
          { status: 200 }
        );
      }
      
      return NextResponse.json(
        { message: 'Email already subscribed' }, 
        { status: 409 }
      );
    }

    // Create new subscriber with token
    await prisma.subscriber.create({
      data: {
        email,
        token
      }
    });

    // Send confirmation email with the token
    await sendSubscriptionEmail(email, token);

    return NextResponse.json(
      { message: 'Subscription successful' }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { message: 'Server error, please try again' }, 
      { status: 500 }
    );
  }
}