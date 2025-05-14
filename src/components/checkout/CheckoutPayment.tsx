"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { Order, CustomerProfile } from "@/types/checkout";
import { OrderSummary } from "./OrderSummary";
import { PaymentSection } from "./PaymentSection";
import { CheckoutFormData } from "./CheckoutForm";

const GUEST_EMAIL_KEY = "guestEmail";
const GUEST_CART_ID_KEY = "guestCartId";

interface CheckoutPaymentProps {
  checkoutData: CheckoutFormData;
  onBack: () => void;
}

export const CheckoutPayment: React.FC<CheckoutPaymentProps> = ({ 
  checkoutData, 
  onBack 
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeCustId, setStripeCustId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [payablePrice, setPayablePrice] = useState<number>(0);
  
  const stripeCustomerIdRef = useRef<string | null>(null);

  const getGuestCartId = useCallback(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(GUEST_CART_ID_KEY);
    }
    return null;
  }, []);

  const calculateFinalPrice = useCallback(() => {
    if (!order && cartItems.length === 0) return 0;

    const basePrice = order
      ? order.totalPrice
      : cartItems.reduce((sum, item) => {
          const price =
            typeof item.product.price === "string"
              ? parseFloat(item.product.price)
              : item.product.price || 0;
          const discount = item.product.discount || 0;
          return sum + price * (1 - discount / 100) * item.quantity;
        }, 0);

    let finalPrice = basePrice;

    if (orderCount === 0) {
      finalPrice *= 0.8;
    }

    if (finalPrice > 75) {
      finalPrice *= 0.95;
    }

    return Math.round(finalPrice * 100) / 100;
  }, [order, cartItems, orderCount]);

  useEffect(() => {
    const calculatedPrice = calculateFinalPrice();
    setPayablePrice(calculatedPrice);
  }, [calculateFinalPrice]);

  const paymentIntentCreatingRef = useRef(false);

  const createPaymentIntent = async (amount: number, orderIdParam?: string) => {
    if (paymentIntentCreatingRef.current || clientSecret) {
      return;
    }

    try {
      paymentIntentCreatingRef.current = true;
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency: "gbp",
          orderId: orderIdParam,
          email: checkoutData.email || session?.user?.email,
        }),
      });

      const responseData = await response.json();

      if (responseData.clientSecret) {
        setClientSecret(responseData.clientSecret);
      } else {
        throw new Error("No client secret returned");
      }
      
      if (responseData.customerId) {
        stripeCustomerIdRef.current = responseData.customerId;
        setStripeCustId(responseData.customerId);
      } else {
        throw new Error("No customer id returned");
      }
    } catch (err) {
      console.error("Payment intent error:", err);
      setError(
        "Failed to initialize payment: " +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      paymentIntentCreatingRef.current = false;
    }
  };

  const fetchOrder = async () => {
    if (!orderId) return;

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

      if (data && data.totalPrice > 0 && !clientSecret) {
        await createPaymentIntent(payablePrice, data.id);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while loading your order"
      );
    }
  };

  const fetchCart = async () => {
    try {
      const userId = session?.user?.id;
      const guestCartId = getGuestCartId();

      if (!userId && !guestCartId) {
        throw new Error("No cart identified");
      }

      const response = await fetch(
        `/api/cart?${
          userId ? `userId=${userId}` : `guestCartId=${guestCartId}`
        }`,
        {
          headers: { "Cache-Control": "no-cache" },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }

      const { data: cartData } = await response.json();
      setCartItems(cartData.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load your cart");
    }
  };

  useEffect(() => {
    const initializePayment = async () => {
      if (
        !orderId &&
        cartItems.length > 0 &&
        payablePrice > 0 &&
        !clientSecret
      ) {
        await createPaymentIntent(payablePrice);
      }
    };

    initializePayment();
  }, [orderId, cartItems, payablePrice, clientSecret]);

  const createOrderFromCart = async (paymentData?: {
    paymentIntentId: string;
    paymentMethodId: string;
    clientSecret: string;
    stripeCustId: string;
  }) => {
    setIsCreatingOrder(true);
    setError(null);

    try {
      const userId = session?.user?.id;
      const guestEmail =
        checkoutData.email || localStorage.getItem(GUEST_EMAIL_KEY);

      if (!userId && !guestEmail) {
        throw new Error("Email is required for guest checkout");
      }

      if (!cartItems || cartItems.length === 0) {
        throw new Error("Your cart is empty");
      }

      if (!userId && checkoutData.email) {
        localStorage.setItem(GUEST_EMAIL_KEY, checkoutData.email);
      }

      const orderItems = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice:
          typeof item.product.price === "string"
            ? parseFloat(item.product.price)
            : item.product.price,
        discountPercentage: item.product.discount
          ? typeof item.product.discount === "string"
            ? parseFloat(item.product.discount)
            : item.product.discount
          : 0,
      }));

      const customerIdToUse = stripeCustId || stripeCustomerIdRef.current || "";
      
      const orderPayload = {
        items: orderItems,
        ...(userId
          ? { userId }
          : { guestEmail: checkoutData.email.toLowerCase().trim() }),
        shippingFirstName: checkoutData.shippingFirstName,
        shippingLastName: checkoutData.shippingLastName,
        shippingStreet: checkoutData.shippingStreet,
        shippingCity: checkoutData.shippingCity,
        shippingState: checkoutData.shippingState,
        shippingPostalCode: checkoutData.shippingPostalCode,
        shippingCountry: "United Kingdom",
        shippingPhone: checkoutData.shippingPhone
          ? `+44${checkoutData.shippingPhone}`
          : "",
        billingFirstName: checkoutData.useSameAddress
          ? null
          : checkoutData.billingFirstName,
        billingLastName: checkoutData.useSameAddress
          ? null
          : checkoutData.billingLastName,
        billingStreet: checkoutData.useSameAddress ? null : checkoutData.billingStreet,
        billingCity: checkoutData.useSameAddress ? null : checkoutData.billingCity,
        billingState: checkoutData.useSameAddress ? null : checkoutData.billingState,
        billingPostalCode: checkoutData.useSameAddress
          ? null
          : checkoutData.billingPostalCode,
        billingCountry: checkoutData.useSameAddress
          ? null
          : checkoutData.billingCountry,
        email: checkoutData.email,
        totalPrice: payablePrice,
        paymentMethod: "STRIPE",
        status: OrderStatus.CONFIRMED,
        ...(paymentData
          ? {
              paymentIntentId: paymentData.paymentIntentId,
              paymentMethodId: paymentData.paymentMethodId,
              clientSecret: paymentData.clientSecret,
              stripeCustomerId: customerIdToUse,
            }
          : {}),
      };

      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(
          errorData.error || errorData.message || "Failed to create order"
        );
      }

      const { data } = await orderResponse.json();
      return data.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order");
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
      const customerIdToUse = stripeCustId || stripeCustomerIdRef.current || "";
      
      const newOrderId = await createOrderFromCart({
        ...paymentData,
        stripeCustId: customerIdToUse,
      });
      
      if (!newOrderId) {
        throw new Error("Failed to create order");
      }

      if (!session?.user?.id) {
        localStorage.removeItem(GUEST_CART_ID_KEY);
      }

      return newOrderId;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Payment processing failed"
      );
      return null;
    }
  };

  useEffect(() => {
    const fetchOrderCount = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(
            `/api/orders/count?userId=${session.user.id}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch order count");
          }
          const data = await response.json();
          setOrderCount(data.count || 0);
        } catch (error) {
          console.error("Failed to fetch order count:", error);
          setOrderCount(0);
        }
      } else {
        setOrderCount(0);
      }
    };

    fetchOrderCount();
  }, [session?.user?.id]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        if (orderId) {
          await fetchOrder();
        } else {
          await fetchCart();
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session?.user?.id, orderId]);

  const displayItems = order
    ? order.items
    : cartItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price:
          item.product.price *
          (1 - (item.product.discount || 0) / 100) *
          item.quantity,
        product: item.product,
      }));

  if (loading || isCreatingOrder) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading payment information...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 mx-auto">
        <div className="text-red-500 p-4 bg-red-50 rounded">{error}</div>
        <div className="text-center mt-4">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            Back to Shipping
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
          <p className="text-gray-600 mb-4">
            There are no items in your cart to checkout.
          </p>
          <button
            onClick={() => router.push("/products")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-lg mb-6">
        <h1 className="text-2xl font-semibold mb-6">Payment Information</h1>

        <OrderSummary
          items={displayItems}
          orderCount={orderCount}
          finalPrice={payablePrice}
        />

        {clientSecret && (stripeCustId || stripeCustomerIdRef.current) ? (
          <PaymentSection
            clientSecret={clientSecret}
            cartItems={cartItems}
            formData={checkoutData}
            onPaymentSuccess={handlePaymentSuccess}
            validateForm={() => true} // Already validated in first step
            totalPrice={payablePrice}
          />
        ) : (
          <div className="flex justify-center items-center h-64">
            <p>Initializing payment system...</p>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            Back to Shipping
          </button>
        </div>
      </div>
    </div>
  );
};