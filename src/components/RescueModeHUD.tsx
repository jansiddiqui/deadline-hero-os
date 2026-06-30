"use client";

import React, { useState, useEffect } from "react";
import { useApp, Task } from "@/context/AppContext";
import { AlertOctagon, ShieldAlert, CheckCircle2, X, AlertTriangle } from "lucide-react";

interface RescueModeHUDProps {
  task: Task;
  onClose: () => void;
}

export const RescueModeHUD: React.FC<RescueModeHUDProps> = ({ task, onClose }) => {
  const { toggleSubtask } = useApp();
  const [rescuePlan, setRescuePlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agent: "rescueAgent",
            title: task.title,
            subtasks: task.subtasks,
            remainingHours: 24
          })
        });
        const data = await res.json();
        if (data.success) {
          setRescuePlan(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [task]);

  const handleToggle = (titleStr: string) => {
    const sub = task.subtasks.find(s => s.title === titleStr);
    if (sub) {
      toggleSubtask(task.id, sub.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="w-full max-w-3xl bg-background border border-[#e11d48]/40 rounded-2xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.85)] flex flex-col max-h-[90vh] glow-crimson">
        
        {/* Header Alert Bar */}
        <div className="bg-[#e11d48] text-white px-6 py-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-6 h-6 animate-pulse" />
            <div>
              <h2 className="text-xs font-bold tracking-widest uppercase font-mono">DEADLINE RESCUE MODE ENABLED</h2>
              <p className="text-[10px] text-rose-100 font-mono tracking-wider mt-0.5">
                CRITICAL SCOPE PRUNED DYNAMICALLY BY AI AGENT
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 py-28 flex flex-col items-center justify-center space-y-4">
            <ShieldAlert className="w-10 h-10 text-rose-500 animate-spin" />
            <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">Generating speedrun workflow options...</span>
          </div>
        ) : (
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            
            {/* Risk details */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              <div className="md:col-span-4 bg-surface-primary border border-white/5 p-5 rounded-xl flex flex-col items-center text-center">
                <span className="text-[9px] text-zinc-550 font-mono uppercase tracking-wider mb-2">Completion Failure Risk</span>
                <div className="text-3xl font-bold text-[#e11d48] font-mono mb-1">{rescuePlan?.riskPercentage}%</div>
                <span className="px-2 py-0.5 bg-[#e11d48]/10 border border-[#e11d48]/30 text-[8px] font-mono text-[#e11d48] rounded-full font-bold uppercase tracking-wider animate-pulse">
                  CRITICAL ZONE
                </span>
              </div>

              <div className="md:col-span-8 bg-surface-primary border border-white/5 p-5 rounded-xl space-y-2">
                <span className="text-[9px] text-[#e11d48] font-mono uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> AI Survival Strategy Recommendation
                </span>
                <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                  {rescuePlan?.survivalStrategy}
                </p>
              </div>
            </div>

            {/* Subtask Lists: must-do vs pruned */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Must-Do list */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider font-mono">
                  <div className="w-2 h-2 rounded-full bg-[#e11d48] animate-ping" />
                  Critical checklist (Must Complete)
                </div>
                
                <div className="space-y-2">
                  {rescuePlan?.criticalSubtasks?.map((title: string, idx: number) => {
                    const isDone = task.subtasks.find(s => s.title === title)?.completed;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleToggle(title)}
                        className={`p-3 border rounded-xl text-xs flex items-center justify-between cursor-pointer transition-all ${
                          isDone
                            ? "bg-surface-primary/40 border-transparent text-zinc-550 line-through"
                            : "bg-[#e11d48]/5 border-[#e11d48]/20 text-rose-400 hover:border-[#e11d48]/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            isDone ? "border-[#e11d48] bg-[#e11d48]/10 text-[#e11d48]" : "border-[#e11d48]/40"
                          }`}>
                            {isDone && <CheckCircle2 className="w-2.5 h-2.5" />}
                          </div>
                          <span className="font-sans">{title}</span>
                        </div>
                        <span className="text-[8px] px-2 py-0.5 bg-[#e11d48]/10 border border-[#e11d48]/20 rounded-lg font-bold text-[#e11d48] font-mono uppercase tracking-wider">CRITICAL</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pruned list */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                  <div className="w-2 h-2 rounded-full bg-zinc-650" />
                  Pruned checkpoints (Safe to Skip)
                </div>

                <div className="space-y-2 opacity-75">
                  {rescuePlan?.skippableSubtasks?.map((title: string, idx: number) => {
                    const isDone = task.subtasks.find(s => s.title === title)?.completed;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleToggle(title)}
                        className={`p-3 border rounded-xl text-xs flex items-center justify-between cursor-pointer transition-all ${
                          isDone
                            ? "bg-surface-primary/40 border-transparent text-zinc-550 line-through"
                            : "bg-surface-primary border-white/5 text-zinc-400 hover:border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            isDone ? "border-zinc-700 bg-zinc-700/10 text-zinc-500" : "border-white/5"
                          }`}>
                            {isDone && <CheckCircle2 className="w-2.5 h-2.5" />}
                          </div>
                          <span className="font-sans">{title}</span>
                        </div>
                        <span className="text-[8px] px-2 py-0.5 bg-white/5 border border-white/5 rounded-lg font-bold text-zinc-550 font-mono uppercase tracking-wider">PRUNED</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
};
