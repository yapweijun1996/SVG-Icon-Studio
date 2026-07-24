import { STORAGE, getValue, setValue } from '../core/storage.js';

export function createThemeController({ body, button }) {
  const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  body.dataset.theme = getValue(STORAGE.theme, preferred);
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  function sync() {
    button.setAttribute('aria-label', `Switch to ${body.dataset.theme === 'dark' ? 'light' : 'dark'} theme`);
    // Keeps the PWA title bar / iOS status area matching the active theme.
    if (themeColorMeta) themeColorMeta.content = body.dataset.theme === 'dark' ? '#151b24' : '#f45b0b';
  }
  sync();
  button.addEventListener('click', () => {
    body.dataset.theme = body.dataset.theme === 'dark' ? 'light' : 'dark';
    setValue(STORAGE.theme, body.dataset.theme);
    sync();
  });
}
