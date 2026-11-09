import { describe, it } from 'node:test';
import assert from 'node:assert';
import { cronManager } from '../server/cronManager';
import { db } from '../server/db';

describe('Daily Auto-Expansion Cron safety tests', () => {
  it('starts without fabricated cron history or automatic GitHub writes', () => {
    assert.deepStrictEqual(db.cronHistory, []);
    assert.strictEqual(db.settings.auto_create_github_issue, false);
    assert.strictEqual(db.settings.github_token_configured, false);
  });
  for (const runType of ['08:00', '20:00'] as const) {
    it(`refuses ${runType} without durable storage`, async () => {
      const before = db.expansions.length;
      await assert.rejects(
        cronManager.triggerScheduledRun(runType, false, '2026-10-15'),
        /durable run storage and idempotency/
      );
      assert.strictEqual(db.expansions.length, before);
    });
  }

  it('refuses forced runs too: force must not bypass storage safety', async () => {
    await assert.rejects(
      cronManager.triggerScheduledRun('08:00', true, '2026-10-15'),
      /durable run storage and idempotency/
    );
  });
});
