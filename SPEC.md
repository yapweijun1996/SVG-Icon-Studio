# Icon Studio SSOT SVG Modular Refactor Specification

**Document:** `SPEC.md`  
**Project:** Icon Studio — SVG Icon Collection Admin Panel  
**Code-MCP Project ID:** `project_f2a74b23-33c1-4c5c-b43d-e2b5b3108428`  
**Status:** Living specification — the SSOT refactor this document originally proposed shipped in `v0.2.0` (2026-07-23) and is now the permanent baseline architecture. Sections 1–3 and 16 are kept as the historical record of that refactor; everything else describes the **current, as-built system**.  
**Current release:** `v0.7.1` (2026-07-31) — see [CHANGELOG.md](CHANGELOG.md) for the full version history and [ROADMAP.md](ROADMAP.md) / [TASK.md](TASK.md) for what's planned next.  
**Runtime:** Dependency-free static HTML, CSS and browser-native JavaScript (Vite is a dev-only wrapper — see ADR-001)  
**Primary goal (original, achieved):** Replace the monolithic icon and application architecture with a scalable Single Source of Truth (SSOT) structure while preserving existing behaviour and visual output.

---

## 0. Current status snapshot (v0.7.1, 2026-07-31)

A quick-reference dashboard so this document doesn't have to be read end-to-end just to answer "what does the app actually do right now." Everything here is derived from the current codebase, not from plan.

| Fact | Value |
| --- | --- |
| Total icons | 100 (see `data/icon-registry.json`) |
| Categories | 10 — Interface, Arrows, Actions, Files, Users, Commerce, Finance, Logistics, AI, ERP |
| Icon styles | `outline` (91) and `filled` (9) — see §7.3/§7.4 |
| Runtime dependencies | 0 (unchanged since inception) |
| Dev tooling | Vite (`npm run dev` / `npm run build` / `npm run preview`); `npm run serve` still works with zero `node_modules` |
| Security | SVG allowlist sanitizer (§13) + Content-Security-Policy meta tag (added v0.4.0) |
| PWA | Manifest + service worker (added alongside the 0.2.x/0.3.x line, see CHANGELOG) |
| CI/CD | `.github/workflows/deploy.yml` — `npm ci && npm test && npm run build` → GitHub Pages on every push to `main` |
| Test suite | `npm test` — 8 checks incl. full registry/icon validation (see §19) |
| Known accepted deviation | `package-lock.json`'s `version` field intentionally left behind `package.json`'s — see ADR-013 |
| Not yet built | Agent Experience (AX) layer — WebMCP tools, programmatic JS API, URL deep links — tracked in `ROADMAP.md` |

---

## 1. Purpose

Icon Studio currently stores catalogue metadata and SVG geometry together inside `icon-library.js`, while most application behaviour is concentrated in `script.js` and most styling is concentrated in `styles.css`.

*(§1–§3 below describe the problem and goals as they stood before the `v0.2.0` refactor. They are kept verbatim as the historical rationale for the architecture in §5 onward, which is current.)*

This works for the current MVP, but it creates maintenance and scaling risks:

- Replacing one icon requires editing a large JavaScript file.
- A missing comma or malformed object can break the whole catalogue.
- SVG geometry cannot be reviewed, versioned or reused independently.
- Large JavaScript and CSS files mix unrelated responsibilities.
- User-uploaded SVG data can grow beyond a practical `localStorage` limit.
- Future package export, sprite generation, PWA caching and collection management become harder to implement safely.

This refactor establishes a strict SSOT architecture:

> **One catalogue icon ID maps to exactly one SVG file. SVG geometry never lives in JavaScript or JSON. Metadata never duplicates SVG geometry.**

---

## 2. Goals

The implementation MUST:

1. Extract every built-in catalogue icon into one independent SVG file.
2. Keep one authoritative metadata registry with no embedded SVG body.
3. Load catalogue assets through a dedicated repository/service layer.
4. Split the monolithic JavaScript into browser-native ES modules.
5. Split the monolithic CSS into responsibility-based files.
6. Preserve all current Icon Studio functionality and responsive behaviour.
7. Preserve the current Purchase Order and Delivery Order artwork exactly in visual meaning and appearance.
8. Validate every icon and registry entry before release.
9. Fail safely when one icon is missing or invalid without breaking the entire application.
10. Remain dependency-free at runtime, with no framework and no CDN requirement.
11. Provide clear extension points for future sprite, ZIP, collection and PWA features.

---

## 3. Non-goals

This refactor MUST NOT become a visual redesign.

The following are outside this release unless required to preserve existing behaviour:

- Replacing the current admin-panel layout.
- Changing branding, colour palette or typography.
- Introducing React, Vue, Svelte, Angular or another runtime framework.
- Adding a server-side database.
- Adding account authentication or cloud synchronisation.
- Implementing full collection CRUD.
- Implementing final SVG sprite and ZIP package export.
- Converting the project into a required Node/Vite runtime.
- Changing icon artwork except where normalization is required for valid `24 × 24` rendering.

The architecture MUST support these future features without requiring another catalogue rewrite.

---

## 4. Baseline

### 4.1 Pre-refactor baseline (historical, superseded by v0.2.0)

The application state this refactor was originally written against:

- 39 searchable SVG icons.
- Category and keyword filtering.
- Grid and Compact density modes.
- Favorites and Recently Viewed.
- Browser-side SVG upload.
- Local persistence.
- Sticky responsive sidebar and inspector.
- Light, Dark, Brand and Transparent previews.
- Size, stroke, fill, rotation and flip controls.
- SVG, JSX and CSS output.
- Full preview and copy actions.
- Desktop, tablet and mobile layouts.

