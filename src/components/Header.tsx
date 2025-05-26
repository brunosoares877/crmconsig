
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bell, Menu, Settings, User } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import SupportButton from "@/components/SupportButton";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const navigate = useNavigate();
  const sidebar = useSidebar();
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error: any) {
      console.error("Erro ao fazer logout:", error.message);
    }
  };

  const getInitials = (email: string) => {
    if (!email) return "U";
    return email.charAt(0).toUpperCase();
  };

  return (
    <header className="border-b border-slate-200 py-3 px-4 flex justify-between items-center bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="flex items-center gap-2">
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => sidebar?.setOpen(true)}
            className="hover:bg-slate-100"
          >
            <Menu className="text-slate-600" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <SupportButton />
        <Button 
          variant="ghost" 
          size="icon"
          className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <Bell className="text-slate-600" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-blue-50"
            >
              <Avatar className="h-8 w-8 ring-2 ring-blue-100">
                <AvatarFallback className="bg-blue-500 text-white font-medium">
                  {user ? getInitials(user.email || "") : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white shadow-xl border border-slate-200" align="end" forceMount>
            <DropdownMenuLabel className="font-normal text-xs">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-slate-800">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-200" />
            <DropdownMenuGroup>
              {/* Future menu items can be added here */}
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-slate-200" />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="hover:bg-red-50 hover:text-red-600 cursor-pointer"
            >
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
