"use client";

import React, { useState, useEffect } from "react";
import { useApp, Task } from "@/context/AppContext";
import {
  AlertTriangle,
  Play,
  Sparkles,
  Loader2,
  Clock,
  Compass,
  Zap,
  Target
} from "lucide-react";

interface DashboardViewProps {
  onTriggerVoice: () => void;
  onOpenRescueHUD: (task: Task) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onTriggerVoice, onOpenRescueHUD }) => {
  const {
    tasks,
    userProfile,
    agentLogs,
    simulation,
    runWhatIfSimulation,
    setActiveTab,
    isBooting,
    getDynamicGreeting,
    autonomousAlerts,
    clearAutonomousAlert
  } = useApp();

  const [simScenario, setSimScenario] = useState("current");
  const [bootStep, setBootStep] = useState(0);

  const bootLogs = [
    "DEADLINE OS CORE v2.5 Initializing...",
    "► Connecting cognitive database layers... [CONNECTED]",
    "► Aligning active workload blocks... [ALIGNED]",
    "► Commencing predictive risk checks... [100% SECURE]",
    "► Loading neural profile modifiers... [LOADED]",
    "► Boot completed. Active monitoring system ONLINE."
  ];

  useEffect(() => {
    if (isBooting) {
      const interval = setInterval(() => {
        setBootStep(prev => (prev < bootLogs.length - 1 ? prev + 1 : prev));
      }, 180);
      return () => clearInterval(interval);
    }
  }, [isBooting]);

  const activeTasks = tasks.filter(t => !t.completed);
  const urgentTasks = activeTasks.filter(t => {
    const diff = new Date(t.deadline).getTime() - Date.now();
    return diff < 48 * 60 * 60 * 1000;
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const todayFocusHours = tasks.reduce((sum, t) => {
    if (t.completed) return sum;
    const todayBlocks = t.scheduleBlocks.filter(b => b.date === todayStr);
    return sum + todayBlocks.reduce((s, b) => s + b.durationHours, 0);
  }, 0);

  const handleSimOption = (option: string) => {
    setSimScenario(option);
    runWhatIfSimulation(option === "skip" ? "skip today" : option === "extra" ? "work 2 extra hours" : "current");
  };

  const getUrgencyBorder = () => {
    if (userProfile.mri < 50) return "border-rose-500/25 glow-crimson";
    if (userProfile.mri < 80) return "border-amber-500/20 glow-amber";
    return "border-white/5 glow-indigo";
  };

  // Boot sequence loader
  if (isBooting) {
    return (
      <div className="flex-1 bg-background flex flex-col items-center justify-center p-6 text-zinc-450 font-mono text-[10px] select-none">
        <div className="w-full max-w-sm bg-surface-primary border border-white/5 rounded-2xl p-6 space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.75)]">
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <div className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
              <span className="font-semibold text-white tracking-widest text-[9px] uppercase">COGNITIVE BOOT INITIATED</span>
            </div>
            <span className="text-[8px] text-zinc-600">v2.5</span>
          </div>
          <div className="space-y-2 text-[10px] leading-relaxed">
            {bootLogs.slice(0, bootStep + 1).map((log, idx) => (
              <div key={idx} className={idx === bootLogs.length - 1 ? "text-indigo-400 font-medium cursor-blink" : "text-zinc-400"}>
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 md:space-y-8 overflow-y-auto bg-background hero-gradient animate-fade-in select-none">
      
      {/* Hero Section - The narrative card */}
      <div className={`bg-surface-primary p-6 md:p-8 rounded-2xl border ${getUrgencyBorder()} relative overflow-hidden transition-all duration-300`}>
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-600/5 rounded-full blur-3xl" />
        
        <div className="space-y-4 max-w-3xl relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-indigo-400 text-[9px] uppercase tracking-widest font-semibold font-mono">
              <Sparkles className="w-3 h-3" /> MISSION CONTROL
            </div>
            <span className="text-[8px] text-zinc-650 font-mono tracking-widest bg-white/5 px-2 py-0.5 rounded uppercase">
              AI SPEC | POW BY GEMINI 2.0
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight">
              {getDynamicGreeting()}, {userProfile.name}.
            </h2>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed font-normal">
              {activeTasks.length > 0 ? (
                <>
                  Your current schedule status is stable. Estimated completion is{" "}
                  <strong className="text-white font-medium">Sunday 5:40 PM</strong>.
                  Today's primary operation targets{" "}
                  <span className="text-indigo-400 underline decoration-indigo-500/40 underline-offset-4 font-medium">
                    {activeTasks[0].title}
                  </span>.
                </>
              ) : (
                "All registered schedules complete. Core tasks checked. Standing by for new directives."
              )}
            </p>
          </div>

          {activeTasks.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-2.5 items-center">
              <button
                onClick={() => setActiveTab("execution")}
                className="action-btn-primary py-2 px-4 text-[11px] flex items-center gap-1.5 font-medium"
              >
                <Play className="w-3 h-3 fill-current" /> Start focus segment
              </button>
              
              {urgentTasks.length > 0 && (
                <button
                  onClick={() => onOpenRescueHUD(urgentTasks[0])}
                  className="py-2 px-3.5 bg-rose-600/10 border border-rose-500/20 hover:bg-rose-600 hover:text-white text-rose-400 text-[11px] rounded-lg font-medium transition-all"
                >
                  Emergency protocol
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Autonomous Schedule Updates Banner */}
      {autonomousAlerts.map((alert) => (
        <div
          key={alert.id}
          className="bg-amber-500/5 border border-amber-500/15 p-4 rounded-xl flex justify-between items-start animate-fade-in font-mono text-[10px]"
        >
          <div className="flex gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-550 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white uppercase text-[8px] tracking-wider block">Autonomous Rescheduling Event</span>
              <p className="text-zinc-400 text-[11px] leading-relaxed font-sans">{alert.message}</p>
            </div>
          </div>
          <button
            onClick={() => clearAutonomousAlert(alert.id)}
            className="text-[8px] text-zinc-500 hover:text-white uppercase font-bold tracking-wider"
          >
            Dismiss
          </button>
        </div>
      ))}

      {/* Split Supporting Workspace Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: What-If Simulator & MRI */}
        <div className="lg:col-span-8 space-y-6 order-2 lg:order-1">
          
          {/* AI Timeline Simulator */}
          <div className="bg-surface-primary p-5 rounded-xl border border-white/5 space-y-5">
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <h3 className="text-xs font-semibold text-white tracking-tight uppercase font-mono text-zinc-400">Timeline Simulator</h3>
                <p className="text-[10px] text-zinc-555">Simulate changes to calculate success probability.</p>
              </div>
              <span className="text-[8px] text-zinc-650 font-mono tracking-widest uppercase">What-If Tool</span>
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-3">
              <button
                onClick={() => handleSimOption("current")}
                className={`p-2.5 md:p-3.5 rounded-xl border text-left transition-all ${
                  simScenario === "current" ? "bg-surface-secondary border-indigo-500/40 glow-indigo" : "bg-surface-secondary/40 border-white/5 hover:border-white/10"
                }`}
              >
                <span className="text-[7px] text-zinc-500 font-mono tracking-widest uppercase block mb-1">Scenario A</span>
                <span className="text-[10px] md:text-xs font-semibold text-white block truncate">Current</span>
                <span className="text-base md:text-xl font-bold text-indigo-400 mt-1 md:mt-2 block font-mono">
                  {simScenario === "current" ? simulation.currentPlan.probability : 87}%
                </span>
                <span className="text-[6px] md:text-[7px] text-zinc-600 font-mono uppercase block mt-1">ODDS</span>
              </button>
              
              <button
                onClick={() => handleSimOption("skip")}
                className={`p-2.5 md:p-3.5 rounded-xl border text-left transition-all ${
                  simScenario === "skip" ? "bg-surface-secondary border-rose-500/40 glow-crimson" : "bg-surface-secondary/40 border-white/5 hover:border-white/10"
                }`}
              >
                <span className="text-[7px] text-zinc-500 font-mono tracking-widest uppercase block mb-1">Scenario B</span>
                <span className="text-[10px] md:text-xs font-semibold text-white block truncate">Skip Today</span>
                <span className="text-base md:text-xl font-bold text-rose-400 mt-1 md:mt-2 block font-mono">
                  {simScenario === "skip" ? simulation.skipToday.probability : 54}%
                </span>
                <span className="text-[6px] md:text-[7px] text-zinc-600 font-mono uppercase block mt-1">ODDS</span>
              </button>
              
              <button
                onClick={() => handleSimOption("extra")}
                className={`p-2.5 md:p-3.5 rounded-xl border text-left transition-all ${
                  simScenario === "extra" ? "bg-surface-secondary border-emerald-500/40 glow-emerald" : "bg-surface-secondary/40 border-white/5 hover:border-white/10"
                }`}
              >
                <span className="text-[7px] text-zinc-500 font-mono tracking-widest uppercase block mb-1">Scenario C</span>
                <span className="text-[10px] md:text-xs font-semibold text-white block truncate">Extra Work</span>
                <span className="text-base md:text-xl font-bold text-emerald-400 mt-1 md:mt-2 block font-mono">
                  {simScenario === "extra" ? simulation.workExtra.probability : 96}%
                </span>
                <span className="text-[6px] md:text-[7px] text-zinc-600 font-mono uppercase block mt-1">ODDS</span>
              </button>
            </div>

            <div className="p-3.5 bg-surface-secondary border border-white/5 rounded-lg font-mono text-[9px] text-zinc-400">
              <span className="text-[7px] text-zinc-650 uppercase block mb-1">FORECAST INSIGHT</span>
              <p className="leading-relaxed font-sans text-[11px] text-zinc-300">
                {simScenario === "current"
                  ? simulation.currentPlan.outcome
                  : simScenario === "skip"
                  ? simulation.skipToday.outcome
                  : simulation.workExtra.outcome}
              </p>
            </div>
          </div>

          {/* Interactive Agent Logs console */}
          <div className="bg-surface-primary p-5 rounded-xl border border-white/5 flex flex-col max-h-[300px]">
            <div className="flex justify-between items-center mb-4">
              <div className="space-y-0.5">
                <h3 className="text-xs font-semibold text-white tracking-tight uppercase font-mono text-zinc-400">Agent Executive Logs</h3>
                <p className="text-[10px] text-zinc-550">Live status audits from the 6 collaborating agents.</p>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded-full">
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[7px] text-zinc-400 font-mono uppercase tracking-widest">Observing</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {agentLogs.length > 0 ? (
                agentLogs.map((log) => (
                  <div key={log.id} className="text-[10px] font-mono border-b border-white/5 pb-2 flex gap-3">
                    <span className="text-zinc-600 shrink-0">{log.timestamp}</span>
                    <div className="flex-1">
                      <span className={`font-semibold mr-1 ${
                        log.status === "success" ? "text-emerald-400" : log.status === "warning" ? "text-amber-400" : "text-indigo-400"
                      }`}>
                        [{log.agentName}]
                      </span>
                      <span className="text-zinc-350 leading-relaxed font-sans">{log.message}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full py-12 flex items-center justify-center text-[10px] text-zinc-550 italic font-mono">
                  No logs recorded. Initialize scheduler in execution plan.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Focus metrics & MRI Brief */}
        <div className="lg:col-span-4 space-y-6 order-1 lg:order-2">
          
          {/* Readiness Index Brief */}
          <div className="bg-surface-primary p-5 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
            <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3 self-start font-mono">Readiness index</h3>
            
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r="58" stroke="var(--surface-secondary)" strokeWidth="4" fill="transparent" />
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  stroke={userProfile.mri > 80 ? "#34d399" : userProfile.mri > 50 ? "#fbbf24" : "#f87171"}
                  strokeWidth="5"
                  fill="transparent"
                  strokeDasharray={364}
                  strokeDashoffset={364 - (364 * userProfile.mri) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-white tracking-tight font-sans">{userProfile.mri}%</span>
                <span className="text-[7px] text-zinc-550 tracking-widest mt-0.5 uppercase font-mono">Readiness</span>
              </div>
            </div>

            <div className="mt-3.5 text-[9px] font-sans text-zinc-500 leading-relaxed">
              Based on workload variables, availability parameters, and active memories.
            </div>
          </div>

          {/* Today's Focus Indicators */}
          <div className="bg-surface-primary p-5 rounded-xl border border-white/5 space-y-3.5">
            <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest font-mono">Operations Details</h3>
            
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-surface-secondary border border-white/5 p-3 rounded-lg flex flex-col justify-between">
                <span className="text-[8px] text-zinc-500 uppercase font-mono">Focus Blocks</span>
                <div className="mt-1 text-lg font-bold text-white font-mono">{todayFocusHours}h</div>
                <span className="text-[7px] text-zinc-600 mt-0.5 uppercase">allocated</span>
              </div>
              
              <div className="bg-surface-secondary border border-white/5 p-3 rounded-lg flex flex-col justify-between">
                <span className="text-[8px] text-zinc-550 uppercase font-mono">Pending Jobs</span>
                <div className="mt-1 text-lg font-bold text-white font-mono">{activeTasks.length}</div>
                <span className="text-[7px] text-zinc-600 mt-0.5 uppercase">remaining</span>
              </div>
            </div>

            <div className="p-3 bg-surface-secondary/50 border border-white/5 rounded-lg space-y-1.5">
              <div className="flex items-center gap-1 text-indigo-400">
                <Compass className="w-3 h-3" />
                <span className="text-[8px] font-bold uppercase tracking-wider font-mono">Ambient advice</span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
                Cognitive models suggest a 35% higher task-skipping risk on Friday afternoons. We recommend scheduling focus sprints between 8 PM and 10 PM.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
