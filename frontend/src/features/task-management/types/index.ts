import { UUID } from 'crypto'; // Usaremos a interface do Node.js para UUIDs

export enum TaskStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export interface TaskBase {
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: Date | null;
  assigned_to_id?: UUID | null;
}

export interface TaskCreate extends Omit<TaskBase, 'status' | 'priority' | 'due_date' | 'assigned_to_id'> {
  // Apenas os campos necessários para criação
  title: string;
  description?: string | null;
  priority?: TaskPriority; // Tornando opcional, com default no backend
  due_date?: Date | null;
  assigned_to_id?: UUID | null;
}

export interface TaskUpdate extends Partial<Omit<TaskBase, 'assigned_to_id'>> {
  // Permite atualizar apenas campos específicos
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface TaskRead extends TaskBase {
  id: UUID;
  created_at: Date;
  updated_at: Date;
  created_by_id: UUID;
}

export interface TaskHistoryRead {
  id: UUID;
  task_id: UUID;
  changed_by_id: UUID;
  user_name: string; // Campo adicionado para facilitar display no frontend
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  timestamp: Date;
}
