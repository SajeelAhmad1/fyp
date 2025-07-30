"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CustomerProfile } from "@/types/customerProfile";

export default function Account() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [activeTab, setActiveTab] = useState("profile");
    const [profile, setProfile] = useState<CustomerProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                    setIsLoading(false);
                } catch (err) {
                    setError('Unable to load profile');
                    setIsLoading(false);
                }
            } else if (status === "unauthenticated") {
                router.push("/login");
            }
        }

        fetchProfile();
    }, [status, router]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
    }

    // Fallback to empty object if profile is null
    const safeProfile = profile || {
        firstName: "",
        lastName: "",
        phone: "",
        imageUrl: "",
        streetAddress: "",
        city: "",
        state: "",
        postalCode: "",
        country: ""
    };

    console.log("Profile Data:", safeProfile);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Tab Navigation */}
            <div className="bg-gray-100 p-4 flex border-b">
                <button
                    onClick={() => setActiveTab("profile")}
                    className={`mr-4 py-2 px-4 rounded-t ${activeTab === "profile" ? "bg-white border-t border-l border-r font-bold" : ""}`}
                >
                    Profile
                </button>
                <button
                    onClick={() => router.push("/orders")}
                    className={`mr-4 py-2 px-4 rounded-t ${activeTab === "orders" ? "bg-white border-t border-l border-r font-bold" : ""}`}
                >
                    My Orders
                </button>
                <button
                    onClick={() => router.push("/account/wishlist")}
                    className={`mr-4 py-2 px-4 rounded-t ${activeTab === "wishlist" ? "bg-white border-t border-l border-r font-bold" : ""}`}
                >
                    Wishlist
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-white p-6 rounded-b-lg border border-grey-200">
                <div>
                    <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3 mb-6 md:mb-0 pr-0 md:pr-6">
                            <div className="bg-gray-100 p-6 rounded-lg text-center">
                                <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden border">
                                    {safeProfile.imageUrl ? (
                                        <Image
                                            src={safeProfile.imageUrl}
                                            alt="Profile Picture"
                                            width={128}
                                            height={128}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-blue-800 text-white text-4xl">
                                            {safeProfile.firstName ? safeProfile.firstName.charAt(0) : ""}
                                            {safeProfile.lastName ? safeProfile.lastName.charAt(0) : ""}
                                        </div>
                                    )}
                                </div>

                                <h2 className="text-xl font-bold">
                                    {safeProfile.firstName} {safeProfile.lastName}
                                </h2>
                                <p className="text-gray-600">{session?.user.email}</p>
                                <div className="mt-4">
                                    <button 
                                        onClick={() => router.push("/account/edit-profile")}
                                        className="bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-300 text-white py-2 px-4 rounded"
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="md:w-2/3">
                            <h2 className="text-xl font-bold mb-4">Personal Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="border p-4 rounded">
                                    <p className="text-gray-500 text-sm">Full Name</p>
                                    <p className="font-medium">{safeProfile.firstName} {safeProfile.lastName}</p>
                                </div>
                                <div className="border p-4 rounded">
                                    <p className="text-gray-500 text-sm">Contact</p>
                                    <p className="font-medium">{safeProfile.phone || "Not provided"}</p>
                                </div>
                                <div className="border p-4 rounded">
                                    <p className="text-gray-500 text-sm">Email</p>
                                    <p className="font-medium">{session?.user.email}</p>
                                </div>
                                <div className="border p-4 rounded">
                                    <p className="text-gray-500 text-sm">Member Since</p>
                                    <p className="font-medium">{safeProfile.createdAt ? new Date(safeProfile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Not available"}</p>
                                </div>
                            </div>

                            <h2 className="text-xl font-bold mt-6 mb-4">Address Information</h2>
                            <div className="border p-4 rounded">
                                <div className="flex justify-between">
                                    <h3 className="font-medium">Delivery Address</h3>
                                    <button 
                                        onClick={() => router.push("/account/edit-profile")}
                                        className="text-blue-800 hover:underline"
                                    >
                                        Edit
                                    </button>
                                </div>
                                <p className="mt-2">
                                    {safeProfile.streetAddress || "No address provided"},<br />
                                    {safeProfile.city || ""}{safeProfile.city && safeProfile.postalCode ? ", " : ""}{safeProfile.postalCode || ""}<br />
                                    {safeProfile.state ? `${safeProfile.state}, ` : ""}{safeProfile.country || ""}
                                </p>
                            </div>

                            <div className="mt-6">
                                <h2 className="text-xl font-bold mb-4">Account Settings</h2>
                                <div className="space-y-3">
                                    <button 
                                        onClick={() => router.push("/account/change-password")}
                                        className="w-full text-left flex justify-between items-center border p-4 rounded hover:bg-gray-50"
                                    >
                                        <span>Change Password</span>
                                        <span>→</span>
                                    </button>
                                    {/* <button 
                                        onClick={() => router.push("/account/communication-preferences")}
                                        className="w-full text-left flex justify-between items-center border p-4 rounded hover:bg-gray-50"
                                    >
                                        <span>Communication Preferences</span>
                                        <span>→</span>
                                    </button> */}
                                    {/* <button 
                                        onClick={() => router.push("/account/delete-account")}
                                        className="w-full text-left flex justify-between items-center border p-4 rounded hover:bg-gray-50 text-red-600"
                                    >
                                        <span>Delete Account</span>
                                        <span>→</span>
                                    </button> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}