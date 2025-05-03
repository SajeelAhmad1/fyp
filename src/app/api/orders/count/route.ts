import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const userId = searchParams.get('userId');
    const guestCartId = searchParams.get('guestCartId');

    const where: any = {};

    if (userId) {
      where.userId = userId;
    } else if (guestCartId) {
      const guestEmail = localStorage.getItem("guestEmail");
      
      where.OR = [
        { guestEmail: guestEmail || undefined },
        { isGuestOrder: true }
      ];
    } else {
      return NextResponse.json({
        success: true,
        count: 0
      });
    }

    const count = await prisma.order.count({ where });

    return NextResponse.json({
      success: true,
      count
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}