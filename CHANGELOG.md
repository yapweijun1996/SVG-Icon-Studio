# Changelog

## 0.7.1 — 2026-07-31

### Fixed

- "Manage brand kit" and a card's "⋮" (more export options) button showed the full-screen dimming backdrop with nothing visibly happening behind it on desktop-width screens. `js/features/shell.js`'s `openInspector()` unconditionally added the `inspector-open` class (which triggers the backdrop and the mobile slide-in drawer), but on desktop the inspector panel is already docked and doesn't slide anywhere -- so clicking either button just dimmed the screen for no visible reason. `closeInspector()` already branches on the same `(max-width: 1180px)` check for exactly this reason; `openInspector()` now mirrors it: it still always un-collapses a manually-collapsed desktop inspector, but only adds `inspector-open` (and the backdrop that follows) on narrow viewports.

### Validation

- `npm test`, `npm run typecheck` and `npm run build` all pass.
- Verified in the running app at a real 1440px viewport: both buttons now leave the backdrop hidden and never set `inspector-open`, while still un-collapsing a manually-collapsed inspector panel.
- Verified at 390px (mobile width) that "Manage brand kit" still opens the drawer: byte-for-byte identical resulting state (backdrop, body class, `aria-expanded`) to clicking the pre-existing, already-shipped mobile inspector toggle button, proving the mobile behaviour is unchanged.
- Note on how this was tested: this session's browser pane reports `document.hidden === true` and a frozen main thread under any wait strategy (`setTimeout`, busy-wait), so the CSS slide/fade transition itself couldn't be watched playing out live here -- verification relied on comparing final DOM/class state against the known-working mobile toggle button rather than eyeballing the animation.

## 0.7.0 — 2026-07-31

### Changed

- Catalogue-grid icon colour is now consistent across every style. Removed `css/catalogue.css`'s `.icon-card[data-style="filled"] .card-preview { color: var(--accent); }` rule, which forced the 9 `filled`-style icons to render in brand orange in the grid while all 91 `outline` icons rendered in the normal ink colour. That split only stood out once the filled count grew from 3 to 9 across the last two releases; all icons now use the same `var(--text)` the rest of the grid already used.
- The catalogue grid now auto-loads more icons as you scroll near the bottom, instead of requiring a manual click on "Load more icons". `js/features/catalogue.js` adds an `IntersectionObserver` (600px lookahead) watching the load-more control; it calls the same `loadMore()` the button already used, and stops firing on its own once the button is hidden (nothing left to load). The button itself is kept as a manual/keyboard-accessible fallback.

### Validation

- `npm test`, `npm run typecheck` and `npm run build` all pass.
- Verified in the running app: all 9 filled icons (`purchase-order`, `delivery-order`, `ai-spark`, plus the 6 added in 0.6.0) now render the same computed colour as outline icons in the grid, in both light and dark theme.
- Verified `loadMore()` itself end-to-end: clicking it takes the grid from 24 to all 36 ERP-category cards (and to all 100 across every category) with no duplicate or missing IDs, and the control correctly hides once nothing is left to load.
- Could not directly observe the `IntersectionObserver` auto-fire in this session: the automation environment's browser pane reported `document.hidden === true` (a backgrounded tab), which is standard Chromium behaviour that throttles/pauses `IntersectionObserver` callbacks and is unrelated to this code. The observer's wiring was confirmed correct by other means -- the watched element's `getBoundingClientRect()` places it inside the viewport (so a live tab would satisfy the default threshold immediately), the source fetched from the running dev server includes the expected observer/rootMargin, and it invokes the exact same `loadMore()` already verified above. This one behaviour should still be spot-checked in a normal foregrounded browser.

## 0.6.1 — 2026-07-31

### Fixed

- The Inspector's fill-colour picker did nothing for `filled`-style icons, and their colour was silently controlled by the *stroke*-colour picker instead. `js/services/svg-renderer.js` `applyAppearance()` only set `fill` on the root `<svg>`, but every filled-style shape (the discovery came from `purchase-order.svg`, `delivery-order.svg`, `ai-spark.svg`, and the 6 new filled icons from 0.6.0) carries its own `fill="currentColor"` attribute, and an element's own presentation attribute always wins over an inherited value from its parent — so the root-level override was never reachable. Now `applyAppearance` also writes the resolved paint onto every descendant that carries a `fill` attribute. Fixes both the live Inspector preview and the exported SVG/JSX/CSS code, and applies to all 9 filled icons (3 pre-existing + 6 added in 0.6.0), not just the new ones.

### Validation

- `npm test`, `npm run typecheck` and `npm run build` all pass.
- Verified in the running app: with "use currentColor" off, setting the fill colour to a distinctive value now renders that colour in the Inspector preview and appears literally in the exported SVG code (previously it stayed on the default ink colour, and only the *stroke* picker could move it). Changing stroke colour on a filled icon no longer affects its fill. Re-checked all 9 filled icons (`purchase-order`, `delivery-order`, `ai-spark` plus the 6 from 0.6.0) with a custom fill colour. Outline-style icons (spot-checked on `database`) are unaffected — their stroke picker behaves exactly as before.

## 0.6.0 — 2026-07-31

### Added

