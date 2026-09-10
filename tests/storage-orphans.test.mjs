import assert from 'node:assert/strict';
import { findOrphanIds } from '../js/core/storage.js';

// Report both mismatch directions, but only metadata-only rows are safe to delete:
// asset-only rows still contain user-authored SVG bytes and must be preserved.
{
  const result = findOrphanIds(
    [{ id: 'paired' }, { id: 'metadata-only' }],
    [{ id: 'paired' }, { id: 'asset-only' }]
  );
  assert.deepEqual(result, { metadataOnly: ['metadata-only'], assetOnly: ['asset-only'] });
}

{
  const result = findOrphanIds(
    [{ id: 'm-1' }, { id: 'm-2' }],
    [{ id: 'a-1' }, { id: 'a-2' }]
  );
  assert.deepEqual(result, { metadataOnly: ['m-1', 'm-2'], assetOnly: ['a-1', 'a-2'] });
}

console.log('Uploaded-icon orphan repair tests passed.');
