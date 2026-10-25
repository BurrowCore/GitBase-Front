import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TeamForm } from './TeamForm';

describe('TeamForm', () => {
  it('submits the team options', async () => {
    const onSubmit = vi.fn();
    render(<TeamForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await userEvent.type(screen.getByLabelText('Team name'), 'backend');
    await userEvent.click(screen.getByRole('radio', { name: /WRITE/ }));
    await userEvent.click(screen.getByLabelText(/all repositories/));
    await userEvent.click(screen.getByRole('button', { name: 'Create team' }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'backend', description: undefined, permission: 'WRITE',
      includesAllRepositories: true, canCreateOrgRepo: false,
    });
  });

  it('cannot be submitted without a name', () => {
    render(<TeamForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Create team' })).toBeDisabled();
  });
});
