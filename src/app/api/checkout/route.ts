// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/auth-options';
import { Decimal } from '@prisma/client/runtime/library';

// Define TypeScript interfaces
interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface PaymentMethod {
  type: 'card' | 'paypal';
  cardNumber?: string;
  cardExpiry?: string;
  cardCvc?: string;
}

interface CheckoutData {
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  shippingMethod: 'standard' | 'express';
}

export async function POST(request: Request) {
  try {
    const { 
      shippingAddress, 
      paymentMethod, 
      shippingMethod 
    }: CheckoutData = await request.json();

    // Validate required fields
    if (!shippingAddress || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required checkout information' }, 
        { status: 400 }
      );
    }

    // Get session for authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get cart items from cookies or database
    const cartId = cookies().get('cartId')?.value;
    if (!cartId) {
      return NextResponse.json({ error: 'No cart found' }, { status: 400 });
    }

    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Calculate totals
    const subtotal = cart.items.reduce(
      (sum, item) => sum.plus(new Decimal(item.quantity).times(item.product.price)), 
      new Decimal(0)
    );
    
    const shippingCost = new Decimal(shippingMethod === 'express' ? 15 : 5);
    const taxRate = new Decimal(0.07); // 7% tax rate
    const tax = subtotal.times(taxRate); 
    const total = subtotal.plus(shippingCost).plus(tax);

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        status: 'CONFIRMED',
        shippingAddress: shippingAddress as any, // Type casting for Prisma
        paymentMethod: paymentMethod as any, // Type casting for Prisma
        shippingMethod,
        subtotal,
        shippingCost,
        tax,
        total,
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price
          }))
        }
      }
    });

    // Clear cart after successful order creation
    await prisma.cartItem.deleteMany({
      where: { cartId }
    });

    // Process payment (integrate with payment provider here)
    // This is simplified - you'd normally handle payment processing logic here

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to process checkout' }, 
      { status: 500 }
    );
  }
}