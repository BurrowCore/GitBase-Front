import type { PullRequestState } from '../../types/pullRequest';

const STYLES: Record<PullRequestState, { label: string; className: string; icon: string }> = {
  OPEN: { label: 'Open', className: 'bg-green-500/15 text-green-400 border-green-500/30', icon: '⊙' },
  MERGED: { label: 'Merged', className: 'bg-purple-500/15 text-purple-300 border-purple-500/30', icon: '⑂' },
  CLOSED: { label: 'Closed', className: 'bg-red-500/15 text-red-400 border-red-500/30', icon: '⊘' },
};

/** Pill showing a pull request's lifecycle state. */
export function PullRequestBadge({ state, size = 'md' }: { state: PullRequestState; size?: 'sm' | 'md' }) {
  const style = STYLES[state];
  const dims = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${dims} ${style.className}`}>
      <span aria-hidden>{style.icon}</span>
      {style.label}
    </span>
  );
}
