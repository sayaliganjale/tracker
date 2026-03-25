import React from "react";
import { useStore } from "./store";
import { useURLState } from "./hooks/useURLState";
import { useCollaborationSimulator } from "./hooks/useCollaboration";
import { KanbanBoard } from "./components/kanban/KanbanBoard";
import { ListView } from "./components/list/ListView";
import { TimelineView } from "./components/timeline/TimelineView";
import { FilterBar } from "./components/filters/FilterBar";
import { ViewSwitcher } from "./components/ui/ViewSwitcher";
import { CollaborationBar } from "./components/collaboration/CollaborationBar";

export default function App() {
  useURLState();
  useCollaborationSimulator();

  const viewMode = useStore((s) => s.viewMode);

  return (
    <div className="min-h-screen bg-ink-950 text-ink-50 font-body flex flex-col">
      {/* Top bar */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 h-14 border-b border-ink-800
        bg-ink-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-acid-500/15 border border-acid-500/30">
            <svg className="w-4 h-4 text-acid-400" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 12L8 4L13 12"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              />
              <path
                d="M5 9h6"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="font-display font-bold text-base text-ink-50 tracking-tight">
            Trackr
          </span>
          <span className="text-ink-600 text-sm mx-1">/</span>
          <span className="font-body text-sm text-ink-300">Q2 Roadmap</span>
        </div>

        <div className="flex items-center gap-3">
          <CollaborationBar />
          <ViewSwitcher />
        </div>
      </header>

      {/* Filter bar */}
      <div className="flex-shrink-0 px-6 py-3 border-b border-ink-800/60 bg-ink-950/60">
        <FilterBar />
      </div>

      {/* Main content */}
      <main className="flex-1 min-h-0 flex flex-col px-6 py-4 overflow-hidden">
        {viewMode === "kanban" && <KanbanBoard />}
        {viewMode === "list" && <ListView />}
        {viewMode === "timeline" && <TimelineView />}
      </main>
    </div>
  );
}
