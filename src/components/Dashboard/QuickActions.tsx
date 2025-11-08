import React from 'react';
import { useNavigate } from 'react-router-dom';

export const QuickActions: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="rounded-2xl bg-white/10 backdrop-blur-xl p-8 border border-gitbase-border-light/10 shadow-xl">
            <h3 className="text-lg font-semibold mb-6 bg-gradient-to-r from-gitbase-gradient-start via-gitbase-gradient-mid to-gitbase-gradient-end text-transparent bg-clip-text flex items-center">
                <svg className="w-5 h-5 mr-2 text-gitbase-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => navigate('/new')}
                    className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-gitbase-border-light/10 transition-all duration-200 group backdrop-blur-xl shadow-lg hover:shadow-xl"
                >
                    <div className="p-2 bg-gradient-to-br from-gitbase-gradient-start to-gitbase-gradient-end rounded-lg text-white shadow-lg shadow-gitbase-primary/10">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                    <span className="text-gitbase-text-primary font-medium">New Repository</span>
                </button>
                <button className="flex items-center space-x-3 p-4 rounded-lg bg-gitbase-dark hover:bg-gitbase-secondary border border-gitbase-border transition-all duration-200 group">
                    <div className="p-2 bg-gitbase-accent/10 rounded-lg text-gitbase-accent group-hover:bg-gitbase-accent/20">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <span className="text-gitbase-text-primary font-medium">Clone Repo</span>
                </button>
                <button onClick={() => navigate('/projects')} className="flex items-center space-x-3 p-4 rounded-lg bg-gitbase-dark hover:bg-gitbase-secondary border border-gitbase-border transition-all duration-200 group">
                    <div className="p-2 bg-gitbase-success/10 rounded-lg text-gitbase-success group-hover:bg-gitbase-success/20">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <span className="text-gitbase-text-primary font-medium">Projects</span>
                </button>
                <button className="flex items-center space-x-3 p-4 rounded-lg bg-gitbase-dark hover:bg-gitbase-secondary border border-gitbase-border transition-all duration-200 group">
                    <div className="p-2 bg-gitbase-warning/10 rounded-lg text-gitbase-warning group-hover:bg-gitbase-warning/20">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <span className="text-gitbase-text-primary font-medium">Teams</span>
                </button>
            </div>
        </div>
    );
};