Known maintainability concerns at the time included:

- `icon-library.js` contains catalogue metadata and geometry.
- `script.js` is a large mixed-responsibility module.
- `styles.css` is a large mixed-responsibility stylesheet.
- Repeated CSS values indicate incomplete tokenization.
- Current review notes identify remaining desktop tap-target warnings.
- Catalogue object syntax errors can prevent every icon from loading.

All of the above was resolved by the `v0.2.0` migration (§16) and no longer reflects the codebase.

### 4.2 Current baseline (v0.7.1)

Everything in §4.1 plus, added across `v0.3.0`–`v0.7.1` (full detail in [CHANGELOG.md](CHANGELOG.md)):

- Catalogue grown from 39 → 100 icons, with a 10th category (`ERP`, 36 icons) added specifically for ERP/back-office use cases.
- A second icon style, `filled` (§7.4), authored via a dedicated generator script (`tools/gen-filled-icons.mjs`, ADR-010) rather than by hand, because the style's "strokes" are actually filled shapes with matched inner/outer contours.
- Vite as an optional dev-server/bundler (`npm run dev`, `npm run build`, `npm run preview`) — the runtime itself is still zero-dependency (ADR-001).
- A Content-Security-Policy `<meta>` tag as defence in depth behind the sanitizer (ADR-009).
- A PWA manifest and service worker (prod-only registration, to avoid fighting Vite HMR in dev).
- GitHub Actions CI/CD (`.github/workflows/deploy.yml`): install → test → build → publish to GitHub Pages on every push to `main`.
- Catalogue-grid colouring unified across both icon styles (ADR-011) after `filled` growing from 3 → 9 icons made a per-style accent-colour override visually inconsistent.
- Scroll-to-load auto-pagination on top of the original manual "Load more" button (ADR-012).
- The `js/services/svg-policy.js` allow-list module, shared byte-for-byte between the browser sanitizer and the Node build-time checker (§9.3, extracted in `v0.2.2` after the two had already drifted once).

The refactor MUST preserve the feature baseline in both subsections; nothing described here has been removed since.

---

## 5. SSOT principles

### 5.1 Geometry SSOT

For every built-in icon:

```text
icon id: purchase-order
canonical file: icons/catalog/purchase-order.svg
```

The SVG file is the only authoritative source of its geometry.

The following are prohibited after migration:

- SVG `<path>` data inside JavaScript catalogue records.
- SVG body strings inside JSON registry entries.
- Duplicate copies of the same catalogue SVG in another source module.
- Reconstructed catalogue geometry inside renderer or exporter modules.
- Keeping `icon-library.js` as a production geometry fallback.

### 5.2 Metadata SSOT

All built-in icon metadata MUST live in:

```text
data/icon-registry.json
```

The metadata registry MUST NOT contain SVG markup.

### 5.3 Convention over duplicated paths

The SVG path MUST be derived from the icon ID:

```text
icons/catalog/<icon-id>.svg
```

The normal registry record SHOULD NOT repeat an asset path. This prevents the registry ID and file path from drifting apart.

### 5.4 Runtime transformations are not source mutations

Inspector settings such as colour, size, stroke width, rotation and flip are runtime/export transformations only.

They MUST NOT rewrite or modify the canonical SVG file.

---

## 6. Current project structure

This is the actual tracked file tree at `v0.7.1` (`git ls-files`), not an aspirational target. `js/ui/utility-icons.js` and `tools/migrate-icon-library.mjs`, planned in the original migration, were never needed in practice — shell/interface glyphs stayed inline in `index.html` (§9.7), and the one-time extraction script was run locally and not committed.

```text
SVG-Icon-Studio/
├── index.html
├── README.md
├── CHANGELOG.md
├── SPEC.md
├── DESIGN.md
├── EPIC.md
├── ROADMAP.md
├── TASK.md
├── components.md          # historical pre-implementation design brief, see DESIGN.md
├── design-system.json      # machine-readable token snapshot, synced from css/tokens.css
├── LICENSE
├── vite.config.js
├── package.json / package-lock.json
│
├── data/
│   └── icon-registry.json          # 100 icons, 10 categories, geometry-free
│
├── icons/catalog/
│   └── <icon-id>.svg                # one file per built-in icon, 100 total
│
├── js/
│   ├── app.js                       # entry point, wires every controller together
│   ├── core/
│   │   ├── dom.js                   # $, $$, createElement, createSvgElement, slugify
│   │   ├── state.js                 # createState, DEFAULT_APPEARANCE, pruneStoredIds
│   │   └── storage.js               # localStorage helpers + IndexedDB upload store
│   ├── services/
│   │   ├── icon-repository.js       # registry loading, same-origin asset fetch, caching
│   │   ├── svg-policy.js            # SHARED allow-list (also imported by tools/svg-policy.mjs)
│   │   ├── svg-sanitizer.js         # DOMParser-based sanitizer, browser-only
│   │   ├── svg-renderer.js          # appearance/transform application, fallback icon
│   │   └── svg-exporter.js          # SVG/JSX/CSS code generation
│   ├── features/
│   │   ├── catalogue.js             # grid, cards, lazy previews, scroll-to-load
│   │   ├── filters.js               # pure filter/sort logic
│   │   ├── inspector.js             # preview, appearance controls, code tabs
│   │   ├── importer.js              # validated browser upload
│   │   ├── shell.js                 # sidebar/inspector drawers, overlays, responsive state
│   │   └── theme.js                 # light/dark persistence
│   └── ui/
│       └── toast.js                 # toast notifications + clipboard copy helper
│
├── css/
│   ├── tokens.css   ├── base.css     ├── layout.css   ├── shell.css
│   ├── catalogue.css├── inspector.css├── dialogs.css  ├── utilities.css
│   └── responsive.css
│
├── public/
│   ├── manifest.webmanifest
│   ├── sw.js                         # service worker, prod-only registration
│   └── icons-pwa/*.png
│
├── tools/                            # Node-only, never shipped to the browser
│   ├── validate-icons.mjs            # build-time registry + SVG contract validator
│   ├── verify-registry.mjs           # registry stats/report (categories, styles, aliases)
│   ├── svg-policy.mjs                # regex-based Node port of js/services/svg-policy.js
│   ├── convert-svg.mjs               # normalizes an arbitrary SVG into the SSOT contract
│   ├── gen-filled-icons.mjs          # authoring-time generator for the `filled` glyph style
│   ├── finalize-ssot.mjs             # one-time legacy-file cleanup used during v0.2.0
│   └── serve.mjs                     # zero-dependency static server (no node_modules needed)
│
├── tests/
│   ├── icon-registry.test.mjs  ├── svg-sanitizer.test.mjs ├── svg-policy.test.mjs
│   ├── filters.test.mjs        ├── state.test.mjs         ├── dom.test.mjs
│   ├── convert-svg.test.mjs    └── browser-test-plan.md   # manual QA checklist
│
├── review/                            # point-in-time audit snapshots, not living docs
│   ├── code-review(-final).{md,json}, security-scan.{md,json}
│   ├── ssot-migration-report.md, delivery-order-svg-quality.md, invoice-svg-quality.md
│
├── releases/0.2.1.json
├── visual-validation.json
└── .github/workflows/deploy.yml       # CI: install → test → build → deploy to Pages
```

