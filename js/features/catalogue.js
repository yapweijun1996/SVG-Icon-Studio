import { createElement, createSvgElement } from '../core/dom.js';
import { getFilteredIcons } from './filters.js';
import { loadIconAsset } from '../services/icon-repository.js';
import { createCanonicalPreview, createFallbackSvg } from '../services/svg-renderer.js';

const VIEW_COPY = {
  library: ['Production-ready SVG icon collection', 'Browse, customise and export consistent SVG icons for your products and interfaces.', 'All icons'],
  collections: ['Curated icon collections', 'Browse icon groups for ERP, finance, logistics, commerce and common interfaces.', 'Collections'],
  favorites: ['Favorite icons', 'Your saved icons are stored locally in this browser.', 'Favorites'],
  recent: ['Recently viewed icons', 'Continue working with icons you inspected recently.', 'Recently viewed'],
  uploaded: ['Uploaded SVG icons', 'Safe, validated custom icons stored in this browser.', 'Uploaded icons'],
  brand: ['Brand-ready icon system', 'Preview the icon library with your product accent and consistent SVG settings.', 'Brand kit']
};

function starIcon() {
  const svg = createSvgElement('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' });
  svg.append(createSvgElement('path', { d: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z' }));
  return svg;
}

export function createCatalogueController({ state, refs, categoryOrder, onSelect, onFavorite, onCopy, onMore }) {
  let renderVersion = 0;
  let observer;

  function disconnectObserver() {
    observer?.disconnect();
    observer = undefined;
  }

  function setupObserver(version) {
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        const preview = entry.target;
        const icon = state.icons.find(item => item.id === preview.dataset.iconId);
        if (!icon) continue;
        loadIconAsset(icon.id).then(asset => {
          if (version !== renderVersion || !preview.isConnected) return;
          preview.replaceChildren(asset.ok ? createCanonicalPreview(icon, asset, state.density === 'compact' ? 36 : 48) : createFallbackSvg(icon.name, 42));
          preview.classList.toggle('has-error', !asset.ok);
        });
      }
    }, { rootMargin: '240px 0px' });
  }

  function createCard(icon) {
    const selected = icon.id === state.selectedId;
    const favorite = state.favorites.has(icon.id);
    const article = createElement('article', {
      className: `icon-card${selected ? ' is-selected' : ''}`,
      dataset: { iconId: icon.id, style: icon.style }
    });

    const favoriteButton = createElement('button', {
      className: 'favorite-button',
      attributes: {
        type: 'button', 'data-action': 'favorite', 'aria-pressed': favorite,
        'aria-label': `${favorite ? 'Remove' : 'Add'} ${icon.name} ${favorite ? 'from' : 'to'} favorites`
      }
    });
    favoriteButton.append(starIcon());

    const selectButton = createElement('button', {
      className: 'card-select',
      attributes: { type: 'button', 'data-action': 'select', 'aria-label': `Select ${icon.name} icon` }
    });
    const preview = createElement('span', { className: 'card-preview', attributes: { 'aria-hidden': 'true' }, dataset: { iconId: icon.id } });
    preview.append(createFallbackSvg(icon.name, state.density === 'compact' ? 36 : 48));
    const copy = createElement('span', { className: 'card-copy' });
    copy.append(createElement('strong', { text: icon.name }));
    copy.append(createElement('span', { text: `${icon.category} · ${icon.style[0].toUpperCase()}${icon.style.slice(1)}` }));
    selectButton.append(preview, copy);

    const actions = createElement('div', { className: 'card-actions' });
    actions.append(createElement('button', { className: 'card-action', text: 'Copy SVG', attributes: { type: 'button', 'data-action': 'copy' } }));
    actions.append(createElement('button', { className: 'card-action', text: '⋮', attributes: { type: 'button', 'data-action': 'more', 'aria-label': `More export options for ${icon.name}` } }));
    article.append(favoriteButton, selectButton, actions);
    observer.observe(preview);
    return article;
  }

  function renderCategories() {
    const available = new Set(state.icons.map(icon => icon.category));
    const categories = ['All', ...categoryOrder.filter(category => available.has(category))];
    const fragment = document.createDocumentFragment();
    categories.forEach(category => {
      fragment.append(createElement('button', {
        className: `category-chip${state.category === category ? ' is-active' : ''}`,
        text: category,
        attributes: { type: 'button', 'aria-pressed': state.category === category },
        dataset: { category }
      }));
    });
    refs.categoryChips.replaceChildren(fragment);
  }

  function render() {
    renderVersion += 1;
    disconnectObserver();
    setupObserver(renderVersion);
    const filtered = getFilteredIcons(state);
    const visible = filtered.slice(0, state.visibleLimit);
    refs.iconGrid.classList.toggle('is-compact', state.density === 'compact');
    const fragment = document.createDocumentFragment();
    visible.forEach(icon => fragment.append(createCard(icon)));
    refs.iconGrid.replaceChildren(fragment);
    refs.emptyState.hidden = filtered.length > 0;
    refs.iconGrid.hidden = filtered.length === 0;
    refs.loadMoreButton.parentElement.hidden = filtered.length === 0 || visible.length >= filtered.length;
    refs.resultsSummary.textContent = filtered.length === visible.length ? `Showing ${filtered.length} icon${filtered.length === 1 ? '' : 's'}` : `Showing ${visible.length} of ${filtered.length}`;
    refs.visibleIconCount.textContent = String(filtered.length);
    refs.totalIconCount.textContent = String(state.icons.length);
    refs.favoriteCount.textContent = String(state.favorites.size);
    refs.recentCount.textContent = String(state.recent.length);
    refs.uploadCount.textContent = String(state.icons.filter(icon => icon.uploaded).length);
    refs.clearSearchButton.hidden = !state.query && state.category === 'All' && state.style === 'all';
    const [title, subtitle, resultTitle] = VIEW_COPY[state.view] || VIEW_COPY.library;
    refs.pageTitle.textContent = title;
    refs.pageSubtitle.textContent = subtitle;
    refs.resultsTitle.textContent = state.query ? `Results for “${state.query}”` : (state.category !== 'All' ? state.category : resultTitle);
    renderCategories();
  }

  refs.categoryChips.addEventListener('click', event => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    state.category = button.dataset.category;
    state.visibleLimit = 24;
    render();
  });

  refs.iconGrid.addEventListener('click', event => {
    const card = event.target.closest('.icon-card');
    const action = event.target.closest('[data-action]');
    if (!card || !action) return;
    const icon = state.icons.find(item => item.id === card.dataset.iconId);
    if (!icon) return;
    if (action.dataset.action === 'select') onSelect(icon.id);
    else if (action.dataset.action === 'favorite') onFavorite(icon.id);
    else if (action.dataset.action === 'copy') onCopy(icon);
    else if (action.dataset.action === 'more') onMore(icon.id);
  });

  refs.loadMoreButton.addEventListener('click', () => { state.visibleLimit += 24; render(); });

  return { render, destroy: disconnectObserver };
}
