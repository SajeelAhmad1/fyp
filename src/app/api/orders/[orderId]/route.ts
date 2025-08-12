import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PaymentStatus, OrderStatus } from "@prisma/client";
import nodemailer from 'nodemailer';

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
        return NextResponse.json(
            { error: "Internal Server Error" }, 
            { status: 500 }
        );
    }
}

export async function PUT(req: Request, { params }: { params: { orderId: string } }) {
  try {
      const { orderId } = params;
      const { userId, guestEmail, ...body } = await req.json();

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

      //send email here
      const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: EMAIL_USER,
                pass: EMAIL_APP_PASSWORD
              }
            });

            const user = await prisma.user.findUnique(
                {where: { id: userId }}
            )

      // Calculate totals
      const subtotal = updatedOrder.items.reduce((sum:any, item:any) => sum + (item.price * item.quantity), 0);
      const shippingCost = 0; // You can add shipping calculation logic here
      const taxAmount = 0; // You can add tax calculation logic here
      const totalAmount = subtotal + shippingCost + taxAmount;

      // Generate order items HTML
      const orderItemsHtml = updatedOrder.items.map((item:any) => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px; text-align: left;">
            <strong>${item.product.name}</strong>
          </td>
          <td style="padding: 12px; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; text-align: right;">£${item.price.toFixed(2)}</td>
          <td style="padding: 12px; text-align: right; font-weight: bold;">£${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `).join('');

      const customerName = updatedOrder.shippingFirstName && updatedOrder.shippingLastName 
        ? `${updatedOrder.shippingFirstName} ${updatedOrder.shippingLastName}`
        : ('Dear Customer');

      await transporter.sendMail({
        from: '"eTrolly" <etrolly.shop.co.uk@gmail.com>',
        to: guestEmail || user?.email,
        subject: `Order Confirmation #${orderId} - eTrolly`,
        html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; padding: 20px; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(to bottom, #579FE1, #2290F3); padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; color: #ffffff; font-weight: bold;">eTrolly</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">Your trusted online store</p>
            </div>

            <!-- Order Confirmation Message -->
            <div style="padding: 30px 20px; text-align: center; background-color: #f8fcff; border-bottom: 3px solid #2290F3;">
              <h2 style="color: #2290F3; margin: 0 0 10px 0; font-size: 24px;">Order Confirmed!</h2>
              <p style="font-size: 18px; color: #333; margin: 0;">Thank you for your purchase, ${customerName}</p>
              <p style="font-size: 14px; color: #666; margin: 10px 0 0 0;">Order #${orderId} • ${new Date().toLocaleDateString()}</p>
            </div>

            <!-- Order Items -->
            <div style="padding: 30px 20px;">
              <h3 style="color: #2290F3; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">Order Details</h3>
              
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                  <tr style="background-color: #f8fcff;">
                    <th style="padding: 15px 12px; text-align: left; font-weight: bold; color: #2290F3; border-bottom: 2px solid #2290F3;">Item</th>
                    <th style="padding: 15px 12px; text-align: center; font-weight: bold; color: #2290F3; border-bottom: 2px solid #2290F3;">Qty</th>
                    <th style="padding: 15px 12px; text-align: right; font-weight: bold; color: #2290F3; border-bottom: 2px solid #2290F3;">Price</th>
                    <th style="padding: 15px 12px; text-align: right; font-weight: bold; color: #2290F3; border-bottom: 2px solid #2290F3;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItemsHtml}
                </tbody>
              </table>

              <!-- Order Summary -->
              <div style="background-color: #f8fcff; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-size: 16px;">Subtotal:</td>
                    <td style="padding: 8px 0; text-align: right; font-size: 16px;">£${subtotal.toFixed(2)}</td>
                  </tr>
                  ${shippingCost > 0 ? `
                  <tr>
                    <td style="padding: 8px 0; font-size: 16px;">Shipping:</td>
                    <td style="padding: 8px 0; text-align: right; font-size: 16px;">£${shippingCost.toFixed(2)}</td>
                  </tr>
                  ` : `
                  <tr>
                    <td style="padding: 8px 0; font-size: 16px;">Shipping:</td>
                    <td style="padding: 8px 0; text-align: right; font-size: 16px; color: #28a745; font-weight: bold;">FREE</td>
                  </tr>
                  `}
                  ${taxAmount > 0 ? `
                  <tr>
                    <td style="padding: 8px 0; font-size: 16px;">Tax:</td>
                    <td style="padding: 8px 0; text-align: right; font-size: 16px;">£${taxAmount.toFixed(2)}</td>
                  </tr>
                  ` : ''}
                  <tr style="border-top: 2px solid #2290F3;">
                    <td style="padding: 15px 0 8px 0; font-size: 18px; font-weight: bold; color: #2290F3;">Total:</td>
                    <td style="padding: 15px 0 8px 0; text-align: right; font-size: 20px; font-weight: bold; color: #2290F3;">£${totalAmount.toFixed(2)}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Shipping Information -->
            ${updatedOrder.shippingStreet ? `
            <div style="padding: 20px; background-color: #f9f9f9; border-top: 1px solid #eee;">
              <h3 style="color: #2290F3; margin: 0 0 15px 0; font-size: 18px;">Shipping Address</h3>
              <p style="margin: 5px 0; color: #333; line-height: 1.4;">
                ${updatedOrder.shippingFirstName} ${updatedOrder.shippingLastName}<br>
                ${updatedOrder.shippingStreet}<br>
                ${updatedOrder.shippingCity}, ${updatedOrder.shippingState} ${updatedOrder.shippingPostalCode}<br>
                ${updatedOrder.shippingCountry}
                ${updatedOrder.shippingPhone ? `<br>Phone: ${updatedOrder.shippingPhone}` : ''}
              </p>
            </div>
            ` : ''}

            <!-- Payment Information -->
            <div style="padding: 20px; background-color: #f9f9f9; ${updatedOrder.shippingStreet ? '' : 'border-top: 1px solid #eee;'}">
              <h3 style="color: #2290F3; margin: 0 0 15px 0; font-size: 18px;">Payment Method</h3>
              <p style="margin: 5px 0; color: #333;">
                ${updatedOrder.payment?.method || 'Credit Card'}<br>
                <span style="color: ${paymentStatus === 'COMPLETED' ? '#28a745' : '#ffc107'}; font-weight: bold;">
                  ${paymentStatus === 'COMPLETED' ? 'Payment Completed' : 'Payment Pending'}
                </span>
              </p>
            </div>

            <!-- Footer -->
            <div style="padding: 30px 20px; text-align: center; background-color: #2290F3; color: #ffffff;">
              <h3 style="margin: 0 0 15px 0; font-size: 20px;">Thank You for Shopping with eTrolly!</h3>
              <p style="margin: 10px 0; font-size: 14px;">
                We'll send you shipping updates as your order progresses.<br>
                If you have any questions, feel free to contact our customer support.
              </p>
              <div style="margin: 20px 0 10px 0;">
                <a href="mailto:support@etrolly.shop.co.uk" style="color: #ffffff; text-decoration: none; margin: 0 10px;">📧 Support</a>
                <a href="tel:+44-xxx-xxx-xxxx" style="color: #ffffff; text-decoration: none; margin: 0 10px;">📞 Call Us</a>
              </div>
              <p style="margin: 20px 0 0 0; font-size: 12px; opacity: 0.8;">
                © 2025 eTrolly. All rights reserved.
              </p>
            </div>

          </div>
        </div>
        `,
      });

      return NextResponse.json({ data: updatedOrder }, { status: 200 });
  } catch (error) {
      return NextResponse.json(
          { error: "Internal Server Error" }, 
          { status: 500 }
      );
  }
}