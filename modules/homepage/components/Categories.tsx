import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Define the type for categories based on your Prisma schema
interface Category {
  id: number;
  name: string;
  description?: string;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: number;
  name: string;
  categoryId: number;
}

export const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/categories");

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();
        setCategories(data);
        setIsLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fallback emoji for categories without specific icons
  const getDefaultIcon = (categoryName: string) => {
    const iconMap: { [key: string]: string } = {
      "Toys and Games": "🧸",
      "Home and Kitchen": "🏠",
      "Sports and Outdoors": "⚽",
      "Health and Care": "💊",
    };

    return iconMap[categoryName] || "📦";
  };

  if (isLoading) {
    return (
      <div className="categories-container px-4 sm:px-8 md:px-12 lg:px-20 mt-6 sm:mt-10 lg:mt-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 w-full">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-3 sm:p-4 border-2 rounded-full animate-pulse"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gray-200 rounded-full mb-2"></div>
              <div className="h-3 sm:h-4 w-16 sm:w-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="categories-container px-4 sm:px-8 md:px-12 lg:px-20 mt-6 sm:mt-10 lg:mt-20">
        <div className="text-center text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="categories-container px-4 sm:px-8 md:px-12 lg:px-20 mt-6 sm:mt-10 lg:mt-20">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 w-full">
        {categories.map((category) => (
          <div
            onClick={() => router.push(`/products?category=${category.id}`)}
            key={category.id}
            className="flex flex-col items-center justify-center p-3 sm:p-4 border-2 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
          >
            <span className="text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2">
              {getDefaultIcon(category.name)}
            </span>
            <span className="text-center text-xs sm:text-sm font-medium">
              {category.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
