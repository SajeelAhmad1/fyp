import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
 
// Function to calculate similarity between strings
function calculateSimilarity(str1: string, str2: string): number {
  // Convert both strings to lowercase for case-insensitive comparison
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  // If exact match, return maximum similarity
  if (s1 === s2) return 1;
  
  // If one contains the other completely, high similarity
  if (s1.includes(s2)) return 0.9;
  if (s2.includes(s1)) return 0.9;
  
  // Count matching words
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  
  let matchCount = 0;
  for (const word1 of words1) {
    if (word1.length > 2) { // Only consider words with more than 2 characters
      for (const word2 of words2) {
        if (word2.length > 2 && (word1.includes(word2) || word2.includes(word1))) {
          matchCount++;
          break;
        }
      }
    }
  }
  
  // Return a similarity score based on matching words
  const maxWords = Math.max(words1.length, words2.length);
  return maxWords > 0 ? matchCount / maxWords : 0;
}

// Helper function to calculate discounted price
function calculateDiscountedPrice(price: number, discountPercentage: number): number {
  return price * (1 - discountPercentage / 100);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filters from query params with debug logging
    const search = searchParams.get('search') || '';
    const categoryParam = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const sizeParam = searchParams.get('size') || '';
    const typeParam = searchParams.get('type') || '';
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Convert comma-separated parameter strings to arrays
    const categories = categoryParam ? categoryParam.split(',').filter(Boolean) : [];
    const sizes = sizeParam ? sizeParam.split(',').filter(Boolean) : [];
    const types = typeParam ? typeParam.split(',').filter(Boolean) : [];
    
    console.log('Filter arrays:', { categories, sizes, types });
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build a cleaner where clause
    let whereClause: any = {};
    
    // Filter by category if specified
    if (categories.length > 0) {
      whereClause.categoryId = {
        in: categories
      };
    }
    
    // Add size filter if it exists
    if (sizes.length > 0) {
      whereClause.size = {
        hasSome: sizes
      };
    }
    
    // Handle "type" filter by mapping to appropriate fields in the Product model
    if (types.length > 0) {
      const typeFilters: any[] = [];
      
      // Process each type value and create the appropriate filter
      for (const type of types) {
        switch (type.toLowerCase()) {
          case 'featured':
            typeFilters.push({ isFeatured: true });
            break;
          case 'best':
          case 'bestchoice':
            typeFilters.push({ isBestChoice: true });
            break;
          case 'new':
            // For new products, filter by createdAt in the last 30 days
            typeFilters.push({ 
              createdAt: { 
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
              } 
            });
            break;
          case 'sale':
          case 'discount':
            // For discounted products, filter where discount is greater than 0
            typeFilters.push({ 
              discount: { 
                gt: 0 
              } 
            });
            break;
          case 'topdeal':
          case 'top':
            // For top deals, filter where discount is greater than 30%
            typeFilters.push({ 
              discount: { 
                gte: 30 
              } 
            });
            break;
        }
      }
      
      // Add the type filters to the where clause using OR logic
      if (typeFilters.length > 0) {
        whereClause.OR = typeFilters;
      }
    }
    
    // Execute queries with the where clause
    const [allProducts, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          },
          subcategory: {
            select: {
              id: true,
              name: true
            }
          },
          vendor: {
            select: {
              id: true,
              customerProfile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          reviews: {
            include: {
              user: {
                select: {
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
              createdAt: 'desc' // Most recent reviews first
            }
          }
        },
        orderBy: sort === 'price-asc' || sort === 'price-desc' 
          ? {} // We'll handle price sorting manually after discount calculation
          : sort === 'name-asc' ? { name: 'asc' } 
          : sort === 'name-desc' ? { name: 'desc' }
          : { createdAt: 'desc' }
      }),
      prisma.product.count({
        where: whereClause
      })
    ]);
    
    // Calculate discounted prices and filter by price range
    let processedProducts = allProducts.map(product => {
      const discountedPrice = calculateDiscountedPrice(
        product.price.toNumber(), 
        product.discount?.toNumber() || 0
      );
      
      return {
        ...product,
        originalPrice: product.price.toNumber(),
        discountedPrice
      };
    });
    
    // Apply price filtering based on discounted price
    if (minPrice || maxPrice) {
      processedProducts = processedProducts.filter(product => {
        if (minPrice && product.discountedPrice < parseFloat(minPrice)) {
          return false;
        }
        if (maxPrice && product.discountedPrice > parseFloat(maxPrice)) {
          return false;
        }
        return true;
      });
    }
    
    // Handle search filtering
    if (search && search.trim() !== '') {
      processedProducts = processedProducts.filter(product => {
        const nameMatch = product.name.toLowerCase().includes(search.toLowerCase());
        const shortDescMatch = product.shortDescription?.toLowerCase().includes(search.toLowerCase()) || false;
        const descMatch = product.description?.toLowerCase().includes(search.toLowerCase()) || false;
        
        return nameMatch || shortDescMatch || descMatch;
      });
      
      // Score products by calculated similarity
      processedProducts = processedProducts.map(product => {
        const titleSimilarity = calculateSimilarity(product.name, search) * 3;
        const shortDescSimilarity = calculateSimilarity(product.shortDescription || '', search) * 2;
        const descSimilarity = calculateSimilarity(product.description || '', search);
        
        const overallSimilarity = (titleSimilarity + shortDescSimilarity + descSimilarity) / 6;
        
        return {
          ...product,
          _similarity: overallSimilarity
        };
      });
      
      // Filter out products with very low similarity
      processedProducts = processedProducts.filter(p => (p as any)._similarity > 0.1);
      
      // Sort by similarity if searching with default sort
      if (sort === 'newest') {
        processedProducts.sort((a, b) => (b as any)._similarity - (a as any)._similarity);
      }
    }
    
    // Apply custom price sorting based on discounted price
    if (sort === 'price-asc') {
      processedProducts.sort((a, b) => a.discountedPrice - b.discountedPrice);
    } else if (sort === 'price-desc') {
      processedProducts.sort((a, b) => b.discountedPrice - a.discountedPrice);
    }
    
    // Apply pagination after all filtering and sorting
    const paginatedProducts = processedProducts.slice(skip, skip + limit);
    
    // Calculate average rating and process reviews
    const productsWithRating = paginatedProducts.map(product => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0;
      
      const vendor = product.vendor ? {
        id: product.vendor.id,
        name: product.vendor.customerProfile
          ? `${product.vendor.customerProfile.firstName} ${product.vendor.customerProfile.lastName}`
          : 'Unknown Vendor'
      } : null;
      
      // Process reviews to include reviewer details
      const processedReviews = product.reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        reviewer: {
          firstName: review.user?.customerProfile?.firstName || 'Anonymous',
          lastName: review.user?.customerProfile?.lastName || '',
          profileImage: review.user?.customerProfile?.imageUrl || null
        }
      }));

      return {
        ...product,
        avgRating,
        reviewCount: product.reviews.length,
        reviews: processedReviews, // Include processed reviews
        vendor,
        _similarity: undefined,
      };
    });
    
    // Return response with pagination metadata
    return NextResponse.json({
      products: productsWithRating,
      pagination: {
        total: processedProducts.length,  // Updated total count based on filtered results
        page,
        limit,
        totalPages: Math.ceil(processedProducts.length / limit) || 1
      }
    });
    
  } catch (error) {
    console.error('Error searching products:', error);
    return NextResponse.json(
      { error: 'Failed to search products', details: (error as Error).message },
      { status: 500 }
    );
  }
}