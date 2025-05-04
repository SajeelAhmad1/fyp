"use client"

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
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

const CartDisplay: React.FC = () => {
    const { data: session, status } = useSession();
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stockError, setStockError] = useState<string | null>(null);
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const router = useRouter();

    const getGuestCartId = useCallback(() => {
        return typeof window !== 'undefined' ? localStorage.getItem(GUEST_CART_KEY) : null;
    }, []);

    const setGuestCartId = useCallback((cartId: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(GUEST_CART_KEY, cartId);
        }
    }, []);

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
        if (status !== 'loading') {
            fetchCart();
        }
    }, [status, fetchCart]);

    const updateQuantity = useCallback(async (productId: string, newQuantity: number) => {
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
    }, [cart, session?.user?.id, getGuestCartId]);

    const removeItem = useCallback(async (itemId: string) => {
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
    }, [cart, session?.user?.id, getGuestCartId]);

    const cartCalculations = useMemo(() => {
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


    const handleProceedToCheckout = () => {
        setStockError(null);

        if (checkProductStock()) {
            router.push("/checkout")
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading your cart...</div>;
    }

    if (error) {
        return <div className="text-red-500 p-4 bg-red-50 rounded">{error}</div>;
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <h2 className="text-xl font-semibold mb-4">Your Cart is Empty</h2>
                <p className="text-gray-600 mb-4">Add some products to your cart to see them here.</p>
                <button
                    onClick={() => router.push('/products')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-12">
            {/* Display stock error if there is one */}
            {stockError && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Stock Issue: </strong>
                    <span className="block sm:inline">{stockError}</span>
                </div>
            )}

            {error && <div className="text-red-500 mb-20 bg-red-50 rounded">{error}</div>}

            <div className="divide-y divide-gray-200">
                {cartCalculations.items.map((item) => (
                    <div key={item.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center">
                        <div className="w-full sm:w-20 h-20 relative mb-4 sm:mb-0">
                            {item.product.images && item.product.images.length > 0 ? (
                                <Image
                                    src={item.product.images[0]}
                                    alt={item.product.name}
                                    fill
                                    sizes="80px"
                                    className="object-cover rounded"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                                    <span className="text-gray-400">No image</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-grow px-4">
                            <h3 className="font-medium">{item.product.name}</h3>
                            <p className="text-gray-500 text-sm">{item.product.shortDescription}</p>

                            {item.product.color && item.product.color.length > 0 && (
                                <div className="flex items-center mt-1">
                                    <span className="text-gray-500 text-xs mr-2">Color:</span>
                                    <span className="text-gray-700 text-xs">{item.product.color.join(', ')}</span>
                                </div>
                            )}

                            {item.product.size && item.product.size.length > 0 && (
                                <div className="flex items-center mt-1">
                                    <span className="text-gray-500 text-xs mr-2">Size:</span>
                                    <span className="text-gray-700 text-xs">{item.product.size.join(', ')}</span>
                                </div>
                            )}

                            <div className="mt-1">
                                {item.discountPercentage > 0 ? (
                                    <div className="flex items-center">
                                        <p className="text-gray-700 font-medium">£{item.priceAfterDiscount.toFixed(2)}</p>
                                        <p className="text-gray-400 line-through text-sm ml-2">£{item.price.toFixed(2)}</p>
                                        <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded">
                                            {item.discountPercentage}% OFF
                                        </span>
                                    </div>
                                ) : (
                                    <p className="text-gray-700 font-medium">£{item.price.toFixed(2)}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center mt-4 sm:mt-0">
                            <div className="flex items-center border border-gray-300 rounded">
                                <button
                                    onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                                    className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                    disabled={item.quantity <= 1}
                                >
                                    -
                                </button>
                                <span className="px-3 py-1">{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                    className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                    disabled={item.quantity >= item.product.stock}
                                >
                                    +
                                </button>
                            </div>

                            <button
                                onClick={() => removeItem(item.id)}
                                className="ml-4 text-red-500 hover:text-red-700"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>£{cartCalculations.total.toFixed(2)}</span>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleProceedToCheckout}
                        disabled={isCreatingOrder}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                        {isCreatingOrder ? 'Creating Order...' : 'Proceed to Checkout'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartDisplay;