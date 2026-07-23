import assert from 'node:assert/strict';
import { DEFAULT_APPEARANCE, createState, pruneStoredIds } from '../js/core/state.js';

assert.throws(() => { DEFAULT_APPEARANCE.size = 999; }, 'DEFAULT_APPEARANCE must be frozen so features cannot mutate the shared default');

// createState selects "invoice" as the default icon when present.
{
  const state = createState({ icons: [{ id: 'warehouse' }, { id: 'invoice' }] });
  assert.equal(state.selectedId, 'invoice');
  assert.equal(state.view, 'library');
  assert.equal(state.density, 'grid');
  assert.deepEqual(state.appearance, DEFAULT_APPEARANCE);
}

// Falls back to the first icon when "invoice" isn't in the catalogue.
{
  const state = createState({ icons: [{ id: 'warehouse' }, { id: 'delivery-order' }] });
  assert.equal(state.selectedId, 'warehouse');
}

// Falls back to an empty string when there are no icons at all.
{
  const state = createState({ icons: [] });
  assert.equal(state.selectedId, '');
}

// density only accepts 'compact' as non-default; anything else normalizes to 'grid'.
{
  assert.equal(createState({ icons: [], density: 'compact' }).density, 'compact');
  assert.equal(createState({ icons: [], density: 'bogus' }).density, 'grid');
}

// Passed-in appearance overrides merge on top of the defaults, not replace them.
{
  const state = createState({ icons: [], appearance: { size: 96 } });
  assert.equal(state.appearance.size, 96);
  assert.equal(state.appearance.strokeColor, DEFAULT_APPEARANCE.strokeColor);
}

// pruneStoredIds drops favorites/recent ids that no longer exist in the catalogue
// (e.g. after a built-in icon is renamed or an uploaded icon is deleted).
{
  const state = createState({ icons: [{ id: 'invoice' }], favorites: ['invoice', 'deleted-icon'], recent: ['deleted-icon', 'invoice'] });
  pruneStoredIds(state);
  assert.deepEqual([...state.favorites], ['invoice']);
  assert.deepEqual(state.recent, ['invoice']);
}

console.log('App state tests passed.');
