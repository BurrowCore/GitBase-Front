import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { tokenService } from '../../services/tokenService';
import type { Token } from '../../types/token';
import TokenTable from '../Token/TokenTable';

export const SecuritySettings: React.FC = () => {
    const [tokens, setTokens] = useState<Token[]>([]);
    const [showNewTokenForm, setShowNewTokenForm] = useState(false);
    const [newTokenName, setNewTokenName] = useState('');
    const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
    const [newlyGeneratedToken, setNewlyGeneratedToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadTokens();
    }, []);

    const loadTokens = async () => {
        try {
            setLoading(true);
            const tokenList = await tokenService.listTokens();
            setTokens(tokenList);
        } catch (error) {
            console.error('Failed to load tokens:', error);
            toast.error('Failed to load tokens');
        } finally {
            setLoading(false);
        }
    };

    const scopes = [
        { name: 'repo:write', description: 'write in repositories' },
        { name: 'repo:read', description: 'read in repositories' }
    ];

    const handleScopeToggle = (scope: string) => {
        setSelectedScopes(prev =>
            prev.includes(scope)
                ? prev.filter(s => s !== scope)
                : [...prev, scope]
        );
    };

    const generateToken = async () => {
        if (!newTokenName.trim()) {
            toast.error('Please enter a token name');
            return;
        }
        if (selectedScopes.length === 0) {
            toast.error('Please select at least one scope');
            return;
        }

        try {
            setLoading(true);
            const response = await tokenService.createToken({
                name: newTokenName,
                scopes: selectedScopes.join(','),
            });

            await loadTokens(); // Refresh the token list
            setNewlyGeneratedToken(response.token);
            setNewTokenName('');
            setSelectedScopes([]);
            setShowNewTokenForm(false);
            toast.success('Token generated successfully');
        } catch (error) {
            console.error('Failed to generate token:', error);
            toast.error('Failed to generate token');
        } finally {
            setLoading(false);
        }
    };

    const deleteToken = async (tokenId: string) => {
        try {
            setLoading(true);
            await tokenService.revokeToken(tokenId);
            await loadTokens(); // Refresh the token list
            toast.success('Token revoked successfully');
        } catch (error) {
            console.error('Failed to revoke token:', error);
            toast.error('Failed to revoke token');
        } finally {
            setLoading(false);
        }
    }; return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold bg-gradient-to-r from-gitbase-gradient-start to-gitbase-gradient-end text-transparent bg-clip-text">
                    Personal Access Tokens
                </h2>
                <p className="mt-1 text-sm text-gitbase-text-secondary">
                    Tokens you have generated that can be used to access the GitBase API.
                </p>
            </div>

            {newlyGeneratedToken && (
                <div className="bg-gitbase-success/10 border border-gitbase-success/20 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-gitbase-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-gitbase-success">New token generated</h3>
                            <div className="mt-2 text-sm text-gitbase-text-secondary">
                                <p>Make sure to copy your personal access token now. You won't be able to see it again!</p>
                                <div className="mt-2">
                                    <code className="px-2 py-1 font-mono text-sm bg-white/10 rounded-md">
                                        {newlyGeneratedToken}
                                    </code>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end">
                <button
                    onClick={() => setShowNewTokenForm(true)}
                    className="px-4 py-2 bg-gradient-to-r from-gitbase-gradient-start to-gitbase-gradient-end text-white 
                   font-medium rounded-lg shadow-lg shadow-gitbase-primary/20 hover:shadow-xl 
                   hover:shadow-gitbase-primary/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Generate new token'}
                </button>
            </div>

            {showNewTokenForm && (
                <div className="bg-white/5 rounded-lg p-6 space-y-4">
                    <div>
                        <label htmlFor="tokenName" className="block text-sm font-medium text-gitbase-text-primary">
                            Token name
                        </label>
                        <input
                            type="text"
                            id="tokenName"
                            value={newTokenName}
                            onChange={(e) => setNewTokenName(e.target.value)}
                            className="mt-1 block w-full rounded-lg bg-white/5 border border-gitbase-border-light/10 text-gitbase-text-primary 
                       shadow-sm focus:border-gitbase-primary focus:ring-gitbase-primary sm:text-sm px-4 py-2"
                            placeholder="e.g., Development token"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gitbase-text-primary mb-2">
                            Select scopes
                        </label>
                        <div className="space-y-2">
                            {scopes.map(scope => (
                                <label key={scope.name} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedScopes.includes(scope.name)}
                                        onChange={() => handleScopeToggle(scope.name)}
                                        className="h-4 w-4 rounded border-gitbase-border-light/10 text-gitbase-primary focus:ring-gitbase-primary"
                                    />
                                    <span className="ml-2 text-sm text-gitbase-text-primary">{scope.name}</span>
                                    <span className="ml-2 text-xs text-gitbase-text-secondary">- {scope.description}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setShowNewTokenForm(false)}
                            className="px-4 py-2 bg-white/5 text-gitbase-text-primary hover:bg-white/10 
                       font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={generateToken}
                            className="px-4 py-2 bg-gradient-to-r from-gitbase-gradient-start to-gitbase-gradient-end text-white 
                       font-medium rounded-lg shadow-lg shadow-gitbase-primary/20 hover:shadow-xl 
                       hover:shadow-gitbase-primary/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Generating...' : 'Generate token'}
                        </button>
                    </div>
                </div>
            )}

            {/* Existing Tokens */}
            <div className="mt-6">
                <h3 className="text-lg font-medium text-gitbase-text-primary mb-4">Active tokens</h3>
                <TokenTable
                    tokens={tokens}
                    onRevoke={(tokenId: number) => deleteToken(tokenId.toString())}
                />
            </div>
        </div>
    );
};
