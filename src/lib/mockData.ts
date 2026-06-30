// Mock engine for Deadline Hero AI agents
// Provides high-fidelity simulated agent responses mimicking Gemini output.

export const MockAgentAPI = {
  // Agent 1: Task Analyzer
  analyzeTask: (command: string) => {
    const text = command.toLowerCase();
    let title = "New Task";
    let category: "Academic" | "Career" | "Business" | "Health" | "Personal" = "Personal";
    let priority: "Low" | "Medium" | "High" | "Critical" = "Medium";
    let estimatedHours = 3;
    let deadline = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 5 days out

    // Simple keyword parser
    if (text.includes("study") || text.includes("exam") || text.includes("homework") || text.includes("assignment") || text.includes("read")) {
      category = "Academic";
      title = "Study session";
    } else if (text.includes("interview") || text.includes("resume") || text.includes("job") || text.includes("portfolio")) {
      category = "Career";
      title = "Career preparation";
    } else if (text.includes("launch") || text.includes("startup") || text.includes("client") || text.includes("marketing") || text.includes("product")) {
      category = "Business";
      title = "Business project";
    } else if (text.includes("exercise") || text.includes("run") || text.includes("gym") || text.includes("workout") || text.includes("health")) {
      category = "Health";
      title = "Health routine";
    }

    if (text.includes("urgent") || text.includes("asap") || text.includes("tomorrow") || text.includes("critical")) {
      priority = "Critical";
    } else if (text.includes("high") || text.includes("important")) {
      priority = "High";
    } else if (text.includes("low") || text.includes("relax")) {
      priority = "Low";
    }

    // Try to extract hours
    const hourMatch = text.match(/(\d+)\s*(hour|hr|h)/);
    if (hourMatch) {
      estimatedHours = parseInt(hourMatch[1]);
    }

    // Try to extract title
    const words = command.split(' ');
    if (words.length > 1) {
      // Find clean parts
      const stopWords = ["by", "for", "in", "tomorrow", "next", "hour", "hours", "high", "low", "medium", "critical", "priority", "urgent"];
      const filtered = words.filter(w => !stopWords.includes(w.toLowerCase()) && !w.match(/^\d+$/));
      if (filtered.length > 0) {
        title = filtered.slice(0, 5).join(' ');
        // capitalize first letter
        title = title.charAt(0).toUpperCase() + title.slice(1);
      }
    }

    // Adjust deadline based on phrasing
    if (text.includes("tomorrow")) {
      deadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    } else if (text.includes("sunday")) {
      // Find next Sunday
      const today = new Date();
      const resultDate = new Date(today);
      resultDate.setDate(today.getDate() + (7 - today.getDay()) % 7);
      deadline = resultDate.toISOString().split('T')[0];
    } else if (text.includes("monday")) {
      const today = new Date();
      const resultDate = new Date(today);
      resultDate.setDate(today.getDate() + (1 + 7 - today.getDay()) % 7);
      deadline = resultDate.toISOString().split('T')[0];
    } else if (text.includes("friday")) {
      const today = new Date();
      const resultDate = new Date(today);
      resultDate.setDate(today.getDate() + (5 + 7 - today.getDay()) % 7);
      deadline = resultDate.toISOString().split('T')[0];
    }

    return {
      title,
      deadline,
      estimatedHours,
      priority,
      category,
      confidence: 94,
      ambiguityScore: 2
    };
  },

  // Agent 2: Task Breakdown
  breakdownTask: (title: string, hours: number) => {
    const mins = hours * 60;
    const count = 5;
    const subtaskTitles = [
      `Research & background analysis for ${title}`,
      `Setup skeleton & draft core elements`,
      `Implement core details & functionality`,
      `Review, refactor, and self-test`,
      `Final polish, review constraints, and submit`
    ];

    const subtasks = subtaskTitles.map((t, idx) => {
      let difficulty: "Easy" | "Medium" | "Hard" = "Medium";
      if (idx === 0) difficulty = "Easy";
      if (idx === 2) difficulty = "Hard";
      if (idx === 4) difficulty = "Easy";

      return {
        title: t,
        durationMinutes: Math.round(mins / count),
        difficulty,
        order: idx + 1
      };
    });

    return { subtasks };
  },

  // Agent 3: Priority Engine & Decision Explainer
  evaluateTaskPriority: (title: string, deadline: string, hours: number, currentWorkloadHours: number, dependenciesCount: number) => {
    const diffTime = new Date(deadline).getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let priority: "Low" | "Medium" | "High" | "Critical" = "Medium";
    let confidenceScore = 90;
    
    if (diffDays <= 1) {
      priority = "Critical";
    } else if (diffDays <= 3) {
      priority = "High";
    } else if (diffDays > 7 && hours < 3) {
      priority = "Low";
    }

    let explanation = `Based on a deadline in ${diffDays} days and estimated effort of ${hours} hours.`;
    if (currentWorkloadHours > 8) {
      explanation += ` Workload is high (${currentWorkloadHours} hours active), raising priority to ensure completion.`;
    }
    if (dependenciesCount > 0) {
      explanation += ` Has ${dependenciesCount} dependent tasks which rely on this.`;
    }

    return {
      priority,
      confidenceScore,
      decisionMetrics: {
        daysRemaining: diffDays > 0 ? diffDays : 0,
        workloadConflictFactor: currentWorkloadHours > 10 ? 8 : 4,
        dependencyCount: dependenciesCount
      },
      explanation
    };
  },

  // Agent 4: Scheduler
  scheduleTask: (title: string, hours: number, deadline: string, dailyLimit: number) => {
    const diffTime = new Date(deadline).getTime() - Date.now();
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const schedule = [];

    const hoursPerDay = Math.min(dailyLimit, Math.ceil(hours / Math.min(diffDays, 4)));
    let remainingHours = hours;

    for (let i = 0; i < diffDays && remainingHours > 0; i++) {
      const dateStr = new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const hoursToday = Math.min(remainingHours, hoursPerDay);
      
      schedule.push({
        date: dateStr,
        durationHours: hoursToday,
        focusTopic: `Work block on ${title} (${hoursToday} hrs)`
      });
      remainingHours -= hoursToday;
    }

    return { schedule };
  },

  // Agent 5: Conflict Solver (Adaptive)
  solveConflicts: (tasks: any[]) => {
    // Collect all scheduled blocks and shift them to resolve overload
    const dates: Record<string, number> = {};
    tasks.forEach(t => {
      if (t.scheduleBlocks) {
        t.scheduleBlocks.forEach((b: any) => {
          dates[b.date] = (dates[b.date] || 0) + b.durationHours;
        });
      }
    });

    const conflicts = Object.entries(dates).filter(([_, h]) => h > 6);
    const hasConflict = conflicts.length > 0;

    let rebalanceExplanation = "No workload overload detected. Your timeline is balanced.";
    if (hasConflict) {
      rebalanceExplanation = `Detected overload on dates: ${conflicts.map(c => c[0]).join(', ')} exceeding 6 hours. I've rebalanced and shifted focus blocks to surrounding days to ensure sustainability and prevent burnout.`;
    }

    return {
      hasConflict,
      rebalancedSchedule: [],
      rebalanceExplanation
    };
  },

  // Agent 6: Deadline Rescue Agent
  generateRescuePlan: (title: string, subtasks: any[], remainingHours: number) => {
    const criticalSubtasks: string[] = [];
    const skippableSubtasks: string[] = [];

    subtasks.forEach((s, idx) => {
      // skip last details or polish if time is tight
      if (s.title.toLowerCase().includes("polish") || s.title.toLowerCase().includes("review") || idx === subtasks.length - 1) {
        skippableSubtasks.push(s.title);
      } else {
        criticalSubtasks.push(s.title);
      }
    });

    const riskPercentage = Math.min(95, Math.max(10, Math.round((criticalSubtasks.length * 1.5 / Math.max(1, remainingHours)) * 100)));

    return {
      riskPercentage,
      survivalStrategy: `You are in critical crunch mode for "${title}". Drop all non-essential styling, documentation, and review processes. Focus 100% on the core deliverables listed under the critical list. Work in uninterrupted 50-minute cycles.`,
      criticalSubtasks,
      skippableSubtasks
    };
  },

  // Agent 7: What-If Simulator
  runSimulation: (tasks: any[], action: string) => {
    let baseProb = 85;
    let skipProb = 52;
    let extraProb = 98;

    let currentOutcome = "High probability of meeting all deadlines. Timeline matches workload capacity.";
    let skipOutcome = "Critical warning! Skipping today's focus block pushes 4.5 hours of development onto the weekend, risking exam preparation.";
    let extraOutcome = "Excellent buffer created. You will clear the core project deliverables 18 hours before the deadline, allowing relaxed testing.";

    if (action.toLowerCase().includes("skip")) {
      baseProb = 85;
      skipProb = 48;
    }

    return {
      currentPlan: {
        probability: baseProb,
        outcome: currentOutcome
      },
      skipToday: {
        probability: skipProb,
        outcome: skipOutcome
      },
      workExtra: {
        probability: extraProb,
        outcome: extraOutcome
      }
    };
  },

  // Agent 8: Chat Coach & Insights
  getCoachAdvice: (query: string, tasksCount: number) => {
    const text = query.toLowerCase();
    let reply = "Hello! I am your AI Productivity Coach. Let's make sure we conquer your deadlines today.";
    const actionSuggestions = ["Start 25-minute Pomodoro", "Review timeline", "Apply scheduling rebalance"];

    if (text.includes("work") || text.includes("next") || text.includes("do")) {
      reply = `You should focus on your highest priority item. I suggest starting the first subtask on your list immediately. Let's block out 45 minutes of deep focus.`;
    } else if (text.includes("finish") || text.includes("time") || text.includes("probability")) {
      reply = `Your Mission Readiness is currently strong. As long as you stick to the generated focus blocks and complete today's tasks, you have a 91% chance of completing everything on schedule.`;
    } else if (text.includes("study") || text.includes("exam") || text.includes("plan") || text.includes("guide")) {
      reply = `I've mapped out a study outline for you. Split your material into conceptual chunks, spend 30 minutes on active recall, then schedule a 10-minute break.`;
    } else if (text.includes("priority") || text.includes("setting") || text.includes("explain")) {
      reply = `Your task priorities are dynamically calculated using target deadlines, workload overlap index, and dependency counts. Critical tags are applied automatically to prevent schedule conflicts.`;
    } else if (text.includes("skip") || text.includes("simulate") || text.includes("block")) {
      reply = `Skipping today's blocks will cause your overall Readiness Index score to fall and increase the workload strain on your remaining dates. Use Scenario B in the Timeline Simulator to audit the impact.`;
    }

    return {
      reply,
      actionSuggestions,
      weeklyBrief: {
        summary: `You have ${tasksCount} active tasks scheduled. Core focus is on completing early-stage research and development. Overall execution readiness is high.`,
        milestonesCount: Math.max(1, tasksCount),
        atRiskDeadlinesCount: 0,
        successProbability: 92,
        recommendations: [
          "Complete research blocks today to clear tomorrow's code slot.",
          "Maintain your 3-day habit streak for Coding.",
          "Take a scheduled break at 3 PM to avoid energy crash."
        ]
      }
    };
  }
};
