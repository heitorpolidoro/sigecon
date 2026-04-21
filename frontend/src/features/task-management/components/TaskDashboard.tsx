import React, { useState } from 'react';
import { TaskStatus, TaskPriority } from '../types';
import TaskList from './TaskList';
import styles from './TaskDashboard.module.css';
import { useTasks, useInvalidateTasks } from '../hooks/useTasks';
import { useQueryClient } from '@tanstack/react-query';

const TaskDashboard: React.FC = () => {
  const [filters, setFilters] = useState<{
    status: TaskStatus | null;
    priority: TaskPriority | null;
  }>({
    status: null,
    priority: null,
  });

  const { data: tasks, isLoading, isError, error } = useTasks(filters);
  const invalidateTasks = useInvalidateTasks(); // Hook para invalidar o cache e forçar refresh

  const handleFilterChange = (filterType: 'status' | 'priority', value: TaskStatus | TaskPriority | null) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({ status: null, priority: null });
  };

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.title}>Task Dashboard</h1>

      <div className={styles.filters}>
        <select
          value={filters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value as TaskStatus || null)}
        >
          <option value="">All Statuses</option>
          {Object.values(TaskStatus).map(s => (
            <option key={s} value={s}>{s.replace('_', ' ').toLowerCase()}</option>
          ))}
        </select>
        <select
          value={filters.priority || ''}
          onChange={(e) => handleFilterChange('priority', e.target.value as TaskPriority || null)}
        >
          <option value="">All Priorities</option>
          {Object.values(TaskPriority).map(p => (
            <option key={p} value={p}>{p.toLowerCase()}</option>
          ))}
        </select>
        <button onClick={clearFilters} className={styles.clearButton}>Clear Filters</button>
      </div>

      {tasks && (
        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          isError={isError}
          error={error}
          filters={filters}
        />
      )}
    </div>
  );
};

export default TaskDashboard;
