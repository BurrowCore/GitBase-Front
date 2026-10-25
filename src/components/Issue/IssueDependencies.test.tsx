import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { IssueDependencies } from './IssueDependencies';

const props = {
  blockedBy: [{ number: 3, title: 'Fix the API', state: 'OPEN' as const },
              { number: 4, title: 'Old work', state: 'CLOSED' as const }],
  blocks: [{ number: 9, title: 'Release', state: 'OPEN' as const }],
  error: null,
};

describe('IssueDependencies', () => {
  it('warns about open blockers and lists both directions', () => {
    render(<IssueDependencies {...props} canEdit={false} onAdd={vi.fn()} onRemove={vi.fn()} onOpen={vi.fn()} />);
    expect(screen.getByText(/Blocked by 1 open issue/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '#3 Fix the API' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '#9 Release' })).toBeInTheDocument();
  });

  it('read-only viewers get no add or remove controls', () => {
    render(<IssueDependencies {...props} canEdit={false} onAdd={vi.fn()} onRemove={vi.fn()} onOpen={vi.fn()} />);
    expect(screen.queryByLabelText('Add dependency by issue number')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Remove dependency/ })).not.toBeInTheDocument();
  });

  it('adds by number (with or without #) and removes', async () => {
    const onAdd = vi.fn();
    const onRemove = vi.fn();
    render(<IssueDependencies {...props} canEdit onAdd={onAdd} onRemove={onRemove} onOpen={vi.fn()} />);

    await userEvent.type(screen.getByLabelText('Add dependency by issue number'), '#12');
    await userEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onAdd).toHaveBeenCalledWith(12);

    await userEvent.click(screen.getByRole('button', { name: 'Remove dependency on #3' }));
    expect(onRemove).toHaveBeenCalledWith(3);
  });

  it('ignores input that is not an issue number', async () => {
    const onAdd = vi.fn();
    render(<IssueDependencies {...props} canEdit onAdd={onAdd} onRemove={vi.fn()} onOpen={vi.fn()} />);
    await userEvent.type(screen.getByLabelText('Add dependency by issue number'), 'abc');
    await userEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('shows the server error, e.g. a rejected cycle', () => {
    render(<IssueDependencies {...props} error="that would be a circular dependency" canEdit
                              onAdd={vi.fn()} onRemove={vi.fn()} onOpen={vi.fn()} />);
    expect(screen.getByText('that would be a circular dependency')).toBeInTheDocument();
  });
});
