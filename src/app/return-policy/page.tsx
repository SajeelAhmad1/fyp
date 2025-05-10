import { Metadata } from "next";
import Footer from "@/common/components/layouts/FooterMenu";
import HeaderBottom from "@/common/components/layouts/HeaderBottom";
import HeaderTop from "@/common/components/layouts/HeaderTop";
import Navigation from "@/common/components/layouts/Navigation";
import ReturnPolicy from "@/components/ReturnPolicy";

export const metadata: Metadata = {
    title: "Return Policy | Lyalla and Lora",
    description: "Lyalla and Lora's return policy: 14-day returns on most items. Learn how to return or exchange products, get refunds, and our policies on faulty items.",
    openGraph: {
        title: "Return Policy | Lyalla and Lora",
        description: "Our customer-friendly return policy: 14 days to return most items. Information on returns, refunds, and exchanges for UK customers.",
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
      <ReturnPolicy />
      <Footer />
    </>
  );
};
export default Page;
