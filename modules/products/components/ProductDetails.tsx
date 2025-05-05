"use client"

import { Card } from '@/common/components/elements/Card'
import { Separator } from '@/common/components/elements/Separator'
import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation';
import ProductSkeleton from './ProductDetailsSkeleton';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Toaster } from 'sonner';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

interface Vendor {
  id: string;
  name: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  shortDescription?: string;
  price: number;
  discount: number;
  stock: number;
  sku?: string;
  images?: string[];
  colors?: string[];
  sizes?: string[];
  category?: Category;
  vendor?: Vendor;
  reviews: Review[];
  avgRating: number;
  reviewCount: number;
}

// Star component implementation remains the same
const Star: React.FC<{ count: number }> = ({ count }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => {
        const fillPercentage = Math.max(0, Math.min(1, Math.max(0, count - (star - 1))));

        return (
          <svg
            key={star}
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#D3D3D3"
            strokeWidth={2}
          >
            <path
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
            <defs>
              <clipPath id={`starClip-${star}`}>
                <rect
                  x="0"
                  y="0"
                  width={`${fillPercentage * 24}`}
                  height="24"
                />
              </clipPath>
            </defs>
            <path
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              fill="#FFD700"
              clipPath={`url(#starClip-${star})`}
            />
          </svg>
        );
      })}
    </div>
  );
};

