import { useMemo } from "react";
import type { TaskRead, TaskStatus, TaskPriority } from "../types";

export interface TaskFilters {
  status?: TaskStatus | null;
  priority?: TaskPriority | null;
  assigned_to_id?: string | null;
}

/**
 * Hook to filter a list of tasks based on status, priority, and assigned user.
 * 
 * @param tasks - The list of tasks to filter.
 * @param filters - The filter criteria.
 * @returns The filtered list of tasks.
 */
export const useTaskFiltering = (tasks: TaskRead[], filters: TaskFilters) => {
  return useMemo(() => {
    return tasks.filter((task) => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (
        filters.assigned_to_id &&
        task.assigned_to_id !== filters.assigned_to_id
      )
        return false;
      return true;
    });
  }, [tasks, filters]);
};
