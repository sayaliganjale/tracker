import React from "react";
import { User } from "../../types";
import { USERS } from "../../data/seed";

interface Props {
  userId: string;
  size?: "xs" | "sm" | "md";
  showTooltip?: boolean;
}

const sizeMap = {
  xs: "w-5 h-5 text-[9px]",
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
};

export const Avatar: React.FC<Props> = ({ userId, size = "sm", showTooltip = false }) => {
  const user = USERS.find((u) => u.id === userId);
  if (!user) return null;

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full font-display font-bold
        ${sizeMap[size]} flex-shrink-0`}
      style={{ backgroundColor: user.color + "33", color: user.color, border: `1.5px solid ${user.color}66` }}
      title={showTooltip ? user.name : undefined}
    >
      {user.initials}
    </div>
  );
};

interface AvatarGroupProps {
  userIds: string[];
  max?: number;
  size?: "xs" | "sm";
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({ userIds, max = 3, size = "xs" }) => {
  const visible = userIds.slice(0, max);
  const overflow = userIds.length - max;

  return (
    <div className="flex items-center -space-x-1">
      {visible.map((uid) => (
        <div key={uid} className="ring-1 ring-ink-800 rounded-full">
          <Avatar userId={uid} size={size} showTooltip />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={`inline-flex items-center justify-center rounded-full bg-ink-600 text-ink-100
            font-mono text-[9px] ring-1 ring-ink-800 ${sizeMap[size]}`}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
};
