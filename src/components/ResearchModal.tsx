import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Search,
  Sliders,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Globe,
  Layers,
  Wrench,
  Activity,
  Briefcase,
  ShieldCheck,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { Project, Expansion, UserProfile } from '../types';

interface ResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  activeProject: Project | null;
  currentUser?: UserProfile;
  onRunResearch: (opts: {
    projectId: string;
    query?: string;
    depth: 'quick' | 'standard' | 'deep';
    focusAreas: string[];
  }) => Promise<Expansion[]>;
  onSelectExpansion: (exp: Expansion) => void;
}

const AVAILABLE_FOCUS_AREAS = [
  { id: 'systems', label: 'Systems', icon: Layers, desc: 'Architecture, microservices, databases' },
  { id: 'tools', label: 'Tools', icon: Wrench, desc: 'SDKs, CLI, CI/CD pipelines, APIs' },
  { id: 'functions', label: 'Functions', icon: Activity, desc: 'Capabilities, bereavement support, triage' },
  { id: 'work', label: 'Work', icon: Briefcase, desc: 'Volunteer workflows, donor operations' },
  { id: 'UX', label: 'UX & Accessibility', icon: Globe, desc: 'Multilingual access, grief-sensitive UI' },
  { id: 'security', label: 'Security & Privacy', icon: ShieldCheck, desc: 'Encrypted notes, zero-knowledge' },
  { id: 'performance', label: 'Performance', icon: Zap, desc: 'GitHub Pages load time, caching' },
  { id: 'automation', label: 'Automation', icon: Sparkles, desc: 'Issue dispatchers, WhatsApp bots' },
  { id: 'monetization', label: 'Monetization & Aid', icon: TrendingUp, desc: 'Micro-giving, grants, donations' },
];

export const ResearchModal: React.FC<ResearchModalProps> = ({
  isOpen,
  onClose,
  projects,
  activeProject,
  currentUser,
  onRunResearch,
  onSelectExpansion,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(activeProject?.id || projects[0]?.id || '');
  const [depth, setDepth] = useState<'quick' | 'standard' | 'deep'>('standard');
  const [selectedFocus, setSelectedFocus] = useState<string[]>([
    'systems',
    'tools',
    'functions',
    'work',
    'automation',
  ]);
  const [customQuery, setCustomQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [results, setResults] = useState<Expansion[] | null>(null);

  const isAdmin = !currentUser || currentUser.role === 'admin';

  if (!isOpen) return null;

  const toggleFocus = (id: string) => {
    setSelectedFocus(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleStartResearch = async () => {
    setIsLoading(true);
    setResults(null);
    setLoadingStep(1);

    const stepInterval = setInterval(() => {
      setLoadingStep(s => (s < 3 ? s + 1 : s));
    }, 1200);

    try {
      const expansions = await onRunResearch({
        projectId: selectedProjectId,
        query: customQuery || undefined,
        depth,
        focusAreas: selectedFocus,
      });
      clearInterval(stepInterval);
      setResults(expansions);
    } catch (err) {
      clearInterval(stepInterval);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">AI Web Research Expansions for us</h3>
              <p className="text-xs text-slate-400">
                Continuous web discovery for systems, tools, functions, and workflows
              </p>
            </div>
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
          {isLoading ? (
            /* Loading State with animated steps */
            <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <Sparkles className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-semibold text-white">
                  Running AI Web Research & Discovery...
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Grounded with real-time web search for non-profit and humanitarian tech innovations.
                </p>
              </div>

              {/* Progress milestones */}
              <div className="w-full max-w-md space-y-2 text-left text-xs bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                <div className={`flex items-center gap-2.5 ${loadingStep >= 1 ? 'text-indigo-400 font-medium' : 'text-slate-500'}`}>
                  {loadingStep >= 1 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Searching the live web for non-profit humanitarian expansions</span>
                </div>
                <div className={`flex items-center gap-2.5 ${loadingStep >= 2 ? 'text-indigo-400 font-medium' : 'text-slate-500'}`}>
                  {loadingStep >= 2 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Analyzing systems, tools, functions, and work dimensions</span>
                </div>
                <div className={`flex items-center gap-2.5 ${loadingStep >= 3 ? 'text-indigo-400 font-medium' : 'text-slate-500'}`}>
                  {loadingStep >= 3 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Synthesizing code tasks & drafting GitHub issue templates</span>
                </div>
              </div>
            </div>
          ) : results ? (
            /* Results View */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Generated {results.length} Expansion Proposal{results.length > 1 ? 's' : ''}
                  </h4>
                  <p className="text-xs text-slate-400">Click any proposal to review full details or export to GitHub.</p>
                </div>
                <button
                  onClick={() => setResults(null)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
                >
                  Configure new search
                </button>
              </div>

              <div className="space-y-3">
                {results.map(exp => (
                  <div
                    key={exp.id}
                    onClick={() => {
                      onSelectExpansion(exp);
                      onClose();
                    }}
                    className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/50 cursor-pointer transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              exp.priority === 'critical'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : exp.priority === 'high'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            }`}
                          >
                            {exp.priority} priority
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Impact: <strong className="text-white">{exp.impact}</strong>
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-[10px] text-slate-400">
                            Effort: <strong className="text-white">{exp.effort}</strong>
                          </span>
                        </div>
                        <h5 className="font-semibold text-sm text-white group-hover:text-indigo-300 transition-colors">
                          {exp.title}
                        </h5>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                          {exp.summary}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0 mt-2" />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-slate-700/50">
                      {exp.systems_affected.slice(0, 2).map((sys, i) => (
                        <span key={i} className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded">
                          System: {sys}
                        </span>
                      ))}
                      {exp.tools_affected.slice(0, 2).map((tool, i) => (
                        <span key={i} className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded">
                          Tool: {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Search Configuration Form */
            <div className="space-y-5">
              {/* Target Project */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Target Project & GitHub Repo
                </label>
                <select
                  value={selectedProjectId}
                  onChange={e => setSelectedProjectId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.repo_owner}/{p.repo_name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Research Depth */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Research Depth & Synthesis
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'quick', title: 'Quick (1-min)', desc: '1 focused proposal' },
                    { id: 'standard', title: 'Standard', desc: '2 comprehensive proposals' },
                    { id: 'deep', title: 'Deep Analysis', desc: '3 high-signal proposals' },
                  ].map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDepth(d.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        depth === d.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold">{d.title}</div>
                      <div className="text-[11px] opacity-80 mt-0.5">{d.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 9 Focus Areas */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Core Focus Areas (Select Dimensions)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AVAILABLE_FOCUS_AREAS.map(area => {
                    const isSelected = selectedFocus.includes(area.id);
                    const Icon = area.icon;
                    return (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => toggleFocus(area.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                          isSelected
                            ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300 shadow-sm'
                            : 'bg-slate-800/30 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-300'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                        <div>
                          <div className="text-xs font-semibold text-white leading-tight">{area.label}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{area.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Custom Topic */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Custom Research Focus / Inquiry (Optional)
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={customQuery}
                    onChange={e => setCustomQuery(e.target.value)}
                    placeholder="e.g. Expand automated WhatsApp peer circles and donation receipts"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && !results && (
          <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/50">
            <span className="text-[11px] text-slate-400">
              {!isAdmin ? (
                <span className="text-amber-400 font-medium">Restricted Access: Member role cannot initiate research. Switch to Admin.</span>
              ) : (
                'Searches live web & GitHub repo state'
              )}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartResearch}
                disabled={selectedFocus.length === 0 || !isAdmin}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isAdmin ? 'Run AI Web Research' : 'Admin Role Required'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
