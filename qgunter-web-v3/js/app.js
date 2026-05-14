/**
 * app.js
 * Entry point: wires up the router, registers all routes,
 * installs auth guards, and starts navigation.
 */

import { Router } from './utils/router.js';
import { Auth } from './utils/auth.js';

// Public views
import * as landing from './views/landing.js';
import * as contact from './views/contact.js';
import * as login from './views/login.js';
import * as terms from './views/terms.js';
import * as privacy from './views/privacy.js';

// Client dashboard (each view module wraps itself in its shared layout)
import * as instances from './views/dashboard/instances.js';
import * as reports from './views/dashboard/reports.js';
import * as reportDetail from './views/dashboard/reportDetail.js';
import * as apiKeys from './views/dashboard/apiKeys.js';
import * as download from './views/dashboard/download.js';
import * as profile from './views/dashboard/profile.js';

// Admin panel (Requests + Users — no sidebar, only tabs)
import * as adminRequests from './views/admin/requests.js';
import * as adminUsers    from './views/admin/users.js';

const appRoot = document.getElementById('app');
Router.mount(appRoot);

/* ---------------------------------------------------------------------------
   Auth guards
   Redirect rules:
   - Unauthenticated     → any protected route → /login
   - Authenticated user  → any /admin/*        → /dashboard/instances
   - Authenticated admin → any /dashboard/*    → /admin/requests
   - Authenticated (any) → /login              → their landing zone
   --------------------------------------------------------------------------- */

const PUBLIC_ROUTES = new Set(['/', '/contact', '/login', '/terms', '/privacy']);

Router.useGuard((to) => {
  const authed = Auth.isAuthenticated();
  const isAdmin = Auth.isAdmin();

  // Signed-in users never need /login.
  if (authed && to === '/login') {
    return isAdmin ? '/admin/requests' : '/dashboard/instances';
  }

  // Unauthenticated → block protected zones.
  if (!authed) {
    if (PUBLIC_ROUTES.has(to)) return null;
    return '/login';
  }

  // Authenticated client trying to enter /admin → bounce to dashboard.
  if (!isAdmin && to.startsWith('/admin')) {
    return '/dashboard/instances';
  }

  // Authenticated admin trying to enter /dashboard → bounce to admin.
  if (isAdmin && to.startsWith('/dashboard')) {
    return '/admin/requests';
  }

  return null;
});

/* ---------------------------------------------------------------------------
   Routes
   --------------------------------------------------------------------------- */

Router
  // Public
  .register('/',         () => landing)
  .register('/contact',  () => contact)
  .register('/login',    () => login)
  .register('/terms',    () => terms)
  .register('/privacy',  () => privacy)

  // Client dashboard
  .register('/dashboard',           () => instances)         // index alias
  .register('/dashboard/instances', () => instances)
  .register('/dashboard/reports',   () => reports)
  .register('/dashboard/reports/:id', () => reportDetail)
  .register('/dashboard/keys',      () => apiKeys)
  .register('/dashboard/download',  () => download)
  .register('/dashboard/profile',   () => profile)

  // Admin panel
  .register('/admin',          () => adminRequests)        // index alias
  .register('/admin/requests', () => adminRequests)
  .register('/admin/users',    () => adminUsers);

Router.start();
