import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate id
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const withComments = searchParams.get('withComments') === 'true';
    
    const skip = (page - 1) * limit;
    
    // First, let's check if the product exists
    const productExists = await prisma.product.findUnique({
      where: { id: id },
      select: { id: true, name: true }
    });
    
    if (!productExists) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Base where condition
    const baseWhereCondition = {
      productId: id.trim()
    };

    // Add comment filter if requested
    const whereCondition = withComments 
      ? {
          ...baseWhereCondition,
          comment: {
            // not: null,
            not: ''
          }
        }
      : baseWhereCondition;
    
    // Get all reviews to calculate rating ranges (always use all reviews for stats)
    const allReviews = await prisma.review.findMany({
      where: baseWhereCondition,
      select: {
        rating: true
      }
    });

    // Calculate total reviews and average rating (from all reviews)
    const totalReviews = allReviews.length;

    const averageRating = await prisma.review.aggregate({
      where: baseWhereCondition,
      _avg: {
        rating: true
      }
    });

    // Create rating distribution object based on ranges
    const ratingDistribution = {
      1: 0, // 1.0 - 1.9
      2: 0, // 2.0 - 2.9
      3: 0, // 3.0 - 3.9
      4: 0, // 4.0 - 4.9
      5: 0  // 5.0
    };

    // Group ratings by ranges
    allReviews.forEach(review => {
      const rating = review.rating;
      if (rating >= 5.0) {
        ratingDistribution[5]++;
      } else if (rating >= 4.0) {
        ratingDistribution[4]++;
      } else if (rating >= 3.0) {
        ratingDistribution[3]++;
      } else if (rating >= 2.0) {
        ratingDistribution[2]++;
      } else if (rating >= 1.0) {
        ratingDistribution[1]++;
      }
    });

    // Calculate percentages
    const ratingPercentages = Object.entries(ratingDistribution).reduce((acc, [rating, count]) => {
      acc[rating as keyof typeof acc] = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
      return acc;
    }, {} as Record<string, number>);
    
    // Get total count for filtered reviews (for pagination)
    const filteredReviewsCount = await prisma.review.count({
      where: whereCondition
    });
    
    // Now get reviews with the appropriate filter
    const reviews = await prisma.review.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            customerProfile: {
              select: {
                firstName: true,
                lastName: true,
                imageUrl: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: skip,
      take: limit
    });
    
    return NextResponse.json({
      reviews,
      ratingStats: {
        totalReviews,
        averageRating: averageRating._avg.rating || 0,
        distribution: ratingDistribution,
        percentages: ratingPercentages
      },
      pagination: {
        page,
        limit,
        total: filteredReviewsCount, // Use filtered count for pagination
        hasMore: skip + limit < filteredReviewsCount
      },
      debug: {
        requestedProductId: id,
        foundReviews: reviews.length,
        totalReviews: totalReviews,
        filteredReviewsCount: filteredReviewsCount,
        withComments: withComments
      }
    });
    
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews', details: error },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}