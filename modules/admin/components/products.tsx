// ProductsPage.tsx
"use client"
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Trash } from 'lucide-react';
import Product from '../../homepage/components/Product';
// Define types based on your API
interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    images: string[];
    avgRating: number;
    isFeatured: true;
    reviewCount: number;
    category: {
        id: string;
        name: string;
    };
    vendor: {
        id: string;
        name: string;
    };
}

interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface ProductsResponse {
    products: Product[];
    pagination: PaginationInfo;
}

const ProductsPage: React.FC = () => {
    // State for products and filters
    const [products, setProducts] = useState<Product[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for filters
    const [category, setCategory] = useState<string>('');
    const [vendorId, setVendorId] = useState<string>('');
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortOption, setSortOption] = useState<string>('newest');

    // Get search params from URL
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleDelete = async (productId: string) => {
  if (!productId) return;
  
  // Show confirmation dialog
  const confirmed = window.confirm(
    "Are you sure you want to delete this product? " +
    "This will also remove it from all carts and orders. " +
    "This action cannot be undone."
  );
  
  if (!confirmed) return;

  setIsDeleting(productId);
  
  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete product');
    }
    
    // Refresh the product list
    await fetchProducts();
    
    // Show success message
    alert('Product deleted successfully!');
  } catch (error: any) {
    console.error('Error deleting product:', error);
    alert(error.message || 'An error occurred while deleting the product');
  } finally {
    setIsDeleting(null);
  }
};

    // Fetch products with current filters
    const fetchProducts = async () => {
        setLoading(true);
        setError(null);

        try {
            // Build query string from filters
            const params = new URLSearchParams();
            if (category) params.append('category', category);
            if (vendorId) params.append('vendorId', vendorId);
            if (minPrice) params.append('minPrice', minPrice);
            if (maxPrice) params.append('maxPrice', maxPrice);
            if (searchQuery) params.append('search', searchQuery);
            if (sortOption) params.append('sort', sortOption);

            params.append('page', pagination.page.toString());
            params.append('limit', pagination.limit.toString());

            const response = await fetch(`/api/products?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const data: ProductsResponse = await response.json();
            setProducts(data.products);
            setPagination(data.pagination);
        } catch (err: any) {
            setError(err.message || 'An error occurred while fetching products');
        } finally {
            setLoading(false);
        }
    };

   

    // Initialize from URL params on component mount
    useEffect(() => {
        const categoryParam = searchParams.get('category');
        const vendorParam = searchParams.get('vendorId');
        const minPriceParam = searchParams.get('minPrice');
        const maxPriceParam = searchParams.get('maxPrice');
        const searchParam = searchParams.get('search');
        const sortParam = searchParams.get('sort');
        const pageParam = searchParams.get('page');

        if (categoryParam) setCategory(categoryParam);
        if (vendorParam) setVendorId(vendorParam);
        if (minPriceParam) setMinPrice(minPriceParam);
        if (maxPriceParam) setMaxPrice(maxPriceParam);
        if (searchParam) setSearchQuery(searchParam);
        if (sortParam) setSortOption(sortParam);
        if (pageParam) setPagination(prev => ({ ...prev, page: parseInt(pageParam) }));

        fetchProducts();
    }, [searchParams]);

 

    // Handle pagination
    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));

            // Update URL and fetch new page
            const params = new URLSearchParams(searchParams.toString());
            params.set('page', newPage.toString());
            router.push(`admin/products?${params.toString()}`);

            // Scroll to top
            window.scrollTo(0, 0);
        }
    };

    // Render star rating
    const renderStarRating = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(<span key={i} className="text-yellow-500">★</span>);
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars.push(<span key={i} className="text-yellow-500">⋆</span>);
            } else {
                stars.push(<span key={i} className="text-gray-300">☆</span>);
            }
        }

        return <div className="flex">{stars}</div>;
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Products</h1>



            {/* Loading state */}
            {loading ? (
                <div className="text-center py-8">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-2">Loading products...</p>
                </div>
            ) : (
                <>
                    {/* Products grid */}
                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <div key={product.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    {/* Product image */}
                                    <div className="h-48 bg-gray-200 relative">
                                        {product.images && product.images.length > 0 ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
                                                No image
                                            </div>
                                        )}
                                    </div>

                                    {/* Product details */}
                                    <div className="p-4">
                                        <h3 className="font-semibold text-lg mb-1 truncate">
                                            <div className='flex justify-between'>
                                                <div className="text-blue-600 hover:underline">
                                                    {product.name}
                                                </div>
                                                <button
  onClick={() => handleDelete(product.id)}
  disabled={isDeleting === product.id}
  className="text-red-500 hover:text-red-700 disabled:opacity-50"
>
  {isDeleting === product.id ? (
    <span className="animate-pulse">Deleting...</span>
  ) : (
    <Trash size={16} />
  )}
</button>
                                            </div>
                                        </h3>

                                        <p className="text-[#000000] text-sm mb-2 truncate">
                                            {product?.category?.name || ""}
                                        </p>

                                        {/* Rating */}
                                        <div className="flex items-center mb-2">
                                            {renderStarRating(product.avgRating)}
                                            <span className="text-sm text-[#000000] ml-1">
                                                ({product.reviewCount})
                                            </span>
                                        </div>

                                        {/* Price and vendor */}
                                        <div className="flex justify-between items-end">
                                            <div className="text-xl font-bold">${product.price}</div>
                                            <div className="text-xs text-[#000000]">{product.vendor?.name || ""}</div>
                                        </div>

                                        {/* Stock status */}
                                        <div className={`text-sm mt-2 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                                        </div>


                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-gray-100 rounded-lg">
                            <p className="text-gray-600">No products found. Try adjusting your filters.</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex justify-center mt-8">
                            <nav className="flex items-center">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className={`px-3 py-1 rounded-l border ${pagination.page === 1 ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-100'
                                        }`}
                                >
                                    Previous
                                </button>

                                {/* Page numbers */}
                                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                    .filter(page => {
                                        // Show first page, last page, current page and pages around current page
                                        return (
                                            page === 1 ||
                                            page === pagination.totalPages ||
                                            Math.abs(page - pagination.page) <= 1
                                        );
                                    })
                                    .map((page, index, array) => {
                                        // Add ellipsis if there are gaps
                                        const prevPage = array[index - 1];
                                        const showEllipsisBefore = index > 0 && prevPage !== page - 1;

                                        return (
                                            <React.Fragment key={page}>
                                                {showEllipsisBefore && (
                                                    <span className="px-3 py-1 border-t border-b text-[#000000]">...</span>
                                                )}
                                                <button
                                                    onClick={() => handlePageChange(page)}
                                                    className={`px-3 py-1 border-t border-b ${pagination.page === page
                                                            ? 'bg-blue-600 text-white font-medium'
                                                            : 'hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            </React.Fragment>
                                        );
                                    })}

                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.totalPages}
                                    className={`px-3 py-1 rounded-r border ${pagination.page === pagination.totalPages
                                            ? 'bg-gray-100 text-gray-400'
                                            : 'hover:bg-gray-100'
                                        }`}
                                >
                                    Next
                                </button>
                            </nav>
                        </div>
                    )}

                    {/* Results summary */}
                    <div className="mt-4 text-center text-sm text-[#000000]">
                        Showing {(pagination.page - 1) * pagination.limit + 1} -
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
                    </div>
                </>
            )}
        </div>
    );
};

export default ProductsPage;