const StarNew: React.FC<{ count: number }> = ({ count }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => {
        const fillPercentage = Math.max(0, Math.min(1, count - (star - 1))) * 100;

        return (
          <div key={star} className="relative w-5 h-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute top-0 left-0 w-full h-full"
              viewBox="0 0 24 24"
              stroke="#D3D3D3"
              fill="#D3D3D3"
            >
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <div
              className="absolute top-0 left-0 h-full"
              style={{ width: `${fillPercentage}%`, overflow: "hidden" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
                viewBox="0 0 24 24"
                fill="#FFD700"
              >
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ProductDetails: React.FC = () => {
  const params = useParams();
  const id = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const router = useRouter();

  // Cart state variables
  const [isCartLoading, setIsCartLoading] = useState<boolean>(false);
  const [inCart, setInCart] = useState<boolean>(false);
  const [cartItemId, setCartItemId] = useState<string | undefined>(undefined);
  const [cartQuantity, setCartQuantity] = useState<number>(0);
  const [guestCartId, setGuestCartId] = useState<string | null>(null);
  const [isBuyNow, setIsBuyNow] = useState<boolean>(false);

  // Zoom state
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Order and email state
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentThumbnailStart, setCurrentThumbnailStart] = useState(0);

  useEffect(() => {
    const storedGuestCartId = localStorage.getItem('guestCartId');
    if (!storedGuestCartId) {
      const newGuestCartId = uuidv4();
      localStorage.setItem('guestCartId', newGuestCartId);
      setGuestCartId(newGuestCartId);
    } else {
      setGuestCartId(storedGuestCartId);
    }
  }, []);

  useEffect(() => {
    if ((userId || guestCartId) && product?.id) {
      checkCartStatus();
    }
  }, [userId, guestCartId, product?.id]);

  const checkCartStatus = async () => {
    try {
      const queryParams = userId
        ? `userId=${userId}`
        : `guestCartId=${guestCartId}`;

      const response = await fetch(`/api/cart?${queryParams}`);

      if (response.ok) {
        const { data } = await response.json();

        if (data && data.items) {
          const cartItem = data.items.find((item: any) => item.productId === product?.id);

          if (cartItem) {
            setInCart(true);
            setCartItemId(cartItem.id);
            setCartQuantity(cartItem.quantity || 1);
            setQuantity(cartItem.quantity || 1);
          } else {
            setInCart(false);
            setCartItemId(undefined);
            setCartQuantity(0);
            setQuantity(1);
          }
        }
      }
    } catch (error) {
      console.error("Error checking cart status:", error);
    }
  };

  const handleCartToggle = async () => {
    if (!product || (product.stock <= 0 && !inCart)) {
      return;
    }

    setIsCartLoading(true);

    try {
      const cartPayload = userId
        ? { userId, productId: product.id, quantity }
        : { guestCartId, productId: product.id, quantity };

      if (inCart && cartItemId) {
        const id = cartItemId;
        const response = await fetch(`/api/cart/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...(userId ? { userId } : { guestCartId }),
            itemId: cartItemId
          }),
        });

        if (response.ok) {
          setInCart(false);
          setCartItemId(undefined);
          setCartQuantity(0);
          setQuantity(1);
          toast.success("Successfully removed item from cart")
        } else {
          const errorData = await response.json();
          console.error('Delete Cart Item Error:', errorData);
        }
      } else {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cartPayload),
        });

        if (response.ok) {
          const data = await response.json();
          setInCart(true);
          setCartItemId(data.data.cartItem.id);
          setCartQuantity(quantity);
          toast.success("Successfully added item to cart")
        } else {
          const errorData = await response.json();
          console.error("Error adding to cart:", errorData.message);
        }
      }
    } catch (error) {
      console.error("Error toggling cart:", error);
    } finally {
      setIsCartLoading(false);
    }
  };

  const createOrder = async (guestEmail?: string) => {
    if (!product) return;

    try {
      setError(null);

      if (!inCart) {
        await handleCartToggle();
      }

      router.push(`/checkout`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed due to unknown error');
    }
  };

  const handleBuyNow = async () => {
    setIsBuyNow(true)
    if (!product) return;

    // Check stock
    if (quantity > product.stock) {
      setError(`Only ${product.stock} items available in stock`);
      return;
    }

    await createOrder();
  };

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }

        const data = await response.json();
        setProduct(data);
        setCurrentImageIndex(0);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const increaseQuantity = (): void => {
    product && setQuantity(prev => (prev < product.stock ? prev + 1 : prev));
  };

  const decreaseQuantity = (): void => {
    setQuantity(prev => prev > 1 ? prev - 1 : 1);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !imageContainerRef.current) return;

    const container = imageContainerRef.current;
    const rect = container.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
  };

  const calculateAverageRating = () => {
    if (!product?.reviews || product.reviews.length === 0) return 0;

    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / product.reviews.length;
  };

  const calculateDiscountedPrice = (): number => {
    if (!product) return 0;
    const discountedPrice = product.price * (1 - product.discount / 100);
    return parseFloat(discountedPrice.toFixed(2));
  };

  if (loading) {
    return <ProductSkeleton />;
  }

  if (!product) {
    return (
      <div className="container mx-auto py-14 flex justify-center items-center">
        <div className="text-xl">Product not found</div>
      </div>
    );
  }

  return (
    <div className='container mx-auto'>
      <div className='min-h-full flex flex-col lg:flex-row py-14'>
        {/* Product images section */}
        <div className="w-full lg:w-1/2 h-full justify-center items-center gap-5 flex flex-col">
  {/* Main Image */}
  <div
    ref={imageContainerRef}
    className="w-full max-w-[600px] h-[500px] relative overflow-hidden group"
    onMouseEnter={() => setIsZoomed(true)}
    onMouseLeave={() => setIsZoomed(false)}
    onMouseMove={handleMouseMove}
  >
    {product.images && product.images.length > 0 && (
      <div className="w-full h-full relative">
        <img
          src={product.images[currentImageIndex]}
          alt={`${product.name} - Image ${currentImageIndex + 1}`}
          className="w-full h-full object-contain p-5"
          style={{
            transform: isZoomed ? 'scale(4)' : 'scale(1)',
            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
            transition: 'transform 0.2s ease-out',
            cursor: isZoomed ? 'zoom-in' : 'zoom-in'
          }}
        />
      </div>
    )}
  </div>

  {/* Thumbnail Carousel */}
  {product.images && product.images.length > 0 && (
  <div className="flex items-center gap-2 w-full max-w-[600px]">
    <button
      onClick={() => {
        const newIndex = currentImageIndex === 0 ? product.images!.length - 1 : currentImageIndex - 1;
        setCurrentImageIndex(newIndex);
        // Auto-scroll thumbnails if needed
        if (newIndex < currentThumbnailStart) {
          setCurrentThumbnailStart(Math.max(0, newIndex));
        }
      }}
      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 disabled:opacity-50"
      disabled={product.images.length <= 4}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <div className="flex-1 overflow-hidden">
      <div 
        className="flex gap-2 transition-transform duration-300"
        style={{ 
          transform: `translateX(-${Math.min(
            currentThumbnailStart * 104, 
            (product.images.length - 4) * 104
          )}px)` 
        }}
      >
        {product.images.map((img, index) => (
          <div
            key={index}
            onClick={() => {
              setCurrentImageIndex(index);
              // Adjust thumbnail start position if needed
              if (index >= currentThumbnailStart + 4) {
                setCurrentThumbnailStart(Math.min(product.images.length - 4, index - 3));
              } else if (index < currentThumbnailStart) {
                setCurrentThumbnailStart(Math.max(0, index));
              }
            }}
            className={`w-24 h-24 flex-shrink-0 justify-center items-center flex relative cursor-pointer 
              ${currentImageIndex === index
                ? 'ring-2 ring-sky-900'
                : 'hover:bg-slate-100'
              }`}
          >
            <img
              src={img}
              alt={`Product thumbnail ${index + 1}`}
              className="max-h-full max-w-full object-contain p-1"
            />
          </div>
        ))}
      </div>
    </div>

    <button
      onClick={() => {
        const newIndex = currentImageIndex === product.images!.length - 1 ? 0 : currentImageIndex + 1;
        setCurrentImageIndex(newIndex);
        // Auto-scroll thumbnails if needed
        if (newIndex >= currentThumbnailStart + 4) {
          setCurrentThumbnailStart(Math.min(
            product.images!.length - 4, 
            newIndex - 3
          ));
        }
      }}
      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 disabled:opacity-50"
      disabled={product.images.length <= 4}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
)}
</div>

        {/* Product details section */}
        <div className="w-full lg:w-1/2 h-full lg:h-auto lg:flex lg:ml-5">
          <div className="w-full max-w-[500px] h-full lg:h-auto lg:w-full flex-col gap-2 flex mt-10 lg:mt-0 mx-auto px-4 lg:px-0">
            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div className="flex-col gap-2.5 flex">
              <div className="text-sky-900 font-semibold text-2xl">{product.name}</div>
              {product.discount > 0 ? (
                <div className="flex items-center gap-3">
                  <div className="text-red-600 text-2xl font-semibold">
                    &#163;{calculateDiscountedPrice()}
                  </div>
                  <div className="text-neutral-600 line-through text-xl">
                    &#163;{product.price}
                  </div>
                  <div className="text-green-600 text-base font-medium">
                    {product.discount}% OFF
                  </div>
                </div>
              ) : (
                <div className="text-neutral-600 text-2xl font-semibold">£{product.price}</div>
              )}
            </div>

            <div className="justify-normal gap-2.5 flex items-center">
              <Star count={calculateAverageRating()} />
              <div className="text-neutral-600 text-sm font-medium">
                {product.reviews.length > 0
                  ? `${calculateAverageRating().toFixed(1)} / 5 (${product.reviews.length} review${product.reviews.length !== 1 ? 's)' : ')'}`
                  : 'No reviews'
                }
              </div>
            </div>

            <div className="gap-5 flex">
              <div className="text-neutral-800 text-lg font-medium">Availability:</div>
              <div className="gap-3.5 flex">
                <div className={`text-lg font-medium ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {product.stock > 0 ? 'In stock' : 'Out of stock'}
                </div>
              </div>
            </div>

            {product.stock > 0 && (
              <div className="text-zinc-600 text-base font-medium">
                Hurry up! only {product.stock} product{product.stock !== 1 ? 's' : ''} left in stock!
              </div>
            )}

            <Separator />

            {product.colors && product.colors.length > 0 && (
              <div className="flex items-center">
                <span className='font-semibold'>Color:</span>
                <div className="flex gap-2 ml-3">
                  {product.colors.map((color, index) => (
                    <div
                      key={index}
                      className="w-4 h-4 rounded-full cursor-pointer border border-gray-300"
                      style={{ backgroundColor: color }}
                      aria-label={`Color: ${color}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div className="flex items-center">
                <span className='font-semibold'>Size:</span>
                <div className="flex gap-2 ml-3 flex-wrap">
                  {product.sizes.map((size, index) => (
                    <button
                      key={index}
                      className="w-16 h-8 bg-zinc-100 border items-center justify-center flex focus:bg-blue-200"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center">
              <span className='font-semibold'>Quantity:</span>
              <div className="flex gap-0 ml-3">
                <button
                  onClick={decreaseQuantity}
                  className="w-10 h-8 bg-zinc-100 border items-center justify-center flex"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <input
                  type="text"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-14 h-8 bg-zinc-100 border border-slate-200 focus:ring-0 focus:border-slate-200 text-center"
                  aria-label="Quantity"
                />
                <button
                  onClick={increaseQuantity}
                  className="w-10 h-8 bg-zinc-100 border items-center justify-center flex"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-3">
              <button
                onClick={handleCartToggle}
                disabled={product.stock <= 0 && !inCart}
                className={`w-full sm:w-56 h-16 text-white text-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed ${inCart ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'
                  }`}
              >
                {isCartLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                ) : inCart ? (
                  "Remove from cart"
                ) : (
                  "Add to cart"
                )}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0 || isCreatingOrder}
                className='w-full sm:w-56 h-16 bg-amber-500 hover:bg-amber-600 text-white text-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed'
              >
                {isCreatingOrder ? 'Processing...' : 'Buy it now'}
              </button>
            </div>

            <Separator />

            <div className="flex items-center">
              <div className='font-semibold'>Sku:</div>
              <span className='ml-3'>{product.sku || 'N/A'}</span>
            </div>

            <div className="flex items-center">
              <div className='font-semibold'>Category:</div>
              <div className='flex ml-3 gap-2'>
                {product.category ? (
                  <span className='flex text-sm'>{product.category.name}</span>
                ) : (
                  <span className='flex text-sm'>Uncategorized</span>
                )}
              </div>
            </div>

            {product.vendor && (
              <div className="flex items-center">
                <div className='font-semibold'>Vendor:</div>
                <span className='ml-3'>{product.vendor.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product description and reviews */}
      <div className='p-0 md:p-5 flex flex-col justify-center items-center m-auto'>
        <Card className="w-[85%] md:w-full flex flex-col gap-3 border border-grey-200">
          <span className='font-semibold text-sky-900 text-2xl mb-2'>Product Description</span>
          <div
            className="text-gray-800"
            dangerouslySetInnerHTML={{ __html: product.shortDescription || 'No description available for this product.' }}
          />
          <div
            className="text-gray-800"
            dangerouslySetInnerHTML={{ __html: product.description || 'No description available for this product.' }}
          />
        </Card>
        <Card className="w-[85%] md:w-full flex flex-col gap-3 mt-5">
          <span className='font-semibold text-sky-900 text-xl'>Customer Reviews</span>

          {product.reviews && product.reviews.length > 0 ? (
            <div className="flex flex-col gap-6 mt-4">
              {product.reviews.map((review) => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full text-gray-600 font-semibold">
                      {review.user?.customerProfile?.firstName?.[0]?.toUpperCase() || 'A'}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {review.user?.customerProfile?.firstName + " " + review.user?.customerProfile?.lastName || 'Anonymous'}
                          </span>
                          <StarNew count={review.rating} />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <p className="mt-2 text-gray-700 leading-relaxed">{review.comment}</p>

                      <span className="text-sm text-gray-600">Rating: {review.rating} / 5</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-500 mt-4 py-6 border rounded-lg">
              No reviews yet. Be the first to leave a review!
            </div>
          )}
        </Card>
      </div>
      <Toaster position='top-right' />
    </div>
  )
}

export default ProductDetails