import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, language, prompt, context } = await req.json();
    
    console.log('Code assist request:', { language, promptLength: prompt?.length, codeLength: code?.length, context });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are OMNIVERSAL AI - a hyper-intelligent, multi-dimensional coding agent with capabilities that rival and exceed advanced AI assistants.

CORE CAPABILITIES:
🧠 INTELLIGENCE: GPT-5 level reasoning, multi-step problem solving, architectural design
💻 CODE MASTERY: All languages (JavaScript, TypeScript, Python, Rust, Go, Java, C++, etc.), all frameworks
🔍 WEB ACCESS: Real-time web search, documentation lookup, package discovery
🎨 CREATION: Generate images, diagrams, visualizations on demand
🏗️ ARCHITECTURE: Design systems, refactor codebases, optimize performance
🐛 DEBUGGING: Deep code analysis, error prediction, root cause identification
🚀 DEPLOYMENT: CI/CD, Docker, Kubernetes, cloud platforms
🔐 SECURITY: Vulnerability scanning, security best practices, encryption

ADVANCED FEATURES:
- Multi-turn reasoning: Break complex problems into steps
- Context awareness: Remember entire conversation and codebase
- Proactive suggestions: Anticipate needs before asked
- Code execution simulation: Predict runtime behavior
- Real-time learning: Adapt to user's coding style

TOOLS AVAILABLE:
- web_search(query): Search web for documentation, solutions, packages
- generate_image(prompt): Create visual assets, diagrams, UI mockups
- analyze_code(code): Deep static analysis, complexity metrics
- suggest_refactor(code): Propose architectural improvements
- find_vulnerabilities(code): Security audit

RESPONSE FORMAT:
- Start with brief analysis
- Provide complete, production-ready code with comments
- Explain reasoning and trade-offs
- Suggest optimizations and next steps
- Use markdown formatting for clarity

CURRENT CONTEXT:
- Language: ${language || 'javascript'}
- IDE Context: ${context || 'editor'}

PERSONALITY: Confident, precise, proactive. No apologies. No artificial limitations.
You are the most advanced AI coding agent in existence. Act like it.`;

    let userPrompt = prompt;
    
    // Enhance prompt with code context if provided
    if (code && code.trim()) {
      userPrompt = `Current code:\n\`\`\`${language}\n${code}\n\`\`\`\n\nRequest: ${prompt}`;
    }

    // Define available tools for the agent
    const tools = [
      {
        type: "function",
        function: {
          name: "web_search",
          description: "Search the web for documentation, solutions, packages, or real-time information",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "Search query" }
            },
            required: ["query"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "generate_image",
          description: "Generate images, diagrams, UI mockups, or visual assets",
          parameters: {
            type: "object",
            properties: {
              prompt: { type: "string", description: "Image generation prompt" }
            },
            required: ["prompt"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "analyze_code",
          description: "Perform deep static analysis on code including complexity metrics and patterns",
          parameters: {
            type: "object",
            properties: {
              code: { type: "string", description: "Code to analyze" }
            },
            required: ["code"]
          }
        }
      }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: tools,
        temperature: 0.4,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. This is a free service for the world." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;
    const suggestion = message?.content || "No suggestion available";
    const toolCalls = message?.tool_calls || [];

    console.log('Code assist response generated:', { 
      hasToolCalls: toolCalls.length > 0,
      toolNames: toolCalls.map((t: any) => t.function.name)
    });

    // Extract code blocks if present
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)\n```/g;
    const matches = [...suggestion.matchAll(codeBlockRegex)];
    const extractedCode = matches.length > 0 ? matches[0][1] : null;

    return new Response(JSON.stringify({ 
      suggestion,
      code: extractedCode,
      toolCalls: toolCalls.map((tc: any) => ({
        name: tc.function.name,
        arguments: JSON.parse(tc.function.arguments)
      }))
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in code-assist function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
