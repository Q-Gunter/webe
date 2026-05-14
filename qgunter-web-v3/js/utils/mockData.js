/**
 * mockData.js
 * In-memory mocks for instances, API keys, and pentest reports.
 * The dashboard views read/mutate these arrays directly so changes
 * persist across navigations within a single session.
 */

export const MockState = {
  /**
   * Active users in the platform — admin manages these from /admin/users.
   * Each row mirrors what the real backend would expose: stable id + status.
   */
  users: [
    { id: 42, name: 'Lena Ortiz',     email: 'client@test.com',   company: 'Northwind Industries', role: 'user',  status: 'Active',    created: '2025-03-12' },
    { id: 51, name: 'Marc Lefebvre',  email: 'mlefebvre@helix.bio', company: 'Helix Biotech',        role: 'user',  status: 'Active',    created: '2025-04-02' },
    { id: 67, name: 'Aisha Khan',     email: 'aisha@vault-fs.com', company: 'Vault Financial',     role: 'user',  status: 'Suspended', created: '2025-02-28' },
    { id: 1,  name: 'Q-Gunter Operator', email: 'admin@qgunter.io', company: 'Q-Gunter S.L.',      role: 'admin', status: 'Active',    created: '2025-01-01' }
  ],

  /**
   * Incoming contact requests from the public /contact form. The admin
   * reviews them in /admin/requests and either creates an account (modal)
   * or rejects them.
   */
  contactRequests: [
    {
      id: 'req_01',
      company: 'Aerion Logistics',
      name: 'Diego Salazar',
      email: 'dsalazar@aerion-logistics.eu',
      role: 'CISO',
      useCase: 'Quarterly external pentest on customer-facing booking portal and the EDI gateway. We need a partner that supports continuous engagements after the first audit.',
      consent: true,
      status: 'pending',
      submitted: '2025-05-10 14:22'
    },
    {
      id: 'req_02',
      company: 'Threshold Capital',
      name: 'Patricia Whitman',
      email: 'p.whitman@thresholdcap.co',
      role: 'Head of Security',
      useCase: 'Pre-audit hardening before our SOC 2 Type II observation period. Scope: 4 production VPCs, no customer data access.',
      consent: true,
      status: 'pending',
      submitted: '2025-05-08 09:41'
    },
    {
      id: 'req_03',
      company: 'Larkspur Health',
      name: 'Tomás Reyes',
      email: 'treyes@larkspur-health.com',
      role: 'VP Engineering',
      useCase: 'Looking at automated pentest options for our patient portal. We currently run manual engagements once a year and they are not catching enough.',
      consent: true,
      status: 'approved',
      submitted: '2025-05-05 16:00'
    },
    {
      id: 'req_04',
      company: 'NovaPay',
      name: 'Sven Hagen',
      email: 'sven.hagen@novapay.io',
      role: 'CTO',
      useCase: 'Wanted to inquire about pricing — never got back to us in time for our budget cycle.',
      consent: true,
      status: 'rejected',
      submitted: '2025-04-22 11:08'
    }
  ],

  instances: [
    {
      id: 'inst_01',
      name: 'Production Audit',
      status: 'Running',
      created: '2025-05-01',
      key: 'qg_prod_xK9j8h2L4mNpQrTvWxYz3a5b7c9d1eFg0HiJ2KlM3nOpQ4rS5tUv6WxY7zA8bC9dEm2Np'
    },
    {
      id: 'inst_02',
      name: 'Staging Environment',
      status: 'Stopped',
      created: '2025-04-18',
      key: 'qg_stg_aB3kL9p2vN5wQ8xRtY1cV6fM4nP7sJ0eH3iG5oU2dF8mZ7bX4qK1aT9lE6hY3uS0pVr7Qw'
    },
    {
      id: 'inst_03',
      name: 'Dev Server Check',
      status: 'Completed',
      created: '2025-04-02',
      key: 'qg_dev_nL5tQ8wK2pX9aB1cM4vH7eF0jR3sG6yU2dZ9oI5rT8nP1xV4qS7bH0lA3kE6mW9pY1Xt'
    }
  ],

  reports: [
    {
      id: 'rep_01',
      instance: 'Production Audit',
      target: '192.168.1.0/24',
      started: '2025-05-01 09:00',
      ended: '2025-05-01 14:32',
      duration: '5h 32m',
      status: 'Completed',
      riskScore: 'Critical',
      summary:
        'The autonomous engine completed a six-stage assessment of the production subnet. ' +
        'Two critical findings allow unauthenticated remote code execution and full administrative ' +
        'access. Immediate remediation is required before next scheduled deploy window.',
      findings: [
        { name: 'Remote Code Execution via Log4Shell', severity: 'Critical', cvss: 9.8, component: 'Apache 2.4.49', remediation: 'Update to Apache 2.4.51+' },
        { name: 'SQL Injection in /api/users', severity: 'High', cvss: 8.1, component: 'Backend API', remediation: 'Parameterize all DB queries' },
        { name: 'Outdated SSL/TLS Configuration', severity: 'Medium', cvss: 5.3, component: 'nginx 1.18', remediation: 'Disable TLS 1.0/1.1, enforce TLS 1.3' },
        { name: 'Default credentials on admin panel', severity: 'Critical', cvss: 9.1, component: 'Admin Portal :8080', remediation: 'Rotate credentials immediately' }
      ]
    },
    {
      id: 'rep_02',
      instance: 'Staging Environment',
      target: '10.0.0.0/16',
      started: '2025-04-19 02:10',
      ended: '2025-04-19 04:48',
      duration: '2h 38m',
      status: 'Completed',
      riskScore: 'Medium',
      summary:
        'Staging perimeter scan completed without critical findings. Three medium-severity issues ' +
        'were observed in TLS configuration and session handling.',
      findings: [
        { name: 'Weak TLS cipher suites', severity: 'Medium', cvss: 5.9, component: 'haproxy 2.4', remediation: 'Drop CBC and 3DES ciphers' },
        { name: 'Verbose error pages leaking stack traces', severity: 'Low', cvss: 3.1, component: 'staging-api', remediation: 'Disable debug mode in non-dev environments' },
        { name: 'Missing HSTS header', severity: 'Low', cvss: 2.4, component: 'edge nginx', remediation: 'Set Strict-Transport-Security with preload' }
      ]
    },
    {
      id: 'rep_03',
      instance: 'Dev Server Check',
      target: 'dev.internal.corp',
      started: '2025-04-02 11:00',
      ended: '2025-04-02 11:14',
      duration: '14m',
      status: 'Failed',
      riskScore: 'Unknown',
      summary: 'Engagement halted: agent lost connection during active reconnaissance phase. Re-run recommended.',
      findings: []
    }
  ]
};

/** Generate a deterministic-looking mock key (with PQC-style prefix). */
export function generateApiKey(prefix = 'qg_inst') {
  const seg = () => Math.random().toString(36).slice(2, 10);
  return `${prefix}_${seg()}${seg()}${seg()}${seg()}${seg()}`;
}

/** Format helper for the truncated/masked key shown in tables. */
export function maskKey(key) {
  if (!key) return '';
  const head = key.slice(0, 10);
  const tail = key.slice(-4);
  return `${head}••••••••${tail}`;
}
