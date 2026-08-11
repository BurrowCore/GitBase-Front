import React from "react";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../features/store";
import {
  BarChart as BarChartIcon,
  Folder as FolderIcon,
  People as PeopleIcon,
  Cloud as CloudIcon,
  Widgets as WidgetsIcon,
  ZoomIn as ZoomInIcon,
  Add as AddIcon,
  Home as HomeIcon
} from "@mui/icons-material";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const adminMenuItems = [
    { text: "Accueil", icon: <HomeIcon />, path: "/" },
    { text: "Rapports globaux", icon: <BarChartIcon />, path: "/dashboard" },
    { text: "Demandes", icon: <FolderIcon />, path: "/demandes" },
    { text: "Utilisateurs", icon: <PeopleIcon />, path: "/users" },
    { text: "Données Météo", icon: <CloudIcon />, path: "/weather" },
    { text: "Composantes", icon: <WidgetsIcon />, path: "/composantes" },
  ];

  const clientMenuItems = [
    { text: "Accueil", icon: <HomeIcon />, path: "/" },
    { text: "Mes demandes", icon: <FolderIcon />, path: "/mesdemandes" },
    { text: "Pré-dimensionnement", icon: <ZoomInIcon />, path: "/pre-dimensionnement" },
  ];

  const menuItems = user?.roles?.[0]?.roleName?.includes('ADMIN') ? adminMenuItems : clientMenuItems;

  const handleCreateDemande = () => {
    navigate('/nouvelle-demande');
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col shadow-sm">
      <div className="flex-1 py-6">
        <nav className="space-y-1 px-3">
          {menuItems.map((item, index) => (
            <NavLink
              to={item.path}
              key={index}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" 
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <span className={`flex-shrink-0 ${location.pathname === item.path ? "text-blue-700" : "text-gray-400"}`}>
                {item.icon}
              </span>
              <span className="truncate">{item.text}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Create Request Button for Clients */}
      {user?.roles?.[0]?.roleName === 'CLIENT' && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleCreateDemande}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <AddIcon className="w-4 h-4" />
            <span>Nouvelle demande</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar; 