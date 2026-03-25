export function today(): string {
  return new Date().toISOString().split("T")[0];
}

export function parseDate(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function diffDays(a: string, b: string): number {
  const msPerDay = 86400000;
  return Math.round((parseDate(a).getTime() - parseDate(b).getTime()) / msPerDay);
}

export function formatDueDate(dueDate: string): { label: string; overdue: boolean; dueToday: boolean } {
  const t = today();
  const diff = diffDays(dueDate, t);

  if (diff === 0) {
    return { label: "Due Today", overdue: false, dueToday: true };
  }
  if (diff < -7) {
    return { label: `${Math.abs(diff)}d overdue`, overdue: true, dueToday: false };
  }
  if (diff < 0) {
    return { label: `${Math.abs(diff)}d overdue`, overdue: true, dueToday: false };
  }
  // Format nicely
  const d = parseDate(dueDate);
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return { label: d.toLocaleDateString("en-US", options), overdue: false, dueToday: false };
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getMonthDates(year: number, month: number): string[] {
  const days = getDaysInMonth(year, month);
  return Array.from({ length: days }, (_, i) => {
    const d = i + 1;
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  });
}
