import { Priority } from './task';

export interface Project {
  id: string;
  name: string;
  color: string; // hex color code
  priority: Priority;
  createdAt: string; // ISO date string
}
