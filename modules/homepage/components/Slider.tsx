'use client'

import React, { useState, useEffect } from 'react'
import Button from '@/common/components/elements/Button'

const sliderData = [
    {
        title: "Xbox Consoles",
        subtitle: "THE BEST PLACE TO PLAY",
        description: "Save up to 50% on select Xbox games. Get 3 months of PC Game Pass for $2 USD.",
        image: "/assets/img/xbox-console.png",
        price: "$299",
        buttonText: "SHOP NOW"
    },
    // Add more slides as needed
    {
        title: "PlayStation 5",
        subtitle: "NEXT GEN GAMING",
        description: "Experience lightning-fast loading with an ultra-high speed SSD and immersive gameplay.",
        image: "/assets/img/ps5-console.png",
        price: "$499",
        buttonText: "SHOP NOW"
    },
    {
        title: "Nintendo Switch",
        subtitle: "PLAY ANYWHERE",
        description: "Play at home or on the go with the versatile Nintendo Switch gaming system.",
        image: "/assets/img/switch-console.png",
        price: "$299",
        buttonText: "SHOP NOW"
    }
];

// Right side products data
const rightProducts = [
    {
        title: "New Google Pixel 6 Pro",
        image: "/assets/img/pixel-6-pro.png",
        discount: "29% OFF",
        category: "SUMMER SALES",
        buttonText: "SHOP NOW"
    },
    {
        title: "Xiaomi FlipBuds Pro",
        image: "/assets/img/flipbuds-pro.png",
        price: "$299 USD",
        buttonText: "SHOP NOW"
    }
];

const Slider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [showCardsOnMobile, setShowCardsOnMobile] = useState(false);

    useEffect(() => {
        if (isPaused) return; // Stop sliding when paused

        const interval = setInterval(() => {
            setCurrentSlide((prev) => {
                if (prev === sliderData.length - 1) {
                    setIsPaused(true); // Pause after the last slide
                    return 0; // Reset to the first slide after last
                }
                return prev + 1;
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [isPaused]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY === 0) {
                setIsPaused(false); // Resume when user scrolls back to top
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleClick = () => {
        alert('Shop now');
    };

    const goToSlide = (index:any) => {
        setCurrentSlide(index);
        setIsPaused(true); // Pause automatic sliding when manually navigating
    };

    const goToPrevSlide = () => {
        setCurrentSlide((prev) =>
            prev === 0 ? sliderData.length - 1 : prev - 1
        );
        setIsPaused(true);
    };

    const goToNextSlide = () => {
        setCurrentSlide((prev) =>
            prev === sliderData.length - 1 ? 0 : prev + 1
        );
        setIsPaused(true);
    };

    const toggleMobileCards = () => {
        setShowCardsOnMobile(!showCardsOnMobile);
    };

    return (
        <div className="w-[90%] mx-auto mt-8 md:mt-20">
            {/* Mobile Toggle Button (only visible on mobile) */}
            {/* <div className="md:hidden mb-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">Featured Products</h2>
                <button 
                    onClick={toggleMobileCards}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm"
                >
                    {showCardsOnMobile ? 'Hide Cards' : 'Show More Cards'}
                </button>
            </div> */}
            
            <div className="flex flex-col md:flex-row md:gap-4">
                {/* Main Slider (Full width on mobile, 2/3 width on md+) */}
                <div className="w-full md:w-2/3 bg-gray-100 rounded-lg relative overflow-hidden">
                    {sliderData.map((slide, index) => (
                        <div
                            key={index}
                            className={`${currentSlide === index ? 'block' : 'hidden'} p-4 md:p-8`}
                        >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div className="flex flex-col space-y-2 md:space-y-4 max-w-md">
                                    <div className="text-blue-500 text-xs md:text-sm font-medium">{slide.subtitle}</div>
                                    <h2 className="text-2xl md:text-4xl font-bold text-gray-900">{slide.title}</h2>
                                    <p className="text-gray-700 text-xs md:text-sm mb-4 md:mb-6">{slide.description}</p>

                                    <Button
                                        onClick={handleClick}
                                        className="w-32 md:w-40 bg-amber-500 text-white text-xs md:text-sm font-medium hover:bg-amber-600"
                                    >
                                        {slide.buttonText} <span className="ml-2">→</span>
                                    </Button>
                                </div>

                                <div className="relative mt-4 md:mt-0">
                                    <div className="absolute -top-6 right-0 md:-top-10 md:-right-10 bg-blue-500 text-white rounded-full w-16 h-16 md:w-24 md:h-24 flex items-center justify-center text-base md:text-xl font-bold">
                                        {slide.price}
                                    </div>
                                    <img
                                        src={slide.image}
                                        alt={slide.title}
                                        className="max-h-48 md:max-h-80 mx-auto md:mx-0 object-contain"
                                    />
                                </div>
                            </div>

                            {/* Navigation Controls */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 flex items-center space-x-4">
                                {/* Previous Arrow */}
                                <button
                                    onClick={goToPrevSlide}
                                    className="w-4 h-4 flex items-center justify-center"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M16 4L8 12L16 20" stroke="gray" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>

                                {/* Navigation Dots */}
                                <div className="flex space-x-2">
                                    {sliderData.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`h-2 cursor-pointer rounded-full transition-all duration-300 
                                                ${currentSlide === idx ? 'bg-black w-2' : 'bg-gray-300 w-2'}`}
                                            onClick={() => goToSlide(idx)}
                                        />
                                    ))}
                                </div>

                                {/* Next Arrow */}
                                <button
                                    onClick={goToNextSlide}
                                    className="w-4 h-4 flex items-center justify-center"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8 4L16 12L8 20" stroke="gray" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Side Products - Hidden by default on mobile, shown when toggled or always visible on md+ */}
                <div className={`${showCardsOnMobile ? 'block' : 'hidden'} md:block w-full md:w-1/3 flex flex-col gap-4 mt-4 md:mt-0`}>
                    {/* Top Product - Google Pixel */}
                    <div className="bg-gray-900 text-white p-4 rounded-lg relative h-40 md:h-1/2">
                        <div className="absolute top-3 right-3 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
                            {rightProducts[0].discount}
                        </div>
                        <div className="text-xs text-yellow-400 mb-1">{rightProducts[0].category}</div>
                        <h3 className="text-lg font-medium">{rightProducts[0].title}</h3>

                        <div className="flex justify-between items-end mt-2">
                            <Button
                                onClick={handleClick}
                                className="bg-amber-500 text-white text-xs font-medium hover:bg-amber-600"
                            >
                                {rightProducts[0].buttonText} <span className="ml-1">→</span>
                            </Button>
                            <img
                                src={rightProducts[0].image}
                                alt={rightProducts[0].title}
                                className="h-20 md:h-28 object-contain"
                            />
                        </div>
                    </div>

                    {/* Bottom Product - Xiaomi FlipBuds */}
                    <div className="bg-gray-100 p-4 rounded-lg h-40 md:h-1/2">
                        <div className="flex justify-between">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">{rightProducts[1].title}</h3>
                                <p className="text-blue-500 mt-1">{rightProducts[1].price}</p>

                                <Button
                                    onClick={handleClick}
                                    className="bg-amber-500 text-white text-xs font-medium mt-4 hover:bg-amber-600"
                                >
                                    {rightProducts[1].buttonText} <span className="ml-1">→</span>
                                </Button>
                            </div>
                            <img
                                src={rightProducts[1].image}
                                alt={rightProducts[1].title}
                                className="h-20 md:h-28 object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Slider;