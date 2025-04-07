"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { OrderStatus } from '@prisma/client';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Product {
    id: string;
    name: string;
    images: string[];
    price: number;
}

interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    product: Product;
}

interface Payment {
    id: string;
    method: string;
    status: string;
}

interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    totalPrice: number;
    status: string;
    payment: Payment;
    createdAt: string;

    shippingFirstName: string;
    shippingLastName: string;
    shippingStreet: string;
    shippingCity: string;
    shippingState?: string;
    shippingPostalCode: string;
    shippingCountry: string;
    shippingPhone: string;

    billingFirstName?: string;
    billingLastName?: string;
    billingStreet?: string;
    billingCity?: string;
    billingState?: string;
    billingPostalCode?: string;
    billingCountry?: string;

    email: string;
}

interface CustomerProfile {
    firstName: string;
    lastName: string;
    streetAddress: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phone?: string;
}

const GUEST_EMAIL_KEY = 'guestEmail';
const GUEST_CART_ID_KEY = 'guestCartId';

const StripePaymentForm = ({
    order,
    formData,
    onPaymentSuccess,
    validateForm
}: {
    order: Order,
    formData: any,
    onPaymentSuccess: () => void,
    validateForm: () => boolean
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState<string>();
    const [loading, setLoading] = useState(false);
    const [paymentElementLoaded, setPaymentElementLoaded] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!stripe || !elements || !paymentElementLoaded) {
            setErrorMessage('Payment system is not ready yet. Please wait...');
            return;
        }

        setLoading(true);

        try {
            await onPaymentSuccess();

            const { error: submitError } = await elements.submit();
            if (submitError) {
                throw submitError;
            }

            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/payment-success?orderId=${order.id}`,
                },
            });

            if (error) {
                throw error;
            }
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Payment processing failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-6">
            <PaymentElement
                onReady={() => setPaymentElementLoaded(true)}
                options={{
                    layout: "tabs",
                }}
            />
            {errorMessage && <div className="text-red-500 mt-2">{errorMessage}</div>}
            <button
                type="submit"
                disabled={!stripe || !paymentElementLoaded || loading}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed mt-4"
            >
                {loading ? 'Processing Payment...' : `Pay $${order.totalPrice}`}
            </button>
        </form>
    );
};

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

    const [formData, setFormData] = useState({
        shippingFirstName: '',
        shippingLastName: '',
        shippingStreet: '',
        shippingCity: '',
        shippingState: '',
        shippingPostalCode: '',
        shippingCountry: '',
        shippingPhone: '',

        useSameAddress: true,
        billingFirstName: '',
        billingLastName: '',
        billingStreet: '',
        billingCity: '',
        billingState: '',
        billingPostalCode: '',
        billingCountry: '',

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

    const createPaymentIntent = async () => {
        if (!order?.id) return;

        try {
            const response = await fetch("/api/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: Math.round(order.totalPrice * 100),
                    orderId: order.id
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create payment intent');
            }

            const data = await response.json();
            if (!data.clientSecret) {
                throw new Error('No client secret returned');
            }
            setClientSecret(data.clientSecret);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to initialize payment');
        }
    };

    const createOrderAndProceedToCheckout = useCallback(async () => {
        if (!validateForm()) {
            return;
        }

        const guestCartId = getGuestCartId();
        if ((!session?.user?.id && !guestCartId) || !orderId) return;

        try {
            setIsCreatingOrder(true);
            setError(null);

            const orderItems = order?.items.map(item => ({
                productId: item.product.id,
                quantity: item.quantity,
                unitPrice: typeof item.product.price === 'string'
                    ? parseFloat(item.product.price)
                    : item.product.price,
                discountPercentage: 0
            })) || [];

            const requestBody: any = {
                items: orderItems,
                shippingFirstName: formData.shippingFirstName,
                shippingLastName: formData.shippingLastName,
                shippingStreet: formData.shippingStreet,
                shippingCity: formData.shippingCity,
                shippingState: formData.shippingState,
                shippingPostalCode: formData.shippingPostalCode,
                shippingCountry: formData.shippingCountry,
                shippingPhone: formData.shippingPhone,
                useSameAddress: formData.useSameAddress,
            };

            if (session?.user?.id) {
                requestBody.userId = session.user.id;
                requestBody.email = session.user.email;
            } else {
                if (!guestCartId) {
                    throw new Error('Guest cart ID is required');
                }
                requestBody.guestCartId = guestCartId;
                requestBody.guestEmail = localStorage.getItem(GUEST_EMAIL_KEY) || formData.email;
                localStorage.setItem(GUEST_EMAIL_KEY, requestBody.guestEmail);
            }

            const response = await fetch(`/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create order');
            }

            const { data } = await response.json();
            router.push(`/checkout?orderId=${data.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsCreatingOrder(false);
        }
    }, [order, session, router, getGuestCartId, orderId, formData]);

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
                // Process phone number to remove +44 if present
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
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while loading your order');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === "shippingPhone") {
            // Remove all non-digit characters
            const digitsOnly = value.replace(/\D/g, '');

            // Check if the number exceeds 10 digits
            if (digitsOnly.length > 10) {
                return; // Don't update if more than 10 digits
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

    const handlePaymentSuccess = async () => {
        try {
            const orderUpdatePayload = {
                shippingFirstName: formData.shippingFirstName,
                shippingLastName: formData.shippingLastName,
                shippingStreet: formData.shippingStreet,
                shippingCity: formData.shippingCity,
                shippingState: formData.shippingState,
                shippingPostalCode: formData.shippingPostalCode,
                shippingCountry: formData.shippingCountry,
                shippingPhone: formData.shippingPhone ? `+44${formData.shippingPhone}` : '', // Add +44 prefix
                billingFirstName: formData.useSameAddress ? null : formData.billingFirstName,
                billingLastName: formData.useSameAddress ? null : formData.billingLastName,
                billingStreet: formData.useSameAddress ? null : formData.billingStreet,
                billingCity: formData.useSameAddress ? null : formData.billingCity,
                billingState: formData.useSameAddress ? null : formData.billingState,
                billingPostalCode: formData.useSameAddress ? null : formData.billingPostalCode,
                billingCountry: formData.useSameAddress ? null : formData.billingCountry,

                ...(session?.user?.id ? { userId: session.user.id } : { guestEmail: localStorage.getItem(GUEST_EMAIL_KEY) }),

                email: formData.email,
                guestCartId: localStorage.getItem("guestCartId"),
                paymentMethod: 'STRIPE',
                status: OrderStatus.CONFIRMED
            };

            await fetch(`/api/orders/${order?.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderUpdatePayload),
            });

            if (!session?.user?.id) {
                localStorage.removeItem(GUEST_CART_ID_KEY);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Payment processing failed');
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await Promise.all([
                fetchCustomerProfile(),
                fetchOrder()
            ]);
            setLoading(false);
        };

        fetchData();
    }, [session?.user?.id, orderId]);

    useEffect(() => {
        if (order) {
            createPaymentIntent();
        }
    }, [order]);

    useEffect(() => {
        if (customerProfile && (!order || !order.shippingFirstName)) {
            setFormData(prev => ({
                ...prev,
                shippingFirstName: prev.shippingFirstName || customerProfile.firstName || '',
                shippingLastName: prev.shippingLastName || customerProfile.lastName || '',
                shippingStreet: prev.shippingStreet || customerProfile.streetAddress || '',
                shippingCity: prev.shippingCity || customerProfile.city || '',
                shippingState: prev.shippingState || customerProfile.state || '',
                shippingPostalCode: prev.shippingPostalCode || customerProfile.postalCode || '',
                shippingCountry: prev.shippingCountry || customerProfile.country || '',
                shippingPhone: prev.shippingPhone || customerProfile.phone || '',

                email: prev.email || session?.user?.email || ''
            }));
        }
    }, [customerProfile, order, session]);

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

    if (!order && !isCreatingOrder) {
        return (
            <div className="p-12 mx-auto">
                <div className="bg-white p-6 rounded-lg  text-center">
                    <h2 className="text-xl font-semibold mb-4">Order Not Found</h2>
                    <p className="text-gray-600 mb-4">The order you're looking for doesn't exist or you don't have permission to view it.</p>
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

    return (
        <div className="p-12 mx-auto">
            <div className="bg-white p-6 rounded-lg mb-6">
                <h1 className="text-2xl font-semibold mb-6">Checkout</h1>

                {order && clientSecret ? (
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
                                        {order.items.map((item) => (
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
                                            <td className="px-4 py-3 text-right font-semibold">${formatPrice(order.totalPrice)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Shipping Details Section */}
                        <div className="mb-6">
                            <h2 className="text-lg font-medium mb-3">Shipping Details</h2>
                            <div className="grid grid-cols-2 gap-4">
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
                                <div className="col-span-2">
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
                                        placeholder="Enter State"
                                        value={formData.shippingState}
                                        onChange={handleInputChange}
                                        className={`w-full p-2 border ${formErrors.shippingState ? 'border-red-500' : 'border-gray-300'} rounded`}
                                        required
                                    />
                                    {formErrors.shippingState && <p className="text-red-500 text-xs mt-1">State is required</p>}
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
                                    <input
                                        type="text"
                                        id="shippingCountry"
                                        name="shippingCountry"
                                        placeholder="Enter Country"
                                        value={formData.shippingCountry}
                                        onChange={handleInputChange}
                                        className={`w-full p-2 border ${formErrors.shippingCountry ? 'border-red-500' : 'border-gray-300'} rounded`}
                                        required
                                    />
                                    {formErrors.shippingCountry && <p className="text-red-500 text-xs mt-1">Country is required</p>}
                                </div>
                                <div>
                                    <label htmlFor="shippingPhone" className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number *
                                    </label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                            +44
                                        </span>
                                        <input
                                            type="tel"
                                            id="shippingPhone"
                                            name="shippingPhone"
                                            placeholder="Enter Phone Number"
                                            value={formData.shippingPhone}
                                            onChange={handleInputChange}
                                            maxLength={10}
                                            className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F19B12] ${formErrors.shippingPhone ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            required
                                        />
                                    </div>
                                    {formErrors.shippingPhone && <p className="text-red-500 text-xs mt-1">Phone number is required</p>}
                                </div>
                            </div>
                        </div>

                        {/* Billing Details Section */}
                        <div className="mb-6">
                            <div className="flex items-center mb-3">
                                <input
                                    type="checkbox"
                                    id="sameAddress"
                                    checked={formData.useSameAddress}
                                    onChange={handleSameAddressToggle}
                                    className="mr-2"
                                />
                                <label htmlFor="sameAddress" className="text-sm font-medium text-gray-700">
                                    Billing address same as shipping
                                </label>
                            </div>

                            {!formData.useSameAddress && (
                                <div className="grid grid-cols-2 gap-4">
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
                                            required={!formData.useSameAddress}
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
                                            required={!formData.useSameAddress}
                                        />
                                        {formErrors.billingLastName && <p className="text-red-500 text-xs mt-1">Last name is required</p>}
                                    </div>
                                    <div className="col-span-2">
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
                                            required={!formData.useSameAddress}
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
                                            required={!formData.useSameAddress}
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
                                            placeholder="Enter State"
                                            value={formData.billingState}
                                            onChange={handleInputChange}
                                            className={`w-full p-2 border ${formErrors.billingState ? 'border-red-500' : 'border-gray-300'} rounded`}
                                            required={!formData.useSameAddress}
                                        />
                                        {formErrors.billingState && <p className="text-red-500 text-xs mt-1">State is required</p>}
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
                                            required={!formData.useSameAddress}
                                        />
                                        {formErrors.billingPostalCode && <p className="text-red-500 text-xs mt-1">Postal code is required</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="billingCountry" className="block text-sm font-medium text-gray-700 mb-1">
                                            Country *
                                        </label>
                                        <input
                                            type="text"
                                            id="billingCountry"
                                            name="billingCountry"
                                            placeholder="Enter Country"
                                            value={formData.billingCountry}
                                            onChange={handleInputChange}
                                            className={`w-full p-2 border ${formErrors.billingCountry ? 'border-red-500' : 'border-gray-300'} rounded`}
                                            required={!formData.useSameAddress}
                                        />
                                        {formErrors.billingCountry && <p className="text-red-500 text-xs mt-1">Country is required</p>}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Contact Information */}
                        <div className="mb-6">
                            <h2 className="text-lg font-medium mb-3">Contact Information</h2>
                            <div>
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
                                {formErrors.email && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {!formData.email.trim() ? 'Email is required' : 'Please enter a valid email'}
                                    </p>
                                )}
                            </div>
                        </div>

                        <StripePaymentForm
                            order={order}
                            formData={formData}
                            onPaymentSuccess={handlePaymentSuccess}
                            validateForm={validateForm}
                        />
                    </Elements>
                ) : (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutPage;