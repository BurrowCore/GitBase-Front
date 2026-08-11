import React from 'react';
import Navbar from '../components/Home/Navbar';
import SearchBar from '../components/Home/SearchBar';

const Home: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gitbase-secondary-light to-white">
            <Navbar />

            <div className="relative">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -left-10 top-10 w-72 h-72 bg-gitbase-purple/10 rounded-full blur-3xl" />
                    <div className="absolute right-0 top-0 w-96 h-96 bg-gitbase-accent/10 rounded-full blur-3xl" />
                    <div className="absolute left-1/3 top-1/3 w-64 h-64 bg-gitbase-pink/10 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="pt-20 pb-32 text-center">
                        <h1 className="text-5xl md:text-6xl font-bold text-gitbase-text-dark mb-6">
                            Where{' '}
                            <span className="bg-gradient-to-r from-gitbase-gradient-start via-gitbase-gradient-mid to-gitbase-gradient-end text-transparent bg-clip-text">
                                Innovation
                            </span>{' '}
                            Meets Collaboration
                        </h1>
                        <p className="text-xl text-gitbase-text-muted mb-12 max-w-3xl mx-auto">
                            Build, share, and discover amazing projects with developers around the world.
                            Your journey to better code starts here.
                        </p>

                        <div className="flex justify-center mb-16">
                            <SearchBar />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
                            <div className="p-6 bg-white/50 backdrop-blur-xl rounded-2xl border border-gitbase-border-light shadow-xl hover:shadow-2xl transition-shadow duration-300">
                                <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-r from-gitbase-purple to-gitbase-pink flex items-center justify-center mx-auto">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gitbase-text-dark mb-2">Create & Innovate</h3>
                                <p className="text-gitbase-text-muted">
                                    Start new projects, experiment with ideas, and build the next big thing.
                                </p>
                            </div>

                            <div className="p-6 bg-white/50 backdrop-blur-xl rounded-2xl border border-gitbase-border-light shadow-xl hover:shadow-2xl transition-shadow duration-300">
                                <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-r from-gitbase-blue to-gitbase-cyan flex items-center justify-center mx-auto">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gitbase-text-dark mb-2">Collaborate & Share</h3>
                                <p className="text-gitbase-text-muted">
                                    Work together with developers worldwide and share your knowledge.
                                </p>
                            </div>

                            <div className="p-6 bg-white/50 backdrop-blur-xl rounded-2xl border border-gitbase-border-light shadow-xl hover:shadow-2xl transition-shadow duration-300">
                                <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-r from-gitbase-accent to-gitbase-success flex items-center justify-center mx-auto">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gitbase-text-dark mb-2">Secure & Reliable</h3>
                                <p className="text-gitbase-text-muted">
                                    Your code is safe with us. Industry-leading security for your projects.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
