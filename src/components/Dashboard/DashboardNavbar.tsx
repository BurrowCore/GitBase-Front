import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAppSelector } from '../../features/store';
import { UserProfile } from './UserProfile';
import { Logo } from './Logo';

export const DashboardNavbar: React.FC = () => {
    const { user } = useAppSelector(state => state.auth);
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        window.location.href = '/login';
    };

    return (
        <nav className="bg-white/5 backdrop-blur-xl border-b border-gitbase-border-light/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <Logo />
                        <h1 className="text-xl font-semibold text-gitbase-text-primary">GitBase Dashboard</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        {user && <UserProfile user={user} onLogout={handleLogout} />}
                    </div>
                </div>
            </div>
        </nav>
    );
};
