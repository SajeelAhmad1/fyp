import type { Metadata } from "next"; 
import Footer from "@/common/components/layouts/FooterMenu";
import HeaderBottom from "@/common/components/layouts/HeaderBottom";
import HeaderTop from "@/common/components/layouts/HeaderTop";
import Navigation from "@/common/components/layouts/Navigation";
import CartDisplay from "@/components/Cart";

export const metadata: Metadata = {
  title: "Cart - Lyalla and Lora",
  description: "Review and manage items in your shopping cart.",
  openGraph: {
    title: "Cart - Lyalla and Lora",
    description: "Review and manage items in your shopping cart.",
    images: ["/images/cart-preview.jpg"], 
  },
  robots: {
    index: true, 
    follow: true,
  },
};

const Page = () => {
  return (
    <>
      <HeaderTop />
      <HeaderBottom />
      <Navigation />
      <CartDisplay />
      <Footer />
    </>
  );
};

export default Page;