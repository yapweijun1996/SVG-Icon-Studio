import { createSvgElement, slugify } from '../core/dom.js';
import { cloneSanitizedRoot } from './svg-sanitizer.js';

function transformValue(appearance) {
  const scaleX = appearance.flipHorizontal ? -1 : 1;
  const scaleY = appearance.flipVertical ? -1 : 1;
  if (!appearance.rotation && scaleX === 1 && scaleY === 1) return '';
  return `translate(12 12) rotate(${appearance.rotation || 0}) scale(${scaleX} ${scaleY}) translate(-12 -12)`;
}

function applyAccessibility(root, metadata, includeTitle) {
  root.querySelectorAll(':scope > title').forEach(node => node.remove());
  if (!includeTitle) {
    root.setAttribute('aria-hidden', 'true');
    root.removeAttribute('role');
    root.removeAttribute('aria-labelledby');
    return;
  }
  const titleId = `title-${slugify(metadata.id)}`;
  const title = createSvgElement('title', { id: titleId });
  title.textContent = `${metadata.name} icon`;
  root.prepend(title);
  root.setAttribute('role', 'img');
  root.setAttribute('aria-labelledby', titleId);
  root.removeAttribute('aria-hidden');
}

function applyAppearance(root, metadata, appearance) {
  const color = appearance.currentColor ? 'currentColor' : appearance.strokeColor;
  if (metadata.style === 'filled') {
    const paint = appearance.currentColor ? 'currentColor' : appearance.fillColor;
    root.setAttribute('fill', paint);
    root.setAttribute('stroke', 'none');
    // Canonical filled-style icons also carry their own fill="currentColor" on
    // the shape itself (see icons/catalog/purchase-order.svg), which as an
    // attribute on that element wins over whatever the root resolves to -- so
    // the chosen paint has to be pushed onto every shape, not just the root.
    root.querySelectorAll('[fill]').forEach(node => node.setAttribute('fill', paint));
  } else {
    root.setAttribute('fill', appearance.fillEnabled ? (appearance.currentColor ? 'currentColor' : appearance.fillColor) : 'none');
    root.setAttribute('stroke', color);
    root.setAttribute('stroke-width', String(appearance.strokeWidth));
    root.setAttribute('stroke-linecap', 'round');
    root.setAttribute('stroke-linejoin', 'round');
  }
}

function applyTransform(root, appearance) {
  const transform = transformValue(appearance);
  if (!transform) return;
  const children = [...root.childNodes].filter(node => !(node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === 'title'));
  const group = createSvgElement('g', { transform });
  children.forEach(node => group.append(node));
  root.append(group);
}

export function createRenderedSvg(metadata, asset, appearance, { size = appearance.size, includeTitle = appearance.includeTitle, color } = {}) {
  if (!asset?.ok || !asset.root) return createFallbackSvg(metadata?.name || 'Unavailable icon', size);
  const root = cloneSanitizedRoot(asset.root);
  root.setAttribute('width', String(size));
  root.setAttribute('height', String(size));
  if (color) root.style.color = color;
  applyAppearance(root, metadata, appearance);
  applyAccessibility(root, metadata, includeTitle);
  applyTransform(root, appearance);
  return root;
}

export function createCanonicalPreview(metadata, asset, size = 48) {
  if (!asset?.ok || !asset.root) return createFallbackSvg(metadata?.name || 'Unavailable icon', size);
  const root = cloneSanitizedRoot(asset.root);
  root.setAttribute('width', String(size));
  root.setAttribute('height', String(size));
  root.setAttribute('aria-hidden', 'true');
  root.removeAttribute('role');
  root.querySelectorAll(':scope > title').forEach(node => node.remove());
  return root;
}

export function createFallbackSvg(label = 'Unavailable icon', size = 48) {
  const root = createSvgElement('svg', {
    viewBox: '0 0 24 24', width: size, height: size, fill: 'none', stroke: 'currentColor',
    'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    role: 'img', 'aria-label': `${label} unavailable`
  });
  root.append(createSvgElement('rect', { x: 4, y: 4, width: 16, height: 16, rx: 3 }));
  root.append(createSvgElement('path', { d: 'M8 8l8 8M16 8l-8 8' }));
  return root;
}

export function previewContextColor(appearance, background) {
  if (!appearance.currentColor) return appearance.strokeColor;
  return background === 'dark' || background === 'brand' ? '#ffffff' : appearance.strokeColor;
}
