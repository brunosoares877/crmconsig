
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
  Settings,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <div className="fixed left-0 top-0 h-full w-16 md:w-64 z-10 bg-white border-r shadow-sm">
      <div className="h-16 flex items-center justify-center md:justify-start border-b">
        <Link to="/" className="px-4">
          <h1 className="text-xl font-bold hidden md:block">CRM</h1>
          <span className="md:hidden">CRM</span>
        </Link>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <Link
              to="/dashboard"
              className={`flex items-center ${
                isActive("/") || isActive("/dashboard")
                  ? "text-primary bg-primary/10 font-medium"
                  : "text-gray-600 hover:bg-primary/5"
              } p-2 rounded-md transition-colors`}
            >
              <ListCheck className="h-5 w-5 mr-3" />
              <span className="hidden md:inline">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              to="/leads"
              className={`flex items-center ${
                isActive("/leads")
                  ? "text-primary bg-primary/10 font-medium"
                  : "text-gray-600 hover:bg-primary/5"
              } p-2 rounded-md transition-colors`}
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
                  ? "text-primary bg-primary/10 font-medium"
                  : "text-gray-600 hover:bg-primary/5"
              } p-2 rounded-md transition-colors`}
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
                  ? "text-primary bg-primary/10 font-medium"
                  : "text-gray-600 hover:bg-primary/5"
              } p-2 rounded-md transition-colors`}
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
                  ? "text-primary bg-primary/10 font-medium"
                  : "text-gray-600 hover:bg-primary/5"
              } p-2 rounded-md transition-colors`}
            >
              <CalendarPlus className="h-5 w-5 mr-3" />
              <span className="hidden md:inline">Agendamentos</span>
            </Link>
          </li>
          <li>
            <Link
              to="/portability"
              className={`flex items-center ${
                isActive("/portability")
                  ? "text-primary bg-primary/10 font-medium"
                  : "text-gray-600 hover:bg-primary/5"
              } p-2 rounded-md transition-colors`}
            >
              <ListCheck className="h-5 w-5 mr-3" />
              <span className="hidden md:inline">Portabilidade</span>
            </Link>
          </li>
          <li>
            <Link
              to="/commission"
              className={`flex items-center ${
                isActive("/commission")
                  ? "text-primary bg-primary/10 font-medium"
                  : "text-gray-600 hover:bg-primary/5"
              } p-2 rounded-md transition-colors`}
            >
              <DollarSign className="h-5 w-5 mr-3" />
              <span className="hidden md:inline">Comissões</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
