import { $, $$ } from './core/dom.js';
import { createState, pruneStoredIds } from './core/state.js';
import { STORAGE, getValue, getJson, setValue, setJson, listUploadedIcons, migrateLegacyUploads } from './core/storage.js';
import { sanitizeSvgText } from './services/svg-sanitizer.js';
import { loadRegistry, registerUploadedIcons, getAllIconMetadata, loadIconAsset } from './services/icon-repository.js';
import { generateSvg } from './services/svg-exporter.js';
import { createCatalogueController } from './features/catalogue.js';
import { hasIconsInView } from './features/filters.js';
import { createInspectorController } from './features/inspector.js';
import { createImporterController } from './features/importer.js';
import { createShellController } from './features/shell.js';
import { createThemeController } from './features/theme.js';
import { createToastController, copyText } from './ui/toast.js';

function collectRefs() {
  return {
    body: document.body, backdrop: $('#mobileBackdrop'), sidebar: $('#sidebar'), workspace: $('.workspace'),
    mobileMenuButton: $('#mobileMenuButton'), mobileInspectorButton: $('#mobileInspectorButton'),
    brandToggle: $('#brandToggle'), themeButton: $('#themeButton'), importButton: $('#importButton'),
    svgFileInput: $('#svgFileInput'), totalIconCount: $('#totalIconCount'), visibleIconCount: $('#visibleIconCount'),
    favoriteCount: $('#favoriteCount'), recentCount: $('#recentCount'), uploadCount: $('#uploadCount'),
    collectionCount: $('#collectionCount'),
    pageTitle: $('#pageTitle'), pageSubtitle: $('#pageSubtitle'), searchInput: $('#searchInput'),
    filterButton: $('#filterButton'), advancedFilter: $('#advancedFilter'), styleFilter: $('#styleFilter'),
    sortFilter: $('#sortFilter'), clearFiltersButton: $('#clearFiltersButton'), categoryChips: $('#categoryChips'),
    resultsTitle: $('#resultsTitle'), resultsSummary: $('#resultsSummary'), clearSearchButton: $('#clearSearchButton'),
    iconGrid: $('#iconGrid'), emptyState: $('#emptyState'), emptyResetButton: $('#emptyResetButton'),
    loadMoreButton: $('#loadMoreButton'), inspector: $('#inspector'),
    collapseInspectorButton: $('#collapseInspectorButton'),
    closeInspectorButton: $('#closeInspectorButton'), selectedIconName: $('#selectedIconName'),
    selectedIconMeta: $('#selectedIconMeta'), favoriteSelectedButton: $('#favoriteSelectedButton'),
    iconPreview: $('#iconPreview'), backgroundTabs: $('#backgroundTabs'), sizeRange: $('#sizeRange'),
    sizeOutput: $('#sizeOutput'), strokeWidthSelect: $('#strokeWidthSelect'), strokeColorInput: $('#strokeColorInput'),
    strokeColorCode: $('#strokeColorCode'), fillToggle: $('#fillToggle'), fillColorRow: $('#fillColorRow'),
    fillColorInput: $('#fillColorInput'), fillColorCode: $('#fillColorCode'),
    currentColorCheckbox: $('#currentColorCheckbox'), includeTitleCheckbox: $('#includeTitleCheckbox'),
    resetAppearanceButton: $('#resetAppearanceButton'), rotationRange: $('#rotationRange'), rotationOutput: $('#rotationOutput'),
    flipHorizontalButton: $('#flipHorizontalButton'), flipVerticalButton: $('#flipVerticalButton'),
    fullPreviewButton: $('#fullPreviewButton'), copySvgButton: $('#copySvgButton'), codeOutput: $('#codeOutput'),
    copyCodeButton: $('#copyCodeButton'), previewDialog: $('#previewDialog'), dialogPreview: $('#dialogPreview'),
    dialogIconName: $('#dialogIconName'), closePreviewDialog: $('#closePreviewDialog'), toastRegion: $('#toastRegion'),
    manageBrandButton: $('#manageBrandButton')
  };
}

