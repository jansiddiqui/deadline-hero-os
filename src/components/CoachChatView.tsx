"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { Send, Bot, User, Sparkles, Loader2, Brain, Pin, X } from "lucide-react";

interface CoachChatViewProps {
  onClose?: () => void;
}

export const CoachChatView: React.FC<CoachChatViewProps> = ({ onClose }) => {
  const { getCoachReply, userMemory, userProfile, aiConnectionState } = useApp();
  const [messages, setMessages] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    {
      sender: "bot",
      text: "Hello. I've audited your coding speeds, peak focus hours, and timeline bottlenecks. Ask me to simulate skipped blocks or prepare backup plans."
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat when new message is added or loading status updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const quickPrompts = [
    "What should I focus on next?",
    "Simulate skipping today's blocks",
    "Explain my priority settings",
    "Prepare high-velocity study guide"
  ];

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { sender: "user", text }]);
    setInputText("");
    setLoading(true);

    try {
      const result = await getCoachReply(text);
      setMessages(prev => [...prev, { sender: "bot", text: result.reply }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: "I experienced a connection issue formulating advice. However, based on your local timeline, I highly recommend tackling your highest priority block now."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPromptClick = (text: string) => {
    handleSendMessage(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  return (
    <div className="flex flex-col h-full bg-surface-primary relative select-none">
      
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-indigo-400 animate-pulse" />
          <div>
            <h2 className="text-xs font-semibold text-white tracking-wide uppercase font-mono">AI Coach HUD</h2>
            <span className="text-[8px] text-zinc-550 font-mono tracking-wider block mt-0.5">
              {aiConnectionState === "live" 
                ? `${userProfile.aiProvider === "openrouter" ? "OpenRouter" : "Gemini 2.0"} Active` 
                : aiConnectionState === "offline" 
                  ? "Offline Mode" 
                  : "Sandbox Engine"}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">CONNECTED</span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-zinc-500 hover:text-white rounded hover:bg-white/5 transition-colors"
              title="Minimize chat"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Pinned Memory Chips */}
      <div className="px-5 py-3 border-b border-white/5 bg-surface-secondary/40 flex flex-wrap items-center gap-1.5 text-[9px] text-zinc-450 shrink-0">
        <span className="flex items-center gap-1 font-mono uppercase text-[8px] text-zinc-550 font-bold shrink-0 mr-1">
          <Pin className="w-2.5 h-2.5 text-indigo-400" /> Active Context:
        </span>
        <span className="px-2 py-0.5 bg-white/5 border border-white/5 text-zinc-400 rounded-md">Peak focus: {userMemory.peakFocusHour}</span>
        <span className="px-2 py-0.5 bg-white/5 border border-white/5 text-zinc-400 rounded-md">Speed: {userMemory.avgCodingSpeed}h/mod</span>
      </div>

      {/* Message List */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 font-sans text-xs">
        {messages.map((m, idx) => {
          const isBot = m.sender === "bot";
          return (
            <div
              key={idx}
              className={`flex gap-3 max-w-[85%] animate-fade-in ${isBot ? "self-start" : "ml-auto flex-row-reverse"}`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-transform duration-200 ${
                isBot ? "bg-indigo-600/10 border-indigo-500/20 text-indigo-400" : "bg-white/5 border-white/5 text-zinc-300"
              }`}>
                {isBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              </div>
              <div className={`p-3 rounded-xl leading-relaxed text-xs ${
                isBot ? "bg-surface-secondary border border-white/5 text-zinc-350 shadow-sm" : "bg-indigo-650 text-white font-medium shadow-md shadow-indigo-900/10"
              }`}>
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-[85%] animate-fade-in">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="p-3 bg-surface-secondary border border-white/5 rounded-xl text-xs text-zinc-550 italic flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
              Auditing schedule blocks...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggest prompts */}
      <div className="px-5 py-2.5 flex overflow-x-auto gap-2 shrink-0 bg-surface-primary border-t border-white/5 whitespace-nowrap scrollbar-none no-scrollbar">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            disabled={loading}
            className="px-3 py-1.5 bg-surface-secondary hover:bg-white/5 border border-white/5 text-zinc-400 hover:text-white rounded-lg text-[9px] transition-all disabled:opacity-40 font-medium shrink-0"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input box */}
      <div className="p-4 border-t border-white/5 bg-surface-primary shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            placeholder="Ask AI Coach: 'Can I skip today?' or 'Verify workload balance...'"
            className="flex-1 bg-surface-secondary border border-white/5 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/80 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all disabled:opacity-40 flex items-center justify-center shrink-0 shadow-lg hover:shadow-indigo-500/25"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

    </div>
  );
};
