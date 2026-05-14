/**
 * admin/requests.js — /admin/requests
 *
 * Lists incoming /contact submissions. The admin can:
 *   - View full details inline (the use-case description is long)
 *   - Click "Create account" → modal pre-filled with the requester's data,
 *     admin sets an initial password, clicks "Create account" → a User row
 *     is added to MockState.users and the request status flips to 'approved'.
 *   - Click "Reject" → status flips to 'rejected' (no account is created).
 *
 * Workflow: "Modal de creación manual" per the user's choice.
 */

import { renderAdmin, initAdmin } from './layout.js';
import { MockState } from '../../utils/mockData.js';
import { openModal } from '../../components/modal.js';
import { toast } from '../../components/toast.js';

const ROUTE = '/admin/requests';

export const title = 'Admin — Requests';

export function render() {
  return renderAdmin(ROUTE, `
    <header style="display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem;">
      <div>
        <div class="section-eyebrow">// CONTACT REQUESTS</div>
        <h1 class="section-title" style="margin:0;">Inbound requests</h1>
        <p class="muted text-sm" style="font-family:var(--font-sans); margin-top:0.5rem;">
          Pending requests submitted through the public /contact form. Approve to provision a client account.
        </p>
      </div>
      <div class="admin-tally">
        ${tallyBlock('Pending',  countByStatus('pending'),  'badge-pending')}
        ${tallyBlock('Approved', countByStatus('approved'), 'badge-running')}
        ${tallyBlock('Rejected', countByStatus('rejected'), 'badge-failed')}
      </div>
    </header>

    <div class="q-panel" style="overflow:hidden;">
      <table class="q-table admin-requests-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Contact</th>
            <th>Role</th>
            <th>Submitted</th>
            <th>Status</th>
            <th style="text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody id="requests-tbody">
          ${MockState.contactRequests.map(rowHtml).join('')}
        </tbody>
      </table>
    </div>
  `);
}

export function init() {
  initAdmin();

  const tbody = document.getElementById('requests-tbody');
  tbody.addEventListener('click', (e) => {
    const trDetails = e.target.closest('tr[data-toggle]');
    if (trDetails && !e.target.closest('button')) {
      const id = trDetails.getAttribute('data-id');
      const expanded = document.querySelector(`tr[data-details-for="${id}"]`);
      expanded?.classList.toggle('open');
      return;
    }

    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    const action = btn.getAttribute('data-action');
    const req = MockState.contactRequests.find(r => r.id === id);
    if (!req) return;

    if (action === 'approve') openApproveModal(req);
    if (action === 'reject')  openRejectModal(req);
    if (action === 'reopen')  { req.status = 'pending'; refresh(); toast(`Request ${req.id} reopened`, { variant: 'warn' }); }
  });
}

/* ----- internals --------------------------------------------------------- */

function refresh() {
  document.getElementById('requests-tbody').innerHTML =
    MockState.contactRequests.map(rowHtml).join('');
  // Refresh tally chips too.
  document.querySelectorAll('[data-tally]').forEach(el => {
    const key = el.getAttribute('data-tally');
    el.textContent = String(countByStatus(key));
  });
}

function countByStatus(s) {
  return MockState.contactRequests.filter(r => r.status === s).length;
}

function tallyBlock(label, count, badgeCls) {
  return `
    <div class="admin-tally-item">
      <span class="label-tag">${label}</span>
      <span class="badge ${badgeCls}" data-tally="${label.toLowerCase()}">${count}</span>
    </div>`;
}

