# CLAUDE.md — project-scoped rules for `dartscounter`

This file **overrides** the global `~/.claude/CLAUDE.md` where they conflict.
Scope: this repository only.

## Git / GitHub

The global rule says "Never commit. Tom handles all git commits." For this
repository only, Tom has explicitly authorised Claude to:

- `git add`
- `git commit`
- `git push` (to `origin`, never `--force` against `main`)
- `git pull`
- `gh pr create`
- `gh pr merge --squash --delete-branch`
- `git branch -d <merged-branch>`

Claude must **not**:

- Force-push to `main` or any shared branch
- Use `--no-verify` to skip hooks
- Delete unmerged branches
- Amend or rewrite published commits

## Branching model

Every phase of the iOS → PWA port is done on its own branch:

- `phase/00-bootstrap`
- `phase/01-design-system`
- `phase/02-onboarding-profile`
- `phase/03-data-model-match`
- `phase/04-game-engines`
- `phase/05-gameplay-ui`
- `phase/06-game-over`
- `phase/07-stats`
- `phase/08-pwa-polish`
- `phase/09-final-polish`

Workflow per phase:

1. `git checkout main && git pull`
2. `git checkout -b phase/NN-xxx`
3. Implement, commit in logical chunks
4. `git push -u origin phase/NN-xxx`
5. `gh pr create` with a summary of the phase
6. `gh pr merge --squash --delete-branch`

## Plan

The canonical implementation plan is at
`docs/plans/2026-04-19-laravel-conversion.md`. It supersedes any earlier
chat-level decisions and is the source of truth for scope.

## Design reference

The visual reference is the Claude Design handoff bundle copied into
`design/reference/`. **Do not import code from it** — it is an
HTML/JSX prototype. Use it only to match colours, typography, spacing,
and component behaviour. The implementation is Vue 3 + TypeScript.

The full source of the iOS app that this PWA ports lives at
`/Users/tommorskieft/Projects/dartscounter-2`. It is the functional
reference — data model, game engines, and the extended feature set
(Standard Checkout and Barney's Drill are not in the design bundle;
mirror what iOS does).

## Scope discipline

Per global rule #2: change only what's asked. When working inside a phase,
stay inside that phase's scope — don't bleed into the next phase's work.
If something looks broken outside the current phase's scope, note it in
`docs/plans/` or open an issue rather than fixing it silently.
