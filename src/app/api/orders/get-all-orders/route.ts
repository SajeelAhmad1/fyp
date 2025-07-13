import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export const dynamic = 'force-dynamic'

// GET request handler: Fetch all orders
export async function GET(request: NextRequest) {
  try {
    // Support filtering by user or guest email
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const guestEmail = url.searchParams.get('guestEmail');

    const orders = await prisma.order.findMany({
      where: userId 
        ? { userId } 
        : guestEmail 
          ? { 
              isGuestOrder: true, 
              guestEmail: guestEmail 
            }
          : {},
      include: {
        user: {
          select: { id: true, email: true },
        },
        items: {
          include: { product: true },
        },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: orders }, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}