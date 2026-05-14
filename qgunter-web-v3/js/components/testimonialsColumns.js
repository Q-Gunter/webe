/**
 * testimonialsColumns.js
 * Vanilla port of components/5.txt (TestimonialsColumn).
 *
 * Layout matches the source:
 *   - 3 columns side by side (col-b hidden under md, col-c hidden under lg)
 *   - Each column animates translateY from 0 → -50% in a linear infinite loop,
 *     with its own duration (15s / 19s / 17s) so they desync visually.
 *   - Cards duplicated inside the track so the seam is invisible.
 *   - Container masked with a vertical fade (transparent → black 25% → black 75% → transparent)
 *     and clipped to max-height 740px.
 *
 * Brand divergences (intentional, not faithful to the demo):
 *   - Sharp/flat corners instead of rounded-3xl (Q-Gunter is corporate-cyber, not friendly-SaaS).
 *   - Avatars are 2-letter sector monograms (gold ring + gold text) instead of stock photos.
 *   - Identity = role + anonymized sector (e.g. "CISO · European fintech").
 */

/**
 * 9 testimonios — 5 técnicos, 4 ejecutivos. Anonimizados, sin nombres ni
 * empresas reales (Q-Gunter es una plataforma B2B en fase temprana).
 */
export const FIELD_REPORTS = [
  // ---- Column 1 (technical) ----
  {
    text: 'Caught a deserialization gadget chain spanning two microservices on the third run. Our team had reviewed the same code path twice and missed it.',
    role: 'Sec Eng Lead',
    sector: 'European fintech',
    monogram: 'FT'
  },
  {
    text: 'PQC key rotation slotted into our existing HSM workflow without custom glue. The integration doc was four pages and it was honest about every assumption.',
    role: 'Cloud Security Architect',
    sector: 'Defense contractor',
    monogram: 'DF'
  },
  {
    text: 'Continuous engagements caught a regression in our auth middleware the same week it shipped. We caught it before it touched prod data.',
    role: 'Head of AppSec',
    sector: 'Healthcare SaaS',
    monogram: 'HC'
  },

  // ---- Column 2 (mixed, leaning executive) ----
  {
    text: 'We replaced two annual external audits with rolling Q-Gunter engagements. Budget went down, coverage went up. That conversation does not normally happen.',
    role: 'CTO',
    sector: 'Mid-market SaaS',
    monogram: 'SS'
  },
  {
    text: 'Reports land actionable. No filler, no theatre. Our remediation cycle dropped roughly 40% in the first quarter using the platform.',
    role: 'VP Engineering',
    sector: 'Series B insurtech',
    monogram: 'IN'
  },
  {
    text: 'The agent ranks findings by exploit chain depth, not just CVSS. That changed how my detection team prioritizes alerts downstream.',
    role: 'Detection Engineer',
    sector: 'Retail e-commerce',
    monogram: 'EC'
  },

  // ---- Column 3 (mixed, leaning executive + compliance) ----
  {
    text: 'Audit cycle dropped from six weeks to ten days. The CFO is the one championing the contract renewal, which tells you everything.',
    role: 'GRC Director',
    sector: 'Healthcare network',
    monogram: 'HC'
  },
  {
    text: 'Container isolation lets us scope tests aggressively without risking the runtime. The blast radius is exactly what the contract said it would be.',
    role: 'Principal Sec Engineer',
    sector: 'Energy utility',
    monogram: 'EN'
  },
  {
    text: 'Our cyber broker accepted the engagement report without follow-up questions. Premium came down roughly 18% at renewal — that paid for the year.',
    role: 'CEO',
    sector: 'Industrial manufacturing',
    monogram: 'MF'
  }
];

/**
 * Render the testimonials section as HTML to inject into the landing.
 *
 * @param {Object} [opts]
 * @param {Array}  [opts.testimonials] Custom list of { text, role, sector, monogram }.
 * @param {string} [opts.title]        h2 text. Defaults to "What security teams say".
 * @param {string} [opts.eyebrow]      Small uppercase tag above the title.
 */
export function renderTestimonials(opts = {}) {
  const list    = opts.testimonials || FIELD_REPORTS;
  const title   = opts.title   || 'What security teams say';
  const eyebrow = opts.eyebrow || '// FIELD REPORTS';

  // Split into 3 columns of 3 each (extras go round-robin into the first cols).
  const cols = [[], [], []];
  list.forEach((t, i) => cols[i % 3].push(t));

  return `
    <section class="max-w-[1440px] mx-auto px-8 py-20 border-t border-q-border">
      <div class="text-center" style="max-width: 540px; margin: 0 auto 2.5rem;">
        <div class="section-eyebrow" style="text-align:center;">${escape(eyebrow)}</div>
        <h2 class="section-title" style="margin: 0.6rem 0 0 0;">${escape(title)}</h2>
      </div>

      <div class="testimonials-grid">
        ${columnHtml(cols[0], 'col-a')}
        ${columnHtml(cols[1], 'col-b')}
        ${columnHtml(cols[2], 'col-c')}
      </div>
    </section>
  `;
}

function columnHtml(items, variant) {
  if (!items || !items.length) return '';
  // Duplicate the items so the translateY: -50% loop is seamless.
  const cards = items.concat(items).map(cardHtml).join('');
  return `
    <div class="testimonials-col-wrap">
      <div class="testimonials-col ${variant}">
        ${cards}
      </div>
    </div>
  `;
}

function cardHtml(t) {
  return `
    <div class="testimonial">
      <p class="t-quote">${escape(t.text)}</p>
      <div class="t-author">
        <div class="testimonial-avatar" aria-hidden="true">${escape(t.monogram || '••')}</div>
        <div class="t-meta">
          <span class="t-role">${escape(t.role)}</span>
          <span class="t-sector">${escape(t.sector)}</span>
        </div>
      </div>
    </div>
  `;
}

function escape(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
