import React from 'react';
import { TaskRead, TaskStatus, TaskPriority } from '../types';
import TaskCard from './TaskCard';
import styles from './TaskList.module.css';

interface TaskListProps {
  tasks: TaskRead[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  filters: {
    status?: TaskStatus | null;
    priority?: TaskPriority | null;
    assigned_to_id?: string | null;
  };
}

const TaskList: React.FC<TaskListProps> = ({ tasks, isLoading, isError, error, filters }) => {
  if (isLoading) {
    return <div className={styles.message}>Loading tasks...</div>;
  }

  if (isError) {
    return <div className={styles.message}>Error loading tasks: {error.message}</div>;
  }

  if (tasks.length === 0) {
    return <div className={styles.message}>No tasks found.</div>;
  }

  // Filtrar tarefas localmente (embora o backend também filtre, esta é uma camada de segurança e UX)
  const filteredTasks = tasks.filter(task => {
    let matches = true;
    if (filters.status && task.status !== filters.status) {
      matches = false;
    }
    if (filters.priority && task.priority !== filters.priority) {
      matches = false;
    }
    if (filters.assigned_to_id && task.assigned_to_id !== filters.assigned_to_id) {
      matches = false;
    }
    return matches;
  });
  
  if (filteredTasks.length === 0) {
    return <div className={styles.message}>No tasks match the current filters.</div>;
  }

  return (
    <div className={styles.taskList}>
      {filteredTasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
};

export default TaskList;
