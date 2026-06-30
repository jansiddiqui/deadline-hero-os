"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Target, Plus, CheckCircle2, Trash2, Calendar, Sparkles } from "lucide-react";

export const GoalTrackerView: React.FC = () => {
  const { goals, addGoal, toggleMilestone, deleteGoal } = useApp();
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Academic");
  const [newDate, setNewDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addGoal(newTitle, newCategory, newDate || new Date().toISOString().split("T")[0]);
    setNewTitle("");
    setNewDate("");
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-background animate-fade-in font-mono text-xs text-zinc-400">
      {/* Header */}
      <div className="flex justify-between items-center bg-surface-primary p-6 rounded-xl border border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 text-[10px] uppercase tracking-widest font-semibold">
            <Target className="w-4.5 h-4.5" /> AI Goal Planner
          </div>
          <h2 className="text-xl font-bold text-white">Milestone Goal Tracker</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creator panel */}
        <div className="bg-surface-primary p-5 rounded-xl border border-white/5 h-fit space-y-4">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block">Create AI Goal</span>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] text-zinc-500 uppercase">Goal Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Learn React framework"
                className="w-full bg-surface-secondary border border-white/5 rounded p-2 text-white placeholder-zinc-700 focus:outline-none"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[9px] text-zinc-500 uppercase">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-surface-secondary border border-white/5 rounded p-2 text-white"
              >
                <option value="Academic">Academic</option>
                <option value="Career">Career</option>
                <option value="Business">Business</option>
                <option value="Health">Health</option>
                <option value="Personal">Personal</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] text-zinc-500 uppercase">Target Accomplish Date</label>
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full bg-surface-secondary border border-white/5 rounded p-2 text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold text-center glow-indigo"
            >
              Generate Goal Milestones
            </button>
          </form>
        </div>

        {/* Goals list */}
        <div className="lg:col-span-2 space-y-4">
          {goals.length > 0 ? (
            goals.map((g) => (
              <div key={g.id} className="bg-surface-primary p-5 rounded-xl border border-white/5 space-y-4">
                <div className="flex justify-between items-start border-b border-white/5 pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{g.title}</h3>
                    <span className="text-[9px] text-zinc-500 mt-1 block">
                      {g.category} • Target: {g.targetDate}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteGoal(g.id)}
                    className="p-1 text-zinc-500 hover:text-rose-400 rounded hover:bg-surface-secondary"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                 {/* Milestones checklist */}
                <div className="space-y-2">
                  <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider block">Generated milestones</span>
                  <div className="space-y-1.5">
                    {g.milestones.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => toggleMilestone(g.id, m.id)}
                        className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                          m.completed
                            ? "bg-surface-primary/20 border-white/5 text-zinc-500 line-through"
                            : "bg-surface-secondary/40 border-white/5 text-zinc-350 hover:border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            m.completed ? "border-indigo-500 bg-indigo-500/10 text-indigo-400" : "border-white/10"
                          }`}>
                            {m.completed && <CheckCircle2 className="w-2.5 h-2.5" />}
                          </div>
                          <span>{m.title}</span>
                        </div>
                        <span className="text-[9px] text-zinc-500 flex items-center gap-1 shrink-0 ml-2">
                          <Calendar className="w-3 h-3" /> {m.targetDate}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center text-zinc-650 italic border border-dashed border-white/5 rounded-lg bg-surface-primary">
              No goals tracked. Input a long-term goal on the left to let Gemini schedule milestones!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
