'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  stock: string;
  sku?: string;
  images?: string[];
  isFeatured: boolean;
  discount: string,
  isBestChoice: boolean;
  color: string[], 
  size: string[], 
  shortDescription: string,
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [colorInput, setColorInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    stock: '',
    sku: '',
    images: [],
    isFeatured: false,
    discount: '',
    isBestChoice: false,
    color: [], 
    size: [], 
    shortDescription: ''
  });

  // Fetch product data when component mounts
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }

        const productData = await response.json();
        
        // Format the data for the form
        setFormData({
          name: productData.name || '',
          description: productData.description || '',
          price: productData.price?.toString() || '',
          categoryId: productData.categoryId || '',
          stock: productData.stock?.toString() || '',
          sku: productData.sku || '',
          images: productData.images || [],
          isFeatured: productData.isFeatured === true,
          discount: productData.discount?.toString() || '',
          isBestChoice: productData.isBestChoice === true,
          color: productData.color || [],
          size: productData.size || [],
          shortDescription: productData.shortDescription || ''
        });
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

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
          name: category.name
        }));

        setCategories(formattedCategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'isFeatured' || name === 'isBestChoice') {
      setFormData(prev => ({
        ...prev,
        [name]: value === 'true'
      }));
    } else if (name !== 'colorInput' && name !== 'sizeInput' && name !== 'imageInput') {
      setFormData(prev => ({ ...prev, [name]: value }));
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

  // Handle image input
  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageInput(e.target.value);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedImages(prev => [...prev, ...newFiles]);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Upload image to server
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Create a unique identifier for this upload
      const uploadId = Date.now() + file.name;
      
      // Initialize progress for this upload
      setUploadProgress(prev => ({...prev, [uploadId]: 0}));
      
      // Create an XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(prev => ({...prev, [uploadId]: progress}));
        }
      });
      
      // Create a promise to handle the XHR response
      const uploadPromise = new Promise<string>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response.url);
            } catch (e) {
              reject(new Error('Failed to parse server response'));
            }
          } else {
            reject(new Error('Upload failed'));
          }
        };
        
        xhr.onerror = () => reject(new Error('Network error'));
      });
      
      // Open and send the request
      xhr.open('POST', '/api/upload', true);
      xhr.send(formData);
      
      // Wait for the upload to complete
      const imageUrl = await uploadPromise;
      
      // Remove this upload from the progress tracking
      setUploadProgress(prev => {
        const newProgress = {...prev};
        delete newProgress[uploadId];
        return newProgress;
      });
      
      return imageUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      throw new Error('Failed to upload image');
    }
  };

  // Remove uploaded image
  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
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

  // Add image URL to the array
  const addImage = () => {
    if (imageInput.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), imageInput.trim()]
      }));
      setImageInput('');
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

  // Remove image from the array
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Upload any new images first
      const uploadedImageUrls: string[] = [];
      
      if (uploadedImages.length > 0) {
        // Create a promise for each image upload
        const uploadPromises = uploadedImages.map(file => uploadImage(file));
        
        // Wait for all uploads to complete
        const results = await Promise.all(uploadPromises);
        
        // Add the new image URLs to our list
        uploadedImageUrls.push(...results);
      }

      // Combine existing image URLs with newly uploaded ones
      const allImages = [...(formData.images || []), ...uploadedImageUrls];
      
      // Explicitly create the product data object
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10) || 0,
        sku: formData.sku || undefined,
        images: allImages,
        categoryId: formData.categoryId,
        isFeatured: formData.isFeatured === true,
        discount: formData.discount ? parseFloat(formData.discount) : undefined,
        isBestChoice: formData.isBestChoice === true,
        color: formData.color,
        size: formData.size,
        shortDescription: formData.shortDescription,
      };

      // Log the data for debugging
      console.log('Updating product data:', productData);

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
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
        let errorMessage = 'Failed to update product';
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
      let updatedProduct;
      try {
        updatedProduct = JSON.parse(responseText);
        console.log('Product updated:', updatedProduct);
      } catch (e) {
        console.log('Could not parse response as JSON, but request succeeded');
      }

      router.push('/admin/products');
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If product or categories are still loading, show a loading spinner
  if (isLoading || isLoadingCategories) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
        <p className="ml-2 text-gray-600">Loading product data...</p>
      </div>
    );
  }

  // For testing - show what API is likely receiving
  const getJsonPreview = () => {
    const preview = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      stock: parseInt(formData.stock, 10) || 0,
      sku: formData.sku || "",
      categoryId: formData.categoryId,
      isFeatured: formData.isFeatured === true,
      discount: formData.discount ? parseFloat(formData.discount) : 0,
      isBestChoice: formData.isBestChoice === true,
      color: formData.color,
      size: formData.size,
      images: [...(formData.images || []), ...uploadedImages.map(file => `(Pending upload: ${file.name})`)],
      shortDescription: formData.shortDescription
    };
    return JSON.stringify(preview, null, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Product</h1>
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F19B12] focus:ring-[#F19B12]"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F19B12] focus:ring-[#F19B12]"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F19B12] focus:ring-[#F19B12]"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F19B12] focus:ring-[#F19B12]"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price (&#163;)
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F19B12] focus:ring-[#F19B12]"
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
                min="0"
                step="0.01"
                value={formData.discount}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F19B12] focus:ring-[#F19B12]"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F19B12] focus:ring-[#F19B12]"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F19B12] focus:ring-[#F19B12]"
              />
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
                  className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-[#F19B12] focus:ring-[#F19B12]"
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
                  className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-[#F19B12] focus:ring-[#F19B12]"
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

            {/* Image Input (multiple methods) */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images
              </label>

              {/* File upload section */}
              <div className="mb-4 border-2 border-dashed border-gray-300 rounded-md p-4">
                <div className="space-y-2">
                  <div className="flex justify-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="file-upload"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                      </svg>
                      Select Files
                    </label>
                  </div>
                  <p className="text-xs text-center text-gray-500">
                    Drag and drop files here or click to browse
                  </p>
                </div>
              </div>

              {/* Pending uploads section */}
              {uploadedImages.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Pending Uploads:</h3>
                  <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                    {uploadedImages.map((file, index) => (
                      <div key={index} className="relative border rounded-md p-2">
                        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200 mb-2">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index}`}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs truncate">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeUploadedImage(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        {uploadProgress[file.name] !== undefined && (
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full" 
                              style={{width: `${uploadProgress[file.name]}%`}}
                            ></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* URL input section */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Or Add Image by URL:</h3>
                <div className="flex mt-1">
                  <input
                    type="text"
                    id="imageInput"
                    name="imageInput"
                    value={imageInput}
                    onChange={handleImageInputChange}
                    className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-[#F19B12] focus:ring-[#F19B12]"
                    placeholder="Add an image URL"
                  />
                  <button
                    type="button"
                    onClick={addImage}
                    className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Existing images */}
              {formData.images && formData.images.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Current Images:</h3>
                  <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative border rounded-md p-2">
                        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200 mb-2">
                          <img
                            src={image}
                            alt={`Product image ${index}`}
                            className="h-full w-full object-cover object-center"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                            }}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs truncate">{image.split('/').pop()}</span>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F19B12] focus:ring-[#F19B12]"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F19B12] focus:ring-[#F19B12]"
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
                'Update Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}