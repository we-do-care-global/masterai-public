-- We Do Care Global: AI Web Research & Expansion Platform Initial Schema
-- PostgreSQL / Supabase Migration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- 1. Profiles Table with Admin and Member Roles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  github_username TEXT,
  name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  repo_owner TEXT NOT NULL DEFAULT 'we-do-care-global',
  repo_name TEXT NOT NULL,
  repo_url TEXT NOT NULL,
  default_branch TEXT NOT NULL DEFAULT 'main',
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  research_focus TEXT[] DEFAULT ARRAY['systems', 'tools', 'functions', 'work', 'automation', 'UX', 'security'],
  daily_research_time TEXT DEFAULT '08:00',
  timezone TEXT DEFAULT 'Europe/Sarajevo',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. GitHub Connections Table
CREATE TABLE IF NOT EXISTS public.github_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  installation_id TEXT,
  access_token_encrypted TEXT NOT NULL,
  scopes TEXT[] DEFAULT ARRAY['repo', 'read:org', 'workflow'],
  connected_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Research Runs Table
CREATE TABLE IF NOT EXISTS public.research_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  trigger TEXT NOT NULL CHECK (trigger IN ('manual', 'daily_0800', 'evening_2000', 'cron')),
  query TEXT,
  depth TEXT DEFAULT 'standard' CHECK (depth IN ('quick', 'standard', 'deep')),
  focus_areas TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  model TEXT DEFAULT 'gemini-3.8-flash',
  sources_count INT DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  error TEXT
);

-- 5. Expansions Table
CREATE TABLE IF NOT EXISTS public.expansions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  research_run_id UUID REFERENCES public.research_runs(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  why_now TEXT NOT NULL,
  impact TEXT NOT NULL CHECK (impact IN ('High', 'Medium', 'Low')),
  effort TEXT NOT NULL CHECK (effort IN ('Low', 'Medium', 'High')),
  risk TEXT NOT NULL CHECK (risk IN ('Low', 'Medium', 'High')),
  systems_affected TEXT[] NOT NULL DEFAULT '{}',
  tools_affected TEXT[] NOT NULL DEFAULT '{}',
  functions_affected TEXT[] NOT NULL DEFAULT '{}',
  work_affected TEXT[] NOT NULL DEFAULT '{}',
  implementation_steps TEXT[] NOT NULL DEFAULT '{}',
  code_tasks TEXT[] NOT NULL DEFAULT '{}',
  github_issue_body TEXT NOT NULL,
  sources JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'proposed' CHECK (status IN ('proposed', 'accepted', 'rejected', 'archived')),
  priority TEXT DEFAULT 'high' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  github_issue_url TEXT,
  github_pr_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Roadmap Items Table
CREATE TABLE IF NOT EXISTS public.roadmap_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  expansion_id UUID REFERENCES public.expansions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planned' CHECK (status IN ('backlog', 'planned', 'in_progress', 'review', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  github_issue_url TEXT,
  github_pr_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Sync Jobs Table
CREATE TABLE IF NOT EXISTS public.sync_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('all', 'repos', 'issues', 'prs', 'commits', 'actions', 'pages', 'releases')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  error TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 8. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, key)
);

-- 10. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_expansions_project ON public.expansions(project_id);
CREATE INDEX IF NOT EXISTS idx_expansions_status ON public.expansions(status);
CREATE INDEX IF NOT EXISTS idx_roadmap_status ON public.roadmap_items(status);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expansions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Standard RLS Policies: Authenticated users can read workspace data; Admins can create/manage projects
CREATE POLICY "Allow authenticated read on projects" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin insert on projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Allow admin update on projects" ON public.projects FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Allow authenticated read on expansions" ON public.expansions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated all on expansions" ON public.expansions FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated read on roadmap" ON public.roadmap_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated all on roadmap" ON public.roadmap_items FOR ALL TO authenticated USING (true);

-- pg_cron Daily 08:00 & 20:00 schedule definition (Europe/Sarajevo ~ UTC+1/UTC+2)
-- SELECT cron.schedule('daily-expansion-0800', '0 6 * * *', 'SELECT net.http_post(url:=''https://<PROJECT-REF>.functions.supabase.co/daily-research'', headers:=''{"Content-Type": "application/json"}''::jsonb, body:=''{"type": "08:00"}''::jsonb);');
-- SELECT cron.schedule('evening-expansion-2000', '0 18 * * *', 'SELECT net.http_post(url:=''https://<PROJECT-REF>.functions.supabase.co/daily-research'', headers:=''{"Content-Type": "application/json"}''::jsonb, body:=''{"type": "20:00"}''::jsonb);');
