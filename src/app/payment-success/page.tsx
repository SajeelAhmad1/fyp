"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import OrderSummary from '@/components/OrderSummary';

export default function OrderConfirmationPage() {
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

  if (loading) return <div>Loading order details...</div>;
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
          href={`/track-order/${id}`} 
          className="bg-[#F19B12] hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
        >
          Track Your Order
        </a>
      </div>
    </div>
  );
}