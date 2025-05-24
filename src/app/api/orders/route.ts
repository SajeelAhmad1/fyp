import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.items || body.items.length === 0) {
            return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
        }

        let totalWeight = new Prisma.Decimal(0);
        const products = await prisma.product.findMany({
            where: {
                id: { in: body.items.map((item: any) => item.productId) }
            },
            select: {
                id: true,
                name: true,
                stock: true,
                parcelWeight: true
            }
        });

        for (const item of body.items) {
            const product = products.find(p => p.id === item.productId);
            if (!product) {
                return NextResponse.json({ 
                    error: `Product not found` 
                }, { status: 400 });
            }
            if (product.stock < item.quantity) {
                return NextResponse.json({ 
                    error: `${product.name} is out of stock` 
                }, { status: 400 });
            }
            totalWeight = new Prisma.Decimal(totalWeight).add(
                new Prisma.Decimal(product.parcelWeight).times(item.quantity)
            );
        }

        const order = await prisma.$transaction(async (prisma) => {
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
                    parcelWeight: totalWeight,
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

            for (const item of body.items) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: { 
                        stock: { decrement: item.quantity } 
                    }
                });
            }

            if (body.userId) {
                await prisma.cartItem.deleteMany({
                    where: { 
                        cart: { 
                            userId: body.userId 
                        } 
                    }
                });
            } else if (body.guestCartId) {
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