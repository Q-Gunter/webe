/**
 * reportDetail.js — /dashboard/reports/:id
 * Header (target, dates, instance, risk badge), executive summary,
 * methodology timeline, findings table, download button (mock toast).
 */

import { renderDashboard, initDashboard } from './layout.js';
import { MockState } from '../../utils/mockData.js';
import { Router } from '../../utils/router.js';
import { toast } from '../../components/toast.js';

const ROUTE = '/dashboard/reports';
const STAGES = ['Passive Recon','Active Recon','Enumeration','Exploitation','Post-Exploitation','Documentation'];

export const title = 'Report Detail';

export function render(params) {
  const r = MockState.reports.find(x => x.id === params.id);
  if (!r) {
    return renderDashboard(ROUTE, `
      <div class="q-panel p-8 text-center">
        <h2 class="section-title" style="margin:0;">Report not found</h2>
        <p class="muted">No record matches ID <span class="gold">${escape(params.id)}</span>.</p>
        <a href="/dashboard/reports" data-link class="btn btn-primary mt-4">Back to Reports</a>
      </div>
    `);
  }

  const riskCls = severityClass(r.riskScore);

  return renderDashboard(ROUTE, `
    <a href="/dashboard/reports" data-link class="muted text-xs" style="font-family:var(--font-mono); letter-spacing:0.2em;">
      ← BACK TO REPORTS
    </a>

    <header class="q-panel p-6 mt-3" style="display:flex; flex-wrap:wrap; gap:1.5rem; align-items:flex-start; justify-content:space-between;">
      <div>
        <div class="section-eyebrow">// ENGAGEMENT REPORT</div>
        <h1 style="font-family:var(--font-mono); font-size:1.6rem; margin:0.25rem 0;">${escape(r.target)}</h1>
        <div class="muted text-sm" style="font-family:var(--font-mono);">
          ${escape(r.instance)} • ${escape(r.started)} → ${escape(r.ended)} • ${escape(r.duration)}
        </div>
      </div>
      <div style="display:flex; flex-direction:column; align-items:flex-end; gap:0.6rem;">
        <span class="severity-pill" style="color: ${riskCls};">RISK: ${escape(r.riskScore)}</span>
        <button id="download-pdf-btn" class="btn btn-primary btn-sm">Download PDF</button>
      </div>
    </header>

    <section class="mt-6">
      <div class="section-eyebrow">// EXECUTIVE SUMMARY</div>
      <div class="q-panel p-6" style="font-family:var(--font-sans); color:var(--q-cream-dim); line-height:1.65;">
        ${escape(r.summary)}
      </div>
    </section>

    <section class="mt-8">
      <div class="section-eyebrow">// METHODOLOGY</div>
      <div class="timeline">
        ${STAGES.map((s, i) => `
          <div class="stage">
            <span class="num">${String(i+1).padStart(2,'0')}</span>
            ${s}
          </div>
        `).join('')}
      </div>
    </section>

    <section class="mt-8">
      <div class="section-eyebrow">// FINDINGS (${r.findings.length})</div>
      ${r.findings.length === 0
        ? `<div class="q-panel p-6 muted">No findings — engagement did not reach exploitation phase.</div>`
        : `<div class="q-panel" style="overflow:hidden;">
            <table class="q-table">
              <thead>
                <tr>
                  <th>Vulnerability</th>
                  <th>Severity</th>
                  <th>CVSS</th>
                  <th>Affected Component</th>
                  <th>Remediation</th>
                </tr>
              </thead>
              <tbody>
                ${r.findings.map(f => `
                  <tr>
                    <td>${escape(f.name)}</td>
                    <td><span class="badge ${sevBadge(f.severity)}">${escape(f.severity)}</span></td>
                    <td class="gold" style="font-family:var(--font-mono);">${escape(f.cvss)}</td>
                    <td class="muted" style="font-family:var(--font-mono);">${escape(f.component)}</td>
                    <td>${escape(f.remediation)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>`}
    </section>
  `);
}

export function init(params) {
  initDashboard();

  document.getElementById('download-pdf-btn')?.addEventListener('click', () => {
    toast('Generating report…', { variant: 'ok', duration: 2400 });
  });
}

function severityClass(s) {
  switch (String(s).toLowerCase()) {
    case 'critical': return 'var(--sev-critical)';
    case 'high':     return 'var(--sev-high)';
    case 'medium':   return 'var(--sev-medium)';
    case 'low':      return 'var(--sev-low)';
    default:         return 'var(--q-cream-faint)';
  }
}
function sevBadge(s) {
  switch (String(s).toLowerCase()) {
    case 'critical': return 'badge-sev-critical';
    case 'high':     return 'badge-sev-high';
    case 'medium':   return 'badge-sev-medium';
    case 'low':      return 'badge-sev-low';
    default:         return 'badge-stopped';
  }
}
function escape(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
