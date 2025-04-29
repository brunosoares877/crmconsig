
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const SalesHeader = () => {
  const navigate = useNavigate();
  
  return (
    <header className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-primary">LeadConsig</h1>
        </div>
        <div>
          <Button 
            variant="outline" 
            onClick={() => navigate("/login")}
            className="border-primary text-primary hover:bg-primary hover:text-white"
          >
            Entrar
          </Button>
        </div>
      </div>
    </header>
  );
};

export default SalesHeader;
