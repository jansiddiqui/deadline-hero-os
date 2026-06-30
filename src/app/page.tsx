"use client";

import React, { useState } from "react";
import { useApp, Task } from "@/context/AppContext";
import { Sidebar } from "@/components/Sidebar";
import { DashboardView } from "@/components/DashboardView";
import { TaskBoardView } from "@/components/TaskBoardView";
import { FocusTimer } from "@/components/FocusTimer";
import { AnalyticsView } from "@/components/AnalyticsView";
import { VoiceInput } from "@/components/VoiceInput";
import { SettingsModal } from "@/components/SettingsModal";
import { RescueModeHUD } from "@/components/RescueModeHUD";
import { CoachChatView } from "@/components/CoachChatView";
import {
  LayoutDashboard,
  Shuffle,
  Play,
  Brain,
  Mic,
  MessageSquare,
  X,
  Bot,
  Settings
} from "lucide-react";

export default function Home() {
  const { activeTab, setActiveTab } = useApp();
  
  // Overlays state
  const [showVoice, setShowVoice] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeRescueTask, setActiveRescueTask] = useState<Task | null>(null);
  
  // Right sidebar (Desktop) and floating overlay (Mobile) states
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case "mission":
        return (
          <DashboardView
            onTriggerVoice={() => setShowVoice(true)}
            onOpenRescueHUD={(task) => setActiveRescueTask(task)}
          />
        );
      case "strategy":
        return <TaskBoardView onTriggerVoice={() => setShowVoice(true)} />;
      case "execution":
        return <FocusTimer />;
      case "intelligence":
        return <AnalyticsView />;
      default:
        return (
          <DashboardView
            onTriggerVoice={() => setShowVoice(true)}
            onOpenRescueHUD={(task) => setActiveRescueTask(task)}
          />
        );
    }
  };

  return (
    <main className="flex h-screen bg-background text-zinc-350 overflow-hidden font-sans antialiased pb-16 md:pb-0">
      
      {/* Sidebar - Desktop Only */}
      <div className="hidden md:flex">
        <Sidebar 
          onOpenSettings={() => setShowSettings(true)} 
          showRightSidebar={showRightSidebar}
          onToggleRightSidebar={() => setShowRightSidebar(!showRightSidebar)}
        />
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full overflow-hidden">
        {/* Mobile Top Header */}
        <div className="md:hidden h-12 shrink-0 border-b border-white/5 bg-surface-primary/80 backdrop-blur-md px-5 flex justify-between items-center z-30">
          <span className="font-mono font-bold tracking-widest text-[9px] text-indigo-400">DEADLINE // HERO // OS</span>
          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 bg-white/5 border border-white/5 text-zinc-400 active:text-white rounded-lg active:scale-95 transition-all"
            title="Open Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
        {renderActiveView()}
      </div>

      {/* Right Collapsible AI assistant sidebar - Desktop Only */}
      <div 
        className={`hidden md:flex border-l border-white/5 bg-surface-primary transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none shrink-0 h-full relative ${
          showRightSidebar ? "w-96" : "w-0 overflow-hidden border-l-0"
        }`}
      >
        <div className="w-96 h-full flex flex-col">
          <CoachChatView onClose={() => setShowRightSidebar(false)} />
        </div>
      </div>

      {/* Floating Bottom Dock Navigation - Mobile Only */}
      <div className="md:hidden fixed bottom-5 left-4 right-4 h-16 bg-surface-primary/85 backdrop-blur-md border border-white/5 flex justify-around items-center px-2 z-40 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.8)]">
        <button
          onClick={() => setActiveTab("mission")}
          className={`flex flex-col items-center gap-1.5 text-[9px] font-medium transition-all ${
            activeTab === "mission" ? "text-indigo-400 font-semibold" : "text-zinc-550"
          }`}
        >
          <LayoutDashboard className="w-4.5 h-4.5" />
          <span>Mission</span>
        </button>

        <button
          onClick={() => setActiveTab("strategy")}
          className={`flex flex-col items-center gap-1.5 text-[9px] font-medium transition-all ${
            activeTab === "strategy" ? "text-indigo-400 font-semibold" : "text-zinc-550"
          }`}
        >
          <Shuffle className="w-4.5 h-4.5" />
          <span>Strategy</span>
        </button>

        {/* Floating Center Voice Orb */}
        <button
          onClick={() => setShowVoice(true)}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-650 text-white flex items-center justify-center -translate-y-5 shadow-[0_8px_20px_rgba(88,80,236,0.35)] border-2 border-background glow-indigo active:scale-95 transition-all"
        >
          <Mic className="w-4.5 h-4.5" />
        </button>

        <button
          onClick={() => setActiveTab("execution")}
          className={`flex flex-col items-center gap-1.5 text-[9px] font-medium transition-all ${
            activeTab === "execution" ? "text-indigo-400 font-semibold" : "text-zinc-550"
          }`}
        >
          <Play className="w-4.5 h-4.5" />
          <span>Focus</span>
        </button>

        {/* Toggle Mobile Chat overlay */}
        <button
          onClick={() => setShowMobileChat(true)}
          className={`flex flex-col items-center gap-1.5 text-[9px] font-medium transition-all ${
            showMobileChat ? "text-indigo-400 font-semibold" : "text-zinc-550"
          }`}
        >
          <MessageSquare className="w-4.5 h-4.5" />
          <span>Coach</span>
        </button>
      </div>

      {/* Mobile Drawer (Bottom Sheet) Chat Overlay */}
      {showMobileChat && (
        <div className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col justify-end animate-fade-in">
          {/* Backdrop Closer */}
          <div className="flex-1" onClick={() => setShowMobileChat(false)} />
          
          <div className="w-full bg-surface-primary border-t border-white/5 rounded-t-3xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
            {/* Header Grab Bar */}
            <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto my-3 shrink-0" />
            <div className="flex-1 overflow-hidden">
              <CoachChatView onClose={() => setShowMobileChat(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Voice input dialog */}
      {showVoice && <VoiceInput onClose={() => setShowVoice(false)} />}

      {/* Settings modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {/* Deadline Rescue Mode HUD */}
      {activeRescueTask && (
        <RescueModeHUD
          task={activeRescueTask}
          onClose={() => setActiveRescueTask(null)}
        />
      )}
    </main>
  );
}
