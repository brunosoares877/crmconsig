import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Calendar, CalendarDays, CalendarPlus, DollarSign, List, ListCheck, Settings, Users, Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const getInitials = (email: string) => {
    if (!email) return "U";
    return email.charAt(0).toUpperCase();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
        toast.error("Formato não suportado. Use: JPG, PNG, GIF ou WebP (máximo 5MB)");
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

      // Verificar se o bucket existe, se não existir, criar
      const { data: buckets } = await supabase.storage.listBuckets();
      const avatarsBucket = buckets?.find(bucket => bucket.name === 'avatars');
      
      if (!avatarsBucket) {
        toast.error("Bucket de armazenamento não configurado. Entre em contato com o suporte.");
        return;
      }

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
        toast.error("Bucket de armazenamento não encontrado. O administrador precisa configurar o storage.");
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

  // Verificar se está na página de comissões ou suas subpáginas
  const isCommissionPage = location.pathname.startsWith('/commission');

  return (
    <div className="fixed left-0 top-0 h-full w-16 md:w-64 z-20 bg-sidebar shadow-lg flex flex-col">
      <div className="h-12 md:h-16 flex items-center justify-center md:justify-start border-b border-sidebar-border px-2 md:px-4">
        <Link to="/" className="truncate">
          <h1 className="text-lg md:text-xl font-bold hidden md:block text-white truncate">LeadConsig</h1>
          <span className="md:hidden text-white text-sm">CRM</span>
        </Link>
      </div>
      
      <nav className="p-2 md:p-4 flex-1 overflow-y-auto">
        <ul className="space-y-1 md:space-y-2">
          <li>
            <Link 
              to="/dashboard" 
              className={`flex items-center ${
                isActive("/") || isActive("/dashboard") 
                  ? "bg-sidebar-accent text-white font-medium" 
                  : "text-gray-300 hover:bg-sidebar-accent/50"
              } p-2 rounded-md transition-colors text-sm`}
            >
              <ListCheck className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 flex-shrink-0" />
              <span className="hidden md:inline truncate">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/leads" 
              className={`flex items-center ${
                isActive("/leads") 
                  ? "bg-sidebar-accent text-white font-medium" 
                  : "text-gray-300 hover:bg-sidebar-accent/50"
              } p-2 rounded-md transition-colors text-sm`}
            >
              <List className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 flex-shrink-0" />
              <span className="hidden md:inline truncate">Leads</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/reminders" 
              className={`flex items-center ${
                isActive("/reminders") 
                  ? "bg-sidebar-accent text-white font-medium" 
                  : "text-gray-300 hover:bg-sidebar-accent/50"
              } p-2 rounded-md transition-colors text-sm`}
            >
              <Calendar className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 flex-shrink-0" />
              <span className="hidden md:inline truncate">Lembretes</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/reminders/calendar" 
              className={`flex items-center ${
                isActive("/reminders/calendar") 
                  ? "bg-sidebar-accent text-white font-medium" 
                  : "text-gray-300 hover:bg-sidebar-accent/50"
              } p-2 rounded-md transition-colors text-sm`}
            >
              <CalendarDays className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 flex-shrink-0" />
              <span className="hidden md:inline truncate">Calendário</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/leads/scheduled" 
              className={`flex items-center ${
                isActive("/leads/scheduled") 
                  ? "bg-sidebar-accent text-white font-medium" 
                  : "text-gray-300 hover:bg-sidebar-accent/50"
              } p-2 rounded-md transition-colors text-sm`}
            >
              <CalendarPlus className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 flex-shrink-0" />
              <span className="hidden md:inline truncate">Agendamentos</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/employees" 
              className={`flex items-center ${
                isActive("/employees") 
                  ? "bg-sidebar-accent text-white font-medium" 
                  : "text-gray-300 hover:bg-sidebar-accent/50"
              } p-2 rounded-md transition-colors text-sm`}
            >
              <Users className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 flex-shrink-0" />
              <span className="hidden md:inline truncate">Funcionários</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/portability" 
              className={`flex items-center ${
                isActive("/portability") 
                  ? "bg-sidebar-accent text-white font-medium" 
                  : "text-gray-300 hover:bg-sidebar-accent/50"
              } p-2 rounded-md transition-colors text-sm`}
            >
              <ListCheck className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 flex-shrink-0" />
              <span className="hidden md:inline truncate">Portabilidade</span>
            </Link>
          </li>
          <li className="space-y-1">
            <Link 
              to="/commission" 
              className={`flex items-center ${
                isActive("/commission") && !isActive("/commission/settings") 
                  ? "bg-sidebar-accent text-white font-medium" 
                  : "text-gray-300 hover:bg-sidebar-accent/50"
              } p-2 rounded-md transition-colors text-sm`}
            >
              <DollarSign className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 flex-shrink-0" />
              <span className="hidden md:inline truncate">Comissões</span>
            </Link>
            {/* Mostrar configurações apenas se estiver na página de comissões */}
            {isCommissionPage && (
              <Link 
                to="/commission/settings" 
                className={`flex items-center ${
                  isActive("/commission/settings") 
                    ? "bg-sidebar-accent text-white font-medium" 
                    : "text-gray-300 hover:bg-sidebar-accent/50"
                } p-2 pl-6 md:pl-10 rounded-md transition-colors ml-2 text-xs md:text-sm`}
              >
                <Settings className="h-3 w-3 md:h-4 md:w-4 mr-2 md:mr-3 flex-shrink-0" />
                <span className="hidden md:inline truncate">Configurações</span>
              </Link>
            )}
          </li>
          <li>
            <Link 
              to="/settings" 
              className={`flex items-center ${
                isActive("/settings") 
                  ? "bg-sidebar-accent text-white font-medium" 
                  : "text-gray-300 hover:bg-sidebar-accent/50"
              } p-2 rounded-md transition-colors text-sm`}
            >
              <Settings className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 flex-shrink-0" />
              <span className="hidden md:inline truncate">Configurações</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Footer com informações do usuário */}
      <div className="border-t border-sidebar-border p-2 md:p-4">
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="relative flex-shrink-0">
            <Avatar className="h-8 w-8 md:h-10 md:w-10">
              {profileImage ? (
                <AvatarImage src={profileImage} alt="Profile" />
              ) : (
                <AvatarFallback className="bg-sidebar-accent text-white text-xs md:text-sm">
                  {user ? getInitials(user.email || "") : "U"}
                </AvatarFallback>
              )}
            </Avatar>
            <Input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
              title={uploading ? "Uploading..." : "Clique para alterar foto (JPG, PNG, GIF, WebP - máx 5MB)"}
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute -bottom-1 -right-1 h-5 w-5 md:h-6 md:w-6 bg-sidebar-accent hover:bg-sidebar-accent/80 text-white rounded-full pointer-events-none"
              title="Alterar foto"
            >
              <Camera className="h-2 w-2 md:h-3 md:w-3" />
            </Button>
          </div>
          <div className="hidden md:block flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium text-white truncate">
              {user?.email || "Usuário"}
            </p>
            {uploading && (
              <p className="text-xs text-blue-300">Uploading...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
