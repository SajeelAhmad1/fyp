"use client"

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { OrderStatus } from '@prisma/client';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from './stripePatmentForm';
import { Order, CustomerProfile } from '@/types/checkout';
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const GUEST_EMAIL_KEY = 'guestEmail';
const GUEST_CART_ID_KEY = 'guestCartId';

const CheckoutPage = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    const [order, setOrder] = useState<Order | null>(null);
    const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [stripeCustId, setStripeCustId] = useState<string | null>(null);
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [cartTotal, setCartTotal] = useState<number>(0);
    
    const paymentIntentCreatingRef = useRef(false);

    const [formData, setFormData] = useState({
        shippingFirstName: '',
        shippingLastName: '',
        shippingStreet: '',
        shippingCity: '',
        shippingState: '',
        shippingPostalCode: '',
        shippingCountry: 'United Kingdom',
        shippingPhone: '',

        useSameAddress: true,
        billingFirstName: '',
        billingLastName: '',
        billingStreet: '',
        billingCity: '',
        billingState: '',
        billingPostalCode: '',
        billingCountry: 'United Kingdom',

        paymentMethod: 'STRIPE',
        email: '',

        cardNumber: '',
        cardExpiry: '',
        cardCVV: '',
        cardName: ''
    });

    const [formErrors, setFormErrors] = useState({
        shippingFirstName: false,
        shippingLastName: false,
        shippingStreet: false,
        shippingCity: false,
        shippingState: false,
        shippingPostalCode: false,
        shippingCountry: false,
        shippingPhone: false,
        billingFirstName: false,
        billingLastName: false,
        billingStreet: false,
        billingCity: false,
        billingState: false,
        billingPostalCode: false,
        billingCountry: false,
        email: false
    });

    const getGuestCartId = useCallback(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(GUEST_CART_ID_KEY);
        }
        return null;
    }, []);

    const validateForm = () => {
        const newErrors = {
            shippingFirstName: !formData.shippingFirstName.trim(),
            shippingLastName: !formData.shippingLastName.trim(),
            shippingStreet: !formData.shippingStreet.trim(),
            shippingCity: !formData.shippingCity.trim(),
            shippingState: !formData.shippingState.trim(),
            shippingPostalCode: !formData.shippingPostalCode.trim(),
            shippingCountry: !formData.shippingCountry.trim(),
            shippingPhone: !formData.shippingPhone.trim() || formData.shippingPhone.length !== 10, // Must be exactly 10 digits
            billingFirstName: !formData.useSameAddress && !formData.billingFirstName.trim(),
            billingLastName: !formData.useSameAddress && !formData.billingLastName.trim(),
            billingStreet: !formData.useSameAddress && !formData.billingStreet.trim(),
            billingCity: !formData.useSameAddress && !formData.billingCity.trim(),
            billingState: !formData.useSameAddress && !formData.billingState.trim(),
            billingPostalCode: !formData.useSameAddress && !formData.billingPostalCode.trim(),
            billingCountry: !formData.useSameAddress && !formData.billingCountry.trim(),
            email: !formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)
        };

        setFormErrors(newErrors);

        if (Object.values(newErrors).some(error => error)) {
            const firstErrorField = Object.keys(newErrors).find(key => newErrors[key as keyof typeof newErrors]);
            if (firstErrorField) {
                document.getElementById(firstErrorField)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
            return false;
        }
        return true;
    };

    const createPaymentIntent = async (amount: number, orderIdParam?: string) => {
        if (paymentIntentCreatingRef.current || clientSecret) {
            return;
        }
        
        try {
            paymentIntentCreatingRef.current = true;
            console.log("Creating payment intent with amount:", amount);
            
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: Math.round(amount * 100),
                    currency: 'gbp',
                    orderId: orderIdParam,
                    email: formData.email || session?.user?.email,
                }),
            });
                        
            const responseData = await response.json();
            
            if (responseData.clientSecret) {
                setClientSecret(responseData.clientSecret);
            } else {
                throw new Error("No client secret returned");
            }
        } catch (err) {
            console.error("Payment intent error:", err);
            setError("Failed to initialize payment: " + (err instanceof Error ? err.message : String(err)));
        } finally {
            paymentIntentCreatingRef.current = false;
        }
    };

    const fetchCustomerProfile = async () => {
        if (!session?.user?.id) return;

        try {
            const response = await fetch('/api/customer-profile');

            if (!response.ok) {
                return;
            }

            const { data } = await response.json();
            setCustomerProfile(data);
        } catch (err) {
            console.error('Error fetching customer profile:', err);
        }
    };

    const fetchOrder = async () => {
        if (!orderId) {
            return;
        }

        try {
            const queryParams = new URLSearchParams();

            if (session?.user?.id) {
                queryParams.append('userId', session.user.id);
            } else {
                const guestEmail = localStorage.getItem(GUEST_EMAIL_KEY);
                if (guestEmail) {
                    queryParams.append('guestEmail', guestEmail);
                } else {
                    throw new Error('Guest email is required for guest checkout');
                }
            }

            const response = await fetch(`/api/orders/${orderId}?${queryParams.toString()}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.message || 'Failed to fetch order');
            }

            const { data } = await response.json();
            setOrder(data);

            if (data) {
                const phone = data.shippingPhone?.startsWith('+44')
                    ? data.shippingPhone.substring(3)
                    : data.shippingPhone || '';

                setFormData(prev => ({
                    ...prev,
                    shippingFirstName: data.shippingFirstName || '',
                    shippingLastName: data.shippingLastName || '',
                    shippingStreet: data.shippingStreet || '',
                    shippingCity: data.shippingCity || '',
                    shippingState: data.shippingState || '',
                    shippingPostalCode: data.shippingPostalCode || '',
                    shippingCountry: data.shippingCountry || '',
                    shippingPhone: phone,

                    billingFirstName: data.billingFirstName || '',
                    billingLastName: data.billingLastName || '',
                    billingStreet: data.billingStreet || '',
                    billingCity: data.billingCity || '',
                    billingState: data.billingState || '',
                    billingPostalCode: data.billingPostalCode || '',
                    billingCountry: data.billingCountry || '',

                    email: data.email || (session?.user?.email || ''),
                    paymentMethod: 'STRIPE'
                }));
                
                if (data.totalPrice > 0 && !clientSecret) {
                    await createPaymentIntent(data.totalPrice, data.id);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while loading your order');
        }
    };

    const fetchCart = async () => {
        try {
            const userId = session?.user?.id;
            const guestCartId = getGuestCartId();

            if (!userId && !guestCartId) {
                throw new Error('No cart identified');
            }

            const response = await fetch(`/api/cart?${userId ? `userId=${userId}` : `guestCartId=${guestCartId}`}`, {
                headers: { 'Cache-Control': 'no-cache' }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch cart');
            }

            const { data: cartData } = await response.json();
            setCartItems(cartData.items || []);
            
            if (!cartData?.items) {
                console.log('Your cart is empty');
            }

            const calculatedTotal = cartData.items?.reduce((sum, item) => {
                const price = typeof item.product?.price === 'string'
                    ? parseFloat(item.product.price)
                    : (item.product?.price || 0);

                const quantity = item.quantity || 0;
                return sum + (price * quantity);
            }, 0);
            
            setCartTotal(calculatedTotal || 0);

            if (!orderId && calculatedTotal > 0 && !clientSecret) {
                await createPaymentIntent(calculatedTotal);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load your cart');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === "shippingPhone") {
            const digitsOnly = value.replace(/\D/g, '');

            if (digitsOnly.length > 10) {
                return;
            }

            setFormData(prev => ({
                ...prev,
                [name]: digitsOnly
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        if (formErrors[name as keyof typeof formErrors]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: false
            }));
        }
    };

    const handleSameAddressToggle = () => {
        const useSameAddress = !formData.useSameAddress;
        setFormData(prev => ({
            ...prev,
            useSameAddress,
            billingFirstName: useSameAddress ? prev.shippingFirstName : '',
            billingLastName: useSameAddress ? prev.shippingLastName : '',
            billingStreet: useSameAddress ? prev.shippingStreet : '',
            billingCity: useSameAddress ? prev.shippingCity : '',
            billingState: useSameAddress ? prev.shippingState : '',
            billingPostalCode: useSameAddress ? prev.shippingPostalCode : '',
            billingCountry: useSameAddress ? prev.shippingCountry : ''
        }));

        if (useSameAddress) {
            setFormErrors(prev => ({
                ...prev,
                billingFirstName: false,
                billingLastName: false,
                billingStreet: false,
                billingCity: false,
                billingState: false,
                billingPostalCode: false,
                billingCountry: false
            }));
        }
    };

    const formatPrice = (price: number | string | null | undefined): string => {
        if (price === null || price === undefined) return "0.00";
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
    };

    const createOrderFromCart = async () => {
        setIsCreatingOrder(true);
        setError(null);

        try {
            const userId = session?.user?.id;
            const guestEmail = formData.email || localStorage.getItem(GUEST_EMAIL_KEY);

            if (!userId && !guestEmail) {
                throw new Error('Email is required for guest checkout');
            }

            if (!cartItems || cartItems.length === 0) {
                throw new Error('Your cart is empty');
            }

            if (!userId && formData.email) {
                localStorage.setItem(GUEST_EMAIL_KEY, formData.email);
            }

            const orderItems = cartItems.map(item => ({
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

            const orderPayload = {
                items: orderItems,
                ...(userId
                    ? { userId }
                    : { guestEmail: formData.email.toLowerCase().trim() }),
                shippingFirstName: formData.shippingFirstName,
                shippingLastName: formData.shippingLastName,
                shippingStreet: formData.shippingStreet,
                shippingCity: formData.shippingCity,
                shippingState: formData.shippingState,
                shippingPostalCode: formData.shippingPostalCode,
                // shippingCountry: formData.shippingCountry,
                shippingCountry: "United Kingdom",
                shippingPhone: formData.shippingPhone ? `+44${formData.shippingPhone}` : '',
                billingFirstName: formData.useSameAddress ? null : formData.billingFirstName,
                billingLastName: formData.useSameAddress ? null : formData.billingLastName,
                billingStreet: formData.useSameAddress ? null : formData.billingStreet,
                billingCity: formData.useSameAddress ? null : formData.billingCity,
                billingState: formData.useSameAddress ? null : formData.billingState,
                billingPostalCode: formData.useSameAddress ? null : formData.billingPostalCode,
                billingCountry: formData.useSameAddress ? null : formData.billingCountry,
                email: formData.email,
                paymentMethod: 'STRIPE',
                status: OrderStatus.CONFIRMED
            };

            const orderResponse = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderPayload),
            });

            if (!orderResponse.ok) {
                const errorData = await orderResponse.json();
                throw new Error(errorData.error || errorData.message || 'Failed to create order');
            }

            const { data } = await orderResponse.json();

            return data.id;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create order');
            return null;
        } finally {
            setIsCreatingOrder(false);
        }
    };

    const handlePaymentSuccess = async (): Promise<string | null> => {
        try {
            const newOrderId = await createOrderFromCart();

            if (!newOrderId) {
                throw new Error('Failed to create order');
            }

            if (!session?.user?.id) {
                localStorage.removeItem(GUEST_CART_ID_KEY);
            }

            return newOrderId;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Payment processing failed');
            return null;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                await fetchCustomerProfile();

                if (orderId) {
                    await fetchOrder();
                } else {
                    await fetchCart();
                }
            } catch (error) {
                setError(error instanceof Error ? error.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [session?.user?.id, orderId]); 

    useEffect(() => {
        if (customerProfile && !formData.shippingFirstName) {
            setFormData(prev => ({
                ...prev,
                shippingFirstName: customerProfile.firstName || '',
                shippingLastName: customerProfile.lastName || '',
                shippingStreet: customerProfile.streetAddress || '',
                shippingCity: customerProfile.city || '',
                shippingState: customerProfile.state || '',
                shippingPostalCode: customerProfile.postalCode || '',
                shippingCountry: customerProfile.country || '',
                shippingPhone: customerProfile.phone || '',
                email: session?.user?.email || ''
            }));
        }
    }, [customerProfile, session]);

    if (loading || isCreatingOrder) {
        return <div className="flex justify-center items-center h-64">Loading checkout...</div>;
    }

    if (error) {
        return (
            <div className="p-12 mx-auto">
                <div className="text-red-500 p-4 bg-red-50 rounded">{error}</div>
                <div className="text-center mt-4">
                    <button
                        onClick={() => router.push('/cart')}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        Return to Cart
                    </button>
                </div>
            </div>
        );
    }

    if (!cartItems.length) {
        return (
            <div className="p-12 mx-auto">
                <div className="bg-white p-6 rounded-lg text-center">
                    <h2 className="text-xl font-semibold mb-4">Your Cart is Empty</h2>
                    <p className="text-gray-600 mb-4">There are no items in your cart to checkout.</p>
                    <button
                        onClick={() => router.push('/products')}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    // Determine which items and total price to display based on whether we have an order or cart
    const displayItems = order ? order.items : cartItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.product.price * item.quantity,
        product: item.product
    }));

    const displayTotal = order ? order.totalPrice : cartTotal;

    return (
        <div className="p-12 mx-auto">
            <div className="bg-white p-6 rounded-lg mb-6">
                <h1 className="text-2xl font-semibold mb-6">Checkout</h1>

                {clientSecret ? (
                    <Elements
                        stripe={stripePromise}
                        options={{
                            clientSecret,
                            appearance: {
                                theme: 'stripe',
                                variables: {
                                    colorPrimary: '#0570de',
                                    colorBackground: '#ffffff',
                                    colorText: '#30313d',
                                    colorDanger: '#df1b41',
                                    fontFamily: 'Ideal Sans, system-ui, sans-serif',
                                    spacingUnit: '2px',
                                    borderRadius: '4px'
                                }
                            }
                        }}
                    >
                        <div className="mb-6">
                            <h2 className="text-lg font-medium mb-3">Order Summary</h2>
                            <div className="border rounded-md overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Product</th>
                                            <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Qty</th>
                                            <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {displayItems.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center">
                                                        <div className="w-12 h-12 relative mr-3">
                                                            {item.product.images && item.product.images.length > 0 ? (
                                                                <Image
                                                                    src={item.product.images[0]}
                                                                    alt={item.product.name}
                                                                    fill
                                                                    sizes="48px"
                                                                    className="object-cover rounded"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                                                                    <span className="text-gray-400 text-xs">No image</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm">{item.product.name}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right">${formatPrice(item.price)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr>
                                            <td colSpan={2} className="px-4 py-3 text-right font-semibold">Total:</td>
                                            <td className="px-4 py-3 text-right font-semibold">${formatPrice(displayTotal)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Shipping Details Section */}
                        <div className="mb-6">
                            <h2 className="text-lg font-medium mb-3">Shipping Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="shippingFirstName" className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="shippingFirstName"
                                        name="shippingFirstName"
                                        placeholder="Enter First Name"
                                        value={formData.shippingFirstName}
                                        onChange={handleInputChange}
                                        className={`w-full p-2 border ${formErrors.shippingFirstName ? 'border-red-500' : 'border-gray-300'} rounded`}
                                        required
                                    />
                                    {formErrors.shippingFirstName && <p className="text-red-500 text-xs mt-1">First name is required</p>}
                                </div>
                                <div>
                                    <label htmlFor="shippingLastName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="shippingLastName"
                                        name="shippingLastName"
                                        placeholder="Enter Last Name"
                                        value={formData.shippingLastName}
                                        onChange={handleInputChange}
                                        className={`w-full p-2 border ${formErrors.shippingLastName ? 'border-red-500' : 'border-gray-300'} rounded`}
                                        required
                                    />
                                    {formErrors.shippingLastName && <p className="text-red-500 text-xs mt-1">Last name is required</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="shippingStreet" className="block text-sm font-medium text-gray-700 mb-1">
                                        Street Address *
                                    </label>
                                    <input
                                        type="text"
                                        id="shippingStreet"
                                        name="shippingStreet"
                                        placeholder="Enter Street Address"
                                        value={formData.shippingStreet}
                                        onChange={handleInputChange}
                                        className={`w-full p-2 border ${formErrors.shippingStreet ? 'border-red-500' : 'border-gray-300'} rounded`}
                                        required
                                    />
                                    {formErrors.shippingStreet && <p className="text-red-500 text-xs mt-1">Street address is required</p>}
                                </div>
                                <div>
                                    <label htmlFor="shippingCity" className="block text-sm font-medium text-gray-700 mb-1">
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        id="shippingCity"
                                        name="shippingCity"
                                        placeholder="Enter City"
                                        value={formData.shippingCity}
                                        onChange={handleInputChange}
                                        className={`w-full p-2 border ${formErrors.shippingCity ? 'border-red-500' : 'border-gray-300'} rounded`}
                                        required
                                    />
                                    {formErrors.shippingCity && <p className="text-red-500 text-xs mt-1">City is required</p>}
                                </div>
                                <div>
                                    <label htmlFor="shippingState" className="block text-sm font-medium text-gray-700 mb-1">
                                        State/Province *
                                    </label>
                                    <input
                                        type="text"
                                        id="shippingState"
                                        name="shippingState"
                                        placeholder="Enter State/Province"
                                        value={formData.shippingState}
                                        onChange={handleInputChange}
                                        className={`w-full p-2 border ${formErrors.shippingState ? 'border-red-500' : 'border-gray-300'} rounded`}
                                        required
                                    />
                                    {formErrors.shippingState && <p className="text-red-500 text-xs mt-1">State/Province is required</p>}
                                </div>
                                <div>
                                    <label htmlFor="shippingPostalCode" className="block text-sm font-medium text-gray-700 mb-1">
                                        Postal Code *
                                    </label>
                                    <input
                                        type="text"
                                        id="shippingPostalCode"
                                        name="shippingPostalCode"
                                        placeholder="Enter Postal Code"
                                        value={formData.shippingPostalCode}
                                        onChange={handleInputChange}
                                        className={`w-full p-2 border ${formErrors.shippingPostalCode ? 'border-red-500' : 'border-gray-300'} rounded`}
                                        required
                                    />
                                    {formErrors.shippingPostalCode && <p className="text-red-500 text-xs mt-1">Postal code is required</p>}
                                </div>
                                <div>
                                    <label htmlFor="shippingCountry" className="block text-sm font-medium text-gray-700 mb-1">
                                        Country *
                                    </label>
                                    <select
                                        id="shippingCountry"
                                        name="shippingCountry"
                                        value="United Kingdom"
                                        // onChange={handleInputChange}
                                        className={`w-full p-2 border ${formErrors.shippingCountry ? 'border-red-500' : 'border-gray-300'} rounded`}
                                        required
                                    >
                                        <option value="United Kingdom">United Kingdom</option>
                                    </select>
                                    {formErrors.shippingCountry && <p className="text-red-500 text-xs mt-1">Country is required</p>}
                                </div>
                                <div>
                                    <label htmlFor="shippingPhone" className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number * (digits only)
                                    </label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l">
                                            +44
                                        </span>
                                        <input
                                            type="tel"
                                            id="shippingPhone"
                                            name="shippingPhone"
                                            placeholder="1234567890"
                                            value={formData.shippingPhone}
                                            onChange={handleInputChange}
                                            className={`w-full p-2 border ${formErrors.shippingPhone ? 'border-red-500' : 'border-gray-300'} rounded-r`}
                                            required
                                        />
                                    </div>
                                    {formErrors.shippingPhone && (
                                        <p className="text-red-500 text-xs mt-1">
                                            Please enter a valid 10-digit phone number
                                        </p>
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="Enter Email Address"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`w-full p-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded`}
                                        required
                                    />
                                    {formErrors.email && <p className="text-red-500 text-xs mt-1">Please enter a valid email address</p>}
                                </div>
                            </div>
                        </div>

                        {/* Billing Address Section */}
                        <div className="mb-6">
                            <div className="flex items-center mb-3">
                                <h2 className="text-lg font-medium">Billing Address</h2>
                                <div className="ml-auto flex items-center">
                                    <input
                                        type="checkbox"
                                        id="useSameAddress"
                                        checked={formData.useSameAddress}
                                        onChange={handleSameAddressToggle}
                                        className="mr-2"
                                    />
                                    <label htmlFor="useSameAddress" className="text-sm">Same as shipping address</label>
                                </div>
                            </div>

                            {!formData.useSameAddress && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="billingFirstName" className="block text-sm font-medium text-gray-700 mb-1">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="billingFirstName"
                                            name="billingFirstName"
                                            placeholder="Enter First Name"
                                            value={formData.billingFirstName}
                                            onChange={handleInputChange}
                                            className={`w-full p-2 border ${formErrors.billingFirstName ? 'border-red-500' : 'border-gray-300'} rounded`}
                                            required
                                        />
                                        {formErrors.billingFirstName && <p className="text-red-500 text-xs mt-1">First name is required</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="billingLastName" className="block text-sm font-medium text-gray-700 mb-1">
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="billingLastName"
                                            name="billingLastName"
                                            placeholder="Enter Last Name"
                                            value={formData.billingLastName}
                                            onChange={handleInputChange}
                                            className={`w-full p-2 border ${formErrors.billingLastName ? 'border-red-500' : 'border-gray-300'} rounded`}
                                            required
                                        />
                                        {formErrors.billingLastName && <p className="text-red-500 text-xs mt-1">Last name is required</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label htmlFor="billingStreet" className="block text-sm font-medium text-gray-700 mb-1">
                                            Street Address *
                                        </label>
                                        <input
                                            type="text"
                                            id="billingStreet"
                                            name="billingStreet"
                                            placeholder="Enter Street Address"
                                            value={formData.billingStreet}
                                            onChange={handleInputChange}
                                            className={`w-full p-2 border ${formErrors.billingStreet ? 'border-red-500' : 'border-gray-300'} rounded`}
                                            required
                                        />
                                        {formErrors.billingStreet && <p className="text-red-500 text-xs mt-1">Street address is required</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="billingCity" className="block text-sm font-medium text-gray-700 mb-1">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            id="billingCity"
                                            name="billingCity"
                                            placeholder="Enter City"
                                            value={formData.billingCity}
                                            onChange={handleInputChange}
                                            className={`w-full p-2 border ${formErrors.billingCity ? 'border-red-500' : 'border-gray-300'} rounded`}
                                            required
                                        />
                                        {formErrors.billingCity && <p className="text-red-500 text-xs mt-1">City is required</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="billingState" className="block text-sm font-medium text-gray-700 mb-1">
                                            State/Province *
                                        </label>
                                        <input
                                            type="text"
                                            id="billingState"
                                            name="billingState"
                                            placeholder="Enter State/Province"
                                            value={formData.billingState}
                                            onChange={handleInputChange}
                                            className={`w-full p-2 border ${formErrors.billingState ? 'border-red-500' : 'border-gray-300'} rounded`}
                                            required
                                        />
                                        {formErrors.billingState && <p className="text-red-500 text-xs mt-1">State/Province is required</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="billingPostalCode" className="block text-sm font-medium text-gray-700 mb-1">
                                            Postal Code *
                                        </label>
                                        <input
                                            type="text"
                                            id="billingPostalCode"
                                            name="billingPostalCode"
                                            placeholder="Enter Postal Code"
                                            value={formData.billingPostalCode}
                                            onChange={handleInputChange}
                                            className={`w-full p-2 border ${formErrors.billingPostalCode ? 'border-red-500' : 'border-gray-300'} rounded`}
                                            required
                                        />
                                        {formErrors.billingPostalCode && <p className="text-red-500 text-xs mt-1">Postal code is required</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="billingCountry" className="block text-sm font-medium text-gray-700 mb-1">
                                            Country *
                                        </label>
                                        <select
                                            id="billingCountry"
                                            name="billingCountry"
                                            value={formData.billingCountry}
                                            onChange={handleInputChange}
                                            className={`w-full p-2 border ${formErrors.billingCountry ? 'border-red-500' : 'border-gray-300'} rounded`}
                                            required
                                        >
                                            <option value="United Kingdom">United Kingdom</option>
                                        </select>
                                        {formErrors.billingCountry && <p className="text-red-500 text-xs mt-1">Country is required</p>}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Payment Section */}
                        <div className="mb-6">
                            <h2 className="text-lg font-medium mb-3">Payment Method</h2>
                            <div className="border rounded-md p-4">
                                <StripePaymentForm
                                    cartItems={cartItems}
                                    formData={formData}
                                    onPaymentSuccess={handlePaymentSuccess}
                                    validateForm={validateForm}
                                    totalPrice={displayTotal}
                                />
                            </div>
                        </div>
                    </Elements>
                ) : (
                    <div className="flex justify-center items-center h-64">
                        <p>Initializing payment system...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutPage;