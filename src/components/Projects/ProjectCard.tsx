import React from 'react';

type ProjectCardProps = {
  name: string;
  visibility?: 'Public' | 'Private';
  entryCount?: number;
  empty?: boolean;
  onOpen?: () => void;
};

const ProjectCard: React.FC<ProjectCardProps> = ({ name, visibility = 'Private', entryCount, empty, onOpen }) => {
  return (
    <button
      onClick={onOpen}
      className="group text-left w-full bg-gitbase-surface-dark border border-gitbase-border-dark/30 rounded-2xl p-5 hover:border-gitbase-primary/50 hover:shadow-xl hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-md bg-gradient-to-r from-gitbase-purple to-gitbase-pink flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold truncate group-hover:text-gitbase-primary">{name}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide border flex-shrink-0 ${
                visibility === 'Private'
                  ? 'border-yellow-500/30 text-yellow-400/90'
                  : 'border-green-500/30 text-green-400/90'
              }`}
            >
              {visibility}
            </span>
          </div>
          <div className="text-sm text-gitbase-text-secondary mt-0.5 truncate">
            {empty ? 'Empty repository' : 'Git repository'}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gitbase-text-secondary">
        <span className="inline-flex items-center gap-1">
          <span>📄</span>
          {empty ? 'no files yet' : `${entryCount ?? 0} top-level item${(entryCount ?? 0) === 1 ? '' : 's'}`}
        </span>
        <span className="text-gitbase-primary opacity-0 group-hover:opacity-100 transition-opacity">Open →</span>
      </div>
    </button>
  );
};

export default ProjectCard;