- 6 ERP icons in the **filled glyph style** of `purchase-order.svg` rather than the outline style used by the rest of the catalogue (catalogue 94 → 100, ERP 30 → 36, filled 3 → 9): `purchase-requisition`, `debit-note`, `packing-list`, `pick-list`, `journal-entry`, `dashboard`.
- `tools/gen-filled-icons.mjs`, the authoring-time generator these six are produced by. It is not part of the app or the build — it only emits static SVG that is committed to `icons/catalog/`. It exists because in this style every "stroke" is a filled shape with an inner and an outer contour, and hand-computing those coordinate pairs is not reliably correct.

### Notes on the filled style

- Stroke weight is `0.73` units, measured off `purchase-order.svg` (its document wall is `6.75 − 6.023` and its text rule is `11.742 − 11.016`).
- Badges are a **solid disc with the glyph knocked out of it** by `fill-rule="evenodd"`, which is how `purchase-order.svg` builds its tick. Nesting circles to make a ring instead makes the fill alternate against the glyph and renders as a blob.
- A single `evenodd` path cannot mask one shape behind another — overlapping regions cancel. Badged documents are therefore narrowed to stop just short of the badge instead of running under it, and badge-less icons use a separate, wider document box so they stay centred.

### Validation

- `npm test` (100 icons, zero errors, no duplicate aliases), `npm run typecheck` and `npm run build` all pass. `tools/gen-filled-icons.mjs` is covered by `typecheck`.
- Because the browser pane in this environment cannot produce screenshots, each icon was rasterised to a canvas and read back pixel-by-pixel as ASCII to confirm it actually renders as intended. That caught three real defects that geometry checks alone would have missed: badges rendering as blobs from ring nesting, the document border slicing through a badge, and a tick glyph overflowing its checkbox.
- `getBBox()` confirms nothing is clipped and every icon is centred to within 0.01 units. This caught the three badge-less icons sitting 2.5 units left of centre, because they had inherited the narrowed document geometry meant for badged icons.
- Verified in the running app: all 36 ERP cards render, zero failed asset loads, zero console errors, and `fill-rule="evenodd"` survives both the sanitizer and the SVG export.

## 0.5.0 — 2026-07-31

### Added

- A second batch of 12 ERP icons (catalogue grows 82 → 94, ERP category 18 → 30), broadening coverage past documents into finance, HR, warehouse and controlling: `credit-note`, `goods-issue`, `contract`, `bank`, `employee`, `timesheet`, `audit-trail`, `budget`, `price-list`, `batch-lot`, `bin-location`, `cost-center`.
- `goods-issue` is drawn as the deliberate mirror of `goods-receipt` — same carton, arrow reversed — so the inbound/outbound pair reads as a set.

### Validation

- `npm test` (94 icons, zero errors, no duplicate aliases), `npm run typecheck` and `npm run build` all pass.
- Every new icon measured with `getBBox()`: nothing is clipped by the 24×24 viewBox once the 1.5 stroke is accounted for, and every icon is centred to within 0.25 units. This caught `timesheet`, `audit-trail` and `bin-location` sitting off-centre, all corrected before commit.
- ERP category verified in the running app: 30 cards render, zero failed asset loads, zero console errors. Alias search spot-checked (`grn` → goods-receipt, `gi` → goods-issue, `rack` → bin-location); inspector preview and SVG export verified on a new icon.
- Checked each design against the existing 82 icons for visual collision before drawing. A planned `branch` storefront icon was dropped because `vendor` already occupies that shape, and `employee` was drawn as an ID badge card rather than a person so it cannot be confused with `customer` / `users` / `user-add`.

## 0.4.0 — 2026-07-31

### Added

- 12 new ERP icons (catalogue grows 70 → 82, ERP category 6 → 18): `quotation`, `goods-receipt`, `stock-transfer`, `bill-of-materials`, `work-order`, `inventory`, `ledger`, `approval`, `workflow`, `tax`, `report`, `reconciliation`. All outline style at the standard `stroke-width="1.5"` / `currentColor` / exact `0 0 24 24`, drawn to match the existing catalogue's geometry conventions.
- Content-Security-Policy `<meta>` in `index.html` as defence in depth behind the SVG sanitizer: `default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'none'`. `style-src` keeps `'unsafe-inline'` because `js/features/inspector.js` and `js/services/svg-renderer.js` assign `element.style.color` directly; `img-src` allows `data:` for the CSS-mask export. `script-src` needs no exception — the Vite production build emits no inline script.

### Fixed

- The sidebar "Collections" badge was hardcoded to `6` while the registry had grown to 10 categories. It is now derived from the rendered category chips in `js/features/catalogue.js`, so adding a category can never leave it stale again.
- `README.md` still advertised release `v0.2.0` while `package.json` was already at `0.3.1`.

### Validation

- `npm test` (82 icons, zero errors, no duplicate aliases), `npm run typecheck` and `npm run build` all pass.
- CSP verified in a real browser on both the Vite dev server and the production preview build: zero CSP violations, service worker still registers, catalogue/inspector/code-export all functional.
- Every new icon measured with `getBBox()`: no artwork is clipped by the 24×24 viewBox once the 1.5 stroke is accounted for, and all are centred. This caught `goods-receipt` sitting ~2 units low, which was corrected before commit.
- ERP category verified in the running app: 18 cards render, zero failed asset loads; alias search (`bom`) resolves; inspector preview and SVG export work on a new icon.

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
