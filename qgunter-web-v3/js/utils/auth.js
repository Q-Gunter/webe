/**
 * auth.js
 * Mock authentication backed by localStorage.
 *
 * Q-Gunter is contract-only: there is no self-registration. Accounts are
 * created by the admin team after a /contact request is reviewed. So the
 * only states a user can have are:
 *   - signed out (no session)
 *   - signed in as a regular client (role: 'user') → /dashboard/*
 *   - signed in as an admin             (role: 'admin') → /admin/*
 *
 * There is no "pending approval" state any more — if a user exists they
 * are active. Pending review happens on the contact-requests side, not on
 * the user side.
 *
 * Session shape persisted under "qg_session":
 *   { isAuthenticated, user: { id, name, email, company, role } }
 *
 * Two seed accounts for development:
 *   client@test.com / test123    role: 'user'   → /dashboard/instances
 *   admin@qgunter.io / admin123  role: 'admin'  → /admin/requests
 */

const SESSION_KEY = 'qg_session';

const SEED_USERS = [
  {
    email: 'client@test.com',
    password: 'test123',
    user: {
      id: 42,
      name: 'Lena Ortiz',
      email: 'client@test.com',
      company: 'Northwind Industries',
      role: 'user'
    }
  },
  {
    email: 'admin@qgunter.io',
    password: 'admin123',
    user: {
      id: 1,
      name: 'Q-Gunter Operator',
      email: 'admin@qgunter.io',
      company: 'Q-Gunter S.L.',
      role: 'admin'
    }
  }
];

export const Auth = {
  getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },

  clearSession() {
    localStorage.removeItem(SESSION_KEY);
  },

  isAuthenticated() {
    const s = this.getSession();
    return !!(s && s.isAuthenticated);
  },

  /** Returns 'admin' | 'user' | null */
  role() {
    const s = this.getSession();
    return s?.user?.role || null;
  },

  isAdmin() {
    return this.role() === 'admin';
  },

  currentUser() {
    return this.getSession()?.user || null;
  },

  /**
   * Mock sign-in. Returns the matched seed session or null.
   * When you wire the real backend, swap the SEED_USERS lookup for a
   * `fetch('/api/auth/login', { method: 'POST', body: {email, password} })`
   * and store `user.id` + `user.role` from the response.
   */
  signIn(email, password) {
    const found = SEED_USERS.find(
      u => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password
    );
    if (!found) return null;

    const session = {
      isAuthenticated: true,
      user: { ...found.user }
    };
    this.setSession(session);
    return session;
  },

  signOut() {
    this.clearSession();
  }
};
