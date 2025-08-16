import React from 'react';
import { Star } from 'lucide-react';

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

interface RatingSummaryProps {
  ratingStats: RatingStats;
}

const RatingSummary: React.FC<RatingSummaryProps> = ({ ratingStats }) => {
  const { totalReviews, averageRating, distribution, percentages } = ratingStats;

  // Render stars for average rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-5 h-5 fill-[#FF9B00] text-[#FF9B00]" />
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="w-5 h-5 text-gray-300" />
          <Star 
            className="w-5 h-5 fill-[#FF9B00] text-[#FF9B00] absolute top-0 left-0" 
            style={{ clipPath: 'inset(0 50% 0 0)' }}
          />
        </div>
      );
    }

    // Empty stars
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
      );
    }

    return stars;
  };

  if (totalReviews === 0) {
    return (
      <div className="bg-white rounded-xl p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Customer reviews</h3>
        <div className="text-center py-8">
          <div className="text-gray-500">No reviews yet</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Customer reviews</h3>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-1">
          {renderStars(averageRating)}
        </div>
        <span className="text-xl font-semibold text-gray-900">
          {averageRating.toFixed(1)} out of 5
        </span>
      </div>

      <div className="text-sm text-gray-600 mb-6">
        {totalReviews} global rating{totalReviews !== 1 ? 's' : ''}
      </div>

      <div className="space-y-3">
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} className="flex items-center gap-3">
            <div className="flex items-center gap-1 w-16">
              <span className="text-sm font-medium">{rating} star</span>
            </div>
            
            <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#FF9B00] transition-all duration-300 ease-out rounded-full"
                style={{ width: `${percentages[rating as keyof typeof percentages]}%` }}
              />
            </div>
            
            <div className="w-12 text-right">
              <span className="text-sm font-medium">
                {percentages[rating as keyof typeof percentages]}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingSummary;