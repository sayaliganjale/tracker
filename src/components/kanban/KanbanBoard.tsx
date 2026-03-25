import React, { useState, useRef, useCallback } from "react";
import { Status } from "../../types";
import { useStore, useFilteredTasks } from "../../store";
import { KanbanColumn } from "./KanbanColumn";
import { useTouchDrag } from "../../hooks/useTouchDrag";

const STATUSES: Status[] = ["todo", "in_progress", "in_review", "done"];

export const KanbanBoard: React.FC = () => {
  const moveTask = useStore((s) => s.moveTask);
  const filteredTasks = useFilteredTasks();

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Status | null>(null);
  const originalStatusRef = useRef<Status | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);

  const handleDragStart = useCallback(
    (e: React.DragEvent, taskId: string) => {
      const task = filteredTasks.find((t) => t.id === taskId);
      if (!task) return;
      setDraggingId(taskId);
      originalStatusRef.current = task.status;
      const ghost = document.createElement("div");
      ghost.style.cssText = `
        position: fixed; top: -1000px; left: -1000px;
        background: #1a1a24; border: 1px solid #5a5a7a;
        border-radius: 12px; padding: 10px 14px;
        color: #f0f0f8; font-family: 'DM Sans', sans-serif;
        font-size: 13px; font-weight: 500;
        max-width: 260px; box-shadow: 0 20px 60px rgba(0,0,0,0.6);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      `;
      ghost.textContent = task.title;
      document.body.appendChild(ghost);
      ghostRef.current = ghost;
      e.dataTransfer.setDragImage(ghost, 16, 16);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("taskId", taskId);
    },
    [filteredTasks]
  );

  const handleDragEnd = useCallback(
    (e: React.DragEvent) => {
      if (ghostRef.current) {
        document.body.removeChild(ghostRef.current);
        ghostRef.current = null;
      }
      if (e.dataTransfer.dropEffect === "none" && draggingId && originalStatusRef.current) {
        moveTask(draggingId, originalStatusRef.current);
      }
      setDraggingId(null);
      setDragOverColumn(null);
      originalStatusRef.current = null;
    },
    [draggingId, moveTask]
  );

  const handleDragOver = useCallback((e: React.DragEvent, status: Status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(status);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, status: Status) => {
      e.preventDefault();
      const taskId = e.dataTransfer.getData("taskId");
      if (taskId) moveTask(taskId, status);
      setDraggingId(null);
      setDragOverColumn(null);
    },
    [moveTask]
  );

  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchDrag({
    onDragStart: (taskId) => {
      const task = filteredTasks.find((t) => t.id === taskId);
      if (task) {
        setDraggingId(taskId);
        originalStatusRef.current = task.status;
      }
    },
    onDrop: (taskId, status) => moveTask(taskId, status),
    onDragEnd: () => {
      setDraggingId(null);
      setDragOverColumn(null);
      originalStatusRef.current = null;
    },
  });

  const tasksByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = filteredTasks.filter((t) => t.status === s);
    return acc;
  }, {} as Record<Status, typeof filteredTasks>);

  return (
    <div
      className="flex gap-5 overflow-x-auto pb-6 pt-1 px-1 min-h-0 flex-1"
      onTouchMove={(e) => handleTouchMove(e as any)}
      onTouchEnd={(e) => handleTouchEnd(e as any)}
    >
      {STATUSES.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          tasks={tasksByStatus[status]}
          draggingId={draggingId}
          dragOverColumn={dragOverColumn}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onTouchStart={handleTouchStart}
        />
      ))}
    </div>
  );
};
