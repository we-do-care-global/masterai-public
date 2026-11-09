// Supabase Edge Function: daily-research (Cron-triggered at 08:00 & 20:00 Europe/Sarajevo)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const geminiKey = Deno.env.get('GEMINI_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const body = await req.json().catch(() => ({}));
    const runType = body.type || '08:00';

    // Fetch active projects
    const { data: projects } = await supabase.from('projects').select('*').eq('is_active', true);
    if (!projects || projects.length === 0) {
      return new Response(JSON.stringify({ message: 'No active projects' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const addedExpansions = [];

    for (const project of projects) {
      const today = new Date().toISOString().split('T')[0];
      const idempotencyKey = `${today}-${project.id}-${runType}`;

      // Check if already executed today
      const { data: existing } = await supabase
        .from('audit_logs')
        .select('id')
        .eq('action', `CRON_${runType.replace(':', '')}_AUTO_EXPANSION`)
        .contains('metadata', { idempotencyKey })
        .limit(1);

      if (existing && existing.length > 0) {
        continue;
      }

      const prompt = `You are the We Do Care Global continuous improvement researcher.
Given the project context (${project.name}, ${project.repo_owner}/${project.repo_name}), search the web for exactly 1 best new expansion to improve systems, tools, functions, and work for today.
Focus on systems, tools, functions, work, UX, security, performance, automation, and monetization.
Return valid JSON only: { "expansions": [ { "title": "...", "summary": "...", "why_now": "...", "impact": "High"|"Medium"|"Low", "effort": "Low"|"Medium"|"High", "risk": "Low"|"Medium"|"High", "priority": "high", "systems_affected": [...], "tools_affected": [...], "functions_affected": [...], "work_affected": [...], "implementation_steps": [...], "code_tasks": [...], "github_issue_body": "...", "sources": [{ "title": "...", "url": "..." }] } ] }`;

      const resp = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] },
      });

      const parsed = JSON.parse(resp.text?.replace(/```json\s*|```/g, '') || '{}');
      const item = parsed.expansions?.[0];

      if (item) {
        const { data: inserted } = await supabase.from('expansions').insert({
          project_id: project.id,
          title: item.title,
          summary: item.summary,
          why_now: item.why_now,
          impact: item.impact || 'High',
          effort: item.effort || 'Medium',
          risk: item.risk || 'Low',
          systems_affected: item.systems_affected || [],
          tools_affected: item.tools_affected || [],
          functions_affected: item.functions_affected || [],
          work_affected: item.work_affected || [],
          implementation_steps: item.implementation_steps || [],
          code_tasks: item.code_tasks || [],
          github_issue_body: item.github_issue_body || item.summary,
          sources: item.sources || [],
          status: 'proposed',
          priority: item.priority || 'high',
        }).select().single();

        await supabase.from('audit_logs').insert({
          action: `CRON_${runType.replace(':', '')}_AUTO_EXPANSION`,
          entity: 'expansion',
          entity_id: inserted.id,
          metadata: { idempotencyKey, project_id: project.id, type: runType },
        });

        addedExpansions.push(inserted);
      }
    }

    return new Response(JSON.stringify({ success: true, count: addedExpansions.length, expansions: addedExpansions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
