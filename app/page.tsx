"use client";

import HeroSection from "../components/HeroSection";
import Buttons from "../components/Buttons";
import Contact from '@/app/contact/page'
import Bot from '@/app/bot/page'

export default function Home() {
  const navigateTo = (url: string) => {
    window.open(url, "_blank");
  };

  const handleWhatsAppClick = () => {
    // Replace with your actual WhatsApp number
    window.open("https://wa.me/918495862494", "_blank");
  };



  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      
      <HeroSection onNavigate={navigateTo} />
      <Contact />
      <Bot />
      <Buttons onWhatsAppClick={handleWhatsAppClick} />
    </div>
  );
}