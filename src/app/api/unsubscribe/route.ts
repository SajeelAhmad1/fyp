// app/api/unsubscribe/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, token } = body;

    // Validate required fields
    if (!email || !token) {
      return NextResponse.json(
        { message: 'Email and token are required' }, 
        { status: 400 }
      );
    }

    // Find subscriber by email
    const subscriber = await prisma.subscriber.findUnique({
      where: { email }
    });

    // Return error if subscriber not found
    if (!subscriber) {
      return NextResponse.json(
        { message: 'Email not found in our subscription list' }, 
        { status: 404 }
      );
    }

    // Verify token matches
    if (subscriber.token !== token) {
      return NextResponse.json(
        { message: 'Invalid unsubscribe token' }, 
        { status: 403 }
      );
    }

    // Mark as unsubscribed by setting unsubscribeDate
    await prisma.subscriber.update({
      where: { email },
      data: {
        unsubscribeDate: new Date() // Setting this indicates unsubscribed status
      }
    });

    return NextResponse.json(
      { message: 'Successfully unsubscribed' }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { message: 'Server error, please try again' }, 
      { status: 500 }
    );
  }
}