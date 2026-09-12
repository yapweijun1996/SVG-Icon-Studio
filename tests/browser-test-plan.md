# Browser regression test plan

Required viewports: desktop 1440×900, tablet 834×1112 and mobile 390×844.

## Required flows

1. Startup loads registry metadata and default Invoice inspector preview.
2. Exact-name and alias search: `Purchase Order`, `po`, `Delivery Order`, `do`.
3. Category and style filters return correct cards.
4. Grid and Compact modes update layout and persist.
5. Favorite toggling updates card, inspector, navigation count and Favorites view.
6. Recently Viewed order updates after selection.
7. Purchase Order and Delivery Order match their approved independent SVG assets.
8. Inspector size, stroke, fill, background, rotation and flip controls update preview without changing source files.
9. SVG, JSX and CSS tabs generate copyable code.
10. Full preview dialog opens and closes by button, backdrop and Escape; on mobile/tablet, the first Escape closes only the modal preview and leaves the underlying inspector drawer open until a second dismissal.
11. Theme, sidebar and inspector settings persist.
11a. On desktop, collapsing the inspector changes the icon-only toggle action from “Collapse inspector” to “Expand inspector”, and expanding it changes the action back.
12. Valid 24×24 SVG upload is sanitized and stored in IndexedDB.
13. Unsafe, oversized or non-24×24 SVG upload is rejected without persistence.
14. One missing catalogue asset shows fallback while other icons continue working.
15. Zero console errors, page errors, failed assets, accessibility violations and horizontal overflow.
16. A persisted or migrated uploaded record whose ID matches a built-in icon cannot replace the canonical built-in metadata/asset; a non-colliding uploaded peer still registers normally.
17. If metadata-orphan cleanup cannot obtain an IndexedDB write transaction, already-read valid uploaded metadata/asset pairs remain available for the session and cleanup is deferred.
18. Direct IndexedDB v1→v3 upgrade migrates valid legacy uploads without leaving duplicate legacy rows, while preserving incomplete legacy rows for recovery.
19. Service-worker navigation caching keeps the offline app-shell fallback intact after failed or unrelated same-scope navigations; offline root navigation still returns the cached valid shell.
20. Service-worker runtime CacheStorage stays at or below 256 app-asset entries after overflow; the oldest runtime assets are evicted while root/index/manifest shell entries remain intact.

## Automated evidence

- Responsive + accessibility: `review/ssot-migration-report.md`
- Purchase Order alias/selection flow.
- Delivery Order alias/selection flow.
- Inspector transform/code/full-preview flow.
- Filter/density/favorite flow.
- `npm test`, `npm run typecheck`, and `npm run build`.
