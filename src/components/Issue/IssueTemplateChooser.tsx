import type { IssueTemplate, IssueTemplates } from '../../types/issue';

interface IssueTemplateChooserProps {
  templates: IssueTemplates;
  /** Called with the chosen template, or null for a blank issue. */
  onPick: (template: IssueTemplate | null) => void;
  onCancel: () => void;
  /** Maintainers see template problems so they can fix them; other viewers don't. */
  showErrors: boolean;
}

/** The "choose a template" step before the new-issue form. */
export function IssueTemplateChooser({ templates, onPick, onCancel, showErrors }: IssueTemplateChooserProps) {
  return (
    <div className="space-y-3">
      <ul className="space-y-2" aria-label="Issue templates">
        {templates.templates.map(template => (
          <li key={template.fileName}
              className="flex items-center justify-between gap-3 rounded-lg border border-gitbase-border-dark/30 bg-gitbase-surface-dark/60 px-4 py-3">
            <div className="min-w-0">
              <div className="text-sm text-gitbase-text-primary font-medium">{template.name}</div>
              {template.about && <div className="text-xs text-gitbase-text-secondary mt-0.5">{template.about}</div>}
            </div>
            <button
              onClick={() => onPick(template)}
              className="px-3 py-1.5 rounded-lg bg-gitbase-primary text-white text-sm font-medium hover:opacity-90 flex-shrink-0"
            >
              Get started
            </button>
          </li>
        ))}

        {templates.contactLinks.map(link => (
          <li key={link.url}
              className="flex items-center justify-between gap-3 rounded-lg border border-gitbase-border-dark/30 px-4 py-3">
            <div className="min-w-0">
              <div className="text-sm text-gitbase-text-primary font-medium">{link.name}</div>
              {link.about && <div className="text-xs text-gitbase-text-secondary mt-0.5">{link.about}</div>}
            </div>
            {/* The server only returns http(s) URLs, so this cannot become a javascript: link. */}
            <a href={link.url} target="_blank" rel="noopener noreferrer"
               className="px-3 py-1.5 rounded-lg bg-white/5 text-sm text-gitbase-text-primary hover:bg-white/10 flex-shrink-0">
              Open ↗
            </a>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3">
        {templates.blankIssuesEnabled && (
          <button onClick={() => onPick(null)} className="text-sm text-gitbase-primary hover:underline">
            Open a blank issue
          </button>
        )}
        <button onClick={onCancel} className="text-sm text-gitbase-text-secondary hover:text-gitbase-text-primary">
          Cancel
        </button>
      </div>

      {showErrors && templates.errors.length > 0 && (
        <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-200">
          <div className="font-medium mb-1">Some template files could not be used:</div>
          <ul className="space-y-0.5 font-mono">
            {templates.errors.map(e => <li key={e.fileName + e.message}>{e.fileName}: {e.message}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
