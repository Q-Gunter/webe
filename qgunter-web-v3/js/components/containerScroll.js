/**
 * containerScroll.js
 * Vanilla + GSAP-ScrollTrigger port of components/3.txt / 4.txt
 * (container-scroll-animation.tsx).
 *
 * Renders a "device frame" that rotates flat (rotateX 20°→0°) and scales as
 * the user scrolls through it. The header above translates upward in tandem.
 *
 * Mappings (same as the source):
 *   - rotate    : scrollYProgress [0, 1] → [20, 0]   (degrees)
 *   - scale     : [0, 1] → desktop [1.05, 1.0] | mobile [0.7, 0.9]
 *   - translate : [0, 1] → [0, -100]   (px, applied to BOTH header and card)
 *
 * Expects this markup inside `root`:
 *   <div class="container-scroll">
 *     <div class="cs-header"> ...title... </div>
 *     <div class="cs-card">   ...frame and contents... </div>
 *   </div>
 */

export function mountContainerScroll(root) {
  if (!root || !window.gsap || !window.ScrollTrigger) return { destroy() {} };

  const header = root.querySelector('.cs-header');
  const card   = root.querySelector('.cs-card');
  if (!card) return { destroy() {} };

  const gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);

  // "Dramatic" profile (per user) — more pronounced tilt + scale swing.
  const isMobile = window.innerWidth <= 768;
  const fromScale = isMobile ? 0.6  : 1.10;
  const toScale   = isMobile ? 0.85 : 0.95;
  const fromRotate = 35;

  card.style.transformStyle = 'preserve-3d';
  card.style.willChange = 'transform';
  if (header) header.style.willChange = 'transform';

  // Tighter scroll range than the demo: animation starts as the section
  // enters from the bottom and finishes once the section's middle reaches
  // the viewport centre — so the laptop is fully flat well before scrolling
  // out, instead of dragging the whole rotation across the entire trigger.
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: root,
      start: 'top 85%',
      end:   'center 55%',
      scrub: true,
      invalidateOnRefresh: true
    }
  });

  tl.fromTo(card,
    { rotateX: fromRotate, scale: fromScale, y: 0 },
    { rotateX: 0,          scale: toScale,   y: -100, ease: 'none' },
    0
  );

  if (header) {
    tl.fromTo(header,
      { y: 0 },
      { y: -100, ease: 'none' },
      0
    );
  }

  return {
    destroy() {
      tl.scrollTrigger?.kill();
      tl.kill();
    }
  };
}
