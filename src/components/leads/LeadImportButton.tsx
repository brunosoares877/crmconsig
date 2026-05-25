
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Import } from "lucide-react";

interface LeadImportButtonProps {
  className?: string;
  label?: string;
}

const LeadImportButton: React.FC<LeadImportButtonProps> = ({
  className = "",
  label = "Importar Leads"
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/leads/import");
  };

  return (
    <Button
      variant="blue"
      className={`gap-2 modern-button px-5 py-3 text-base font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
      onClick={handleClick}
    >
      <Import className="h-5 w-5 text-white" />
      <span>{label}</span>
    </Button>
  );
};

export default LeadImportButton;
