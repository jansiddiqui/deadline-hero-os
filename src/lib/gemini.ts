import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini client helper
function callGemini(systemPrompt: string, promptContent: string, customApiKey?: string): Promise<string> {
  const key = customApiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_KEY_MISSING");
  }
  const genAI = new GoogleGenerativeAI(key);
  const modelName = "gemini-2.0-flash";
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: systemPrompt,
  });

  return model.generateContent({
    contents: [{ role: "user", parts: [{ text: promptContent }] }],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  }).then(res => res.response.text());
}

async function callOpenRouter(systemPrompt: string, promptContent: string, customApiKey?: string): Promise<string> {
  const key = customApiKey || process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  if (!key) {
    throw new Error("OPENROUTER_KEY_MISSING");
  }

  const model = "google/gemini-2.0-flash-exp:free";
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://deadlinehero.ai",
      "X-Title": "Deadline Hero AI"
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: promptContent }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter HTTP ${response.status}: ${errorText}`);
  }

  const json = await response.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("EMPTY_OPENROUTER_RESPONSE");
  }
  return content;
}

async function callGroq(systemPrompt: string, promptContent: string, customApiKey?: string): Promise<string> {
  const key = customApiKey || process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;
  if (!key) {
    throw new Error("GROQ_KEY_MISSING");
  }

  const model = "llama-3.3-70b-versatile";
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: promptContent }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq HTTP ${response.status}: ${errorText}`);
  }

  const json = await response.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("EMPTY_GROQ_RESPONSE");
  }
  return content;
}

// System prompts for each agent in the Registry
const SYSTEM_PROMPTS = {
  taskAnalyzer: `You are the Task Analyzer Agent.
Goal: Deconstruct user input to extract structured task information.
Success Criteria: Accurately isolate title, deadline description, estimated effort hours, urgency, and category.
Output format must be a single JSON object matching this schema:
{
  "title": string,
  "deadline": string (ISO date string or human readable date like "2026-06-30"),
  "estimatedHours": number,
  "priority": "Low" | "Medium" | "High" | "Critical",
  "category": "Academic" | "Career" | "Business" | "Health" | "Personal",
  "confidence": number (0-100),
  "ambiguityScore": number (1-10)
}`,

  taskBreakdown: `You are the Task Breakdown Agent.
Goal: Break down a parent task into detailed, logical, ordered subtasks.
Success Criteria: Subtasks should be actionable, sequence-ordered, and the sum of their minutes should align with the estimated hours.
Output format must be a single JSON object containing a "subtasks" array matching this schema:
{
  "subtasks": [
    {
      "title": string,
      "durationMinutes": number,
      "difficulty": "Easy" | "Medium" | "Hard",
      "order": number (1-indexed sequence)
    }
  ]
}`,

  priorityEngine: `You are the Priority Engine & Decision Explainer.
Goal: Determine task priority levels and explain the decision transparently.
Success Criteria: Priority must reflect deadline proximity, workload, and dependencies. Explanation must list key logical factors.
Output format must be a JSON object matching this schema:
{
  "priority": "Low" | "Medium" | "High" | "Critical",
  "confidenceScore": number,
  "decisionMetrics": {
    "daysRemaining": number,
    "workloadConflictFactor": number (1-10),
    "dependencyCount": number
  },
  "explanation": string (A concise 1-2 sentence justification for the decision)
}`,

  scheduler: `You are the AI Scheduler Agent.
Goal: Allocate focus sessions across available days, avoiding overload and matching user memory preferences.
Success Criteria: Creates logical work blocks across dates.
Output format must be a JSON object containing a "schedule" array matching this schema:
{
  "schedule": [
    {
      "date": string (YYYY-MM-DD),
      "durationHours": number,
      "focusTopic": string
    }
  ]
}`,

  conflictSolver: `You are the Conflict Solver & Rebalancing Agent.
Goal: Detect schedule overlaps (e.g. exams vs project deadlines) and recommend rebalanced hours.
Success Criteria: Relocates hours to avoid peaks and resolves high-risk dates.
Output format must be a JSON object matching this schema:
{
  "hasConflict": boolean,
  "rebalancedSchedule": [
    {
      "date": string (YYYY-MM-DD),
      "durationHours": number,
      "focusTopic": string
    }
  ],
  "rebalanceExplanation": string
}`,

  rescueAgent: `You are the Deadline Rescue Agent.
Goal: Generate a high-velocity survival plan for a crunch-time deadline (< 48 hours remaining).
Success Criteria: Identifies critical items to finish, low-value items that can be skipped, and risk probability.
Output format must be a JSON object matching this schema:
{
  "riskPercentage": number (0-100),
  "survivalStrategy": string (A speedrun paragraph),
  "criticalSubtasks": string[] (Titles of subtasks that MUST be completed),
  "skippableSubtasks": string[] (Titles of subtasks that are safe to skip/omit to meet deadline)
}`,

  whatIfSimulator: `You are the What-If Simulator Engine.
Goal: Calculate how hypothetical user decisions impact their completion probability.
Success Criteria: Returns accurate percentage outcomes and explanations for Current, Skip, and Extra options.
Output format must be a JSON object matching this schema:
{
  "currentPlan": {
    "probability": number (0-100),
    "outcome": string
  },
  "skipToday": {
    "probability": number (0-100),
    "outcome": string
  },
  "workExtra": {
    "probability": number (0-100),
    "outcome": string
  }
}`,

  coachAndInsights: `You are the Productivity Coach & Executive Brief Builder.
Goal: Answer productivity queries using the user's historical performance memory and generate weekly briefs.
Success Criteria: Recommendations should reference learned preferences (coding speed, peak hours) and remain highly action-oriented.
Output format must be a JSON object matching this schema:
{
  "reply": string,
  "actionSuggestions": string[],
  "weeklyBrief": {
    "summary": string,
    "milestonesCount": number,
    "atRiskDeadlinesCount": number,
    "successProbability": number (0-100),
    "recommendations": string[]
  }
}`
};

