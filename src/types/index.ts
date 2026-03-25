export type Priority = "critical" | "high" | "medium" | "low";
export type Status = "todo" | "in_progress" | "in_review" | "done";
export type ViewMode = "kanban" | "list" | "timeline";
export type SortField = "title" | "priority" | "dueDate";
export type SortDirection = "asc" | "desc";

export interface User {
  id: string;
  name: string;
  color: string;
  initials: string;
}

export interface Task {
  id: string;
  title: string;
  assigneeId: string;
  priority: Priority;
  status: Status;
  startDate: string | null; // ISO date string or null
  dueDate: string;          // ISO date string
  description?: string;
  tags?: string[];
}

export interface FilterState {
  statuses: Status[];
  priorities: Priority[];
  assigneeIds: string[];
  dueDateFrom: string;
  dueDateTo: string;
}

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

export interface CollaboratorPresence {
  userId: string;
  taskId: string | null;
  lastSeen: number;
}

export const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const STATUS_LABELS: Record<Status, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
};

export const PRIORITY_COLORS: Record<Priority, { bg: string; text: string; border: string }> = {
  critical: { bg: "bg-coral-500/20", text: "text-coral-400", border: "border-coral-500/40" },
  high: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/40" },
  medium: { bg: "bg-sky-500/20", text: "text-sky-400", border: "border-sky-500/40" },
  low: { bg: "bg-ink-500/30", text: "text-ink-200", border: "border-ink-500/40" },
};

export const STATUS_COLORS: Record<Status, string> = {
  todo: "#8080a8",
  in_progress: "#00c2ff",
  in_review: "#ffb800",
  done: "#c8f000",
};

export const USER_COLORS = [
  "#ff4d6d", "#00c2ff", "#c8f000", "#ffb800", "#8b5cf6", "#ff9500",
];
