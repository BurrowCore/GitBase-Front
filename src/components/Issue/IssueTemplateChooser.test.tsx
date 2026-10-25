import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { IssueTemplates } from '../../types/issue';
import { NewIssueForm } from './NewIssueForm';
import { IssueTemplateChooser } from './IssueTemplateChooser';

vi.mock('../../services/issueService', () => ({ issueService: { create: vi.fn() } }));

const bug = {
  fileName: 'bug.md', name: 'Bug report', about: 'Something is broken', title: '[bug] ',
  labels: ['bug', 'not-a-repo-label'], assignees: [], body: '## Steps to reproduce\n',
};

const templates: IssueTemplates = {
  templates: [bug],
  blankIssuesEnabled: false,
  contactLinks: [{ name: 'Forum', url: 'https://forum.example.com', about: 'Questions go here' }],
  errors: [{ fileName: 'form.yml', message: 'YAML issue forms are not supported yet' }],
};

describe('IssueTemplateChooser', () => {
  it('offers templates and contact links, and hides "blank issue" when the repo disables it', async () => {
    const onPick = vi.fn();
    render(<IssueTemplateChooser templates={templates} onPick={onPick} onCancel={vi.fn()} showErrors={false} />);

    expect(screen.getByText('Bug report')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open ↗' })).toHaveAttribute('href', 'https://forum.example.com');
    expect(screen.queryByRole('button', { name: 'Open a blank issue' })).not.toBeInTheDocument();
    expect(screen.queryByText(/could not be used/)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Get started' }));
    expect(onPick).toHaveBeenCalledWith(bug);
  });

  it('shows template problems to maintainers', () => {
    render(<IssueTemplateChooser templates={templates} onPick={vi.fn()} onCancel={vi.fn()} showErrors />);
    expect(screen.getByText(/form.yml: YAML issue forms/)).toBeInTheDocument();
  });

  it('a chosen template prefills the form, keeping only labels the repository has', () => {
    render(
      <NewIssueForm username="alice" repo="demo" template={bug}
                    labels={[{ name: 'bug', color: 'ff0000', description: null }]}
                    onCreated={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(screen.getByPlaceholderText('Title')).toHaveValue('[bug] ');
    expect(screen.getByPlaceholderText(/Leave a description/)).toHaveValue('## Steps to reproduce\n');
  });
});