// Main execution helper calling Gemini, Groq, or OpenRouter with fallback routing
async function callAgent(
  agentName: keyof typeof SYSTEM_PROMPTS,
  promptContent: string,
  customApiKey?: string,
  provider: string = "gemini"
): Promise<any> {
  const systemPrompt = SYSTEM_PROMPTS[agentName];
  
  // Establish failover order starting with requested provider
  const providersQueue = [provider];
  const allProviders = ["gemini", "groq", "openrouter"];
  for (const p of allProviders) {
    if (!providersQueue.includes(p)) {
      providersQueue.push(p);
    }
  }

  const errors: string[] = [];

  for (const p of providersQueue) {
    const start = Date.now();
    try {
      let rawResponseText = "";
      let resolvedModel = "";
      let providerLabel = "";

      if (p === "gemini") {
        resolvedModel = "gemini-2.0-flash";
        providerLabel = "Google Gemini";
        rawResponseText = await callGemini(systemPrompt, promptContent, customApiKey);
      } else if (p === "groq") {
        resolvedModel = "llama-3.3-70b-versatile";
        providerLabel = "Groq Cloud";
        rawResponseText = await callGroq(systemPrompt, promptContent, customApiKey);
      } else if (p === "openrouter") {
        resolvedModel = "google/gemini-2.0-flash-exp:free";
        providerLabel = "OpenRouter";
        rawResponseText = await callOpenRouter(systemPrompt, promptContent, customApiKey);
      } else {
        throw new Error(`Unknown provider: ${p}`);
      }

      const elapsed = Date.now() - start;
      const parsedData = JSON.parse(rawResponseText);

      return {
        data: parsedData,
        metadata: {
          provider: providerLabel,
          model: resolvedModel,
          timestamp: new Date().toISOString(),
          confidence: parsedData.confidence || parsedData.confidenceScore || 94,
          processingTimeMs: elapsed,
          reasoningSummary: parsedData.explanation || `Agent ${agentName} executed instructions via ${providerLabel}.`
        }
      };
    } catch (err: any) {
      console.warn(`Failover: Provider '${p}' failed for agent '${agentName}'. Error: ${err.message}`);
      errors.push(`${p}: ${err.message}`);
    }
  }

  throw new Error(`All AI providers failed. Errors: [${errors.join(" | ")}]`);
}

