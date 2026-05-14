/**
 * router.js
 * Lightweight client-side router using the History API.
 *
 * Public surface:
 *   Router.register(path, viewFactory)  → string path or RegExp
 *   Router.navigate(path, { replace })
 *   Router.start()                      → reads location, renders matching view
 *   Router.useGuard(fn)                 → fn(to) → string|null (redirect path)
 *
 * Each view module exports:
 *   render(params) → HTMLString
 *   init(params, root) → void   (attaches listeners; called after DOM mount)
 *   destroy?() → optional teardown for animations/timers
 *
 * Transitions are GSAP-driven: old view fades+slides out, new view fades+slides in.
 */

const routes = [];
const guards = [];
let currentView = null;
let appRoot = null;

export const Router = {
  mount(el) { appRoot = el; },

  register(path, factory) {
    routes.push({ path, factory });
    return this;
  },

  useGuard(fn) {
    guards.push(fn);
    return this;
  },

  navigate(path, opts = {}) {
    const target = normalize(path);
    if (target === currentPath()) return;
    if (opts.replace) history.replaceState({}, '', target);
    else history.pushState({}, '', target);
    return this._render(target);
  },

  start() {
    window.addEventListener('popstate', () => this._render(currentPath()));

    // Capture clicks on any internal <a data-link> for SPA navigation.
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-link]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto:')) return;
      e.preventDefault();
      this.navigate(href);
    });

    return this._render(currentPath());
  },

  async _render(rawPath) {
    if (!appRoot) return;

    // Run guards top-to-bottom; the first to return a redirect path wins.
    for (const guard of guards) {
      const redirect = guard(rawPath);
      if (redirect && redirect !== rawPath) {
        history.replaceState({}, '', redirect);
        rawPath = redirect;
        break;
      }
    }

    const match = matchRoute(rawPath);
    if (!match) {
      appRoot.innerHTML = notFoundHtml(rawPath);
      bindNotFound(appRoot);
      return;
    }

    const { factory, params } = match;
    const view = await Promise.resolve(factory());

    // Tear down previous view if it has a destroy hook.
    if (currentView && typeof currentView.destroy === 'function') {
      try { currentView.destroy(); } catch (err) { console.warn('view destroy error', err); }
    }

    // Out animation, then swap, then in animation.
    const gsap = window.gsap;
    const outgoing = appRoot.firstElementChild;

    const swap = () => {
      appRoot.innerHTML = view.render(params) || '';
      if (typeof view.init === 'function') view.init(params, appRoot);
      currentView = view;

      // Stagger reveal for first-level children of the new view container.
      if (gsap) {
        const root = appRoot.firstElementChild || appRoot;
        gsap.fromTo(
          root,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
        );
      }

      // Update <title> if the view sets one.
      if (view.title) document.title = `Q-Gunter | ${view.title}`;
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    if (gsap && outgoing) {
      gsap.to(outgoing, {
        opacity: 0,
        y: -8,
        duration: 0.22,
        ease: 'power1.in',
        onComplete: swap
      });
    } else {
      swap();
    }
  }
};

function currentPath() {
  return normalize(window.location.pathname + window.location.search);
}

function normalize(p) {
  if (!p) return '/';
  // Strip trailing slash except root.
  let path = p.split('?')[0];
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  return path || '/';
}

function matchRoute(path) {
  for (const r of routes) {
    if (typeof r.path === 'string') {
      // Support :param tokens.
      const paramNames = [];
      const re = new RegExp(
        '^' + r.path.replace(/:[^/]+/g, (m) => { paramNames.push(m.slice(1)); return '([^/]+)'; }) + '$'
      );
      const m = path.match(re);
      if (m) {
        const params = {};
        paramNames.forEach((n, i) => (params[n] = decodeURIComponent(m[i + 1])));
        return { factory: r.factory, params };
      }
    } else if (r.path instanceof RegExp) {
      const m = path.match(r.path);
      if (m) return { factory: r.factory, params: m.groups || {} };
    }
  }
  return null;
}

/* ----- 404 fallback (port of components/10.txt visual idea) ---------------- */

function notFoundHtml(path) {
  return `
    <section class="view" style="min-height: calc(100vh - 80px); display:grid; place-items:center; padding: 2rem;">
      <div style="text-align:center; max-width: 520px;">
        <div class="section-eyebrow">ERROR // 404</div>
        <h1 style="font-family: var(--font-mono); font-size: clamp(4rem, 12vw, 8rem); margin:0; color: var(--q-gold); letter-spacing:-0.04em;">404</h1>
        <p class="section-lede" style="margin: 0.5rem auto 1.5rem;">
          No route matched <span class="gold">${escapeHtml(path)}</span>. The target may have been moved, retired, or never existed.
        </p>
        <div style="display:flex; gap: 0.75rem; justify-content:center; flex-wrap:wrap;">
          <a href="/" data-link class="btn btn-primary">Return Home</a>
          <a href="/contact" data-link class="btn btn-ghost">Contact Us</a>
        </div>
      </div>
    </section>
  `;
}

function bindNotFound() { /* clicks are handled by the global delegate */ }

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
