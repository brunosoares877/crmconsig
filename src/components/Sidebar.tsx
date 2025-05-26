
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Calendar, CalendarDays, CalendarPlus, DollarSign, List, ListCheck, Settings, Users, Camera, Home } from "lucide-react";
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
      if (!file) return;

      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_profile.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setProfileImage(data.publicUrl);
      toast.success("Foto de perfil atualizada com sucesso!");
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error("Erro ao fazer upload da foto");
    } finally {
      setUploading(false);
    }
  };

  const isCommissionPage = location.pathname.startsWith('/commission');

  return (
    <div className="fixed left-0 top-0 h-full w-16 md:w-64 z-10 bg-white shadow-xl border-r border-slate-200 flex flex-col">
      <div className="h-16 flex items-center justify-center md:justify-start border-b border-slate-200">
        <Link to="/" className="px-4">
          <h1 className="text-xl font-bold hidden md:block text-slate-800 px-[2px]">Gestão de Leads</h1>
          <span className="md:hidden text-slate-800 font-bold">GL</span>
        </Link>
      </div>
      
      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          <li>
            <Link 
              to="/dashboard" 
              className={`flex items-center ${
                isActive("/") || isActive("/dashboard") 
                ? "bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-500" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              } p-3 rounded-lg transition-all duration-200`}
            >
              <Home className="h-5 w-5 mr-3" />
              <span className="hidden md:inline">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/leads" 
              className={`flex items-center ${
                isActive("/leads") 
                ? "bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-500" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              } p-3 rounded-lg transition-all duration-200`}
            >
              <List className="h-5 w-5 mr-3" />
              <span className="hidden md:inline">Leads</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/reminders" 
              className={`flex items-center ${
                isActive("/reminders") 
                ? "bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-500" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              } p-3 rounded-lg transition-all duration-200`}
            >
              <Calendar className="h-5 w-5 mr-3" />
              <span className="hidden md:inline">Lembretes</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/reminders/calendar" 
              className={`flex items-center ${
                isActive("/reminders/calendar") 
                ? "bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-500" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              } p-3 rounded-lg transition-all duration-200`}
            >
              <CalendarDays className="h-5 w-5 mr-3" />
              <span className="hidden md:inline">Calendário</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/leads/scheduled" 
              className={`flex items-center ${
                isActive("/leads/scheduled") 
                ? "bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-500" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              } p-3 rounded-lg transition-all duration-200`}
            >
              <CalendarPlus className="h-5 w-5 mr-3" />
              <span className="hidden md:inline">Agendamentos</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/employees" 
              className={`flex items-center ${
                isActive("/employees") 
                ? "bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-500" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              } p-3 rounded-lg transition-all duration-200`}
            >
              <Users className="h-5 w-5 mr-3" />
              <span className="hidden md:inline">Funcionários</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/portability" 
              className={`flex items-center ${
                isActive("/portability") 
                ? "bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-500" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              } p-3 rounded-lg transition-all duration-200`}
            >
              <ListCheck className="h-5 w-5 mr-3" />
              <span className="hidden md:inline">Portabilidade</span>
            </Link>
          </li>
          <li className="space-y-1">
            <Link 
              to="/commission" 
              className={`flex items-center ${
                isActive("/commission") && !isActive("/commission/settings") 
                ? "bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-500" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              } p-3 rounded-lg transition-all duration-200`}
            >
              <DollarSign className="h-5 w-5 mr-3" />
              <span className="hidden md:inline">Comissões</span>
            </Link>
            {isCommissionPage && (
              <Link 
                to="/commission/settings" 
                className={`flex items-center ${
                  isActive("/commission/settings") 
                  ? "bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-500" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                } p-2 pl-10 rounded-lg transition-all duration-200 ml-2`}
              >
                <Settings className="h-4 w-4 mr-3" />
                <span className="hidden md:inline text-sm">Configurações</span>
              </Link>
            )}
          </li>
          <li>
            <Link 
              to="/settings" 
              className={`flex items-center ${
                isActive("/settings") 
                ? "bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-500" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              } p-3 rounded-lg transition-all duration-200`}
            >
              <Settings className="h-5 w-5 mr-3" />
              <span className="hidden md:inline">Configurações</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Footer com informações do usuário */}
      <div className="border-t border-slate-200 p-4 bg-slate-50">
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <Avatar className="h-10 w-10 ring-2 ring-blue-100">
              {profileImage ? (
                <AvatarImage src={profileImage} alt="Profile" />
              ) : (
                <AvatarFallback className="bg-blue-500 text-white font-medium">
                  {user ? getInitials(user.email || "") : "U"}
                </AvatarFallback>
              )}
            </Avatar>
            <Input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              disabled={uploading}
              title="Clique para alterar foto"
            />
            <div className="absolute -bottom-1 -right-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 shadow-lg transition-colors pointer-events-none group-hover:scale-110 duration-200">
              <Camera className="h-3 w-3" />
            </div>
          </div>
          <div className="hidden md:block flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 truncate">
              {user?.email || "Usuário"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
