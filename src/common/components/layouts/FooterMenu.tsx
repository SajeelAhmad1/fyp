"use client";
import React, { useState } from "react";
import { Send, Shield, Lock, Truck, RotateCcw, Award, CheckCircle } from "lucide-react";
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

  // Trust badges data
  const trustBadges = [
    {
      icon: Shield,
      title: "Secure Shopping",
      description: "256-bit SSL encryption"
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Free shipping on orders over £90"
    },
    {
      icon: RotateCcw,
      title: "Easy Returns",
      description: "24-hours return policy"
    },
    {
      icon: CheckCircle,
      title: "Verified Store",
      description: "Trusted by thousands"
    }
  ];

  return (
    <footer className="bg-gray-900 text-white mt-12">
      {/* Trust Badges Section */}
      <div className="bg-gray-800 py-8 border-b border-gray-700">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map((badge, index) => {
              const IconComponent = badge.icon;
              return (
                <div key={index} className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-300 p-2 rounded-full flex-shrink-0">
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-white">
                      {badge.title}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {badge.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Company</h3>
              <ul className="space-y-3">
                <li>
                  <span
                    onClick={() => router.push("/about-us")}
                    className="text-gray-300 hover:text-white cursor-pointer transition-colors"
                  >
                    About Us
                  </span>
                </li>
                <li>
                  <span
                    onClick={() => router.push("/contact")}
                    className="text-gray-300 hover:text-white cursor-pointer transition-colors"
                  >
                    Contact
                  </span>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Customer Service</h3>
              <ul className="space-y-3">
                <li>
                  <div className="text-gray-300 hover:text-white transition-colors">
                    etrolly.shop.co.uk@gmail.com
                  </div>
                </li>
                <li>
                  <div className="text-gray-300 hover:text-white transition-colors">
                    +447426109939
                  </div>
                </li>
              </ul>
            </div>

            {/* Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Information</h3>
              <ul className="space-y-3">
                <li>
                  <span
                    onClick={() => router.push("/terms-and-conditions")}
                    className="text-gray-300 hover:text-white cursor-pointer transition-colors"
                  >
                    Terms and Conditions
                  </span>
                </li>
                <li>
                  <span
                    onClick={() => router.push("/privacy-policy")}
                    className="text-gray-300 hover:text-white cursor-pointer transition-colors"
                  >
                    Privacy Policy
                  </span>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Stay Connected</h3>
              <p className="text-gray-300 mb-4 text-sm">
                Subscribe to get updates on new products and offers
              </p>
              <form onSubmit={handleSubscribe} className="mb-4">
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-l-md focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === "loading"}
                    required
                  />
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-r-md flex items-center justify-center transition-colors ${
                      status === "loading"
                        ? "bg-gray-600"
                        : "bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-300"
                    }`}
                    disabled={status === "loading"}
                  >
                    {status === "loading" ? (
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </div>
                {message && (
                  <p
                    className={`text-xs mt-2 ${
                      status === "success" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {message}
                  </p>
                )}
              </form>

              {/* Social Media */}
              <div className="flex space-x-3">
                <a
                  href="https://www.instagram.com/etrolly.shop/"
                  className="bg-gray-700 p-2 rounded hover:bg-gray-600 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="white"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-gray-800 py-6 border-t border-gray-700">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Company Address */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2 text-white">eTrolly</h2>
            <p className="text-gray-300 text-sm">
              Friday Mall Ltd. • 11 Murchison, Glasgow, United Kingdom
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 mb-6">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">SSL Secured</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-300">Verified Business</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">5000+ Happy Customers</span>
            </div>
          </div>

          {/* Payment Methods and Copyright */}
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400 mb-4 md:mb-0">
              © 2025 eTrolly. All rights reserved.
            </p>

            {/* Payment Methods */}
            <div className="flex flex-wrap justify-center gap-2">
              <Image
                src={visa}
                alt="Visa"
                height={24}
                width={38}
                className="h-6 w-auto bg-white rounded px-1"
              />
              <Image
                src={masterCard}
                alt="Mastercard"
                height={24}
                width={38}
                className="h-6 w-auto bg-white rounded px-1"
              />
              <Image
                src={americanExpress}
                alt="American Express"
                height={24}
                width={38}
                className="h-6 w-auto bg-white rounded px-1"
              />
              <Image
                src={paypal}
                alt="PayPal"
                height={24}
                width={38}
                className="h-6 w-auto bg-white rounded px-1"
              />
              <Image
                src={gpay}
                alt="Google Pay"
                height={24}
                width={38}
                className="h-6 w-auto bg-white rounded px-1"
              />
              <Image
                src={jcbLogo}
                alt="JCB"
                height={24}
                width={38}
                className="h-6 w-auto bg-white rounded px-1"
              />
              <Image
                src={unionPay}
                alt="UnionPay"
                height={24}
                width={38}
                className="h-6 w-auto bg-white rounded px-1"
              />
              <Image
                src={mastero}
                alt="Maestro"
                height={24}
                width={38}
                className="h-6 w-auto bg-white rounded px-1"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;