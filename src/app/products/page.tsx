// "use client"
import { Metadata } from 'next'
import HeaderBottom from '@/common/components/layouts/HeaderBottom'
import HeaderTop from '@/common/components/layouts/HeaderTop'
import Footer from '@/common/components/layouts/Footer'
import { Broadcum } from '@/common/components/layouts/Broadcrum'
import Products from '../../../modules/products'
import Navigation from '@/common/components/layouts/Navigation'

export const metadata: Metadata = {
    title: "Shop Trendy Styles | Lyalla & Lora Fashion Collection",
  description: "Discover handpicked fashion essentials at Lyalla & Lora. New arrivals weekly!",
  openGraph: {
    title: "Must-Have Trendy Pieces | Lyalla & Lora",
    description: "Curated collection of stylish, comfortable fashion for every occasion. Shop now!",
        images: ["/images/cart-preview.jpg"],
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function CategoriesPage() {
    return (
        <main className="bg-white">
            <HeaderTop />
            <HeaderBottom />
            <Navigation/>
            <Products />
            <Footer />
        </main>
    )
}
