"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Toaster } from "sonner";
import Image from "next/image";
import { CustomerProfile } from "@/types/customerProfile";
import { User } from "@/types/user";
import { Pencil } from "lucide-react";
import { validatePostcode } from "@/utils/validatePostalCode";

const CustomerProfileForm: React.FC = () => {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<CustomerProfile>({
    firstName: "",
    lastName: "",
    imageUrl: null,
    phone: "",
    streetAddress: null,
    city: null,
    state: null,
    postalCode: null,
    country: "United Kingdom",
  });
  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    phone: false,
    postalCode: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [postcodeSearchTerm, setPostcodeSearchTerm] = useState("");
  const [postCodeError, setPostCodeError] = useState("");

  const user = session?.user as User;

  useEffect(() => {
    if (!user) return;
    if (user.customerProfile) {
      setProfile({
        ...user.customerProfile,
        country: "United Kingdom"
      });
      if (user.customerProfile.imageUrl) {
        setImagePreview(user.customerProfile.imageUrl);
      }
      // Set the initial postcode search term if postalCode exists
      if (user.customerProfile.postalCode) {
        setPostcodeSearchTerm(user.customerProfile.postalCode);
      }
    } else {
      fetchProfile();
    }
  }, [session]);

  useEffect(() => {
    const validateCode = async (postcode: string) => {
      if (!postcode) {
        setPostCodeError("");
        return;
      }

      const response = await validatePostcode(postcode);
      if (response.isValid) {
        setPostCodeError("");
      } else {
        setPostCodeError(response.error || "Invalid UK Postal Code");
      }
    }

    const timer = setTimeout(() => {
      if (postcodeSearchTerm) {
        validateCode(postcodeSearchTerm);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [postcodeSearchTerm]);

  const validateForm = () => {
    const newErrors = {
      firstName: !profile.firstName.trim(),
      lastName: !profile.lastName.trim(),
      phone: !profile.phone?.trim() || profile.phone.length !== 10, // Must be exactly 10 digits
      postalCode: profile.postalCode ? !!postCodeError : false,
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/customer-profile");
      const data = await response.json();
      if (data.data) {
        setProfile({
          ...data.data,
          country: "United Kingdom"
        });
        if (data.data.imageUrl) {
          setImagePreview(data.data.imageUrl);
        }
        if (data.data.postalCode) {
          setPostcodeSearchTerm(data.data.postalCode);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, '');

      if (digitsOnly.length > 10) {
        return;
      }

      setProfile((prev) => ({
        ...prev,
        [name]: digitsOnly
      }));
    } else if (name === "country") {
      return;
    } else {
      setProfile((prev) => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

  const handlePostcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPostcodeSearchTerm(value);
    setProfile(prev => ({
      ...prev,
      postalCode: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.imageUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setLoading(true);

    try {
      let updatedProfile = {
        ...profile,
        phone: profile.phone ? `${profile.phone}` : null,
        country: "United Kingdom"
      };

      if (imageFile) {
        const imageUrl = await uploadImage(imageFile);
        updatedProfile.imageUrl = imageUrl;
      }

      const method = user?.isProfileComplete ? "PUT" : "POST";
      const response = await fetch("/api/customer-profile", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProfile),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save profile");
      }

      try {
        const email = user?.email;
        if (email) {
          await fetch('/api/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              name: `${updatedProfile.firstName} ${updatedProfile.lastName}`.trim()
            }),
          });
        }
      } catch (subscribeError) {
        console.error("Error subscribing user:", subscribeError);
      }

      toast.success(data.message);
      await update({
        user: {
          ...session?.user,
          customerProfile: updatedProfile,
          isProfileComplete: true
        }
      });

      if (!user?.isProfileComplete) {
        router.push("/");
      }
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error(error.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2 flex flex-col items-center mb-4">
            <div className="relative">
              <div className="w-32 h-32 relative rounded-full overflow-hidden mb-4 bg-gray-100 border border-gray-300">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Profile Preview"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <div
                onClick={triggerFileInput}
                className="absolute bottom-6 right-2 bg-[#F19B12] rounded-full p-1 cursor-pointer"
              >
                <Pencil className="text-white w-4 h-4" />
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Required Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={profile.firstName}
              onChange={handleChange}
              className={`mt-1 px-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.firstName ? "border-red-500" : ""}`}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">First name is required</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={profile.lastName}
              onChange={handleChange}
              className={`mt-1 px-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.lastName ? "border-red-500" : ""}`}
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">Last name is required</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number *
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                +44
              </span>
              <input
                type="tel"
                name="phone"
                value={profile.phone || ""}
                onChange={handleChange}
                maxLength={10}
                className={`flex-1 min-w-0 block w-full px-2 py-1 rounded-none rounded-r-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.phone ? "border-red-500" : ""}`}
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">10 digit Phone number is required</p>
            )}
          </div>

          {/* Optional Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Street Address
            </label>
            <input
              type="text"
              name="streetAddress"
              value={profile.streetAddress || ""}
              onChange={handleChange}
              className="mt-1 px-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              type="text"
              name="city"
              value={profile.city || ""}
              onChange={handleChange}
              className="mt-1 px-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              County/State
            </label>
            <input
              type="text"
              name="state"
              value={profile.state || ""}
              onChange={handleChange}
              className="mt-1 px-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Postcode with validation */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              Postal Code
            </label>
            <input
              type="text"
              name="postalCode"
              value={postcodeSearchTerm}
              onChange={handlePostcodeChange}
              placeholder="Enter UK postcode"
              className={`mt-1 px-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                errors.postalCode ? "border-red-500" : ""
              }`}
            />
            {errors.postalCode && (
              <p className="text-red-500 text-xs mt-1">
                {postCodeError || "Please enter a valid UK postcode"}
              </p>
            )}
          </div>

          {/* Fixed Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <input
              type="text"
              value="United Kingdom"
              disabled
              className="mt-1 px-2 py-1 block w-full rounded-md bg-white border-gray-300 shadow-sm text-gray-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full py-2 px-4 bg-[#F19B12] text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F19B12] disabled:bg-[#F19B12]"
        >
          {loading ? "Saving..." : user?.isProfileComplete ? "Update Profile" : "Create Profile"}
        </button>
      </form>
      <Toaster position="top-right" />
    </div>
  );
};

export default CustomerProfileForm;