import React from 'react';
import {
  Sparkles,
  GitBranch,
  GitPullRequest,
  Clock,
  Globe,
  Layers,
  Wrench,
  Activity,
  Briefcase,
  ArrowRight,
  TrendingUp,
  FolderGit2,
  RefreshCw,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { Project, Expansion, GitHubRepoSyncData, RoadmapItem, UserProfile } from '../types';
import { DailyExpansionBanner } from './DailyExpansionBanner';

interface DashboardViewProps {
  activeProject: Project | null;
  dailyExpansion: Expansion | null;
  recentExpansions: Expansion[];
  syncData: GitHubRepoSyncData | null;
  roadmapItems: RoadmapItem[];
  currentUser: UserProfile;
  isSyncing: boolean;
  onOpenResearchModal: () => void;
  onOpenNewProjectModal: () => void;
  onSelectExpansion: (exp: Expansion) => void;
  onCreateIssue: (id: string) => void;
  onSyncNow: () => void;
  onTriggerDailyTest: () => void;
  onViewAllExpansions: () => void;
  onViewKanban: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  activeProject,
  dailyExpansion,
  recentExpansions,
  syncData,
  roadmapItems,
  currentUser,
  isSyncing,
  onOpenResearchModal,
  onOpenNewProjectModal,
  onSelectExpansion,
  onCreateIssue,
  onSyncNow,
  onTriggerDailyTest,
  onViewAllExpansions,
  onViewKanban,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const openIssuesCount = syncData?.issues.filter(i => i.state === 'open').length || 0;
  const openPRsCount = syncData?.pullRequests.filter(p => p.state === 'open').length || 0;
  const inProgressRoadmap = roadmapItems.filter(r => r.status === 'in_progress').length;

  return (
    <div className="space-y-6">
      {/* Daily Expansion Spotlight */}
      <DailyExpansionBanner
        expansion={dailyExpansion}
        timezone={activeProject?.timezone || 'Europe/Sarajevo'}
        onSelectExpansion={onSelectExpansion}
        onCreateIssue={onCreateIssue}
        onTriggerDailyTest={onTriggerDailyTest}
        isTriggering={isSyncing}
      />

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Total Expansions</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{recentExpansions.length}</div>
          <div className="text-[11px] text-emerald-400 font-medium">Grounded live web research</div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">GitHub Issues / PRs</span>
            <GitPullRequest className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {openIssuesCount} <span className="text-sm font-normal text-slate-400">/ {openPRsCount} PRs</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">2-way synced</div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Active Roadmap</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{inProgressRoadmap}</div>
          <div className="text-[11px] text-purple-300">In delivery progress</div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Daily Schedule</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">08:00 & 20:00</div>
          <div className="text-[11px] text-amber-300 font-mono">Europe/Sarajevo (1x/day)</div>
        </div>
      </div>

      {/* Quick Actions Ribbon */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <span>Quick Actions</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isAdmin ? (
            <button
              onClick={onOpenResearchModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Web Research Expansions for us</span>
            </button>
          ) : (
            <div
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 text-xs"
              title="Admin role required to initiate AI Web Research"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-500" />
              <span>Research (Admin Only)</span>
            </div>
          )}

          {isAdmin ? (
            <button
              onClick={onOpenNewProjectModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              <span>New Project</span>
            </button>
          ) : (
            <div
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 text-xs"
              title="Admin role required to create new projects"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span>New Project (Admin Only)</span>
            </div>
          )}

          <button
            onClick={onSyncNow}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync GitHub Now</span>
          </button>

          <button
            onClick={onViewKanban}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <span>View Roadmap Kanban</span>
          </button>
        </div>
      </div>

      {/* Main Split: Recent Expansions & Live GitHub Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expansions List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Latest Research Expansions</span>
            </h3>
            <button
              onClick={onViewAllExpansions}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              <span>View all ({recentExpansions.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {recentExpansions.slice(0, 3).map(exp => (
              <div
                key={exp.id}
                onClick={() => onSelectExpansion(exp)}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        exp.priority === 'critical'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {exp.priority}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Impact: <strong className="text-white">{exp.impact}</strong>
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-[11px] text-slate-400">
                      Effort: <strong className="text-white">{exp.effort}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(exp.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="font-semibold text-sm text-white group-hover:text-indigo-300 transition-colors leading-snug">
                  {exp.title}
                </h4>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {exp.summary}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span>Systems: <strong className="text-slate-200">{exp.systems_affected.length}</strong></span>
                    <span>Tools: <strong className="text-slate-200">{exp.tools_affected.length}</strong></span>
                  </div>
                  <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-medium">
                    Review proposal
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live GitHub Sync Status & Commits (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-emerald-400" />
              <span>Live GitHub Sync</span>
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded">
              Synced
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            {/* Pages Deployment status */}
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs">
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span className="font-semibold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  GitHub Pages Site
                </span>
                <span className="text-[10px] text-emerald-400">Built</span>
              </div>
              <a
                href={syncData?.pages.page_url || 'https://we-do-care-global.github.io/we-do-care-global/'}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-400 hover:underline truncate block"
              >
                {syncData?.pages.page_url || 'https://we-do-care-global.github.io/we-do-care-global/'}
              </a>
            </div>

            {/* Recent commits */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Recent Commits
              </div>
              <div className="space-y-2">
                {syncData?.commits.slice(0, 3).map(c => (
                  <div key={c.sha} className="p-2.5 rounded-lg bg-slate-800/30 border border-slate-800 text-xs">
                    <p className="font-medium text-slate-200 line-clamp-1">{c.message}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 font-mono">
                      <span>@{c.author}</span>
                      <span>{c.sha}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Workflow status */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                GitHub Actions Sentinel
              </div>
              <div className="space-y-1.5 text-xs">
                {syncData?.workflows.slice(0, 2).map(w => (
                  <div key={w.id} className="flex items-center justify-between p-2 rounded bg-slate-800/30 text-[11px]">
                    <span className="text-slate-300 truncate max-w-[150px]">{w.name}</span>
                    <span className="text-emerald-400 font-mono text-[10px]">passing</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
