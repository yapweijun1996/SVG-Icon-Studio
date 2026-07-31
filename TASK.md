# Icon Studio — Tasks

**Document:** `TASK.md`
**Status:** Living document — the granular task tracker underneath `EPIC.md`/`ROADMAP.md`. Update this file (not just `CHANGELOG.md`) whenever a task starts, finishes, or gets blocked. Every "Done" item below is verified in a real running app (browser test, not just `npm test`) unless stated otherwise — see `CHANGELOG.md`'s per-release **Validation** sections for exact evidence.

**Convention (standing, since `v0.3.0`):** any user-visible change ships with a `package.json` version bump, a `CHANGELOG.md` entry with a Validation subsection, and — as of this documentation pass — a `TASK.md` update. `npm test`, `npm run typecheck`, `npm run build` must all pass before a task is marked Done.

---

## Done

### Epic 1 — SSOT Modular Refactor
- [x] Extract every built-in icon into `icons/catalog/<id>.svg`
- [x] Geometry-free `data/icon-registry.json`
- [x] ES module split: `core/` `services/` `features/` `ui/`
- [x] 9-file CSS split with design tokens
- [x] Allowlist SVG sanitizer (browser) + build-time validator (Node)
- [x] IndexedDB uploaded-icon storage with legacy localStorage migration
- [x] Remove `icon-library.js`/`script.js`/`styles.css` from production

### Epic 2 — Tooling & Deployment
- [x] Vite dev/build/preview wrapper, zero-dependency runtime preserved
- [x] `.github/workflows/deploy.yml` (test → build → GitHub Pages)
- [x] MIT `LICENSE`, `package.json` metadata
- [x] `delivery-truck.svg` wheel/chassis overlap fix
- [x] `invoice.svg` redesign (folded page, table grid, currency mark)

### Epic 3 — ERP Icon Catalogue Expansion
- [x] +12 ERP icons batch 1 (quotation → reconciliation)
- [x] +12 ERP icons batch 2 (credit-note → cost-center)
- [x] +6 ERP icons, `filled` style (purchase-requisition → dashboard)
- [x] `tools/gen-filled-icons.mjs` authoring-time generator
- [x] Collision check against existing 82 icons before drawing batch 2 (dropped a planned `branch` icon; redesigned `employee` as a badge, not a person)

### Epic 4 — Bug Fixes & UX Consistency
- [x] Fix filled-icon fill-colour picker (was inert on all 9 filled icons, incl. 3 pre-existing)
- [x] Unify catalogue-grid colour across outline/filled styles
- [x] Scroll-to-load auto-pagination (`IntersectionObserver`, manual button kept as fallback)
- [x] Fix "Manage brand kit" / card "⋮" showing an empty backdrop on desktop widths
- [x] Fix hardcoded "Collections: 6" badge (now derived from live category count)
- [x] Content-Security-Policy meta tag added as defence in depth

### Epic 5 — Documentation Governance
- [x] `SPEC.md` rewritten as current-state spec (status snapshot, current file tree, ADR-009–013, historical markers on completed sections)
- [x] `design-system.json` tokens re-synced to `css/tokens.css` (were stale since project inception)
- [x] `DESIGN.md` created
- [x] `components.md` marked historical, pointed to `DESIGN.md`
- [x] `EPIC.md` created
- [x] `ROADMAP.md` created
- [x] `TASK.md` created (this file)

---

## In Progress

*(none — everything above is shipped and pushed to `origin/main` as of `v0.7.1`)*

---

## Backlog (Epic 6 — Agent Experience layer, priority order)

- [ ] **`window.IconStudio` programmatic JS API** — foundation for the three items below. Not started.
- [ ] **WebMCP tool registration** (`js/services/webmcp.js`, feature-detected) — not started. Depends on the API above.
- [ ] **Read-only URL deep links** (`?icon=&size=&stroke=`) — not started. Independent of the WebMCP work; could be done first if preferred.
- [ ] **`llms.txt`** — not started. Low priority (see `ROADMAP.md` caveat on adoption uncertainty).

## Backlog (smaller, UX-only — not part of any current epic)

- [ ] Command palette (Cmd+K) — stretch, depends on the `window.IconStudio` API above.
- [ ] Search relevance ranking + match highlighting (`js/features/filters.js` is currently plain substring match).
- [ ] Toast stacking cap (`js/ui/toast.js` has no limit on concurrent toasts).
- [ ] Bulk multi-select export (currently one icon at a time).
- [ ] Theme: no UI to reset an explicit light/dark override back to "follow system".
- [ ] Minimal dependency-free accessibility-audit script (considered, deferred — see `ROADMAP.md`).

## Blocked

*(none)*

## Accepted, will-not-fix

- **`package-lock.json`'s `version` field lags `package.json`'s.** Regenerating it on Windows drops optional platform-specific peer deps that Linux CI may need. Documented as `SPEC.md` ADR-013. Not a task — a standing decision. Only revisit by regenerating the lockfile on Linux/CI.
