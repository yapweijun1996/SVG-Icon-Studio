import assert from 'node:assert/strict';
import { getFilteredIcons, hasIconsInView } from '../js/features/filters.js';

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

// Empty-view recovery distinguishes an intrinsically empty scoped view from filters that merely hide its items.
{
  assert.equal(hasIconsInView(baseState({ view: 'favorites' })), false);
  assert.equal(hasIconsInView(baseState({ view: 'favorites', favorites: new Set(['invoice']), query: 'no-match' })), true);
  assert.equal(hasIconsInView(baseState({ view: 'recent' })), false);
  assert.equal(hasIconsInView(baseState({ view: 'uploaded' })), true);
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

// --- Relevance ranking regression tests (v0.9.60) ---

function relevanceState(overrides = {}) {
  const icons = [
    { id: 'report', name: 'Report', category: 'Analytics', style: 'outline', tags: [], aliases: [], featured: false, sortOrder: 1 },
    { id: 'chart-bar', name: 'Chart Bar', category: 'Analytics', style: 'outline', tags: ['report'], aliases: [], featured: true, sortOrder: 2 },
    { id: 'purchase-order', name: 'Purchase Order', category: 'Finance', style: 'outline', tags: [], aliases: [], featured: false, sortOrder: 3 },
    { id: 'cart', name: 'Cart', category: 'Commerce', style: 'outline', tags: ['order'], aliases: [], featured: true, sortOrder: 4 },
    { id: 'mail', name: 'Mail', category: 'Comm', style: 'outline', tags: [], aliases: [], featured: false, sortOrder: 5 },
    { id: 'ai-assistant', name: 'AI Assistant', category: 'Tools', style: 'outline', tags: [], aliases: ['ai'], featured: false, sortOrder: 6 },
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

// "ai" does not match mid-word substrings — Mail, Cart (no 'ai') are excluded.
// Only AI Assistant (alias 'ai') matches.
{
  const result = getFilteredIcons(relevanceState({ query: 'ai' }));
  assert.deepEqual(result.map(icon => icon.id), ['ai-assistant']);
}

// "report" ranks exact-name Report (score 7) before tagged Chart Bar (score 2)
// even though chart-bar has featured=true and sortOrder=2 (both beat report's featured=false,sortOrder=1 in the old sort).
{
  const result = getFilteredIcons(relevanceState({ query: 'report' }));
  assert.equal(result[0].id, 'report');
  assert.equal(result[1].id, 'chart-bar');
}

// "order" ranks direct-name-token Purchase Order (score 5) before tag-matched Cart (score 2)
// even though cart has featured=true.
{
  const result = getFilteredIcons(relevanceState({ query: 'order' }));
  assert.equal(result[0].id, 'purchase-order');
  assert.equal(result[1].id, 'cart');
}

// Explicit sort='name' ignores relevance scores — alphabetical order is preserved.
{
  const result = getFilteredIcons(relevanceState({ query: 'order', sort: 'name' }));
  // Cart < Purchase Order alphabetically
  assert.equal(result[0].id, 'cart');
  assert.equal(result[1].id, 'purchase-order');
}

// Explicit sort='category' ignores relevance scores — category then name order is preserved.
{
  const result = getFilteredIcons(relevanceState({ query: 'report', sort: 'category' }));
  // Both in Analytics; Chart Bar < Report alphabetically
  assert.equal(result[0].id, 'chart-bar');
  assert.equal(result[1].id, 'report');
}

console.log('Icon filter tests passed.');
