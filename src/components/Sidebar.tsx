import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  FolderGit2,
  Kanban,
  GitPullRequest,
  Clock,
  ShieldAlert,
  Settings,
  ExternalLink,
  HeartHandshake,
} from 'lucide-react';
import { Project } from '../types';

export type TabType = 'dashboard' | 'research' | 'projects' | 'roadmap' | 'github' | 'daily' | 'audit' | 'settings';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  activeProject: Project | null;
  openIssuesCount?: number;
  openPRsCount?: number;
  unreviewedExpansionsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  activeProject,
  openIssuesCount = 0,
  openPRsCount = 0,
  unreviewedExpansionsCount = 0,
}) => {
  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'research' as TabType,
      label: 'AI Web Research',
      icon: Sparkles,
      badge: unreviewedExpansionsCount > 0 ? `${unreviewedExpansionsCount} new` : null,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    },
    {
      id: 'projects' as TabType,
      label: 'Projects & Repos',
      icon: FolderGit2,
      badge: null,
    },
    {
      id: 'roadmap' as TabType,
      label: 'Roadmap & Kanban',
      icon: Kanban,
      badge: null,
    },
    {
      id: 'github' as TabType,
      label: 'GitHub Sync Center',
      icon: GitPullRequest,
      badge: openIssuesCount + openPRsCount > 0 ? `${openIssuesCount + openPRsCount}` : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    },
    {
      id: 'daily' as TabType,
      label: 'Daily Auto-Expansion',
      icon: Clock,
      badge: '08:00',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'audit' as TabType,
      label: 'Audit & Compliance',
      icon: ShieldAlert,
      badge: null,
    },
    {
      id: 'settings' as TabType,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Navigation Links */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-indigo-700/80 text-white' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Linked Repo Info Box */}
      <div className="mt-auto p-4 border-t border-slate-800/80 space-y-3">
        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs">
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span className="font-semibold text-white truncate max-w-[140px]">
              {activeProject?.repo_name || 'we-do-care-global'}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">Synced</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight mb-2.5">
            Two-way sync active with GitHub Pages & Issue Backlog.
          </p>
          <div className="flex flex-col gap-1.5">
            <a
              href={`https://github.com/${activeProject?.repo_owner || 'we-do-care-global'}/${activeProject?.repo_name || 'we-do-care-global'}`}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center justify-between group"
            >
              <span>View GitHub Repo</span>
              <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a
              href="https://we-do-care-global.github.io/we-do-care-global/"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center justify-between group"
            >
              <span>Live GitHub Pages</span>
              <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 px-1">
          <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
          <span>We Do Care Global © 2026</span>
        </div>
      </div>
    </aside>
  );
};
