# Changelog

## 0.9.32 — 2026-09-22

### Fixed

- Made the catalogue empty-state primary action actually recover from the state it describes. Real Chrome showed that `Reset catalogue` worked when search/filter criteria hid Library results, but did nothing useful in an intrinsically empty **Favorites**, **Recently viewed**, or **Uploaded** view because it cleared filters without leaving that scoped view. The empty state now says `Reset filters` when the current view contains items that filters are hiding, and `Browse all icons` when the scoped view itself has no items. The latter resets filters and returns to Library. After either recovery, focus moves to the visible results heading instead of falling back to `body` when the empty-state button disappears.

### Validation

- Pre-fix real Chrome at 1440×900 confirmed the filtered-Library reset path restored all 120 icons, while empty Favorites remained empty after `Reset catalogue`; a focused reset also dropped focus to `body`. Focused filter/DOM regression, `npm run typecheck`, full `npm test`, `npm run build`, `git diff --check`, and exact committed-head Chrome verification cover filtered-empty recovery staying in its view, intrinsically empty scoped recovery returning to Library, visible action labels, results-heading focus, 120 icons, and zero runtime exceptions.

## 0.9.31 — 2026-09-22

### Fixed

- Preserved keyboard focus when unfavoriting removes the focused card from the **Favorites** view. Real Chrome previously removed the card correctly but left focus on `body`. The catalogue now first restores the same icon's Favorite control when it still exists; if the card disappeared because it was filtered out of Favorites, focus moves to the nearest remaining Favorite action at the same list position (or the previous item when the removed card was last). If the final favorite is removed, focus moves to the now-visible `No icons found` heading, which is programmatically focusable but remains outside the normal Tab order.

### Validation

- Pre-fix real Chrome at 1440×900 reproduced a focused Favorite action removing its card from a two-item Favorites view and dropping focus to `body`. Focused DOM/source regression, `npm run typecheck`, full `npm test`, `npm run build`, `git diff --check`, and exact committed-head Chrome verification cover nearest-item fallback, final-item empty-state focus, unchanged normal-library Favorite focus restoration, 120 loaded icons, and zero runtime exceptions.

## 0.9.30 — 2026-09-22

### Fixed

- Preserved keyboard focus when catalogue **Select** and **More export options** actions rebuild the card grid on docked desktop. Real Chrome previously executed both actions correctly but removed the focused button during the catalogue re-render, leaving focus on `body`. A focused action now falls back to the equivalent newly rendered card control only when the rebuild actually loses focus. Mobile/tablet behavior is intentionally unchanged: opening the inspector drawer still moves focus to its first visible control and closing it restores focus to the replacement card trigger.

### Validation

- Pre-fix real Chrome at 1440×900 reproduced `Select Customer icon` and `More export options for Delivery Truck` both moving focus to `body` after successful keyboard activation, while 390×844 correctly transferred Select focus into the inspector drawer. Focused DOM/source regression, `npm run typecheck`, full `npm test`, `npm run build`, `git diff --check`, and exact committed-head Chrome verification cover desktop Select/More focus retention, unchanged mobile drawer focus transfer/restore, 120 loaded icons, and zero runtime exceptions.

## 0.9.29 — 2026-09-22

### Fixed

- Preserved keyboard focus when toggling a catalogue **Favorite** button. Favorite changes rebuild the catalogue so counts, card state and Favorites view stay synchronized; previously that rebuild removed the focused button and real Chrome moved focus to `body`. The delegated handler now detects when the activated Favorite action owns focus and restores focus to the same icon's newly rendered Favorite button after the state update. Stable icon-specific names and native `aria-pressed` state remain unchanged.

### Validation

- Pre-fix real Chrome focused `Favorite Invoice`, activated it with Space, confirmed `aria-pressed=false→true`, and observed focus fall back to `body`. Focused DOM/source regression, `npm run typecheck`, full `npm test`, `npm run build`, `git diff --check`, and exact committed-head real Chrome verification cover focus retention across both favorite/unfavorite transitions, unchanged accessible name/state, and zero runtime exceptions.

## 0.9.28 — 2026-09-22

### Fixed

- Scoped every catalogue **Copy SVG** button to its card icon in the accessibility tree. The visible label remains the intentionally compact `Copy SVG`, but each control now exposes an icon-specific accessible name such as `Copy Invoice SVG` or `Copy Customer SVG`, avoiding a long sequence of indistinguishable `Copy SVG` controls for screen-reader users. The delegated copy handler and generated SVG are unchanged.

### Validation

- Pre-fix real Chrome reproduced three consecutive catalogue copy controls named only `Copy SVG` for Invoice, Customer and Delivery Truck. Focused DOM regression, `npm run typecheck`, full `npm test`, `npm run build`, `git diff --check`, and exact committed-head real Chrome verification cover icon-specific names while retaining the visible `Copy SVG` text and existing delegated copy action.

## 0.9.27 — 2026-09-22

### Fixed

- Reworked the Inspector **Preview background** selector as a true single-choice radio group instead of four independently tabbable toggle buttons. The container now exposes `role=radiogroup`; each Light/Dark/Brand/Transparent choice exposes `role=radio` with synchronized `aria-checked`, and only the selected choice remains in the Tab sequence. Arrow Left/Right/Up/Down moves selection and focus with wraparound while click/tap behavior and preview rendering stay unchanged.

### Validation

- Pre-fix inspection confirmed all four background choices were independent Tab stops (`tabIndex=0`) and Arrow keys did not switch the selected preview background. Focused DOM regression, `npm run typecheck`, full `npm test`, `npm run build`, `git diff --check`, and real Chrome committed-head interaction verify radio semantics, one roving Tab stop, Arrow-key state/preview updates, click behavior, and zero runtime exceptions.

## 0.9.26 — 2026-09-22

### Fixed

