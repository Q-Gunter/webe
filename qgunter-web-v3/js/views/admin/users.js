/**
 * admin/users.js — /admin/users
 *
 * Lists every account on the platform. The admin can:
 *   - Suspend / reactivate an account
 *   - Reset its password (mock: shows a generated string in a modal)
 *   - Delete it permanently (with confirmation)
 *
 * The admin's own account is read-only — you can't suspend or delete the
 * currently logged-in user from the UI.
 */

import { renderAdmin, initAdmin } from './layout.js';
import { MockState } from '../../utils/mockData.js';
import { Auth } from '../../utils/auth.js';
import { openModal } from '../../components/modal.js';
import { toast } from '../../components/toast.js';

const ROUTE = '/admin/users';

export const title = 'Admin — Users';

export function render() {
  const me = Auth.currentUser();
  return renderAdmin(ROUTE, `
    <header style="display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem;">
      <div>
        <div class="section-eyebrow">// USERS</div>
        <h1 class="section-title" style="margin:0;">Active accounts</h1>
        <p class="muted text-sm" style="font-family:var(--font-sans); margin-top:0.5rem;">
          Every account on the platform. Most are created from the <a href="/admin/requests" data-link class="gold">Requests</a> screen; use the button on the right for manual creation.
        </p>
      </div>
      <button id="new-user-btn" class="btn btn-primary">+ New User</button>
    </header>

    <div class="q-panel" style="overflow:hidden;">
      <table class="q-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Company</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created</th>
            <th style="text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody id="users-tbody">
          ${MockState.users.map(u => rowHtml(u, me)).join('')}
        </tbody>
      </table>
    </div>
  `);
}

export function init() {
  initAdmin();

  document.getElementById('new-user-btn')?.addEventListener('click', openCreateUserModal);

  const tbody = document.getElementById('users-tbody');
  tbody.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = Number(btn.getAttribute('data-id'));
    const action = btn.getAttribute('data-action');
    const u = MockState.users.find(x => x.id === id);
    if (!u) return;

    if (action === 'suspend')   { u.status = 'Suspended'; refresh(); toast(`Suspended ${u.email}`, { variant: 'warn' }); }
    if (action === 'reactivate'){ u.status = 'Active';    refresh(); toast(`Reactivated ${u.email}`, { variant: 'ok' }); }
    if (action === 'reset')     openResetPasswordModal(u);
    if (action === 'delete')    openDeleteModal(u);
  });
}

/* ----- internals --------------------------------------------------------- */

function refresh() {
  const me = Auth.currentUser();
  document.getElementById('users-tbody').innerHTML =
    MockState.users.map(u => rowHtml(u, me)).join('');
}

function rowHtml(u, me) {
  const isSelf = me && u.id === me.id;
  const statusCls = u.status === 'Active' ? 'badge-running' : 'badge-failed';
  const roleCls   = u.role === 'admin' ? 'badge-completed' : 'badge-stopped';

  const actions = isSelf
    ? `<span class="muted text-xs" style="font-family:var(--font-mono);">— this is you —</span>`
    : `
      ${u.status === 'Active'
          ? `<button class="btn btn-ghost btn-sm" data-action="suspend"    data-id="${u.id}">Suspend</button>`
          : `<button class="btn btn-ghost btn-sm" data-action="reactivate" data-id="${u.id}">Reactivate</button>`}
      <button class="btn btn-ghost btn-sm" data-action="reset"  data-id="${u.id}">Reset password</button>
      <button class="btn btn-danger btn-sm" data-action="delete" data-id="${u.id}">Delete</button>
    `;

  return `
    <tr>
      <td class="gold" style="font-family:var(--font-mono);">#${u.id}</td>
      <td>${escape(u.name)}</td>
      <td>${escape(u.company)}</td>
      <td class="muted" style="font-family:var(--font-mono); font-size:0.78rem;">${escape(u.email)}</td>
      <td><span class="badge ${roleCls}">${escape(u.role)}</span></td>
      <td><span class="badge ${statusCls}">${escape(u.status)}</span></td>
      <td class="muted" style="font-family:var(--font-mono); font-size:0.72rem;">${escape(u.created)}</td>
      <td style="text-align:right; white-space:nowrap;">${actions}</td>
    </tr>
  `;
}

