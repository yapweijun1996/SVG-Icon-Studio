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
const utilitiesSource = fs.readFileSync(new URL('../css/utilities.css', import.meta.url), 'utf8');
const responsiveSource = fs.readFileSync(new URL('../css/responsive.css', import.meta.url), 'utf8');
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

const resultsTitleTag = html.match(/<h2\b[^>]*id="resultsTitle"[^>]*>/)?.[0] || '';
const emptyRecoveryHandler = appSource.match(/function recoverEmptyCatalogue\(\) \{[\s\S]*?\n  \}/)?.[0] || '';
assert.match(resultsTitleTag, /tabindex="-1"/, 'results heading should accept programmatic focus after an empty-state recovery without adding a Tab stop');
assert.match(catalogueSource, /refs\.emptyResetButton\.textContent = hasIconsInView\(state\) \? 'Reset filters' : 'Browse all icons'/, 'empty-state recovery label should distinguish hidden results from an intrinsically empty scoped view');
assert.match(emptyRecoveryHandler, /const returnToLibrary = !hasIconsInView\(state\)/, 'empty-state recovery should detect when the current scoped view contains no items at all');
assert.match(emptyRecoveryHandler, /if \(returnToLibrary\) shell\.setView\('library'\)/, 'intrinsically empty scoped views should recover to the full library');
assert.match(emptyRecoveryHandler, /refs\.resultsTitle\.focus\(\)/, 'empty-state recovery should move focus to the now-visible results heading');
assert.match(appSource, /refs\.emptyResetButton\.addEventListener\('click', recoverEmptyCatalogue\)/, 'empty-state primary action should use the context-aware recovery handler');

assert.match(html, /id="categoryChips" role="toolbar" aria-label="Icon categories"/, 'category controls should expose their toolbar grouping');
assert.match(catalogueSource, /tabindex: state\.category === category \? '0' : '-1'/, 'category toolbar should expose one initial tab stop');
assert.match(catalogueSource, /\['ArrowLeft', 'ArrowRight', 'Home', 'End'\]/, 'category toolbar should support directional keyboard navigation');
assert.match(catalogueSource, /chips\.forEach\(\(chip, chipIndex\) => \{ chip\.tabIndex = chipIndex === nextIndex \? 0 : -1; \}\)/, 'category toolbar should maintain roving tabindex');
assert.match(catalogueSource, /chips\[nextIndex\]\.focus\(\)/, 'category toolbar should move focus without requiring Tab through every category');
assert.match(catalogueSource, /replacement\?\.focus\(\)/, 'category activation should restore focus to the re-rendered selected chip');
assert.match(catalogueSource, /'data-action': 'copy', 'aria-label': `Copy \${icon\.name} SVG`/, 'catalogue copy actions should include the icon name in their accessible label');

const backgroundGroupTag = html.match(/<div\b[^>]*id="backgroundTabs"[^>]*>/)?.[0] || '';
const backgroundRadioTags = [...html.matchAll(/<button\b[^>]*role="radio"[^>]*data-background="(light|dark|brand|transparent)"[^>]*>/g)].map(match => match[0]);
assert.match(backgroundGroupTag, /role="radiogroup"/, 'preview background choices should expose one mutually-exclusive radio group');
assert.match(backgroundGroupTag, /aria-label="Preview background"/, 'preview background radio group should keep its accessible label');
assert.equal(backgroundRadioTags.length, 4, 'preview background group should expose all four choices as radios');
assert.match(backgroundRadioTags[0], /aria-checked="true"/, 'initial Light background radio should be checked');
assert.match(backgroundRadioTags[0], /tabindex="0"/, 'initial selected background radio should be the sole Tab stop');
backgroundRadioTags.slice(1).forEach(tag => {
  assert.match(tag, /aria-checked="false"/, 'inactive background radios should be unchecked');
  assert.match(tag, /tabindex="-1"/, 'inactive background radios should be removed from the Tab sequence');
});
assert.match(inspectorSource, /button\.setAttribute\('aria-checked', String\(active\)\)/, 'background radio checked state should synchronize with preview state');
assert.match(inspectorSource, /button\.tabIndex = active \? 0 : -1/, 'background radios should maintain a roving Tab stop');
assert.match(inspectorSource, /\['ArrowRight', 'ArrowDown'\]\.includes\(event\.key\)/, 'background radios should support forward Arrow navigation');
assert.match(inspectorSource, /\['ArrowLeft', 'ArrowUp'\]\.includes\(event\.key\)/, 'background radios should support reverse Arrow navigation');
assert.match(inspectorSource, /activateBackground\(backgroundButtons\[nextIndex\], \{ focus: true \}\)/, 'Arrow navigation should update selection and move focus together');


