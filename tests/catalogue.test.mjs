import assert from 'node:assert/strict';
import { createIntersectionObserver } from '../js/core/observer.js';

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

console.log('Catalogue observer compatibility tests passed.');
