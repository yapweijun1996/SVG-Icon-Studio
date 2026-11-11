# Icon Studio — Tasks

**Document:** `TASK.md`
**Status:** Living document — the granular task tracker underneath `EPIC.md`/`ROADMAP.md`. Update this file (not just `CHANGELOG.md`) whenever a task starts, finishes, or gets blocked. Every "Done" item below is verified in a real running app (browser test, not just `npm test`) unless stated otherwise — see `CHANGELOG.md`'s per-release **Validation** sections for exact evidence.

**Convention (standing, since `v0.3.0`):** any user-visible change ships with a `package.json` version bump, a `CHANGELOG.md` entry with a Validation subsection, and — as of this documentation pass — a `TASK.md` update. `npm test`, `npm run typecheck`, `npm run build` must all pass before a task is marked Done.

---


## Done

### Epic 3 (continued) — General Icon Catalogue
- [x] Add the User, Profile, Image and Document built-in icons; update registry metadata and release documentation for `v0.9.73`.
- [x] `v0.9.76` six new outline icons: Trending Down, Chart Pie, Logout, Sort, More Horizontal, Credit Limit (catalogue 224 → 230)
- [x] `v0.9.78` ten new outline icons: Chart Line, Login, More Vertical, Grid View, List View, Sun, Moon, Org Chart, Warranty, Overdue Invoice (catalogue 230 → 240)
- [x] `v0.9.80` ten new outline icons: Target, Commission, Petty Cash, Calendar X, Table, Pushpin, Hourglass, History, Unlink, Barcode Scanner (catalogue 240 → 250)
- [x] `v0.9.81` ten new outline icons: Bell Off, Lightbulb, Thumbs Up, Trophy, Handshake, Gantt Chart, E-Signature, Cargo Ship, File Spreadsheet, Arrow Left Right (catalogue 250 → 260)
- [x] `v0.9.84` Arrow Down Right outline icon (catalogue 260 → 261)

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
- [x] `v0.9.82` pull-request CI workflow (`ci.yml`), typecheck in `deploy.yml`, `package.json` marked private (Epic 7 P0)
- [x] `v0.9.83` Playwright + axe-core browser suite (`tests/e2e/`) in `ci.yml` and `deploy.yml`; WCAG label-in-name and contrast fixes it surfaced (Epic 7 P0)

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
- [x] Protect the service-worker offline app-shell cache from failed/unrelated navigation responses and invalidate the pre-fix cache, released as `v0.9.8`
- [x] Keep stale-while-revalidate asset refreshes alive through their network fetch and cache write with `FetchEvent.waitUntil()`, released as `v0.9.9`
- [x] Scope service-worker cache eviction to `icon-studio-*` names so activation preserves unrelated same-origin application caches, released as `v0.9.10`
- [x] Bound service-worker runtime caching to canonical app-owned asset namespaces and query-free URLs so cache-busting/arbitrary same-origin requests cannot grow persistent CacheStorage, released as `v0.9.11`
- [x] Cap runtime CacheStorage at 256 app-asset entries and evict oldest overflow without touching the offline shell/manifest, preventing obsolete hashed deployment assets from accumulating indefinitely, released as `v0.9.12`
- [x] Keep the desktop inspector collapse/expand button accessible name and tooltip synchronized with its current action, released as `v0.9.13`
- [x] Keep the theme icon button accessible action name and visible tooltip synchronized with the theme it will switch to, released as `v0.9.14`
- [x] Keep the desktop sidebar brand toggle's accessible action name and tooltip synchronized across expanded/collapsed states, released as `v0.9.15`
- [x] Keep favorite toggle accessible names stable while `aria-pressed` alone communicates saved/unsaved state, released as `v0.9.16`
- [x] Keep the mobile navigation trigger accessible name synchronized with its current open/close action, released as `v0.9.17`
- [x] Keep the mobile inspector trigger accessible name synchronized with its current open/close action, released as `v0.9.18`
- [x] Remove the non-functional Inspector Pin control/dead persisted state and keep drawer focus entry on visible controls, released as `v0.9.19`
- [x] Keep the drawer-only Close inspector control hidden on docked desktop so it does not duplicate the Collapse inspector action, released as `v0.9.20`
- [x] Give the Inspector Size range an explicit native label so its browser accessibility name is non-empty, released as `v0.9.21`
- [x] Keep Inspector Stroke/Fill colour accessible names stable while their native values and visible hex readouts change, released as `v0.9.22`
- [x] Include the degree unit in the Inspector Rotation slider accessible name so Chrome’s native numeric range value is understandable, released as `v0.9.23`
- [x] Associate the visible Fill icon helper text with its checkbox as an accessible description, released as `v0.9.24`
- [x] Keep the Use currentColor checkbox name concise and expose its visible helper as a separate accessible description, released as `v0.9.25`
- [x] Keep the Include title checkbox name concise and expose its visible helper as a separate accessible description, released as `v0.9.26`
- [x] Expose Preview background as one mutually-exclusive radio group with roving Arrow-key focus, released as `v0.9.27`
- [x] Give every catalogue Copy SVG action an icon-specific accessible name while retaining the compact visible label, released as `v0.9.28`
- [x] Preserve keyboard focus on the re-rendered catalogue Favorite action after toggling, released as `v0.9.29`
- [x] Preserve keyboard focus on re-rendered catalogue Select and More actions on desktop without disrupting mobile/tablet inspector focus transfer, released as `v0.9.30`
- [x] Preserve keyboard focus when unfavoriting removes the focused card from Favorites view, moving to the nearest remaining Favorite action or the visible empty-state heading, released as `v0.9.31`
- [x] Make empty-state recovery context-aware: reset filters when results are merely hidden, otherwise browse the full library and move focus to the visible results heading, released as `v0.9.32`
- [x] Preserve keyboard focus when Clear search hides itself by returning focus to the search field, released as `v0.9.33`
- [x] Preserve focus when final Load more activation hides the manual pagination control by moving to the first newly revealed icon action, released as `v0.9.34`
- [x] Keep mobile/tablet drawer Tab traps limited to rendered controls with non-negative effective tabindex, released as `v0.9.35`
- [x] Expose Catalogue Grid/Compact density as a single-choice radio group with one Tab stop and Arrow-key selection/focus, released as `v0.9.36`
- [x] Move keyboard focus directly into the first Advanced Filter control when the disclosure opens, avoiding an unrelated density stop between trigger and disclosed content, released as `v0.9.37`
- [x] Dismiss the Advanced Filters disclosure with Escape from any contained control, restore trigger focus, and keep outer drawer Escape handling isolated, released as `v0.9.38`
- [x] Keep the zero-dependency `npm run serve` path aligned with Vite by serving `public/` assets from the app root with correct manifest/PNG MIME types, released as `v0.9.39`
- [x] Keep the Collections view's category-grouped default sort scoped to Collections and restore the previous non-Collections sort when navigating away, released as `v0.9.40`
- [x] Announce SPA workspace navigation by focusing the updated page heading and synchronizing the browser document title with the active view, released as `v0.9.41`
- [x] Add active search/category/style/scoped-view context to the catalogue result status so screen-reader users hear what a dynamic result count refers to, released as `v0.9.42`
- [x] Coalesce rapid search typing into one delayed result-status announcement while keeping visual filtering immediate, preventing partial queries from flooding the polite live region, released as `v0.9.43`
- [x] Keep Chinese/Japanese IME composition visually responsive while suppressing partial-query live announcements until composition commits, released as `v0.9.44`
- [x] Keep native search Escape/cancel clearing synchronized with the visible/live result status immediately while preserving the non-empty typing debounce, released as `v0.9.45`
- [x] Keep IntersectionObserver auto-pagination silent in the polite result live region while preserving the visible count and refreshing any already-pending search announcement, released as `v0.9.46`
- [x] Keep Grid/Compact density changes silent in the catalogue result live region because they alter presentation only, avoiding duplicate unchanged announcements, released as `v0.9.47`
- [x] Keep Select/More and non-Favorites favorite rerenders silent in the catalogue result live region while preserving one contextual announcement when Favorites membership changes the visible result set, released as `v0.9.48`
- [x] Keep Sort-only catalogue rerenders silent in the result live region because ordering changes presentation without changing the result set or context, released as `v0.9.49`
- [x] Name the results reset action **Clear filters** so its accessible/visible label matches its actual query/category/style reset behavior, released as `v0.9.50`
- [x] Keep filter-only results reset focus in the updated results context while preserving Search focus for query-driven resets, released as `v0.9.51`
- [x] Keep Advanced **Clear filters** silent when it only resets Sort or repeats defaults, while preserving one contextual announcement for query/category/style resets and retaining focus, released as `v0.9.52`
- [x] Preserve focused Category chips and icon-card actions across automatic IntersectionObserver pagination rerenders so background loading cannot drop keyboard focus to `body`, released as `v0.9.53`
- [x] Make re-activating the already-selected Category a true no-op so expanded result batches are preserved and unchanged polite result announcements are not repeated, released as `v0.9.54`
- [x] Make re-activating the already-current workspace navigation item a true catalogue-state no-op while still closing the mobile drawer, released as `v0.9.55`
- [x] Let the compact theme control cycle back to live **Follow system** mode, clearing the explicit override and reacting to OS/browser colour-scheme changes, released as `v0.9.56`
- [x] Cap concurrent toast feedback at three visible messages, evicting the oldest first so rapid actions cannot cover most of a mobile viewport, released as `v0.9.57`
- [x] Make burst toast announcements non-atomic and additions-only so new feedback does not replay earlier still-visible toasts, released as `v0.9.58`
- [x] Keep mobile burst toast feedback below the sticky topbar and top safe-area inset so transient messages never cover primary navigation/actions, released as `v0.9.59`
- [x] Improve search relevance ranking in `js/features/filters.js`: replace plain substring matching with word-boundary token scoring so short queries (e.g. "ai") no longer match mid-word substrings (mAIl, chAIn), and direct name/token matches rank ahead of tag/metadata matches under Featured sort while preserving all explicit user sorts, released as `v0.9.60`
- [x] v0.9.61: replace the misleading unavailable-icon X during lazy loading with a neutral skeleton; reserve the error fallback for confirmed failures and load previews directly without IntersectionObserver.
- [x] v0.9.62: show the running PWA version and surface a user-controlled Update vX.Y.Z action for waiting service workers; embed the release version into the built worker/cache generation so every deployment can be detected reliably.
- [x] v0.9.63: standardize all 120 built-in SVGs on the canonical 1.5-weight outline language; redraw the 9 former filled outliers plus Invoice, enforce the outline contract in validation, and keep filled support only for validated imported/future assets.
- [x] v0.9.64: prevent tablet topbar overflow by hiding the redundant icon-count pill at the existing ≤1180px inspector-drawer breakpoint while keeping the PWA version/update action visible.
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
- [x] `v0.9.74` catalogue layout pass (Phases 1–4): sticky toolbar no longer shows scrolled cards through a fade and keyboard focus no longer lands under it (WCAG 2.4.11); toolbar controls share one 44px height with a labelled Filters button; chips are one scrollable row at every width; 11px minimum type scale across catalogue/shell/inspector; quieter single-border icon cards with full-name tooltips; Bin Location and Budget icons redrawn
- [x] `v0.9.75` catalogue layout pass (Phases 5–6): compact topbar heading ("Icon Library" + one-line subtitle) replaces the hero block and breadcrumb; duplicate "N visible" count removed; version pill moved to the sidebar footer; quieter active nav item; brand card hides on short viewports; desktop inspector collapse hides the panel completely with the topbar inspector button as the way back
- [x] `v0.9.77` infinite scroll: sentinel re-armed on every render so auto-load no longer stalls; manual Load more button hidden when IntersectionObserver is available
- [x] `v0.9.79` selecting an icon expands a collapsed desktop inspector; rebuilt cards reuse resolved previews so clicks no longer flash every icon back to the loading skeleton

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

