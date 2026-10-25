import type { PullRequest } from '../types/pullRequest';

/** An open pull request with sensible defaults; override any field per test. */
export function pullRequestFixture(overrides: Partial<PullRequest> = {}): PullRequest {
  return {
    id: 1,
    number: 7,
    title: 'Add things',
    description: null,
    state: 'OPEN',
    sourceBranch: 'feature',
    targetBranch: 'main',
    headSha: null,
    baseSha: null,
    currentHeadSha: 'c'.repeat(40),
    closingIssues: [],
    author: { username: 'alice', fullName: null, avatarUrl: null },
    mergedBy: null,
    mergeCommitSha: null,
    mergeMethod: null,
    commitsCount: 2,
    changedFilesCount: 2,
    commentsCount: 0,
    createdAt: 0,
    updatedAt: 0,
    mergedAt: null,
    closedAt: null,
    ...overrides,
  };
}
