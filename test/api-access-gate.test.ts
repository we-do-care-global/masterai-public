import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isDisabledApiPath } from '../server/apiAccessGate';

describe('API fail-closed route gate', () => {
  const roots = [
    'api', 'auth', 'profiles', 'projects', 'workers', 'research',
    'expansions', 'cron', 'sync', 'webhooks', 'roadmap',
    'notifications', 'settings', 'audit-logs',
  ];

  for (const root of roots) {
    it(`blocks /${root} and nested endpoints`, () => {
      assert.equal(isDisabledApiPath(`/${root}`), true);
      assert.equal(isDisabledApiPath(`/${root}/sensitive/write`), true);
    });
  }

  it('keeps frontend paths outside the API gate', () => {
    for (const path of ['/', '/index.html', '/assets/app.js', '/dashboard']) {
      assert.equal(isDisabledApiPath(path), false);
    }
  });

  it('does not confuse similar prefixes', () => {
    assert.equal(isDisabledApiPath('/api-public'), false);
    assert.equal(isDisabledApiPath('/settings-public'), false);
  });
});
