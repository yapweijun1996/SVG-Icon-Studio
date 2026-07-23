// Canonical SVG allow-list policy, shared by the browser sanitizer
// (js/services/svg-sanitizer.js) and the Node build-time checker
// (tools/svg-policy.mjs) so the two never drift apart again.

export const REQUIRED_VIEWBOX = '0 0 24 24';
export const REQUIRED_NAMESPACE = 'http://www.w3.org/2000/svg';
export const MAX_SVG_LENGTH = 65536;

export const ALLOWED_ELEMENTS = new Set([
  'svg', 'g', 'path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon',
  'title', 'desc', 'defs', 'clippath', 'mask'
]);

export const FORBIDDEN_ELEMENTS = new Set([
  'script', 'foreignobject', 'iframe', 'object', 'embed', 'image', 'audio', 'video',
  'animate', 'animatemotion', 'animatetransform', 'set', 'style', 'a', 'use'
]);

export const ALLOWED_ATTRIBUTES = new Set([
  'xmlns', 'viewbox', 'd', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1',
  'x2', 'y2', 'width', 'height', 'points', 'transform', 'fill', 'stroke',
  'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'fill-rule', 'clip-rule',
  'opacity', 'id', 'clip-path', 'mask', 'clippathunits', 'maskunits',
  'maskcontentunits', 'vector-effect', 'aria-hidden', 'role', 'aria-labelledby',
  'focusable'
]);

export function isDisallowedElement(tag) {
  const normalized = tag.toLowerCase();
  return FORBIDDEN_ELEMENTS.has(normalized) || !ALLOWED_ELEMENTS.has(normalized);
}

export function isDisallowedAttribute(name) {
  return !ALLOWED_ATTRIBUTES.has(name.toLowerCase());
}

export function isEventAttribute(name) {
  return name.toLowerCase().startsWith('on');
}

export function isHrefAttribute(name) {
  const normalized = name.toLowerCase();
  return normalized === 'href' || normalized === 'xlink:href';
}

export function isInvalidReference(value) {
  const normalized = String(value).trim().toLowerCase();
  if (normalized.includes('javascript:') || normalized.includes('data:')) return true;
  if (/https?:|\/\//i.test(normalized)) return true;
  if (normalized.includes('url(') && !/^url\(#[a-z0-9_.:-]+\)$/i.test(normalized)) return true;
  return false;
}
