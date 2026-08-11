import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import type { RootState } from '../../features/store';

export const ProfileSettings: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        bio: user?.bio || '',
        location: user?.location || '',
        company: user?.company || '',
        website: user?.website || '',
        displayEmail: user?.displayEmail || false,
        socialLinks: user?.socialLinks || ['', '', '']
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // TODO: Implement API call to update profile
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold bg-gradient-to-r from-gitbase-gradient-start to-gitbase-gradient-end text-transparent bg-clip-text">
                    Public Profile
                </h2>
                <p className="mt-1 text-sm text-gitbase-text-secondary">
                    This information will be displayed publicly so be careful what you share.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture */}
                <div>
                    <label className="block text-sm font-medium text-gitbase-text-primary">
                        Profile picture
                    </label>
                    <div className="mt-2 flex items-center space-x-4">
                        <img
                            src={user?.profilePictureUrl || 'default-avatar.png'}
                            alt="Profile"
                            className="h-16 w-16 rounded-lg object-cover border-2 border-gitbase-border-light/10"
                        />
                        <button
                            type="button"
                            className="px-4 py-2 bg-white/5 text-gitbase-text-primary hover:bg-white/10 
                     font-medium rounded-lg transition-all duration-200"
                        >
                            Change
                        </button>
                    </div>
                </div>

                {/* Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gitbase-text-primary">
                        Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full rounded-lg bg-white/5 border border-gitbase-border-light/10 text-gitbase-text-primary 
                   shadow-sm focus:border-gitbase-primary focus:ring-gitbase-primary sm:text-sm px-4 py-2"
                    />
                </div>

                {/* Bio */}
                <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gitbase-text-primary">
                        Bio
                    </label>
                    <textarea
                        id="bio"
                        rows={3}
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="mt-1 block w-full rounded-lg bg-white/5 border border-gitbase-border-light/10 text-gitbase-text-primary 
                   shadow-sm focus:border-gitbase-primary focus:ring-gitbase-primary sm:text-sm px-4 py-2"
                    />
                    <p className="mt-2 text-sm text-gitbase-text-secondary">
                        Brief description of who you are
                    </p>
                </div>

                {/* Location */}
                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gitbase-text-primary">
                        Location
                    </label>
                    <input
                        type="text"
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="mt-1 block w-full rounded-lg bg-white/5 border border-gitbase-border-light/10 text-gitbase-text-primary 
                   shadow-sm focus:border-gitbase-primary focus:ring-gitbase-primary sm:text-sm px-4 py-2"
                    />
                </div>

                {/* Company */}
                <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gitbase-text-primary">
                        Company
                    </label>
                    <input
                        type="text"
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="mt-1 block w-full rounded-lg bg-white/5 border border-gitbase-border-light/10 text-gitbase-text-primary 
                   shadow-sm focus:border-gitbase-primary focus:ring-gitbase-primary sm:text-sm px-4 py-2"
                    />
                </div>

                {/* Website */}
                <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gitbase-text-primary">
                        Website
                    </label>
                    <input
                        type="url"
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="mt-1 block w-full rounded-lg bg-white/5 border border-gitbase-border-light/10 text-gitbase-text-primary 
                   shadow-sm focus:border-gitbase-primary focus:ring-gitbase-primary sm:text-sm px-4 py-2"
                    />
                </div>

                {/* Social Links */}
                <div>
                    <label className="block text-sm font-medium text-gitbase-text-primary mb-2">
                        Social links
                    </label>
                    <div className="space-y-2">
                        {formData.socialLinks.map((link, index) => (
                            <input
                                key={index}
                                type="url"
                                value={link}
                                onChange={(e) => {
                                    const newLinks = [...formData.socialLinks];
                                    newLinks[index] = e.target.value;
                                    setFormData({ ...formData, socialLinks: newLinks });
                                }}
                                className="block w-full rounded-lg bg-white/5 border border-gitbase-border-light/10 text-gitbase-text-primary 
                        shadow-sm focus:border-gitbase-primary focus:ring-gitbase-primary sm:text-sm px-4 py-2"
                                placeholder={`Social link ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Email Visibility */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="displayEmail"
                        checked={formData.displayEmail}
                        onChange={(e) => setFormData({ ...formData, displayEmail: e.target.checked })}
                        className="h-4 w-4 rounded border-gitbase-border-light/10 text-gitbase-primary focus:ring-gitbase-primary"
                    />
                    <label htmlFor="displayEmail" className="ml-2 block text-sm text-gitbase-text-primary">
                        Display email on public profile
                    </label>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-gradient-to-r from-gitbase-gradient-start to-gitbase-gradient-end text-white 
                   font-medium rounded-lg shadow-lg shadow-gitbase-primary/20 hover:shadow-xl 
                   hover:shadow-gitbase-primary/30 transition-all duration-200"
                    >
                        Save changes
                    </button>
                </div>
            </form>
        </div>
    );
};
