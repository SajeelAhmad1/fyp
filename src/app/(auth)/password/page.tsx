"use client";
import React from "react";
import PasswordPic from "@/assets/myImages/otp.png";
import ClientPasswordForm from "@/components/passwordForm";
import { useEffect } from "react";

export default function Password() {
  useEffect(() => {
    document.title = "Password - eTrolly";
    const metaDescription = document.querySelector("meta[name='description']");
    if (metaDescription) {
      metaDescription.setAttribute("content", "Password setup for eTrolly");
    } else {
      const newMetaDescription = document.createElement("meta");
      newMetaDescription.name = "description";
      newMetaDescription.content = "Password setup for eTrolly";
      document.head.appendChild(newMetaDescription);
    }
  }, []);

  return (
    <div className="h-screen w-screen px-4 flex flex-col justify-center lg:flex-row mt-0 pt-0 overflow-x-hidden bg-gray-100 ">
      <section className="w-full lg:w-[60vw] h-auto flex flex-col justify-center items-center">
      <div className="w-full max-w-md flex justify-center ml-16">
          <svg
            viewBox="0 0 280 80"
            xmlns="http://www.w3.org/2000/svg"
            width="280"
            height="80"
            className="h-28 w-auto"
          >
            <defs>
              <linearGradient id="mainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#667eea" stopOpacity="1" />
                <stop offset="50%" stopColor="#764ba2" stopOpacity="1" />
                <stop offset="100%" stopColor="#f093fb" stopOpacity="1" />
              </linearGradient>

              <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#667eea" stopOpacity="1" />
                <stop offset="100%" stopColor="#764ba2" stopOpacity="1" />
              </linearGradient>

              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx="2"
                  dy="3"
                  stdDeviation="3"
                  floodColor="rgba(102, 126, 234, 0.3)"
                />
              </filter>

              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <circle
              cx="35"
              cy="40"
              r="25"
              fill="url(#mainGrad)"
              filter="url(#shadow)"
            />

            <circle
              cx="35"
              cy="40"
              r="22"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
            />

            <g transform="translate(23, 28)" filter="url(#glow)">
              <path
                d="M2 3 L7 3 L9 16 L21 16 L23 8 L8 8"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d="M9 16 L7 20 L19 20"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <circle cx="10" cy="22" r="1.5" fill="white" />
              <circle cx="17" cy="22" r="1.5" fill="white" />

              <rect
                x="11"
                y="10"
                width="3"
                height="4"
                rx="0.5"
                fill="rgba(255,255,255,0.7)"
              />
              <rect
                x="15"
                y="8"
                width="4"
                height="6"
                rx="0.5"
                fill="rgba(255,255,255,0.5)"
              />
              <rect
                x="13"
                y="6"
                width="2"
                height="3"
                rx="0.3"
                fill="rgba(255,255,255,0.6)"
              />

              <path
                d="M9 12 L21 12 M9 14 L21 14"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="0.5"
              />
            </g>

            <text
              x="80"
              y="50"
              fontFamily="Arial, sans-serif"
              fontSize="32"
              fontWeight="300"
              fill="url(#textGrad)"
              letterSpacing="0"
            >
              e<tspan fontWeight="600">Trolly</tspan>
            </text>

            <circle
              cx="200"
              cy="20"
              r="3"
              fill="url(#mainGrad)"
              opacity="0.6"
            />
            <circle
              cx="210"
              cy="35"
              r="2"
              fill="url(#mainGrad)"
              opacity="0.4"
            />
            <circle
              cx="205"
              cy="50"
              r="1.5"
              fill="url(#mainGrad)"
              opacity="0.3"
            />
            <circle
              cx="215"
              cy="25"
              r="1"
              fill="url(#mainGrad)"
              opacity="0.5"
            />

            <path
              d="M248 22 Q252 30 253 33"
              stroke="url(#mainGrad)"
              strokeWidth="0.5"
              fill="none"
              opacity="0.3"
            />
          </svg>
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
