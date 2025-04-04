import { Metadata } from "next";
import Footer from "@/common/components/layouts/FooterMenu";
import HeaderBottom from "@/common/components/layouts/HeaderBottom";
import HeaderTop from "@/common/components/layouts/HeaderTop";
import Navigation from "@/common/components/layouts/Navigation";
import ChangePassword from "@/components/ChangePassword";

export const metadata: Metadata = {
    title: "Change Password - Lyalla and Lora",
    description: "Change password to keep your account secure!",
    openGraph: {
        title: "Change Password - Lyalla and Lora",
        description: "Change password to keep your account secure!",
        images: ["/images/cart-preview.jpg"],
    },
    robots: {
        index: true,
        follow: true,
    },
};

const Page = () =>{
    return (
        <>
        <HeaderTop/>
        <HeaderBottom/>
        <Navigation/>
        <ChangePassword/>
        <Footer/>
        </>
    )
}
export default Page;