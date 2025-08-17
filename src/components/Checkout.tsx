"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { OrderStatus } from "@prisma/client";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { CustomerProfile, Order, OrderItem } from "@/types/checkoutTypes";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const GUEST_EMAIL_KEY = "guestEmail";
const GUEST_CART_ID_KEY = "guestCartId";

const calculateShippingCost = (items: OrderItem[]): number => {
  const shippingCosts = items.map(
    (item) => Number(item.product.shippingCost) || 0
  );
  const uniqueCosts = Array.from(new Set(shippingCosts));

  if (uniqueCosts.length === 1) {
    return uniqueCosts[0];
  }

  return Math.max(...shippingCosts);
};

const StripePaymentForm = ({
  order,
  formData,
  onPaymentSuccess,
}: {
  order: Order;
  formData: any;
  onPaymentSuccess: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);

  const shippingCost = calculateShippingCost(order.items);
  const amount = Math.round((order.totalPrice + shippingCost) * 100);

  useEffect(() => {
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: amount,
        orderId: order.id,
      }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, [order, amount]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) return;

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message);
      setLoading(false);
      return;
    } else {
      onPaymentSuccess();
    }

    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?orderId=${order.id}`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
    }

    setLoading(false);
  };

  if (!clientSecret) return null;

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-medium mb-4">Payment Details</h3>
      <form onSubmit={handleSubmit}>
        {clientSecret && <PaymentElement />}
        {errorMessage && (
          <div className="text-red-600 text-sm mt-2 p-2 bg-red-50 rounded">
            {errorMessage}
          </div>
        )}
        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full bg-amber-400 hover:bg-amber-500 text-black font-semibold py-3 px-4 rounded-lg mt-6 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading
            ? "Processing..."
            : `Complete your order - £${(Number(order.totalPrice) + shippingCost).toFixed(2)}`}
        </button>
      </form>
    </div>
  );
};

const Checkout = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<Order | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    shippingFirstName: "",
    shippingLastName: "",
    shippingStreet: "",
    shippingCity: "",
    shippingState: "",
    shippingPostalCode: "",
    shippingCountry: "",
    shippingPhone: "",

    useSameAddress: true,
    billingFirstName: "",
    billingLastName: "",
    billingStreet: "",
    billingCity: "",
    billingState: "",
    billingPostalCode: "",
    billingCountry: "",

    paymentMethod: "STRIPE",
    email: "",

    cardNumber: "",
    cardExpiry: "",
    cardCVV: "",
    cardName: "",
  });

  const getGuestCartId = useCallback(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(GUEST_CART_ID_KEY);
    }
    return null;
  }, []);

  const createOrderAndProceedToCheckout = useCallback(async () => {
    const guestCartId = getGuestCartId();
    if ((!session?.user?.id && !guestCartId) || !orderId) return;

    try {
      setIsCreatingOrder(true);
      setError(null);

      const orderItems =
        order?.items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice:
            typeof item.product.price === "string"
              ? parseFloat(item.product.price)
              : item.product.price,
          discountPercentage: 0,
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
          throw new Error("Guest cart ID is required");
        }
        requestBody.guestCartId = guestCartId;
        requestBody.guestEmail =
          localStorage.getItem(GUEST_EMAIL_KEY) || formData.email;
        localStorage.setItem(GUEST_EMAIL_KEY, requestBody.guestEmail);
      }

      const userId = session?.user.id;
      const response = await fetch(`/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create order");
      }

      const { data } = await response.json();
      router.push(`/checkout?orderId=${data.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsCreatingOrder(false);
    }
  }, [order, session, router, getGuestCartId, orderId, formData]);

  const fetchCustomerProfile = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch("/api/customer-profile");

      if (!response.ok) {
        return;
      }

      const { data } = await response.json();
      setCustomerProfile(data);
    } catch (err) {
      throw new Error("Error setting profile");
    }
  };

  const fetchOrder = async () => {
    if (!orderId) {
      return;
    }

    try {
      const queryParams = new URLSearchParams();

      if (session?.user?.id) {
        queryParams.append("userId", session.user.id);
      } else {
        const guestEmail = localStorage.getItem(GUEST_EMAIL_KEY);
        if (guestEmail) {
          queryParams.append("guestEmail", guestEmail);
        } else {
          throw new Error("Guest email is required for guest checkout");
        }
      }

      const response = await fetch(
        `/api/orders/${orderId}?${queryParams.toString()}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || errorData.message || "Failed to fetch order"
        );
      }

      const { data } = await response.json();
      setOrder(data);

      if (data) {
        setFormData((prev) => ({
          ...prev,
          shippingFirstName: data.shippingFirstName || "",
          shippingLastName: data.shippingLastName || "",
          shippingStreet: data.shippingStreet || "",
          shippingCity: data.shippingCity || "",
          shippingState: data.shippingState || "",
          shippingPostalCode: data.shippingPostalCode || "",
          shippingCountry: data.shippingCountry || "",
          shippingPhone: data.shippingPhone || "",

          billingFirstName: data.billingFirstName || "",
          billingLastName: data.billingLastName || "",
          billingStreet: data.billingStreet || "",
          billingCity: data.billingCity || "",
          billingState: data.billingState || "",
          billingPostalCode: data.billingPostalCode || "",
          billingCountry: data.billingCountry || "",

          email: data.email || session?.user?.email || "",
          paymentMethod: "STRIPE",
        }));
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while loading your order"
      );
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSameAddressToggle = () => {
    setFormData((prev) => ({
      ...prev,
      useSameAddress: !prev.useSameAddress,
      billingFirstName: prev.useSameAddress ? prev.shippingFirstName : "",
      billingLastName: prev.useSameAddress ? prev.shippingLastName : "",
      billingStreet: prev.useSameAddress ? prev.shippingStreet : "",
      billingCity: prev.useSameAddress ? prev.shippingCity : "",
      billingState: prev.useSameAddress ? prev.shippingState : "",
      billingPostalCode: prev.useSameAddress ? prev.shippingPostalCode : "",
      billingCountry: prev.useSameAddress ? prev.shippingCountry : "",
    }));
  };

  const formatPrice = (price: number | string | null | undefined): string => {
    if (price === null || price === undefined) return "0.00";
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
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
        shippingPhone: formData.shippingPhone,

        billingFirstName: formData.useSameAddress
          ? null
          : formData.billingFirstName,
        billingLastName: formData.useSameAddress
          ? null
          : formData.billingLastName,
        billingStreet: formData.useSameAddress ? null : formData.billingStreet,
        billingCity: formData.useSameAddress ? null : formData.billingCity,
        billingState: formData.useSameAddress ? null : formData.billingState,
        billingPostalCode: formData.useSameAddress
          ? null
          : formData.billingPostalCode,
        billingCountry: formData.useSameAddress
          ? null
          : formData.billingCountry,

        ...(session?.user?.id
          ? { userId: session.user.id }
          : { guestEmail: localStorage.getItem(GUEST_EMAIL_KEY) }),

        email: formData.email,
        paymentMethod: "STRIPE",
        status: OrderStatus.CONFIRMED,
      };

      await fetch(`/api/orders/${order?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderUpdatePayload),
      });

      // Clear guest cart after successful payment
      if (!session?.user?.id) {
        localStorage.removeItem(GUEST_CART_ID_KEY);
      }

      router.push(`/orders/confirmation?orderId=${order?.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Payment processing failed"
      );
    }
  };

  const validateStep1 = () => {
    return (
      formData.shippingFirstName &&
      formData.shippingLastName &&
      formData.shippingStreet &&
      formData.shippingCity &&
      formData.shippingPostalCode &&
      formData.shippingCountry &&
      formData.shippingPhone &&
      formData.email
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchCustomerProfile(), fetchOrder()]);
      setLoading(false);
    };

    fetchData();
  }, [session?.user?.id, orderId]);

  useEffect(() => {
    if (customerProfile && (!order || !order.shippingFirstName)) {
      setFormData((prev) => ({
        ...prev,
        shippingFirstName:
          prev.shippingFirstName || customerProfile.firstName || "",
        shippingLastName:
          prev.shippingLastName || customerProfile.lastName || "",
        shippingStreet:
          prev.shippingStreet || customerProfile.streetAddress || "",
        shippingCity: prev.shippingCity || customerProfile.city || "",
        shippingState: prev.shippingState || customerProfile.state || "",
        shippingPostalCode:
          prev.shippingPostalCode || customerProfile.postalCode || "",
        shippingCountry: prev.shippingCountry || customerProfile.country || "",
        shippingPhone: prev.shippingPhone || customerProfile.phone || "",

        email: prev.email || session?.user?.email || "",
      }));
    }
  }, [customerProfile, order, session]);

  if (loading || isCreatingOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-sm max-w-md w-full mx-4">
          <div className="text-red-600 text-center mb-4">
            <svg className="w-12 h-12 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-medium">Something went wrong</h3>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
          <button
            onClick={() => router.push("/cart")}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Cart
          </button>
        </div>
      </div>
    );
  }

  if (!order && !isCreatingOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-sm max-w-md w-full mx-4 text-center">
          <h2 className="text-xl font-semibold mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-6">
            The order you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <button
            onClick={() => router.push("/products")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const shippingCost = order ? calculateShippingCost(order.items) : 0;
  const subtotal = order ? order.items.reduce((sum, item: any) => {
    const itemPrice = parseFloat(item.price);
    const discountPercent = item.product.discount ? parseFloat(item.product.discount) : 0;
    const discountAmount = (itemPrice * discountPercent) / 100;
    return sum + (itemPrice - discountAmount);
  }, 0) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-gray-600 mt-2">Complete your purchase securely</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${currentStep >= 1 ? 'bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-300 bg-clip-text text-transparent' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-300 text-white' : 'bg-gray-200'}`}>1</div>
              <span className="ml-2 font-medium">Shipping</span>
            </div>
            <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-300' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${currentStep >= 2 ? 'bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-300 bg-clip-text text-transparent' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-300 text-white' : 'bg-gray-200'}`}>2</div>
              <span className="ml-2 font-medium">Payment</span>
            </div>
          </div>
        </div>

        {order && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {currentStep === 1 && (
                <>
                  {/* Shipping Address */}
                  <div className="bg-white rounded-lg border p-6">
                    <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="shippingFirstName"
                          value={formData.shippingFirstName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="shippingLastName"
                          value={formData.shippingLastName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          name="shippingStreet"
                          value={formData.shippingStreet}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          name="shippingCity"
                          value={formData.shippingCity}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State/Province
                        </label>
                        <input
                          type="text"
                          name="shippingState"
                          value={formData.shippingState}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          name="shippingPostalCode"
                          value={formData.shippingPostalCode}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country *
                        </label>
                        <input
                          type="text"
                          name="shippingCountry"
                          value={formData.shippingCountry}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="shippingPhone"
                          value={formData.shippingPhone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        onClick={() => setCurrentStep(2)}
                        disabled={!validateStep1()}
                        className="w-full bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Continue to Payment
                      </button>
                    </div>
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <Elements
                  stripe={stripePromise}
                  options={{
                    mode: "payment",
                    amount: Math.round((order.totalPrice + shippingCost) * 100),
                    currency: "gbp",
                  }}
                >
                  <div className="space-y-6">
                    {/* Shipping Summary */}
                    <div className="bg-white rounded-lg border p-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Shipping to:</h3>
                        <button
                          onClick={() => setCurrentStep(1)}
                          className="bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-300 bg-clip-text text-transparent hover:text-blue-800 text-sm"
                        >
                          Change
                        </button>
                      </div>
                      <div className="mt-2 text-gray-600">
                        <p>{formData.shippingFirstName} {formData.shippingLastName}</p>
                        <p>{formData.shippingStreet}</p>
                        <p>{formData.shippingCity}, {formData.shippingState} {formData.shippingPostalCode}</p>
                        <p>{formData.shippingCountry}</p>
                      </div>
                    </div>

                    <StripePaymentForm
                      order={order}
                      formData={formData}
                      onPaymentSuccess={handlePaymentSuccess}
                    />
                  </div>
                </Elements>
              )}
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border p-6 sticky top-4">
                <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
                
                {/* Order Items */}
                <div className="space-y-4 mb-4">
                  {order.items.map((item: any) => {
                    const itemPrice = parseFloat(item.price);
                    const discountPercent = item.product.discount ? parseFloat(item.product.discount) : 0;
                    const discountAmount = (itemPrice * discountPercent) / 100;
                    const finalPrice = itemPrice - discountAmount;

                    return (
                      <div key={item.id} className="flex items-center space-x-4 py-2">
                        <div className="w-16 h-16 relative bg-gray-100 rounded-md overflow-hidden">
                          {item.product.images && item.product.images.length > 0 ? (
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No image</span>
                            </div>
                          )}
                          <div className="absolute -top-2 -right-2 bg-gray-800 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            £{formatPrice(finalPrice)}
                          </p>
                          {discountPercent > 0 && (
                            <p className="text-xs text-red-600">
                              {discountPercent}% off
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Totals */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>£{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span>£{formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Total:</span>
                    <span>£{formatPrice(subtotal + shippingCost)}</span>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Secure checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CheckoutPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <Checkout />
    </Suspense>
  );
};

export default CheckoutPage;