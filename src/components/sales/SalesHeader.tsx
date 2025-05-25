import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
const SalesHeader = () => {
  const navigate = useNavigate();
  return <header className="bg-white shadow-sm py-4">
      <div className="container mx-auto flex justify-between items-center py-0 px-[7px]">
        <div className="flex items-center">
          <h1 className="font-bold text-primary mx-[55px] my-[6px] py-0 px-[17px] text-3xl">LeadConsig</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate("/login")} className="border-primary text-primary hover:bg-primary hover:text-white">
            Entrar
          </Button>
          <Button variant="blue" onClick={() => navigate("/login")}>
            Criar Grátis
          </Button>
        </div>
      </div>
    </header>;
};
export default SalesHeader;