*(none — current release `v0.9.83` adds automated browser + accessibility tests. Next: owner enables branch protection on `main`; then the Vite upgrade (7.2).)*

---

## Backlog (Epic 7 — Production Readiness, priority order)

Source: `review/production-readiness-v0.9.81.md` (2026-11-03). Verdict: production-ready as a static browsing app; not yet as an icon library others depend on.

### P0 — before calling it production
- [x] **Decide: allow test-only devDependencies** — ADR-015 accepted in `v0.9.83` (Playwright + axe-core, exact-pinned, test-only; runtime unaffected).
- [x] **Playwright browser tests in CI** — `v0.9.83`: `tests/e2e/catalogue.spec.mjs` at 1440 / 1024 / 390 px (+1920 px for the scroll stall): full count and version, infinite scroll to the end (grid + compact), viewport-filled stop, ID/name/alias search for all 40 icons added since v0.9.73, category reset, select-opens-inspector (desktop expand / drawer without overwriting preference), no skeleton flash on select/favorite/density, keyboard focus (5c/5d), accessible names. Re-introducing each v0.9.77/v0.9.79 bug fails its test. 11 source-regex assertions retired from `tests/dom.test.mjs` (248 → 237). It also exposed a real bug: a slow startup rerender stole keyboard focus from a card (fixed in `render()`).
- [x] **axe-core accessibility checks** — `v0.9.83`: `tests/e2e/a11y.spec.mjs`, WCAG 2.1 A/AA, library / inspector / empty state / dark theme at 3 widths. First run found and fixed: label-in-name on 48 card buttons, nav items and the brand toggle (2.5.3); primary-button contrast 3.3:1 → 5.2:1 and dark-theme accent text 2.6:1 → 6.6:1 (1.4.3).
- [ ] **PR workflow + branch protection** — workflow part done in `v0.9.82` (`.github/workflows/ci.yml`: validate, typecheck, `npm test`, build, version check on every PR; `deploy.yml` now also typechecks). **Remaining (owner):** enable branch protection on `main` (require a PR and the `CI / check` status), browser tests are already in `ci.yml` and `deploy.yml` (`v0.9.83`).
- [ ] **Upgrade Vite** 8.1.5 → ≥ 8.3.5 (4 dev-only advisories, 3 high) and add `npm audit --omit=dev` to CI. Regenerate the lockfile on Linux per ADR-013.
- [x] **Set `"private": true`** in `package.json` — done in `v0.9.82`; `npm publish` now fails with `EPRIVATE`.

