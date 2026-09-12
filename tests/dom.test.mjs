import assert from 'node:assert/strict';
import fs from 'node:fs';
import { slugify } from '../js/core/dom.js';

// Browser-dependent DOM helpers still require a real `document` global, which
// this zero-dependency project intentionally does not polyfill in Node. Static
// accessibility contracts in index/app source are safe to regression-test here.

assert.equal(slugify('Purchase Order'), 'purchase-order');
assert.equal(slugify('  Delivery_Order!! '), 'delivery-order');
assert.equal(slugify('already-a-slug'), 'already-a-slug');
assert.equal(slugify('---leading-and-trailing---'), 'leading-and-trailing');
assert.equal(slugify(''), '');


const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
const shellSource = fs.readFileSync(new URL('../js/features/shell.js', import.meta.url), 'utf8');
const themeSource = fs.readFileSync(new URL('../js/features/theme.js', import.meta.url), 'utf8');
const catalogueSource = fs.readFileSync(new URL('../js/features/catalogue.js', import.meta.url), 'utf8');
const inspectorSource = fs.readFileSync(new URL('../js/features/inspector.js', import.meta.url), 'utf8');
const filterButtonTag = html.match(/<button\b[^>]*id="filterButton"[^>]*>/)?.[0] || '';
const filterHandlerStart = appSource.indexOf("refs.filterButton.addEventListener('click'");
const filterHandler = filterHandlerStart >= 0 ? appSource.slice(filterHandlerStart, filterHandlerStart + 650) : '';

assert.match(filterButtonTag, /aria-expanded="false"/, 'advanced-filter button should expose collapsed state initially');
assert.match(filterButtonTag, /aria-controls="advancedFilter"/, 'advanced-filter button should identify its controlled panel');
assert.match(html, /id="advancedFilter"/, 'advanced-filter aria-controls target should exist');
assert.match(filterHandler, /setAttribute\('aria-expanded', String\(expanded\)\)/, 'advanced-filter expanded state should stay synchronized');
assert.match(filterHandler, /setAttribute\('aria-label', expanded \? 'Hide advanced filters' : 'Show advanced filters'\)/, 'advanced-filter accessible action label should stay synchronized');

const resultsHeaderTag = html.match(/<section\b[^>]*class="results-header"[^>]*>/)?.[0] || '';
const resultsSummaryTag = html.match(/<span\b[^>]*id="resultsSummary"[^>]*>/)?.[0] || '';
const iconGridTag = html.match(/<div\b[^>]*id="iconGrid"[^>]*>/)?.[0] || '';
assert.doesNotMatch(resultsHeaderTag, /aria-live=/, 'results header should not duplicate catalogue live announcements');
assert.match(resultsSummaryTag, /role="status"/, 'result count should be the dedicated advisory status region');
assert.match(resultsSummaryTag, /aria-live="polite"/, 'result-count status should announce updates politely');
assert.match(resultsSummaryTag, /aria-atomic="true"/, 'result-count status should announce the complete concise message');
assert.doesNotMatch(iconGridTag, /aria-live=/, 'interactive icon grid should not announce every card rebuild as a live region');

assert.match(html, /id="categoryChips" role="toolbar" aria-label="Icon categories"/, 'category controls should expose their toolbar grouping');
assert.match(catalogueSource, /tabindex: state\.category === category \? '0' : '-1'/, 'category toolbar should expose one initial tab stop');
assert.match(catalogueSource, /\['ArrowLeft', 'ArrowRight', 'Home', 'End'\]/, 'category toolbar should support directional keyboard navigation');
assert.match(catalogueSource, /chips\.forEach\(\(chip, chipIndex\) => \{ chip\.tabIndex = chipIndex === nextIndex \? 0 : -1; \}\)/, 'category toolbar should maintain roving tabindex');
assert.match(catalogueSource, /chips\[nextIndex\]\.focus\(\)/, 'category toolbar should move focus without requiring Tab through every category');
assert.match(catalogueSource, /replacement\?\.focus\(\)/, 'category activation should restore focus to the re-rendered selected chip');


