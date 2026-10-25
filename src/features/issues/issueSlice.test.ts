import { describe, expect, it } from 'vitest';
import type { Issue, IssueRef } from '../../types/issue';
import reducer, {
  addDependency,
  clearCurrent,
  closeIssue,
  enterRepository,
  fetchDependencies,
  fetchIssue,
  removeDependency,
  setFilter,
  setPageNum,
  setSearch,
} from './issueSlice';

const initial = reducer(undefined, { type: '@@init' });
const args = { username: 'alice', repo: 'demo', number: 5 };
const ref = (number: number, state: 'OPEN' | 'CLOSED' = 'OPEN'): IssueRef => ({ number, title: `#${number}`, state });

describe('issueSlice', () => {
  it('returns to the first page whenever a filter changes', () => {
    let state = reducer(initial, setPageNum(3));
    state = reducer(state, setFilter('CLOSED'));
    expect(state.pageNum).toBe(0);

    state = reducer(reducer(state, setPageNum(2)), setSearch('crash'));
    expect(state.pageNum).toBe(0);
    expect(state.search).toBe('crash');
  });

  it('never goes to a negative page', () => {
    expect(reducer(initial, setPageNum(-1)).pageNum).toBe(0);
  });

  it('keeps a blocked close as an action error, not a load error', () => {
    const action = closeIssue.rejected(null, 'req', args, 'Issue #5 is blocked by open issue(s) #3');
    const state = reducer(initial, action);
    expect(state.actionError).toMatch(/blocked by/);
    expect(state.currentError).toBeNull();
  });

  it('stores both dependency directions and keeps "blocked by" sorted as links are added', () => {
    let state = reducer(initial, fetchIssue.pending('req', args));
    state = reducer(state, fetchDependencies.fulfilled({ blockedBy: [ref(4)], blocks: [ref(9)] }, 'req', args));
    state = reducer(state, addDependency.fulfilled(ref(2), 'req', { ...args, dependency: 2 }));
    expect(state.blockedBy.map(r => r.number)).toEqual([2, 4]);
    expect(state.blocks.map(r => r.number)).toEqual([9]);

    state = reducer(state, removeDependency.fulfilled(4, 'req', { ...args, dependency: 4 }));
    expect(state.blockedBy.map(r => r.number)).toEqual([2]);
  });

  it('surfaces a rejected cycle', () => {
    const action = addDependency.rejected(null, 'req', { ...args, dependency: 1 },
      '#1 already depends on #5 (directly or indirectly) — that would be a circular dependency');
    expect(reducer(initial, action).dependencyError).toMatch(/circular/);
  });

  it('clears the issue and its dependencies when leaving the page', () => {
    let state = reducer(initial, fetchIssue.pending('req', args));
    state = reducer(state, closeIssue.fulfilled({ number: 5 } as Issue, 'req', args));
    state = reducer(state, fetchDependencies.fulfilled({ blockedBy: [ref(1)], blocks: [] }, 'req', args));
    state = reducer(state, clearCurrent());
    expect(state.current).toBeNull();
    expect(state.blockedBy).toEqual([]);
  });

  it('ignores responses for an issue the user already navigated away from', () => {
    let state = reducer(initial, fetchIssue.pending('a', args));
    state = reducer(state, fetchIssue.pending('b', { ...args, number: 6 }));
    state = reducer(state, fetchIssue.fulfilled({ number: 5 } as Issue, 'a', args));
    state = reducer(state, fetchDependencies.fulfilled({ blockedBy: [ref(1)], blocks: [] }, 'a', args));
    expect(state.current).toBeNull();
    expect(state.blockedBy).toEqual([]);
  });

  it('keeps filters when returning to the same repository, resets them for another', () => {
    let state = reducer(initial, enterRepository('alice/demo'));
    state = reducer(state, setFilter('CLOSED'));
    state = reducer(state, enterRepository('alice/demo'));
    expect(state.filter).toBe('CLOSED');
    state = reducer(state, enterRepository('bob/other'));
    expect(state.filter).toBe('OPEN');
  });
});
