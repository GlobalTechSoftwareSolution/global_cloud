"use client";

import HeroSection from "../components/HeroSection";
import Buttons from "../components/Buttons";
import Contact from '@/app/contact/page'

export default function Home() {
  const navigateTo = (url: string) => {
    window.open(url, "_blank");
  };

  const handleWhatsAppClick = () => {
    // Replace with your actual WhatsApp number
    window.open("https://wa.me/918495862494", "_blank");
  };

  const handleChatBotClick = () => {
    // Replace with your actual chatbot link
    window.open("https://your-chatbot-link.com", "_blank");
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      
      <HeroSection onNavigate={navigateTo} />
      <Contact />
      <Buttons onWhatsAppClick={handleWhatsAppClick} onChatBotClick={handleChatBotClick} />
    </div>
  );
}