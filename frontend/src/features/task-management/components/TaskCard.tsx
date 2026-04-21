import React from 'react';
import type { TaskRead } from '../types';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: TaskRead;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const getStatusColorClass = (status: string): string => {
    switch (status) {
      case 'PENDING': return styles.pending;
      case 'IN_PROGRESS': return styles.inProgress;
      case 'COMPLETED': return styles.completed;
      case 'CANCELED': return styles.canceled;
      default: return styles.defaultStatus;
    }
  };

  const getPriorityColorClass = (priority: string): string => {
    switch (priority) {
      case 'LOW': return styles.lowPriority;
      case 'MEDIUM': return styles.mediumPriority;
      case 'HIGH': return styles.highPriority;
      case 'URGENT': return styles.urgentPriority;
      default: return styles.defaultPriority;
    }
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{task.title}</h3>
      <p className={styles.description}>{task.description || 'No description'}</p>
      <div className={styles.details}>
        <span className={`${styles.status} ${getStatusColorClass(task.status)}`}>
          {task.status}
        </span>
        <span className={`${styles.priority} ${getPriorityColorClass(task.priority)}`}>
          {task.priority}
        </span>
      </div>
      {task.due_date && (
        <div className={styles.dueDate}>
          Due: {new Date(task.due_date).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