async function start() {
  const refs = collectRefs();
  const toast = createToastController(refs.toastRegion);
  const registry = await loadRegistry();
  const migration = await migrateLegacyUploads(sanitizeSvgText);
  if (migration.migrated) toast(`${migration.migrated} uploaded icon${migration.migrated === 1 ? '' : 's'} migrated to IndexedDB`);
  const uploaded = await listUploadedIcons();
  registerUploadedIcons(uploaded);
  const icons = getAllIconMetadata();
  if (!icons.length) throw new Error('The icon registry contains no active icons.');

  const state = createState({
    icons,
    density: getValue(STORAGE.density, 'grid'),
    favorites: getJson(STORAGE.favorites, []),
    recent: getJson(STORAGE.recent, []),
    appearance: getJson(STORAGE.appearance, {})
  });
  pruneStoredIds(state);
  setJson(STORAGE.favorites, [...state.favorites]);
  setJson(STORAGE.recent, state.recent);

  let catalogue;
  let inspector;
  let shell;
  const getIcon = id => state.icons.find(icon => icon.id === (id || state.selectedId)) || state.icons[0];

  function renderAll() {
    catalogue.render();
    inspector.update();
  }

  function findRenderedCardAction(id, action) {
    const card = [...refs.iconGrid.querySelectorAll('.icon-card')].find(item => item.dataset.iconId === id);
    return card?.querySelector(`[data-action="${action}"]`) || null;
  }

  function selectIcon(id, openPanel = true, restoreAction = null) {
    const icon = getIcon(id);
    if (!icon) return;
    state.selectedId = icon.id;
    state.recent = [icon.id, ...state.recent.filter(item => item !== icon.id)].slice(0, 20);
    setJson(STORAGE.recent, state.recent);
    catalogue.render();
    inspector.update();
    if (openPanel && window.matchMedia('(max-width: 1180px)').matches) {
      shell.openInspector(restoreAction ? findRenderedCardAction(icon.id, restoreAction) : undefined);
    }
  }

  function toggleFavorite(id) {
    const icon = getIcon(id);
    if (!icon) return;
    if (state.favorites.has(icon.id)) {
      state.favorites.delete(icon.id);
      toast(`${icon.name} removed from favorites`);
    } else {
      state.favorites.add(icon.id);
      toast(`${icon.name} added to favorites`);
    }
    setJson(STORAGE.favorites, [...state.favorites]);
    renderAll();
  }

  async function copyIcon(icon) {
    const asset = await loadIconAsset(icon.id);
    if (!asset.ok) return toast(asset.error, { error: true });
    await copyText(generateSvg(icon, asset, state.appearance), toast, `${icon.name} SVG copied`);
  }

  catalogue = createCatalogueController({
    state, refs,
    categoryOrder: registry.categories.sort((a, b) => a.order - b.order).map(category => category.id),
    onSelect: id => selectIcon(id, true, 'select'),
    onFavorite: toggleFavorite,
    onCopy: copyIcon,
    onMore: id => { selectIcon(id, false); shell.openInspector(findRenderedCardAction(id, 'more') || undefined); toast('More export formats are available in the inspector'); }
  });

  inspector = createInspectorController({
    state, refs, toast, onFavorite: toggleFavorite,
    onAppearanceChange: appearance => setJson(STORAGE.appearance, appearance)
  });

  shell = createShellController({
    state, refs, toast,
    onViewChange: renderAll,
    onBrandPreview: () => { state.previewBackground = 'brand'; inspector.updateBackgroundTabs(); }
  });

  createThemeController({ body: refs.body, button: refs.themeButton });
  createImporterController({
    state, refs, toast,
    onImported: record => {
      state.view = 'uploaded';
      state.category = 'All';
      state.selectedId = record.id;
      state.recent = [record.id, ...state.recent.filter(id => id !== record.id)].slice(0, 20);
      setJson(STORAGE.recent, state.recent);
      shell.setView('uploaded');
      selectIcon(record.id);
    }
  });

  function resetFilters() {
    state.query = '';
    state.category = 'All';
    state.style = 'all';
    state.sort = state.view === 'collections' ? 'category' : 'featured';
    state.visibleLimit = 24;
    refs.searchInput.value = '';
    refs.styleFilter.value = 'all';
    refs.sortFilter.value = state.sort;
    renderAll();
  }

  function recoverEmptyCatalogue() {
    const returnToLibrary = !hasIconsInView(state);
    resetFilters();
    if (returnToLibrary) shell.setView('library');
    refs.resultsTitle.focus();
  }

  function clearSearch() {
    const restoreFocus = document.activeElement === refs.clearSearchButton;
    resetFilters();
    if (restoreFocus) refs.searchInput.focus();
  }

  refs.searchInput.addEventListener('input', event => { state.query = event.target.value; state.visibleLimit = 24; catalogue.render(); });
  refs.clearSearchButton.addEventListener('click', clearSearch);
  refs.emptyResetButton.addEventListener('click', recoverEmptyCatalogue);
  refs.clearFiltersButton.addEventListener('click', resetFilters);
  refs.filterButton.addEventListener('click', () => {
    const expanded = refs.advancedFilter.hidden;
    refs.advancedFilter.hidden = !expanded;
    refs.filterButton.setAttribute('aria-expanded', String(expanded));
    refs.filterButton.setAttribute('aria-label', expanded ? 'Hide advanced filters' : 'Show advanced filters');
    refs.filterButton.classList.toggle('is-active', expanded);
  });
  refs.styleFilter.addEventListener('change', event => { state.style = event.target.value; state.visibleLimit = 24; catalogue.render(); });
  refs.sortFilter.addEventListener('change', event => { state.sort = event.target.value; state.visibleLimit = 24; catalogue.render(); });
  const densityButtons = $$('.density-switch button');

  function syncDensityButtons() {
    densityButtons.forEach(button => {
      const active = button.dataset.density === state.density;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-checked', String(active));
      button.tabIndex = active ? 0 : -1;
    });
  }

  function activateDensity(button, { focus = false } = {}) {
    if (!button) return;
    state.density = button.dataset.density;
    setValue(STORAGE.density, state.density);
    syncDensityButtons();
    catalogue.render();
    if (focus) button.focus();
  }

  densityButtons.forEach((button, index) => {
    button.addEventListener('click', () => activateDensity(button));
    button.addEventListener('keydown', event => {
      let nextIndex = null;
      if (['ArrowRight', 'ArrowDown'].includes(event.key)) nextIndex = (index + 1) % densityButtons.length;
      if (['ArrowLeft', 'ArrowUp'].includes(event.key)) nextIndex = (index - 1 + densityButtons.length) % densityButtons.length;
      if (nextIndex === null) return;
      event.preventDefault();
      activateDensity(densityButtons[nextIndex], { focus: true });
    });
  });
  syncDensityButtons();

  catalogue.render();
  await inspector.update();
  selectIcon(state.selectedId, false);
}

// PWA: register only in production builds — a caching worker in dev fights
// Vite's module server and HMR. Relative URL keeps it working under a
// GitHub Pages project subpath.
if (import.meta.env?.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(error => console.warn('[Icon Studio] SW registration failed:', error.message));
  });
}

start().catch(error => {
  console.error(error);
  const refs = collectRefs();
  refs.iconGrid.hidden = true;
  refs.emptyState.hidden = false;
  refs.emptyState.querySelector('h2').textContent = 'Icon library unavailable';
  refs.emptyState.querySelector('p').textContent = error.message || 'The icon registry could not be loaded.';
  refs.emptyResetButton.textContent = 'Retry';
  refs.emptyResetButton.addEventListener('click', () => window.location.reload(), { once: true });
});
