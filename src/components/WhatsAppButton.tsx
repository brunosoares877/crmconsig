
import React from "react";
import { WhatsApp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
  variant?: "floating" | "regular";
  label?: string;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber,
  message = "Olá, gostaria de mais informações",
  variant = "regular",
  label = "WhatsApp"
}) => {
  // Format phone number (remove spaces, dashes, etc.)
  const formattedPhone = phoneNumber.replace(/\D/g, "");
  
  // Create WhatsApp URL
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  
  if (variant === "floating") {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg flex items-center justify-center transition-transform hover:scale-110"
        aria-label="Contact on WhatsApp"
      >
        <WhatsApp size={28} />
      </a>
    );
  }
  
  return (
    <Button
      as="a"
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-green-500 hover:bg-green-600 text-white transition-colors flex items-center gap-2"
    >
      <WhatsApp className="h-5 w-5" />
      <span>{label}</span>
    </Button>
  );
};

export default WhatsAppButton;
