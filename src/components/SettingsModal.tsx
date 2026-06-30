"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { X, Key, Trash2, Database, ShieldCheck } from "lucide-react";

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { userProfile, saveApiKey, loadDemoMode, clearAllData, serverKeysConfigured } = useApp();
  const [apiKeyInput, setApiKeyInput] = useState(userProfile.apiKey);
  const [provider, setProvider] = useState<"gemini" | "openrouter" | "groq">(userProfile.aiProvider || "gemini");
  const [showKey, setShowKey] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveApiKey(apiKeyInput, provider);
    onClose();
  };

  const handleLoadDemo = () => {
    loadDemoMode();
    onClose();
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to flush all local databases?")) {
      clearAllData();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="w-full max-w-md bg-surface-primary border border-white/5 rounded-2xl p-6 relative shadow-[0_24px_50px_rgba(0,0,0,0.8)]">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white tracking-tight uppercase">OS API Configuration</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* AI Provider selector */}
          <div className="space-y-2">
            <label className="block text-[9px] text-zinc-550 font-mono uppercase tracking-widest font-semibold">AI Orchestration Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as "gemini" | "openrouter" | "groq")}
              className="w-full bg-surface-secondary border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500/80 transition-all font-mono"
            >
              <option value="gemini">Google Gemini Cloud (gemini-2.0-flash)</option>
              <option value="openrouter">OpenRouter Engine (google/gemini-2.0-flash-exp:free)</option>
              <option value="groq">Groq Cloud Engine (llama-3.3-70b-versatile)</option>
            </select>
          </div>

          {/* Custom API Key input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-[9px] text-zinc-550 font-mono uppercase tracking-widest font-semibold">
                {provider === "gemini" ? "Gemini API Token Key" : provider === "groq" ? "Groq API Token Key" : "OpenRouter API Token Key"}
              </label>
              {serverKeysConfigured[provider] && (
                <span className="text-[7px] font-semibold text-emerald-400 font-mono uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                  ✓ Active on Server
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={
                  serverKeysConfigured[provider]
                    ? "Using secure server credentials (optional override)"
                    : provider === "gemini"
                    ? "AIzaSy..."
                    : provider === "groq"
                    ? "gsk_..."
                    : "sk-or-v1-..."
                }
                className="w-full bg-surface-secondary border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500/80 transition-all font-mono placeholder:text-zinc-550"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3.5 top-3.5 text-[9px] text-zinc-500 hover:text-white font-semibold font-mono"
              >
                {showKey ? "HIDE" : "SHOW"}
              </button>
            </div>
            
            <div className="p-4 bg-surface-secondary border border-white/5 rounded-xl flex gap-3 items-start">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-zinc-500 leading-relaxed font-sans">
                {serverKeysConfigured[provider]
                  ? "The host server is securely pre-configured with active API keys for this provider. Custom credentials are fully optional overrides."
                  : "If no API key is configured on the server or inputted above, the system automatically routes to the high-fidelity mock simulation engine."}
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs tracking-wider uppercase transition-all shadow-lg hover:shadow-indigo-500/15"
          >
            Save Key & Reload
          </button>
        </form>

        {/* Separator */}
        <div className="h-px bg-white/5 my-6" />

        {/* Data Management Actions */}
        <div className="space-y-4">
          <span className="block text-[9px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">Database Actions</span>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleLoadDemo}
              className="py-3 border border-white/5 hover:border-white/10 bg-transparent text-zinc-350 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Database className="w-3.5 h-3.5 text-zinc-450" /> Load Demo
            </button>
            
            <button
              onClick={handleClear}
              className="py-3 border border-rose-500/10 hover:border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> Purge DB
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
