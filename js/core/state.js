export const DEFAULT_APPEARANCE = Object.freeze({
  size: 48,
  strokeWidth: '1.5',
  strokeColor: '#1f2937',
  fillEnabled: false,
  fillColor: '#f45b0b',
  currentColor: true,
  includeTitle: true,
  rotation: 0,
  flipHorizontal: false,
  flipVertical: false
});

export function createState({ icons, density = 'grid', favorites = [], recent = [], appearance = {} }) {
  return {
    icons,
    selectedId: icons.some(icon => icon.id === 'invoice') ? 'invoice' : icons[0]?.id || '',
    query: '',
    category: 'All',
    style: 'all',
    sort: 'featured',
    view: 'library',
    density: density === 'compact' ? 'compact' : 'grid',
    visibleLimit: 24,
    favorites: new Set(favorites),
    recent: Array.isArray(recent) ? recent : [],
    codeTab: 'svg',
    previewBackground: 'light',
    appearance: { ...DEFAULT_APPEARANCE, ...appearance }
  };
}

export function pruneStoredIds(state) {
  const valid = new Set(state.icons.map(icon => icon.id));
  state.favorites = new Set([...state.favorites].filter(id => valid.has(id)));
  state.recent = state.recent.filter(id => valid.has(id));
}
