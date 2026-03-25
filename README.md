# Trackr — Multi-View Project Tracker

A fully-featured project management frontend built with React, TypeScript, and Tailwind CSS. Features a custom drag-and-drop system, virtual scrolling, three views, live collaboration indicators, and URL-synced filters — all without external UI, drag-and-drop, or virtual scrolling libraries.

## 🚀 Quick Start

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

To build for production:
```bash
npm run build
```

Deploy the `build/` folder to Vercel or Netlify.

---

## 🏗️ State Management Decision: Zustand

I chose **Zustand** over React Context + useReducer for several reasons:

1. **Performance**: Zustand uses selective subscriptions — components only re-render when the slice of state they subscribe to changes. With 500+ tasks and multiple views re-rendering simultaneously, Context would cause full subtree re-renders on every state change (e.g., a collaboration presence update would re-render the entire kanban board).

2. **No boilerplate**: Context + useReducer requires wrapping providers, writing action types, and threading dispatch everywhere. Zustand's API is a single `create()` call with direct mutations.

3. **Derived state is easy**: The `useFilteredTasks()` selector computes filtered + sorted tasks on demand without extra memoization infrastructure.

4. **DevTools support**: Zustand integrates with Redux DevTools for debugging.

The tradeoff vs Context: Zustand is a dependency. For a small app, Context would be fine — but at 500+ tasks with virtual scrolling, Zustand's subscription model measurably improves performance.

---

## 🎯 Virtual Scrolling Implementation

**File**: `src/components/list/ListView.tsx`

The virtual scroller renders only the rows visible in the viewport plus a buffer of 5 rows above and below:

```
total rows: 520
row height: 52px (fixed, uniform)
visible rows: ~12 (at 600px container height)
rendered rows: ~22 (12 visible + 5 buffer above + 5 below)
```

**How it works:**

1. A `ResizeObserver` tracks the container height (`containerHeight`).
2. On scroll, `scrollTop` is stored in state.
3. `startIndex` and `endIndex` are computed from `scrollTop / ROW_HEIGHT`.
4. A **full-height spacer div** (`height = tasks.length * ROW_HEIGHT`) maintains the correct scrollbar size and position even when only 22 rows are in the DOM.
5. Each visible row is `position: absolute` with `top = rowIndex * ROW_HEIGHT`, placing it at the correct scroll position.
6. `React.memo` on `ListRow` prevents re-renders when unrelated state changes.

**Why no blank gaps or flicker**: The buffer (5 rows) ensures rows are already in the DOM before they become visible. The fixed `ROW_HEIGHT` constant means we never need to measure DOM nodes — layout calculations are purely mathematical.

---

## 🖱️ Drag-and-Drop Implementation

**File**: `src/components/kanban/KanbanBoard.tsx`

Built entirely on the [HTML Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API) — no libraries.

**Key techniques:**

1. **Ghost image**: A custom div is created programmatically and passed to `e.dataTransfer.setDragImage()`. This gives us a styled preview that doesn't rely on the browser's default screenshot capture.

2. **Placeholder**: The dragged card remains in-place but gets `opacity: 40%` and `scale(0.95)` via CSS class. This acts as a visual placeholder showing original position without any DOM manipulation.

3. **Drop zones**: `onDragOver` on each `KanbanColumn` sets `dragOverColumn` state → column gets a dashed border + background highlight via Tailwind classes.

4. **Snap-back**: On `dragend`, we check `e.dataTransfer.dropEffect === "none"` — this is `"none"` when the drop occurred outside a valid drop target. If so, we call `moveTask(id, originalStatus)` to restore the card.

5. **Touch support**: Touch devices don't fire drag events. We attach `onPointerDown/Move/Up` listeners as a progressive enhancement fallback. The pointer events translate touch positions into simulated column drops by using `document.elementFromPoint()`.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── kanban/
│   │   ├── KanbanBoard.tsx   # Drag-and-drop orchestrator
│   │   ├── KanbanColumn.tsx  # Drop zone + column layout
│   │   └── TaskCard.tsx      # Draggable card
│   ├── list/
│   │   └── ListView.tsx      # Virtual scrolling table
│   ├── timeline/
│   │   └── TimelineView.tsx  # Gantt chart
│   ├── filters/
│   │   └── FilterBar.tsx     # Multi-select filters
│   ├── collaboration/
│   │   └── CollaborationBar.tsx
│   └── ui/
│       ├── Avatar.tsx
│       ├── PriorityBadge.tsx
│       ├── StatusDropdown.tsx
│       └── ViewSwitcher.tsx
├── data/
│   └── seed.ts               # 520-task generator
├── hooks/
│   ├── useURLState.ts        # URL ↔ filter sync
│   └── useCollaboration.ts  # Presence simulation
├── store/
│   └── index.ts              # Zustand store + selectors
├── types/
│   └── index.ts              # All TypeScript types
└── utils/
    └── dates.ts              # Date helpers
```

---

## 🔗 URL State

Filters and view mode are reflected in the URL as query parameters:

```
/?view=list&status=todo,in_progress&priority=critical&from=2025-01-01&to=2025-03-31
```

`useURLState` hook:
- **On mount**: parses `window.location.search` and hydrates the Zustand store
- **On change**: serializes filter state to `URLSearchParams` and calls `history.pushState`
- **On back/forward**: listens to `popstate` and re-hydrates the store

---

## ⚡ Performance Notes

- Virtual scrolling keeps DOM nodes ~22 regardless of dataset size
- `React.memo` on `ListRow` prevents cascade re-renders
- Zustand selective subscriptions: `useStore(s => s.viewMode)` only re-renders on viewMode changes
- Collaboration simulator uses `setInterval` (not `requestAnimationFrame`) to avoid frame-budget pressure
- Gantt chart renders only the current month's days (~30 cells × N tasks)

---

## 🧩 What I'd Refactor With More Time

1. **Touch drag-and-drop**: The current implementation uses HTML drag events which don't fire on touch. A proper pointer-events based implementation would track `pointerId`, create a floating clone on `pointerdown`, update its position on `pointermove`, and hit-test drop zones on `pointerup`.

2. **Virtualize the Kanban columns**: With 500+ tasks in a single column (e.g., all "done"), the column would scroll slowly. Each column should use its own virtual scroller.

3. **Optimistic updates**: Status changes currently mutate state synchronously. In a real app with a backend, we'd want optimistic UI with rollback on failure.
