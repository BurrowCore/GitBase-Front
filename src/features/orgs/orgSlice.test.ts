import { describe, expect, it } from 'vitest';
import type { Organization, Team } from '../../types/org';
import reducer, { addTeamMember, fetchOrganization, fetchTeams, removeTeamMember } from './orgSlice';

const initial = reducer(undefined, { type: '@@init' });
const org = (name: string): Organization => ({
  name, fullName: null, description: null, createdAt: 0, repositoryCount: 0,
  viewerIsMember: true, viewerIsOwner: true, viewerCanCreateRepository: true,
});
const team = (name: string): Team => ({
  name, description: null, permission: 'READ', includesAllRepositories: false, canCreateOrgRepo: false,
  ownerTeam: false, membersCount: 0, repositoriesCount: 0,
});
const page = <T,>(items: T[]) => ({ items, page: 0, size: 30, totalElements: items.length, hasNext: false });

describe('orgSlice', () => {
  it('drops the previous organization\'s data when another one is opened', () => {
    let state = reducer(initial, fetchOrganization.pending('a', { org: 'acme' }));
    state = reducer(state, fetchOrganization.fulfilled(org('acme'), 'a', { org: 'acme' }));
    state = reducer(state, fetchTeams.fulfilled(page([team('backend')]), 't', { org: 'acme' }));

    state = reducer(state, fetchOrganization.pending('b', { org: 'globex' }));
    expect(state.current).toBeNull();
    expect(state.teams).toEqual([]);
  });

  it('ignores a slow response for an organization the user already left', () => {
    let state = reducer(initial, fetchOrganization.pending('a', { org: 'acme' }));
    state = reducer(state, fetchOrganization.pending('b', { org: 'globex' }));
    state = reducer(state, fetchOrganization.fulfilled(org('acme'), 'a', { org: 'acme' }));
    expect(state.current).toBeNull();
  });

  it('reports a refused change — e.g. removing the last owner — as an action error', () => {
    const action = removeTeamMember.rejected(null, 'r', { org: 'acme', team: 'Owners', username: 'alice' },
      'alice is the last owner of acme — add another owner first');
    expect(reducer(initial, action).actionError).toMatch(/last owner/);
  });

  it('replaces the member list after an add, and drops a removed member', () => {
    const members = [{ username: 'dave', fullName: null, avatarUrl: null }];
    let state = reducer(initial, addTeamMember.fulfilled(members, 'r', { org: 'acme', team: 'backend', username: 'dave' }));
    expect(state.teamMembers).toHaveLength(1);
    state = reducer(state, removeTeamMember.fulfilled('dave', 'r', { org: 'acme', team: 'backend', username: 'dave' }));
    expect(state.teamMembers).toEqual([]);
  });
});
