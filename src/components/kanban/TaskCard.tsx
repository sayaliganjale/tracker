import React, { useRef } from "react";
import { Task } from "../../types";
import { PriorityBadge } from "../ui/PriorityBadge";
import { Avatar } from "../ui/Avatar";
import { AvatarGroup } from "../ui/Avatar";
import { formatDueDate } from "../../utils/dates";
import { useTaskCollaborators } from "../collaboration/CollaborationBar";

interface Props {
  task: Task;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onTouchStart: (e: React.TouchEvent, taskId: string, el: HTMLElement) => void;
  isDragging: boolean;
}

export const TaskCard: React.FC<Props> = ({
  task, onDragStart, onDragEnd, onTouchStart, isDragging,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { label, overdue, dueToday } = formatDueDate(task.dueDate);
  const collab = useTaskCollaborators(task.id);

  return (
    <div
      ref={cardRef}
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      onTouchStart={(e) => {
        if (cardRef.current) onTouchStart(e, task.id, cardRef.current);
      }}
      className={`group relative bg-ink-800 border border-ink-600/60 rounded-xl p-3.5
        cursor-grab active:cursor-grabbing hover:border-ink-500 hover:bg-ink-750
        transition-all duration-150 select-none
        ${isDragging ? "opacity-40 scale-95" : "opacity-100"}`}
      style={{ touchAction: "none" }}
    >
      {collab.length > 0 && (
        <div className="absolute -top-1.5 -right-1.5 z-10 animate-fade-in">
          <AvatarGroup userIds={collab} max={2} size="xs" />
        </div>
      )}

      <div className="flex items-start justify-between gap-2 mb-2.5">
        <p className="text-sm text-ink-50 font-body font-medium leading-snug line-clamp-2 flex-1">
          {task.title}
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <PriorityBadge priority={task.priority} />
        <div className="flex items-center gap-2">
          <span
            className={`text-[11px] font-mono font-medium px-1.5 py-0.5 rounded
              ${dueToday
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : overdue
                  ? "bg-coral-500/15 text-coral-400"
                  : "text-ink-300"
              }`}
          >
            {label}
          </span>
          <Avatar userId={task.assigneeId} size="xs" showTooltip />
        </div>
      </div>
    </div>
  );
};
