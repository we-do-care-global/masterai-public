import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  GitBranch,
  RefreshCw,
  Bell,
  Heart,
  Globe,
  Check,
  ExternalLink,
  Clock,
  ChevronDown,
  User,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile, NotificationItem, Project } from '../types';

interface NavbarProps {
  user: UserProfile;
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (p: Project) => void;
  onOpenResearchModal: () => void;
  onSyncNow: () => void;
  isSyncing: boolean;
  lastSyncedTime?: string;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onOpenSettings: () => void;
  onOpenAuditLogs: () => void;
  onToggleRole: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  projects,
  activeProject,
  onSelectProject,
  onOpenResearchModal,
  onSyncNow,
  isSyncing,
  lastSyncedTime,
  notifications,
  onMarkNotificationRead,
  onOpenSettings,
  onOpenAuditLogs,
  onToggleRole,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  const isAdmin = user.role === 'admin';

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const updateClock = () => {
      const formatted = new Intl.DateTimeFormat('en-GB', {
        timeZone: activeProject?.timezone || 'Europe/Sarajevo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(new Date());
      setCurrentTime(formatted);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [activeProject?.timezone]);

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Project Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Heart className="w-5 h-5 text-white fill-white/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  We Do Care Global
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI Expansions
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Care & Relief Ecosystem</span>
                <span className="text-slate-600">•</span>
                <a
                  href="https://we-do-care-global.github.io/we-do-care-global/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  title="Open GitHub Pages site"
                >
                  <Globe className="w-3 h-3" />
                  GitHub Pages
                </a>
              </div>
            </div>
          </div>

          {/* Project Switcher */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setShowProjectMenu(!showProjectMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
            >
              <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
              <span className="max-w-[160px] truncate">{activeProject?.name || 'Select Project'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showProjectMenu && (
              <div className="absolute left-0 mt-2 w-64 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl py-1 z-50">
                <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-700/60">
                  Active Projects
                </div>
                {projects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectProject(p);
                      setShowProjectMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-700/50 transition-colors ${
                      p.id === activeProject?.id ? 'text-indigo-400 font-semibold bg-indigo-500/10' : 'text-slate-300'
                    }`}
                  >
                    <span className="truncate">{p.name}</span>
                    {p.id === activeProject?.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center / Timezone & Sync Indicators */}
        <div className="hidden lg:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/60 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-mono text-slate-200">{currentTime}</span>
            <span className="text-slate-500">|</span>
            <span className="text-[11px] text-slate-400">{activeProject?.timezone || 'Europe/Sarajevo'}</span>
          </div>

          <button
            onClick={onSyncNow}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs transition-all ${
              isSyncing
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 animate-pulse'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
            }`}
            title="Two-Way GitHub Sync with we-do-care-global"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing with GitHub...' : 'GitHub Synced'}</span>
            {lastSyncedTime && !isSyncing && (
              <span className="text-[10px] opacity-75">
                ({new Date(lastSyncedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
              </span>
            )}
          </button>
        </div>

        {/* Action Controls & Main CTA */}
        <div className="flex items-center gap-3">
          {/* THE MASTER BUTTON REQUESTED BY USER */}
          <button
            onClick={onOpenResearchModal}
            className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-indigo-500/25 transition-all duration-200 cursor-pointer active:scale-95"
            id="main-ai-research-cta"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="tracking-tight">AI Web Research Expansions for us</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Notifications ({notifications.length})
                  </span>
                  <span className="text-[11px] text-slate-500">Live Updates</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-slate-500">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => onMarkNotificationRead(notif.id)}
                        className={`p-3 text-xs transition-colors cursor-pointer hover:bg-slate-800/50 ${
                          !notif.read ? 'bg-indigo-500/5 border-l-2 border-indigo-500' : 'opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="font-semibold text-white">{notif.title}</h5>
                          <span className="text-[10px] text-slate-500">
                            {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-300 mt-1 leading-snug">{notif.body}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors"
            >
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-7 h-7 rounded-lg object-cover border border-slate-600"
              />
              <span className="hidden sm:inline text-xs font-medium text-slate-200">{user.name}</span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  isAdmin
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}
              >
                {isAdmin ? 'Admin' : 'Member'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-white">{user.name}</div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isAdmin
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {isAdmin ? 'Admin Role' : 'Member Role'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">{user.email}</div>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-indigo-400 font-mono">
                    <ShieldCheck className="w-3 h-3" />
                    <span>@{user.github_username}</span>
                    {user.auth_provider === 'google' ? (
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded ml-auto">
                        Google Verified
                      </span>
                    ) : (
                      <span className="text-[9px] bg-slate-800 text-slate-400 px-1 rounded ml-auto">
                        GitHub Auth
                      </span>
                    )}
                  </div>

                  {/* Role Switcher Button */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        onToggleRole();
                        setShowUserMenu(false);
                      }}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 text-xs font-semibold flex items-center justify-between transition-colors"
                    >
                      <span>Switch to {isAdmin ? 'Member (Restricted)' : 'Admin (Full Access)'}</span>
                      <span className="text-[10px] font-mono opacity-75">⇋ Toggle</span>
                    </button>
                    <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                      {isAdmin
                        ? 'Admin has full access to create projects and initiate research.'
                        : 'Member has restricted access to create projects and initiate research.'}
                    </p>
                  </div>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      onOpenSettings();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <span>System Settings & Schedules</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenAuditLogs();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <span>Security & Audit Logs</span>
                  </button>
                  <a
                    href="https://github.com/we-do-care-global/we-do-care-global"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    <span>GitHub Repository</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
