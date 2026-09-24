import assert from 'node:assert/strict';
import { createThemeController } from '../js/features/theme.js';

class FakeStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

function createButton() {
  const attributes = new Map();
  const listeners = new Map();
  return {
    title: '',
    setAttribute(name, value) { attributes.set(name, String(value)); },
    getAttribute(name) { return attributes.get(name) ?? null; },
    addEventListener(type, handler) { listeners.set(type, handler); },
    click() { listeners.get('click')?.(); }
  };
}

function createSystemPreference(matches = false) {
  const listeners = new Set();
  return {
    matches,
    addEventListener(type, handler) {
      if (type === 'change') listeners.add(handler);
    },
    setDark(nextMatches) {
      this.matches = nextMatches;
      for (const handler of listeners) handler({ matches: nextMatches });
    }
  };
}

const previous = {
  window: globalThis.window,
  document: globalThis.document,
  localStorage: globalThis.localStorage
};

try {
  const localStorage = new FakeStorage();
  const systemPreference = createSystemPreference(false);
  const meta = { content: '#f45b0b' };
  const body = { dataset: {} };
  const button = createButton();

  globalThis.localStorage = localStorage;
  globalThis.window = { matchMedia: () => systemPreference };
  globalThis.document = { querySelector: selector => selector === 'meta[name="theme-color"]' ? meta : null };

  createThemeController({ body, button });

  assert.equal(body.dataset.theme, 'light');
  assert.equal(localStorage.getItem('iconStudioTheme'), null);
  assert.equal(button.getAttribute('aria-label'), 'Switch to dark theme');
  assert.equal(meta.content, '#f45b0b');

  button.click();
  assert.equal(body.dataset.theme, 'dark');
  assert.equal(localStorage.getItem('iconStudioTheme'), 'dark');
  assert.equal(button.getAttribute('aria-label'), 'Switch to light theme');
  assert.equal(meta.content, '#151b24');

  button.click();
  assert.equal(body.dataset.theme, 'light');
  assert.equal(localStorage.getItem('iconStudioTheme'), 'light');
  assert.equal(button.getAttribute('aria-label'), 'Follow system theme');

  button.click();
  assert.equal(body.dataset.theme, 'light');
  assert.equal(localStorage.getItem('iconStudioTheme'), null);
  assert.equal(button.getAttribute('aria-label'), 'Switch to dark theme');

  systemPreference.setDark(true);
  assert.equal(body.dataset.theme, 'dark');
  assert.equal(button.getAttribute('aria-label'), 'Switch to light theme');
  assert.equal(meta.content, '#151b24');

  button.click();
  assert.equal(body.dataset.theme, 'light');
  assert.equal(localStorage.getItem('iconStudioTheme'), 'light');

  systemPreference.setDark(false);
  assert.equal(body.dataset.theme, 'light');
  assert.equal(localStorage.getItem('iconStudioTheme'), 'light');
  assert.equal(button.getAttribute('aria-label'), 'Follow system theme');

  button.click();
  assert.equal(localStorage.getItem('iconStudioTheme'), null);
  assert.equal(body.dataset.theme, 'light');
} finally {
  if (previous.window === undefined) delete globalThis.window; else globalThis.window = previous.window;
  if (previous.document === undefined) delete globalThis.document; else globalThis.document = previous.document;
  if (previous.localStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = previous.localStorage;
}

console.log('Theme follow-system cycle tests passed.');
