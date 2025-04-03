import type { Metadata } from "next";
import Footer from "@/common/components/layouts/FooterMenu";
import HeaderBottom from "@/common/components/layouts/HeaderBottom";
import HeaderTop from "@/common/components/layouts/HeaderTop";
import Navigation from "@/common/components/layouts/Navigation";
import AboutUs from "@/components/AboutUs";

// ✅ Define metadata (static)
export const metadata: Metadata = {
  title: "About Us - Lyalla and Lora", // Customize your title
  description: "Learn more about Lyalla and Lora and our story.", // Custom description
  openGraph: {
    title: "About Us - Lyalla and Lora",
    description: "Learn more about Lyalla and Lora and our story.",
    images: ["/path-to-about-us-image.jpg"], // Add OpenGraph image
  },
  // Add more metadata as needed (keywords, robots, etc.)
};

const Page = () => {
  return (
    <>
      <HeaderTop />
      <HeaderBottom />
      <Navigation />
      <AboutUs />
      <Footer />
    </>
  );
};

export default Page;