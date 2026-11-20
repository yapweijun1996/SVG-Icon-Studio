import assert from 'node:assert/strict';
import { createIntersectionObserver } from '../js/core/observer.js';
import { formatResultsSummary, createResultStatusUpdater } from '../js/features/filters.js';

const originalObserver = globalThis.IntersectionObserver;
try {
  delete globalThis.IntersectionObserver;
  assert.equal(createIntersectionObserver(() => {}), null, 'catalogue should keep working without IntersectionObserver');

  let observedOptions;
  globalThis.IntersectionObserver = class {
    constructor(callback, options) {
      this.callback = callback;
      observedOptions = options;
    }
  };
  const callback = () => {};
  const observer = createIntersectionObserver(callback, { rootMargin: '600px 0px' });
  assert.equal(observer.callback, callback);
  assert.deepEqual(observedOptions, { rootMargin: '600px 0px' });
} finally {
  if (originalObserver === undefined) delete globalThis.IntersectionObserver;
  else globalThis.IntersectionObserver = originalObserver;
}

const fakeStatus = { textContent: 'Initial status' };
const statusUpdater = createResultStatusUpdater(fakeStatus, 15);
statusUpdater.update('Showing partial results', { defer: true });
statusUpdater.update('Showing final search results', { defer: true });
assert.equal(fakeStatus.textContent, 'Initial status', 'deferred result status should not announce intermediate rapid-search updates');
await new Promise(resolve => setTimeout(resolve, 25));
assert.equal(fakeStatus.textContent, 'Showing final search results', 'deferred result status should announce the latest search result after typing pauses');
statusUpdater.update('Stale delayed search', { defer: true });
statusUpdater.update('Immediate filter result');
await new Promise(resolve => setTimeout(resolve, 25));
assert.equal(fakeStatus.textContent, 'Immediate filter result', 'an immediate status update should cancel any stale delayed search announcement');
statusUpdater.update('IME partial query', { defer: true });
statusUpdater.cancel();
await new Promise(resolve => setTimeout(resolve, 25));
assert.equal(fakeStatus.textContent, 'Immediate filter result', 'cancelling a pending result status should keep IME partial text out of the live region');
statusUpdater.update('Showing 24 of 120 icons — search “order”', { defer: true });
assert.equal(statusUpdater.refreshPending('Showing 48 of 120 icons — search “order”'), true, 'auto-pagination should refresh a pending search announcement without creating a new one');
await new Promise(resolve => setTimeout(resolve, 25));
assert.equal(fakeStatus.textContent, 'Showing 48 of 120 icons — search “order”', 'pending search announcement should use the latest silently paginated visible count');
assert.equal(statusUpdater.refreshPending('Should stay silent'), false, 'auto-pagination should not create a live announcement when no deferred search announcement is pending');
statusUpdater.destroy();

const baseSummaryState = { view: 'library', query: '', category: 'All', style: 'all' };
assert.equal(
  formatResultsSummary(baseSummaryState, 24, 120),
  'Showing 24 of 120 icons',
  'default pagination summary should stay concise'
);
assert.equal(
  formatResultsSummary({ ...baseSummaryState, query: 'truck' }, 2, 2),
  'Showing 2 icons — search “truck”',
  'search result status should identify the active query'
);
assert.equal(
  formatResultsSummary({ ...baseSummaryState, query: 'order', category: 'ERP', style: 'outline' }, 0, 0),
  'Showing 0 icons — search “order”, ERP category, outline style',
  'combined filters should remain explicit even when there are no results'
);
assert.equal(
  formatResultsSummary({ ...baseSummaryState, view: 'favorites' }, 1, 1),
  'Showing 1 icon — Favorites view',
  'scoped views should identify the result scope and preserve singular grammar'
);
assert.equal(
  formatResultsSummary({ ...baseSummaryState, view: 'recent', query: '  invoice  ' }, 1, 1),
  'Showing 1 icon — Recently viewed, search “invoice”',
  'status context should use the trimmed query without changing search state'
);

console.log('Catalogue observer compatibility and result-summary tests passed.');

const baseURI = 'https://example.test/';
const originalFetch = globalThis.fetch;
const originalWarn = console.warn;
globalThis.document = { baseURI };
globalThis.window = { location: new URL(baseURI) };
try {
  const icons = Array.from({ length: 10 }, (_, index) => ({
    id: `icon-${index}`, category: 'Test', style: 'outline', tags: [], aliases: [], status: 'active'
  }));
  const responseBodies = [];
  const started = [];
  let inFlight = 0;
  let peakInFlight = 0;
  const warnings = [];
  console.warn = message => warnings.push(message);
  globalThis.fetch = async url => {
    if (url.pathname.endsWith('/icon-registry.json')) {
      return { ok: true, json: async () => ({ schemaVersion: 1, categories: [{ id: 'Test' }], icons }) };
    }
    started.push(url.pathname.split('/').at(-1));
    peakInFlight = Math.max(peakInFlight, ++inFlight);
    return {
      ok: true,
      text: () => new Promise(resolve => responseBodies.push(() => {
        inFlight -= 1;
        resolve('');
      }))
    };
  };
  const { loadRegistry, loadIconAsset } = await import('../js/services/icon-repository.js');
  await loadRegistry();
  const pending = icons.map(icon => loadIconAsset(icon.id));
  assert.equal(loadIconAsset(icons.at(-1).id), pending.at(-1), 'queued requests should reuse the same promise');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(responseBodies.length, 8, 'eight requests should start, with the other two waiting for response bodies');
  responseBodies.splice(0).forEach(finish => finish());
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(responseBodies.length, 2, 'waiting requests should start as slots become available');
  assert.deepEqual(started.slice(-2), ['icon-9.svg', 'icon-8.svg'], 'newly requested previews should take priority');
  responseBodies.forEach(finish => finish());
  const assets = await Promise.all(pending);
  assert.equal(peakInFlight, 8);
  assert.ok(assets.every(asset => !asset.ok), 'malformed assets should fail independently');
  assert.equal(warnings.length, icons.length);
} finally {
  globalThis.fetch = originalFetch;
  console.warn = originalWarn;
  delete globalThis.document;
  delete globalThis.window;
}
console.log('Catalogue asset request concurrency and deduplication tests passed.');
