import React from 'react';
import {
  Sparkles,
  Clock,
  ArrowRight,
  GitPullRequest,
  CheckCircle2,
  Calendar,
  Layers,
  Wrench,
  Activity,
  Briefcase,
} from 'lucide-react';
import { Expansion } from '../types';

interface DailyExpansionBannerProps {
  expansion: Expansion | null;
  timezone: string;
  onSelectExpansion: (exp: Expansion) => void;
  onCreateIssue: (id: string) => void;
  onTriggerDailyTest: () => void;
  isTriggering: boolean;
}

export const DailyExpansionBanner: React.FC<DailyExpansionBannerProps> = ({
  expansion,
  timezone,
  onSelectExpansion,
  onCreateIssue,
  onTriggerDailyTest,
  isTriggering,
}) => {
  if (!expansion) {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Daily Auto-Expansion Schedule: 08:00 ({timezone})</h4>
            <p className="text-xs text-slate-400">
              The daily cron runs every morning at 08:00 local time to discover 1 new high-impact system expansion.
            </p>
          </div>
        </div>
        <button
          onClick={onTriggerDailyTest}
          disabled={isTriggering}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow disabled:opacity-50 transition-colors"
        >
          {isTriggering ? 'Running 08:00 Cron...' : 'Simulate 08:00 Run Now'}
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-purple-950/20 border border-indigo-500/30 p-5 sm:p-6 shadow-xl">
      {/* Background ambient glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-3xl">
          {/* Header Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Today's 08:00 Auto-Expansion</span>
            </span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
              <Calendar className="w-3 h-3 text-slate-500" />
              {new Date(expansion.created_at).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[11px] text-slate-400">
              Priority: <strong className="text-white capitalize">{expansion.priority}</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[11px] text-slate-400">
              Impact: <strong className="text-emerald-400">{expansion.impact}</strong>
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelectExpansion(expansion)}
            className="text-base sm:text-lg font-bold text-white hover:text-indigo-300 cursor-pointer transition-colors leading-snug"
          >
            {expansion.title}
          </h3>

          {/* Summary */}
          <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
            {expansion.summary}
          </p>

          {/* 4 Pillars preview */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px]">
            {expansion.systems_affected[0] && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700/60">
                <Layers className="w-3 h-3" />
                <span>{expansion.systems_affected[0]}</span>
              </span>
            )}
            {expansion.tools_affected[0] && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-emerald-300 border border-slate-700/60">
                <Wrench className="w-3 h-3" />
                <span>{expansion.tools_affected[0]}</span>
              </span>
            )}
            {expansion.functions_affected[0] && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-purple-300 border border-slate-700/60">
                <Activity className="w-3 h-3" />
                <span>{expansion.functions_affected[0]}</span>
              </span>
            )}
            {expansion.work_affected[0] && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-rose-300 border border-slate-700/60">
                <Briefcase className="w-3 h-3" />
                <span>{expansion.work_affected[0]}</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2.5 shrink-0">
          <button
            onClick={() => onSelectExpansion(expansion)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors w-full sm:w-auto justify-center"
          >
            <span>Review Breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {expansion.github_issue_url ? (
            <a
              href={expansion.github_issue_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-xs font-medium transition-colors w-full sm:w-auto justify-center"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Issue Synced to GitHub</span>
            </a>
          ) : (
            <button
              onClick={() => onCreateIssue(expansion.id)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors w-full sm:w-auto justify-center"
            >
              <GitPullRequest className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export as GitHub Issue</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
