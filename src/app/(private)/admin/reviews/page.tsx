'use client'
import { useState } from 'react';

type ReviewFormData = {
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  email: string;
  firstName: string;
  lastName: string;
  images: string[];
  profileImage: string | null; // New field for profile image
  creationDate: string; // New field for creation date
};

export default function Reviews() {
  const [formData, setFormData] = useState<ReviewFormData>({
    productId: '',
    userId: '',
    rating: 1.0,
    comment: '',
    email: '',
    firstName: '',
    lastName: '',
    images: [],
    profileImage: null,
    creationDate: new Date().toISOString().slice(0, 16) // Default to current date and time
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e: any) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleProfileImageUpload = async (e: any) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingProfile(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload profile image');
      }
      
      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        profileImage: data.url
      }));

    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err instanceof Error ? err.message : 'Failed to upload profile image' 
      });
    } finally {
      setIsUploadingProfile(false);
      e.target.value = '';
    }
  };

  const handleImageUpload = async (e: any) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, data.url]
      }));

    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err instanceof Error ? err.message : 'Failed to upload images' 
      });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Review submitted successfully! Created at: ${new Date(data.data.review.createdAt).toLocaleString()}` 
        });
        // Reset form
        setFormData({
          productId: '',
          userId: '',
          rating: 1.0,
          comment: '',
          email: '',
          firstName: '',
          lastName: '',
          images: [],
          profileImage: null,
          creationDate: new Date().toISOString().slice(0, 16)
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || 'Failed to submit review' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Network error. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const fullStars = Math.floor(formData.rating);
    const hasHalfStar = formData.rating % 1 !== 0;
    
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, rating: index + 1 }))}
            className={`text-2xl ${
              index < fullStars 
                ? 'text-yellow-400' 
                : 'text-gray-300'
            } hover:text-yellow-400 transition-colors`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Submit a Review</h2>
      
      {message.text && (
        <div className={`mb-4 p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product ID
            </label>
            <input
              type="text"
              name="productId"
              value={formData.productId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter product ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID
            </label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter user ID"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter first name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter last name"
            />
          </div>
        </div>

        {/* Creation Date Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Review Date & Time
          </label>
          <input
            type="datetime-local"
            name="creationDate"
            value={formData.creationDate}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Select when this review was originally written
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter email address"
          />
        </div>

        {/* Profile Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Profile Image (Optional)
          </label>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageUpload}
                disabled={isUploadingProfile}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
              {isUploadingProfile && (
                <div className="text-sm text-blue-600">Uploading...</div>
              )}
            </div>
            
            {formData.profileImage && (
              <div className="flex items-center space-x-3">
                <img
                  src={formData.profileImage}
                  alt="Profile"
                  className="w-16 h-16 object-cover rounded-full border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, profileImage: null }))}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          <div className="space-y-3">
            {/* Star display */}
            <div className="flex items-center space-x-2">
              {renderStars()}
              <span className="ml-2 text-sm text-gray-600">
                ({formData.rating} star{formData.rating !== 1 ? 's' : ''})
              </span>
            </div>
            
            {/* Decimal rating input */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Precise rating:</label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                min="0.1"
                max="5.0"
                step="0.1"
                className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-500">(0.1 - 5.0)</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comment
          </label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            placeholder="Write your review..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Review Images (Optional)
          </label>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={isUploading || formData.images.length >= 5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
              {isUploading && (
                <div className="text-sm text-blue-600">Uploading...</div>
              )}
            </div>
            
            <p className="text-xs text-gray-500">
              Upload up to 5 images (max 5MB each). Supported formats: JPG, PNG, GIF, WebP
            </p>
            <p className="text-xs text-gray-600">
              Current images: {formData.images.length}/5
            </p>
            
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {formData.images.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Review image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      onError={(e: any) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkM4LjY4NjMgMTYgNiAxMy4zMTM3IDYgMTBDNiA2LjY4NjMgOC42ODYzIDQgMTIgNEMxNS4zMTM3IDQgMTggNi42ODYzIDE4IDEwQzE4IDEzLjMxMzcgMTUuMzEzNyAxNiAxMiAxNloiIHN0cm9rZT0iIzk3QTNBRiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTAiIHI9IjMiIHN0cm9rZT0iIzk3QTNBRiIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPgo=';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          images: prev.images.filter((_, i) => i !== index)
                        }));
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || isUploading || isUploadingProfile}
          className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
            isSubmitting || isUploading || isUploadingProfile
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {isSubmitting ? 'Submitting...' : (isUploading || isUploadingProfile) ? 'Please wait...' : 'Submit Review'}
        </button>
      </div>
    </div>
  );
}