import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const userId = searchParams.get('userId');

    // Build where clause
    const where: any = {};
    if (userId) where.userId = userId;

    const count = await prisma.order.count({ where });

    return NextResponse.json({
      success: true,
      data: { count }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}