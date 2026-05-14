/**
 * login.js — /login. Mock auth against the two seed users in utils/auth.js.
 */

import { Auth } from '../utils/auth.js';
import { Router } from '../utils/router.js';
import { toast } from '../components/toast.js';
import { renderBackgroundPlus } from '../components/backgroundPlus.js';

export const title = 'Sign In';

export function render() {
  return `
    <div class="view" style="min-height:100vh; display:grid; place-items:center; padding:2rem; position:relative; overflow:hidden;">
      ${renderBackgroundPlus()}
      <div class="w-full" style="max-width: 440px; position:relative; z-index:1;">
        <div class="text-center mb-8">
          <a href="/" data-link style="display:inline-block;">
            <img src="/assets/logo.png" alt="Q-Gunter" style="height:72px;" />
          </a>
        </div>

        <div class="q-panel-strong p-8 relative">
          <div class="absolute top-0 left-0 w-full h-px"
               style="background:linear-gradient(90deg,transparent,var(--q-gold),transparent);"></div>

          <div class="section-eyebrow">// SECURE LOGIN</div>
          <h1 style="font-family:var(--font-mono);font-size:1.4rem;letter-spacing:-0.01em;margin:0 0 1.5rem 0;">
            Access Control
          </h1>

          <form id="login-form" class="grid gap-4">
            <label class="field">
              <span class="field-label">Email Address</span>
              <input class="field-input" name="email" type="email" required
                     placeholder="agent@qgunter.io" autocomplete="email" />
            </label>
            <label class="field">
              <span class="field-label">Password</span>
              <input class="field-input" name="password" type="password" required
                     placeholder="••••••••" autocomplete="current-password" />
            </label>
            <button type="submit" class="btn btn-primary btn-block btn-lg mt-2">
              Initialize Session
            </button>
          </form>

          <div class="divider"></div>
          <p class="text-center text-sm muted" style="font-family:var(--font-sans);">
            New client? <a href="/contact" data-link class="gold">Request Access</a>
          </p>

          <div class="mt-6 p-3 border border-q-border rounded-sm" style="font-family:var(--font-mono); font-size:0.65rem; color:var(--q-cream-faint); letter-spacing:0.1em;">
            <div class="mb-1 gold">DEMO CREDENTIALS</div>
            <div>client@test.com / test123 → Dashboard</div>
            <div>admin@qgunter.io / admin123 → Admin Panel</div>
          </div>
        </div>

        <div class="text-center mt-6">
          <a href="/" data-link class="muted text-xs" style="font-family:var(--font-mono); letter-spacing:0.2em;">
            ← BACK TO HOME
          </a>
        </div>
      </div>
    </div>
  `;
}

export function init() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const email = fd.get('email');
    const password = fd.get('password');

    const session = Auth.signIn(email, password);
    if (!session) {
      toast('Invalid credentials', { variant: 'err' });
      return;
    }

    toast(`Welcome, ${session.user.name}`, { variant: 'ok' });

    // Route per role. Admins go to the admin panel; everybody else to the
    // client dashboard. The auth guard in app.js will also enforce this.
    if (session.user.role === 'admin') Router.navigate('/admin/requests');
    else Router.navigate('/dashboard/instances');
  });

  if (window.gsap) {
    window.gsap.from('.q-panel-strong', { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out' });
  }
}
