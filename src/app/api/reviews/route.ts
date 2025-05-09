import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { userId, productId, rating, comment, orderId } = await request.json()

    if (!userId || !productId || !rating || !orderId) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify the order exists, is delivered, and contains the product
    const validOrder = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
        status: 'DELIVERED',
        items: {
          some: {
            productId
          }
        }
      },
      include: {
        items: true
      }
    })

    if (!validOrder) {
      return NextResponse.json(
        { message: 'No valid delivered order found for this product' },
        { status: 403 }
      )
    }

    // Check if user already reviewed this product for this specific order
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        productId,
        orderId
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { message: 'You have already reviewed this product for this order' },
        { status: 400 }
      )
    }

    // Create the review with order reference
    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        orderId,
        rating: Number(rating),
        comment
      }
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}