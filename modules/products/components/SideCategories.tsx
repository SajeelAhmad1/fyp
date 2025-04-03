"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  count?: number;
}

const SideCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Get selected categories as an array
  const selectedCategories = searchParams.get('category')?.split(',').filter(Boolean) || [];
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  const handleCategoryChange = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Get current selected categories
    const currentCategories = selectedCategories.slice();
    
    // If categoryId is already selected, remove it
    if (currentCategories.includes(categoryId)) {
      const updatedCategories = currentCategories.filter(id => id !== categoryId);
      
      if (updatedCategories.length === 0) {
        params.delete('category');
      } else {
        params.set('category', updatedCategories.join(','));
      }
    } else {
      // Otherwise add it to the selected categories
      currentCategories.push(categoryId);
      params.set('category', currentCategories.join(','));
    }
    
    // Reset to page 1 when changing category
    params.set('page', '1');
    
    router.push(`${pathname}?${params.toString()}`);
  };
  
  return (
    <div className="py-4">
      <div 
        className="flex justify-between items-center cursor-pointer mb-3"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="font-medium text-sm uppercase">Categories</h3>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>
      
      {expanded && (
        <div className="space-y-2 mt-2">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="flex items-center">
                <input 
                  type="checkbox"
                  id={`category-${category.id}`}
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => handleCategoryChange(category.id)}
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-[#F19B12]"
                />
                <label 
                  htmlFor={`category-${category.id}`}
                  className={`text-sm hover:text-blue-600 flex justify-between w-full py-1 ${
                    selectedCategories.includes(category.id) ? 'font-medium text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {category.name}
                  {category.count !== undefined && (
                    <span className="text-gray-500">({category.count})</span>
                  )}
                </label>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SideCategories;