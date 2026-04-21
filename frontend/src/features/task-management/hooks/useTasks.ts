import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { TaskRead, TaskStatus, TaskPriority } from '../types';

interface FetchTasksOptions {
  status?: TaskStatus | null;
  priority?: TaskPriority | null;
  assigned_to_id?: string | null;
}

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

export const useTasks = (options: FetchTasksOptions) => {
  return useQuery<TaskRead[], Error>({
    queryKey: ['tasks', options], // Inclui options na chave para re-fetch quando filtros mudam
    queryFn: () => fetchTasks(options),
    initialData: [], // Começa com um array vazio enquanto carrega
  });
};

export const useInvalidateTasks = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['tasks'] });
};
