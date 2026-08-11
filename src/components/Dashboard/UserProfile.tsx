import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserInfo } from '../../types/auth';

interface UserProfileProps {
    user: UserInfo;
    onLogout: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout }) => {
    const navigate = useNavigate();
    return (
        <div className="flex items-center space-x-4">
            <div className="relative">
                <div onClick={() => navigate('/settings')} className="cursor-pointer">
                    {user.profilePictureUrl ? (
                        <img
                            className="h-8 w-8 rounded-lg border-2 border-gitbase-primary shadow-md object-cover hover:border-gitbase-gradient-end transition-colors duration-200"
                            src={user.profilePictureUrl}
                            alt={user.name}
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className="h-8 w-8 rounded-lg border-2 border-gitbase-primary shadow-md bg-gitbase-secondary flex items-center justify-center hover:border-gitbase-gradient-end transition-colors duration-200">
                            <svg className="h-4 w-4 text-gitbase-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    )}
                </div>
                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-gitbase-success rounded-full border-2 border-gitbase-secondary"></div>
            </div>
            <span className="text-gitbase-text-primary font-medium">{user.name}</span>
            <button
                onClick={onLogout}
                className="bg-gitbase-primary/10 hover:bg-gitbase-primary/20 text-gitbase-primary px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sign out</span>
            </button>
        </div>
    );
};
