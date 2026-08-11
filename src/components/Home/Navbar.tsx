import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../features/store';
import { useAuth } from '../../hooks/useAuth';

const Navbar: React.FC = () => {
    const { user } = useAppSelector(state => state.auth);
    const { logout } = useAuth();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const handleLogout = async () => {
        await logout();
        window.location.href = '/login';
    };
    return (
        <nav className="bg-white/5 backdrop-blur-xl border-b border-gitbase-border-light/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-3">
                            <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-gitbase-gradient-start via-gitbase-gradient-mid to-gitbase-gradient-end rounded-xl shadow-lg">
                                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12v-2a2 2 0 0 0-2-2h-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-2h2a2 2 0 0 0 2-2zm-6 0H4V6h12v6zm2 0h2v2h-2v-2z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-gitbase-gradient-start via-gitbase-gradient-mid to-gitbase-gradient-end text-transparent bg-clip-text">
                                GitBase
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <div className="relative flex items-center space-x-4">
                                <Link
                                    to="/dashboard"
                                    className="px-4 py-2 text-gitbase-text-dark hover:text-gitbase-primary transition-colors duration-200 flex items-center space-x-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <span>Dashboard</span>
                                </Link>

                                <div className="relative">
                                    <button
                                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                                        className="flex items-center space-x-2 focus:outline-none"
                                    >
                                        {user.profilePictureUrl ? (
                                            <img
                                                src={user.profilePictureUrl}
                                                alt={user.name}
                                                className="w-8 h-8 rounded-lg border-2 border-gitbase-primary shadow-md object-cover"
                                                referrerPolicy="no-referrer"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-lg border-2 border-gitbase-primary shadow-md bg-gitbase-secondary flex items-center justify-center">
                                                <svg className="h-4 w-4 text-gitbase-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                        )}
                                        <svg className={`w-4 h-4 text-gitbase-text-dark transition-transform duration-200 ${showProfileMenu ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {showProfileMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 border border-gitbase-border-light z-50">
                                            <Link
                                                to="/settings"
                                                className="block px-4 py-2 text-sm text-gitbase-text-dark hover:bg-gitbase-primary/5 hover:text-gitbase-primary"
                                            >
                                                Settings
                                            </Link>
                                            <Link
                                                to="/new"
                                                className="block px-4 py-2 text-sm text-gitbase-text-dark hover:bg-gitbase-primary/5 hover:text-gitbase-primary"
                                            >
                                                New Repository
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-gitbase-danger hover:bg-gitbase-danger/5"
                                            >
                                                Sign out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-gitbase-text-dark hover:text-gitbase-primary transition-colors duration-200"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-gitbase-gradient-start to-gitbase-gradient-end text-white hover:opacity-90 transition-opacity duration-200 shadow-lg shadow-gitbase-primary/20"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