function rowHtml(r) {
  const statusCls = {
    pending:  'badge-pending',
    approved: 'badge-running',
    rejected: 'badge-failed'
  }[r.status] || 'badge-stopped';

  const actions = r.status === 'pending'
    ? `<button class="btn btn-primary btn-sm" data-action="approve" data-id="${r.id}">Approve</button>
       <button class="btn btn-danger btn-sm"  data-action="reject"  data-id="${r.id}">Reject</button>`
    : `<button class="btn btn-ghost btn-sm" data-action="reopen" data-id="${r.id}">Reopen</button>`;

  return `
    <tr data-id="${r.id}" data-toggle>
      <td class="gold" style="font-family:var(--font-mono);">${escape(r.company)}</td>
      <td>
        <div>${escape(r.name)}</div>
        <div class="muted text-xs">${escape(r.email)}</div>
      </td>
      <td class="muted" style="font-family:var(--font-mono);">${escape(r.role)}</td>
      <td class="muted" style="font-family:var(--font-mono); font-size:0.72rem;">${escape(r.submitted)}</td>
      <td><span class="badge ${statusCls}">${escape(r.status)}</span></td>
      <td style="text-align:right; white-space:nowrap;">${actions}</td>
    </tr>
    <tr data-details-for="${r.id}" class="admin-details-row">
      <td colspan="6">
        <div class="admin-details">
          <div class="label-tag">// USE CASE</div>
          <p>${escape(r.useCase)}</p>
        </div>
      </td>
    </tr>
  `;
}

/* ----- modals ------------------------------------------------------------ */

function openApproveModal(req) {
  const formId = 'approve-form';
  openModal({
    title: 'Create Account',
    body: `
      <p style="margin-top:0;">Provision a client account from this request.</p>
      <form id="${formId}" class="grid gap-3" style="margin-top:0.8rem;">
        <div class="grid md:grid-cols-2 gap-3">
          <label class="field">
            <span class="field-label">Full name</span>
            <input class="field-input" name="name" required value="${escapeAttr(req.name)}" />
          </label>
          <label class="field">
            <span class="field-label">Email</span>
            <input class="field-input" name="email" type="email" required value="${escapeAttr(req.email)}" />
          </label>
        </div>
        <label class="field">
          <span class="field-label">Company</span>
          <input class="field-input" name="company" required value="${escapeAttr(req.company)}" />
        </label>
        <label class="field">
          <span class="field-label">Initial password *</span>
          <input class="field-input" name="password" type="text" required minlength="8"
                 placeholder="Communicate this to the client through a secure channel." />
        </label>
        <p class="muted text-xs" style="font-family:var(--font-mono); letter-spacing:0.1em; margin:0;">
          The password is shown once and not stored in plaintext on the platform.
        </p>
      </form>
    `,
    actions: [
      { label: 'Cancel', variant: 'ghost', onClick: c => c() },
      { label: 'Create account', variant: 'primary', onClick: (close) => {
        const form = document.getElementById(formId);
        const fd = new FormData(form);
        const name = String(fd.get('name') || '').trim();
        const email = String(fd.get('email') || '').trim();
        const company = String(fd.get('company') || '').trim();
        const password = String(fd.get('password') || '').trim();

        if (!name || !email || !company || password.length < 8) {
          toast('Fill every field and use a password of 8+ characters', { variant: 'err' });
          return;
        }

        // Mock: create the user and mark the request approved.
        const nextId = Math.max(0, ...MockState.users.map(u => u.id)) + 1;
        MockState.users.unshift({
          id: nextId,
          name, email, company,
          role: 'user',
          status: 'Active',
          created: new Date().toISOString().slice(0, 10)
        });
        req.status = 'approved';

        close();
        refresh();
        toast(`Account #${nextId} created for ${company}`, { variant: 'ok' });
      }}
    ]
  });
}

function openRejectModal(req) {
  openModal({
    title: 'Reject Request',
    body: `Reject the contact request from <strong class="gold">${escape(req.company)}</strong>?
           This won't notify them automatically — communicate the decision through your usual channel.`,
    actions: [
      { label: 'Cancel', variant: 'ghost', onClick: c => c() },
      { label: 'Reject', variant: 'danger', onClick: (close) => {
        req.status = 'rejected';
        close();
        refresh();
        toast(`Request ${req.id} rejected`, { variant: 'warn' });
      }}
    ]
  });
}

function escape(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
function escapeAttr(s) { return escape(s); }
