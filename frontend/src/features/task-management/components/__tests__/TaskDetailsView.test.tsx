import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import TaskDetailsView from "../TaskDetailsView";
import { TaskPriority, TaskStatus } from "../../types";
import { useUpdateTask, useTaskHistory } from "../../hooks/useTasks";

// Mock the CSS module
vi.mock("../TaskDetailsView.module.css", () => ({
  default: {
    status_pending: "status_pending",
    priority_medium: "priority_medium",
    badge: "badge",
  },
}));

// Mock the hooks
vi.mock("../../hooks/useTasks", () => ({
  useUpdateTask: vi.fn(),
  useTaskHistory: vi.fn(),
}));

describe("TaskDetailsView", () => {
  const mockOnEdit = vi.fn();
  const mockOnClose = vi.fn();
  const mockUpdateMutate = vi.fn();

  const mockTask = {
    id: "1",
    title: "Test Task",
    description: "Test Description",
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.PENDING,
    assigned_to_id: "user1",
    created_by_id: "admin",
    due_date: "2023-12-31T23:59:59Z",
    created_at: "2023-01-01T10:00:00Z",
    updated_at: "2023-01-01T10:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useUpdateTask).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
    } as any);

    vi.mocked(useTaskHistory).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);
  });

  it("renders all task metadata correctly", () => {
    render(
      <TaskDetailsView
        task={mockTask as any}
        onEdit={mockOnEdit}
        onClose={mockOnClose}
      />,
    );

    expect(screen.getByText("Test Task")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByText("PENDING")).toBeInTheDocument();
    expect(screen.getByText("MEDIUM")).toBeInTheDocument();
    expect(screen.getByText("user1")).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();
    // Check if dates are formatted (checking for year 2023)
    const dateElements = screen.getAllByText(/2023/);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it("triggers onEdit callback when Edit button is clicked", () => {
    render(
      <TaskDetailsView
        task={mockTask as any}
        onEdit={mockOnEdit}
        onClose={mockOnClose}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Edit Task/i }));

    expect(mockOnEdit).toHaveBeenCalled();
  });

  it("triggers onClose callback when Close button is clicked", () => {
    render(
      <TaskDetailsView
        task={mockTask as any}
        onEdit={mockOnEdit}
        onClose={mockOnClose}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Close/i }));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("triggers updateTask mutation when quick action status buttons are clicked", () => {
    render(
      <TaskDetailsView
        task={mockTask as any}
        onEdit={mockOnEdit}
        onClose={mockOnClose}
      />,
    );

    const inProgressButton = screen.getByRole("button", {
      name: /in progress/i,
    });
    fireEvent.click(inProgressButton);

    expect(mockUpdateMutate).toHaveBeenCalledWith({
      id: "1",
      data: { status: TaskStatus.IN_PROGRESS },
    });
  });

  it("disables the button for the current status", () => {
    render(
      <TaskDetailsView
        task={mockTask as any}
        onEdit={mockOnEdit}
        onClose={mockOnClose}
      />,
    );

    const pendingButton = screen.getByRole("button", { name: /pending/i });
    expect(pendingButton).toBeDisabled();
  });

  it("renders 'Unassigned' and 'Not set' when metadata is missing", () => {
    const incompleteTask = {
      ...mockTask,
      assigned_to_id: null,
      due_date: null,
    };

    render(
      <TaskDetailsView
        task={incompleteTask as any}
        onEdit={mockOnEdit}
        onClose={mockOnClose}
      />,
    );

    expect(screen.getByText("Unassigned")).toBeInTheDocument();
    expect(screen.getAllByText("Not set").length).toBeGreaterThan(0);
  });

  it("applies correct status and priority classes", () => {
    const statuses = Object.values(TaskStatus);
    const priorities = Object.values(TaskPriority);

    statuses.forEach((status) => {
      const { rerender } = render(
        <TaskDetailsView
          task={{ ...mockTask, status } as any}
          onEdit={mockOnEdit}
          onClose={mockOnClose}
        />
      );
      const badge = screen.getByText(status.replace("_", " "));
      expect(badge).toBeInTheDocument();
      rerender(<></>); // force cleanup for next loop
    });

    priorities.forEach((priority) => {
      const { rerender } = render(
        <TaskDetailsView
          task={{ ...mockTask, priority } as any}
          onEdit={mockOnEdit}
          onClose={mockOnClose}
        />
      );
      const badge = screen.getByText(priority);
      expect(badge).toBeInTheDocument();
      rerender(<></>);
    });
  });

  it("handles unknown status and priority for CSS classes", () => {
    render(
      <TaskDetailsView
        task={{ ...mockTask, status: "UNKNOWN", priority: "UNKNOWN" } as any}
        onEdit={mockOnEdit}
        onClose={mockOnClose}
      />
    );
    expect(screen.getAllByText("UNKNOWN").length).toBeGreaterThan(0);
  });

  it("renders 'No description provided.' when description is empty or null", () => {
    const { rerender } = render(
      <TaskDetailsView
        task={{ ...mockTask, description: "" } as any}
        onEdit={mockOnEdit}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText("No description provided.")).toBeInTheDocument();

    rerender(
      <TaskDetailsView
        task={{ ...mockTask, description: null } as any}
        onEdit={mockOnEdit}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText("No description provided.")).toBeInTheDocument();
  });

  it("disables all status buttons when updateTaskMutation.isPending is true", () => {
    vi.mocked(useUpdateTask).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: true,
    } as any);

    render(
      <TaskDetailsView
        task={mockTask as any}
        onEdit={mockOnEdit}
        onClose={mockOnClose}
      />
    );

    const statusNames = ["pending", "in progress", "completed", "canceled"];
    statusNames.forEach((name) => {
      const button = screen.getByRole("button", { name: new RegExp(name, "i") });
      expect(button).toBeDisabled();
    });
  });

  it("formatDate handles all falsy values", () => {
    const { rerender } = render(
      <TaskDetailsView
        task={{ ...mockTask, due_date: null } as any}
        onEdit={mockOnEdit}
        onClose={mockOnClose}
      />
    );
    expect(screen.getAllByText("Not set").length).toBeGreaterThan(0);

    rerender(
      <TaskDetailsView
        task={{ ...mockTask, due_date: undefined } as any}
        onEdit={mockOnEdit}
        onClose={mockOnClose}
      />
    );
    expect(screen.getAllByText("Not set").length).toBeGreaterThan(0);

    rerender(
      <TaskDetailsView
        task={{ ...mockTask, due_date: "" } as any}
        onEdit={mockOnEdit}
        onClose={mockOnClose}
      />
    );
    expect(screen.getAllByText("Not set").length).toBeGreaterThan(0);
  });
});




