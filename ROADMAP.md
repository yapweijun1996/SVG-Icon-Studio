# Icon Studio — Roadmap

**Document:** `ROADMAP.md`
**Status:** Living document. The "Released" section is a factual timeline (from `CHANGELOG.md`/`git log`); the "Planned" section reflects current priority and is expected to change as work actually happens — re-order it rather than treating the order as a promise.

---

## Released

| Version | Date | Headline | Epic |
| --- | --- | --- | --- |
| `v0.1.0` | 2026-07-23 | Initial MVP | 1 |
| `v0.2.0` | 2026-07-23 | SSOT modular refactor | 1 |
| `v0.2.1` | 2026-07-23 | Invoice artwork replacement | 1 |
| `v0.2.2` | 2026-07-23 | Shared `svg-policy.js`, more test coverage | 1 |
| `v0.3.0` | 2026-07-23 | Vite dev/build, CI/CD, GitHub Pages | 2 |
| `v0.3.1` | 2026-07-23 | delivery-truck / invoice art fixes | 2 |
| `v0.4.0` | 2026-07-31 | +12 ERP icons, CSP, Collections-count fix | 3 |
| `v0.5.0` | 2026-07-31 | +12 ERP icons (finance/HR/warehouse) | 3 |
| `v0.6.0` | 2026-07-31 | +6 ERP icons (`filled` style) + generator tool | 3 |
| `v0.6.1` | 2026-07-31 | Fix: filled-icon fill-colour picker inert | 4 |
| `v0.7.0` | 2026-07-31 | Unify grid colour, scroll-to-load | 4 |
| `v0.7.1` | 2026-07-31 | Fix: empty backdrop on desktop | 4 |
| `v0.7.2` | 2026-09-10 | Accessible full-preview dialog semantics | 4 |
| `v0.7.3` | 2026-09-10 | Mobile drawer keyboard focus management | 4 |
| `v0.7.4` | 2026-09-10 | Inert background regions for mobile drawers | 4 |
| `v0.7.5` | 2026-09-10 | Enforce SVG namespace in browser sanitizer | 4 |
| `v0.7.6` | 2026-09-10 | Accessible generated-code tab semantics and keyboard navigation | 4 |
| `v0.7.7` | 2026-09-11 | Expose catalogue density selection to assistive technology | 4 |
| `v0.7.8` | 2026-09-11 | Give catalogue search a meaningful accessible name | 4 |
| `v0.7.9` | 2026-09-11 | Reject SVG DOCTYPE before browser XML parsing | 4 |
| `v0.7.10` | 2026-09-11 | Skip persisted uploads that fail the current sanitizer | 4 |
| `v0.7.11` | 2026-09-11 | Preserve deferred legacy uploads during bounded migration | 4 |
| `v0.7.12` | 2026-09-11 | Protect built-in IDs from persisted upload collisions | 4 |
| `v0.7.13` | 2026-09-11 | Reconcile metadata-only IndexedDB upload orphans | 4 |
| `v0.7.14` | 2026-09-11 | Keep valid uploads visible when orphan cleanup cannot write | 4 |
| `v0.7.15` | 2026-09-11 | Retire verified legacy IndexedDB store | 4 |
| `v0.7.16` | 2026-09-11 | Reconcile mixed direct v1→v3 upload upgrades | 4 |
| `v0.7.17` | 2026-09-11 | Decode XML entities before build-time SVG reference checks | 4 |
| `v0.7.18` | 2026-09-11 | Align SVG processing-instruction security policy | 4 |
| `v0.7.19` | 2026-09-11 | Reject foreign child SVG namespaces | 4 |
| `v0.7.20` | 2026-09-11 | Ignore inert XML text during build SVG tag scans | 4 |
| `v0.7.21` | 2026-09-11 | Reject stray CDATA close delimiters in build validation | 4 |
| `v0.7.22` | 2026-09-11 | Accept complete XML comments before the SVG root | 4 |
| `v0.7.23` | 2026-09-11 | Enforce strict XML attribute syntax in build validation | 4 |
| `v0.7.24` | 2026-09-11 | Enforce XML element nesting in build validation | 4 |
| `v0.7.25` | 2026-09-11 | Validate XML character references in build validation | 4 |
| `v0.7.26` | 2026-09-11 | Enforce a single XML document element in build validation | 4 |
| `v0.7.27` | 2026-09-11 | Enforce XML 1.0 raw character validity in build validation | 4 |
| `v0.7.28` | 2026-09-11 | Enforce canonical root attribute case sensitivity in build validation | 4 |
| `v0.7.29` | 2026-09-11 | Close browser root-dimension attribute case bypass | 4 |
| `v0.7.30` | 2026-09-11 | Enforce exact SVG element and attribute name case | 4 |
| `v0.7.31` | 2026-09-11 | Enforce strict XML declaration grammar parity | 4 |
| `v0.7.32` | 2026-09-11 | Enforce XML comment grammar parity | 4 |
| `v0.7.33` | 2026-09-11 | Reject literal `<` in XML character data | 4 |
| `v0.8.0` | 2026-09-11 | +10 ERP outline icons (payables, returns, inventory, quality, assets, payroll) | 3 |
| `v0.8.1` | 2026-09-11 | Keep catalogue functional without `IntersectionObserver` | 4 |
| `v0.9.0` | 2026-09-11 | +10 ERP outline icons (materials, traceability, logistics, operational finance) | 3 |
| `v0.9.1` | 2026-09-11 | Accessible advanced-filter disclosure semantics | 4 |
| `v0.9.2` | 2026-09-11 | Prevent stale drawer focus restoration on no-op close/Escape | 4 |
| `v0.9.3` | 2026-09-11 | Restore mobile inspector focus to originating catalogue controls | 4 |
| `v0.9.4` | 2026-09-11 | Use one concise live status for catalogue result updates | 4 |
| `v0.9.5` | 2026-09-12 | Add roving keyboard focus to icon-category toolbar | 4 |
| `v0.9.6` | 2026-09-12 | Keep modal Escape dismissal scoped to the topmost preview layer | 4 |
| `v0.9.7` | 2026-09-12 | Add static-host anti-framing protection and correct CSP framing claims | 4 |
| `v0.9.8` | 2026-09-12 | Protect offline app-shell cache from failed/unrelated navigations | 4 |
| `v0.9.9` | 2026-09-12 | Keep background asset revalidation alive through cache update | 4 |
| `v0.9.10` | 2026-09-12 | Preserve unrelated same-origin caches during service-worker activation | 4 |
| `v0.9.11` | 2026-09-12 | Bound runtime caching to canonical app assets and query-free URLs | 4 |
| `v0.9.12` | 2026-09-12 | Cap runtime CacheStorage and evict oldest obsolete app assets | 4 |
| `v0.9.13` | 2026-09-12 | Synchronize desktop inspector collapse/expand action labels | 4 |
| `v0.9.14` | 2026-09-12 | Synchronize theme-switch accessible name and tooltip action | 4 |
| `v0.9.15` | 2026-09-12 | Synchronize desktop sidebar collapse/expand action semantics | 4 |
| `v0.9.16` | 2026-09-12 | Keep favorite toggle names stable with aria-pressed state | 4 |
| `v0.9.17` | 2026-09-12 | Synchronize mobile navigation open/close action semantics | 4 |
| `v0.9.18` | 2026-09-12 | Synchronize mobile inspector open/close action semantics | 4 |
| `v0.9.19` | 2026-09-12 | Remove non-functional Inspector Pin control and dead state | 4 |
| `v0.9.20` | 2026-09-12 | Remove redundant desktop Inspector Close action | 4 |
| `v0.9.21` | 2026-09-12 | Restore accessible naming for Inspector Size slider | 4 |
| `v0.9.22` | 2026-09-12 | Stabilize Inspector colour-control accessible names | 4 |
| `v0.9.23` | 2026-09-12 | Give Rotation slider numeric values explicit degree context | 4 |
| `v0.9.24` | 2026-09-14 | Expose Fill icon helper text as an accessible description | 4 |
| `v0.9.25` | 2026-09-22 | Separate currentColor checkbox name from helper description | 4 |
| `v0.9.26` | 2026-09-22 | Separate Include title checkbox name from helper description | 4 |
| `v0.9.27` | 2026-09-22 | Give preview-background choices radio semantics and roving arrow-key focus | 4 |
| `v0.9.28` | 2026-09-22 | Scope catalogue Copy SVG accessible names to each icon | 4 |
| `v0.9.29` | 2026-09-22 | Preserve catalogue favorite focus across re-render | 4 |
| `v0.9.30` | 2026-09-22 | Preserve catalogue Select/More focus across desktop re-render | 4 |
| `v0.9.31` | 2026-09-22 | Preserve focus when unfavoriting removes a Favorites-view card | 4 |
| `v0.9.32` | 2026-09-22 | Make empty-state recovery effective and focus-safe across scoped views | 4 |
| `v0.9.33` | 2026-09-22 | Preserve keyboard focus when Clear search hides itself | 4 |
| `v0.9.34` | 2026-09-22 | Preserve focus when the final Load more control disappears | 4 |
| `v0.9.35`–`v0.9.75` | 2026-09-22 – 2026-11-03 | Focus/a11y and storage hardening, ranked search (`v0.9.60`), single outline style (`v0.9.63`, ADR-014), PWA waiting-update labels (`v0.9.65`–`v0.9.66`), +104 icons (120 → 224, `v0.9.67`–`v0.9.73`), catalogue layout pass (`v0.9.74`–`v0.9.75`) — not itemised here, see `CHANGELOG.md` | 3–4 |
| `v0.9.76` | 2026-11-03 | +6 outline icons (224 → 230) | 3 |
| `v0.9.77` | 2026-11-03 | Infinite scroll no longer stalls; manual Load more hidden when auto-load works | 4 |
| `v0.9.78` | 2026-11-03 | +10 outline icons (230 → 240) | 3 |
| `v0.9.79` | 2026-11-03 | Select expands a collapsed inspector; no loading-skeleton flash on rerender | 4 |
| `v0.9.80` | 2026-11-03 | +10 outline icons (240 → 250) | 3 |
| `v0.9.81` | 2026-11-03 | +10 outline icons (250 → 260) | 3 |

