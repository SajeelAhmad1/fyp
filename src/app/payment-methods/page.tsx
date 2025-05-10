import { Metadata } from "next";
import Footer from "@/common/components/layouts/FooterMenu";
import HeaderBottom from "@/common/components/layouts/HeaderBottom";
import HeaderTop from "@/common/components/layouts/HeaderTop";
import Navigation from "@/common/components/layouts/Navigation";
import PaymentMethods from "@/components/PaymentMethods";

export const metadata: Metadata = {
  title: "Payment Methods | Lyalla and Lora",
  description:
    "Secure payment options at Lyalla and Lora - We accept Visa, Mastercard, American Express, PayPal, and more. All transactions are encrypted for your safety.",
  openGraph: {
    title: "Payment Methods | Lyalla and Lora",
    description:
      "Shop with confidence using our secure payment options including credit cards and PayPal. All transactions are encrypted for your protection.",
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
      <PaymentMethods />
      <Footer />
    </>
  );
};
export default Page;
