import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { pullRequestService } from '../../services/pullRequestService';
import { pullRequestFixture } from '../../test/fixtures';
import { MergeBox } from './MergeBox';

vi.mock('../../services/pullRequestService', () => ({
  pullRequestService: { merge: vi.fn() },
}));

const merge = vi.mocked(pullRequestService.merge);

function renderBox(props: Partial<React.ComponentProps<typeof MergeBox>> = {}) {
  const handlers = { onMerged: vi.fn(), onClose: vi.fn(), onReopen: vi.fn() };
  render(
    <MemoryRouter>
      <MergeBox username="alice" repo="demo" pr={pullRequestFixture()} canMerge canClose {...handlers} {...props} />
    </MemoryRouter>,
  );
  return handlers;
}

describe('MergeBox', () => {
  // mockClear, not mockReset: after a reset, Vitest 2 reports a mocked rejection as unhandled even
  // though the component catches it.
  beforeEach(() => merge.mockClear());

  it('offers the three merge methods and defaults to a merge commit', () => {
    renderBox();
    expect(screen.getByRole('radio', { name: 'Create a merge commit' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Squash and merge' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Rebase and merge' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Merge pull request' })).toBeInTheDocument();
  });

  it('squash shows the squash default message and sends mergeMethod=squash', async () => {
    merge.mockResolvedValue({ merged: true, sha: 'abc', mergeMethod: 'squash', message: 'ok' });
    const { onMerged } = renderBox();

    await userEvent.click(screen.getByRole('radio', { name: 'Squash and merge' }));
    expect(screen.getByLabelText('Commit message')).toHaveAttribute('placeholder', 'Add things (#7)');

    await userEvent.click(screen.getByRole('button', { name: 'Squash and merge' }));
    expect(merge).toHaveBeenCalledWith('alice', 'demo', 7,
      { mergeMethod: 'squash', commitMessage: undefined, expectedHeadSha: 'c'.repeat(40) });
    expect(onMerged).toHaveBeenCalled();
  });

  it('rebase hides the message field and never sends a message', async () => {
    merge.mockResolvedValue({ merged: true, sha: 'abc', mergeMethod: 'rebase', message: 'ok' });
    renderBox();

    await userEvent.type(screen.getByLabelText('Commit message'), 'typed before switching');
    await userEvent.click(screen.getByRole('radio', { name: 'Rebase and merge' }));
    expect(screen.queryByLabelText('Commit message')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Rebase and merge' }));
    expect(merge).toHaveBeenCalledWith('alice', 'demo', 7,
      { mergeMethod: 'rebase', commitMessage: undefined, expectedHeadSha: 'c'.repeat(40) });
  });

  it('lists the issues a merge will close', () => {
    renderBox({ pr: pullRequestFixture({ closingIssues: [3, 8] }) });
    expect(screen.getByText(/will close/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '#3' })).toHaveAttribute('href', '/gitbase/alice/demo/issues/3');
    expect(screen.getByRole('link', { name: '#8' })).toBeInTheDocument();
  });

  it('lists conflicting files from a 409', async () => {
    // A plain function rather than the vi.fn spy: Vitest 2's spy re-reports a rejected promise as
    // unhandled even when the caller awaits it. The error has the shape
    // pullRequestService.handleError produces for a 409.
    const service = pullRequestService as { merge: typeof pullRequestService.merge };
    const spy = service.merge;
    service.merge = async () => {
      throw Object.assign(new Error('Rebase conflict while applying abc1234'), { conflicts: ['shared.txt'] });
    };
    try {
      renderBox();
      await userEvent.click(screen.getByRole('button', { name: 'Merge pull request' }));
      expect(await screen.findByText('Rebase conflict while applying abc1234')).toBeInTheDocument();
      expect(screen.getByText('· shared.txt')).toBeInTheDocument();
    } finally {
      service.merge = spy;
    }
  });

  it('hides merge and close controls from viewers without the rights', () => {
    renderBox({ canMerge: false, canClose: false });
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /merge/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Close pull request' })).not.toBeInTheDocument();
    expect(screen.getByText('Only users with write access can merge this pull request.')).toBeInTheDocument();
  });

  it('labels a merged pull request with the method that landed it', () => {
    renderBox({
      pr: pullRequestFixture({
        state: 'MERGED', mergeMethod: 'squash', mergeCommitSha: 'abcdef1234',
        mergedBy: { username: 'carol', fullName: null, avatarUrl: null },
      }),
    });
    expect(screen.getByText(/Squashed and merged by carol/)).toBeInTheDocument();
    expect(screen.getByText('abcdef1')).toBeInTheDocument();
  });
});
