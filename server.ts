/**
 * Full-Stack Express Server for We Do Care Global AI Web Research & Expansion Platform
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { db } from './server/db';
import { runAIWebResearch } from './server/geminiResearcher';
import { syncService } from './server/syncService';
import { cronManager } from './server/cronManager';
import { workerPool } from './server/workerPool';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { isDisabledApiPath } from './server/apiAccessGate';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

// Ultra-low RAM & zero-delay latency response compression
app.use(compression({ level: 6, threshold: 512 }));
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Response caching headers for near-zero delay latency
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Cache-Control', 'no-cache, private');
  next();
});

// SECURITY: No verified identity provider/session middleware exists yet.
// Fail closed for all API and auth endpoints instead of exposing seeded data,
// accepting caller-supplied identities, or permitting unauthenticated writes.
// Static frontend assets remain available, but the API is intentionally offline.
app.use((req: Request, res: Response, next) => {
  if (isDisabledApiPath(req.path)) {
    return res.status(503).json({ error: 'API disabled until verified authentication and authorization are implemented' });
  }
  next();
});

// -------------------------------------------------------------------------
// Authentication & User Profile
// -------------------------------------------------------------------------
app.all(['/auth/github', '/api/auth/github'], (req: Request, res: Response) => {
  const { code, mockUser } = req.body;
  // Authenticate user
  if (mockUser) {
    db.user = {
      ...db.user,
      ...mockUser,
      connected_at: new Date().toISOString(),
    };
  }
  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    user_id: db.user.id,
    action: 'USER_GITHUB_LOGIN',
    entity: 'user',
    entity_id: db.user.id,
    metadata: { username: db.user.github_username },
    created_at: new Date().toISOString(),
  });
  res.json({
    success: true,
    user: db.user,
    token: 'wdc_gh_oauth_session_token_' + Date.now(),
  });
});

// Google Login strictly restricted to demo.admin@example.invalid
app.post(['/auth/google', '/api/auth/google'], (req: Request, res: Response) => {
  const { email, name, avatarUrl } = req.body;
  const normalizedEmail = (email || '').trim().toLowerCase();

  // Strict whitelist authorization check
  if (normalizedEmail !== 'demo.admin@example.invalid') {
    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      user_id: 'unauthorized-user',
      action: 'GOOGLE_LOGIN_DENIED',
      entity: 'auth',
      entity_id: normalizedEmail || 'unknown',
      metadata: { attemptedEmail: normalizedEmail },
      created_at: new Date().toISOString(),
    });
    return res.status(403).json({
      error: `Access Denied: Google Login is restricted exclusively to authorized email (demo.admin@example.invalid). "${normalizedEmail || 'Provided account'}" is not authorized.`,
    });
  }

  // Find or create profile for demo.admin@example.invalid
  let profile = db.profiles.find(p => p.email.toLowerCase() === 'demo.admin@example.invalid');
  if (!profile) {
    profile = {
      id: 'user-emir-google',
      email: 'demo.admin@example.invalid',
      github_username: 'demo-admin',
      name: name || 'Demo Admin',
      avatar_url: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'admin',
      auth_provider: 'google',
      connected_at: new Date().toISOString(),
    };
    db.profiles.unshift(profile);
  } else {
    profile.role = 'admin'; // Always grant Admin to demo.admin@example.invalid
    profile.auth_provider = 'google';
    if (name) profile.name = name;
    if (avatarUrl) profile.avatar_url = avatarUrl;
  }

  db.user = { ...profile };

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    user_id: db.user.id,
    action: 'USER_GOOGLE_LOGIN_SUCCESS',
    entity: 'user',
    entity_id: db.user.id,
    metadata: { email: normalizedEmail, role: 'admin' },
    created_at: new Date().toISOString(),
  });

  workerPool.recordTask(1, 'Google Login authenticated: demo.admin@example.invalid');

  res.json({
    success: true,
    user: db.user,
    token: 'wdc_google_session_token_' + Date.now(),
  });
});

app.get(['/auth/session', '/api/auth/session'], (_req: Request, res: Response) => {
  res.json({
    authenticated: true,
    user: db.user,
  });
});

app.post(['/auth/role', '/api/auth/role'], (req: Request, res: Response) => {
  const { role, userId } = req.body;
  const newRole = role === 'admin' ? 'admin' : 'member';
  const targetId = userId || db.user.id;

  // Update in profiles table
  const profile = db.profiles.find(p => p.id === targetId);
  if (profile) {
    profile.role = newRole;
  }
  if (db.user.id === targetId) {
    db.user.role = newRole;
  }

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    user_id: db.user.id,
    action: 'USER_ROLE_SWITCH',
    entity: 'profiles',
    entity_id: targetId,
    metadata: { newRole },
    created_at: new Date().toISOString(),
  });

  res.json({
    success: true,
    user: db.user,
    profiles: db.profiles,
  });
});

// Profiles Table CRUD
app.get(['/profiles', '/api/profiles'], (_req: Request, res: Response) => {
  res.json({ profiles: db.profiles, activeUser: db.user });
});

app.patch(['/profiles/:id/role', '/api/profiles/:id/role'], (req: Request, res: Response) => {
  const { role } = req.body;
  const newRole = role === 'admin' ? 'admin' : 'member';
  const profile = db.profiles.find(p => p.id === req.params.id);

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  profile.role = newRole;
  if (db.user.id === profile.id) {
    db.user.role = newRole;
  }

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    user_id: db.user.id,
    action: 'PROFILE_ROLE_UPDATED',
    entity: 'profiles',
    entity_id: profile.id,
    metadata: { updatedRole: newRole, profileName: profile.name },
    created_at: new Date().toISOString(),
  });

  res.json({ success: true, profile, profiles: db.profiles, activeUser: db.user });
});

app.post(['/profiles/switch-active', '/api/profiles/switch-active'], (req: Request, res: Response) => {
  const { profileId } = req.body;
  const target = db.profiles.find(p => p.id === profileId);
  if (!target) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  db.user = { ...target };

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    user_id: db.user.id,
    action: 'USER_SWITCHED_ACTIVE_PROFILE',
    entity: 'profiles',
    entity_id: target.id,
    metadata: { name: target.name, role: target.role },
    created_at: new Date().toISOString(),
  });

  res.json({ success: true, activeUser: db.user });
});

// -------------------------------------------------------------------------
// Projects Management
// -------------------------------------------------------------------------
app.get(['/projects', '/api/projects'], (_req: Request, res: Response) => {
  res.json({ projects: db.projects });
});

app.post(['/projects', '/api/projects'], (req: Request, res: Response) => {
  // Permission check: Member role restricted from creating projects
  if (db.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden: Member role does not have permission to create projects. Admin role required.',
    });
  }

  const {
    name,
    description,
    repo_owner,
    repo_name,
    default_branch = 'main',
    visibility = 'public',
    research_focus = ['systems', 'tools', 'functions', 'work', 'automation'],
    daily_research_time = '08:00',
    timezone = 'Europe/Sarajevo',
  } = req.body;

  if (!name || !repo_name) {
    return res.status(400).json({ error: 'Name and repo_name are required' });
  }

  const newProject = {
    id: `proj-${Date.now()}`,
    owner_id: db.user.id,
    name,
    description: description || 'New humanitarian & community expansion project.',
    repo_owner: repo_owner || 'we-do-care-global',
    repo_name,
    repo_url: `https://github.com/${repo_owner || 'we-do-care-global'}/${repo_name}`,
    default_branch,
    visibility: visibility as 'public' | 'private',
    research_focus,
    daily_research_time,
    timezone,
    is_active: true,
    open_issues_count: 0,
    open_prs_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.projects.unshift(newProject);

  // Initialize sync state for new repo
  db.githubSyncData[newProject.id] = {
    owner: newProject.repo_owner,
    repo: newProject.repo_name,
    defaultBranch: default_branch,
    branches: [default_branch],
    commits: [
      {
        sha: 'init01a',
        message: 'Initial project setup & scaffolding',
        author: db.user.github_username,
        date: new Date().toISOString(),
        url: `${newProject.repo_url}/commit/init01a`,
      }
    ],
    issues: [],
    pullRequests: [],
    workflows: [],
    pages: { status: 'built', page_url: `https://${newProject.repo_owner}.github.io/${newProject.repo_name}/`, updated_at: new Date().toISOString() },
    releases: [],
    labels: [
      { id: `lbl-${Date.now()}-1`, name: 'ai-expansion', color: '#6366f1', description: 'Generated proposals from AI web research' },
      { id: `lbl-${Date.now()}-2`, name: 'enhancement', color: '#a21caf', description: 'New feature or improvement' },
      { id: `lbl-${Date.now()}-3`, name: 'systems', color: '#3b82f6', description: 'Systems and architecture' },
      { id: `lbl-${Date.now()}-4`, name: 'tools', color: '#f59e0b', description: 'Tools and developer operations' },
    ],
    lastSynced: new Date().toISOString(),
  };

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    user_id: db.user.id,
    action: 'PROJECT_CREATED',
    entity: 'project',
    entity_id: newProject.id,
    metadata: { name: newProject.name, repo: newProject.repo_url },
    created_at: new Date().toISOString(),
  });

  res.status(201).json({ project: newProject });
});

app.get(['/projects/:id', '/api/projects/:id'], (req: Request, res: Response) => {
  const project = db.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const syncData = db.githubSyncData[project.id];
  const expansions = db.expansions.filter(e => e.project_id === project.id);
  const roadmap = db.roadmapItems.filter(r => r.project_id === project.id);
  res.json({ project, syncData, expansions, roadmap });
});

app.patch(['/projects/:id', '/api/projects/:id'], (req: Request, res: Response) => {
  const project = db.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  Object.assign(project, req.body, { updated_at: new Date().toISOString() });
  res.json({ project });
});

app.post(['/projects/:id/sync', '/api/projects/:id/sync'], async (req: Request, res: Response) => {
  try {
    const job = await syncService.syncProject(req.params.id, db.user.id, req.body.type || 'all');
    workerPool.recordTask(1, `Synced repository: ${req.params.id}`);
    res.json({ success: true, job, syncData: db.githubSyncData[req.params.id] });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Sync failed' });
  }
});

// -------------------------------------------------------------------------
// GitHub Labels Management (Add / Remove repository labels directly from UI)
// -------------------------------------------------------------------------
app.get(['/projects/:id/labels', '/api/projects/:id/labels'], (req: Request, res: Response) => {
  const syncData = db.githubSyncData[req.params.id];
  if (!syncData) return res.status(404).json({ error: 'Project sync data not found' });
  res.json({ labels: syncData.labels || [] });
});

app.post(['/projects/:id/labels', '/api/projects/:id/labels'], (req: Request, res: Response) => {
  const { name, color = '#6366f1', description = '' } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Label name is required' });
  }

  const syncData = db.githubSyncData[req.params.id];
  if (!syncData) return res.status(404).json({ error: 'Project sync data not found' });

  if (!syncData.labels) syncData.labels = [];

  const trimmedName = name.trim();
  const existing = syncData.labels.find(l => l.name.toLowerCase() === trimmedName.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: `Label "${trimmedName}" already exists on repository.` });
  }

  const newLabel = {
    id: `lbl-${Date.now()}`,
    name: trimmedName,
    color: color.startsWith('#') ? color : `#${color}`,
    description: description.trim(),
  };

  syncData.labels.push(newLabel);
  syncData.lastSynced = new Date().toISOString();

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    user_id: db.user.id,
    action: 'GITHUB_LABEL_CREATED',
    entity: 'label',
    entity_id: newLabel.name,
    metadata: { projectId: req.params.id, label: newLabel },
    created_at: new Date().toISOString(),
  });

  workerPool.recordTask(1, `Created repository label: "${newLabel.name}"`);

  res.status(201).json({ success: true, label: newLabel, labels: syncData.labels });
});

app.delete(['/projects/:id/labels/:labelName', '/api/projects/:id/labels/:labelName'], (req: Request, res: Response) => {
  const syncData = db.githubSyncData[req.params.id];
  if (!syncData) return res.status(404).json({ error: 'Project sync data not found' });

  const labelName = decodeURIComponent(req.params.labelName);
  const initialCount = (syncData.labels || []).length;
  syncData.labels = (syncData.labels || []).filter(l => l.name.toLowerCase() !== labelName.toLowerCase());

  if (syncData.labels.length === initialCount) {
    return res.status(404).json({ error: `Label "${labelName}" not found` });
  }

  syncData.lastSynced = new Date().toISOString();

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    user_id: db.user.id,
    action: 'GITHUB_LABEL_DELETED',
    entity: 'label',
    entity_id: labelName,
    metadata: { projectId: req.params.id, deletedLabel: labelName },
    created_at: new Date().toISOString(),
  });

  workerPool.recordTask(1, `Removed repository label: "${labelName}"`);

  res.json({ success: true, deleted: labelName, labels: syncData.labels });
});

// -------------------------------------------------------------------------
// 5 Background Workers Pool & RAM Metrics
// -------------------------------------------------------------------------
app.get(['/workers/status', '/api/workers/status'], (_req: Request, res: Response) => {
  const metrics = workerPool.getMetrics();
  res.json(metrics);
});

app.post(['/workers/optimize-ram', '/api/workers/optimize-ram'], (_req: Request, res: Response) => {
  workerPool.pruneMemory();
  const metrics = workerPool.getMetrics();
  res.json({ success: true, message: 'RAM successfully optimized & cache compressed', metrics });
});

// -------------------------------------------------------------------------
// AI Web Research & Expansions Engine
// -------------------------------------------------------------------------
app.post(['/research/run', '/api/research/run'], async (req: Request, res: Response) => {
  // Permission check: Member role restricted from initiating research
  if (db.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden: Member role does not have permission to initiate AI research. Admin role required.',
    });
  }

  try {
    const { projectId, query, depth = 'standard', focusAreas } = req.body;
    const targetProject = db.projects.find(p => p.id === projectId) || db.projects[0];

    const runId = `run-${Date.now()}`;
    db.researchRuns.unshift({
      id: runId,
      project_id: targetProject.id,
      user_id: db.user.id,
      trigger: 'manual',
      query: query || 'Identify ways to expand and improve systems, tools, functions, and work',
      depth,
      focus_areas: focusAreas || targetProject.research_focus,
      status: 'running',
      model: db.settings.model_name,
      sources_count: 0,
      started_at: new Date().toISOString(),
    });

    const result = await runAIWebResearch({
      projectId: targetProject.id,
      projectName: targetProject.name,
      projectDescription: targetProject.description,
      repoOwner: targetProject.repo_owner,
      repoName: targetProject.repo_name,
      query,
      depth,
      focusAreas,
    });

    // Add generated expansions to store
    for (const exp of result.expansions) {
      db.expansions.unshift(exp);
    }

    const currentRun = db.researchRuns.find(r => r.id === runId);
    if (currentRun) {
      currentRun.status = 'completed';
      currentRun.finished_at = new Date().toISOString();
      currentRun.sources_count = result.expansions.reduce((acc, e) => acc + (e.sources?.length || 0), 0);
    }

    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      user_id: db.user.id,
      project_id: targetProject.id,
      type: 'research_completed',
      title: 'AI Web Research Completed',
      body: `Generated ${result.expansions.length} expansion proposals for ${targetProject.name}.`,
      read: false,
      created_at: new Date().toISOString(),
    });

    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      user_id: db.user.id,
      action: 'AI_WEB_RESEARCH_RUN',
      entity: 'project',
      entity_id: targetProject.id,
      metadata: { count: result.expansions.length, model: result.modelUsed, depth },
      created_at: new Date().toISOString(),
    });

    res.json({
      success: true,
      expansions: result.expansions,
      modelUsed: result.modelUsed,
      runId,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'AI Research execution failed' });
  }
});

app.get(['/research/expansions', '/api/research/expansions'], (req: Request, res: Response) => {
  const {
    projectId,
    status,
    priority,
    impact,
    effort,
    risk,
    search,
    q,
    sortBy,
    sortOrder = 'desc',
  } = req.query as Record<string, string>;

  let items = [...db.expansions];

  // Filter by project
  if (projectId && projectId !== 'all') {
    items = items.filter(e => e.project_id === projectId);
  }

  // Filter by status (supports 'new' matching 'proposed', 'accepted', 'rejected', 'archived')
  if (status && status !== 'all') {
    const sLower = status.toLowerCase();
    if (sLower === 'new') {
      items = items.filter(e => e.status === 'proposed');
    } else {
      items = items.filter(e => e.status.toLowerCase() === sLower);
    }
  }

  // Filter by priority
  if (priority && priority !== 'all') {
    items = items.filter(e => e.priority.toLowerCase() === priority.toLowerCase());
  }

  // Filter by impact
  if (impact && impact !== 'all') {
    items = items.filter(e => e.impact.toLowerCase() === impact.toLowerCase());
  }

  // Filter by effort
  if (effort && effort !== 'all') {
    items = items.filter(e => e.effort.toLowerCase() === effort.toLowerCase());
  }

  // Filter by risk
  if (risk && risk !== 'all') {
    items = items.filter(e => e.risk.toLowerCase() === risk.toLowerCase());
  }

  // Text search
  const searchQuery = (search || q || '').toLowerCase().trim();
  if (searchQuery) {
    items = items.filter(e =>
      e.title.toLowerCase().includes(searchQuery) ||
      e.summary.toLowerCase().includes(searchQuery) ||
      e.why_now.toLowerCase().includes(searchQuery) ||
      e.systems_affected.some(s => s.toLowerCase().includes(searchQuery)) ||
      e.tools_affected.some(t => t.toLowerCase().includes(searchQuery))
    );
  }

  // Sorting
  const impactMap: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
  const effortMap: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
  const riskMap: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
  const priorityMap: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };

  const isAsc = sortOrder.toLowerCase() === 'asc';

  if (sortBy) {
    const field = sortBy.toLowerCase();
    items.sort((a, b) => {
      let diff = 0;
      if (field === 'impact') {
        diff = (impactMap[a.impact] || 0) - (impactMap[b.impact] || 0);
      } else if (field === 'effort') {
        diff = (effortMap[a.effort] || 0) - (effortMap[b.effort] || 0);
      } else if (field === 'risk') {
        diff = (riskMap[a.risk] || 0) - (riskMap[b.risk] || 0);
      } else if (field === 'priority') {
        diff = (priorityMap[a.priority] || 0) - (priorityMap[b.priority] || 0);
      } else if (field === 'title') {
        diff = a.title.localeCompare(b.title);
      } else if (field === 'date' || field === 'created_at') {
        diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return isAsc ? diff : -diff;
    });
  } else {
    // Default newest first
    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  res.json({ expansions: items, totalCount: items.length });
});

app.post(['/expansions/:id/accept', '/api/expansions/:id/accept'], (req: Request, res: Response) => {
  const expansion = db.expansions.find(e => e.id === req.params.id);
  if (!expansion) return res.status(404).json({ error: 'Expansion not found' });

  expansion.status = 'accepted';
  expansion.updated_at = new Date().toISOString();

  // Automatically create roadmap item if not existing
  const existingRoadmap = db.roadmapItems.find(r => r.expansion_id === expansion.id);
  if (!existingRoadmap) {
    const newRoadmapItem = {
      id: `road-${Date.now()}`,
      project_id: expansion.project_id,
      expansion_id: expansion.id,
      title: expansion.title,
      description: expansion.summary,
      status: 'planned' as const,
      priority: expansion.priority,
      github_issue_url: expansion.github_issue_url,
      github_pr_url: expansion.github_pr_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.roadmapItems.unshift(newRoadmapItem);
  }

  res.json({ expansion });
});

app.post(['/expansions/:id/reject', '/api/expansions/:id/reject'], (req: Request, res: Response) => {
  const expansion = db.expansions.find(e => e.id === req.params.id);
  if (!expansion) return res.status(404).json({ error: 'Expansion not found' });
  expansion.status = 'rejected';
  expansion.updated_at = new Date().toISOString();
  res.json({ expansion });
});

app.post(['/expansions/:id/archive', '/api/expansions/:id/archive'], (req: Request, res: Response) => {
  const expansion = db.expansions.find(e => e.id === req.params.id);
  if (!expansion) return res.status(404).json({ error: 'Expansion not found' });
  expansion.status = 'archived';
  expansion.updated_at = new Date().toISOString();
  res.json({ expansion });
});

app.post(['/expansions/:id/create-issue', '/api/expansions/:id/create-issue'], async (req: Request, res: Response) => {
  try {
    const result = await syncService.createGitHubIssue(req.params.id, db.user.id);
    const expansion = db.expansions.find(e => e.id === req.params.id);
    res.json({ ...result, expansion });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to create GitHub issue' });
  }
});

app.post(['/expansions/:id/create-pr', '/api/expansions/:id/create-pr'], async (req: Request, res: Response) => {
  try {
    const result = await syncService.createDraftPR(req.params.id, db.user.id);
    const expansion = db.expansions.find(e => e.id === req.params.id);
    res.json({ ...result, expansion });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to create draft PR' });
  }
});

// -------------------------------------------------------------------------
// Cron & Scheduled Daily Expansion (08:00 & 20:00)
// -------------------------------------------------------------------------
app.post(['/cron/daily-research', '/api/cron/daily-research'], async (req: Request, res: Response) => {
  // Permission check: Member role restricted from triggering manual cron executions
  if (db.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden: Member role does not have permission to trigger cron expansions. Admin role required.',
    });
  }

  try {
    const type = req.body.type === '20:00' ? '20:00' : '08:00';
    const force = Boolean(req.body.force);
    const mockDate = req.body.mockDate;

    const result = await cronManager.triggerScheduledRun(type, force, mockDate);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Cron execution failed' });
  }
});

app.get(['/cron/status', '/api/cron/status'], (_req: Request, res: Response) => {
  res.json({
    settings: {
      daily_research_cron: db.settings.daily_research_cron,
      daily_research_tz: db.settings.daily_research_tz,
      evening_research_cron: db.settings.evening_research_cron,
      evening_run_enabled: db.settings.evening_run_enabled,
      auto_create_github_issue: db.settings.auto_create_github_issue,
    },
    cronHistory: db.cronHistory,
    lastRun: db.settings.last_cron_run,
    nextRun: db.settings.next_cron_run,
  });
});

// -------------------------------------------------------------------------
// GitHub Sync Status & Webhooks
// -------------------------------------------------------------------------
app.get(['/sync/status', '/api/sync/status'], (_req: Request, res: Response) => {
  res.json({
    syncData: db.githubSyncData,
    jobs: db.syncJobs.slice(0, 10),
  });
});

app.post(['/sync/all', '/api/sync/all'], async (_req: Request, res: Response) => {
  const result = await syncService.syncAllProjects(db.user.id);
  res.json(result);
});

app.post(['/webhooks/github', '/api/webhooks/github'], (req: Request, res: Response) => {
  const event = req.headers['x-github-event'] as string;
  const payload = req.body;

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    user_id: 'system-github-webhook',
    action: `GITHUB_WEBHOOK_${event ? event.toUpperCase() : 'UNKNOWN'}`,
    entity: 'webhook',
    entity_id: String(payload?.repository?.id || 'repo'),
    metadata: { event, sender: payload?.sender?.login },
    created_at: new Date().toISOString(),
  });

  res.status(200).json({ received: true, event });
});

// -------------------------------------------------------------------------
// Roadmap Items (Kanban)
// -------------------------------------------------------------------------
app.get(['/roadmap', '/api/roadmap'], (_req: Request, res: Response) => {
  res.json({ roadmap: db.roadmapItems });
});

app.patch(['/roadmap/:id', '/api/roadmap/:id'], (req: Request, res: Response) => {
  const item = db.roadmapItems.find(r => r.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  Object.assign(item, req.body, { updated_at: new Date().toISOString() });
  res.json({ item });
});

app.post(['/roadmap', '/api/roadmap'], (req: Request, res: Response) => {
  const { title, description, status = 'planned', priority = 'medium', project_id } = req.body;
  const newItem = {
    id: `road-${Date.now()}`,
    project_id: project_id || db.projects[0].id,
    title,
    description,
    status,
    priority,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.roadmapItems.unshift(newItem);
  res.status(201).json({ item: newItem });
});

// -------------------------------------------------------------------------
// Notifications, Settings & Audit Logs
// -------------------------------------------------------------------------
app.get(['/notifications', '/api/notifications'], (_req: Request, res: Response) => {
  res.json({ notifications: db.notifications });
});

app.patch(['/notifications/:id/read', '/api/notifications/:id/read'], (req: Request, res: Response) => {
  const notif = db.notifications.find(n => n.id === req.params.id);
  if (notif) notif.read = true;
  res.json({ success: true, notif });
});

app.get(['/settings', '/api/settings'], (_req: Request, res: Response) => {
  res.json({ settings: db.settings });
});

app.post(['/settings', '/api/settings'], (req: Request, res: Response) => {
  // Permission check: Member role restricted from altering platform settings
  if (db.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden: Member role does not have permission to modify settings. Admin role required.',
    });
  }

  Object.assign(db.settings, req.body);
  res.json({ settings: db.settings });
});

app.get(['/audit-logs', '/api/audit-logs'], (_req: Request, res: Response) => {
  res.json({ auditLogs: db.auditLogs.slice(0, 50) });
});

// -------------------------------------------------------------------------
// Vite Dev Integration / Production Static Serving
// -------------------------------------------------------------------------
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // Start Cron Manager for 08:00 & 20:00 schedule
  cronManager.start();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (devMode: ${!isProduction})`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
