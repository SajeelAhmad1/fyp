"use client";

import React, { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import Product, { ProductType } from "../../homepage/components/Product";
import ProductListSkeleton from "./ProductListSkeleton";
import { useSession } from "next-auth/react";

interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
}

interface ApiRecommendedProduct {
  id: string;
  name: string;
  description?: string;
  shortDescription?: string;
  price: number;
  stock: number;
  sku: string;
  images: string[];
  categoryId: string;
  vendorId: string;
  isFeatured: boolean;
  discount?: number;
  isBestChoice?: boolean;
  color?: string;
  size?: string;
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

const Recommendations: React.FC = () => {
  const params = useParams();
  const productId = params.id;
  
  const [products, setProducts] = useState<ProductType[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  // Fetch recommended products
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        // Fetch the current product to get its category
        const productResponse = await fetch(`/api/products/${productId}`);
        
        if (!productResponse.ok) {
          throw new Error('Failed to fetch product details');
        }

        const productData = await productResponse.json();
        const categoryId = productData.category?.id;

        if (!categoryId) {
          throw new Error('No category found for this product');
        }

        // Fetch recommended products
        const recommendationsResponse = await fetch(`/api/products/recommendations?categoryId=${categoryId}&productId=${productId}&limit=10`);
        
        if (!recommendationsResponse.ok) {
          throw new Error('Failed to fetch recommendations');
        }

        const data = await recommendationsResponse.json();
        
        // Flexible mapping to handle different response structures
        let recommendedProducts: ApiRecommendedProduct[] = [];
        
        // Check different possible response structures
        if (Array.isArray(data)) {
          recommendedProducts = data;
        } else if (data.products && Array.isArray(data.products)) {
          recommendedProducts = data.products;
        } else if (data.data && Array.isArray(data.data)) {
          recommendedProducts = data.data;
        } else {
          throw new Error('Unexpected response format');
        }
        
        // Map API products to component's ProductType format
        const formattedProducts = recommendedProducts.map(product => ({
          id: product.id,
          title: product.name,
          description: product.description || "",
          shortDescription: product.shortDescription || "",
          image: product.images && product.images.length > 0 ? product.images[0] : "/assets/img/8-1.png",
          regularPrice: product.price,
          salePrice: product.discount ? product.price - (product.price * product.discount / 100) : product.price,
          tags: [
            ...(product.isBestChoice ? ["best choice"] : []),
            ...(product.discount ? ["sale"] : []),
          ],
          inStock: product.stock !== null && product.stock !== undefined && product.stock > 0,
          slug: product.sku || product.id,
        }));
        
        setProducts(formattedProducts);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [productId]);

  // Fetch wishlist items
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!session?.user?.id) return;
      
      try {
        const response = await fetch(`/api/wishlist?userId=${session.user.id}`);
        if (!response.ok) {
          return;
        }
        
        const data = await response.json();
        setWishlistItems(data.data?.items || data.items || []);
      } catch (error) {
        throw new Error('Failed to fetch wishlist items');
      }
    };
    
    if (session?.user?.id && products.length > 0) {
      fetchWishlist();
    }
  }, [session, products]);

  // Helper function to check if a product is in the wishlist
  const getWishlistInfo = (productId: string) => {
    const wishlistItem = wishlistItems.find(item => item.productId === productId);
    return {
      isInWishlist: !!wishlistItem,
      wishlistItemId: wishlistItem?.id
    };
  };

  return (
    <div className="px-4 sm:px-8 md:px-12 lg:px-20  pb-20">
      <h1 className="mt-8 md:mt-12 mb-4 md:mb-8 text-gray-800 text-2xl md:text-3xl lg:text-3xl font-medium text-center md:text-left">
        You Might Also Like
      </h1>
      <div className="flex justify-center items-center flex-col w-full">
        <div className="container mx-auto">
          {loading ? (
            <ProductListSkeleton/>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-red-500">Error loading recommendations: {error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">No recommended products available.</p>
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
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default Recommendations;