const favoriteSelectedButtonTag = html.match(/<button\b[^>]*id="favoriteSelectedButton"[^>]*>/)?.[0] || '';
const favoriteCardAttributes = catalogueSource.match(/type: 'button', 'data-action': 'favorite',[\s\S]*?\n      \}/)?.[0] || '';
const favoriteInspectorUpdate = inspectorSource.match(/refs\.favoriteSelectedButton\.setAttribute\('aria-pressed'[\s\S]*?setAttribute\('aria-label'[\s\S]*?\n/)?.[0] || '';
assert.match(favoriteSelectedButtonTag, /aria-label="Favorite selected icon"/, 'selected-icon favorite toggle should have a stable initial name');
assert.match(favoriteSelectedButtonTag, /aria-pressed="false"/, 'selected-icon favorite toggle should expose its initial pressed state');
assert.match(favoriteCardAttributes, /'aria-pressed': favorite/, 'catalogue favorite toggle should expose pressed state separately from its name');
assert.match(favoriteCardAttributes, /'aria-label': `Favorite \$\{icon\.name\}`/, 'catalogue favorite toggle name should remain stable across pressed states');
assert.doesNotMatch(favoriteCardAttributes, /Remove|Add/, 'catalogue favorite toggle name should not change with pressed state');
assert.match(favoriteInspectorUpdate, /setAttribute\('aria-pressed', String\(favorite\)\)/, 'selected-icon favorite toggle should synchronize pressed state');
assert.match(favoriteInspectorUpdate, /setAttribute\('aria-label', `Favorite \$\{icon\.name\}`\)/, 'selected-icon favorite toggle name should remain stable across pressed states');
assert.doesNotMatch(favoriteInspectorUpdate, /Remove|Add/, 'selected-icon favorite toggle name should not change with pressed state');


const collapseInspectorButtonTag = html.match(/<button\b[^>]*id="collapseInspectorButton"[^>]*>/)?.[0] || '';
const inspectorCollapseSync = shellSource.match(/function syncInspectorCollapsedState\(collapsed\) \{[\s\S]*?\n  \}/)?.[0] || '';
const inspectorCollapseClick = shellSource.match(/refs\.collapseInspectorButton\.addEventListener\('click'[\s\S]*?\n  \}\);/)?.[0] || '';
assert.match(collapseInspectorButtonTag, /aria-label="Collapse inspector"/, 'desktop inspector toggle should expose its initial action');
assert.match(collapseInspectorButtonTag, /title="Collapse inspector"/, 'desktop inspector toggle should expose the same initial tooltip action');
assert.match(inspectorCollapseSync, /collapsed \? 'Expand inspector' : 'Collapse inspector'/, 'desktop inspector toggle action label should reflect collapsed state');
assert.match(inspectorCollapseSync, /setAttribute\('aria-label', actionLabel\)/, 'desktop inspector toggle should synchronize its accessible action label');
assert.match(inspectorCollapseSync, /title = actionLabel/, 'desktop inspector toggle should synchronize its tooltip action label');
assert.match(inspectorCollapseClick, /syncInspectorCollapsedState\(collapsed\)/, 'desktop inspector toggle click should refresh its action label');

const themeButtonTag = html.match(/<button\b[^>]*id="themeButton"[^>]*>/)?.[0] || '';
const themeSync = themeSource.match(/function sync\(\) \{[\s\S]*?\n  \}/)?.[0] || '';
assert.match(themeButtonTag, /aria-label="Switch to dark theme"/, 'theme toggle should expose a concrete initial action');
assert.match(themeButtonTag, /title="Switch to dark theme"/, 'theme toggle initial tooltip should match its action');
assert.match(themeSync, /const actionLabel = `Switch to \${body\.dataset\.theme === 'dark' \? 'light' : 'dark'} theme`/, 'theme toggle action should derive from the active theme');
assert.match(themeSync, /setAttribute\('aria-label', actionLabel\)/, 'theme toggle should synchronize its accessible action name');
assert.match(themeSync, /title = actionLabel/, 'theme toggle should synchronize its visible tooltip action');

const restoreFocusHelper = shellSource.match(/function restoreDrawerFocus\(\) \{[\s\S]*?\n  \}/)?.[0] || '';
const sidebarCollapseSync = shellSource.match(/function syncCollapsedState\(collapsed\) \{[\s\S]*?\n  \}/)?.[0] || '';
const closeSidebarSource = shellSource.match(/function closeSidebar\(\) \{[\s\S]*?\n  \}/)?.[0] || '';
const closeInspectorSource = shellSource.match(/function closeInspector\(\) \{[\s\S]*?\n  \}/)?.[0] || '';
assert.match(restoreFocusHelper, /restoreFocusTarget = null/, 'drawer focus target should be consumed after restoration');
assert.match(closeSidebarSource, /const wasOpen = .*sidebar-open/, 'sidebar close should record whether it was actually open');
assert.match(closeSidebarSource, /if \(wasOpen &&/, 'sidebar close should restore focus only after a real close transition');
assert.match(closeInspectorSource, /const wasOpen = .*inspector-open/, 'inspector close should record whether its drawer was actually open');
assert.match(closeInspectorSource, /if \(wasOpen &&/, 'inspector close should restore focus only after a real close transition');
assert.match(sidebarCollapseSync, /const actionLabel = collapsed \? 'Expand sidebar' : 'Collapse sidebar'/, 'sidebar toggle action should derive from collapsed state');
assert.match(sidebarCollapseSync, /setAttribute\('aria-label', actionLabel\)/, 'collapsed sidebar toggle should retain an accessible action name');
assert.match(sidebarCollapseSync, /title = actionLabel/, 'collapsed sidebar toggle tooltip should match its action');

const openInspectorSource = shellSource.match(/function openInspector\([^)]*\) \{[\s\S]*?\n  \}/)?.[0] || '';
assert.match(openInspectorSource, /trigger = refs\.mobileInspectorButton/, 'inspector should default focus restoration to the topbar trigger');
assert.match(openInspectorSource, /openDrawer\(refs\.inspector, trigger \|\| refs\.mobileInspectorButton\)/, 'inspector should preserve a caller-provided visible trigger for focus restoration');
assert.match(appSource, /function findRenderedCardAction\(id, action\)/, 'app should resolve the replacement catalogue control after card re-render');
assert.match(appSource, /onSelect: id => selectIcon\(id, true, 'select'\)/, 'card selection should restore focus to the replacement select control');
assert.match(appSource, /shell\.openInspector\(findRenderedCardAction\(id, 'more'\) \|\| undefined\)/, 'card more action should restore focus to the replacement more control');

const escapeHandler = shellSource.match(/if \(event\.key === 'Escape'\) \{[\s\S]*?\n    \}/)?.[0] || '';
assert.match(escapeHandler, /if \(refs\.previewDialog\.open\) return;/, 'open full-preview modal should consume the first Escape layer');
assert.ok(
  escapeHandler.indexOf('refs.previewDialog.open') < escapeHandler.indexOf('closeSidebar()'),
  'modal Escape guard should run before underlying drawer close logic'
);
assert.doesNotMatch(escapeHandler, /previewDialog\.close\(\)/, 'shell should leave native dialog Escape/cancel handling to the dialog itself');

console.log('DOM, live-region, favorite/theme/inspector-toggle, modal-layer and focus accessibility tests passed.');
