"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Order } from "@/types/order";

export default function Orders() {
    const router = useRouter();
    const { data: session, status } = useSession({
        required: false,
    });
    const [activeTab, setActiveTab] = useState("orders");
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [guestEmail, setGuestEmail] = useState("");
    const [showEmailPopup, setShowEmailPopup] = useState(false);
    const hasFetched = useRef(false);

    const fetchOrders = useCallback(async (email = null) => {
        if (hasFetched.current) return;
        
        setIsLoading(true);
        try {
            let response;
            if (session?.user.id) {
                response = await fetch(`/api/orders?userId=${session.user.id}`);
            } else if (email) {
                response = await fetch(`/api/orders?guestEmail=${email}`);
            } else {
                return;
            }
            
            const result = await response.json();

            if (response.ok) {
                setOrders(result.data);
                hasFetched.current = true;
            } else {
                console.error("Failed to fetch orders");
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setIsLoading(false);
        }
    }, [session?.user.id]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // Don't refetch when tab becomes visible
                return;
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Initial fetch
        if (status === "unauthenticated") {
            const storedEmail = localStorage.getItem("guestEmail");
            if (storedEmail) {
                setGuestEmail(storedEmail);
                fetchOrders(storedEmail);
            } else {
                setShowEmailPopup(true);
            }
        } else if (status === "authenticated" && session?.user.id) {
            fetchOrders();
        }

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [status, session, fetchOrders]);

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (guestEmail.trim()) {
            localStorage.setItem("guestEmail", guestEmail);
            setShowEmailPopup(false);
            hasFetched.current = false; // Reset fetch flag
            fetchOrders(guestEmail);
        }
    };

    if (status === "loading") {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Email Popup Modal */}
            {showEmailPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Enter Your Email</h2>
                        <p className="mb-4 text-gray-600">Please enter your email to view your orders</p>
                        <form onSubmit={handleEmailSubmit}>
                            <input
                                type="email"
                                value={guestEmail}
                                onChange={(e) => setGuestEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="w-full p-2 border border-gray-300 rounded mb-4"
                                required
                            />
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => router.push("/")}
                                    className="px-4 py-2 border border-gray-300 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-orange-500 text-white rounded"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="bg-gray-100 p-4 flex border-b">
                <button
                    onClick={() => router.push("/account")}
                    className={`mr-4 py-2 px-4 rounded-t ${activeTab === "profile" ? "bg-white border-t border-l border-r font-bold" : ""}`}
                >
                    Profile
                </button>
                <button
                    className={`mr-4 py-2 px-4 rounded-t ${activeTab === "orders" ? "bg-white border-t border-l border-r font-bold" : ""}`}
                >
                    My Orders
                </button>
                <button
                    onClick={() => router.push("/account/wishlist")}
                    className={`mr-4 py-2 px-4 rounded-t ${activeTab === "wishlist" ? "bg-white border-t border-l border-r font-bold" : ""}`}
                >
                    Wishlist
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-white p-6 rounded-b-lg border border-grey-200">
                <div>
                    <h2 className="text-xl font-bold mb-4">My Orders</h2>
                    {isLoading ? (
                        <div className="text-center">Loading orders...</div>
                    ) : orders.length === 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                            <div className="p-6 text-center">
                                <p className="text-gray-500">You haven't placed any orders yet.</p>
                                <Link href="/" className="mt-4 inline-block bg-orange-500 text-white py-2 px-6 rounded">
                                    Start Shopping
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div key={order.id} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <p className="font-bold">Order #{order.id.slice(-6)}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded">
                                            {order.status}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex items-center">
                                                {item.product.images && item.product.images.length > 0 ? (
                                                    <Image
                                                        src={item.product.images[0]}
                                                        alt={item.product.name}
                                                        width={64}
                                                        height={64}
                                                        className="w-16 h-16 object-cover mr-4"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 bg-gray-200 mr-4 flex items-center justify-center">
                                                        No Image
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium">{item.product.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        SKU: {item.product.sku} | Quantity: {item.quantity}
                                                    </p>
                                                    <p className="text-sm font-semibold">
                                                        ${(item.price * item.quantity)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 text-right">
                                        <p className="text-lg font-bold">
                                            Total: ${order.totalPrice}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}