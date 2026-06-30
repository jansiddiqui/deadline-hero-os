import { NextResponse } from "next/server";
import { GeminiAgentAPI } from "@/lib/gemini";
import { MockAgentAPI } from "@/lib/mockData";

export async function GET() {
  return NextResponse.json({
    gemini: !!(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY),
    openrouter: !!(process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY),
    groq: !!(process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY)
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const headers = req.headers;
    const customApiKey = headers.get("x-api-key") || undefined;
    const aiProvider = headers.get("x-ai-provider") || "gemini";

    const { agent, ...params } = body;

    // Check if we have API keys configured
    const hasKey = !!customApiKey || 
                   !!process.env.GEMINI_API_KEY || !!process.env.NEXT_PUBLIC_GEMINI_API_KEY || 
                   !!process.env.OPENROUTER_API_KEY || !!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ||
                   !!process.env.GROQ_API_KEY || !!process.env.NEXT_PUBLIC_GROQ_API_KEY;

    if (!hasKey) {
      // Return simulated mock response immediately wrapped in metadata
      const mockResult = getMockResponse(agent, params) as any;
      return NextResponse.json({
        success: true,
        source: "mock",
        metadata: {
          provider: "Local Sandbox Engine",
          model: "Simulation Autopilot",
          timestamp: new Date().toISOString(),
          confidence: mockResult.confidence || mockResult.confidenceScore || 92,
          processingTimeMs: 80,
          reasoningSummary: mockResult.explanation || `Agent ${agent} running in sandbox mode.`
        },
        data: mockResult
      });
    }

    try {
      const result = await runGeminiAgent(agent, params, customApiKey, aiProvider);
      
      const finalProvider = result.metadata?.provider || aiProvider;
      let mappedSource = "mock";
      if (finalProvider.toLowerCase().includes("gemini")) mappedSource = "gemini";
      else if (finalProvider.toLowerCase().includes("groq")) mappedSource = "groq";
      else if (finalProvider.toLowerCase().includes("openrouter")) mappedSource = "openrouter";

      return NextResponse.json({
        success: true,
        source: mappedSource,
        metadata: result.metadata,
        data: result.data
      });
    } catch (err: any) {
      console.error(`Gemini/OpenRouter Agent API error (${agent}):`, err);
      // Fallback to mock on any real API error (rate limits, key issues, etc.)
      const mockResult = getMockResponse(agent, params) as any;
      return NextResponse.json({
        success: true,
        source: "mock-fallback",
        error: err.message,
        metadata: {
          provider: "Local Sandbox Fallback",
          model: "Rule-Based Mock Engine",
          timestamp: new Date().toISOString(),
          confidence: mockResult.confidence || mockResult.confidenceScore || 90,
          processingTimeMs: 120,
          reasoningSummary: mockResult.explanation || `Transient connection issue with provider: ${err.message}. Sandbox fallback active.`
        },
        data: mockResult
      });
    }
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

async function runGeminiAgent(agent: string, params: any, customApiKey?: string, provider: string = "gemini") {
  switch (agent) {
    case "taskAnalyzer":
      return await GeminiAgentAPI.analyzeTask(params.command, customApiKey, provider);
    case "taskBreakdown":
      return await GeminiAgentAPI.breakdownTask(params.title, params.description || "", params.hours, customApiKey, provider);
    case "priorityEngine":
      return await GeminiAgentAPI.evaluateTaskPriority(
        params.title,
        params.deadline,
        params.hours,
        params.currentWorkload || 0,
        params.dependenciesCount || 0,
        customApiKey,
        provider
      );
    case "scheduler":
      return await GeminiAgentAPI.scheduleTask(
        params.title,
        params.hours,
        params.deadline,
        params.preferredFocusHours || 4,
        customApiKey,
        provider
      );
    case "conflictSolver":
      return await GeminiAgentAPI.solveConflicts(
        JSON.stringify(params.tasks),
        JSON.stringify(params.events || []),
        customApiKey,
        provider
      );
    case "rescueAgent":
      return await GeminiAgentAPI.generateRescuePlan(
        params.title,
        JSON.stringify(params.subtasks),
        params.remainingHours,
        customApiKey,
        provider
      );
    case "whatIfSimulator":
      return await GeminiAgentAPI.runSimulation(
        JSON.stringify(params.tasks),
        params.action,
        customApiKey,
        provider
      );
    case "coachAndInsights":
      return await GeminiAgentAPI.getCoachAdvice(
        params.query,
        JSON.stringify(params.tasks),
        JSON.stringify(params.memory),
        customApiKey,
        provider
      );
    default:
      throw new Error(`Unknown agent: ${agent}`);
  }
}

function getMockResponse(agent: string, params: any) {
  switch (agent) {
    case "taskAnalyzer":
      return MockAgentAPI.analyzeTask(params.command);
    case "taskBreakdown":
      return MockAgentAPI.breakdownTask(params.title, params.hours);
    case "priorityEngine":
      return MockAgentAPI.evaluateTaskPriority(
        params.title,
        params.deadline,
        params.hours,
        params.currentWorkload || 0,
        params.dependenciesCount || 0
      );
    case "scheduler":
      return MockAgentAPI.scheduleTask(
        params.title,
        params.hours,
        params.deadline,
        params.preferredFocusHours || 4
      );
    case "conflictSolver":
      return MockAgentAPI.solveConflicts(params.tasks);
    case "rescueAgent":
      return MockAgentAPI.generateRescuePlan(
        params.title,
        params.subtasks || [],
        params.remainingHours
      );
    case "whatIfSimulator":
      return MockAgentAPI.runSimulation(params.tasks, params.action);
    case "coachAndInsights":
      return MockAgentAPI.getCoachAdvice(
        params.query,
        params.tasks ? params.tasks.length : 0
      );
    default:
      return { message: "Mock response fallback" };
  }
}
