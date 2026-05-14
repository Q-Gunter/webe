/**
 * instances.js — /dashboard/instances (default dashboard view).
 *
 * Renders the user's Docker pentest instances. Supports:
 *   - New Instance modal (name → generated API key, shown once)
 *   - Start / Stop / Delete actions (mutate MockState in place)
 */

import { renderDashboard, initDashboard } from './layout.js';
import { MockState, generateApiKey, maskKey } from '../../utils/mockData.js';
import { openModal } from '../../components/modal.js';
import { toast } from '../../components/toast.js';
import { Router } from '../../utils/router.js';

const ROUTE = '/dashboard/instances';

export const title = 'Instances';

export function render() {
  return renderDashboard(ROUTE, `
    <header style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem;">
      <div>
        <div class="section-eyebrow">// DOCKER INSTANCES</div>
        <h1 class="section-title" style="margin:0;">Instances</h1>
        <p class="muted text-sm" style="font-family:var(--font-sans); margin-top:0.5rem;">
          Each instance is an isolated Docker container in Q-Gunter's private cloud. The CLI agent connects with its API key.
        </p>
      </div>
      <button id="new-instance-btn" class="btn btn-primary">+ New Instance</button>
    </header>

    <div class="q-panel" style="overflow:hidden;">
      <table class="q-table">
        <thead>
          <tr>
            <th>Instance ID</th>
            <th>Name</th>
            <th>Status</th>
            <th>Created</th>
            <th>API Key</th>
            <th style="text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody id="instances-tbody">
          ${MockState.instances.map(renderRow).join('')}
        </tbody>
      </table>
    </div>
  `);
}

export function init() {
  initDashboard();

  document.getElementById('new-instance-btn').addEventListener('click', openNewInstanceModal);

  document.getElementById('instances-tbody').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    const action = btn.getAttribute('data-action');
    const inst = MockState.instances.find(i => i.id === id);
    if (!inst) return;

    if (action === 'start')  { inst.status = 'Running'; refresh(); toast(`Started ${inst.name}`, { variant: 'ok' }); }
    if (action === 'stop')   { inst.status = 'Stopped'; refresh(); toast(`Stopped ${inst.name}`, { variant: 'warn' }); }
    if (action === 'delete') {
      openModal({
        title: 'Delete instance',
        body: `Permanently destroy <strong class="gold">${escape(inst.name)}</strong>? Active agent sessions will terminate immediately.`,
        actions: [
          { label: 'Cancel', variant: 'ghost', onClick: c => c() },
          { label: 'Delete', variant: 'danger', onClick: (close) => {
            MockState.instances = MockState.instances.filter(i => i.id !== id);
            close();
            refresh();
            toast(`Deleted ${inst.name}`, { variant: 'err' });
          }}
        ]
      });
    }
  });
}

/* ----- internals --------------------------------------------------------- */

function refresh() {
  const tbody = document.getElementById('instances-tbody');
  if (tbody) tbody.innerHTML = MockState.instances.map(renderRow).join('');
}

function renderRow(i) {
  const cls = statusBadgeClass(i.status);
  return `
    <tr>
      <td class="gold" style="font-family:var(--font-mono);">${escape(i.id)}</td>
      <td>${escape(i.name)}</td>
      <td><span class="badge ${cls}">${i.status}</span></td>
      <td class="muted">${escape(i.created)}</td>
      <td style="font-family:var(--font-mono); color: var(--q-cream-dim);">${maskKey(i.key)}</td>
      <td style="text-align:right; white-space:nowrap;">
        ${i.status === 'Running'
          ? `<button class="btn btn-ghost btn-sm" data-action="stop" data-id="${i.id}">Stop</button>`
          : `<button class="btn btn-ghost btn-sm" data-action="start" data-id="${i.id}">Start</button>`}
        <button class="btn btn-danger btn-sm" data-action="delete" data-id="${i.id}">Delete</button>
      </td>
    </tr>
  `;
}

function statusBadgeClass(s) {
  switch (String(s).toLowerCase()) {
    case 'running':   return 'badge-running';
    case 'stopped':   return 'badge-stopped';
    case 'pending':   return 'badge-pending';
    case 'completed': return 'badge-completed';
    case 'failed':    return 'badge-failed';
    default:          return 'badge-stopped';
  }
}

function openNewInstanceModal() {
  const formId = 'new-inst-form';
  openModal({
    title: 'New Instance',
    body: `
      <form id="${formId}">
        <label class="field">
          <span class="field-label">Instance name</span>
          <input class="field-input" name="name" required placeholder="e.g. Production Audit" autofocus />
        </label>
        <p class="muted text-xs mt-3" style="font-family:var(--font-mono); letter-spacing:0.1em;">
          A unique API key will be generated using Post-Quantum Cryptography primitives.
        </p>
      </form>
    `,
    actions: [
      { label: 'Cancel', variant: 'ghost', onClick: c => c() },
      { label: 'Create', variant: 'primary', onClick: (close) => {
        const form = document.getElementById(formId);
        const name = new FormData(form).get('name')?.toString().trim();
        if (!name) { toast('Name is required', { variant: 'err' }); return; }

        const key = generateApiKey('qg_inst');
        const newInst = {
          id: `inst_${String(MockState.instances.length + 1).padStart(2, '0')}`,
          name,
          status: 'Pending',
          created: new Date().toISOString().slice(0, 10),
          key
        };
        MockState.instances.push(newInst);
        close();
        refresh();
        showKeyOnce(newInst);
      }}
    ]
  });
}

function showKeyOnce(inst) {
  openModal({
    title: 'API Key Generated',
    body: `
      <p style="margin-top:0;">
        Instance <strong class="gold">${escape(inst.name)}</strong> was created. Below is the
        only time this key will be displayed in full.
      </p>
      <div class="code-block" style="margin: 0.8rem 0;">
        <span id="full-key">${escape(inst.key)}</span>
      </div>
      <p style="color: var(--sev-medium); font-family: var(--font-mono); font-size: 0.7rem; letter-spacing:0.12em;">
        ⚠ This key will not be shown again. Store it securely before closing.
      </p>
    `,
    actions: [
      { label: 'Copy', variant: 'ghost', onClick: () => {
        navigator.clipboard.writeText(inst.key).then(
          () => toast('Key copied to clipboard', { variant: 'ok' }),
          () => toast('Clipboard blocked by browser', { variant: 'err' })
        );
      }},
      { label: 'I\'ve stored it', variant: 'primary', onClick: c => c() }
    ],
    dismissible: false
  });
}

function escape(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
