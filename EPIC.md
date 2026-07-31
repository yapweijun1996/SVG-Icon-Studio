# Icon Studio — Epics

**Document:** `EPIC.md`
**Status:** Living document. Epics are derived from actual shipped releases in [`CHANGELOG.md`](CHANGELOG.md) and real git history (`git log --oneline`), not from a plan written in advance. Update this file when a new epic starts or an existing one's status changes — don't let it drift from `TASK.md`/`ROADMAP.md`.
**Granularity:** an epic is a multi-release or multi-commit body of work with one coherent goal. Individual fixes/features within an epic are tracked at finer grain in `TASK.md`.

---

## Epic 1 — SSOT Modular Refactor ✅ DONE

**Goal:** replace the monolithic `icon-library.js` / `script.js` / `styles.css` architecture with the Single Source of Truth structure specified in `SPEC.md`.
**Releases:** `v0.1.0` → `v0.2.2` (2026-07-23)
**Full spec:** `SPEC.md` §1–§21 (kept as the historical record; still the current architecture)

- `v0.1.0` — Initial MVP (searchable cards, favorites, recent, upload, inspector, SVG/JSX/CSS export) — the pre-refactor baseline.
- `v0.2.0` — The refactor itself: one SVG file per icon, geometry-free `data/icon-registry.json`, ES module split (`core`/`services`/`features`/`ui`), 9-file CSS split, allowlist sanitizer, IndexedDB upload storage with legacy migration.
- `v0.2.1` — Replaced `invoice.svg` with the approved document design.
- `v0.2.2` — Fixed a `clip-path-units`/`clippathunits` naming bug by extracting the allow-list into one shared `js/services/svg-policy.js` module (imported by both the browser sanitizer and the Node build-time checker) so the two can't drift apart again; added unit test coverage for previously-untested pure modules.

**Status:** Complete and stable. This is the permanent baseline architecture — every later epic builds on top of it without reopening it.

---

## Epic 2 — Tooling & Deployment ✅ DONE

**Goal:** get from "open `index.html` directly" to a real dev loop and automated deploy, without compromising the zero-runtime-dependency architecture from Epic 1.
**Releases:** `v0.3.0` → `v0.3.1` (2026-07-23)

- `v0.3.0` — Added Vite (`npm run dev`/`build`/`preview`) as a dev-only wrapper (ADR-001); `.github/workflows/deploy.yml` (install → test → build → GitHub Pages on push to `main`); MIT `LICENSE`; kept `npm run serve` (`tools/serve.mjs`) for a zero-`node_modules` path.
- `v0.3.1` — Fixed `delivery-truck.svg` wheel/chassis overlap and corner style; replaced `invoice.svg` again with a clearer document design and an isolated `stroke-width: 1` exception.

**Status:** Complete. No open work — see `EPIC.md` §6 for the (settled, "no change needed") question of whether to convert further.

---

## Epic 3 — ERP Icon Catalogue Expansion ✅ DONE

**Goal:** grow the catalogue's ERP/back-office coverage and add a second icon style.
**Releases:** `v0.4.0` → `v0.6.0` (2026-07-31)
**Result:** ERP category 6 → 36 icons; catalogue 70 → 100 icons; icon styles 1 → 2 (`outline` + `filled`)

- `v0.4.0` — First ERP batch (+12: quotation, goods-receipt, stock-transfer, bill-of-materials, work-order, inventory, ledger, approval, workflow, tax, report, reconciliation). Also added the CSP meta tag (pulled into this release alongside the icons) and fixed the hardcoded "Collections: 6" sidebar badge.
- `v0.5.0` — Second ERP batch (+12: credit-note, goods-issue, contract, bank, employee, timesheet, audit-trail, budget, price-list, batch-lot, bin-location, cost-center), moving past documents into finance/HR/warehouse/controlling.
- `v0.6.0` — Third ERP batch (+6, `filled` style: purchase-requisition, debit-note, packing-list, pick-list, journal-entry, dashboard) plus `tools/gen-filled-icons.mjs`, the generator this style requires (see `SPEC.md` ADR-010).

**Status:** Complete for the current scope. Adding more icons later is a normal, low-risk extension of this same pattern (see `SPEC.md` §17.1) — not a new epic unless the taxonomy itself needs to change.

---

## Epic 4 — Bug Fixes & UX Consistency ✅ DONE

**Goal:** fix real defects surfaced once Epic 3 changed the shape of the catalogue (3→9 filled icons, 6→36 ERP icons), and one longer-standing responsive-layout bug.
**Releases:** `v0.6.1` → `v0.7.1` (2026-07-31)

- `v0.6.1` — Fixed the Inspector fill-colour picker being inert for all 9 `filled` icons (their colour was silently controlled by the *stroke* picker instead) — a pre-existing bug in `purchase-order`/`delivery-order`/`ai-spark` that Epic 3 made easier to notice.
- `v0.7.0` — Unified catalogue-grid icon colour across styles (removed the `filled`→accent-orange override, ADR-011); added scroll-to-load auto-pagination (ADR-012).
- `v0.7.1` — Fixed "Manage brand kit" / card "⋮" showing an empty dimming backdrop on desktop widths (`openInspector()` wasn't gated by the same viewport check `closeInspector()` already used).

**Status:** Complete. All three fixes were verified in a real running browser, not just by code review — see each release's Validation section in `CHANGELOG.md`.

---

## Epic 5 — Documentation Governance ✅ DONE (this pass)

**Goal:** establish `SPEC.md`/`DESIGN.md`/`EPIC.md`/`ROADMAP.md`/`TASK.md` as a living, accurate, cross-referenced documentation set, with the codebase as source of truth.

- Rewrote `SPEC.md` from a forward-looking `v0.2.0` migration plan into a current technical specification (added a status snapshot, updated the file tree/baseline/security/tooling sections to match reality, added ADR-009 through ADR-013, marked the migration plan and original acceptance checklist as historical/satisfied).
- Fixed `design-system.json`'s tokens, which had silently drifted from `css/tokens.css` since the project's inception (`background`/`text`/`muted`/`line` were all stale placeholder values, never the real shipped colours).
- Created `DESIGN.md` as the current design system reference; marked `components.md` as the historical pre-implementation brief.
- Created this file, `ROADMAP.md`, and `TASK.md`.

**Status:** Complete for this pass. Keeping these documents accurate going forward is itself an ongoing responsibility — see the "Documentation upkeep" convention in `TASK.md`.

---

## Epic 6 — Agent Experience (AX) Layer 🔜 PLANNED, NOT STARTED

**Goal:** let both human users and AI agents/automation address the app programmatically instead of only through simulated UI interaction — researched in depth (grounded in live web research on WebMCP/AX standards, not assumption) but no code written yet.
**Depends on:** nothing blocking; can start anytime.
**Full detail:** `ROADMAP.md` §"Agent Experience layer"

Planned scope, in dependency order:
1. `window.IconStudio` programmatic JS API (the shared substrate everything else below builds on).
2. WebMCP tool registration (`document.modelContext.registerTool`, W3C proposal, Chrome/Edge native support targeted H2 2026) — feature-detected, zero effect on unsupported browsers.
3. Read-only URL deep links (`?icon=&size=&stroke=`) — benefits human sharing and agent fetching equally.
4. `llms.txt` (low priority — not an official standard as of 2026, no major LLM provider has committed to crawling it).
5. Stretch: command palette (Cmd+K), search relevance ranking — UX-motivated but reuses the same API from item 1.

**Status:** Backlog. Nothing in this epic blocks any other epic; it can be picked up whenever prioritized.
