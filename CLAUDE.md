# CLAUDE.md

## Formatting

Always provide code changes as a unified diff and omit conversational prose unless specifically asked. Be as terse as possible to save tokens.

## CSS/Asset Cache Busting

- The PostToolUse hook (bump-cache.py) auto-increments `?v=N` in all HTML files whenever a .css or .js file is edited.
- Never manually bump version numbers — the hook handles it.
- Always verify changes via screenshot AFTER the hook has run (i.e., after the edit completes), not before.
- If a screenshot shows stale content, check that the HTML file's `?v=` was incremented before re-screenshotting.

## Design & Brand Deliverables

- When exploring design options (colors, layouts, typography, brand concepts), always deliver a rendered HTML preview page at `/previews/<topic>.html` showing all options side-by-side with labels.
- Never describe design options in prose first — show them visually by default.
- After any nav or link change, smoke-test all nav links before marking the task done.

## Environment

- Python 3 and Node.js (v25) are both available.
- When a task requires sudo or a macOS privacy setting that can't be scripted, surface the manual step upfront.
- Pre-flight check: confirm required CLIs exist before committing to an approach.