Full detail for every entry: `CHANGELOG.md`. Epic groupings and goals: `EPIC.md`.

---

## Current state (as of `v0.9.81`)

- 260 icons, 10 categories, one built-in style (260/260 outline; filled stays supported for uploads, ADR-014).
- Zero runtime dependencies; Vite is dev/build tooling only.
- CSP + SVG allowlist sanitizer; PWA manifest + service worker with user-approved updates; CI/CD to GitHub Pages on push to `main`.
- Infinite scroll with no manual Load more (when `IntersectionObserver` exists); selecting an icon always shows the inspector.
- No known open bugs.
- **Production-readiness review (2026-11-03):** production-ready as a static icon-browsing app; not yet as an icon library others depend on. Gaps: no automated browser/a11y tests, no PR gate before production, no artwork-quality checks, no consumable distribution. See `review/production-readiness-v0.9.81.md` and Epic 7 below.

---

## Planned: Production readiness (Epic 7) — recommended next

Source: `review/production-readiness-v0.9.81.md`. Do this before Epic 6: it protects every change that follows. **None of this is built yet.**

### Why

The two most recent bugs (v0.9.77 infinite-scroll stall, v0.9.79 inspector not opening / loading-skeleton flash) both passed the full `npm test` suite and were only caught by driving a real browser. 80 of the 251 assertions in `tests/dom.test.mjs` regex-match source text rather than exercising behaviour, and pushing `main` deploys straight to production with CI running only afterwards.

