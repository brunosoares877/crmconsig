import React from "react";
import { Button } from "@/components/ui/button";
interface WhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
  variant?: "floating" | "regular";
  label?: string;
  className?: string;
}
const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber,
  message = "Olá, gostaria de mais informações",
  variant = "regular",
  label = "WhatsApp",
  className = ""
}) => {
  // Format phone number (remove spaces, dashes, etc.)
  const formattedPhone = phoneNumber.replace(/\D/g, "");

  // Create WhatsApp URL
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  if (variant === "floating") {
    return <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={`fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg flex items-center justify-center transition-transform hover:scale-110 ${className}`} aria-label="Contact on WhatsApp">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
          <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.88 11.94L4 20l4.06-1.17A7.93 7.93 0 0 0 20 12.05a7.83 7.83 0 0 0-2.4-5.73Zm-5.55 12.2a6.6 6.6 0 0 1-3.36-.92l-.24-.15-2.5.72.74-2.5-.14-.24a6.6 6.6 0 0 1-1.01-3.49 6.59 6.59 0 0 1 6.6-6.59c1.76 0 3.42.69 4.67 1.94a6.59 6.59 0 0 1 1.94 4.67 6.59 6.59 0 0 1-6.59 6.56Zm3.63-4.94c-.2-.1-1.17-.58-1.36-.64-.18-.07-.32-.1-.45.1-.13.2-.5.64-.62.77-.11.13-.23.15-.43.05a5.44 5.44 0 0 1-2.7-2.33c-.2-.35.21-.33.58-1.08a.36.36 0 0 0-.03-.34c-.05-.1-.45-1.07-.62-1.47-.16-.38-.32-.33-.45-.34h-.38c-.13 0-.35.05-.53.25-.18.2-.7.7-.7 1.69 0 1 .72 1.95.81 2.08.1.13 1.37 2.08 3.3 2.92.46.2.82.32 1.1.4.46.15.88.13 1.21.08.37-.06 1.17-.48 1.33-.94.16-.46.16-.86.11-.94-.05-.08-.18-.13-.38-.23Z" />
        </svg>
      </a>;
  }
  return <Button asChild className={className}>
      
    </Button>;
};
export default WhatsAppButton;