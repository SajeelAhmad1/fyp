"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import OrderSummary from '@/components/OrderSummary';

// Loading component for Suspense fallback
function OrderDetailsLoading() {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <div className="text-center mb-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
        </div>
      </div>
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

// Separate component for order details to work with Suspense
function OrderDetails() {
  const searchParams = useSearchParams();
  const id = searchParams.get('orderId');
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrderDetails() {
      if (!id) {
        setError('No Order ID found');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/orders/get-order-by-id/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }
        const data = await response.json();
        setOrderData(data.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching order details');
        setLoading(false);
        console.error(err);
      }
    }

    fetchOrderDetails();
  }, [id]);

  if (loading) return <OrderDetailsLoading />;
  if (error) return <div className="text-center text-red-600 py-8">{error}</div>;
  if (!orderData) return <div className="text-center text-gray-600 py-8">No order found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-green-600">Thank you for your purchase!</h1>
        <p className="mt-2 text-gray-600">
          Your order will be processed within 24 hours during working days. 
          We will notify you by email once your order has been shipped.
        </p>
      </div>

      <OrderSummary order={orderData} />

      <div className="mt-6 text-center">
        <a 
          href={`/track-order/${id}`} 
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
        >
          Track Your Order
        </a>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<OrderDetailsLoading />}>
      <OrderDetails />
    </Suspense>
  );
}