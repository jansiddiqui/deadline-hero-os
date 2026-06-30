"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, X, Play, HelpCircle, Check } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface VoiceInputProps {
  onClose: () => void;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onClose }) => {
  const { runCommandPipeline } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onstart = () => {
          setIsListening(true);
          setErrorMsg("");
        };

        rec.onresult = (event: any) => {
          const resultText = event.results[0][0].transcript;
          setTranscript(resultText);
        };

        rec.onerror = (e: any) => {
          console.error("Speech recognition error:", e);
          setErrorMsg("Mic permissions denied or unrecognized input sequence.");
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      } else {
        setErrorMsg("Speech recognition API is unavailable in this client agent.");
      }
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript("");
      setErrorMsg("");
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleExecute = async () => {
    if (!transcript) return;
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      runCommandPipeline(transcript);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in">
      <div className="w-full max-w-md bg-surface-primary border border-white/5 rounded-2xl p-6 relative overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.8)]">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white tracking-tight uppercase">Voice Control Dictation</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mic Visualizer Area */}
        <div className="flex flex-col items-center justify-center py-10 bg-surface-secondary rounded-xl border border-white/5 mb-6 relative">
          <button
            onClick={toggleListen}
            disabled={!!errorMsg && !recognitionRef.current}
            className={`w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all duration-300 relative ${
              isListening
                ? "bg-rose-500/20 border-rose-500 glow-crimson text-rose-400 scale-105"
                : "bg-indigo-600/10 border-indigo-500/40 text-indigo-400 hover:border-indigo-500 hover:scale-102"
            }`}
          >
            {isListening ? (
              <>
                <Mic className="w-8 h-8 animate-pulse" />
                <span className="absolute -inset-2 border-2 border-rose-500/30 rounded-full animate-ping" />
              </>
            ) : (
              <MicOff className="w-8 h-8" />
            )}
          </button>
          <div className="mt-4 text-xs font-mono text-zinc-500">
            {isListening ? "DICTATION ACTIVE" : "STANDBY FOR TRIGGER"}
          </div>
        </div>

        {/* Transcript Box */}
        <div className="space-y-2 mb-6">
          <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest block">Active Transcript Output</span>
          <div className="w-full min-h-[80px] max-h-[120px] bg-surface-secondary border border-white/5 rounded-xl p-3 text-xs text-zinc-300 overflow-y-auto leading-relaxed">
            {transcript || <span className="text-zinc-600 italic">"Say a command, e.g. Build UI redesign due tomorrow..."</span>}
          </div>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-[10px] text-rose-400 rounded-lg font-mono">
            {errorMsg}
          </div>
        )}

        {/* Helpful Commands Guide */}
        <div className="border border-white/5 rounded-xl bg-surface-secondary/50 p-4 mb-6 space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono uppercase font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            Phrase Guidelines
          </div>
          <ul className="text-[10px] text-zinc-500 space-y-1">
            <li>• <span className="text-indigo-400">"Finish machine learning coding by Saturday evening."</span></li>
            <li>• <span className="text-indigo-400">"Read biology textbooks, takes about 4 hours."</span></li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => setTranscript("")}
            disabled={!transcript}
            className="flex-1 py-2.5 border border-white/5 text-zinc-450 hover:text-white rounded-xl text-xs hover:bg-white/5 disabled:opacity-40 transition-all uppercase tracking-wider font-semibold"
          >
            Reset
          </button>
          <button
            onClick={handleExecute}
            disabled={!transcript || showSuccess}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 glow-indigo disabled:opacity-45 transition-all uppercase tracking-wider"
          >
            {showSuccess ? (
              <>
                <Check className="w-4 h-4" /> Ready!
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" /> Execute
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
