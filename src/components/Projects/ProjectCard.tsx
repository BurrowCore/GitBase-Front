import React from 'react';

type ProjectCardProps = {
  name: string;
  description?: string;
  visibility?: 'Public' | 'Private';
  stars?: number;
  updatedAt?: string;
  onOpen?: () => void;
};

const ProjectCard: React.FC<ProjectCardProps> = ({ name, description, visibility = 'Private', stars = 0, updatedAt, onOpen }) => {
  return (
    <div className="bg-gitbase-surface-dark border border-gitbase-border-dark/30 rounded-2xl p-5 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gradient-to-r from-gitbase-purple to-gitbase-pink flex items-center justify-center text-white text-lg font-semibold">{name.charAt(0).toUpperCase()}</div>
            <div>
              <div className="text-white font-semibold">{name}</div>
              <div className="text-sm text-gitbase-text-secondary">{description || 'No description provided.'}</div>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-gitbase-text-secondary">{visibility}</div>
          <div className="mt-2 text-sm text-gitbase-text-secondary">{stars} ⭐</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-gitbase-text-secondary">Updated {updatedAt || '—'}</div>
        <div className="flex items-center gap-2">
          <button onClick={onOpen} className="px-3 py-1 text-xs bg-white/5 rounded text-gitbase-text-primary">Open</button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
