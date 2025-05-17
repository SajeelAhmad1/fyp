'use client';

import {useState, useEffect} from 'react';

interface AddressValidationPageProps {
  formData: {
    shippingFirstName: string;
    shippingLastName: string;
    shippingStreet: string;
    shippingCity: string;
    shippingState: string;
    shippingPostalCode: string;
    shippingCountry: string;
    shippingPhone: string;
  };
  formErrors: {
    shippingFirstName: boolean;
    shippingLastName: boolean;
    shippingStreet: boolean;
    shippingCity: boolean;
    shippingState: boolean;
    shippingPostalCode: boolean;
    shippingCountry: boolean;
    shippingPhone: boolean;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  postcodeSearchTerm: string;
  postCodeError: string;
  handlePostcodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export default function AddressValidationPage({
  formData,
  formErrors,
  handleInputChange,
  postcodeSearchTerm,
  postCodeError,
  handlePostcodeChange,
  setFormData
}: AddressValidationPageProps) {
  const [streetLines, setStreetLines] = useState<string[]>(['']);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Initialize street lines from formData when component mounts or formData changes
  useEffect(() => {
    if (formData.shippingStreet) {
      // Split the street address by commas or handle it as a single line
      const lines = formData.shippingStreet.includes(',') 
        ? formData.shippingStreet.split(',').map(line => line.trim())
        : [formData.shippingStreet];
      setStreetLines(lines);
    } else {
      setStreetLines(['']);
    }
  }, [formData.shippingStreet]);

  const handleStreetLineChange = (index: number, value: string) => {
    const newStreetLines = [...streetLines];
    newStreetLines[index] = value;
    setStreetLines(newStreetLines);
    
    // Update the main form data with all street lines joined together
    const combinedStreetLines = newStreetLines.filter(line => line.trim()).join(', ');
    setFormData((prev: any) => ({
      ...prev,
      shippingStreet: combinedStreetLines
    }));
  };

  const addStreetLine = () => {
    setStreetLines([...streetLines, '']);
  };

  const removeStreetLine = (index: number) => {
    if (streetLines.length > 1) {
      const newStreetLines = streetLines.filter((_, i) => i !== index);
      setStreetLines(newStreetLines);
      
      // Update the main form data when removing a street line
      const combinedStreetLines = newStreetLines.filter(line => line.trim()).join(', ');
      setFormData((prev: any) => ({
        ...prev,
        shippingStreet: combinedStreetLines
      }));
    }
  };

  // Create custom field handlers to ensure values are always properly set
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // First call the parent handleInputChange to maintain existing behavior
    handleInputChange(e);
    
    // Then ensure the value is explicitly set in formData
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  const validateAddress = async () => {
    setIsValidating(true);
    setError(null);
    setValidationResult(null);

    // Check if required fields are filled
    if (!formData.shippingCity || !formData.shippingState || !formData.shippingPostalCode) {
      setError('Please fill in all required address fields before validating');
      setIsValidating(false);
      return;
    }

    try {
      const response = await fetch('/api/validate-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: {
            streetLines: streetLines.filter(line => line.trim() !== ''),
            city: formData.shippingCity,
            stateOrProvinceCode: formData.shippingState,
            postalCode: formData.shippingPostalCode,
            countryCode: formData.shippingCountry
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Address validation failed');
      }

      const data = await response.json();
      console.log('Validation response:', data);
      setValidationResult(data.output);

      // Update form data with validated address if resolved
      if (data.output?.resolvedAddresses?.[0]?.attributes?.Resolved) {
        const resolved = data.output.resolvedAddresses[0];
        
        // Create combined street line string
        const streetLinesString = resolved.streetLinesToken 
          ? resolved.streetLinesToken.join(', ')
          : formData.shippingStreet;
          
        setFormData((prev: any) => ({
          ...prev,
          shippingStreet: streetLinesString,
          shippingCity: resolved.city || formData.shippingCity,
          shippingState: resolved.stateOrProvinceCode || formData.shippingState,
          shippingPostalCode: (resolved.postalCodeToken?.value || formData.shippingPostalCode)
        }));
        
        // Update the street lines state to match the validated address
        if (resolved.streetLinesToken) {
          setStreetLines(resolved.streetLinesToken);
        }
      }
    } catch (err) {
      console.error('Validation error:', err);
      setError(err instanceof Error ? err.message : 'Address validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  // Log form data for debugging
  useEffect(() => {
    console.log('Current form data:', formData);
  }, [formData]);

  return (
    <div className="space-y-4 max-w-2xl mx-auto p-0 md:p-6">
      <h1 className="text-2xl font-semibold mb-6">Shipping Information</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            name="shippingFirstName"
            value={formData.shippingFirstName || ''}
            onChange={handleFieldChange}
            placeholder="First Name"
            className={`w-full p-2 border ${formErrors.shippingFirstName ? 'border-red-500' : 'border-gray-300'} rounded`}
          />
          {formErrors.shippingFirstName && <p className="text-red-500 text-xs mt-1">First name is required</p>}
        </div>
        <div>
          <input
            type="text"
            name="shippingLastName"
            value={formData.shippingLastName || ''}
            onChange={handleFieldChange}
            placeholder="Last Name"
            className={`w-full p-2 border ${formErrors.shippingLastName ? 'border-red-500' : 'border-gray-300'} rounded`}
          />
          {formErrors.shippingLastName && <p className="text-red-500 text-xs mt-1">Last name is required</p>}
        </div>
      </div>

      <div>
        <div className="flex">
          <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l">
            +44
          </span>
          <input
            type="tel"
            name="shippingPhone"
            value={formData.shippingPhone || ''}
            onChange={handleFieldChange}
            placeholder="Phone Number (digits only)"
            className={`w-full p-2 border ${formErrors.shippingPhone ? 'border-red-500' : 'border-gray-300'} rounded-r`}
          />
        </div>
        {formErrors.shippingPhone && (
          <p className="text-red-500 text-xs mt-1">
            Please enter a valid 10-digit phone number
          </p>
        )}
      </div>

      {streetLines.map((line, index) => (
        <div key={index} className="flex items-center space-x-2">
          <input
            type="text"
            value={line || ''}
            onChange={(e) => handleStreetLineChange(index, e.target.value)}
            placeholder={`Street Line ${index + 1}`}
            className={`flex-1 p-2 border ${index === 0 && formErrors.shippingStreet ? 'border-red-500' : 'border-gray-300'} rounded`}
            required={index === 0}
          />
          {index > 0 && (
            <button
              type="button"
              onClick={() => removeStreetLine(index)}
              className="p-2 bg-red-500 text-white rounded"
            >
              Remove
            </button>
          )}
        </div>
      ))}
      {formErrors.shippingStreet && streetLines.length === 1 && streetLines[0].trim() === '' && (
        <p className="text-red-500 text-xs mt-1">Street address is required</p>
      )}
      
      <button
        type="button"
        onClick={addStreetLine}
        className="p-2 bg-blue-500 text-white rounded"
      >
        Add Another Street Line
      </button>

      <input
        type="text"
        name="shippingCity"
        value={formData.shippingCity || ''}
        onChange={handleFieldChange}
        placeholder="City"
        className={`w-full p-2 border ${formErrors.shippingCity ? 'border-red-500' : 'border-gray-300'} rounded`}
      />
      {formErrors.shippingCity && <p className="text-red-500 text-xs mt-1">City is required</p>}

      <input
        type="text"
        name="shippingState"
        value={formData.shippingState || ''}
        onChange={handleFieldChange}
        placeholder="State/Province"
        className={`w-full p-2 border ${formErrors.shippingState ? 'border-red-500' : 'border-gray-300'} rounded`}
      />
      {formErrors.shippingState && <p className="text-red-500 text-xs mt-1">State/Province is required</p>}

      <input
        type="text"
        name="shippingPostalCode"
        value={formData.shippingPostalCode || ''}
        onChange={handlePostcodeChange}
        placeholder="Postal Code"
        className={`w-full p-2 border ${formErrors.shippingPostalCode ? 'border-red-500' : 'border-gray-300'} rounded`}
      />
      {formErrors.shippingPostalCode && <p className="text-red-500 text-xs mt-1">{postCodeError || 'Postal code is required'}</p>}

      <select
        name="shippingCountry"
        value={formData.shippingCountry || 'GB'}
        onChange={handleFieldChange}
        className="w-full p-2 border border-gray-300 rounded"
      >
        <option value="GB">United Kingdom</option>
        <option value="US">United States</option>
        <option value="CA">Canada</option>
      </select>

      <button
        type="button"
        onClick={validateAddress}
        disabled={isValidating}
        className="w-full p-2 bg-green-500 text-white rounded disabled:bg-gray-400"
      >
        {isValidating ? 'Validating...' : 'Validate Address'}
      </button>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {validationResult && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Validation Results</h2>
          
          {validationResult.resolvedAddresses?.map((address: any, index: number) => (
            <div key={index} className="mb-4 p-3 border border-gray-200 rounded">
              <h3 className="font-medium mb-2">Resolved Address {index + 1}</h3>
              <p><strong>Street:</strong> {address.streetLinesToken ? address.streetLinesToken.join(', ') : 'N/A'}</p>
              <p><strong>City:</strong> {address.city || 'N/A'}</p>
              <p><strong>State/Province:</strong> {address.stateOrProvinceCode || 'N/A'}</p>
              <p><strong>Postal Code:</strong> {address.postalCodeToken?.value || 'N/A'}</p>
              <p className={`mt-2 ${address.attributes?.Resolved ? 'text-green-600' : 'text-red-600'}`}>
                <strong>Status:</strong> {address.attributes?.Resolved ? 'Valid' : 'Invalid'}
              </p>
            </div>
          ))}

          {validationResult.alerts?.map((alert: any, index: number) => (
            <div key={`alert-${index}`} className={`p-2 rounded ${
              alert.alertType === 'ERROR' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              <strong>{alert.alertType}:</strong> {alert.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}