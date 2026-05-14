/**
 * terms.js — /terms. Minimal readable legal layout.
 */

import { publicNavbar, publicFooter, initPublicShell } from './_publicShell.js';

let shellHandle = null;

export const title = 'Terms of Service';

export function render() {
  return `
    <div class="view">
      ${publicNavbar()}
      <article class="max-w-3xl mx-auto px-6 py-16">
        <div class="section-eyebrow">// LEGAL // TERMS</div>
        <h1 class="section-title">Terms of Service</h1>
        <p class="section-lede mb-8">Last updated: 2026-01-15. Effective for all engagements covered by a signed MSA.</p>

        ${section('1. Scope of service',
          `Q-Gunter, S.L. provides authorized, contract-bound penetration testing services
           orchestrated by automated agents. Use of the platform is restricted to assets
           explicitly enumerated in the Rules of Engagement (ROE) annex of the Master
           Services Agreement.`)}

        ${section('2. Acceptable use',
          `Clients warrant that they have authority to authorize testing against every
           target submitted to the platform. Out-of-scope targeting, traffic redirection,
           or weaponization of platform output against third parties is prohibited and
           grounds for immediate termination.`)}

        ${section('3. Data handling',
          `All engagement artifacts (recon data, exploit traces, reports) are stored encrypted
           at rest using AES-256-GCM and in transit using TLS 1.3 with Post-Quantum hybrid key
           exchange. Retention follows the schedule defined in Schedule B of the MSA.`)}

        ${section('4. Liability',
          `Q-Gunter conducts engagements in good faith using industry-standard safeguards.
           Clients acknowledge that automated security testing carries inherent risk to
           production systems and agree to maintain rollback capability and monitoring
           during scheduled windows.`)}

        ${section('5. Termination',
          `Either party may terminate the engagement per the notice provisions of the MSA.
           Upon termination, all credentials are revoked, containers are destroyed, and
           artifacts are handed over or purged per the client's documented preference.`)}
      </article>
      ${publicFooter()}
    </div>
  `;
}

export function init() { shellHandle = initPublicShell(); }
export function destroy() { if (shellHandle) { shellHandle.destroy(); shellHandle = null; } }

function section(title, body) {
  return `
    <section class="mb-8">
      <h2 style="font-family:var(--font-mono); font-size:1.1rem; color:var(--q-gold); letter-spacing:0.08em; margin-bottom:0.6rem;">
        ${title}
      </h2>
      <p style="font-family:var(--font-sans); color:var(--q-cream-dim); line-height:1.65;">${body}</p>
    </section>`;
}
