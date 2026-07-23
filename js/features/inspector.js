import { $$ } from '../core/dom.js';
import { DEFAULT_APPEARANCE } from '../core/state.js';
import { loadIconAsset } from '../services/icon-repository.js';
import { createRenderedSvg, previewContextColor } from '../services/svg-renderer.js';
import { generateCode, generateSvg } from '../services/svg-exporter.js';
import { copyText } from '../ui/toast.js';

export function createInspectorController({ state, refs, toast, onFavorite, onAppearanceChange }) {
  let previewToken = 0;
  const getIcon = () => state.icons.find(icon => icon.id === state.selectedId) || state.icons[0];

  async function renderPreview() {
    const icon = getIcon();
    if (!icon) return;
    const token = ++previewToken;
    const asset = await loadIconAsset(icon.id);
    if (token !== previewToken) return;
    const contextColor = previewContextColor(state.appearance, state.previewBackground);
    refs.iconPreview.className = `icon-preview ${state.previewBackground}`;
    refs.iconPreview.style.color = contextColor;
    refs.iconPreview.replaceChildren(createRenderedSvg(icon, asset, state.appearance, { color: contextColor }));
    refs.codeOutput.textContent = asset.ok ? generateCode(state.codeTab, icon, asset, state.appearance) : `<!-- ${asset.error} -->`;
    refs.dialogIconName.textContent = icon.name;
    refs.dialogPreview.style.color = contextColor;
    refs.dialogPreview.replaceChildren(createRenderedSvg(icon, asset, state.appearance, {
      size: Math.min(280, Math.max(96, state.appearance.size * 3)), color: contextColor
    }));
  }

  async function update() {
    const icon = getIcon();
    if (!icon) return;
    refs.selectedIconName.textContent = icon.name;
    refs.selectedIconMeta.textContent = `${icon.category} · ${icon.style[0].toUpperCase()}${icon.style.slice(1)}`;
    const favorite = state.favorites.has(icon.id);
    refs.favoriteSelectedButton.setAttribute('aria-pressed', String(favorite));
    refs.favoriteSelectedButton.setAttribute('aria-label', favorite ? `Remove ${icon.name} from favorites` : `Add ${icon.name} to favorites`);
    await renderPreview();
  }

  function updateBackgroundTabs() {
    $$('[data-background]', refs.backgroundTabs).forEach(button => {
      const active = button.dataset.background === state.previewBackground;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    renderPreview();
  }

  function syncControls() {
    const appearance = state.appearance;
    refs.sizeRange.value = appearance.size;
    refs.sizeOutput.value = `${appearance.size} px`;
    refs.strokeWidthSelect.value = appearance.strokeWidth;
    refs.strokeColorInput.value = appearance.strokeColor;
    refs.strokeColorCode.textContent = appearance.strokeColor.toUpperCase();
    refs.fillToggle.checked = appearance.fillEnabled;
    refs.fillColorRow.hidden = !appearance.fillEnabled;
    refs.fillColorInput.value = appearance.fillColor;
    refs.fillColorCode.textContent = appearance.fillColor.toUpperCase();
    refs.currentColorCheckbox.checked = appearance.currentColor;
    refs.includeTitleCheckbox.checked = appearance.includeTitle;
    refs.rotationRange.value = appearance.rotation;
    refs.rotationOutput.value = `${appearance.rotation}°`;
    refs.flipHorizontalButton.setAttribute('aria-pressed', String(appearance.flipHorizontal));
    refs.flipVerticalButton.setAttribute('aria-pressed', String(appearance.flipVertical));
    onAppearanceChange?.(appearance);
    renderPreview();
  }

  function resetAppearance() {
    state.appearance = { ...DEFAULT_APPEARANCE };
    syncControls();
    toast('Icon appearance reset');
  }

  refs.favoriteSelectedButton.addEventListener('click', () => onFavorite(state.selectedId));
  refs.backgroundTabs.addEventListener('click', event => {
    const button = event.target.closest('[data-background]');
    if (!button) return;
    state.previewBackground = button.dataset.background;
    updateBackgroundTabs();
  });

  refs.sizeRange.addEventListener('input', event => {
    state.appearance.size = Number(event.target.value);
    refs.sizeOutput.value = `${event.target.value} px`;
    onAppearanceChange?.(state.appearance);
    renderPreview();
  });
  refs.strokeWidthSelect.addEventListener('change', event => { state.appearance.strokeWidth = event.target.value; syncControls(); });
  refs.strokeColorInput.addEventListener('input', event => {
    state.appearance.strokeColor = event.target.value;
    refs.strokeColorCode.textContent = event.target.value.toUpperCase();
    onAppearanceChange?.(state.appearance);
    renderPreview();
  });
  refs.fillToggle.addEventListener('change', event => {
    state.appearance.fillEnabled = event.target.checked;
    refs.fillColorRow.hidden = !event.target.checked;
    onAppearanceChange?.(state.appearance);
    renderPreview();
  });
  refs.fillColorInput.addEventListener('input', event => {
    state.appearance.fillColor = event.target.value;
    refs.fillColorCode.textContent = event.target.value.toUpperCase();
    onAppearanceChange?.(state.appearance);
    renderPreview();
  });
  refs.currentColorCheckbox.addEventListener('change', event => { state.appearance.currentColor = event.target.checked; syncControls(); });
  refs.includeTitleCheckbox.addEventListener('change', event => { state.appearance.includeTitle = event.target.checked; syncControls(); });
  refs.rotationRange.addEventListener('input', event => {
    state.appearance.rotation = Number(event.target.value);
    refs.rotationOutput.value = `${event.target.value}°`;
    onAppearanceChange?.(state.appearance);
    renderPreview();
  });
  refs.flipHorizontalButton.addEventListener('click', () => { state.appearance.flipHorizontal = !state.appearance.flipHorizontal; syncControls(); });
  refs.flipVerticalButton.addEventListener('click', () => { state.appearance.flipVertical = !state.appearance.flipVertical; syncControls(); });
  refs.resetAppearanceButton.addEventListener('click', resetAppearance);

  refs.copySvgButton.addEventListener('click', async () => {
    const icon = getIcon();
    const asset = await loadIconAsset(icon.id);
    if (!asset.ok) return toast(asset.error, { error: true });
    await copyText(generateSvg(icon, asset, state.appearance), toast, `${icon.name} SVG copied`);
  });
  refs.copyCodeButton.addEventListener('click', () => copyText(refs.codeOutput.textContent, toast, `${state.codeTab.toUpperCase()} code copied`));
  $$('.code-tabs button').forEach(button => button.addEventListener('click', () => {
    state.codeTab = button.dataset.codeTab;
    $$('.code-tabs button').forEach(tab => {
      const active = tab === button;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    renderPreview();
  }));

  refs.fullPreviewButton.addEventListener('click', async () => {
    await renderPreview();
    if (typeof refs.previewDialog.showModal === 'function') refs.previewDialog.showModal();
  });
  refs.closePreviewDialog.addEventListener('click', () => refs.previewDialog.close());
  refs.previewDialog.addEventListener('click', event => { if (event.target === refs.previewDialog) refs.previewDialog.close(); });

  syncControls();
  updateBackgroundTabs();
  return { update, renderPreview, syncControls, updateBackgroundTabs };
}
