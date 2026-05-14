/**
 * apiKeys.js — /dashboard/keys
 * Per-instance keys with reveal/copy/regenerate/revoke controls.
 */

import { renderDashboard, initDashboard } from './layout.js';
import { MockState, generateApiKey, maskKey } from '../../utils/mockData.js';
import { openModal } from '../../components/modal.js';
import { toast } from '../../components/toast.js';

const ROUTE = '/dashboard/keys';

export const title = 'API Keys';

export function render() {
  return renderDashboard(ROUTE, `
    <header style="margin-bottom:1.5rem;">
      <div class="section-eyebrow">// API KEY MANAGEMENT</div>
      <h1 class="section-title" style="margin:0;">API Keys</h1>
      <p class="muted text-sm" style="font-family:var(--font-sans); margin-top:0.5rem;">
        Keys are signed using Post-Quantum Cryptography. Treat them like passwords — they grant the agent full instance control.
      </p>
    </header>

    <div class="q-panel" style="overflow:hidden;">
      <table class="q-table">
        <thead>
          <tr>
            <th>Instance</th>
            <th>Key</th>
            <th style="text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody id="keys-tbody">
          ${MockState.instances.map(renderRow).join('')}
        </tbody>
      </table>
    </div>
  `);
}

export function init() {
  initDashboard();

  document.getElementById('keys-tbody').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    const action = btn.getAttribute('data-action');
    const inst = MockState.instances.find(i => i.id === id);
    if (!inst) return;

    if (action === 'reveal') {
      const span = document.querySelector(`[data-key-for="${id}"]`);
      const revealed = span.dataset.revealed === '1';
      span.textContent = revealed ? maskKey(inst.key) : inst.key;
      span.dataset.revealed = revealed ? '0' : '1';
      btn.textContent = revealed ? 'Reveal' : 'Hide';
    }

    if (action === 'copy') {
      navigator.clipboard.writeText(inst.key).then(
        () => toast('Key copied', { variant: 'ok' }),
        () => toast('Clipboard blocked', { variant: 'err' })
      );
    }

    if (action === 'regen') {
      openModal({
        title: 'Regenerate Key',
        body: `This will invalidate the current key for <strong class="gold">${escape(inst.name)}</strong>
               and disconnect all active agent sessions using it. This cannot be undone. Continue?`,
        actions: [
          { label: 'Cancel', variant: 'ghost', onClick: c => c() },
          { label: 'Regenerate', variant: 'danger', onClick: (close) => {
            inst.key = generateApiKey('qg_inst');
            close();
            refresh();
            toast(`New key issued for ${inst.name}`, { variant: 'ok' });
          }}
        ]
      });
    }

    if (action === 'revoke') {
      openModal({
        title: 'Revoke Key',
        body: `Revoke the key for <strong class="gold">${escape(inst.name)}</strong>?
               The instance will be stopped and the agent will lose connection immediately.`,
        actions: [
          { label: 'Cancel', variant: 'ghost', onClick: c => c() },
          { label: 'Revoke', variant: 'danger', onClick: (close) => {
            inst.status = 'Stopped';
            inst.key = 'qg_revoked_' + Math.random().toString(36).slice(2, 10);
            close();
            refresh();
            toast(`Key revoked for ${inst.name}`, { variant: 'err' });
          }}
        ]
      });
    }
  });
}

function refresh() {
  const tbody = document.getElementById('keys-tbody');
  if (tbody) tbody.innerHTML = MockState.instances.map(renderRow).join('');
}

function renderRow(i) {
  return `
    <tr>
      <td class="gold" style="font-family:var(--font-mono);">${escape(i.name)}</td>
      <td>
        <span data-key-for="${i.id}" data-revealed="0"
              style="font-family:var(--font-mono); font-size:0.78rem; color:var(--q-cream-dim);">
          ${maskKey(i.key)}
        </span>
      </td>
      <td style="text-align:right; white-space:nowrap;">
        <button class="btn btn-ghost btn-sm" data-action="reveal" data-id="${i.id}">Reveal</button>
        <button class="btn btn-ghost btn-sm" data-action="copy"   data-id="${i.id}">Copy</button>
        <button class="btn btn-ghost btn-sm" data-action="regen"  data-id="${i.id}">Regenerate</button>
        <button class="btn btn-danger btn-sm" data-action="revoke" data-id="${i.id}">Revoke</button>
      </td>
    </tr>
  `;
}

function escape(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
