import React, { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [uploading, setUploading] = useState(false);

  // Load existing profile image on component mount
  useEffect(() => {
    const loadProfileImage = async () => {
      if (!user) return;
      
      try {
        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(`profiles/${user.id}_profile.jpg`);
        
        // Check if image exists by making a HEAD request
        const response = await fetch(data.publicUrl, { method: 'HEAD' });
        if (response.ok) {
          setProfileImage(data.publicUrl);
        }
      } catch (error) {
        console.log('No existing profile image found');
      }
    };
    
    loadProfileImage();
  }, [user]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      
      if (!file) {
        toast.error("Nenhum arquivo selecionado");
        return;
      }

      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Formato não suportado. Use: JPG, PNG, GIF ou WebP");
        return;
      }

      // Validar tamanho do arquivo (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("Arquivo muito grande. Tamanho máximo: 5MB");
        return;
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}_profile.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      console.log('Uploading file:', { fileName, fileType: file.type, fileSize: file.size });

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        setProfileImage(data.publicUrl);
        toast.success("Foto de perfil atualizada com sucesso!");
      } else {
        throw new Error("Erro ao obter URL da imagem");
      }

    } catch (error: any) {
      console.error('Error uploading file:', error);
      
      if (error.message?.includes('Bucket not found')) {
        toast.error("Storage não configurado. Entre em contato com o suporte.");
      } else if (error.message?.includes('new row violates row-level security')) {
        toast.error("Permissão negada para upload. Verifique as configurações de segurança.");
      } else {
        toast.error(`Erro ao fazer upload da foto: ${error.message || 'Erro desconhecido'}`);
      }
    } finally {
      setUploading(false);
      // Limpar o input para permitir o mesmo arquivo novamente
      if (event.target) {
        event.target.value = '';
      }
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
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
            
            {/* User Email */}
            <div className="text-center w-full">
              <p className="text-sm font-medium truncate px-2">
                {user?.email || "Usuário"}
              </p>
              {uploading ? (
                <p className="text-xs text-blue-500">Fazendo upload...</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Conectado
                </p>
              )}
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
