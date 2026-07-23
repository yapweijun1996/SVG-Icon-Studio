import fs from 'node:fs/promises';
const registry = JSON.parse(await fs.readFile('data/icon-registry.json', 'utf8'));
const byCategory = Object.fromEntries(registry.categories.map(category => [category.id, 0]));
const byStyle = {};
const aliasOwners = new Map();
const duplicateAliases = [];
for (const icon of registry.icons) {
  byCategory[icon.category] = (byCategory[icon.category] || 0) + 1;
  byStyle[icon.style] = (byStyle[icon.style] || 0) + 1;
  for (const alias of icon.aliases) {
    if (aliasOwners.has(alias)) duplicateAliases.push({ alias, icons: [aliasOwners.get(alias), icon.id] });
    else aliasOwners.set(alias, icon.id);
  }
}
console.log(JSON.stringify({
  schemaVersion: registry.schemaVersion,
  total: registry.icons.length,
  byCategory,
  byStyle,
  deprecated: registry.icons.filter(icon => icon.status === 'deprecated').map(icon => icon.id),
  hidden: registry.icons.filter(icon => icon.status === 'hidden').map(icon => icon.id),
  duplicateAliases
}, null, 2));