The exact number of modules MAY be adjusted, but responsibilities MUST remain separated.

---

## 7. SVG file contract

Every catalogue file MUST satisfy the following contract.

### 7.1 Required root

```svg
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 24 24"
     aria-hidden="true">
  ...
</svg>
```

### 7.2 Required rules

Each source SVG MUST:

- Use the exact `viewBox="0 0 24 24"`.
- Omit fixed `width` and `height`.
- Use `currentColor` for user-controllable colour.
- Contain no script or executable content.
- Contain no external network reference.
- Contain no event handler attributes.
- Contain no embedded raster image.
- Contain no browser-specific editor metadata.
- Remain visually readable at `16px`, `20px`, `24px`, `32px` and `48px`.
- Be valid XML/SVG.
- Use a kebab-case filename matching the registry ID.

### 7.3 Outline icon contract

An Outline icon SHOULD use:

```svg
<svg ... fill="none" stroke="currentColor"
     stroke-width="1.5"
     stroke-linecap="round"
     stroke-linejoin="round">
```

The icon MAY use another documented default stroke width when optically required, but the metadata and inspector MUST treat it consistently.

### 7.4 Filled icon contract

A Filled icon SHOULD use:

```svg
<svg ... fill="currentColor" stroke="none">
```

A filled icon MAY use `fill-rule="evenodd"` and `clip-rule="evenodd"` when required.

**Authoring guidance (added after `v0.6.0`):** in this style every visual "stroke" is actually a filled shape with a matched inner and outer contour at a constant weight (`0.73` units, as measured off the original `purchase-order.svg`: its document wall is `6.75 − 6.023` and its text rule is `11.742 − 11.016`). Hand-computing these coordinate pairs is not reliably correct, so new filled icons SHOULD be produced with `tools/gen-filled-icons.mjs` (ADR-010) rather than authored by hand. Two failure modes to avoid, both discovered the hard way while building the current 9 filled icons:

