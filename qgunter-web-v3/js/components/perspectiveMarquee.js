/**
 * perspectiveMarquee.js
 * Faithful vanilla port of components/6.txt (PerspectiveMarquee).
 *
 * What the source does (and what we replicate):
 *   - A horizontal rail of giant words tilted in 3D with rotateY+rotateX,
 *     inside a perspective wrapper.
 *   - Items are tripled so the loop is seamless.
 *   - Each word's `filter: blur(...)` and `opacity` depend on its distance
 *     to the viewport horizontal centre — words at the centre are sharp and
 *     opaque, words at the edges are blurred and dimmer. That's the "depth"
 *     trick that makes it feel cinematographic. We update this per-frame.
 *   - Edge fades. The source uses two solid-colour gradient overlays sized to
 *     match the fadeColor; for a TRANSPARENT background we use `mask-image`
 *     so the fade reveals whatever's behind, not a solid block.
 *
 * Differences from the source:
 *   - Speed is in pixels/sec (instead of "pixelsPerFrame" tied to Remotion's
 *     frame counter). Easier to reason about across screens.
 *   - `colors` accepts an array — colours rotate per-word index, so the
 *     pattern repeats every items.length items even with tripled rendering.
 *   - `background: 'transparent'` switches the edge fade from coloured
 *     overlays to a mask-image so the section blends with whatever's behind.
 *
 * Mount API:
 *   const handle = mountPerspectiveMarquee(host, {
 *     items: ['Recon', 'Enumeration', ...],
 *     fontSize: 64,
 *     speed: 60,
 *     colors: ['#EAB308', '#F5F5DC'],
 *     rotateY: -28, rotateX: 8, perspective: 1200,
 *     background: 'transparent'
 *   });
 *   handle.destroy();
 */

export function mountPerspectiveMarquee(host, opts = {}) {
  if (!host) return { destroy() {} };

  const items       = opts.items       || ['Recon', 'Enumeration', 'Exploitation', 'Post-Exploitation', 'Documentation'];
  const fontSize    = opts.fontSize    ?? 64;
  const rotateY     = opts.rotateY     ?? -28;
  const rotateX     = opts.rotateX     ?? 8;
  const perspective = opts.perspective ?? 1200;
  const speed       = opts.speed       ?? 60;       // pixels/second
  const colors      = opts.colors      || ['#fafafa']; // rotate per item index
  const background  = opts.background  || 'transparent';
  const fadeColor   = opts.fadeColor   || background;
  const fontWeight  = opts.fontWeight  ?? 700;
  const fontFamily  = opts.fontFamily  || 'var(--font-mono)';
  const itemPadding = fontSize * 0.9;

  // ---------- Host setup ---------------------------------------------------
  host.innerHTML = '';
  host.style.position   = 'relative';
  host.style.overflow   = 'hidden';
  host.style.perspective = `${perspective}px`;
  host.style.background  = background;

  // Transparent fade: use mask-image on the host so we reveal whatever is
  // behind (page noise/grid). Coloured fade: use overlay gradients.
  if (background === 'transparent') {
    const maskH = `linear-gradient(90deg, transparent 0%, black 18%, black 82%, transparent 100%)`;
    const maskV = `linear-gradient(180deg, transparent 0%, black 25%, black 75%, transparent 100%)`;
    host.style.maskImage = `${maskH}, ${maskV}`;
    host.style.webkitMaskImage = `${maskH}, ${maskV}`;
    host.style.maskComposite = 'intersect';
    host.style.webkitMaskComposite = 'source-in';
  }

  // ---------- 3D stage -----------------------------------------------------
  const stage = document.createElement('div');
  stage.style.position = 'absolute';
  stage.style.inset = '0';
  stage.style.display = 'flex';
  stage.style.alignItems = 'center';
  stage.style.justifyContent = 'flex-start';
  stage.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  stage.style.transformStyle = 'preserve-3d';
  host.appendChild(stage);

  // ---------- Strip (the thing that translates left) ----------------------
  const strip = document.createElement('div');
  strip.style.display = 'flex';
  strip.style.alignItems = 'center';
  strip.style.whiteSpace = 'nowrap';
  strip.style.willChange = 'transform';
  stage.appendChild(strip);

  const tripled = [...items, ...items, ...items];
  const spans = tripled.map((label, i) => {
    const span = document.createElement('span');
    span.textContent = label;
    span.style.display = 'inline-block';
    span.style.fontFamily = fontFamily;
    span.style.fontSize = `${fontSize}px`;
    span.style.fontWeight = String(fontWeight);
    span.style.letterSpacing = '-0.03em';
    span.style.lineHeight = '1';
    span.style.paddingRight = `${itemPadding}px`;
    // Colour rotates by ORIGINAL word index, not tripled index, so the
    // pattern stays consistent across copies.
    span.style.color = colors[(i % items.length) % colors.length];
    span.style.willChange = 'filter, opacity';
    strip.appendChild(span);
    return span;
  });

  // ---------- Coloured fade overlay (only when background is solid) -------
  if (background !== 'transparent') {
    const fade = document.createElement('div');
    fade.style.position = 'absolute';
    fade.style.inset = '0';
    fade.style.pointerEvents = 'none';
    fade.style.background =
      `linear-gradient(90deg,  ${fadeColor} 0%, transparent 18%, transparent 82%, ${fadeColor} 100%),
       linear-gradient(180deg, ${fadeColor} 0%, transparent 25%, transparent 75%, ${fadeColor} 100%)`;
    host.appendChild(fade);
  }

  // ---------- Animation ----------------------------------------------------
  let raf = 0;
  let last = 0;
  let offset = 0;
  let oneThird = 0;
  let disposed = false;
  let stageWidth = 0;

  // Need a frame for the DOM to lay out before we can measure.
  requestAnimationFrame(() => {
    oneThird = strip.scrollWidth / 3;
    stageWidth = host.clientWidth || 1;
    last = performance.now();
    tick(last);
  });

  function tick(t) {
    if (disposed) return;
    const dt = (t - last) / 1000;
    last = t;

    offset -= speed * dt;
    if (oneThird && offset <= -oneThird) offset += oneThird;
    strip.style.transform = `translateX(${offset}px)`;

    // Per-span depth treatment.
    const centre = stageWidth / 2;
    for (let i = 0; i < spans.length; i++) {
      const s = spans[i];
      const spanCentre = s.offsetLeft + s.offsetWidth / 2 + offset;
      const norm = (spanCentre - centre) / centre;
      const distance = Math.min(1, Math.abs(norm));
      s.style.filter  = `blur(${distance * 6}px)`;
      s.style.opacity = String(1 - distance * 0.4);
    }

    raf = requestAnimationFrame(tick);
  }

  // Resize observer to keep stageWidth current.
  const ro = new ResizeObserver(() => {
    stageWidth = host.clientWidth || stageWidth;
  });
  ro.observe(host);

  return {
    destroy() {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
    }
  };
}
