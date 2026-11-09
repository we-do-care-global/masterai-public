import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Filter,
  CheckCircle2,
  GitPullRequest,
  ExternalLink,
  Layers,
  Wrench,
  Activity,
  Briefcase,
  ArrowRight,
  Clock,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  RotateCcw,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';
import { Expansion, PriorityLevel, ExpansionStatus, Project, UserProfile } from '../types';

interface ExpansionsListViewProps {
  expansions: Expansion[];
  projects: Project[];
  currentUser: UserProfile;
  onOpenResearchModal: () => void;
  onSelectExpansion: (exp: Expansion) => void;
  onCreateIssue: (id: string) => void;
}

type SortField = 'impact' | 'effort' | 'risk' | 'priority' | 'date' | 'title';
type SortOrder = 'asc' | 'desc';

export const ExpansionsListView: React.FC<ExpansionsListViewProps> = ({
  expansions,
  projects,
  currentUser,
  onOpenResearchModal,
  onSelectExpansion,
  onCreateIssue,
}) => {
  // Filters State
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [impactFilter, setImpactFilter] = useState<string>('all');
  const [effortFilter, setEffortFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Sorting State
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const isAdmin = currentUser.role === 'admin';

  // Numerical mapping for ranks
  const impactRank: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
  const effortRank: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
  const riskRank: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
  const priorityRank: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };

  // Filtered & Sorted Expansions
  const filteredAndSorted = useMemo(() => {
    let result = [...expansions];

    // Status filter
    if (statusFilter !== 'all') {
      const s = statusFilter.toLowerCase();
      if (s === 'new') {
        result = result.filter(e => e.status === 'proposed');
      } else {
        result = result.filter(e => e.status.toLowerCase() === s);
      }
    }

    // Impact filter
    if (impactFilter !== 'all') {
      result = result.filter(e => e.impact.toLowerCase() === impactFilter.toLowerCase());
    }

    // Effort filter
    if (effortFilter !== 'all') {
      result = result.filter(e => e.effort.toLowerCase() === effortFilter.toLowerCase());
    }

    // Risk filter
    if (riskFilter !== 'all') {
      result = result.filter(e => e.risk.toLowerCase() === riskFilter.toLowerCase());
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(e => e.priority.toLowerCase() === priorityFilter.toLowerCase());
    }

    // Project filter
    if (projectFilter !== 'all') {
      result = result.filter(e => e.project_id === projectFilter);
    }

    // Text search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        e.why_now.toLowerCase().includes(q) ||
        e.systems_affected.some(s => s.toLowerCase().includes(q)) ||
        e.tools_affected.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      let diff = 0;
      switch (sortField) {
        case 'impact':
          diff = (impactRank[a.impact] || 0) - (impactRank[b.impact] || 0);
          break;
        case 'effort':
          diff = (effortRank[a.effort] || 0) - (effortRank[b.effort] || 0);
          break;
        case 'risk':
          diff = (riskRank[a.risk] || 0) - (riskRank[b.risk] || 0);
          break;
        case 'priority':
          diff = (priorityRank[a.priority] || 0) - (priorityRank[b.priority] || 0);
          break;
        case 'title':
          diff = a.title.localeCompare(b.title);
          break;
        case 'date':
        default:
          diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return sortOrder === 'asc' ? diff : -diff;
    });

    return result;
  }, [
    expansions,
    statusFilter,
    impactFilter,
    effortFilter,
    riskFilter,
    priorityFilter,
    projectFilter,
    searchTerm,
    sortField,
    sortOrder,
  ]);

  const hasActiveFilters =
    statusFilter !== 'all' ||
    impactFilter !== 'all' ||
    effortFilter !== 'all' ||
    riskFilter !== 'all' ||
    priorityFilter !== 'all' ||
    projectFilter !== 'all' ||
    searchTerm.trim().length > 0;

  const resetFilters = () => {
    setStatusFilter('all');
    setImpactFilter('all');
    setEffortFilter('all');
    setRiskFilter('all');
    setPriorityFilter('all');
    setProjectFilter('all');
    setSearchTerm('');
    setSortField('date');
    setSortOrder('desc');
  };

  const toggleSortDirection = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>AI Web Research Expansions</span>
            </h2>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isAdmin
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}
            >
              {isAdmin ? 'Admin Access' : 'Member Access'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous discovery and proposal triage across systems, tools, functions, and work dimensions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isAdmin ? (
            <button
              onClick={onOpenResearchModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Run Research Discovery</span>
            </button>
          ) : (
            <div
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 text-xs"
              title="Admin role required to initiate research discovery"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Research: Admin Only</span>
            </div>
          )}
        </div>
      </div>

      {/* Member Restricted Notice Banner if applicable */}
      {!isAdmin && (
        <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs text-blue-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              <strong>Member Role Notice:</strong> You have review access to browse, filter, sort, and inspect research proposals. Initiating new research and creating projects requires the Admin role.
            </span>
          </div>
        </div>
      )}

      {/* Filter and Sorting Controls Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-lg">
        {/* Top Control Bar: Search + Quick Status Filters + Sort Control */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search title, why now, systems, tools..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Status Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 text-xs">
            {[
              { id: 'all', label: 'All Status' },
              { id: 'new', label: 'New / Proposed' },
              { id: 'accepted', label: 'Accepted' },
              { id: 'rejected', label: 'Rejected' },
              { id: 'archived', label: 'Archived' },
            ].map(st => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                  statusFilter === st.id
                    ? 'bg-indigo-600 text-white shadow font-semibold'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Sorting Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[11px] text-slate-400">Sort by:</span>
              <select
                value={sortField}
                onChange={e => setSortField(e.target.value as SortField)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
              >
                <option value="impact">Impact Level</option>
                <option value="effort">Effort Level</option>
                <option value="risk">Risk Level</option>
                <option value="priority">Priority</option>
                <option value="date">Date Created</option>
                <option value="title">Title (Alphabetical)</option>
              </select>
            </div>

            <button
              onClick={toggleSortDirection}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              title={`Sort direction: ${sortOrder === 'desc' ? 'High to Low / Newest' : 'Low to High / Oldest'}`}
            >
              {sortOrder === 'desc' ? (
                <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <ArrowUp className="w-3.5 h-3.5 text-indigo-400" />
              )}
            </button>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-2 rounded-xl border transition-colors ${
                showAdvancedFilters || hasActiveFilters
                  ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Toggle advanced filters"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Advanced Filters Expandable Grid */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs animate-in fade-in duration-150">
            {/* Impact Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Impact
              </label>
              <select
                value={impactFilter}
                onChange={e => setImpactFilter(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              >
                <option value="all">All Impacts</option>
                <option value="High">High Impact</option>
                <option value="Medium">Medium Impact</option>
                <option value="Low">Low Impact</option>
              </select>
            </div>

            {/* Effort Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Effort
              </label>
              <select
                value={effortFilter}
                onChange={e => setEffortFilter(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              >
                <option value="all">All Efforts</option>
                <option value="Low">Low Effort</option>
                <option value="Medium">Medium Effort</option>
                <option value="High">High Effort</option>
              </select>
            </div>

            {/* Risk Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Risk
              </label>
              <select
                value={riskFilter}
                onChange={e => setRiskFilter(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              >
                <option value="all">All Risks</option>
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Priority
              </label>
              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Project Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Project
              </label>
              <select
                value={projectFilter}
                onChange={e => setProjectFilter(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              >
                <option value="all">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Active Filters Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-[11px]">
          <div className="flex flex-wrap items-center gap-1.5 text-slate-400">
            <span>
              Showing <strong className="text-white">{filteredAndSorted.length}</strong> of{' '}
              <strong className="text-white">{expansions.length}</strong> proposals
            </span>

            {/* Active chips */}
            {statusFilter !== 'all' && (
              <span className="bg-slate-800 px-2 py-0.5 rounded text-indigo-300 flex items-center gap-1">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter('all')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {impactFilter !== 'all' && (
              <span className="bg-slate-800 px-2 py-0.5 rounded text-emerald-300 flex items-center gap-1">
                Impact: {impactFilter}
                <button onClick={() => setImpactFilter('all')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {effortFilter !== 'all' && (
              <span className="bg-slate-800 px-2 py-0.5 rounded text-amber-300 flex items-center gap-1">
                Effort: {effortFilter}
                <button onClick={() => setEffortFilter('all')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {riskFilter !== 'all' && (
              <span className="bg-slate-800 px-2 py-0.5 rounded text-rose-300 flex items-center gap-1">
                Risk: {riskFilter}
                <button onClick={() => setRiskFilter('all')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {priorityFilter !== 'all' && (
              <span className="bg-slate-800 px-2 py-0.5 rounded text-purple-300 flex items-center gap-1">
                Priority: {priorityFilter}
                <button onClick={() => setPriorityFilter('all')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {projectFilter !== 'all' && (
              <span className="bg-slate-800 px-2 py-0.5 rounded text-indigo-300 flex items-center gap-1">
                Project Filtered
                <button onClick={() => setProjectFilter('all')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset all filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Expansions List */}
      <div className="space-y-3.5">
        {filteredAndSorted.map(exp => (
          <div
            key={exp.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4 shadow-sm"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {/* Priority */}
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

                {/* Status Badge */}
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    exp.status === 'accepted'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : exp.status === 'rejected'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : exp.status === 'archived'
                      ? 'bg-slate-800 text-slate-400 border border-slate-700'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  {exp.status === 'proposed' ? 'NEW' : exp.status.toUpperCase()}
                </span>

                <span className="text-slate-600">•</span>
                <span className="text-[11px] text-slate-400">
                  Impact:{' '}
                  <strong
                    className={
                      exp.impact === 'High'
                        ? 'text-emerald-400'
                        : exp.impact === 'Medium'
                        ? 'text-indigo-300'
                        : 'text-slate-300'
                    }
                  >
                    {exp.impact}
                  </strong>
                </span>

                <span className="text-slate-600">•</span>
                <span className="text-[11px] text-slate-400">
                  Effort:{' '}
                  <strong
                    className={
                      exp.effort === 'High'
                        ? 'text-rose-400'
                        : exp.effort === 'Medium'
                        ? 'text-amber-300'
                        : 'text-emerald-300'
                    }
                  >
                    {exp.effort}
                  </strong>
                </span>

                <span className="text-slate-600">•</span>
                <span className="text-[11px] text-slate-400">
                  Risk:{' '}
                  <strong
                    className={
                      exp.risk === 'High'
                        ? 'text-rose-400'
                        : exp.risk === 'Medium'
                        ? 'text-amber-300'
                        : 'text-emerald-400'
                    }
                  >
                    {exp.risk}
                  </strong>
                </span>

                <span className="text-slate-600">•</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(exp.created_at).toLocaleDateString()}
                </span>
              </div>

              <h3
                onClick={() => onSelectExpansion(exp)}
                className="text-base font-bold text-white hover:text-indigo-300 cursor-pointer transition-colors leading-snug"
              >
                {exp.title}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">{exp.summary}</p>

              {/* 4 Pillars preview */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px]">
                {exp.systems_affected.map((s, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700/60"
                  >
                    <Layers className="w-3 h-3" />
                    <span>{s}</span>
                  </span>
                ))}
                {exp.tools_affected.map((t, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-emerald-300 border border-slate-700/60"
                  >
                    <Wrench className="w-3 h-3" />
                    <span>{t}</span>
                  </span>
                ))}
                {exp.functions_affected.slice(0, 1).map((f, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-purple-300 border border-slate-700/60"
                  >
                    <Activity className="w-3 h-3" />
                    <span>{f}</span>
                  </span>
                ))}
                {exp.work_affected.slice(0, 1).map((w, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-rose-300 border border-slate-700/60"
                  >
                    <Briefcase className="w-3 h-3" />
                    <span>{w}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Actions on card */}
            <div className="flex flex-row md:flex-col items-center md:items-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
              <button
                onClick={() => onSelectExpansion(exp)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-colors"
              >
                <span>Full Breakdown</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {exp.github_issue_url ? (
                <a
                  href={exp.github_issue_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 text-[11px] font-medium hover:bg-indigo-500/20 transition-colors"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>GitHub Issue</span>
                </a>
              ) : (
                <button
                  onClick={() => onCreateIssue(exp.id)}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
                >
                  <GitPullRequest className="w-3 h-3 text-indigo-400" />
                  <span>Export Issue</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredAndSorted.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-500 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
            <div>No expansions match the current filters and sort parameters.</div>
            <button
              onClick={resetFilters}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
            >
              Clear filters and show all
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
