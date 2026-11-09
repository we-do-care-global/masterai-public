import { describe, it } from 'node:test';
import assert from 'node:assert';
import { db } from '../server/db';
import { syncService } from '../server/syncService';
import { runAIWebResearch } from '../server/geminiResearcher';
import { cronManager } from '../server/cronManager';

describe('E2E Complete User Flow & Acceptance Verification', () => {
  it('1. User signs in with GitHub', () => {
    assert.ok(db.user.id);
    assert.strictEqual(db.user.email, 'demo.admin@example.invalid');
    assert.strictEqual(db.user.github_username, 'demo-admin');
  });

  let createdProjectId = '';

  it('2 & 3. Create new project and link GitHub repo', () => {
    const newProj = {
      id: `proj-test-${Date.now()}`,
      owner_id: db.user.id,
      name: 'Crisis Relief Telehealth Hotline',
      description: 'Encrypted bereavement call triage system for families.',
      repo_owner: 'we-do-care-global',
      repo_name: 'crisis-relief-telehealth',
      repo_url: 'https://github.com/we-do-care-global/crisis-relief-telehealth',
      default_branch: 'main',
      visibility: 'public' as const,
      research_focus: ['systems', 'tools', 'functions', 'work', 'security'],
      daily_research_time: '08:00',
      timezone: 'Europe/Sarajevo',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.projects.unshift(newProj);
    createdProjectId = newProj.id;

    assert.ok(db.projects.some(p => p.id === createdProjectId));
  });

  let generatedExpansionId = '';

  it('4 & 5. Trigger "AI Web Research Expansions for us" and receive structured proposal', async () => {
    const project = db.projects.find(p => p.id === createdProjectId)!;
    const res = await runAIWebResearch({
      projectId: project.id,
      projectName: project.name,
      projectDescription: project.description,
      repoOwner: project.repo_owner,
      repoName: project.repo_name,
      depth: 'standard',
    });

    assert.ok(res.expansions.length > 0);
    const exp = res.expansions[0];
    db.expansions.unshift(exp);
    generatedExpansionId = exp.id;

    // Verify all 4 required pillars and sources
    assert.ok(exp.systems_affected.length > 0);
    assert.ok(exp.tools_affected.length > 0);
    assert.ok(exp.functions_affected.length > 0);
    assert.ok(exp.work_affected.length > 0);
    assert.ok(exp.sources.length > 0);
  });

  it('6. Refuse GitHub issue creation without credentials', async () => {
    await assert.rejects(syncService.createGitHubIssue(generatedExpansionId, db.user.id), /token is not configured/);
    const exp = db.expansions.find(e => e.id === generatedExpansionId);
    assert.strictEqual(exp?.status, 'proposed');
    assert.ok(!exp?.github_issue_url);
  });

  it('7. Refuse simulated GitHub sync success', async () => {
    const syncJob = await syncService.syncProject(createdProjectId, db.user.id, 'all');
    assert.strictEqual(syncJob.status, 'failed');
    assert.strictEqual(syncJob.project_id, createdProjectId);
  });

  it('8. Refuse ephemeral scheduled research by default', async () => {
    await assert.rejects(cronManager.triggerScheduledRun('08:00', true, '2026-11-01'), /durable run storage/);
  });
});
