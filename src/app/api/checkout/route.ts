import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { Decimal } from '@prisma/client/runtime/library';
import { OrderStatus, PaymentStatus } from '@prisma/client';

interface CheckoutData {
  shippingFirstName: string;
  shippingLastName: string;
  shippingStreet: string;
  shippingCity: string;
  shippingState?: string;
  shippingPostalCode: string;
  shippingCountry: string;
  shippingPhone: string;

  useSameAddress: boolean;
  billingFirstName?: string;
  billingLastName?: string;
  billingStreet?: string;
  billingCity?: string;
  billingState?: string;
  billingPostalCode?: string;
  billingCountry?: string;

  email: string;
  paymentMethod: 'STRIPE' | 'PAYPAL' | 'CREDIT_CARD' | 'CASH_ON_DELIVERY';
  
  guestEmail?: string;
  guestCartId?: string;
}

const GUEST_CART_ID_KEY = 'guestCartId';

export async function POST(request: Request) {
  try {
    const checkoutData: CheckoutData = await request.json();

    if (!checkoutData.shippingFirstName || !checkoutData.shippingLastName || 
        !checkoutData.shippingStreet || !checkoutData.shippingCity || 
        !checkoutData.shippingPostalCode || !checkoutData.shippingCountry ||
        !checkoutData.shippingPhone || !checkoutData.email) {
      return NextResponse.json(
        { error: 'Missing required shipping information' }, 
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    
    let cart;
    let isGuestOrder = false;

    if (session?.user?.id) {
      cart = await prisma.cart.findUnique({
        where: { userId: session.user.id },
        include: { 
          items: { 
            include: { 
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  stock: true,
                  images: true
                }
              }
            } 
          } 
        },
      });
    } else {
      if (!checkoutData.guestCartId) {
        return NextResponse.json({ error: 'Guest cart ID required' }, { status: 400 });
      }

      cart = await prisma.cart.findUnique({
        where: { 
          id: checkoutData.guestCartId,
          isGuestCart: true 
        },
        include: { 
          items: { 
            include: { 
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  stock: true,
                  images: true
                }
              }
            } 
          } 
        },
      });
      isGuestOrder = true;
    }

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty or not found' }, { status: 400 });
    }

    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json({
          error: `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}, Requested: ${item.quantity}`
        }, { status: 400 });
      }
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum.plus(new Decimal(item.quantity).times(item.product.price)), 
      new Decimal(0)
    );
    
    const shippingCost = new Decimal(10);
    const taxRate = new Decimal(0.08);
    const tax = subtotal.times(taxRate); 
    const total = subtotal.plus(shippingCost).plus(tax);

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: session?.user?.id || null,
          isGuestOrder,
          guestEmail: isGuestOrder ? (checkoutData.guestEmail || checkoutData.email) : null,
          
          shippingFirstName: checkoutData.shippingFirstName,
          shippingLastName: checkoutData.shippingLastName,
          shippingStreet: checkoutData.shippingStreet,
          shippingCity: checkoutData.shippingCity,
          shippingState: checkoutData.shippingState,
          shippingPostalCode: checkoutData.shippingPostalCode,
          shippingCountry: checkoutData.shippingCountry,
          shippingPhone: checkoutData.shippingPhone,

          billingFirstName: checkoutData.useSameAddress ? null : checkoutData.billingFirstName,
          billingLastName: checkoutData.useSameAddress ? null : checkoutData.billingLastName,
          billingStreet: checkoutData.useSameAddress ? null : checkoutData.billingStreet,
          billingCity: checkoutData.useSameAddress ? null : checkoutData.billingCity,
          billingState: checkoutData.useSameAddress ? null : checkoutData.billingState,
          billingPostalCode: checkoutData.useSameAddress ? null : checkoutData.billingPostalCode,
          billingCountry: checkoutData.useSameAddress ? null : checkoutData.billingCountry,

          totalPrice: total,
          status: OrderStatus.PENDING,
          
          items: {
            create: cart.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price
            }))
          }
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  price: true
                }
              }
            }
          }
        }
      });

      await tx.payment.create({
        data: {
          orderId: order.id,
          method: checkoutData.paymentMethod,
          status: PaymentStatus.PENDING
        }
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { 
            stock: { 
              decrement: item.quantity 
            } 
          }
        });
      }

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      });

      return order;
    });

    if (isGuestOrder) {
      await prisma.cart.delete({
        where: { id: checkoutData.guestCartId }
      });
    }

    return NextResponse.json({ 
      success: true, 
      order: {
        id: result.id,
        totalPrice: result.totalPrice,
        status: result.status,
        items: result.items
      },
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to process checkout' }, 
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    
    let order;
    
    if (session?.user?.id) {
      order = await prisma.order.findFirst({
        where: { 
          id: orderId,
          userId: session.user.id 
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  price: true
                }
              }
            }
          },
          payment: true
        }
      });
    } else {
      const guestEmail = searchParams.get('guestEmail');
      if (!guestEmail) {
        return NextResponse.json({ error: 'Guest email required' }, { status: 400 });
      }

      order = await prisma.order.findFirst({
        where: { 
          id: orderId,
          guestEmail,
          isGuestOrder: true
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  price: true
                }
              }
            }
          },
          payment: true
        }
      });
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: order 
    });

  } catch (error) {
    console.error('Get checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve checkout information' }, 
      { status: 500 }
    );
  }
}