/**
 * _publicShell.js
 * Shared chrome for public (unauthenticated) views.
 *
 * TEMPLATE MODE: LimelightNav (components/7.txt) and AnimatedThemeToggler
 * (components/8.txt) have been replaced with labelled slots. A plain navbar
 * with static link styling remains in place.
 */

export function publicNavbar({ active = '' } = {}) {
  const link = (href, label) => `
    <a href="${href}" data-link class="${active === href ? 'active' : ''}">${label}</a>
  `;
  return `
    <header class="navbar">
      <a href="/" data-link class="brand-block" aria-label="Q-Gunter home" style="text-decoration:none;">
        <img src="/assets/logo.png" alt="Q-Gunter" />
      </a>

      <nav class="navbar-links" id="public-nav-links">
        ${link('/', 'Home')}
        ${link('/contact', 'Contact')}
        <a href="/login" data-link class="cta btn btn-ghost btn-sm">Sign In</a>
      </nav>
    </header>
  `;
}

export function publicFooter() {
  return `
    <footer class="footer">
      <div>© 2026 Q-GUNTER // AI Pentesting Platform</div>
      <div style="display:flex; gap:1.5rem;">
        <a href="/terms" data-link>Terms</a>
        <a href="/privacy" data-link>Privacy</a>
        <a href="/contact" data-link>Contact</a>
      </div>
    </footer>
  `;
}

/**
 * Stub init for the public chrome. In template mode there is nothing to wire
 * up yet — once the LimelightNav and ThemeToggle components are plugged in
 * this is where they'll be mounted.
 */
export function initPublicShell() {
  return { destroy() {} };
}
