// app/api/cart/count/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import authOptions from '@/lib/auth-options';
import { getServerSession } from "next-auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const guestCartId = searchParams.get('guestCartId');
    
    // Return zero if no way to identify a cart
    if (!session?.user?.id && !guestCartId) {
      return NextResponse.json({ count: 0 });
    }
    
    let whereCondition = {};
    
    if (session?.user?.id) {
      // For authenticated users
      whereCondition = { userId: session.user.id };
    } else if (guestCartId) {
      // For guest users
      whereCondition = { 
        AND: [
          { id: guestCartId },
          { isGuestCart: true }
        ]
      };
    }
    
    // Find the cart with items
    const cart = await prisma.cart.findFirst({
      where: whereCondition,
      include: { 
        items: {
          select: {
            quantity: true
          }
        }
      }
    });
    
    // Calculate total quantity
    const count = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
    
    return NextResponse.json({ 
      success: true,
      count 
    });
    
  } catch (error) {
    console.error('Error fetching cart count:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch cart count',
        count: 0 
      },
      { status: 500 }
    );
  }
}