// Supabase Edge Function: run-research
// Deno runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenAI } from "npm:@google/genai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { projectId, projectName, projectDescription, repoOwner, repoName, query, depth, focusAreas } = await req.json();
    const apiKey = Deno.env.get('GEMINI_API_KEY');

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are the We Do Care Global continuous improvement researcher.
Given the project context (${projectName}, ${repoOwner}/${repoName}), search the web for new expansions to improve systems, tools, functions, and work.
Focus on: ${(focusAreas || []).join(', ') || 'systems, tools, functions, work, automation, UX, security'}.
Depth: ${depth || 'standard'}.
Return JSON only: { "expansions": [ { "title": "...", "summary": "...", "why_now": "...", "impact": "High"|"Medium"|"Low", "effort": "Low"|"Medium"|"High", "risk": "Low"|"Medium"|"High", "priority": "high", "systems_affected": [...], "tools_affected": [...], "functions_affected": [...], "work_affected": [...], "implementation_steps": [...], "code_tasks": [...], "github_issue_body": "...", "sources": [{ "title": "...", "url": "..." }] } ] }`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || '{}';
    return new Response(text, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
