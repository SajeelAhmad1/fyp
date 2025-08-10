import React from 'react'
import Image from 'next/image'
import earPlugs from "@/assets/products/ear-plugs.jpeg"
import foodChopper from "@/assets/products/food-chopper.jpg"
import uno from "@/assets/products/uno.jpeg"
import airBed from "@/assets/products/air-bed.jpeg"
import medKit from "@/assets/products/med-kit.jpeg";
import { useRouter } from 'next/navigation'

const Button = ({ children, className, onClick, ...props }:any) => {
    return (
        <button 
            className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    )
}
const BannerPromotion = () => {

    const router = useRouter();
    return (
        <div className="container mx-auto px-4">
            <div className="relative m-4 md:m-6 lg:m-10">
                {/* Background with enhanced gradient and animations */}
                <div className="w-full h-64 md:h-80 lg:h-96 xl:h-[450px] rounded-2xl overflow-hidden relative shadow-2xl">
                    {/* Enhanced gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-300 animate-pulse"></div>
                    
                    {/* Animated overlay patterns */}
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full opacity-10 animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
                        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full opacity-15 animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
                        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-pink-200 rounded-full opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
                    </div>
                    
                    {/* Geometric pattern overlay */}
                    <div className="absolute inset-0 opacity-10">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                                </pattern>
                            </defs>
                            <rect width="100" height="100" fill="url(#grid)" />
                        </svg>
                    </div>
                    
                    {/* Left side - Enhanced triangular product arrangement */}
                    <div className="absolute left-0 top-0 w-1/2 h-full flex items-center justify-center">
                        <div className="relative w-48 md:w-56 lg:w-64 h-48 md:h-56 lg:h-64">
                            {/* Top center - Pet Tent with enhanced styling */}
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 group">
                                <div className="bg-white bg-opacity-25 backdrop-blur-md rounded-2xl p-3 md:p-4 shadow-xl border border-white border-opacity-20 hover:bg-opacity-30 transition-all duration-300 hover:scale-105 hover:rotate-1">
                                    <Image
                                    width={100}
                                    height={100}
                                        src={earPlugs}
                                        alt="Ear plugs"
                                        className="w-16 md:w-20 lg:w-24 h-16 md:h-20 lg:h-24 object-contain rounded-xl"
                                    />
                                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        Ear-Plugs
                                    </div>
                                </div>
                            </div>
                            
                            {/* Bottom left - Pet Pool with enhanced styling */}
                            <div className="absolute bottom-0 left-0 group">
                                <div className="bg-white bg-opacity-25 backdrop-blur-md rounded-2xl p-3 md:p-4 shadow-xl border border-white border-opacity-20 hover:bg-opacity-30 transition-all duration-300 hover:scale-105 hover:rotate-1">
                                    <Image
                                    width={100}
                                    height={100}
                                        src={foodChopper}
                                        alt="Food chopper"
                                        className="w-16 md:w-20 lg:w-24 h-16 md:h-20 lg:h-24 object-contain rounded-xl"
                                    />
                                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        Food-Chopper
                                    </div>
                                </div>
                            </div>
                            
                            {/* Bottom right - Storage Box with enhanced styling */}
                            <div className="absolute bottom-0 right-0 group">
                                <div className="bg-white bg-opacity-25 backdrop-blur-md rounded-2xl p-3 md:p-4 shadow-xl border border-white border-opacity-20 hover:bg-opacity-30 transition-all duration-300 hover:scale-105 hover:rotate-1">
                                    {/* use next image for better performance */}
                                    <Image
                                    width={100}
                                    height={100}
                                        src={uno}
                                        alt="uno"
                                        className="w-16 md:w-20 lg:w-24 h-16 md:h-20 lg:h-24 object-contain rounded-xl"
                                    />
                                    
                                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        uno
                                    </div>
                                </div>
                            </div>
                            
                            {/* Enhanced connecting lines with glow effect */}
                            <div className="absolute top-16 md:top-20 left-1/2 w-0.5 h-16 md:h-20 bg-gradient-to-b from-white to-transparent opacity-40 transform -translate-x-1/2 shadow-lg"></div>
                            <div className="absolute bottom-16 md:bottom-20 left-6 md:left-8 w-12 md:w-16 h-0.5 bg-gradient-to-r from-white to-transparent opacity-40 shadow-lg"></div>
                            <div className="absolute bottom-16 md:bottom-20 right-6 md:right-8 w-12 md:w-16 h-0.5 bg-gradient-to-l from-white to-transparent opacity-40 shadow-lg"></div>
                        </div>
                    </div>
                    
                    {/* Right side - Enhanced content with better typography */}
                    <div className="absolute right-12 top-0 w-1/2 h-full flex flex-col justify-center items-end pr-6 md:pr-8 lg:pr-12">
                        <div className="text-right space-y-2 md:space-y-3">
                            {/* Sale badge */}
                            <div className="inline-block bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full border border-white border-opacity-30 mb-2">
                                <span className="text-white text-xs md:text-sm font-bold tracking-wide">LIMITED TIME OFFER</span>
                            </div>
                            
                            <div className="text-white text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold drop-shadow-2xl tracking-tight leading-tight">
                                Sale upto
                            </div>
                            <div className="relative">
                                <div className="text-white text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black drop-shadow-2xl leading-none">
                                    50% off
                                </div>
                                {/* Accent decoration */}
                                <div className="absolute -bottom-2 right-0 w-16 md:w-20 lg:w-24 h-1 bg-gradient-to-l from-orange-400 to-pink-400 rounded-full"></div>
                            </div>
                            <div className="text-purple-100 text-base md:text-lg lg:text-xl font-semibold mt-3 tracking-wide">
                                Health and Care Products
                            </div>
                            <div className="text-pink-100 text-sm md:text-base font-medium opacity-90 flex items-center justify-end space-x-2">
                                <span>Ear Plugs</span>
                                <span className="w-1 h-1 bg-pink-200 rounded-full"></span>
                                <span>Food Chopper</span>
                                <span className="w-1 h-1 bg-pink-200 rounded-full"></span>
                                <span>UNO Cards</span>
                            </div>
                        </div>
                        
                        {/* Enhanced shop now button */}
                        <Button 
                            onClick={()=>router.push("/products")}
                            className="mt-6 md:mt-8 w-40 md:w-44 lg:w-48 h-12 md:h-14 lg:h-16
                                      bg-gray-900 justify-center items-center 
                                      text-white text-sm md:text-base lg:text-lg font-bold
                                       hover:to-orange-700 shadow-2xl transform hover:scale-110 transition-all duration-300
                                      rounded-full border-2 border-white border-opacity-20 hover:border-opacity-40
                                      relative overflow-hidden group"
                        >
                            <span className="relative z-10 flex items-center space-x-2">
                                <span>Shop now</span>
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                                </svg>
                            </span>
                            {/* Button shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        </Button>
                    </div>
                    
                    {/* Enhanced decorative floating elements */}
                    <div className="absolute top-4 left-4 w-3 h-3 bg-white bg-opacity-30 rounded-full animate-pulse" style={{animationDelay: '0s'}}></div>
                    <div className="absolute top-8 right-4 w-2 h-2 bg-white bg-opacity-25 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                    <div className="absolute bottom-4 left-1/4 w-4 h-4 bg-white bg-opacity-20 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
                    <div className="absolute bottom-8 right-1/4 w-2 h-2 bg-white bg-opacity-30 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    <div className="absolute top-1/2 left-8 w-1 h-1 bg-pink-200 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
                    <div className="absolute top-1/4 right-8 w-1 h-1 bg-purple-200 rounded-full animate-ping" style={{animationDelay: '2.5s'}}></div>
                </div>
            </div>
        </div>
    )
}

export default BannerPromotion