- Kept the Inspector **Include title** checkbox accessible name concise while exposing its visible helper separately. Real Chrome previously announced the whole nested label as `Include title Adds an accessible SVG title.` with an empty description. The checkbox now uses `aria-labelledby=includeTitleLabel` and `aria-describedby=includeTitleDescription`, producing name `Include title` and description `Adds an accessible SVG title.` while preserving native checked state and SVG title generation/removal behavior.

### Validation

- Pre-fix real Chrome at 1440×900 confirmed the helper text was merged into the checkbox name and the description was empty, while toggling still correctly removed/restored the preview SVG `<title>`. Focused DOM regression, `npm run typecheck`, full `npm test`, `npm run build`, `git diff --check`, and post-fix Chrome Accessibility Tree verification cover the concise name, separate description, checked-state transitions, and unchanged SVG title behavior.

## 0.9.25 — 2026-09-22

### Fixed

- Kept the Inspector **Use currentColor** checkbox accessible name concise while exposing its visible helper copy separately. Real Chrome previously announced the whole nested label as `Use currentColor Icon inherits colour from CSS.` with an empty accessible description. The checkbox now uses `aria-labelledby=currentColorLabel` and `aria-describedby=currentColorDescription`, so its name is `Use currentColor`, its description is `Icon inherits colour from CSS.`, and native checked-state behavior remains unchanged.

### Validation

- Pre-fix real Chrome at 1440×900 confirmed the helper text was merged into the checkbox name and the description was empty. Focused DOM regression, `npm run typecheck`, full `npm test`, `npm run build`, `git diff --check`, and post-fix Chrome Accessibility Tree verification cover the concise name, separate description, checked-state transition, and unchanged preview behavior.

## 0.9.24 — 2026-09-14

### Fixed

- Exposed the Inspector **Fill icon** helper text to assistive technology without bloating the control name. Real Chrome showed the checkbox as `name=Fill icon`, `checked=false`, but with an empty accessible description even though the visible UI says `Apply a solid fill colour.`. The checkbox now references that same visible helper with `aria-describedby=fillToggleDescription`, keeping the concise name and native checked state unchanged.

### Validation

- Pre-fix real Chrome at 1440×900 confirmed the visible helper text was absent from the checkbox accessibility description while Stroke width and checkbox states otherwise behaved correctly. Focused DOM regression, `npm run typecheck`, full `npm test`, `npm run build`, `git diff --check`, and post-fix Chrome Accessibility Tree verification cover `name=Fill icon`, `description=Apply a solid fill colour.`, native checked-state transitions, and unchanged preview behavior.

## 0.9.23 — 2026-09-12

### Fixed

- Made the Inspector **Rotation** slider's native numeric value understandable with its unit in assistive technology. Real Chrome exposed the control as `Rotation`, value/value-text `0` / `45`, while the visible output showed `0°` / `45°`. Chrome did not reflect an authored `aria-valuetext` on this native range control, so the robust fix is a stable accessible name of `Rotation (degrees)` while preserving the browser-native numeric slider value and visible compact degree output.

### Validation

- Pre-fix real Chrome at 1440×900 confirmed `name=Rotation`, numeric `value=0→45`, and accessible `valuetext=0→45` with no unit. A diagnostic Chrome run also confirmed authored `aria-valuetext` did not change that native AX value text, while `Rotation (degrees)` was reflected reliably as the control name. Focused DOM regression, `npm run typecheck`, full `npm test`, `npm run build`, `git diff --check`, and post-fix Chrome Accessibility Tree verification cover the unit context without changing slider/preview behavior.

## 0.9.22 — 2026-09-12

### Fixed

- Stabilized the Inspector **Stroke colour** and **Fill colour** accessible names. The nested label previously included each live hex-code readout, so real Chrome changed the control names from `Stroke colour #1F2937` / `Fill colour #F45B0B` as values changed. Each native colour input now uses `aria-labelledby` to reference only its visible text label, while the native colour value and visible hex readout remain separate and continue updating normally.

### Validation

- Pre-fix real Chrome at 1440×900 exposed `ColorWell` names that changed with their hex values. Focused DOM regression, `npm run typecheck`, full `npm test`, `npm run build`, `git diff --check`, and post-fix Chrome Accessibility Tree verification cover stable names while colour values and preview/readouts continue updating.

## 0.9.21 — 2026-09-12

### Fixed

- Restored a programmatic accessible name for the Inspector **Size** slider. The previous nested-label/output structure rendered the visible `Size` text but real Chrome exposed the range control as an unnamed `slider`; the control now uses an explicit native `<label for="sizeRange">Size</label>` association while preserving the existing live `48 px` output and range behavior.

### Validation

- Pre-fix real Chrome at 1440×900 exposed `sizeRange` as `role=slider`, `name=""`, `value=48`. Focused DOM regression, `npm run typecheck`, full `npm test`, `npm run build`, `git diff --check`, and post-fix Chrome Accessibility Tree verification cover the explicit `Size` name while preserving native slider value updates.

## 0.9.20 — 2026-09-12

### Fixed

- Removed a redundant desktop Inspector action by making the `Close inspector` button drawer-only. At desktop widths the docked Inspector now exposes only its existing Collapse/Expand control; at `≤1180px`, the desktop collapse control stays hidden and the drawer-specific Close control is visible.

### Validation

- Pre-fix real Chrome at 1440×900 confirmed both `Collapse inspector` and `Close inspector` were simultaneously visible and both placed the docked Inspector into the same `inspector-collapsed` state. Focused responsive-control regression, `npm run typecheck`, full `npm test`, `npm run build`, `git diff --check`, and post-fix Chrome verification cover the breakpoint-specific control contract.

## 0.9.19 — 2026-09-12

### Fixed

