import { useState } from "react";
import { useTauriQuery } from "../hooks/useTauriQuery";
import * as api from "../lib/tauri";
import { getToday, WEEK_THEMES } from "../lib/types";

interface DayStats {
  date: string;
  completed: number;
  total: number;
  pomodoros: number;
}

export function SummaryView() {
  const today = getToday();
  const [weekOffset, setWeekOffset] = useState(0);

  const getWeekDates = (offset: number): string[] => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + offset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    });
  };

  const weekDates = getWeekDates(weekOffset);

  const { data: weekStats } = useTauriQuery(
    async () => {
      const stats: DayStats[] = [];
      for (const date of weekDates) {
        const frogs = await api.getFrogs(date);
        const pomodoroStats = await api.getPomodoroStats(date);
        stats.push({
          date,
          completed: frogs.filter((f) => f.status === "completed").length,
          total: frogs.length,
          pomodoros: pomodoroStats.completed,
        });
      }
      return stats;
    },
    [weekDates.join(",")]
  );

  const totalCompleted = weekStats?.reduce((s, d) => s + d.completed, 0) ?? 0;
  const totalFrogs = weekStats?.reduce((s, d) => s + d.total, 0) ?? 0;
  const totalPomodoros = weekStats?.reduce((s, d) => s + d.pomodoros, 0) ?? 0;
  const rate = totalFrogs > 0 ? Math.round((totalCompleted / totalFrogs) * 100) : 0;

  const maxPomodoros = Math.max(1, ...(weekStats?.map((d) => d.pomodoros) ?? [1]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">📊 周总结</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="px-2 py-1 text-sm bg-slate-100 rounded hover:bg-slate-200"
          >
            ←
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="px-2 py-1 text-sm bg-slate-100 rounded hover:bg-slate-200"
          >
            本周
          </button>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="px-2 py-1 text-sm bg-slate-100 rounded hover:bg-slate-200"
            disabled={weekOffset >= 0}
          >
            →
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{totalCompleted}</div>
          <div className="text-xs text-blue-500">已完成</div>
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{rate}%</div>
          <div className="text-xs text-green-500">完成率</div>
        </div>
        <div className="bg-orange-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-orange-600">{totalPomodoros}</div>
          <div className="text-xs text-orange-500">番茄钟</div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h3 className="text-sm font-medium text-slate-600 mb-3">每日番茄钟</h3>
        <div className="flex items-end justify-between h-32 gap-2">
          {weekStats?.map((day, i) => {
            const height = maxPomodoros > 0 ? (day.pomodoros / maxPomodoros) * 100 : 0;
            const isToday = day.date === today;
            const dayLabel = ["一", "二", "三", "四", "五", "六", "日"][i];
            const theme = WEEK_THEMES[i + 1];

            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-slate-400">{day.pomodoros || ""}</span>
                <div className="w-full flex justify-center">
                  <div
                    className={`w-6 rounded-t transition-all duration-500 ${
                      isToday ? "bg-blue-500" : "bg-slate-300"
                    }`}
                    style={{ height: `${Math.max(4, height)}%` }}
                  />
                </div>
                <span className={`text-xs ${isToday ? "text-blue-600 font-bold" : "text-slate-500"}`}>
                  {theme?.emoji ?? dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily breakdown */}
      <div className="space-y-2">
        {weekStats?.map((day, i) => {
          const isToday = day.date === today;
          const theme = WEEK_THEMES[i + 1];
          return (
            <div
              key={day.date}
              className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                isToday ? "bg-blue-50 border border-blue-200" : "bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{theme?.emoji ?? ""}</span>
                <span className={`text-sm ${isToday ? "font-medium text-blue-700" : "text-slate-600"}`}>
                  {day.date.slice(5)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-500">
                  ✅ {day.completed}/{day.total}
                </span>
                <span className="text-slate-500">🍅 {day.pomodoros}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
