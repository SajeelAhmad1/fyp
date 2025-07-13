'use client';

import { useEffect } from 'react';

interface DeleteConfirmDialogProps {
  type: 'category' | 'subcategory';
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmDialog({
  type,
  itemName,
  onConfirm,
  onCancel
}: DeleteConfirmDialogProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

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
        <div className="px-6 py-4">
          <h2 className="text-lg font-semibold">Are you sure?</h2>
          <div className="mt-2 text-sm text-gray-500">
            <p>
              You are about to delete the {type} <strong>&quot;{itemName}&quot;</strong>.
              {type === 'category' && (
                <span> This will only work if the category has no subcategories.</span>
              )}
              {type === 'subcategory' && (
                <span> This will only work if the subcategory has no products.</span>
              )}
            </p>
            <p className="mt-2">This action cannot be undone.</p>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}