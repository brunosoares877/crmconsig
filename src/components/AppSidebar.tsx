import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
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
  Edit,
  Cog
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Menu agrupado por seções
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
    group: "LEADS",
    highlight: true
  },
  {
    title: "Agendamentos",
    url: "/leads/scheduled",
    icon: Calendar,
    group: "LEADS"
  },
  {
    title: "Config. Leads",
    url: "/leads/config",
    icon: Cog,
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
    url: "/reminders/calendar",
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
    url: "/commission/settings",
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

// Agrupa os itens por grupo
const groupedItems = items.reduce((acc, item) => {
  if (!acc[item.group]) acc[item.group] = [];
  acc[item.group].push(item);
  return acc;
}, {} as Record<string, typeof items>);

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
        // Tentar buscar no bucket avatars primeiro
        const avatarPath = `${user.id}/profile.jpg`;
        const { data: avatarData } = supabase.storage
          .from('avatars')
          .getPublicUrl(avatarPath);
        
        // Check if image exists by making a HEAD request
        if (avatarData?.publicUrl) {
          const response = await fetch(avatarData.publicUrl, { method: 'HEAD' });
          if (response.ok) {
            setProfileImage(avatarData.publicUrl);
            return;
          }
        }
        
        // Fallback: tentar buscar no lead-documents
        const fallbackPath = `${user.id}/profile/profile.jpg`;
        const { data: fallbackData } = supabase.storage
          .from('lead-documents')
          .getPublicUrl(fallbackPath);
        
        if (fallbackData?.publicUrl) {
          const fallbackResponse = await fetch(fallbackData.publicUrl, { method: 'HEAD' });
          if (fallbackResponse.ok) {
            setProfileImage(fallbackData.publicUrl);
            return;
          }
        }
        
        // Tentar outras extensões comuns
        const extensions = ['png', 'gif', 'webp'];
        for (const ext of extensions) {
          const path = `${user.id}/profile.${ext}`;
          const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(path);
          
          if (data?.publicUrl) {
            const response = await fetch(data.publicUrl, { method: 'HEAD' });
            if (response.ok) {
              setProfileImage(data.publicUrl);
              return;
            }
          }
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
      const fileName = `profile.${fileExt}`;
      // Usar estrutura de pastas: userId/fileName
      const filePath = `${user.id}/${fileName}`;

      console.log('Uploading file:', { fileName, fileType: file.type, fileSize: file.size, filePath });

      // Tentar fazer upload para o bucket avatars
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        
        // Se falhar no avatars, tentar no lead-documents como fallback
        console.log('Trying fallback upload to lead-documents...');
        const fallbackPath = `${user.id}/profile/${fileName}`;
        
        const { error: fallbackError } = await supabase.storage
          .from('lead-documents')
          .upload(fallbackPath, file, {
            upsert: true,
            contentType: file.type
          });
        
        if (fallbackError) {
          throw fallbackError;
        }
        
        // Usar URL do fallback
        const { data: fallbackData } = supabase.storage
          .from('lead-documents')
          .getPublicUrl(fallbackPath);
        
        if (fallbackData?.publicUrl) {
          setProfileImage(fallbackData.publicUrl);
          toast.success("Foto de perfil atualizada com sucesso!");
          return;
        }
        
        throw new Error("Erro ao obter URL da imagem");
      }

      // Se upload no avatars funcionou
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
      } else if (error.message?.includes('new row violates row-level security') || error.message?.includes('policy')) {
        toast.error("Sistema de upload temporariamente indisponível. Tente novamente em alguns minutos.");
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

  // Adiciona focus ao input ao clicar na imagem/ícone
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleAvatarClick = () => {
    if (inputRef.current && !uploading) {
      inputRef.current.click();
    }
  };

  return (
    <Sidebar className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 border-r border-blue-700/50">
      <SidebarContent className="flex-1">
        {Object.entries(groupedItems).map(([group, groupItems]) => (
          <SidebarGroup key={group}>
            <SidebarGroupLabel className="text-xs font-semibold text-blue-200/80 uppercase tracking-wider">
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
                        "w-full text-blue-100 hover:text-white hover:bg-blue-700/50 transition-all duration-200 " +
                        (location.pathname === item.url
                          ? "bg-blue-600/60 text-white shadow-lg border-l-4 border-blue-300"
                          : "") +
                        (item.highlight
                          ? " !bg-gradient-to-r !from-orange-600 !to-amber-600 !text-white !border !border-orange-500 font-semibold hover:!from-orange-700 hover:!to-amber-700 shadow-lg"
                          : "")
                      }
                    >
                      <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                        <item.icon className={
                          "h-4 w-4 transition-colors duration-200 " +
                          (item.highlight ? "!text-white" : 
                            location.pathname === item.url ? "text-white" : "text-blue-200")
                        } />
                        <span className={
                          "font-medium transition-colors duration-200 " +
                          (item.highlight ? "!text-white" : 
                            location.pathname === item.url ? "text-white" : "text-blue-100")
                        }>
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-blue-700/50 bg-blue-900/50">
        <div className="pt-4">
          <div className="flex flex-col items-center space-y-3 px-3">
            {/* Profile Image/Selfie Section */}
            <div className="relative group">
              <Avatar 
                className="h-16 w-16 cursor-pointer ring-2 ring-blue-400/30 transition-all duration-300 group-hover:ring-blue-300/80 group-hover:shadow-lg group-hover:shadow-blue-500/20"
                onClick={handleAvatarClick}
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") handleAvatarClick();
                }}
                aria-label={uploading ? "Enviando foto" : "Editar foto de perfil"}
                role="button"
              >
                {profileImage ? (
                  <AvatarImage src={profileImage} alt="Profile" className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <AvatarFallback className="text-lg bg-blue-600 text-white border-2 border-blue-400/50">
                    {user ? getInitials(user.email || "") : "U"}
                  </AvatarFallback>
                )}
                {/* Botão de editar sobreposto (ícone lápis) visível apenas ao hover */}
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
              <p className="text-sm font-medium truncate px-2 text-white">
                {user?.email || "Usuário"}
              </p>
              {uploading ? (
                <p className="text-xs text-blue-300">Fazendo upload...</p>
              ) : (
                <p className="text-xs text-blue-200/70">
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
