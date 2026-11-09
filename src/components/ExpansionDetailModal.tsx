import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  GitPullRequest,
  CheckCircle2,
  Copy,
  Check,
  Kanban,
  FileCode2,
  Layers,
  Wrench,
  Activity,
  Briefcase,
  AlertTriangle,
  Clock,
  Sparkles,
  Archive,
  Ban,
  CheckCheck,
} from 'lucide-react';
import { Expansion, PriorityLevel } from '../types';

interface ExpansionDetailModalProps {
  expansion: Expansion | null;
  onClose: () => void;
  onAccept: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onArchive: (id: string) => Promise<void>;
  onCreateIssue: (id: string) => Promise<void>;
  onCreateDraftPR: (id: string) => Promise<void>;
  onAddToRoadmap: (id: string) => Promise<void>;
}

export const ExpansionDetailModal: React.FC<ExpansionDetailModalProps> = ({
  expansion,
  onClose,
  onAccept,
  onReject,
  onArchive,
  onCreateIssue,
  onCreateDraftPR,
  onAddToRoadmap,
}) => {
  const [copiedIssue, setCopiedIssue] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState<string | null>(null);

  if (!expansion) return null;

  const handleCopyIssueBody = () => {
    navigator.clipboard.writeText(expansion.github_issue_body);
    setCopiedIssue(true);
    setTimeout(() => setCopiedIssue(false), 2000);
  };

  const executeAction = async (actionKey: string, fn: () => Promise<void>) => {
    try {
      setIsProcessingAction(actionKey);
      await fn();
    } finally {
      setIsProcessingAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-900/60">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  expansion.priority === 'critical'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : expansion.priority === 'high'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                }`}
              >
                {expansion.priority} Priority
              </span>
              <span
                className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                  expansion.status === 'accepted'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : expansion.status === 'rejected'
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                Status: {expansion.status}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">
                Impact: <strong className="text-white">{expansion.impact}</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">
                Effort: <strong className="text-white">{expansion.effort}</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">
                Risk: <strong className="text-white">{expansion.risk}</strong>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
              {expansion.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Summary & Why Now */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Executive Summary
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">{expansion.summary}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Why Now?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">{expansion.why_now}</p>
            </div>
          </div>

          {/* 4 Pillars Grid: Systems, Tools, Functions, Work */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Affected Dimensions & Architecture
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Systems */}
              <div className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-700/50">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-2">
                  <Layers className="w-4 h-4" />
                  <span>Systems</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {expansion.systems_affected.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-indigo-500 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tools */}
              <div className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-700/50">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-2">
                  <Wrench className="w-4 h-4" />
                  <span>Tools</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {expansion.tools_affected.map((t, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Functions */}
              <div className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-700/50">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold mb-2">
                  <Activity className="w-4 h-4" />
                  <span>Functions</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {expansion.functions_affected.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-purple-500 font-bold">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Work */}
              <div className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-700/50">
                <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold mb-2">
                  <Briefcase className="w-4 h-4" />
                  <span>Work</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {expansion.work_affected.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Implementation Steps & Code Tasks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Implementation Steps
              </h4>
              <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
                {expansion.implementation_steps.map((step, idx) => (
                  <li key={idx} className="pl-1">
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5 flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-indigo-400" />
                Target Code Tasks
              </h4>
              <ul className="space-y-2 text-xs text-slate-300 font-mono">
                {expansion.code_tasks.map((task, idx) => (
                  <li key={idx} className="bg-slate-900/60 p-2 rounded border border-slate-800 text-[11px] leading-relaxed">
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Generated GitHub Issue Body */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-slate-400" />
                GitHub Issue Body (Ready to Push)
              </h4>
              <button
                onClick={handleCopyIssueBody}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                {copiedIssue ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIssue ? 'Copied to clipboard' : 'Copy markdown'}</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48">
              {expansion.github_issue_body}
            </pre>
          </div>

          {/* Web Research Sources */}
          {expansion.sources && expansion.sources.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                Grounded Web Research Sources ({expansion.sources.length})
              </h4>
              <div className="space-y-2">
                {expansion.sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 text-xs transition-colors group"
                  >
                    <div className="font-semibold text-white group-hover:text-indigo-400 flex items-center gap-1.5">
                      <span>{source.title}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-400" />
                    </div>
                    {source.snippet && <p className="text-[11px] text-slate-400 mt-1">{source.snippet}</p>}
                    <span className="text-[10px] text-indigo-400/80 truncate block mt-1 font-mono">
                      {source.url}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => executeAction('accept', () => onAccept(expansion.id))}
              disabled={isProcessingAction !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Accept</span>
            </button>
            <button
              onClick={() => executeAction('reject', () => onReject(expansion.id))}
              disabled={isProcessingAction !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700 text-xs transition-colors"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
            <button
              onClick={() => executeAction('archive', () => onArchive(expansion.id))}
              disabled={isProcessingAction !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archive</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => executeAction('roadmap', () => onAddToRoadmap(expansion.id))}
              disabled={isProcessingAction !== null}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
            >
              <Kanban className="w-3.5 h-3.5 text-indigo-400" />
              <span>Add to Roadmap</span>
            </button>

            {expansion.github_issue_url ? (
              <a
                href={expansion.github_issue_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30 text-xs font-medium transition-colors"
              >
                <span>View Issue</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <button
                onClick={() => executeAction('issue', () => onCreateIssue(expansion.id))}
                disabled={isProcessingAction !== null}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-900/50 border border-slate-700 hover:border-indigo-500/40 text-slate-200 text-xs font-semibold transition-colors"
              >
                <GitPullRequest className="w-3.5 h-3.5 text-indigo-400" />
                <span>Create GitHub Issue</span>
              </button>
            )}

            {expansion.github_pr_url ? (
              <a
                href={expansion.github_pr_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 text-xs font-medium transition-colors"
              >
                <span>View Draft PR</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <button
                onClick={() => executeAction('pr', () => onCreateDraftPR(expansion.id))}
                disabled={isProcessingAction !== null}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow transition-all"
              >
                <GitPullRequest className="w-3.5 h-3.5" />
                <span>Create Draft PR</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
