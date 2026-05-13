import { useState } from "react";
import { WeekBar } from "./components/WeekBar";
import { DailyView } from "./components/DailyView";
import { SummaryView } from "./components/SummaryView";
import { Settings } from "./components/Settings";

type Tab = "daily" | "summary" | "settings";

export default function App() {
  const [tab, setTab] = useState<Tab>("daily");
  const today = new Date().getDay();
  const defaultDay = today === 0 || today === 6 ? 1 : today;
  const [selectedDay, setSelectedDay] = useState(defaultDay);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <header className="mb-4">
          <h1 className="text-xl font-bold text-slate-800 text-center">
            Daily Flow
          </h1>
          <p className="text-xs text-slate-500 text-center mt-1">
            一人公司工作流
          </p>
        </header>

        {/* Week bar */}
        <WeekBar selectedDay={selectedDay} onSelectDay={setSelectedDay} />

        {/* Tab content */}
        <main>
          {tab === "daily" && <DailyView selectedDay={selectedDay} />}
          {tab === "summary" && <SummaryView />}
          {tab === "settings" && <Settings />}
        </main>

        {/* Bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200">
          <div className="max-w-md mx-auto flex">
            {[
              { id: "daily" as Tab, label: "今日", icon: "🐸" },
              { id: "summary" as Tab, label: "总结", icon: "📊" },
              { id: "settings" as Tab, label: "设置", icon: "⚙️" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex-1 py-3 text-center transition-colors ${
                  tab === item.id
                    ? "text-blue-600 bg-blue-50"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <div className="text-lg">{item.icon}</div>
                <div className="text-xs font-medium">{item.label}</div>
              </button>
            ))}
          </div>
        </nav>

        {/* Bottom spacer for fixed nav */}
        <div className="h-16" />
      </div>
    </div>
  );
}
