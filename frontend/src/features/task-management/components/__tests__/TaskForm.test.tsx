import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import TaskForm from "../TaskForm";
import { Task, TaskPriority, TaskStatus } from "../../types";
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
    });

    vi.mocked(useUpdateTask).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
      error: null,
    });
  });

  it("renders correctly in Create mode", () => {
    render(<TaskForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    expect(screen.getByText("Create New Task")).toBeInTheDocument();
    expect(screen.getByLabelText(/Title */i)).toHaveValue("");
    expect(screen.getByLabelText(/Description/i)).toHaveValue("");
    expect(screen.getByLabelText(/Priority/i)).toHaveValue(TaskPriority.MEDIUM);
    expect(
      screen.getByRole("button", { name: /Create Task/i }),
    ).toBeInTheDocument();
  });

  it("renders correctly with initial values in Edit mode", () => {
    const task: Task = {
      id: "1",
      title: "Existing Task",
      description: "Existing Description",
      priority: TaskPriority.HIGH,
      status: TaskStatus.IN_PROGRESS,
      created_by_id: "user1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    render(
      <TaskForm
        task={task}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,    
    );

    expect(screen.getByText("Edit Task")).toBeInTheDocument();
    expect(screen.getByLabelText(/Title */i)).toHaveValue("Existing Task");
    expect(screen.getByLabelText(/Description/i)).toHaveValue(
      "Existing Description",
    );
    expect(screen.getByLabelText(/Priority/i)).toHaveValue(TaskPriority.HIGH);
    expect(screen.getByLabelText(/Status/i)).toHaveValue(
      TaskStatus.IN_PROGRESS,
    );
    expect(
      screen.getByRole("button", { name: /Update Task/i }),
    ).toBeInTheDocument();
  });

  it("shows validation error when title is empty", () => {
    render(<TaskForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByRole("button", { name: /Create Task/i }));

    expect(screen.getByText("Title is required")).toBeInTheDocument();
    expect(mockCreateMutate).not.toHaveBeenCalled();
  });

  it("calls useCreateTask mutate with correct data on submission in Create mode", () => {
    render(<TaskForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText(/Title */i), {
      target: { value: "New Task" },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "New Description" },
    });
    fireEvent.change(screen.getByLabelText(/Priority/i), {
      target: { value: TaskPriority.URGENT },
    });

    fireEvent.click(screen.getByRole("button", { name: /Create Task/i }));

    expect(mockCreateMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "New Task",
        description: "New Description",
        priority: TaskPriority.URGENT,
      }),
      expect.any(Object),
    );
  });

  it("calls useUpdateTask mutate with correct data on submission in Edit mode", () => {
    const task = {
      id: "1",
      title: "Existing Task",
      description: "Existing Description",
      priority: TaskPriority.HIGH,
      status: TaskStatus.IN_PROGRESS,
      created_by_id: "user1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    render(
      <TaskForm
        task={task}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Title */i), {
      target: { value: "Updated Task" },
    });
    fireEvent.change(screen.getByLabelText(/Status/i), {
      target: { value: TaskStatus.COMPLETED },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update Task/i }));

    expect(mockUpdateMutate).toHaveBeenCalledWith(
      {
        id: "1",
        data: expect.objectContaining({
          title: "Updated Task",
          status: TaskStatus.COMPLETED,
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
});