- Removed the Inspector “Pin” control and its persisted `iconStudioInspectorPinned` state because the control never affected Inspector docking, opening, collapsing, or any other product behavior; it only changed its own pressed state, status text, storage value, and toast.
- Drawer focus entry now skips hidden controls, so after removing the no-op Pin button the mobile/tablet Inspector focuses the first actually visible control instead of the desktop-only collapse button.

### Validation

- Focused dead-control regression, `npm run typecheck`, full `npm test`, `npm run build`, and `git diff --check` pass. Real Chrome verifies the dead Pin UI/state are absent, desktop collapse still works, mobile Inspector focus lands on the visible Close inspector button, and Horizontal/Vertical flip toggles retain their existing `aria-pressed` behavior and preview transform.

## 0.9.18 — 2026-09-12

### Fixed

- The mobile/tablet inspector icon button now keeps its accessible action name synchronized with the drawer state: “Open icon inspector” while closed and “Close icon inspector” while open. Previously `aria-expanded` changed to `true` but the button continued to announce the contradictory “Open icon inspector” action.

### Validation

- Pre-fix Google Chrome at 390×844 reproduced `aria-label="Open icon inspector"`, `aria-expanded=false` before activation and the stale `aria-label="Open icon inspector"`, `aria-expanded=true` after the drawer opened. Focused DOM regression, `npm run typecheck`, full `npm test`, `npm run build`, `git diff --check`, and post-fix real Chrome mobile verification cover the synchronized action/state contract.

## 0.9.17 — 2026-09-12

### Fixed

- The mobile navigation icon button now keeps its accessible action name synchronized with the drawer state: “Open navigation” while closed and “Close navigation” while open. Previously `aria-expanded` changed to `true` but the button continued to announce the contradictory “Open navigation” action.

### Validation

- Pre-fix Google Chrome at 390×844 reproduced `aria-label="Open navigation"`, `aria-expanded=false` before activation and the stale `aria-label="Open navigation"`, `aria-expanded=true` after the drawer opened. Focused DOM regression, `npm run typecheck`, full `npm test`, `npm run build`, `git diff --check`, and post-fix real Chrome mobile verification cover the synchronized action/state contract.

## 0.9.16 — 2026-09-12

### Fixed

- Catalogue-card and selected-icon favorite controls now keep a stable accessible name (for example, “Favorite Invoice”) while `aria-pressed` alone communicates whether the icon is currently saved. Previously the same toggle changed its name from “Add Invoice to favorites” to “Remove Invoice from favorites” while also changing `aria-pressed`, which breaks the WAI-ARIA toggle-button convention that a pressed toggle keeps the same label across states.

### Validation

- Pre-fix Google Chrome 153 at 1440×900 exposed both favorite controls as `name="Add Invoice to favorites"`, `pressed=false`, then changed both to `name="Remove Invoice from favorites"`, `pressed=true` after activation. Focused DOM regression, `npm run typecheck`, full `npm test`, `npm run build`, `git diff --check`, and post-fix Chrome Accessibility Tree verification cover the stable-name/pressed-state contract.

## 0.9.15 — 2026-09-12

### Fixed

- The desktop sidebar brand toggle now keeps its accessible action name and visible tooltip synchronized with the action it will perform: “Collapse sidebar” while expanded and “Expand sidebar” while collapsed. Previously Chrome exposed the visible brand text “Icon Studio” as the expanded control’s accessible name, then fell back to the `title` only after collapse, so the announced purpose changed inconsistently across states.

### Validation

- Pre-fix Google Chrome 153 at 1440×900 exposed the expanded toggle as `name="Icon Studio"`, `expanded=true`, with no `aria-label`; after collapse it became `name="Expand sidebar"` only through the `title` fallback. Focused DOM regression, `npm run typecheck`, full `npm test`, `npm run build`, and `git diff --check` pass. Post-fix Chrome verifies `Collapse sidebar` → `Expand sidebar` → `Collapse sidebar` in the Accessibility Tree with matching `aria-expanded`/tooltip state and zero runtime exceptions.

## 0.9.14 — 2026-09-12

### Fixed

- The theme icon button now keeps its accessible action name and visible tooltip synchronized with the theme it will switch to. In light mode both say “Switch to dark theme”; after switching to dark mode both say “Switch to light theme”. Previously `aria-label` updated correctly but the `title` tooltip remained the stale generic “Toggle dark theme”.

### Validation

- Pre-fix real Chromium reproduced the mismatch: light mode exposed `aria-label="Switch to dark theme"` with `title="Toggle dark theme"`, and after activation dark mode exposed `aria-label="Switch to light theme"` while the title still remained unchanged. Focused DOM regression, `npm run typecheck`, full `npm test`, `npm run build`, `git diff --check`, and post-fix real Chromium action/tooltip verification cover the fix.

## 0.9.13 — 2026-09-12

### Fixed

- The desktop inspector collapse/expand icon button now keeps its accessible name and tooltip synchronized with the action it will perform. After collapsing the inspector it announces “Expand inspector”; after expanding it returns to “Collapse inspector”. Previously the visual chevron reversed but the button continued to announce “Collapse inspector” in both states.

### Validation

- Pre-fix real Chrome at 1440×900 confirmed the desktop toggle stayed visible and retained `aria-label="Collapse inspector"` after the inspector entered `inspector-collapsed`. Focused DOM regression, `npm run typecheck`, full `npm test`, `npm run build`, `git diff --check`, and post-fix real Chrome action-label verification cover the fix.

## 0.9.12 — 2026-09-12

### Fixed

- Runtime CacheStorage now keeps at most 256 app-asset entries. The service worker trims oldest insertion-ordered runtime assets during activation and after successful cache refreshes, preventing obsolete hashed JS/CSS bundles from accumulating across repeated deployments. The fixed offline root/index shell and manifest are excluded from the eviction set.

### Validation

