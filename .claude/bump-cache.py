#!/usr/bin/env python3
"""
Auto-bump CSS/JS cache-busting version numbers in HTML files.
Called as a PostToolUse hook whenever Claude edits a file.
If the edited file is a .css or .js file, finds all HTML files
that reference it and increments the ?v=N query param by 1.
"""
import json
import sys
import re
import os
from pathlib import Path

try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)

tool_input = data.get("tool_input", {})
file_path = tool_input.get("file_path", "")

# Only act on CSS and JS files
if not re.search(r'\.(css|js)$', file_path):
    sys.exit(0)

basename = os.path.basename(file_path)

# Also match the .min variant if given the source, and vice versa
variants = {basename}
if '.min.' in basename:
    variants.add(basename.replace('.min.', '.'))
else:
    stem, ext = basename.rsplit('.', 1)
    variants.add(f"{stem}.min.{ext}")

project_root = Path("/Users/mclinsanders/Projects/mclinduke.com")
html_files = list(project_root.rglob("*.html"))

bumped = []
for html_file in html_files:
    content = html_file.read_text(encoding="utf-8")
    new_content = content
    for name in variants:
        pattern = rf'({re.escape(name)}\?v=)(\d+)'
        def bump(m):
            return m.group(1) + str(int(m.group(2)) + 1)
        new_content = re.sub(pattern, bump, new_content)
    if new_content != content:
        html_file.write_text(new_content, encoding="utf-8")
        bumped.append(html_file.name)

if bumped:
    print(f"[cache-bust] Bumped version in: {', '.join(bumped)}")
