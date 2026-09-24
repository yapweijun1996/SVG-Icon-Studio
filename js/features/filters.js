export function createResultStatusUpdater(node, delayMs = 300) {
  let timer;
  let pendingMessage;

  function cancel() {
    clearTimeout(timer);
    timer = undefined;
    pendingMessage = undefined;
  }

  function update(message, { defer = false } = {}) {
    cancel();
    if (!defer) {
      node.textContent = message;
      return;
    }
    pendingMessage = message;
    timer = setTimeout(() => {
      node.textContent = pendingMessage;
      timer = undefined;
      pendingMessage = undefined;
    }, delayMs);
  }

  function refreshPending(message) {
    if (timer === undefined) return false;
    pendingMessage = message;
    return true;
  }

  function destroy() {
    cancel();
  }

  return { update, refreshPending, cancel, destroy };
}

export function getViewIcons(state) {
  let icons = [...state.icons];
  if (state.view === 'favorites') {
    icons = icons.filter(icon => state.favorites.has(icon.id));
  } else if (state.view === 'recent') {
    const order = new Map(state.recent.map((id, index) => [id, index]));
    icons = icons.filter(icon => order.has(icon.id)).sort((a, b) => order.get(a.id) - order.get(b.id));
  } else if (state.view === 'uploaded') {
    icons = icons.filter(icon => icon.uploaded);
  }
  return icons;
}

export function hasIconsInView(state) {
  return getViewIcons(state).length > 0;
}

const SCOPED_VIEW_CONTEXT = {
  favorites: 'Favorites view',
  recent: 'Recently viewed',
  uploaded: 'Uploaded icons'
};

export function formatResultsSummary(state, visibleCount, filteredCount) {
  const iconNoun = filteredCount === 1 ? 'icon' : 'icons';
  const countSummary = visibleCount === filteredCount
    ? `Showing ${filteredCount} ${iconNoun}`
    : `Showing ${visibleCount} of ${filteredCount} ${iconNoun}`;
  const context = [];
  const scopedView = SCOPED_VIEW_CONTEXT[state.view];
  if (scopedView) context.push(scopedView);
  const query = state.query.trim();
  if (query) context.push(`search “${query}”`);
  if (state.category !== 'All') context.push(`${state.category} category`);
  if (state.style !== 'all') context.push(`${state.style} style`);
  return context.length ? `${countSummary} — ${context.join(', ')}` : countSummary;
}

export function getFilteredIcons(state) {
  let icons = getViewIcons(state);

  const query = state.query.trim().toLowerCase();
  if (query) {
    icons = icons.filter(icon => [icon.name, icon.category, icon.style, ...(icon.tags || []), ...(icon.aliases || [])]
      .join(' ').toLowerCase().includes(query));
  }
  if (state.category !== 'All') icons = icons.filter(icon => icon.category === state.category);
  if (state.style !== 'all') icons = icons.filter(icon => icon.style === state.style);

  if (state.view !== 'recent') {
    if (state.sort === 'name') icons.sort((a, b) => a.name.localeCompare(b.name));
    else if (state.sort === 'category' || state.view === 'collections') icons.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
    else if (state.sort === 'recent') {
      const order = new Map(state.recent.map((id, index) => [id, index]));
      icons.sort((a, b) => (order.get(a.id) ?? 9999) - (order.get(b.id) ?? 9999));
    } else icons.sort((a, b) => Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder);
  }
  return icons;
}
