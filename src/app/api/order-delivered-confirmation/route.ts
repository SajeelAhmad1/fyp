import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { successResponse, errorResponse } from "../../../utils/responseHelper";

dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD;

export async function POST(req: NextRequest) {
  try {
    const { orderId, customerEmail } = await req.json();

    if (!orderId || !customerEmail) {
      return errorResponse("Order ID and customer email are required", 400);
    }

    // Verify the order exists and is marked as delivered
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        status: "DELIVERED",
      },
      include: {
        user: {
          include: {
            customerProfile: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        shipment: true,
      },
    });

    if (!order) {
      return errorResponse("Order not found or not yet delivered", 404);
    }

    // Determine customer name - use profile if available, otherwise use shipping info
    const customerName = order.user?.customerProfile
      ? `${order.user.customerProfile.firstName} ${order.user.customerProfile.lastName}`
      : `${order.shippingFirstName} ${order.shippingLastName}`;

    // Create transporter using app password authentication
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_APP_PASSWORD,
      },
    });

    // Generate a nice HTML email with order details and review link
    const itemsList = order.items
      .map(
        (item) => `
            <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
                <p style="margin: 5px 0; font-size: 16px;">
                    <strong>${item.product.name}</strong> × ${item.quantity}
                </p>
                <p style="margin: 5px 0; color: #555;">$${(
                  (item.price - item.price * (item.product.discount / 100)) *
                  item.quantity
                ).toFixed(2)}</p>
                <p style="margin: 5px 0; color: #9CA3AF; font-size: 0.75rem; text-decoration: line-through;">
                  $${item.price.toFixed(2)}
                </p>

            </div>
        `
      )
      .join("");

    await transporter.sendMail({
      from: '"Lyalla and Lora" <sajeelashiq1@gmail.com>',
      to: customerEmail,
      subject: "Your Order Has Been Delivered - Share Your Experience!",
      html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px;">
                <div style="background: #F19B12; padding: 15px; border-radius: 10px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px; color: #ffffff;">Thank You for Your Order!</h1>
                </div>
                
                <div style="margin-top: 20px; padding: 20px; background-color: #ffffff; border-radius: 10px; border: 2px solid #F19B12;">
                    <p style="font-size: 18px; color: #333;">Hello ${
                      customerName || "Valued Customer"
                    },</p>
                    <p style="font-size: 16px; color: #555;">We hope you're enjoying your recent purchase from Lyalla and Lora!</p>
                    
                    <h2 style="color: #F19B12; font-size: 20px; margin-top: 25px;">Order Summary</h2>
                    <div style="margin: 15px 0;">
                        ${itemsList}
                    </div>
                    <p style="font-size: 18px; text-align: right; margin-top: 10px;">
                        <strong>Total: $${order.totalPrice.toFixed(2)}</strong>
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <p style="font-size: 18px; color: #F19B12; margin-bottom: 15px;">How was your experience?</p>
                        <a href="http://localhost:3000/orders/${orderId}" 
                           style="background-color: #F19B12; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                            Leave a Review
                        </a>
                    </div>
                    
                    <p style="font-size: 15px; color: #777;">We'd love to hear your feedback to help us improve our products and service.</p>
                </div>
                
                <div style="margin-top: 30px; padding: 10px; border-top: 1px solid #F19B12; text-align: center;">
                    <p style="font-size: 12px; color: #777;">© ${new Date().getFullYear()} Lyalla and Lora. All rights reserved.</p>
                </div>
            </div>
            `,
    });

    return successResponse(
      null,
      "Order delivered notification and review request sent successfully."
    );
  } catch (error: any) {
    console.error("Error in order delivered notification:", error);
    return errorResponse("Failed to send order delivered notification", 500);
  }
}
