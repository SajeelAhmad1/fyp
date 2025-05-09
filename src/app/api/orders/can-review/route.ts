import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const productId = searchParams.get('productId')

  if (!userId || !productId) {
    return NextResponse.json(
      { message: 'Missing required parameters' },
      { status: 400 }
    )
  }

  try {
    const deliveredOrders = await prisma.order.findMany({
      where: {
        userId,
        status: 'DELIVERED',
        items: {
          some: {
            productId
          }
        },
        NOT: {
          reviews: {
            some: {
              productId,
              userId
            }
          }
        }
      },
      include: {
        items: {
          where: {
            productId
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const eligibleOrders = deliveredOrders.map(order => ({
      orderId: order.id,
      orderDate: order.createdAt,
      hasReviewed: false,
      canReview: true
    }))

    return NextResponse.json({
      eligibleOrders,
      canReview: eligibleOrders.length > 0
    })
  } catch (error) {
    console.error('Error checking review eligibility:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}