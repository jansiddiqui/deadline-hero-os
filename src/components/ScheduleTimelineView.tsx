"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Calendar,
  Clock,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  CheckCircle2,
  CalendarDays,
  Shuffle
} from "lucide-react";

export const ScheduleTimelineView: React.FC = () => {
  const { tasks, userMemory, triggerAdaptiveReschedule } = useApp();
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Generate a list of next 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  const getDayName = (dateStr: string, idx: number) => {
    if (idx === 0) return "Today";
    if (idx === 1) return "Tomorrow";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  // Get blocks group by day
  const getDayBlocks = (dateStr: string) => {
    const blocks: any[] = [];
    tasks.forEach(t => {
      if (t.completed) return;
      const dayBlocks = t.scheduleBlocks.filter(b => b.date === dateStr);
      dayBlocks.forEach(b => {
        blocks.push({
          ...b,
          priority: t.priority,
          category: t.category
        });
      });
    });
    return blocks;
  };

  const handleReschedule = async () => {
    setIsRescheduling(true);
    await new Promise(res => setTimeout(res, 1200));
    await triggerAdaptiveReschedule();
    setIsRescheduling(false);
  };

  // Check if any day is overloaded (> preferredFocusHours limit)
  const overloadedDays = days.filter(d => {
    const hours = getDayBlocks(d).reduce((sum, b) => sum + b.durationHours, 0);
    return hours > userMemory.preferredFocusHours;
  });

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-background animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center bg-surface-primary p-6 rounded-xl border border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-widest">
            <CalendarDays className="w-3.5 h-3.5" /> Adaptive Scheduler Agent
          </div>
          <h2 className="text-xl font-bold text-white">Daily Timeline Scheduler</h2>
          <p className="text-xs text-zinc-400 font-mono">
            AI dynamically structures work blocks around your availability and peak focus hours.
          </p>
        </div>

        <button
          onClick={handleReschedule}
          disabled={isRescheduling}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold glow-indigo flex items-center gap-2 font-mono"
        >
          <Shuffle className={`w-3.5 h-3.5 ${isRescheduling ? "animate-spin" : ""}`} />
          {isRescheduling ? "Rebalancing Blocks..." : "Resolve Overloads"}
        </button>
      </div>

      {/* Proactive Conflict Banner */}
      {overloadedDays.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl flex gap-3 items-start animate-fade-in">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1 font-mono">
            <h4 className="text-xs font-bold text-white uppercase">Workload Overload Warning</h4>
            <p className="text-[11px] text-zinc-400 leading-normal">
              AI detected overload on {overloadedDays.map((d, i) => getDayName(d, days.indexOf(d))).join(" and ")} exceeding your {userMemory.preferredFocusHours}h daily limit. 
              Click <strong className="text-white">"Resolve Overloads"</strong> to let the Conflict Solver rebalance.
            </p>
          </div>
        </div>
      )}

      {/* Timeline List of Days */}
      <div className="space-y-4">
        {days.map((dateStr, idx) => {
          const blocks = getDayBlocks(dateStr);
          const totalHours = blocks.reduce((sum, b) => sum + b.durationHours, 0);
          const isOverloaded = totalHours > userMemory.preferredFocusHours;

          return (
            <div
              key={dateStr}
              className={`p-5 rounded-xl border transition-all ${
                isOverloaded
                  ? "bg-amber-500/5 border-amber-500/25"
                  : "bg-surface-primary border-white/5"
              }`}
            >
              {/* Day Header */}
              <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-3">
                <div className="flex items-baseline gap-2 font-mono">
                  <h3 className="text-sm font-bold text-white">{getDayName(dateStr, idx)}</h3>
                  <span className="text-[10px] text-zinc-500">{dateStr}</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-zinc-400">
                    Allocated: <strong className="text-white">{totalHours} hrs</strong> / {userMemory.preferredFocusHours}h max
                  </span>
                  {isOverloaded && (
                    <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-400 rounded-full font-semibold">
                      OVERLOAD
                    </span>
                  )}
                </div>
              </div>

              {/* Day Focus Blocks */}
              <div className="space-y-2">
                {blocks.length > 0 ? (
                  blocks.map((block) => (
                    <div
                      key={block.id}
                      className="p-3 bg-surface-secondary/50 border border-white/5 rounded-lg flex items-center justify-between font-mono"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-indigo-500 rounded-full" />
                        <div>
                          <span className="text-xs font-bold text-white block">{block.taskTitle}</span>
                          <span className="text-[9px] text-zinc-500 uppercase tracking-wider">
                            {block.category} • Scheduled Session block
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-zinc-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" /> {block.durationHours} hrs
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-semibold ${
                          block.priority === "Critical"
                            ? "bg-rose-500/10 text-rose-400"
                            : block.priority === "High"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-surface-secondary text-zinc-400"
                        }`}>
                          {block.priority}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-zinc-650 italic border border-dashed border-white/5 rounded-lg">
                    Free calendar. No work blocks scheduled today.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
