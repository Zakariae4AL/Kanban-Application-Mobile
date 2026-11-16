export type User = { id: string; email: string; name: string; createdAt: string };

export type Subtask = { id: string; title: string; isCompleted: boolean; position: number };

export type Task = {
  id: string;
  title: string;
  description: string;
  position: number;
  columnId: string;
  subtasks: Subtask[];
};

export type Column = { id: string; name: string; position: number; tasks: Task[] };

export type Board = { id: string; name: string; createdAt: string; columns: Column[] };

export type BoardSummary = { id: string; name: string };

export type Locale = 'en' | 'fr';

export type BoardInput = { name: string; columns: { id?: string; name: string }[] };

export type TaskInput = {
  title: string;
  description: string;
  columnId: string;
  subtasks: { id?: string; title: string; isCompleted?: boolean }[];
};
