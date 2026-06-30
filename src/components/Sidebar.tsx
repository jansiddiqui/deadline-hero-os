"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  LayoutDashboard,
  Shuffle,
  Play,
  Brain,
  Settings,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Shield,
  Activity,
  Bot
} from "lucide-react";

interface SidebarProps {
  onOpenSettings: () => void;
  showRightSidebar?: boolean;
  onToggleRightSidebar?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  onOpenSettings, 
  showRightSidebar = false, 
  onToggleRightSidebar 
}) => {
  const { activeTab, setActiveTab, userProfile, agentRegistry, isJudgeMode, toggleJudgeMode, aiConnectionState } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: "mission", label: "Mission Briefing", icon: LayoutDashboard },
    { id: "strategy", label: "Execution Plan", icon: Shuffle },
    { id: "execution", label: "Deep Focus", icon: Play },
    { id: "intelligence", label: "Cognitive Intel", icon: Brain }
  ];

  const xpNeeded = userProfile.level * 250;
  const xpProgress = Math.min(100, Math.round((userProfile.xp / xpNeeded) * 100));

  const getActiveAgentCount = () => {
    let count = 0;
    Object.values(agentRegistry).forEach(status => {
      if (status === "complete" || status === "running") count++;
    });
    return count;
  };

  return (
    <aside 
      className={`h-screen border-r border-white/5 bg-surface-primary flex flex-col justify-between transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none shrink-0 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-3 animate-fade-in">
            <img 
              src="/logo.png" 
              alt="Deadline Hero Logo" 
              className="w-7 h-7 rounded-lg border border-white/10 shadow-[0_4px_12px_rgba(0,245,196,0.15)] object-cover" 
            />
            <div>
              <h1 className="font-semibold text-xs leading-none text-white tracking-wide">DEADLINE OS</h1>
              <span className="text-[8px] text-zinc-500 font-mono tracking-widest block mt-0.5 uppercase">v2.0 core</span>
            </div>
          </div>
        )}
        {isCollapsed && (
          <img 
            src="/logo.png" 
            alt="Deadline Hero Logo" 
            className="w-7 h-7 mx-auto rounded-lg border border-white/10 shadow-[0_4px_12px_rgba(0,245,196,0.15)] object-cover" 
          />
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-surface-secondary rounded text-zinc-500 hover:text-zinc-300 hidden md:block transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-6 px-3 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 mb-2 text-[9px] font-semibold text-zinc-550 uppercase tracking-widest leading-none">
              Workspaces
            </div>
          )}
          
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-[11px] rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-surface-secondary text-white font-medium shadow-sm border border-white/5"
                      : "text-zinc-400 hover:bg-surface-secondary/40 hover:text-white"
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <Icon className={`w-4 h-4 transition-transform duration-205 ${isActive ? "text-indigo-400 scale-105" : "text-zinc-500"}`} />
                  {!isCollapsed && <span className="animate-fade-in">{item.label}</span>}
                  {isActive && !isCollapsed && (
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-auto" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Persistent AI Agent Status Panel */}
        {!isCollapsed ? (
          <div className="p-4 bg-surface-secondary rounded-xl border border-white/5 space-y-3.5 animate-fade-in shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span className="text-[10px] font-semibold text-white uppercase tracking-wider font-mono">AGENT HUB</span>
              </div>
              <span className="text-[8px] font-mono text-zinc-400 bg-white/5 px-1.5 py-0.5 rounded">94% CONF</span>
            </div>

            <div className="space-y-2 text-[10px] font-sans">
              <div className="flex justify-between items-center">
                <span className="text-zinc-450">Planning Engine</span>
                <span className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${agentRegistry.planning === "complete" ? "bg-emerald-500" : agentRegistry.planning === "running" ? "bg-indigo-455 animate-ping" : "bg-zinc-650"}`} />
                  <span className={`font-mono text-[9px] ${agentRegistry.planning === "complete" ? "text-emerald-400" : agentRegistry.planning === "running" ? "text-indigo-400" : "text-zinc-500"}`}>
                    {agentRegistry.planning === "complete" ? "READY" : agentRegistry.planning === "running" ? "RUN" : "IDLE"}
                  </span>
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-zinc-450">Priority Assessor</span>
                <span className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${agentRegistry.priority === "complete" ? "bg-emerald-500" : agentRegistry.priority === "running" ? "bg-indigo-455 animate-ping" : "bg-zinc-650"}`} />
                  <span className={`font-mono text-[9px] ${agentRegistry.priority === "complete" ? "text-emerald-400" : agentRegistry.priority === "running" ? "text-indigo-400" : "text-zinc-500"}`}>
                    {agentRegistry.priority === "complete" ? "READY" : agentRegistry.priority === "running" ? "RUN" : "IDLE"}
                  </span>
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-zinc-450">Task Allocator</span>
                <span className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${agentRegistry.schedule === "complete" ? "bg-emerald-500" : agentRegistry.schedule === "running" ? "bg-indigo-455 animate-ping" : "bg-zinc-650"}`} />
                  <span className={`font-mono text-[9px] ${agentRegistry.schedule === "complete" ? "text-emerald-400" : agentRegistry.schedule === "running" ? "text-indigo-400" : "text-zinc-500"}`}>
                    {agentRegistry.schedule === "complete" ? "READY" : agentRegistry.schedule === "running" ? "RUN" : "IDLE"}
                  </span>
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-zinc-450">Risk Predictor</span>
                <span className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${agentRegistry.risk === "complete" ? "bg-emerald-500" : agentRegistry.risk === "running" ? "bg-indigo-455 animate-ping" : "bg-zinc-650"}`} />
                  <span className={`font-mono text-[9px] ${agentRegistry.risk === "complete" ? "text-emerald-400" : agentRegistry.risk === "running" ? "text-indigo-400" : "text-zinc-500"}`}>
                    {agentRegistry.risk === "complete" ? "READY" : agentRegistry.risk === "running" ? "RUN" : "IDLE"}
                  </span>
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-zinc-450">Memory Evolve</span>
                <span className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${agentRegistry.memory === "complete" ? "bg-emerald-500" : agentRegistry.memory === "running" ? "bg-indigo-455 animate-ping" : "bg-zinc-650"}`} />
                  <span className={`font-mono text-[9px] ${agentRegistry.memory === "complete" ? "text-emerald-400" : agentRegistry.memory === "running" ? "text-indigo-400" : "text-zinc-500"}`}>
                    {agentRegistry.memory === "complete" ? "READY" : agentRegistry.memory === "running" ? "RUN" : "IDLE"}
                  </span>
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex flex-col gap-1.5 text-[8px] font-mono text-zinc-500">
              <div className="flex justify-between items-center leading-none">
                <span className="flex items-center gap-1">
                  <Activity className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                  ACTIVE MONITOR
                </span>
                <span>{getActiveAgentCount()}/6 ENGAGED</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/5 pt-1.5 leading-none">
                <span className="text-[7px] text-zinc-550 uppercase">Connection Status</span>
                <span className="flex items-center gap-1">
                  <span className={`w-1 h-1 rounded-full ${
                    aiConnectionState === "live" ? "bg-emerald-500 animate-pulse" :
                    aiConnectionState === "sandbox" ? "bg-amber-500" : "bg-rose-500"
                  }`} />
                  <span className={`font-semibold ${
                    aiConnectionState === "live" ? "text-emerald-400" :
                    aiConnectionState === "sandbox" ? "text-amber-400" : "text-rose-400"
                  }`}>
                    {aiConnectionState === "live" ? "Live AI Mode" :
                     aiConnectionState === "sandbox" ? "Sandbox Mode" : "Offline"}
                  </span>
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-3 bg-surface-secondary rounded-xl border border-white/5">
            <Cpu className="w-4 h-4 text-indigo-400 pulse-agent" />
            <span className="text-[8px] text-zinc-550 font-mono">{getActiveAgentCount()}/6</span>
          </div>
        )}

        {/* Judge Mode Switch */}
        <div className="px-1">
          <div className="p-3 bg-surface-secondary rounded-xl border border-white/5 space-y-2">
            {!isCollapsed ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] uppercase font-semibold">Judge Mode</span>
                </div>
                <button
                  onClick={toggleJudgeMode}
                  className={`w-8 h-4 rounded-full relative transition-all duration-200 border ${
                    isJudgeMode ? "bg-indigo-650/20 border-indigo-500" : "bg-zinc-800 border-zinc-700"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full absolute top-[3px] transition-all duration-200 ${
                      isJudgeMode ? "left-[16px] bg-indigo-400" : "left-[3px] bg-zinc-550"
                    }`}
                  />
                </button>
              </div>
            ) : (
              <button 
                onClick={toggleJudgeMode}
                title={`Judge Mode: ${isJudgeMode ? "ON" : "OFF"}`}
                className={`w-full flex items-center justify-center p-1.5 rounded-lg border ${
                  isJudgeMode ? "bg-indigo-650/10 border-indigo-500/40 text-indigo-400" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                }`}
              >
                <Shield className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Profile Summary */}
      <div className="p-5 border-t border-white/5 bg-surface-primary space-y-4">
        {/* XP Level Gauge */}
        {!isCollapsed ? (
          <div className="space-y-2 animate-fade-in">
            <div className="flex justify-between text-[10px]">
              <span className="text-zinc-450 font-medium">Level {userProfile.level}</span>
              <span className="text-zinc-500 font-mono">{userProfile.xp} / {xpNeeded} XP</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[9px] font-bold text-indigo-400 mx-auto" title={`Level ${userProfile.level}`}>
            L{userProfile.level}
          </div>
        )}

        {/* AI Coach Assistant Toggle Panel */}
        <button
          onClick={onToggleRightSidebar}
          className={`w-full flex items-center gap-2 py-2 px-3 border border-white/5 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-secondary transition-all font-medium text-[11px] ${
            showRightSidebar ? "border-indigo-500/20 text-indigo-400 bg-indigo-500/5" : ""
          } ${isCollapsed ? "justify-center" : ""}`}
          title={isCollapsed ? "Toggle AI Coach HUD" : undefined}
        >
          <Bot className="w-3.5 h-3.5" />
          {!isCollapsed && <span>AI Coach HUD</span>}
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className={`w-full flex items-center gap-2 py-2 px-3 border border-white/5 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-secondary transition-all font-medium text-[11px] ${
            isCollapsed ? "justify-center" : ""
          }`}
          title={isCollapsed ? "API Settings" : undefined}
        >
          <Settings className="w-3.5 h-3.5" />
          {!isCollapsed && <span>Settings</span>}
        </button>
      </div>
    </aside>
  );
};
