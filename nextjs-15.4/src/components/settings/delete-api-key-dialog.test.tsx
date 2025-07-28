import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteApiKeyDialog } from './delete-api-key-dialog';

// Mock the server action
vi.mock('@/lib/actions/apikeys', () => ({
  deleteApiKeyAction: vi.fn()
}));

describe('DeleteApiKeyDialog', () => {
  const mockProps = {
    keyId: 'test-key-id',
    keyName: 'Test API Key'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders trash icon button trigger', () => {
    render(<DeleteApiKeyDialog {...mockProps} />);
    
    const triggerButton = screen.getByRole('button');
    expect(triggerButton).toBeInTheDocument();
    expect(triggerButton).toHaveClass('text-red-600');
  });

  it('opens dialog when trash icon is clicked', async () => {
    render(<DeleteApiKeyDialog {...mockProps} />);
    
    const triggerButton = screen.getByRole('button');
    fireEvent.click(triggerButton);
    
    await waitFor(() => {
      expect(screen.getByText('Delete API Key')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to delete the API key "Test API Key"/)).toBeInTheDocument();
    });
  });

  it('shows cancel and delete buttons in dialog', async () => {
    render(<DeleteApiKeyDialog {...mockProps} />);
    
    const triggerButton = screen.getByRole('button');
    fireEvent.click(triggerButton);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete key/i })).toBeInTheDocument();
    });
  });

  it('closes dialog when cancel is clicked', async () => {
    render(<DeleteApiKeyDialog {...mockProps} />);
    
    const triggerButton = screen.getByRole('button');
    fireEvent.click(triggerButton);
    
    await waitFor(() => {
      expect(screen.getByText('Delete API Key')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Delete API Key')).not.toBeInTheDocument();
    });
  });

  it('calls deleteApiKeyAction when delete is confirmed', async () => {
    const { deleteApiKeyAction } = await import('@/lib/actions/apikeys');
    const mockDelete = vi.mocked(deleteApiKeyAction);
    mockDelete.mockResolvedValue(undefined);

    render(<DeleteApiKeyDialog {...mockProps} />);
    
    const triggerButton = screen.getByRole('button');
    fireEvent.click(triggerButton);
    
    await waitFor(() => {
      expect(screen.getByText('Delete API Key')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete key/i });
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith(expect.any(FormData));
    });
  });

  it('shows loading state during deletion', async () => {
    const { deleteApiKeyAction } = await import('@/lib/actions/apikeys');
    const mockDelete = vi.mocked(deleteApiKeyAction);
    
    // Mock a delayed response
    mockDelete.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<DeleteApiKeyDialog {...mockProps} />);
    
    const triggerButton = screen.getByRole('button');
    fireEvent.click(triggerButton);
    
    await waitFor(() => {
      expect(screen.getByText('Delete API Key')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete key/i });
    fireEvent.click(deleteButton);
    
    expect(screen.getByText('Deleting...')).toBeInTheDocument();
    expect(deleteButton).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
  });

  it('includes warning text about immediate access loss', async () => {
    render(<DeleteApiKeyDialog {...mockProps} />);
    
    const triggerButton = screen.getByRole('button');
    fireEvent.click(triggerButton);
    
    await waitFor(() => {
      expect(screen.getByText(/any applications using this key will lose access immediately/)).toBeInTheDocument();
    });
  });

  it('displays the API key name in the confirmation message', async () => {
    render(<DeleteApiKeyDialog {...mockProps} />);
    
    const triggerButton = screen.getByRole('button');
    fireEvent.click(triggerButton);
    
    await waitFor(() => {
      expect(screen.getByText(/delete the API key "Test API Key"/)).toBeInTheDocument();
    });
  });
});