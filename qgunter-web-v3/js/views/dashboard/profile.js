/**
 * profile.js — /dashboard/profile
 * Company info (read-only) + Account settings (editable mocks).
 */

import { renderDashboard, initDashboard } from './layout.js';
import { Auth } from '../../utils/auth.js';
import { toast } from '../../components/toast.js';

const ROUTE = '/dashboard/profile';

export const title = 'Profile';

export function render() {
  const u = Auth.currentUser() || { name: '', email: '', company: '' };

  return renderDashboard(ROUTE, `
    <header style="margin-bottom:1.5rem;">
      <div class="section-eyebrow">// ACCOUNT</div>
      <h1 class="section-title" style="margin:0;">Profile</h1>
    </header>

    <div class="grid md:grid-cols-2 gap-6">
      <!-- COMPANY INFO (read-only) -->
      <section class="q-panel p-6">
        <div class="label-tag mb-3">// COMPANY INFO (READ-ONLY)</div>
        <h3 style="font-family:var(--font-mono); margin:0 0 1rem 0;">${escape(u.company)}</h3>

        ${readonly('Legal Name', u.company)}
        ${readonly('CIF / VAT', 'B-87654321')}
        ${readonly('Sector', 'SaaS / Software')}
        ${readonly('Company Size', '51–200 employees')}
        ${readonly('Billing Address', 'Carrer de la Marina 123, 4-A · 08013 Barcelona · ES')}

        <p class="muted text-xs mt-4" style="font-family:var(--font-mono); letter-spacing:0.12em;">
          To change company-level data, contact <a href="mailto:onboarding@qgunter.io" class="gold">onboarding@qgunter.io</a>.
        </p>
      </section>

      <!-- ACCOUNT SETTINGS -->
      <section class="q-panel p-6">
        <div class="label-tag mb-3">// ACCOUNT SETTINGS</div>

        <form id="profile-form" class="grid gap-4">
          <label class="field">
            <span class="field-label">Full Name</span>
            <input class="field-input" name="name" value="${escape(u.name)}" />
          </label>
          <label class="field">
            <span class="field-label">Email</span>
            <input class="field-input" name="email" type="email" value="${escape(u.email)}" />
          </label>
          <label class="field">
            <span class="field-label">Phone</span>
            <input class="field-input" name="phone" type="tel" value="+34 600 000 000" />
          </label>

          <div class="flex justify-end">
            <button type="submit" class="btn btn-primary btn-sm">Save Changes</button>
          </div>
        </form>

        <div class="divider"></div>

        <div class="label-tag mb-3">// SECURITY</div>
        <form id="password-form" class="grid gap-4">
          <label class="field">
            <span class="field-label">Current password</span>
            <input class="field-input" type="password" name="current" placeholder="••••••••" />
          </label>
          <label class="field">
            <span class="field-label">New password</span>
            <input class="field-input" type="password" name="next" placeholder="••••••••" />
          </label>
          <div class="flex justify-end">
            <button type="submit" class="btn btn-ghost btn-sm">Change Password</button>
          </div>
        </form>

        <div class="divider"></div>

        <div class="flex items-center justify-between">
          <div>
            <div class="label-tag" style="margin-bottom:0.25rem;">// TWO-FACTOR AUTH</div>
            <div class="muted text-sm" style="font-family:var(--font-sans);">TOTP via authenticator app. UI mock.</div>
          </div>
          <button id="tfa-toggle" class="btn btn-ghost btn-sm" data-on="0">Enable 2FA</button>
        </div>
      </section>
    </div>
  `);
}

export function init() {
  initDashboard();

  document.getElementById('profile-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const session = Auth.getSession();
    if (session) {
      session.user.name = fd.get('name');
      session.user.email = fd.get('email');
      Auth.setSession(session);
    }
    toast('Profile saved', { variant: 'ok' });
  });

  document.getElementById('password-form').addEventListener('submit', (e) => {
    e.preventDefault();
    e.currentTarget.reset();
    toast('Password updated', { variant: 'ok' });
  });

  const tfa = document.getElementById('tfa-toggle');
  tfa.addEventListener('click', () => {
    const on = tfa.dataset.on === '1';
    tfa.dataset.on = on ? '0' : '1';
    tfa.textContent = on ? 'Enable 2FA' : 'Disable 2FA';
    tfa.classList.toggle('btn-primary', !on);
    tfa.classList.toggle('btn-ghost', on);
    toast(on ? '2FA disabled' : '2FA enabled', { variant: on ? 'warn' : 'ok' });
  });
}

function readonly(label, value) {
  return `
    <div style="margin-bottom: 0.85rem;">
      <div class="label-tag" style="margin-bottom:0.15rem;">${label}</div>
      <div style="font-family:var(--font-mono); font-size:0.82rem; color:var(--q-cream); word-break:break-word;">
        ${escape(value)}
      </div>
    </div>`;
}

function escape(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
