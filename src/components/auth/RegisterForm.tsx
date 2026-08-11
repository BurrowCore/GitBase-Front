import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { googleLogin } from '../../features/auth/authSlice';
import { authService } from '../../services/authService';
import type { RegisterDTO } from '../../types/auth';
import type { AppDispatch } from '../../features/store';

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState<RegisterDTO>({
    fullName:'',
    name: '',
    email: '',
    password: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    formData.name = formData.email.split('@')[0];
    if (formData.password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await authService.register(formData);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      setIsLoading(true);
      try {
        await dispatch(googleLogin(credentialResponse.credential)).unwrap();
        toast.success('Google registration successful!');
        navigate('/dashboard');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Google registration failed');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleError = () => {
    toast.error('Google registration failed');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gitbase-dark to-gitbase-secondary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 relative">
        {/* Decorative elements */}
        <div className="absolute -left-32 top-0 w-64 h-64 bg-gitbase-gradient-start/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-32 bottom-0 w-64 h-64 bg-gitbase-gradient-end/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative">
          <div className="mx-auto h-16 w-16 flex items-center justify-center bg-gradient-to-r from-gitbase-gradient-start to-gitbase-gradient-end rounded-xl shadow-xl shadow-gitbase-primary/20">
            <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-gitbase-gradient-start via-gitbase-gradient-mid to-gitbase-gradient-end text-transparent bg-clip-text">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gitbase-text-secondary">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="font-medium bg-gradient-to-r from-gitbase-gradient-start to-gitbase-gradient-end text-transparent bg-clip-text hover:opacity-80 transition-opacity"
            >
              Sign in
            </button>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="rounded-2xl bg-white/10 backdrop-blur-xl p-8 border border-gitbase-border-light/10 shadow-xl space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gitbase-text-primary mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gitbase-border-light bg-white/20 backdrop-blur-xl text-gitbase-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-gitbase-primary/50 focus:border-gitbase-primary/50 sm:text-sm placeholder-gitbase-text-secondary/70"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gitbase-text-primary mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gitbase-border-light bg-white/20 backdrop-blur-xl text-gitbase-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-gitbase-primary/50 focus:border-gitbase-primary/50 sm:text-sm placeholder-gitbase-text-secondary/70"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-gitbase-text-primary mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full px-4 py-3 pr-10 border border-gitbase-border-light bg-white/20 backdrop-blur-xl text-gitbase-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-gitbase-primary/50 focus:border-gitbase-primary/50 sm:text-sm placeholder-gitbase-text-secondary/70"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L12 12m-3.122-3.122l4.243 4.243m0 0L16.536 15.536M12 12l.464.464M15.535 8.464L12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                </button>
              </div>
              <div className="relative">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gitbase-text-primary mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full px-4 py-3 pr-10 border border-gitbase-border-light bg-white/20 backdrop-blur-xl text-gitbase-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-gitbase-primary/50 focus:border-gitbase-primary/50 sm:text-sm placeholder-gitbase-text-secondary/70"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showConfirmPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L12 12m-3.122-3.122l4.243 4.243m0 0L16.536 15.536M12 12l.464.464M15.535 8.464L12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

          </div>

          {formData.password && confirmPassword && formData.password !== confirmPassword && (
            <div className="text-gitbase-error text-sm mt-2 bg-gitbase-error/10 p-2 rounded-lg border border-gitbase-error/20">
              Passwords do not match
            </div>
          )}

          <div className="flex items-center mt-6">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-gitbase-primary focus:ring-gitbase-primary/50 border-gitbase-border-light rounded bg-white/20"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gitbase-text-secondary">
              I agree to the{' '}
              <a href="#" className="font-medium text-gitbase-accent hover:text-gitbase-primary transition-colors">
                Terms and Conditions
              </a>{' '}
              and{' '}
              <a href="#" className="font-medium text-gitbase-accent hover:text-gitbase-primary transition-colors">
                Privacy Policy
              </a>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-8 group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-gitbase-gradient-start via-gitbase-gradient-mid to-gitbase-gradient-end hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gitbase-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-gitbase-primary/20"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-5 w-5 text-white mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            )}
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm; 