import React, { useState } from 'react';
import { DashboardNavbar } from '../components/Dashboard/DashboardNavbar';
import { ProfileSettings } from '../components/Settings/ProfileSettings';
import { SecuritySettings } from '../components/Settings/SecuritySettings';
import { AccountSettings } from '../components/Settings/AccountSettings';

export const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('profile');

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return <ProfileSettings />;
            case 'security':
                return <SecuritySettings />;
            case 'account':
                return <AccountSettings />;
            default:
                return <ProfileSettings />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gitbase-dark via-gitbase-secondary to-gitbase-dark">
            <DashboardNavbar />

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    {/* Sidebar */}
                    <aside className="lg:col-span-3">
                        <nav className="space-y-1">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg ${activeTab === 'profile'
                                        ? 'bg-gitbase-primary/20 text-gitbase-primary'
                                        : 'text-gitbase-text-primary hover:bg-white/5'
                                    }`}
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Public Profile
                            </button>

                            <button
                                onClick={() => setActiveTab('security')}
                                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg ${activeTab === 'security'
                                        ? 'bg-gitbase-primary/20 text-gitbase-primary'
                                        : 'text-gitbase-text-primary hover:bg-white/5'
                                    }`}
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                Access Tokens
                            </button>

                            <button
                                onClick={() => setActiveTab('account')}
                                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg ${activeTab === 'account'
                                        ? 'bg-gitbase-primary/20 text-gitbase-primary'
                                        : 'text-gitbase-text-primary hover:bg-white/5'
                                    }`}
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Account Settings
                            </button>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="mt-8 lg:mt-0 lg:col-span-9">
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-gitbase-border-light/10 shadow-xl">
                            {renderContent()}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};
