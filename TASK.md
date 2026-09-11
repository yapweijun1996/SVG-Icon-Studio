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
- [x] +10 ERP icons, `outline` style (supplier-invoice → payroll), released as `v0.8.0`
- [x] +10 ERP icons, `outline` style (material-request → depreciation), released as `v0.9.0`
- [x] `tools/gen-filled-icons.mjs` authoring-time generator
- [x] Collision check against existing 82 icons before drawing batch 2 (dropped a planned `branch` icon; redesigned `employee` as a badge, not a person)

### Epic 4 — Bug Fixes & UX Consistency
- [x] Keep catalogue startup and manual pagination functional when `IntersectionObserver` is unavailable, released as `v0.8.1`
- [x] Fix filled-icon fill-colour picker (was inert on all 9 filled icons, incl. 3 pre-existing)
- [x] Unify catalogue-grid colour across outline/filled styles
- [x] Scroll-to-load auto-pagination (`IntersectionObserver`, manual button kept as fallback)
- [x] Fix "Manage brand kit" / card "⋮" showing an empty backdrop on desktop widths
- [x] Fix hardcoded "Collections: 6" badge (now derived from live category count)
- [x] Content-Security-Policy meta tag added as defence in depth
- [x] Full-preview dialog exposes its visible title and description to assistive technology
- [x] Mobile navigation and inspector drawers manage focus entry, Tab trapping and trigger restoration
- [x] Mobile navigation and inspector drawers hide non-active app regions from the accessibility tree with native `inert`, including sidebar → inspector handoff
- [x] Enforce the canonical SVG namespace in the browser upload sanitizer to keep runtime and build-time security policy aligned
- [x] Generated-code SVG/JSX/CSS tabs use complete ARIA tab/tabpanel relationships and keyboard navigation with roving focus
- [x] Catalogue Grid/Compact density controls expose synchronized `aria-pressed` selection state
- [x] Catalogue search exposes a meaningful accessible name instead of announcing only the `/` keyboard shortcut hint
- [x] Advanced-filter disclosure exposes `aria-controls` plus synchronized expanded state and Show/Hide accessible action labels, released as `v0.9.1`
- [x] Drawer close/Escape restores focus only after a real open→closed transition, preventing stale drawer trigger focus theft, released as `v0.9.2`
- [x] Catalogue Select/More inspector flows restore focus to the corresponding re-rendered card control on mobile/tablet, released as `v0.9.3`
- [x] Catalogue result updates use one concise `status` live region instead of making both the results header and interactive icon grid live, released as `v0.9.4`
- [x] Icon categories toolbar uses one roving Tab stop with Left/Right/Home/End keyboard navigation, released as `v0.9.5`
- [x] Full-preview modal Escape dismisses only the topmost dialog before an underlying mobile/tablet inspector drawer, released as `v0.9.6`
- [x] Replace the ineffective meta `frame-ancestors` claim with a static-host anti-framing fallback and document response-header hardening, released as `v0.9.7`
- [x] Browser SVG sanitizer rejects `DOCTYPE` before XML parsing so untrusted entity declarations cannot reach `DOMParser`
- [x] Browser/build SVG validation enforce strict XML declaration grammar and reject malformed declarations consistently
- [x] Build-time SVG validator decodes XML character references before URL/reference checks, matching browser `DOMParser` security semantics
- [x] Node/build SVG validation rejects stray `]]>` in character data while preserving quoted-attribute and valid CDATA cases
- [x] Node/build SVG validation rejects literal `<` in character data while preserving `&lt;`, literal `>`, comments, and CDATA
- [x] Node/build SVG validation enforces XML element nesting and rejects missing, mismatched, out-of-order, or extra closing tags
- [x] Node/build SVG validation rejects multiple top-level XML document elements while preserving valid nested SVG elements
- [x] Node/build SVG validation rejects illegal raw XML 1.0 code points in text, attributes, comments, and CDATA while preserving legal ranges
- [x] Node/build SVG validation treats canonical root `viewBox` and `xmlns` names as case-sensitive, matching browser XML parsing
- [x] Browser SVG validation rejects root `width`/`height` case variants and strips them safely during import normalization without affecting child dimensions
- [x] Browser and Node/build SVG validation require exact canonical element and attribute names while preserving normalized conversion and case-insensitive security checks
- [x] Node/build SVG validation accepts complete XML comments before the root element while rejecting unterminated leading comments
- [x] Node/build SVG validation rejects XML comments containing internal `--` sequences while preserving valid comments
- [x] Node/build SVG validation rejects duplicate, unquoted, bare and malformed XML attributes while preserving valid quoted values
- [x] Browser/build SVG validation rejects foreign child namespaces even when the local element name is allowlisted
- [x] Build-time SVG validation ignores tag-like text inside complete XML comments/CDATA while still rejecting real forbidden elements
- [x] Persisted uploaded icons are revalidated before registration so assets rejected by newer security policy do not surface as broken catalogue entries
- [x] Legacy localStorage upload migration preserves records beyond its 50-item batch and retains failed records for retry instead of deleting user data
- [x] Persisted/legacy uploaded records cannot overwrite canonical built-in icon IDs during registration
- [x] Retire the obsolete v1 IndexedDB upload store only after every legacy ID has a metadata+asset counterpart, without replaying stale values
- [x] Direct v1→v3 upgrades remove successfully migrated legacy rows while preserving incomplete rows for recovery
- [x] IndexedDB startup reconciliation removes metadata-only upload orphans while preserving asset-only SVG payloads for possible recovery
- [x] IndexedDB orphan cleanup is best-effort so cleanup write failures cannot hide otherwise valid uploaded icons

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

*(none — current local release `v0.9.7` is fully verified; local commits remain unpushed by policy.)*

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
