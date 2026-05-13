import { invoke } from "@tauri-apps/api/core";
import type { Frog, PomodoroRecord, PomodoroStats, Review } from "./types";

// Frogs
export const getFrogs = (date: string) =>
  invoke<Frog[]>("get_frogs", { date });

export const createFrog = (date: string, position: number, title: string) =>
  invoke<Frog>("create_frog", { date, position, title });

export const updateFrog = (
  id: number,
  opts: { title?: string; status?: string; pomodoros?: number; estimated_pomodoros?: number }
) => {
  const params: Record<string, unknown> = { id };
  if (opts.title !== undefined) params.title = opts.title;
  if (opts.status !== undefined) params.status = opts.status;
  if (opts.pomodoros !== undefined) params.pomodoros = opts.pomodoros;
  if (opts.estimated_pomodoros !== undefined) params.estimated_pomodoros = opts.estimated_pomodoros;
  return invoke<Frog>("update_frog", params);
};

export const deleteFrog = (id: number) =>
  invoke<void>("delete_frog", { id });

// Pomodoros
export const startPomodoro = (frogId: number, date: string) =>
  invoke<PomodoroRecord>("start_pomodoro", { frogId, date });

export const completePomodoro = (id: number) =>
  invoke<void>("complete_pomodoro", { id });

export const getPomodoroStats = (date: string) =>
  invoke<PomodoroStats>("get_pomodoro_stats", { date });

// Reviews
export const getReview = (date: string) =>
  invoke<Review | null>("get_review", { date });

export const saveReview = (
  date: string,
  gains: string,
  blockers: string,
  tomorrowPlan: string
) => invoke<Review>("save_review", { date, gains, blockers, tomorrowPlan });

// Settings
export const getSetting = (key: string) =>
  invoke<string | null>("get_setting", { key });

export const setSetting = (key: string, value: string) =>
  invoke<void>("set_setting", { key, value });

// Notifications
export const sendNotification = (title: string, body: string) =>
  invoke<void>("send_notification", { title, body });

// Claude API
export const claudeComplete = (
  prompt: string,
  context: string,
  apiKey: string,
  model: string
) => invoke<string>("claude_complete", { prompt, context, apiKey, model });
