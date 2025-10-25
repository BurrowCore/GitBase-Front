import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import LoginPage from '../pages/Login.tsx';
import RegisterPage from '../pages/Register.tsx';
import Dashboard from '../pages/Dashboard.tsx';
import { NewRepository } from '../pages/NewRepository.tsx';
import { Settings } from '../pages/Settings.tsx';
import AuthSuccess from '../pages/AuthSuccess.tsx';
import Error from '../components/Global/Error';
import OAuthCallback from '../components/auth/OAuthCallback';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import type { RootState } from '../features/store';
import { store } from '../features/store';
import { ToastContainer } from 'react-toastify';
import { queryClient } from '../config/query';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react';
import ProtectedLayout from './ProtectedLayout.tsx';
import { setLogoutCallback } from '../axios/axiosInstance.ts';
import { checkAuthState } from '../features/auth/authSlice.ts';
import Home from '../pages/Home.tsx';
import GitbaseRepo from '../pages/GitbaseRepo.tsx';

interface AuthCheckProps {
  requiredRoles?: string[];
  children: React.ReactNode;
}

const AuthCheck: React.FC<AuthCheckProps> = ({ children }) => {
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const ProtectedLayoutWrapper = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const handleLogout = () => {
      localStorage.removeItem('authState');
      window.location.href = '/login';
    };

    setLogoutCallback(handleLogout);

    // Only check with server on initial mount
    dispatch(checkAuthState(false) as any);

    // Set up a timer to validate session every 30 minutes
    const interval = setInterval(() => {
      dispatch(checkAuthState(true) as any);
    }, 30 * 60 * 1000); // Check every 30 minutes

    return () => clearInterval(interval);
  }, [dispatch]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <ProtectedLayout />;
};

export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <Error code={404} message="Page Not Found" />,

    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: "/",
        element: <ProtectedLayoutWrapper />,
        children: [
          {
            path: "/dashboard",
            element: <AuthCheck><Dashboard /></AuthCheck>
          },
          {
            path: "/settings",
            element: <AuthCheck><Settings /></AuthCheck>
          },
          {
            path: "/new",
            element: <AuthCheck><NewRepository /></AuthCheck>
          }
              ,
              {
                path: "/gitbase/:username/:repo",
                element: <AuthCheck><GitbaseRepo /></AuthCheck>
              }
        ]
      },
      {
        path: "/login",
        element: <LoginPage />
      },
      {
        path: "/register",
        element: <RegisterPage />
      },

      // {
      //   path: "/auth/success",
      //   element: <AuthSuccess />
      // },
      // {
      //   path: "/auth/callback",
      //   element: <OAuthCallback />
      // },
      {
        path: "/not-allowed",
        element: <Error code={403} message="Not allowed to access this route" />
      }
    ]
  }
]);

const App = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ToastContainer autoClose={3000} position={"bottom-center"} />
      </QueryClientProvider>
    </Provider>
  );
};

export default App;

