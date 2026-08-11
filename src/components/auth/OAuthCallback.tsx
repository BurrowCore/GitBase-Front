import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { checkAuthState, getCurrentUser } from '../../features/auth/authSlice';
import { authService } from '../../services/authService';
import { useAppDispatch, useAppSelector, type AppDispatch } from '../../features/store';

const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [message, setMessage] = useState('Completing your login...');
    const dispatch = useAppDispatch();
    const { user, loading, error } = useAppSelector(state => state.auth);
    useEffect(() => {
      // Only fetch if we don't already have user data
      if (!user) {
        dispatch(getCurrentUser());
      }
    }, [dispatch, user]);
  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Check if we're on a page that might be showing JSON response
        const pageContent = document.body.textContent || '';
        const looksLikeJsonResponse = pageContent.includes('"success":true') && 
                                     pageContent.includes('"message":"OAuth2 authentication successful"') ||
                                     pageContent.includes('"message":"Auth2 authentication successful"');

        if (looksLikeJsonResponse) {
          // If the page contains JSON response indicating success, redirect to success page
          setMessage('Authentication successful! Redirecting...');
          setTimeout(() => {
            navigate('/auth/success');
          }, 1000);
          return;
        }

        // Check for error parameters first
        const error = searchParams.get('error');
        const errorMessage = searchParams.get('message');

        if (error) {
          toast.error(`OAuth Error: ${errorMessage || error}`);
          navigate('/login');
          return;
        }

        // Check if we have a success parameter (if backend was redirecting)
        const success = searchParams.get('success');
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (success === 'true' || code) {
          setMessage('Verifying authentication...');
          
          // Check if authentication was successful by verifying cookies
          if (user) {
            // Redirect to success page instead of dashboard
            navigate('/auth/success');
            return;
          }
          
          // If no tokens in cookies yet, wait a moment and try again
          setMessage('Finalizing authentication...');
          setTimeout(async () => {
            if (user) {
              navigate('/auth/success');
            } else {
              setMessage('Authentication verification failed. Please try again.');
              setTimeout(() => {
                toast.error('Authentication failed. Please try again.');
                navigate('/login');
              }, 2000);
            }
          }, 2000);
          
        } else {
          // No valid parameters found, but check if cookies indicate successful auth
          if (user) {
            navigate('/auth/success');
            return;
          }
          
          // No valid parameters and no authentication
          setMessage('Invalid authentication response. Redirecting...');
          setTimeout(() => {
            toast.error('Invalid authentication response.');
            navigate('/login');
          }, 2000);
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/login');
      } finally {
        // Don't set isProcessing to false immediately if we're waiting for verification
        if (!searchParams.get('success') && !searchParams.get('code')) {
          setIsProcessing(false);
        }
      }
    };

    // Add a small delay to let the page content load
    const timeoutId = setTimeout(handleOAuthCallback, 500);
    return () => clearTimeout(timeoutId);
  }, [searchParams, navigate, dispatch]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            {message}
          </h2>
          <p className="mt-2 text-gray-600">
            Please wait while we complete your Google authentication.
          </p>
          
          {/* Show additional message if taking longer than expected */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> If you see any JSON data, don't worry - we're processing your login. 
              You'll be redirected to a clean success page shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default OAuthCallback; 