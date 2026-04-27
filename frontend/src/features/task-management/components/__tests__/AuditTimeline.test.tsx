import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import AuditTimeline from "../AuditTimeline";
import { useTaskHistory } from "../../hooks/useTasks";
import "@testing-library/jest-dom";

// Mock the hook
vi.mock("../../hooks/useTasks", () => ({
  useTaskHistory: vi.fn(),
}));

describe("AuditTimeline", () => {
  it("renders loading state", () => {
    (useTaskHistory as jest.MockedFunction<typeof useTaskHistory>).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<AuditTimeline taskId="test-id" />);
    expect(screen.getByText(/Loading history.../i)).toBeInTheDocument();
  });

  it("renders error state", () => {
    (useTaskHistory as jest.MockedFunction<typeof useTaskHistory>).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed to fetch"),
    });

    render(<AuditTimeline taskId="test-id" />);
    expect(screen.getByText(/Error loading history./i)).toBeInTheDocument();
  });

  it("renders empty state when no history is returned", () => {
    (useTaskHistory as jest.MockedFunction<typeof useTaskHistory>).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<AuditTimeline taskId="test-id" />);
    expect(
      screen.getByText(/No changes recorded for this task yet./i),
    ).toBeInTheDocument();
  });

  it("renders a list of history entries correctly", () => {
    const mockHistory = [
      {
        id: "1",
        task_id: "test-id",
        changed_by_id: "u1",
        user_name: "John Doe",
        field_name: "status",
        old_value: "PENDING",
        new_value: "IN_PROGRESS",
        timestamp: "2023-10-27T10:00:00Z",
      },
      {
        id: "2",
        task_id: "test-id",
        changed_by_id: "u2",
        user_name: "Jane Smith",
        field_name: "priority",
        old_value: "LOW",
        new_value: "HIGH",
        timestamp: "2023-10-27T11:00:00Z",
      },
    ];

    (useTaskHistory as jest.MockedFunction<typeof useTaskHistory>).mockReturnValue({
      data: mockHistory,
      isLoading: false,
      error: null,
    });

    render(<AuditTimeline taskId="test-id" />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("status")).toBeInTheDocument();
    expect(screen.getByText("priority")).toBeInTheDocument();
    expect(screen.getByText("PENDING")).toBeInTheDocument();
    expect(screen.getByText("IN_PROGRESS")).toBeInTheDocument();
    expect(screen.getByText("LOW")).toBeInTheDocument();
    expect(screen.getByText("HIGH")).toBeInTheDocument();
  });

  it('formats null values as "None"', () => {
    const mockHistory = [
      {
        id: "3",
        task_id: "test-id",
        changed_by_id: "u1",
        user_name: "John Doe",
        field_name: "description",
        old_value: null,
        new_value: "New description",
        timestamp: "2023-10-27T12:00:00Z",
      },
    ];

    (useTaskHistory as jest.Mock).mockReturnValue({
      data: mockHistory,
      isLoading: false,
      error: null,
    });

    render(<AuditTimeline taskId="test-id" />);

    expect(screen.getAllByText("None").length).toBeGreaterThan(0);
    expect(screen.getByText("New description")).toBeInTheDocument();
  });
});