export const GeminiAgentAPI = {
  // Agent 1
  analyzeTask: async (command: string, customApiKey?: string, provider: string = "gemini") => {
    return callAgent(
      "taskAnalyzer",
      `Parse this task command: "${command}". Today's date is: ${new Date().toISOString().split('T')[0]}`,
      customApiKey,
      provider
    );
  },

  // Agent 2
  breakdownTask: async (title: string, description: string, hours: number, customApiKey?: string, provider: string = "gemini") => {
    return callAgent(
      "taskBreakdown",
      `Break down this task: Title: "${title}", Description: "${description}", Total Duration: ${hours} hours. Generate at least 5 structured steps.`,
      customApiKey,
      provider
    );
  },

  // Agent 3
  evaluateTaskPriority: async (
    title: string,
    deadline: string,
    hours: number,
    currentWorkloadHours: number,
    dependenciesCount: number,
    customApiKey?: string,
    provider: string = "gemini"
  ) => {
    return callAgent(
      "priorityEngine",
      `Task Title: "${title}", Deadline: "${deadline}", Effort Required: ${hours} hours.
       Current user workload: ${currentWorkloadHours} hours already scheduled.
       Dependencies: ${dependenciesCount} tasks depending on this.
       Calculate priority level and explain reasoning. Today's date is ${new Date().toISOString().split('T')[0]}`,
      customApiKey,
      provider
    );
  },

  // Agent 4
  scheduleTask: async (
    title: string,
    hours: number,
    deadline: string,
    preferredFocusHours: number,
    customApiKey?: string,
    provider: string = "gemini"
  ) => {
    return callAgent(
      "scheduler",
      `Schedule this task blocks: Title: "${title}", Effort: ${hours} hours, Deadline: "${deadline}".
       User preferred daily hours limit: ${preferredFocusHours} hours.
       Provide day-by-day task session allocations. Today is ${new Date().toISOString().split('T')[0]}`,
      customApiKey,
      provider
    );
  },

  // Agent 5
  solveConflicts: async (
    tasksJson: string,
    eventsJson: string,
    customApiKey?: string,
    provider: string = "gemini"
  ) => {
    return callAgent(
      "conflictSolver",
      `Analyze these tasks: ${tasksJson} and busy calendar events: ${eventsJson}.
       Identify conflicts and return a rebalanced workload schedule. Today is ${new Date().toISOString().split('T')[0]}`,
      customApiKey,
      provider
    );
  },

  // Agent 6
  generateRescuePlan: async (
    title: string,
    subtasksJson: string,
    remainingHours: number,
    customApiKey?: string,
    provider: string = "gemini"
  ) => {
    return callAgent(
      "rescueAgent",
      `CRUNCH TIME: Task "${title}" is due in less than 48 hours.
       There are ${remainingHours} hours left.
       Subtasks: ${subtasksJson}.
       Provide a recovery plan with skippable items.`,
      customApiKey,
      provider
    );
  },

  // Agent 7
  runSimulation: async (
    tasksJson: string,
    action: string,
    customApiKey?: string,
    provider: string = "gemini"
  ) => {
    return callAgent(
      "whatIfSimulator",
      `Database state of tasks: ${tasksJson}.
       Simulate what happens if the user does: "${action}".`,
      customApiKey,
      provider
    );
  },

  // Agent 8
  getCoachAdvice: async (
    query: string,
    tasksJson: string,
    memoryJson: string,
    customApiKey?: string,
    provider: string = "gemini"
  ) => {
    return callAgent(
      "coachAndInsights",
      `User Query: "${query}".
       Active Tasks Status: ${tasksJson}.
       Learned User Memory: ${memoryJson}.
       Respond as the Coach. Also include weeklyBrief summary block. Today is ${new Date().toISOString().split('T')[0]}`,
      customApiKey,
      provider
    );
  }
};
