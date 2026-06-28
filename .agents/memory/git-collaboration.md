---
name: Git / GitHub collaboration workflow
description: How this repo syncs with GitHub and how the agent is constrained around git operations.
---

# Git / GitHub collaboration

This repo is linked to a GitHub remote (used for external collaboration such as Claude Co-Work). Treat GitHub `main` as a shared source of truth that can drift from the Replit workspace.

## Constraint: main agent cannot push/fetch/commit
**Rule:** History-mutating git operations (`push`, `fetch`, `commit`, `reset`, etc.) are blocked for the main agent's bash tool. Read-only commands work: `git ls-remote`, `git rev-parse`, `git cat-file -e`, `git rev-list --count`, `git log`, `git remote -v` (pass `--no-optional-locks`; plain `git status` is blocked by the sandbox).

**How to apply:** Never try to push/fetch directly. The user pushes/pulls via Replit's Git pane, or delegate the operation to a background Project Task. To check sync without fetching, compare local `git rev-parse main` against `git ls-remote <remote> refs/heads/main`, and use `git cat-file -e <sha>` / `git rev-list --count` to compute ahead/behind only when the remote SHA already exists locally.

## Automatic sync check
There is a `git-sync` validation (registered via the validation skill) that runs `scripts/git-sync-check.sh` on task completion. It is **advisory and always exits 0** (never blocks) and prints IN SYNC / PUSH NEEDED / PULL NEEDED / DIVERGED.

**Why:** The user wanted an automatic reminder after every task so the Replit workspace and GitHub never silently drift while collaborating through an external tool.
**How to apply:** Keep the exit-0 (non-blocking) semantics if editing the script. Don't convert it into a hard gate — being ahead-of-remote is the normal post-task state since the agent can't push.
