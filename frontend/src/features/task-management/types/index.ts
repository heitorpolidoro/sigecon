export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELED";
export const TaskStatus = {
  PENDING: "PENDING" as TaskStatus,
  IN_PROGRESS: "IN_PROGRESS" as TaskStatus,
  COMPLETED: "COMPLETED" as TaskStatus,
  CANCELED: "CANCELED" as TaskStatus,
};

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export const TaskPriority = {
  LOW: "LOW" as TaskPriority,
  MEDIUM: "MEDIUM" as TaskPriority,
  HIGH: "HIGH" as TaskPriority,
  URGENT: "URGENT" as TaskPriority,
};

export interface TaskBase {
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: Date | null;
  assigned_to_id?: string | null;
}

export interface TaskCreate extends Omit<TaskBase, 'status' | 'priority' | 'due_date' | 'assigned_to_id'> {
  // Apenas os campos necessários para criação
  title: string;
  description?: string | null;
  priority?: TaskPriority; // Tornando opcional, com default no backend
  due_date?: Date | null;
  assigned_to_id?: string | null;
}

export interface TaskUpdate extends Partial<Omit<TaskBase, 'assigned_to_id'>> {
  // Permite atualizar apenas campos específicos
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface TaskRead extends TaskBase {
  id: string;
  created_at: Date;
  updated_at: Date;
  created_by_id: string;
}

export interface TaskHistoryRead {
  id: string;
  task_id: string;
  changed_by_id: string;
  user_name: string; // Campo adicionado para facilitar display no frontend
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  timestamp: Date;
}
