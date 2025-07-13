import { NextRequest, NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';
import prisma from '@/lib/prisma';

// const globalForPrisma = global as unknown as { prisma: PrismaClient };
// export const prisma = globalForPrisma.prisma || new PrismaClient();
// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

type DashboardStatsResponse = {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number | string;
};

export async function GET(request: NextRequest): Promise<NextResponse<DashboardStatsResponse | { error: string }>> {
  try {
    const totalProducts = await prisma.product.count();
    
    const totalOrders = await prisma.order.count();
    
    const revenueResult = await prisma.order.aggregate({
      _sum: {
        totalPrice: true
      }
    });
    
    const totalRevenue = revenueResult._sum.totalPrice 
      ? parseFloat(revenueResult._sum.totalPrice.toString())
      : 0;
    
    console.log('Dashboard stats:', { totalProducts, totalOrders, totalRevenue });
    
    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalRevenue
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error instanceof Error ? error.message : error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}