
import React from "react";
import { HelpCircle, WhatsApp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SupportOption {
  label: string;
  phoneNumber: string;
  message: string;
  icon: React.ElementType;
}

const SupportButton = () => {
  const supportOptions: SupportOption[] = [
    {
      label: "Suporte Técnico",
      phoneNumber: "5571987648829",
      message: "Olá, preciso de suporte técnico para o sistema LeadConsig",
      icon: WhatsApp,
    },
    {
      label: "Dúvidas Comerciais",
      phoneNumber: "5571987648829",
      message: "Olá, tenho dúvidas comerciais sobre o LeadConsig",
      icon: WhatsApp,
    },
  ];

  const openWhatsApp = (phoneNumber: string, message: string) => {
    const formattedPhone = phoneNumber.replace(/\D/g, "");
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Suporte</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="end">
        <div className="p-3 border-b">
          <h3 className="font-medium">Como podemos ajudar?</h3>
          <p className="text-sm text-muted-foreground">Selecione uma opção abaixo</p>
        </div>
        <div className="p-2">
          {supportOptions.map((option, index) => (
            <button
              key={index}
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-100 rounded-md transition-colors"
              onClick={() => openWhatsApp(option.phoneNumber, option.message)}
            >
              <option.icon className="h-5 w-5 text-green-500" />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SupportButton;