### Priority order

**P0 — before calling it production**
1. **Decide on test-only devDependencies** (Playwright, axe-core) — *Impact: unblocks 2–3. Effort: a decision.* This reverses the axe-core note in the AX epic's "Explicitly out of scope" list below, so it needs an explicit ADR (`SPEC.md` ADR-015, *Proposed*). ADR-005 is unaffected: the runtime stays dependency-free either way.
2. **Playwright browser tests in CI** — *Impact: high. Effort: medium.* Core flows at 1440 / 1024 / 390 px; retire the source-regex assertions they replace.
3. **axe-core accessibility checks** in the same run — *Impact: medium. Effort: low.*
4. **PR workflow + branch protection** — *Impact: high. Effort: low.* validate, typecheck, unit, browser and build on every PR; `main` accepts PRs only.
5. **Vite ≥ 8.3.5 + `npm audit --omit=dev` in CI** — *Impact: medium (4 dev-only advisories). Effort: low.* Regenerate the lockfile on Linux (ADR-013).
6. **`"private": true`** — *Impact: low. Effort: trivial.*

**P1 — make it a real icon library**
7. **Publishable icons package** generated from `icons/catalog/` (SVGs, sprite, ESM, React components, types) — *Impact: high. Effort: medium-high.* Compatible with the "Explicitly decided against" item below: the app itself keeps fetching SVGs at runtime; the package is a separate generated artifact.
8. **Artwork checks in the validator** (safe-area bounds, precision, child paint, near-duplicates) — *Impact: medium. Effort: medium.*
9. **Per-PR contact sheet + designer sign-off** — *Impact: medium-high. Effort: low-medium.* The 36 icons added in v0.9.76–v0.9.81 were AI-authored; Commission and Handshake are weak at 16 px.
10. **Generated doc counts/versions** — *Impact: low-medium. Effort: low.*

