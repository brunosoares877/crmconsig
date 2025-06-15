import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
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
  User,
  Edit
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
    url: "/dashboard", // corresponde ao App.tsx -> "/dashboard"
    icon: BarChart3,
    group: "PRINCIPAL"
  },
  {
    title: "Leads",
    url: "/leads", // "/leads"
    icon: Users,
    group: "LEADS"
  },
  {
    title: "Leads Premium",
    url: "/leads-premium", // "/leads-premium"
    icon: Star,
    group: "LEADS",
    highlight: true // <-- Novidade: campo para destaque
  },
  {
    title: "Agendamentos",
    url: "/leads/scheduled", // corrigido de "/lead-scheduling" para "/leads/scheduled"
    icon: Calendar,
    group: "LEADS"
  },
  {
    title: "Lembretes",
    url: "/reminders", // "/reminders"
    icon: Bell,
    group: "LEMBRETES"
  },
  {
    title: "Calendário",
    url: "/reminders/calendar", // corrigido de "/reminders-calendar" para "/reminders/calendar"
    icon: CalendarDays,
    group: "LEMBRETES"
  },
  {
    title: "Portabilidade",
    url: "/portability", // "/portability"
    icon: TrendingUp,
    group: "NEGÓCIOS"
  },
  {
    title: "Comissões",
    url: "/commission", // "/commission"
    icon: DollarSign,
    group: "NEGÓCIOS"
  },
  {
    title: "Config. Comissões",
    url: "/commission/settings", // corrigido de "/commission-settings" para "/commission/settings"
    icon: Settings,
    group: "NEGÓCIOS"
  },
  {
    title: "Funcionários",
    url: "/employees", // "/employees"
    icon: Users2,
    group: "ADMINISTRAÇÃO"
  },
  {
    title: "Configurações",
    url: "/settings", // "/settings"
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

  // Adiciona focus ao input ao clicar na imagem/ícone
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleAvatarClick = () => {
    if (inputRef.current && !uploading) {
      inputRef.current.click();
    }
  };

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
                      className={
                        "w-full" +
                        (item.highlight
                          ? " bg-yellow-100 text-yellow-800 border border-yellow-200 font-semibold hover:bg-yellow-200 hover:text-yellow-900 transition-colors"
                          : "")
                      }
                    >
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className={
                          "h-4 w-4" +
                          (item.highlight ? " text-yellow-500" : "")
                        } />
                        <span>{item.title}</span>
                      </Link>
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
            <div className="relative group">
              <Avatar 
                className="h-16 w-16 cursor-pointer ring-2 ring-primary/20 transition-shadow group-hover:ring-primary/80"
                onClick={handleAvatarClick}
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") handleAvatarClick();
                }}
                aria-label={uploading ? "Enviando foto" : "Editar foto de perfil"}
                role="button"
              >
                {profileImage ? (
                  <AvatarImage src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <AvatarFallback className="text-lg">
                    {user ? getInitials(user.email || "") : "U"}
                  </AvatarFallback>
                )}
                {/* Botão de editar sobreposto (ícone lápis) visível ao hover */}
                <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                  <Edit className="h-6 w-6 text-white drop-shadow-lg" />
                </div>
              </Avatar>
              {/* Input escondido, acionado ao clicar no avatar */}
              <Input
                id="profile-upload"
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
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
