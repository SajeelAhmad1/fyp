'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { formatDate } from '@/utils/checkoutUtils';

// Define TypeScript interfaces for your data structure
interface ProductImage {
  url: string;
}

interface Product {
  id: string;
  name: string;
  price: string;
  images: string[];
  description: string;
  shortDescription: string;
  discount: string;
  stock: number;
  sku: string;
  isFeatured: boolean;
  isBestChoice: boolean;
  categoryId: string;
  subcategoryId: string | null;
  vendorId: string | null;
  color: string[];
  size: string[];
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  quantity: number;
  price: string;
}

interface Payment {
  id: string;
  orderId: string;
  method: 'STRIPE' | 'PAYPAL';
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  amount?: number;
  createdAt: string;
  transactionId: string | null;
}

interface Order {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalPrice: string;
  userId: string;
  isGuestOrder: boolean;
  guestEmail: string | null;
  
  // Shipping information
  shippingFirstName: string;
  shippingLastName: string;
  shippingStreet: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  shippingPhone: string;
  
  // Billing information (may be null)
  billingFirstName: string | null;
  billingLastName: string | null;
  billingStreet: string | null;
  billingCity: string | null;
  billingState: string | null;
  billingPostalCode: string | null;
  billingCountry: string | null;
  
  // Related data
  items: OrderItem[];
  payment: Payment;
}

// Skeleton loading component for the order page
const OrderSkeleton = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header skeleton */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 w-1/3 mx-auto mb-4 rounded"></div>
          <div className="h-4 bg-gray-200 w-2/3 mx-auto mb-3 rounded"></div>
          <div className="h-3 bg-gray-200 w-1/2 mx-auto rounded"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Order items skeleton */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 w-1/4 mb-6 rounded"></div>
              
              {/* Item 1 */}
              <div className="flex items-center space-x-4 py-4 border-b">
                <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0"></div>
                <div className="flex-grow">
                  <div className="h-4 bg-gray-200 w-3/4 mb-2 rounded"></div>
                  <div className="h-3 bg-gray-200 w-1/4 rounded"></div>
                </div>
                <div className="w-16">
                  <div className="h-4 bg-gray-200 w-full rounded"></div>
                </div>
              </div>
              
              {/* Item 2 */}
              <div className="flex items-center space-x-4 py-4 border-b">
                <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0"></div>
                <div className="flex-grow">
                  <div className="h-4 bg-gray-200 w-1/2 mb-2 rounded"></div>
                  <div className="h-3 bg-gray-200 w-1/4 rounded"></div>
                </div>
                <div className="w-16">
                  <div className="h-4 bg-gray-200 w-full rounded"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Shipping info skeleton */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 w-3/4 mb-4 rounded"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 w-5/6 rounded"></div>
                  <div className="h-4 bg-gray-200 w-1/2 rounded"></div>
                  <div className="h-4 bg-gray-200 w-5/6 rounded"></div>
                  <div className="h-4 bg-gray-200 w-3/4 rounded"></div>
                </div>
              </div>
            </div>
            
            {/* Payment info skeleton */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 w-3/4 mb-4 rounded"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 w-2/3 rounded"></div>
                  <div className="h-4 bg-gray-200 w-1/2 rounded"></div>
                  <div className="h-4 bg-gray-200 w-3/4 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Order summary skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 w-1/2 mb-6 rounded"></div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 w-1/3 rounded"></div>
                  <div className="h-4 bg-gray-200 w-16 rounded"></div>
                </div>
                
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 w-1/4 rounded"></div>
                  <div className="h-4 bg-gray-200 w-16 rounded"></div>
                </div>
                
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 w-1/5 rounded"></div>
                  <div className="h-4 bg-gray-200 w-16 rounded"></div>
                </div>
                
                <div className="pt-2 mt-2 border-t border-gray-200">
                  <div className="flex justify-between mt-2">
                    <div className="h-5 bg-gray-200 w-1/4 rounded"></div>
                    <div className="h-5 bg-gray-200 w-20 rounded"></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 space-y-4">
                <div className="h-10 bg-gray-200 w-full rounded-md"></div>
                <div className="h-10 bg-gray-200 w-full rounded-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderId = params.id as string;
        const response = await fetch(`/api/orders/get-order-by-id/${orderId}`);
        const data = await response.json();
        
        if (response.ok) {
          setOrder(data.data);
          console.log(data);
        } else {
          toast.error(data.error || 'Failed to load order details');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('An error occurred while loading your order');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (params.id) {
      fetchOrder();
    }
  }, [params.id, router]);
  
  // Calculate subtotals and other metrics
  const calculateOrderDetails = (order: Order) => {
    const subtotal = order.items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    // Assuming 8% tax rate and $5 flat shipping - adjust according to your business rules
    const shippingCost = 5;
    const taxRate = 0.08;
    const tax = subtotal * taxRate;
    const total = parseFloat(order.totalPrice);
    
    return { subtotal, shippingCost, tax, total };
  };
  
  // Calculate discounted price if available
  const getDiscountedPrice = (originalPrice: string, discount: string) => {
    if (!discount || discount === "0") return parseFloat(originalPrice);
    
    const discountPercent = parseFloat(discount);
    const price = parseFloat(originalPrice);
    return price - (price * (discountPercent / 100));
  };
  
  if (isLoading) {
    return <OrderSkeleton />;
  }
  
  if (!order) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Order not found</h1>
        <p className="mb-8">We couldn't find the order you're looking for.</p>
        <button
          onClick={() => router.push('/')}
          className="bg-blue-600 text-white py-2 px-4 rounded-md"
        >
          Return to Home
        </button>
      </div>
    );
  }
  
  const { subtotal, shippingCost, tax, total } = calculateOrderDetails(order);
  
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
                    {item.product.images && item.product.images.length > 0 ? (
                      <Image
                        src={item.product.images[0]}
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
                    {item.product.discount && parseFloat(item.product.discount) > 0 && (
                      <p className="text-xs text-green-600">Discount: {item.product.discount}%</p>
                    )}
                  </div>
                  
                  <div className="text-right">
                    {item.product.discount && parseFloat(item.product.discount) > 0 ? (
                      <>
                        <p className="font-medium">${(getDiscountedPrice(item.price, item.product.discount) * item.quantity).toFixed(2)}</p>
                        <p className="text-xs text-gray-500 line-through">${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                      </>
                    ) : (
                      <p className="font-medium">${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                    )}
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
                  <span className="font-medium">Name:</span> {order.shippingFirstName} {order.shippingLastName}
                </p>
                <p>
                  <span className="font-medium">Phone:</span> {order.shippingPhone}
                </p>
                <p>
                  <span className="font-medium">Address:</span>
                  <br />
                  {order.shippingStreet}
                  <br />
                  {order.shippingCity}, {order.shippingState} {order.shippingPostalCode}
                  <br />
                  {order.shippingCountry}
                </p>
              </div>
            </div>
            
            {/* Payment Information */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Payment Method:</span>{' '}
                  {order.payment.method === 'STRIPE' ? 'Credit/Debit Card' : 'PayPal'}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{' '}
                  <span className={`font-medium ${order.payment.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {order.payment.status === 'COMPLETED' ? 'Paid' : 'Pending'}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Order Status:</span>{' '}
                  <span className="font-medium text-blue-600">{order.status}</span>
                </p>
                {order.payment.transactionId && (
                  <p>
                    <span className="font-medium">Transaction ID:</span>{' '}
                    <span className="text-sm font-mono">{order.payment.transactionId}</span>
                  </p>
                )}
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
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>${shippingCost.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              
              <div className="pt-2 mt-2 border-t border-gray-200">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
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