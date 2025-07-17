'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

interface NavItem {
    name: string;
    icon: React.ReactNode;
    onClick: (e: React.MouseEvent) => void;
    count: number | null;
    tooltip: string;
    dropdownItems?: Array<{
        name: string;
        onClick: () => void;
    }>;
}

const CartSection: React.FC = () => {
    const router = useRouter();
    const { data: session } = useSession();
    const [cartCount, setCartCount] = useState<number>(0);
    const [wishlistCount, setWishlistCount] = useState<number>(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [activeTooltip, setActiveTooltip] = useState<number | null>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Fetch counts from API when session or component changes
    useEffect(() => {
        const fetchCounts = async () => {
            if (session) {
                try {
                    // Fetch cart count
                    const cartResponse = await fetch('/api/cart/count');
                    if (cartResponse.ok) {
                        const cartData = await cartResponse.json();
                        setCartCount(cartData.count);
                    }

                    // Fetch wishlist count
                    const wishlistResponse = await fetch('/api/wishlist/count');
                    if (wishlistResponse.ok) {
                        const wishlistData = await wishlistResponse.json();
                        setWishlistCount(wishlistData.count);
                    }
                } catch (error) {
                    throw new Error('Failed to fetch counts');
                }
            }
        };

        fetchCounts();
    }, [session]);

    const toggleDropdown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Simple logout function using next-auth signOut
    const handleLogout = () => {
        signOut({ redirect: true, callbackUrl: '/login' });
    };

    const navItems: NavItem[] = [
        {
            name: session ? "Wishlist" : "Sign in",
            tooltip: session ? "View your wishlist" : "Sign in to your account",
            icon: (
                <svg width="25" height="25" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.4094 20.81C13.0694 20.93 12.5094 20.93 12.1694 20.81C9.26943 19.82 2.78943 15.69 2.78943 8.69001C2.78943 5.60001 5.27943 3.10001 8.34943 3.10001C10.1694 3.10001 11.7794 3.98001 12.7894 5.34001C13.7994 3.98001 15.4194 3.10001 17.2294 3.10001C20.2994 3.10001 22.7894 5.60001 22.7894 8.69001C22.7894 15.69 16.3094 19.82 13.4094 20.81Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            onClick: (e: React.MouseEvent) => router.push(session ? "/account/wishlist" : "/login"),
            count: session ? wishlistCount : null
        },
        {
            name: "Cart",
            tooltip: "View your shopping cart",
            icon: (
                <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.99995 2H3.73996C4.81996 2 5.66996 2.93 5.57996 4L4.74995 13.96C4.60995 15.59 5.89995 16.99 7.53995 16.99H18.19C19.63 16.99 20.89 15.81 21 14.38L21.5399 6.88C21.6599 5.22 20.3999 3.87 18.7299 3.87H5.81996" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16.25 22C16.9403 22 17.5 21.4404 17.5 20.75C17.5 20.0596 16.9403 19.5 16.25 19.5C15.5596 19.5 15 20.0596 15 20.75C15 21.4404 15.5596 22 16.25 22Z" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8.24995 22C8.94031 22 9.49995 21.4404 9.49995 20.75C9.49995 20.0596 8.94031 19.5 8.24995 19.5C7.5596 19.5 6.99995 20.0596 6.99995 20.75C6.99995 21.4404 7.5596 22 8.24995 22Z" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8.99995 8H21" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            onClick: (e: React.MouseEvent) => router.push("/cart"),
            count: session ? cartCount : null
        },
        {
            name: "Orders",
            tooltip: "View your order history",
            icon: (
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    <path d="M7 7H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M7 11H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M7 15H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="17" cy="17" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    <path d="M17 15V17H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            ),
            onClick: (e: React.MouseEvent) => router.push("/orders"),
            count: null
        },
        // Profile item with dropdown
        {
            name: session ? "Account" : "Sign in",
            tooltip: session ? "Manage your account" : "Sign in to your account",
            icon: (
                <svg width="25" height="25" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.7894 12C15.5509 12 17.7894 9.76142 17.7894 7C17.7894 4.23858 15.5509 2 12.7894 2C10.028 2 7.78943 4.23858 7.78943 7C7.78943 9.76142 10.028 12 12.7894 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21.3794 22C21.3794 18.13 17.5294 15 12.7894 15C8.04943 15 4.19943 18.13 4.19943 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            onClick: session ? toggleDropdown : (e: React.MouseEvent) => router.push("/login"),
            count: null,
            dropdownItems: session ? [
                {
                    name: "Account",
                    onClick: () => router.push("/account")
                },
                {
                    name: "Orders",
                    onClick: () => router.push("/orders")
                },
                {
                    name: "Browsing History",
                    onClick: () => router.push("/account/history")
                },
                // Add the Logout option
                {
                    name: "Logout",
                    onClick: handleLogout
                }
            ] : undefined
        },
    ];

    return (
        <div className="flex items-center justify-end space-x-4">
            {navItems.map((item, index) => (
                <div key={index} className="relative">
                    <button
                        onClick={item.onClick}
                        onMouseEnter={() => setActiveTooltip(index)}
                        onMouseLeave={() => setActiveTooltip(null)}
                        className={`relative px-2 py-2  hover:text-blue-100 transition-colors duration-200 ${isDropdownOpen && index === navItems.length - 1 ? 'text-blue-100' : ''}`}
                    >
                        {/* Icon Container */}
                        <div className="relative inline-block" style={{ width: '25px', height: '25px' }}>
                            {item.icon}

                            {/* Count Badge */}
                            {typeof item.count === "number" && item.count > 0 && (
                                <div
                                    className="absolute bg-white text-black text-xs font-medium rounded-full flex items-center justify-center shadow-md"
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        top: '-6px',
                                        right: '-6px',
                                        zIndex: 10
                                    }}
                                >
                                    {item.count}
                                </div>
                            )}
                        </div>

                        {/* Text Label */}
                        <span className="ml-2 text-sm font-medium hidden sm:inline-block">{item.name}</span>
                        
                        {/* Tooltip */}
                        {activeTooltip === index && (
                            <div 
                                className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50 shadow-lg"
                                style={{ minWidth: 'max-content' }}
                            >
                                <div className="absolute left-1/2 transform -translate-x-1/2 top-full border-4 border-transparent border-t-gray-900"></div>
                                {item.tooltip}
                            </div>
                        )}
                    </button>

                    {/* Dropdown for Account */}
                    {index === navItems.length - 1 && item.dropdownItems && isDropdownOpen && (
                        <div
                            ref={dropdownRef}
                            className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-2 z-50 border border-gray-200"
                            style={{ minWidth: '200px' }}
                        >
                            <div className="px-4 py-2 border-b border-gray-100">
                                <p className="text-md font-semibold text-gray-800">My Account</p>
                                <p className="text-sm font-semibold text-gray-500 py-1">{session?.user.email}</p>
                            </div>
                            {item.dropdownItems.map((dropdownItem, dropdownIndex) => (
                                <button
                                    key={dropdownIndex}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsDropdownOpen(false);
                                        dropdownItem.onClick();
                                    }}
                                    className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                                >
                                    {dropdownItem.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default CartSection;