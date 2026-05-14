/**
 * toast.js
 * Tiny imperative toast utility. Mounts into #toast-root.
 *
 * Usage:
 *   import { toast } from './components/toast.js';
 *   toast('Saved', { variant: 'ok' });
 */

const root = () => document.getElementById('toast-root');

export function toast(message, { variant = 'default', duration = 3200 } = {}) {
  const host = root();
  if (!host) return;

  const el = document.createElement('div');
  el.className = `toast ${variant}`;
  el.textContent = message;
  host.appendChild(el);

  const gsap = window.gsap;
  if (gsap) {
    gsap.fromTo(el,
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.25, ease: 'power2.out' }
    );
    gsap.to(el, {
      opacity: 0, x: 20, delay: duration / 1000, duration: 0.3,
      onComplete: () => el.remove()
    });
  } else {
    el.style.opacity = 1;
    setTimeout(() => el.remove(), duration);
  }
}
