import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TaskDashboard from "../TaskDashboard";
import { useTasks, useCreateTask, useUpdateTask, useTaskHistory } from "../../hooks/useTasks";
import { TaskStatus, TaskPriority } from "../../types";

// Mock dos hooks
vi.mock("../../hooks/useTasks", () => ({
  useTasks: vi.fn(),
  useCreateTask: vi.fn(),
  useUpdateTask: vi.fn(),
  useTaskHistory: vi.fn(),
}));

const mockTasks = [
  {
    id: "1",
    title: "Task 1",
    description: "Description 1",
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    created_by_id: "user-1",
    assigned_to_id: "user-2",
    is_deleted: false,
  },
];

describe("TaskDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    (useTasks as any).mockReturnValue({
      data: mockTasks,
      isLoading: false,
      isError: false,
      error: null,
    });
    (useCreateTask as any).mockReturnValue({ mutate: vi.fn(), isPending: false });
    (useUpdateTask as any).mockReturnValue({ mutate: vi.fn(), isPending: false });
    (useTaskHistory as any).mockReturnValue({ data: [], isLoading: false });
  });

  it("renders the dashboard header and filters", () => {
    render(<TaskDashboard />);
    expect(screen.getByText("Task Dashboard")).toBeInTheDocument();
    expect(screen.getByText("+ New Task")).toBeInTheDocument();
    expect(screen.getByDisplayValue("All Statuses")).toBeInTheDocument();
    expect(screen.getByDisplayValue("All Priorities")).toBeInTheDocument();
  });

  it("updates filters when selection changes", () => {
    render(<TaskDashboard />);
    
    const statusSelect = screen.getByDisplayValue("All Statuses");
    fireEvent.change(statusSelect, { target: { value: TaskStatus.COMPLETED } });
    
    expect(useTasks).toHaveBeenLastCalledWith(expect.objectContaining({ status: TaskStatus.COMPLETED }));

    const prioritySelect = screen.getByDisplayValue("All Priorities");
    fireEvent.change(prioritySelect, { target: { value: TaskPriority.HIGH } });
    
    expect(useTasks).toHaveBeenLastCalledWith(expect.objectContaining({ 
      status: TaskStatus.COMPLETED, 
      priority: TaskPriority.HIGH 
    }));
  });

  it("clears filters when clear button is clicked", () => {
    render(<TaskDashboard />);
    
    const statusSelect = screen.getByDisplayValue("All Statuses");
    fireEvent.change(statusSelect, { target: { value: TaskStatus.COMPLETED } });
    
    const clearButton = screen.getByText("Clear Filters");
    fireEvent.click(clearButton);
    
    expect(useTasks).toHaveBeenLastCalledWith({ status: null, priority: null });
  });

  it("opens and closes the creation modal", () => {
    render(<TaskDashboard />);
    
    const createButton = screen.getByText("+ New Task");
    fireEvent.click(createButton);
    
    expect(screen.getByText("Create New Task")).toBeInTheDocument();
    
    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);
    
    expect(screen.queryByText("Create New Task")).not.toBeInTheDocument();
  });

  it("opens task details when a task is clicked", () => {
    render(<TaskDashboard />);
    
    const taskCard = screen.getByText("Task 1");
    fireEvent.click(taskCard);
    
    // Na TaskDetailsView o título aparece em um H2
    expect(screen.getAllByText("Task 1").length).toBeGreaterThan(1);
    expect(screen.getByText("Edit Task")).toBeInTheDocument();
    
    const closeButton = screen.getByText("Close");
    fireEvent.click(closeButton);
    
    // Verifica se fechou (só deve sobrar o texto no card na lista)
    expect(screen.queryByText("Close")).not.toBeInTheDocument();
  });

  it("enters edit mode from details view", () => {
    render(<TaskDashboard />);
    
    fireEvent.click(screen.getByText("Task 1"));
    fireEvent.click(screen.getByText("Edit Task"));
    
    expect(screen.getByText("Edit Task")).toBeInTheDocument();
    // No formulário de edição o botão de submit muda para "Update Task"
    expect(screen.getByText("Update Task")).toBeInTheDocument();
    
    // Clicar em cancelar na edição deve voltar para a view de detalhes
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  it("closes overlay when clicking on background", () => {
    render(<TaskDashboard />);
    
    fireEvent.click(screen.getByText("+ New Task"));
    
    // O TaskDashboard renderiza o overlay com uma classe modalOverlay
    // No código: <div className={styles.modalOverlay} onClick={handleCloseOverlay}>
    // Vamos buscar por esse elemento. Como não temos a classe real no teste (devido ao CSS modules),
    // vamos buscar pelo papel ou testar via stopPropagation.
    // Mas uma forma simples é clicar em um elemento que sabemos que fecha o modal.
    
    // Alternativa: testar a função handleCloseOverlay indiretamente.
    const modalContent = screen.getByText("Create New Task").closest('div');
    const overlay = modalContent?.parentElement?.parentElement; // Camada externa
    
    if (overlay) {
        fireEvent.click(overlay);
        expect(screen.queryByText("Create New Task")).not.toBeInTheDocument();
    }
  });
});
