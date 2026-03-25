import React from "react";
import { Priority, PRIORITY_COLORS } from "../../types";

interface Props {
  priority: Priority;
  size?: "sm" | "md";
}

export const PriorityBadge: React.FC<Props> = ({ priority, size = "sm" }) => {
  const c = PRIORITY_COLORS[priority];
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border font-mono uppercase tracking-wider font-medium
        ${c.bg} ${c.text} ${c.border} ${textSize}`}
    >
      {priority === "critical" && <span className="w-1.5 h-1.5 rounded-full bg-coral-500 animate-pulse-dot inline-block" />}
      {priority}
    </span>
  );
};
