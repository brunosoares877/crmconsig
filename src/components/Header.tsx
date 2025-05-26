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
  const sidebar = useSidebar();
  const isMobile = useIsMobile();
  const {
    user,
    signOut
  } = useAuth();
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
  return <header className="border-b py-3 px-4 flex justify-between items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2">
        {isMobile && <Button variant="ghost" size="icon" onClick={() => sidebar?.setOpen(true)}>
            <Menu />
          </Button>}
      </div>

      <div className="flex items-center gap-2">
        <SupportButton />
        <Button variant="ghost" size="icon">
          <Bell />
        </Button>
        
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {user ? getInitials(user.email || "") : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal text-xs">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              
              
              
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>;
};
export default Header;