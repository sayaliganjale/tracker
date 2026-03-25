import React from "react";
import { ViewMode } from "../../types";
import { useStore } from "../../store";

const VIEWS: { mode: ViewMode; label: string; icon: React.ReactNode }[] = [
  {
    mode: "kanban",
    label: "Board",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="2" width="4" height="12" rx="1.5" fill="currentColor" opacity="0.8" />
        <rect x="6" y="2" width="4" height="9" rx="1.5" fill="currentColor" opacity="0.8" />
        <rect x="11" y="2" width="4" height="6" rx="1.5" fill="currentColor" opacity="0.8" />
      </svg>
    ),
  },
  {
    mode: "list",
    label: "List",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
        <line x1="4" y1="4" x2="15" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="4" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="4" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="1.5" cy="4" r="1" fill="currentColor" />
        <circle cx="1.5" cy="8" r="1" fill="currentColor" />
        <circle cx="1.5" cy="12" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    mode: "timeline",
    label: "Timeline",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
        <line x1="1" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
        <rect x="2" y="5" width="5" height="3" rx="1.5" fill="currentColor" opacity="0.8" />
        <rect x="9" y="9" width="6" height="3" rx="1.5" fill="currentColor" opacity="0.8" />
        <rect x="5" y="9" width="5" height="3" rx="1.5" fill="currentColor" opacity="0.6" />
      </svg>
    ),
  },
];

export const ViewSwitcher: React.FC = () => {
  const { viewMode, setViewMode } = useStore();

  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-ink-800 border border-ink-700/60">
      {VIEWS.map(({ mode, label, icon }) => (
        <button
          key={mode}
          onClick={() => setViewMode(mode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-semibold
            transition-all duration-150
            ${viewMode === mode
              ? "bg-ink-600 text-ink-50 shadow-sm"
              : "text-ink-400 hover:text-ink-200"
            }`}
        >
          {icon}
          {label}
        </button>
      ))}
    </div>
  );
};
