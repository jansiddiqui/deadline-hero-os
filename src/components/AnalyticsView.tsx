"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { BarChart3, TrendingUp, Cpu, Sparkles } from "lucide-react";

export const AnalyticsView: React.FC = () => {
  const { tasks, weeklyBrief, userMemory, userProfile } = useApp();

  const completedCount = tasks.filter(t => t.completed).length;
  const activeCount = tasks.filter(t => !t.completed).length;
  const totalCount = tasks.length;

  // SVG Chart: Mission Readiness Curve
  const drawProductivityChart = () => {
    const points = [
      { x: 10, y: 70 },
      { x: 20, y: 65 },
      { x: 35, y: 80 },
      { x: 50, y: 75 },
      { x: 65, y: 88 },
      { x: 80, y: 87 }
    ];

    const dPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${(p.x / 90) * 100}% ${100 - p.y}%`).join(" ");
    const dAreaPath = `${dPath} L ${(points[points.length-1].x / 90) * 100}% 100% L ${(points[0].x / 90) * 100}% 100% Z`;

    return (
      <svg className="w-full h-36 overflow-visible select-none">
        <defs>
          <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00f5c4" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#00f5c4" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        <line x1="0" y1="25%" x2="100%" y2="25%" stroke="rgba(255,255,255,0.02)" strokeWidth="1" strokeDasharray="3" />
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(255,255,255,0.02)" strokeWidth="1" strokeDasharray="3" />
        <line x1="0" y1="75%" x2="100%" y2="75%" stroke="rgba(255,255,255,0.02)" strokeWidth="1" strokeDasharray="3" />

        <path d={dAreaPath} fill="url(#chartGlow)" />
        <path d={dPath} fill="none" stroke="#00f5c4" strokeWidth="2" strokeLinecap="round" />
        
        {points.map((p, idx) => (
          <g key={idx}>
            <circle
              cx={`${(p.x / 90) * 100}%`}
              cy={`${100 - p.y}%`}
              r="3.5"
              fill="#030708"
              stroke="#00f5c4"
              strokeWidth="2"
              className="transition-all duration-200"
            />
          </g>
        ))}
      </svg>
    );
  };

  // SVG Chart: 3-Week AI Memory Timeline
  const drawMemoryTimeline = () => {
    const dataPoints = [
      { label: "Week 1", val: 2.5, display: "2.5h/mod" },
      { label: "Week 2", val: 2.0, display: "2.0h/mod" },
      { label: "Week 3", val: 1.8, display: "1.8h/mod" }
    ];

    return (
      <div className="space-y-4 font-mono text-[9px] select-none">
        <div className="flex justify-between items-end h-28 pt-4 text-zinc-550">
          {dataPoints.map((d, idx) => {
            const heightPct = Math.round((d.val / 3.0) * 100);
            return (
              <div key={idx} className="flex flex-col items-center flex-1 space-y-2">
                <span className="text-[9px] text-zinc-450 font-semibold">{d.display}</span>
                <div
                  className={`w-8 rounded-t-md transition-all duration-300 ${
                    idx === 2 ? "bg-[var(--indigo-primary)]/80 shadow-[0_0_10px_rgba(0,245,196,0.2)]" : "bg-white/5"
                  }`}
                  style={{ height: `${heightPct * 0.65}px` }}
                />
                <span className="text-[8px] uppercase tracking-widest mt-1">{d.label}</span>
              </div>
            );
          })}
        </div>
        <div className="p-3 bg-surface-secondary border border-white/5 rounded-xl text-[10px] text-zinc-400 text-center leading-relaxed font-sans">
          AI successfully optimized coding speed models from 2.5h to 1.8h per module after auditing focus logs.
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 md:space-y-8 overflow-y-auto bg-background animate-fade-in select-none">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-surface-primary p-6 rounded-2xl border border-white/5 relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-1.5 text-indigo-400 text-[9px] uppercase tracking-widest font-semibold font-mono">
            <BarChart3 className="w-4 h-4" /> COGNITIVE INTEL
          </div>
          <h2 className="text-lg font-semibold text-white tracking-tight">Intelligence & Memory Centre</h2>
        </div>
        <span className="text-[8px] text-zinc-550 uppercase font-mono tracking-widest bg-white/5 px-2 py-0.5 rounded relative z-10">
          Memory Engine Active
        </span>
      </div>

      {/* Row 1: KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-primary p-4.5 rounded-xl border border-white/5 flex flex-col justify-between">
          <span className="text-[9px] text-zinc-500 uppercase font-mono">Success Odds</span>
          <div className="mt-2 text-xl font-bold text-white font-mono">92%</div>
          <span className="text-[8px] text-zinc-650 mt-0.5 uppercase">Availability matched</span>
        </div>
        
        <div className="bg-surface-primary p-4.5 rounded-xl border border-white/5 flex flex-col justify-between">
          <span className="text-[9px] text-zinc-500 uppercase font-mono">Operations Done</span>
          <div className="mt-2 text-xl font-bold text-white font-mono">{completedCount}</div>
          <span className="text-[8px] text-zinc-650 mt-0.5 uppercase">Active: {activeCount}</span>
        </div>
        
        <div className="bg-surface-primary p-4.5 rounded-xl border border-white/5 flex flex-col justify-between">
          <span className="text-[9px] text-zinc-500 uppercase font-mono">Coding Speed</span>
          <div className="mt-2 text-xl font-bold text-indigo-400 font-mono">{userMemory.avgCodingSpeed}h</div>
          <span className="text-[8px] text-emerald-400 mt-0.5 flex items-center gap-1 font-mono uppercase">
            <TrendingUp className="w-2.5 h-2.5" /> Evolved from 2.5h
          </span>
        </div>
        
        <div className="bg-surface-primary p-4.5 rounded-xl border border-white/5 flex flex-col justify-between">
          <span className="text-[9px] text-zinc-500 uppercase font-mono">Streaks Rank</span>
          <div className="mt-2 text-xl font-bold text-white font-mono">Lvl {userProfile.level}</div>
          <span className="text-[8px] text-zinc-650 mt-0.5 uppercase">XP: {userProfile.xp}</span>
        </div>
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-surface-primary p-5 rounded-xl border border-white/5 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-white uppercase text-[9px] tracking-wider font-mono text-zinc-400">Mission Readiness Curve</span>
            <span className="text-[8px] text-indigo-455 font-mono">Weekly Progression</span>
          </div>
          <div className="flex-1 my-1">
            {drawProductivityChart()}
          </div>
          <div className="text-[7px] text-zinc-600 mt-1 text-right font-mono uppercase tracking-widest">
            AI SPEC | POW BY GEMINI 2.0
          </div>
        </div>

        <div className="bg-surface-primary p-5 rounded-xl border border-white/5 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-white uppercase text-[9px] tracking-wider font-mono text-zinc-400">AI Memory Evolution</span>
            <span className="text-[8px] text-indigo-455 font-mono">Trait Optimization</span>
          </div>
          <div className="flex-1 my-1">
            {drawMemoryTimeline()}
          </div>
        </div>

      </div>

      {/* Row 3: Brief and Memory Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Weekly Executive Brief */}
        <div className="lg:col-span-8 bg-surface-primary p-5 rounded-xl border border-white/5 space-y-5">
          <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <h3 className="text-xs font-semibold text-white tracking-tight uppercase font-mono text-zinc-400">Weekly Executive Brief</h3>
            </div>
            <span className="text-[8px] text-zinc-650 font-mono tracking-widest uppercase">Gemini 2.0 Briefing</span>
          </div>

          {weeklyBrief ? (
            <div className="space-y-5 text-zinc-300 text-xs">
              <p className="text-xs leading-relaxed text-zinc-350 font-sans">{weeklyBrief.summary}</p>
              
              <div className="grid grid-cols-3 gap-2.5 text-center font-mono">
                <div className="bg-surface-secondary p-2.5 rounded-lg border border-white/5">
                  <span className="block text-[7px] text-zinc-550 tracking-wider uppercase mb-0.5">MILESTONES</span>
                  <strong className="text-white text-xs">{weeklyBrief.milestonesCount} Checked</strong>
                </div>
                <div className="bg-surface-secondary p-2.5 rounded-lg border border-white/5">
                  <span className="block text-[7px] text-zinc-550 tracking-wider uppercase mb-0.5">RISK INDICATOR</span>
                  <strong className="text-white text-xs">{weeklyBrief.atRiskDeadlinesCount} Alert</strong>
                </div>
                <div className="bg-surface-secondary p-2.5 rounded-lg border border-white/5">
                  <span className="block text-[7px] text-zinc-550 tracking-wider uppercase mb-0.5">SUCCESS PROBABILITY</span>
                  <strong className="text-white text-xs">{weeklyBrief.successProbability}%</strong>
                </div>
              </div>

              <div className="space-y-2.5">
                <span className="text-[8px] text-indigo-400 font-bold uppercase tracking-widest block font-mono">AI Active Directives</span>
                <ul className="space-y-1.5 text-zinc-450 font-sans">
                  {weeklyBrief.recommendations.map((rec, i) => (
                    <li key={i} className="flex gap-2 items-start text-[11px] leading-relaxed">
                      <span className="text-indigo-400 shrink-0 select-none">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-zinc-555 italic font-sans text-xs">
              Executive brief pending. Compile schedule timelines to generate insights.
            </div>
          )}
        </div>

        {/* Evolved memory */}
        <div className="lg:col-span-4 bg-surface-primary p-5 rounded-xl border border-white/5 space-y-5">
          <div className="flex items-center gap-1.5 border-b border-white/5 pb-2.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <h3 className="text-xs font-semibold text-white tracking-tight uppercase font-mono text-zinc-400">Learned Traits</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-[8px] text-zinc-550 uppercase tracking-widest block font-semibold font-mono">User Performance Habits</span>
              <ul className="space-y-2 text-[11px] font-sans text-zinc-400">
                <li className="flex justify-between border-b border-white/5 pb-1">
                  <span>Peak focus hour:</span>
                  <strong className="text-white font-medium">{userMemory.peakFocusHour}</strong>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-1">
                  <span>Daily limit constraint:</span>
                  <strong className="text-white font-medium">{userMemory.preferredFocusHours} hrs/day</strong>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-1">
                  <span>Document estimation error:</span>
                  <strong className="text-rose-400 font-medium font-mono">-25% underestimate</strong>
                </li>
              </ul>
            </div>

            <div className="space-y-2 pt-1">
              <span className="text-[8px] text-zinc-550 uppercase tracking-widest block font-semibold font-mono">Evolution Logs</span>
              <div className="space-y-2 font-mono text-[8px] text-zinc-550">
                {userMemory.memoryLogs.map((logStr, i) => (
                  <div key={i} className="p-3 bg-surface-secondary border border-white/5 rounded-xl leading-relaxed text-zinc-400">
                    {logStr}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
