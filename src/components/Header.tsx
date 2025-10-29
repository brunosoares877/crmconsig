
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bell, Menu, Settings, User } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import SupportButton from "@/components/SupportButton";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Header = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();

  // Safely try to use sidebar context
  let sidebar = null;
  try {
    sidebar = useSidebar();
  } catch (error) {
    // useSidebar is not available, component is being used outside SidebarProvider
    console.log("Header used outside SidebarProvider context");
  }

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
    <header className="border-b py-2 px-3 md:py-3 md:px-4 flex justify-between items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
      <div className="flex items-center gap-2">
        {isMobile && sidebar && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => sidebar?.setOpenMobile(true)}
            className="h-8 w-8 md:h-10 md:w-10"
          >
            <Menu className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        )}
        
        {/* Logo aumentada com cores brancas elegantes */}
        <div className="flex items-center">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center mr-3 md:mr-4 shadow-md">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-600 rounded-md"></div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">LeadConsig</h1>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <SupportButton />
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 md:h-10 md:w-10"
        >
          <Bell className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-8 w-8 md:h-10 md:w-10"
            >
              <Avatar className="h-6 w-6 md:h-8 md:w-8">
                <AvatarFallback className="text-xs md:text-sm">
                  {user ? getInitials(user.email || "") : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 md:w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal text-xs">
              <div className="flex flex-col space-y-1">
                <p className="text-xs md:text-sm font-medium leading-none truncate">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {/* Placeholder para futuras opções */}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-xs md:text-sm">
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
