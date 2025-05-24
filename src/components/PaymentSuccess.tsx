"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import OrderSummary from '@/components/OrderSummary';
import PaymentSuccessLoader from '@/components/skeletonLoaders/paymentSuccess';
import { PaymentMethod } from '@/components/Order';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const id = searchParams.get('orderId');
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentMethod = async (paymentMethodId: string | null) => {
      try {
        if (!paymentMethodId) return;

        const res = await fetch('/api/get-payment-method', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentMethodId }),
        });

        if (!res.ok) {
          throw new Error('Failed to fetch payment method');
        }

        const data = await res.json();
        setPaymentMethod(data);
        console.log(paymentMethod)
      } catch (err) {
        console.error('Failed to load payment method:', err);
      }
    };

    fetchPaymentMethod(paymentMethodId);
  }, [paymentMethodId]);

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
        setPaymentMethodId(data.data.paymentMethodId)
        setLoading(false);
      } catch (err) {
        setError('Error fetching order details');
        setLoading(false);
        console.error(err);
      }
    }

    fetchOrderDetails();
  }, [id]);

  if (loading) return <PaymentSuccessLoader />
  if (error) return <div>{error}</div>;
  if (!orderData) return <div>No order found</div>;

  return (
    <div className="max-w-4xl mx-auto my-2 p-6 bg-white shadow-md rounded-lg border border-gray-200">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-green-600">Thank you for your purchase!</h1>
        <p className="mt-2 text-gray-600">
          Your order will be processed within 24 hours during working days.
          We will notify you by email once your order has been shipped.
        </p>
      </div>

      <OrderSummary order={orderData} paymentMethod={paymentMethod} />

      <div className='flex flex-col md:flex-row space-x-0 md:space-x-2 justify-center'>
        <div className="mt-6 text-center">
          <a
            href={`/track-order/${id}`}
            className="bg-[#F19B12] hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Track Your Order
          </a>
        </div>
        <div className="mt-6 text-center">
          <a
            href={`/`}
            className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Return to Home Page
          </a>
        </div>
      </div>
    </div>
  );
}