export function getFilteredIcons(state) {
  let icons = [...state.icons];
  if (state.view === 'favorites') {
    icons = icons.filter(icon => state.favorites.has(icon.id));
  } else if (state.view === 'recent') {
    const order = new Map(state.recent.map((id, index) => [id, index]));
    icons = icons.filter(icon => order.has(icon.id)).sort((a, b) => order.get(a.id) - order.get(b.id));
  } else if (state.view === 'uploaded') {
    icons = icons.filter(icon => icon.uploaded);
  }

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