const sizeRangeControl = html.match(/<div\b[^>]*class="control-row range-control"[^>]*>[\s\S]*?<\/div>/)?.[0] || '';
const sizeRangeTag = html.match(/<input\b[^>]*id="sizeRange"[^>]*>/)?.[0] || '';
assert.match(sizeRangeControl, /<label for="sizeRange">Size<\/label>/, 'size slider should have an explicit visible label association');
assert.match(sizeRangeControl, /<output id="sizeOutput" for="sizeRange">/, 'size output should remain associated with the size slider');
assert.match(sizeRangeTag, /type="range"/, 'size control should remain a native range input');


const strokeColorTag = html.match(/<input\b[^>]*id="strokeColorInput"[^>]*>/)?.[0] || '';
const fillColorTag = html.match(/<input\b[^>]*id="fillColorInput"[^>]*>/)?.[0] || '';
assert.match(html, /id="strokeColorLabel">Stroke colour<\/span>/, 'stroke colour should keep a visible label target');
assert.match(strokeColorTag, /aria-labelledby="strokeColorLabel"/, 'stroke colour accessible name should come only from its stable visible label');
assert.match(html, /id="fillColorLabel">Fill colour<\/span>/, 'fill colour should keep a visible label target');
assert.match(fillColorTag, /aria-labelledby="fillColorLabel"/, 'fill colour accessible name should come only from its stable visible label');

const rotationRangeTag = html.match(/<input\b[^>]*id="rotationRange"[^>]*>/)?.[0] || '';
assert.match(rotationRangeTag, /aria-label="Rotation \(degrees\)"/, 'rotation slider name should include its degree unit so native numeric values are understandable');
assert.doesNotMatch(rotationRangeTag, /aria-valuetext=/, 'rotation should not rely on aria-valuetext that Chrome ignores on the native range control');

const fillToggleTag = html.match(/<input\b[^>]*id="fillToggle"[^>]*>/)?.[0] || '';
assert.match(fillToggleTag, /aria-label="Fill icon"/, 'fill toggle should keep its concise accessible name');
assert.match(fillToggleTag, /aria-describedby="fillToggleDescription"/, 'fill toggle should expose its visible helper text as an accessible description');
assert.match(html, /id="fillToggleDescription">Apply a solid fill colour\.<\/span>/, 'fill toggle description target should preserve the visible helper text');

const currentColorTag = html.match(/<input\b[^>]*id="currentColorCheckbox"[^>]*>/)?.[0] || '';
assert.match(currentColorTag, /aria-labelledby="currentColorLabel"/, 'currentColor checkbox should use only its concise visible label as the accessible name');
assert.match(currentColorTag, /aria-describedby="currentColorDescription"/, 'currentColor checkbox should expose its helper as a separate accessible description');
assert.match(html, /id="currentColorLabel">Use currentColor<\/strong>/, 'currentColor label target should preserve the visible control label');
assert.match(html, /id="currentColorDescription">Icon inherits colour from CSS\.<\/small>/, 'currentColor description target should preserve the visible helper text');

