import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  GitBranch,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  Globe,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import { Project, UserProfile } from '../types';

interface ProjectsViewProps {
  projects: Project[];
  activeProject: Project | null;
  currentUser: UserProfile;
  onSelectProject: (p: Project) => void;
  onOpenNewProjectModal: () => void;
  onSyncProject: (id: string) => void;
  onRunResearchForProject: (p: Project) => void;
  isSyncing: boolean;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  activeProject,
  currentUser,
  onSelectProject,
  onOpenNewProjectModal,
  onSyncProject,
  onRunResearchForProject,
  isSyncing,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const isAdmin = currentUser.role === 'admin';

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.repo_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-indigo-400" />
              <span>Projects & GitHub Repositories</span>
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
            Manage linked repositories, continuous AI research schedules, and branch synchronization
          </p>
        </div>

        {isAdmin ? (
          <button
            onClick={onOpenNewProjectModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Project Wizard</span>
          </button>
        ) : (
          <div
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 text-xs"
            title="Admin permission required to create new projects"
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Create Project: Admin Only</span>
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Filter projects by title, repo, or description..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map(proj => {
          const isActive = proj.id === activeProject?.id;
          return (
            <div
              key={proj.id}
              className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-slate-900 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base text-white">{proj.name}</span>
                    {isActive && (
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/30">
                        Active
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded">
                    {proj.visibility === 'public' ? <Globe className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-amber-400" />}
                    <span>{proj.visibility}</span>
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {proj.description}
                </p>

                {/* Repo info */}
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">GitHub Repository:</span>
                    <a
                      href={proj.repo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 font-mono text-[11px] flex items-center gap-1"
                    >
                      <span>{proj.repo_owner}/{proj.repo_name}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Default Branch: <strong className="font-mono text-slate-200">{proj.default_branch}</strong></span>
                    <span>Daily Schedule: <strong className="font-mono text-amber-300">{proj.daily_research_time}</strong></span>
                  </div>
                </div>

                {/* Focus areas */}
                <div className="mb-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Continuous Research Focus
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {proj.research_focus.map(f => (
                      <span key={f} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded capitalize">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectProject(proj)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-slate-400 cursor-default'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {isActive ? 'Current Project' : 'Select Project'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSyncProject(proj.id)}
                    disabled={isSyncing}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Sync with GitHub"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  </button>

                  {isAdmin ? (
                    <button
                      onClick={() => onRunResearchForProject(proj)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Research Now</span>
                    </button>
                  ) : (
                    <span
                      className="text-[11px] text-slate-500 bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1"
                      title="Admin role required to initiate research"
                    >
                      <span>Admin Only</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
