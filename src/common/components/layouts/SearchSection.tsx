'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { Search, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from 'next/navigation';

interface Category {
  id: string;
  name: string;
  description?: string;
}

// Loading component for categories
const CategoryDropdownSkeleton = () => (
  <div className="flex items-center justify-between px-3 py-3 border border-gray-300 rounded-l-sm bg-gray-50 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-24"></div>
    <ChevronDown size={16} className="text-gray-300" />
  </div>
);

// Loading component for mobile dropdown
const MobileCategoryDropdownSkeleton = () => (
  <div className="flex items-center justify-between px-3 py-3 border border-gray-300 rounded-t-sm bg-gray-50 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-32"></div>
    <ChevronDown size={16} className="text-gray-300" />
  </div>
);

// Category dropdown component that can be suspended
const CategoryDropdown = ({ 
  categories, 
  selectedCategory, 
  onCategorySelect, 
  isDropdownOpen, 
  onToggleDropdown, 
  isFocused, 
  isMobile = false 
}: {
  categories: Category[];
  selectedCategory: Category | null;
  onCategorySelect: (category: Category | null) => void;
  isDropdownOpen: boolean;
  onToggleDropdown: () => void;
  isFocused: boolean;
  isMobile?: boolean;
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onToggleDropdown();
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isDropdownOpen, onToggleDropdown]);

  const buttonClasses = `flex items-center justify-between px-3 py-3 border text-gray-700 transition-all duration-200 ${
    isFocused ? 'border-amber-500' : 'border-gray-300'
  } ${
    selectedCategory ? 'text-gray-900 bg-gray-100' : 'text-gray-500 bg-white'
  } ${
    isMobile ? 'rounded-t-sm' : 'border-r-0 rounded-l-sm'
  }`;

  const buttonStyle = isMobile ? {} : { minWidth: 'fit-content', maxWidth: '200px' };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={onToggleDropdown}
        className={buttonClasses}
        style={buttonStyle}
      >
        <span className={`mr-1 ${isMobile ? 'truncate' : 'whitespace-nowrap'}`}>
          {selectedCategory ? selectedCategory.name : 'All Categories'}
        </span>
        <ChevronDown size={16} />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className={`absolute z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto ${
          isMobile ? 'w-full' : 'w-auto min-w-48'
        }`}>
          <div className="py-1">
            <button
              type="button"
              onClick={() => onCategorySelect(null)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap"
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => onCategorySelect(category)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap"
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main search component that uses categories
const SearchForm = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter();
  const searchParams = useSearchParams();

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Extract search parameters from URL when component mounts
  useEffect(() => {
    // Get searchTerm from URL
    const termFromUrl = searchParams.get('searchTerm');
    if (termFromUrl) {
      setSearchTerm(termFromUrl);
    }
    
    // Get category from URL
    const categoryId = searchParams.get('category');
    if (categoryId && categories.length > 0) {
      const category = categories.find(cat => cat.id === categoryId);
      if (category) {
        setSelectedCategory(category);
      }
    }
  }, [searchParams, categories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/products?${selectedCategory?.id ? `category=${selectedCategory.id}&` : ""}searchTerm=${searchTerm}`)
    console.log("Searching for:", searchTerm, "in category:", selectedCategory?.name || "All")
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectCategory = (category: Category | null) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
  };

  // Mobile view
  const mobileView = (
    <div className="w-full md:hidden">
      <form onSubmit={handleSearch} className="relative flex flex-col">
        {/* Category Dropdown for Mobile */}
        {isLoading ? (
          <MobileCategoryDropdownSkeleton />
        ) : (
          <CategoryDropdown
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={selectCategory}
            isDropdownOpen={isDropdownOpen}
            onToggleDropdown={toggleDropdown}
            isFocused={isFocused}
            isMobile={true}
          />
        )}

        {/* Search Input for Mobile */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search products..."
            className={`w-full py-3 pl-4 pr-10 text-gray-700 bg-white border border-t-0 rounded-b-sm transition-all duration-200 focus:outline-none ${
              isFocused ? 'border-amber-500 shadow-sm' : 'border-gray-300'
            }`}
          />

          {/* Search Button */}
          <button
            type="submit"
            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-amber-600 transition-colors"
          >
            <Search size={18} />
          </button>
        </div>
      </form>
    </div>
  );

  // Desktop view
  const desktopView = (
    <div className="w-full hidden md:block">
      <form onSubmit={handleSearch} className="relative flex">
        {/* Category Dropdown */}
        {isLoading ? (
          <CategoryDropdownSkeleton />
        ) : (
          <CategoryDropdown
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={selectCategory}
            isDropdownOpen={isDropdownOpen}
            onToggleDropdown={toggleDropdown}
            isFocused={isFocused}
            isMobile={false}
          />
        )}

        {/* Search Input */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search products..."
          className={`flex-grow py-3 pl-4 px-4 pr-10 text-gray-700 bg-white border rounded-none rounded-r-sm transition-all duration-200 focus:outline-none ${
            isFocused ? 'border-amber-500 shadow-sm' : 'border-gray-300'
          }`}
        />

        {/* Search Button */}
        <button
          type="submit"
          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-amber-600 transition-colors"
        >
          <Search size={18} />
        </button>
      </form>
    </div>
  );

  return (
    <>
      {mobileView}
      {desktopView}
    </>
  );
};

// Error boundary component for handling errors
const SearchErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="w-full p-4 bg-red-50 border border-red-200 rounded-sm">
    <div className="text-red-700">
      <p className="font-medium">Something went wrong with the search component:</p>
      <p className="text-sm mt-1">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 border border-red-300 rounded text-sm transition-colors"
      >
        Try again
      </button>
    </div>
  </div>
);

// Main component with Suspense boundary
const SearchSection = () => {
  return (
    <Suspense fallback={
      <div className="w-full">
        {/* Mobile skeleton */}
        <div className="md:hidden">
          <div className="flex flex-col">
            <MobileCategoryDropdownSkeleton />
            <div className="relative">
              <div className="w-full py-3 pl-4 pr-10 bg-gray-50 border border-t-0 border-gray-300 rounded-b-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-40"></div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center px-3">
                <Search size={18} className="text-gray-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop skeleton */}
        <div className="hidden md:block">
          <div className="relative flex">
            <CategoryDropdownSkeleton />
            <div className="flex-grow py-3 pl-4 pr-10 bg-gray-50 border border-gray-300 rounded-r-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-48"></div>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center px-3">
              <Search size={18} className="text-gray-300" />
            </div>
          </div>
        </div>
      </div>
    }>
      <SearchForm />
    </Suspense>
  );
};

export default SearchSection;