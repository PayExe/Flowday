import { Priority } from './task';

export interface Project {
  id: string;
  name: string;
  color: string;
  priority: Priority;
  createdAt: string;
}
