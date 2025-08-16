"use client";

import React, { useState } from "react";
import SearchSection from "./SearchSection";
import { useRouter } from "next/navigation";
import CartSection from "@/common/components/layouts/CartSection";
import CategoryDropdown from "./CategoryDropdown";
import { Menu, X, Search } from "lucide-react";

const HeaderBottom = () => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  return (
    <header className="bg-[#3580b9] w-full top-4 left-0 z-50">
      <div className="px-auto mx-auto">
        {/* Main header layout */}
        <div className="flex items-center justify-between cursor-pointer py-2">
          {/* Logo */}
          <div
            onClick={(e) => {
              e.preventDefault();
              router.push("/");
            }}
            className="flex-shrink-0"
          >
            <svg
              viewBox="0 0 280 80"
              xmlns="http://www.w3.org/2000/svg"
              width="280"
              height="80"
              className="h-20 w-auto"
            >
              <defs>
                <linearGradient
                  id="mainGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#667eea" stopOpacity="1" />
                  <stop offset="50%" stopColor="#764ba2" stopOpacity="1" />
                  <stop offset="100%" stopColor="#f093fb" stopOpacity="1" />
                </linearGradient>

                <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#667eea" stopOpacity="1" />
                  <stop offset="100%" stopColor="#764ba2" stopOpacity="1" />
                </linearGradient>

                <filter
                  id="shadow"
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feDropShadow
                    dx="2"
                    dy="3"
                    stdDeviation="3"
                    floodColor="rgba(102, 126, 234, 0.3)" // Fixed: was flood-color
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

          {/* Center section with search bar for md+ screens */}
          <div className="hidden md:block flex-grow mx-4 max-w-[610px] w-full">
            <SearchSection />
          </div>

          {/* Category dropdown for md+ screens */}
          <div className="hidden md:block">
            <CategoryDropdown />
          </div>

          {/* Mobile controls: Search icon and hamburger */}
          <div className="flex items-center md:hidden">
            <button
              className="p-2 text-black focus:outline-none"
              onClick={toggleSearch}
            >
              <Search size={24} />
            </button>
            <button
              className="p-2 text-black focus:outline-none"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* CartSection with wishlist, cart and profile icons - desktop only */}
          <div className="hidden md:block">
            <CartSection />
          </div>
        </div>

        {/* Mobile Search - Conditionally rendered */}
        {searchOpen && (
          <div className="md:hidden py-3 border-t border-blue-700">
            <SearchSection />
          </div>
        )}

        {/* Mobile Menu - Conditionally rendered */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-blue-700">
            <div className="flex flex-col space-y-3">
              <CategoryDropdown />
              <div className="flex justify-center py-2">
                <CartSection />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default HeaderBottom;
