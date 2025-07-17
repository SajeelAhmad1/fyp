"use client";
import React from "react";
import PasswordPic from "@/assets/myImages/otp.png";
import ClientPasswordForm from "@/components/passwordForm";
import { useEffect } from "react";

export default function Password() {
  useEffect(() => {
    document.title = "Password - Lyalla and Lora";
    const metaDescription = document.querySelector("meta[name='description']");
    if (metaDescription) {
      metaDescription.setAttribute("content", "Password setup for Lyalla and Lora");
    } else {
      const newMetaDescription = document.createElement("meta");
      newMetaDescription.name = "description";
      newMetaDescription.content = "Password setup for Lyalla and Lora";
      document.head.appendChild(newMetaDescription);
    }
  }, []);

  return (
    <div className="h-screen w-screen px-4 flex flex-col justify-center lg:flex-row mt-0 pt-0 overflow-x-hidden bg-gray-100 ">
      <section className="w-full lg:w-[60vw] h-auto flex flex-col justify-center items-center">
      <div className="text-center text-[40px] font-bold text-[#F19B12]">
            Lyalla and Lora
          </div>
        <div className="flex flex-col items-center space-y-1 lg:space-y-1 pb-12 pt-8 ">
          <h1 className="font-semibold leading-[56.96px] bold text-[24px] md:text-[36px] lg:text-[46px] text-center  -tracking--2">
            Create Password
          </h1>
         
        </div>

        <ClientPasswordForm />
      </section>
      <div className="hidden lg:flex lg:w-[40vw] h-screen flex-col">
        <img
          src={PasswordPic.src}
          alt="Verification"
          className="w-full h-[100vh] object-cover rounded-l-[90px]"
        />
      </div>
    </div>
  );
}
