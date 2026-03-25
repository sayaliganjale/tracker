import React, { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { Task, SortField } from "../../types";
import { useStore, useFilteredTasks } from "../../store";
import { PriorityBadge } from "../ui/PriorityBadge";
import { Avatar, AvatarGroup } from "../ui/Avatar";
import { StatusDropdown } from "../ui/StatusDropdown";
import { formatDueDate } from "../../utils/dates";
import { useTaskCollaborators } from "../collaboration/CollaborationBar";

const ROW_HEIGHT = 52;
const BUFFER = 5;

// Individual row — memoized to prevent unnecessary re-renders
const ListRow = React.memo(({ task, style, updateTaskStatus }: {
  task: Task;
  style: React.CSSProperties;
  updateTaskStatus: (id: string, status: any) => void;
}) => {
  const { label, overdue, dueToday } = formatDueDate(task.dueDate);
  const collab = useTaskCollaborators(task.id);

  return (
    <div
      style={style}
      className="absolute left-0 right-0 flex items-center gap-4 px-4 border-b border-ink-700/60
        hover:bg-ink-800/60 transition-colors group"
    >
      {/* Title */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="text-sm font-body text-ink-100 truncate">{task.title}</span>
        {collab.length > 0 && (
          <div className="flex-shrink-0 animate-fade-in">
            <AvatarGroup userIds={collab} max={2} size="xs" />
          </div>
        )}
      </div>

      {/* Priority */}
      <div className="w-24 flex-shrink-0">
        <PriorityBadge priority={task.priority} />
      </div>

      {/* Status */}
      <div className="w-36 flex-shrink-0">
        <StatusDropdown
          value={task.status}
          onChange={(s) => updateTaskStatus(task.id, s)}
        />
      </div>

      {/* Due date */}
      <div className="w-28 flex-shrink-0">
        <span
          className={`text-xs font-mono ${
            dueToday
              ? "text-amber-400"
              : overdue
              ? "text-coral-400"
              : "text-ink-300"
          }`}
        >
          {label}
        </span>
      </div>

      {/* Assignee */}
      <div className="w-8 flex-shrink-0">
        <Avatar userId={task.assigneeId} size="xs" showTooltip />
      </div>
    </div>
  );
});

const SortIcon: React.FC<{ field: SortField; active: boolean; direction: "asc" | "desc" }> = ({
  active,
  direction,
}) => (
  <svg
    className={`w-3.5 h-3.5 ml-1 transition-all ${active ? "opacity-100" : "opacity-30"}`}
    viewBox="0 0 14 14"
    fill="none"
  >
    <path
      d="M7 2L10 6H4L7 2Z"
      fill="currentColor"
      opacity={active && direction === "asc" ? 1 : 0.4}
    />
    <path
      d="M7 12L4 8H10L7 12Z"
      fill="currentColor"
      opacity={active && direction === "desc" ? 1 : 0.4}
    />
  </svg>
);

export const ListView: React.FC = () => {
  const tasks = useFilteredTasks();
  const { sort, setSort, updateTaskStatus } = useStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setContainerHeight(el.clientHeight);
    });
    ro.observe(el);
    setContainerHeight(el.clientHeight);
    return () => ro.disconnect();
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const totalHeight = tasks.length * ROW_HEIGHT;

  const { startIndex, endIndex } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER);
    const visibleCount = Math.ceil(containerHeight / ROW_HEIGHT);
    const end = Math.min(tasks.length - 1, start + visibleCount + BUFFER * 2);
    return { startIndex: start, endIndex: end };
  }, [scrollTop, containerHeight, tasks.length]);

  const visibleTasks = tasks.slice(startIndex, endIndex + 1);

  const SORT_HEADERS: { label: string; field: SortField; width: string }[] = [
    { label: "Title", field: "title", width: "flex-1" },
    { label: "Priority", field: "priority", width: "w-24" },
    { label: "Status", field: "title", width: "w-36" }, // status not sortable — reuse title field placeholder
    { label: "Due Date", field: "dueDate", width: "w-28" },
    { label: "", field: "title", width: "w-8" },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 rounded-2xl border border-ink-700/60 overflow-hidden bg-ink-900/40">
      {/* Header row */}
      <div className="flex items-center gap-4 px-4 h-11 border-b border-ink-700 bg-ink-800/80 flex-shrink-0">
        {[
          { label: "Title", field: "title" as SortField, width: "flex-1" },
          { label: "Priority", field: "priority" as SortField, width: "w-24" },
          { label: "Status", field: null, width: "w-36" },
          { label: "Due Date", field: "dueDate" as SortField, width: "w-28" },
          { label: "", field: null, width: "w-8" },
        ].map(({ label, field, width }) => (
          <div key={label + width} className={`${width} flex-shrink-0`}>
            {field ? (
              <button
                onClick={() => setSort(field)}
                className="flex items-center text-xs font-display font-semibold uppercase tracking-wider
                  text-ink-300 hover:text-ink-100 transition-colors"
              >
                {label}
                <SortIcon
                  field={field}
                  active={sort.field === field}
                  direction={sort.direction}
                />
              </button>
            ) : (
              <span className="text-xs font-display font-semibold uppercase tracking-wider text-ink-300">
                {label}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Virtual scroll container */}
      {tasks.length === 0 ? (
        <EmptyListState />
      ) : (
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden relative"
          onScroll={handleScroll}
          style={{ willChange: "scroll-position" }}
        >
          {/* Full-height spacer to maintain correct scroll height */}
          <div style={{ height: totalHeight, position: "relative" }}>
            {visibleTasks.map((task, i) => (
              <ListRow
                key={task.id}
                task={task}
                style={{
                  top: (startIndex + i) * ROW_HEIGHT,
                  height: ROW_HEIGHT,
                }}
                updateTaskStatus={updateTaskStatus}
              />
            ))}
          </div>
        </div>
      )}

      {/* Footer: row count */}
      <div className="flex items-center justify-between px-4 h-9 border-t border-ink-700/60 bg-ink-800/40 flex-shrink-0">
        <span className="text-xs font-mono text-ink-400">
          {tasks.length.toLocaleString()} task{tasks.length !== 1 ? "s" : ""}
        </span>
        <span className="text-xs font-mono text-ink-500">
          Showing rows {startIndex + 1}–{Math.min(endIndex + 1, tasks.length)} of {tasks.length}
        </span>
      </div>
    </div>
  );
};

const EmptyListState: React.FC = () => {
  const clearFilters = useStore((s) => s.clearFilters);
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
      <svg className="w-12 h-12 text-ink-600" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
        <path d="M16 24h16M24 16v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </svg>
      <div className="text-center">
        <p className="text-sm font-display font-semibold text-ink-200 mb-1">No tasks match your filters</p>
        <p className="text-xs text-ink-400">Try adjusting your filters to see more results</p>
      </div>
      <button
        onClick={clearFilters}
        className="px-4 py-2 rounded-lg bg-acid-500/10 border border-acid-500/30 text-acid-500
          text-xs font-display font-semibold tracking-wide uppercase hover:bg-acid-500/20 transition-colors"
      >
        Clear all filters
      </button>
    </div>
  );
};
