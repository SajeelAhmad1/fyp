import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

// Define types for query parameters
type ProductQueryParams = {
  category?: string;
  vendorId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
  limit: number;
  page: number;
  isFeatured: boolean;
  minDiscount: number;
};

// Define type for response
type ProductsResponse = {
  products: Array<any>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

// GET /api/products - Get all products with optional filtering
export async function GET(request: NextRequest): Promise<NextResponse<ProductsResponse | { error: string }>> {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const queryParams: ProductQueryParams = {
      category: searchParams.get('category') || undefined,
      vendorId: searchParams.get('vendorId') || undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      search: searchParams.get('search') || undefined,
      sort: searchParams.get('sort') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      isFeatured: searchParams.get('isFeatured') === 'true',
      minDiscount: searchParams.get('minDiscount') ? parseFloat(searchParams.get('minDiscount')!) : 0,
    };
    
    // Build filter object
    const where: Prisma.ProductWhereInput = {};
    
    if (queryParams.category) {
      where.categoryId = queryParams.category;
    }
    
    if (queryParams.vendorId) {
      where.vendorId = queryParams.vendorId;
    }
    
    // Only apply isFeatured filter if explicitly set to true
    if (queryParams.isFeatured === true) {
      where.isFeatured = true;
    }
    
    if (queryParams.minPrice !== undefined || queryParams.maxPrice !== undefined) {
      where.price = {};
      if (queryParams.minPrice !== undefined) {
        where.price.gte = new Prisma.Decimal(queryParams.minPrice);
      }
      if (queryParams.maxPrice !== undefined) {
        where.price.lte = new Prisma.Decimal(queryParams.maxPrice);
      }
    }
    
    // Add filter for minimum discount
    if (queryParams.minDiscount > 0) {
      where.discount = {
        gte: new Prisma.Decimal(queryParams.minDiscount)
      };
    }
    
    if (queryParams.search) {
      where.OR = [
        { name: { contains: queryParams.search, mode: 'insensitive' } },
        { description: { contains: queryParams.search, mode: 'insensitive' } }
      ];
    }
    
    // Build sort object
    let orderBy: Prisma.ProductOrderByWithRelationInput = {};
    switch (queryParams.sort) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'discount_desc':
        orderBy = { discount: 'desc' };
        break;
      default:
        // Default sorting - highest discount first
        orderBy = { discount: 'desc' };
    }
    
    // Calculate pagination
    const skip = (queryParams.page - 1) * queryParams.limit;
    
    
    // Try a simple query first to test connection
    try {
      const testCount = await prisma.product.count();
    } catch (connectionError) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    // Get products with count
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: queryParams.limit,
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          stock: true,
          sku: true,
          images: true,
          categoryId: true,
          vendorId: true,
          isFeatured: true, 
          discount: true,
          isBestChoice: true,
          color: true,
          size: true,
          shortDescription: true,
          category: true,
          vendor: {
            select: {
              id: true,
              email: true,
              customerProfile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          },          
          reviews: {
            select: {
              rating: true
            }
          }
        }
      }),
      prisma.product.count({ where })
    ]);
    
    // Calculate average rating for each product
    const productsWithRating = products.map(product => {
      const ratings = product.reviews.map(review => review.rating);
      const avgRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : 0;
      
      // Format Decimal fields correctly for JSON response
      return {
        ...product,
        price: parseFloat(product.price.toString()),
        discount: product.discount ? parseFloat(product.discount.toString()) : 0,
        avgRating,
        reviewCount: ratings.length
      };
    });
    
    return NextResponse.json({
      products: productsWithRating,
      pagination: {
        total,
        page: queryParams.page,
        limit: queryParams.limit,
        totalPages: Math.ceil(total / queryParams.limit)
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// Type for product creation
interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  stock?: number;
  sku: string;
  images: string[];
  categoryId: string;
  vendorId?: string;
  isFeatured: boolean;
  isBestChoice: boolean;
  color: string[]; 
  size: string[]; 
  discount: number;
  shortDescription: string;
  shippingCost?: number;
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest): Promise<NextResponse<any>> {
  try {
    const body: CreateProductRequest = await request.json();
    
    // Validate required fields
    const { name, description, price, categoryId, discount, isFeatured, isBestChoice, color, size, shortDescription, sku, images, shippingCost  } = body;
    
    if (!name || !description || price === undefined || !sku || !images || !Array.isArray(images)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    try {
      // Create new product with proper decimal conversion
      const product = await prisma.product.create({
        data: {
          name,
          description,
          price: new Prisma.Decimal(price),
          stock: body.stock || 0,
          sku: sku,
          images: images,
          categoryId,
          isFeatured: !!isFeatured,
          discount: discount !== undefined ? new Prisma.Decimal(discount) : null,
          isBestChoice: !!isBestChoice,
          color: color || [], 
          size: size || [], 
          shortDescription,
          vendorId: body.vendorId,
          shippingCost: shippingCost !== undefined && shippingCost !== null ? new Prisma.Decimal(shippingCost) : null,
        }
      });
      
      // Format Decimal fields for JSON response
      const formattedProduct = {
        ...product,
        price: parseFloat(product.price.toString()),
        discount: product.discount ? parseFloat(product.discount.toString()) : 0,
        shippingCost: product.shippingCost ? parseFloat(product.shippingCost.toString()) : null
      };
      
      return NextResponse.json(formattedProduct, { status: 201 });
    } catch (dbError) {
      return NextResponse.json(
        { error: 'Database error when creating product', details: dbError instanceof Error ? dbError.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}