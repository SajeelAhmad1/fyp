"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronUp } from 'lucide-react';

const SidePriceRange = () => {
  const [expanded, setExpanded] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Get current price filters from URL
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  
  // Local state for the input fields
  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);
  
  // Update local state when URL changes
  useEffect(() => {
    setMinPrice(currentMinPrice);
    setMaxPrice(currentMaxPrice);
  }, [currentMinPrice, currentMaxPrice]);
  
  const handlePriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Only add parameters if they have values
    if (minPrice) {
      params.set('minPrice', minPrice);
    } else {
      params.delete('minPrice');
    }
    
    if (maxPrice) {
      params.set('maxPrice', maxPrice);
    } else {
      params.delete('maxPrice');
    }
    
    // Reset to page 1 when changing price filters
    params.set('page', '1');
    
    router.push(`${pathname}?${params.toString()}`);
  };
  
  const clearPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('minPrice');
    params.delete('maxPrice');
    params.set('page', '1');
    
    router.push(`${pathname}?${params.toString()}`);
    setMinPrice('');
    setMaxPrice('');
  };
  
  // Predefined price ranges for quick selection
  const priceRanges = [
    { min: '0', max: '50', label: 'Under $50' },
    { min: '50', max: '100', label: '$50 - $100' },
    { min: '100', max: '200', label: '$100 - $200' },
    { min: '200', max: '', label: 'Over $200' }
  ];
  
  const handlePriceRangeClick = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
    
    const params = new URLSearchParams(searchParams.toString());
    
    if (min) {
      params.set('minPrice', min);
    } else {
      params.delete('minPrice');
    }
    
    if (max) {
      params.set('maxPrice', max);
    } else {
      params.delete('maxPrice');
    }
    
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };
  
  return (
    <div className="py-4">
      <div 
        className="flex justify-between items-center cursor-pointer mb-3"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="font-medium text-sm uppercase">Price Range</h3>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>
      
      {expanded && (
        <>
          <div className="space-y-2 mt-2">
            {/* Quick price ranges */}
            {priceRanges.map((range, index) => (
              <button
                key={index}
                onClick={() => handlePriceRangeClick(range.min, range.max)}
                className={`block text-sm w-full text-left py-1 ${
                  currentMinPrice === range.min && currentMaxPrice === range.max 
                    ? 'font-medium text-blue-600' 
                    : 'text-gray-700'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          
          <div className="mt-4">
            {/* Custom price range inputs */}
            <div className="flex items-center space-x-2 mb-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full border rounded-md px-6 py-1.5 text-sm"
                />
              </div>
              <span className="text-gray-400">-</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full border rounded-md px-6 py-1.5 text-sm"
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={handlePriceFilter}
                className="flex-1 bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-300 text-white rounded-md py-1.5 text-sm"
              > 
                Apply
              </button>
              {(currentMinPrice || currentMaxPrice) && (
                <button 
                  onClick={clearPriceFilter}
                  className="bg-gray-100 text-gray-700 rounded-md py-1.5 px-3 text-sm hover:bg-gray-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SidePriceRange;