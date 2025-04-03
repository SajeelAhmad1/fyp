"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  discount?: number;
  images: string[];
  stock: number;
  sku: string;
  inStock: boolean;
}

interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
}

interface Wishlist {
  id: string;
  userId: string;
  items: WishlistItem[];
}

export default function Wishlist() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("wishlist");
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cartLoadingItems, setCartLoadingItems] = useState<{ [key: string]: boolean }>({});

  const fetchWishlist = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/wishlist?userId=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWishlist(data.data);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch wishlist if authenticated and on wishlist tab
    if (status === "authenticated" && session?.user?.id) {
      fetchWishlist(session.user.id);
    }
  }, [status, session?.user?.id, fetchWishlist]);

  const removeFromWishlist = async (itemId: string) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: session.user.id, itemId }),
      });

      if (response.ok) {
        // Refresh wishlist data
        fetchWishlist(session.user.id);
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  const handleCartToggle = async (productId: string, inStock: boolean) => {
    if (!session?.user?.id) {
      // Redirect to login if user is not authenticated
      router.push('/login');
      return;
    }

    if (!inStock) {
      return; // Don't proceed if product is out of stock
    }

    // Set loading state for this specific item
    setCartLoadingItems(prev => ({ ...prev, [productId]: true }));

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          productId: productId,
          quantity: 1 // Default to 1 for wishlist add to cart
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error adding to cart:", errorData.message);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      // Remove loading state for this item
      setCartLoadingItems(prev => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });
    }
  };

  // Remove redirect logic from useEffect
  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const profile = session?.user.customerProfile || {};

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tab Navigation */}
      <div className="bg-gray-100 p-4 flex border-b">
        <button
          onClick={() => router.push("/account")}
          className={`mr-4 py-2 px-4 rounded-t ${activeTab === "profile" ? "bg-white border-t border-l border-r font-bold" : ""}`}
        >
          Profile
        </button>
        <button
          onClick={() => router.push("/orders")}
          className={`mr-4 py-2 px-4 rounded-t ${activeTab === "orders" ? "bg-white border-t border-l border-r font-bold" : ""}`}
        >
          My Orders
        </button>
        <button
          className={`mr-4 py-2 px-4 rounded-t ${activeTab === "wishlist" ? "bg-white border-t border-l border-r font-bold" : ""}`}
        >
          Wishlist
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white p-6 rounded-b-lg border border-grey-200">
        <div>
          <h2 className="text-xl font-bold mb-4">My Wishlist</h2>
          {isLoading ? (
            <div className="text-center">Loading wishlist...</div>
          ) : !wishlist || wishlist.items.length === 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <div className="p-6 text-center">
                <p className="text-gray-500">Your wishlist is empty.</p>
                <Link href="/" className="mt-4 inline-block bg-orange-500 text-white py-2 px-6 rounded">
                  Start Shopping
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlist.items.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {item.product.images && item.product.images.length > 0 ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 flex items-center justify-center">
                        No Image
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-500">
                        SKU: {item.product.sku}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {item.product.discount && item.product.discount > 0 ? (
                          <>
                            <span className="text-red-500 font-bold">
                              ${(Number(item.product.price) - (Number(item.product.discount)*Number(item.product.price)/100)).toFixed(2)}
                            </span>
                            <span className="text-gray-500 line-through text-sm">
                              ${Number(item.product.price).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold">
                            ${Number(item.product.price).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {item.product.stock > 0 ? (
                      <button
                        onClick={() => handleCartToggle(item.product.id, item.product.stock > 0)}
                        disabled={cartLoadingItems[item.product.id]}
                        className="bg-[#F19B12] text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
                      >
                        {cartLoadingItems[item.product.id] ? 'Adding...' : 'Add to Cart'}
                      </button>
                    ) : (
                      <span className="text-red-500">Out of Stock</span>
                    )}
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
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