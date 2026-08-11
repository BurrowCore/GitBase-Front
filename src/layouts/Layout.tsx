import React, { useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Global/Navbar";
import Sidebar from "../components/Global/Sidebar";
import { setLogoutCallback } from "../axios/axiosInstance";
import { useAppDispatch } from "../features/store";
import { logout } from "../features/auth/authSlice";

type LayoutProps = {
  children: ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleTokenExpired = async () => {
      try {
        await dispatch(logout());
      } catch (error) {
        console.log('Logout action failed:', error);
      } finally {
        navigate('/login', { replace: true });
      }
    };

    setLogoutCallback(handleTokenExpired);

    return () => {
      setLogoutCallback(null);
    };
  }, [navigate, dispatch]);

  return (
    <>
      {children}
    </>
  );
};

export default Layout; 