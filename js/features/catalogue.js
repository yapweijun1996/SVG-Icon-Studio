import { createElement, createSvgElement } from '../core/dom.js';
import { createIntersectionObserver } from '../core/observer.js';
import { getFilteredIcons, hasIconsInView, formatResultsSummary, createResultStatusUpdater } from './filters.js';
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
  let resultStatusSuppressed = false;
  const resultStatusUpdater = createResultStatusUpdater(refs.resultsAnnouncement);

  function disconnectObserver() {
    observer?.disconnect();
    observer = undefined;
  }

  function setupObserver(version) {
    observer = createIntersectionObserver(entries => {
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
        'aria-label': `Favorite ${icon.name}`
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
    actions.append(createElement('button', { className: 'card-action', text: 'Copy SVG', attributes: { type: 'button', 'data-action': 'copy', 'aria-label': `Copy ${icon.name} SVG` } }));
    actions.append(createElement('button', { className: 'card-action', text: '⋮', attributes: { type: 'button', 'data-action': 'more', 'aria-label': `More export options for ${icon.name}` } }));
    article.append(favoriteButton, selectButton, actions);
    observer?.observe(preview);
    return article;
  }

  function renderCategories() {
    const available = new Set(state.icons.map(icon => icon.category));
    const categories = ['All', ...categoryOrder.filter(category => available.has(category))];
    // Nav badge counts real collections, so adding a category can never leave it stale.
    refs.collectionCount.textContent = String(categories.length - 1);
    const fragment = document.createDocumentFragment();
    categories.forEach(category => {
      fragment.append(createElement('button', {
        className: `category-chip${state.category === category ? ' is-active' : ''}`,
        text: category,
        attributes: {
          type: 'button',
          'aria-pressed': state.category === category,
          tabindex: state.category === category ? '0' : '-1'
        },
        dataset: { category }
      }));
    });
    refs.categoryChips.replaceChildren(fragment);
    const activeChip = refs.categoryChips.querySelector('.is-active');
    if (activeChip && refs.categoryChips.scrollWidth > refs.categoryChips.clientWidth) {
      activeChip.scrollIntoView({ inline: 'center', block: 'nearest' });
    }
  }

  function render({ deferResultStatus = false, announceResultStatus = true, refreshPendingResultStatus = false } = {}) {
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
    refs.emptyResetButton.textContent = hasIconsInView(state) ? 'Reset filters' : 'Browse all icons';
    refs.loadMoreButton.parentElement.hidden = filtered.length === 0 || visible.length >= filtered.length;
    const resultSummary = formatResultsSummary(state, visible.length, filtered.length);
    refs.resultsSummary.textContent = resultSummary;
    if (resultStatusSuppressed) resultStatusUpdater.cancel();
    else if (announceResultStatus) resultStatusUpdater.update(resultSummary, { defer: deferResultStatus });
    else if (refreshPendingResultStatus) resultStatusUpdater.refreshPending(resultSummary);
    refs.visibleIconCount.textContent = String(filtered.length);
    refs.totalIconCount.textContent = String(state.icons.length);
    refs.favoriteCount.textContent = String(state.favorites.size);
    refs.recentCount.textContent = String(state.recent.length);
    refs.uploadCount.textContent = String(state.icons.filter(icon => icon.uploaded).length);
    refs.clearSearchButton.hidden = !state.query && state.category === 'All' && state.style === 'all';
    const [title, subtitle, resultTitle] = VIEW_COPY[state.view] || VIEW_COPY.library;
    refs.pageTitle.textContent = title;
    refs.pageSubtitle.textContent = subtitle;
    document.title = `${title} — Icon Studio`;
    refs.resultsTitle.textContent = state.query ? `Results for “${state.query}”` : (state.category !== 'All' ? state.category : resultTitle);
    renderCategories();
  }

  refs.categoryChips.addEventListener('click', event => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    state.category = button.dataset.category;
    state.visibleLimit = 24;
    render();
    const replacement = [...refs.categoryChips.querySelectorAll('[data-category]')]
      .find(chip => chip.dataset.category === state.category);
    replacement?.focus();
  });

  refs.categoryChips.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const current = event.target.closest('[data-category]');
    if (!current || !refs.categoryChips.contains(current)) return;
    const chips = [...refs.categoryChips.querySelectorAll('[data-category]')];
    const index = chips.indexOf(current);
    if (index < 0 || !chips.length) return;

    let nextIndex = index;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % chips.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + chips.length) % chips.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = chips.length - 1;

    event.preventDefault();
    chips.forEach((chip, chipIndex) => { chip.tabIndex = chipIndex === nextIndex ? 0 : -1; });
    chips[nextIndex].focus();
  });

  function focusRenderedCardAction(iconId, actionName) {
    const card = [...refs.iconGrid.querySelectorAll('.icon-card')].find(item => item.dataset.iconId === iconId);
    const renderedAction = card?.querySelector(`[data-action="${actionName}"]`);
    renderedAction?.focus();
    return renderedAction;
  }

  function focusFavoriteRemovalFallback(cardIndex) {
    const cards = [...refs.iconGrid.querySelectorAll('.icon-card')];
    if (cards.length) {
      const fallbackIndex = Math.max(0, Math.min(cardIndex, cards.length - 1));
      cards[fallbackIndex].querySelector('[data-action="favorite"]')?.focus();
      return;
    }
    refs.emptyState.querySelector('h2')?.focus();
  }

  function runCardActionWithFocusFallback(iconId, actionName, action, callback) {
    const restoreFocus = document.activeElement === action;
    callback();
    if (restoreFocus && document.activeElement === document.body) focusRenderedCardAction(iconId, actionName);
  }

  refs.iconGrid.addEventListener('click', event => {
    const card = event.target.closest('.icon-card');
    const action = event.target.closest('[data-action]');
    if (!card || !action) return;
    const icon = state.icons.find(item => item.id === card.dataset.iconId);
    if (!icon) return;
    if (action.dataset.action === 'select') {
      runCardActionWithFocusFallback(icon.id, 'select', action, () => onSelect(icon.id));
    } else if (action.dataset.action === 'favorite') {
      const restoreFocus = document.activeElement === action;
      const cardIndex = [...refs.iconGrid.querySelectorAll('.icon-card')].indexOf(card);
      onFavorite(icon.id);
      if (restoreFocus && !focusRenderedCardAction(icon.id, 'favorite')) focusFavoriteRemovalFallback(cardIndex);
    } else if (action.dataset.action === 'copy') onCopy(icon);
    else if (action.dataset.action === 'more') {
      runCardActionWithFocusFallback(icon.id, 'more', action, () => onMore(icon.id));
    }
  });

  function loadMore({ automatic = false } = {}) {
    const restoreFocus = document.activeElement === refs.loadMoreButton;
    const previousVisibleCount = refs.iconGrid.querySelectorAll('.icon-card').length;
    state.visibleLimit += 24;
    render({
      announceResultStatus: !automatic,
      refreshPendingResultStatus: automatic
    });
    if (restoreFocus && refs.loadMoreButton.parentElement.hidden) {
      const firstNewCard = refs.iconGrid.querySelectorAll('.icon-card')[previousVisibleCount];
      firstNewCard?.querySelector('[data-action="select"]')?.focus();
    }
  }
  refs.loadMoreButton.addEventListener('click', () => loadMore());

  // Auto-load once the (still visible, non-hidden) load-more control nears the
  // viewport, so scrolling to the bottom of the grid keeps extending it. The
  // button itself stays as a manual fallback -- for keyboard use, and for the
  // rare case IntersectionObserver isn't available.
  const loadMoreObserver = createIntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) loadMore({ automatic: true });
  }, { rootMargin: '600px 0px' });
  loadMoreObserver?.observe(refs.loadMoreButton);

  return {
    render,
    setResultStatusSuppressed: suppressed => {
      resultStatusSuppressed = Boolean(suppressed);
      if (resultStatusSuppressed) resultStatusUpdater.cancel();
    },
    destroy: () => {
      disconnectObserver();
      loadMoreObserver?.disconnect();
      resultStatusUpdater.destroy();
    }
  };
}