- Pre-fix deterministic reproduction on `v0.9.11` simulated 140 hashed JS/CSS deployments and retained all **280** runtime entries, including the very first bundle. Focused service-worker regression verifies activation and post-refresh trimming preserve only the newest 256 runtime entries while keeping shell/manifest entries; `npm run typecheck`, full `npm test`, `npm run build`, `git diff --check`, and real Chrome CacheStorage overflow verification cover the fix.

## 0.9.11 — 2026-09-12

### Fixed

- Service-worker runtime caching is now limited to canonical Icon Studio asset namespaces (`assets/`, `data/`, `icons/`, `icons-pwa/`, and the manifest) with query-free URLs. Cache-busting query variants, arbitrary same-scope requests, and same-origin resources outside the application scope bypass CacheStorage instead of creating persistent entries. The cache generation is bumped to `icon-studio-v3` so broad pre-fix runtime entries are evicted on activation.

### Validation

- Pre-fix deterministic reproduction on `v0.9.10` showed three query variants of one asset, an arbitrary same-scope API-like URL, and an out-of-scope same-origin URL all being intercepted and written as distinct runtime cache keys. Focused service-worker boundary regression, `npm run typecheck`, full `npm test`, `npm run build`, `git diff --check`, and real Chrome cache-boundary verification cover the fix.

## 0.9.10 — 2026-09-12

### Fixed

- Service-worker activation now removes only obsolete CacheStorage names owned by Icon Studio (`icon-studio-*`). Previously activation deleted every named cache except the current Icon Studio cache, which could erase offline/runtime caches belonging to unrelated applications hosted on the same origin.

### Validation

- Pre-fix deterministic reproduction on `v0.9.9` showed activation deleting both an obsolete Icon Studio cache and unrelated same-origin cache names. Focused service-worker ownership regression, `npm run typecheck`, full `npm test`, `npm run build`, `git diff --check`, and real Chrome cache-preservation verification cover the fix.

## 0.9.9 — 2026-09-12

### Fixed

- Service-worker stale-while-revalidate asset refreshes now extend the active `FetchEvent` with `waitUntil()` until both the network fetch and cache write settle. Cached assets still return immediately, but browsers can no longer terminate an idle worker before the background cache update finishes. Cache-write failures remain best-effort and never replace a successful network response.

### Validation

- Pre-fix deterministic service-worker reproduction returned a cached asset while the refresh network request was still pending and recorded **0** `waitUntil()` lifetime promises. Focused lifecycle regression, `npm run typecheck`, full `npm test`, `npm run build`, `git diff --check`, and real Chrome stale-while-revalidate verification pass.

## 0.9.8 — 2026-09-12

### Fixed

- Service-worker navigation caching no longer lets a failed, non-HTML, or unrelated navigation replace the known-good cached `index.html` offline fallback. Only a successful HTML response for the actual app-shell path may refresh that fallback. The cache generation is bumped to `icon-studio-v2` so any pre-fix entry is evicted during activation.

### Validation

- Pre-fix real Chrome reproduced the bug: after a controlled app loaded with cached `index.html` status 200, navigating to a same-scope 404 changed that cached fallback to status 404 containing the 404 sentinel. Focused service-worker regression, `npm run typecheck`, full `npm test`, `npm run build`, `git diff --check`, and post-fix real Chrome cache/offline checks pass.

## 0.9.7 — 2026-09-12

### Security

- Removed `frame-ancestors 'none'` from the meta-delivered CSP because the CSP specification does not support that directive in `<meta>` policies; keeping it there created a false anti-framing guarantee.
- Added an early static-host anti-framing fallback: the app shell starts hidden, `js/anti-frame.js` reveals it only at top level, and framed documents attempt top navigation while remaining hidden if navigation is blocked. Hosts with response-header control should still send `Content-Security-Policy: frame-ancestors 'none'` (optionally `X-Frame-Options: DENY` for legacy clients).

### Validation

- Focused shell-security regression, `npm run typecheck`, full `npm test`, `npm run build`, `git diff --check`, and real Chrome top-level/cross-origin-frame checks pass. Live GitHub Pages response-header inspection confirms the current static host does not send CSP or X-Frame-Options headers, so the fallback closes a real gap rather than duplicating an active server control.

## 0.9.6 — 2026-09-12

### Fixed

- Full-preview Escape handling now respects layered modal interaction on mobile/tablet. When the native preview dialog is open above the inspector drawer, the first Escape is left to the dialog's native cancel behavior and closes only that topmost modal; the underlying inspector remains open until it is dismissed separately. Previously the document-level Escape handler closed the inspector and preview in the same keypress.

### Validation

- Pre-fix real headless Chrome at 390×844 reproduced one Escape changing both `previewDialog.open` and `inspector-open` from true to false. Focused regression, `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` pass; post-fix production Chrome verifies the first Escape closes only the preview while the inspector remains open, and a second Escape then closes the inspector.

## 0.9.5 — 2026-09-12

### Fixed

- The Icon categories toolbar now follows composite keyboard-navigation semantics instead of placing all 11 category buttons in the page Tab sequence. The active category is the toolbar's single initial tab stop; Left/Right Arrow wrap focus between categories, and Home/End move to the first/last category without changing the selected filter until the focused button is activated.

### Validation

- Pre-fix real headless Chrome confirmed all 11 category buttons had `tabIndex=0`, the Accessibility Tree exposed `role=toolbar`, and ArrowRight left focus on `All`. Focused regression, `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` pass; post-fix Chrome verification confirms one toolbar tab stop, ArrowLeft/ArrowRight/Home/End roving focus, selection remaining unchanged during navigation, and normal activation updating the selected category while retaining focus on the re-rendered active chip.

## 0.9.4 — 2026-09-11

### Fixed

