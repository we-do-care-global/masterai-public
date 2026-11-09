/**
 * Type definitions for We Do Care Global AI Web Research & Expansion Platform
 */

export type ImpactLevel = 'High' | 'Medium' | 'Low';
export type EffortLevel = 'Low' | 'Medium' | 'High';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';

export type ExpansionStatus = 'proposed' | 'accepted' | 'rejected' | 'archived';

export interface SourceReference {
  title: string;
  url: string;
  snippet?: string;
}

export interface Expansion {
  id: string;
  project_id: string;
  research_run_id: string;
  title: string;
  summary: string;
  why_now: string;
  impact: ImpactLevel;
  effort: EffortLevel;
  risk: RiskLevel;
  systems_affected: string[];
  tools_affected: string[];
  functions_affected: string[];
  work_affected: string[];
  implementation_steps: string[];
  code_tasks: string[];
  github_issue_body: string;
  sources: SourceReference[];
  status: ExpansionStatus;
  priority: PriorityLevel;
  owner_id?: string;
  github_issue_url?: string;
  github_pr_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  repo_owner: string;
  repo_name: string;
  repo_url: string;
  default_branch: string;
  visibility: 'public' | 'private';
  research_focus: string[];
  daily_research_time: string;
  timezone: string;
  is_active: boolean;
  last_synced_at?: string;
  open_issues_count?: number;
  open_prs_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ResearchRun {
  id: string;
  project_id: string;
  user_id: string;
  trigger: 'manual' | 'daily_0800' | 'evening_2000' | 'cron';
  query: string;
  depth: 'quick' | 'standard' | 'deep';
  focus_areas: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  model: string;
  sources_count: number;
  started_at: string;
  finished_at?: string;
  error?: string;
}

export type RoadmapStatus = 'backlog' | 'planned' | 'in_progress' | 'review' | 'done';

export interface RoadmapItem {
  id: string;
  project_id: string;
  expansion_id?: string;
  title: string;
  description: string;
  status: RoadmapStatus;
  priority: PriorityLevel;
  owner_id?: string;
  github_issue_url?: string;
  github_pr_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SyncJob {
  id: string;
  project_id: string;
  user_id: string;
  type: 'all' | 'repos' | 'issues' | 'prs' | 'commits' | 'actions' | 'pages' | 'releases';
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string;
  finished_at?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  user: string;
  labels: string[];
  created_at: string;
  url: string;
  body?: string;
}

export interface GitHubPR {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed' | 'merged';
  user: string;
  draft: boolean;
  branch: string;
  created_at: string;
  url: string;
}

export interface GitHubWorkflowRun {
  id: number;
  name: string;
  status: 'completed' | 'in_progress' | 'queued';
  conclusion: 'success' | 'failure' | 'neutral' | null;
  branch: string;
  event: string;
  updated_at: string;
  url: string;
}

export interface GitHubPagesDeployment {
  status: 'built' | 'building' | 'errored';
  page_url: string;
  updated_at: string;
}

export interface GitHubLabel {
  id: string | number;
  name: string;
  color: string;
  description?: string;
  default?: boolean;
}

export interface GitHubRepoSyncData {
  owner: string;
  repo: string;
  defaultBranch: string;
  branches: string[];
  commits: GitHubCommit[];
  issues: GitHubIssue[];
  pullRequests: GitHubPR[];
  workflows: GitHubWorkflowRun[];
  pages: GitHubPagesDeployment;
  releases: Array<{ tag_name: string; name: string; published_at: string; url: string }>;
  labels: GitHubLabel[];
  lastSynced: string;
}

export interface BackgroundWorker {
  id: number;
  name: string;
  role: string;
  status: 'idle' | 'active' | 'running' | 'sleeping';
  tasksCompleted: number;
  lastHeartbeat: string;
  currentTask?: string;
  latencyMs: number;
  memoryUsageMb: number;
}

export interface WorkerPoolMetrics {
  totalWorkers: number;
  activeWorkers: number;
  totalTasksProcessed: number;
  memoryUsageMb: number;
  heapUsedMb: number;
  uptimeSeconds: number;
  averageLatencyMs: number;
  workers: BackgroundWorker[];
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity: string;
  entity_id: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  project_id?: string;
  type: 'expansion_added' | 'sync_completed' | 'sync_failed' | 'issue_created' | 'research_completed' | 'security';
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

export interface AppSettings {
  daily_research_cron: string;
  daily_research_tz: string;
  evening_research_cron: string;
  evening_run_enabled: boolean;
  auto_create_github_issue: boolean;
  ai_provider: string;
  model_name: string;
  github_token_configured: boolean;
  github_repo_owner: string;
  github_repo_name: string;
  last_cron_run?: string;
  next_cron_run?: string;
}

export type UserRole = 'admin' | 'member';

export interface UserProfile {
  id: string;
  email: string;
  github_username: string;
  name: string;
  avatar_url: string;
  role: UserRole;
  auth_provider?: 'github' | 'google';
  connected_at: string;
}
