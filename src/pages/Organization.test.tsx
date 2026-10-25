import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import authReducer from '../features/auth/authSlice';
import orgReducer from '../features/orgs/orgSlice';
import { orgService } from '../services/orgService';
import type { Organization as Org } from '../types/org';
import Organization from './Organization';

vi.mock('../components/Dashboard/DashboardNavbar', () => ({ DashboardNavbar: () => null }));
vi.mock('../services/gitService', () => ({
  gitService: { listRepositories: vi.fn().mockResolvedValue([{ repoName: 'api', private: false, root: null }]) },
}));
vi.mock('../services/orgService', () => ({
  orgService: { get: vi.fn(), members: vi.fn(), teams: vi.fn() },
}));

function profile(overrides: Partial<Org>): Org {
  return {
    name: 'acme', fullName: 'Acme Inc.', description: null, createdAt: 0, repositoryCount: 1,
    viewerIsMember: false, viewerIsOwner: false, viewerCanCreateRepository: false, ...overrides,
  };
}

function renderPage() {
  const store = configureStore({ reducer: { orgs: orgReducer, auth: authReducer } });
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/orgs/acme']}>
        <Routes><Route path="/orgs/:org" element={<Organization />} /></Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe('Organization page', () => {
  beforeEach(() => vi.mocked(orgService.get).mockReset());

  it('shows outsiders only the public profile and repositories', async () => {
    vi.mocked(orgService.get).mockResolvedValue(profile({}));
    renderPage();

    expect(await screen.findByText('Acme Inc.')).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /api/ })).toHaveAttribute('href', '/gitbase/acme/api');
    expect(screen.queryByRole('tab', { name: 'People' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Settings' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'New repository' })).not.toBeInTheDocument();
  });

  it('gives owners the People, Teams and Settings tabs and repository creation', async () => {
    vi.mocked(orgService.get).mockResolvedValue(
      profile({ viewerIsMember: true, viewerIsOwner: true, viewerCanCreateRepository: true }));
    renderPage();

    expect(await screen.findByRole('tab', { name: 'People' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Teams' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'New repository' })).toHaveAttribute('href', '/new?owner=acme');
  });
});
