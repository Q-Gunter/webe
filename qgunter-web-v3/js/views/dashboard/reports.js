/**
 * reports.js — /dashboard/reports
 * Lists past pentest engagements; clicking a row navigates to /dashboard/reports/:id.
 */

import { renderDashboard, initDashboard } from './layout.js';
import { MockState } from '../../utils/mockData.js';
import { Router } from '../../utils/router.js';

const ROUTE = '/dashboard/reports';

export const title = 'Reports';

export function render() {
  return renderDashboard(ROUTE, `
    <header style="margin-bottom:1.5rem;">
      <div class="section-eyebrow">// ENGAGEMENT REPORTS</div>
      <h1 class="section-title" style="margin:0;">Reports</h1>
      <p class="muted text-sm" style="font-family:var(--font-sans); margin-top:0.5rem;">
        Each completed engagement produces a forensic report. Click a row for full findings.
      </p>
    </header>

    <div class="q-panel" style="overflow:hidden;">
      <table class="q-table">
        <thead>
          <tr>
            <th>Instance</th>
            <th>Target</th>
            <th>Started</th>
            <th>Ended</th>
            <th>Duration</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody id="reports-tbody">
          ${MockState.reports.map(renderRow).join('')}
        </tbody>
      </table>
    </div>
  `);
}

export function init() {
  initDashboard();

  document.getElementById('reports-tbody').addEventListener('click', (e) => {
    const tr = e.target.closest('tr[data-id]');
    if (!tr) return;
    Router.navigate(`/dashboard/reports/${tr.getAttribute('data-id')}`);
  });
}

function renderRow(r) {
  return `
    <tr data-id="${escape(r.id)}">
      <td class="gold" style="font-family:var(--font-mono);">${escape(r.instance)}</td>
      <td style="font-family:var(--font-mono);">${truncate(r.target, 22)}</td>
      <td class="muted">${escape(r.started)}</td>
      <td class="muted">${escape(r.ended)}</td>
      <td>${escape(r.duration)}</td>
      <td><span class="badge ${statusBadgeClass(r.status)}">${r.status}</span></td>
    </tr>`;
}

function truncate(s, n) {
  if (!s) return '';
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

function statusBadgeClass(s) {
  switch (String(s).toLowerCase()) {
    case 'running':   return 'badge-running';
    case 'completed': return 'badge-completed';
    case 'failed':    return 'badge-failed';
    default:          return 'badge-stopped';
  }
}

function escape(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
