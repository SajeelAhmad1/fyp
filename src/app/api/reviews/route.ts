import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
) {
  try {
    const { 
      productId, 
      rating, 
      comment, 
      email, 
      firstName, 
      lastName, 
      images = [],
      profileImage = null,
      creationDate = null
    } = await request.json();

    const userExists = await prisma.user.findFirst({
        where: { email }
    })
    const user = userExists || await prisma.user.create({
      data: {
        email,
        role: "CUSTOMER",
        isAdmin: false,
        verified: true,
        isPasswordSet: true,
        password: "hashed_password",
        isProfileComplete: true,
        loginType: "EMAIL",
      },
    });

    const userId = user.id;

    // Create customer profile with optional image
    const customerProfile = await prisma.customerProfile.create({
      data: {
        user: { connect: { id: user.id } },
        firstName,
        lastName,
        ...(profileImage && { imageUrl: profileImage }),
      },
    });

    // Create review with decimal rating and user-specified creation date
    const review = await prisma.review.create({
      data: {
        rating: parseFloat(rating.toString()), // Support decimal ratings like 4.1, 4.2
        comment,
        images: images,
        createdAt: creationDate ? new Date(creationDate) : new Date(), // Use user date or current date
        user: { connect: { id: userId } },
        product: { connect: { id: productId } },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        review: {
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          images: review.images,
          createdAt: review.createdAt,
        },
        user: {
          id: user.id,
          email: user.email,
        },
        customerProfile: {
          id: customerProfile.id,
          firstName: customerProfile.firstName,
          lastName: customerProfile.lastName,
          image: customerProfile.imageUrl,
        }
      }
    });
  } catch (error) {
    console.error('Error posting review:', error);
    return NextResponse.json(
      { error: 'Failed to post review', details: error },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}