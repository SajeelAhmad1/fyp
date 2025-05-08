'use client'
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OrderStatus } from '@prisma/client';
import { Order, CustomerProfile } from '@/types/checkout';
import { validatePostcode } from '@/utils/validatePostalCode';
import { isValid as isValidPostcode } from "postcode";
import { OrderSummary } from './OrderSummary';
import { ShippingDetails } from './ShippingDetails';
import { BillingDetails } from './BillingDetails';
import { PaymentSection } from './PaymentSection';

const GUEST_EMAIL_KEY = 'guestEmail';
const GUEST_CART_ID_KEY = 'guestCartId';

export const CheckoutPage: React.FC = () => {
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
    const [orderCount, setOrderCount] = useState<number | null>(null);
    const [postcodeSearchTerm, setPostcodeSearchTerm] = useState("");
    const [postCodeError, setPostCodeError] = useState("");
    const [payablePrice, setPayablePrice] = useState<number>(0);

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

    const displayItems = order ? order.items : cartItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: (item.product.price * (1 - (item.product.discount || 0) / 100)) * item.quantity,
        product: item.product
    }));

    const calculateFinalPrice = useCallback(() => {
        if (!order && cartItems.length === 0) return 0;

        // Calculate base price with product discounts
        const basePrice = order
            ? order.totalPrice
            : cartItems.reduce((sum, item) => {
                const price = typeof item.product.price === 'string'
                    ? parseFloat(item.product.price)
                    : item.product.price || 0;
                const discount = item.product.discount || 0;
                return sum + (price * (1 - discount / 100)) * item.quantity;
            }, 0);

        let finalPrice = basePrice;

        // Apply first order discount (20%)
        if (orderCount === 0) {
            finalPrice *= 0.8;
        }

        // Apply bulk discount (5%) if over £75
        if (finalPrice > 75) {
            finalPrice *= 0.95;
        }

        return Math.round(finalPrice * 100) / 100; // Round to 2 decimal places
    }, [order, cartItems, orderCount]);

    // Calculate final price whenever dependencies change
    useEffect(() => {
        const calculatedPrice = calculateFinalPrice();
        setPayablePrice(calculatedPrice);
    }, [calculateFinalPrice]);

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
            shippingCountry: false,
            shippingPhone: !formData.shippingPhone.trim() || formData.shippingPhone.length !== 10,
            billingFirstName: !formData.useSameAddress && !formData.billingFirstName.trim(),
            billingLastName: !formData.useSameAddress && !formData.billingLastName.trim(),
            billingStreet: !formData.useSameAddress && !formData.billingStreet.trim(),
            billingCity: !formData.useSameAddress && !formData.billingCity.trim(),
            billingState: !formData.useSameAddress && !formData.billingState.trim(),
            billingPostalCode: !formData.useSameAddress && (!formData.billingPostalCode.trim() || !isValidPostcode(formData.billingPostalCode)),
            billingCountry: !formData.useSameAddress && !formData.billingCountry.trim(),
            email: !formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email),
            shippingPostalCode: !formData.shippingPostalCode.trim() || !!postCodeError,
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

    useEffect(() => {
        const validateCode = async (postcode: string) => {
            if (!postcode) {
                setPostCodeError("Postal code is required");
                return;
            }

            const response = await validatePostcode(postcode);
            if (response.isValid) {
                setPostCodeError("");
            } else {
                setPostCodeError(response.error || "Invalid UK Postal Code");
            }
        }

        const timer = setTimeout(() => {
            if (postcodeSearchTerm) {
                validateCode(postcodeSearchTerm);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [postcodeSearchTerm]);

    const paymentIntentCreatingRef = useRef(false);

    const createPaymentIntent = async (amount: number, orderIdParam?: string) => {
        if (paymentIntentCreatingRef.current || clientSecret) {
            return;
        }

        try {
            paymentIntentCreatingRef.current = true;
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
                    shippingCountry: data.shippingCountry || 'United Kingdom',
                    shippingPhone: phone,
                    billingFirstName: data.billingFirstName || '',
                    billingLastName: data.billingLastName || '',
                    billingStreet: data.billingStreet || '',
                    billingCity: data.billingCity || '',
                    billingState: data.billingState || '',
                    billingPostalCode: data.billingPostalCode || '',
                    billingCountry: data.billingCountry || 'United Kingdom',
                    email: data.email || (session?.user?.email || ''),
                    paymentMethod: 'STRIPE'
                }));

                // Use the calculated payablePrice when creating the payment intent
                if (data.totalPrice > 0 && !clientSecret) {
                    await createPaymentIntent(payablePrice, data.id);
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
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load your cart');
        }
    };

    // Effect to create payment intent when cart is loaded and price is calculated
    useEffect(() => {
        const initializePayment = async () => {
            if (!orderId && cartItems.length > 0 && payablePrice > 0 && !clientSecret) {
                await createPaymentIntent(payablePrice);
            }
        };
        
        initializePayment();
    }, [orderId, cartItems, payablePrice, clientSecret]);

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

    const handlePostcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPostcodeSearchTerm(value);
        setFormData(prev => ({
            ...prev,
            shippingPostalCode: value,
            ...(formData.useSameAddress && { billingPostalCode: value })
        }));
    };

    const createOrderFromCart = async (paymentData?: {
        paymentIntentId: string;
        paymentMethodId: string;
        clientSecret: string;
    }) => {
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
                totalPrice: payablePrice, // Use the payablePrice state instead of finalPrice
                paymentMethod: 'STRIPE',
                status: OrderStatus.CONFIRMED,
                ...(paymentData ? {
                    paymentIntentId: paymentData.paymentIntentId,
                    paymentMethodId: paymentData.paymentMethodId,
                    clientSecret: paymentData.clientSecret
                } : {})
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

    const handlePaymentSuccess = async (paymentData: {
        paymentIntentId: string;
        paymentMethodId: string;
        clientSecret: string;
    }): Promise<string | null> => {
        try {
            const newOrderId = await createOrderFromCart(paymentData);

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
        const fetchOrderCount = async () => {
            if (session?.user?.id) {
                try {
                    const response = await fetch(`/api/orders/count?userId=${session.user.id}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch order count');
                    }
                    const data = await response.json();
                    setOrderCount(data.count || 0);
                } catch (error) {
                    console.error('Failed to fetch order count:', error);
                    setOrderCount(0);
                }
            } else {
                // Set default to 0 for guest users
                setOrderCount(0);
            }
        };

        fetchOrderCount();
    }, [session?.user?.id]);

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

    if (!cartItems.length && !order) {
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

    return (
        <div className="p-12 mx-auto">
            <div className="bg-white p-6 rounded-lg mb-6">
                <h1 className="text-2xl font-semibold mb-6">Checkout</h1>

                {clientSecret ? (
                    <>
                        <OrderSummary
                            items={displayItems}
                            orderCount={orderCount}
                            finalPrice={payablePrice}
                        />

                        <ShippingDetails
                            formData={formData}
                            formErrors={formErrors}
                            handleInputChange={handleInputChange}
                            postcodeSearchTerm={postcodeSearchTerm}
                            postCodeError={postCodeError}
                            handlePostcodeChange={handlePostcodeChange}
                        />

                        <BillingDetails
                            formData={formData}
                            formErrors={formErrors}
                            handleInputChange={handleInputChange}
                            handleSameAddressToggle={handleSameAddressToggle}
                            postcodeSearchTerm={postcodeSearchTerm}
                            postCodeError={postCodeError}
                            handlePostcodeChange={handlePostcodeChange}
                        />

                        <PaymentSection
                            clientSecret={clientSecret}
                            cartItems={cartItems}
                            formData={formData}
                            onPaymentSuccess={handlePaymentSuccess}
                            validateForm={validateForm}
                            totalPrice={payablePrice}
                        />
                    </>
                ) : (
                    <div className="flex justify-center items-center h-64">
                        <p>Initializing payment system...</p>
                    </div>
                )}
            </div>
        </div>
    );
};