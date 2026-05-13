import { useState, useEffect } from "react";
import * as api from "../lib/tauri";

export function Settings() {
  const [pomodoroMin, setPomodoroMin] = useState("50");
  const [breakMin, setBreakMin] = useState("10");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("claude-sonnet-4-20250514");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await api.getSetting("pomodoro_minutes");
      const b = await api.getSetting("break_minutes");
      const k = await api.getSetting("claude_api_key");
      const m = await api.getSetting("claude_model");
      if (p) setPomodoroMin(p);
      if (b) setBreakMin(b);
      if (k) setApiKey(k);
      if (m) setModel(m);
    })();
  }, []);

  const handleSave = async () => {
    await api.setSetting("pomodoro_minutes", pomodoroMin);
    await api.setSetting("break_minutes", breakMin);
    await api.setSetting("claude_api_key", apiKey);
    await api.setSetting("claude_model", model);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-slate-800">⚙️ 设置</h2>

      {/* Pomodoro */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">🍅 番茄钟</h3>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">专注时长（分钟）</label>
            <input
              type="number"
              value={pomodoroMin}
              onChange={(e) => setPomodoroMin(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              min="1"
              max="120"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">休息时长（分钟）</label>
            <input
              type="number"
              value={breakMin}
              onChange={(e) => setBreakMin(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              min="1"
              max="30"
            />
          </div>
        </div>
      </div>

      {/* Claude API */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">🤖 Claude API</h3>
        <div>
          <label className="block text-xs text-slate-500 mb-1">API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">模型</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
          >
            <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
            <option value="claude-opus-4-20250514">Claude Opus 4</option>
            <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
          </select>
        </div>
        <p className="text-xs text-slate-400">
          用于 AI 总结和智能建议功能。API Key 安全存储在本地。
        </p>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className={`w-full py-2 rounded-lg font-medium transition-all ${
          saved
            ? "bg-green-500 text-white"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        {saved ? "已保存 ✓" : "保存设置"}
      </button>
    </div>
  );
}
