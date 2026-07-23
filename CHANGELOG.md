# Changelog

## 0.3.1 — 2026-07-23

### Changed

- Switched `icons/catalog/delivery-truck.svg` from `stroke-linecap="round" stroke-linejoin="round"` to `stroke-linecap="butt" stroke-linejoin="miter"` to match an approved reference image's sharp-cornered style. Same coordinates, only the corner rendering changed. Every other catalogue icon still uses round joins/caps — this is a deliberate, isolated exception, same as the invoice stroke-width change above.
- Fixed both `delivery-truck.svg` wheels: they were positioned `cy="18"` against a chassis line at `y="17"`, a full 1-unit overlap into the truck body. At that overlap the wheel's top arc and the chassis stroke visually merged into a solid blob instead of a hollow tire. Moved both wheels to `cy="19"` so they sit tangent to the chassis line instead of cutting into it.

- Replaced the canonical `icons/catalog/invoice.svg` artwork with a clearer document design: 3 header lines, a proper 2×2 table grid (column + row divider), and the currency mark repositioned to match an approved reference image.
- Set `invoice.svg`'s `stroke-width` to `1` (down from a legacy `1.55`), by explicit choice: at this icon's detail level, `1` keeps the currency mark legible where `1.5`/`1.55` started to merge into a blob. Every other catalogue icon still uses `1.5` — this is a deliberate, isolated exception, not a new baseline.
- Kept the invoice registry ID, metadata and SSOT architecture unchanged.

### Validation

- Considered and rejected a denser table (3 rows + per-cell content lines) matching the reference image more literally — at a 24×24 viewBox it rendered as a merged blob rather than a legible grid; simplified to what stays legible at icon scale instead of chasing literal fidelity.
- Compared `stroke-width` 1 / 1.5 / 1.55 side by side before choosing 1.
- `npm test`, `npm run typecheck`, `npm run build` all pass.
- Verified in the running app (catalogue card render + inspector preview) at 24px, 40px, 64px and 120px.

## 0.3.0 — 2026-07-23

### Added

- MIT `LICENSE`; `package.json` now declares `license`, `repository` and `homepage`.
- Vite as an optional dev-server/bundler (`npm run dev`, `npm run build`, `npm run preview`), configured with a relative `base` so the same build serves correctly from a GitHub Pages project page or any subpath.
- `.github/workflows/deploy.yml` — on every push to `main`: install, `npm test`, `npm run build`, publish `dist/` to GitHub Pages.
- `npm run serve` keeps the original zero-dependency static server (`tools/serve.mjs`) available for anyone who wants no `node_modules` at all.
- `.gitignore` for `node_modules/` and `dist/`.

### Changed

- `js/services/icon-repository.js` now resolves `data/icon-registry.json` and `icons/catalog/*.svg` against `document.baseURI` instead of `import.meta.url`, so runtime asset loading no longer depends on where a bundler places the module's own output file.
- `vite.config.js` copies `data/` and `icons/catalog/` into `dist/` verbatim during build, since both are fetched at runtime by URL rather than imported.

### Validation

- `npm test` and `npm run build` pass.
- Verified the production build (`vite build` + `vite preview`) against a simulated GitHub Pages subpath (`/SVG-Icon-Studio/...`): all 40 icons load, zero console errors.
- The application's own runtime still ships zero third-party dependencies (see SPEC.md ADR-001 update).

## 0.2.2 — 2026-07-23

### Fixed

- `js/services/svg-sanitizer.js` (browser) allow-listed the attribute name `clip-path-units`, which does not exist — the real SVG attribute lowercases to `clippathunits`. Any legitimate `clipPathUnits` usage on an uploaded SVG was silently rejected.

### Changed

- Extracted the SVG allow-list (elements, attributes, event/href/external-reference checks) shared by `js/services/svg-sanitizer.js` (browser, DOMParser-based) and `tools/svg-policy.mjs` (Node build-time, regex-based) into one canonical module, `js/services/svg-policy.js`. The two checkers previously maintained separate, hand-written copies of the same allow-list and had already drifted on naming and the bug above.

### Added

- `tests/svg-policy.test.mjs` — unit tests for the shared allow-list module, including a regression test for the `clippathunits` fix.
- `tests/filters.test.mjs`, `tests/state.test.mjs`, `tests/dom.test.mjs` — unit test coverage for the previously-untested pure runtime modules (`js/features/filters.js`, `js/core/state.js`, `slugify` from `js/core/dom.js`).

## 0.2.1 — 2026-07-23

### Changed

- Replaced the canonical `icons/catalog/invoice.svg` artwork with the approved invoice document design: folded page, document rows, item table, currency mark and totals.
- Kept the Invoice metadata registry geometry-free and retained the existing `invoice` ID, category and search terms.

### Validation

- SVG registry and policy tests passed.
- Desktop and mobile browser QA passed without runtime, network, overflow or accessibility errors.

## 0.2.0 — 2026-07-23

### Added

- One authoritative `icons/catalog/<icon-id>.svg` file for every built-in catalogue icon.
- Geometry-free `data/icon-registry.json` with stable IDs, categories, styles, tags, aliases, status and sort order.
- Browser-native ES module architecture split across core, services, features and UI responsibilities.
- Responsibility-based CSS modules with explicit loading order.
- Metadata-first catalogue startup, lazy icon previews, bounded asset loading and per-icon fallback.
- Allowlist SVG parser for catalogue and uploaded assets.
- IndexedDB stores separating uploaded icon metadata from sanitized SVG asset records.
- One-time legacy localStorage upload migration.
- Dependency-free registry, SVG policy, syntax and build validation scripts.
- Accessibility-sized inspector controls and improved accent contrast.

### Changed

- `index.html` now loads `js/app.js` with `type="module"`.
- Built-in icon cards and inspector previews now load canonical SVG assets from same-origin files.
- SVG, JSX and CSS output is generated from the selected canonical source without modifying it.
- Purchase Order and Delivery Order artwork is preserved in independent SSOT files.

### Removed

- Active production use of `icon-library.js`, `script.js` and `styles.css`.
- Built-in SVG geometry from JavaScript and registry data.
- Raw untrusted SVG/HTML insertion paths.

### Security

- Reject scripts, event handlers, `foreignObject`, embedded media, external URLs, data URLs and unsafe references.
- Enforce exact `0 0 24 24` viewBox and a 64 KB hard size limit.
- Enforce same-origin catalogue asset requests.

### Validation

- Static project validation.
- `npm run typecheck`.
- `npm test`.
- `npm run build`.
- Desktop, tablet and mobile browser QA.
- Zero accessibility violations in the modular local build.
- Purchase Order, Delivery Order, inspector, favorites, filtering and density interaction flows.

## 0.1.0 — 2026-07-23

- Initial Icon Studio MVP with searchable SVG cards, favorites, recent history, upload validation, responsive inspector, appearance controls and SVG/JSX/CSS export.
