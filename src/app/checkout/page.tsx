'use client'
// import type { Metadata } from "next";
import Footer from "@/common/components/layouts/FooterMenu";
import HeaderBottom from "@/common/components/layouts/HeaderBottom";
import HeaderTop from "@/common/components/layouts/HeaderTop";
import Navigation from "@/common/components/layouts/Navigation";
import { useState } from "react";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { CheckoutPayment } from "@/components/checkout/CheckoutPayment";
// export const metadata: Metadata = {
//     title: "Checkout - Lyalla and Lora",
//     description: "Complete your purchase securely with Lyalla and Lora",
//     openGraph: {
//         title: "Checkout - Lyalla and Lora",
//         description: "Complete your purchase securely",
//         images: ["/images/cart-preview.jpg"],
//     },
//     robots: {
//         index: true,
//         follow: true,
//     },
// };

const Page = () => {
    const [step, setStep] = useState<"form" | "payment">("form");
  const [checkoutData, setCheckoutData] = useState<any>(null);

  const handleFormSubmit = (formData: any) => {
    setCheckoutData(formData);
    setStep("payment");
  };

  const handleBack = () => {
    setStep("form");
  };
    return (
        <>
            <HeaderTop />
            <HeaderBottom />
            <Navigation />
            <div>
      {step === "form" ? (
        <CheckoutForm onSubmit={handleFormSubmit} />
      ) : (
        <CheckoutPayment 
          checkoutData={checkoutData} 
          onBack={handleBack} 
        />
      )}
    </div>
            <Footer />
        </>
    )
}
export default Page;