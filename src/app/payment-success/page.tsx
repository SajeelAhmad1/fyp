"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import OrderSummary from '@/components/OrderSummary';

// Loading skeleton component
const OrderConfirmationSkeleton = () => (
  <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
    <div className="text-center mb-8">
      <div className="h-8 bg-gray-200 rounded w-96 mx-auto mb-4 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-full max-w-2xl mx-auto mb-2 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-80 mx-auto animate-pulse"></div>
    </div>

    {/* Order Summary Skeleton */}
    <div className="border rounded-lg p-6 mb-6">
      <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
      </div>
      <div className="mt-4 pt-4 border-t">
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>
    </div>

    <div className="text-center">
      <div className="h-10 bg-gray-200 rounded-lg w-40 mx-auto animate-pulse"></div>
    </div>
  </div>
);

const OrderConfirmationContent = () => {
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
      }
    }

    fetchOrderDetails();
  }, [id]);

  if(loading){
    return<></>
  }

  if (error) return <div>{error}</div>;
  if (!orderData) return <div>No order found</div>;

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
          href={`/products`} 
          className="bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-300 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
        >
          Continue Shopping
        </a>
      </div>
    </div>
  );
};

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<OrderConfirmationSkeleton />}>
      <OrderConfirmationContent />
    </Suspense>
  );
}