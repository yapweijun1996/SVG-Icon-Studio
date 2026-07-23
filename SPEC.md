# Icon Studio SSOT SVG Modular Refactor Specification

**Document:** `SPEC.md`  
**Project:** Icon Studio — SVG Icon Collection Admin Panel  
**Code-MCP Project ID:** `project_f2a74b23-33c1-4c5c-b43d-e2b5b3108428`  
**Status:** Approved implementation specification  
**Target release:** `v0.2.0`  
**Runtime:** Dependency-free static HTML, CSS and browser-native JavaScript  
**Primary goal:** Replace the monolithic icon and application architecture with a scalable Single Source of Truth (SSOT) structure while preserving existing behaviour and visual output.

---

## 1. Purpose

Icon Studio currently stores catalogue metadata and SVG geometry together inside `icon-library.js`, while most application behaviour is concentrated in `script.js` and most styling is concentrated in `styles.css`.

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

## 4. Current baseline

The current published application includes:

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

Known maintainability concerns include:

- `icon-library.js` contains catalogue metadata and geometry.
- `script.js` is a large mixed-responsibility module.
- `styles.css` is a large mixed-responsibility stylesheet.
- Repeated CSS values indicate incomplete tokenization.
- Current review notes identify remaining desktop tap-target warnings.
- Catalogue object syntax errors can prevent every icon from loading.

The refactor MUST preserve the current feature baseline.

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

## 6. Target project structure

```text
icon-studio/
├── index.html
├── README.md
├── CHANGELOG.md
├── SPEC.md
├── design-system.json
│
├── data/
│   └── icon-registry.json
│
├── icons/
│   └── catalog/
│       ├── invoice.svg
│       ├── customer.svg
│       ├── delivery-truck.svg
│       ├── purchase-order.svg
│       ├── delivery-order.svg
│       └── <icon-id>.svg
│
├── js/
│   ├── app.js
│   │
│   ├── core/
│   │   ├── dom.js
│   │   ├── state.js
│   │   └── storage.js
│   │
│   ├── services/
│   │   ├── icon-repository.js
│   │   ├── svg-sanitizer.js
│   │   ├── svg-renderer.js
│   │   └── svg-exporter.js
│   │
│   ├── features/
│   │   ├── catalogue.js
│   │   ├── filters.js
│   │   ├── inspector.js
│   │   ├── importer.js
│   │   ├── shell.js
│   │   └── theme.js
│   │
│   └── ui/
│       ├── toast.js
│       └── utility-icons.js
│
├── css/
│   ├── tokens.css
│   ├── base.css
│   ├── layout.css
│   ├── shell.css
│   ├── catalogue.css
│   ├── inspector.css
│   ├── dialogs.css
│   ├── utilities.css
│   └── responsive.css
│
├── tools/
│   ├── validate-icons.mjs
│   ├── verify-registry.mjs
│   └── migrate-icon-library.mjs
│
├── tests/
│   ├── icon-registry.test.mjs
│   ├── svg-sanitizer.test.mjs
│   └── browser-test-plan.md
│
└── review/
    └── ...
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

### 9.3 `js/services/svg-sanitizer.js`

The sanitizer MUST:

- Parse SVG with `DOMParser`.
- Confirm that the root is `<svg>`.
- Enforce the exact viewBox.
- Enforce allowed tags and attributes.
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

Shell and interface utility icons MAY remain inline or inside `js/ui/utility-icons.js`.

They MUST remain clearly separated from selectable catalogue icons.

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

The architecture MUST remain responsive with the current 39 icons and be suitable for at least 1,000 metadata entries.

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

## 16. Migration plan

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

### 18.3 Optional migration tool

`tools/migrate-icon-library.mjs` MAY be used for the one-time extraction.

It MUST NOT be loaded in the browser and MUST NOT remain a production data source.

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

The SSOT refactor is accepted only when all of the following are true.

### Catalogue SSOT

- [ ] Every built-in icon is an independent file under `icons/catalog/`.
- [ ] No built-in catalogue geometry exists in JavaScript or JSON.
- [ ] Every icon ID maps to exactly one SVG file.
- [ ] Every SVG file maps to exactly one metadata entry.
- [ ] Purchase Order and Delivery Order use their approved current artwork.
- [ ] `icon-library.js` is no longer loaded or required.

### Metadata

- [ ] `data/icon-registry.json` is the only built-in metadata registry.
- [ ] Registry schema and category references validate.
- [ ] Search aliases and tags are preserved.
- [ ] Icon count remains complete.

### JavaScript

- [ ] The app loads through `js/app.js` as an ES module.
- [ ] Catalogue loading is owned by `icon-repository.js`.
- [ ] SVG validation is owned by `svg-sanitizer.js`.
- [ ] Rendering and export are separate modules.
- [ ] No module mixes unrelated feature responsibilities.
- [ ] No global `window.ICON_LIBRARY` remains.
- [ ] One invalid icon cannot crash the catalogue.

### CSS

- [ ] Styles are split into responsibility-based files.
- [ ] Repeated design values use tokens where practical.
- [ ] Responsive behaviour matches or improves the baseline.
- [ ] No new `!important` declarations are introduced.
- [ ] Mobile and tablet have no horizontal overflow.

### Behaviour

- [ ] Existing search, filters, density, favorites, recent, uploads and inspector features work.
- [ ] SVG, JSX and CSS output remains correct.
- [ ] Runtime customization does not mutate source files.
- [ ] User settings persist.
- [ ] Existing uploaded icons are migrated safely.

### Quality

- [ ] All icon validation checks pass.
- [ ] Static project validation passes.
- [ ] Browser QA has no blocking errors.
- [ ] Console errors are zero.
- [ ] Page errors are zero.
- [ ] Security checks have no unresolved high-severity issue.
- [ ] README and CHANGELOG are updated.
- [ ] A verified rollback point exists.

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
- PWA precache manifest generation.
- Versioned icon releases.
- License and attribution metadata.
- Remote catalogue synchronisation.
- Automated optical consistency reports.
- Multiple variants per semantic icon.

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

---

## 24. Definition of Done

The refactor is complete when:

1. The final project structure follows this specification.
2. Every built-in icon is independently manageable.
3. The monolithic catalogue and application sources are removed from production.
4. All existing application features are preserved.
5. Static, security, SVG and browser quality gates pass.
6. Desktop, tablet and mobile evidence is recorded.
7. Documentation explains the new maintenance workflow.
8. The project is published as `v0.2.0` with a verified rollback point.

---

## 25. Implementation instruction for Code-MCP

When implementing this specification:

1. Read `SPEC.md`, `README.md`, `CHANGELOG.md`, current tasks and review reports.
2. Create a recovery point before editing.
3. Break the work into dependency-aware tasks.
4. Migrate catalogue assets before removing legacy sources.
5. Preserve all current icon IDs and user-facing behaviour.
6. Validate after every migration phase.
7. Run desktop, tablet and mobile browser QA.
8. Fix blocking issues before publishing.
9. Do not ask for confirmation for routine implementation decisions covered by this specification.
10. Leave unrelated enhancements for later tasks.
