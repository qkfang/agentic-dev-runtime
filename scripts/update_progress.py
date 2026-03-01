#!/usr/bin/env python3
"""Generate workspace/progress.md from all scope files."""
import glob
from datetime import datetime, timezone

scopes = []
for f in sorted(glob.glob('workspace/scopes/*.md')):
    content = open(f).read()
    meta = {}
    in_fm = False
    for line in content.split('\n'):
        if line.strip() == '---':
            if not in_fm:
                in_fm = True
            else:
                break
            continue
        if in_fm and ':' in line:
            k, v = line.split(':', 1)
            meta[k.strip()] = v.strip().strip("'\"")
    if meta:
        scopes.append(meta)

total = len(scopes)
done = sum(1 for s in scopes if s.get('status') == 'done')
active = sum(1 for s in scopes if s.get('status') == 'active')
open_ = sum(1 for s in scopes if s.get('status') == 'open')
blocked = sum(1 for s in scopes if s.get('status') == 'blocked')
now = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')

rows = '\n'.join(
    f"| {s.get('scope_id','')} | {s.get('title','')} | {s.get('phase','')} | {s.get('status','')} | {s.get('agent_id','-')} |"
    for s in scopes
)

progress = f"""# Project Progress

Last updated: {now}

## Summary

| Total | Done | Active | Open | Blocked |
|-------|------|--------|------|---------|
| {total} | {done} | {active} | {open_} | {blocked} |

## Scopes

| Scope | Title | Phase | Status | Agent |
|-------|-------|-------|--------|-------|
{rows}
"""

with open('workspace/progress.md', 'w') as fp:
    fp.write(progress)
print("Progress updated")
