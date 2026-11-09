/**
 * Cron Manager for We Do Care Global Daily & Evening Auto-Expansions
 * Handles 08:00 and 20:00 runs in Europe/Sarajevo timezone with strict idempotency.
 */

import { db } from './db';
import { runAIWebResearch } from './geminiResearcher';
import { syncService } from './syncService';
import { Expansion } from '../src/types';

export class CronManager {
  private static instance: CronManager;
  private intervalId: NodeJS.Timeout | null = null;
  private isProcessing = false;

  public static getInstance(): CronManager {
    if (!CronManager.instance) {
      CronManager.instance = new CronManager();
    }
    return CronManager.instance;
  }

  /**
   * Start background tick check (checks every 30 seconds)
   */
  start(): void {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => this.checkSchedule(), 30000);
    console.log(`Cron Manager started. Timezone: ${db.settings.daily_research_tz}, 08:00 & 20:00 monitored.`);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Check if current time in target timezone matches 08:00 or 20:00
   */
  private async checkSchedule(): Promise<void> {
    if (this.isProcessing) return;

    try {
      const now = new Date();
      const tz = db.settings.daily_research_tz || 'Europe/Sarajevo';

      // Format current time in user's timezone
      const timeFormatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      const dateFormatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

      const currentTime = timeFormatter.format(now); // e.g. "08:00"
      const currentDate = dateFormatter.format(now); // e.g. "2026-10-02"

      if (currentTime === '08:00') {
        await this.triggerScheduledRun('08:00', false, currentDate);
      } else if (currentTime === '20:00' && db.settings.evening_run_enabled) {
        await this.triggerScheduledRun('20:00', false, currentDate);
      }
    } catch (err) {
      console.error('Cron check error:', err);
    }
  }

  /**
   * Executes scheduled research run with idempotency & exponential backoff retries
   */
  async triggerScheduledRun(
    type: '08:00' | '20:00',
    force = false,
    mockDate?: string
  ): Promise<{ success: boolean; expansionsAdded: Expansion[]; message: string }> {
    if (this.isProcessing) {
      return { success: false, expansionsAdded: [], message: 'Cron job already executing' };
    }

    this.isProcessing = true;
    const tz = db.settings.daily_research_tz || 'Europe/Sarajevo';
    const dateStr = mockDate || new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

    const results: Expansion[] = [];

    try {
      // The bundled DB is in-memory; unattended runs must not claim durable idempotency.
      if (process.env.ENABLE_EPHEMERAL_CRON !== 'true') {
        throw new Error('Scheduled research disabled: durable run storage and idempotency are not configured');
      }
      const activeProjects = db.projects.filter(p => p.is_active);

      for (const project of activeProjects) {
        const idempotencyKey = `${dateStr}-${project.id}-${type}`;
        const alreadyRan = db.cronHistory.some(
          h => h.date === dateStr && h.project_id === project.id && h.type === type
        );

        if (alreadyRan && !force) {
          console.log(`Cron [${type}] already executed for ${project.name} on ${dateStr}. Skipping duplicate.`);
          continue;
        }

        // Execute with retry logic (max 3 attempts, exponential backoff)
        const expansion = await this.executeWithRetry(async () => {
          const res = await runAIWebResearch({
            projectId: project.id,
            projectName: project.name,
            projectDescription: project.description,
            repoOwner: project.repo_owner,
            repoName: project.repo_name,
            isDailyCron: true,
            query: `Identify the single highest-priority expansion for today (${type} run) focusing on systems, tools, functions, work, UX, and security.`,
          });

          if (!res.expansions || res.expansions.length === 0) {
            throw new Error('Research engine returned no proposals');
          }
          return res.expansions[0];
        }, 3);

        if (expansion) {
          // Add exactly 1 expansion
          db.expansions.unshift(expansion);
          results.push(expansion);

          // Record in cron history for idempotency
          db.cronHistory.push({
            date: dateStr,
            type,
            project_id: project.id,
            expansion_id: expansion.id,
            timestamp: new Date().toISOString(),
          });

          // Create notification
          db.notifications.unshift({
            id: `notif-${Date.now()}-${project.id}`,
            user_id: db.user.id,
            project_id: project.id,
            type: 'expansion_added',
            title: `Daily Auto-Expansion Added (${type})`,
            body: `"${expansion.title}" added to ${project.name}`,
            read: false,
            created_at: new Date().toISOString(),
          });

          // Audit log
          db.auditLogs.unshift({
            id: `audit-${Date.now()}-${project.id}`,
            user_id: db.user.id,
            action: `CRON_${type.replace(':', '')}_AUTO_EXPANSION`,
            entity: 'expansion',
            entity_id: expansion.id,
            metadata: {
              date: dateStr,
              type,
              project_id: project.id,
              idempotencyKey,
            },
            created_at: new Date().toISOString(),
          });

          // If configured, automatically create a GitHub issue
          if (db.settings.auto_create_github_issue && process.env.ENABLE_AUTOMATED_GITHUB_WRITES === 'true') {
            try {
              await syncService.createGitHubIssue(expansion.id, db.user.id);
            } catch (err) {
              console.warn('Auto GitHub issue creation failed, stored locally:', err);
            }
          }
        }
      }

      db.settings.last_cron_run = new Date().toISOString();
      return {
        success: true,
        expansionsAdded: results,
        message: results.length > 0
          ? `Successfully executed ${type} run: ${results.length} expansion(s) added.`
          : `No expansions added (idempotent run for ${dateStr}).`,
      };
    } finally {
      this.isProcessing = false;
    }
  }

  private async executeWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        return await fn();
      } catch (err) {
        attempt++;
        if (attempt >= maxRetries) throw err;
        const delayMs = Math.pow(2, attempt) * 500;
        console.warn(`Retry attempt ${attempt}/${maxRetries} after ${delayMs}ms due to:`, err);
        await new Promise(res => setTimeout(res, delayMs));
      }
    }
    throw new Error('Retries exhausted');
  }
}

export const cronManager = CronManager.getInstance();
