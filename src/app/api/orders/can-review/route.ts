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
    // Check if user has any delivered orders containing this product
    const deliveredOrders = await prisma.order.findFirst({
      where: {
        userId,
        status: 'DELIVERED',
        items: {
          some: {
            productId
          }
        }
      }
    })

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        productId
      }
    })

    return NextResponse.json({
      canReview: !!deliveredOrders && !existingReview,
      hasReviewed: !!existingReview
    })
  } catch (error) {
    console.error('Error checking review eligibility:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}