import React from 'react';

export const Logo: React.FC = () => {
    return (
        <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-gitbase-gradient-start to-gitbase-gradient-end rounded-xl shadow-lg shadow-gitbase-primary/20">
            <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12v-2a2 2 0 0 0-2-2h-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-2h2a2 2 0 0 0 2-2zm-6 0H4V6h12v6zm2 0h2v2h-2v-2z" />
            </svg>
        </div>
    );
};
