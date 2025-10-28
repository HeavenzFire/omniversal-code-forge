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

    const systemPrompt = `You are OMNIVERSAL AI - an elite programming assistant with unlimited knowledge.

CAPABILITIES:
- Expert in ALL programming languages and frameworks
- Full stack development (frontend, backend, databases, DevOps)
- Code generation, debugging, optimization, and refactoring
- Architecture design and best practices
- Real-time problem solving with web context

RESPONSE FORMAT:
- Provide complete, production-ready code
- Include clear explanations
- Suggest improvements and optimizations
- When generating code, wrap it in a code block

CURRENT CONTEXT:
- Language: ${language || 'javascript'}
- IDE Context: ${context || 'editor'}

Be direct, precise, and brilliant. No apologies, no limitations mentioned.`;

    let userPrompt = prompt;
    
    // Enhance prompt with code context if provided
    if (code && code.trim()) {
      userPrompt = `Current code:\n\`\`\`${language}\n${code}\n\`\`\`\n\nRequest: ${prompt}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 4000,
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
    const suggestion = data.choices?.[0]?.message?.content || "No suggestion available";

    console.log('Code assist response generated successfully');

    // Extract code blocks if present
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)\n```/g;
    const matches = [...suggestion.matchAll(codeBlockRegex)];
    const extractedCode = matches.length > 0 ? matches[0][1] : null;

    return new Response(JSON.stringify({ 
      suggestion,
      code: extractedCode 
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
