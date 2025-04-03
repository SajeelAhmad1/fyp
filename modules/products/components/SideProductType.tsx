"use client";

import React, { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronUp } from 'lucide-react';

// You might want to fetch these from an API later
const productTypes = [
  { id: 'new', name: 'New Arrivals' },
  { id: 'featured', name: 'Featured Products' },
  { id: 'bestchoice', name: 'Best Choice' },
  { id: 'topdeal', name: 'Top Deals' },
  { id: 'sale', name: 'On Sale' }
];

const SideProductType = () => {
  const [expanded, setExpanded] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Get selected types as an array
  const selectedTypes = searchParams.get('type')?.split(',').filter(Boolean) || [];
  
  const handleTypeChange = (typeId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Get current selected types
    const currentTypes = selectedTypes.slice();
    
    // If typeId is already selected, remove it
    if (currentTypes.includes(typeId)) {
      const updatedTypes = currentTypes.filter(id => id !== typeId);
      
      if (updatedTypes.length === 0) {
        params.delete('type');
      } else {
        params.set('type', updatedTypes.join(','));
      }
    } else {
      // Otherwise add it to the selected types
      currentTypes.push(typeId);
      params.set('type', currentTypes.join(','));
    }
    
    // Reset to page 1 when changing type
    params.set('page', '1');
    
    router.push(`${pathname}?${params.toString()}`);
  };
  
  return (
    <div className="py-4">
      <div 
        className="flex justify-between items-center cursor-pointer mb-3"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="font-medium text-sm uppercase">Product Type</h3>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>
      
      {expanded && (
        <div className="space-y-2 mt-2">
          {productTypes.map((type) => (
            <div key={type.id} className="flex items-center">
              <input 
                type="checkbox"
                id={`type-${type.id}`}
                checked={selectedTypes.includes(type.id)}
                onChange={() => handleTypeChange(type.id)}
                className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-[#F19B12]"
              />
              <label 
                htmlFor={`type-${type.id}`}
                className={`text-sm hover:text-blue-600 w-full text-left py-1 ${
                  selectedTypes.includes(type.id) ? 'font-medium text-blue-600' : 'text-gray-700'
                }`}
              >
                {type.name}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SideProductType;