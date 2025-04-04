import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PaymentStatus, OrderStatus } from "@prisma/client";

async function validateOrderAccess(orderId: string, userId?: string, guestEmail?: string) {
    if (!userId && !guestEmail) return null;

    const order = await prisma.order.findUnique({
        where: {
            id: orderId,
            OR: [
                { userId: userId || undefined },
                {
                    isGuestOrder: true,
                    guestEmail: guestEmail || undefined
                }
            ]
        }
    });
    return order;
}

export async function GET(request: Request, { params }: { params: { orderId: string } }) {
    try {
        const { orderId } = params;
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');
        const guestEmail = url.searchParams.get('guestEmail');

        if (!userId && !guestEmail) {
            return NextResponse.json(
                { error: "User ID or Guest Email is required" },
                { status: 400 }
            );
        }

        const order = await validateOrderAccess(
            orderId,
            userId || undefined,
            guestEmail || undefined
        );
        if (!order) {
            return NextResponse.json(
                { error: "Order not found or unauthorized" },
                { status: 404 }
            );
        }

        const orderWithDetails = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                payment: true
            },
        });

        return NextResponse.json({ data: orderWithDetails }, { status: 200 });
    } catch (error) {
        console.error("Order retrieval error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function PUT(req: Request, { params }: { params: { orderId: string } }) {
    try {
        const { orderId } = params;
        const { userId, guestCartId, guestEmail, ...body } = await req.json();

        // Validate email if it's a guest order
        if (!userId && guestEmail) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(guestEmail)) {
                return NextResponse.json(
                    { error: "Invalid email format" },
                    { status: 400 }
                );
            }
        }

        // Validate order access
        const order = await validateOrderAccess(
            orderId,
            userId || undefined,
            guestEmail || undefined
        );

        if (!order) {
            return NextResponse.json(
                { error: "Order not found or unauthorized" },
                { status: 404 }
            );
        }

        // Process payment
        const paymentStatus = body.status === 'CONFIRMED'
            ? PaymentStatus.COMPLETED
            : PaymentStatus.PENDING;

        // Upsert payment record
        await prisma.payment.upsert({
            where: { orderId },
            update: {
                method: body.paymentMethod,
                status: paymentStatus,
            },
            create: {
                orderId,
                method: body.paymentMethod || "CREDIT_CARD",
                status: paymentStatus,
            },
        });

        // Update the order
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                shippingFirstName: body.shippingFirstName,
                shippingLastName: body.shippingLastName,
                shippingStreet: body.shippingStreet,
                shippingCity: body.shippingCity,
                shippingState: body.shippingState,
                shippingPostalCode: body.shippingPostalCode,
                shippingCountry: body.shippingCountry,
                shippingPhone: body.shippingPhone,

                billingFirstName: body.billingFirstName,
                billingLastName: body.billingLastName,
                billingStreet: body.billingStreet,
                billingCity: body.billingCity,
                billingState: body.billingState,
                billingPostalCode: body.billingPostalCode,
                billingCountry: body.billingCountry,

                status: body.status as OrderStatus,
                ...(!userId && guestEmail ? { guestEmail: guestEmail.toLowerCase().trim() } : {})
            },
            include: {
                items: { include: { product: true } },
                payment: true
            },
        });

        // Update product stock
        for (const item of body.items) {
            await prisma.product.update({
                where: { id: item.productId },
                data: {
                    stock: {
                        decrement: item.quantity
                    }
                }
            });
        }

        return NextResponse.json({ data: updatedOrder }, { status: 200 });
    } catch (error) {
        console.error("Order update error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}