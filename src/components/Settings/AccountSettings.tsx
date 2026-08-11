import React, { useState } from 'react';
import { toast } from 'react-toastify';

export const AccountSettings: React.FC = () => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [password, setPassword] = useState('');

    const handleDeleteAccount = async () => {
        if (!password) {
            toast.error('Please enter your password to confirm');
            return;
        }

        try {
            // TODO: Implement account deletion
            toast.success('Account deleted successfully');
        } catch (error) {
            toast.error('Failed to delete account');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold bg-gradient-to-r from-gitbase-gradient-start to-gitbase-gradient-end text-transparent bg-clip-text">
                    Account Settings
                </h2>
                <p className="mt-1 text-sm text-gitbase-text-secondary">
                    Manage your account settings and preferences.
                </p>
            </div>

            {/* Change Password Section */}
            <div className="p-6 bg-white/5 rounded-lg space-y-4">
                <h3 className="text-lg font-medium text-gitbase-text-primary">Change Password</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gitbase-text-primary">
                            Current password
                        </label>
                        <input
                            type="password"
                            id="currentPassword"
                            className="mt-1 block w-full rounded-lg bg-white/5 border border-gitbase-border-light/10 text-gitbase-text-primary 
                     shadow-sm focus:border-gitbase-primary focus:ring-gitbase-primary sm:text-sm px-4 py-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gitbase-text-primary">
                            New password
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            className="mt-1 block w-full rounded-lg bg-white/5 border border-gitbase-border-light/10 text-gitbase-text-primary 
                     shadow-sm focus:border-gitbase-primary focus:ring-gitbase-primary sm:text-sm px-4 py-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gitbase-text-primary">
                            Confirm new password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="mt-1 block w-full rounded-lg bg-white/5 border border-gitbase-border-light/10 text-gitbase-text-primary 
                     shadow-sm focus:border-gitbase-primary focus:ring-gitbase-primary sm:text-sm px-4 py-2"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            className="px-4 py-2 bg-gradient-to-r from-gitbase-gradient-start to-gitbase-gradient-end text-white 
                       font-medium rounded-lg shadow-lg shadow-gitbase-primary/20 hover:shadow-xl 
                       hover:shadow-gitbase-primary/30 transition-all duration-200"
                        >
                            Update password
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Account Section */}
            <div className="p-6 bg-gitbase-danger/5 rounded-lg space-y-4">
                <h3 className="text-lg font-medium text-gitbase-danger">Danger Zone</h3>
                <p className="text-sm text-gitbase-text-secondary">
                    Once you delete your account, there is no going back. Please be certain.
                </p>

                {!showDeleteConfirm ? (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 bg-gitbase-danger/10 text-gitbase-danger hover:bg-gitbase-danger/20 
                     font-medium rounded-lg transition-all duration-200"
                    >
                        Delete account
                    </button>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-gitbase-danger">
                            Please type your password to confirm account deletion:
                        </p>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full rounded-lg bg-white/5 border border-gitbase-border-light/10 text-gitbase-text-primary 
                     shadow-sm focus:border-gitbase-primary focus:ring-gitbase-primary sm:text-sm px-4 py-2"
                            placeholder="Enter your password"
                        />
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 bg-white/5 text-gitbase-text-primary hover:bg-white/10 
                         font-medium rounded-lg transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                className="px-4 py-2 bg-gitbase-danger text-white hover:bg-gitbase-danger/90 
                         font-medium rounded-lg transition-all duration-200"
                            >
                                Confirm deletion
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
