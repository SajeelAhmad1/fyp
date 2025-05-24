import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

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
              },
            },
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                customerProfile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Calculate average rating
    const ratings = product.reviews.map((review) => review.rating);
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0;

    const productWithRating = {
      ...product,
      avgRating,
      reviewCount: ratings.length,
    };

    return NextResponse.json(productWithRating);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
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
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Validate images if provided
    if (body.images !== undefined && !Array.isArray(body.images)) {
      return NextResponse.json(
        { error: "Images must be an array of strings" },
        { status: 400 }
      );
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        price: body.price
          ? typeof body.price === "string"
            ? parseFloat(body.price)
            : body.price
          : undefined,
        stock: body.stock !== undefined ? body.stock : undefined,
        sku: body.sku,
        images: body.images, // Will be properly validated as string[]
        categoryId: body.categoryId,
        vendorId: body.vendorId,
        isFeatured: body.isFeatured,
        discount: body.discount,
        isBestChoice: body.isBestChoice,
        color: body.color,
        size: body.size,
        shortDescription: body.shortDescription,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.cartItem.deleteMany({
        where: { productId: params.id },
      }),

      prisma.orderItem.deleteMany({
        where: { productId: params.id },
      }),

      prisma.review.deleteMany({
        where: { productId: params.id },
      }),

      prisma.product.delete({
        where: { id: params.id },
      }),
    ]);

    return NextResponse.json(
      { success: true, message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      {
        error: "Failed to delete product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
