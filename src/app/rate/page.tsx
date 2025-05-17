"use client";
import { useState } from "react";

export default function FedexRateCalculator() {
  const [formData, setFormData] = useState({
    accountNumber: "802255209",
    originAddress: {
      street1: "",
      street2: "",
      city: "",
      postalCode: "",
      countryCode: "GB",
      residential: false,
    },
    destinationAddress: {
      street1: "",
      street2: "",
      city: "",
      postalCode: "",
      countryCode: "GB",
      residential: false,
    },
    packageDetails: [
      {
        weight: "",
        weightUnit: "KG",
        dimensions: {
          length: "",
          width: "",
          height: "",
          unit: "CM",
        },
        declaredValue: "",
        packagingType: "BOX",
      },
    ],
    contactInfo: {
      personName: "",
      emailAddress: "",
      phoneNumber: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e, field, nestedField = null) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;

    if (nestedField) {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          [nestedField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handlePackageChange = (index, field, value) => {
    const newPackages = [...formData.packageDetails];
    if (typeof value === "object" && value !== null) {
      newPackages[index] = { ...newPackages[index], ...value };
    } else {
      newPackages[index][field] = value;
    }
    setFormData((prev) => ({
      ...prev,
      packageDetails: newPackages,
    }));
  };

  const handleAddressChange = (addressType, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [addressType]: {
        ...prev[addressType],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Ensure country codes are set
      const requestData = {
        ...formData,
        originAddress: {
          ...formData.originAddress,
          countryCode: formData.originAddress.countryCode || "GB",
        },
        destinationAddress: {
          ...formData.destinationAddress,
          countryCode: formData.destinationAddress.countryCode || "GB",
        },
        accountNumber: {
          value: formData.accountNumber,
        },
      };

      console.log("Submitting data:", JSON.stringify(requestData));

      const response = await fetch("/api/shipping-cost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      if (response.ok) {
        setRates(data);
      } else {
        throw new Error(data.error || data.message || "Failed to fetch rates");
      }
    } catch (err) {
      setError(err.message);
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">
        FedEx Freight Rate Calculator (UK)
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Account Information</h2>
            <div>
              <label className="block text-sm font-medium mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => handleChange(e, "accountNumber")}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Contact Information</h2>
            <div>
              <label className="block text-sm font-medium mb-1">
                Contact Name
              </label>
              <input
                type="text"
                value={formData.contactInfo.personName}
                onChange={(e) => handleChange(e, "contactInfo", "personName")}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.contactInfo.emailAddress}
                  onChange={(e) =>
                    handleChange(e, "contactInfo", "emailAddress")
                  }
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.contactInfo.phoneNumber}
                  onChange={(e) =>
                    handleChange(e, "contactInfo", "phoneNumber")
                  }
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Origin Address</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Country*</label>
              <select
                value={formData.originAddress.countryCode}
                onChange={(e) =>
                  handleAddressChange(
                    "originAddress",
                    "countryCode",
                    e.target.value
                  )
                }
                className="w-full p-2 border rounded"
                required
              >
                <option value="GB">United Kingdom</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="FR">France</option>
                <option value="DE">Germany</option>
              </select>
            </div>
            <AddressFields
              address={formData.originAddress}
              onChange={(field, value) =>
                handleAddressChange("originAddress", field, value)
              }
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                id="originResidential"
                checked={formData.originAddress.residential}
                onChange={(e) =>
                  handleAddressChange(
                    "originAddress",
                    "residential",
                    e.target.checked
                  )
                }
                className="mr-2"
              />
              <label htmlFor="originResidential">Residential Address</label>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Destination Address</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Country*</label>
              <select
                value={formData.destinationAddress.countryCode}
                onChange={(e) =>
                  handleAddressChange(
                    "destinationAddress",
                    "countryCode",
                    e.target.value
                  )
                }
                className="w-full p-2 border rounded"
                required
              >
                <option value="GB">United Kingdom</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="FR">France</option>
                <option value="DE">Germany</option>
              </select>
            </div>
            <AddressFields
              address={formData.destinationAddress}
              onChange={(field, value) =>
                handleAddressChange("destinationAddress", field, value)
              }
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                id="destResidential"
                checked={formData.destinationAddress.residential}
                onChange={(e) =>
                  handleAddressChange(
                    "destinationAddress",
                    "residential",
                    e.target.checked
                  )
                }
                className="mr-2"
              />
              <label htmlFor="destResidential">Residential Address</label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Package Details</h2>
          {formData.packageDetails.map((pkg, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={pkg.weight}
                    onChange={(e) =>
                      handlePackageChange(index, "weight", e.target.value)
                    }
                    className="w-full p-2 border rounded"
                    min="0.1"
                    step="0.1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Packaging Type
                  </label>
                  <select
                    value={pkg.packagingType}
                    onChange={(e) =>
                      handlePackageChange(
                        index,
                        "packagingType",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="BOX">Box</option>
                    <option value="ENVELOPE">Envelope</option>
                    <option value="TUBE">Tube</option>
                    <option value="PAK">Pak</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Declared Value (£)
                  </label>
                  <input
                    type="number"
                    value={pkg.declaredValue}
                    onChange={(e) =>
                      handlePackageChange(
                        index,
                        "declaredValue",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border rounded"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Length (cm)
                  </label>
                  <input
                    type="number"
                    value={12}
                    onChange={(e) =>
                      handlePackageChange(index, "dimensions", {
                        ...pkg.dimensions,
                        length: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Width (cm)
                  </label>
                  <input
                    type="number"
                    value={12}
                    onChange={(e) =>
                      handlePackageChange(index, "dimensions", {
                        ...pkg.dimensions,
                        width: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={12}
                    onChange={(e) =>
                      handlePackageChange(index, "dimensions", {
                        ...pkg.dimensions,
                        height: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                    min="1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? "Calculating..." : "Calculate Rates"}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold">Error</h3>
          <p>{error}</p>
        </div>
      )}

      {rates && (
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold">Rate Quotes</h2>
          <div className="p-4 bg-gray-100 rounded">
            {rates.output?.rateReplyDetails?.map((rate, index) => (
              <div key={index} className="mb-4 p-3 border-b">
                <h3 className="font-medium">{rate.serviceType}</h3>
                <p>
                  Total Cost: £
                  {rate.ratedShipmentDetails?.[0]?.totalNetCharge || "N/A"}
                </p>
                <p>
                  Transit Time: {rate.commit?.transitDays?.description || "N/A"}
                </p>
              </div>
            ))}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-blue-600">
                View raw response
              </summary>
              <pre className="mt-2 p-2 bg-white text-xs overflow-x-auto">
                {JSON.stringify(rates, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}

function AddressFields({ address, onChange }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-1">Street Line 1*</label>
        <input
          type="text"
          value={address.street1}
          onChange={(e) => onChange("street1", e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Street Line 2</label>
        <input
          type="text"
          value={address.street2}
          onChange={(e) => onChange("street2", e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">City*</label>
        <input
          type="text"
          value={address.city}
          onChange={(e) => onChange("city", e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Postal Code*</label>
        <input
          type="text"
          value={address.postalCode}
          onChange={(e) => onChange("postalCode", e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
    </>
  );
}
