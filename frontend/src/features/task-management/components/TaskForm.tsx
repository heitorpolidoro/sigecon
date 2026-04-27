import React, { useState } from "react";
import {
  TaskPriority,
  TaskStatus,
  TaskRead,
  TaskCreate,
  TaskUpdate,
} from "../types";
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

  const defaultValues = {
    title: "",
    description: "",
    priority: TaskPriority.MEDIUM,
    assigned_to_id: "",
    due_date: "",
    status: TaskStatus.PENDING,
  };

  const transforms: Record<keyof typeof defaultValues, (value: any) => any> = {
    title: (v) => v,
    description: (v) => v,
    priority: (v) => v,
    assigned_to_id: (v) => v,
    due_date: (v) =>
      v
        ? new Date(v).toISOString().split("T")[0]
        : "",
    status: (v) => v,
  };

  // Initial state helper
  const getInitialState = () => {
    const initial: Record<string, any> = {};
    (Object.keys(defaultValues) as Array<keyof typeof defaultValues>).forEach(
      (key) => {
        const value = task?.[key] ?? defaultValues[key];
        initial[key] = transforms[key](value);
      },
    );
    return initial;
  };

  const [formData, setFormData] = useState(getInitialState());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      /**
       * Callback to update errors state by removing the specified field error.
       *
       * @param {Object} prev - The previous errors state object.
       * @returns {Object} The updated errors state object without the removed field error.
       */
      setErrors((prev) => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles the form submission for creating or updating a task.
   * Prevents default form behavior, validates the form, and triggers the appropriate
   * create or update mutation based on the editing state.
   * @param e React.FormEvent event generated from form submission.
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

    const actionMap = {
      [true]: ({ commonData, task }: { commonData: typeof commonData; task: TaskRead }) => () => {
        const updatePayload: TaskUpdate = {
          ...commonData,
          status: formData.status as TaskStatus,
        };
        updateTaskMutation.mutate(
          { id: task.id, data: updatePayload },
          { onSuccess },
        );
const FormHeader: React.FC<{isEditing: boolean}> = ({ isEditing }) => (
  <h2 className={styles.title}>
    {isEditing ? "Edit Task" : "Create New Task"}
  </h2>
);

const ErrorMessage: React.FC<{error: unknown}> = ({ error }) =>
  error ? (
    <div className={styles.error} style={{ marginBottom: "1rem" }}>
      {error.response?.data?.detail ||
        "An error occurred while saving the task."}
    </div>
  ) : null;

const TitleField: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}> = ({ value, onChange, disabled }) => (
  <div className={styles.formGroup}>
    <label className={styles.label} htmlFor="title">
      Title *
    </label>
    <input
      type="text"
      id="title"
      name="title"
      className={styles.input}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder="Enter task title"
    />
  </div>
);

return (
  <div className={styles.formContainer}>
    <FormHeader isEditing={isEditing} />

    <ErrorMessage error={serverError} />

    <form onSubmit={handleSubmit} className={styles.form}>
      <TitleField
        value={formData.title}
        onChange={handleChange}
        disabled={isLoading}
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
            value={formData.assigned_to_id || ""}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="">Unassigned</option>
            {/* Mocking the current assigned user ID if present */}
            {formData.assigned_to_id && (
              <option value={formData.assigned_to_id}>
                {formData.assigned_to_id}
              </option>
            )}
            {/* In a real app, map over users from useUsers hook here */}
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