- A badge/knockout MUST be a solid shape with the glyph cut out of it by `fill-rule="evenodd"` (as `purchase-order.svg`'s tick does), never two nested outline circles forming a ring — nesting makes the fill alternate against the glyph and renders as a blob.
- A single `evenodd` path cannot mask one shape *behind* another; overlapping regions cancel instead of one occluding the other. A badge and a document shape must not overlap in source geometry — layout the document to stop short of the badge, not underneath it.

### 7.5 Allowed elements

The sanitizer and validation tools MAY allow:

- `svg`
- `g`
- `path`
- `circle`
- `ellipse`
- `rect`
- `line`
- `polyline`
- `polygon`
- `title`
- `desc`
- `defs`
- `clipPath`
- `mask`

Any additional element requires an explicit specification update.

### 7.6 Forbidden elements and features

The following MUST be rejected:

- `script`
- `foreignObject`
- `iframe`
- `object`
- `embed`
- `image`
- `audio`
- `video`
- animation elements
- external `href` or `xlink:href`
- `url(...)` references to external resources
- attributes beginning with `on`
- embedded CSS that can reference external resources
- data URLs
- JavaScript URLs

---

## 8. Metadata registry contract

`data/icon-registry.json` is the authoritative metadata source.

### 8.1 Registry structure

```json
{
  "schemaVersion": 1,
  "categories": [
    {
      "id": "ERP",
      "label": "ERP",
      "order": 100
    }
  ],
  "icons": [
    {
      "id": "purchase-order",
      "name": "Purchase Order",
      "category": "ERP",
      "style": "filled",
      "tags": [
        "vendor",
        "procurement",
        "approval"
      ],
      "aliases": [
        "po"
      ],
      "status": "active",
      "featured": true,
      "sortOrder": 210
    }
  ]
}
```

### 8.2 Required icon fields

Each icon entry MUST contain:

- `id`
- `name`
- `category`
- `style`
- `tags`
- `aliases`
- `status`
- `featured`
- `sortOrder`

### 8.3 Registry rules

- `id` MUST be unique.
- `id` MUST use lowercase kebab-case.
- `id` MUST match the SVG filename.
- `name` MUST be human-readable.
- `category` MUST reference a declared category.
- `style` MUST be `outline`, `filled` or an explicitly supported future style.
- `tags` and `aliases` MUST be arrays of normalized strings.
- `status` MUST be `active`, `deprecated` or `hidden`.
- No entry may contain `body`, `svg`, `markup`, `pathData` or equivalent geometry.
- Every active icon MUST have one matching SVG file.
- Every SVG in `icons/catalog/` MUST have one matching registry entry.
- Orphan files and orphan registry records MUST fail validation.

---

## 9. JavaScript module responsibilities

### 9.1 `js/app.js`

`app.js` is the only application entry point.

It MUST:

1. Load the registry.
2. Initialize application state.
3. Initialize the shell, catalogue, filters, inspector, importer and theme modules.
4. Handle top-level startup errors.
5. Avoid containing catalogue geometry or large feature implementations.

`index.html` MUST load it as:

```html
<script type="module" src="js/app.js"></script>
```

The legacy scripts:

```html
<script src="icon-library.js"></script>
<script src="script.js"></script>
```

MUST be removed after the migration passes all quality gates.

### 9.2 `js/services/icon-repository.js`

The repository is the only module allowed to resolve and load built-in catalogue assets.

It MUST provide equivalent operations to:

```js
loadRegistry()
getAllIconMetadata()
getIconMetadata(id)
loadIconAsset(id)
preloadIconAssets(ids)
clearAssetCache()
```

It MUST:

- Derive asset paths from IDs.
- Use same-origin requests only.
- Deduplicate concurrent requests with a `Map<string, Promise>`.
- Cache successfully validated SVG assets in memory.
- Reject invalid SVG assets.
- Return a per-icon failure result instead of crashing the whole application.
- Support bounded preloading with a maximum default concurrency of 8.

### 9.3 `js/services/svg-sanitizer.js` and `js/services/svg-policy.js`

The allow-list itself (allowed/forbidden elements and attributes, event/href/external-reference checks, required viewBox and size limit) lives in `js/services/svg-policy.js`, a plain-data module with no DOM dependency. `svg-sanitizer.js` imports it to do the actual browser-side parsing; `tools/svg-policy.mjs` imports the **same file** to re-implement an equivalent regex-based check for the Node build-time validator (§18.1), so the two can never drift apart again the way they did before `v0.2.2` (a `clip-path-units` vs. `clippathunits` naming bug shipped in one but not the other until the allow-list was unified).

The sanitizer MUST:

- Parse SVG with `DOMParser`.
- Confirm that the root is `<svg>`.
- Enforce the exact viewBox.
- Enforce allowed tags and attributes (via `svg-policy.js`).
- Remove or reject forbidden content.
- Return a safe DOM node or a structured error.
- Never trust uploaded or fetched SVG text only because it is same-origin.

### 9.4 `js/services/svg-renderer.js`

The renderer MUST:

- Render safe DOM nodes without unsafe raw `innerHTML`.
- Apply preview size and colour without mutating the canonical source.
- Apply rotation and flip through a wrapping `<g>` or CSS transform.
- Generate decorative and semantic accessibility modes.
- Provide a consistent fallback placeholder when an icon fails to load.

### 9.5 `js/services/svg-exporter.js`

The exporter MUST:

- Read canonical markup through the repository.
- Generate SVG, JSX and CSS output.
- Apply current inspector settings only to generated output.
- Add an accessible `<title>` when requested.
- Use deterministic formatting.
- Never write generated output back to the canonical asset.

### 9.6 Feature modules

Each feature module MUST own only its related state bindings and user interactions:

- `catalogue.js`: card rendering, selection, visible limit and density.
- `filters.js`: query, category, style and sort filtering.
- `inspector.js`: controls, preview, code tabs and selected icon details.
- `importer.js`: upload validation and user-uploaded asset persistence.
- `shell.js`: sidebar, inspector drawer, overlays and responsive shell state.
- `theme.js`: light/dark state and theme persistence.

A feature module MUST NOT directly fetch catalogue SVG files. It MUST use `icon-repository.js`.

### 9.7 Utility icons

Shell and interface utility icons (nav glyphs, buttons, chrome) live inline as `<svg>` markup directly in `index.html`. A separate `js/ui/utility-icons.js` module was planned during the original migration but was never needed in practice and does not exist — inline markup has been sufficient.

They MUST remain clearly separated from selectable catalogue icons (i.e. never added to `data/icon-registry.json` or `icons/catalog/`).

---

## 10. Catalogue loading strategy

### 10.1 Startup

At startup, the application MUST:

1. Fetch and validate `data/icon-registry.json`.
2. Render catalogue metadata and placeholder preview areas.
3. Load only visible or near-visible icon assets.
4. Load the selected inspector icon immediately.
5. Cache loaded assets.

Search and filtering MUST operate on metadata and MUST NOT require all SVG files to be loaded first.

### 10.2 Lazy loading

Card assets SHOULD be loaded through `IntersectionObserver`.

The application SHOULD:

- Load visible and near-visible card assets.
- Avoid fetching every SVG for large catalogues at startup.
- Cancel or ignore stale UI updates after filter changes.
- Reuse cached promises and validated assets.

### 10.3 Failure handling

If one icon file fails:

- The card MUST show a fallback icon.
- The icon name and metadata MUST remain visible.
- The inspector MUST show a clear asset error if selected.
- The app MUST continue working.
- One warning SHOULD be logged for that icon ID.

If the registry fails:

- The catalogue MUST show a recoverable error state.
- A Retry action MUST be available.
- The application MUST not silently display an empty library.

---

## 11. State and persistence

### 11.1 Local storage

`localStorage` SHOULD contain only small settings and ID lists:

- theme
- density
- favorites
- recently viewed IDs
- sidebar state
- inspector state
- inspector appearance preferences

SVG geometry MUST NOT be stored in `localStorage` for built-in icons.

### 11.2 User-uploaded icons

A static web application cannot write uploaded files into the deployed repository.

Therefore uploaded icons MUST be treated as a separate local library.

For scalable persistence:

- Uploaded SVGs SHOULD be stored in IndexedDB.
- Each uploaded icon MUST have one metadata record and one sanitized SVG asset record.
- Favorites and recent records MUST reference uploaded IDs, not duplicate geometry.
- Existing uploaded SVG data in `localStorage` SHOULD be migrated once into IndexedDB.
- The legacy localStorage payload SHOULD be removed only after successful migration.

### 11.3 Stale IDs

When the registry loads, favorites and recent lists MUST remove IDs that no longer exist, unless they refer to valid uploaded icons.

---

## 12. CSS modularization

The current stylesheet MUST be divided by responsibility.

### 12.1 Required CSS layers

- `tokens.css`: colour, spacing, typography, radius, shadow and z-index tokens.
- `base.css`: reset, body, typography and shared element defaults.
- `layout.css`: application grid and page-level layout.
- `shell.css`: sidebar, topbar and overlays.
- `catalogue.css`: search, filters, icon grid and cards.
- `inspector.css`: preview, controls, code panel and inspector drawer.
- `dialogs.css`: modal and full-preview dialog.
- `utilities.css`: reusable helpers and accessibility utilities.
- `responsive.css`: breakpoint-specific overrides.

### 12.2 CSS rules

The refactor MUST:

- Replace repeated literal values with CSS custom properties where practical.
- Preserve existing class names unless a rename is required for correctness.
- Avoid increasing selector specificity.
- Reduce or remove existing `!important` declarations.
- Keep responsive behaviour equivalent to the published baseline.
- Keep mobile and tablet free from horizontal overflow.
- Preserve theme variables and the orange accent system.

The stylesheet loading order MUST be explicit in `index.html`.

---

## 13. Security requirements

The final implementation MUST:

- Use no untrusted raw `innerHTML` path for SVG rendering.
- Parse and sanitize every fetched or uploaded SVG.
- Use an allowlist, not only a denylist.
- Reject external resources and executable content.
- Use same-origin catalogue requests.
- Avoid `eval`, `new Function` and runtime script generation.
- Avoid storing sensitive data.
- Keep clipboard actions user-initiated.
- Treat metadata text as untrusted and render it with text nodes.
- Keep runtime dependencies at zero.
- **(Added `v0.4.0`, ADR-009)** Ship a Content-Security-Policy `<meta>` tag in `index.html` as defence in depth *behind* the sanitizer — the sanitizer remains the primary control; the CSP exists in case a future bug in it is ever found. Current policy: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; manifest-src 'self'; worker-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'`. `style-src` needs `'unsafe-inline'` because `svg-renderer.js`/`inspector.js` assign `element.style.color` directly; `script-src` needs no exception since the production build emits no inline script.
- Any new tool-call surface exposed to external callers (browser extensions, AI agents, WebMCP tools — see `ROADMAP.md`) MUST reuse the existing sanitizer/policy pipeline; it MUST NOT introduce a second, less-audited path for untrusted SVG or file input.

A security failure in one uploaded or catalogue SVG MUST not compromise other icons or the application shell.

---

## 14. Accessibility requirements

The refactor MUST preserve or improve accessibility.

- Catalogue cards remain keyboard reachable.
- Selected state remains programmatically exposed.
- Functional icon buttons retain accessible labels.
- Decorative icon previews use `aria-hidden="true"`.
- Exported semantic icons MAY include `<title>` and `aria-labelledby`.
- Inspector controls retain explicit labels.
- Dialog focus and Escape behaviour remain correct.
- Focus indicators remain visible.
- Mobile controls MUST remain usable without horizontal overflow.
- No new accessibility violations may be introduced.

Existing desktop tap-target warnings SHOULD be resolved during the modular CSS pass. Any remaining warning MUST be documented with a reason.

---

## 15. Performance requirements

The architecture MUST remain responsive with the current 100 icons and be suitable for at least 1,000 metadata entries.

Targets:

- Registry metadata loads before catalogue interaction is enabled.
- Search/filter operations run against metadata only.
- Initial icon asset requests are limited to visible and near-visible cards.
- Concurrent SVG fetches default to no more than 8.
- Repeated requests for the same icon use one cached promise.
- One malformed icon does not block the rest.
- No catalogue geometry is duplicated in JavaScript bundles.
- The application remains usable on a 390px mobile viewport.

Per-icon guidelines:

- Recommended source SVG size: under 16 KB.
- Warning threshold: over 32 KB.
- Default hard failure threshold: over 64 KB, unless explicitly approved.

---

## 16. Migration plan (historical — completed at `v0.2.0`, 2026-07-23)

**All 8 phases below shipped and are kept only as the historical record of how the SSOT refactor was executed.** `tools/finalize-ssot.mjs` (Phase 7's cleanup step) is still in the repo and still runnable, but it is not part of any current build or test script — it was a one-time migration tool. For what's currently in progress or planned, see `TASK.md` and `ROADMAP.md` instead of this section.

### Phase 0 — Recovery point and baseline

Before modifying production files:

1. Create a verified project backup.
2. Record the current icon count and IDs.
3. Capture desktop, tablet and mobile screenshots.
4. Run the current interaction flow.
5. Record localStorage keys and current default state.

### Phase 1 — Extract canonical SVG assets

For every entry in `icon-library.js`:

1. Create `icons/catalog/<id>.svg`.
2. Wrap existing geometry in a valid `24 × 24` SVG root.
3. Preserve current visual output.
4. Normalize `currentColor`, fill and stroke behaviour.
5. Validate the file.
6. Confirm Purchase Order and Delivery Order match their current approved artwork.

No icon may be removed during extraction.

### Phase 2 — Create the metadata registry

1. Create `data/icon-registry.json`.
2. Move name, category, style, tags and aliases into the registry.
3. Add category ordering.
4. Verify unique IDs.
5. Verify one-to-one registry/file mapping.

### Phase 3 — Implement repository and sanitizer

1. Add `icon-repository.js`.
2. Add `svg-sanitizer.js`.
3. Add caching and bounded loading.
4. Add per-icon failure fallback.
5. Add tests for invalid SVG content.

### Phase 4 — Convert to ES modules

1. Create `js/app.js`.
2. Extract core, services, features and UI modules.
3. Replace global `window.ICON_LIBRARY`.
4. Change `index.html` to `type="module"`.
5. Preserve all current user flows.

### Phase 5 — Modularize CSS

1. Move design tokens first.
2. Split component styles without visual changes.
3. Reduce duplicated values.
4. Remove avoidable `!important`.
5. Verify desktop, tablet and mobile screenshots.

### Phase 6 — Migrate uploaded icon persistence

1. Add IndexedDB storage for uploaded icons.
2. Read legacy localStorage uploaded records.
3. Sanitize and migrate each valid record.
4. Keep a migration version flag.
5. Remove legacy data only after success.

### Phase 7 — Remove legacy production sources

After all quality gates pass:

- Remove `icon-library.js` from `index.html`.
- Remove catalogue geometry from `script.js`.
- Remove the old `script.js` entry point.
- Remove the old `styles.css` entry point when all CSS modules are linked.
- Keep a backup and Git history; do not keep duplicate production geometry.

### Phase 8 — Documentation and release

1. Update `README.md`.
2. Update `CHANGELOG.md`.
3. Document how to add, replace and validate an icon.
4. Record release `v0.2.0`.
5. Publish only after validation and browser QA pass.

---

## 17. Developer workflow

### 17.1 Add a new built-in icon

1. Choose a unique kebab-case ID.
2. Create `icons/catalog/<id>.svg`.
3. Normalize it to the SVG contract.
4. Add one metadata entry to `data/icon-registry.json`.
5. Run icon validation.
6. Open the app and test search, category, card and inspector.
7. Commit the SVG and registry change together.

### 17.2 Replace an icon

1. Replace only `icons/catalog/<id>.svg`.
2. Update metadata only when name, category, style, tags or aliases change.
3. Do not edit a JavaScript geometry registry.
4. Run visual checks at all standard sizes.
5. Run the exact icon search/selection interaction test.

### 17.3 Remove or deprecate an icon

Prefer:

```json
"status": "deprecated"
```

before deleting an icon.

Permanent deletion requires:

- Registry removal.
- SVG file removal.
- Favorites/recent stale-ID handling.
- Changelog entry.
- Regression testing.

---

## 18. Validation tooling

### 18.1 `tools/validate-icons.mjs`

The validator MUST check:

- Registry parses successfully.
- Registry schema version is supported.
- IDs are unique and kebab-case.
- Category references are valid.
- Each active ID has one SVG file.
- Each SVG file has one registry entry.
- The root is `<svg>`.
- The viewBox is exactly `0 0 24 24`.
- Fixed width/height are absent.
- Forbidden elements and attributes are absent.
- Colour behaviour matches style.
- File-size thresholds are enforced.
- XML parses without error.
- No external reference exists.

The command MUST return a non-zero exit code on failure.

### 18.2 `tools/verify-registry.mjs`

This tool SHOULD report:

- Total icon count.
- Count by category.
- Count by style.
- Orphan metadata.
- Orphan files.
- Duplicate aliases.
- Duplicate or near-duplicate metadata IDs.
- Deprecated and hidden icons.

### 18.3 One-time migration tools (historical)

The original one-time extraction script (planned as `tools/migrate-icon-library.mjs`) was run locally during the `v0.2.0` migration and was never committed — there was nothing left to keep once the extraction was done. `tools/finalize-ssot.mjs`, which *is* committed, performed the equivalent one-time legacy-file cleanup (Phase 7, §16) and remains in the repo as a runnable record of that step.

Any future one-time migration script MUST NOT be loaded in the browser and MUST NOT remain a production data source.

### 18.4 `tools/gen-filled-icons.mjs` (added `v0.6.0`)

Authoring-time generator for the `filled` glyph style (§7.4, ADR-010). Not part of the app or the build — it only emits static SVG that gets committed to `icons/catalog/`. Covered by `npm run typecheck` (Node syntax check only, since it's Node-only tooling) but has no dedicated test file.

### 18.5 `tools/convert-svg.mjs`

Normalizes an arbitrary, non-conformant SVG (different viewBox, hardcoded colours, `class`/`style`/`id` cruft, fixed dimensions) into the SSOT contract: rescales/centres into an exact `0 0 24 24` viewBox via one wrapping `<g transform="...">`, strips anything outside the allow-list, replaces a single hardcoded fill with `currentColor`, and validates the result against the same policy the app enforces. Supports an optional `--pixelate[=gridSize]` mode for rasterizing traced/complex source art onto a small grid of rectangles when a plain rescale would be illegible at icon scale. Covered by `tests/convert-svg.test.mjs`.

---

## 19. Test requirements

### 19.1 Static and integrity tests

The release MUST pass:

- Project static validation.
- Registry schema validation.
- SVG validation for every file.
- Security scan.
- No missing project asset.
- No duplicate catalogue geometry source.
- No JavaScript syntax error.
- No broken module import.

### 19.2 Required browser flows

Test on desktop, tablet and mobile where applicable:

1. App starts and catalogue renders.
2. Default selected icon renders in the inspector.
3. Search by exact name works.
4. Search by alias works.
5. Category filtering works.
6. Style filtering works.
7. Grid/Compact mode works.
8. Favorite add/remove persists.
9. Recently Viewed updates.
10. Purchase Order renders.
11. Delivery Order renders.
12. Size and colour preview updates.
13. Rotation and flip update preview.
14. SVG, JSX and CSS output generates.
15. Copy actions work.
16. Full preview opens and closes.
17. Theme persists.
18. Sidebar and inspector responsive behaviour works.
19. Valid upload succeeds.
20. Invalid or unsafe upload is rejected.
21. Missing single icon shows a fallback without breaking the app.
22. No horizontal overflow occurs at supported viewports.

### 19.3 Regression evidence

The implementation MUST capture:

- Desktop screenshot.
- Tablet screenshot.
- Mobile screenshot.
- Search and selection interaction report.
- Purchase Order interaction report.
- Delivery Order interaction report.
- Console and page error report.

---

## 20. Acceptance criteria

The SSOT refactor was accepted at `v0.2.0` — every item below is satisfied and has stayed satisfied through `v0.7.1` (re-verified as part of the `v0.7.1` documentation pass). This checklist is kept as a regression contract: any future change that would un-check one of these needs a deliberate ADR, not an accident.

### Catalogue SSOT

- [x] Every built-in icon is an independent file under `icons/catalog/` (100 files).
- [x] No built-in catalogue geometry exists in JavaScript or JSON.
- [x] Every icon ID maps to exactly one SVG file.
- [x] Every SVG file maps to exactly one metadata entry.
- [x] Purchase Order and Delivery Order use their approved current artwork.
- [x] `icon-library.js` is no longer loaded or required (removed at `v0.2.0`).

### Metadata

- [x] `data/icon-registry.json` is the only built-in metadata registry.
- [x] Registry schema and category references validate (`npm test`).
- [x] Search aliases and tags are preserved.
- [x] Icon count remains complete (100/100, `npm run validate`).

### JavaScript

- [x] The app loads through `js/app.js` as an ES module.
- [x] Catalogue loading is owned by `icon-repository.js`.
- [x] SVG validation is owned by `svg-sanitizer.js` (allow-list itself now shared via `svg-policy.js`, §9.3).
- [x] Rendering and export are separate modules.
- [x] No module mixes unrelated feature responsibilities.
- [x] No global `window.ICON_LIBRARY` remains.
- [x] One invalid icon cannot crash the catalogue.

### CSS

- [x] Styles are split into responsibility-based files (9 modules).
- [x] Repeated design values use tokens where practical.
- [x] Responsive behaviour matches or improves the baseline.
- [x] No new `!important` declarations were introduced by the refactor itself (3 remain from before it, down from 6 — see `review/code-review-final.md`, which predates the split and is kept as a historical snapshot).
- [x] Mobile and tablet have no horizontal overflow.

### Behaviour

- [x] Existing search, filters, density, favorites, recent, uploads and inspector features work.
- [x] SVG, JSX and CSS output remains correct.
- [x] Runtime customization does not mutate source files.
- [x] User settings persist.
- [x] Existing uploaded icons are migrated safely.

### Quality

- [x] All icon validation checks pass.
- [x] Static project validation passes.
- [x] Browser QA has no blocking errors.
- [x] Console errors are zero.
- [x] Page errors are zero.
- [x] Security checks have no unresolved high-severity issue.
- [x] README and CHANGELOG are updated.
- [x] A verified rollback point exists.

---

## 21. Rollback strategy

Before implementation, create a complete recovery point containing:

- `index.html`
- `icon-library.js`
- `script.js`
- `styles.css`
- current documentation
- current validation reports

If the modular version fails release validation:

1. Do not publish the failing version.
2. Restore the latest verified recovery point.
3. Confirm the existing published URL still works.
4. Record the failed phase and root cause.
5. Resume from the last passing migration phase.

The legacy geometry file may remain in a backup or Git history, but MUST NOT remain as an active production fallback after final acceptance.

---

## 22. Future extension points

After this refactor, the architecture should support without changing the SVG source model:

- SVG sprite generation.
- Download All and ZIP packages.
- React/Vue component generation.
- Collection CRUD.
- Brand token presets.
- PWA precache manifest generation (manifest + service worker already shipped; precaching strategy could still expand).
- Versioned icon releases.
- License and attribution metadata.
- Remote catalogue synchronisation.
- Automated optical consistency reports.
- Multiple variants per semantic icon.
- **Agent Experience (AX) layer** *(researched, not yet built — full detail in `ROADMAP.md`)*: a `window.IconStudio` programmatic JS API as the shared substrate; WebMCP tool registration (`document.modelContext.registerTool`, feature-detected, W3C proposal) so AI agents can call `search_icons`/`get_icon_svg`/`select_icon` directly instead of driving the DOM; read-only URL deep links (`?icon=&size=&stroke=`) for shareable/fetchable state; optionally `llms.txt`. Any of these MUST reuse the sanitizer pipeline per §13 and MUST NOT bypass it.

These features MUST consume the same canonical SVG files and metadata registry.

---

## 23. Architecture decisions

### ADR-001 — Browser-native modules

Use browser-native ES modules. Do not add a required runtime framework or build system.

> **Update (0.3.0):** Vite was added as an optional dev-server/bundler wrapper (`npm run dev`, `npm run build`) to get local hot-reload and a GitHub Pages deploy artifact. This does not amend the ADR: the shipped runtime still has zero third-party dependencies and zero required build step — `npm run serve` (`tools/serve.mjs`) still serves `index.html` and the ES module graph completely unbundled, exactly as before. `js/services/icon-repository.js` resolves its runtime asset URLs against `document.baseURI` rather than `import.meta.url` specifically so the same source works either way.

### ADR-002 — One file per icon

Every built-in selectable icon has one canonical SVG file.

### ADR-003 — Convention-based asset location

Derive the asset path from the icon ID. Do not duplicate paths in normal metadata entries.

### ADR-004 — Metadata separate from geometry

Metadata belongs in JSON. Geometry belongs in SVG. Neither duplicates the other.

### ADR-005 — Runtime remains dependency-free

Runtime code uses platform APIs only. Optional local validation scripts may use Node built-ins.

### ADR-006 — Safe partial failure

A broken icon fails locally and displays a fallback. It does not break the application.

### ADR-007 — Uploaded assets are a separate local library

Browser uploads use sanitized IndexedDB records and do not pretend to be repository files.

### ADR-008 — No source mutation from the inspector

Preview and export settings are derived output only.

### ADR-009 — CSP as defence in depth (added `v0.4.0`)

Ship a Content-Security-Policy `<meta>` tag alongside the existing SVG sanitizer. The sanitizer remains the primary control (it already rejects `script`, event handlers, `foreignObject`, external/`data:` references, etc. — see §13); the CSP exists purely as a second layer in case a future sanitizer bug is ever found, not because the sanitizer is considered insufficient today.

### ADR-010 — Filled-style icons are generated, not hand-authored (added `v0.6.0`)

The `filled` glyph style (§7.4) requires matched inner/outer contours at a constant stroke weight, which is not reliably correct to hand-compute. New filled icons MUST be produced with `tools/gen-filled-icons.mjs` rather than authored directly as raw path data.

### ADR-011 — Catalogue-grid colour is uniform across icon styles (added `v0.7.0`)

Earlier releases coloured `filled`-style icons with the brand accent colour in the catalogue grid while `outline` icons used the normal ink colour. This was sustainable at 3 filled icons but became visually inconsistent once the style grew to 9 (`v0.6.0`). The grid now uses the same colour for every icon regardless of style; per-style colour differentiation, if ever wanted again, MUST be a deliberate design decision recorded here, not a CSS rule left over from an earlier icon count.

### ADR-012 — Catalogue pagination auto-loads on scroll, manual button stays as fallback (added `v0.7.0`)

An `IntersectionObserver` on the existing "Load more" control extends the visible set automatically as it nears the viewport, calling the same `loadMore()` the button already used. The button itself is kept (not removed) as a manual/keyboard-accessible fallback.

### ADR-013 — `package-lock.json`'s version field is intentionally left behind `package.json`'s (added `v0.4.0`)

Regenerating `package-lock.json` on Windows (`npm install --package-lock-only`) has been observed to drop optional platform-specific peer dependency entries (e.g. `@emnapi/core`) that Linux CI (`npm ci` on `ubuntu-latest` in `.github/workflows/deploy.yml`) may need. The version-field mismatch between `package.json` and `package-lock.json` is a known, accepted deviation, not a bug to fix reflexively — regenerate the lockfile on Linux/CI if it ever needs to move forward.

---

## 24. Definition of Done

The original refactor was complete when (all satisfied, `v0.2.0`, 2026-07-23):

1. The final project structure follows this specification.
2. Every built-in icon is independently manageable.
3. The monolithic catalogue and application sources are removed from production.
4. All existing application features are preserved.
5. Static, security, SVG and browser quality gates pass.
6. Desktop, tablet and mobile evidence is recorded.
7. Documentation explains the new maintenance workflow.
8. The project is published as `v0.2.0` with a verified rollback point.

For the current release's definition of done and what's still open, see `TASK.md` and `ROADMAP.md` — this section is kept as the historical closure record for the SSOT refactor specifically.

---

## 25. Implementation instructions for future contributors (human or AI agent)

When implementing *new* work in this repo (not the historical §16 migration):

1. Read `SPEC.md` (this file, current architecture), `DESIGN.md` (visual/UX system), `TASK.md` (what's pending/blocked), `ROADMAP.md` (priority and sequencing), `README.md` and `CHANGELOG.md` before making changes.
2. Follow the existing module boundaries (§9) and CSS layering (§12) rather than introducing new ones.
3. Run `npm test`, `npm run typecheck` and `npm run build` before considering any change done — all three are fast and are the actual quality gate, not a formality.
4. Preserve all current icon IDs and user-facing behaviour unless a change is explicitly scoped to replace them.
5. Any new icon added to `icons/catalog/` MUST pass `npm run validate` and follow §7's contract (outline §7.3 or filled §7.4/ADR-010).
6. Update `CHANGELOG.md` (with a **Validation** subsection describing what was actually checked, not just what changed) and bump `package.json`'s version for any user-visible change — this has been the project's convention since `v0.3.0` and keeps `SPEC.md §0` accurate without a separate sync step.
7. Do not ask for confirmation on routine implementation decisions already covered by this specification; do ask before decisions that aren't (new architecture, a new external dependency, anything touching the security model in §13).
8. Leave unrelated enhancements for a separate task — see `TASK.md` for the backlog rather than scope-creeping the current change.
