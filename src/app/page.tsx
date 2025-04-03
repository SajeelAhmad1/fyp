import { Metadata } from 'next'
import HeaderBottom from '@/common/components/layouts/HeaderBottom'
import HeaderTop from '@/common/components/layouts/HeaderTop'
import Footer from '@/common/components/layouts/Footer'
import Homepage from '../../modules/homepage'
import Navigation from '@/common/components/layouts/Navigation'

export const metadata: Metadata = {
  title: "Shop Premium Products Online | Lyalla and Lora",
  description: "Lyalla and Lora - The best online shopping destination for daily life use products. Enjoy fast shipping, easy returns, and exclusive deals on top deals.",
  openGraph: {
    title: "Shop Premium Products Online | Lyalla and Lora",
    description: "Lyalla and Lora - The best online shopping destination for daily life use products. Enjoy fast shipping, easy returns, and exclusive deals on top deals.",
    images: ["/images/cart-preview.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Home() {
  return (
    <main>
      <HeaderTop />
      <HeaderBottom />
      <Navigation />
      <Homepage />
      <Footer />
    </main>
  )
}
