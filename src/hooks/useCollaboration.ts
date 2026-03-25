import { useEffect, useRef } from "react";
import { useStore } from "../store";
import { INITIAL_TASKS } from "../data/seed";

// Simulates 4 remote users moving between tasks every few seconds
export function useCollaborationSimulator() {
  const { collaborators, updateCollaborator } = useStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Only simulate the first 4 users (they are "remote" collaborators)
    const userIds = collaborators.map((c) => c.userId);
    const taskPool = INITIAL_TASKS.slice(0, 100); // Move around first 100 tasks

    intervalRef.current = setInterval(() => {
      // Pick a random collaborator to move
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      // Pick a random task or null (meaning they went idle)
      const goIdle = Math.random() < 0.15;
      const newTask = goIdle
        ? null
        : taskPool[Math.floor(Math.random() * taskPool.length)].id;
      updateCollaborator(userId, newTask);
    }, 2500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []); // eslint-disable-line
}
