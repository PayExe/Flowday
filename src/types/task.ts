export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  priority: Priority;
  lifeBlockId?: string;
  estimatedMinutes?: number;
  scheduledDate?: string;
  createdAt: string;
  dueDate?: string;
}
