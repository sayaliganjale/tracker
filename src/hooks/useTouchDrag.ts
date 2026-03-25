import { useRef, useCallback } from "react";
import { Status } from "../types";

interface TouchDragOptions {
  onDrop: (taskId: string, targetStatus: Status) => void;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
}

// Column status from DOM element lookup
function getColumnStatus(element: Element | null): Status | null {
  if (!element) return null;
  const col = element.closest("[data-column-status]");
  if (!col) return null;
  return col.getAttribute("data-column-status") as Status;
}

export function useTouchDrag({ onDrop, onDragStart, onDragEnd }: TouchDragOptions) {
  const draggingIdRef = useRef<string | null>(null);
  const cloneRef = useRef<HTMLDivElement | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const movedRef = useRef(false);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, taskId: string, cardEl: HTMLElement) => {
      const touch = e.touches[0];
      startXRef.current = touch.clientX;
      startYRef.current = touch.clientY;
      movedRef.current = false;
      draggingIdRef.current = taskId;

      // Delay clone creation slightly to distinguish tap from drag
      const timeout = setTimeout(() => {
        if (!draggingIdRef.current) return;

        // Create floating clone
        const rect = cardEl.getBoundingClientRect();
        const clone = cardEl.cloneNode(true) as HTMLDivElement;
        clone.style.cssText = `
          position: fixed;
          top: ${rect.top}px;
          left: ${rect.left}px;
          width: ${rect.width}px;
          z-index: 9999;
          opacity: 0.85;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
          pointer-events: none;
          transform: scale(1.03);
          transition: none;
        `;
        document.body.appendChild(clone);
        cloneRef.current = clone;
        onDragStart(taskId);
      }, 120);

      // Cancel if finger lifts quickly (tap)
      const cancelTimeout = () => {
        clearTimeout(timeout);
        cardEl.removeEventListener("touchend", cancelTimeout);
        cardEl.removeEventListener("touchcancel", cancelTimeout);
      };
      cardEl.addEventListener("touchend", cancelTimeout, { once: true });
      cardEl.addEventListener("touchcancel", cancelTimeout, { once: true });
    },
    [onDragStart]
  );

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!cloneRef.current || !draggingIdRef.current) return;
    e.preventDefault();

    const touch = e.touches[0];
    const dx = touch.clientX - startXRef.current;
    const dy = touch.clientY - startYRef.current;
    movedRef.current = true;

    const clone = cloneRef.current;
    const currentTop = parseFloat(clone.style.top);
    const currentLeft = parseFloat(clone.style.left);
    clone.style.top = `${currentTop + dy}px`;
    clone.style.left = `${currentLeft + dx}px`;
    startXRef.current = touch.clientX;
    startYRef.current = touch.clientY;

    // Highlight column under finger
    clone.style.display = "none";
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    clone.style.display = "";

    // Remove previous highlights
    document.querySelectorAll("[data-column-status]").forEach((el) => {
      (el as HTMLElement).style.removeProperty("background");
    });

    const col = elementBelow?.closest("[data-column-status]") as HTMLElement | null;
    if (col) {
      col.style.background = "rgba(200,240,0,0.06)";
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const taskId = draggingIdRef.current;
      const clone = cloneRef.current;

      // Cleanup
      if (clone) {
        document.body.removeChild(clone);
        cloneRef.current = null;
      }

      // Remove column highlights
      document.querySelectorAll("[data-column-status]").forEach((el) => {
        (el as HTMLElement).style.removeProperty("background");
      });

      if (!taskId) return;

      const touch = e.changedTouches[0];
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      const status = getColumnStatus(elementBelow);

      if (status && movedRef.current) {
        onDrop(taskId, status);
      }

      draggingIdRef.current = null;
      onDragEnd();
    },
    [onDrop, onDragEnd]
  );

  return { handleTouchStart, handleTouchMove, handleTouchEnd };
}
