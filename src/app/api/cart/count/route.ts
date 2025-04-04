// app/api/cart/count/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    const { searchParams } = new URL(req.url);
    const guestCartId = searchParams.get('guestCartId');
    
    // Return zero if no way to identify a cart
    if (!session?.user?.id && !guestCartId) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }
    
    let cart;
    
    // Find user cart by userId
    if (session?.user?.id) {
      cart = await prisma.cart.findUnique({
        where: { userId: session.user.id },
        include: { items: true }
      });
    }
    // Find guest cart by direct ID
    else if (guestCartId) {
      cart = await prisma.cart.findUnique({
        where: { id: guestCartId },
        include: { items: true }
      });
    }
    
    // Calculate total quantity across all cart items
    const count = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
    
    console.log(`Cart count result: ${count} items`);
    
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching cart count:', error);
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}