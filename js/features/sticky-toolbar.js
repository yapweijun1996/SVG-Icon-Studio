// Keeps the sticky catalogue toolbar honest about the space it occupies:
// - publishes its live height as --toolbar-height so focused cards can scroll
//   clear of it (see --sticky-offset / scroll-margin-top in CSS);
// - marks it .is-stuck while it overlaps scrolled content, so the edge reads
//   as a fixed bar instead of cards looking cut off.
export function createStickyToolbarController({ toolbar, root = document.documentElement }) {
  if (!toolbar) return;

  const publishHeight = () => {
    root.style.setProperty('--toolbar-height', `${Math.ceil(toolbar.getBoundingClientRect().height)}px`);
  };

  let frame = 0;
  const syncStuck = () => {
    frame = 0;
    const stickyTop = parseFloat(getComputedStyle(toolbar).top) || 0;
    toolbar.classList.toggle('is-stuck', window.scrollY > 0 && toolbar.getBoundingClientRect().top <= stickyTop + 0.5);
  };
  const requestSync = () => { if (!frame) frame = requestAnimationFrame(syncStuck); };

  publishHeight();
  syncStuck();
  // Height changes when the advanced filter opens, chips load or breakpoints switch.
  if (typeof ResizeObserver === 'function') new ResizeObserver(publishHeight).observe(toolbar);
  else window.addEventListener('resize', publishHeight);
  window.addEventListener('scroll', requestSync, { passive: true });
  window.addEventListener('resize', requestSync);
}
