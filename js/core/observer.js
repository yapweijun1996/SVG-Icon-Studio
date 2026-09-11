export function createIntersectionObserver(callback, options) {
  return typeof IntersectionObserver === 'function' ? new IntersectionObserver(callback, options) : null;
}
