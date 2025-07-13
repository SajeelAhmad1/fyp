// app/api/cart/count/route.js

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
export const dynamic = 'force-dynamic'
const prisma = new PrismaClient();

export async function GET() {
  try {
    // Support both session-based and guest cart identification
    const session = await getServerSession();
    const guestCartId = cookies().get('guestCartId')?.value;
    
    if (!session?.user?.email && !guestCartId) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }
    
    // Query for cart based on either user email or guest cart ID
    const cart = await prisma.cart.findFirst({
      where: {
        OR: [
          { user: { email: session?.user?.email } },
          { id: guestCartId }
        ]
      },
      include: { items: true }
    });
    
    const count = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
    
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching cart count:', error);
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}