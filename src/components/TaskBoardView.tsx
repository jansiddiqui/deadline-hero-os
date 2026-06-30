"use client";

import React, { useState } from "react";
import { useApp, Task } from "@/context/AppContext";
import {
  Mic,
  Calendar,
  CheckCircle2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Clock,
  Cpu,
  Loader2,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Play,
  TrendingUp,
  Brain,
  Zap,
  Activity,
  Compass
} from "lucide-react";

interface TaskBoardViewProps {
  onTriggerVoice: () => void;
}

export const TaskBoardView: React.FC<TaskBoardViewProps> = ({ onTriggerVoice }) => {
  const {
    tasks,
    thinkingState,
    runCommandPipeline,
    addManualTask,
    deleteTask,
    toggleSubtask,
    toggleTask,
    expandedWhyTasks,
    toggleWhyTask,
    runWhatIfSimulation,
    setActiveTab
  } = useApp();

  const [cmdInput, setCmdInput] = useState("");
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualHours, setManualHours] = useState(2);
  const [manualDate, setManualDate] = useState("");
  const [manualCategory, setManualCategory] = useState<Task["category"]>("Personal");
  const [manualPriority, setManualPriority] = useState<Task["priority"]>("Medium");
  const [manualNotes, setManualNotes] = useState("");
  
  // Track which tasks are running local simulation in timeline
  const [simulatingTaskId, setSimulatingTaskId] = useState<string | null>(null);

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmdInput.trim()) return;
    const text = cmdInput;
    setCmdInput("");
    await runCommandPipeline(text);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;
    
    await addManualTask({
      title: manualTitle,
      effort: Number(manualHours),
      deadline: manualDate || new Date(Date.now() + 3*24*60*60*1000).toISOString().split('T')[0],
      category: manualCategory,
      priority: manualPriority,
      notes: manualNotes
    });

    setManualTitle("");
    setManualHours(2);
    setManualDate("");
    setManualCategory("Personal");
    setManualPriority("Medium");
    setManualNotes("");
    setShowManualForm(false);
  };

  const handleTimelineSimulateSkip = async (taskId: string) => {
    setSimulatingTaskId(taskId);
    await new Promise(r => setTimeout(r, 800));
    await runWhatIfSimulation("skip today");
    setSimulatingTaskId(null);
    setActiveTab("mission"); // Redirect to Mission to see simulation outcomes
  };

  const timelineTasks = [...tasks].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-background animate-fade-in relative select-none p-6 md:p-8 space-y-8">
      
      {/* Hero Section: NLP Prompt Console */}
      <div className="max-w-4xl mx-auto w-full space-y-4">
        <div className="bg-surface-primary p-6 rounded-2xl border border-white/5 space-y-4 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-indigo-400 text-[9px] uppercase tracking-widest font-semibold font-mono">
              <Cpu className="w-3.5 h-3.5 animate-pulse" /> NLP PLANNING INTERFACE
            </div>
            <span className="text-[8px] text-zinc-650 font-mono tracking-widest uppercase">Gemini 2.0 Engine</span>
          </div>

          <form onSubmit={handleCommandSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={cmdInput}
                onChange={(e) => setCmdInput(e.target.value)}
                placeholder="Schedule a machine learning project due Sunday with 5 hours effort..."
                className="w-full bg-surface-secondary border border-white/5 rounded-xl pl-4 pr-12 py-3.5 text-xs text-white placeholder-zinc-550 focus:outline-none focus:border-indigo-500/80 transition-colors"
              />
              <button
                type="button"
                onClick={onTriggerVoice}
                className="absolute right-4 top-4 text-zinc-500 hover:text-white transition-colors"
                title="Voice input"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
            <button
              type="submit"
              className="action-btn-primary w-full sm:w-auto py-3 sm:py-0 px-6 text-xs font-semibold uppercase tracking-wider bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl transition-all shrink-0"
            >
              Analyze
            </button>
          </form>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10px] text-zinc-500">
            <span>Speak or type task statements. AI parses effort, deadlines, and allocates slots automatically.</span>
            <button
              type="button"
              onClick={() => setShowManualForm(true)}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Manual Form
            </button>
          </div>
        </div>
      </div>

      {/* Signature Feature: AI Mission Gantt Timeline Tree */}
      <div className="max-w-4xl mx-auto w-full space-y-6">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <div>
            <h3 className="text-xs font-semibold text-white tracking-widest uppercase font-mono text-zinc-400">AI Mission Timeline</h3>
            <span className="text-[9px] text-zinc-550 font-mono uppercase block mt-0.5">Autonomous Gantt Progress Tree</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">{tasks.filter(t => !t.completed).length} active nodes</span>
        </div>

        {timelineTasks.length > 0 ? (
          <div className="relative pl-8 space-y-8 py-2">
            
            {/* Tree Vertical Connector Line */}
            <div className="absolute left-[11px] top-6 bottom-8 w-px bg-white/5" />

            {timelineTasks.map((t, idx) => {
              const isFirstIncomplete = timelineTasks.findIndex(x => !x.completed) === idx;
              const isDone = t.completed;
              const isExpanded = expandedWhyTasks.includes(t.id);
              
              // Priority specific border highlights
              const borderHighlightClass = t.priority === "Critical"
                ? "border-rose-500/25 shadow-[0_4px_20px_rgba(225,29,72,0.06)]"
                : t.priority === "High"
                ? "border-amber-500/20 shadow-[0_4px_20px_rgba(245,158,11,0.05)]"
                : "border-white/5";

              return (
                <div key={t.id} className="relative group transition-all duration-350 animate-fade-in">
                  
                  {/* Timeline Pulse Node Point */}
                  <div className={`absolute -left-[27px] top-2.5 w-4 h-4 rounded-full border-2 flex items-center justify-center bg-background z-10 transition-all ${
                    isDone
                      ? "border-emerald-500 text-emerald-400"
                      : isFirstIncomplete
                      ? "border-indigo-500 scale-110"
                      : "border-zinc-800"
                  }`}>
                    {isDone ? (
                      <CheckCircle className="w-2.5 h-2.5 fill-current" />
                    ) : (
                      <span className={`h-1.5 w-1.5 rounded-full ${isFirstIncomplete ? "bg-indigo-400 animate-pulse" : "bg-zinc-700"}`} />
                    )}
                  </div>

                  {/* Timeline Node Card Container */}
                  <div className={`bg-surface-primary p-5 rounded-2xl border ${borderHighlightClass} space-y-4`}>
                    
                    {/* Header Summary Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                      
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleTask(t.id)}
                          className="w-4.5 h-4.5 rounded-full border border-zinc-750 flex items-center justify-center hover:bg-indigo-650/15 hover:border-indigo-500 mt-0.5 transition-all group shrink-0"
                          title={isDone ? "Mark Pending" : "Complete Task"}
                        >
                          <div className={`w-2.5 h-2.5 rounded-full transition-colors ${isDone ? "bg-emerald-500" : "bg-transparent group-hover:bg-indigo-500"}`} />
                        </button>

                        <div className="space-y-1">
                          <h4 className={`text-xs font-semibold text-white leading-snug transition-colors ${isDone ? "text-zinc-500 line-through" : ""}`}>
                            {t.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2.5 text-[9px] text-zinc-500 font-mono uppercase">
                            <span className="px-1.5 py-0.5 bg-white/5 border border-white/5 rounded text-zinc-450">{t.category}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {t.effort}h</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Due {t.deadline}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-semibold uppercase tracking-wider font-mono ${
                          t.priority === "Critical"
                            ? "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                            : t.priority === "High"
                            ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                            : "bg-white/5 text-zinc-550 border border-white/5"
                        }`}>
                          {t.priority}
                        </span>

                        <button
                          onClick={() => toggleWhyTask(t.id)}
                          className="px-2 py-1 text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold text-[9px] border border-indigo-500/15 hover:border-indigo-500/30 rounded-lg bg-indigo-500/5 transition-all"
                        >
                          Reasoning {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        <button
                          onClick={() => deleteTask(t.id)}
                          className="p-1.5 text-zinc-650 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-all"
                          title="Prune task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>

                    {/* Progress indicator (Only for current active task) */}
                    {isFirstIncomplete && t.subtasks.length > 0 && (
                      <div className="space-y-1.5 bg-surface-secondary/40 p-3 rounded-xl border border-white/5 animate-fade-in">
                        <div className="flex justify-between text-[8px] text-zinc-500 font-mono">
                          <span className="flex items-center gap-1 text-indigo-400">
                            <Activity className="w-2.5 h-2.5 pulse-active-dot" /> ACTIVE SPRINT
                          </span>
                          <span>{Math.round((t.subtasks.filter(s => s.completed).length / t.subtasks.length) * 100)}% COMPLETE</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                            style={{ width: `${(t.subtasks.filter(s => s.completed).length / t.subtasks.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Expandable explainability context & Subtasks checkmark drawer */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-white/5 space-y-4 animate-fade-in text-xs">
                        
                        {/* Reasoning grid */}
                        <div className="bg-surface-secondary p-4 rounded-xl border border-white/5 space-y-3 font-mono">
                          <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className="font-semibold text-white uppercase text-[8px] tracking-wider flex items-center gap-1">
                              <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> Explainable priority specs
                            </span>
                            <span className="text-[8px] text-indigo-400">
                              {t.aiMetadata?.provider || "Gemini"} Confidence: {t.confidenceScore}%
                            </span>
                          </div>
 
                          {t.decisionMetrics && (
                            <div className="grid grid-cols-3 gap-2.5 text-center text-[9px]">
                              <div className="bg-surface-primary p-2 rounded-lg border border-white/5">
                                <span className="block text-zinc-550 text-[7px] tracking-widest mb-0.5">DAYS REMAINING</span>
                                <strong className="text-white font-medium">{t.decisionMetrics.daysRemaining} Days</strong>
                              </div>
                              <div className="bg-surface-primary p-2 rounded-lg border border-white/5">
                                <span className="block text-zinc-550 text-[7px] tracking-widest mb-0.5">CONFLICT INDEX</span>
                                <strong className="text-white font-medium">{t.decisionMetrics.workloadConflictFactor}/10</strong>
                              </div>
                              <div className="bg-surface-primary p-2 rounded-lg border border-white/5">
                                <span className="block text-zinc-550 text-[7px] tracking-widest mb-0.5">DEPENDENCY JOBS</span>
                                <strong className="text-white font-medium">{t.decisionMetrics.dependencyCount}</strong>
                              </div>
                            </div>
                          )}
 
                          <p className="leading-relaxed border-l-2 border-indigo-500 pl-3 italic text-zinc-350 text-[10px] font-sans">
                            "{t.priorityReason}"
                          </p>
 
                          <div className="pt-2.5 border-t border-white/5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-[8px]">
                            <span className="text-zinc-600 font-mono">
                              {t.aiMetadata 
                                ? `AI SPEC | POW BY ${t.aiMetadata.provider.toUpperCase()} (${t.aiMetadata.model})`
                                : "AI SPEC | POW BY GEMINI 2.0"
                              }
                              {t.aiMetadata?.processingTimeMs && ` | ${(t.aiMetadata.processingTimeMs / 1000).toFixed(2)}s`}
                            </span>
                            <div className="flex gap-2 w-full sm:w-auto">
                              {/* Direct Timeline Simulator trigger */}
                              <button
                                type="button"
                                disabled={simulatingTaskId !== null}
                                onClick={() => handleTimelineSimulateSkip(t.id)}
                                className="flex-1 sm:flex-none px-2.5 py-1.5 bg-rose-600/10 border border-rose-500/20 hover:bg-rose-600 hover:text-white rounded-lg text-rose-400 font-semibold tracking-wider transition-all disabled:opacity-40 flex items-center justify-center text-center"
                              >
                                {simulatingTaskId === t.id ? (
                                  <Loader2 className="w-2.5 h-2.5 animate-spin mr-1 shrink-0" />
                                ) : (
                                  <Zap className="w-2.5 h-2.5 mr-1 shrink-0" />
                                )}
                                SIMULATE SKIP
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => setActiveTab("execution")}
                                className="flex-1 sm:flex-none px-2.5 py-1.5 bg-indigo-650/15 border border-indigo-500/20 hover:bg-indigo-650 rounded-lg text-indigo-400 hover:text-white font-semibold tracking-wider transition-all flex items-center justify-center text-center"
                              >
                                FOCUS NOW
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Subtask checkboxes list */}
                        {t.subtasks.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[8px] text-zinc-500 font-mono tracking-widest uppercase block mb-1">Checkpoints checklist</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {t.subtasks.map((sub) => (
                                <div
                                  key={sub.id}
                                  onClick={() => toggleSubtask(t.id, sub.id)}
                                  className={`p-2.5 bg-surface-secondary/40 border border-white/5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                                    sub.completed
                                      ? "opacity-35 text-zinc-650 line-through border-transparent"
                                      : "text-zinc-300 hover:border-white/10"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                      sub.completed ? "border-indigo-500 bg-indigo-500/10 text-indigo-400" : "border-zinc-750"
                                    }`}>
                                      {sub.completed && <CheckCircle2 className="w-2 h-2" />}
                                    </div>
                                    <span className="text-xs font-sans break-words leading-tight pr-1.5">{sub.title}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-1.5 text-[8px] font-mono uppercase shrink-0 ml-2">
                                    <span className="px-1.5 bg-surface-secondary rounded text-zinc-500">{sub.durationMinutes}m</span>
                                    <span className={`px-1.5 rounded ${
                                      sub.difficulty === "Hard" ? "bg-rose-500/10 text-rose-400" : "bg-surface-secondary text-zinc-500"
                                    }`}>{sub.difficulty}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    )}

                  </div>
                </div>
              );
            })}

            {/* Ending target checkpoint */}
            <div className="relative flex flex-col space-y-1 pl-0.5">
              <div className="absolute -left-[27px] top-1.5 w-4.5 h-4.5 rounded border border-white/5 flex items-center justify-center bg-background z-10 text-[8px] text-zinc-500 font-mono">
                ⚑
              </div>
              <div className="font-mono text-zinc-550 text-[9px] uppercase tracking-widest pl-1">
                Core objective complete checkpoint
              </div>
            </div>

          </div>
        ) : (
          <div className="py-20 text-center text-zinc-550 italic border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 font-mono text-xs">
            <Compass className="w-7 h-7 text-zinc-750 animate-pulse" />
            <span>No timelines mapped. Add tasks to see visual Gantt projections.</span>
          </div>
        )}
      </div>

      {/* Manual Task Dialog Modal */}
      {showManualForm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="w-full max-w-md bg-surface-primary border border-white/5 rounded-2xl p-6 relative shadow-[0_24px_50px_rgba(0,0,0,0.85)]">
            <div className="flex justify-between items-center mb-5 border-b border-white/5 pb-3">
              <h3 className="text-xs font-semibold text-white tracking-widest uppercase font-mono">
                Create Smart Task
              </h3>
              <button
                onClick={() => setShowManualForm(false)}
                className="p-1 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4 text-xs font-sans text-zinc-450">
              <div className="space-y-1.5">
                <label className="block text-zinc-500 font-mono text-[8px] uppercase tracking-widest">Task Title</label>
                <input
                  type="text"
                  required
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="e.g. Solve algorithms homework"
                  className="w-full bg-surface-secondary border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500/80 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-zinc-500 font-mono text-[8px] uppercase tracking-widest">Effort (Hours)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={manualHours}
                    onChange={(e) => setManualHours(Number(e.target.value))}
                    className="w-full bg-surface-secondary border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500/80 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-zinc-500 font-mono text-[8px] uppercase tracking-widest">Deadline Date</label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full bg-surface-secondary border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500/80 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-zinc-500 font-mono text-[8px] uppercase tracking-widest">Category</label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value as Task["category"])}
                    className="w-full bg-surface-secondary border border-white/5 rounded-xl p-3 text-white focus:outline-none"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Career">Career</option>
                    <option value="Business">Business</option>
                    <option value="Health">Health</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-zinc-500 font-mono text-[8px] uppercase tracking-widest">Priority</label>
                  <select
                    value={manualPriority}
                    onChange={(e) => setManualPriority(e.target.value as Task["priority"])}
                    className="w-full bg-surface-secondary border border-white/5 rounded-xl p-3 text-white focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-zinc-500 font-mono text-[8px] uppercase tracking-widest">Notes</label>
                <textarea
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Operational details or resource URLs..."
                  className="w-full h-20 bg-surface-secondary border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500/80 resize-none transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowManualForm(false)}
                  className="flex-1 py-3 border border-white/5 hover:bg-white/5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="action-btn-primary flex-1 py-3 text-xs font-semibold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Multi-Agent Orchestrator Pipeline Overlay */}
      {thinkingState.active && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-60 animate-fade-in p-4">
          <div className="w-full max-w-xs bg-surface-primary border border-white/5 rounded-2xl p-6 space-y-4 shadow-[0_24px_50px_rgba(0,0,0,0.85)]">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
              <div>
                <h3 className="text-[10px] font-bold text-white uppercase tracking-widest leading-none font-mono">Agent Orchestrator</h3>
                <span className="text-[8px] text-zinc-550 uppercase tracking-wider block mt-1">running pipeline...</span>
              </div>
            </div>

            <div className="space-y-2.5 font-mono text-[9px] text-zinc-450">
              {thinkingState.steps.map((step, idx) => {
                const currentIdx = thinkingState.steps.indexOf(thinkingState.currentStep);
                const isFinished = idx < currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={idx} className="flex gap-2.5 items-start">
                    <div className="mt-0.5 shrink-0">
                      {isFinished ? (
                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[7px] text-emerald-400 font-bold">
                          ✓
                        </div>
                      ) : isCurrent ? (
                        <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full bg-surface-secondary border border-white/5" />
                      )}
                    </div>
                    <span className={isFinished ? "text-zinc-650 line-through font-sans" : isCurrent ? "text-white font-semibold font-sans" : "text-zinc-655 font-sans"}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
