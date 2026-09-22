import assert from 'node:assert/strict';
import { createIntersectionObserver } from '../js/core/observer.js';
import { formatResultsSummary } from '../js/features/filters.js';

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
