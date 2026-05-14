/**
 * backgroundPlus.js
 * Vanilla port of components/9.txt (BackgroundPlus).
 *
 * Returns an absolutely-positioned `<div>` that paints the tiled plus
 * pattern from heropatterns.com over its parent. The SVG, colour, opacity
 * and radial fade live in the `.q-plus-bg` class in styles.css; this helper
 * just emits the element so call-sites stay clean.
 *
 * Usage:
 *   <section class="... relative" style="overflow:hidden;">
 *     ${renderBackgroundPlus()}
 *     ...your content (must be position:relative; z-index:>0)...
 *   </section>
 *
 * The parent MUST have:
 *   - `position: relative` (so the absolute child positions correctly)
 *   - `overflow: hidden` (so the pattern doesn't leak out of rounded panels)
 */
export function renderBackgroundPlus() {
  return `<div class="q-plus-bg" aria-hidden="true"></div>`;
}
