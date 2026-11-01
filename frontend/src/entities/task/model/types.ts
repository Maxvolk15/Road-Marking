export type TaskStatus = 'open' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  photoId: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  address?: string;
}
