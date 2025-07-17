"use client";
import React from "react";
import CustomerProfileForm from "@/components/profileForm";
import { useEffect } from "react";
import bgImg from "@/assets/myImages/otp.png"
import Image from "next/image";

export default function ProfileDetails() {
  useEffect(() => {
    document.title = "Profile - eTrolly";
    const metaDescription = document.querySelector("meta[name='description']");
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Setup your profile on eTrolly"
      );
    } else {
      const newMetaDescription = document.createElement("meta");
      newMetaDescription.name = "description";
      newMetaDescription.content = "Setup your profile on eTrolly";
      document.head.appendChild(newMetaDescription);
    }
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-gray-100">
      <section className="w-full lg:w-[60%] flex flex-col justify-center items-center p-6 space-y-8 lg:space-y-1">
        <CustomerProfileForm />
      </section>
      <div className="hidden lg:block lg:w-[40%] h-screen relative">
        <Image 
          src={bgImg.src}
          alt="profile background"
          fill
          className="object-cover"
        />
      </div> 
    </div>
  );
}