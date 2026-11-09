/**
 * Unified Client SyncService
 * Wraps all GitHub repository sync, issue export, draft PR creation, and real-time refresh logic.
 */

import { api } from './api';
import { GitHubRepoSyncData, SyncJob } from '../types';

export class ClientSyncService {
  private static instance: ClientSyncService;
  private listeners: Array<(data: Record<string, GitHubRepoSyncData>) => void> = [];
  private syncInProgress = false;

  public static getInstance(): ClientSyncService {
    if (!ClientSyncService.instance) {
      ClientSyncService.instance = new ClientSyncService();
    }
    return ClientSyncService.instance;
  }

  public subscribe(cb: (data: Record<string, GitHubRepoSyncData>) => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify(data: Record<string, GitHubRepoSyncData>) {
    this.listeners.forEach(cb => cb(data));
  }

  public async syncAll(): Promise<{ success: boolean; projectsSynced: number; timestamp: string }> {
    if (this.syncInProgress) {
      return { success: false, projectsSynced: 0, timestamp: new Date().toISOString() };
    }
    try {
      this.syncInProgress = true;
      const res = await api.syncAll();
      const statusRes = await api.getSyncStatus();
      this.notify(statusRes.syncData);
      return res;
    } finally {
      this.syncInProgress = false;
    }
  }

  public async syncProject(projectId: string): Promise<{ success: boolean; syncData: GitHubRepoSyncData }> {
    const res = await api.syncProject(projectId);
    const statusRes = await api.getSyncStatus();
    this.notify(statusRes.syncData);
    return res;
  }

  public async pushExpansionToGitHub(expansionId: string, asDraftPR = false): Promise<{ success: boolean; url: string }> {
    if (asDraftPR) {
      const res = await api.createDraftPR(expansionId);
      return { success: res.success, url: res.prUrl };
    } else {
      const res = await api.createGitHubIssue(expansionId);
      return { success: res.success, url: res.issueUrl };
    }
  }
}

export const syncService = ClientSyncService.getInstance();
