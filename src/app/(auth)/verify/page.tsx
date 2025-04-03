"use client";
import React, { useEffect, useState } from "react";
import OtpVerification from "@/components/OtpVerification";
import AuthLayout from "@/components/auth";
import logo from "@/assets/images/dark-ava-logo.png";

export default function Verification() {
  useEffect(() => {
    document.title = "Verification - Lyalla and Lora";

    const metaDescription = document.querySelector("meta[name='description']");
    if (metaDescription) {
      metaDescription.setAttribute("content", "Verify your Lyalla and Lora account");
    } else {
      const newMetaDescription = document.createElement("meta");
      newMetaDescription.name = "description";
      newMetaDescription.content = "Verify your Lyalla and Lora account";
      document.head.appendChild(newMetaDescription);
    }
  }, []);

  return (
    <AuthLayout>
      <section className="w-full h-screen flex flex-col justify-center items-center">
        <div>
          <img
            className="max-w-[450px] w-full m-auto"
            src={logo.src}
            alt="Lyalla and Lora"
          />
          <div className="flex flex-col items-center space-y-1 lg:space-y-1 p-5 mt-[50px]">
            <h1 className="font-semibold leading-[28.8px] md:leading-[48.8px] text-[24px] md:text-[36px] lg:text-[40px] text-center font-custom">
              Enter The 6-Digit Verification <br />
              Code Sent To Your Email
            </h1>
          </div>
        </div>

        <div className="max-w-[360px] w-full">
          <OtpVerification />
        </div>
      </section>
    </AuthLayout>
  );
}
