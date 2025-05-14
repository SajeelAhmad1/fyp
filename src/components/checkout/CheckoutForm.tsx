"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { validatePostcode } from "@/utils/validatePostalCode";
import { isValid as isValidPostcode } from "postcode";
import { ShippingDetails } from "./ShippingDetails";
import { BillingDetails } from "./BillingDetails";

export interface CheckoutFormData {
  shippingFirstName: string;
  shippingLastName: string;
  shippingStreet: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  shippingPhone: string;
  useSameAddress: boolean;
  billingFirstName: string;
  billingLastName: string;
  billingStreet: string;
  billingCity: string;
  billingState: string;
  billingPostalCode: string;
  billingCountry: string;
  email: string;
}

interface CheckoutFormProps {
  onSubmit: (formData: CheckoutFormData) => void;
  initialData?: Partial<CheckoutFormData>;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ 
  onSubmit, 
  initialData 
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    shippingFirstName: initialData?.shippingFirstName || "",
    shippingLastName: initialData?.shippingLastName || "",
    shippingStreet: initialData?.shippingStreet || "",
    shippingCity: initialData?.shippingCity || "",
    shippingState: initialData?.shippingState || "",
    shippingPostalCode: initialData?.shippingPostalCode || "",
    shippingCountry: initialData?.shippingCountry || "United Kingdom",
    shippingPhone: initialData?.shippingPhone || "",
    useSameAddress: initialData?.useSameAddress ?? true,
    billingFirstName: initialData?.billingFirstName || "",
    billingLastName: initialData?.billingLastName || "",
    billingStreet: initialData?.billingStreet || "",
    billingCity: initialData?.billingCity || "",
    billingState: initialData?.billingState || "",
    billingPostalCode: initialData?.billingPostalCode || "",
    billingCountry: initialData?.billingCountry || "United Kingdom",
    email: initialData?.email || session?.user?.email || "",
  });

  const [formErrors, setFormErrors] = useState({
    shippingFirstName: false,
    shippingLastName: false,
    shippingStreet: false,
    shippingCity: false,
    shippingState: false,
    shippingPostalCode: false,
    shippingCountry: false,
    shippingPhone: false,
    billingFirstName: false,
    billingLastName: false,
    billingStreet: false,
    billingCity: false,
    billingState: false,
    billingPostalCode: false,
    billingCountry: false,
    email: false,
  });

  const [postcodeSearchTerm, setPostcodeSearchTerm] = useState("");
  const [postCodeError, setPostCodeError] = useState("");

  const validateForm = () => {
    const newErrors = {
      shippingFirstName: !formData.shippingFirstName.trim(),
      shippingLastName: !formData.shippingLastName.trim(),
      shippingStreet: !formData.shippingStreet.trim(),
      shippingCity: !formData.shippingCity.trim(),
      shippingState: !formData.shippingState.trim(),
      shippingCountry: false,
      shippingPhone:
        !formData.shippingPhone.trim() || formData.shippingPhone.length !== 10,
      billingFirstName:
        !formData.useSameAddress && !formData.billingFirstName.trim(),
      billingLastName:
        !formData.useSameAddress && !formData.billingLastName.trim(),
      billingStreet: !formData.useSameAddress && !formData.billingStreet.trim(),
      billingCity: !formData.useSameAddress && !formData.billingCity.trim(),
      billingState: !formData.useSameAddress && !formData.billingState.trim(),
      billingPostalCode:
        !formData.useSameAddress &&
        (!formData.billingPostalCode.trim() ||
          !isValidPostcode(formData.billingPostalCode)),
      billingCountry:
        !formData.useSameAddress && !formData.billingCountry.trim(),
      email: !formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email),
      shippingPostalCode:
        !formData.shippingPostalCode.trim() || !!postCodeError,
    };

    setFormErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      const firstErrorField = Object.keys(newErrors).find(
        (key) => newErrors[key as keyof typeof newErrors]
      );
      if (firstErrorField) {
        document.getElementById(firstErrorField)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return false;
    }
    return true;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "shippingPhone") {
      const digitsOnly = value.replace(/\D/g, "");

      if (digitsOnly.length > 10) {
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [name]: digitsOnly,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: false,
      }));
    }
  };

  const handleSameAddressToggle = () => {
    const useSameAddress = !formData.useSameAddress;
    setFormData((prev) => ({
      ...prev,
      useSameAddress,
      billingFirstName: useSameAddress ? prev.shippingFirstName : "",
      billingLastName: useSameAddress ? prev.shippingLastName : "",
      billingStreet: useSameAddress ? prev.shippingStreet : "",
      billingCity: useSameAddress ? prev.shippingCity : "",
      billingState: useSameAddress ? prev.shippingState : "",
      billingPostalCode: useSameAddress ? prev.shippingPostalCode : "",
      billingCountry: useSameAddress ? prev.shippingCountry : "",
    }));

    if (useSameAddress) {
      setFormErrors((prev) => ({
        ...prev,
        billingFirstName: false,
        billingLastName: false,
        billingStreet: false,
        billingCity: false,
        billingState: false,
        billingPostalCode: false,
        billingCountry: false,
      }));
    }
  };

  const handlePostcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPostcodeSearchTerm(value);
    setFormData((prev) => ({
      ...prev,
      shippingPostalCode: value,
      ...(formData.useSameAddress && { billingPostalCode: value }),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="bg-white p-6 rounded-lg mb-6">
        <h1 className="text-2xl font-semibold mb-6">Shipping Information</h1>
        
        <ShippingDetails
          formData={formData}
          formErrors={formErrors}
          handleInputChange={handleInputChange}
          postcodeSearchTerm={postcodeSearchTerm}
          postCodeError={postCodeError}
          handlePostcodeChange={handlePostcodeChange}
        />

        <BillingDetails
          formData={formData}
          formErrors={formErrors}
          handleInputChange={handleInputChange}
          handleSameAddressToggle={handleSameAddressToggle}
          postcodeSearchTerm={postcodeSearchTerm}
          postCodeError={postCodeError}
          handlePostcodeChange={handlePostcodeChange}
        />

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Continue to Payment
          </button>
        </div>
      </div>
    </form>
  );
};