import {
  REQUIRED_VIEWBOX,
  REQUIRED_NAMESPACE,
  ALLOWED_ELEMENTS,
  FORBIDDEN_ELEMENTS,
  ALLOWED_ATTRIBUTES,
  isEventAttribute,
  isHrefAttribute,
  isInvalidReference,
} from '../js/services/svg-policy.js';

// Node has no built-in DOMParser, so this build-time checker extracts tags/attributes
// with regex instead of a real XML parser. The allow-list and reference rules it applies
// come from svg-policy.js, the same module js/services/svg-sanitizer.js uses at runtime,
// so the two can never drift apart on what is allowed.
export function inspectSvgText(text) {
  const errors = [];
  if (typeof text !== 'string' || !text.trim()) return { ok: false, errors: ['SVG is empty.'] };
  if (!/^\s*<svg\b/i.test(text)) errors.push('SVG root is missing.');
  const rootMatch = text.match(/^\s*<svg\b([^>]*)>/i);
  if (!rootMatch) return { ok: false, errors };
  const attrs = rootMatch[1];
  const viewBox = attrs.match(/\bviewBox\s*=\s*["']([^"']+)["']/i)?.[1]?.replace(/\s+/g, ' ').trim();
  if (viewBox !== REQUIRED_VIEWBOX) errors.push('viewBox must be exactly 0 0 24 24.');
  if (/(?:^|\s)(width|height)\s*=/i.test(attrs)) errors.push('Fixed root width/height is forbidden.');
  if (!new RegExp(`\\bxmlns\\s*=\\s*["']${REQUIRED_NAMESPACE.replace(/\//g, '\\/')}["']`, 'i').test(attrs)) {
    errors.push('SVG namespace is required.');
  }
  const tagRegex = /<\/?\s*([a-zA-Z][\w:-]*)\b([^>]*)>/g;
  let tagMatch;
  while ((tagMatch = tagRegex.exec(text))) {
    const tag = tagMatch[1].toLowerCase();
    if (FORBIDDEN_ELEMENTS.has(tag) || !ALLOWED_ELEMENTS.has(tag)) errors.push(`Forbidden SVG element: ${tag}.`);
    if (tagMatch[0].startsWith('</')) continue;
    const attributeRegex = /([:\w-]+)\s*=\s*(["'])(.*?)\2/g;
    let attributeMatch;
    while ((attributeMatch = attributeRegex.exec(tagMatch[2]))) {
      const name = attributeMatch[1].toLowerCase();
      const value = attributeMatch[3].toLowerCase();
      if (isEventAttribute(name)) errors.push(`Event attribute is forbidden: ${name}.`);
      else if (isHrefAttribute(name)) errors.push('SVG href references are forbidden.');
      else if (!ALLOWED_ATTRIBUTES.has(name)) errors.push(`Unsupported SVG attribute: ${name}.`);
      if (name !== 'xmlns' && isInvalidReference(value)) errors.push(`External reference is forbidden: ${name}.`);
    }
  }
  if (!/<\/svg>\s*$/i.test(text)) errors.push('SVG closing tag is missing.');
  return { ok: errors.length === 0, errors: [...new Set(errors)] };
}
