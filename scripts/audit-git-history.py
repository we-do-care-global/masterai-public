#!/usr/bin/env python3
"""Conservative pre-publication audit of all reachable Git history.

Reports paths and line numbers only, never matching secret values.
This is a gate for human review, not a replacement for dedicated secret scanners.
"""
import re
import subprocess
import sys

PATTERNS = {
    "private_key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----"),
    "github_token": re.compile(r"gh(?:p|o|u|s|r)_[A-Za-z0-9_]{20,}"),
    "openai_key": re.compile(r"sk-(?:proj-)?[A-Za-z0-9_-]{20,}"),
    "google_api_key": re.compile(r"AIza[0-9A-Za-z_-]{30,}"),
    "aws_access_key": re.compile(r"(?:AKIA|ASIA)[A-Z0-9]{16}"),
    "jwt": re.compile(r"eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}"),
    "personal_email": re.compile(r"(?i)[A-Z0-9._%+-]+@(?!example\.(?:invalid|com)\b)[A-Z0-9.-]+\.[A-Z]{2,}"),
}
try:
    data = subprocess.check_output(
        ["git", "log", "--all", "-p", "--no-ext-diff", "--no-textconv", "--format=commit %H"],
        text=True, errors="replace",
    )
except subprocess.CalledProcessError as exc:
    print(f"Audit unavailable: git log failed ({exc.returncode})", file=sys.stderr)
    sys.exit(2)

commit = "unknown"
path = "unknown"
findings = []
for lineno, line in enumerate(data.splitlines(), 1):
    if line.startswith("commit "):
        commit = line.split()[-1][:12]
    elif line.startswith("+++ b/"):
        path = line[6:]
    elif line.startswith("+") and not line.startswith("+++"):
        for kind, pattern in PATTERNS.items():
            if pattern.search(line[1:]):
                findings.append((kind, commit, path, lineno))

for kind, commit, path, line in findings[:100]:
    print(f"{kind}: commit={commit} file={path} patch_line={line} [value redacted]")
print(f"History audit: {len(findings)} candidate finding(s); inspect and remediate before publication.")
sys.exit(1 if findings else 0)
