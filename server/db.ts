/**
 * In-memory backend data store with persistent initial state for We Do Care Global
 */

import {
  Project,
  Expansion,
  ResearchRun,
  RoadmapItem,
  SyncJob,
  GitHubRepoSyncData,
  AuditLog,
  NotificationItem,
  AppSettings,
  UserProfile,
} from '../src/types';

export interface DBState {
  profiles: UserProfile[];
  user: UserProfile;
  projects: Project[];
  expansions: Expansion[];
  researchRuns: ResearchRun[];
  roadmapItems: RoadmapItem[];
  syncJobs: SyncJob[];
  githubSyncData: Record<string, GitHubRepoSyncData>;
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  settings: AppSettings;
  cronHistory: Array<{
    date: string;
    type: '08:00' | '20:00';
    project_id: string;
    expansion_id: string;
    timestamp: string;
  }>;
}

const DEFAULT_PROJECT_ID = 'proj-wdc-01';

export const db: DBState = {
  profiles: [
    {
      id: 'user-emir-01',
      email: 'demo.admin@example.invalid',
      github_username: 'demo-admin',
      name: 'Demo Admin',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'admin',
      connected_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'user-member-02',
      email: 'demo.member@example.invalid',
      github_username: 'demo-member',
      name: 'Demo Member',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      role: 'member',
      connected_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    }
  ],
  user: {
    id: 'user-emir-01',
    email: 'demo.admin@example.invalid',
    github_username: 'demo-admin',
    name: 'Demo Admin',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    connected_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  },
  projects: [
    {
      id: DEFAULT_PROJECT_ID,
      owner_id: 'user-emir-01',
      name: 'We Do Care Global — Main Platform',
      description: 'Core support and community ecosystem assisting widows, families, and humanitarian relief worldwide.',
      repo_owner: 'we-do-care-global',
      repo_name: 'we-do-care-global',
      repo_url: 'https://github.com/we-do-care-global/we-do-care-global',
      default_branch: 'main',
      visibility: 'public',
      research_focus: ['systems', 'tools', 'functions', 'work', 'automation', 'UX', 'security'],
      daily_research_time: '08:00',
      timezone: 'Europe/Sarajevo',
      is_active: true,
      last_synced_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      open_issues_count: 5,
      open_prs_count: 2,
      created_at: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: 'proj-wdc-02',
      owner_id: 'user-emir-01',
      name: 'CareCommunity Outreach & Mentorship Portal',
      description: 'Peer-to-peer connection network, local support group locator, and family counseling scheduling tool.',
      repo_owner: 'we-do-care-global',
      repo_name: 'care-outreach-portal',
      repo_url: 'https://github.com/we-do-care-global/care-outreach-portal',
      default_branch: 'main',
      visibility: 'public',
      research_focus: ['systems', 'tools', 'functions', 'work', 'performance', 'monetization'],
      daily_research_time: '08:00',
      timezone: 'Europe/Sarajevo',
      is_active: true,
      last_synced_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      open_issues_count: 2,
      open_prs_count: 1,
      created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    }
  ],
  expansions: [
    {
      id: 'exp-daily-today',
      project_id: DEFAULT_PROJECT_ID,
      research_run_id: 'run-cron-0800',
      title: 'Automated Micro-Donation & Donor Impact Telegram/WhatsApp Bot with Stripe Treasury',
      summary: 'Implement automated multilingual messaging triggers for donor updates, milestone tracking, and 1-click micro-giving via secure webhook integration.',
      why_now: 'Recent charity engagement data shows 42% higher retention when donors receive real-time impact stories and receipt summaries over messaging channels.',
      impact: 'High',
      effort: 'Medium',
      risk: 'Low',
      systems_affected: ['Payment Processing Core', 'Donor Relationship Pipeline', 'Notification Delivery Broker'],
      tools_affected: ['Stripe Webhooks', 'Twilio Messaging API', 'GitHub Actions Dispatcher', 'Supabase Realtime'],
      functions_affected: ['Donor Onboarding', 'Tax-Deductible Receipt Generation', 'Emergency Family Care Fund Allocation'],
      work_affected: ['Community Support Coordinator Daily Log', 'Finance Reconciliations', 'Volunteer Outreach'],
      implementation_steps: [
        'Set up Twilio WhatsApp Business template for recurring giving reminders',
        'Configure Stripe Webhook endpoint to catch charge.succeeded and invoice.paid',
        'Dispatch instant PDF receipt generator edge function',
        'Sync donor milestone tags into GitHub issues backlog for transparency reports'
      ],
      code_tasks: [
        'src/services/donorBot.ts: implement webhook listener and SMS/WhatsApp dispatcher',
        'supabase/functions/generate-receipt/index.ts: render tax statement using pdf-lib',
        'test/donorBot.test.ts: verify idempotent receipt delivery and rate limiting'
      ],
      github_issue_body: `## Expansion Proposal: Automated Micro-Donation & Donor Impact Bot\n\n### Why Now\nDonors require instant transparency into how funds assist families and local grief support sessions.\n\n### Systems Affected\n- Payment Processing Core\n- Donor Relationship Pipeline\n- Notification Delivery Broker\n\n### Action Items\n- [ ] Configure Twilio WhatsApp Business Template\n- [ ] Add Stripe Webhook listener in Supabase Edge Function\n- [ ] Integrate with audit_logs for donation ledger compliance\n- [ ] Deploy test to staging environment`,
      sources: [
        {
          title: 'Charity Navigator & Giving Report: Digital Messaging in Non-Profit Donor Retention',
          url: 'https://wedocare.org',
          snippet: 'Direct mobile engagement yields 3x repeat contributions compared to standard email blasts.'
        },
        {
          title: 'Stripe Documentation: Non-Profit Recurring Giving and Treasury Webhooks',
          url: 'https://stripe.com/docs/billing',
          snippet: 'Using webhooks for instant receipt generation and subscription lifecycle triggers.'
        }
      ],
      status: 'accepted',
      priority: 'high',
      owner_id: 'user-emir-01',
      github_issue_url: 'https://github.com/we-do-care-global/we-do-care-global/issues/14',
      created_at: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'exp-02',
      project_id: DEFAULT_PROJECT_ID,
      research_run_id: 'run-init-01',
      title: 'Decentralized Peer-to-Peer Grief Support Group Scheduler & Private Video Rooms',
      summary: 'Deploy end-to-end encrypted video meeting scheduling with automated timezone conversion and volunteer moderator rotation.',
      why_now: 'Expanding community requests across 12 countries revealed high friction with third-party meeting links and timezone errors.',
      impact: 'High',
      effort: 'High',
      risk: 'Medium',
      systems_affected: ['Care Calendar Service', 'Video Room Mesh', 'Volunteer Access Control'],
      tools_affected: ['Daily.co / LiveKit WebRTC', 'Calendar ICS Generator', 'Postgres RLS'],
      functions_affected: ['Group Therapy Booking', 'Confidential Attendance Log', 'Crisis Escalation Protocol'],
      work_affected: ['Volunteer Facilitator Workflow', 'Intake Specialist Follow-up'],
      implementation_steps: [
        'Architect room token generation service with short-lived expiration',
        'Create self-scheduling portal for widow peer groups with timezone selector',
        'Implement automated SMS reminder 1 hour prior to session',
        'Add moderator breakout and emergency helpline escalation button'
      ],
      code_tasks: [
        'src/services/videoRooms.ts: WebRTC session manager',
        'src/components/CalendarScheduler.tsx: interactive booking calendar',
        'server/routes/rooms.ts: ephemeral token generator'
      ],
      github_issue_body: `## Expansion Proposal: Peer-to-Peer Support Group Scheduler\n\n### Objective\nProvide safe, frictionless virtual spaces for grief support circles.\n\n### Implementation Tasks\n- [ ] LiveRTC / Daily token generation\n- [ ] Timezone-aware booking engine\n- [ ] Automated SMS reminders via Twilio`,
      sources: [
        {
          title: 'We Do Care Community Guidelines & Support Group Framework',
          url: 'https://we-do-care-global.github.io/we-do-care-global/',
          snippet: 'Peer support structures empowering widow warriors and children in grief.'
        }
      ],
      status: 'proposed',
      priority: 'critical',
      created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'exp-03',
      project_id: DEFAULT_PROJECT_ID,
      research_run_id: 'run-init-02',
      title: 'Automated GitHub Pages Deployment Healthcheck & Broken Link Sentinel',
      summary: 'Continuous synthetic monitoring GitHub Action that crawls all published documentation and volunteer forms on GitHub Pages weekly.',
      why_now: 'Stale links to external grief counseling resources can leave vulnerable users without immediate assistance.',
      impact: 'Medium',
      effort: 'Low',
      risk: 'Low',
      systems_affected: ['GitHub Actions CI/CD', 'GitHub Pages Static Site', 'Status Alert Webhook'],
      tools_affected: ['Lighthouse CI', 'Lychee Link Checker', 'GitHub Releases API'],
      functions_affected: ['Public Portal Reliability', 'Emergency Helpline URL Validation'],
      work_affected: ['Webmaster Review', 'Documentation Team Sprint'],
      implementation_steps: [
        'Add .github/workflows/link-checker.yml running lychee crawler weekly',
        'Configure failure notifications to dispatch to GitHub Discussions and Slack',
        'Add auto-fix suggestions for common URL redirects'
      ],
      code_tasks: [
        '.github/workflows/link-checker.yml: GitHub action configuration',
        'scripts/validate-links.sh: local testing script'
      ],
      github_issue_body: `## Expansion Proposal: Automated GitHub Pages Sentinel\n\nEnsure 100% uptime for public grief assistance links on GitHub Pages.\n\n- [ ] Install lychee action\n- [ ] Add weekly cron trigger\n- [ ] Notify maintainers on 404s`,
      sources: [
        {
          title: 'GitHub Pages Deployment Best Practices',
          url: 'https://docs.github.com/en/pages',
          snippet: 'Continuous validation and synthetic checks for non-profit static sites.'
        }
      ],
      status: 'accepted',
      priority: 'medium',
      github_issue_url: 'https://github.com/we-do-care-global/we-do-care-global/issues/12',
      github_pr_url: 'https://github.com/we-do-care-global/we-do-care-global/pull/13',
      created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    }
  ],
  researchRuns: [
    {
      id: 'run-cron-0800',
      project_id: DEFAULT_PROJECT_ID,
      user_id: 'user-emir-01',
      trigger: 'daily_0800',
      query: 'High-impact donor retention, micro-donations, community grief outreach automation 2026',
      depth: 'standard',
      focus_areas: ['systems', 'tools', 'functions', 'work', 'automation'],
      status: 'completed',
      model: 'gemini-3.8-flash',
      sources_count: 5,
      started_at: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
      finished_at: new Date(new Date().setHours(8, 0, 18, 0)).toISOString(),
    }
  ],
  roadmapItems: [
    {
      id: 'road-01',
      project_id: DEFAULT_PROJECT_ID,
      expansion_id: 'exp-daily-today',
      title: 'Automated Micro-Donation & Donor Impact Telegram/WhatsApp Bot',
      description: 'Webhook listeners and WhatsApp/SMS delivery pipeline for real-time impact updates.',
      status: 'in_progress',
      priority: 'high',
      github_issue_url: 'https://github.com/we-do-care-global/we-do-care-global/issues/14',
      created_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'road-02',
      project_id: DEFAULT_PROJECT_ID,
      expansion_id: 'exp-03',
      title: 'GitHub Pages Link Checker & Sentinel Workflow',
      description: 'Automated weekly crawl of all public resource links to prevent 404s for community members.',
      status: 'review',
      priority: 'medium',
      github_issue_url: 'https://github.com/we-do-care-global/we-do-care-global/issues/12',
      github_pr_url: 'https://github.com/we-do-care-global/we-do-care-global/pull/13',
      created_at: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    },
    {
      id: 'road-03',
      project_id: DEFAULT_PROJECT_ID,
      title: 'Volunteer Background Verification Integration',
      description: 'Streamline background check consent and clearance tracking for youth mentors.',
      status: 'planned',
      priority: 'high',
      created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    },
    {
      id: 'road-04',
      project_id: DEFAULT_PROJECT_ID,
      title: 'Multilingual Landing Page Translation (BS/HR/SR, DE, ES)',
      description: 'Expand language reach for diaspora families seeking bereavement assistance.',
      status: 'done',
      priority: 'medium',
      created_at: new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    }
  ],
  syncJobs: [
    {
      id: 'sync-01',
      project_id: DEFAULT_PROJECT_ID,
      user_id: 'user-emir-01',
      type: 'all',
      status: 'completed',
      started_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      finished_at: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
      metadata: { synced_items: 28, commits: 12, issues: 5, prs: 2, workflows: 3 },
    }
  ],
  githubSyncData: {
    [DEFAULT_PROJECT_ID]: {
      owner: 'we-do-care-global',
      repo: 'we-do-care-global',
      defaultBranch: 'main',
      branches: ['main', 'feature/ai-research-expansions', 'chore/github-pages-sync', 'refactor/donor-portal'],
      commits: [
        {
          sha: 'f8c3e21',
          message: 'feat: add AI Web Research Expansions integration module',
          author: 'demo-admin',
          date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
          url: 'https://github.com/we-do-care-global/we-do-care-global/commit/f8c3e21',
        },
        {
          sha: 'b4a1990',
          message: 'docs: update community outreach guidelines and local meetups',
          author: 'we-do-care-admin',
          date: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
          url: 'https://github.com/we-do-care-global/we-do-care-global/commit/b4a1990',
        },
        {
          sha: 'c77201d',
          message: 'ci: configure GitHub Pages automated deployment workflow',
          author: 'github-actions[bot]',
          date: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
          url: 'https://github.com/we-do-care-global/we-do-care-global/commit/c77201d',
        }
      ],
      issues: [
        {
          id: 14,
          number: 14,
          title: '[AI Expansion] Automated Micro-Donation & Donor Impact Bot',
          state: 'open',
          user: 'demo-admin',
          labels: ['ai-expansion', 'enhancement', 'systems', 'tools'],
          created_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
          url: 'https://github.com/we-do-care-global/we-do-care-global/issues/14',
          body: 'Generated from AI Web Research daily run at 08:00.'
        },
        {
          id: 12,
          number: 12,
          title: '[AI Expansion] GitHub Pages Link Checker & Sentinel Workflow',
          state: 'open',
          user: 'demo-admin',
          labels: ['ai-expansion', 'ci-cd', 'security'],
          created_at: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
          url: 'https://github.com/we-do-care-global/we-do-care-global/issues/12',
          body: 'Ensure all external links to humanitarian aid resources remain functional.'
        },
        {
          id: 9,
          number: 9,
          title: 'Update local support group meeting locations for Autumn 2026',
          state: 'open',
          user: 'sarah-volunteer',
          labels: ['community', 'documentation'],
          created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
          url: 'https://github.com/we-do-care-global/we-do-care-global/issues/9',
          body: 'Verify physical hall reservations for weekend groups.'
        }
      ],
      pullRequests: [
        {
          id: 13,
          number: 13,
          title: 'ci: add lychee link checker workflow for GitHub Pages',
          state: 'open',
          user: 'demo-admin',
          draft: true,
          branch: 'feature/ai-expansion-link-checker',
          created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
          url: 'https://github.com/we-do-care-global/we-do-care-global/pull/13'
        },
        {
          id: 11,
          number: 11,
          title: 'refactor: standardize timezone conversions in event calendar',
          state: 'open',
          user: 'we-do-care-dev',
          draft: false,
          branch: 'fix/calendar-timezones',
          created_at: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
          url: 'https://github.com/we-do-care-global/we-do-care-global/pull/11'
        }
      ],
      workflows: [
        {
          id: 101,
          name: 'Deploy GitHub Pages Site',
          status: 'completed',
          conclusion: 'success',
          branch: 'main',
          event: 'push',
          updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
          url: 'https://github.com/we-do-care-global/we-do-care-global/actions/runs/101',
        },
        {
          id: 102,
          name: 'CI: Lint, Typecheck, Test',
          status: 'completed',
          conclusion: 'success',
          branch: 'main',
          event: 'push',
          updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
          url: 'https://github.com/we-do-care-global/we-do-care-global/actions/runs/102',
        },
        {
          id: 103,
          name: 'Daily AI Web Research (08:00)',
          status: 'completed',
          conclusion: 'success',
          branch: 'main',
          event: 'schedule',
          updated_at: new Date(new Date().setHours(8, 0, 20, 0)).toISOString(),
          url: 'https://github.com/we-do-care-global/we-do-care-global/actions/runs/103',
        }
      ],
      pages: {
        status: 'built',
        page_url: 'https://we-do-care-global.github.io/we-do-care-global/',
        updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
      releases: [
        {
          tag_name: 'v2.4.0',
          name: 'v2.4.0 — Community Hub & Support Enhancements',
          published_at: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
          url: 'https://github.com/we-do-care-global/we-do-care-global/releases/tag/v2.4.0',
        }
      ],
      labels: [
        { id: 'lbl-1', name: 'ai-expansion', color: '#6366f1', description: 'Generated proposals from AI web research engine' },
        { id: 'lbl-2', name: 'systems', color: '#3b82f6', description: 'Architecture, microservices, databases' },
        { id: 'lbl-3', name: 'tools', color: '#f59e0b', description: 'SDKs, CLI, CI/CD pipelines, APIs' },
        { id: 'lbl-4', name: 'functions', color: '#10b981', description: 'Capabilities, bereavement support, triage' },
        { id: 'lbl-5', name: 'work', color: '#8b5cf6', description: 'Volunteer workflows, donor operations' },
        { id: 'lbl-6', name: 'enhancement', color: '#a21caf', description: 'New feature or system improvement' },
        { id: 'lbl-7', name: 'security', color: '#ef4444', description: 'Security hardening, privacy, compliance' },
        { id: 'lbl-8', name: 'good first issue', color: '#7057ff', description: 'Good for newcomers and volunteer engineers' },
      ],
      lastSynced: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    }
  },
  auditLogs: [
    {
      id: 'log-01',
      user_id: 'user-emir-01',
      action: 'CRON_AUTO_EXPANSION',
      entity: 'expansion',
      entity_id: 'exp-daily-today',
      metadata: { time: '08:00', timezone: 'Europe/Sarajevo', success: true },
      created_at: new Date(new Date().setHours(8, 0, 5, 0)).toISOString(),
    },
    {
      id: 'log-02',
      user_id: 'user-emir-01',
      action: 'GITHUB_TWO_WAY_SYNC',
      entity: 'project',
      entity_id: DEFAULT_PROJECT_ID,
      metadata: { synced_items: 28 },
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    }
  ],
  notifications: [
    {
      id: 'notif-01',
      user_id: 'user-emir-01',
      project_id: DEFAULT_PROJECT_ID,
      type: 'expansion_added',
      title: 'Daily Research Expansion Added (08:00)',
      body: 'Today\'s 08:00 expansion proposal "Automated Micro-Donation & Donor Impact Bot" has been generated and ready for review.',
      read: false,
      created_at: new Date(new Date().setHours(8, 0, 5, 0)).toISOString(),
    },
    {
      id: 'notif-02',
      user_id: 'user-emir-01',
      project_id: DEFAULT_PROJECT_ID,
      type: 'sync_completed',
      title: 'GitHub Two-Way Sync Completed',
      body: 'Synced we-do-care-global/we-do-care-global: 3 branches, 5 issues, 2 PRs, Pages deployment status verified.',
      read: true,
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    }
  ],
  settings: {
    daily_research_cron: '0 8 * * *',
    daily_research_tz: 'Europe/Sarajevo',
    evening_research_cron: '0 20 * * *',
    evening_run_enabled: true,
    auto_create_github_issue: false,
    ai_provider: 'gemini-3.8-flash',
    model_name: 'gemini-3.8-flash',
    github_token_configured: false,
    github_repo_owner: 'we-do-care-global',
    github_repo_name: 'we-do-care-global',
    last_cron_run: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
    next_cron_run: new Date(new Date().setHours(20, 0, 0, 0)).toISOString(),
  },
  // Never seed real execution history with a fabricated successful run.
  cronHistory: []
};
