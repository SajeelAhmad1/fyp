'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

// Define types for your API response data
interface SubCategory {
    id: string;
    name: string;
    description?: string;
    categoryId: string;
    createdAt: string;
    updatedAt: string;
}

interface Category {
    id: string;
    name: string;
    description?: string;
    subcategories: SubCategory[];
    createdAt: string;
    updatedAt: string;
}

// Type for the formatted data structure used in the component
interface FormattedCategory {
    name: string;
    link: string;
    subcategories: {
        name: string;
        link: string;
    }[];
}

const CategoryDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [categories, setCategories] = useState<FormattedCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dropdownTop, setDropdownTop] = useState(0);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/categories');

                if (!response.ok) {
                    throw new Error('Failed to fetch categories');
                }

                const data: Category[] = await response.json();

                // Transform the data to match the expected format for the dropdown
                const formattedCategories = data.map(category => ({
                    name: category.name,
                    link: `/products/${category.name.toLowerCase().replace(/\s+/g, '-')}`,
                    subcategories: category.subcategories.map(subcategory => ({
                        name: subcategory.name,
                        link: `/products/${category.name.toLowerCase().replace(/\s+/g, '-')}/${subcategory.name.toLowerCase().replace(/\s+/g, '-')}`
                    }))
                }));

                setCategories(formattedCategories);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Calculate dropdown position when opening
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const top = buttonRect.bottom;
            setDropdownTop(top);
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const dropdownContainer = document.getElementById('category-dropdown-container');

            if (dropdownContainer && !dropdownContainer.contains(target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div
            id="category-dropdown-container"
            className="relative flex justify-center md:justify-start"
        >
            <button
                ref={buttonRef}
                className="flex items-center gap-1 text-[#000000] font-inter font-medium text-[20px] leading-[150%] tracking-[0%] align-middle hover:text-amber-300 transition-colors px-3 py-6"
                onClick={toggleDropdown}
            >
                Catalog
                <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Change polygon points to show up/down arrow based on dropdown state */}
                    {isOpen ? (
                        <polygon points="12.5,9 5,18 20,18" fill="#FFFFFF" />
                    ) : (
                        <polygon points="12.5,18 5,9 20,9" fill="#FFFFFF" />
                    )}
                </svg>
            </button>

            {isOpen && (
                <div 
                    className="fixed left-0 right-0 w-full bg-white shadow-lg z-40 border-t border-gray-200"
                    style={{ top: `${dropdownTop}px` }}
                >
                    <div className="container mx-auto px-4 py-6">
                        {loading ? (
                            <div className="flex justify-center items-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
                            </div>
                        ) : error ? (
                            <div className="text-red-500 text-center py-4">
                                Failed to load categories. Please try again later.
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="text-gray-500 text-center py-4">
                                No categories found.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {categories.map((category, index) => (
                                    <div key={index} className="flex flex-col">
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                router.push(category.link);
                                                setIsOpen(false);
                                            }}
                                            className="font-semibold text-gray-800 hover:text-amber-500 mb-3 text-lg border-b border-gray-100 pb-2"
                                        >
                                            {category.name}
                                        </a>
                                        <ul className="space-y-2">
                                            {category.subcategories.map((subcategory, subIndex) => (
                                                <li key={subIndex}>
                                                    <a
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            router.push(subcategory.link);
                                                            setIsOpen(false);
                                                        }}
                                                        className="text-gray-600 hover:text-amber-500 text-sm block"
                                                    >
                                                        {subcategory.name}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default CategoryDropdown;