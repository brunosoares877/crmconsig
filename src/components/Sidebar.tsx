
import React from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { 
  Calendar, 
  CalendarDays, 
  CalendarPlus, 
  DollarSign, 
  List, 
  ListCheck, 
  Settings
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };
  
  return <div className="fixed left-0 top-0 h-full w-16 md:w-64 z-10 bg-sidebar shadow-lg">
      <div className="h-16 flex items-center justify-center md:justify-start border-b border-sidebar-border">
        <Link to="/" className="px-4">
          <h1 className="text-xl font-bold hidden md:block text-white">LeadConsig</h1>
          <span className="md:hidden text-white">CRM</span>
        </Link>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <Link to="/dashboard" className={`flex items-center ${isActive("/") || isActive("/dashboard") ? "bg-sidebar-accent text-white font-medium" : "text-gray-300 hover:bg-sidebar-accent/50"} p-2 rounded-md transition-colors`}>
              <ListCheck className="h-5 w-5 mr-3" />
              <span className="hidden md:inline">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/leads" className={`flex items-center ${isActive("/leads") ? "bg-sidebar-accent text-white font-medium" : "text-gray-300 hover:bg-sidebar-accent/50"} p-2 rounded-md transition-colors`}>
              <List className="h-5 w-5 mr-3" />
              <span className="hidden md:inline">Leads</span>
            </Link>
          </li>
          <li>
            <Link to="/reminders" className={`flex items-center ${isActive("/reminders") ? "bg-sidebar-accent text-white font-medium" : "text-gray-300 hover:bg-sidebar-accent/50"} p-2 rounded-md transition-colors`}>
              <Calendar className="h-5 w-5 mr-3" />
              <span className="hidden md:inline">Lembretes</span>
            </Link>
          </li>
          <li>
            <Link to="/reminders/calendar" className={`flex items-center ${isActive("/reminders/calendar") ? "bg-sidebar-accent text-white font-medium" : "text-gray-300 hover:bg-sidebar-accent/50"} p-2 rounded-md transition-colors`}>
              <CalendarDays className="h-5 w-5 mr-3" />
              <span className="hidden md:inline">Calendário</span>
            </Link>
          </li>
          <li>
            <Link to="/leads/scheduled" className={`flex items-center ${isActive("/leads/scheduled") ? "bg-sidebar-accent text-white font-medium" : "text-gray-300 hover:bg-sidebar-accent/50"} p-2 rounded-md transition-colors`}>
              <CalendarPlus className="h-5 w-5 mr-3" />
              <span className="hidden md:inline">Agendamentos</span>
            </Link>
          </li>
          <li>
            <Link to="/portability" className={`flex items-center ${isActive("/portability") ? "bg-sidebar-accent text-white font-medium" : "text-gray-300 hover:bg-sidebar-accent/50"} p-2 rounded-md transition-colors`}>
              <ListCheck className="h-5 w-5 mr-3" />
              <span className="hidden md:inline">Portabilidade</span>
            </Link>
          </li>
          <li className="space-y-1">
            <Link to="/commission" className={`flex items-center ${isActive("/commission") && !isActive("/commission/settings") ? "bg-sidebar-accent text-white font-medium" : "text-gray-300 hover:bg-sidebar-accent/50"} p-2 rounded-md transition-colors`}>
              <DollarSign className="h-5 w-5 mr-3" />
              <span className="hidden md:inline">Comissões</span>
            </Link>
            <Link to="/commission/settings" className={`flex items-center ${isActive("/commission/settings") ? "bg-sidebar-accent text-white font-medium" : "text-gray-300 hover:bg-sidebar-accent/50"} p-2 pl-10 rounded-md transition-colors ml-2`}>
              <Settings className="h-4 w-4 mr-3" />
              <span className="hidden md:inline text-sm">Configurações</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>;
};

export default Sidebar;
