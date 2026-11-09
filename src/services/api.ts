/**
 * Client API Service for We Do Care Global AI Web Research Platform
 */

import {
  Project,
  Expansion,
  RoadmapItem,
  GitHubRepoSyncData,
  AuditLog,
  NotificationItem,
  AppSettings,
  UserProfile,
} from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  async loginWithGitHub(mockUser?: Partial<UserProfile>): Promise<{ success: boolean; user: UserProfile; token: string }> {
    return request('/auth/github', {
      method: 'POST',
      body: JSON.stringify({ mockUser }),
    });
  },

  async loginWithGoogle(email: string, name?: string, avatarUrl?: string): Promise<{ success: boolean; user: UserProfile; token: string }> {
    return request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ email, name, avatarUrl }),
    });
  },

  async getSession(): Promise<{ authenticated: boolean; user: UserProfile }> {
    return request('/auth/session');
  },

  async setUserRole(role: 'admin' | 'member'): Promise<{ success: boolean; user: UserProfile }> {
    return request('/auth/role', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  },

  // Profiles Table Management
  async getProfiles(): Promise<{ profiles: UserProfile[]; activeUser: UserProfile }> {
    return request('/profiles');
  },

  async updateProfileRole(id: string, role: 'admin' | 'member'): Promise<{ success: boolean; profile: UserProfile; profiles: UserProfile[]; activeUser: UserProfile }> {
    return request(`/profiles/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },

  async switchActiveProfile(profileId: string): Promise<{ success: boolean; activeUser: UserProfile }> {
    return request('/profiles/switch-active', {
      method: 'POST',
      body: JSON.stringify({ profileId }),
    });
  },

  // Projects
  async getProjects(): Promise<{ projects: Project[] }> {
    return request('/projects');
  },

  async createProject(data: {
    name: string;
    description: string;
    repo_owner: string;
    repo_name: string;
    default_branch?: string;
    visibility?: 'public' | 'private';
    research_focus?: string[];
    daily_research_time?: string;
    timezone?: string;
  }): Promise<{ project: Project }> {
    return request('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getProjectDetails(id: string): Promise<{
    project: Project;
    syncData: GitHubRepoSyncData;
    expansions: Expansion[];
    roadmap: RoadmapItem[];
  }> {
    return request(`/projects/${id}`);
  },

  async syncProject(id: string, type: string = 'all'): Promise<{ success: boolean; syncData: GitHubRepoSyncData }> {
    return request(`/projects/${id}/sync`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  },

  // AI Web Research & Expansions
  async runAIResearch(opts: {
    projectId: string;
    query?: string;
    depth?: 'quick' | 'standard' | 'deep';
    focusAreas?: string[];
  }): Promise<{ success: boolean; expansions: Expansion[]; modelUsed: string; runId: string }> {
    return request('/research/run', {
      method: 'POST',
      body: JSON.stringify(opts),
    });
  },

  async getExpansions(params?: {
    projectId?: string;
    status?: string;
    priority?: string;
    impact?: string;
    effort?: string;
    risk?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ expansions: Expansion[]; totalCount?: number }> {
    const cleanParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          cleanParams[k] = String(v);
        }
      });
    }
    const query = new URLSearchParams(cleanParams).toString();
    return request(`/research/expansions${query ? `?${query}` : ''}`);
  },

  async acceptExpansion(id: string): Promise<{ expansion: Expansion }> {
    return request(`/expansions/${id}/accept`, { method: 'POST' });
  },

  async rejectExpansion(id: string): Promise<{ expansion: Expansion }> {
    return request(`/expansions/${id}/reject`, { method: 'POST' });
  },

  async archiveExpansion(id: string): Promise<{ expansion: Expansion }> {
    return request(`/expansions/${id}/archive`, { method: 'POST' });
  },

  async createGitHubIssue(expansionId: string): Promise<{ success: boolean; issueUrl: string; issueNumber: number; expansion: Expansion }> {
    return request(`/expansions/${expansionId}/create-issue`, { method: 'POST' });
  },

  async createDraftPR(expansionId: string): Promise<{ success: boolean; prUrl: string; prNumber: number; branch: string; expansion: Expansion }> {
    return request(`/expansions/${expansionId}/create-pr`, { method: 'POST' });
  },

  // Cron / Daily Auto Expansion
  async triggerCron(type: '08:00' | '20:00' = '08:00', force: boolean = false, mockDate?: string): Promise<{
    success: boolean;
    expansionsAdded: Expansion[];
    message: string;
  }> {
    return request('/cron/daily-research', {
      method: 'POST',
      body: JSON.stringify({ type, force, mockDate }),
    });
  },

  async getCronStatus(): Promise<{
    settings: any;
    cronHistory: any[];
    lastRun?: string;
    nextRun?: string;
  }> {
    return request('/cron/status');
  },

  // Roadmap
  async getRoadmap(): Promise<{ roadmap: RoadmapItem[] }> {
    return request('/roadmap');
  },

  async updateRoadmapStatus(id: string, status: RoadmapItem['status']): Promise<{ item: RoadmapItem }> {
    return request(`/roadmap/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async createRoadmapItem(data: Partial<RoadmapItem>): Promise<{ item: RoadmapItem }> {
    return request('/roadmap', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // GitHub Sync & Webhooks
  async getSyncStatus(): Promise<{ syncData: Record<string, GitHubRepoSyncData>; jobs: any[] }> {
    return request('/sync/status');
  },

  async syncAll(): Promise<{ success: boolean; projectsSynced: number; timestamp: string }> {
    return request('/sync/all', { method: 'POST' });
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: NotificationItem[] }> {
    return request('/notifications');
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return request(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  // Settings
  async getSettings(): Promise<{ settings: AppSettings }> {
    return request('/settings');
  },

  async saveSettings(settings: Partial<AppSettings>): Promise<{ settings: AppSettings }> {
    return request('/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  },

  // Audit Logs
  async getAuditLogs(): Promise<{ auditLogs: AuditLog[] }> {
    return request('/audit-logs');
  },

  // GitHub Repository Labels
  async getLabels(projectId: string): Promise<{ labels: any[] }> {
    return request(`/projects/${projectId}/labels`);
  },

  async addLabel(
    projectId: string,
    label: { name: string; color: string; description?: string }
  ): Promise<{ success: boolean; label: any; labels: any[] }> {
    return request(`/projects/${projectId}/labels`, {
      method: 'POST',
      body: JSON.stringify(label),
    });
  },

  async deleteLabel(
    projectId: string,
    labelName: string
  ): Promise<{ success: boolean; deleted: string; labels: any[] }> {
    return request(`/projects/${projectId}/labels/${encodeURIComponent(labelName)}`, {
      method: 'DELETE',
    });
  },

  // 5 Background Workers Pool & RAM
  async getWorkerMetrics(): Promise<any> {
    return request('/workers/status');
  },

  async optimizeRam(): Promise<{ success: boolean; message: string; metrics: any }> {
    return request('/workers/optimize-ram', {
      method: 'POST',
    });
  },
};
