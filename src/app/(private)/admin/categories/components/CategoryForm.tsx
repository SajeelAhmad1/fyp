'use client';

import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface CategoryFormProps {
  category: Category | null;
  onSave: (data: { name: string; description?: string }) => void;
  onCancel: () => void;
}

export default function CategoryForm({ category, onSave, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const [errors, setErrors] = useState<{ name?: string }>({});

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const validationErrors: { name?: string } = {};
    if (!name.trim()) {
      validationErrors.name = 'Category name is required';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Submit the form
    onSave({
      name: name.trim(),
      description: description.trim() || undefined
    });
  };

  // Prevent click propagation to close modal when clicking inside
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onCancel}>
      <div 
        className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden" 
        onClick={handleModalClick}
      >
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium">
            {category ? 'Edit Category' : 'Add New Category'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label 
              htmlFor="name" 
              className="block text-sm font-medium text-gray-700"
            >
              Category Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              className={`w-full px-3 py-2 border rounded-md ${
                errors.name 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-[#F19B12] focus:border-[#F19B12]'
              } focus:outline-none focus:ring-2`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label 
              htmlFor="description" 
              className="block text-sm font-medium text-gray-700"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter category description"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F19B12] focus:border-[#F19B12]"
            />
          </div>
          
          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F19B12]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F19B12]"
            >
              {category ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}