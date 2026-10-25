import { describe, expect, it } from 'vitest';
import { pullRequestFixture } from '../../test/fixtures';
import reducer, { closePullRequest, fetchPullRequest, pullRequestUpdated } from './pullRequestSlice';

const initial = reducer(undefined, { type: '@@init' });

describe('pullRequestSlice', () => {
  it('stores the merged pull request, including how it was merged', () => {
    const merged = pullRequestFixture({ state: 'MERGED', mergeMethod: 'rebase' });
    const state = reducer(initial, pullRequestUpdated(merged));
    expect(state.current?.mergeMethod).toBe('rebase');
  });

  it('keeps a close failure separate from load errors', () => {
    const action = closePullRequest.rejected(null, 'req', { username: 'a', repo: 'r', number: 7 },
      'Only the pull request author or a user with write access can close it');
    const state = reducer(initial, action);
    expect(state.actionError).toMatch(/write access/);
    expect(state.currentError).toBeNull();
  });

  it('replaces the current pull request after a close succeeds', () => {
    const args = { username: 'a', repo: 'r', number: 7 };
    const viewing = reducer(initial, fetchPullRequest.pending('req', args));
    const closed = pullRequestFixture({ state: 'CLOSED' });
    expect(reducer(viewing, closePullRequest.fulfilled(closed, 'req', args)).current?.state).toBe('CLOSED');
  });

  it('ignores a response for a pull request the user already navigated away from', () => {
    let state = reducer(initial, fetchPullRequest.pending('a', { username: 'a', repo: 'r', number: 7 }));
    state = reducer(state, fetchPullRequest.pending('b', { username: 'a', repo: 'r', number: 8 }));
    // #7's slow response arrives after #8 was requested.
    state = reducer(state, fetchPullRequest.fulfilled(pullRequestFixture({ number: 7 }), 'a',
      { username: 'a', repo: 'r', number: 7 }));
    expect(state.current).toBeNull();
    expect(state.currentLoading).toBe(true);
  });
});
