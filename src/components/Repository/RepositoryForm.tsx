import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../features/store';
import { gitService } from '../../services/gitService';
import { useNavigate } from 'react-router-dom';
import { fetchUserRepos } from '../../features/repos/reposSlice';
// ...existing code...
import type { createRepository } from '../../types/git';

interface RepositoryFormProps {
    onSubmit: (data: createRepository) => void;
}

export const RepositoryForm: React.FC<RepositoryFormProps> = ({ onSubmit }) => {
    const { user } = useAppSelector(state => state.auth);

    const dispatch = useAppDispatch();

    const [formData, setFormData] = useState<createRepository>({
        repoName: '',
        isPrivate: true,
        defaultBranch: "main"
    });

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        try {
            const payload: any = {
                ...formData,
                username: user?.name,
                // ensure backend receives the camelCase isPrivate field
                isPrivate: Boolean(formData.isPrivate)
            };
            console.log('Payload for repository creation:', payload);
                const result = await gitService.createRepository(payload as any);
                console.debug('createRepository response', result);
                if (user?.name) dispatch(fetchUserRepos(user.name) as any);
            const username = encodeURIComponent(String(user?.name || ''));
            const repo = encodeURIComponent(String(formData.repoName || ''));
            navigate(`/gitbase/${username}/${repo}`);
        } catch (err) {
            console.error('Failed to create repository', err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Section */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-gitbase-border-light/10">
                <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-gitbase-gradient-start to-gitbase-gradient-end text-transparent bg-clip-text">
                    General
                </h2>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gitbase-text-primary">
                            Repository name <span className="text-gitbase-primary">*</span>
                        </label>
                        <input
                            type="text"
                            id="repoName"
                            value={formData.repoName}
                            onChange={(e) => setFormData({ ...formData, repoName: e.target.value })}
                            className="mt-1 block w-full rounded-lg bg-white/5 border border-gitbase-border-light/10 text-gitbase-text-primary 
                       shadow-sm focus:border-gitbase-primary focus:ring-gitbase-primary sm:text-sm px-4 py-2"
                            required
                        />
                        <p className="mt-1 text-sm text-gitbase-text-secondary">
                            Great repository names are short and memorable.
                        </p>
                    </div>

                    {/* <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gitbase-text-primary">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={""}
                            rows={3}
                            className="mt-1 block w-full rounded-lg bg-white/5 border border-gitbase-border-light/10 text-gitbase-text-primary 
                       shadow-sm focus:border-gitbase-primary focus:ring-gitbase-primary sm:text-sm px-4 py-2"
                        />
                    </div> */}
                </div>
            </div>

            {/* Configuration Section */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-gitbase-border-light/10">
                <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-gitbase-gradient-start to-gitbase-gradient-end text-transparent bg-clip-text">
                    Configuration
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gitbase-text-primary mb-2">
                            Visibility
                        </label>
                        <div className="flex items-center space-x-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isPrivate: false })}
                                className={`px-4 py-2 rounded-lg text-sm font-medium ${!formData.isPrivate
                                    ? 'bg-gitbase-primary text-white'
                                    : 'bg-white/5 text-gitbase-text-primary hover:bg-white/10'
                                    }`}
                            >
                                Public
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isPrivate: true })}
                                className={`px-4 py-2 rounded-lg text-sm font-medium ${formData.isPrivate
                                    ? 'bg-gitbase-primary text-white'
                                    : 'bg-white/5 text-gitbase-text-primary hover:bg-white/10'
                                    }`}
                            >
                                Private
                            </button>
                        </div>
                    </div>

                    {/* <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="readme"
                            checked={formData.hasReadme}
                            onChange={(e) => setFormData({ ...formData, hasReadme: e.target.checked })}
                            className="h-4 w-4 rounded border-gitbase-border-light/10 text-gitbase-primary focus:ring-gitbase-primary"
                        />
                        <label htmlFor="readme" className="ml-2 block text-sm text-gitbase-text-primary">
                            Add a README file
                        </label>
                    </div>

                    <div>
                        <label htmlFor="gitignore" className="block text-sm font-medium text-gitbase-text-primary">
                            Add .gitignore
                        </label>
                        <select
                            id="gitignore"
                            value={formData.gitignoreTemplate}
                            onChange={(e) => setFormData({ ...formData, gitignoreTemplate: e.target.value })}
                            className="mt-1 block w-full rounded-lg bg-white/5 border border-gitbase-border-light/10 text-gitbase-text-primary 
                       shadow-sm focus:border-gitbase-primary focus:ring-gitbase-primary sm:text-sm px-4 py-2"
                        >
                            <option>No .gitignore</option>
                            <option>Node</option>
                            <option>Python</option>
                            <option>Java</option>
                            <option>React</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="license" className="block text-sm font-medium text-gitbase-text-primary">
                            Add a license
                        </label>
                        <select
                            id="license"
                            value={formData.license}
                            onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                            className="mt-1 block w-full rounded-lg bg-white/5 border border-gitbase-border-light/10 text-gitbase-text-primary 
                       shadow-sm focus:border-gitbase-primary focus:ring-gitbase-primary sm:text-sm px-4 py-2"
                        >
                            <option>No license</option>
                            <option>MIT License</option>
                            <option>Apache License 2.0</option>
                            <option>GNU GPLv3</option>
                            <option>BSD 3-Clause</option>
                        </select>
                    </div> */}
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-gitbase-gradient-start to-gitbase-gradient-end text-white 
                   font-medium rounded-lg shadow-lg shadow-gitbase-primary/20 hover:shadow-xl 
                   hover:shadow-gitbase-primary/30 transition-all duration-200"
                >
                    Create repository
                </button>
            </div>
        </form>
    );
};
