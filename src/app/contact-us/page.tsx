import type { Metadata } from "next";
import Footer from "@/common/components/layouts/FooterMenu";
import HeaderBottom from "@/common/components/layouts/HeaderBottom";
import HeaderTop from "@/common/components/layouts/HeaderTop";
import Navigation from "@/common/components/layouts/Navigation";
import ContactUs from "@/common/components/Contact";

export const metadata: Metadata = {
  title: "Contact Us - Lyalla and Lora",
  description: "Contact with our team directly, if you have any query | Lyalla and Lora",
  openGraph: {
    title: "Contact Us - Lyalla and Lora",
    description: "Contact with our team directly, if you have any query | Lyalla and Lora",
    images: ["/path-to-about-us-image.jpg"],
  },
};

const Page = () => {
  return (
    <>
      <HeaderTop />
      <HeaderBottom />
      <Navigation />
      <ContactUs />
      <Footer />
    </>
  );
};

export default Page;