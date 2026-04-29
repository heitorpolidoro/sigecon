import React, { useState } from "react";
import { TaskPriority, TaskStatus } from "../types";
import type { TaskRead, TaskCreate, TaskUpdate } from "../types";
import { useCreateTask, useUpdateTask } from "../hooks/useTasks";
import styles from "./TaskForm.module.css";

interface TaskFormProps {
  /** Optional task for editing mode. If omitted, the form is in creation mode. */
  task?: TaskRead;
  /** Callback called after a successful save/update. */
  onSuccess: () => void;
  /** Callback called when the user cancels the operation. */
  onCancel: () => void;
}

/**
 * Form component for creating and editing tasks.
 *
 * @param props - Component props.
 * @returns The TaskForm component.
 */
const TaskForm: React.FC<TaskFormProps> = ({ task, onSuccess, onCancel }) => {
  const isEditing = !!task;
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();

  const isLoading =
    createTaskMutation.isPending || updateTaskMutation.isPending;
  const serverError = createTaskMutation.error || updateTaskMutation.error;

  const defaultValues = {
    title: "",
    description: "",
    priority: TaskPriority.MEDIUM,
    assigned_to_id: "",
    due_date: "",
    status: TaskStatus.PENDING,
  };

  /**
   * Transforms task values for form compatibility.
   */
  const transforms: Record<string, (value: any) => any> = {
    title: (v) => v,
    description: (v) => v || "",
    priority: (v) => v,
    assigned_to_id: (v) => v || "",
    due_date: (v) => (v ? new Date(v).toISOString().split("T")[0] : ""),
    status: (v) => v,
  };

  /**
   * Helper to get initial state from task or defaults.
   */
  const getInitialState = () => {
    const initial: Record<string, any> = {};
    (Object.keys(defaultValues) as Array<keyof typeof defaultValues>).forEach(
      (key) => {
        const value = task ? task[key as keyof TaskRead] : defaultValues[key];
        initial[key] = transforms[key](value);
      },
    );    return initial;
  };

  const [formData, setFormData] = useState(getInitialState());
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Handles input changes and clears related errors.
   */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  /**
   * Validates form data.
   */
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const commonData = {
      title: formData.title,
      description: formData.description || null,
      priority: formData.priority as TaskPriority,
      due_date: formData.due_date ? new Date(formData.due_date) : null,
      assigned_to_id: formData.assigned_to_id || null,
    };

    if (isEditing && task) {
      const updatePayload: TaskUpdate = {
        ...commonData,
        status: formData.status as TaskStatus,
      };
      updateTaskMutation.mutate(
        { id: task.id, data: updatePayload },
        { onSuccess },
      );
    } else {
      createTaskMutation.mutate(commonData as TaskCreate, { onSuccess });
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.title}>
        {isEditing ? "Edit Task" : "Create New Task"}
      </h2>

      {serverError && (
        <div className={styles.error} style={{ marginBottom: "1rem" }}>
          {(serverError as any).response?.data?.detail ||
            "An error occurred while saving the task."}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="title">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className={styles.input}
            value={formData.title}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="Enter task title"
          />
          {errors.title && <span className={styles.error}>{errors.title}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className={styles.textarea}
            value={formData.description}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="Enter task description (optional)"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="priority">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            className={styles.select}
            value={formData.priority}
            onChange={handleChange}
            disabled={isLoading}
          >
            {Object.values(TaskPriority).map((p) => (
              <option key={p} value={p}>
                {p.toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        {isEditing && (
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              className={styles.select}
              value={formData.status}
              onChange={handleChange}
              disabled={isLoading}
            >
              {Object.values(TaskStatus).map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ").toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="assigned_to_id">
            Assigned To
          </label>
          <select
            id="assigned_to_id"
            name="assigned_to_id"
            className={styles.select}
            value={formData.assigned_to_id}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="">Unassigned</option>
            {formData.assigned_to_id && (
              <option value={formData.assigned_to_id}>
                {formData.assigned_to_id}
              </option>
            )}
          </select>
          <small style={{ color: "#888", fontSize: "0.75rem" }}>
            User selection will be improved in future updates.
          </small>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="due_date">
            Due Date
          </label>
          <input
            type="date"
            id="due_date"
            name="due_date"
            className={styles.input}
            value={formData.due_date}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div className={styles.buttonGroup}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading
              ? "Saving..."
              : isEditing
                ? "Update Task"
                : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
