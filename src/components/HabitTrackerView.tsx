"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Flame, Plus, CheckCircle2, Trash2, Cpu, HelpCircle } from "lucide-react";

export const HabitTrackerView: React.FC = () => {
  const { habits, addHabit, checkInHabit, deleteHabit } = useApp();
  const [habitName, setHabitName] = useState("");
  const [habitCategory, setHabitCategory] = useState("Academic");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) return;
    addHabit(habitName, habitCategory);
    setHabitName("");
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-background animate-fade-in font-mono text-xs text-zinc-400">
      {/* Header */}
      <div className="flex justify-between items-center bg-surface-primary p-6 rounded-xl border border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 text-[10px] uppercase tracking-widest font-semibold">
            <Flame className="w-4.5 h-4.5" /> AI Habit Tracker
          </div>
          <h2 className="text-xl font-bold text-white">Daily Streak Builder</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creator Panel */}
        <div className="bg-surface-primary p-5 rounded-xl border border-white/5 h-fit space-y-4">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block">Create Habit</span>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] text-zinc-500 uppercase">Habit Title</label>
              <input
                type="text"
                required
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                placeholder="e.g. Read tech newsletters"
                className="w-full bg-surface-secondary border border-white/5 rounded p-2 text-white placeholder-zinc-750 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] text-zinc-500 uppercase">Category</label>
              <select
                value={habitCategory}
                onChange={(e) => setHabitCategory(e.target.value)}
                className="w-full bg-surface-secondary border border-white/5 rounded p-2 text-white"
              >
                <option value="Academic">Academic</option>
                <option value="Career">Career</option>
                <option value="Business">Business</option>
                <option value="Health">Health</option>
                <option value="Personal">Personal</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold text-center glow-indigo"
            >
              Start tracking
            </button>
          </form>
        </div>

        {/* Habits List */}
        <div className="lg:col-span-2 space-y-4">
          {habits.length > 0 ? (
            habits.map((h) => {
              const isDoneToday = h.completedDates.includes(todayStr);
              return (
                <div key={h.id} className="bg-surface-primary p-5 rounded-xl border border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => checkInHabit(h.id)}
                        className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                          isDoneToday
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold"
                            : "border-white/10 hover:border-emerald-500"
                        }`}
                      >
                        {isDoneToday && <CheckCircle2 className="w-4.5 h-4.5" />}
                      </button>
                      <div>
                        <h3 className={`text-sm font-bold text-white leading-tight ${isDoneToday ? "line-through text-zinc-500" : ""}`}>
                          {h.name}
                        </h3>
                        <span className="text-[9px] text-zinc-500 mt-1 block">{h.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Streak badge */}
                      <span className="px-2.5 py-1 bg-orange-500/10 border border-orange-500/25 text-[10px] text-orange-400 rounded-full font-bold flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 fill-current" /> {h.streaks} Day Streak
                      </span>

                      <button
                        onClick={() => deleteHabit(h.id)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 rounded hover:bg-surface-secondary transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* AI Recommendation tip */}
                  {h.aiTip && (
                    <div className="p-3 bg-surface-secondary/40 border border-white/5 rounded-lg flex gap-2.5 items-start">
                      <Cpu className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-indigo-400 font-bold uppercase block tracking-wider">AI Habit Directive</span>
                        <p className="text-[10px] text-zinc-400 leading-normal">{h.aiTip}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-16 text-center text-zinc-650 italic border border-dashed border-white/5 rounded-lg bg-surface-primary">
              No habits scheduled yet. Start a new routine on the left!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
