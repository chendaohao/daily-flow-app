import { useState, useEffect } from "react";
import type { Review } from "../lib/types";

interface ReviewPanelProps {
  review: Review | null;
  onSave: (gains: string, blockers: string, tomorrowPlan: string) => void;
  onClose: () => void;
}

export function ReviewPanel({ review, onSave, onClose }: ReviewPanelProps) {
  const [gains, setGains] = useState(review?.gains || "");
  const [blockers, setBlockers] = useState(review?.blockers || "");
  const [tomorrowPlan, setTomorrowPlan] = useState(review?.tomorrow_plan || "");

  useEffect(() => {
    setGains(review?.gains || "");
    setBlockers(review?.blockers || "");
    setTomorrowPlan(review?.tomorrow_plan || "");
  }, [review]);

  const handleSave = () => {
    onSave(gains, blockers, tomorrowPlan);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">🌙 每日复盘</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              今天最大的收获是什么？
            </label>
            <textarea
              value={gains}
              onChange={(e) => setGains(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
              rows={3}
              placeholder="记录今天的收获..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              遇到了什么障碍？
            </label>
            <textarea
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
              rows={3}
              placeholder="记录遇到的困难..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              明天最重要的任务是什么？
            </label>
            <textarea
              value={tomorrowPlan}
              onChange={(e) => setTomorrowPlan(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
              rows={2}
              placeholder="规划明天的首要任务..."
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            保存复盘
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200 transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
