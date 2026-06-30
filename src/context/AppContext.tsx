"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { MockAgentAPI } from "@/lib/mockData";

// Types definition
export interface Subtask {
  id: string;
  title: string;
  durationMinutes: number;
  difficulty: "Easy" | "Medium" | "Hard";
  order: number;
  completed: boolean;
}

export interface ScheduleBlock {
  id: string;
  taskId: string;
  taskTitle: string;
  date: string; // YYYY-MM-DD
  durationHours: number;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string; // YYYY-MM-DD
  effort: number; // hours
  category: "Academic" | "Career" | "Business" | "Health" | "Personal";
  priority: "Low" | "Medium" | "High" | "Critical";
  priorityReason: string;
  confidenceScore: number;
  decisionMetrics?: {
    daysRemaining: number;
    workloadConflictFactor: number;
    dependencyCount: number;
  };
  complexity: number; // 1-10
  notes: string;
  completed: boolean;
  subtasks: Subtask[];
  scheduleBlocks: ScheduleBlock[];
  aiMetadata?: {
    provider: string;
    model: string;
    timestamp: string;
    confidence: number;
    processingTimeMs?: number;
    reasoningSummary?: string;
  };
}

export interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  category: string;
  targetDate: string;
  completed: boolean;
  milestones: Milestone[];
}

export interface Habit {
  id: string;
  name: string;
  category: string;
  frequency: string;
  streaks: number;
  completedDates: string[]; // YYYY-MM-DD
  aiTip?: string;
}

export interface AgentLog {
  id: string;
  timestamp: string; // HH:MM:SS
  agentName: string;
  message: string;
  status: "info" | "success" | "warning" | "error";
}

export interface UserProfile {
  name: string;
  xp: number;
  level: number;
  apiKey: string;
  mri: number; // Mission Readiness Index
  aiProvider?: "gemini" | "openrouter" | "groq";
}

export interface UserMemory {
  preferredFocusHours: number; // daily work limit
  avgCodingSpeed: number; // hours per unit
  avgReadingSpeed: number; // pages/hour
  peakFocusHour: string; // e.g. "8:00 PM"
  procrastinationWarning: string; // warning message
  memoryLogs: string[];
}

export interface AppNotification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "info" | "alert" | "success";
}

export interface SimulationResult {
  currentPlan: { probability: number; outcome: string };
  skipToday: { probability: number; outcome: string };
  workExtra: { probability: number; outcome: string };
}

export interface WeeklyBrief {
  summary: string;
  milestonesCount: number;
  atRiskDeadlinesCount: number;
  successProbability: number;
  recommendations: string[];
}

export interface AgentRegistryStatus {
  planning: "idle" | "running" | "complete";
  priority: "idle" | "running" | "complete";
  schedule: "idle" | "running" | "complete";
  risk: "idle" | "running" | "complete";
  coach: "idle" | "running" | "complete";
  memory: "idle" | "running" | "complete";
}

export interface AutonomousAlert {
  id: string;
  message: string;
  timestamp: string;
}

