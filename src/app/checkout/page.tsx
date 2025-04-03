import type { Metadata } from "next";
import Footer from "@/common/components/layouts/FooterMenu";
import HeaderBottom from "@/common/components/layouts/HeaderBottom";
import HeaderTop from "@/common/components/layouts/HeaderTop";
import Navigation from "@/common/components/layouts/Navigation";
import CheckoutPage from "@/components/Checkout";

export const metadata: Metadata = {
    title: "Checkout - Lyalla and Lora",
    description: "Complete your purchase securely with Lyalla and Lora",
    openGraph: {
        title: "Checkout - Lyalla and Lora",
        description: "Complete your purchase securely",
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
            <CheckoutPage />
            <Footer />
        </>
    )
}
export default Page;