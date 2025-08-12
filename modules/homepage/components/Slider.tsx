"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import earPlugs from "@/assets/products/ear-plugs.jpeg"
import foodChopper from "@/assets/products/food-chopper.jpg"
import uno from "@/assets/products/uno.jpeg"
import airBed from "@/assets/products/air-bed.jpeg"
import medKit from "@/assets/products/med-kit.jpeg";

const sliderData = [
  {
    id: "23d84712-c800-4238-bea6-b5c24219dfd3",
    title: "Ear Plugs for Sleep",
    subtitle: "Ear Plugs for Sleep Soft Silicone Reusable, Earplugs",
    description: "Save up to 32% on Health and Care.",
    image: earPlugs,
    price: "£4.98",
    buttonText: "SHOP NOW",
  },
  {
    id: "642f702b-3ca8-4e76-a730-99f974b374a6",
    title: "Manual Food Chopper",
    subtitle: "Sifenma Multi-Function Manual Food Chopper & Processors",
    description: "Save up to 16% on Home and Kitchen.",
    image: foodChopper,
    price: "£8.9",
    buttonText: "SHOP NOW",
  },
  {
    id: "36d530d1-7979-4746-86ab-7a23f8abaf0f",
    title: "UNO, Classic Card Game",
    subtitle: "UNO, Classic Card Game for Kids and Adults",
    description: "Save up to 13% on Pet Paddling Pool.",
    image: uno,
    price: "£7.39",
    buttonText: "SHOP NOW",
  },
];