**P2 — polish and scale**
11. Scale past ~1,000 icons (incremental grid updates, sprite delivery).
12. Repo hygiene (`review/` artifacts out of git, `.gitattributes` `eol=lf`, slimmer `CHANGELOG.md`).
13. Define 1.0 (P0 done + package published) and icon semver (new icon = minor; rename/removal = major).

---

## Planned: Agent Experience (AX) layer

This section is grounded in live research (WebMCP W3C proposal docs, Chrome for Developers docs, `agentexperience.ax`, `llms.txt` guides — see the research turn in session history for sources), not assumption. **None of this is built yet.**

### Why

Every session working on this app so far has needed to drive the UI through simulated clicks/search/scroll to get anything done — including by automation/AI agents verifying changes. The catalogue's own lazy-loading pagination (24 icons per page) means an agent can't even reliably find an icon in the DOM without first scrolling it into view. A programmatic layer removes this entirely, for both agents and power users.

### Priority order (do not skip ahead — each item is the foundation for the next)

1. **`window.IconStudio` programmatic JS API** — *Impact: high (foundation for everything below). Effort: low. Risk: very low.*
   Extract `search_icons`/`select_icon`/`get_icon_svg`/`set_appearance`/`export_code`-equivalent operations out of `app.js`'s private closures into one explicitly exposed object. One implementation, three future consumers (WebMCP tools, a command palette, automation/testing).

2. **WebMCP tool registration** — *Impact: high (this is literally what was asked about). Effort: medium. Risk: very low (feature-detected, purely additive).*
   New module `js/services/webmcp.js`, guarded by `if (!('modelContext' in document)) return;`. Registers tools (`search_icons`, `get_icon_svg`, `select_icon`, ...) via `document.modelContext.registerTool({name, description, inputSchema, execute})`, each `execute` delegating to the API from item 1. **Must reuse the existing sanitizer/policy pipeline for any tool that accepts SVG/text input — see `SPEC.md` §13.** Chrome/Edge native support targeted H2 2026 (origin trial from Chrome 149); until then this code is inert everywhere, at zero cost.

3. **Read-only URL deep links** (`?icon=invoice&size=64&stroke=%232962ff`) — *Impact: medium-high (benefits humans and agents equally — shareable config links, not an agent-only feature). Effort: low. Risk: low.*
   Parsed once on startup to pre-set `state.selectedId`/`state.appearance`; not written back to the URL (avoids fighting existing shell/view state).

4. **`llms.txt`** — *Impact: low. Effort: very low.*
   A root-level machine-readable summary (what the app is, where `data/icon-registry.json` lives, how `tools/convert-svg.mjs` works). **Caveat, confirmed by research:** as of 2026 this is not an official web standard and no major LLM provider has committed to crawling it on a schedule — worth doing because it's cheap, not because it's guaranteed to matter.

5. **Stretch — Command palette (Cmd+K)** — *Impact: medium (pure UX, no agent angle). Effort: medium.*
   Search/switch-view/toggle-theme in one keyboard-driven UI, built on top of item 1's API — proof that the programmatic layer pays for itself in human-facing UX too, not just agent access.

6. **Stretch — Search relevance ranking** — *Impact: medium. Effort: low-medium.*
   **Ranking shipped in `v0.9.60`** (word-boundary token scoring in `js/features/filters.js`). Remaining: highlighting the matched portion in card names/tags (`TASK.md` UX backlog).

### Explicitly out of scope for this epic

- Anything that would bypass the SVG sanitizer for agent-supplied input (§13 is non-negotiable regardless of caller).
- A full accessibility-audit tooling addition (e.g. axe-core) — *being reconsidered under Epic 7 P0 item 1 (ADR-015, Proposed)*; conflicts with the zero-devDependency-beyond-Vite convention; a from-scratch minimal checker was considered and deferred, not rejected outright.
- Bulk/ZIP export and toast-stacking caps — real UX gaps, noted, but unrelated to the AX layer; see `TASK.md` backlog if they get picked up.

---

## Explicitly decided against

- **Deeper Vite integration** (importing icon SVGs/registry as ES modules instead of runtime `fetch`) — considered and declined (2026-07-31). Would contradict the documented zero-runtime-dependency architecture (`SPEC.md` ADR-001) and the SSOT principle that the catalogue must be addressable by any static file server, not just a bundler. Current Vite setup (dev/build wrapper only) already satisfies the actual need.
