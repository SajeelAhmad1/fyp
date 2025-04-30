// import { Metadata } from 'next'
// import Footer from '@/common/components/layouts/Footer'
// import HeaderBottom from '@/common/components/layouts/HeaderBottom'
// import HeaderTop from '@/common/components/layouts/HeaderTop'
// import ProductDetails from '../../../../modules/products/components/ProductDetails'
// import React from 'react'
// import Navigation from '@/common/components/layouts/Navigation'
// import Recommendations from '../../../../modules/products/components/Recommendations'

// export const metadata: Metadata = {
//     title: "Product Details | Lyalla and Lora",
//     description: "View detailed information about our product including specifications, pricing, and customer reviews.",
//     openGraph: {
//         title: "Product Details | Lyalla and Lora",
//         description: "View detailed information about our product including specifications, pricing, and customer reviews.",
//         images: ["/images/cart-preview.jpg"],
//     },
//     robots: {
//         index: true,
//         follow: true,
//     },
// };

// const ProductDetail = () => {
//     return (
//         <main className="bg-white">
//             <HeaderTop />
//             <HeaderBottom />
//             <Navigation />
//             <ProductDetails />
//             <Recommendations />
//             <Footer />
//         </main>
//     )
// }

// export default ProductDetail

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma' // You'll need to create this prisma client
import Footer from '@/common/components/layouts/Footer'
import HeaderBottom from '@/common/components/layouts/HeaderBottom'
import HeaderTop from '@/common/components/layouts/HeaderTop'
import ProductDetails from '../../../../modules/products/components/ProductDetails'
import React from 'react'
import Navigation from '@/common/components/layouts/Navigation'
import Recommendations from '../../../../modules/products/components/Recommendations'

// Define the params type for generateMetadata
type Props = {
  params: {
    id: string
  }
}

// Generate metadata function
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Fetch product from database
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: params.id
      }
    })

    if (!product) {
      return {
        title: 'Product Not Found | Lyalla and Lora',
        description: 'The requested product could not be found.',
      }
    }

    return {
      title: `${product.name} | Lyalla and Lora`,
      description: product.shortDescription || "View detailed information about our product including specifications, pricing, and customer reviews.",
      openGraph: {
        title: `${product.name} | Lyalla and Lora`,
        description: product.shortDescription || "View detailed information about our product including specifications, pricing, and customer reviews.",
        images: product.images.length > 0 ? [product.images[0]] : ["/images/cart-preview.jpg"],
      },
      robots: {
        index: true,
        follow: true,
      },
    }
  } catch (error) {
    console.error("Error fetching product for metadata:", error)
    return {
      title: "Product Details | Lyalla and Lora",
      description: "View detailed information about our product including specifications, pricing, and customer reviews.",
    }
  }
}

// Create a new ProductDetail component for dynamic routes
const ProductDetail = async ({ params }: Props) => {
  try {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: {
        id: params.id
      }
    })

    if (!product) {
      notFound()
    }

    return (
      <main className="bg-white">
        <HeaderTop />
        <HeaderBottom />
        <Navigation />
        <ProductDetails />
        <Recommendations />
        <Footer />
      </main>
    )
  } catch (error) {
    console.error("Error in ProductDetail:", error)
    notFound()
  }
}

export default ProductDetail