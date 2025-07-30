"use client";
import HeaderBottom from "@/common/components/layouts/HeaderBottom";
import HeaderTop from "@/common/components/layouts/HeaderTop";
import Footer from "@/common/components/layouts/Footer";
import Homepage from "../../modules/homepage";
import Navigation from "@/common/components/layouts/Navigation";

export default function Home() {
  return (
    <main>
      <HeaderTop />
      <HeaderBottom />
      <Navigation />
      <Homepage />
      <Footer />
    </main>
  );
}
