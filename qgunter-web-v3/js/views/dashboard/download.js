/**
 * download.js — /dashboard/download
 * OS tabs (Linux / Windows / macOS), mock download buttons, SHA256, CLI usage block.
 */

import { renderDashboard, initDashboard } from './layout.js';
import { toast } from '../../components/toast.js';

const ROUTE = '/dashboard/download';

export const title = 'Download Agent';

const PLATFORMS = {
  linux: {
    label: 'Linux',
    file: 'qgunter-agent_0.2.0_linux_amd64.tar.gz',
    sha:  'a91f4c0e8a52a3e02f8c6d5b9c9a3a9f0e7b6c2d4f8e1a0b7d3c5e6f9a2b4c7d',
    cmd:  'qgunter-agent --key YOUR_API_KEY --instance INSTANCE_ID'
  },
  windows: {
    label: 'Windows',
    file: 'qgunter-agent_0.2.0_windows_amd64.zip',
    sha:  'c8b32a1d04e7f6a9b8d2c4e5f1a3b7d6e9f0a2c4b5d8e1f3a7b9c0d2e4f6a8b1',
    cmd:  'qgunter-agent.exe --key YOUR_API_KEY --instance INSTANCE_ID'
  },
  macos: {
    label: 'macOS',
    file: 'qgunter-agent_0.2.0_darwin_arm64.pkg',
    sha:  'e7d2f4a8b5c9d3e1a4b6f8c0d2e5a7b9c1d3e5f7a9b1c3d5e7f9a0b2c4d6e8f0',
    cmd:  'qgunter-agent --key YOUR_API_KEY --instance INSTANCE_ID'
  }
};

let currentOs = 'linux';

export function render() {
  return renderDashboard(ROUTE, `
    <header style="margin-bottom:1.5rem;">
      <div class="section-eyebrow">// CLI AGENT</div>
      <h1 class="section-title" style="margin:0;">Download Agent</h1>
      <p class="muted text-sm" style="font-family:var(--font-sans); margin-top:0.5rem; max-width:60ch;">
        Install the local CLI agent on the host you want to launch from. Once authenticated with an API key,
        the autonomous AI engine takes full control of the engagement.
      </p>
    </header>

    <div class="tab-bar mb-6" id="os-tabs">
      ${Object.entries(PLATFORMS).map(([k, p]) => `
        <button data-os="${k}" class="${k === currentOs ? 'active' : ''}">${p.label}</button>
      `).join('')}
    </div>

    <div id="platform-panel">
      ${renderPanel(PLATFORMS[currentOs])}
    </div>

    <section class="mt-8 q-panel p-6">
      <div class="section-eyebrow">// FLOW</div>
      <ol style="font-family:var(--font-sans); color:var(--q-cream-dim); line-height:1.7; padding-left:1.2rem;">
        <li>Install the agent binary on the host that will reach the target environment.</li>
        <li>Run the command on the right with your instance's API key.</li>
        <li>The agent authenticates with Q-Gunter's private cloud over a PQC-secured channel.</li>
        <li>The AI engine takes over: recon → enumeration → exploitation → reporting.</li>
        <li>Results land in <a href="/dashboard/reports" data-link class="gold">Reports</a> when the run completes.</li>
      </ol>
    </section>
  `);
}

export function init() {
  initDashboard();

  document.getElementById('os-tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-os]');
    if (!btn) return;
    currentOs = btn.getAttribute('data-os');
    document.querySelectorAll('#os-tabs button').forEach(b => b.classList.toggle('active', b === btn));
    document.getElementById('platform-panel').innerHTML = renderPanel(PLATFORMS[currentOs]);
    bindDownload();
  });

  bindDownload();
}

function bindDownload() {
  document.getElementById('dl-btn')?.addEventListener('click', () => {
    toast(`Generating ${PLATFORMS[currentOs].file}…`, { variant: 'ok' });
  });
}

function renderPanel(p) {
  return `
    <div class="grid md:grid-cols-2 gap-4">
      <div class="q-panel p-6">
        <div class="label-tag mb-2">BINARY</div>
        <div style="font-family:var(--font-mono); font-size:0.85rem; word-break:break-all;">${p.file}</div>
        <button id="dl-btn" class="btn btn-primary mt-4">Download</button>

        <div class="divider"></div>
        <div class="label-tag mb-1">SHA256</div>
        <code style="font-family:var(--font-mono); font-size:0.72rem; color:var(--q-cream-dim); word-break:break-all;">${p.sha}</code>
      </div>

      <div class="q-panel p-6">
        <div class="label-tag mb-2">CLI USAGE</div>
        <div class="code-block">
          <span class="cmt"># Authenticate the agent with your instance</span><br/>
          ${p.cmd.replace(/(--key|--instance)/g, '<span class="arg">$1</span>')}
        </div>
        <p class="muted text-xs mt-3" style="font-family:var(--font-mono); letter-spacing:0.12em;">
          Substitute <span class="gold">YOUR_API_KEY</span> and <span class="gold">INSTANCE_ID</span> from your Instances panel.
        </p>
      </div>
    </div>
  `;
}
