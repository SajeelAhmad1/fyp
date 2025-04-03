import { Metadata } from 'next'
import Footer from '@/common/components/layouts/Footer'
import HeaderBottom from '@/common/components/layouts/HeaderBottom'
import HeaderTop from '@/common/components/layouts/HeaderTop'
import ProductDetails from '../../../../modules/products/components/ProductDetails'
import React from 'react'
import Navigation from '@/common/components/layouts/Navigation'
import Recommendations from '../../../../modules/products/components/Recommendations'

export const metadata: Metadata = {
    title: "Product Details | Lyalla and Lora",
  description: "View detailed information about our product including specifications, pricing, and customer reviews.",
  openGraph: {
    title: "Product Details | Lyalla and Lora",
    description: "View detailed information about our product including specifications, pricing, and customer reviews.",
        images: ["/images/cart-preview.jpg"],
    },
    robots: {
        index: true,
        follow: true,
    },
};

const ProductDetail = () => {
    return (
        <main className="bg-white">
            <HeaderTop />
            <HeaderBottom />
            <Navigation/>
            <ProductDetails />
            <Recommendations/>
            <Footer />
        </main>
    )
}

export default ProductDetail