import React from "react";
import { Task, Status, STATUS_LABELS } from "../../types";
import { TaskCard } from "./TaskCard";

interface Props {
  status: Status;
  tasks: Task[];
  draggingId: string | null;
  dragOverColumn: Status | null;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent, status: Status) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, status: Status) => void;
  onTouchStart: (e: React.TouchEvent, taskId: string, el: HTMLElement) => void;
}

const COLUMN_ACCENT: Record<Status, string> = {
  todo: "#8080a8",
  in_progress: "#00c2ff",
  in_review: "#ffb800",
  done: "#c8f000",
};

export const KanbanColumn: React.FC<Props> = ({
  status, tasks, draggingId, dragOverColumn,
  onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop, onTouchStart,
}) => {
  const isOver = dragOverColumn === status;
  const color = COLUMN_ACCENT[status];

  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <h3 className="text-sm font-display font-semibold text-ink-100 tracking-wide uppercase">
            {STATUS_LABELS[status]}
          </h3>
        </div>
        <span
          className="text-xs font-mono px-2 py-0.5 rounded-full border"
          style={{ color, borderColor: color + "44", backgroundColor: color + "11" }}
        >
          {tasks.length}
        </span>
      </div>

      <div
        data-column-status={status}
        className={`flex-1 rounded-2xl border-2 p-2 min-h-[200px] transition-all duration-150
          ${isOver ? "border-dashed bg-ink-700/50" : "border-transparent bg-ink-900/40"}`}
        style={isOver ? { borderColor: color + "80" } : {}}
        onDragOver={(e) => onDragOver(e, status)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, status)}
      >
        <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-220px)] pr-0.5">
          {tasks.length === 0 ? (
            <EmptyColumn isDragOver={isOver} color={color} />
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onTouchStart={onTouchStart}
                isDragging={draggingId === task.id}
              />
            ))
          )}
          {isOver && draggingId && (
            <div
              className="h-16 rounded-xl border-2 border-dashed opacity-50 animate-pulse"
              style={{ borderColor: color + "60", backgroundColor: color + "08" }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyColumn: React.FC<{ isDragOver: boolean; color: string }> = ({ isDragOver, color }) => (
  <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-50">
    {isDragOver ? (
      <div className="w-10 h-10 rounded-full border-2 border-dashed animate-pulse"
        style={{ borderColor: color }} />
    ) : (
      <>
        <svg className="w-8 h-8 text-ink-500" viewBox="0 0 32 32" fill="none">
          <rect x="4" y="8" width="24" height="4" rx="2" fill="currentColor" opacity="0.3" />
          <rect x="4" y="16" width="16" height="4" rx="2" fill="currentColor" opacity="0.2" />
          <rect x="4" y="24" width="20" height="4" rx="2" fill="currentColor" opacity="0.1" />
        </svg>
        <p className="text-xs font-body text-ink-400 text-center">
          No tasks here<br />Drop one to get started
        </p>
      </>
    )}
  </div>
);
