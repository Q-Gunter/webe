/**
 * admin/layout.js — Shared chrome for the /admin zone.
 *
 * Layout (per spec): no sidebar — only a topbar (logo + admin label + user
 * + signout) and a horizontal tab nav under it (Requests / Users), with the
 * active tab highlighted via an underline indicator.
 *
 * Each admin sub-view calls `renderAdmin(activeHref, inner)` and
 * `initAdmin()` to wire the common controls (logout, navigation).
 */

import { Auth } from '../../utils/auth.js';
import { Router } from '../../utils/router.js';

const TABS = [
  { href: '/admin/requests', label: 'Requests' },
  { href: '/admin/users',    label: 'Users' }
];

export function renderAdmin(activeHref, inner) {
  const user = Auth.currentUser() || { name: 'Operator', company: 'Q-Gunter S.L.' };

  const tabs = TABS.map(t => `
    <a href="${t.href}" data-link class="admin-tab ${t.href === activeHref ? 'active' : ''}">
      ${t.label}
    </a>
  `).join('');

  return `
    <div class="admin-shell view">
      <header class="admin-topbar">
        <a href="/admin/requests" data-link class="admin-brand" aria-label="Q-Gunter admin home">
          <img src="/assets/logo.png" alt="Q-Gunter" />
          <span class="admin-mode">ADMIN MODE</span>
        </a>
        <div class="admin-user">
          <div class="info">
            <span class="name">${escape(user.name)}</span>
            <span class="role">Q-GUNTER · INTERNAL</span>
          </div>
          <button id="admin-logout-btn" class="btn btn-danger btn-sm">Sign Out</button>
        </div>
      </header>

      <nav class="admin-tabs">
        ${tabs}
      </nav>

      <main class="admin-main">
        ${inner}
      </main>
    </div>
  `;
}

export function initAdmin() {
  document.getElementById('admin-logout-btn')?.addEventListener('click', () => {
    Auth.signOut();
    Router.navigate('/');
  });

  if (window.gsap) {
    window.gsap.from('.admin-main > *', {
      opacity: 0, y: 14, duration: 0.4, ease: 'power2.out', stagger: 0.06
    });
  }
}

function escape(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
