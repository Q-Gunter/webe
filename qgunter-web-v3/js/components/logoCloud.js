/**
 * logoCloud.js
 * Vanilla port of components/1.txt (LogoCloud / InfiniteSlider).
 *
 * Renders a continuous horizontal marquee of technology icons that pauses
 * when the user hovers, with a fade mask at the edges (matching the
 * `[mask-image:linear-gradient(...)]` in the original).
 *
 * The animation is pure CSS (`@keyframes marquee`, `animation-play-state`
 * on hover) so this module just builds the markup, duplicates the children
 * for a seamless loop and renders. No JS rAF needed.
 *
 * Logo source:
 *   We hit cdn.simpleicons.org which returns each brand icon in its
 *   OFFICIAL colour. To swap any icon for a local SVG, replace the `src`
 *   entry below with e.g. `'assets/logos/docker.svg'`. The rest of the
 *   pipeline is identical.
 */

/**
 * Logo list — exactly the eight from the source's demo.tsx, served from
 * the same svgl.app library (the `*-wordmark-light.svg` variants).
 * Combined with the CSS `brightness(0) invert(1)` filter they render white.
 */
export const CORE_PLATFORM_LOGOS = [
  { name: 'Nvidia',    src: 'https://svgl.app/library/nvidia-wordmark-light.svg' },
  { name: 'Supabase',  src: 'https://svgl.app/library/supabase_wordmark_light.svg' },
  { name: 'OpenAI',    src: 'https://svgl.app/library/openai_wordmark_light.svg' },
  { name: 'Turso',     src: 'https://svgl.app/library/turso-wordmark-light.svg' },
  { name: 'Vercel',    src: 'https://svgl.app/library/vercel_wordmark.svg' },
  { name: 'GitHub',    src: 'https://svgl.app/library/github_wordmark_light.svg' },
  { name: 'Claude AI', src: 'https://svgl.app/library/claude-ai-wordmark-icon_light.svg' },
  { name: 'Clerk',     src: 'https://svgl.app/library/clerk-wordmark-light.svg' }
];

/**
 * Render the LogoCloud section as HTML to inject into a view.
 *
 * @param {Object}   [opts]
 * @param {Array}    [opts.logos]   Items in the form { name, src }.
 * @param {string}   [opts.eyebrow] Small uppercase tag above the title.
 * @param {string}   [opts.title1]  First (muted) heading line.
 * @param {string}   [opts.title2]  Second (highlighted) heading line.
 */
export function renderLogoCloud(opts = {}) {
  const logos  = opts.logos  || CORE_PLATFORM_LOGOS;
  const title1 = opts.title1 || 'Trusted by experts.';
  const title2 = opts.title2 || 'Used by the leaders.';

  // The CSS marquee animates from 0 → -33.333%, so the track needs THREE
  // copies of the items. Three copies guarantees that even at the seam of
  // the loop the visible container is fully covered (a single copy of the
  // logos is narrower than the section, which is what caused the black gap
  // at the start of the loop with only 2 copies).
  const items = logos.concat(logos).concat(logos).map(itemHtml).join('');

  return `
    <section class="max-w-[1440px] mx-auto px-8 py-16">
      <h2 class="logo-cloud-title">
        <span class="lede">${escape(title1)}</span><br/>
        <span class="pop">${escape(title2)}</span>
      </h2>

      <div class="logo-cloud-hairline"></div>

      <div class="logo-cloud" aria-label="Logo cloud">
        <div class="logo-cloud-track">${items}</div>
      </div>

      <div class="logo-cloud-hairline"></div>
    </section>
  `;
}

function itemHtml(logo) {
  // No `loading="lazy"` here — we want the browser to start fetching every
  // logo in parallel as soon as the markup is parsed, so the marquee can
  // start with all slots filled. Each <img> has a meaningful title so hover
  // reveals the brand name in a tooltip.
  return `
    <img src="${escapeAttr(logo.src)}"
         alt="${escapeAttr(logo.name)}"
         title="${escapeAttr(logo.name)}"
         draggable="false" />
  `;
}

/**
 * Start the marquee once every <img> inside the host has finished loading
 * (success or error). Call this after the section's HTML is in the DOM.
 *
 * If an image is already complete (e.g. served from cache), it counts
 * toward the ready quorum immediately.
 */
export function initLogoCloud(scope = document) {
  const track = scope.querySelector('.logo-cloud-track');
  if (!track) return;
  const imgs = track.querySelectorAll('img');
  if (!imgs.length) { track.classList.add('is-ready'); return; }

  let loaded = 0;
  const total = imgs.length;
  const safetyTimer = setTimeout(() => { track.classList.add('is-ready'); }, 4000);

  const check = () => {
    if (++loaded >= total) {
      clearTimeout(safetyTimer);
      track.classList.add('is-ready');
    }
  };

  imgs.forEach((img) => {
    if (img.complete && img.naturalWidth > 0) {
      check();
    } else {
      img.addEventListener('load',  check, { once: true });
      img.addEventListener('error', check, { once: true });
    }
  });
}

function escape(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
function escapeAttr(s) { return escape(s); }