function openCreateUserModal() {
  const formId = 'create-user-form';
  openModal({
    title: 'Create User',
    body: `
      <p style="margin-top:0;">Provision a new account manually. Communicate the password to the client through a secure channel — it's only shown here once.</p>
      <form id="${formId}" class="grid gap-3" style="margin-top:0.8rem;">
        <div class="grid md:grid-cols-2 gap-3">
          <label class="field">
            <span class="field-label">Full name *</span>
            <input class="field-input" name="name" required placeholder="Jane Carter" autofocus />
          </label>
          <label class="field">
            <span class="field-label">Email *</span>
            <input class="field-input" name="email" type="email" required placeholder="jane@acme.com" />
          </label>
        </div>
        <label class="field">
          <span class="field-label">Company *</span>
          <input class="field-input" name="company" required placeholder="Acme Industries" />
        </label>
        <div class="grid md:grid-cols-2 gap-3">
          <label class="field">
            <span class="field-label">Role *</span>
            <select class="field-select" name="role" required>
              <option value="user">user — client account</option>
              <option value="admin">admin — internal operator</option>
            </select>
          </label>
          <label class="field">
            <span class="field-label">Initial password *</span>
            <input class="field-input" name="password" type="text" required minlength="8" placeholder="8+ characters" />
          </label>
        </div>
        <p class="muted text-xs" style="font-family:var(--font-mono); letter-spacing:0.1em; margin:0;">
          The password is shown once and not stored in plaintext on the platform.
        </p>
      </form>
    `,
    actions: [
      { label: 'Cancel', variant: 'ghost', onClick: c => c() },
      { label: 'Create user', variant: 'primary', onClick: (close) => {
        const form = document.getElementById(formId);
        const fd = new FormData(form);
        const name     = String(fd.get('name')     || '').trim();
        const email    = String(fd.get('email')    || '').trim();
        const company  = String(fd.get('company')  || '').trim();
        const role     = String(fd.get('role')     || 'user');
        const password = String(fd.get('password') || '').trim();

        if (!name || !email || !company || password.length < 8) {
          toast('Fill every field and use a password of 8+ characters', { variant: 'err' });
          return;
        }
        if (MockState.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          toast(`An account already exists for ${email}`, { variant: 'err' });
          return;
        }

        const nextId = Math.max(0, ...MockState.users.map(u => u.id)) + 1;
        MockState.users.unshift({
          id: nextId,
          name, email, company,
          role,
          status: 'Active',
          created: new Date().toISOString().slice(0, 10)
        });

        close();
        refresh();
        toast(`Account #${nextId} created (${role}) for ${company}`, { variant: 'ok' });
      }}
    ]
  });
}

function openResetPasswordModal(u) {
  // Mock: generate a 16-char password for the admin to communicate offline.
  const newPass = Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map(b => 'abcdefghijklmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 58]).join('');

  openModal({
    title: 'Reset password',
    body: `
      <p style="margin-top:0;">A new password has been generated for <strong class="gold">${escape(u.email)}</strong>. Communicate it through a secure channel — this is the only time it will be shown.</p>
      <div class="code-block" style="margin:0.8rem 0;">${escape(newPass)}</div>
      <p style="color: var(--sev-medium); font-family:var(--font-mono); font-size:0.7rem; letter-spacing:0.12em;">
        ⚠ This password will not be shown again.
      </p>
    `,
    actions: [
      { label: 'Copy', variant: 'ghost', onClick: () => {
        navigator.clipboard.writeText(newPass).then(
          () => toast('Password copied', { variant: 'ok' }),
          () => toast('Clipboard blocked', { variant: 'err' })
        );
      }},
      { label: 'Done', variant: 'primary', onClick: c => c() }
    ],
    dismissible: false
  });
}

function openDeleteModal(u) {
  openModal({
    title: 'Delete user',
    body: `Permanently delete <strong class="gold">${escape(u.email)}</strong>?
           All their instances, keys and reports will become inaccessible. This cannot be undone.`,
    actions: [
      { label: 'Cancel', variant: 'ghost', onClick: c => c() },
      { label: 'Delete', variant: 'danger', onClick: (close) => {
        MockState.users = MockState.users.filter(x => x.id !== u.id);
        close();
        refresh();
        toast(`Deleted ${u.email}`, { variant: 'err' });
      }}
    ]
  });
}

function escape(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