- Catalogue search/filter updates now use one concise result-count live region. `resultsSummary` is a `status` with polite, atomic announcements, while the surrounding results header and interactive icon grid are no longer live regions. This prevents one filter action from scheduling both the result summary and a full card-grid rebuild for assistive-technology announcement.

### Validation

- Pre-fix real headless Chrome confirmed both the results header and icon grid exposed `live=polite`; typing `invoice` rebuilt the grid from 24 cards to 4 while both live regions mutated. Focused regression, `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` pass; post-fix Chrome Accessibility Tree verification confirms only `resultsSummary` exposes `role=status`, `live=polite`, `atomic=true`, while search still renders the expected 4 invoice matches.

## 0.9.3 — 2026-09-11

### Fixed

- Mobile/tablet inspector drawers opened from catalogue card controls now restore keyboard focus to the corresponding re-rendered card control when closed. Previously both card Select and “More export options” flows restored focus to the unrelated topbar inspector button because `openInspector()` always recorded that button as the trigger. Non-catalogue flows keep the existing topbar fallback when no stable visible trigger is supplied.

### Validation

- Reproduced the pre-fix issue in real headless Chrome at 390×844: opening Invoice via its “More export options” button and closing the inspector moved focus to `mobileInspectorButton` even though the replacement Invoice More button still existed. Focused regression, `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` pass; post-fix real Chrome verifies both Select and More flows return focus to their corresponding Invoice card controls.

## 0.9.2 — 2026-09-11

### Fixed

- Drawer focus restoration now runs only when a mobile navigation or inspector drawer actually transitions from open to closed. Repeated `Escape` presses or close calls while no drawer is open no longer steal focus back to a stale trigger from an earlier drawer session. The consumed restore target is cleared after focus returns.

### Validation

- Reproduced the pre-fix bug in real headless Chrome at 390×844: after opening/closing navigation, focusing catalogue search, then pressing `Escape` with no drawer open moved focus from `searchInput` to `mobileMenuButton`. Focused regression, `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` pass; post-fix real Chrome mobile/tablet checks confirm no-drawer `Escape` preserves current focus while genuine drawer close still restores its trigger.

## 0.9.1 — 2026-09-11

### Fixed

- Advanced filters now follow the disclosure accessibility contract: the trigger identifies `advancedFilter` with `aria-controls`, keeps `aria-expanded` synchronized with visibility, and changes its accessible action label between “Show advanced filters” and “Hide advanced filters”.

### Validation

- Focused disclosure semantics regression, `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` pass; real headless Chrome verification confirms the live button/panel relationship and synchronized expanded state/action label across open and close interactions.

## 0.9.0 — 2026-09-11

### Added

- Added 10 ERP outline icons: `material-request`, `serial-number`, `item-master`, `trial-balance`, `shipment`, `expense-claim`, `customer-payment`, `supplier-payment`, `invoice-verification`, and `depreciation`.
- Expanded the catalogue from 110 to 120 icons and the ERP category from 46 to 56 icons. The outline count is now 111; filled remains 9. All new assets use canonical 24px SVG roots, geometry-free registry metadata, and sequential sort orders 1110–1200.

### Validation

- Focused collision/metadata checks, `npm run typecheck`, `npm test`, `npm run validate`, `npm run build`, and `git diff --check` pass. Real headless Chrome against the production `dist/` build reports 120 total icons and successfully searches, selects, and renders all 10 new ERP icons via representative aliases with zero relevant console or network errors.

## 0.8.1 — 2026-09-11

### Fixed

- Catalogue startup now remains functional in browsers without `IntersectionObserver`; previews use their existing fallback and the manual “Load more icons” control remains available.

### Validation

- Focused observer compatibility regression, `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` pass.

## 0.8.0 — 2026-09-11

### Added

- Added 10 high-value ERP outline icons: `supplier-invoice`, `accounts-payable`, `accounts-receivable`, `sales-return`, `purchase-return`, `cycle-count`, `stock-adjustment`, `quality-inspection`, `fixed-asset`, and `payroll`.
- Expanded the catalogue from 100 to 110 icons and the ERP category from 36 to 46 icons. All new assets use the canonical `0 0 24 24` viewBox, `currentColor`, geometry-free registry metadata, and the standard 1.5 outline stroke.

### Validation

- Focused registry/SVG validation, `npm run typecheck`, `npm test`, `npm run validate`, `npm run build`, and `git diff --check` pass. Real headless Chrome against the production `dist/` build reports 110 total icons and successfully searches, selects, and renders all 10 new ERP icons via representative aliases with zero relevant console or network errors.

## 0.7.33 — 2026-09-11

### Fixed

- The Node/build-time SVG validator now rejects a literal `<` in XML character data instead of silently skipping it during regex tag scanning. This matches Chromium XML parsing while preserving valid element markup, `&lt;`, literal `>`, comments, and CDATA.

### Validation

- Focused XML/SVG policy regression, `npm run typecheck`, `npm test`, `npm run validate`, `npm run build`, and `git diff --check` pass; a real Chrome `sanitizeSvgText()` differential confirms raw `<` cases reject while `&lt;`, literal `>`, comments, and CDATA controls remain accepted.

## 0.7.32 — 2026-09-11

### Fixed

- The Node/build-time SVG validator now enforces XML comment grammar instead of treating every `<!-- ... -->` boundary as valid. Comment bodies containing the forbidden internal `--` sequence are rejected in parity with Chromium `DOMParser`, while normal comments, empty comments, and legal single-hyphen content remain accepted.

### Validation

- Focused comment-grammar regressions cover invalid internal/triple-hyphen comments and valid normal/empty/single-hyphen controls.
- `npm run typecheck`, `npm test`, `npm run validate`, `npm run build`, `git diff --check`, and real Chrome parser/sanitizer differential checks pass.

## 0.7.31 — 2026-09-11

### Fixed

