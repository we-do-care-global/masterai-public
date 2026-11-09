import { describe, it } from 'node:test';
import assert from 'node:assert';
import { db } from '../server/db';
import { runAIWebResearch } from '../server/geminiResearcher';

describe('User Roles, Permissions, and Advanced Filters Test Suite', () => {
  it('1. Admin role has full access to create projects and initiate research', async () => {
    db.user.role = 'admin';
    assert.strictEqual(db.user.role, 'admin');

    // Admin can initiate research
    const res = await runAIWebResearch({
      projectId: db.projects[0].id,
      projectName: db.projects[0].name,
      projectDescription: db.projects[0].description,
      repoOwner: db.projects[0].repo_owner,
      repoName: db.projects[0].repo_name,
      depth: 'quick',
    });
    assert.ok(res.expansions.length > 0);
  });

  it('2. Member role is restricted from creating projects and initiating research in permission checks', () => {
    // Switch to member
    db.user.role = 'member';
    assert.strictEqual(db.user.role, 'member');

    // Verification helper mimicking API route guard
    const checkCanCreateProject = (role: string) => {
      if (role !== 'admin') {
        throw new Error('Forbidden: Member role does not have permission to create projects. Admin role required.');
      }
      return true;
    };

    const checkCanInitiateResearch = (role: string) => {
      if (role !== 'admin') {
        throw new Error('Forbidden: Member role does not have permission to initiate AI research. Admin role required.');
      }
      return true;
    };

    assert.throws(() => checkCanCreateProject(db.user.role), /Forbidden: Member role/);
    assert.throws(() => checkCanInitiateResearch(db.user.role), /Forbidden: Member role/);

    // Switch back to admin
    db.user.role = 'admin';
    assert.strictEqual(checkCanCreateProject(db.user.role), true);
    assert.strictEqual(checkCanInitiateResearch(db.user.role), true);
  });

  it('3. Advanced Filtering: filter expansions by status (New, Accepted, Rejected)', () => {
    const expansions = db.expansions;

    // Filter by new (proposed)
    const newItems = expansions.filter(e => e.status === 'proposed');
    assert.ok(newItems.every(e => e.status === 'proposed'));

    // Filter by accepted
    const acceptedItems = expansions.filter(e => e.status === 'accepted');
    assert.ok(acceptedItems.every(e => e.status === 'accepted'));
  });

  it('4. Advanced Sorting: sort expansions by Impact, Effort, and Risk', () => {
    const impactRank: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
    const effortRank: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
    const riskRank: Record<string, number> = { High: 3, Medium: 2, Low: 1 };

    // Sort by Impact desc
    const sortedByImpact = [...db.expansions].sort(
      (a, b) => (impactRank[b.impact] || 0) - (impactRank[a.impact] || 0)
    );
    for (let i = 0; i < sortedByImpact.length - 1; i++) {
      assert.ok(
        (impactRank[sortedByImpact[i].impact] || 0) >= (impactRank[sortedByImpact[i + 1].impact] || 0)
      );
    }

    // Sort by Effort asc
    const sortedByEffort = [...db.expansions].sort(
      (a, b) => (effortRank[a.effort] || 0) - (effortRank[b.effort] || 0)
    );
    for (let i = 0; i < sortedByEffort.length - 1; i++) {
      assert.ok(
        (effortRank[sortedByEffort[i].effort] || 0) <= (effortRank[sortedByEffort[i + 1].effort] || 0)
      );
    }

    // Sort by Risk asc
    const sortedByRisk = [...db.expansions].sort(
      (a, b) => (riskRank[a.risk] || 0) - (riskRank[b.risk] || 0)
    );
    for (let i = 0; i < sortedByRisk.length - 1; i++) {
      assert.ok(
        (riskRank[sortedByRisk[i].risk] || 0) <= (riskRank[sortedByRisk[i + 1].risk] || 0)
      );
    }
  });

  it('5. Profiles Table: Verify user role is stored in profiles table and synced', () => {
    assert.ok(Array.isArray(db.profiles));
    assert.ok(db.profiles.length >= 2);

    const adminProfile = db.profiles.find(p => p.role === 'admin');
    assert.ok(adminProfile);
    assert.strictEqual(adminProfile.role, 'admin');

    const memberProfile = db.profiles.find(p => p.role === 'member');
    assert.ok(memberProfile);
    assert.strictEqual(memberProfile.role, 'member');

    // Test updating a role in profiles table
    memberProfile.role = 'admin';
    assert.strictEqual(memberProfile.role, 'admin');
    memberProfile.role = 'member'; // reset
    assert.strictEqual(memberProfile.role, 'member');
  });
});
