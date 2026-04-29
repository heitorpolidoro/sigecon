import React from "react";
import { useTaskHistory } from "../hooks/useTasks";
import type { TaskHistoryRead } from "../types";
import styles from "./AuditTimeline.module.css";

interface AuditTimelineProps {
  /** The UUID of the task to show history for. */
  taskId: string;
}

/**
 * Component to display the audit history of a task in a vertical timeline.
 *
 * @param props - Component props.
 * @returns The AuditTimeline component.
 */
const AuditTimeline: React.FC<AuditTimelineProps> = ({ taskId }) => {
  const { data: history, isLoading, error } = useTaskHistory(taskId);

  /**
   * Formats a Date or date string into a localized string with year, month, day, hour, and minute.
   *
   * @param date - The Date object or date string to format.
   * @returns The formatted date string.
   */
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Formats a field name by replacing underscores with spaces.
   *
   * @param name - The field name string to format.
   * @returns The formatted field name.
   */
  const formatFieldName = (name: string) => {
    return name.replace(/_/g, " ");
  };

  /**
   * Formats a value for display, converting null or "null" to "None" and empty string to "Empty".
   *
   * @param value - The value string or null to format.
   * @returns The formatted value string.
   */
  const formatValue = (value: string | null) => {
    if (value === null || value === "null") return "None";
    if (value === "") return "Empty";
    return value;
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading history...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error loading history.</div>;
  }

  if (!history || history.length === 0) {
    return (
      <div className={styles.timelineContainer}>
        <h3 className={styles.title}>Audit History</h3>
        <p className={styles.emptyState}>
          No changes recorded for this task yet.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.timelineContainer}>
      <h3 className={styles.title}>Audit History</h3>
      <div className={styles.timeline}>
        {(history as TaskHistoryRead[]).map((entry) => (
          <div key={entry.id} className={styles.timelineItem}>
            <div className={styles.timelineDot} />
            <div className={styles.itemHeader}>
              <span className={styles.userName}>{entry.user_name}</span>
              <span className={styles.timestamp}>
                {formatDate(entry.timestamp)}
              </span>
            </div>
            <div className={styles.changeDetails}>
              <span className={styles.fieldName}>
                {formatFieldName(entry.field_name)}
              </span>
              <div className={styles.valueChange}>
                <span className={styles.oldValue}>
                  {formatValue(entry.old_value)}
                </span>
                <span className={styles.arrow}>→</span>
                <span className={styles.newValue}>
                  {formatValue(entry.new_value)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditTimeline;