### P1 — make it a real icon library
- [ ] **Publishable icons package** generated from `icons/catalog/` (raw SVGs, SVG sprite, ESM exports, React components, TypeScript types); the catalogue SVGs stay the single source of truth.
- [ ] **Artwork checks in `tools/validate-icons.mjs`:** safe-area bounds (2–22, headless-computed like `review/svg-v0.9.67/after/bounds.json`), ≤ 2 decimal places, no child `fill`/`stroke`, near-duplicate warning.
- [ ] **Per-PR contact sheet + designer sign-off:** render new/changed icons at 16/24/48 px, light/dark, beside nearest neighbours; human approval before merge. First candidates for redraw review: Commission and Handshake at 16 px (v0.9.80/v0.9.81).
- [ ] **Generate doc counts/versions** (README, SPEC, DESIGN icon totals and release numbers) from the registry and `package.json` instead of editing 5 files per release.

### P2 — polish and scale
- [ ] **Scale past ~1,000 icons:** incremental grid updates instead of a full rebuild per render; sprite delivery instead of one request per icon.
- [ ] **Repo hygiene:** move bulky `review/` artifacts (1.7 MB) to CI artifacts or releases; add `* text=auto eol=lf` to `.gitattributes` to stop LF/CRLF churn; slim `CHANGELOG.md` to user-facing notes.
- [ ] **Define 1.0 and icon semver:** 1.0 = Epic 7 P0 done + package published; new icon = minor, icon rename/removal = major.

