'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { formatDate } from '@/utils/checkoutUtils';

interface Product {
  id: string;
  name: string;
  imageUrl: string | null;
  price: number;
}

interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
}

interface Address {
  fullName: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

interface PaymentMethod {
  type: 'card' | 'paypal';
  status?: string;
}

interface Order {
  id: string;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address | null;
  paymentMethod: PaymentMethod | null;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  status: string;
  isGuestOrder: boolean;
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
        const result = await response.json();
        
        if (response.ok) {
          setOrder(result.data);
        } else {
          toast.error(result.error || 'Failed to load order details');
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('An error occurred while loading your order');
        router.push('/');
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
  console.log(order)
  
  if (!order) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Order not found</h1>
        <p className="mb-8">We could not find the order you are looking for.</p>
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
                        unoptimized
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
                    <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
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
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  <br />
                  {order.shippingAddress.country}
                </p>
                {order.shippingAddress.phone && (
                  <p>
                    <span className="font-medium">Phone:</span> {order.shippingAddress.phone}
                  </p>
                )}
              </div>
            </div>
            
            {/* Payment Information */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
              <div className="space-y-2">
                {order.paymentMethod ? (
                  <>
                    <p>
                      <span className="font-medium">Payment Method:</span>{' '}
                      {order.paymentMethod.type === 'paypal' ? 'PayPal' : 'Credit/Debit Card'}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{' '}
                      <span className={
                        order.paymentMethod.status === 'COMPLETED' ? 
                        'text-green-600 font-medium' : 
                        'text-yellow-600 font-medium'
                      }>
                        {order.paymentMethod.status || 'PENDING'}
                      </span>
                    </p>
                  </>
                ) : (
                  <p className="text-yellow-600">Payment information not available</p>
                )}
                <p>
                  <span className="font-medium">Order Status:</span>{' '}
                  <span className={
                    order.status === 'DELIVERED' ? 'text-green-600' :
                    order.status === 'CANCELLED' ? 'text-red-600' :
                    'text-blue-600'
                  }>
                    {order.status}
                  </span>
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
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
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