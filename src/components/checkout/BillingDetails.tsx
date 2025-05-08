import React from 'react';

interface BillingDetailsProps {
  formData: any;
  formErrors: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSameAddressToggle: () => void;
  postcodeSearchTerm: string;
  postCodeError: string;
  handlePostcodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BillingDetails: React.FC<BillingDetailsProps> = ({
  formData,
  formErrors,
  handleInputChange,
  handleSameAddressToggle,
  postcodeSearchTerm,
  postCodeError,
  handlePostcodeChange
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center mb-3">
        <h2 className="text-lg font-medium">Billing Address</h2>
        <div className="ml-auto flex items-center">
          <input
            type="checkbox"
            id="useSameAddress"
            checked={formData.useSameAddress}
            onChange={handleSameAddressToggle}
            className="mr-2"
          />
          <label htmlFor="useSameAddress" className="text-sm">Same as shipping address</label>
        </div>
      </div>

      {!formData.useSameAddress && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="billingFirstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              id="billingFirstName"
              name="billingFirstName"
              placeholder="Enter First Name"
              value={formData.billingFirstName}
              onChange={handleInputChange}
              className={`w-full p-2 border ${formErrors.billingFirstName ? 'border-red-500' : 'border-gray-300'} rounded`}
              required
            />
            {formErrors.billingFirstName && <p className="text-red-500 text-xs mt-1">First name is required</p>}
          </div>
          <div>
            <label htmlFor="billingLastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              id="billingLastName"
              name="billingLastName"
              placeholder="Enter Last Name"
              value={formData.billingLastName}
              onChange={handleInputChange}
              className={`w-full p-2 border ${formErrors.billingLastName ? 'border-red-500' : 'border-gray-300'} rounded`}
              required
            />
            {formErrors.billingLastName && <p className="text-red-500 text-xs mt-1">Last name is required</p>}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="billingStreet" className="block text-sm font-medium text-gray-700 mb-1">
              Street Address *
            </label>
            <input
              type="text"
              id="billingStreet"
              name="billingStreet"
              placeholder="Enter Street Address"
              value={formData.billingStreet}
              onChange={handleInputChange}
              className={`w-full p-2 border ${formErrors.billingStreet ? 'border-red-500' : 'border-gray-300'} rounded`}
              required
            />
            {formErrors.billingStreet && <p className="text-red-500 text-xs mt-1">Street address is required</p>}
          </div>
          <div>
            <label htmlFor="billingCity" className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              type="text"
              id="billingCity"
              name="billingCity"
              placeholder="Enter City"
              value={formData.billingCity}
              onChange={handleInputChange}
              className={`w-full p-2 border ${formErrors.billingCity ? 'border-red-500' : 'border-gray-300'} rounded`}
              required
            />
            {formErrors.billingCity && <p className="text-red-500 text-xs mt-1">City is required</p>}
          </div>
          <div>
            <label htmlFor="billingState" className="block text-sm font-medium text-gray-700 mb-1">
              State/Province *
            </label>
            <input
              type="text"
              id="billingState"
              name="billingState"
              placeholder="Enter State/Province"
              value={formData.billingState}
              onChange={handleInputChange}
              className={`w-full p-2 border ${formErrors.billingState ? 'border-red-500' : 'border-gray-300'} rounded`}
              required
            />
            {formErrors.billingState && <p className="text-red-500 text-xs mt-1">State/Province is required</p>}
          </div>
          <div className="relative">
            <label htmlFor="billingPostalCode" className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code *
            </label>
            <input
              type="text"
              id="billingPostalCode"
              name="billingPostalCode"
              value={postcodeSearchTerm}
              onChange={handlePostcodeChange}
              placeholder="Enter UK postcode"
              className={`w-full p-2 border ${formErrors.billingPostalCode ? 'border-red-500' : 'border-gray-300'} rounded`}
              required
            />
            {formErrors.billingPostalCode && (
              <p className="text-red-500 text-xs mt-1">
                {postCodeError || "Postal code is required"}
              </p>
            )}
          </div>
          <div>
            <div>
              <label htmlFor="billingCountry" className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <input
                type="text"
                id="billingCountry"
                name="billingCountry"
                value="United Kingdom"
                readOnly
                className="w-full p-2 border border-gray-300 rounded bg-gray-100"
              />
            </div>
            {formErrors.billingCountry && <p className="text-red-500 text-xs mt-1">Country is required</p>}
          </div>
        </div>
      )}
    </div>
  );
};