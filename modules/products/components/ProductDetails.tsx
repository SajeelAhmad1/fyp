"use client";

import { Card } from "@/common/components/elements/Card";
import { Separator } from "@/common/components/elements/Separator";
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import ProductSkeleton from "./ProductDetailsSkeleton";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useCart } from "@/components/context/CartContext";
import { useSession } from "next-auth/react";
import ReviewsSection from "@/components/Reviews";
import { Product } from "@/types/productDetails";
import StarNew from "./Stars";
import { SalesTimer } from "./salesTimer";

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
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedGuestCartId = localStorage.getItem("guestCartId");
    if (!storedGuestCartId) {
      const newGuestCartId = uuidv4();
      localStorage.setItem("guestCartId", newGuestCartId);
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
          const cartItem = data.items.find(
            (item: any) => item.productId === product?.id
          );

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
      throw new Error("Failed to check cart status");
    }
  };

  const { openCart } = useCart();

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
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...(userId ? { userId } : { guestCartId }),
            itemId: cartItemId,
          }),
        });

        if (response.ok) {
          setInCart(false);
          setCartItemId(undefined);
          setCartQuantity(0);
          setQuantity(1);
        } else {
          const errorData = await response.json();
        }
      } else {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cartPayload),
        });

        if (response.ok) {
          const data = await response.json();
          setInCart(true);
          setCartItemId(data.data.cartItem.id);
          setCartQuantity(quantity);
        } else {
          const errorData = await response.json();
        }
      }
    } catch (error) {
      throw new Error("Failed to toggle cart status");
    } finally {
      setIsCartLoading(false);
    }
    if (!inCart && !isBuyNow && !isCartLoading) {
      openCart();
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const createOrder = async (guestEmail?: string) => {
    if (!product) return;

    try {
      setIsCreatingOrder(true);
      setError(null);

      // Validate guest email if not logged in
      if (!session?.user && !guestEmail) {
        throw new Error("Email is required for guest checkout");
      }

      if (guestEmail && !validateEmail(guestEmail)) {
        throw new Error("Please enter a valid email address");
      }

      // First ensure product is in cart
      if (!inCart) {
        await handleCartToggle();
      }

      const orderItems = [
        {
          productId: product.id,
          quantity: quantity,
          unitPrice: product.price,
          discountPercentage: product.discount || 0,
        },
      ];

      const requestBody = {
        items: orderItems,
        ...(session?.user
          ? { userId: session.user.id }
          : { guestEmail: guestEmail?.toLowerCase().trim() }),
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || errorData.message || "Failed to create order"
        );
      }

      const { data } = await response.json();
      router.push(`/checkout?orderId=${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleBuyNow = async () => {
    setIsBuyNow(true);
    if (!product) return;

    // Check stock
    if (quantity > product.stock) {
      setError(`Only ${product.stock} items available in stock`);
      return;
    }

    if (!session?.user) {
      setShowEmailModal(true);
      return;
    }

    await createOrder();
  };

  const handleEmailSubmit = () => {
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setEmailError("");
    localStorage.setItem("guestEmail", email.toLowerCase().trim());
    createOrder(email);
  };

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }

        const data = await response.json();
        setProduct(data);
        setCurrentImageIndex(0);

      } catch (error) {
        throw new Error("Failed to fetch product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const increaseQuantity = (): void => {
    product && setQuantity((prev) => (prev < product.stock ? prev + 1 : prev));
  };

  const decreaseQuantity = (): void => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
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

    const totalRating = product.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
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
    <div className="container mx-auto">
      <div className="min-h-full flex flex-col lg:flex-row py-6 md:py-14">
        {/* Product images section */}
        <div className="md:sticky top-0 w-full lg:w-1/2 h-full justify-center items-center gap-5 flex flex-col">
          <div className="w-full max-w-[600px] h-96 relative overflow-hidden group">
            {product.images && product.images.length > 0 && (
              <div
                ref={imageContainerRef}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
                className="w-full h-full relative"
                style={{
                  transform: isZoomed ? "scale(4)" : "scale(1)",
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  transition: "transform 0.2s ease-out",
                  cursor: isZoomed ? "zoom-in" : "zoom-in",
                }}
              >
                <img
                  src={product.images[currentImageIndex]}
                  alt={`${product.name} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain p-0"
                />
              </div>
            )}

            <button
              onClick={() => {
                if (!product?.images?.length) return;
                setCurrentImageIndex((prev) =>
                  prev === 0 ? product.images!.length - 1 : prev - 1
                );
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-100 z-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={() => {
                if (!product?.images?.length) return;
                setCurrentImageIndex((prev) =>
                  prev === product.images!.length - 1 ? 0 : prev + 1
                );
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-100 z-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <div className="flex m-auto flex-wrap gap-5 group">
            {product.images &&
              product.images.map((img, index) => (
                <div
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-28 h-28 md:w-36 md:h-32 justify-center items-center flex relative cursor-pointer 
                  ${
                    currentImageIndex === index
                      ? "ring-2 ring-sky-900"
                      : "hover:bg-slate-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Product image ${index + 1}`}
                    className="max-h-full max-w-full object-contain p-2"
                  />
                </div>
              ))}
          </div>
        </div>

        {/* Product details section */}
        <div className="w-full lg:w-1/2 h-full lg:h-auto lg:flex lg:ml-5">
          <div className="w-full h-full lg:h-auto lg:w-full flex-col gap-2 flex mt-10 lg:mt-0 mx-auto px-4 lg:px-0">
            <div className="flex-col gap-2.5 flex">
              <div className="text-gray-900 font-medium text-2xl">
                {product.name}
              </div>
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
                <div className="text-neutral-600 text-2xl font-semibold">
                  ${product.price}
                </div>
              )}
            </div>

            <div className="justify-normal gap-2.5 flex items-center">
              <StarNew count={calculateAverageRating()} />
              <div className="text-neutral-600 text-sm font-medium">
                {product.reviews.length > 0
                  ? `${calculateAverageRating().toFixed(1)} / 5 (${
                      product.reviews.length + 297
                    } review${product.reviews.length !== 1 ? "s)" : ")"}`
                  : "No reviews"}
              </div>
            </div>

            <div className="gap-5 flex">
              <div className="text-neutral-800 text-lg font-medium">
                Availability:
              </div>
              <div className="gap-3.5 flex">
                <div
                  className={`text-lg font-medium ${
                    product.stock > 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {product.stock > 0 ? "In stock" : "Out of stock"}
                </div>
              </div>
            </div>

            <div className="text-neutral-600 text-base font-medium">
              Fast shipping in 3 to 5 business days.
            </div>

            {product.stock > 0 && (
              <div className="text-zinc-600 text-base font-medium">
                Hurry up! only {product.stock} product
                {product.stock !== 1 ? "s" : ""} left in stock!
              </div>
            )}

            <Separator />

            {product.colors && product.colors.length > 0 && (
              <div className="flex items-center">
                <span className="font-semibold">Color:</span>
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

            {product.size && product.size.length > 0 && (
              <div className="flex items-center">
                <span className="font-semibold text-black">Size:</span>
                <div className="flex gap-2 ml-3 flex-wrap">
                  {product.size.map((size, index) => (
                    <button
                      key={index}
                      className="text-black w-16 h-8 bg-zinc-100 border items-center justify-center flex focus:bg-blue-200"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center">
              <span className="font-semibold text-black">Quantity:</span>
              <div className="flex gap-0 ml-3">
                <button
                  onClick={decreaseQuantity}
                  className="text-black w-10 h-8 bg-zinc-100 border items-center justify-center flex"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <input
                  type="text"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-14 h-8 text-black bg-zinc-100 border border-slate-200 focus:ring-0 focus:border-slate-200 text-center"
                  aria-label="Quantity"
                />
                <button
                  onClick={increaseQuantity}
                  className="text-black w-10 h-8 bg-zinc-100 border items-center justify-center flex"
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
                className={`w-full sm:w-56 h-16 text-white text-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed ${
                  inCart ? "bg-red-500 hover:bg-red-600" : "bg-gray-900"
                }`}
              >
                {isCartLoading ? (
                  <div className="text-black w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                ) : inCart ? (
                  "Remove from cart"
                ) : (
                  "Add to cart"
                )}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0 || isCreatingOrder}
                className="w-full sm:w-56 h-16 bg-gray-900 text-white text-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isCreatingOrder ? "Processing..." : "Buy it now"}
              </button>
            </div>

            <Separator />

            <div className="flex items-center">
              <div className="font-semibold">Sku:</div>
              <span className="ml-3">{product.sku || "N/A"}</span>
            </div>

            <div className="flex items-center">
              <div className="font-semibold">Category:</div>
              <div className="flex ml-3 gap-2">
                {product.category ? (
                  <span className="flex text-sm">{product.category.name}</span>
                ) : (
                  <span className="flex text-sm">Uncategorized</span>
                )}
              </div>
            </div>
            <div className="mt-4">
              <Card className="flex flex-col border border-grey-200">
                <span className="font-semibold text-gray-900 text-2xl mb-2">
                  Product Description
                </span>
                <div className="text-gray-800">
                  {product.shortDescription ||
                    "No description available for this product."}
                </div>
                <div className="text-gray-800">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: product.description as string,
                    }}
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Product description and reviews */}
      {product.video && (
        <div className="py-2 md:py-16">
          <video
            src={product.video}
            className="px-4 max-h-screen md:h-screen max-w-screen md:w-screen"
            controls
            preload="metadata"
          />
        </div>
      )}
      <ReviewsSection productId={product.id} />

      {/* Sales Timer - Chatbot style */}
      <SalesTimer endTime={product.salesEndTime} />

      {/* Email modal for guest checkout */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Enter Your Email</h3>
            <p className="text-gray-600 mb-4">
              Please provide your email address to proceed with checkout.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full p-2 border border-gray-300 rounded mb-2"
            />
            {emailError && (
              <p className="text-red-500 text-sm mb-2">{emailError}</p>
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleEmailSubmit}
                className="px-4 py-2 text-white rounded bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-300"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
