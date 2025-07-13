"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Product, { ProductType } from "./Product";
import ProductListSkeleton from "../../products/components/ProductListSkeleton";
import { useRouter } from "next/navigation";

// Updated ProductType to match API response
interface ApiProductType {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  sku: string;
  images: string[];
  categoryId: string;
  vendorId: string;
  isFeatured: boolean;
  discount?: number;
  isBestChoice?: boolean;
  color?: string[];
  size?: string[];
  shortDescription?: string;
  category?: any;
  vendor?: {
    id: string;
    name: string;
  };
  reviews?: {
    rating: number;
  }[];
  avgRating?: number;
  reviewCount?: number;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ApiResponse {
  products: ApiProductType[];
  pagination: PaginationInfo;
}

interface WishlistItem {
  id: string;
  productId: string;
}

const TopDeals: React.FC = () => {
  const { data: session } = useSession();
  const [products, setProducts] = useState<any[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter()

  // Fetch user's wishlist if logged in
  useEffect(() => {
    if (session?.user?.id) {
      fetchWishlist(session.user.id);
    }
  }, [session]);

  // Fetch wishlist function
  const fetchWishlist = async (userId: string) => {
    try {
      const response = await fetch(`/api/wishlist?userId=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data.data?.items || []);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  // Refetch wishlist after user interaction
  const refreshWishlist = () => {
    if (session?.user?.id) {
      fetchWishlist(session.user.id);
    }
  };

  // Fetch top deals products from API
  useEffect(() => {
    const fetchTopDeals = async () => {
      try { 
        setLoading(true);
        console.log('Fetching top deals products with discount >= 20%');
        
        // Update the API endpoint to filter for products with discount >= 20%
        const response = await fetch('/api/products?minDiscount=20&limit=10');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch top deals products: ${response.status}`);
        }
        
        const data: ApiResponse = await response.json();
        console.log('API Response:', data);
        
        // Map API products to component's ProductType format
        const formattedProducts = data.products.map(product => {
          // Make sure discount is a number
          const discountValue = typeof product.discount === 'number' ? product.discount : 0;
          
          // Calculate sale price (assuming discount is a percentage)
          const salePrice = product.price - (product.price * discountValue / 100);
          
          console.log(`Product ${product.name}: price=${product.price}, discount=${discountValue}%, salePrice=${salePrice}`);
          
          return {
            id: product.id,
            title: product.name,
            description: product.description || "",
            shortDescription: product.shortDescription || "",
            image: product.images && product.images.length > 0 ? product.images[0] : "",
            reviews: product.reviews && product.reviews.length > 0 ? product.reviews : [],
            regularPrice: product.price,
            salePrice: salePrice,
            tags: [
              ...(product.isBestChoice ? ["best choice"] : []),
              "sale", 
              // Add other tag logic as needed
            ],
            inStock: product.stock > 0,
            slug: product.sku || product.id,
            discountPercentage: discountValue, // Add discount percentage to display
          };
        });
        
        console.log('Formatted products:', formattedProducts);
        setProducts(formattedProducts);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        console.error('Error fetching top deals products:', errorMessage);
        setError(errorMessage);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopDeals();
  }, []);

  // Helper function to check if a product is in the wishlist
  const getWishlistInfo = (productId: string) => {
    const wishlistItem = wishlistItems.find(item => item.productId === productId);
    return {
      isInWishlist: !!wishlistItem,
      wishlistItemId: wishlistItem?.id
    };
  };

  return (
    <div className="px-4 sm:px-8 md:px-12 lg:px-20">
      <h1 className="mt-8 md:mt-12 mb-4 md:mb-8 text-cyan-800 text-2xl md:text-3xl lg:text-4xl font-medium text-center md:text-left">
        Top Deals
      </h1>
      <div className="flex justify-center items-center flex-col w-full">
        <div className="container mx-auto">
          {loading ? (
            <ProductListSkeleton/>
          ) : error && products.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-red-500">Error loading deals: {error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">No top deals right now.</p>
            </div>
          ) : (
            <div>
              {/* Products grid - mobile first approach */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
                {products.map((product) => {
                  const { isInWishlist, wishlistItemId } = getWishlistInfo(product.id);
                  return (
                    <Product 
                      key={product.id} 
                      product={product} 
                      isInWishlist={isInWishlist}
                      wishlistItemId={wishlistItemId}
                      onWishlistChange={refreshWishlist}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <button 
        onClick={()=>router.push("/products?type=bestchoice")}
        className="mt-6 md:mt-8 px-6 py-2 text-lg md:text-xl bg-[#205781] text-white rounded-md hover:bg-[#1a4a70] transition-colors">
          See All
        </button>
      </div>
    </div>
  );
};

export default TopDeals;