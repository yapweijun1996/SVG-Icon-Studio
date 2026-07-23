# Icon Studio — SVG Icon Collection

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An SVG catalogue, customisation and export workspace built with static HTML, modular CSS and browser-native ES modules. The runtime itself still has zero third-party dependencies — [Vite](https://vitejs.dev) is only a dev-server/bundler wrapper on top, used for local development and the GitHub Pages build.

- Project ID: `project_f2a74b23-33c1-4c5c-b43d-e2b5b3108428`
- Release: `v0.2.0`
- Entry: `index.html`
- Live demo: https://yapweijun1996.github.io/SVG-Icon-Studio/ (built and deployed automatically from `main` by [.github/workflows/deploy.yml](.github/workflows/deploy.yml))
- License: [MIT](LICENSE)

## SSOT architecture

Every built-in selectable icon has one authoritative source file:

```text
icons/catalog/<icon-id>.svg
```

`data/icon-registry.json` contains searchable metadata only. Built-in SVG geometry must never be copied into JavaScript, HTML or registry JSON.

```text
Icon Studio
├── data/icon-registry.json
├── icons/catalog/*.svg
├── js/
│   ├── app.js
│   ├── core/
│   ├── services/
│   ├── features/
│   └── ui/
├── css/*.css
├── tools/*.mjs
└── tests/*.mjs
```

## Runtime responsibilities

- `js/app.js` coordinates startup and feature controllers.
- `js/services/icon-repository.js` loads registry metadata and same-origin SVG assets.
- `js/services/svg-sanitizer.js` enforces the browser SVG allowlist.
- `js/services/svg-renderer.js` renders trusted SVG DOM nodes without raw HTML injection.
- `js/services/svg-exporter.js` generates SVG, JSX and CSS output.
- `js/features/catalogue.js` owns cards, lazy previews and catalogue interactions.
- `js/features/inspector.js` owns preview, customisation and code output.
- `js/features/importer.js` owns validated browser uploads.
- `js/core/storage.js` owns local preferences, IndexedDB upload metadata/assets and legacy migration.

## Add a built-in icon

1. Add `icons/catalog/<icon-id>.svg`.
2. Use exact `viewBox="0 0 24 24"` and `currentColor`.
3. Do not set fixed root `width` or `height`.
4. Add one geometry-free entry to `data/icon-registry.json`.
5. Run all quality gates.

```bash
npm run typecheck
npm test
npm run build
```

## Replace a built-in icon

Replace only `icons/catalog/<icon-id>.svg`. Update the registry only when metadata changes. Existing IDs must remain stable unless a documented migration is supplied.

The approved Purchase Order and Delivery Order artwork is maintained independently in:

```text
icons/catalog/purchase-order.svg
icons/catalog/delivery-order.svg
```

## Uploaded icons

Uploaded SVGs are a separate browser-local library. Metadata and sanitized SVG assets are stored in separate IndexedDB object stores. Existing legacy localStorage uploads are migrated once and removed only after successful migration.

## SVG security policy

- Same-origin catalogue loading only.
- Maximum canonical SVG size: 64 KB.
- Exact 24×24 viewBox.
- Allowlisted SVG elements and attributes only.
- No scripts, event handlers, `foreignObject`, external URLs, data URLs, animations, embedded media or cross-origin references.
- One failed asset receives a local fallback and does not break the catalogue.

## Development

```bash
npm install   # installs Vite only — the app's own runtime stays dependency-free
npm run dev   # Vite dev server with instant reload, http://localhost:5173
```

`npm run serve` still starts the old zero-dependency static server (`tools/serve.mjs`, Node built-ins only) if you ever want to run the app with no `node_modules` at all — open `index.html` through it exactly as before.

## Build & deploy

```bash
npm run build     # validate icons/registry, then vite build → dist/
npm run preview   # serve the dist/ build locally to sanity-check it
```

`vite.config.js` uses `base: './'` (relative asset paths) so the same build works unmodified from a GitHub Pages project page, a custom domain, or a local folder. `data/icon-registry.json` and `icons/catalog/*.svg` are fetched at runtime by URL rather than imported, so a small Vite plugin in `vite.config.js` copies both folders into `dist/` verbatim during build.

Pushing to `main` runs [.github/workflows/deploy.yml](.github/workflows/deploy.yml): install → `npm test` → `npm run build` → publish `dist/` to GitHub Pages. To enable it on a fork, turn on **Settings → Pages → Source: GitHub Actions** once.

## Quality gates

- Registry/file one-to-one validation.
- Duplicate IDs, unknown categories, orphan files and geometry-in-registry checks.
- SVG size, namespace, viewBox, currentColor and security policy checks.
- JavaScript syntax checking.
- Desktop, tablet and mobile browser regression.
- Accessibility audit and horizontal-overflow checks.

## Recovery

Verified pre-refactor recovery point:

```text
backup_f2a74b23-33c_mrx41c10
```

Use this recovery point only if the modular release must be rolled back.
