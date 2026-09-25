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
import { createPwaController } from './features/pwa.js';
import { createToastController, copyText } from './ui/toast.js';

function collectRefs() {
  return {
    body: document.body, backdrop: $('#mobileBackdrop'), sidebar: $('#sidebar'), workspace: $('.workspace'),
    mobileMenuButton: $('#mobileMenuButton'), mobileInspectorButton: $('#mobileInspectorButton'),
    brandToggle: $('#brandToggle'), themeButton: $('#themeButton'), importButton: $('#importButton'),
    appVersion: $('#appVersion'), pwaUpdateButton: $('#pwaUpdateButton'),
    svgFileInput: $('#svgFileInput'), totalIconCount: $('#totalIconCount'), visibleIconCount: $('#visibleIconCount'),
    favoriteCount: $('#favoriteCount'), recentCount: $('#recentCount'), uploadCount: $('#uploadCount'),
    collectionCount: $('#collectionCount'),
    pageTitle: $('#pageTitle'), pageSubtitle: $('#pageSubtitle'), searchInput: $('#searchInput'),
    filterButton: $('#filterButton'), advancedFilter: $('#advancedFilter'), styleFilter: $('#styleFilter'),
    sortFilter: $('#sortFilter'), clearFiltersButton: $('#clearFiltersButton'), categoryChips: $('#categoryChips'),
    resultsTitle: $('#resultsTitle'), resultsSummary: $('#resultsSummary'), resultsAnnouncement: $('#resultsAnnouncement'),
    clearSearchButton: $('#clearSearchButton'),
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
  createPwaController({ versionNode: refs.appVersion, updateButton: refs.pwaUpdateButton, toast });
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

  function renderAll(renderOptions) {
    catalogue.render(renderOptions);
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
    // Selection/recent-order changes do not alter the current result set or
    // filter context, so avoid repeating the unchanged catalogue live status.
    catalogue.render({ announceResultStatus: false });
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
    // Favorite membership changes the visible result set only inside the
    // Favorites view. Elsewhere this is a presentation/state-only rerender.
    renderAll({ announceResultStatus: state.view === 'favorites' });
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
      state.category = 'All';
      state.selectedId = record.id;
      state.recent = [record.id, ...state.recent.filter(id => id !== record.id)].slice(0, 20);
      setJson(STORAGE.recent, state.recent);
      shell.setView('uploaded');
      selectIcon(record.id);
    }
  });

  function resetFilters(renderOptions) {
    state.query = '';
    state.category = 'All';
    state.style = 'all';
    state.sort = state.view === 'collections' ? 'category' : 'featured';
    state.visibleLimit = 24;
    refs.searchInput.value = '';
    refs.styleFilter.value = 'all';
    refs.sortFilter.value = state.sort;
    renderAll(renderOptions);
  }

  function clearAdvancedFilters() {
    const changesResultContext = Boolean(state.query) || state.category !== 'All' || state.style !== 'all';
    resetFilters({ announceResultStatus: changesResultContext });
  }

  function recoverEmptyCatalogue() {
    const returnToLibrary = !hasIconsInView(state);
    resetFilters();
    if (returnToLibrary) shell.setView('library');
    refs.resultsTitle.focus();
  }

  function clearResultFilters() {
    const restoreFocus = document.activeElement === refs.clearSearchButton;
    const hadSearchQuery = Boolean(state.query);
    resetFilters();
    if (!restoreFocus) return;
    (hadSearchQuery ? refs.searchInput : refs.resultsTitle).focus();
  }

  let searchIsComposing = false;
  refs.searchInput.addEventListener('compositionstart', () => {
    searchIsComposing = true;
    // An IME composition can pause longer than the normal search debounce.
    // Cancel/suppress advisory announcements until the composition is committed.
    catalogue.setResultStatusSuppressed(true);
  });
  refs.searchInput.addEventListener('input', event => {
    state.query = event.target.value;
    state.visibleLimit = 24;
    const isComposing = searchIsComposing || event.isComposing;
    catalogue.setResultStatusSuppressed(isComposing);
    // Keep visual filtering immediate, but coalesce the advisory live-region
    // message until typing pauses. IME partial text stays silent until committed.
    catalogue.render({ deferResultStatus: Boolean(state.query) });
  });
  refs.searchInput.addEventListener('compositionend', event => {
    searchIsComposing = false;
    catalogue.setResultStatusSuppressed(false);
    // Some browser/IME combinations do not provide a distinct trailing input
    // event after compositionend, so commit the final value here as well.
    state.query = event.target.value;
    state.visibleLimit = 24;
    catalogue.render({ deferResultStatus: Boolean(state.query) });
  });
  refs.clearSearchButton.addEventListener('click', clearResultFilters);
  refs.emptyResetButton.addEventListener('click', recoverEmptyCatalogue);
  refs.clearFiltersButton.addEventListener('click', clearAdvancedFilters);
  function setAdvancedFiltersExpanded(expanded) {
    refs.advancedFilter.hidden = !expanded;
    refs.filterButton.setAttribute('aria-expanded', String(expanded));
    refs.filterButton.setAttribute('aria-label', expanded ? 'Hide advanced filters' : 'Show advanced filters');
    refs.filterButton.classList.toggle('is-active', expanded);
  }
  refs.filterButton.addEventListener('click', event => {
    const expanded = refs.advancedFilter.hidden;
    setAdvancedFiltersExpanded(expanded);
    // Keyboard activation emits click detail=0. Move directly into the newly
    // disclosed controls so the density radio group cannot interrupt that flow.
    if (expanded && event.detail === 0) refs.styleFilter.focus();
  });
  refs.advancedFilter.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !refs.advancedFilter.contains(document.activeElement)) return;
    event.preventDefault();
    event.stopPropagation();
    setAdvancedFiltersExpanded(false);
    refs.filterButton.focus();
  });
  refs.styleFilter.addEventListener('change', event => { state.style = event.target.value; state.visibleLimit = 24; catalogue.render(); });
  refs.sortFilter.addEventListener('change', event => { state.sort = event.target.value; state.visibleLimit = 24; catalogue.render({ announceResultStatus: false }); });
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
    // Density changes only alter presentation. Re-render the cards without
    // repeating an unchanged catalogue result announcement.
    catalogue.render({ announceResultStatus: false });
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
