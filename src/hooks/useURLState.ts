import { useEffect, useCallback } from "react";
import { useStore, DEFAULT_FILTERS } from "../store";
import { FilterState, Status, Priority, ViewMode } from "../types";

function encodeFilters(filters: FilterState, viewMode: ViewMode): URLSearchParams {
  const params = new URLSearchParams();
  if (viewMode !== "kanban") params.set("view", viewMode);
  if (filters.statuses.length) params.set("status", filters.statuses.join(","));
  if (filters.priorities.length) params.set("priority", filters.priorities.join(","));
  if (filters.assigneeIds.length) params.set("assignee", filters.assigneeIds.join(","));
  if (filters.dueDateFrom) params.set("from", filters.dueDateFrom);
  if (filters.dueDateTo) params.set("to", filters.dueDateTo);
  return params;
}

function decodeFilters(params: URLSearchParams): { filters: FilterState; viewMode: ViewMode } {
  const statuses = params.get("status")?.split(",").filter(Boolean) as Status[] ?? [];
  const priorities = params.get("priority")?.split(",").filter(Boolean) as Priority[] ?? [];
  const assigneeIds = params.get("assignee")?.split(",").filter(Boolean) ?? [];
  const dueDateFrom = params.get("from") ?? "";
  const dueDateTo = params.get("to") ?? "";
  const view = (params.get("view") ?? "kanban") as ViewMode;

  return {
    filters: { statuses, priorities, assigneeIds, dueDateFrom, dueDateTo },
    viewMode: view,
  };
}

export function useURLState() {
  const { filters, viewMode, setFilters, setViewMode } = useStore();

  // On mount: restore from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.toString()) {
      const { filters: f, viewMode: v } = decodeFilters(params);
      setFilters(f);
      setViewMode(v);
    }
  }, []); // eslint-disable-line

  // On change: sync to URL
  useEffect(() => {
    const params = encodeFilters(filters, viewMode);
    const newSearch = params.toString();
    const current = window.location.search.replace("?", "");
    if (newSearch !== current) {
      const newUrl = newSearch
        ? `${window.location.pathname}?${newSearch}`
        : window.location.pathname;
      window.history.pushState({}, "", newUrl);
    }
  }, [filters, viewMode]);

  // Handle back/forward
  const handlePopState = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const { filters: f, viewMode: v } = decodeFilters(params);
    setFilters(f);
    setViewMode(v);
  }, [setFilters, setViewMode]);

  useEffect(() => {
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [handlePopState]);
}
