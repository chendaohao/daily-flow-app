import { useState, useCallback, useEffect } from "react";
import { useTauriQuery } from "../hooks/useTauriQuery";
import * as api from "../lib/tauri";
import { getToday, getDayTheme } from "../lib/types";
import type { Frog, PomodoroStats } from "../lib/types";
import { FrogCard } from "./FrogCard";
import { PomodoroTimer } from "./PomodoroTimer";
import { ReviewPanel } from "./ReviewPanel";
import type { TimerMode } from "../hooks/useTimer";

export function DailyView() {
  const today = getToday();
  const dayOfWeek = new Date().getDay();
  const theme = getDayTheme(dayOfWeek);

  const [selectedFrogId, setSelectedFrogId] = useState<number | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [pomodoroMin, setPomodoroMin] = useState(50);
  const [breakMin, setBreakMin] = useState(10);
  const [currentPomodoroId, setCurrentPomodoroId] = useState<number | null>(null);

  // Load settings
  useEffect(() => {
    (async () => {
      const p = await api.getSetting("pomodoro_minutes");
      const b = await api.getSetting("break_minutes");
      if (p) setPomodoroMin(Number(p));
      if (b) setBreakMin(Number(b));
    })();
  }, []);

  // Fetch frogs
  const {
    data: frogs,
    refetch: refetchFrogs,
  } = useTauriQuery(() => api.getFrogs(today), [today]);

  // Fetch pomodoro stats
  const { data: stats, refetch: refetchStats } = useTauriQuery(
    () => api.getPomodoroStats(today),
    [today]
  );

  // Fetch review
  const { data: review, refetch: refetchReview } = useTauriQuery(
    () => api.getReview(today),
    [today]
  );

  // Notifications for time blocks
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      if (h === 9 && m === 0) api.sendNotification("开始工作", "规划今日三只青蛙，进入创造者时间");
      if (h === 13 && m === 30) api.sendNotification("下午检查", "检查青蛙进度，切换到管理者时间");
      if (h === 15 && m === 15) api.sendNotification("浅层工作", "处理客户交付和行政事务");
      if (h === 17 && m === 0) api.sendNotification("每日复盘", "回顾今日收获，规划明天");
    };
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAddFrog = async () => {
    const existing = frogs ?? [];
    if (existing.length >= 3) return;
    await api.createFrog(today, existing.length + 1, "新任务");
    refetchFrogs();
  };

  const handleUpdateFrog = async (
    id: number,
    opts: { title?: string; status?: string }
  ) => {
    await api.updateFrog(id, opts);
    refetchFrogs();
  };

  const handleDeleteFrog = async (id: number) => {
    await api.deleteFrog(id);
    refetchFrogs();
    if (selectedFrogId === id) setSelectedFrogId(null);
  };

  const handleTimerEnd = useCallback(
    async (mode: TimerMode) => {
      if (mode === "focus" && currentPomodoroId) {
        await api.completePomodoro(currentPomodoroId);
        setCurrentPomodoroId(null);
        refetchStats();
        refetchFrogs();
        api.sendNotification("番茄钟完成！", "休息一下吧 ☕");
      } else if (mode === "break") {
        api.sendNotification("休息结束", "准备下一轮专注 🎯");
      }
    },
    [currentPomodoroId, refetchStats, refetchFrogs]
  );

  const handleStartPomodoro = async () => {
    if (!selectedFrogId) return;
    const record = await api.startPomodoro(selectedFrogId, today);
    setCurrentPomodoroId(record.id);
  };

  const handleSaveReview = async (
    gains: string,
    blockers: string,
    tomorrowPlan: string
  ) => {
    await api.saveReview(today, gains, blockers, tomorrowPlan);
    refetchReview();
  };

  const frogList: Frog[] = frogs ?? [];
  const pomodoroStats: PomodoroStats = stats ?? { total: 0, completed: 0, total_minutes: 0 };

  return (
    <div className="space-y-6">
      {/* Header info */}
      {theme && (
        <div className="text-center text-sm text-slate-500">
          {today} · {pomodoroStats.completed} 个番茄钟 · {pomodoroStats.total_minutes} 分钟
        </div>
      )}

      {/* Frogs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700">🐸 今日青蛙</h2>
          {frogList.length < 3 && (
            <button
              onClick={handleAddFrog}
              className="text-xs text-blue-500 hover:text-blue-600 font-medium"
            >
              + 添加
            </button>
          )}
        </div>
        <div className="space-y-3">
          {frogList.map((frog) => (
            <FrogCard
              key={frog.id}
              frog={frog}
              isActive={selectedFrogId === frog.id}
              onSelect={() => setSelectedFrogId(frog.id === selectedFrogId ? null : frog.id)}
              onUpdate={(opts) => handleUpdateFrog(frog.id, opts)}
              onDelete={() => handleDeleteFrog(frog.id)}
            />
          ))}
          {frogList.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">
              点击上方「+ 添加」设定今日青蛙
            </div>
          )}
        </div>
      </div>

      {/* Pomodoro */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-700">🍅 番茄钟</h2>
          {selectedFrogId && (
            <button
              onClick={handleStartPomodoro}
              className="text-xs text-blue-500 hover:text-blue-600 font-medium"
            >
              关联到选中青蛙
            </button>
          )}
        </div>
        {selectedFrogId && (
          <div className="text-xs text-slate-500 mb-2 text-center">
            当前：{frogList.find((f) => f.id === selectedFrogId)?.title ?? "未选择"}
          </div>
        )}
        <PomodoroTimer
          focusMinutes={pomodoroMin}
          breakMinutes={breakMin}
          onPhaseEnd={handleTimerEnd}
        />
      </div>

      {/* Review button */}
      <button
        onClick={() => setShowReview(true)}
        className="w-full py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-700 transition-colors"
      >
        🌙 每日复盘
      </button>

      {/* Yesterday's plan */}
      {review?.tomorrow_plan && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="text-xs font-medium text-amber-700 mb-1">📝 昨晚计划</div>
          <div className="text-sm text-amber-800">{review.tomorrow_plan}</div>
        </div>
      )}

      {/* Review modal */}
      {showReview && (
        <ReviewPanel
          review={review ?? null}
          onSave={handleSaveReview}
          onClose={() => setShowReview(false)}
        />
      )}
    </div>
  );
}
