import { Task, User, Priority, Status, USER_COLORS } from "../types";

const FIRST_NAMES = ["Alex", "Jordan", "Morgan", "Casey", "Riley", "Taylor"];
const LAST_NAMES = ["Chen", "Park", "Kim", "Singh", "Patel", "Rivera"];

export const USERS: User[] = FIRST_NAMES.map((first, i) => ({
  id: `user-${i + 1}`,
  name: `${first} ${LAST_NAMES[i]}`,
  color: USER_COLORS[i],
  initials: `${first[0]}${LAST_NAMES[i][0]}`,
}));

const TASK_PREFIXES = [
  "Implement", "Refactor", "Fix", "Design", "Review", "Update",
  "Optimize", "Migrate", "Add", "Remove", "Test", "Document",
  "Deploy", "Configure", "Investigate", "Build", "Create", "Integrate",
];

const TASK_SUBJECTS = [
  "authentication flow", "user dashboard", "API endpoints", "database schema",
  "payment gateway", "notification system", "search functionality", "caching layer",
  "CI/CD pipeline", "error handling", "logging system", "rate limiting",
  "WebSocket support", "file upload", "email templates", "analytics tracking",
  "dark mode", "keyboard shortcuts", "accessibility audit", "performance profiling",
  "mobile layout", "onboarding flow", "settings page", "billing module",
  "export feature", "import wizard", "data visualization", "chart components",
  "drag-and-drop", "infinite scroll", "lazy loading", "code splitting",
  "TypeScript migration", "test coverage", "security audit", "GDPR compliance",
  "multi-language support", "SSO integration", "OAuth flow", "2FA setup",
  "webhook handler", "queue system", "batch processing", "snapshot testing",
  "E2E test suite", "load testing", "monitoring dashboard", "alerting rules",
  "feature flags", "A/B testing framework",
];

const PRIORITIES: Priority[] = ["critical", "high", "medium", "low"];
const STATUSES: Status[] = ["todo", "in_progress", "in_review", "done"];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toISODate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function generateTasks(count: number = 520): Task[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tasks: Task[] = [];

  // Priority distribution: more medium/low than critical/high
  const priorityWeights = [0.1, 0.2, 0.4, 0.3]; // critical, high, medium, low
  const statusWeights = [0.35, 0.25, 0.2, 0.2]; // todo, in_progress, in_review, done

  function weightedRandom<T>(items: T[], weights: number[]): T {
    const r = Math.random();
    let cum = 0;
    for (let i = 0; i < items.length; i++) {
      cum += weights[i];
      if (r < cum) return items[i];
    }
    return items[items.length - 1];
  }

  for (let i = 0; i < count; i++) {
    const prefix = randomFrom(TASK_PREFIXES);
    const subject = randomFrom(TASK_SUBJECTS);
    const title = `${prefix} ${subject}`;

    const daysOffset = Math.floor(Math.random() * 60) - 20; // -20 to +40 days from today
    const dueDate = addDays(today, daysOffset);

    // 20% of tasks have no start date
    const hasStartDate = Math.random() > 0.2;
    const startDaysBack = hasStartDate ? Math.floor(Math.random() * 14) + 1 : 0;
    const startDate = hasStartDate ? addDays(dueDate, -startDaysBack) : null;

    tasks.push({
      id: `task-${i + 1}`,
      title: i < TASK_SUBJECTS.length ? `${TASK_PREFIXES[i % TASK_PREFIXES.length]} ${TASK_SUBJECTS[i % TASK_SUBJECTS.length]}` : title,
      assigneeId: USERS[i % USERS.length].id,
      priority: weightedRandom(PRIORITIES, priorityWeights),
      status: weightedRandom(STATUSES, statusWeights),
      startDate: startDate ? toISODate(startDate) : null,
      dueDate: toISODate(dueDate),
    });
  }

  // Ensure some overdue tasks (more than 7 days overdue)
  for (let i = 0; i < 30; i++) {
    const idx = Math.floor(Math.random() * 100);
    const overdueDate = addDays(today, -(Math.floor(Math.random() * 20) + 8));
    tasks[idx].dueDate = toISODate(overdueDate);
    tasks[idx].status = randomFrom(["todo", "in_progress"] as Status[]);
  }

  // Ensure some "due today" tasks
  for (let i = 0; i < 10; i++) {
    const idx = 100 + i;
    tasks[idx].dueDate = toISODate(today);
  }

  return tasks;
}

export const INITIAL_TASKS = generateTasks(520);
