#!/usr/bin/env python3
"""Read a single frontmatter field from a scope markdown file.
Usage: parse_scope.py <file> <field>
"""
import sys

if len(sys.argv) != 3:
    sys.exit(1)

filepath, field = sys.argv[1], sys.argv[2]

try:
    content = open(filepath).read()
except OSError:
    sys.exit(1)

in_fm = False
for line in content.split('\n'):
    if line.strip() == '---':
        if not in_fm:
            in_fm = True
        else:
            break
        continue
    if in_fm and line.startswith(field + ':'):
        print(line.split(':', 1)[1].strip().strip("'\""))
        break
