import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PaymentMethod } from "@/components/Order";

export function formatCurrency(
  amount: number | string | null | undefined
): string {
  if (amount === null || amount === undefined) return "£0.00";

  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(numAmount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
interface OrderSummaryProps {
  order: {
    id: string;
    createdAt: string;
    totalPrice: number;
    status: string;
    items: Array<{
      product: {
        name: string;
        id: string;
        images?: string[];
      };
      quantity: number;
      price: number;
    }>;
    payment?: {
      method: string;
      status: string;
    };
    shippingFirstName: string;
    shippingLastName: string;
    shippingStreet: string;
    shippingCity: string;
    shippingState?: string;
    shippingPostalCode: string;
    shippingCountry: string;
    shippingPhone: string;
  };
  paymentMethod: PaymentMethod | null;
}

export default function OrderSummary({
  order,
  paymentMethod,
}: OrderSummaryProps) {
  const { data: session }: any = useSession();

  // Calculate subtotal from order items
  const subtotal = order.items.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-400">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Order Details */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>
          <p>
            <strong>Order Number:</strong> {order.id}
          </p>
          <p>
            <strong>Date:</strong> {formatDate(order.createdAt)}
          </p>
          <p>
            <strong>Status:</strong> {order.status}
          </p>
          <p>
            <strong>Payment Method:</strong>{" "}
            {paymentMethod?.type || "Not specified"}
          </p>
        </div>

        {/* Shipping Address */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
          <p>
            {order.shippingFirstName} {order.shippingLastName}
          </p>
          <p>{order.shippingStreet}</p>
          <p>
            {order.shippingCity}, {order.shippingState}{" "}
            {order.shippingPostalCode}
          </p>
          <p>{order.shippingCountry}</p>
          <p>{order.shippingPhone}</p>
        </div>
      </div>

      {/* Order Items */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Product</th>
              <th className="text-center py-2">Quantity</th>
              <th className="text-right py-2">Price</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.product.id} className="border-b">
                <td className="py-2 flex items-center">
                  {item.product.images && item.product.images.length > 0 && (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover mr-4"
                    />
                  )}
                  {item.product.name}
                </td>
                <td className="text-center py-2">{item.quantity}</td>
                <td className="text-right py-2">
                  {formatCurrency(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="text-right py-2 font-semibold">
                Subtotal:
              </td>
              <td className="text-right py-2">{formatCurrency(subtotal)}</td>
            </tr>
            <tr>
              <td colSpan={2} className="text-right py-2 font-semibold">
                Discount:
              </td>
              <td className="text-right py-2">
                {formatCurrency(subtotal - order.totalPrice)}
              </td>
            </tr>

            <tr className="font-bold">
              <td colSpan={2} className="text-right py-2 text-xl">
                Total:
              </td>
              <td className="text-right py-2 text-xl">
                {formatCurrency(order.totalPrice)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
