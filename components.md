# Icon Studio — SVG Icon Collection Admin Panel Components

> **Historical document.** This is the original pre-implementation design brief, written before any code existed (it still describes "at least 36 sample icons" — the catalogue has since grown to 100 across 10 categories). It is kept for historical reference only. **For the current design system, see [`DESIGN.md`](DESIGN.md)**; for current visual tokens, see [`css/tokens.css`](css/tokens.css) (the source of truth) or [`design-system.json`](design-system.json) (a synced snapshot). Where this file and the current codebase disagree, the codebase and `DESIGN.md` win.

## Design Brief

Build a polished, functional desktop-first SVG icon collection admin panel based on the approved design direction. Use vanilla HTML, CSS, and JavaScript with no CDN and no framework. The app must feel like a professional SaaS asset-management workspace rather than a landing page.

Layout: fixed three-column desktop shell with a 224px left sidebar, flexible centre catalogue, and approximately 380px sticky right inspector. Add responsive tablet and mobile layouts: sidebar becomes off-canvas, inspector becomes a slide-over/bottom sheet, catalogue remains usable without horizontal overflow.

Brand and visual style: product name "Icon Studio"; white and very light grey surfaces; dark navy text; orange accent around #f45b0b; subtle 1px borders; restrained shadows; 10–12px radius; compact enterprise-friendly density; clear typography and spacing; minimum 44px interactive targets. Avoid decorative loader patterns. Use only inline SVG for interface controls.

Left sidebar: logo and Icon Studio brand. Navigation groups with Icon library active, Collections, Favorites, Recently viewed, Uploaded icons, Brand kit. Bottom helper card titled Brand consistency with a Manage brand kit button. Desktop brand row can collapse the sidebar; preserve accessible labels.

Top bar: breadcrumb Components / Icons, Import SVG button, green stats pill such as 1,248 icons · 96 visible, theme button, compact sidebar/inspector controls.

Main content: heading "Production-ready SVG icon collection" and subtitle "Browse, customize, and export consistent SVG icons for your products and interfaces." Add a large search field, filter button, category chips All, Interface, Arrows, Actions, Files, Users, Commerce, Finance, Logistics, AI, ERP, plus Grid/Compact density control.

Catalogue: uniform responsive grid, approximately six columns on wide desktop. Create at least 36 clean sample icons, each represented by one canonical inline SVG definition with a standard 0 0 24 24 viewBox and metadata such as id, name, category, style, tags. Include Invoice, Customer, Delivery Truck, Search, Settings, Cart, Payment, AI Spark, User Add, Folder, Chart Bar, Notification, File, Download, Delete, Edit, Share, Filter, Purchase Order, Sales Order, Delivery Order, Vendor, Warehouse, Package, Receipt, Credit Card, Calendar, Clock, Home, Menu, Close, Arrow Left, Arrow Right, Check, Alert, Database. Cards show icon preview, name, category/style, favourite star, Copy SVG quick action, and overflow button. Clicking a card selects it and updates the inspector. Selected card has an orange outline. Search and category filters must work. Grid/Compact density must work. Favourites persist in localStorage. Recently viewed should update when icons are selected.

Right inspector: title Icon inspector with pin, collapse and close controls. Show selected icon name, category and style; large live preview; background tabs Light, Dark, Brand, Transparent. Controls: size slider with pixel value, stroke width select, stroke colour picker, optional fill colour/toggle, Use currentColor checkbox enabled by default, Include title checkbox, rotate, horizontal flip, vertical flip, reset. Changes must update both the large preview and generated SVG code. Add Open full preview and Copy SVG actions. Code tabs SVG, JSX and CSS; display syntax-like formatted code and support copy. Include accessibility logic: when Include title is enabled, output title and aria-labelledby; otherwise output aria-hidden for decorative use.

Interactions and quality: working search, chips, selection, inspector customization, favourite toggle, copy-to-clipboard feedback, theme/background preview modes, sidebar collapse, inspector collapse, keyboard focus, Escape handling for mobile overlays, responsive layout, no console errors, no horizontal overflow, and prefers-reduced-motion support. Add a lightweight toast system. Add pagination or a visible count and Load more behaviour. Keep all data local and dependency-free.

## Tokens

```json
{
  "primary": "#f45b0b",
  "accent": "#ff7a33",
  "background": "#f6f8fb",
  "text": "#111827",
  "panel": "#ffffff",
  "muted": "#66736f",
  "line": "#dce3df",
  "radius": 12,
  "spacing": 12,
  "controlHeight": 36
}
```

## Components

- `collapsible-sidebar`: generated as an editable HTML/CSS component with stable class names and responsive constraints.
- `sticky-top-bar`: generated as an editable HTML/CSS component with stable class names and responsive constraints.
- `search-and-category-filters`: generated as an editable HTML/CSS component with stable class names and responsive constraints.
- `responsive-svg-icon-grid`: generated as an editable HTML/CSS component with stable class names and responsive constraints.
- `icon-cards`: generated as an editable HTML/CSS component with stable class names and responsive constraints.
- `favorites-and-recent-views`: generated as an editable HTML/CSS component with stable class names and responsive constraints.
- `sticky-icon-inspector`: generated as an editable HTML/CSS component with stable class names and responsive constraints.
- `live-svg-preview`: generated as an editable HTML/CSS component with stable class names and responsive constraints.
- `customization-controls`: generated as an editable HTML/CSS component with stable class names and responsive constraints.
- `svg-jsx-css-code-tabs`: generated as an editable HTML/CSS component with stable class names and responsive constraints.
- `copy-toast`: generated as an editable HTML/CSS component with stable class names and responsive constraints.
- `responsive-overlays`: generated as an editable HTML/CSS component with stable class names and responsive constraints.

## Reference Images

- None supplied.
