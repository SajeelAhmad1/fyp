"use client"
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: number;
  sku: string;
  images: string[];
  categoryId: null;
}

const ProductCreationForm = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    stock: 0,
    sku: '',
    images: [],
    categoryId: null,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'stock') {
      setFormData(prevData => ({
        ...prevData,
        [name]: value === '' ? 0 : parseInt(value, 10)
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  const handleImageAdd = () => {
    const imageUrl = prompt('Enter image URL:');
    if (imageUrl && imageUrl.trim()) {
      setFormData(prevData => ({
        ...prevData,
        images: [...prevData.images, imageUrl.trim()]
      }));
    }
  };

  const handleImageRemove = (index: number) => {
    setFormData(prevData => ({
      ...prevData,
      images: prevData.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      const submissionData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: Number(formData.stock),
        categoryId: null,
      };
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create product');
      }
      
      const data = await response.json();
      setSuccess(true);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: 0,
        sku: '',
        images: [],
        categoryId: null,
      });
      
      console.log('Product created:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-20 bg-white ">
      <h1 className="text-2xl font-bold mb-6">Create New Product</h1>
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Product created successfully!
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-[#000000] font-medium mb-2" htmlFor="name">
            Product Name*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border text-[#000000] rounded"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-[#000000] font-medium mb-2" htmlFor="description">
            Description*
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border text-[#000000] rounded"
            rows={4}
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-[#000000] font-medium mb-2" htmlFor="price">
              Price*
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full p-2 border text-[#000000] rounded"
              step="0.01"
              min="0"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-[#000000] font-medium mb-2" htmlFor="stock">
              Stock
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="w-full p-2 border text-[#000000] rounded"
              min="0"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-[#000000] font-medium mb-2" htmlFor="sku">
            SKU
          </label>
          <input
            type="text"
            id="sku"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            className="w-full p-2 border text-[#000000] rounded"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-[#000000] font-medium mb-2">
            Images
          </label>
          <div className="mb-2">
            <button
              type="button"
              onClick={handleImageAdd}
              className="px-4 py-2 bg-[#F19B12] text-white rounded hover:bg-blue-600"
            >
              Add Image URL
            </button>
          </div>
          {formData.images.length > 0 && (
            <ul className="border text-[#000000] rounded p-2">
              {formData.images.map((url, index) => (
                <li key={index} className="flex items-center justify-between mb-1 pb-1 border-b border-gray-200 last:border-0">
                  <span className="truncate mr-2">{url}</span>
                  <button 
                    type="button" 
                    onClick={() => handleImageRemove(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductCreationForm;