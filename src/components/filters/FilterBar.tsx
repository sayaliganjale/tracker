import React, { useState, useRef, useEffect } from "react";
import { useStore } from "../../store";
import { Status, Priority, STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS } from "../../types";
import { USERS } from "../../data/seed";
import { DEFAULT_FILTERS } from "../../store";

const STATUSES: Status[] = ["todo", "in_progress", "in_review", "done"];
const PRIORITIES: Priority[] = ["critical", "high", "medium", "low"];

function hasActiveFilters(filters: typeof DEFAULT_FILTERS): boolean {
  return (
    filters.statuses.length > 0 ||
    filters.priorities.length > 0 ||
    filters.assigneeIds.length > 0 ||
    !!filters.dueDateFrom ||
    !!filters.dueDateTo
  );
}

export const FilterBar: React.FC = () => {
  const { filters, setFilters, clearFilters } = useStore();
  const active = hasActiveFilters(filters);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-display font-semibold text-ink-400 uppercase tracking-wider mr-1">
        Filters
      </span>

      <MultiSelectDropdown
        label="Status"
        options={STATUSES.map((s) => ({
          value: s,
          label: STATUS_LABELS[s],
          color: STATUS_COLORS[s],
        }))}
        selected={filters.statuses}
        onChange={(v) => setFilters({ statuses: v as Status[] })}
      />

      <MultiSelectDropdown
        label="Priority"
        options={PRIORITIES.map((p) => ({
          value: p,
          label: p.charAt(0).toUpperCase() + p.slice(1),
          color: ["#ff4d6d", "#ffb800", "#00c2ff", "#8080a8"][PRIORITIES.indexOf(p)],
        }))}
        selected={filters.priorities}
        onChange={(v) => setFilters({ priorities: v as Priority[] })}
      />

      <MultiSelectDropdown
        label="Assignee"
        options={USERS.map((u) => ({
          value: u.id,
          label: u.name,
          color: u.color,
          initials: u.initials,
        }))}
        selected={filters.assigneeIds}
        onChange={(v) => setFilters({ assigneeIds: v })}
      />

      {/* Date range */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-ink-800 border border-ink-600/60">
        <svg className="w-3.5 h-3.5 text-ink-400" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.2" />
          <path d="M5 1v4M11 1v4M2 7h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <input
          type="date"
          value={filters.dueDateFrom}
          onChange={(e) => setFilters({ dueDateFrom: e.target.value })}
          className="bg-transparent text-xs font-mono text-ink-200 outline-none w-[110px]
            [color-scheme:dark] cursor-pointer"
          placeholder="From"
        />
        <span className="text-ink-600">–</span>
        <input
          type="date"
          value={filters.dueDateTo}
          onChange={(e) => setFilters({ dueDateTo: e.target.value })}
          className="bg-transparent text-xs font-mono text-ink-200 outline-none w-[110px]
            [color-scheme:dark] cursor-pointer"
          placeholder="To"
        />
      </div>

      {active && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-semibold
            text-coral-400 border border-coral-500/30 bg-coral-500/10 hover:bg-coral-500/20
            uppercase tracking-wide transition-colors animate-fade-in"
        >
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
            <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Clear
        </button>
      )}
    </div>
  );
};

interface DropdownOption {
  value: string;
  label: string;
  color?: string;
  initials?: string;
}

interface MultiSelectProps {
  label: string;
  options: DropdownOption[];
  selected: string[];
  onChange: (values: string[]) => void;
}

const MultiSelectDropdown: React.FC<MultiSelectProps> = ({ label, options, selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-medium
          border transition-colors whitespace-nowrap
          ${selected.length > 0
            ? "bg-acid-500/10 border-acid-500/40 text-acid-400"
            : "bg-ink-800 border-ink-600/60 text-ink-300 hover:text-ink-100 hover:border-ink-500"
          }`}
      >
        {label}
        {selected.length > 0 && (
          <span className="bg-acid-500/20 text-acid-400 rounded-full px-1.5 py-0 text-[10px] font-mono">
            {selected.length}
          </span>
        )}
        <svg
          className={`w-3 h-3 opacity-50 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12" fill="none"
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 mt-1.5 rounded-xl border border-ink-600
          bg-ink-800 shadow-2xl shadow-black/60 overflow-hidden animate-slide-in min-w-[160px]">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggle(opt.value)}
              className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5
                hover:bg-ink-700 transition-colors"
            >
              {/* Checkbox */}
              <span
                className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0
                  ${selected.includes(opt.value)
                    ? "bg-acid-500/30 border-acid-500"
                    : "border-ink-500"
                  }`}
              >
                {selected.includes(opt.value) && (
                  <svg className="w-2 h-2 text-acid-400" viewBox="0 0 8 8" fill="none">
                    <path d="M1 4l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
              </span>

              {opt.initials ? (
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0"
                  style={{ backgroundColor: opt.color + "33", color: opt.color }}
                >
                  {opt.initials}
                </span>
              ) : (
                opt.color && (
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: opt.color }}
                  />
                )
              )}

              <span className="text-ink-100 truncate">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
