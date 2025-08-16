import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define route params type
interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/products/[id] - Get a single product
export async function GET(
  _request: NextRequest, 
  { params }: RouteParams
): Promise<NextResponse<any>> {
  try {
    const id = params.id;
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        vendor: {
          select: {
            id: true,
            email: true,
            customerProfile: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                customerProfile: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    });
    
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Calculate average rating
    const ratings = product.reviews.map(review => review.rating);
    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : 0;
    
    const productWithRating = {
      ...product,
      avgRating,
      reviewCount: ratings.length
    };
    
    return NextResponse.json(productWithRating);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// Type for product update
interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  sku?: string;
  images?: string[]; // Always ensure this is a string array
  categoryId?: string;
  vendorId?: string; // Added vendorId for updates
  isFeatured?: boolean;
  discount?: number;
  isBestChoice?: boolean;
  color?: string[];
  size?: string[];
  shortDescription?: string;
  video?: string
}

// PUT /api/products/[id] - Update a product
export async function PUT(
  request: NextRequest, 
  { params }: RouteParams
): Promise<NextResponse<any>> {
  try {
    const id = params.id;
    const body: UpdateProductRequest = await request.json();
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });
    
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Validate images if provided
    if (body.images !== undefined && !Array.isArray(body.images)) {
      return NextResponse.json(
        { error: 'Images must be an array of strings' },
        { status: 400 }
      );
    }
    
    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        price: body.price ? (typeof body.price === 'string' ? parseFloat(body.price) : body.price) : undefined,
        stock: body.stock !== undefined ? body.stock : undefined,
        sku: body.sku,
        images: body.images,
        video: body.video,
        categoryId: body.categoryId,
        vendorId: body.vendorId,
        isFeatured: body.isFeatured,
        discount: body.discount,
        isBestChoice: body.isBestChoice,
        color: body.color,
        size: body.size,
        shortDescription: body.shortDescription
      }
    });
    
    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(
  _request: NextRequest, 
  { params }: RouteParams
): Promise<NextResponse<any>> {
  try {
    const id = params.id;
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });
    
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Delete product
    await prisma.product.delete({
      where: { id }
    });
    
    return NextResponse.json(
      { message: 'Product deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}