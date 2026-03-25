import { create } from "zustand";
import { Task, FilterState, SortState, ViewMode, Status, CollaboratorPresence } from "../types";
import { INITIAL_TASKS, USERS } from "../data/seed";

interface AppState {
  tasks: Task[];
  viewMode: ViewMode;
  filters: FilterState;
  sort: SortState;
  collaborators: CollaboratorPresence[];

  // Actions
  setViewMode: (mode: ViewMode) => void;
  updateTaskStatus: (taskId: string, status: Status) => void;
  moveTask: (taskId: string, newStatus: Status) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  setSort: (field: SortState["field"]) => void;
  setCollaborators: (c: CollaboratorPresence[]) => void;
  updateCollaborator: (userId: string, taskId: string | null) => void;
}

export const DEFAULT_FILTERS: FilterState = {
  statuses: [],
  priorities: [],
  assigneeIds: [],
  dueDateFrom: "",
  dueDateTo: "",
};

export const useStore = create<AppState>((set) => ({
  tasks: INITIAL_TASKS,
  viewMode: "kanban",
  filters: DEFAULT_FILTERS,
  sort: { field: "dueDate", direction: "asc" },
  collaborators: USERS.slice(0, 4).map((u, i) => ({
    userId: u.id,
    taskId: INITIAL_TASKS[i * 30]?.id ?? null,
    lastSeen: Date.now(),
  })),

  setViewMode: (mode) => set({ viewMode: mode }),

  updateTaskStatus: (taskId, status) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
    })),

  moveTask: (taskId, newStatus) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    })),

  setFilters: (partial) =>
    set((state) => ({ filters: { ...state.filters, ...partial } })),

  clearFilters: () => set({ filters: DEFAULT_FILTERS }),

  setSort: (field) =>
    set((state) => ({
      sort: {
        field,
        direction:
          state.sort.field === field && state.sort.direction === "asc" ? "desc" : "asc",
      },
    })),

  setCollaborators: (collaborators) => set({ collaborators }),

  updateCollaborator: (userId, taskId) =>
    set((state) => ({
      collaborators: state.collaborators.map((c) =>
        c.userId === userId ? { ...c, taskId, lastSeen: Date.now() } : c
      ),
    })),
}));

// Derived selector: filtered + sorted tasks
export function useFilteredTasks() {
  const { tasks, filters, sort } = useStore();
  return applyFiltersAndSort(tasks, filters, sort);
}

export function applyFiltersAndSort(
  tasks: Task[],
  filters: FilterState,
  sort: SortState
): Task[] {
  let result = [...tasks];

  if (filters.statuses.length > 0) {
    result = result.filter((t) => filters.statuses.includes(t.status));
  }
  if (filters.priorities.length > 0) {
    result = result.filter((t) => filters.priorities.includes(t.priority));
  }
  if (filters.assigneeIds.length > 0) {
    result = result.filter((t) => filters.assigneeIds.includes(t.assigneeId));
  }
  if (filters.dueDateFrom) {
    result = result.filter((t) => t.dueDate >= filters.dueDateFrom);
  }
  if (filters.dueDateTo) {
    result = result.filter((t) => t.dueDate <= filters.dueDateTo);
  }

  // Sort
  result.sort((a, b) => {
    let cmp = 0;
    if (sort.field === "title") {
      cmp = a.title.localeCompare(b.title);
    } else if (sort.field === "priority") {
      const ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
      cmp = ORDER[a.priority] - ORDER[b.priority];
    } else if (sort.field === "dueDate") {
      cmp = a.dueDate.localeCompare(b.dueDate);
    }
    return sort.direction === "asc" ? cmp : -cmp;
  });

  return result;
}
