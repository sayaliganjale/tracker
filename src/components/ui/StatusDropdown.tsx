import React, { useState, useRef, useEffect } from "react";
import { Status, STATUS_LABELS, STATUS_COLORS } from "../../types";

interface Props {
  value: Status;
  onChange: (status: Status) => void;
}

const STATUSES: Status[] = ["todo", "in_progress", "in_review", "done"];

export const StatusDropdown: React.FC<Props> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-body font-medium
          bg-ink-700 hover:bg-ink-600 border border-ink-500/40 transition-colors whitespace-nowrap"
        style={{ color: STATUS_COLORS[value] }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: STATUS_COLORS[value] }}
        />
        {STATUS_LABELS[value]}
        <svg className="w-3 h-3 opacity-50" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 w-36 rounded-lg border border-ink-600
          bg-ink-800 shadow-2xl shadow-black/50 overflow-hidden animate-slide-in">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={(e) => { e.stopPropagation(); onChange(s); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2
                hover:bg-ink-700 transition-colors
                ${s === value ? "bg-ink-700" : ""}`}
              style={{ color: STATUS_COLORS[s] }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[s] }} />
              {STATUS_LABELS[s]}
              {s === value && (
                <svg className="ml-auto w-3 h-3" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
