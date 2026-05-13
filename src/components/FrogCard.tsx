import { useState } from "react";
import type { Frog } from "../lib/types";

interface FrogCardProps {
  frog: Frog;
  isActive: boolean;
  onSelect: () => void;
  onUpdate: (opts: { title?: string; status?: string }) => void;
  onDelete: () => void;
}

const STATUS_CONFIG = {
  pending: { icon: "⬜", label: "待完成", color: "border-slate-300 bg-white" },
  in_progress: { icon: "🔄", label: "进行中", color: "border-blue-400 bg-blue-50" },
  completed: { icon: "✅", label: "已完成", color: "border-green-400 bg-green-50" },
  abandoned: { icon: "❌", label: "已放弃", color: "border-red-300 bg-red-50" },
};

export function FrogCard({ frog, isActive, onSelect, onUpdate, onDelete }: FrogCardProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(frog.title);
  const config = STATUS_CONFIG[frog.status];

  const cycleStatus = () => {
    const order: string[] = ["pending", "in_progress", "completed", "abandoned"];
    const idx = order.indexOf(frog.status);
    const next = order[(idx + 1) % order.length];
    onUpdate({ status: next });
  };

  const commitTitle = () => {
    if (title.trim() && title !== frog.title) {
      onUpdate({ title: title.trim() });
    } else {
      setTitle(frog.title);
    }
    setEditing(false);
  };

  return (
    <div
      onClick={onSelect}
      className={`
        relative p-4 rounded-xl border-2 cursor-pointer transition-all
        ${config.color}
        ${isActive ? "ring-2 ring-blue-400 shadow-lg scale-[1.02]" : "shadow-sm hover:shadow-md"}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={(e) => { e.stopPropagation(); cycleStatus(); }}
              className="text-lg hover:scale-110 transition-transform"
              title="点击切换状态"
            >
              {config.icon}
            </button>
            {editing ? (
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={(e) => { if (e.key === "Enter") commitTitle(); if (e.key === "Escape") { setTitle(frog.title); setEditing(false); } }}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 text-sm font-medium bg-white border border-slate-300 rounded px-2 py-1 focus:outline-none focus:border-blue-400"
                autoFocus
              />
            ) : (
              <span
                className={`text-sm font-medium truncate ${frog.status === "completed" ? "line-through text-slate-400" : "text-slate-700"}`}
                onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
                title="双击编辑"
              >
                {frog.title}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              🍅 {frog.pomodoros}/{frog.estimated_pomodoros}
            </span>
            <span>{config.label}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={(e) => { e.stopPropagation(); setEditing(true); }}
            className="text-slate-400 hover:text-blue-500 transition-colors text-xs px-1"
            title="编辑标题"
          >
            ✏️
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-slate-400 hover:text-red-500 transition-colors text-xs px-1"
            title="删除"
          >
            ×
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            frog.status === "completed" ? "bg-green-400" : "bg-blue-400"
          }`}
          style={{
            width: `${Math.min(100, (frog.pomodoros / Math.max(1, frog.estimated_pomodoros)) * 100)}%`,
          }}
        />
      </div>
    </div>
  );
}
