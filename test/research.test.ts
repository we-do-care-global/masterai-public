import { describe, it } from 'node:test';
import assert from 'node:assert';
import { runAIWebResearch } from '../server/geminiResearcher';
import { db } from '../server/db';

describe('AI Web Research Engine Tests', () => {
  it('should generate structured expansion proposals with all 4 dimensions', async () => {
    const project = db.projects[0];
    const result = await runAIWebResearch({
      projectId: project.id,
      projectName: project.name,
      projectDescription: project.description,
      repoOwner: project.repo_owner,
      repoName: project.repo_name,
      depth: 'standard',
      focusAreas: ['systems', 'tools', 'functions', 'work', 'UX', 'security'],
    });

    assert.ok(result.expansions.length > 0);
    const exp = result.expansions[0];

    // Check all required fields from prompt
    assert.ok(exp.title);
    assert.ok(exp.summary);
    assert.ok(exp.why_now);
    assert.ok(['High', 'Medium', 'Low'].includes(exp.impact));
    assert.ok(['Low', 'Medium', 'High'].includes(exp.effort));
    assert.ok(['Low', 'Medium', 'High'].includes(exp.risk));

    // Check 4 affected pillars
    assert.ok(Array.isArray(exp.systems_affected) && exp.systems_affected.length > 0);
    assert.ok(Array.isArray(exp.tools_affected) && exp.tools_affected.length > 0);
    assert.ok(Array.isArray(exp.functions_affected) && exp.functions_affected.length > 0);
    assert.ok(Array.isArray(exp.work_affected) && exp.work_affected.length > 0);

    // Implementation steps and code tasks
    assert.ok(Array.isArray(exp.implementation_steps) && exp.implementation_steps.length > 0);
    assert.ok(Array.isArray(exp.code_tasks) && exp.code_tasks.length > 0);
    assert.ok(exp.github_issue_body);

    // Sources verification
    assert.ok(Array.isArray(exp.sources) && exp.sources.length > 0);
    assert.ok(exp.sources[0].url.startsWith('http'));
  });

  it('should enforce exactly 1 expansion in daily cron mode', async () => {
    const project = db.projects[0];
    const result = await runAIWebResearch({
      projectId: project.id,
      projectName: project.name,
      projectDescription: project.description,
      repoOwner: project.repo_owner,
      repoName: project.repo_name,
      isDailyCron: true,
    });

    assert.strictEqual(result.expansions.length, 1);
  });
});
