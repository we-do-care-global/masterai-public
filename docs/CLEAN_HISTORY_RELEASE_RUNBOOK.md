# Clean-history MasterAI release runbook

**PREPARATION ONLY — publication remains blocked.**

## Boundaries
- Keep original `we-do-care-global/masterai` private.
- Do not fork or mirror it, push `--all` / `--mirror`, or transfer old branches/tags to a new public repository.
- Never copy `.git`, credentials, untracked environment files, Actions logs, or private artifacts.
- Original Git history audit stays red because historical personal-email candidates remain reachable.

## Required preflight
1. Obtain explicit final approval for destination owner/name and public visibility.
2. Review final tracked source, assets, docs, workflows, licenses, dependencies, URLs, and commit author identity for privacy/IP risks.
3. Run custom tracked-tree scan, independent Gitleaks, CI test/build on **exact final snapshot**; investigate findings privately and rotate exposed credentials.
4. Verify mock authentication is not accessible and protected API routes fail closed. Static hosting is not production backend readiness.
5. Create an empty, unrelated destination repository, not a fork. Confirm no existing commits or imported history.

## Safe local export
From a trusted clone:
```bash
set -euo pipefail
git fetch origin security/history-audit-gate
git checkout --detach origin/security/history-audit-gate
SOURCE_SHA="$(git rev-parse HEAD)"
mkdir -p ../masterai-clean-export
git archive "$SOURCE_SHA" | tar -x -C ../masterai-clean-export
test ! -e ../masterai-clean-export/.git
printf 'Export source: %s\n' "$SOURCE_SHA"
```
Review and scan the export before importing. Do not copy Git metadata.

## Fresh history (only after final approval)
```bash
cd ../masterai-clean-export
git init -b main
git add -A
git commit -m "Initial reviewed public snapshot"
git rev-list --count HEAD # must equal 1
git remote add origin https://github.com/APPROVED_OWNER/APPROVED_REPO.git
# Verify empty destination, source content, author identity, and approval.
git push -u origin main
```

## Post-release checks
Verify one root commit with no parent, no legacy refs/tags, no fork relationship, and no sensitive files in the published tree, workflows, logs, or Pages output. Keep API disabled until verified OAuth, server sessions, CSRF controls, and authorization pass review.

## Evidence
At security branch `4aa09de0ced8a52d669d517716f9593cd8d1e1dd`, CI, clean-export audit, and Gitleaks passed; full-history audit failed. Re-run checks on final candidate.
