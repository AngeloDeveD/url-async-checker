import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge Component', () => {
  it('renders completed status badge correctly', () => {
    render(<StatusBadge status="completed" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders error status badge correctly', () => {
    render(<StatusBadge status="error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('renders in_progress status with correct text', () => {
    render(<StatusBadge status="in_progress" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('renders cancelled status badge correctly', () => {
    render(<StatusBadge status="cancelled" />);
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });
});