/**
 * layout.js — Shared dashboard chrome (sidebar + topbar).
 *
 * TEMPLATE MODE: the LimelightNav (components/7.txt) sliding indicator and
 * the AnimatedThemeToggler (components/8.txt) have been removed and replaced
 * with labelled slots. The sidebar still highlights the active route via the
 * static `.active` class.
 */

import { Auth } from '../../utils/auth.js';
import { Router } from '../../utils/router.js';

const NAV_ITEMS = [
  { href: '/dashboard/instances', label: 'Instances', icon: iconBox },
  { href: '/dashboard/reports',   label: 'Reports',   icon: iconFile },
  { href: '/dashboard/keys',      label: 'API Keys',  icon: iconKey  },
  { href: '/dashboard/download',  label: 'Download Agent', icon: iconDownload },
  { href: '/dashboard/profile',   label: 'Profile',   icon: iconUser },
  { href: '/dashboard/support',   label: 'Support',   icon: iconHelp, external: true }
];

export function renderDashboard(activeHref, inner) {
  const user = Auth.currentUser() || { name: 'Agent', email: '', company: 'Unknown Corp.' };
  return `
    <div class="app-shell view">
      <aside class="sidebar" id="sidebar">
        <a href="/dashboard/instances" data-link class="sidebar-logo" aria-label="Q-Gunter home">
          <img src="/assets/logo.png" alt="Q-Gunter" />
        </a>

        <!-- LimelightNav slot (components/7.txt) -->
        <nav class="sidebar-nav" id="sidebar-nav">
          ${NAV_ITEMS.map(item => {
            const active = item.href === activeHref ? 'active' : '';
            const attrs = item.external
              ? `href="mailto:support@qgunter.io"`
              : `href="${item.href}" data-link`;
            return `
              <a ${attrs} class="${active}">
                <span class="icon">${item.icon()}</span>
                <span>${item.label}</span>
              </a>
            `;
          }).join('')}
        </nav>

      </aside>

      <main>
        <header class="topbar">
          <div class="flex items-center gap-3">
            <button id="sidebar-toggle" class="btn btn-ghost btn-sm sidebar-toggle" aria-label="Menu">≡</button>
            <span class="label-tag">// ${labelFor(activeHref)}</span>
          </div>
          <div class="flex items-center gap-4">
            <div class="user">
              <span class="name">${escape(user.name)}</span>
              <span class="company">${escape(user.company)}</span>
            </div>
            <button id="logout-btn" class="btn btn-danger btn-sm">Sign Out</button>
          </div>
        </header>

        <div style="padding: 2rem 1.5rem 3rem;">
          ${inner}
        </div>
      </main>
    </div>
  `;
}

export function initDashboard() {
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    Auth.signOut();
    Router.navigate('/');
  });

  const sidebar = document.getElementById('sidebar');
  document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
  });

  // Subtle entrance for the inner main content.
  if (window.gsap) {
    window.gsap.from('main > div > *', {
      opacity: 0, y: 14, duration: 0.4, ease: 'power2.out', stagger: 0.06
    });
  }
}

function labelFor(href) {
  const found = NAV_ITEMS.find(i => i.href === href);
  return found ? found.label.toUpperCase() : 'DASHBOARD';
}

function escape(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

/* ----- icons -------------------------------------------------------------- */

function iconBox()      { return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></svg>`; }
function iconFile()     { return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h6"/></svg>`; }
function iconKey()      { return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="8" cy="14" r="4"/><path d="M11 11l9-9"/><path d="M17 5l3 3"/></svg>`; }
function iconDownload() { return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v12"/><path d="M6 9l6 6 6-6"/><path d="M4 21h16"/></svg>`; }
function iconUser()     { return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>`; }
function iconHelp()     { return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2.2-2.5 3.8"/><circle cx="12" cy="17" r="0.7" fill="currentColor"/></svg>`; }
