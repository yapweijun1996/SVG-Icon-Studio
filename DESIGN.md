# Icon Studio — Design System

**Document:** `DESIGN.md`
**Status:** Living document — reflects the design system as actually shipped in `v0.7.1`, not an aspirational brief.
**Source of truth for tokens:** [`css/tokens.css`](css/tokens.css) (design-system.json is a synced machine-readable snapshot of the same values, not an independent source)
**Relationship to `components.md`:** `components.md` is the original pre-implementation design brief written before any code existed. It is kept for historical reference only — where the two disagree, this document and the current codebase win. See the note at the top of `components.md`.

---

## 1. Product identity

- **Name:** Icon Studio — SVG Icon Collection
- **Positioning:** a browse/customise/export workspace for production-ready SVG icons, aimed at ERP/back-office and general product UI use cases (see the `ERP` category, 36 of the 100 icons).
- **Feel:** professional SaaS asset-management workspace — compact, enterprise-friendly density, restrained shadows, not a marketing landing page.
- **Brand mark:** a four-point sparkle/compass path (`M12 2c.7 4.7 3.3 7.3 8 8-4.7.7-7.3 3.3-8 8-.7-4.7-3.3-7.3-8-8 4.7-.7 7.3-3.3 8-8Z`), used in the sidebar brand button and the "Brand kit" nav icon.

## 2. Design tokens (from `css/tokens.css`)

### 2.1 Light theme (default)

| Token | Value | Use |
| --- | --- | --- |
| `--accent` | `#f45b0b` | Primary brand orange — active states, selected card outline, primary buttons |
| `--accent-strong` | `#b33a00` | Darker accent for text-on-tint contexts |
| `--accent-soft` | `#fff0e8` | Tinted background for active/hover chips |
| `--accent-border` | `#ffc5a6` | Tinted border to match `--accent-soft` |
| `--success` | `#22c55e` | Status dot (icon count "live" indicator) |
| `--bg` | `#f5f7fb` | Page background |
| `--panel` | `#ffffff` | Card/sidebar/inspector surface |
| `--panel-subtle` | `#f8fafc` | Recessed surface (code panel, card actions row) |
| `--text` | `#101828` | Primary text |
| `--text-soft` | `#475467` | Secondary text |
| `--muted` | `#667085` | Tertiary text, placeholders, icon strokes on chrome |
| `--line` / `--line-strong` | `#e4e7ec` / `#d0d5dd` | Borders |
| `--focus` | `0 0 0 3px rgba(244,91,11,.22)` | Focus ring (keyboard nav) |
| `--radius-sm` / `--radius` / `--radius-lg` | `8px` / `12px` / `16px` | Corner radii by component scale |
| `--sidebar-width` | `224px` (collapsed: `76px`) | |
| `--inspector-width` | `380px` (collapsed: `68px`, hidden on mobile: `0px`) | |
| `--topbar-height` | `72px` (mobile: `64px`) | |

Font: `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.

### 2.2 Dark theme (`body[data-theme="dark"]`)

Only surface/text/line tokens repaint; `--accent` and its variants are **intentionally identical in both themes** — the brand orange does not shift with theme.

| Token | Value |
| --- | --- |
| `--bg` | `#0f141b` |
| `--panel` | `#151b24` |
| `--panel-subtle` | `#1b2330` |
| `--text` | `#f8fafc` |
| `--text-soft` | `#cbd5e1` |
| `--muted` | `#94a3b8` |
| `--line` / `--line-strong` | `#293345` / `#3a4659` |
| `--accent-soft` | `#3a1c0d` |
| `--accent-border` | `#7c3312` |

Theme is picked up from `prefers-color-scheme` on first load, then persisted explicitly (`localStorage['iconStudioTheme']`) once the user toggles it — there is currently no UI to reset back to "follow system" once overridden (see `TASK.md` backlog).

## 3. Layout

Three-column desktop shell (`.app-shell`, CSS grid: `sidebar-width | 1fr | inspector-width`):

```
┌─────────────┬──────────────────────────────┬────────────────────┐
│  Sidebar     │  Topbar                       │  Inspector header  │
│  224px       │  ────────────────────────────  │  380px             │
│  (collapses  │  Hero + toolbar + category     │  Preview           │
│  to 76px)    │  chips + icon grid + load-more  │  Appearance        │
│              │                                 │  Transform         │
│              │                                 │  Code tabs          │
└─────────────┴──────────────────────────────┴────────────────────┘
```

### Responsive breakpoints (`css/responsive.css`)

| Breakpoint | Behaviour |
| --- | --- |
| `≤1450px` | Icon grid column width narrows (`minmax(145px,1fr)`), content padding reduces |
| `≤1180px` | Inspector becomes a fixed slide-in drawer (`transform: translateX(101%)` closed / `translateX(0)` open) with a dimming backdrop; sidebar narrows to `208px` |
| `≤820px` | Sidebar becomes a fixed slide-in drawer too; topbar/toolbar padding shrinks; category chips become a single horizontally-scrollable row |
| `≤560px` | Icon grid drops to 2 columns; brand card and hero subtitle hide; topbar action labels hide (icon-only) |
| `prefers-reduced-motion: reduce` | All transitions/animations collapse to `.01ms` |

**Design rule (learned the hard way, `v0.7.1`):** any code that shows the mobile drawer + backdrop (`inspector-open` class) MUST gate on `matchMedia('(max-width: 1180px)')`. Above that width the inspector is already docked and doesn't slide — adding the class anyway shows a dimming overlay with nothing visibly happening behind it. See `shell.js`'s `openInspector()`/`closeInspector()` for the canonical pattern.

## 4. Components

