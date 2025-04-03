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

const CustomerProfileForm: React.FC = () => {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<CustomerProfile>({
    firstName: "",
    lastName: "",
    imageUrl: null,
    phone: null,
    streetAddress: null,
    city: null,
    state: null,
    postalCode: null,
    country: null,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = session?.user as User;

  useEffect(() => {
    if (!user) return;
    if (user.customerProfile) {
      setProfile(user.customerProfile);
      if (user.customerProfile.imageUrl) {
        setImagePreview(user.customerProfile.imageUrl);
      }
    } else {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/customer-profile");
      const data = await response.json();
      if (data.data) {
        setProfile(data.data);
        if (data.data.imageUrl) {
          setImagePreview(data.data.imageUrl);
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
    setProfile((prev) => ({ 
      ...prev, 
      [name]: value || null  // Convert empty string to null
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    // Create preview URL
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
    // Create form data
    const formData = new FormData();
    formData.append('image', file);

    // Upload to your image storage API
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.imageUrl; // Return the URL of the uploaded image
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let updatedProfile = { ...profile };

      // If there's a new image file, upload it first
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

      // Subscribe the user to the newsletter
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
          // We intentionally don't await this or handle errors differently
          // as we don't want it to block the profile creation process
          // Just log success silently
        }
      } catch (subscribeError) {
        console.error("Error subscribing user:", subscribeError);
        // We don't show this error to the user as the profile was successfully created
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
          {/* Profile Image Upload Section */}
          <div className="col-span-1 md:col-span-2 flex flex-col items-center mb-4">
            <div className="relative">
              <div
                className="w-32 h-32 relative rounded-full overflow-hidden mb-4 bg-gray-100 border border-gray-300"
              >
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

              {/* Blue Edit Icon */}
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

          {/* Other Form Fields */}
          {[
            { label: "First Name", name: "firstName", type: "text", required: true },
            { label: "Last Name", name: "lastName", type: "text", required: true },
            { label: "Phone Number", name: "phone", type: "tel" },
            { label: "Street Address", name: "streetAddress", type: "text" },
            { label: "City", name: "city", type: "text" },
            { label: "State", name: "state", type: "text" },
            { label: "Postal Code", name: "postalCode", type: "text" },
            { label: "Country", name: "country", type: "text" },
          ].map(({ label, name, type, required }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700">
                {label} {required && "*"}
              </label>
              <input
                type={type}
                name={name}
                value={profile[name as keyof CustomerProfile] || ""}
                onChange={handleChange}
                required={required}
                className="mt-1 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full py-2 px-4 bg-[#F19B12] text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F19B12] disabled:bg-[#F19B12]"
        >
          {loading ? "Saving..." : user?.isProfileComplete ? "Update Profile" : "Create Profile"}
        </button>
      </form>
      <Toaster position="top-right"/>
    </div>
  );
};

export default CustomerProfileForm;