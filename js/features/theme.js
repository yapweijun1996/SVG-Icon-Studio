import { STORAGE, getValue, removeValue, setValue } from '../core/storage.js';

export function createThemeController({ body, button }) {
  const systemPreference = window.matchMedia('(prefers-color-scheme: dark)');
  const storedTheme = getValue(STORAGE.theme);
  let mode = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'system';
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');

  function getSystemTheme() {
    return systemPreference.matches ? 'dark' : 'light';
  }

  function getResolvedTheme() {
    return mode === 'system' ? getSystemTheme() : mode;
  }

  function getNextMode() {
    const systemTheme = getSystemTheme();
    if (mode === 'system') return systemTheme === 'dark' ? 'light' : 'dark';
    if (mode !== systemTheme) return systemTheme;
    return 'system';
  }

  function sync() {
    const theme = getResolvedTheme();
    const nextMode = getNextMode();
    const actionLabel = nextMode === 'system' ? 'Follow system theme' : 'Switch to ' + nextMode + ' theme';
    body.dataset.theme = theme;
    button.setAttribute('aria-label', actionLabel);
    button.title = actionLabel;
    if (themeColorMeta) themeColorMeta.content = theme === 'dark' ? '#151b24' : '#f45b0b';
  }

  sync();

  button.addEventListener('click', () => {
    mode = getNextMode();
    if (mode === 'system') removeValue(STORAGE.theme);
    else setValue(STORAGE.theme, mode);
    sync();
  });

  if (typeof systemPreference.addEventListener === 'function') {
    systemPreference.addEventListener('change', sync);
  } else {
    systemPreference.addListener?.(sync);
  }
}
