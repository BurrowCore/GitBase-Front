import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { checkAuthState } from '../features/auth/authSlice';
import { authService } from '../services/authService';
import type { AppDispatch } from '../features/store';

const AuthSuccess: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const handleAuthSuccess = async () => {
      // Check if user is authenticated
      if (authService.isAuthenticated()) {
        try {
          // Update Redux state with user info
          await dispatch(checkAuthState()).unwrap();
        } catch (error) {
          console.error('Error checking auth state:', error);
        }
      }

      // Countdown timer
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/dashboard');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    };

    handleAuthSuccess();
  }, [navigate, dispatch]);

  const handleContinue = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Login Successful!
        </h1>
        <p className="text-gray-600 mb-6">
          You have successfully logged in with Google. Welcome to GitBase!
        </p>

        {/* Countdown */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">
            Redirecting to dashboard in
          </p>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
            <span className="text-xl font-bold text-blue-600">{countdown}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleContinue}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Continue to Dashboard
        </button>

        {/* Alternative Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Having issues? Try{' '}
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:text-blue-500 underline"
            >
              refreshing the page
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthSuccess; 