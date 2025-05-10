import { Metadata } from "next";
import Footer from "@/common/components/layouts/FooterMenu";
import HeaderBottom from "@/common/components/layouts/HeaderBottom";
import HeaderTop from "@/common/components/layouts/HeaderTop";
import Navigation from "@/common/components/layouts/Navigation";
import FAQ from "@/components/FAQs";

export const metadata: Metadata = {
    title: "FAQs | Lyalla and Lora",
    description: "Find answers to common questions about payments, shipping, returns, and more. Our comprehensive FAQ helps you shop with confidence at Lyalla and Lora.",
    openGraph: {
        title: "FAQs | Lyalla and Lora",
        description: "Get quick answers to your questions about orders, shipping, returns, and customer support at Lyalla and Lora.",
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
      <FAQ />
      <Footer />
    </>
  );
};
export default Page;
