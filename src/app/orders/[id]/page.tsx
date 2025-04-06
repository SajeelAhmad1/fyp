import { Metadata } from "next";
import HeaderBottom from "@/common/components/layouts/HeaderBottom";
import HeaderTop from "@/common/components/layouts/HeaderTop";
import Navigation from "@/common/components/layouts/Navigation";
import Footer from "@/common/components/layouts/FooterMenu";
import OrderConfirmationPage from "@/components/Order";

export const metadata: Metadata = {
    title: "Order Details - Lyalla and Lora",
    description: "View your order, track shipments, and manage purchases effortlessly. Your stylish finds are just a click away!",
    openGraph: {
        title: "Order Details - Lyalla and Lora",
        description: "Lost track of your order? Check status, delivery dates, and reorder favorites in seconds.",
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
            <OrderConfirmationPage />
            <Footer/>
        </>
    )
}
export default Page;