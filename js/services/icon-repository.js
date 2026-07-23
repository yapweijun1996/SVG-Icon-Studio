import { sanitizeSvgText } from './svg-sanitizer.js';

// Resolved against the page URL (not import.meta.url) so this keeps working no matter
// how a bundler renames/relocates this module's own output file.
const REGISTRY_URL = new URL('data/icon-registry.json', document.baseURI);
const assetCache = new Map();
const metadataById = new Map();
let registryData;

function validateRegistry(registry) {
  if (!registry || registry.schemaVersion !== 1 || !Array.isArray(registry.icons) || !Array.isArray(registry.categories)) {
    throw new Error('Icon registry format is invalid.');
  }
  const categories = new Set(registry.categories.map(category => category.id));
  const ids = new Set();
  for (const icon of registry.icons) {
    if (!icon || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(icon.id)) throw new Error('Registry contains an invalid icon ID.');
    if (ids.has(icon.id)) throw new Error(`Duplicate icon ID: ${icon.id}.`);
    ids.add(icon.id);
    if (!categories.has(icon.category)) throw new Error(`Unknown category for ${icon.id}.`);
    if (!['outline', 'filled'].includes(icon.style)) throw new Error(`Unsupported icon style for ${icon.id}.`);
    if (!Array.isArray(icon.tags) || !Array.isArray(icon.aliases)) throw new Error(`Invalid search metadata for ${icon.id}.`);
    for (const key of ['body', 'svg', 'markup', 'pathData']) {
      if (Object.hasOwn(icon, key)) throw new Error(`Registry geometry is forbidden: ${icon.id}.`);
    }
  }
  return registry;
}

export async function loadRegistry({ force = false } = {}) {
  if (registryData && !force) return registryData;
  const response = await fetch(REGISTRY_URL, { credentials: 'same-origin', cache: force ? 'reload' : 'default' });
  if (!response.ok) throw new Error(`Icon registry failed to load (${response.status}).`);
  registryData = validateRegistry(await response.json());
  metadataById.clear();
  registryData.icons.filter(icon => icon.status === 'active').forEach(icon => metadataById.set(icon.id, { ...icon, uploaded: false }));
  return registryData;
}

export function registerUploadedIcons(records) {
  for (const record of records || []) {
    if (!record?.id || !record?.svgText) continue;
    metadataById.set(record.id, { ...record, category: 'Uploaded', uploaded: true });
    const checked = sanitizeSvgText(record.svgText, { stripDimensions: true });
    if (checked.ok) assetCache.set(record.id, Promise.resolve({ ok: true, ...checked }));
  }
}

export function getAllIconMetadata() { return [...metadataById.values()]; }
export function getIconMetadata(id) { return metadataById.get(id); }
export function clearAssetCache() { assetCache.clear(); }

function assetUrl(id) {
  const url = new URL(`icons/catalog/${id}.svg`, document.baseURI);
  if (url.origin !== window.location.origin) throw new Error('Cross-origin icon assets are forbidden.');
  return url;
}

export function loadIconAsset(id) {
  if (assetCache.has(id)) return assetCache.get(id);
  const metadata = metadataById.get(id);
  const pending = (async () => {
    try {
      if (!metadata) throw new Error(`Unknown icon: ${id}.`);
      if (metadata.uploaded && metadata.svgText) {
        const checked = sanitizeSvgText(metadata.svgText, { stripDimensions: true });
        if (!checked.ok) throw new Error(checked.error);
        return { ok: true, ...checked };
      }
      const response = await fetch(assetUrl(id), { credentials: 'same-origin' });
      if (!response.ok) throw new Error(`SVG asset failed to load (${response.status}).`);
      const checked = sanitizeSvgText(await response.text());
      if (!checked.ok) throw new Error(checked.error);
      return { ok: true, ...checked };
    } catch (error) {
      console.warn(`[Icon Studio] ${id}: ${error.message}`);
      return { ok: false, error: error.message || 'Icon asset failed.' };
    }
  })();
  assetCache.set(id, pending);
  return pending;
}

export async function preloadIconAssets(ids, concurrency = 8) {
  const queue = [...new Set(ids)].filter(id => metadataById.has(id));
  const workers = Array.from({ length: Math.min(Math.max(1, concurrency), queue.length || 1) }, async () => {
    while (queue.length) await loadIconAsset(queue.shift());
  });
  await Promise.all(workers);
}
