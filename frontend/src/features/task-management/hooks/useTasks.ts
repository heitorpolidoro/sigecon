import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/client';
import type { TaskRead } from '../types';
import { TaskStatus, TaskPriority } from '../types';

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
  const response = await apiClient.get('/tasks/', {
    params: {
      status: options.status,
      priority: options.priority,
      assigned_to_id: options.assigned_to_id,
    },
  });
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
    queryKey: ['tasks', options], // Inclui options na chave para re-fetch quando filtros mudam
    queryFn: () => fetchTasks(options),
    initialData: [], // Começa com um array vazio enquanto carrega
  });
};

/**
 * Hook to get a function that invalidates the tasks query.
 * 
 * @returns A function to invalidate tasks.
 */
export const useInvalidateTasks = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['tasks'] });
};
