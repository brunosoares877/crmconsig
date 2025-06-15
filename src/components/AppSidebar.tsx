
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  Users,
  Star,
  Calendar,
  Bell,
  CalendarDays,
  TrendingUp,
  DollarSign,
  Settings,
  Users2,
  Camera,
  User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart3,
    group: "PRINCIPAL"
  },
  {
    title: "Leads",
    url: "/leads",
    icon: Users,
    group: "LEADS"
  },
  {
    title: "Leads Premium",
    url: "/leads-premium",
    icon: Star,
    group: "LEADS"
  },
  {
    title: "Agendamentos",
    url: "/lead-scheduling",
    icon: Calendar,
    group: "LEADS"
  },
  {
    title: "Lembretes",
    url: "/reminders",
    icon: Bell,
    group: "LEMBRETES"
  },
  {
    title: "Calendário",
    url: "/reminders-calendar",
    icon: CalendarDays,
    group: "LEMBRETES"
  },
  {
    title: "Portabilidade",
    url: "/portability",
    icon: TrendingUp,
    group: "NEGÓCIOS"
  },
  {
    title: "Comissões",
    url: "/commission",
    icon: DollarSign,
    group: "NEGÓCIOS"
  },
  {
    title: "Config. Comissões",
    url: "/commission-settings",
    icon: Settings,
    group: "NEGÓCIOS"
  },
  {
    title: "Funcionários",
    url: "/employees",
    icon: Users2,
    group: "ADMINISTRAÇÃO"
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
    group: "ADMINISTRAÇÃO"
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (email: string) => {
    if (!email) return "U";
    return email.charAt(0).toUpperCase();
  };

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = [];
    }
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  return (
    <Sidebar>
      <SidebarContent>
        {Object.entries(groupedItems).map(([group, groupItems]) => (
          <SidebarGroup key={group}>
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground">
              {group}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {groupItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                      className="w-full"
                    >
                      <a href={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarFooter>
        <div className="border-t pt-4">
          <div className="flex flex-col items-center space-y-3 px-3">
            {/* Profile Image/Selfie Section */}
            <div className="relative">
              <Avatar className="h-16 w-16">
                {profileImage ? (
                  <AvatarImage src={profileImage} alt="Profile" />
                ) : (
                  <AvatarFallback className="text-lg">
                    {user ? getInitials(user.email || "") : "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <label htmlFor="profile-upload" className="absolute -bottom-1 -right-1 cursor-pointer">
                <div className="bg-primary text-primary-foreground rounded-full p-1 shadow-lg hover:bg-primary/90 transition-colors">
                  <Camera className="h-3 w-3" />
                </div>
                <Input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            
            {/* User Email */}
            <div className="text-center w-full">
              <p className="text-sm font-medium truncate px-2">
                {user?.email || "Usuário"}
              </p>
              <p className="text-xs text-muted-foreground">
                Conectado
              </p>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
