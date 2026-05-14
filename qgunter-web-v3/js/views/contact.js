/**
 * contact.js — /contact (Request Access form).
 *
 * TEMPLATE MODE: the LocationMap component has been replaced with a labelled
 * slot. The form itself remains functional.
 */

import { publicNavbar, publicFooter, initPublicShell } from './_publicShell.js';
import { renderBackgroundPlus } from '../components/backgroundPlus.js';
import { toast } from '../components/toast.js';
import { MockState } from '../utils/mockData.js';

let shellHandle = null;

export const title = 'Request Access';

export function render() {
  return `
    <div class="view" style="position:relative; overflow:hidden;">
      ${renderBackgroundPlus()}
      <div style="position:relative; z-index:1;">
      ${publicNavbar({ active: '/contact' })}

      <section class="max-w-3xl mx-auto px-6 py-16">
        <div class="section-eyebrow">// REQUEST ACCESS</div>
        <h1 class="section-title">Get in touch with the Q-Gunter team</h1>
        <p class="section-lede mb-10">
          Q-Gunter is a contract-only platform — there is no self-registration.
          Tell us about your organization and we will reach out to schedule a scoping call.
        </p>

        <form id="contact-form" class="q-panel p-8 grid gap-5">
          <div class="grid md:grid-cols-2 gap-4">
            <label class="field">
              <span class="field-label">Company name *</span>
              <input class="field-input" name="company" type="text" required placeholder="Acme Industries" />
            </label>
            <label class="field">
              <span class="field-label">Full name *</span>
              <input class="field-input" name="name" type="text" required placeholder="Jane Carter" />
            </label>
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <label class="field">
              <span class="field-label">Work email *</span>
              <input class="field-input" name="email" type="email" required placeholder="jane@acme.com" />
            </label>
            <label class="field">
              <span class="field-label">Role *</span>
              <input class="field-input" name="role" type="text" required placeholder="CISO / Sec Eng Lead" />
            </label>
          </div>

          <label class="field">
            <span class="field-label">Describe your use case *</span>
            <textarea class="field-textarea" name="useCase" rows="5" required
              placeholder="Briefly describe the environment to assess, attack surface, and compliance constraints."></textarea>
          </label>

          <label class="checkbox-row">
            <input type="checkbox" name="consent" required />
            <span>
              I confirm that Q-Gunter may contact me to arrange the service, and that
              account provisioning happens only after a signed Rules of Engagement contract.
            </span>
          </label>

          <div class="flex justify-end gap-3 mt-2">
            <button type="submit" class="btn btn-primary btn-lg">Transmit Request</button>
          </div>
        </form>

        <!-- Success state (hidden until submit) -->
        <div id="contact-success" class="q-panel p-10 text-center hidden">
          <div class="section-eyebrow">// SECURE CHANNEL ESTABLISHED</div>
          <h2 class="section-title">Request received</h2>
          <p class="section-lede mx-auto mb-6" style="margin-left:auto;margin-right:auto;">
            Thanks. Our team will review your request within 1 business day, send Rules
            of Engagement and an MSA, and provision credentials once both are countersigned.
          </p>
          <div class="flex gap-3 justify-center">
            <a href="/" data-link class="btn btn-ghost">Return Home</a>
          </div>
        </div>
      </section>

      ${publicFooter()}
      </div>
    </div>
  `;
}

export function init() {
  shellHandle = initPublicShell();

  const form = document.getElementById('contact-form');
  const success = document.getElementById('contact-success');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Mock: push the request into MockState so it shows up at /admin/requests.
    const fd = new FormData(form);
    const next = MockState.contactRequests.length + 1;
    MockState.contactRequests.unshift({
      id: `req_${String(next).padStart(2, '0')}`,
      company:  String(fd.get('company') || '').trim(),
      name:     String(fd.get('name')    || '').trim(),
      email:    String(fd.get('email')   || '').trim(),
      role:     String(fd.get('role')    || '').trim(),
      useCase:  String(fd.get('useCase') || '').trim(),
      consent:  !!fd.get('consent'),
      status:   'pending',
      submitted: new Date().toISOString().slice(0, 16).replace('T', ' ')
    });

    form.style.display = 'none';
    success.classList.remove('hidden');
    toast('Request transmitted', { variant: 'ok' });
    if (window.gsap) {
      window.gsap.from(success, { opacity: 0, y: 16, duration: 0.5, ease: 'power2.out' });
    }
  });
}

export function destroy() {
  if (shellHandle) { shellHandle.destroy(); shellHandle = null; }
}
