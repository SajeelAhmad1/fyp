import { Metadata } from "next";
import PaymentSuccess from "@/components/PaymentSuccess";

export const metadata: Metadata = {
  title: "Payment Success | Lyalla and Lora",
  description:
    "Your payment has been confirmed for your order at Lyalla and Lora.",
  openGraph: {
    title: "FAQs | Lyalla and Lora",
    description:
      "Your payment has been confirmed for your order at Lyalla and Lora.",
    images: ["/images/cart-preview.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const Page = () => {
  return <PaymentSuccess />;
};
export default Page;
