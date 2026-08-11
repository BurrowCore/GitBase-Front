import React from 'react';
import { DashboardNavbar } from '../components/Dashboard/DashboardNavbar';
import { RepositoryForm } from '../components/Repository/RepositoryForm';
import { useNavigate } from 'react-router-dom';
import type { createRepository } from '../types/git';

export const NewRepository: React.FC = () => {
    const navigate = useNavigate();

    const handleCreateRepository = (formData: createRepository) => {
        console.log('Creating repository:', formData);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gitbase-dark via-gitbase-secondary to-gitbase-dark">
            <DashboardNavbar />

            <main className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gitbase-gradient-start via-gitbase-gradient-mid to-gitbase-gradient-end text-transparent bg-clip-text">
                        Create a new repository
                    </h1>
                    <p className="mt-2 text-gitbase-text-secondary">
                        A repository contains all your project's files, version history, and collaborative features.
                    </p>
                </div>

                <RepositoryForm onSubmit={handleCreateRepository} />
            </main>
        </div>
    );
};
