import { describe, it } from 'node:test';
import assert from 'node:assert';
import { syncService } from '../server/syncService';
import { db } from '../server/db';

describe('GitHub SyncService fail-closed tests', () => {
  it('does not report successful sync when GitHub is unavailable', async () => {
    const project = db.projects.find(p => p.repo_name === 'care-outreach-portal')!;
    const job = await syncService.syncProject(project.id, db.user.id, 'all');
    assert.strictEqual(job.status, 'failed');
  });

  it('does not fabricate an issue without credentials', async () => {
    const expansion = db.expansions[0];
    const before = expansion.github_issue_url;
    await assert.rejects(syncService.createGitHubIssue(expansion.id, db.user.id), /token is not configured/);
    assert.strictEqual(expansion.github_issue_url, before);
  });

  it('does not fabricate draft pull requests', async () => {
    const expansion = db.expansions[0];
    await assert.rejects(syncService.createDraftPR(expansion.id, db.user.id), /not implemented/);
  });
});
