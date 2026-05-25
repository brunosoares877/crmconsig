
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const SalesHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm py-3 md:py-4 w-full">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 px-4 md:px-6">
        <div className="flex items-center">
          <h1 className="font-bold text-primary text-2xl md:text-3xl text-center sm:text-left">
            LeadConsig
          </h1>
        </div>
        <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => navigate("/login")} 
            className="border-primary text-primary hover:bg-primary hover:text-white text-sm md:text-base px-3 md:px-4 py-2 flex-1 sm:flex-none"
          >
            Entrar
          </Button>
          <Button 
            variant="blue" 
            onClick={() => navigate("/login")}
            className="text-sm md:text-base px-3 md:px-4 py-2 flex-1 sm:flex-none"
          >
            Criar Grátis
          </Button>
        </div>
      </div>
    </header>
  );
};

export default SalesHeader;
