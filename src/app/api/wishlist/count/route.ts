// app/api/wishlist/count/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
export const dynamic = 'force-dynamic'
const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get the user session
    const session = await getServerSession();
    
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ count: 0 }, { status: 401 });
    }
    
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { wishlist: { include: { items: true } } }
    });
    
    // If user doesn't exist or doesn't have a wishlist yet
    if (!user || !user.wishlist) {
      return NextResponse.json({ count: 0 });
    }
    
    // Count the number of wishlist items
    const count = user.wishlist.items.length;
    
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching wishlist count:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist count' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}