| Component | Where | Notes |
| --- | --- | --- |
| Collapsible sidebar | `.sidebar` | Nav items: Icon library, Collections, Favorites, Recently viewed, Uploaded icons, Brand kit. Collapse state and pin state persist to `localStorage`. |
| Sticky topbar | `.topbar` | Import SVG, live icon-count pill, theme toggle, mobile inspector trigger |
| Search + filters | `.catalogue-toolbar` | Free-text search (`/` keyboard shortcut focuses it), style filter, sort filter, category chips (10, derived live from the registry — never hardcode a count, see ADR-011-adjacent history in `CHANGELOG.md` 0.4.0) |
| Icon grid | `.icon-grid` | Responsive `auto-fill` grid; Grid/Compact density toggle; scroll-to-load pagination (24 per page) with a manual "Load more" fallback button |
| Icon card | `.icon-card` | Lazy-loaded preview (`IntersectionObserver`, 240px lookahead), favourite star, Copy SVG action, "⋮" more-options action |
| Inspector | `.inspector` | Selected icon summary, live preview (Light/Dark/Brand/Transparent background tabs), Appearance controls (size/stroke width/stroke colour/fill toggle+colour/currentColor/include-title), Transform controls (rotate/flip), code tabs (SVG/JSX/CSS) |
| Full preview dialog | `<dialog class="preview-dialog">` | Native `<dialog>` element — free focus trap and Escape handling |
| Toast | `.toast-region` | `aria-live="polite"`, auto-dismiss after 2.8s, no stacking cap yet (see `TASK.md` backlog) |

## 5. Icon design system

Two supported styles, both on an exact `0 0 24 24` viewBox (full contract in `SPEC.md` §7):

### 5.1 Outline (91 of 100 icons)

```svg
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
```

- Standard stroke width `1.5`. Isolated, documented exceptions exist (`invoice.svg` uses `1` because `1.5` merges its currency mark into a blob at icon scale; `delivery-truck.svg` uses `stroke-linecap="butt" stroke-linejoin="miter"` to match sharp-cornered reference art) — any new exception must be similarly justified and noted in `CHANGELOG.md`, not silently introduced.
- `fill`/`stroke` are set **only on the root `<svg>`**; child shapes carry no colour attributes of their own so they inherit correctly.

### 5.2 Filled (9 of 100 icons: `purchase-order`, `delivery-order`, `ai-spark`, `purchase-requisition`, `debit-note`, `packing-list`, `pick-list`, `journal-entry`, `dashboard`)

```svg
<svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
```

- Every "stroke" is actually a filled shape with matched inner/outer contours at a constant weight of `0.73` units (measured off `purchase-order.svg`).
- A single `<path>` per icon, built from multiple `evenodd` subpaths (frame + inner cutout + badge + glyph knockout, etc.).
- **Do not hand-author new ones.** Use `tools/gen-filled-icons.mjs` — see `SPEC.md` §7.4/ADR-010 for the two failure modes (blob badges from ring-nesting, and evenodd's inability to occlude one shape behind another) discovered building the current 9.
- Because each shape carries its own `fill="currentColor"`, any code that recolours a filled icon (e.g. the Inspector's fill-colour picker) must write the resolved paint onto every descendant with a `fill` attribute, not just the root — see the `v0.6.1` fix in `CHANGELOG.md` if extending this logic.
- **Grid colour:** filled and outline icons render in the *same* colour in the catalogue grid (ADR-011) — do not reintroduce a per-style accent override without a deliberate design decision.

### 5.3 Category taxonomy (10 categories, `order` controls display sequence)

`Interface`(10) · `Arrows`(20) · `Actions`(30) · `Files`(40) · `Users`(50) · `Commerce`(60) · `Finance`(70) · `Logistics`(80) · `AI`(90) · `ERP`(100, 36 icons — the largest category, spanning procurement/inventory/finance/HR/controlling)

### 5.4 Naming/collision discipline

Before drawing a new icon, check existing geometry for visual collision (documented practice since the `v0.5.0`/`v0.6.0` ERP batches): e.g. a planned `branch` (storefront) icon was dropped because `vendor.svg` already occupies that shape; `employee.svg` was deliberately drawn as an ID badge rather than a person silhouette to avoid reading the same as `customer`/`users`/`user-add`.

## 6. Accessibility

- Interactive targets are ≥44px (`--control-height` equivalent throughout).
- `aria-live="polite"` regions: results summary, toast region.
- `aria-pressed`/`aria-expanded`/`aria-current` used correctly for toggle/disclosure/nav-active state.
- Decorative catalogue previews: `aria-hidden="true"`. Exported/semantic icon output can instead carry `<title>` + `aria-labelledby` when "Include title" is on.
- Full preview uses the native `<dialog>` element (built-in focus trap, `Escape` close) rather than a hand-rolled modal.
- `prefers-reduced-motion: reduce` is respected globally.

## 7. Security-adjacent design constraints

These aren't visual, but they constrain what any new UI feature is allowed to do — see `SPEC.md` §13 for the full requirements:

- No feature may render untrusted SVG/HTML via raw `innerHTML`; everything goes through the sanitizer.
- A Content-Security-Policy meta tag is live in `index.html` (`v0.4.0`); any new inline `<script>` or `<style>` would need a CSP change, not just a code change — treat that as a signal to reconsider the approach, not just widen the policy.
- Clipboard writes must stay user-initiated (button click), never automatic.

## 8. What's next (design-relevant)

See `ROADMAP.md` for full detail — the two items with direct design implications:

- **Command palette** (Cmd+K): would reuse the same underlying action-dispatch logic as any future WebMCP tool layer, so the two should be designed together, not separately.
- **Search relevance/highlighting**: current search is plain substring match with no ranking or highlighted match term — noted as a design gap now that the catalogue has grown to 100 icons.
