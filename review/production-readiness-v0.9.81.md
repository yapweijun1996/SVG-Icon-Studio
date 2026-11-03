# Production-readiness review — v0.9.81

**Date:** 2026-11-03
**Scope:** whole repository at `main` = `ffd6693` (v0.9.81, 260 icons).
**Question answered:** is Icon Studio production level, and what should be improved?
**Tracked as:** `EPIC.md` Epic 7, `ROADMAP.md` §"Planned: Production readiness", `TASK.md` §"Backlog (Epic 7)".

## Verdict

- **As a static icon-browsing web app (GitHub Pages demo / internal tool): yes, mostly production-ready.** Clean modular code, zero runtime dependencies, above-average security, fast.
- **As a production icon library other apps and teams depend on: not yet.** Missing: a consumable distribution (npm package / sprite / components), automated browser tests, automated icon-quality checks, and a review gate before production.

## Evidence

| Area | Measurement |
| --- | --- |
| Code size | ~2,000 lines of vanilla JS across small ES modules; built JS 49 KB; 0 runtime dependencies |
| Performance (prod build, Chrome, ~1.6 Mbps / 150 ms latency) | first 12 previews painted in 0.9 s; DOMContentLoaded 0.37 s; 27 requests, 261 KB uncompressed |
| Search | 10 keystrokes rendered synchronously in 60 ms total (~6 ms each) at 260 icons |
| Tests | `npm test` = 19 scripts, all passing |
| Test style | 80 of 251 assertions in `tests/dom.test.mjs` regex-match source text instead of exercising behaviour |
| Dependencies | `vite` 8.1.5 → 4 advisories (1 moderate, 3 high), dev-only; 8.3.5 available |
| CI | `.github/workflows/deploy.yml` runs test → build → deploy only on push to `main`; no PR workflow, no `typecheck` step |
| Icon validator | checks root contract, sanitizer, size, orphans, registry/file parity; does **not** check artwork bounds, child `fill`/`stroke`, coordinate precision or 16 px legibility |
| Docs | ~3,500 lines; icon count hard-coded in 5 files and version in 4, updated by hand every release |

## Scorecard

| Area | Rating | Notes |
| --- | --- | --- |
| Architecture | Good | SSOT (one SVG per icon, geometry-free registry), clean services/features split |
| Security | Good | CSP, allowlist SVG sanitizer, anti-frame guard, same-origin asset loading |
| Performance | Good | Fine at 260; full grid rebuild per render needs revisiting past ~1,000 icons |
| Accessibility | Good design, manual verification | Focus management and live regions are careful but only verified by hand-run browser sessions |
| Testing | Weak | Source-regex assertions; no automated browser tests. Both v0.9.77 (infinite-scroll stall) and v0.9.79 (inspector not opening / skeleton flash) bugs passed the full suite and were only caught in a real browser |
| Icon quality gate | Partial | Structure is validated; artwork quality is not. v0.9.76–v0.9.81 icons (36) were AI-authored and AI-reviewed from rendered screenshots; Commission and Handshake remain weak at 16 px |
| Release process | Weak | Local merges to `main`; pushing `main` deploys to production; CI runs after the fact |
| Distribution | Missing | Copy/export from the UI is the only way to consume icons |
| Docs | Thorough, drift-prone | Hand-maintained counts/versions; `ROADMAP.md` release table and "Current state" were stale (fixed in this pass) |
| Repo hygiene | Fair | 1.7 MB of `review/` artifacts committed; LF/CRLF warnings on every commit; `"private": false` with no publish intent |

Accepted, not a finding: `package-lock.json`'s `version` lag is a documented decision (`SPEC.md` ADR-013).

## Recommendations (priority order)

**P0 — before calling it production**
1. Decide whether test-only devDependencies (Playwright, axe-core) are allowed — this conflicts with the current "no devDependencies beyond Vite" convention (`ROADMAP.md`), so it needs an explicit decision/ADR first.
2. Playwright browser tests in CI for the core flows (select opens inspector, infinite scroll to the end, alias search, no skeleton flash on rerender, focus restoration, no console errors) at 1440 / 1024 / 390 px; then retire the source-regex assertions they replace.
3. axe-core accessibility checks in the same run.
4. PR workflow (validate, typecheck, unit, browser, build) + branch protection on `main`.
5. Upgrade Vite to ≥ 8.3.5; add `npm audit --omit=dev` to CI.
6. Set `"private": true` (or split the app from a publishable package).

**P1 — make it a real icon library**
7. Publishable icons package generated from `icons/catalog/` (raw SVGs, sprite, ESM, React components, TypeScript types).
8. Artwork checks in `tools/validate-icons.mjs`: safe-area bounds, coordinate precision, no child paint, near-duplicate warning.
9. Generated contact sheet per PR (16/24/48 px, light/dark, nearest neighbours) + human designer sign-off.
10. Generate doc counts/versions from the registry and `package.json`.

**P2 — polish**
11. Existing backlog: deep links, bulk export, search highlighting, `window.IconStudio` API.
12. Scale past ~1,000 icons: incremental grid updates, sprite delivery.
13. Hygiene: move bulky `review/` artifacts to CI/releases, `.gitattributes` `eol=lf`, slim `CHANGELOG.md`.
14. Define 1.0 (P0 done + package published) and semantic versioning rules for icons (new icon = minor; rename/removal = major).