## Backlog (Epic 6 — Agent Experience layer, priority order)

- [ ] **`window.IconStudio` programmatic JS API** — foundation for the three items below. Not started.
- [ ] **WebMCP tool registration** (`js/services/webmcp.js`, feature-detected) — not started. Depends on the API above.
- [ ] **Read-only URL deep links** (`?icon=&size=&stroke=`) — not started. Independent of the WebMCP work; could be done first if preferred.
- [ ] **`llms.txt`** — not started. Low priority (see `ROADMAP.md` caveat on adoption uncertainty).

## Backlog (smaller, UX-only — not part of any current epic)

- [ ] Command palette (Cmd+K) — stretch, depends on the `window.IconStudio` API above.
- [ ] Search match highlighting (relevance ranking shipped in `v0.9.60`; highlighting the matched portion in the catalogue card name/tag remains).
- [ ] Bulk multi-select export (currently one icon at a time).
- [x] ~~Minimal dependency-free accessibility-audit script~~ — superseded by axe-core (ADR-015, `v0.9.83`).
- [ ] Align the topbar and the 1500px-capped catalogue content to one shared container on ultra-wide screens (layout review item #16).

## Blocked

*(none — ADR-015 accepted in `v0.9.83`.)*

## Accepted, will-not-fix

- **`package-lock.json`'s `version` field lags `package.json`'s.** Regenerating it on Windows drops optional platform-specific peer deps that Linux CI may need. Documented as `SPEC.md` ADR-013. Not a task — a standing decision. Only revisit by regenerating the lockfile on Linux/CI.
