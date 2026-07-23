import { createRenderedSvg } from './svg-renderer.js';
import { slugify } from '../core/dom.js';

function formatSvg(text) {
  return text.replace(/></g, '>\n  <').replace(/^<svg /, '<svg\n  ').replace(/>\n  <title/, '>\n  <title');
}

export function generateSvg(metadata, asset, appearance, overrides = {}) {
  const settings = { ...appearance, ...overrides };
  const root = createRenderedSvg(metadata, asset, settings, {
    size: settings.size,
    includeTitle: settings.includeTitle
  });
  root.removeAttribute('style');
  return formatSvg(new XMLSerializer().serializeToString(root));
}

export function generateJsx(metadata, asset, appearance) {
  return generateSvg(metadata, asset, appearance)
    .replace(' xmlns="http://www.w3.org/2000/svg"', '')
    .replaceAll('stroke-width', 'strokeWidth')
    .replaceAll('stroke-linecap', 'strokeLinecap')
    .replaceAll('stroke-linejoin', 'strokeLinejoin')
    .replaceAll('fill-rule', 'fillRule')
    .replaceAll('clip-rule', 'clipRule')
    .replaceAll('class=', 'className=');
}

export function generateCss(metadata, asset, appearance) {
  const maskSvg = generateSvg(metadata, asset, {
    ...appearance,
    size: 24,
    currentColor: false,
    strokeColor: '#000000',
    fillColor: '#000000',
    includeTitle: false
  }).replace(/\s+/g, ' ').trim();
  const encoded = encodeURIComponent(maskSvg)
    .replaceAll('%20', ' ')
    .replaceAll('%3D', '=')
    .replaceAll('%3A', ':')
    .replaceAll('%2F', '/');
  return `.icon-${slugify(metadata.id)} {\n  width: ${appearance.size}px;\n  height: ${appearance.size}px;\n  display: inline-block;\n  background-color: currentColor;\n  -webkit-mask: url("data:image/svg+xml,${encoded}") center / contain no-repeat;\n  mask: url("data:image/svg+xml,${encoded}") center / contain no-repeat;\n}`;
}

export function generateCode(tab, metadata, asset, appearance) {
  if (tab === 'jsx') return generateJsx(metadata, asset, appearance);
  if (tab === 'css') return generateCss(metadata, asset, appearance);
  return generateSvg(metadata, asset, appearance);
}
