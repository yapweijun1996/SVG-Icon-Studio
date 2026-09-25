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

function tokenize(str) {
  return str.toLowerCase().split(/[\s\-_]+/).filter(Boolean);
}

function tokenMatches(fieldTokens, qt) {
  return fieldTokens.some(t => t === qt || t.startsWith(qt));
}

function scoreIcon(icon, query) {
  const q = query.toLowerCase();
  const qTokens = tokenize(q);
  if (!qTokens.length) return 0;

  const name = icon.name.toLowerCase();
  const nameTokens = tokenize(name);
  const idTokens = tokenize(icon.id);
  const catTokens = tokenize(icon.category);
  const styleTokens = tokenize(icon.style);
  const tagTokens = (icon.tags || []).flatMap(t => tokenize(t));
  const aliasTokens = (icon.aliases || []).flatMap(a => tokenize(a));
  const aliasExact = (icon.aliases || []).map(a => a.toLowerCase());

  if (qTokens.length > 1) {
    const allTokens = [...nameTokens, ...idTokens, ...catTokens, ...styleTokens, ...tagTokens, ...aliasTokens];
    if (!qTokens.every(qt => tokenMatches(allTokens, qt))) return 0;
    const nameMatches = qTokens.filter(qt => tokenMatches(nameTokens, qt)).length;
    return nameMatches === qTokens.length ? 5 : nameMatches > 0 ? 3 : 2;
  }

  const qt = qTokens[0];
  if (name === qt) return 7;
  if (aliasExact.includes(qt)) return 6;
  if (nameTokens.some(t => t === qt)) return 5;
  if (nameTokens.some(t => t.startsWith(qt))) return 4;
  if (tokenMatches(aliasTokens, qt)) return 3;
  if (tokenMatches(tagTokens, qt)) return 2;
  if (tokenMatches(idTokens, qt) || tokenMatches(catTokens, qt) || tokenMatches(styleTokens, qt)) return 1;
  return 0;
}

export function getFilteredIcons(state) {
  let icons = getViewIcons(state);

  const query = state.query.trim().toLowerCase();
  let searchScores = null;
  if (query) {
    const scored = icons.map(icon => ({ icon, score: scoreIcon(icon, query) }));
    icons = scored.filter(e => e.score > 0).map(e => e.icon);
    searchScores = new Map(scored.filter(e => e.score > 0).map(e => [e.icon.id, e.score]));
  }
  if (state.category !== 'All') icons = icons.filter(icon => icon.category === state.category);
  if (state.style !== 'all') icons = icons.filter(icon => icon.style === state.style);

  if (state.view !== 'recent') {
    if (state.sort === 'name') icons.sort((a, b) => a.name.localeCompare(b.name));
    else if (state.sort === 'category' || state.view === 'collections') icons.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
    else if (state.sort === 'recent') {
      const order = new Map(state.recent.map((id, index) => [id, index]));
      icons.sort((a, b) => (order.get(a.id) ?? 9999) - (order.get(b.id) ?? 9999));
    } else {
      icons.sort((a, b) =>
        (searchScores ? (searchScores.get(b.id) ?? 0) - (searchScores.get(a.id) ?? 0) : 0) ||
        Number(b.featured) - Number(a.featured) ||
        a.sortOrder - b.sortOrder
      );
    }
  }
  return icons;
}