// Right side products data
const rightProducts = [
  {
    id:"2b8c53fb-9866-4147-8732-0e0d6e4c5e91",
    title: "Bestway Single Airbed, Inflatable Air Mattress for One",
    image: airBed,
    discount: "32% OFF",
    category: "SUMMER SALES",
    price: "£10.55",
    buttonText: "SHOP NOW",
},
{
  id:"f981d0d3-0843-438c-8c9c-b758aae5c044",
    title: "10 Person HSE Workplace First Aid Kit",
    image: medKit,
    price: "£9.52",
    discount: "10% OFF",
    buttonText: "SHOP NOW",
  },
];

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showCardsOnMobile, setShowCardsOnMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        if (prev === sliderData.length - 1) {
          setIsPaused(true);
          return 0;
        }
        return prev + 1;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY === 0) {
        setIsPaused(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (id: string) => {
    router.push(`/products/${id}`)
  };

  const goToSlide = (index: any) => {
    setCurrentSlide(index);
    setIsPaused(true);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? sliderData.length - 1 : prev - 1));
    setIsPaused(true);
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev === sliderData.length - 1 ? 0 : prev + 1));
    setIsPaused(true);
  };

  const toggleMobileCards = () => {
    setShowCardsOnMobile(!showCardsOnMobile);
  };

  return (
    <div className="w-full px-[4%] mt-8 md:mt-12">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Slider */}
        <div className="w-full lg:w-2/3 relative">
          <div className="bg-gray-50 rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            {sliderData.map((slide, index) => (
              <div
                key={index}
                className={`${
                  currentSlide === index ? "block" : "hidden"
                } p-8 md:p-12 min-h-[400px] md:min-h-[500px] relative`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between h-full">
                  <div className="flex flex-col space-y-6 max-w-lg z-10">
                    <div className="inline-block">
                      <span className="bg-white text-gray-600 text-sm font-medium px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                        {slide.subtitle.split(" ").slice(0, 3).join(" ")}
                      </span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
                      {slide.title}
                    </h2>

                    <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                      {slide.description}
                    </p>

                    <div className="flex items-center space-x-4">
                      <div className="text-gray-900">
                        <span className="text-3xl md:text-4xl font-bold">
                          {slide.price}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={()=>handleClick(slide.id)}
                      className="group bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-300 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-800 transform transition-all duration-300 hover:-translate-y-1 w-fit flex items-center space-x-2"
                    >
                      <span>{slide.buttonText}</span>
                      <svg
                        className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="relative mt-8 lg:mt-0 flex-shrink-0">
                    <div className="relative">
                      {/* Floating badge */}
                      <div className="absolute -top-4 -right-4 z-20 bg-gray-900 text-white rounded-2xl px-4 py-2 font-bold text-sm shadow-lg">
                        SALE
                      </div>

                      {/* Product image with clean styling */}
                      <div className="relative bg-white rounded-3xl p-8 border border-gray-200 shadow-lg">
                        <Image
                          src={slide.image}
                          alt={slide.title}
                          width={320}
                          height={320}
                          className="w-64 h-64 md:w-80 md:h-80 object-contain mx-auto"
                          priority={index === 0}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Enhanced Navigation Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 lg:left-12 lg:translate-x-0 flex items-center space-x-6">
              <button
                onClick={goToPrevSlide}
                className="bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-full transition-all duration-300 border border-gray-200 shadow-md hover:shadow-lg"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M16 4L8 12L16 20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div className="flex space-x-3">
                {sliderData.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 cursor-pointer rounded-full transition-all duration-500 ${
                      currentSlide === idx
                        ? "bg-gray-900 w-8 shadow-md"
                        : "bg-gray-300 w-2 hover:bg-gray-400"
                    }`}
                    onClick={() => goToSlide(idx)}
                  />
                ))}
              </div>

              <button
                onClick={goToNextSlide}
                className="bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-full transition-all duration-300 border border-gray-200 shadow-md hover:shadow-lg"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M8 4L16 12L8 20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side Products */}
        <div
          className={`${
            showCardsOnMobile ? "block" : "hidden"
          } lg:block w-full lg:w-1/3 flex flex-col gap-6 space-y-2`}
        >
          {/* Top Product */}
          <div className="relative bg-gray-900 text-white p-4 px-6 rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-700 rounded-full -translate-y-12 translate-x-12 opacity-30"></div>

            <div className="bg-slate-900 rounded-xl text-white max-w-lg mx-auto">
              {/* Header with badge */}
              <div className="flex justify-between items-center mb-0">
                <div className="text-xs text-gray-300 font-medium uppercase tracking-wide">
                  {rightProducts[0].category}
                </div>
                <div className="bg-white text-slate-900 px-3 py-1 rounded-lg text-sm font-bold">
                  {rightProducts[0].discount}
                </div>
              </div>

              <h3 className="text-lg font-bold text-start mb-4 leading-snug">
                {rightProducts[0].title}
              </h3>

              {/* Content area - side by side layout */}
              <div className="flex items-center justify-between">
                {/* Left side - Image */}
                <div className="flex-shrink-0">
                  <Image
                    src={rightProducts[0].image}
                    alt={rightProducts[0].title}
                    width={80}
                    height={80}
                    className="h-36 w-36 rounded-lg object-contain transform hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Right side - Price and Button */}
                <div className="flex flex-col items-end space-y-4 ml-6">
                  <span className="text-2xl font-bold text-white">
                    {rightProducts[0].price}
                  </span>
                  <button
                    onClick={()=>handleClick(rightProducts[0].id)}
                    className="bg-white text-gray-900 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300"
                  >
                    {rightProducts[0].buttonText}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Product */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 group hover:shadow-2xl transition-all duration-300 relative">
      {/* OFF Badge */}
      <div className="absolute top-4 right-4 bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-300 text-white px-2 py-1 rounded-lg text-sm font-bold">
        {rightProducts[1].discount}
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex-1 flex flex-col justify-between h-44">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
              {rightProducts[1].title}
            </h3>
            <div className="flex items-baseline space-x-2 mb-6">
              <span className="text-xl font-bold text-gray-900">
                {rightProducts[1].price}
              </span>
      
            </div>
          </div>

          <button
            onClick={()=>handleClick(rightProducts[1].id)}
            className="bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-300 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition-all duration-300 transform hover:-translate-y-1 shadow-md self-start"
          >
            {rightProducts[1].buttonText}
          </button>
        </div>
        
        <Image
          src={rightProducts[1].image}
          alt={rightProducts[1].title}
          width={80}
          height={80}
          className="h-44 w-44 object-contain ml-6 group-hover:scale-110 transition-transform duration-300"
        />
      </div>
    </div>
        </div>
      </div>

      {/* Mobile toggle button */}
      <div className="lg:hidden mt-6 text-center">
        <button
          onClick={toggleMobileCards}
          className="bg-gray-900 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl hover:bg-gray-800 transition-all duration-300"
        >
          {showCardsOnMobile ? "Hide Products" : "View More Products"}
        </button>
      </div>
    </div>
  );
};

export default Slider;
