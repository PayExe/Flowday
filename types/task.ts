export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  projectId?: string;
  createdAt: string; // ISO date string
  dueDate?: string; // ISO date string
}
