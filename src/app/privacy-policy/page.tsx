import { Metadata } from "next";
import Footer from "@/common/components/layouts/FooterMenu";
import HeaderBottom from "@/common/components/layouts/HeaderBottom";
import HeaderTop from "@/common/components/layouts/HeaderTop";
import Navigation from "@/common/components/layouts/Navigation";
import PrivacyPolicy from "@/components/PrivacyPolicy";

export const metadata: Metadata = {
    title: "Privacy Policy | Your Data Security - Lyalla & Lora",
  description: "We protect your data like it's our own. Learn how Lyalla & Lora collects, uses, and safeguards your personal information.",
  openGraph: {
    title: "Privacy Policy | Your Data Security - Lyalla & Lora",
    description: "Transparent about data: Read how we responsibly handle your personal information.",
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
            <PrivacyPolicy />
            <Footer />
        </>
    )
}
export default Page;