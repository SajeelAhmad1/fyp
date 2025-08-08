import React from 'react';
import { Card } from '@/common/components/elements/Card';
import { usePathname } from 'next/navigation';

interface ProductListSkeletonProps {
  count?: number;
}

const ProductListSkeleton: React.FC<ProductListSkeletonProps> = ({ count = 5 }) => {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isProductDetailsPage = pathname !== '/products';
  
  const gridClasses = isHomePage || isProductDetailsPage
    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-5 gap-4"
    : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4";
  
  return (
    <div className={gridClasses}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <div className="w-62 bg-white border border-gray-150 shadow-sm relative overflow-hidden">
            
            {/* Image placeholder */}
            <div className="relative flex items-center justify-center h-64">
              <div className="w-full h-full bg-gray-200 animate-pulse"></div>
            </div>

            <div className="p-4">
              {/* Title placeholder */}
              <div className="h-12 mb-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-full"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>

              <div className="flex justify-between">
                {/* Price placeholder */}
                <div className="flex items-center space-x-2 flex-row mb-2">
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                </div>

                {/* Stock placeholder */}
                <div className="flex items-center min-h-14 mb-3">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>

              {/* Rating placeholder */}
              <div className="flex items-center mb-4">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star} className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>

              {/* Button placeholder */}
              <div className="w-full h-10 bg-gray-200 rounded animate-pulse mt-2"></div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ProductListSkeleton;