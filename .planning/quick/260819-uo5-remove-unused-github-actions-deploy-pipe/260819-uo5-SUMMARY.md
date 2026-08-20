---
quick_id: 260819-uo5
description: Remove the unused GitHub Actions deploy pipeline
date: 2026-08-19
status: complete
---

# Quick Task 260819-uo5 — Summary

## What changed

- **Deleted `.github/workflows/deploy.yml`** — the only workflow. It was
  `workflow_dispatch`-only, never triggered (the admin app has no
  `repository_dispatch` sender), and the owner deploys solely via local
  `npm run deploy`. Removing it left `.github/` empty (pruned).
- **Docs updated** to present local `npm run deploy` as the sole deploy/publish
  path, removing GitHub-Actions-as-deploy references while keeping the local path
  and the analytics env-var docs intact:
  - `README.md` — "How it works" publish line; "Build & deploy" paragraph; the
    Configuration "GitHub Actions secrets/vars" aside → "loaded by `npm run deploy`".
  - `LAUNCH.md` — §4 (removed the GH Actions deploy bullet, kept local deploy +
    noted `.env` is what the build reads); §6 analytics activation; §7 Publish test;
    "Ongoing: how to publish"; the "Already done" line.
  - `docs/go-live-v1.1.md` — §1 "deploy options (local or GitHub Actions)" → deploy details.
  - `docs/environment.md` — both "GitHub Actions secrets/vars" framings → local `.env`.
  - `.claude/CLAUDE.md` — Commands section (line 24): now "the only deploy path
    (no GitHub Actions/CI deploy…)".

## Verification

- `npm run build` passes (no reference to the workflow at build time; deploy is
  a separate manual step).
- Repo-wide grep: no remaining GitHub-Actions-deploy references outside the
  CLAUDE.md research section (see below).

## Deliberately left (flagged, not changed)

The GSD-generated **"Recommended Stack" research section** in `.claude/CLAUDE.md`
(below the `<!-- GSD:project-start -->` marker) still mentions GitHub Actions /
`repository_dispatch` as *researched/considered* options — Development Tools row
(~104), Alternatives Considered row (~127), Sources citation (~165), and a
conditional firebase-admin mention (~82). These are a sourced historical rationale
artifact, not operational instructions, and rewriting sourced rows piecemeal risks
inconsistency. The authoritative Commands section (line 24) now states the real
deploy path. Scrub the research rows too on request.

## Not touched

`firebase.json`, `.firebaserc`, `npm run deploy` / `deploy:rules`, and the
build-time Firestore read env vars — all still valid for local deploys.
