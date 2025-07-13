'use client'

import React, { useState, useEffect, Suspense } from 'react'
import SideCategories from './SideCategories'
import { Separator } from '@/common/components/elements/Separator'
import SideProductType from './SideProductType'
import { SideSize } from './SideSize'
import SidePriceRange from './SidePriceRange'
import BannerPromotion from '../../homepage/components/BannerPromotion'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Product, { ProductType } from '../../homepage/components/Product'
import { SlidersHorizontal, X } from 'lucide-react'
import SortDropdown from '@/common/components/SortDropdown'
import Pagination from '@/common/components/Pagination'
import ProductListSkeleton from './ProductListSkeleton'
import NoResults from '@/common/components/NoResults'

// Existing Chip component remains the same
const Chip = ({ label, onRemove }: { label: string; onRemove: () => void }) => {
  return (
    <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
      <span>{label}</span>
      <button onClick={onRemove} className="ml-2">
        <X size={14} />
      </button>
    </div>
  );
};

interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
}

// Loading component for products
function ProductsLoading() {
  return (
    <div className="mx-auto min-h-full container p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 lg:hidden">
        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
      </div>
      
      <div className="flex relative">
        {/* Sidebar skeleton */}
        <div className="w-[250px] h-full hidden lg:block pr-6">
          <div className="sticky top-4">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="hidden lg:flex justify-between items-center mb-4">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <ProductListSkeleton />
        </div>
      </div>
    </div>
  );
}

// Error boundary component
function ProductsError({ error, retry }: { error: string; retry: () => void }) {
  return (
    <div className="mx-auto min-h-full container p-4 md:p-6">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={retry}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

// Main products content component
function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [products, setProducts] = useState<ProductType[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Get current query parameters
  const search = searchParams.get('searchTerm') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const pageParam = searchParams.get('page') || '1';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const color = searchParams.get('color') || '';
  const size = searchParams.get('size') || '';
  const type = searchParams.get('type') || '';

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    const queryParams = new URLSearchParams();
    if (search) queryParams.set('search', search);
    if (category) queryParams.set('category', category);
    if (sort) queryParams.set('sort', sort);
    if (pageParam) queryParams.set('page', pageParam);
    if (minPrice) queryParams.set('minPrice', minPrice);
    if (maxPrice) queryParams.set('maxPrice', maxPrice);
    if (color) queryParams.set('color', color);
    if (size) queryParams.set('size', size);
    if (type) queryParams.set('type', type);

    try {
      const response = await fetch(`/api/products/search?${queryParams.toString()}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch products: ${errorText}`);
      }

      const data = await response.json();

      // Map API products to ProductType format
      const formattedProducts = data.products.map((product: any) => ({
        id: product.id,
        title: product.name,
        description: product.description || "",
        shortDescription: product.shortDescription || "",
        image: product.images && product.images.length > 0 ? product.images[0] : "",
        reviews: product.reviews && product.reviews.length > 0 ? product.reviews : [],
        regularPrice: product.price,
        salePrice: product.discount ? product.price - (product.price * product.discount / 100) : product.price,
        tags: [
          ...(product.avgRating && product.avgRating > 4.5 ? ["best choice"] : []),
          ...(product.discount ? ["sale"] : []),
        ],
        inStock: product.stock > 0,
        slug: product.sku || product.id,
      }));

      setProducts(formattedProducts);
      setTotalPages(data.pagination.totalPages);
      setCurrentPage(data.pagination.page);
      setTotalCount(data.pagination.total);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, category, sort, pageParam, minPrice, maxPrice, color, size, type]);

  // Fetch wishlist items
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/wishlist?userId=${session.user.id}`);
        if (!response.ok) {
          console.error('Failed to fetch wishlist');
          return;
        }

        const data = await response.json();
        setWishlistItems(data.data?.items || []);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
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

  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set('searchTerm', search);
    router.push(`?${params.toString()}`);
  };

  const hasFilters = category || minPrice || maxPrice || color || size || type;

  // Handle error state
  if (error) {
    return <ProductsError error={error} retry={fetchProducts} />;
  }

  return (
    <div className="mx-auto min-h-full container p-4 md:p-6">
      {/* Mobile filters button */}
      <div className="flex items-center justify-between mb-4 lg:hidden">
        <button
          onClick={toggleFilters}
          className="flex items-center gap-2 text-sm bg-white border border-gray-300 rounded-md px-3 py-2"
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>

        <SortDropdown />
      </div>

      {/* Main content area */}
      <div className="flex relative">
        {/* Sidebar filters - desktop */}
        <div className="w-[250px] h-full hidden lg:block pr-6">
          <div className="sticky top-4">
            {/* Clear filters button */}
            {hasFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-800 mb-4 flex items-center"
              >
                <X size={16} className="mr-1" />
                Clear all filters
              </button>
            )}

            <SideCategories />
            <Separator />
            <SideProductType />
            <Separator />
            <SidePriceRange />
            <Separator />
            <SideSize />
            <Separator />
          </div>
        </div>

        {/* Mobile filters sidebar */}
        {isFiltersOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 lg:hidden">
            <div className="absolute right-0 top-0 h-full w-[280px] bg-white overflow-y-auto p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-lg">Filters</h3>
                <button onClick={toggleFilters} className="text-gray-500">
                  <X size={20} />
                </button>
              </div>

              {/* Clear filters button */}
              {hasFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 mb-4 flex items-center"
                >
                  <X size={16} className="mr-1" />
                  Clear all filters
                </button>
              )}

              <SideCategories />
              <Separator />
              <SideProductType />
              <Separator />
              <SidePriceRange />
              <Separator />
              <SideSize />
              <Separator />

              {/* Apply button for mobile */}
              <button
                onClick={toggleFilters}
                className="w-full bg-black text-white py-2 rounded-md mt-4"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        <div className="flex-1">
          <div className="hidden lg:flex justify-between items-center mb-4">
            <div className="text-sm text-gray-500">
              Showing {totalCount} {totalCount === 1 ? 'product' : 'products'}
            </div>
            <SortDropdown />
          </div>

          {/* Products grid or loading/no results */}
          {loading ? (
            <ProductListSkeleton />
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    // onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <NoResults
              title="No products found"
              description="Try changing your search or filter criteria."
            />
          )}
        </div>
      </div>

      {/* Promotional banner at bottom */}
      <div className="mt-12">
        <BannerPromotion />
      </div>
    </div>
  );
}

// Main Products component with Suspense
const Products = () => {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsContent />
    </Suspense>
  );
};

export default Products;