interface AppContextType {
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  agentLogs: AgentLog[];
  userProfile: UserProfile;
  userMemory: UserMemory;
  notifications: AppNotification[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  weeklyBrief: WeeklyBrief | null;
  simulation: SimulationResult;
  thinkingState: {
    active: boolean;
    steps: string[];
    currentStep: string;
  };
  
  // OS Redesign States
  isBooting: boolean;
  isJudgeMode: boolean;
  toggleJudgeMode: () => void;
  agentRegistry: AgentRegistryStatus;
  autonomousAlerts: AutonomousAlert[];
  clearAutonomousAlert: (id: string) => void;
  expandedWhyTasks: string[];
  toggleWhyTask: (taskId: string) => void;
  getDynamicGreeting: () => string;
  
  // Actions
  runCommandPipeline: (command: string) => Promise<void>;
  addManualTask: (taskData: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  toggleTask: (taskId: string) => void;
  
  addGoal: (title: string, category: string, targetDate: string) => Promise<void>;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  deleteGoal: (goalId: string) => void;
  
  addHabit: (name: string, category: string) => void;
  checkInHabit: (habitId: string) => void;
  deleteHabit: (habitId: string) => void;
  
  triggerAdaptiveReschedule: (skippedTaskId?: string) => Promise<void>;
  runWhatIfSimulation: (action: string) => Promise<void>;
  getCoachReply: (query: string) => Promise<{ reply: string; actionSuggestions: string[] }>;
  
  saveApiKey: (key: string, provider?: "gemini" | "openrouter" | "groq") => void;
  loadDemoMode: () => void;
  clearAllData: () => void;

  // New States
  aiConnectionState: "live" | "sandbox" | "offline";
  serverKeysConfigured: { gemini: boolean; openrouter: boolean; groq: boolean };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Jan",
    xp: 280,
    level: 2,
    apiKey: "",
    mri: 87
  });
  const [userMemory, setUserMemory] = useState<UserMemory>({
    preferredFocusHours: 4,
    avgCodingSpeed: 1.8,
    avgReadingSpeed: 25,
    peakFocusHour: "8:00 PM",
    procrastinationWarning: "Friday afternoons show a 35% higher task skipping risk.",
    memoryLogs: ["Evolved Coding Speed from 2.5 to 1.8 h/module after 18 sessions."]
  });
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeTab, setActiveTab] = useState("mission");
  const [weeklyBrief, setWeeklyBrief] = useState<WeeklyBrief | null>(null);
  
  const [simulation, setSimulation] = useState<SimulationResult>({
    currentPlan: { probability: 87, outcome: "Your schedule is stable. All slots match your preferred peak focus hours." },
    skipToday: { probability: 54, outcome: "Skip shifts 3 hours to Sunday, creating a high-stress schedule and conflict with Monday's interview." },
    workExtra: { probability: 96, outcome: "Adding 1.5h today clears Saturday's slot completely, securing a buffer." }
  });

  const [thinkingState, setThinkingState] = useState({
    active: false,
    steps: [] as string[],
    currentStep: ""
  });

  const [aiConnectionState, setAiConnectionState] = useState<"live" | "sandbox" | "offline">("sandbox");
  const [serverKeysConfigured, setServerKeysConfigured] = useState<{ gemini: boolean; openrouter: boolean; groq: boolean }>({
    gemini: false,
    openrouter: false,
    groq: false
  });

  // Redesign state properties
  const [isBooting, setIsBooting] = useState(true);
  const [isJudgeMode, setIsJudgeMode] = useState(true);
  const [autonomousAlerts, setAutonomousAlerts] = useState<AutonomousAlert[]>([]);
  const [expandedWhyTasks, setExpandedWhyTasks] = useState<string[]>([]);
  const [agentRegistry, setAgentRegistry] = useState<AgentRegistryStatus>({
    planning: "complete",
    priority: "complete",
    schedule: "complete",
    risk: "complete",
    coach: "idle",
    memory: "complete"
  });

  // Play boot loader on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBooting(false);
    }, 1500); // 1.5 second terminal boot sequence
    return () => clearTimeout(timer);
  }, []);

  // Load state from local storage on mount
  useEffect(() => {
    const localTasks = localStorage.getItem("dh_tasks");
    const localGoals = localStorage.getItem("dh_goals");
    const localHabits = localStorage.getItem("dh_habits");
    const localLogs = localStorage.getItem("dh_logs");
    const localProfile = localStorage.getItem("dh_profile");
    const localMemory = localStorage.getItem("dh_memory");
    const localNotifs = localStorage.getItem("dh_notifs");
    const localBrief = localStorage.getItem("dh_brief");
    const localJudge = localStorage.getItem("dh_judge_mode");

    if (localTasks) setTasks(JSON.parse(localTasks));
    if (localGoals) setGoals(JSON.parse(localGoals));
    if (localHabits) setHabits(JSON.parse(localHabits));
    if (localLogs) setAgentLogs(JSON.parse(localLogs));
    if (localProfile) setUserProfile(JSON.parse(localProfile));
    if (localMemory) setUserMemory(JSON.parse(localMemory));
    if (localNotifs) setNotifications(JSON.parse(localNotifs));
    if (localBrief) setWeeklyBrief(JSON.parse(localBrief));
    if (localJudge) setIsJudgeMode(JSON.parse(localJudge));

    if (!localTasks && !localGoals && !localHabits) {
      loadDemoMode(); // Auto load demo data if empty
    }
  }, []);

  // Fetch server config on mount
  useEffect(() => {
    fetch("/api/ai")
      .then(res => res.json())
      .then(data => {
        setServerKeysConfigured(data);
      })
      .catch(err => console.error("Failed to fetch server AI status", err));
  }, []);

  // Monitor connection state
  useEffect(() => {
    const updateOnlineStatus = () => {
      if (!navigator.onLine) {
        setAiConnectionState("offline");
      } else {
        const hasServerKey = serverKeysConfigured.gemini || serverKeysConfigured.openrouter || serverKeysConfigured.groq;
        if (userProfile.apiKey || hasServerKey) {
          setAiConnectionState("live");
        } else {
          setAiConnectionState("sandbox");
        }
      }
    };

    updateOnlineStatus();
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, [userProfile.apiKey, serverKeysConfigured]);

  // Sync expanded accordions if Judge Mode is ON
  useEffect(() => {
    if (isJudgeMode && tasks.length > 0) {
      setExpandedWhyTasks(tasks.map(t => t.id));
    } else if (!isJudgeMode) {
      setExpandedWhyTasks([]);
    }
  }, [isJudgeMode, tasks]);

  // Save utility helpers
  const saveState = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const pushLog = (agentName: string, message: string, status: "info" | "success" | "warning" | "error" = "info") => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    const newLog: AgentLog = {
      id: Math.random().toString(),
      timestamp: timeStr,
      agentName,
      message,
      status
    };
    setAgentLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 50);
      saveState("dh_logs", updated);
      return updated;
    });
  };

  const addNotification = (message: string, type: "info" | "alert" | "success" = "info") => {
    const newNotif: AppNotification = {
      id: Math.random().toString(),
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      type
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      saveState("dh_notifs", updated);
      return updated;
    });
  };

  const awardXp = (amount: number) => {
    setUserProfile(prev => {
      const newXp = prev.xp + amount;
      const needed = prev.level * 250;
      let newLevel = prev.level;
      if (newXp >= needed) {
        newLevel += 1;
        addNotification(`Level Up! You reached Level ${newLevel}!`, "success");
        pushLog("Memory Agent", `User profile leveled up to ${newLevel}. Evolving capacity models.`, "success");
      }
      const updated = { ...prev, xp: newXp, level: newLevel };
      saveState("dh_profile", updated);
      return updated;
    });
  };

  // Dynamic time-based narrative greeting builder
  const getDynamicGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good morning";
    if (hours < 17) return "Good afternoon";
    return "Good evening";
  };

  const toggleJudgeMode = () => {
    const nextVal = !isJudgeMode;
    setIsJudgeMode(nextVal);
    saveState("dh_judge_mode", nextVal);
    pushLog("System Manager", `Judge Mode toggled to ${nextVal ? "ON" : "OFF"}.`, "warning");
    addNotification(`Judge Mode turned ${nextVal ? "ON" : "OFF"}.`, "info");
    
    if (nextVal) {
      loadDemoMode();
    }
  };

  const toggleWhyTask = (taskId: string) => {
    setExpandedWhyTasks(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };

  const clearAutonomousAlert = (id: string) => {
    setAutonomousAlerts(prev => prev.filter(a => a.id !== id));
  };

  // Standard API call helper wrapping openrouter / gemini connectivity state updates
  const fetchAI = async (agent: string, params: any) => {
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": userProfile.apiKey || "",
          "x-ai-provider": userProfile.aiProvider || "gemini"
        },
        body: JSON.stringify({ agent, ...params })
      });

      if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status}`);
      }

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "AI call failed");
      }

      if (navigator.onLine) {
        if (json.source === "gemini" || json.source === "openrouter" || json.source === "groq") {
          setAiConnectionState("live");
        } else {
          setAiConnectionState("sandbox");
        }
      } else {
        setAiConnectionState("offline");
      }

      return json;
    } catch (e: any) {
      console.error("AI fetch failed:", e);
      if (!navigator.onLine) {
        setAiConnectionState("offline");
      } else {
        setAiConnectionState("sandbox");
      }
      throw e;
    }
  };

  // 1. Orchestrated Multi-Agent Command Pipeline
  const runCommandPipeline = async (command: string) => {
    if (!command.trim()) return;
    setThinkingState({
      active: true,
      steps: [
        "Analyzing intent (Planning Agent)...",
        "Assessing priority factors (Priority Agent)...",
        "Structuring calendar blocks (Schedule Agent)...",
        "Computing outcome predictions (Risk Agent)...",
        "Reviewing memory metrics (Memory Agent)..."
      ],
      currentStep: "Analyzing intent (Planning Agent)..."
    });

    setAgentRegistry({
      planning: "running",
      priority: "idle",
      schedule: "idle",
      risk: "idle",
      coach: "idle",
      memory: "idle"
    });

    const stepDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

    try {
      // Step 1: Input parsing (Planning Agent)
      await stepDelay(600);
      setThinkingState(prev => ({ ...prev, currentStep: "Analyzing intent (Planning Agent)..." }));
      pushLog("Planning Agent", `Parsing task parameters from: "${command}"`, "info");
      
      const parsedData = await fetchAI("taskAnalyzer", { command });
      const analyzed = parsedData.data;

      setAgentRegistry(prev => ({ ...prev, planning: "complete", priority: "running" }));

      // Step 2: Priority Reasoning (Priority Agent)
      await stepDelay(700);
      setThinkingState(prev => ({ ...prev, currentStep: "Assessing priority factors (Priority Agent)..." }));
      pushLog("Priority Agent", `Determining priority constraints for "${analyzed.title}"`, "info");

      const activeHours = tasks.reduce((sum, t) => sum + (t.completed ? 0 : t.effort), 0);
      const priorityData = await fetchAI("priorityEngine", {
        title: analyzed.title,
        deadline: analyzed.deadline,
        hours: analyzed.estimatedHours,
        currentWorkload: activeHours,
        dependenciesCount: 0
      });
      const pEngine = priorityData.data;

      setAgentRegistry(prev => ({ ...prev, priority: "complete", schedule: "running" }));

      // Step 3: Schedule Allocation (Schedule Agent)
      await stepDelay(700);
      setThinkingState(prev => ({ ...prev, currentStep: "Structuring calendar blocks (Schedule Agent)..." }));
      pushLog("Schedule Agent", `Allocating schedule slots for "${analyzed.title}"`, "info");

      const scheduleData = await fetchAI("scheduler", {
        title: analyzed.title,
        hours: analyzed.estimatedHours,
        deadline: analyzed.deadline,
        preferredFocusHours: userMemory.preferredFocusHours
      });
      const allocatedBlocks = scheduleData.data.schedule.map((b: any) => ({
        id: Math.random().toString(),
        taskId: "", 
        taskTitle: analyzed.title,
        date: b.date,
        durationHours: b.durationHours,
        completed: false
      }));

      setAgentRegistry(prev => ({ ...prev, schedule: "complete", risk: "running" }));

      // Step 4: Subtasks & Risk Modeling (Risk Agent)
      await stepDelay(600);
      setThinkingState(prev => ({ ...prev, currentStep: "Computing outcome predictions (Risk Agent)..." }));
      pushLog("Risk Agent", `Calculating completion probability shifts...`, "info");

      const breakdownData = await fetchAI("taskBreakdown", { title: analyzed.title, hours: analyzed.estimatedHours });
      const subtasksList = breakdownData.data.subtasks.map((s: any, index: number) => ({
        id: Math.random().toString(),
        title: s.title,
        durationMinutes: s.durationMinutes,
        difficulty: s.difficulty,
        order: index + 1,
        completed: false
      }));

      const newTaskId = Math.random().toString();
      const finalizedBlocks = allocatedBlocks.map((b: any) => ({ ...b, taskId: newTaskId }));

      const newTask: Task = {
        id: newTaskId,
        title: analyzed.title,
        description: analyzed.category + " task parsed by AI",
        deadline: analyzed.deadline,
        effort: analyzed.estimatedHours,
        category: analyzed.category,
        priority: pEngine.priority,
        priorityReason: pEngine.explanation,
        confidenceScore: priorityData.metadata?.confidence || pEngine.confidenceScore || 94,
        decisionMetrics: pEngine.decisionMetrics,
        complexity: Math.max(1, Math.min(10, analyzed.ambiguityScore || 5)),
        notes: "Created via NLP OS Command Bar.",
        completed: false,
        subtasks: subtasksList,
        scheduleBlocks: finalizedBlocks,
        aiMetadata: priorityData.metadata || undefined
      };

      setAgentRegistry(prev => ({ ...prev, risk: "complete", memory: "running" }));

      // Step 5: Memory Update (Memory Agent)
      await stepDelay(500);
      setThinkingState(prev => ({ ...prev, currentStep: "Reviewing memory metrics (Memory Agent)..." }));
      
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      saveState("dh_tasks", updatedTasks);
      recalculateMRI(updatedTasks);

      pushLog("Memory Agent", `Registered new task logs. MRI updated. System is Mission Ready.`, "success");
      addNotification(`Autonomous Agent Pipeline completed. Task "${analyzed.title}" scheduled.`, "success");

      setAgentRegistry({
        planning: "complete",
        priority: "complete",
        schedule: "complete",
        risk: "complete",
        coach: "idle",
        memory: "complete"
      });

    } catch (e: any) {
      console.error(e);
      pushLog("Orchestrator", `Failed pipeline: ${e.message}`, "error");
      addNotification("Agent workflow failed. Defaulted to simulation.", "alert");
      
      setAgentRegistry({
        planning: "complete",
        priority: "complete",
        schedule: "complete",
        risk: "complete",
        coach: "idle",
        memory: "complete"
      });
    } finally {
      setThinkingState({ active: false, steps: [], currentStep: "" });
    }
  };

  // Recalculates MRI index dynamically
  const recalculateMRI = (taskList: Task[]) => {
    const incomplete = taskList.filter(t => !t.completed);
    if (incomplete.length === 0) {
      setUserProfile(prev => {
        const u = { ...prev, mri: 100 };
        saveState("dh_profile", u);
        return u;
      });
      return;
    }

    let penalty = 0;
    const totalRemainingHours = incomplete.reduce((sum, t) => sum + t.effort, 0);
    if (totalRemainingHours > 12) penalty += 15;
    if (totalRemainingHours > 20) penalty += 20;

    const urgentTasks = incomplete.filter(t => {
      const diff = new Date(t.deadline).getTime() - Date.now();
      return diff < 48 * 60 * 60 * 1000;
    });

    if (urgentTasks.length > 0) {
      penalty += urgentTasks.length * 10;
    }

    const newMri = Math.max(15, Math.min(98, 98 - penalty));
    setUserProfile(prev => {
      const u = { ...prev, mri: newMri };
      saveState("dh_profile", u);
      return u;
    });
  };

  // Add a task manually
  const addManualTask = async (taskData: Partial<Task>) => {
    pushLog("Planning Agent", `Structuring task: "${taskData.title}"`, "info");
    const newId = Math.random().toString();

    setThinkingState({
      active: true,
      steps: [
        "Analyzing manual task constraints...",
        "Decomposing objectives with AI...",
        "Allocating calendar focus slots...",
        "Evaluating priority models..."
      ],
      currentStep: "Analyzing parameters..."
    });

    try {
      // 1. Task Breakdown
      const breakdownData = await fetchAI("taskBreakdown", { title: taskData.title || "Task", hours: taskData.effort || 2 });
      const subList = breakdownData.data.subtasks.map((s: any, idx: number) => ({
        id: Math.random().toString(),
        title: s.title,
        durationMinutes: s.durationMinutes,
        difficulty: s.difficulty,
        order: idx + 1,
        completed: false
      }));

      // 2. Schedule Allocation
      const scheduleData = await fetchAI("scheduler", {
        title: taskData.title || "Task",
        hours: taskData.effort || 2,
        deadline: taskData.deadline || new Date().toISOString().split('T')[0],
        preferredFocusHours: userMemory.preferredFocusHours
      });
      const blocks = scheduleData.data.schedule.map((b: any) => ({
        id: Math.random().toString(),
        taskId: newId,
        taskTitle: taskData.title || "Task",
        date: b.date,
        durationHours: b.durationHours,
        completed: false
      }));

      // 3. Priority Evaluation
      const priorityData = await fetchAI("priorityEngine", {
        title: taskData.title || "Task",
        deadline: taskData.deadline || new Date().toISOString().split('T')[0],
        hours: taskData.effort || 2,
        currentWorkload: tasks.reduce((sum, t) => sum + (t.completed ? 0 : t.effort), 0),
        dependenciesCount: 0
      });
      const pEngine = priorityData.data;

      const newTask: Task = {
        id: newId,
        title: taskData.title || "New Task",
        description: taskData.description || "",
        deadline: taskData.deadline || new Date().toISOString().split('T')[0],
        effort: taskData.effort || 2,
        category: taskData.category || "Personal",
        priority: pEngine.priority || taskData.priority || "Medium",
        priorityReason: pEngine.explanation || "Manually structured task.",
        confidenceScore: priorityData.metadata?.confidence || pEngine.confidenceScore || 95,
        decisionMetrics: pEngine.decisionMetrics || {
          daysRemaining: 5,
          workloadConflictFactor: 4,
          dependencyCount: 0
        },
        complexity: Math.min(10, Math.max(1, Math.round((taskData.effort || 2) * 1.2))),
        notes: taskData.description || "",
        completed: false,
        subtasks: subList,
        scheduleBlocks: blocks,
        aiMetadata: priorityData.metadata || undefined
      };

      setTasks(prev => {
        const nextTasks = [...prev, newTask];
        saveState("dh_tasks", nextTasks);
        return nextTasks;
      });
      recalculateMRI([...tasks, newTask]);
      pushLog("Planning Agent", `Task "${newTask.title}" successfully added.`, "success");
      addNotification(`Task "${newTask.title}" planned by AI.`, "success");
    } catch (err: any) {
      console.error("Manual task AI planning failed, fallback to local mock:", err);
      // Fallback
      const mockBreakdown = MockAgentAPI.breakdownTask(taskData.title || "Task", taskData.effort || 2);
      const subList = mockBreakdown.subtasks.map((s, idx) => ({
        id: Math.random().toString(),
        title: s.title,
        durationMinutes: s.durationMinutes,
        difficulty: s.difficulty,
        order: idx + 1,
        completed: false
      }));

      const mockSched = MockAgentAPI.scheduleTask(
        taskData.title || "Task",
        taskData.effort || 2,
        taskData.deadline || new Date().toISOString().split('T')[0],
        userMemory.preferredFocusHours
      );
      const blocks = mockSched.schedule.map((b) => ({
        id: Math.random().toString(),
        taskId: newId,
        taskTitle: taskData.title || "Task",
        date: b.date,
        durationHours: b.durationHours,
        completed: false
      }));

      const mockPriority = MockAgentAPI.evaluateTaskPriority(
        taskData.title || "Task",
        taskData.deadline || new Date().toISOString().split('T')[0],
        taskData.effort || 2,
        tasks.reduce((sum, t) => sum + (t.completed ? 0 : t.effort), 0),
        0
      );

      const newTask: Task = {
        id: newId,
        title: taskData.title || "New Task",
        description: taskData.description || "",
        deadline: taskData.deadline || new Date().toISOString().split('T')[0],
        effort: taskData.effort || 2,
        category: taskData.category || "Personal",
        priority: mockPriority.priority || taskData.priority || "Medium",
        priorityReason: mockPriority.explanation || "Manually registered and aligned with default focus periods.",
        confidenceScore: mockPriority.confidenceScore || 95,
        decisionMetrics: mockPriority.decisionMetrics,
        complexity: Math.max(1, Math.min(10, Math.round((taskData.effort || 2) * 1.2))),
        notes: "",
        completed: false,
        subtasks: subList,
        scheduleBlocks: blocks
      };

      setTasks(prev => {
        const nextTasks = [...prev, newTask];
        saveState("dh_tasks", nextTasks);
        return nextTasks;
      });
      recalculateMRI([...tasks, newTask]);
      pushLog("Planning Agent", `Task "${newTask.title}" manually added.`, "success");
      addNotification(`Task "${newTask.title}" added manually.`, "success");
    } finally {
      setThinkingState({ active: false, steps: [], currentStep: "" });
    }
  };

  const deleteTask = (taskId: string) => {
    const updated = tasks.filter(t => t.id !== taskId);
    setTasks(updated);
    saveState("dh_tasks", updated);
    recalculateMRI(updated);
    pushLog("Strategy Planner", "Task pruned. Re-optimizing calendar timelines.", "warning");
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const subUpdated = t.subtasks.map(s => {
          if (s.id === subtaskId) {
            const nextCompleted = !s.completed;
            pushLog("Execution Coach", `Subtask segment "${s.title}" marked as ${nextCompleted ? "Done" : "Pending"}`, "info");
            if (nextCompleted) awardXp(15);
            return { ...s, completed: nextCompleted };
          }
          return s;
        });
        return { ...t, subtasks: subUpdated };
      }
      return t;
    });
    setTasks(updated);
    saveState("dh_tasks", updated);
  };

  const toggleTask = (taskId: string) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const nextState = !t.completed;
        pushLog("Memory Agent", `Mission "${t.title}" checked off as ${nextState ? "COMPLETED" : "INCOMPLETE"}`, nextState ? "success" : "warning");
        
        if (nextState) {
          awardXp(60);
          addNotification(`Mission Complete: "${t.title}" finished!`, "success");
        }
        
        const subUpdated = t.subtasks.map(s => ({ ...s, completed: nextState }));
        const blocksUpdated = t.scheduleBlocks.map(b => ({ ...b, completed: nextState }));

        return { ...t, completed: nextState, subtasks: subUpdated, scheduleBlocks: blocksUpdated };
      }
      return t;
    });
    setTasks(updated);
    saveState("dh_tasks", updated);
    recalculateMRI(updated);
  };

  // 2. Goals Planner
  const addGoal = async (title: string, category: string, targetDate: string) => {
    pushLog("Planning Agent", `Drafting milestones for Goal: "${title}"`, "info");
    
    const milestonesList = [
      { id: "g1", title: "Review conceptual requirements", targetDate, completed: false },
      { id: "g2", title: "Complete core architecture build", targetDate, completed: false },
      { id: "g3", title: "Final integration verification", targetDate, completed: false }
    ];

    const newGoal: Goal = {
      id: Math.random().toString(),
      title,
      category,
      targetDate,
      completed: false,
      milestones: milestonesList
    };

    const updated = [...goals, newGoal];
    setGoals(updated);
    saveState("dh_goals", updated);
    addNotification(`New Goal "${title}" structured with milestones.`, "success");
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    const updated = goals.map(g => {
      if (g.id === goalId) {
        const miles = g.milestones.map(m => {
          if (m.id === milestoneId) {
            const nextCompleted = !m.completed;
            if (nextCompleted) awardXp(20);
            return { ...m, completed: nextCompleted };
          }
          return m;
        });
        const allDone = miles.every(m => m.completed);
        if (allDone && !g.completed) {
          awardXp(100);
          addNotification(`Goal achieved: "${g.title}"!`, "success");
        }
        return { ...g, milestones: miles, completed: allDone };
      }
      return g;
    });
    setGoals(updated);
    saveState("dh_goals", updated);
  };

  const deleteGoal = (goalId: string) => {
    const updated = goals.filter(g => g.id !== goalId);
    setGoals(updated);
    saveState("dh_goals", updated);
  };

  // 3. Habits
  const addHabit = (name: string, category: string) => {
    const newHabit: Habit = {
      id: Math.random().toString(),
      name,
      category,
      frequency: "Daily",
      streaks: 0,
      completedDates: [],
      aiTip: `Block a 30-minute slot right after your peak productivity period at ${userMemory.peakFocusHour}.`
    };
    const updated = [...habits, newHabit];
    setHabits(updated);
    saveState("dh_habits", updated);
    pushLog("Memory Agent", `Tracking routine habit: "${name}"`, "info");
  };

  const checkInHabit = (habitId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updated = habits.map(h => {
      if (h.id === habitId) {
        if (h.completedDates.includes(todayStr)) {
          const dates = h.completedDates.filter(d => d !== todayStr);
          return { ...h, completedDates: dates, streaks: Math.max(0, h.streaks - 1) };
        } else {
          const dates = [...h.completedDates, todayStr];
          awardXp(10);
          addNotification(`Daily Habit "${h.name}" completed today.`, "success");
          pushLog("Memory Agent", `Routine checked: "${h.name}" checked in.`, "success");
          return { ...h, completedDates: dates, streaks: h.streaks + 1 };
        }
      }
      return h;
    });
    setHabits(updated);
    saveState("dh_habits", updated);
  };

  const deleteHabit = (habitId: string) => {
    const updated = habits.filter(h => h.id !== habitId);
    setHabits(updated);
    saveState("dh_habits", updated);
  };

  // 4. Adaptive Rescheduling (Autonomic Execution Agent)
  const triggerAdaptiveReschedule = async (skippedTaskId?: string) => {
    pushLog("Risk Agent", "Detecting schedule lag. Triggering Autonomous Rescheduler...", "warning");
    
    let shiftedCount = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const updatedTasks = tasks.map(t => {
      const modifiedBlocks = t.scheduleBlocks.map(b => {
        if (b.date === todayStr && !b.completed) {
          shiftedCount++;
          return { ...b, date: tomorrowStr };
        }
        return b;
      });
      return { ...t, scheduleBlocks: modifiedBlocks };
    });

    setTasks(updatedTasks);
    saveState("dh_tasks", updatedTasks);

    const alertId = Math.random().toString();
    const newAlert: AutonomousAlert = {
      id: alertId,
      message: `Missed yesterday's focus session. I have automatically moved focus blocks to tomorrow, adjusted documentation effort, and updated your Strategy timeline.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAutonomousAlerts(prev => [newAlert, ...prev]);

    pushLog("Risk Agent", `Shifted ${shiftedCount} blocks. Successfully rebalanced timeline automatically.`, "success");
    setUserProfile(prev => ({ ...prev, mri: Math.max(20, prev.mri - 5) }));
    addNotification("AI autonomously rescheduled your overdue focus blocks.", "alert");
  };

  // 5. What-If Simulator
  const runWhatIfSimulation = async (action: string) => {
    pushLog("Risk Agent", `Simulating timeline forecast: "${action}"`, "info");
    
    try {
      const resData = await fetchAI("whatIfSimulator", { tasks, action });
      setSimulation(resData.data);
      pushLog("Risk Agent", "Timeline simulation completed. Outcome loaded.", "success");
    } catch (err) {
      console.error("Simulation error", err);
    }
  };

  // 6. Coach Chats & Weekly Brief
  const getCoachReply = async (query: string) => {
    pushLog("Execution Coach", `Formulating workspace advice for: "${query}"`, "info");
    try {
      const resData = await fetchAI("coachAndInsights", { query, tasks, memory: userMemory });
      if (resData.data.weeklyBrief) {
        setWeeklyBrief(resData.data.weeklyBrief);
        saveState("dh_brief", resData.data.weeklyBrief);
      }
      return {
        reply: resData.data.reply,
        actionSuggestions: resData.data.actionSuggestions || ["Start focus session", "View strategy"]
      };
    } catch (e) {
      console.error(e);
    }
    return {
      reply: "I recommend focusing on your highest priority active block. Let's start a 25-minute Pomodoro sprint to secure your target milestones.",
      actionSuggestions: ["Create Task", "Rebalance Schedule"]
    };
  };

  const saveApiKey = (key: string, provider: "gemini" | "openrouter" | "groq" = "gemini") => {
    setUserProfile(prev => {
      const u = { ...prev, apiKey: key, aiProvider: provider };
      saveState("dh_profile", u);
      return u;
    });
    pushLog("Security Agent", `Custom API configuration updated: ${provider.toUpperCase()}`, "success");
    const providerName = provider === "gemini" ? "Google Gemini" : provider === "groq" ? "Groq Cloud" : "OpenRouter";
    addNotification(`AI Provider updated to ${providerName}.`, "success");
  };

  const clearAllData = () => {
    localStorage.clear();
    setTasks([]);
    setGoals([]);
    setHabits([]);
    setAgentLogs([]);
    setNotifications([]);
    setAutonomousAlerts([]);
    setWeeklyBrief(null);
    setUserProfile({
      name: "Jan",
      xp: 0,
      level: 1,
      apiKey: "",
      mri: 100,
      aiProvider: "gemini"
    });
    pushLog("System Manager", "Database records purged.", "warning");
  };

  // Pre-load demo state for hackathon wow impact
  const loadDemoMode = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dayAfterStr = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const demoTasks: Task[] = [
      {
        id: "demo-t1",
        title: "Build Deadline Hero AI Hackathon",
        description: "Create Next-generation autonomous AI deadline Operating System.",
        deadline: dayAfterStr,
        effort: 8,
        category: "Business",
        priority: "Critical",
        priorityReason: "Due in 2 days. 8 hours remaining. Finishing the UI redesign now saves 2.3 hours tomorrow.",
        confidenceScore: 94,
        decisionMetrics: { daysRemaining: 2, workloadConflictFactor: 7, dependencyCount: 3 },
        complexity: 8,
        notes: "Integrate agent logs, decision engines, and What-If timeline panels.",
        completed: false,
        subtasks: [
          { id: "ds1", title: "Set up context & local memory models", durationMinutes: 60, difficulty: "Medium", order: 1, completed: true },
          { id: "ds2", title: "Create Live Agent Activity panel", durationMinutes: 120, difficulty: "Medium", order: 2, completed: false },
          { id: "ds3", title: "Implement What-If simulator engine", durationMinutes: 180, difficulty: "Hard", order: 3, completed: false },
          { id: "ds4", title: "Polish dark mode dashboard cockpit", durationMinutes: 120, difficulty: "Easy", order: 4, completed: false }
        ],
        scheduleBlocks: [
          { id: "db1", taskId: "demo-t1", taskTitle: "Build Deadline Hero AI Hackathon", date: todayStr, durationHours: 3, completed: false },
          { id: "db2", taskId: "demo-t1", taskTitle: "Build Deadline Hero AI Hackathon", date: tomorrowStr, durationHours: 3, completed: false },
          { id: "db3", taskId: "demo-t1", taskTitle: "Build Deadline Hero AI Hackathon", date: dayAfterStr, durationHours: 2, completed: false }
        ]
      },
      {
        id: "demo-t2",
        title: "Prepare for Software Engineering Interview",
        description: "Study system architecture patterns and mock interviews.",
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        effort: 4,
        category: "Career",
        priority: "High",
        priorityReason: "Scheduled in 3 days. Postponing this block increases interview completion risk by 18%.",
        confidenceScore: 89,
        decisionMetrics: { daysRemaining: 3, workloadConflictFactor: 4, dependencyCount: 1 },
        complexity: 5,
        notes: "Review load balancers and database caching.",
        completed: false,
        subtasks: [
          { id: "ds5", title: "Review system designs", durationMinutes: 120, difficulty: "Hard", order: 1, completed: false },
          { id: "ds6", title: "Solve 2 coding challenges", durationMinutes: 120, difficulty: "Medium", order: 2, completed: false }
        ],
        scheduleBlocks: [
          { id: "db4", taskId: "demo-t2", taskTitle: "Prepare for Software Engineering Interview", date: todayStr, durationHours: 1, completed: false },
          { id: "db5", taskId: "demo-t2", taskTitle: "Prepare for Software Engineering Interview", date: tomorrowStr, durationHours: 3, completed: false }
        ]
      }
    ];

    const demoGoals: Goal[] = [
      {
        id: "demo-g1",
        title: "Crack Summer Internship",
        category: "Career",
        targetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        completed: false,
        milestones: [
          { id: "m1", title: "Revise resume and portfolio", targetDate: todayStr, completed: true },
          { id: "m2", title: "Complete 10 mock assessments", targetDate: tomorrowStr, completed: false },
          { id: "m3", title: "Finish HR round prep sheet", targetDate: dayAfterStr, completed: false }
        ]
      }
    ];

    const demoHabits: Habit[] = [
      {
        id: "demo-h1",
        name: "LeetCode Daily Challenge",
        category: "Career",
        frequency: "Daily",
        streaks: 4,
        completedDates: [todayStr],
        aiTip: "Code speed is 20% faster when working between 8 PM and 10 PM. Block time then!"
      },
      {
        id: "demo-h2",
        name: "Read Technical Articles",
        category: "Academic",
        frequency: "Daily",
        streaks: 2,
        completedDates: [],
        aiTip: "Try reading 15 pages in the morning before starting core development blocks."
      }
    ];

    const demoLogs: AgentLog[] = [
      { id: "1", timestamp: "18:42:01", agentName: "Schedule Agent", message: "Resolved Friday overlap by shifting 1.5h to Thursday block.", status: "success" },
      { id: "2", timestamp: "18:41:45", agentName: "Planning Agent", message: "Mapped 8 focus blocks for 'Build Deadline Hero' successfully.", status: "success" },
      { id: "3", timestamp: "18:41:10", agentName: "Priority Agent", message: "Set 'Build Deadline Hero' to Critical. 48h limit warning.", status: "warning" },
      { id: "4", timestamp: "18:40:55", agentName: "Task Analyzer", message: "Analyzed NLP: 'Build hackathon project by Sunday'", status: "info" }
    ];

    const demoNotifs: AppNotification[] = [
      { id: "n1", message: "Emergency Protocol activated for 'Build Deadline Hero AI Hackathon'. 48h remaining.", timestamp: "18:41", read: false, type: "alert" }
    ];

    const demoBrief: WeeklyBrief = {
      summary: "High volume of tasks this week due to the hackathon deadline. Your focus capacity is fully utilized. Maintain consistency to avoid weekend cramming.",
      milestonesCount: 3,
      atRiskDeadlinesCount: 1,
      successProbability: 87,
      recommendations: [
        "Complete 3 hours of hackathon development today.",
        "Delay your UI polish habit to save 1.5 hours.",
        "Take a walk at 3 PM to balance energy levels."
      ]
    };

    setTasks(demoTasks);
    setGoals(demoGoals);
    setHabits(demoHabits);
    setAgentLogs(demoLogs);
    setNotifications(demoNotifs);
    setWeeklyBrief(demoBrief);
    setUserProfile({
      name: "Jan",
      xp: 280,
      level: 2,
      apiKey: "",
      mri: 87,
      aiProvider: "gemini"
    });

    saveState("dh_tasks", demoTasks);
    saveState("dh_goals", demoGoals);
    saveState("dh_habits", demoHabits);
    saveState("dh_logs", demoLogs);
    saveState("dh_profile", { name: "Jan", xp: 280, level: 2, apiKey: "", mri: 87, aiProvider: "gemini" });
    saveState("dh_notifs", demoNotifs);
    saveState("dh_brief", demoBrief);
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        goals,
        habits,
        agentLogs,
        userProfile,
        userMemory,
        notifications,
        activeTab,
        setActiveTab,
        weeklyBrief,
        simulation,
        thinkingState,
        isBooting,
        isJudgeMode,
        toggleJudgeMode,
        agentRegistry,
        autonomousAlerts,
        clearAutonomousAlert,
        expandedWhyTasks,
        toggleWhyTask,
        getDynamicGreeting,
        runCommandPipeline,
        addManualTask,
        deleteTask,
        toggleSubtask,
        toggleTask,
        addGoal,
        toggleMilestone,
        deleteGoal,
        addHabit,
        checkInHabit,
        deleteHabit,
        triggerAdaptiveReschedule,
        runWhatIfSimulation,
        getCoachReply,
        saveApiKey,
        loadDemoMode,
        clearAllData,
        aiConnectionState,
        serverKeysConfigured
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
