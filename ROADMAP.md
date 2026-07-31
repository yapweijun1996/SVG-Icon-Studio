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

Full detail for every entry: `CHANGELOG.md`. Epic groupings and goals: `EPIC.md`.

---

## Current state (as of `v0.7.1`)

- 100 icons, 10 categories, 2 styles (91 outline / 9 filled).
- Zero runtime dependencies; Vite is dev/build tooling only.
- CSP + SVG allowlist sanitizer; PWA manifest + service worker; CI/CD to GitHub Pages.
- Full documentation set (`SPEC.md`, `DESIGN.md`, `EPIC.md`, `ROADMAP.md`, `TASK.md`) established and current.
- No known open bugs. No blockers on any planned work below.

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
   Current search (`js/features/filters.js`) is plain substring `.includes()` with no ranking or match highlighting. Becomes more noticeable as the catalogue grows past 100 icons.

### Explicitly out of scope for this epic

- Anything that would bypass the SVG sanitizer for agent-supplied input (§13 is non-negotiable regardless of caller).
- A full accessibility-audit tooling addition (e.g. axe-core) — conflicts with the zero-devDependency-beyond-Vite convention; a from-scratch minimal checker was considered and deferred, not rejected outright.
- Bulk/ZIP export and toast-stacking caps — real UX gaps, noted, but unrelated to the AX layer; see `TASK.md` backlog if they get picked up.

---

## Explicitly decided against

- **Deeper Vite integration** (importing icon SVGs/registry as ES modules instead of runtime `fetch`) — considered and declined (2026-07-31). Would contradict the documented zero-runtime-dependency architecture (`SPEC.md` ADR-001) and the SSOT principle that the catalogue must be addressable by any static file server, not just a bundler. Current Vite setup (dev/build wrapper only) already satisfies the actual need.
