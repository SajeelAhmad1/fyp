"use client";
import React, { useEffect } from "react";
import ClientPasswordForm from "@/components/loginForm";
import Image from "next/image";
import loginImg from "@/assets/myImages/login.png";

export default function Home() {
  useEffect(() => {
    document.title = "Login - eTrolly";
    const metaDescription = document.querySelector("meta[name='description']");
    if (metaDescription) {
      metaDescription.setAttribute("content", "Login yourself on eTrolly");
    } else {
      const newMetaDescription = document.createElement("meta");
      newMetaDescription.name = "description";
      newMetaDescription.content = "Login yourself on eTrolly";
      document.head.appendChild(newMetaDescription);
    }
  }, []);

  return (
    <div className="relative min-h-screen min-w-full grid grid-cols-1 md:grid-cols-2 bg-white">
      {/* Left Section - Login Form */}
      <section className="relative z-10 w-full h-full flex flex-col justify-center items-center px-4 space-y-8 py-12">
        {/* Logo */}
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

        {/* Login Form */}
        <div className="max-w-[300px] sm:max-w-[360px] w-full">
          <ClientPasswordForm />
        </div>

        {/* Footer Links */}
      </section>

      {/* Right Section - Visual Content */}
      <div className="hidden md:flex relative ">
        <Image
          src={loginImg.src}
          alt="Login Illustration"
          fill
          className="object-fill"
        />
      </div>
    </div>
  );
}