- Browser and Node/build SVG validation now share strict XML declaration grammar. Only declarations with canonical lower-case pseudo-attribute names, an XML 1.x version token, an optional syntactically valid encoding name, and an optional `yes`/`no` standalone field in XML-defined order are accepted; malformed, misplaced, mis-cased, version-2.x, reversed-order, and unknown-field declarations are rejected consistently with Chromium `DOMParser`.

### Validation

- Focused XML declaration regressions cover malformed declarations plus canonical quoting, XML 1.x versions, encoding names, standalone values, placement, field case, and ordering; `npm run typecheck`, `npm test`, `npm run validate`, `npm run build`, and `git diff --check` pass.
- Real Chromium differential validation covers the same declaration matrix against both `DOMParser` and the browser `sanitizeSvgText()` path.

## 0.7.30 — 2026-09-11

### Fixed

- Browser and Node/build SVG validation now require exact canonical XML element and attribute spellings. Case variants such as `PATH`, `D`, `FILL`, `clippath`, and `clippathunits` are rejected, while case-insensitive security checks remain unchanged. `tools/convert-svg.mjs` keeps accepting normalized arbitrary-input case but now rewrites allowed names to canonical spellings (for example `CLIPPATH` → `clipPath`) so converted output still passes the stricter validator.

### Validation

- Focused canonical-name regressions cover valid `path`/`d`/`fill` and `clipPath`/`clipPathUnits` spellings, rejected case variants, and converter canonicalization; `npm run typecheck`, `npm test`, `npm run validate`, `npm run build`, and `git diff --check` pass.
- Real Chrome validation calls `sanitizeSvgText()` directly: canonical `path`/`clipPath` inputs pass, `PATH`/`D`/`FILL`/`clippath`/`clippathunits` variants fail, and the existing `stripDimensions` exception still removes uppercase root dimensions safely.

## 0.7.29 — 2026-09-11

### Fixed

- The browser SVG sanitizer now treats root `width`/`height` names case-insensitively for the canonical no-fixed-dimensions rule, so XML case variants such as `WIDTH`, `HEIGHT`, and mixed-case forms can no longer bypass runtime validation. Import flows using `stripDimensions` remove those variants by their actual XML attribute names, while child shape dimensions remain allowed.

### Validation

- Focused shared-policy regression, `npm run typecheck`, `npm test`, `npm run validate`, `npm run build`, `git diff --check`, and real Chrome sanitizer differential all pass.

## 0.7.28 — 2026-09-11

### Fixed

- The Node/build-time SVG validator now treats the canonical root `viewBox` and `xmlns` attribute names as case-sensitive, matching XML/Chromium behavior instead of accepting `viewbox`, `VIEWBOX`, or `XMLNS` as equivalents.

### Validation

- Focused Node regression, `npm run typecheck`, `npm test`, `npm run validate`, `npm run build`, `git diff --check`, and real Chromium sanitizer differential all pass.

## 0.7.27 — 2026-09-11

### Fixed

- The Node/build-time SVG validator now rejects raw code points outside the XML 1.0 legal character ranges, matching Chromium XML parsing in character data, quoted attributes, comments, and CDATA while preserving legal controls and ranges.

### Validation

- `npm run typecheck`, `npm test`, `npm run validate`, `npm run build`, and `git diff --check` pass.
- Real Chrome differential validation against `sanitizeSvgText()` passes for illegal and legal raw XML characters in text/attributes, plus invalid and valid comment/CDATA cases.

## 0.7.26 — 2026-09-11

### Fixed

- The Node/build-time SVG validator now enforces exactly one top-level XML document element. Two consecutive `<svg>` roots are rejected like browser `DOMParser`, while a legitimate nested `<svg>` remains valid.

### Validation

- `npm run typecheck`, `npm test`, `npm run validate`, `npm run build`, `git diff --check`, and real Chromium differential checks pass.

## 0.7.25 — 2026-09-11

### Fixed

- The Node/build-time SVG validator now rejects malformed, unknown, unterminated, and illegal XML character references in text and quoted attributes, matching browser XML parsing while preserving literal comments and CDATA.

### Validation

- `npm run typecheck`, `npm test`, `npm run validate`, `npm run build`, `git diff --check`, and real Chromium differential checks pass.

## 0.7.24 — 2026-09-11

### Fixed

- The Node/build-time SVG validator now validates XML element nesting with an explicit tag stack. Missing, mismatched, out-of-order, and extra closing tags are rejected like browser `DOMParser`, while valid self-closing SVG elements remain accepted.

### Validation

- `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` pass.
- Real Chromium and Node differential checks agree on valid nesting, missing/mismatched/out-of-order/extra closing tags, and self-closing child elements.

## 0.7.23 — 2026-09-11

### Fixed

- The Node/build-time SVG validator now enforces XML attribute syntax instead of silently ignoring malformed attributes. Duplicate attributes, unquoted values, bare attributes, broken separators, and unterminated quoted values are rejected like browser `DOMParser`, while valid quoted values containing `>` remain accepted.

### Validation

- `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` pass.
- Real Chromium and Node differential checks agree on duplicate/unquoted/bare attribute rejection and valid quoted-value acceptance.

## 0.7.22 — 2026-09-11

### Fixed

- The Node/build-time SVG validator now accepts complete XML comments before the root `<svg>`, including multiple comments and comments after the standard XML declaration, matching browser `DOMParser` behavior. Unterminated leading comments remain invalid.

### Validation

- `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` pass.
- Real Chromium and Node differential checks confirm complete leading comments are accepted by both paths, while an unterminated leading comment is rejected by both.

## 0.7.21 — 2026-09-11

### Fixed

- The Node/build-time SVG validator now rejects a stray `]]>` CDATA close delimiter in normal character data, matching browser `DOMParser` XML parsing. The same sequence remains valid inside quoted attribute values and complete CDATA sections.

### Validation

