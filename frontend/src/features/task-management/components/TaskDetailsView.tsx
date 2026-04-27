import React from 'react';
import type { TaskRead, TaskStatus } from '../types';
import { useUpdateTask } from '../hooks/useTasks';
import AuditTimeline from './AuditTimeline';
import styles from './TaskDetailsView.module.css';

interface TaskDetailsViewProps {
  /** The task to display. */
  task: TaskRead;
  /** Callback to trigger edit mode. */
  onEdit: () => void;
  /** Callback to close the view. */
  onClose: () => void;
}

/**
 * Component to display full details of a task.
 * 
 * @param props - Component props.
 * @returns The TaskDetailsView component.
 */
const TaskDetailsView: React.FC<TaskDetailsViewProps> = ({ task, onEdit, onClose }) => {
  const updateTaskMutation = useUpdateTask();

  const handleStatusChange = (newStatus: TaskStatus) => {
    updateTaskMutation.mutate({
      id: task.id,
      data: { status: newStatus },
    });
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleString();
  };

  const getStatusClass = (status: string) => styles[`status_${status.toLowerCase()}`] || '';
  const getPriorityClass = (priority: string) => styles[`priority_${priority.toLowerCase()}`] || '';

  return (
    <div className={styles.detailsContainer}>
      <header className={styles.header}>
        <h2 className={styles.title}>{task.title}</h2>
        <div className={styles.badgeGroup}>
          <span className={`${styles.badge} ${getStatusClass(task.status)}`}>
            {task.status.replace('_', ' ')}
          </span>
          <span className={`${styles.badge} ${getPriorityClass(task.priority)}`}>
            {task.priority}
          </span>
        </div>
      </header>

      <section className={styles.section}>
        <span className={styles.sectionTitle}>Description</span>
        <p className={styles.description}>
          {task.description || 'No description provided.'}
        </p>
      </section>

      <section className={styles.section}>
        <div className={styles.metadataGrid}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Assignee</span>
            <span className={styles.metaValue}>{task.assigned_to_id || 'Unassigned'}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Created By</span>
            <span className={styles.metaValue}>{task.created_by_id}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Due Date</span>
            <span className={styles.metaValue}>{formatDate(task.due_date)}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Created At</span>
            <span className={styles.metaValue}>{formatDate(task.created_at)}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Last Updated</span>
            <span className={styles.metaValue}>{formatDate(task.updated_at)}</span>
          </div>
        </div>
      </section>

      <section className={styles.quickActions}>
        <span className={styles.sectionTitle}>Quick Actions: Change Status</span>
        <div className={styles.statusButtons}>
          {(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'] as TaskStatus[]).map(status => (
            <button
              key={status}
              className={styles.statusButton}
              onClick={() => handleStatusChange(status)}
              disabled={task.status === status || updateTaskMutation.isPending}
            >
              {status.replace('_', ' ').toLowerCase()}
            </button>
          ))}
        </div>
      </section>

      <AuditTimeline taskId={task.id} />

      <footer className={styles.actions}>
        <button onClick={onEdit} className={styles.editButton}>
          Edit Task
        </button>
        <button onClick={onClose} className={styles.closeButton}>
          Close
        </button>
      </footer>
    </div>
  );
};

export default TaskDetailsView;
