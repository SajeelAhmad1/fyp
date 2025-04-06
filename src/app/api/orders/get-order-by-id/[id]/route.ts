import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    request: Request, 
    { params }: { params: { id: string } }
) {
    try {
        const orderId = params.id;
        
        // Add additional logging for debugging
        console.log("Requested Order ID:", orderId);

        // Validate that orderId is not undefined or empty
        if (!orderId) {
            console.error("No order ID provided");
            return NextResponse.json(
                { error: "Order ID is required" }, 
                { status: 400 }
            );
        }

        const orderWithDetails = await prisma.order.findUnique({
            where: { 
                id: orderId 
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                payment: true
            },
        });
        console.log("here")
        console.log(orderWithDetails)

        if (!orderWithDetails) {
            console.log("No order found with ID:", orderId);
            return NextResponse.json(
                { error: "Order not found" }, 
                { status: 404 }
            );
        }

        return NextResponse.json({ data: orderWithDetails }, { status: 200 });
    } catch (error) {
        console.error("Order retrieval error:", error);
        
        return NextResponse.json(
            { 
                error: "Internal Server Error", 
                details: error instanceof Error ? error.message : 'Unknown error'
            }, 
            { status: 500 }
        );
    }
}