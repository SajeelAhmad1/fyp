"use client";

import { Card } from "@/common/components/elements/Card";
import { useState, useEffect } from "react";
import avatar from "@/assets/myImages/avatar.png";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  BadgeCheck,
} from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  images: string[];
  user: {
    id: string;
    email: string;
    customerProfile: {
      firstName: string;
      lastName: string;
      imageUrl?: string;
    } | null;
  };
}

interface RatingStats {
  totalReviews: number;
  averageRating: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  percentages: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

interface ReviewsResponse {
  reviews: Review[];
  ratingStats: RatingStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

interface ReviewsSectionProps {
  productId: string;
}

const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  // Full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star key={i} className="w-5 h-5 fill-orange-500 text-orange-500" />
    );
  }

  // Half star
  if (hasHalfStar) {
    stars.push(
      <div key="half" className="relative">
        <Star className="w-5 h-5 text-gray-300" />
        <Star
          className="w-5 h-5 fill-orange-500 text-orange-500 absolute top-0 left-0"
          style={{ clipPath: "inset(0 50% 0 0)" }}
        />
      </div>
    );
  }

  // Empty stars
  const remainingStars = 5 - Math.ceil(rating);
  for (let i = 0; i < remainingStars; i++) {
    stars.push(<Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />);
  }

  return stars;
};

