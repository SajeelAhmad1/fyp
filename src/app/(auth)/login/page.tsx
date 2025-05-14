"use client";
import React, { useEffect } from "react";
import ClientPasswordForm from "@/components/loginForm";
import Login from "@/assets/myImages/loginbg.jpg";
import Image from "next/image";

export default function Home() {
  useEffect(() => {
    document.title = "Login - Lyalla and Lora";
    const metaDescription = document.querySelector("meta[name='description']");
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Login yourself on Lyalla and Lora"
      );
    } else {
      const newMetaDescription = document.createElement("meta");
      newMetaDescription.name = "description";
      newMetaDescription.content = "Login yourself on Lyalla and Lora";
      document.head.appendChild(newMetaDescription);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Image Section - Full height, centered content */}
      <div className="hidden md:flex md:w-1/2">
        <div className="w-full h-full relative">
          <Image
            src={Login.src}
            alt="login bg"
            className="max-w-[80%] w-full rounded-r-3xl"
            fill={true}
            priority
          />
        </div>
      </div>

      {/* Content Section - Full height, centered content */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-10">
          {" "}
          {/* Changed max-w-md to max-w-xl */}
          <div className="text-center mb-8">
            {" "}
            {/* Added margin-bottom */}
            <h1 className="text-3xl font-bold text-[#F19B12]">
              Lyalla and Lora
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back! Please login to your account
            </p>
          </div>
          <div className="w-full">
            <ClientPasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}
