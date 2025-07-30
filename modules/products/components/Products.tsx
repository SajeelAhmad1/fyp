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

const ProductContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [products, setProducts] = useState<ProductType[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Get current query parameters - ensure correct naming
  const search = searchParams.get('searchTerm') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const pageParam = searchParams.get('page') || '1';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const color = searchParams.get('color') || '';
  const size = searchParams.get('size') || '';
  const type = searchParams.get('type') || '';

  // Fetch products with updated mapping to ProductType
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setDebugInfo(null);

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
        const formattedProducts = data.products.map((product:any) => ({
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
      } catch (error:any) {
        throw new Error(`Failed to fetch products: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setProducts([]);
        setDebugInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, category, sort, pageParam, minPrice, maxPrice, color, size, type]);

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
        setWishlistItems(data.data?.items || []);
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

  // Rest of the existing component remains the same...
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

  return (
    <>
      <div className="mx-auto min-h-full container p-4 md:p-6">
        {/* Debug information - Remove in production */}
        {debugInfo && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
            <p className="font-bold">Debug Info:</p>
            <p>{debugInfo}</p>
          </div>
        )}

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

                {/* Add the same filter components as desktop */}
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

            {/* Products grid or no results */}
            {loading ? (
              <ProductListSkeleton />
            ) : products.length > 0 ? (
              <>
                {/* Updated to use grid with Product component */}
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
    </>
  );
};

const Products = () => {
  return (
    <Suspense fallback={<></>}>
      <ProductContent />
    </Suspense>
  );
};

export default Products;