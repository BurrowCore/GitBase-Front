import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../features/store";
import { logout } from "../../features/auth/authSlice";
import type { RootState } from "../../features/store";
import { 
  Settings as SettingsIcon, 
  Logout as LogoutIcon, 
  Person as UserIcon,
  AccountTree as GitBranchIcon
} from "@mui/icons-material";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login');
    }
  };

  const handleSettings = () => {
    navigate('/parametres');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <GitBranchIcon className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">GitBase</span>
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {/* User Info */}
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              {user?.profilePictureUrl ? (
                <img 
                  src={user.profilePictureUrl} 
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-4 h-4 text-blue-600" />
              )}
            </div>
            <div className="hidden md:block">
              <div className="font-medium text-gray-900">{user?.name}</div>
              <div className="text-xs text-gray-500">
                {user?.roles?.[0]?.roleName?.toLowerCase()}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSettings}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Settings"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Logout"
            >
              <LogoutIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 