import assert from 'node:assert/strict';
import { createToastController, MAX_VISIBLE_TOASTS } from '../js/ui/toast.js';

const originalDocument = globalThis.document;
const originalWindow = globalThis.window;

try {
  const timers = [];
  globalThis.window = {
    setTimeout(callback, delay) {
      timers.push({ callback, delay });
      return timers.length;
    }
  };

  globalThis.document = {
    createElement() {
      return {
        className: '',
        textContent: '',
        parentElement: null,
        remove() {
          const parent = this.parentElement;
          if (!parent) return;
          const index = parent.children.indexOf(this);
          if (index >= 0) parent.children.splice(index, 1);
          this.parentElement = null;
        }
      };
    }
  };

  const region = {
    children: [],
    get firstElementChild() {
      return this.children[0] || null;
    },
    append(item) {
      item.parentElement = this;
      this.children.push(item);
    }
  };

  const toast = createToastController(region);
  for (let index = 1; index <= 8; index += 1) toast('Toast ' + index);

  assert.equal(MAX_VISIBLE_TOASTS, 3, 'toast cap should stay intentionally small on mobile');
  assert.equal(region.children.length, MAX_VISIBLE_TOASTS, 'rapid actions should never leave more than the capped number of visible toasts');
  assert.deepEqual(region.children.map(item => item.textContent), ['Toast 6', 'Toast 7', 'Toast 8'], 'toast overflow should evict the oldest feedback and preserve the newest messages');
  assert.ok(timers.every(timer => timer.delay === 2800), 'every toast should retain the existing auto-dismiss duration');

  timers[0].callback();
  assert.deepEqual(region.children.map(item => item.textContent), ['Toast 6', 'Toast 7', 'Toast 8'], 'stale timers for already-evicted toasts should not remove newer feedback');

  timers[5].callback();
  assert.deepEqual(region.children.map(item => item.textContent), ['Toast 7', 'Toast 8'], 'the timer belonging to a visible toast should still dismiss that toast normally');

  console.log('Toast stacking-cap tests passed.');
} finally {
  if (originalDocument === undefined) delete globalThis.document;
  else globalThis.document = originalDocument;
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
}
