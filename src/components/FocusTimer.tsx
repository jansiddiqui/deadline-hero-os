"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Flame,
  AlertTriangle,
  Zap,
  Target
} from "lucide-react";

export const FocusTimer: React.FC = () => {
  const { tasks, toggleSubtask } = useApp();
  
  const [sessionMinutes, setSessionMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<"focus" | "break">("focus");
  const [completedSessions, setCompletedSessions] = useState(1);
  const [selectedSubtaskId, setSelectedSubtaskId] = useState("");

  const intervalRef = useRef<any>(null);

  // Collect all incomplete subtasks
  const subtasksList: any[] = [];
  tasks.forEach(t => {
    if (t.completed) return;
    t.subtasks.forEach(s => {
      if (!s.completed) {
        subtasksList.push({
          ...s,
          parentTitle: t.title,
          parentId: t.id
        });
      }
    });
  });

  useEffect(() => {
    if (subtasksList.length > 0 && !selectedSubtaskId) {
      setSelectedSubtaskId(subtasksList[0].id);
    }
  }, [subtasksList]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const handleSessionComplete = () => {
    if (timerMode === "focus") {
      setCompletedSessions(prev => prev + 1);
      if (selectedSubtaskId) {
        const selected = subtasksList.find(s => s.id === selectedSubtaskId);
        if (selected) {
          toggleSubtask(selected.parentId, selected.id);
        }
      }
      setTimerMode("break");
      setSecondsLeft(5 * 60); // 5 min break
    } else {
      setTimerMode("focus");
      setSecondsLeft(sessionMinutes * 60);
    }
  };

  const handlePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft((timerMode === "focus" ? sessionMinutes : 5) * 60);
  };

  const selectSessionLength = (mins: number) => {
    setIsRunning(false);
    setSessionMinutes(mins);
    setSecondsLeft(mins * 60);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const selectedSub = subtasksList.find(s => s.id === selectedSubtaskId);
  const totalSeconds = (timerMode === "focus" ? sessionMinutes : 5) * 60;

  const getFocusSegments = () => {
    if (sessionMinutes === 25) {
      return [
        { label: "Deep Brain Focus", start: "0m", end: "15m", desc: "Isolate distraction channels. Focus on core features." },
        { label: "Prototype Review", start: "15m", end: "20m", desc: "Initiate local verification runs." },
        { label: "Refactor / Cleanup", start: "20m", end: "25m", desc: "Optimize variable parameters and style guides." }
      ];
    }
    return [
      { label: "Setup requirements", start: "0m", end: "10m", desc: "Outline code block goals." },
      { label: "Implementation Sprint", start: "10m", end: "40m", desc: "Deep code block execution." },
      { label: "Integration Verification", start: "40m", end: "50m", desc: "Review dependency mapping." }
    ];
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 md:space-y-8 overflow-y-auto bg-background animate-fade-in select-none">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-surface-primary p-6 rounded-2xl border border-white/5 relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-1.5 text-indigo-400 text-[9px] uppercase tracking-widest font-semibold font-mono">
            <Clock className="w-3.5 h-3.5" /> EXECUTION ENGINE
          </div>
          <h2 className="text-lg font-semibold text-white tracking-tight">Deep Focus Cockpit</h2>
          <p className="text-xs text-zinc-500">
            Link focus sessions with your active timeline subtasks.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-secondary border border-white/5 rounded-xl text-white font-mono text-[10px] relative z-10 shadow-sm">
          <Flame className="w-3.5 h-3.5 text-orange-500 fill-current animate-pulse" />
          STREAKS: <strong className="text-orange-400 font-semibold">{completedSessions} CYCLES</strong>
        </div>
      </div>

      {/* Burnout Guard */}
      {sessionMinutes >= 50 && (
        <div className="bg-amber-500/5 border border-amber-500/15 p-4 rounded-xl flex gap-3 items-start animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1 leading-normal font-mono text-[10px]">
            <span className="font-semibold text-white uppercase text-[8px] tracking-wider block">AI Burnout Guard Enabled</span>
            <p className="text-zinc-450 leading-relaxed font-sans text-xs">
              Focusing continuously beyond 50 minutes reduces cognitive speed by 25%. A rest break will trigger when this countdown completes.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Column 1: Timer Dial Console */}
        <div className="lg:col-span-4 bg-surface-primary p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center relative">
          <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-4 self-start font-mono">Countdown</h3>

          <div className="relative w-44 h-44 flex items-center justify-center mb-5">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="88" cy="88" r="74" stroke="var(--surface-secondary)" strokeWidth="4" fill="transparent" />
              <circle
                cx="88"
                cy="88"
                r="74"
                stroke={timerMode === "focus" ? "var(--indigo-primary)" : "#10b981"}
                strokeWidth="5"
                fill="transparent"
                strokeDasharray={464}
                strokeDashoffset={totalSeconds > 0 ? 464 - (464 * secondsLeft) / totalSeconds : 464}
                strokeLinecap="round"
                className="transition-all duration-350"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-semibold text-white tracking-tight font-mono">{formatTime(secondsLeft)}</span>
              <span className="text-[7px] text-zinc-550 tracking-widest mt-1 uppercase font-mono">
                {timerMode === "focus" ? "Focus Mode" : "Break Mode"}
              </span>
            </div>
          </div>

          <div className="flex gap-2 mb-5">
            <button
              onClick={() => selectSessionLength(25)}
              className={`px-2.5 py-1.5 rounded-lg border text-[9px] font-semibold transition-all font-mono uppercase tracking-wider ${
                sessionMinutes === 25 ? "bg-indigo-650 border-indigo-500 text-white shadow-sm" : "bg-transparent border-white/5 text-zinc-500 hover:text-white"
              }`}
            >
              25m Pomodoro
            </button>
            <button
              onClick={() => selectSessionLength(50)}
              className={`px-2.5 py-1.5 rounded-lg border text-[9px] font-semibold transition-all font-mono uppercase tracking-wider ${
                sessionMinutes === 50 ? "bg-indigo-650 border-indigo-500 text-white shadow-sm" : "bg-transparent border-white/5 text-zinc-500 hover:text-white"
              }`}
            >
              50m Session
            </button>
          </div>

          <div className="flex gap-3 items-center">
            <button
              onClick={handleReset}
              className="p-2.5 bg-surface-secondary hover:bg-white/5 border border-white/5 text-zinc-400 hover:text-white rounded-full transition-all"
              title="Reset Timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handlePlayPause}
              className={`p-3.5 rounded-full transition-all glow-indigo ${
                isRunning ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-indigo-655 hover:bg-indigo-700 text-white"
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
          </div>
        </div>

        {/* Column 2: Segment Breakdown and Subtasks */}
        <div className="lg:col-span-8 bg-surface-primary p-6 rounded-2xl border border-white/5 space-y-5">
          <div className="space-y-3">
            <div>
              <span className="text-[8px] text-zinc-550 uppercase tracking-widest block mb-2 font-mono">Target Checkpoint</span>
              {subtasksList.length > 0 ? (
                <select
                  value={selectedSubtaskId}
                  onChange={(e) => setSelectedSubtaskId(e.target.value)}
                  className="w-full bg-surface-secondary border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500/80 transition-colors font-mono"
                >
                  {subtasksList.map(s => (
                    <option key={s.id} value={s.id}>
                      [{s.parentTitle}] - {s.title} ({s.durationMinutes}m)
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-4 border border-dashed border-white/5 bg-transparent rounded-xl text-zinc-550 italic text-center font-sans text-xs">
                  All subtasks complete. Structure new items in your Execution Plan.
                </div>
              )}
            </div>

            {selectedSub && (
              <div className="p-4 bg-surface-secondary border border-white/5 rounded-xl space-y-2 font-mono text-[10px]">
                <div className="flex justify-between items-center text-zinc-350 border-b border-white/5 pb-2">
                  <span className="font-semibold text-white font-sans text-xs">{selectedSub.title}</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] border border-white/5 ${
                    selectedSub.difficulty === "Hard" ? "bg-rose-500/10 text-rose-400" : "bg-transparent text-zinc-500"
                  }`}>{selectedSub.difficulty} Difficulty</span>
                </div>
                <p className="text-[10px] text-zinc-500 font-sans leading-relaxed">
                  Completing this deep focus block advances your Readiness Index score and checks off this element.
                </p>
                <div className="text-[8px] text-zinc-650 pt-1 flex justify-between items-center leading-none">
                  <span>AI SPEC | POW BY GEMINI 2.0</span>
                  <span>TIME TARGET: {selectedSub.durationMinutes}m</span>
                </div>
              </div>
            )}
          </div>

          {/* Focus breakdown segments */}
          <div className="space-y-3.5 pt-1">
            <span className="text-[9px] text-zinc-550 uppercase tracking-widest font-semibold block font-mono">Focus segments breakdown</span>
            
            <div className="space-y-2.5">
              {getFocusSegments().map((seg, idx) => (
                <div key={idx} className="p-3.5 bg-surface-secondary/40 border border-white/5 rounded-xl flex items-center justify-between transition-all hover:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-5.5 h-5.5 rounded bg-surface-secondary border border-white/5 flex items-center justify-center text-[9px] font-mono text-zinc-550">
                      {idx + 1}
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold text-white block">{seg.label}</span>
                      <span className="text-[10px] text-zinc-500 leading-normal font-sans block">{seg.desc}</span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 bg-surface-secondary border border-white/5 text-[9px] font-mono text-zinc-400 rounded-md">
                    {seg.start} - {seg.end}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
