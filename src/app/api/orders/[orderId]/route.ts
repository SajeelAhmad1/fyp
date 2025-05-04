import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PaymentStatus, OrderStatus } from "@prisma/client";
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

// Get email credentials from environment variables
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD;

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

async function sendOrderConfirmationEmail(email: string, orderDetails: any) {
    try {
        // Create transporter using app password authentication
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_APP_PASSWORD
            }
        });
        
        // Format items for email
        const itemsHtml = orderDetails.items.map((item: any) => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product.name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
            </tr>
        `).join('');
        
        // Calculate total
        const total = orderDetails.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        
        await transporter.sendMail({
            from: '"Lyalla and Lora" <sajeelashiq1@gmail.com>',
            to: email,
            subject: "Your Order Confirmation - Lyalla and Lora",
            html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff; padding: 20px; text-align: center; border-radius: 10px;">
                <div style="background: #F19B12; padding: 15px; border-radius: 10px;">
                    <h1 style="margin: 0; font-size: 28px; color: #ffffff;">Lyalla and Lora</h1>
                </div>
                <div style="margin-top: 20px; padding: 20px; background-color: #ffffff; border-radius: 10px; border: 2px solid #F19B12;">
                    <p style="font-size: 24px; color: #F19B12; margin: 0;">Order Confirmation</p>
                    <p style="font-size: 16px; color: #555555; margin-top: 10px;">Thank you for your order!</p>
                    
                    <div style="margin-top: 20px; text-align: left;">
                        <p style="font-weight: bold; color: #333;">Order ID: ${orderDetails.id}</p>
                        <p style="color: #333;">Status: ${orderDetails.status}</p>
                        
                        <div style="margin-top: 20px;">
                            <h3 style="color: #F19B12; border-bottom: 1px solid #F19B12; padding-bottom: 5px;">Order Summary</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr style="background-color: #f8f8f8;">
                                        <th style="padding: 10px; text-align: left;">Product</th>
                                        <th style="padding: 10px; text-align: center;">Quantity</th>
                                        <th style="padding: 10px; text-align: right;">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsHtml}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                                        <td style="padding: 10px; text-align: right; font-weight: bold;">$${total.toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        
                        <div style="margin-top: 20px; display: flex; justify-content: space-between;">
                            <div style="width: 48%;">
                                <h3 style="color: #F19B12; border-bottom: 1px solid #F19B12; padding-bottom: 5px;">Shipping Details</h3>
                                <p>${orderDetails.shippingFirstName} ${orderDetails.shippingLastName}<br>
                                ${orderDetails.shippingStreet}<br>
                                ${orderDetails.shippingCity}, ${orderDetails.shippingState} ${orderDetails.shippingPostalCode}<br>
                                ${orderDetails.shippingCountry}<br>
                                Phone: ${orderDetails.shippingPhone}</p>
                            </div>
                            <div style="width: 48%;">
                                <h3 style="color: #F19B12; border-bottom: 1px solid #F19B12; padding-bottom: 5px;">Payment Method</h3>
                                <p>${orderDetails.payment ? orderDetails.payment.method : 'Not specified'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div style="margin-top: 30px; padding: 10px; border-top: 1px solid #F19B12;">
                    <p style="font-size: 12px; color: #777777;">© 2025 Lyalla and Lora. All rights reserved.</p>
                </div>
            </div>
            `,
        });
        
        console.log("Order confirmation email sent successfully");
        return true;
    } catch (error) {
        console.error("Failed to send order confirmation email:", error);
        return false;
    }
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
            },
        });

        // Update product stock if items are provided in the request body
        if (body.items && Array.isArray(body.items)) {
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
        }

        // Send confirmation email if order status is CONFIRMED
        if (body.status === 'CONFIRMED') {
            // Get the email address to send to
            const emailToSend = guestEmail || await prisma.user.findUnique({
                where: { id: userId || '' },
                select: { email: true }
            }).then(user => user?.email);
            
            if (emailToSend) {
                await sendOrderConfirmationEmail(emailToSend, updatedOrder);
            }
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