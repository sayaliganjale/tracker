import React from "react";
import { useStore } from "../../store";
import { AvatarGroup } from "../ui/Avatar";

export const CollaborationBar: React.FC = () => {
  const collaborators = useStore((s) => s.collaborators);
  const active = collaborators.filter((c) => c.taskId !== null);
  const userIds = active.map((c) => c.userId);

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-ink-800/80 border border-ink-600/50 backdrop-blur-sm">
      <div className="relative flex items-center">
        <span className="w-2 h-2 rounded-full bg-acid-500 animate-pulse-dot" />
      </div>
      <AvatarGroup userIds={userIds} max={4} size="xs" />
      <span className="text-xs text-ink-300 font-body whitespace-nowrap">
        {active.length === 0
          ? "Only you"
          : `${active.length} other${active.length > 1 ? "s" : ""} viewing`}
      </span>
    </div>
  );
};

// Returns userIds of collaborators viewing a specific task
export function useTaskCollaborators(taskId: string): string[] {
  const collaborators = useStore((s) => s.collaborators);
  return collaborators.filter((c) => c.taskId === taskId).map((c) => c.userId);
}
