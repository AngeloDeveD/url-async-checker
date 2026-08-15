import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CreateJobForm } from './CreateJobForm';

// Мокаем хук Zustand store
const mockCreateJob = vi.fn().mockResolvedValue('test-job-id-123');

vi.mock('../store/useJobsStore', () => ({
  useJobsStore: () => ({
    createJob: mockCreateJob,
    isCreating: false,
  }),
}));

describe('CreateJobForm Component', () => {
  it('renders form and disables submit button when textarea is empty', () => {
    render(<CreateJobForm />);
    
    expect(screen.getByPlaceholderText(/https:\/\/example.com/i)).toBeInTheDocument();
    const submitBtn = screen.getByRole('button', { name: /Start Verification/i });
    expect(submitBtn).toBeDisabled();
  });

  it('fills textarea when clicking "Sample URLs" button and enables submit button', () => {
    render(<CreateJobForm />);
    
    const sampleBtn = screen.getByRole('button', { name: /Sample URLs/i });
    fireEvent.click(sampleBtn);

    const textarea = screen.getByPlaceholderText(/https:\/\/example.com/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain('https://google.com');

    const submitBtn = screen.getByRole('button', { name: /Start Verification/i });
    expect(submitBtn).toBeEnabled();
  });

  it('calls createJob on form submission with non-empty URLs', async () => {
    render(<CreateJobForm />);
    
    const sampleBtn = screen.getByRole('button', { name: /Sample URLs/i });
    fireEvent.click(sampleBtn);

    const submitBtn = screen.getByRole('button', { name: /Start Verification/i });
    fireEvent.click(submitBtn);

    expect(mockCreateJob).toHaveBeenCalled();
  });
});