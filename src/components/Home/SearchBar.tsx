import React, { useState } from 'react';

const SearchBar: React.FC = () => {
    const [searchFocused, setSearchFocused] = useState(false);

    return (
        <div className="relative max-w-2xl w-full">
            <div className={`relative transition-all duration-300 ${searchFocused ? 'scale-105' : 'scale-100'}`}>
                <input
                    type="text"
                    placeholder="Search repositories or users..."
                    className="w-full px-6 py-4 bg-white/90 backdrop-blur-xl rounded-2xl border border-gitbase-border-light shadow-xl focus:shadow-2xl transition-all duration-300 outline-none text-gitbase-text-dark placeholder-gitbase-text-muted"
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                    <kbd className="hidden sm:inline-block px-2 py-1 text-xs text-gitbase-text-muted bg-gitbase-secondary-light rounded-lg">
                        ⌘K
                    </kbd>
                    <button
                        type="button"
                        className="p-2 text-gitbase-text-muted hover:text-gitbase-primary transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className="absolute inset-x-0 top-full mt-2 bg-white rounded-xl border border-gitbase-border-light shadow-xl p-4 hidden">
                <div className="text-sm text-gitbase-text-muted mb-2">
                    Recent searches
                </div>
                <div className="space-y-2">
                    {/* Add recent searches here */}
                </div>
            </div>
        </div>
    );
};

export default SearchBar;
