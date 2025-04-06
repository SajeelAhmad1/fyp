import { Metadata } from "next";
import HeaderBottom from "@/common/components/layouts/HeaderBottom";
import HeaderTop from "@/common/components/layouts/HeaderTop";
import Navigation from "@/common/components/layouts/Navigation";
import Account from "@/components/Account"
import Orders from "@/components/Orders";
import Footer from "@/common/components/layouts/FooterMenu";

export const metadata: Metadata = {
    title: "Orders - Lyalla and Lora",
    description: "View your order history, track shipments, and manage purchases effortlessly. Your stylish finds are just a click away!",
    openGraph: {
        title: "Orders - Lyalla and Lora",
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
            <Orders />
            <Footer/>
        </>
    )
}
export default Page;