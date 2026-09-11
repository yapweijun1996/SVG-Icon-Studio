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

// XML/SVG names are case-sensitive. Keep the normalized sets above for the
// conversion tool's existing behavior, but use these exact spellings when
// validating parsed or submitted SVG documents.
export const CANONICAL_ALLOWED_ELEMENTS = new Set([
  'svg', 'g', 'path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon',
  'title', 'desc', 'defs', 'clipPath', 'mask'
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

export const CANONICAL_ALLOWED_ATTRIBUTES = new Set([
  'xmlns', 'viewBox', 'd', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1',
  'x2', 'y2', 'width', 'height', 'points', 'transform', 'fill', 'stroke',
  'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'fill-rule', 'clip-rule',
  'opacity', 'id', 'clip-path', 'mask', 'clipPathUnits', 'maskUnits',
  'maskContentUnits', 'vector-effect', 'aria-hidden', 'role', 'aria-labelledby',
  'focusable'
]);

const CANONICAL_ELEMENT_NAMES = new Map([...CANONICAL_ALLOWED_ELEMENTS].map(name => [name.toLowerCase(), name]));
const CANONICAL_ATTRIBUTE_NAMES = new Map([...CANONICAL_ALLOWED_ATTRIBUTES].map(name => [name.toLowerCase(), name]));

export function canonicalizeAllowedElementName(name) {
  return CANONICAL_ELEMENT_NAMES.get(String(name).toLowerCase()) || null;
}

export function canonicalizeAllowedAttributeName(name) {
  return CANONICAL_ATTRIBUTE_NAMES.get(String(name).toLowerCase()) || null;
}

export function isCanonicalElementName(name) {
  return CANONICAL_ALLOWED_ELEMENTS.has(name);
}

export function isCanonicalAttributeName(name) {
  return CANONICAL_ALLOWED_ATTRIBUTES.has(name);
}

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

export function isDimensionAttribute(name) {
  const normalized = String(name).toLowerCase();
  return normalized === 'width' || normalized === 'height';
}

export function hasForbiddenDoctype(text) {
  return /<!doctype\b/i.test(String(text));
}

export function hasForbiddenProcessingInstruction(text) {
  const withoutXmlDeclaration = String(text).replace(/^\s*<\?xml\s+[^?]*\?>/i, '');
  return /<\?[a-z_][\w:.-]*(?:\s|\?)/i.test(withoutXmlDeclaration);
}

export function isInvalidReference(value) {
  const normalized = String(value).trim().toLowerCase();
  if (normalized.includes('javascript:') || normalized.includes('data:')) return true;
  if (/https?:|\/\//i.test(normalized)) return true;
  if (normalized.includes('url(') && !/^url\(#[a-z0-9_.:-]+\)$/i.test(normalized)) return true;
  return false;
}
