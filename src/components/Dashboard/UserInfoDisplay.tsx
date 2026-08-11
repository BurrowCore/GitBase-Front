import React from 'react';
import type { UserInfo as UserInfoType } from '../../types/auth';

interface UserInfoDisplayProps {
    user: UserInfoType;
}

export const UserInfoDisplay: React.FC<UserInfoDisplayProps> = ({ user }) => {
    return (
        <div className="rounded-2xl bg-white/10 backdrop-blur-xl p-8 border border-gitbase-border-light/10 shadow-xl">
            <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gitbase-gradient-start via-gitbase-gradient-mid to-gitbase-gradient-end text-transparent bg-clip-text mb-4">
                    Welcome to GitBase!
                </h2>
                <p className="text-gitbase-text-secondary/90 mb-6">
                    Build and ship software on a single, collaborative platform.
                </p>

                <div className="bg-gradient-to-br from-gitbase-dark/50 to-gitbase-secondary/50 backdrop-blur-xl border border-gitbase-border-light/10 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-6 bg-gradient-to-r from-gitbase-gradient-start to-gitbase-gradient-end text-transparent bg-clip-text flex items-center">
                        <svg className="w-5 h-5 mr-2 text-gitbase-primary-light" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        Profile Information
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3 group">
                            <div className="p-2 bg-gitbase-primary/10 rounded-lg text-gitbase-primary group-hover:bg-gitbase-primary/20 transition-colors">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-gitbase-text-secondary text-sm">Name</p>
                                <p className="text-gitbase-text-primary font-medium">{user.name}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 group">
                            <div className="p-2 bg-gitbase-accent/10 rounded-lg text-gitbase-accent group-hover:bg-gitbase-accent/20 transition-colors">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-gitbase-text-secondary text-sm">Email</p>
                                <p className="text-gitbase-text-primary font-medium">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 group">
                            <div className="p-2 bg-gitbase-success/10 rounded-lg text-gitbase-success group-hover:bg-gitbase-success/20 transition-colors">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-gitbase-text-secondary text-sm">ID</p>
                                <p className="text-gitbase-text-primary font-medium">{user.id}</p>
                            </div>
                        </div>

                        {user.roles && user.roles.length > 0 && (
                            <div className="flex items-center space-x-3 group">
                                <div className="p-2 bg-gitbase-warning/10 rounded-lg text-gitbase-warning group-hover:bg-gitbase-warning/20 transition-colors">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gitbase-text-secondary text-sm">Roles</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {user.roles.map(role => (
                                            <span key={role.roleName} className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-gitbase-primary/10 text-gitbase-primary">
                                                {role.roleName}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
