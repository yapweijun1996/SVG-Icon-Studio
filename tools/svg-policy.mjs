import {
  REQUIRED_VIEWBOX,
  REQUIRED_NAMESPACE,
  ALLOWED_ELEMENTS,
  FORBIDDEN_ELEMENTS,
  ALLOWED_ATTRIBUTES,
  isEventAttribute,
  isHrefAttribute,
  hasForbiddenDoctype,
  hasForbiddenProcessingInstruction,
  isInvalidReference,
} from '../js/services/svg-policy.js';

// Node has no built-in DOMParser, so this build-time checker extracts tags/attributes
// with regex instead of a real XML parser. The allow-list and reference rules it applies
// come from svg-policy.js, the same module js/services/svg-sanitizer.js uses at runtime.
// Decode XML character references before policy checks because DOMParser does this
// automatically in the browser; otherwise encoded protocols can bypass build validation.
function decodeXmlAttributeValue(value) {
  const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
  return String(value).replace(/&(?:#(?:x[0-9a-f]+|\d+)|amp|lt|gt|quot|apos);/gi, entity => {
    if (entity[1] !== '#') return named[entity.slice(1, -1).toLowerCase()] ?? entity;
    const body = entity.slice(2, -1);
    const codePoint = Number.parseInt(body.replace(/^x/i, ''), /^x/i.test(body) ? 16 : 10);
    if (!Number.isInteger(codePoint) || codePoint < 0 || codePoint > 0x10ffff || (codePoint >= 0xd800 && codePoint <= 0xdfff)) return entity;
    return String.fromCodePoint(codePoint);
  });
}

export function inspectSvgText(text) {
  const errors = [];
  if (typeof text !== 'string' || !text.trim()) return { ok: false, errors: ['SVG is empty.'] };
  if (hasForbiddenDoctype(text)) errors.push('SVG doctype is forbidden.');
  if (hasForbiddenProcessingInstruction(text)) errors.push('SVG processing instructions are forbidden.');
  const canonicalText = text.replace(/^\s*<\?xml\s+[^?]*\?>/i, '');
  if (!/^\s*<svg\b/i.test(canonicalText)) errors.push('SVG root is missing.');
  const rootMatch = canonicalText.match(/^\s*<svg\b([^>]*)>/i);
  if (!rootMatch) return { ok: false, errors };
  const attrs = rootMatch[1];
  const viewBox = attrs.match(/\bviewBox\s*=\s*["']([^"']+)["']/i)?.[1]?.replace(/\s+/g, ' ').trim();
  if (viewBox !== REQUIRED_VIEWBOX) errors.push('viewBox must be exactly 0 0 24 24.');
  if (/(?:^|\s)(width|height)\s*=/i.test(attrs)) errors.push('Fixed root width/height is forbidden.');
  if (!new RegExp(`\\bxmlns\\s*=\\s*["']${REQUIRED_NAMESPACE.replace(/\//g, '\\/')}["']`, 'i').test(attrs)) {
    errors.push('SVG namespace is required.');
  }
  // Comments and CDATA are inert XML text. Ignore complete sections while scanning
  // for element/attribute policy violations so tag-like text inside them is not
  // mistaken for executable SVG markup. If an opening delimiter remains after
  // complete sections are removed, the XML section is unclosed and must fail closed.
  const scanText = canonicalText
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '');
  if (/<!--|<!\[CDATA\[/.test(scanText)) errors.push('Malformed XML comment or CDATA section.');
  const tagRegex = /<\/?\s*([a-zA-Z][\w:-]*)\b([^>]*)>/g;
  let tagMatch;
  while ((tagMatch = tagRegex.exec(scanText))) {
    const tag = tagMatch[1].toLowerCase();
    if (FORBIDDEN_ELEMENTS.has(tag) || !ALLOWED_ELEMENTS.has(tag)) errors.push(`Forbidden SVG element: ${tag}.`);
    if (tagMatch[0].startsWith('</')) continue;
    const attributeRegex = /([:\w-]+)\s*=\s*(["'])(.*?)\2/g;
    let attributeMatch;
    while ((attributeMatch = attributeRegex.exec(tagMatch[2]))) {
      const name = attributeMatch[1].toLowerCase();
      const value = decodeXmlAttributeValue(attributeMatch[3]);
      if (isEventAttribute(name)) errors.push(`Event attribute is forbidden: ${name}.`);
      else if (isHrefAttribute(name)) errors.push('SVG href references are forbidden.');
      else if (!ALLOWED_ATTRIBUTES.has(name)) errors.push(`Unsupported SVG attribute: ${name}.`);
      if (name === 'xmlns' && value !== REQUIRED_NAMESPACE) errors.push('Foreign SVG namespace is forbidden.');
      if (name !== 'xmlns' && isInvalidReference(value)) errors.push(`External reference is forbidden: ${name}.`);
    }
  }
  if (!/<\/svg>\s*$/i.test(scanText)) errors.push('SVG closing tag is missing.');
  return { ok: errors.length === 0, errors: [...new Set(errors)] };
}
