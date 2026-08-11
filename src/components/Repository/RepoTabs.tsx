import { useNavigate } from 'react-router-dom';

export type RepoTab = 'code' | 'issues' | 'pulls' | 'settings';

interface RepoTabsProps {
  username: string;
  repo: string;
  active: RepoTab;
  /** Settings is owner-only, so the tab is hidden for everyone else. */
  showSettings?: boolean;
  /** Rendered on the Code tab, which keeps its sub-views in local state. */
  onCode?: () => void;
}

/** Shared repository tab bar, so every repo page navigates identically. */
export function RepoTabs({ username, repo, active, showSettings, onCode }: RepoTabsProps) {
  const navigate = useNavigate();
  const base = `/gitbase/${username}/${repo}`;

  const cls = (isActive: boolean) =>
    `px-3 py-2 text-sm border-b-2 -mb-px transition-colors ${
      isActive
        ? 'border-gitbase-primary text-white'
        : 'border-transparent text-gitbase-text-secondary hover:text-gitbase-text-primary'
    }`;

  return (
    <div className="flex items-center gap-1 border-b border-gitbase-border-dark/30 mb-4">
      <button
        onClick={() => (onCode ? onCode() : navigate(base))}
        className={cls(active === 'code')}
      >
        Code
      </button>
      <button onClick={() => navigate(`${base}/issues`)} className={cls(active === 'issues')}>
        Issues
      </button>
      <button onClick={() => navigate(`${base}/pulls`)} className={cls(active === 'pulls')}>
        Pull requests
      </button>
      {showSettings && (
        <button onClick={() => navigate(`${base}/settings`)} className={cls(active === 'settings')}>
          Settings
        </button>
      )}
    </div>
  );
}
