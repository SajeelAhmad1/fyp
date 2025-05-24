import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/prisma";

async function getOrCreateGuestCart(guestCartId?: string) {
  if (guestCartId) {
    const existingCart = await prisma.cart.findUnique({
      where: { id: guestCartId },
      include: { 
        items: {
          include: {
            product: true  
          }
        } 
      },
    });
    
    if (existingCart) return existingCart;
    
    console.log(`Guest cart with ID ${guestCartId} not found. Creating new cart.`);
  }

  const newCart = await prisma.cart.create({
    data: { 
      id: guestCartId || uuidv4(), 
      isGuestCart: true 
    },
    include: { 
      items: {
        include: {
          product: true  
        }
      } 
    },
  });

  return newCart;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const guestCartId = url.searchParams.get("guestCartId");
 
    if (!userId && !guestCartId) {
      return NextResponse.json(
        { message: "User ID or Guest Cart ID is required" },
        { status: 400 }
      );
    }

    let cart;

    if (userId) {
      cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    } else if (guestCartId) {
      // If no existing cart, create a new one with the provided guestCartId
      cart = await getOrCreateGuestCart(guestCartId);
    }

    if (!cart) {
      console.log(`Cart not found for userId: ${userId}, guestCartId: ${guestCartId}`);
      return NextResponse.json(
        { 
          message: "Cart not found", 
          data: null,
          cartId: guestCartId || null
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ 
      data: cart,
      isGuestCart: cart.isGuestCart || false,
      cartId: cart.id
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, guestCartId, productId, quantity = 1 } = body;

    console.log(`Adding to cart - userId: ${userId}, guestCartId: ${guestCartId}, productId: ${productId}, quantity: ${quantity}`);

    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { message: "Product is out of stock or not enough quantity available" },
        { status: 400 }
      );
    }

    const cart = userId 
      ? await prisma.cart.findUnique({
          where: { userId },
          include: { items: true },
        }) || await prisma.cart.create({
          data: { userId },
          include: { items: true },
        })
      : await getOrCreateGuestCart(guestCartId);

    const existingCartItem = cart.items.find(
      (item) => item.productId === productId
    );

    let cartItem;

    if (existingCartItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + quantity,
        },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    return NextResponse.json(
      {
        message: "Product added to cart successfully",
        data: {
          cartItem,
          cartId: cart.id,
          isGuestCart: cart.isGuestCart || false,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding product to cart:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}