const includeTitleTag = html.match(/<input\b[^>]*id="includeTitleCheckbox"[^>]*>/)?.[0] || '';
assert.match(includeTitleTag, /aria-labelledby="includeTitleLabel"/, 'Include title checkbox should use only its concise visible label as the accessible name');
assert.match(includeTitleTag, /aria-describedby="includeTitleDescription"/, 'Include title checkbox should expose its helper as a separate accessible description');
assert.match(html, /id="includeTitleLabel">Include title<\/strong>/, 'Include title label target should preserve the visible control label');
assert.match(html, /id="includeTitleDescription">Adds an accessible SVG title\.<\/small>/, 'Include title description target should preserve the visible helper text');

const favoriteSelectedButtonTag = html.match(/<button\b[^>]*id="favoriteSelectedButton"[^>]*>/)?.[0] || '';
const favoriteCardAttributes = catalogueSource.match(/type: 'button', 'data-action': 'favorite',[\s\S]*?\n      \}/)?.[0] || '';
const favoriteInspectorUpdate = inspectorSource.match(/refs\.favoriteSelectedButton\.setAttribute\('aria-pressed'[\s\S]*?setAttribute\('aria-label'[\s\S]*?\n/)?.[0] || '';
assert.match(favoriteSelectedButtonTag, /aria-label="Favorite selected icon"/, 'selected-icon favorite toggle should have a stable initial name');
assert.match(favoriteSelectedButtonTag, /aria-pressed="false"/, 'selected-icon favorite toggle should expose its initial pressed state');
assert.match(favoriteCardAttributes, /'aria-pressed': favorite/, 'catalogue favorite toggle should expose pressed state separately from its name');
assert.match(favoriteCardAttributes, /'aria-label': `Favorite \$\{icon\.name\}`/, 'catalogue favorite toggle name should remain stable across pressed states');
assert.doesNotMatch(favoriteCardAttributes, /Remove|Add/, 'catalogue favorite toggle name should not change with pressed state');
assert.match(catalogueSource, /const restoreFocus = document\.activeElement === action/, 'catalogue favorite activation should detect whether the replaced action owned focus');
assert.match(catalogueSource, /const cardIndex = \[\.\.\.refs\.iconGrid\.querySelectorAll\('\.icon-card'\)\]\.indexOf\(card\)/, 'catalogue favorite activation should remember the removed card position before the rebuild');
assert.match(catalogueSource, /restoreFocus && !focusRenderedCardAction\(icon\.id, 'favorite'\)/, 'catalogue favorite activation should prefer the same rendered action when it still exists');
assert.match(catalogueSource, /focusFavoriteRemovalFallback\(cardIndex\)/, 'catalogue favorite activation should use a positional fallback when Favorites filtering removes the focused card');
assert.match(catalogueSource, /function focusRenderedCardAction\(iconId, actionName\)[\s\S]*?return renderedAction/, 'catalogue focus restoration should report whether the matching rendered card action still exists');
const favoriteRemovalFallback = catalogueSource.match(/function focusFavoriteRemovalFallback\(cardIndex\) \{[\s\S]*?\n  \}/)?.[0] || '';
assert.match(favoriteRemovalFallback, /Math\.max\(0, Math\.min\(cardIndex, cards\.length - 1\)\)/, 'favorite removal fallback should keep the same list position or move to the previous item when the removed card was last');
assert.match(favoriteRemovalFallback, /querySelector\('\[data-action=\"favorite\"\]'\)\?\.focus\(\)/, 'favorite removal fallback should target a remaining Favorite action');
assert.match(favoriteRemovalFallback, /refs\.emptyState\.querySelector\('h2'\)\?\.focus\(\)/, 'favorite removal fallback should focus the visible empty-state heading after the final favorite is removed');
assert.match(html, /<h2 tabindex=\"-1\">No icons found<\/h2>/, 'empty-state heading should support programmatic focus without adding another Tab stop');
const cardActionFocusFallback = catalogueSource.match(/function runCardActionWithFocusFallback\(iconId, actionName, action, callback\) \{[\s\S]*?\n  \}/)?.[0] || '';
assert.match(cardActionFocusFallback, /const restoreFocus = document\.activeElement === action/, 'catalogue selection actions should detect whether the activated control owned focus');
assert.match(cardActionFocusFallback, /callback\(\)/, 'catalogue focus fallback should run the state-changing action before evaluating replacement focus');
assert.match(cardActionFocusFallback, /restoreFocus && document\.activeElement === document\.body/, 'catalogue focus fallback should only restore when the action rebuild actually loses focus');
assert.match(cardActionFocusFallback, /focusRenderedCardAction\(iconId, actionName\)/, 'catalogue focus fallback should target the equivalent newly rendered action');
assert.match(catalogueSource, /runCardActionWithFocusFallback\(icon\.id, 'select', action, \(\) => onSelect\(icon\.id\)\)/, 'catalogue Select activation should preserve desktop focus across the rebuild');
assert.match(catalogueSource, /runCardActionWithFocusFallback\(icon\.id, 'more', action, \(\) => onMore\(icon\.id\)\)/, 'catalogue More activation should preserve desktop focus across the rebuild');
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

const closeInspectorButtonTag = html.match(/<button\b[^>]*id="closeInspectorButton"[^>]*>/)?.[0] || '';
assert.match(closeInspectorButtonTag, /class="[^"]*inspector-close-button[^"]*"/, 'inspector drawer close control should keep its responsive hook');
assert.match(utilitiesSource, /\.inspector-close-button\s*\{\s*display:\s*none;/, 'drawer Close inspector control should be hidden on docked desktop');
assert.match(responsiveSource, /@media \(max-width:\s*1180px\)[\s\S]*?\.inspector-close-button\s*\{\s*display:\s*inline-grid;/, 'drawer Close inspector control should become visible at inspector-drawer breakpoints');

const themeButtonTag = html.match(/<button\b[^>]*id="themeButton"[^>]*>/)?.[0] || '';
const themeSync = themeSource.match(/function sync\(\) \{[\s\S]*?\n  \}/)?.[0] || '';
assert.match(themeButtonTag, /aria-label="Switch to dark theme"/, 'theme toggle should expose a concrete initial action');
assert.match(themeButtonTag, /title="Switch to dark theme"/, 'theme toggle initial tooltip should match its action');
assert.match(themeSync, /const actionLabel = `Switch to \${body\.dataset\.theme === 'dark' \? 'light' : 'dark'} theme`/, 'theme toggle action should derive from the active theme');
assert.match(themeSync, /setAttribute\('aria-label', actionLabel\)/, 'theme toggle should synchronize its accessible action name');
assert.match(themeSync, /title = actionLabel/, 'theme toggle should synchronize its visible tooltip action');

const restoreFocusHelper = shellSource.match(/function restoreDrawerFocus\(\) \{[\s\S]*?\n  \}/)?.[0] || '';
const sidebarCollapseSync = shellSource.match(/function syncCollapsedState\(collapsed\) \{[\s\S]*?\n  \}/)?.[0] || '';
const mobileMenuButtonTag = html.match(/<button\b[^>]*id="mobileMenuButton"[^>]*>/)?.[0] || '';
const mobileMenuSync = shellSource.match(/function syncMobileMenuState\(open\) \{[\s\S]*?\n  \}/)?.[0] || '';
const mobileInspectorButtonTag = html.match(/<button\b[^>]*id="mobileInspectorButton"[^>]*>/)?.[0] || '';
const mobileInspectorSync = shellSource.match(/function syncMobileInspectorState\(open\) \{[\s\S]*?\n  \}/)?.[0] || '';
const closeSidebarSource = shellSource.match(/function closeSidebar\(\) \{[\s\S]*?\n  \}/)?.[0] || '';
const closeInspectorSource = shellSource.match(/function closeInspector\(\) \{[\s\S]*?\n  \}/)?.[0] || '';
assert.match(mobileMenuButtonTag, /aria-label="Open navigation"/, 'mobile navigation trigger should expose its initial open action');
assert.match(mobileMenuButtonTag, /aria-expanded="false"/, 'mobile navigation trigger should expose its initial collapsed state');
assert.match(mobileMenuSync, /setAttribute\('aria-expanded', String\(open\)\)/, 'mobile navigation trigger should synchronize expanded state');
assert.match(mobileMenuSync, /open \? 'Close navigation' : 'Open navigation'/, 'mobile navigation trigger name should describe its current action');
assert.match(closeSidebarSource, /syncMobileMenuState\(false\)/, 'closing mobile navigation should restore the open action name');
assert.match(mobileInspectorButtonTag, /aria-label="Open icon inspector"/, 'mobile inspector trigger should expose its initial open action');
assert.match(mobileInspectorButtonTag, /aria-expanded="false"/, 'mobile inspector trigger should expose its initial collapsed state');
assert.match(mobileInspectorSync, /setAttribute\('aria-expanded', String\(open\)\)/, 'mobile inspector trigger should synchronize expanded state');
assert.match(mobileInspectorSync, /open \? 'Close icon inspector' : 'Open icon inspector'/, 'mobile inspector trigger name should describe its current action');
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
assert.match(openInspectorSource, /syncMobileInspectorState\(true\)/, 'opening the mobile inspector should expose its close action');
assert.match(closeInspectorSource, /syncMobileInspectorState\(false\)/, 'closing the mobile inspector should restore its open action');
assert.match(openInspectorSource, /openDrawer\(refs\.inspector, trigger \|\| refs\.mobileInspectorButton\)/, 'inspector should preserve a caller-provided visible trigger for focus restoration');
assert.match(appSource, /function findRenderedCardAction\(id, action\)/, 'app should resolve the replacement catalogue control after card re-render');
assert.match(appSource, /onSelect: id => selectIcon\(id, true, 'select'\)/, 'card selection should restore focus to the replacement select control');
assert.match(appSource, /shell\.openInspector\(findRenderedCardAction\(id, 'more'\) \|\| undefined\)/, 'card more action should restore focus to the replacement more control');

const storageSource = fs.readFileSync(new URL('../js/core/storage.js', import.meta.url), 'utf8');
assert.doesNotMatch(html, /pinInspectorButton|inspectorPinState|Pin inspector/, 'inspector should not expose a non-functional Pin control or status');
assert.doesNotMatch(appSource, /pinInspectorButton|inspectorPinState/, 'app refs should not retain removed Pin controls');
assert.doesNotMatch(shellSource, /pinInspectorButton|inspectorPinState|STORAGE\.pinned/, 'shell should not retain dead Pin behavior/state');
assert.doesNotMatch(storageSource, /iconStudioInspectorPinned|\bpinned:/, 'storage contract should not retain the dead Pin preference');
assert.match(shellSource, /getClientRects\(\)\.length > 0/, 'drawer focus entry should skip controls that are not rendered');
assert.match(shellSource, /getComputedStyle\(element\)\.visibility !== 'hidden'/, 'drawer focus entry should skip visibility-hidden controls');

const escapeHandler = shellSource.match(/if \(event\.key === 'Escape'\) \{[\s\S]*?\n    \}/)?.[0] || '';
assert.match(escapeHandler, /if \(refs\.previewDialog\.open\) return;/, 'open full-preview modal should consume the first Escape layer');
assert.ok(
  escapeHandler.indexOf('refs.previewDialog.open') < escapeHandler.indexOf('closeSidebar()'),
  'modal Escape guard should run before underlying drawer close logic'
);
assert.doesNotMatch(escapeHandler, /previewDialog\.close\(\)/, 'shell should leave native dialog Escape/cancel handling to the dialog itself');

console.log('DOM, form-label, live-region, favorite/theme/inspector-toggle, dead-control, modal-layer and focus accessibility tests passed.');
