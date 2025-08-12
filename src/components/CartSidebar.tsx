"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from './context/CartContext';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number | string;
  discount: number | string | null;
  images: string[];
  stock: number;
  color: string[];
  size: string[];
}

interface CartItem {
  id: string;
  quantity: number;
  product: Product;
  productId: string;
}

interface Cart {
  id: string;
  userId: string | null;
  items: CartItem[];
  isGuestCart?: boolean;
}

const GUEST_CART_KEY = 'guestCartId';
const GUEST_EMAIL_KEY = 'guestEmail';

const CartSidebar = () => {
  const { isCartOpen, closeCart } = useCart();
  const { data: session, status } = useSession();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockError, setStockError] = useState<string | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const router = useRouter();

  const getGuestCartId = useCallback(() => {
    return typeof window !== 'undefined' ? localStorage.getItem(GUEST_CART_KEY) : null;
  }, []);

  const setGuestCartId = useCallback((cartId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(GUEST_CART_KEY, cartId);
    }
  }, []);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = session?.user?.id;
      const guestCartId = getGuestCartId();

      if (!userId && !guestCartId) {
        setCart({ id: '', userId: null, items: [] });
        return;
      }

      const response = await fetch(`/api/cart?${userId ? `userId=${userId}` : `guestCartId=${guestCartId}`}`, {
        headers: { 'Cache-Control': 'no-cache' }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      const { data, cartId, isGuestCart } = await response.json();

      if (isGuestCart && cartId && !guestCartId) {
        setGuestCartId(cartId);
      }

      setCart(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, getGuestCartId, setGuestCartId]);

  useEffect(() => {
    if (isCartOpen && status !== 'loading') {
      fetchCart();
    }
  }, [isCartOpen, status, fetchCart]);

  const removeItem = async (itemId: string) => {
    const userId = session?.user?.id;
    const guestCartId = getGuestCartId();

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(userId ? { userId } : { guestCartId })
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove item');
      }

      if (cart) {
        const updatedItems = cart.items.filter(item => item.id !== itemId);
        setCart({ ...cart, items: updatedItems });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    const userId = session?.user?.id;
    const guestCartId = getGuestCartId();

    const requestBody = {
      ...(userId ? { userId } : { guestCartId }),
      productId,
      quantity: newQuantity - (cart?.items.find(item => item.productId === productId)?.quantity || 0)
    };

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update cart');
      }

      if (cart) {
        const updatedItems = cart.items.map(item =>
          item.productId === productId
            ? { ...item, quantity: newQuantity }
            : item
        );
        setCart({ ...cart, items: updatedItems });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const cartCalculations = useCallback(() => {
    if (!cart?.items.length) return { total: 0, items: [] };

    const calculatedItems = cart.items.map(item => {
      const price = typeof item.product.price === 'string'
        ? parseFloat(item.product.price)
        : item.product.price;

      const discountPercentage = item.product.discount
        ? (typeof item.product.discount === 'string'
          ? parseFloat(item.product.discount)
          : item.product.discount)
        : 0;

      const priceAfterDiscount = price * (1 - discountPercentage / 100);
      const itemTotal = priceAfterDiscount * item.quantity;

      return {
        ...item,
        price,
        discountPercentage,
        priceAfterDiscount,
        itemTotal
      };
    });

    const total = calculatedItems.reduce((sum, item) => sum + item.itemTotal, 0);

    return { total, items: calculatedItems };
  }, [cart]);

  const checkProductStock = useCallback(() => {
    if (!cart || cart.items.length === 0) return true;

    const outOfStockItems = cart.items.filter(item => 
      item.quantity > item.product.stock
    );

    if (outOfStockItems.length > 0) {
      const errorMessage = outOfStockItems.map(item => 
        `${item.product.name} - Available: ${item.product.stock}, Requested: ${item.quantity}`
      ).join('; ');
      
      setStockError(`Some items are out of stock: ${errorMessage}`);
      return false;
    }

    return true;
  }, [cart]);

  const createOrderAndProceedToCheckout = useCallback(async (guestEmail?: string) => {
    if (!checkProductStock()) {
      return;
    }

    if (!cart || cart.items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    try {
      setIsCreatingOrder(true);
      setError(null);
      setStockError(null);

      if (!session?.user && !guestEmail) {
        throw new Error('Email is required for guest checkout');
      }

      if (guestEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(guestEmail)) {
          throw new Error('Please enter a valid email address');
        }
      }

      const orderItems = cart.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: typeof item.product.price === 'string'
          ? parseFloat(item.product.price)
          : item.product.price,
        discountPercentage: item.product.discount
          ? (typeof item.product.discount === 'string'
            ? parseFloat(item.product.discount)
            : item.product.discount)
          : 0
      }));

      const requestBody = {
        items: orderItems,
        ...(session?.user
          ? { userId: session.user.id }
          : { guestEmail: guestEmail?.toLowerCase().trim() })
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to create order');
      }

      const { data } = await response.json();

      closeCart();
      router.push(`/checkout?orderId=${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setIsCreatingOrder(false);
    }
  }, [cart, session, router, checkProductStock, closeCart]);

  const handleProceedToCheckout = () => {
    setStockError(null);

    if (checkProductStock()) {
      if (session?.user) {
        createOrderAndProceedToCheckout();
      } else {
        setShowEmailModal(true);
      }
    }
  };

  const handleEmailSubmit = () => {
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');
    localStorage.setItem(GUEST_EMAIL_KEY, email.toLowerCase().trim());
    createOrderAndProceedToCheckout(email);
    setShowEmailModal(false)
  };

  const calculations = cartCalculations();

  return (
    <>
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeCart}
        />
      )}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-2/5 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold">Your Cart</h2>
            <button 
              onClick={closeCart}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 p-4">{error}</div>
            ) : stockError ? (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded relative mb-4">
                <strong className="font-bold">Stock Issue: </strong>
                <span className="block sm:inline">{stockError}</span>
              </div>
            ) : !cart || cart.items.length === 0 ? (
              <div className="text-center py-8">
                <p>Your cart is empty</p>
                <button 
                  onClick={() => {
                    closeCart();
                    router.push('/products');
                  }}
                  className="mt-4 px-4 py-2 text-white rounded bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-300"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {calculations.items.map((item) => (
                  <div key={item.id} className="flex items-start border-b pb-4">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      {item.product.images && item.product.images.length > 0 ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <div className="flex items-center mt-1">
                        <span className="text-gray-900 font-medium">
                          £{item.priceAfterDiscount.toFixed(2)}
                        </span>
                        {item.discountPercentage > 0 && (
                          <span className="ml-2 text-sm text-gray-500 line-through">
                            £{item.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center mt-2">
                        <button
                          onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 border rounded flex items-center justify-center"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="mx-2">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 border rounded flex items-center justify-center"
                          disabled={item.quantity >= item.product.stock}
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-4 text-red-500 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      {item.discountPercentage > 0 && (
                        <div className="mt-1 text-sm text-green-600">
                          You save £{(item.price * item.quantity - item.itemTotal).toFixed(2)} ({item.discountPercentage}% off)
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart?.items.length && cart?.items.length > 0 && (
            <div className="border-t p-4">
              <div className="flex justify-between mb-4">
                <span className="font-medium">Subtotal</span>
                <span className="font-bold">${calculations.total.toFixed(2)}</span>
              </div>
              <button
                onClick={handleProceedToCheckout}
                disabled={isCreatingOrder}
                className="w-full py-2 bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-300 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isCreatingOrder ? 'Creating Order...' : 'Proceed to Checkout'}
              </button>
              <button
                onClick={() => {
                  closeCart();
                  router.push('/cart');
                }}
                className="w-full mt-2 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                View Full Cart
              </button>
            </div>
          )}
        </div>
      </div>

      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Enter Your Email</h3>
            <p className="text-gray-600 mb-4">Please provide your email address to proceed with checkout.</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full p-2 border border-gray-300 rounded mb-2"
            />
            {emailError && <p className="text-red-500 text-sm mb-2">{emailError}</p>}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleEmailSubmit}
                className="px-4 py-2 bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-300 text-white rounded hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CartSidebar;