import type { Metadata } from "next";
import Footer from "@/common/components/layouts/FooterMenu";
import HeaderBottom from "@/common/components/layouts/HeaderBottom";
import HeaderTop from "@/common/components/layouts/HeaderTop";
import Navigation from "@/common/components/layouts/Navigation";
import Help from "@/common/components/Help";

export const metadata: Metadata = {
  title: "Help - Lyalla and Lora",
  description: "Need help? Check this out or contact our team directly, if you have any query | Lyalla and Lora",
  openGraph: {
    title: "Help - Lyalla and Lora",
    description: "Need help? Check this out or contact our team directly, if you have any query | Lyalla and Lora",
    images: ["/path-to-about-us-image.jpg"],
  },
};

const Page = () => {
  return (
    <>
      <HeaderTop />
      <HeaderBottom />
      <Navigation />
      <Help />
      <Footer />
    </>
  );
};

export default Page;