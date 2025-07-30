"use client"
import React from 'react'
import { useRouter } from 'next/navigation'

const Navigation = () => {
    const router = useRouter();
    return (
        <div className="bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-300 px-8 justify-between h-12 m-auto hidden lg:flex md:flex items-center">
            <div className=''>
                <div className='flex gap-8 text-[#ffffff]'>
                    <div
                    className='cursor-pointer'
                    onClick={()=>router.push("/products")}
                    >
                        All Categories
                    </div>
                    <div
                    className='cursor-pointer'
                    onClick={()=>router.push("/about-us")}
                    >
                        About Us
                    </div>
                    <div
                    className='cursor-pointer'
                    onClick={()=>router.push("/contact")}
                    >
                        Contact
                    </div>
                    <div
                    className='cursor-pointer'
                    onClick={()=>router.push("/privacy-policy")}
                    >
                        Privacy Policy
                    </div>
                    <div
                    className='cursor-pointer'
                    onClick={()=>router.push("/terms-and-conditions")}
                    >
                        Terms and Conditions
                    </div>
                </div>
            </div>
            <div className="flex gap-4 text-[#ffffff]">
                <div className='flex items-center space-x-2'>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
                        <line x1="12" y1="8" x2="12" y2="8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        <line x1="12" y1="11" x2="12" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span>Need Help</span>
                </div>
                <div className='flex items-center  space-x-1'>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.6 3C5.7 3 4.8 3.4 4.1 4.1C3.1 5.1 3 6.5 3.5 7.7C5.1 11.4 8.6 14.9 12.3 16.5C13.5 17 14.9 16.9 15.9 15.9C16.6 15.2 17 14.3 17 13.4C17 13 16.8 12.7 16.4 12.5L13.4 10.8C13.2 10.7 12.9 10.7 12.7 10.9L11.4 12.1C9.7 11.4 8.1 9.8 7.4 8.1L8.7 6.8C8.9 6.6 8.9 6.3 8.8 6.1L7.1 3.1C6.9 2.7 6.7 2.5 6.3 2.5C6.4 2.5 6.6 3 6.6 3Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>+447426109939</span>
                </div>
                
            </div>

        </div>
    )
}

export default Navigation