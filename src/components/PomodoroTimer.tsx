import { useTimer, type TimerMode } from "../hooks/useTimer";

interface PomodoroTimerProps {
  focusMinutes: number;
  breakMinutes: number;
  onPhaseEnd: (mode: TimerMode) => void;
}

export function PomodoroTimer({
  focusMinutes,
  breakMinutes,
  onPhaseEnd,
}: PomodoroTimerProps) {
  const { mode, secondsLeft, isRunning, start, pause, resume, skip, reset } =
    useTimer(focusMinutes, breakMinutes, onPhaseEnd);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const totalSeconds = (mode === "break" ? breakMinutes : focusMinutes) * 60;
  const progress = mode === "idle" ? 0 : ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const modeLabel: Record<TimerMode, string> = {
    focus: "专注中",
    break: "休息中",
    idle: "番茄钟",
  };

  const modeColor: Record<TimerMode, string> = {
    focus: "#3b82f6",
    break: "#22c55e",
    idle: "#94a3b8",
  };

  return (
    <div className="flex flex-col items-center py-4">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={modeColor[mode]}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-slate-500 mb-1">{modeLabel[mode]}</span>
          <span className="text-3xl font-mono font-bold text-slate-800">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {mode === "idle" && !isRunning && (
          <button
            onClick={start}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            开始专注
          </button>
        )}
        {isRunning && (
          <button
            onClick={pause}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
          >
            暂停
          </button>
        )}
        {!isRunning && mode !== "idle" && (
          <button
            onClick={resume}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            继续
          </button>
        )}
        {mode !== "idle" && (
          <button
            onClick={skip}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
          >
            跳过
          </button>
        )}
        {(mode !== "idle" || isRunning) && (
          <button
            onClick={reset}
            className="px-4 py-2 bg-slate-100 text-slate-500 rounded-lg font-medium hover:bg-slate-200 transition-colors"
          >
            重置
          </button>
        )}
      </div>
    </div>
  );
}
