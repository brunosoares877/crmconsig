import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Calendar, CalendarDays, CalendarPlus, DollarSign, List, ListCheck, Settings, Users, Camera, BarChart3, Home, FileText, Activity } from "lucide-react";
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

  const menuItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <Home className="h-4 w-4 md:h-5 md:w-5" />,
      isActive: isActive("/") || isActive("/dashboard")
    },
    {
      path: "/leads",
      label: "Leads",
      icon: <Users className="h-4 w-4 md:h-5 md:w-5" />,
      isActive: isActive("/leads")
    },
    {
      path: "/reminders",
      label: "Lembretes",
      icon: <Calendar className="h-4 w-4 md:h-5 md:w-5" />,
      isActive: isActive("/reminders")
    },
    {
      path: "/reminders/calendar",
      label: "Calendário",
      icon: <CalendarDays className="h-4 w-4 md:h-5 md:w-5" />,
      isActive: isActive("/reminders/calendar")
    },
    {
      path: "/leads/scheduled",
      label: "Agendamentos",
      icon: <CalendarPlus className="h-4 w-4 md:h-5 md:w-5" />,
      isActive: isActive("/leads/scheduled")
    },
    {
      path: "/employees",
      label: "Funcionários",
      icon: <Users className="h-4 w-4 md:h-5 md:w-5" />,
      isActive: isActive("/employees")
    },
    {
      path: "/portability",
      label: "Portabilidade",
      icon: <FileText className="h-4 w-4 md:h-5 md:w-5" />,
      isActive: isActive("/portability")
    }
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-16 md:w-72 z-20 bg-white shadow-xl flex flex-col border-r border-gray-100">
      {/* Header */}
      <div className="h-16 flex items-center justify-center md:justify-start border-b border-gray-100 px-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-gray-900">Upsales</h1>
            <p className="text-xs text-gray-500">CRM System</p>
          </div>
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
              item.isActive
                ? "bg-blue-50 text-blue-700 border border-blue-100"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span className={item.isActive ? "text-blue-600" : "text-gray-400"}>
              {item.icon}
            </span>
            <span className="hidden md:inline truncate">{item.label}</span>
          </Link>
        ))}

        {/* Comissões com submenu */}
        <div className="space-y-1">
          <Link
            to="/commission"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
              isActive("/commission") && !isActive("/commission/settings")
                ? "bg-blue-50 text-blue-700 border border-blue-100"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <DollarSign className={`h-4 w-4 md:h-5 md:w-5 ${
              isActive("/commission") && !isActive("/commission/settings") ? "text-blue-600" : "text-gray-400"
            }`} />
            <span className="hidden md:inline truncate">Comissões</span>
          </Link>
          
          {isCommissionPage && (
            <Link
              to="/commission/settings"
              className={`flex items-center gap-3 px-3 py-2.5 ml-4 rounded-lg transition-all duration-200 text-sm font-medium ${
                isActive("/commission/settings")
                  ? "bg-blue-50 text-blue-700 border border-blue-100"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Settings className={`h-3 w-3 md:h-4 md:w-4 ${
                isActive("/commission/settings") ? "text-blue-600" : "text-gray-400"
              }`} />
              <span className="hidden md:inline truncate text-xs">Configurações</span>
            </Link>
          )}
        </div>

        <Link
          to="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
            isActive("/settings")
              ? "bg-blue-50 text-blue-700 border border-blue-100"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <Settings className={`h-4 w-4 md:h-5 md:w-5 ${
            isActive("/settings") ? "text-blue-600" : "text-gray-400"
          }`} />
          <span className="hidden md:inline truncate">Configurações</span>
        </Link>
      </nav>

      {/* User Profile Footer */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <Avatar className="h-10 w-10 border-2 border-gray-100">
              {profileImage ? (
                <AvatarImage src={profileImage} alt="Profile" />
              ) : (
                <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
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
              title={uploading ? "Uploading..." : "Clique para alterar foto"}
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute -bottom-1 -right-1 h-6 w-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full pointer-events-none shadow-sm"
              title="Alterar foto"
            >
              <Camera className="h-3 w-3" />
            </Button>
          </div>
          <div className="hidden md:block flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.email?.split('@')[0] || "Usuário"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || "email@exemplo.com"}
            </p>
            {uploading && (
              <p className="text-xs text-blue-600 font-medium">Enviando...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
