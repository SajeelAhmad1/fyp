'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
  id: string;
  name: string;
  description?: string;
  subcategories?: SubCategory[];
  createdAt?: string;
  updatedAt?: string;
}

interface SubCategory {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  subcategoryId: string; // Added subcategoryId
  stock: string;
  sku?: string;
  images: string[]; // This will store image URLs
  isFeatured: boolean;
  discount: string,
  isBestChoice: boolean;
  color: string[],
  size: string[],
  shortDescription: string,
}

export default function AddProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [colorInput, setColorInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    subcategoryId: '',  // Added subcategoryId
    stock: '',
    sku: '',
    images: [], // Initialize as empty array
    isFeatured: false,
    discount: '',
    isBestChoice: false,
    color: [],
    size: [],
    shortDescription: ''
  });

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');

        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }

        const data = await response.json();
        const formattedCategories = data.map((category: any) => ({
          id: category.id,
          name: category.name,
          subcategories: category.subcategories || []
        }));

        setCategories(formattedCategories);

        // Set the first category as default if available
        if (formattedCategories.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: formattedCategories[0].id }));
          
          // Set subcategories for the first category
          if (formattedCategories[0].subcategories && formattedCategories[0].subcategories.length > 0) {
            setSubcategories(formattedCategories[0].subcategories);
            setFormData(prev => ({ ...prev, subcategoryId: formattedCategories[0].subcategories[0].id }));
          } else {
            setSubcategories([]);
          }
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Update subcategories when category changes
  useEffect(() => {
    if (formData.categoryId) {
      const selectedCategory:any = categories.find(cat => cat.id === formData.categoryId);
      if (selectedCategory && selectedCategory.subcategories) {
        setSubcategories(selectedCategory.subcategories);
        
        // Reset subcategory selection or select the first one if available
        if (selectedCategory.subcategories.length > 0) {
          setFormData(prev => ({ ...prev, subcategoryId: selectedCategory.subcategories[0].id }));
        } else {
          setFormData(prev => ({ ...prev, subcategoryId: '' }));
        }
      } else {
        setSubcategories([]);
        setFormData(prev => ({ ...prev, subcategoryId: '' }));
      }
    }
  }, [formData.categoryId, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'isFeatured' || name === 'isBestChoice') {
      setFormData(prev => ({
        ...prev,
        [name]: value === 'true'
      }));
    } else if (name !== 'colorInput' && name !== 'sizeInput' && name !== 'imageUrl') {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle image URL input
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
  };

  // Add image URL to the array
  const addImageUrl = () => {
    if (imageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl.trim()]
      }));
      setImageUrl('');
    }
  };

  // Remove image from the array
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploadingImage(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      
      // Replace with your actual image upload API endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      
      // Add the uploaded image URL to the images array
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, data.url]
      }));
      
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle color input
  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColorInput(e.target.value);
  };

  // Handle size input
  const handleSizeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSizeInput(e.target.value);
  };

  // Add color to the array
  const addColor = () => {
    if (colorInput.trim()) {
      setFormData(prev => ({
        ...prev,
        color: [...prev.color, colorInput.trim()]
      }));
      setColorInput('');
    }
  };

  // Add size to the array
  const addSize = () => {
    if (sizeInput.trim()) {
      setFormData(prev => ({
        ...prev,
        size: [...prev.size, sizeInput.trim()]
      }));
      setSizeInput('');
    }
  };

  // Remove color from the array
  const removeColor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      color: prev.color.filter((_, i) => i !== index)
    }));
  };

  // Remove size from the array
  const removeSize = (index: number) => {
    setFormData(prev => ({
      ...prev,
      size: prev.size.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Check if images array has at least one image
      if (formData.images.length === 0) {
        throw new Error('Please add at least one product image');
      }
      
      // Explicitly create the product data object
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10) || 0,
        sku: formData.sku || undefined,
        images: formData.images,
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId || undefined, // Include subcategoryId
        isFeatured: formData.isFeatured === true,
        discount: formData.discount,
        isBestChoice: formData.isBestChoice === true,
        color: formData.color,
        size: formData.size,
        shortDescription: formData.shortDescription,
      };

      // Log the data for debugging
      console.log('Submitting product data:', productData);
      console.log('isFeatured type:', typeof productData.isFeatured);

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      // Log the raw response and body for debugging
      console.log('Response status:', response.status);

      // Try to read the response body as text for debugging
      const responseText = await response.text();
      console.log('Response body:', responseText);

      // If not OK, parse the error
      if (!response.ok) {
        let errorMessage = 'Failed to create product';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If we can't parse the error as JSON, use the raw text
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Success - try to parse the response as JSON
      let newProduct;
      try {
        newProduct = JSON.parse(responseText);
        console.log('Product created:', newProduct);
      } catch (e) {
        console.log('Could not parse response as JSON, but request succeeded');
      }

      router.push('/admin/products');
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If categories are still loading, show a loading spinner
  if (isLoadingCategories) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
        <p className="ml-2 text-gray-600">Loading categories...</p>
      </div>
    );
  }

  // For testing - show what API is likely receiving
  const getJsonPreview = () => {
    const preview = {
      name: formData.name || "Example Product",
      description: formData.description || "Example Description",
      price: parseFloat(formData.price) || 99.99,
      stock: parseInt(formData.stock, 10) || 10,
      sku: formData.sku || "SKU123",
      categoryId: formData.categoryId || "cat123",
      subcategoryId: formData.subcategoryId || null, // Include subcategoryId in preview
      isFeatured: formData.isFeatured === true,
      discount: formData.discount,
      isBestChoice: formData.isBestChoice === true,
      color: formData.color,
      size: formData.size,
      images: formData.images,
      shortDescription: formData.shortDescription || "Short description"
    };
    return JSON.stringify(preview, null, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Add New Product</h1>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div>
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Product Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="categoryId"
                name="categoryId"
                required
                value={formData.categoryId}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="mt-1 text-sm text-red-500">
                  No categories available. Please create a category first.
                </p>
              )}
            </div>

            {/* Subcategory selection */}
            <div>
              <label htmlFor="subcategoryId" className="block text-sm font-medium text-gray-700">
                Subcategory
              </label>
              <select
                id="subcategoryId"
                name="subcategoryId"
                value={formData.subcategoryId}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={subcategories.length === 0}
              >
                <option value="">Select a subcategory</option>
                {subcategories.map(subcategory => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
              {subcategories.length === 0 && (
                <p className="mt-1 text-sm text-gray-500">
                  No subcategories available for this category.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="isFeatured" className="block text-sm font-medium text-gray-700">
                Featured
              </label>
              <select
                id="isFeatured"
                name="isFeatured"
                required
                value={formData.isFeatured.toString()}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Current value: {formData.isFeatured ? "Yes (true)" : "No (false)"} (type: {typeof formData.isFeatured})
              </p>
            </div>
            <div>
              <label htmlFor="isBestChoice" className="block text-sm font-medium text-gray-700">
                Best Choice
              </label>
              <select
                id="isBestChoice"
                name="isBestChoice"
                required
                value={formData.isBestChoice.toString()}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Current value: {formData.isBestChoice ? "Yes (true)" : "No (false)"} (type: {typeof formData.isBestChoice})
              </p>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price ($)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="discount" className="block text-sm font-medium text-gray-700">
                Discount (%)
              </label>
              <input
                type="number"
                id="discount"
                name="discount"
                required
                min="0"
                step="0.01"
                value={formData.discount}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                Stock Quantity
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                required
                min="0"
                value={formData.stock}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                SKU
              </label>
              <input
                type="text"
                id="sku"
                name="sku"
                value={formData.sku || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Image Upload Section */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images
              </label>
              
              {/* File Upload Option */}
              <div className="mb-4">
                <div className="flex items-center">
                  <label className="block">
                    <span className="sr-only">Choose file</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                      disabled={uploadingImage}
                    />
                  </label>
                  {uploadingImage && (
                    <div className="ml-3">
                      <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent align-[-0.125em]"></div>
                      <span className="ml-2 text-sm text-gray-600">Uploading...</span>
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">Upload product images (JPG, PNG, WebP)</p>
              </div>
              
              {/* Manual URL Input Option */}
              <div className="mb-4">
                <div className="flex mt-1">
                  <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    value={imageUrl}
                    onChange={handleImageUrlChange}
                    className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Or enter image URL"
                  />
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              {/* Display Added Images */}
              {formData.images.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Added Images:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Product image ${index + 1}`}
                          className="h-32 w-full object-cover rounded-md border border-gray-200"
                          onError={(e) => {
                            // Handle image load errors
                            (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove image"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Color Input (as array) */}
            <div>
              <label htmlFor="colorInput" className="block text-sm font-medium text-gray-700">
                Colors
              </label>
              <div className="flex mt-1">
                <input
                  type="text"
                  id="colorInput"
                  name="colorInput"
                  value={colorInput}
                  onChange={handleColorInputChange}
                  className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Add a color"
                />
                <button
                  type="button"
                  onClick={addColor}
                  className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              {formData.color.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-1">Added Colors:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.color.map((color, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-gray-100 px-3 py-1 rounded-full"
                      >
                        <span className="text-sm">{color}</span>
                        <button
                          type="button"
                          onClick={() => removeColor(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Size Input (as array) */}
            <div>
              <label htmlFor="sizeInput" className="block text-sm font-medium text-gray-700">
                Sizes
              </label>
              <div className="flex mt-1">
                <input
                  type="text"
                  id="sizeInput"
                  name="sizeInput"
                  value={sizeInput}
                  onChange={handleSizeInputChange}
                  className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Add a size"
                />
                <button
                  type="button"
                  onClick={addSize}
                  className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              {formData.size.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-1">Added Sizes:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.size.map((size, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-gray-100 px-3 py-1 rounded-full"
                      >
                        <span className="text-sm">{size}</span>
                        <button
                          type="button"
                          onClick={() => removeSize(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700">
              Short Description
            </label>
            <textarea
              id="shortDescription"
              name="shortDescription"
              rows={2}
              required
              value={formData.shortDescription}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Debug section - helps you see what's going to be sent */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">JSON Preview (for debugging)</h3>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
              {getJsonPreview()}
            </pre>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/admin/products')}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || categories.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}