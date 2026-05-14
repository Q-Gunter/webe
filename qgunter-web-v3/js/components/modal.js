/**
 * modal.js
 * Imperative modal dialog. Mounts into #modal-root.
 *
 * openModal({
 *   title,        // string (uppercase mono)
 *   body,         // string (HTML) or HTMLElement
 *   actions,      // [{ label, variant: 'primary'|'ghost'|'danger', onClick: (close)=>void }]
 *   onClose,      // optional callback when dismissed
 *   dismissible   // boolean (default true)
 * }) → returns close() function
 */

const root = () => document.getElementById('modal-root');

export function openModal({ title = '', body = '', actions = [], onClose, dismissible = true } = {}) {
  const host = root();
  if (!host) return () => {};

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  const modal = document.createElement('div');
  modal.className = 'modal';
  backdrop.appendChild(modal);

  if (dismissible) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = '×';
    closeBtn.addEventListener('click', () => close());
    modal.appendChild(closeBtn);
  }

  if (title) {
    const h = document.createElement('h3');
    h.textContent = title;
    modal.appendChild(h);
  }

  const content = document.createElement('div');
  content.style.fontFamily = 'var(--font-sans)';
  content.style.color = 'var(--q-cream-dim)';
  content.style.fontSize = '0.9rem';
  content.style.lineHeight = '1.55';
  content.style.margin = '0.5rem 0 1.25rem 0';
  if (body instanceof HTMLElement) content.appendChild(body);
  else content.innerHTML = body;
  modal.appendChild(content);

  if (actions.length) {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '0.6rem';
    row.style.justifyContent = 'flex-end';
    row.style.flexWrap = 'wrap';

    actions.forEach(a => {
      const btn = document.createElement('button');
      btn.className = `btn btn-${a.variant || 'ghost'}`;
      btn.textContent = a.label;
      btn.addEventListener('click', () => a.onClick && a.onClick(close));
      row.appendChild(btn);
    });
    modal.appendChild(row);
  }

  function close() {
    const gsap = window.gsap;
    if (gsap) {
      gsap.to(modal, { opacity: 0, y: -8, duration: 0.18 });
      gsap.to(backdrop, { opacity: 0, duration: 0.2, onComplete: cleanup });
    } else cleanup();
  }

  function cleanup() {
    backdrop.remove();
    if (typeof onClose === 'function') onClose();
  }

  if (dismissible) {
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
    document.addEventListener('keydown', escListener);
  }
  function escListener(e) {
    if (e.key === 'Escape') { document.removeEventListener('keydown', escListener); close(); }
  }

  host.appendChild(backdrop);

  const gsap = window.gsap;
  if (gsap) {
    gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    gsap.fromTo(modal, { opacity: 0, y: 12, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.28, ease: 'power2.out' });
  }

  return close;
}
