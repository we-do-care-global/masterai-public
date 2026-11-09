/**
 * Main Application Component for We Do Care Global AI Web Research Platform
 */

import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { syncService } from './services/SyncService';
import {
  Project,
  Expansion,
  GitHubRepoSyncData,
  RoadmapItem,
  NotificationItem,
  AppSettings,
  AuditLog,
  UserProfile,
  RoadmapStatus,
} from './types';
import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ExpansionsListView } from './components/ExpansionsListView';
import { ProjectsView } from './components/ProjectsView';
import { KanbanBoard } from './components/KanbanBoard';
import { GitHubSyncPanel } from './components/GitHubSyncPanel';
import { DailyCronMonitor } from './components/DailyCronMonitor';
import { SettingsView } from './components/SettingsView';
import { AuditLogModal } from './components/AuditLogModal';
import { ResearchModal } from './components/ResearchModal';
import { ExpansionDetailModal } from './components/ExpansionDetailModal';
import { NewProjectModal } from './components/NewProjectModal';
import { LoginView } from './components/LoginView';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [expansions, setExpansions] = useState<Expansion[]>([]);
  const [syncData, setSyncData] = useState<Record<string, GitHubRepoSyncData>>({});
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [cronHistory, setCronHistory] = useState<any[]>([]);

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isResearchModalOpen, setIsResearchModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [selectedExpansion, setSelectedExpansion] = useState<Expansion | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Initial Data Fetch
  const loadInitialData = async () => {
    try {
      const session = await api.getSession();
      if (session.authenticated && session.user) {
        setUser(session.user);
      }

      const [projRes, expRes, roadRes, notifRes, setRes, syncRes, cronRes, auditRes] = await Promise.all([
        api.getProjects(),
        api.getExpansions(),
        api.getRoadmap(),
        api.getNotifications(),
        api.getSettings(),
        api.getSyncStatus(),
        api.getCronStatus(),
        api.getAuditLogs(),
      ]);

      setProjects(projRes.projects);
      if (projRes.projects.length > 0 && !activeProject) {
        setActiveProject(projRes.projects[0]);
      }
      setExpansions(expRes.expansions);
      setRoadmapItems(roadRes.roadmap);
      setNotifications(notifRes.notifications);
      setSettings(setRes.settings);
      setSyncData(syncRes.syncData);
      setCronHistory(cronRes.cronHistory);
      setAuditLogs(auditRes.auditLogs);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    loadInitialData();

    // Subscribe to unified SyncService updates
    const unsubscribe = syncService.subscribe(freshData => {
      setSyncData(freshData);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (customProfile?: Partial<UserProfile>) => {
    try {
      const res = await api.loginWithGitHub(customProfile);
      setUser(res.user);
      addToast('success', 'Logged in with GitHub', `Authenticated as @${res.user.github_username}`);
      await loadInitialData();
    } catch (err: any) {
      addToast('error', 'Login Failed', err?.message || 'Could not authenticate');
    }
  };

  const handleGoogleLogin = async (email: string, name?: string, avatarUrl?: string) => {
    try {
      const res = await api.loginWithGoogle(email, name, avatarUrl);
      setUser(res.user);
      addToast('success', 'Google Authentication Verified', `Welcome back, ${res.user.name} (${res.user.email})`);
      await loadInitialData();
    } catch (err: any) {
      addToast('error', 'Google Authentication Rejected', err?.message || 'Access denied');
      throw err;
    }
  };

  const handleAddLabel = async (projectId: string, label: { name: string; color: string; description?: string }) => {
    try {
      const res = await api.addLabel(projectId, label);
      setSyncData(prev => ({
        ...prev,
        [projectId]: {
          ...prev[projectId],
          labels: res.labels,
        },
      }));
      addToast('success', 'Label Created', `Added "${label.name}" to GitHub repository labels.`);
    } catch (err: any) {
      addToast('error', 'Failed to add label', err?.message);
      throw err;
    }
  };

  const handleDeleteLabel = async (projectId: string, labelName: string) => {
    try {
      const res = await api.deleteLabel(projectId, labelName);
      setSyncData(prev => ({
        ...prev,
        [projectId]: {
          ...prev[projectId],
          labels: res.labels,
        },
      }));
      addToast('info', 'Label Removed', `Deleted label "${labelName}".`);
    } catch (err: any) {
      addToast('error', 'Failed to delete label', err?.message);
      throw err;
    }
  };

  const handleToggleRole = async () => {
    if (!user) return;
    const newRole = user.role === 'admin' ? 'member' : 'admin';
    try {
      const res = await api.setUserRole(newRole);
      setUser(res.user);
      addToast(
        'info',
        `Role Switched to ${newRole === 'admin' ? 'Admin' : 'Member'}`,
        newRole === 'admin'
          ? 'Full access granted to create projects and initiate research.'
          : 'Restricted access: cannot create projects or initiate research.'
      );
    } catch (err: any) {
      addToast('error', 'Failed to switch role', err?.message);
    }
  };

  const handleSyncNow = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    addToast('info', 'GitHub Sync in progress', 'Reconciling branches, issues, PRs, and Pages status...');
    try {
      if (activeProject) {
        await syncService.syncProject(activeProject.id);
      } else {
        await syncService.syncAll();
      }
      const [syncRes, notifRes, auditRes] = await Promise.all([
        api.getSyncStatus(),
        api.getNotifications(),
        api.getAuditLogs(),
      ]);
      setSyncData(syncRes.syncData);
      setNotifications(notifRes.notifications);
      setAuditLogs(auditRes.auditLogs);
      addToast('success', 'GitHub Sync Completed', 'All repository state synchronized.');
    } catch (err: any) {
      addToast('error', 'Sync Failed', err?.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRunAIResearch = async (opts: {
    projectId: string;
    query?: string;
    depth: 'quick' | 'standard' | 'deep';
    focusAreas: string[];
  }): Promise<Expansion[]> => {
    try {
      const res = await api.runAIResearch(opts);
      const [expRes, notifRes, auditRes] = await Promise.all([
        api.getExpansions(),
        api.getNotifications(),
        api.getAuditLogs(),
      ]);
      setExpansions(expRes.expansions);
      setNotifications(notifRes.notifications);
      setAuditLogs(auditRes.auditLogs);
      addToast('success', 'AI Web Research Complete', `Generated ${res.expansions.length} expansion proposals using ${res.modelUsed}`);
      return res.expansions;
    } catch (err: any) {
      addToast('error', 'Research Execution Failed', err?.message);
      throw err;
    }
  };

  const handleCreateProject = async (data: any) => {
    try {
      const res = await api.createProject(data);
      setProjects(prev => [res.project, ...prev]);
      setActiveProject(res.project);
      addToast('success', 'Project Created', `Linked ${res.project.repo_owner}/${res.project.repo_name}`);
      await handleSyncNow();
    } catch (err: any) {
      addToast('error', 'Failed to Create Project', err?.message);
    }
  };

  const handleAcceptExpansion = async (id: string) => {
    try {
      const res = await api.acceptExpansion(id);
      setExpansions(prev => prev.map(e => e.id === id ? res.expansion : e));
      if (selectedExpansion?.id === id) {
        setSelectedExpansion(res.expansion);
      }
      const roadRes = await api.getRoadmap();
      setRoadmapItems(roadRes.roadmap);
      addToast('success', 'Expansion Accepted', 'Added to execution backlog');
    } catch (err: any) {
      addToast('error', 'Action failed', err?.message);
    }
  };

  const handleRejectExpansion = async (id: string) => {
    try {
      const res = await api.rejectExpansion(id);
      setExpansions(prev => prev.map(e => e.id === id ? res.expansion : e));
      if (selectedExpansion?.id === id) {
        setSelectedExpansion(res.expansion);
      }
      addToast('info', 'Expansion Rejected', 'Status updated.');
    } catch (err: any) {
      addToast('error', 'Action failed', err?.message);
    }
  };

  const handleArchiveExpansion = async (id: string) => {
    try {
      const res = await api.archiveExpansion(id);
      setExpansions(prev => prev.map(e => e.id === id ? res.expansion : e));
      if (selectedExpansion?.id === id) {
        setSelectedExpansion(res.expansion);
      }
      addToast('info', 'Expansion Archived', 'Archived for reference.');
    } catch (err: any) {
      addToast('error', 'Action failed', err?.message);
    }
  };

  const handleCreateGitHubIssue = async (id: string) => {
    try {
      const res = await api.createGitHubIssue(id);
      setExpansions(prev => prev.map(e => e.id === id ? res.expansion : e));
      if (selectedExpansion?.id === id) {
        setSelectedExpansion(res.expansion);
      }
      const [syncRes, notifRes, auditRes] = await Promise.all([
        api.getSyncStatus(),
        api.getNotifications(),
        api.getAuditLogs(),
      ]);
      setSyncData(syncRes.syncData);
      setNotifications(notifRes.notifications);
      setAuditLogs(auditRes.auditLogs);
      addToast('success', `GitHub Issue #${res.issueNumber} Created`, 'Exported expansion to repository issues.');
    } catch (err: any) {
      addToast('error', 'Failed to create issue', err?.message);
    }
  };

  const handleCreateDraftPR = async (id: string) => {
    try {
      const res = await api.createDraftPR(id);
      setExpansions(prev => prev.map(e => e.id === id ? res.expansion : e));
      if (selectedExpansion?.id === id) {
        setSelectedExpansion(res.expansion);
      }
      const [syncRes, notifRes, auditRes] = await Promise.all([
        api.getSyncStatus(),
        api.getNotifications(),
        api.getAuditLogs(),
      ]);
      setSyncData(syncRes.syncData);
      setNotifications(notifRes.notifications);
      setAuditLogs(auditRes.auditLogs);
      addToast('success', `Draft PR #${res.prNumber} Created`, `Opened branch ${res.branch}`);
    } catch (err: any) {
      addToast('error', 'Failed to create draft PR', err?.message);
    }
  };

  const handleAddToRoadmap = async (id: string) => {
    const exp = expansions.find(e => e.id === id);
    if (!exp) return;
    try {
      const res = await api.createRoadmapItem({
        project_id: exp.project_id,
        expansion_id: exp.id,
        title: exp.title,
        description: exp.summary,
        status: 'planned',
        priority: exp.priority,
        github_issue_url: exp.github_issue_url,
        github_pr_url: exp.github_pr_url,
      });
      setRoadmapItems(prev => [res.item, ...prev]);
      addToast('success', 'Added to Roadmap', 'Item placed in Planned column.');
    } catch (err: any) {
      addToast('error', 'Failed to add to roadmap', err?.message);
    }
  };

  const handleUpdateRoadmapStatus = async (id: string, status: RoadmapStatus) => {
    try {
      const res = await api.updateRoadmapStatus(id, status);
      setRoadmapItems(prev => prev.map(r => r.id === id ? res.item : r));
    } catch (err: any) {
      addToast('error', 'Update failed', err?.message);
    }
  };

  const handleTriggerDailyCron = async (type: '08:00' | '20:00', force: boolean, mockDate?: string) => {
    try {
      const res = await api.triggerCron(type, force, mockDate);
      const [expRes, notifRes, auditRes, cronRes] = await Promise.all([
        api.getExpansions(),
        api.getNotifications(),
        api.getAuditLogs(),
        api.getCronStatus(),
      ]);
      setExpansions(expRes.expansions);
      setNotifications(notifRes.notifications);
      setAuditLogs(auditRes.auditLogs);
      setCronHistory(cronRes.cronHistory);
      addToast('success', `Cron Triggered (${type})`, res.message);
      return res;
    } catch (err: any) {
      addToast('error', 'Cron Execution Failed', err?.message);
      throw err;
    }
  };

  const handleSaveSettings = async (updated: Partial<AppSettings>) => {
    try {
      const res = await api.saveSettings(updated);
      setSettings(res.settings);
      addToast('success', 'Settings Saved', 'Cron schedule and integration settings updated.');
    } catch (err: any) {
      addToast('error', 'Failed to save settings', err?.message);
      throw err;
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return <LoginView onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} />;
  }

  const activeSyncData = activeProject ? syncData[activeProject.id] : null;
  const dailyExpansion = expansions.find(e => e.research_run_id === 'run-cron-0800') || expansions[0] || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Top Navigation */}
      <Navbar
        user={user}
        projects={projects}
        activeProject={activeProject}
        onSelectProject={setActiveProject}
        onOpenResearchModal={() => setIsResearchModalOpen(true)}
        onSyncNow={handleSyncNow}
        isSyncing={isSyncing}
        lastSyncedTime={activeSyncData?.lastSynced}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onOpenSettings={() => setActiveTab('settings')}
        onOpenAuditLogs={() => setIsAuditModalOpen(true)}
        onToggleRole={handleToggleRole}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeProject={activeProject}
          openIssuesCount={activeSyncData?.issues.filter(i => i.state === 'open').length}
          openPRsCount={activeSyncData?.pullRequests.filter(p => p.state === 'open').length}
          unreviewedExpansionsCount={expansions.filter(e => e.status === 'proposed').length}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950/70">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                activeProject={activeProject}
                dailyExpansion={dailyExpansion}
                recentExpansions={expansions}
                syncData={activeSyncData}
                roadmapItems={roadmapItems}
                currentUser={user}
                isSyncing={isSyncing}
                onOpenResearchModal={() => setIsResearchModalOpen(true)}
                onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
                onSelectExpansion={setSelectedExpansion}
                onCreateIssue={handleCreateGitHubIssue}
                onSyncNow={handleSyncNow}
                onTriggerDailyTest={() => handleTriggerDailyCron('08:00', true)}
                onViewAllExpansions={() => setActiveTab('research')}
                onViewKanban={() => setActiveTab('roadmap')}
              />
            )}

            {activeTab === 'research' && (
              <ExpansionsListView
                expansions={expansions}
                projects={projects}
                currentUser={user}
                onOpenResearchModal={() => setIsResearchModalOpen(true)}
                onSelectExpansion={setSelectedExpansion}
                onCreateIssue={handleCreateGitHubIssue}
              />
            )}

            {activeTab === 'projects' && (
              <ProjectsView
                projects={projects}
                activeProject={activeProject}
                currentUser={user}
                onSelectProject={setActiveProject}
                onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
                onSyncProject={pid => {
                  const target = projects.find(p => p.id === pid);
                  if (target) {
                    setActiveProject(target);
                    handleSyncNow();
                  }
                }}
                onRunResearchForProject={p => {
                  setActiveProject(p);
                  setIsResearchModalOpen(true);
                }}
                isSyncing={isSyncing}
              />
            )}

            {activeTab === 'roadmap' && (
              <KanbanBoard
                items={roadmapItems}
                projects={projects}
                onUpdateStatus={handleUpdateRoadmapStatus}
                onAddItem={async data => {
                  const res = await api.createRoadmapItem(data);
                  setRoadmapItems(prev => [res.item, ...prev]);
                  addToast('success', 'Roadmap item added');
                }}
              />
            )}

            {activeTab === 'github' && (
              <GitHubSyncPanel
                project={activeProject}
                syncData={activeSyncData}
                isSyncing={isSyncing}
                onSyncNow={handleSyncNow}
                onAddLabel={handleAddLabel}
                onDeleteLabel={handleDeleteLabel}
              />
            )}

            {activeTab === 'daily' && (
              <DailyCronMonitor
                settings={settings}
                projects={projects}
                cronHistory={cronHistory}
                onTriggerCron={handleTriggerDailyCron}
              />
            )}

            {activeTab === 'audit' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-lg text-white">System Security & Audit Trail</h3>
                <div className="divide-y divide-slate-800 text-xs">
                  {auditLogs.map(log => (
                    <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-indigo-400 font-bold">{log.action}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-200">{log.entity}: {log.entity_id}</span>
                        </div>
                        {log.metadata && (
                          <pre className="text-[10px] font-mono text-slate-400 mt-1">
                            {JSON.stringify(log.metadata)}
                          </pre>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono shrink-0">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <SettingsView settings={settings} currentUser={user} onSave={handleSaveSettings} />
            )}
          </div>
        </main>
      </div>

      {/* Research Discovery Modal */}
      <ResearchModal
        isOpen={isResearchModalOpen}
        onClose={() => setIsResearchModalOpen(false)}
        projects={projects}
        activeProject={activeProject}
        currentUser={user}
        onRunResearch={handleRunAIResearch}
        onSelectExpansion={setSelectedExpansion}
      />

      {/* Expansion Details & Action Modal */}
      <ExpansionDetailModal
        expansion={selectedExpansion}
        onClose={() => setSelectedExpansion(null)}
        onAccept={handleAcceptExpansion}
        onReject={handleRejectExpansion}
        onArchive={handleArchiveExpansion}
        onCreateIssue={handleCreateGitHubIssue}
        onCreateDraftPR={handleCreateDraftPR}
        onAddToRoadmap={handleAddToRoadmap}
      />

      {/* New Project Wizard Modal */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        currentUser={user}
        onCreateProject={handleCreateProject}
      />

      {/* Audit Log Modal */}
      <AuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        logs={auditLogs}
      />
    </div>
  );
}
