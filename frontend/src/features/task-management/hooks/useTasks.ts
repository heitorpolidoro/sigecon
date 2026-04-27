import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../api/client";
import type {
  TaskRead,
  TaskCreate,
  TaskUpdate,
  TaskHistoryRead,
} from "../types";
import { TaskStatus, TaskPriority } from "../types";

/**
 * Options for fetching tasks, including various filters.
 */
interface FetchTasksOptions {
  /** Filter by task status. */
  status?: TaskStatus | null;
  /** Filter by task priority. */
  priority?: TaskPriority | null;
  /** Filter by the UUID of the assigned user. */
  assigned_to_id?: string | null;
}

/**
 * Fetches tasks from the API based on provided options.
 *
 * @param options - Filters for status, priority, and assignee.
 * @returns A promise with the list of tasks.
 */
const fetchTasks = async (options: FetchTasksOptions): Promise<TaskRead[]> => {
  const response = await apiClient.get("/tasks/", {
    params: {
      status: options.status,
      priority: options.priority,
      assigned_to_id: options.assigned_to_id,
    },
  });
  return response.data;
};

/**
 * Fetches a single task by its ID.
 *
 * @param id - The task UUID.
 * @returns A promise with the task data.
 */
const fetchTask = async (id: string): Promise<TaskRead> => {
  const response = await apiClient.get(`/tasks/${id}`);
  return response.data;
};

/**
 * Fetches the audit history for a single task.
 *
 * @param id - The task UUID.
 * @returns A promise with the task history.
 */
const fetchTaskHistory = async (id: string): Promise<TaskHistoryRead[]> => {
  const response = await apiClient.get(`/tasks/${id}/history`);
  return response.data;
};

/**
 * Hook to retrieve and manage tasks with filtering.
 *
 * @param options - Filters for the task list.
 * @returns React Query result with task data.
 */
export const useTasks = (options: FetchTasksOptions) => {
  return useQuery<TaskRead[], Error>({
    queryKey: ["tasks", options], // Inclui options na chave para re-fetch quando filtros mudam
    queryFn: () => fetchTasks(options),
    initialData: [], // Começa com um array vazio enquanto carrega
  });
};

/**
 * Hook to retrieve a single task by its ID.
 *
 * @param id - The task UUID.
 * @returns React Query result with the task data.
 */
export const useTask = (id: string) => {
  return useQuery<TaskRead, Error>({
    queryKey: ["tasks", id],
    queryFn: () => fetchTask(id),
    enabled: !!id,
  });
};

/**
 * Hook to retrieve the audit history of a task.
 *
 * @param id - The task UUID.
 * @returns React Query result with the history data.
 */
export const useTaskHistory = (id: string) => {
  return useQuery<TaskHistoryRead[], Error>({
    queryKey: ["tasks", id, "history"],
    queryFn: () => fetchTaskHistory(id),
    enabled: !!id,
  });
};

/**
 * Hook to create a new task.
 *
 * @returns React Query mutation for creating a task.
 */
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newTask: TaskCreate) => {
      const response = await apiClient.post("/tasks/", newTask);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

/**
 * Hook to update an existing task.
 *
 * @returns React Query mutation for updating a task.
 */
export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TaskUpdate }) => {
      const response = await apiClient.patch(`/tasks/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks", data.id] });
    },
  });
};

/**
 * Hook to get a function that invalidates the tasks query.
 *
 * @returns A function to invalidate tasks.
 */
export const useInvalidateTasks = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["tasks"] });
};
