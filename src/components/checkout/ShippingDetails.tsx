import React from 'react';

interface ShippingDetailsProps {
  formData: any;
  formErrors: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  postcodeSearchTerm: string;
  postCodeError: string;
  handlePostcodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ShippingDetails: React.FC<ShippingDetailsProps> = ({
  formData,
  formErrors,
  handleInputChange,
  postcodeSearchTerm,
  postCodeError,
  handlePostcodeChange
}) => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-3">Shipping Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="shippingFirstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            id="shippingFirstName"
            name="shippingFirstName"
            placeholder="Enter First Name"
            value={formData.shippingFirstName}
            onChange={handleInputChange}
            className={`w-full p-2 border ${formErrors.shippingFirstName ? 'border-red-500' : 'border-gray-300'} rounded`}
            required
          />
          {formErrors.shippingFirstName && <p className="text-red-500 text-xs mt-1">First name is required</p>}
        </div>
        <div>
          <label htmlFor="shippingLastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            id="shippingLastName"
            name="shippingLastName"
            placeholder="Enter Last Name"
            value={formData.shippingLastName}
            onChange={handleInputChange}
            className={`w-full p-2 border ${formErrors.shippingLastName ? 'border-red-500' : 'border-gray-300'} rounded`}
            required
          />
          {formErrors.shippingLastName && <p className="text-red-500 text-xs mt-1">Last name is required</p>}
        </div>
        <div className="md:col-span-2">
          <label htmlFor="shippingStreet" className="block text-sm font-medium text-gray-700 mb-1">
            Street Address *
          </label>
          <input
            type="text"
            id="shippingStreet"
            name="shippingStreet"
            placeholder="Enter Street Address"
            value={formData.shippingStreet}
            onChange={handleInputChange}
            className={`w-full p-2 border ${formErrors.shippingStreet ? 'border-red-500' : 'border-gray-300'} rounded`}
            required
          />
          {formErrors.shippingStreet && <p className="text-red-500 text-xs mt-1">Street address is required</p>}
        </div>
        <div>
          <label htmlFor="shippingCity" className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <input
            type="text"
            id="shippingCity"
            name="shippingCity"
            placeholder="Enter City"
            value={formData.shippingCity}
            onChange={handleInputChange}
            className={`w-full p-2 border ${formErrors.shippingCity ? 'border-red-500' : 'border-gray-300'} rounded`}
            required
          />
          {formErrors.shippingCity && <p className="text-red-500 text-xs mt-1">City is required</p>}
        </div>
        <div>
          <label htmlFor="shippingState" className="block text-sm font-medium text-gray-700 mb-1">
            State/Province/County *
          </label>
          <input
            type="text"
            id="shippingState"
            name="shippingState"
            placeholder="Enter State/Province"
            value={formData.shippingState}
            onChange={handleInputChange}
            className={`w-full p-2 border ${formErrors.shippingState ? 'border-red-500' : 'border-gray-300'} rounded`}
            required
          />
          {formErrors.shippingState && <p className="text-red-500 text-xs mt-1">State/Province is required</p>}
        </div>
        <div className="relative">
          <label htmlFor="shippingPostalCode" className="block text-sm font-medium text-gray-700 mb-1">
            Postal Code *
          </label>
          <input
            type="text"
            id="shippingPostalCode"
            name="shippingPostalCode"
            value={postcodeSearchTerm}
            onChange={handlePostcodeChange}
            placeholder="Enter UK postcode"
            className={`w-full p-2 border ${formErrors.shippingPostalCode ? 'border-red-500' : 'border-gray-300'} rounded`}
            required
          />
          {formErrors.shippingPostalCode && (
            <p className="text-red-500 text-xs mt-1">
              {postCodeError || "Postal code is required"}
            </p>
          )}
        </div>
        <div>
          <div>
            <label htmlFor="shippingCountry" className="block text-sm font-medium text-gray-700 mb-1">
              Country *
            </label>
            <input
              type="text"
              id="shippingCountry"
              name="shippingCountry"
              value="United Kingdom"
              readOnly
              className="w-full p-2 border border-gray-300 rounded bg-gray-100"
            />
          </div>
          {formErrors.shippingCountry && <p className="text-red-500 text-xs mt-1">Country is required</p>}
        </div>
        <div>
          <label htmlFor="shippingPhone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number * (digits only)
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l">
              +44
            </span>
            <input
              type="tel"
              id="shippingPhone"
              name="shippingPhone"
              placeholder="1234567890"
              value={formData.shippingPhone}
              onChange={handleInputChange}
              className={`w-full p-2 border ${formErrors.shippingPhone ? 'border-red-500' : 'border-gray-300'} rounded-r`}
              required
            />
          </div>
          {formErrors.shippingPhone && (
            <p className="text-red-500 text-xs mt-1">
              Please enter a valid 10-digit phone number
            </p>
          )}
        </div>
        <div className="md:col-span-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter Email Address"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full p-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded`}
            required
          />
          {formErrors.email && <p className="text-red-500 text-xs mt-1">Please enter a valid email address</p>}
        </div>
      </div>
    </div>
  );
};