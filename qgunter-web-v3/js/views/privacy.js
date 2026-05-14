/**
 * privacy.js — /privacy. Minimal readable legal layout.
 */

import { publicNavbar, publicFooter, initPublicShell } from './_publicShell.js';

let shellHandle = null;

export const title = 'Privacy Policy';

export function render() {
  return `
    <div class="view">
      ${publicNavbar()}
      <article class="max-w-3xl mx-auto px-6 py-16">
        <div class="section-eyebrow">// LEGAL // PRIVACY</div>
        <h1 class="section-title">Privacy Policy</h1>
        <p class="section-lede mb-8">We collect the minimum data required to operate the platform and to meet our regulatory obligations.</p>

        ${section('Data we collect',
          `Account and contact data (name, work email, company), session metadata
           (login timestamps, source IP), and engagement artifacts produced by the
           autonomous agents during contractually scoped pentests.`)}

        ${section('How we use it',
          `Account data is used solely for service delivery and billing. Engagement
           artifacts are accessed only by personnel directly assigned to the engagement
           or, anonymized and aggregated, for platform improvement.`)}

        ${section('Subprocessors',
          `A current list of subprocessors (cloud, observability, mail relay, model
           providers) is maintained in Schedule C of the MSA and updated with 30-day
           prior notice.`)}

        ${section('Your rights',
          `Under GDPR you may request access, rectification, portability, or erasure
           of personal data we process. Requests should be sent to privacy@qgunter.io
           and will be answered within 30 days.`)}
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
