import assert from 'node:assert/strict';
import { getFilteredIcons } from '../js/features/filters.js';

function baseState(overrides = {}) {
  const icons = [
    { id: 'invoice', name: 'Invoice', category: 'Finance', style: 'outline', tags: ['bill'], aliases: ['receipt'], featured: true, sortOrder: 1 },
    { id: 'purchase-order', name: 'Purchase Order', category: 'Finance', style: 'filled', tags: ['procurement'], aliases: [], featured: false, sortOrder: 2 },
    { id: 'warehouse', name: 'Warehouse', category: 'Logistics', style: 'outline', tags: ['storage'], aliases: ['depot'], featured: false, sortOrder: 3, uploaded: true },
  ];
  return {
    icons,
    view: 'library',
    query: '',
    category: 'All',
    style: 'all',
    sort: 'featured',
    favorites: new Set(),
    recent: [],
    ...overrides,
  };
}

// Default view: no filtering, featured-first then sortOrder.
{
  const result = getFilteredIcons(baseState());
  assert.deepEqual(result.map(icon => icon.id), ['invoice', 'purchase-order', 'warehouse']);
}

// Favorites view only keeps favorited icons.
{
  const result = getFilteredIcons(baseState({ view: 'favorites', favorites: new Set(['warehouse']) }));
  assert.deepEqual(result.map(icon => icon.id), ['warehouse']);
}

// Recent view filters to recent ids and preserves recency order, ignoring sort.
{
  const result = getFilteredIcons(baseState({ view: 'recent', recent: ['warehouse', 'invoice'], sort: 'name' }));
  assert.deepEqual(result.map(icon => icon.id), ['warehouse', 'invoice']);
}

// Uploaded view only keeps user-uploaded icons.
{
  const result = getFilteredIcons(baseState({ view: 'uploaded' }));
  assert.deepEqual(result.map(icon => icon.id), ['warehouse']);
}

// Text query matches aliases even when the name/category/style/tags don't.
{
  const result = getFilteredIcons(baseState({ query: 'depot' }));
  assert.deepEqual(result.map(icon => icon.id), ['warehouse']);
}

// Query is case-insensitive and matches tags too.
{
  const result = getFilteredIcons(baseState({ query: 'PROCUREMENT' }));
  assert.deepEqual(result.map(icon => icon.id), ['purchase-order']);
}

// Category and style filters combine (AND, not OR).
{
  const result = getFilteredIcons(baseState({ category: 'Finance', style: 'outline' }));
  assert.deepEqual(result.map(icon => icon.id), ['invoice']);
}

// sort: 'name' orders alphabetically regardless of featured/sortOrder.
{
  const result = getFilteredIcons(baseState({ sort: 'name' }));
  assert.deepEqual(result.map(icon => icon.id), ['invoice', 'purchase-order', 'warehouse']);
}

// sort: 'category' orders by category then name.
{
  const result = getFilteredIcons(baseState({ sort: 'category' }));
  assert.deepEqual(result.map(icon => icon.id), ['invoice', 'purchase-order', 'warehouse']);
}

console.log('Icon filter tests passed.');
