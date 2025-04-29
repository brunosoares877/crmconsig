
import React from "react";
import { Bell, Search, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = () => {
    if (signOut) {
      signOut();
    } else {
      navigate("/login");
    }
  };
  
  return (
    <header className="border-b bg-white shadow-sm sticky top-0 z-30">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-medium text-gray-700 hidden md:block">Leadconsig</h2>
        </div>

        <div className="hidden md:flex items-center">
          <div className="relative w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-500" />
            <Input 
              placeholder="Buscar por nome, telefone ou CPF..." 
              className="pl-10 py-2 border-blue-100 bg-blue-50/50 hover:bg-blue-50 focus:border-blue-200 focus:ring-1 focus:ring-blue-200 transition-all rounded-full" 
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-red-500"></span>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
