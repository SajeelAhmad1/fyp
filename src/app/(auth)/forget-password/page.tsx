'use client'
import ForgetPassword from "@/components/ForgetPassword";
import { useEffect } from "react";

const Page = () => {
  useEffect(() => {
    document.title = "Forget Password - Lyalla and Lora";
    const metaDescription = document.querySelector("meta[name='description']");
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Forget your password? Do not worry!"
      );
    } else {
      const newMetaDescription = document.createElement("meta");
      newMetaDescription.name = "description";
      newMetaDescription.content = "Forget your password? Do not worry!";
      document.head.appendChild(newMetaDescription);
    }
  }, []);
  return <ForgetPassword />;
};

export default Page;
