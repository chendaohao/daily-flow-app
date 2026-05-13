import { WEEK_THEMES, getDayTheme } from "../lib/types";

interface WeekBarProps {
  selectedDay: number;
  onSelectDay: (day: number) => void;
}

export function WeekBar({ selectedDay, onSelectDay }: WeekBarProps) {
  const today = new Date().getDay();
  const todayTheme = getDayTheme(today);

  return (
    <div className="mb-6">
      {todayTheme && (
        <div className="text-center mb-3">
          <span className="text-2xl mr-2">{todayTheme.emoji}</span>
          <span className="text-lg font-semibold text-slate-700">
            {todayTheme.label}
          </span>
        </div>
      )}
      <div className="flex gap-1 justify-center">
        {Object.entries(WEEK_THEMES).map(([dayStr, theme]) => {
          const day = Number(dayStr);
          const isToday = day === today;
          const isSelected = day === selectedDay;

          return (
            <button
              key={day}
              onClick={() => onSelectDay(day)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${isSelected
                  ? "bg-blue-500 text-white shadow-md"
                  : isToday
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }
              `}
            >
              <div className="text-xs opacity-75">
                {["", "一", "二", "三", "四", "五"][day]}
              </div>
              <div className="text-xs mt-0.5">{theme.emoji}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
