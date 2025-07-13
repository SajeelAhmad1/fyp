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
  
  await transporter.sendMail({
    from: '"DAILY KART" <sajeelashiq1@gmail.com>',
    to: email,
    subject: "Subscription Confirmation - DAILY KART",
    html: `
      <div>
        <h1>DAILY KART</h1>
        <p>Thank you for subscribing to DAILY KART newsletter!</p>
        <p>Your subscription has been confirmed.</p>
        <p>If you did not request this subscription, you can unsubscribe by clicking the link below:</p>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe?token=${token}">Unsubscribe</a>
        <p>© 2025 DAILY KART. All rights reserved.</p>
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

    const token = uuidv4();

    if (existingSubscriber) {      
      return NextResponse.json(
        { message: 'Email already subscribed' }, 
        { status: 409 }
      );
    }


    // Create new subscriber
    await prisma.subscriber.create({
      data: {
        email
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