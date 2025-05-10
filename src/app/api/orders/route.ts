import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log(body)

        // Validate essential input
        if (!body.items || body.items.length === 0) {
            return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
        }

        // Validate email for guest orders
        if (!body.userId && (!body.guestEmail || !body.guestEmail.includes('@'))) {
            return NextResponse.json({ error: "Valid email is required for guest orders" }, { status: 400 });
        }

        // Check product availability and stock
        for (const item of body.items) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
                select: { name: true, stock: true }
            });

            if (!product || product.stock < item.quantity) {
                return NextResponse.json({ 
                    error: `${product?.name} is out of stock or insufficient quantity. Remove it from your cart to proceed.` 
                }, { status: 400 });
            }
        }

        // Create order with guest support
        const order = await prisma.$transaction(async (prisma) => {
            // Create the order
            const createdOrder = await prisma.order.create({
                data: {
                    userId: body.userId || undefined,
                    isGuestOrder: !body.userId,
                    guestEmail: !body.userId ? body.guestEmail : undefined,
                    totalPrice: body.totalPrice,
                    status: body.status,
                    shippingFirstName: body.shippingFirstName || "",
                    shippingLastName: body.shippingLastName || "",
                    shippingStreet: body.shippingStreet || "",
                    shippingCity: body.shippingCity || "",
                    shippingPostalCode: body.shippingPostalCode || "",
                    shippingCountry: body.shippingCountry || "",
                    shippingPhone: body.shippingPhone || "",
                    paymentIntentId: body.paymentIntentId,
                    paymentMethodId: body.paymentMethodId,
                    clientSecret: body.clientSecret,
                    stripeCustomerId: body.stripeCustomerId,
                    items: {
                        create: body.items.map((item: any) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: new Prisma.Decimal(item.unitPrice)
                        })),
                    },
                },
                include: { 
                    items: {
                        include: { 
                            product: true 
                        } 
                    } 
                },
            });

            // Update product stock
            for (const item of body.items) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: { 
                        stock: { decrement: item.quantity } 
                    }
                });
            }

            // Clear the cart after successful order
            if (body.userId) {
                // For logged-in users
                await prisma.cartItem.deleteMany({
                    where: { 
                        cart: { 
                            userId: body.userId 
                        } 
                    }
                });
            } else if (body.guestCartId) {
                // For guest users
                await prisma.cartItem.deleteMany({
                    where: { 
                        cartId: body.guestCartId 
                    }
                });
            }
            
            return createdOrder;
        });

        return NextResponse.json({ data: order }, { status: 201 });
    } catch (error) {
        console.error("Order creation error:", error);
        return NextResponse.json({ 
            error: "Internal Server Error", 
            details: error instanceof Error ? error.message : "Unknown error" 
        }, { status: 500 });
    }
}