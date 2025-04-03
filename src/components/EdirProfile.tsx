"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { CustomerProfile } from "@/types/customerProfile";

export default function EditProfile() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [profile, setProfile] = useState<CustomerProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        streetAddress: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        imageUrl: ""
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProfile() {
            if (status === "authenticated") {
                try {
                    const response = await fetch('/api/customer-profile');
                    if (!response.ok) {
                        throw new Error('Failed to fetch profile');
                    }
                    const result = await response.json();
                    setProfile(result.data);
                    setFormData(result.data || {
                        firstName: "",
                        lastName: "",
                        phone: "",
                        streetAddress: "",
                        city: "",
                        state: "",
                        postalCode: "",
                        country: "",
                        imageUrl: ""
                    });
                    setImagePreview(result.data?.imageUrl || null);
                    setIsLoading(false);
                } catch (err) {
                    console.error('Error fetching profile:', err);
                    setError('Unable to load profile');
                    setIsLoading(false);
                }
            } else if (status === "unauthenticated") {
                router.push("/login");
            }
        }

        fetchProfile();
    }, [status, router]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Optional: Implement image upload to your storage service
            // For now, we'll use FileReader to preview the image
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setFormData(prev => ({
                    ...prev,
                    imageUrl: reader.result as string
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/customer-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const result = await response.json();
            router.push('/account');
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('Unable to update profile');
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 p-16">
            <div className=" mx-auto bg-white p-8">
                <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        
                        <div className="relative w-32 h-32 rounded-full overflow-hidden border">
                            {imagePreview ? (
                                <Image
                                    src={imagePreview}
                                    alt="Profile Preview"
                                    width={128}
                                    height={128}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-800 text-white text-4xl">
                                    {formData.firstName ? formData.firstName.charAt(0) : ""}
                                    {formData.lastName ? formData.lastName.charAt(0) : ""}
                                </div>
                            )}

                            {/* Pencil Icon Overlay */}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="imageUpload"
                            />
                            <label
                                htmlFor="imageUpload"
                                className="absolute bottom-0 right-0 bg-blue-200 p-2 rounded-full m-1 cursor-pointer hover:bg-gray-100 transition-all flex items-center justify-center"
                            >
                                <Pencil
                                    size={16}
                                    className="text-blue-800"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="firstName" className="block text-gray-700 text-sm font-bold mb-2">
                                First Name
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#F19B12]"
                            />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block text-gray-700 text-sm font-bold mb-2">
                                Last Name
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#F19B12]"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#F19B12]"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="streetAddress" className="block text-gray-700 text-sm font-bold mb-2">
                            Street Address
                        </label>
                        <input
                            type="text"
                            id="streetAddress"
                            name="streetAddress"
                            value={formData.streetAddress}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#F19B12]"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label htmlFor="city" className="block text-gray-700 text-sm font-bold mb-2">
                                City
                            </label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#F19B12]"
                            />
                        </div>
                        <div>
                            <label htmlFor="state" className="block text-gray-700 text-sm font-bold mb-2">
                                State/Province
                            </label>
                            <input
                                type="text"
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#F19B12]"
                            />
                        </div>
                        <div>
                            <label htmlFor="postalCode" className="block text-gray-700 text-sm font-bold mb-2">
                                Postal Code
                            </label>
                            <input
                                type="text"
                                id="postalCode"
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#F19B12]"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="country" className="block text-gray-700 text-sm font-bold mb-2">
                            Country
                        </label>
                        <input
                            type="text"
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#F19B12]"
                        />
                    </div>

                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={() => router.push('/account')}
                            className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-800 text-white py-2 px-4 rounded hover:bg-blue-900 disabled:opacity-50"
                        >
                            {isLoading ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}