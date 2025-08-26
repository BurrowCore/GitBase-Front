import React from 'react';
import type { Token } from '../../types/token';
import { FiClock, FiKey, FiShield, FiTrash2 } from 'react-icons/fi';

interface TokenTableProps {
    tokens: Token[];
    onRevoke: (id: number) => void;
}

const TokenTable: React.FC<TokenTableProps> = ({ tokens, onRevoke }) => {
    return (
        <div className="bg-white/5 rounded-lg shadow-lg overflow-hidden">
            <div className="min-w-full divide-y divide-gitbase-border-light/10">
                <div className="bg-white/5">
                    <div className="grid grid-cols-4 gap-4 px-6 py-4 text-sm font-medium text-gitbase-text-secondary uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                            <FiKey className="h-4 w-4" />
                            <span>Token Name</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <FiShield className="h-4 w-4" />
                            <span>Scopes</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <FiClock className="h-4 w-4" />
                            <span>Timeline</span>
                        </div>
                        <div className="text-right">Actions</div>
                    </div>
                </div>
                <div className="divide-y divide-gitbase-border-light/10">
                    {tokens.map((token) => (
                        <div key={token.id} className="grid grid-cols-4 gap-4 px-6 py-4 hover:bg-white/5 transition-colors duration-150">
                            <div className="flex items-center">
                                <div>
                                    <div className="text-sm font-medium text-gitbase-text-primary">{token.name}</div>
                                </div>
                            </div>
                            <div>
                                <div className="flex flex-wrap gap-2">
                                    {token.scopes.split(',').map((scope, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gitbase-primary/10 text-gitbase-primary"
                                        >
                                            {scope.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="text-sm text-gitbase-text-secondary">
                                <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs font-medium text-gitbase-text-secondary">Created:</span>
                                        <span>{token.createdAt}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs font-medium text-gitbase-text-secondary">Expires:</span>
                                        <span>{token.expiresAt}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <button
                                    onClick={() => onRevoke(token.id)}
                                    className="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium rounded-lg 
                                    text-white hover:text-red-500 bg-red-500/20 hover:bg-transparent transition-all duration-200"
                                >
                                    <FiTrash2 className="h-4 w-4 mr-2" />
                                    Revoke
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {tokens.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gitbase-text-secondary">No tokens found</div>
                </div>
            )}
        </div>
    );
};

export default TokenTable;
