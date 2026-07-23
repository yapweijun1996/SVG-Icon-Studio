import { STORAGE, getValue, setValue } from '../core/storage.js';

export function createThemeController({ body, button }) {
  const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  body.dataset.theme = getValue(STORAGE.theme, preferred);
  function syncLabel() {
    button.setAttribute('aria-label', `Switch to ${body.dataset.theme === 'dark' ? 'light' : 'dark'} theme`);
  }
  syncLabel();
  button.addEventListener('click', () => {
    body.dataset.theme = body.dataset.theme === 'dark' ? 'light' : 'dark';
    setValue(STORAGE.theme, body.dataset.theme);
    syncLabel();
  });
}