- `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` pass.
- Real Chromium and Node differential checks confirm stray character-data `]]>` is rejected by both, while quoted-attribute and complete-CDATA cases remain accepted.

## 0.7.20 — 2026-09-11

### Fixed

- The Node/build-time SVG validator no longer treats tag-like text inside complete XML comments or CDATA sections as active SVG markup. Inert `<script>` / `<image>` text now matches browser `DOMParser` behavior, while real forbidden elements remain rejected.

### Validation

- `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` pass.
- Differential checks confirm Chromium accepts the inert comment/CDATA payloads and rejects real `script` / `image` elements; the Node validator now produces the same allow/deny outcomes.

## 0.7.19 — 2026-09-11

### Fixed

- SVG validation now rejects namespace switching below the canonical root. Allowlisted names such as `g`, `path`, and nested `svg` must also belong to `http://www.w3.org/2000/svg`; foreign default namespaces can no longer pass merely by reusing an allowed local element name.

### Validation

- `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` pass.
- Real Chromium and the Node build validator both reject foreign-namespace `g`, `path`, and nested `svg` payloads while the normal canonical SVG remains valid.

## 0.7.18 — 2026-09-11

### Fixed

- Browser and build-time SVG validation now share the same XML processing-instruction policy. A standard `<?xml ...?>` declaration remains accepted, while `xml-stylesheet` and custom processing instructions are rejected before sanitization/build validation can diverge.

### Validation

- `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` pass.
- Real Chromium and Node differential checks confirm XML declarations are accepted by both paths, while external stylesheet and in-document custom processing instructions are rejected by both.

## 0.7.17 — 2026-09-11

### Fixed

- The Node/build-time SVG validator now decodes XML character references in attribute values before applying external-reference rules. Encoded dangerous protocols such as `jav&#x61;script:` and encoded external URLs can no longer bypass CI/build validation while the browser sanitizer rejects the decoded value.

### Validation

- `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` pass.
- Real Chromium confirms `DOMParser` decodes `jav&#x61;script:` and the browser sanitizer rejects it as an external reference. Before this fix the Node checker returned `ok: true`; after the fix both browser and build-time paths reject the same payload, while encoded local fragment references remain allowed.

## 0.7.16 — 2026-09-11

### Fixed

- Direct IndexedDB v1→v3 upgrades now remove each successfully migrated legacy upload row from the obsolete `uploaded-icons` store inside the same versionchange transaction. Mixed databases therefore keep incomplete/raw rows for possible recovery without retaining duplicate copies of every valid SVG that was already migrated to the metadata/asset stores.

### Validation

- `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` pass.
- Real Chromium first reproduces the previous mixed-upgrade state: one valid row is migrated but remains duplicated in `uploaded-icons` beside one incomplete row. Against the fix, the valid row exists only in the current metadata/asset stores, the incomplete row remains in `uploaded-icons`, and the valid upload stays visible.

## 0.7.15 — 2026-09-11

### Fixed

- IndexedDB upgrades now retire the obsolete v1 `uploaded-icons` object store after confirming every legacy ID already has both current metadata and SVG-asset counterparts. The v3 cleanup never replays stale legacy values over newer v2 records, and keeps the old store if any counterpart is missing.

### Validation

- `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` pass.
- Real Chromium v1→v2 reproduction confirms the old store previously survived alongside duplicated metadata/assets. A seeded v2 database upgraded to v3 removes the legacy store when all pairs exist, preserves newer v2 metadata/assets unchanged, and keeps the legacy store when a counterpart is missing.

## 0.7.14 — 2026-09-11

### Fixed

- Uploaded-icon startup no longer hides valid IndexedDB uploads when best-effort metadata-orphan cleanup cannot open a write transaction. Valid metadata/asset pairs are returned after a successful read even if the cleanup write must be deferred to a later startup.

### Validation

- `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` pass.
- Real Chromium regression first reproduces the previous failure by forcing only IndexedDB `readwrite` transactions to fail: a valid paired upload was incorrectly reduced to an empty result. Against the fix, the same simulated cleanup-write failure still returns the valid paired upload while leaving the metadata orphan in place for a future retry.

## 0.7.13 — 2026-09-11

### Fixed

- IndexedDB reconciliation now removes metadata-only uploaded-icon orphans when their SVG asset is already missing, preventing invisible stale metadata from accumulating indefinitely. Asset-only orphans are deliberately preserved because they still contain user-authored SVG bytes and may be recoverable later.

### Validation

- `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` pass.
- Real Chromium verification seeds one valid pair, one metadata-only orphan and one asset-only orphan: startup removes only the metadata orphan, keeps the asset-only SVG bytes intact, registers only the valid upload, and the normal built-in catalogue remains healthy.

## 0.7.12 — 2026-09-11

### Fixed

- Persisted and legacy uploaded-icon records can no longer replace canonical built-in icons when their IDs collide. Runtime registration now gives built-in SSOT metadata/assets precedence before any uploaded record is cached or exposed.

### Validation

- `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` pass.
- Real Chromium regression starts from a fresh profile containing two legacy records: one colliding with built-in `invoice` and one safe `legacy-safe` upload. The canonical Invoice remains selected as a built-in (`Files · Outline`), the safe upload is still registered/searchable, the catalogue reports 101 total icons with exactly one uploaded icon, and migration completes normally.

## 0.7.11 — 2026-09-11

### Fixed

- Legacy uploaded-icon migration no longer deletes records beyond its 50-item safety batch. Successful records are removed from the legacy payload, deferred records remain for the next startup, and failed records are retained for retry. Migration is marked complete only when no legacy records remain.

### Validation

- `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` pass.
- Regression coverage verifies a 51-record legacy payload migrates 50 records in the first pass, retains record 51 without setting the completion marker, then migrates the final record on the next pass. It also verifies failed records remain while successful peers are removed.
- Real Chromium verification uses a fresh browser profile with 51 legacy uploads and confirms the first startup retains record 51 in legacy storage rather than deleting it; a second startup migrates it, removes the exhausted legacy payload, and sets the migration marker to `done`.

