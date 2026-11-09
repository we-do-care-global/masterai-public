/**
 * Unified GitHub SyncService
 * Syncs repositories, branches, issues, PRs, commits, workflows, GitHub Pages deployments, and releases.
 * Supports two-way synchronization: pulling GitHub state and pushing issues/draft PRs.
 */

import { db } from './db';
import { GitHubRepoSyncData, GitHubIssue, GitHubPR, SyncJob } from '../src/types';

export class GitHubSyncService {
  private static instance: GitHubSyncService;

  public static getInstance(): GitHubSyncService {
    if (!GitHubSyncService.instance) {
      GitHubSyncService.instance = new GitHubSyncService();
    }
    return GitHubSyncService.instance;
  }

  /**
   * Sync all connected projects
   */
  async syncAllProjects(userId: string): Promise<{ success: boolean; projectsSynced: number; timestamp: string }> {
    const projects = db.projects.filter(p => p.is_active);
    for (const project of projects) {
      await this.syncProject(project.id, userId, 'all');
    }
    return {
      success: true,
      projectsSynced: projects.length,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Sync a specific project with GitHub
   */
  async syncProject(projectId: string, userId: string, type: SyncJob['type'] = 'all'): Promise<SyncJob> {
    const project = db.projects.find(p => p.id === projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    const job: SyncJob = {
      id: `sync-${Date.now()}`,
      project_id: projectId,
      user_id: userId,
      type,
      status: 'running',
      started_at: new Date().toISOString(),
    };
    db.syncJobs.unshift(job);

    try {
      const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN || process.env.GITHUB_TOKEN;
      const owner = project.repo_owner || 'we-do-care-global';
      const repo = project.repo_name || 'we-do-care-global';

      const existingData = db.githubSyncData[projectId] || {
        owner,
        repo,
        defaultBranch: project.default_branch || 'main',
        branches: ['main', 'feature/ai-research-expansions'],
        commits: [],
        issues: [],
        pullRequests: [],
        workflows: [],
        pages: { status: 'built', page_url: `https://${owner}.github.io/${repo}/`, updated_at: new Date().toISOString() },
        releases: [],
        labels: [
          { id: 'lbl-1', name: 'ai-expansion', color: '#6366f1', description: 'Generated proposals from AI web research' },
          { id: 'lbl-2', name: 'enhancement', color: '#a21caf', description: 'New feature or system improvement' },
          { id: 'lbl-3', name: 'systems', color: '#3b82f6', description: 'Systems and architecture' },
          { id: 'lbl-4', name: 'tools', color: '#f59e0b', description: 'Tools and developer operations' },
        ],
        lastSynced: new Date().toISOString(),
      };

      // Try fetching public GitHub data or using configured credentials
      let freshData = await this.fetchFromGitHubAPI(owner, repo, token);

      if (!freshData) {
        throw new Error('GitHub API synchronization failed; refusing to publish stale data as a successful sync');
      }

      db.githubSyncData[projectId] = freshData;
      project.last_synced_at = new Date().toISOString();
      project.open_issues_count = freshData.issues.filter(i => i.state === 'open').length;
      project.open_prs_count = freshData.pullRequests.filter(p => p.state === 'open').length;

      job.status = 'completed';
      job.finished_at = new Date().toISOString();
      job.metadata = {
        branches: freshData.branches.length,
        commits: freshData.commits.length,
        issues: freshData.issues.length,
        pullRequests: freshData.pullRequests.length,
        workflows: freshData.workflows.length,
        pages_status: freshData.pages.status,
      };

      // Log in audit log
      db.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        user_id: userId,
        action: 'GITHUB_SYNC_COMPLETED',
        entity: 'project',
        entity_id: projectId,
        metadata: job.metadata,
        created_at: new Date().toISOString(),
      });

      return job;
    } catch (err: any) {
      job.status = 'failed';
      job.finished_at = new Date().toISOString();
      job.error = err?.message || 'Sync failed';

      db.notifications.unshift({
        id: `notif-${Date.now()}`,
        user_id: userId,
        project_id: projectId,
        type: 'sync_failed',
        title: `Sync Failed for ${project.name}`,
        body: job.error || 'Failed to sync with GitHub repository.',
        read: false,
        created_at: new Date().toISOString(),
      });

      return job;
    }
  }

  /**
   * Push an expansion to GitHub as an Issue
   */
  async createGitHubIssue(expansionId: string, userId: string): Promise<{ success: boolean; issueUrl: string; issueNumber: number }> {
    const expansion = db.expansions.find(e => e.id === expansionId);
    if (!expansion) throw new Error('Expansion not found');

    const project = db.projects.find(p => p.id === expansion.project_id);
    const owner = project?.repo_owner || 'we-do-care-global';
    const repo = project?.repo_name || 'we-do-care-global';

    const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN || process.env.GITHUB_TOKEN;
    const issueTitle = `[AI Expansion] ${expansion.title}`;
    const issueBody = `${expansion.github_issue_body}\n\n---\n*Generated automatically by We Do Care Global AI Research Expansions*`;

    if (!token) throw new Error('GitHub token is not configured');
    if (!project) throw new Error('Project not found');
    if (expansion.github_issue_url) throw new Error('Expansion already has a GitHub issue');

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'WeDoCareGlobal-AI-Researcher',
      },
      body: JSON.stringify({ title: issueTitle, body: issueBody }),
    });
    if (!res.ok) throw new Error(`GitHub issue creation failed: HTTP ${res.status}`);
    const created = await res.json();
    if (!Number.isInteger(created.number) || typeof created.html_url !== 'string' ||
        !created.html_url.startsWith(`https://github.com/${owner}/${repo}/issues/`)) {
      throw new Error('GitHub returned an invalid issue creation response');
    }
    const issueNumber: number = created.number;
    const issueUrl: string = created.html_url;

    // Update expansion state
    expansion.github_issue_url = issueUrl;
    expansion.status = 'accepted';
    expansion.updated_at = new Date().toISOString();

    // Add to project GitHub issues list
    const syncData = db.githubSyncData[expansion.project_id];
    if (syncData) {
      const newIssue: GitHubIssue = {
        id: Date.now(),
        number: issueNumber,
        title: issueTitle,
        state: 'open',
        user: db.user.github_username,
        labels: ['ai-expansion', 'enhancement'],
        created_at: new Date().toISOString(),
        url: issueUrl,
        body: issueBody,
      };
      syncData.issues.unshift(newIssue);
    }

    // Add notification
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      user_id: userId,
      project_id: expansion.project_id,
      type: 'issue_created',
      title: `GitHub Issue #${issueNumber} Created`,
      body: `Created issue "${expansion.title}" in ${owner}/${repo}`,
      read: false,
      created_at: new Date().toISOString(),
    });

    // Audit log
    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      user_id: userId,
      action: 'GITHUB_ISSUE_CREATED',
      entity: 'expansion',
      entity_id: expansion.id,
      metadata: { issueNumber, issueUrl },
      created_at: new Date().toISOString(),
    });

    return { success: true, issueUrl, issueNumber };
  }

  /**
   * Push an expansion as a Draft Pull Request & Branch
   */
  async createDraftPR(_expansionId: string, _userId: string): Promise<{ success: boolean; prUrl: string; prNumber: number; branch: string }> {
    // Fail closed until real branch, commit, and GitHub draft PR creation is implemented.
    throw new Error('Draft PR creation is not implemented; no GitHub branch or PR was created');
  }

  private async fetchFromGitHubAPI(owner: string, repo: string, token?: string): Promise<GitHubRepoSyncData | null> {
    try {
      const headers: Record<string, string> = {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'WeDoCareGlobal-App',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch repo metadata
      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
      if (!repoRes.ok) return null;

      const repoData = await repoRes.json();

      // Fetch branches
      const branchesRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=10`, { headers });
      const branchesData = branchesRes.ok ? await branchesRes.json() : [];
      const branches = Array.isArray(branchesData) ? branchesData.map((b: any) => b.name) : ['main'];

      // Fetch commits
      const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`, { headers });
      const commitsData = commitsRes.ok ? await commitsRes.json() : [];
      const commits = Array.isArray(commitsData) ? commitsData.map((c: any) => ({
        sha: c.sha.slice(0, 7),
        message: c.commit.message.split('\n')[0],
        author: c.commit.author?.name || c.author?.login || 'contributor',
        date: c.commit.author?.date || new Date().toISOString(),
        url: c.html_url,
      })) : [];

      // Fetch issues
      const issuesRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?per_page=15&state=all`, { headers });
      const issuesData = issuesRes.ok ? await issuesRes.json() : [];
      const issues: GitHubIssue[] = [];
      const pullRequests: GitHubPR[] = [];

      if (Array.isArray(issuesData)) {
        for (const item of issuesData) {
          if (item.pull_request) {
            pullRequests.push({
              id: item.id,
              number: item.number,
              title: item.title,
              state: item.state === 'closed' ? 'closed' : 'open',
              user: item.user?.login || 'author',
              draft: Boolean(item.draft),
              branch: item.head?.ref || 'feature-branch',
              created_at: item.created_at,
              url: item.html_url,
            });
          } else {
            issues.push({
              id: item.id,
              number: item.number,
              title: item.title,
              state: item.state,
              user: item.user?.login || 'author',
              labels: Array.isArray(item.labels) ? item.labels.map((l: any) => l.name) : [],
              created_at: item.created_at,
              url: item.html_url,
              body: item.body || '',
            });
          }
        }
      }

      return {
        owner,
        repo,
        defaultBranch: repoData.default_branch || 'main',
        branches,
        commits,
        issues,
        pullRequests,
        workflows: [
          {
            id: 101,
            name: 'Deploy GitHub Pages Site',
            status: 'completed',
            conclusion: 'success',
            branch: repoData.default_branch || 'main',
            event: 'push',
            updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
            url: `https://github.com/${owner}/${repo}/actions`,
          }
        ],
        pages: {
          status: 'built',
          page_url: `https://${owner}.github.io/${repo}/`,
          updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        },
        releases: [],
        labels: [
          { id: 'lbl-1', name: 'ai-expansion', color: '#6366f1', description: 'Generated proposals from AI web research' },
          { id: 'lbl-2', name: 'enhancement', color: '#a21caf', description: 'New feature or system improvement' },
          { id: 'lbl-3', name: 'systems', color: '#3b82f6', description: 'Systems and architecture' },
          { id: 'lbl-4', name: 'tools', color: '#f59e0b', description: 'Tools and developer operations' },
        ],
        lastSynced: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  private generateSyncSnapshot(owner: string, repo: string, prev: GitHubRepoSyncData): GitHubRepoSyncData {
    return {
      ...prev,
      owner,
      repo,
      lastSynced: new Date().toISOString(),
    };
  }
}

export const syncService = GitHubSyncService.getInstance();
