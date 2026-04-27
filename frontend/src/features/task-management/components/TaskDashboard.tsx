import React, { useState } from 'react';
import { TaskStatus, TaskPriority } from '../types';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import TaskDetailsView from './TaskDetailsView';
import styles from './TaskDashboard.module.css';
import { useTasks } from '../hooks/useTasks';

/**
 * Main dashboard component for managing and viewing tasks.
 * Includes filters for status and priority, and manages task creation and details views.
 * 
 * @returns The TaskDashboard component.
 */
const TaskDashboard: React.FC = () => {
  const [filters, setFilters] = useState<{
    status: TaskStatus | null;
    priority: TaskPriority | null;
  }>({
    status: null,
    priority: null,
  });

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { data: tasks, isLoading, isError, error } = useTasks(filters);

  const selectedTask = tasks?.find(t => t.id === selectedTaskId);

  /**
   * Updates the active filters.
   * 
   * @param filterType - The type of filter to update (status or priority).
   * @param value - The new filter value.
   */
  const handleFilterChange = (filterType: 'status' | 'priority', value: TaskStatus | TaskPriority | null) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: value,
    }));
  };

  /**
   * Resets all filters to their default (null) values.
   */
  const clearFilters = () => {
    setFilters({ status: null, priority: null });
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleCreateNewTask = () => {
    setIsCreating(true);
    setSelectedTaskId(null);
    setIsEditing(false);
  };

  const handleEditTask = () => {
    setIsEditing(true);
  };

  const handleCloseOverlay = () => {
    setSelectedTaskId(null);
    setIsCreating(false);
    setIsEditing(false);
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Task Dashboard</h1>
        <button onClick={handleCreateNewTask} className={styles.createButton}>
          + New Task
        </button>
      </div>

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
          onTaskClick={handleTaskClick}
        />
      )}

      {/* Overlays / Modals */}
      {isCreating && (
        <div className={styles.modalOverlay} onClick={handleCloseOverlay}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <TaskForm onCancel={handleCloseOverlay} onSuccess={handleCloseOverlay} />
          </div>
        </div>
      )}

      {selectedTask && !isEditing && (
        <div className={styles.modalOverlay} onClick={handleCloseOverlay}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <TaskDetailsView 
              task={selectedTask} 
              onClose={handleCloseOverlay} 
              onEdit={handleEditTask}
            />
          </div>
        </div>
      )}

      {selectedTask && isEditing && (
        <div className={styles.modalOverlay} onClick={handleCloseOverlay}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <TaskForm 
              task={selectedTask} 
              onCancel={() => setIsEditing(false)} 
              onSuccess={handleCloseOverlay} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDashboard;
