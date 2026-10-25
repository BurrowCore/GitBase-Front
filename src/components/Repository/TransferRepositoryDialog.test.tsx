import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { gitService } from '../../services/gitService';
import { TransferRepositoryDialog } from './TransferRepositoryDialog';

vi.mock('../../services/gitService', () => ({ gitService: { transferRepository: vi.fn() } }));

describe('TransferRepositoryDialog', () => {
  it('from an organization page: pick one of your repositories, confirm by name, transfer', async () => {
    const result = { owner: 'acme', repoName: 'api', cloneUrlPath: '/gitbase/acme/api.git' };
    vi.mocked(gitService.transferRepository).mockResolvedValue(result);
    const onTransferred = vi.fn();
    render(<TransferRepositoryDialog owner="alice" org="acme" repoChoices={['web', 'api']}
                                     onClose={vi.fn()} onTransferred={onTransferred} />);

    await userEvent.selectOptions(screen.getByRole('combobox'), 'api');
    const transfer = screen.getByRole('button', { name: 'Transfer' });
    expect(transfer).toBeDisabled();

    await userEvent.type(screen.getByLabelText('Confirm repository name'), 'api');
    await userEvent.click(transfer);

    expect(gitService.transferRepository).toHaveBeenCalledWith('alice', 'api', 'acme');
    expect(onTransferred).toHaveBeenCalledWith(result);
  });

  it('from repository settings: says so when there is no organization to move into', () => {
    render(<TransferRepositoryDialog owner="alice" repo="web" orgChoices={[]} onClose={vi.fn()} onTransferred={vi.fn()} />);
    expect(screen.getByText(/not in any organization where you may create repositories/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Transfer' })).toBeDisabled();
  });
});
