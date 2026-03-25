import React, { useRef } from "react";
import { useFilteredTasks } from "../../store";
import { getMonthDates, today, parseDate } from "../../utils/dates";

const DAY_WIDTH = 36;
const ROW_HEIGHT = 40;
const LABEL_WIDTH = 200;

// Priority colors as hex for inline styles
const PRIORITY_HEX: Record<string, string> = {
  critical: "#ff4d6d",
  high:     "#ffb800",
  medium:   "#00c2ff",
  low:      "#8080a8",
};

export const TimelineView: React.FC = () => {
  const tasks = useFilteredTasks();
  const scrollRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const dates = getMonthDates(year, month);
  const todayStr = today();

  const totalWidth = dates.length * DAY_WIDTH;

  const todayIndex = dates.indexOf(todayStr);

  function dateToX(dateStr: string): number {
    const idx = dates.indexOf(dateStr);
    if (idx >= 0) return idx * DAY_WIDTH;
    // If before month start, clamp to 0
    if (dateStr < dates[0]) return 0;
    // If after month end, clamp to end
    return totalWidth;
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 rounded-2xl border border-ink-700/60 overflow-hidden bg-ink-900/40">
      {/* Header */}
      <div className="flex flex-shrink-0 border-b border-ink-700 bg-ink-800/80 sticky top-0 z-10">
        {/* Label column */}
        <div
          className="flex-shrink-0 border-r border-ink-700 flex items-center px-4"
          style={{ width: LABEL_WIDTH, minHeight: 44 }}
        >
          <span className="text-xs font-display font-semibold uppercase tracking-wider text-ink-300">
            {new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
        </div>

        {/* Day headers — scrollable */}
        <div className="overflow-x-auto flex-1" ref={scrollRef}>
          <div className="flex" style={{ width: totalWidth }}>
            {dates.map((d, i) => {
              const dayNum = i + 1;
              const dayDate = parseDate(d);
              const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;
              const isToday = d === todayStr;
              return (
                <div
                  key={d}
                  className={`flex-shrink-0 flex flex-col items-center justify-center border-r border-ink-700/30
                    text-[10px] font-mono
                    ${isToday ? "bg-acid-500/10 text-acid-400" : isWeekend ? "text-ink-500" : "text-ink-400"}`}
                  style={{ width: DAY_WIDTH, height: 44 }}
                >
                  <span>{dayNum}</span>
                  <span className="text-[8px] opacity-60">
                    {dayDate.toLocaleDateString("en-US", { weekday: "narrow" })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-y-auto">
        {/* Task labels */}
        <div className="flex-shrink-0 border-r border-ink-700/60" style={{ width: LABEL_WIDTH }}>
          {tasks.length === 0 ? null : tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center px-4 border-b border-ink-700/30 hover:bg-ink-800/40 transition-colors"
              style={{ height: ROW_HEIGHT }}
            >
              <span className="text-xs font-body text-ink-200 truncate">{task.title}</span>
            </div>
          ))}
        </div>

        {/* Gantt bars — horizontally scrollable */}
        <div className="flex-1 overflow-x-auto">
          <div style={{ width: totalWidth, position: "relative" }}>
            {/* Today line */}
            {todayIndex >= 0 && (
              <div
                className="absolute top-0 bottom-0 z-20 pointer-events-none"
                style={{ left: todayIndex * DAY_WIDTH + DAY_WIDTH / 2, width: 2 }}
              >
                <div className="w-full h-full bg-acid-500/60" />
                <div
                  className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px] font-mono
                    text-acid-400 whitespace-nowrap bg-ink-900 px-1 rounded"
                >
                  TODAY
                </div>
              </div>
            )}

            {/* Weekend shading */}
            {dates.map((d, i) => {
              const dayDate = parseDate(d);
              const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;
              return isWeekend ? (
                <div
                  key={d}
                  className="absolute top-0 bottom-0 bg-ink-800/30 pointer-events-none"
                  style={{ left: i * DAY_WIDTH, width: DAY_WIDTH }}
                />
              ) : null;
            })}

            {/* Task rows */}
            {tasks.length === 0 ? (
              <EmptyTimeline />
            ) : tasks.map((task, rowIdx) => {
              const start = task.startDate ?? task.dueDate;
              const end = task.dueDate;
              const x1 = dateToX(start);
              const x2 = dateToX(end) + DAY_WIDTH;
              const barWidth = Math.max(x2 - x1, DAY_WIDTH);
              const color = PRIORITY_HEX[task.priority];
              const isSingleDay = !task.startDate || task.startDate === task.dueDate;
              const isOverdue = task.dueDate < todayStr;

              return (
                <div
                  key={task.id}
                  className="absolute border-b border-ink-700/30 flex items-center"
                  style={{
                    top: rowIdx * ROW_HEIGHT,
                    height: ROW_HEIGHT,
                    left: 0,
                    right: 0,
                  }}
                >
                  {/* Vertical grid lines */}
                  {dates.map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 border-r border-ink-700/20 pointer-events-none"
                      style={{ left: i * DAY_WIDTH }}
                    />
                  ))}

                  {/* Bar */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 rounded-md flex items-center px-2
                      text-[10px] font-mono font-semibold whitespace-nowrap overflow-hidden
                      transition-opacity hover:opacity-90 cursor-default"
                    style={{
                      left: x1,
                      width: barWidth,
                      height: isSingleDay ? 20 : 24,
                      backgroundColor: color + (isOverdue ? "33" : "22"),
                      border: `1px solid ${color}${isOverdue ? "88" : "55"}`,
                      color,
                    }}
                    title={`${task.title} · ${start} → ${end}`}
                  >
                    {isSingleDay ? (
                      <span
                        className="w-2 h-2 rounded-full mx-auto"
                        style={{ backgroundColor: color }}
                      />
                    ) : (
                      <span className="truncate opacity-80">{task.title}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Empty state */}
      {tasks.length === 0 && (
        <div className="flex-1 flex items-center justify-center py-20">
          <EmptyTimeline />
        </div>
      )}
    </div>
  );
};

const EmptyTimeline: React.FC = () => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 w-full">
    <svg className="w-10 h-10 text-ink-600" viewBox="0 0 40 40" fill="none">
      <rect x="4" y="18" width="32" height="4" rx="2" fill="currentColor" opacity="0.3" />
      <circle cx="12" cy="20" r="4" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <circle cx="28" cy="20" r="4" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
    </svg>
    <p className="text-sm text-ink-400 font-body">No tasks in this period</p>
  </div>
);
