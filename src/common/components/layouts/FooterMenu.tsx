"use client";
import React, { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import jcbLogo from "@/assets/myImages/jcb.png";
import masterCard from "@/assets/myImages/master-card.jpeg";
import mastero from "@/assets/myImages/mastero.jpeg";
import gpay from "@/assets/myImages/gpay.png";
import paypal from "@/assets/myImages/paypal.jpeg";
import visa from "@/assets/myImages/visa.png";
import unionPay from "@/assets/myImages/union-pay.png";
import americanExpress from "@/assets/myImages/american-express.jpeg";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");
  const router = useRouter();

  const handleSubscribe = async (e: any) => {
    e.preventDefault();

    // Basic validation
    if (!email || !email.includes("@")) {
      setMessage("Please enter a valid email address");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(data.message || "Subscription successful!");
        setEmail("");
        toast.success("Subscribed to news letter!");
      } else {
        setStatus("error");
        setMessage(data.message || "Subscription failed. Please try again.");
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      setStatus("error");
      setMessage("Something went wrong. Please try again later.");
    }
  };

  return (
    <footer className="bg-gray-900 text-white py-8 md:py-16 mt-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Brand Column */}
          <div className="space-y-4 w-full lg:w-1/2 mb-8 lg:mb-0">
            <h2 className="text-2xl md:text-3xl font-semibold italic">
              eTrolly
            </h2>
            <p className="text-base md:text-lg">
              11 Murchison, <br />Glasgow, <br />United Kingdom
            </p>

            {/* Newsletter Section */}
            <div className="flex flex-col mt-6 max-w-md">
              <h3 className="mb-2 text-xl font-medium">
                Subscribe to Newsletter
              </h3>
              <form onSubmit={handleSubscribe} className="flex flex-col w-3/4">
                <div className="flex w-full">
                  <input
                    type="email"
                    placeholder="Email address"
                    className="flex-grow px-3 py-2 rounded-l-md focus:outline-none text-gray-800 text-sm md:text-base"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === "loading"}
                    required
                  />
                  <button
                    type="submit"
                    className={`${
                      status === "loading"
                        ? "bg-gray-500"
                        : "bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-300"
                    } text-white px-3 py-2 rounded-r-md flex items-center justify-center transition-colors`}
                    disabled={status === "loading"}
                  >
                    {status === "loading" ? (
                      <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                    ) : (
                      <Send size={20} />
                    )}
                  </button>
                </div>
                {message && (
                  <p
                    className={`text-sm mt-2 ${
                      status === "success" ? "text-green-300" : "text-red-300"
                    }`}
                  >
                    {message}
                  </p>
                )}
              </form>
            </div>
            {/* Social Media Icons */}
            <div className="flex space-x-3 pt-2">
              <a
                href="#"
                className="bg-black p-2 rounded-full hover:bg-gray-800 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              {/* Other social media icons remain the same */}
            </div>
          </div>

          {/* Links section - fully responsive */}
          <div className="w-full lg:w-2/3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4 lg:gap-12">
              {/* Company Column */}
              <div className="mb-6 sm:mb-0">
                <h3 className="text-lg font-semibold tracking-wider uppercase mb-3">
                  COMPANY
                </h3>
                <ul className="space-y-2">
                  <li>
                    <span
                      onClick={() => router.push("/about-us")}
                      className="text-sm md:text-base hover:text-[#F19B12] transition-colors cursor-pointer"
                    >
                      About Us
                    </span>
                  </li>
                  <li>
                    <span
                      onClick={() => router.push("/contact-us")}
                      className="text-sm md:text-base hover:text-[#F19B12] transition-colors cursor-pointer"
                    >
                      Contact
                    </span>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm md:text-base hover:text-[#F19B12] transition-colors"
                    >
                      Address
                    </a>
                  </li>
                </ul>
              </div>

              {/* Help Column */}
              <div className="mb-6 sm:mb-0">
                <h3 className="text-lg font-semibold tracking-wider uppercase mb-3">
                  Customer Service
                </h3>
                <ul className="space-y-2">
                  <li>
                    <span
                      onClick={() => router.push("/help")}
                      className="text-sm md:text-base hover:text-[#F19B12] transition-colors cursor-pointer"
                    >
                      Help
                    </span>
                  </li>
                  <li>
                    <span
                      onClick={() => router.push("/faqs")}
                      className="text-sm md:text-base hover:text-[#F19B12] transition-colors cursor-pointer"
                    >
                      FAQs
                    </span>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm md:text-base hover:text-[#F19B12] transition-colors"
                    >
                      Email
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm md:text-base hover:text-[#F19B12] transition-colors"
                    >
                      Phone Number
                    </a>
                  </li>
                </ul>
              </div>

              {/* FAQ Column */}
              <div>
                <h3 className="text-lg font-semibold tracking-wider uppercase mb-3">
                  Information
                </h3>
                <ul className="space-y-2">
                  <li>
                    <span
                      onClick={() => router.push("/terms-and-conditions")}
                      className="text-sm md:text-base hover:text-[#F19B12] transition-colors cursor-pointer"
                    >
                      Terms and Conditions
                    </span>
                  </li>
                  <li>
                    <span
                      onClick={() => router.push("/privacy-policy")}
                      className="text-sm md:text-base hover:text-[#F19B12] transition-colors cursor-pointer"
                    >
                      Privacy Policy
                    </span>
                  </li>
                  <li>
                    <span
                      onClick={() => router.push("/return-policy")}
                      className="text-sm md:text-base hover:text-[#F19B12] transition-colors cursor-pointer"
                    >
                      Return Policy
                    </span>
                  </li>
                  <li>
                    <span
                      onClick={() => router.push("/payment-methods")}
                      className="text-sm md:text-base hover:text-[#F19B12] transition-colors cursor-pointer"
                    >
                      Payment Methods
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods and Copyright */}
        <div className="mt-8 pt-6 border-t border-blue-400/30 flex flex-col md:flex-row md:justify-between items-center">
          <p className="text-xs sm:text-sm text-blue-100 mt-4 md:mt-0 text-center md:text-left">
            © 2025 eTrolly. All rights reserved.
          </p>

          {/* Payment Methods */}
          <div className="flex flex-wrap justify-center md:justify-end gap-2 mt-4 md:mt-0">
            <Image
              src={jcbLogo}
              alt="JCB logo"
              height={100}
              width={100}
              className="h-10 rounded w-16"
            />
            <Image
              src={paypal}
              alt="paypal logo"
              height={100}
              width={100}
              className="h-10 rounded w-16"
            />
            <Image
              src={unionPay}
              alt="union pay logo"
              height={100}
              width={100}
              className="h-10 rounded w-16"
            />
            <Image
              src={visa}
              alt="visa logo"
              height={100}
              width={100}
              className="h-10 rounded w-16"
            />
            <Image
              src={americanExpress}
              alt="american express logo"
              height={100}
              width={100}
              className="h-10 rounded w-16"
            />
            <Image
              src={masterCard}
              alt="master card logo"
              height={100}
              width={100}
              className="h-10 rounded w-16"
            />
            <Image
              src={mastero}
              alt="mastero logo"
              height={100}
              width={100}
              className="h-10 rounded w-16"
            />
            <Image
              src={gpay}
              alt="gpay logo"
              height={100}
              width={100}
              className="h-10 rounded w-16"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
