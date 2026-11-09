# MasterAI public-release security gate

Status: **BLOCKED**. Do not change repository visibility yet.

## Evidence (2026-11-09)

- PR #4 merged: API routes fail closed with HTTP 503 until verified authentication is available.
- PR #5 merged: some demo identities sanitized in current files.
- PR #6 CI lint/test/build passed on `ca83afb`.
- PR #6 full-history audit failed: **34 candidate personal-email matches**, traced to historical commit `0573eca7ea32`. The scanner reported no matches for its current credential patterns; this **does not prove the absence of secrets**.
- The original history is still reachable. Replacing strings in current files does not remove them from Git history.

## Publication blockers

1. **History decision**: review whether the historical addresses are authorized for public disclosure. If not, coordinate a history rewrite using `git filter-repo` or publish a clean new repository without old Git history. A rewrite affects all clones, tags, branches, PRs, and commit references. Do not force-push without a coordinated backup and approval.
2. **Credential audit**: run a mature secret scanner (e.g., Gitleaks) against all reachable refs and inspect findings privately. Rotate any real credential found, even if history is rewritten.
3. **Authentication**: replace mock GitHub/Google login and timestamp-derived session tokens with verified identity-provider callbacks, server-side sessions, authorization checks, and protected mutating routes. Until then, API must remain disabled.
4. **Privacy**: check remaining source, assets, commit messages, issues, and documentation for identifying data before publication.
5. **Validation**: run security regression tests and CI against the final publication candidate; review permissions and Pages deployment settings.

The redacted history-audit check is expected to remain red until the historical exposure has been reviewed and remediated. Do not bypass it by removing the audit or ignoring all email matches.
