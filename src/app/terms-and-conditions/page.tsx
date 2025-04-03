import { Metadata } from "next";
import Footer from "@/common/components/layouts/FooterMenu";
import HeaderBottom from "@/common/components/layouts/HeaderBottom";
import HeaderTop from "@/common/components/layouts/HeaderTop";
import Navigation from "@/common/components/layouts/Navigation";
import TermsAndConditions from "@/components/TermsConditions";

export const metadata: Metadata = {
    title: "Terms and Conditions | Lyalla and Lora",
  description: "Review our Terms and Conditions to understand the rules and guidelines for using our services, including user responsibilities, privacy policies, and legal agreements.",
  openGraph: {
    title: "Terms and Conditions | Lyalla and Lora",
    description: "Review our Terms and Conditions to understand the rules and guidelines for using our services.",
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
        <TermsAndConditions/>
        <Footer/>
        </>
    )
}
export default Page;