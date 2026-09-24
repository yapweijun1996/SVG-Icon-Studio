# Browser regression test plan

Required viewports: desktop 1440×900, tablet 834×1112 and mobile 390×844.

## Required flows

1. Startup loads registry metadata and default Invoice inspector preview.
2. Exact-name and alias search: `Purchase Order`, `po`, `Delivery Order`, `do`.
3. Category and style filters return correct cards.
4. Grid and Compact density choices form one labelled radio group with a single Tab stop; Arrow Left/Right/Up/Down moves focus and selection with wraparound, updates layout, and persists. Density-only changes must not repeat an unchanged catalogue result live announcement.
4a. Keyboard activation of **Show advanced filters** opens the disclosure and moves focus directly to Style; pointer activation keeps the trigger-focused pointer flow unchanged.
4b. With Advanced Filters open, Escape from Style, Sort or Clear filters collapses the disclosure, changes the trigger to “Show advanced filters” with `aria-expanded=false` and no active class, restores focus to `#filterButton`, and does not dismiss an unrelated mobile/tablet drawer.
5. Favorite toggling updates card, inspector, navigation count and Favorites view.
5a. Catalogue and inspector favorite toggles keep the same accessible name before/after activation while `aria-pressed` changes false ↔ true.
5b. Every catalogue `Copy SVG` action keeps the compact visible text but exposes an icon-specific accessible name (for example `Copy Invoice SVG`) so repeated card actions are distinguishable.
5c. Keyboard activation of a catalogue Favorite action retains focus on that same icon's re-rendered Favorite button while `aria-pressed` toggles false ↔ true.
5d. On desktop, keyboard activation of catalogue Select and More actions retains focus on the same icon's equivalent re-rendered action; on mobile/tablet, Select/More still move focus into the inspector drawer and restore to the replacement trigger when dismissed.
5e. In Favorites view, keyboard-unfavoriting the focused card moves focus to the nearest remaining Favorite action; removing the final favorite focuses the visible `No icons found` heading instead of `body`.
5f. Empty-state recovery is context-aware: a filtered-empty view offers `Reset filters` and stays in that view, while an intrinsically empty Favorites/Recent/Uploaded view offers `Browse all icons`, returns to Library, and focuses the visible results heading.
5g. When the manual `Load more icons` fallback owns focus, intermediate loads keep focus on that button; after the final batch hides it, focus moves to the first newly revealed icon Select action instead of `body`.
5h. Catalogue result status remains one polite atomic live region and announces concise active context: default pagination stays count-only, while search/category/style filters and scoped Favorites/Recent/Uploaded views identify the relevant query/filter/view alongside the count, including zero results. Rapid search typing keeps visual filtering immediate but coalesces live-region text until typing pauses, so partial queries are not queued as separate announcements. Chinese/Japanese IME composition also keeps visual filtering immediate while suppressing/cancelling live-region updates until composition commits, then announces only the final query once. Clearing a search to empty via the native search Escape/cancel behavior updates the result status immediately while keeping focus in the search field.
6. Recently Viewed order updates after selection.
6a. Entering Collections applies the category-grouped default, and leaving Collections restores the prior non-Collections sort (including a user-selected sort such as Name A–Z) with the visible Sort control synchronized; the Collections default must not leak into Library, Favorites, Recent, Uploaded or Brand views.
7. Purchase Order and Delivery Order match their approved independent SVG assets.
8. Inspector size, stroke, fill, background, rotation and flip controls update preview without changing source files.
8a. Preview background is a labelled radio group with one checked/tabbable choice; Arrow Left/Right/Up/Down moves focus and selection with wraparound and updates the preview background.
8a. Rotation exposes the stable accessible name `Rotation (degrees)` so Chrome’s native numeric slider values have explicit unit context while the visible output remains compact (`0°`, `45°`).
8b. Stroke/Fill colour inputs keep stable accessible names (`Stroke colour` / `Fill colour`) while their native values and visible hex readouts change.
8c. The Fill icon checkbox exposes `Fill icon` as its concise accessible name and `Apply a solid fill colour.` as a separate accessible description while checked state remains native.
8d. The Use currentColor checkbox exposes `Use currentColor` as its concise accessible name and `Icon inherits colour from CSS.` as a separate accessible description while checked state remains native.
8e. The Include title checkbox exposes `Include title` as its concise accessible name and `Adds an accessible SVG title.` as a separate accessible description while checked state and SVG title generation remain native.
8f. Keyboard activation of Clear search clears the active filters, hides that action, and returns focus to the persistent search field instead of dropping focus to the document body.
9. SVG, JSX and CSS tabs generate copyable code.
10. Full preview dialog opens and closes by button, backdrop and Escape; on mobile/tablet, the first Escape closes only the modal preview and leaves the underlying inspector drawer open until a second dismissal.
11. Theme, sidebar and inspector-collapse settings persist.
11a. On desktop, collapsing the inspector changes the icon-only toggle action from “Collapse inspector” to “Expand inspector”, and expanding it changes the action back.
11b. On mobile, the navigation trigger changes from “Open navigation” / `aria-expanded=false` to “Close navigation” / `aria-expanded=true` while the drawer is open, then returns to the open action when dismissed.
11c. On mobile/tablet, the inspector trigger changes from “Open icon inspector” / `aria-expanded=false` to “Close icon inspector” / `aria-expanded=true` while the drawer is open, then returns to the open action when dismissed.
11d. Toggling light/dark theme keeps the icon-only button accessible action and visible tooltip synchronized (for example, dark theme exposes “Switch to light theme”).
11e. On desktop, collapsing the sidebar keeps the brand icon-only toggle named “Expand sidebar”; expanding it restores “Collapse sidebar”.
11f. The Inspector exposes no non-functional Pin control/state; on mobile/tablet, opening the drawer moves focus to the first visible header control.
11g. The Inspector exposes only the Collapse/Expand action while docked on desktop; the separate Close inspector control is hidden there and becomes visible only at the ≤1180px drawer breakpoint, where the desktop collapse control is hidden.
11h. The Inspector Size range exposes the accessible name “Size” in the browser Accessibility Tree while retaining its native numeric slider value and visible px output.
11i. At 390×844 and 834×1112, opening the Inspector focuses the first visible control; Shift+Tab from `#closeInspectorButton` wraps to the actual last visible tabbable Inspector control, and Tab from that control wraps back to Close. Hidden controls and inactive roving controls (`tabindex=-1`) are not trap boundaries; the mobile sidebar drawer also keeps Tab focus inside.
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
