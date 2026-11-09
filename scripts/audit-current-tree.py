#!/usr/bin/env python3
"""Audit tracked working-tree files for public-release candidates.

No secret values are printed. Run after checking out the intended snapshot.
"""
from pathlib import Path
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
files = subprocess.check_output(["git", "ls-files", "-z"]).decode().split("\0")
findings = []
for filename in filter(None, files):
    path = Path(filename)
    if not path.is_file():
        continue
    data = path.read_bytes()
    if b"\0" in data:
        continue
    for line_no, line in enumerate(data.decode("utf-8", errors="replace").splitlines(), 1):
        for kind, pattern in PATTERNS.items():
            if pattern.search(line):
                findings.append((kind, filename, line_no))
for kind, filename, line_no in findings[:100]:
    print(f"{kind}: file={filename} line={line_no} [value redacted]")
print(f"Working-tree audit: {len(findings)} candidate finding(s)")
sys.exit(1 if findings else 0)