// Rating Summary Component
const RatingSummary: React.FC<{ ratingStats: RatingStats }> = ({
  ratingStats,
}) => {
  const { totalReviews, averageRating, distribution, percentages } =
    ratingStats;

  if (totalReviews === 0) {
    return (
      <Card className="w-full max-w-4xl  p-8 bg-white shadow-sm border border-gray-100 mb-6 rounded-xl">
        <h3 className="text-2xl font-medium text-gray-900 mb-4">
          Customer reviews
        </h3>
        <div className="text-center py-8">
          <div className="text-gray-500">No reviews yet</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full p-8 bg-white mb-6">
      <h3 className="text-2xl font-medium mb-2">Customer reviews</h3>

      <div className="flex items-center gap-4 mb-2">
        <div className="flex items-center gap-1">
          {renderStars(averageRating)}
        </div>
        <span className="text-md font-medium text-gray-900">
          {averageRating.toFixed(1)} out of 5
        </span>
      </div>

      <div className="text-sm text-gray-600 mb-6">
        {totalReviews + 100} global rating{totalReviews !== 1 ? "s" : ""}
      </div>

      <div className="space-y-3">
        {[5, 4, 3, 2, 1].map((rating) => {
          const getRatingLabel = (rating: number) => {
            switch (rating) {
              case 5:
                return "5 star";
              case 4:
                return "4 star";
              case 3:
                return "3 star";
              case 2:
                return "2 star";
              case 1:
                return "1 star";
              default:
                return `${rating} star`;
            }
          };

          return (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-16">
                <span className="text-sm font-medium text-blue-600">
                  {getRatingLabel(rating)}
                </span>
              </div>

              <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 transition-all duration-300 ease-out rounded-full"
                  style={{
                    width: `${
                      percentages[rating as keyof typeof percentages]
                    }%`,
                  }}
                />
              </div>

              <div className="w-12 text-right">
                <span className="text-sm font-medium text-blue-600">
                  {percentages[rating as keyof typeof percentages]}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default function ReviewsSection({ productId }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentReviewImages, setCurrentReviewImages] = useState<string[]>([]);

  const fetchReviews = async (page: number = 1, reset: boolean = true) => {
    try {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await fetch(
        `/api/products/${productId}/reviews?page=${page}&limit=5`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data: ReviewsResponse = await response.json();

      if (reset || page === 1) {
        setReviews(data.reviews);
        setRatingStats(data.ratingStats);
      } else {
        setReviews((prev) => [...prev, ...data.reviews]);
      }

      setPagination(data.pagination);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reviews");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const loadMore = () => {
    if (pagination?.hasMore && !loadingMore) {
      fetchReviews(currentPage + 1, false);
    }
  };

  const openImageModal = (imageUrl: string, reviewImages: string[]) => {
    setCurrentReviewImages(reviewImages);
    setCurrentImageIndex(reviewImages.indexOf(imageUrl));
    setSelectedImage(imageUrl);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setCurrentReviewImages([]);
    setCurrentImageIndex(0);
  };

  const navigateImage = (direction: "prev" | "next") => {
    if (currentReviewImages.length <= 1) return;

    let newIndex;
    if (direction === "prev") {
      newIndex =
        currentImageIndex > 0
          ? currentImageIndex - 1
          : currentReviewImages.length - 1;
    } else {
      newIndex =
        currentImageIndex < currentReviewImages.length - 1
          ? currentImageIndex + 1
          : 0;
    }

    setCurrentImageIndex(newIndex);
    setSelectedImage(currentReviewImages[newIndex]);
  };

  // const getInitials = (firstName?: string, lastName?: string) => {
  //   if (firstName && lastName) {
  //     return `${firstName[0]}${lastName[0]}`.toUpperCase();
  //   }
  //   if (firstName) {
  //     return firstName[0].toUpperCase();
  //   }
  //   return "A";
  // };

  // const getRandomGradient = (id: string) => {
  //   const gradients = [
  //     "bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-300",
  //   ];
  //   const index = id.length % gradients.length;
  //   return gradients[index];
  // };

  if (loading) {
    return (
      <div className="w-full">
        <Card className="p-8 bg-white shadow-sm border border-gray-100 mt-8 rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="font-semibold text-gray-900 text-2xl">
              Customer Reviews
            </span>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent"></div>
            <span className="ml-3 text-gray-500">Loading reviews...</span>
          </div>
        </Card>
      </div>
    );
  }

  const reviewsWithComments = reviews.filter((review) => review.comment);

  return (
    <div className="w-full flex flex-col md:flex-row">
      {/* Rating Summary Section */}
      <div className="w-full md:w-1/4">
        {ratingStats && <RatingSummary ratingStats={ratingStats} />}
      </div>

      <div className="w-full md:w-3/4 px-4 md:px-32">
        {/* Individual Reviews Section */}
        <div className="bg-white">
          <div className="border-b border-gray-200 pb-4 mb-6 mt-8">
            <h3 className="text-2xl font-medium text-gray-900">
              Recent Customer reviews
            </h3>
          </div>

          {reviewsWithComments.length > 0 ? (
            <div className="space-y-6">
              {reviewsWithComments.map((review: Review, index: number) => (
                <div key={review.id} className="border-b border-gray-200 pb-6">
                  {/* Review Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      {review.user?.customerProfile?.imageUrl ? (
                        <img
                          src={review.user.customerProfile.imageUrl}
                          alt="Customer Profile"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <img
                          src={avatar.src}
                          alt="Customer Profile"
                          className="w-full h-full object-cover rounded-full"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-semibold text-gray-900">
                          {review.user?.customerProfile?.firstName &&
                          review.user?.customerProfile?.lastName
                            ? `${review.user.customerProfile.firstName} ${review.user.customerProfile.lastName}`
                            : "Anonymous"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        {renderStars(review.rating)}
                        {/* <StarNew count={review.rating} /> */}
                      </div>
                      <p className="text-sm text-gray-600">
                        Reviewed on{" "}
                        {new Date(review.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <BadgeCheck className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-gray-600">
                          Verified Purchase
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Review Comment */}
                  <div className="ml-11">
                    <p className="text-sm text-gray-900 leading-relaxed mb-3">
                      {review.comment}
                    </p>

                    {/* Review Images */}
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mb-3">
                        {review.images.map((image, imgIndex) => (
                          <button
                            key={imgIndex}
                            onClick={() => openImageModal(image, review.images)}
                            className="w-16 h-16 rounded border border-gray-300 overflow-hidden hover:border-gray-400 transition-colors"
                          >
                            <img
                              src={image}
                              alt={`Customer image ${imgIndex + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Load More Button */}
              {pagination?.hasMore && (
                <div className="text-center pt-6">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-6 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-900"></div>
                        Loading...
                      </div>
                    ) : (
                      "See more reviews"
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-600 text-base mb-2">
                There are no customer reviews yet.
              </div>
              <button className="text-blue-600 hover:text-blue-700 hover:underline text-sm">
                Be the first to review this item
              </button>
            </div>
          )}

          {/* Simple Image Modal */}
          {selectedImage && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="relative max-w-4xl ">
                <button
                  onClick={closeImageModal}
                  className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-75"
                >
                  <X className="w-5 h-5" />
                </button>

                {currentReviewImages.length > 1 && (
                  <>
                    <button
                      onClick={() => navigateImage("prev")}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-75"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => navigateImage("next")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-75"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                <img
                  src={selectedImage}
                  alt="Review image"
                  className="max-w-full max-h-[500px] flex items-center justify-center object-contain"
                />

                {currentReviewImages.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    {currentImageIndex + 1} of {currentReviewImages.length}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
