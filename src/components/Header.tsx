
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bell, Menu, Settings, User } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useMediaQuery } from "@/hooks/use-mobile";
import SupportButton from "@/components/SupportButton";

const Header = () => {
  const navigate = useNavigate();
  const sidebar = useSidebar();
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <header className="border-b py-3 px-4 flex justify-between items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => sidebar?.toggle()}
          >
            <Menu />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <SupportButton />
        <Button variant="ghost" size="icon">
          <Bell />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/settings')}
        >
          <Settings />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/profile')}
        >
          <User />
        </Button>
      </div>
    </header>
  );
};

export default Header;
