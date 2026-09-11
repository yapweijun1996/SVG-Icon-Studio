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
const filterButtonTag = html.match(/<button\b[^>]*id="filterButton"[^>]*>/)?.[0] || '';
const filterHandlerStart = appSource.indexOf("refs.filterButton.addEventListener('click'");
const filterHandler = filterHandlerStart >= 0 ? appSource.slice(filterHandlerStart, filterHandlerStart + 650) : '';

assert.match(filterButtonTag, /aria-expanded="false"/, 'advanced-filter button should expose collapsed state initially');
assert.match(filterButtonTag, /aria-controls="advancedFilter"/, 'advanced-filter button should identify its controlled panel');
assert.match(html, /id="advancedFilter"/, 'advanced-filter aria-controls target should exist');
assert.match(filterHandler, /setAttribute\('aria-expanded', String\(expanded\)\)/, 'advanced-filter expanded state should stay synchronized');
assert.match(filterHandler, /setAttribute\('aria-label', expanded \? 'Hide advanced filters' : 'Show advanced filters'\)/, 'advanced-filter accessible action label should stay synchronized');

const restoreFocusHelper = shellSource.match(/function restoreDrawerFocus\(\) \{[\s\S]*?\n  \}/)?.[0] || '';
const closeSidebarSource = shellSource.match(/function closeSidebar\(\) \{[\s\S]*?\n  \}/)?.[0] || '';
const closeInspectorSource = shellSource.match(/function closeInspector\(\) \{[\s\S]*?\n  \}/)?.[0] || '';
assert.match(restoreFocusHelper, /restoreFocusTarget = null/, 'drawer focus target should be consumed after restoration');
assert.match(closeSidebarSource, /const wasOpen = .*sidebar-open/, 'sidebar close should record whether it was actually open');
assert.match(closeSidebarSource, /if \(wasOpen &&/, 'sidebar close should restore focus only after a real close transition');
assert.match(closeInspectorSource, /const wasOpen = .*inspector-open/, 'inspector close should record whether its drawer was actually open');
assert.match(closeInspectorSource, /if \(wasOpen &&/, 'inspector close should restore focus only after a real close transition');

console.log('DOM and disclosure accessibility tests passed.');