## 0.7.10 — 2026-09-11

### Fixed

- Persisted uploaded SVG records are now revalidated before their metadata is registered. Assets accepted by an older sanitizer policy but rejected by the current policy no longer reappear as broken catalogue entries after reload. Rendering continues to revalidate uploaded assets as defence in depth.

### Validation

- `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` pass.
- Real Chromium regression verifies an invalid persisted upload containing a forbidden `<script>` is not registered as icon metadata, while a valid persisted upload is registered and loadable. The normal catalogue still starts with `Showing 24 of 100`.

## 0.7.9 — 2026-09-11

### Fixed

- Browser SVG sanitization now rejects `DOCTYPE` declarations before `DOMParser` runs. This prevents untrusted internal entity declarations from being parsed or expanded and closes a runtime/build-time policy gap where the browser accepted DTD-bearing SVG while the Node validator rejected it.

### Validation

- `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` pass.
- Real Chromium verification reproduces the previous behavior and confirms the fix: a canonical SVG remains accepted, while both a plain `DOCTYPE` SVG and an internal-entity `DOCTYPE` SVG return `SVG doctype is forbidden.` before XML parsing.

## 0.7.8 — 2026-09-11

### Fixed

- The catalogue search field now has a meaningful accessible name (`Search icons by name, keyword or ERP term`). The visible `/` keyboard shortcut hint is explicitly decorative for assistive technology instead of becoming the field's entire accessible name.

### Validation

- `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` pass.
- Real Chromium Accessibility Tree verification reproduces the previous defect (`searchbox` name was `/`) and confirms the fix exposes `Search icons by name, keyword or ERP term`; typing `invoice` still filters the catalogue normally.

## 0.7.7 — 2026-09-11

### Fixed

- Catalogue density controls now expose their mutually-exclusive Grid/Compact selection with `aria-pressed`, and the accessibility state stays synchronized with the existing visual state and persisted density preference.

### Validation

- `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` pass.
- Real Chromium verification confirms the active density button exposes `pressed=true` in the Accessibility Tree, the inactive button exposes `pressed=false`, clicking Compact swaps both visual and accessibility state, and a reload preserves the selected state.

## 0.7.6 — 2026-09-10

### Fixed

- Generated SVG/JSX/CSS code tabs now follow the WAI-ARIA tab pattern: the tablist has an accessible name, tabs control a labelled tabpanel, only the active tab is in the normal Tab sequence, and Arrow Left/Right plus Home/End move focus and selection.

### Validation

- `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` pass.
- Real Chromium verification confirms the tablist/tabpanel relationships, roving `tabindex`, ArrowRight/ArrowLeft wrapping, Home/End navigation, selected-state updates, focus movement, and generated-code content switching.

## 0.7.5 — 2026-09-10

### Fixed

- The browser upload sanitizer now requires the canonical SVG namespace (`http://www.w3.org/2000/svg`), matching the build-time validator and preventing namespace policy drift for uploaded assets.

### Validation

- `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` pass.
- Real Chromium verification calls the browser `sanitizeSvgText()` directly: a valid canonical SVG is accepted, while both a missing `xmlns` and an incorrect namespace are rejected with `SVG namespace is required.`
- Regression coverage now explicitly checks the build-time policy rejects both missing and incorrect namespaces, keeping both validation paths aligned.

## 0.7.4 — 2026-09-10

### Fixed

- Mobile navigation and inspector drawers now mark non-active app regions inert while open, removing background workspace controls from the accessibility tree without affecting desktop docked panels. Inert state is restored when drawers close or the viewport crosses a drawer breakpoint.

### Validation

- `npm run typecheck`, `npm test`, and `npm run build` pass.
- Real headless Chrome verification passed at 390×844 for the navigation drawer: the workspace and inspector became `inert`, background controls/headings disappeared from Chrome's Accessibility Tree, focus stayed in the sidebar, and closing restored all regions.
- The 390×844 Brand kit → inspector transition also passed: the sidebar closed and became `inert` before the inspector received focus, preventing two simultaneously exposed drawers. At 834×1112 the inspector isolated both workspace and sidebar; at 1440×900 docked desktop panels remained non-inert with no backdrop regression.

## 0.7.3 — 2026-09-10

### Fixed

- Mobile navigation and inspector drawers now move focus into the opened drawer, keep Tab focus within it, and return focus to the trigger when closed.

### Validation

- `npm run typecheck`, `npm test`, and `npm run build` pass.
- Real Chromium verification passed at 390×844 for the navigation drawer: opening moved focus to `brandToggle`, Shift+Tab remained inside the sidebar focus cycle, and Escape closed the drawer and restored focus to `mobileMenuButton`.
- Real Chromium verification passed at 834×1112 for the inspector drawer: opening moved focus to `pinInspectorButton`, Shift+Tab wrapped to `copyCodeButton`, and Escape closed the drawer and restored focus to `mobileInspectorButton`.

## 0.7.2 — 2026-09-10

### Fixed

- The full-preview modal now has explicit `aria-labelledby` and `aria-describedby` relationships to its visible icon name and resize guidance, giving assistive technology a reliable accessible name and description.

### Validation

- Confirmed the dialog references existing, unique `h2#dialogIconName` and `p#dialogDescription` elements in `index.html`.
- `npm test`, `npm run typecheck`, `npm run build`, and `git diff --check` pass.
- Verified in real headless Chromium against the running Vite app: startup rendered `Showing 24 of 100`, and Chrome's Accessibility Tree exposed the open native dialog with computed name `Invoice`, computed description `Resize the browser to verify SVG sharpness at any scale.`, and `ignored=false`.

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
