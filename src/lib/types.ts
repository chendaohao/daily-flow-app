export interface Frog {
  id: number;
  date: string;
  position: number;
  title: string;
  status: "pending" | "in_progress" | "completed" | "abandoned";
  pomodoros: number;
  estimated_pomodoros: number;
  created_at: string;
  updated_at: string;
}

export interface PomodoroRecord {
  id: number;
  frog_id: number | null;
  date: string;
  started_at: string;
  duration_minutes: number;
  completed: boolean;
}

export interface PomodoroStats {
  total: number;
  completed: number;
  total_minutes: number;
}

export interface Review {
  id: number;
  date: string;
  gains: string | null;
  blockers: string | null;
  tomorrow_plan: string | null;
  created_at: string;
}

export interface WeekTheme {
  name: string;
  label: string;
  emoji: string;
}

export const WEEK_THEMES: Record<number, WeekTheme> = {
  1: { name: "planning-dev", label: "规划与开发日", emoji: "📋" },
  2: { name: "business-dev", label: "业务拓展日", emoji: "📈" },
  3: { name: "deep-dev", label: "深度开发日", emoji: "🔧" },
  4: { name: "client-delivery", label: "客户交付与行政日", emoji: "📦" },
  5: { name: "flexible-learning", label: "灵活与学习日", emoji: "📚" },
};

export function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getDayTheme(dayOfWeek: number): WeekTheme | null {
  return WEEK_THEMES[dayOfWeek] ?? null;
}
