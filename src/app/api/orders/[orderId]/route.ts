import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PaymentStatus, OrderStatus } from "@prisma/client";

export async function GET(request: Request, { params }: { params: { orderId: string } }) {
    try {
        const { orderId } = params;

        const order = await prisma.order.findUnique({
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

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" }, 
                { status: 404 }
            );
        }

        // Transform data to match frontend expectations
        const responseData = {
            id: order.id,
            createdAt: order.createdAt.toISOString(),
            items: order.items.map(item => ({
                id: item.id,
                product: {
                    id: item.product.id,
                    name: item.product.name,
                    imageUrl: item.product.images?.[0] || null,
                    price: parseFloat(item.product.price.toString())
                },
                quantity: item.quantity,
                price: parseFloat(item.price.toString())
            })),
            shippingAddress: {
                fullName: `${order.shippingFirstName} ${order.shippingLastName}`,
                addressLine1: order.shippingStreet,
                city: order.shippingCity,
                state: order.shippingState || "",
                postalCode: order.shippingPostalCode,
                country: order.shippingCountry,
                phone: order.shippingPhone
            },
            billingAddress: order.billingFirstName ? {
                fullName: `${order.billingFirstName} ${order.billingLastName}`,
                addressLine1: order.billingStreet || "",
                city: order.billingCity || "",
                state: order.billingState || "",
                postalCode: order.billingPostalCode || "",
                country: order.billingCountry || ""
            } : null,
            paymentMethod: order.payment ? {
                type: order.payment.method.toLowerCase() === 'paypal' ? 'paypal' : 'card',
                status: order.payment.status
            } : null,
            subtotal: parseFloat(order.totalPrice.toString()),
            shippingCost: 0, // You'll need to calculate this properly
            tax: 0, // You'll need to calculate this properly
            total: parseFloat(order.totalPrice.toString()),
            status: order.status,
            isGuestOrder: order.isGuestOrder
        };

        return NextResponse.json({ data: responseData }, { status: 200 });
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
    //   const order = await validateOrderAccess(
    //       orderId, 
    //       userId || undefined, 
    //       guestEmail || undefined
    //   );

    //   if (!order) {
    //       return NextResponse.json(
    //           { error: "Order not found or unauthorized" }, 
    //           { status: 404 }
    //       );
    //   }

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

      return NextResponse.json({ data: updatedOrder }, { status: 200 });
  } catch (error) {
      console.error("Order update error:", error);
      return NextResponse.json(
          { error: "Internal Server Error" }, 
          { status: 500 }
      );
  }
}