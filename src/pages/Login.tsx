import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AuthContainer from '../components/auth/AuthContainer';
import type { RootState } from '../features/store';

const LoginPage: React.FC = () => {
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AuthContainer />;
};

export default LoginPage;