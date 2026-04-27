import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import TaskDetailsView from '../TaskDetailsView';
import { TaskPriority, TaskStatus } from '../../types';
import * as useTasks from '../../hooks/useTasks';

// Mock the hooks
vi.mock('../../hooks/useTasks', () => ({
  useUpdateTask: vi.fn(),
}));

describe('TaskDetailsView', () => {
  const mockOnEdit = vi.fn();
  const mockOnClose = vi.fn();
  const mockUpdateMutate = vi.fn();

  const mockTask = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.PENDING,
    assigned_to_id: 'user1',
    created_by_id: 'admin',
    due_date: '2023-12-31T23:59:59Z',
    created_at: '2023-01-01T10:00:00Z',
    updated_at: '2023-01-01T10:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    (useTasks.useUpdateTask as any).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
    });
  });

  it('renders all task metadata correctly', () => {
    render(<TaskDetailsView task={mockTask as any} onEdit={mockOnEdit} onClose={mockOnClose} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();
    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    // Check if dates are formatted (checking for year 2023)
    const dateElements = screen.getAllByText(/2023/);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it('triggers onEdit callback when Edit button is clicked', () => {
    render(<TaskDetailsView task={mockTask as any} onEdit={mockOnEdit} onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Edit Task/i }));
    
    expect(mockOnEdit).toHaveBeenCalled();
  });

  it('triggers onClose callback when Close button is clicked', () => {
    render(<TaskDetailsView task={mockTask as any} onEdit={mockOnEdit} onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Close/i }));
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('triggers updateTask mutation when quick action status buttons are clicked', () => {
    render(<TaskDetailsView task={mockTask as any} onEdit={mockOnEdit} onClose={mockOnClose} />);
    
    const inProgressButton = screen.getByRole('button', { name: /in progress/i });
    fireEvent.click(inProgressButton);
    
    expect(mockUpdateMutate).toHaveBeenCalledWith({
      id: '1',
      data: { status: TaskStatus.IN_PROGRESS },
    });
  });

  it('disables the button for the current status', () => {
    render(<TaskDetailsView task={mockTask as any} onEdit={mockOnEdit} onClose={mockOnClose} />);
    
    const pendingButton = screen.getByRole('button', { name: /pending/i });
    expect(pendingButton).toBeDisabled();
  });
});
