import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import TaskForm from "../TaskForm";
import { TaskPriority, TaskStatus } from "../../types";
import { useCreateTask, useUpdateTask } from "../../hooks/useTasks";

// Mock the hooks
vi.mock("../../hooks/useTasks", () => ({
  useCreateTask: vi.fn(),
  useUpdateTask: vi.fn(),
}));

describe("TaskForm", () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();
  const mockCreateMutate = vi.fn();
  const mockUpdateMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCreateTask).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
      error: null,
    } as any);

    vi.mocked(useUpdateTask).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
      error: null,
    } as any);
  });

  it("renders correctly in creation mode", () => {
    render(<TaskForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    expect(screen.getByText(/Create New Task/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Title \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Due Date/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Status/i)).not.toBeInTheDocument();
  });

  it("renders correctly with initial values in edit mode", () => {
    const mockTask = {
      id: "1",
      title: "Existing Task",
      description: "Existing Description",
      priority: TaskPriority.HIGH,
      status: TaskStatus.IN_PROGRESS,
      created_by_id: "admin",
      created_at: new Date(),
      updated_at: new Date(),
    };

    render(
      <TaskForm
        task={mockTask as any}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,
    );

    expect(screen.getByText(/Edit Task/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("Existing Task")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Existing Description"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
  });

  it("shows validation error when title is empty", () => {
    render(<TaskForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByRole("button", { name: /Create Task/i }));

    expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
    expect(mockCreateMutate).not.toHaveBeenCalled();

    // Clear error on change
    fireEvent.change(screen.getByLabelText(/Title \*/i), {
      target: { value: "A" },
    });
    expect(screen.queryByText(/Title is required/i)).not.toBeInTheDocument();
  });

  it("handles null/missing description and assigned_to_id in submission", () => {
    render(<TaskForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    fireEvent.change(screen.getByLabelText(/Title \*/i), {
      target: { value: "Minimal Task" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Create Task/i }));
    
    expect(mockCreateMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        description: null,
        assigned_to_id: null,
      }),
      expect.any(Object),
    );
  });


  it("calls useCreateTask mutate with correct data on submission", () => {
    render(<TaskForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText(/Title \*/i), {
      target: { value: "New Task" },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "New Description" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Create Task/i }));

    expect(mockCreateMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "New Task",
        description: "New Description",
      }),
      expect.any(Object),
    );
  });

  it("calls useUpdateTask mutate with correct data on submission in edit mode", () => {
    const mockTask = {
      id: "1",
      title: "Old Title",
      priority: TaskPriority.LOW,
      status: TaskStatus.PENDING,
      created_by_id: "admin",
      created_at: new Date(),
      updated_at: new Date(),
    };

    render(
      <TaskForm
        task={mockTask as any}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Title \*/i), {
      target: { value: "Updated Title" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update Task/i }));

    expect(mockUpdateMutate).toHaveBeenCalledWith(
      {
        id: "1",
        data: expect.objectContaining({
          title: "Updated Title",
        }),
      },
      expect.any(Object),
    );
  });

  it("calls onCancel when Cancel button is clicked", () => {
    render(<TaskForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("displays server error detail when mutation fails", () => {
    vi.mocked(useCreateTask).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
      error: {
        response: {
          data: { detail: "Server error occurred" }
        }
      } as any,
    });

    render(<TaskForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    expect(screen.getByText("Server error occurred")).toBeInTheDocument();
  });

  it("displays default server error when detail is missing", () => {
    vi.mocked(useCreateTask).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
      error: new Error("Generic error"),
    } as any);

    render(<TaskForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    expect(screen.getByText("An error occurred while saving the task.")).toBeInTheDocument();
  });
});

