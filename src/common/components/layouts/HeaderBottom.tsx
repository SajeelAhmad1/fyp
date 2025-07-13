'use client'

import React, { useState } from 'react'
import SearchSection from './SearchSection'
import { useRouter } from 'next/navigation'
import CartSection from '@/common/components/layouts/CartSection'
import CategoryDropdown from './CategoryDropdown'
import { Menu, X, Search } from 'lucide-react'

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
    <header className="bg-[#205781] w-full top-4 left-0 z-50">
      <div className="px-8 mx-auto">
        {/* Main header layout */}
        <div className="flex items-center justify-between py-2">
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              router.push('/');
            }}
            className="flex-shrink-0"
          >
            <p className='font-bold text-[36px] text-[#ffffff]'>
            Lyalla & Lora
            </p>
            {/* <Image src={"/logo"} alt="Logo" width={500} height={500} className="h-16 w-16 md:h-24 md:w-24" /> */}
          </a>

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
              className="p-2 text-white focus:outline-none"
              onClick={toggleSearch}
            >
              <Search size={24} />
            </button>
            <button
              className="p-2 text-white focus:outline-none"
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