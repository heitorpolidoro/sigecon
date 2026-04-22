import React, { useState, useEffect } from 'react';
import styles from './TaskDashboard.module.css';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  due_date?: string;
}

/**
 * Dashboard component that displays and manages tasks.
 * Fetches tasks from the API and provides a list view.
 * 
 * @returns React functional component for the Task Dashboard.
 */
const TaskDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/tasks/')
      .then(res => res.json())
      .then(data => {
        setTasks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao buscar tarefas:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className={styles.dashboard}>Carregando tarefas...</div>;

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>📋 Gestão de Tarefas</h1>
        <button onClick={() => undefined}>+ Nova Tarefa</button>
      </div>

      <div className={styles.taskList}>
        {tasks.length > 0 ? (
          tasks.map(task => (
            <div key={task.id} className={styles.taskCard}>
              <h3>{task.title}</h3>
              <p>{task.description || "Sem descrição"}</p>
              <div className={styles.meta}>
                <span className={`${styles.status} ${styles[task.status.toLowerCase()]}`}>
                  {task.status.replace('_', ' ')}
                </span>
                <span className={styles.priority}>Prioridade: {task.priority}</span>
              </div>
            </div>
          ))
        ) : (
          <p>Nenhuma tarefa encontrada. Comece criando uma!</p>
        )}
      </div>
    </div>
  );
};

export default TaskDashboard;
