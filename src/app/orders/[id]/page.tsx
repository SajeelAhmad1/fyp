'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { formatDate } from '@/utils/checkoutUtils';

// Define TypeScript interfaces for the data structures
interface Product {
  imageUrl?: string;
  name: string;
}

interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
}

interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface PaymentMethod {
  type: 'card' | 'paypal';
  cardNumber?: string;
}

interface Order {
  id: string;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  shippingMethod: 'standard' | 'express';
  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderId = params.id as string;
        const response = await fetch(`/api/orders/${orderId}`);
        const data = await response.json();
        
        if (response.ok) {
          setOrder(data.order);
        } else {
          toast.error(data.error || 'Failed to load order details');
          router.push('/');
        }
      } catch (error) {
        toast.error('An error occurred while loading your order');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (params.id) {
      fetchOrder();
    }
  }, [params.id, router]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 w-1/2 mx-auto mb-8 rounded"></div>
          <div className="h-64 bg-gray-200 w-full rounded mb-4"></div>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Order not found</h1>
        <p className="mb-8">We couldn&apos;t find the order you&apos;re looking for.</p>
        <button
          onClick={() => router.push('/')}
          className="bg-blue-600 text-white py-2 px-4 rounded-md"
        >
          Return to Home
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-green-50 p-6 rounded-lg mb-8 text-center">
        <h1 className="text-3xl font-bold text-green-800 mb-2">Order Confirmed!</h1>
        <p className="text-lg text-green-700">
          Thank you for your purchase. Your order has been received and is being processed.
        </p>
        <p className="text-md text-green-600 mt-2">
          Order #{order.id} • Placed on {formatDate(order.createdAt)}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 py-2 border-b last:border-b-0">
                  <div className="w-16 h-16 relative bg-gray-100 rounded-md flex-shrink-0">
                    {item.product.imageUrl ? (
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Shipping Information */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Name:</span> {order.shippingAddress.fullName}
                </p>
                <p>
                  <span className="font-medium">Address:</span>
                  <br />
                  {order.shippingAddress.addressLine1}
                  {order.shippingAddress.addressLine2 && (
                    <>
                      <br />
                      {order.shippingAddress.addressLine2}
                    </>
                  )}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  <br />
                  {order.shippingAddress.country}
                </p>
                <p>
                  <span className="font-medium">Shipping Method:</span>{' '}
                  {order.shippingMethod === 'express' ? 'Express (1-2 days)' : 'Standard (3-5 days)'}
                </p>
              </div>
            </div>
            
            {/* Payment Information */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Payment Method:</span>{' '}
                  {order.paymentMethod.type === 'card' ? 'Credit/Debit Card' : 'PayPal'}
                </p>
                {order.paymentMethod.type === 'card' && order.paymentMethod.cardNumber && (
                  <p>
                    <span className="font-medium">Card:</span>{' '}
                    •••• •••• •••• {order.paymentMethod.cardNumber.slice(-4)}
                  </p>
                )}
                <p>
                  <span className="font-medium">Status:</span>{' '}
                  <span className="text-green-600 font-medium">Paid</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>${order.shippingCost.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              
              <div className="pt-2 mt-2 border-t border-gray-200">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 space-y-4">
              <button
                onClick={() => router.push('/orders')}
                className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200"
              >
                View All Orders
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="w-full text-white py-2 px-4 rounded-md bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-300"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}