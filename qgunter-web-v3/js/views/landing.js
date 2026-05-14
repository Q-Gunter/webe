/**
 * landing.js — Public marketing home (/).
 *
 * TEMPLATE MODE: this file only renders the scaffolding. Every visual
 * component from /components/ has been removed and replaced with a labelled
 * `.slot` placeholder marking where it will be plugged in.
 */

import { publicNavbar, publicFooter, initPublicShell } from './_publicShell.js';
import { renderLogoCloud, initLogoCloud } from '../components/logoCloud.js';
import { mountPerspectiveMarquee } from '../components/perspectiveMarquee.js';
import { mountContainerScroll } from '../components/containerScroll.js';
import { renderTestimonials } from '../components/testimonialsColumns.js';
import { renderBackgroundPlus } from '../components/backgroundPlus.js';

let shellHandle = null;
let marqueeHandle = null;
let scrollHandle = null;

export const title = 'AI-Orchestrated Pentesting Platform';

export function render() {
  return `
    <div class="view">
      ${publicNavbar({ active: '/' })}

      <!-- HERO ============================================================ -->
      <section class="hero">
        <div class="max-w-6xl w-full mx-auto px-6 py-20 relative">
          <div class="section-eyebrow" data-stagger>// SECURE-BY-DESIGN PENTESTING</div>

          <h1 class="hero-headline" data-stagger>
            AI-orchestrated pentests.<br/>
            <span class="accent">Post-quantum hardened.</span>
          </h1>

          <p class="section-lede mt-6" data-stagger>
            Q-Gunter operates autonomous AI pentesters from isolated Docker instances
            inside your private cloud. Every engagement is authenticated with
            Post-Quantum Cryptography keys, scoped by contract, and reported in
            full forensic detail.
          </p>

          <div class="flex gap-3 mt-8 flex-wrap" data-stagger>
            <a href="/contact" data-link class="btn btn-primary btn-lg">Request Access</a>
            <a href="#how" class="btn btn-ghost btn-lg" id="learn-more-btn">Learn More</a>
          </div>

        </div>
      </section>

      <!-- PerspectiveMarquee — section divider between hero and how-it-works (components/6.txt) -->
      <div id="phases-marquee" class="perspective-marquee" aria-hidden="true"></div>

      <!-- HOW IT WORKS — inside a ContainerScroll laptop (components/3.txt) -->
      <div id="how" class="container-scroll">
        <div class="cs-inner">

          <!-- Header outside the laptop, translates -100 with scroll. -->
          <div class="cs-header">
            <div class="section-eyebrow">// 03_STEPS</div>
            <h2 class="section-title">How it works</h2>
            <p class="section-lede mx-auto" style="margin-left:auto;margin-right:auto;">
              A controlled, contractual on-ramp — no self-service, no shortcuts.
            </p>
          </div>

          <!-- Card (rotates + scales). -->
          <div class="cs-card">
            <div class="cs-laptop">
              <div class="cs-bezel">
                <div class="cs-camera-dot"></div>
                <div class="cs-screen">
                  ${renderHowItWorksTimeline()}
                </div>
              </div>
              <div class="cs-base"></div>
            </div>
          </div>

        </div>
      </div>

      <!-- TestimonialsColumn (components/5.txt) ============================ -->
      ${renderTestimonials()}

      <!-- ENTERPRISE CTA — BackgroundPlus (components/9.txt) =============== -->
      <section class="max-w-[1440px] mx-auto px-8 py-20 border-t border-q-border">
        <div class="q-panel p-10 md:p-14 text-center relative" style="overflow:hidden;">
          ${renderBackgroundPlus()}
          <div class="section-eyebrow" style="position:relative; z-index:1;">// ENTERPRISE</div>
          <h2 class="section-title" style="position:relative; z-index:1;">Ready to secure your infrastructure?</h2>
          <p class="section-lede mx-auto mb-6" style="margin-left:auto;margin-right:auto;position:relative;z-index:1;">
            Schedule a scoping call with the Q-Gunter team. Onboarding usually clears in under a week once the MSA is countersigned.
          </p>
          <a href="/contact" data-link class="btn btn-primary btn-lg" style="position:relative; z-index:1;">Request Access</a>
        </div>
      </section>

      <!-- LogoCloud — tech-stack marquee (components/1.txt) =============== -->
      ${renderLogoCloud()}

      ${publicFooter()}
    </div>
  `;
}

export function init() {
  // Smooth scroll for "Learn More".
  const learn = document.getElementById('learn-more-btn');
  if (learn) {
    learn.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Staggered reveal of hero elements (this is GSAP, not a /components/ port).
  if (window.gsap) {
    window.gsap.from('[data-stagger]', {
      opacity: 0, y: 20, duration: 0.6, ease: 'power2.out', stagger: 0.12, delay: 0.1
    });
  }

  shellHandle = initPublicShell();

  // LogoCloud — pause the marquee until all images have loaded so the loop
  // never starts with empty slots filling in mid-scroll.
  initLogoCloud();

  // PerspectiveMarquee — section divider between hero and how-it-works.
  const marqueeHost = document.getElementById('phases-marquee');
  if (marqueeHost) {
    marqueeHandle = mountPerspectiveMarquee(marqueeHost, {
      items: ['Recon', 'Enumeration', 'Exploitation', 'Post-Exploitation', 'Documentation'],
      fontSize: 64,
      speed: 60,                              // slow / contemplative
      rotateY: -28,
      rotateX: 8,
      perspective: 1200,
      background: 'transparent',              // blends with the page
      // Alternates per word index: even → gold, odd → cream (same pattern
      // the GooeyText had — keeps the kill-chain visual code consistent).
      colors: ['#EAB308', '#F5F5DC']
    });
  }

  // ContainerScroll — "How it works" laptop reveal.
  const csRoot = document.getElementById('how');
  if (csRoot) scrollHandle = mountContainerScroll(csRoot);
}

export function destroy() {
  if (shellHandle)   { shellHandle.destroy();   shellHandle = null; }
  if (marqueeHandle) { marqueeHandle.destroy(); marqueeHandle = null; }
  if (scrollHandle)  { scrollHandle.destroy();  scrollHandle = null; }
}

/* ----- helpers ----------------------------------------------------------- */

function renderHowItWorksTimeline() {
  const steps = [
    {
      num: '01',
      title: 'Contact us',
      body: 'Submit a request through the secure form. Our team reviews the use case and confirms scope eligibility.'
    },
    {
      num: '02',
      title: 'Sign contract',
      body: 'We execute Rules of Engagement and an MSA. Credentials are issued only after the signed contract returns.'
    },
    {
      num: '03',
      title: 'Deploy and pentest',
      body: 'Provision an isolated cloud instance, install the CLI agent, and the AI takes the engagement end-to-end.'
    }
  ];

  const arrow = `
    <svg viewBox="0 0 56 14" aria-hidden="true">
      <path d="M0 7 L46 7" stroke="currentColor" stroke-width="1" stroke-dasharray="2 3" fill="none"/>
      <path d="M46 1 L54 7 L46 13" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  const stepEl = (s) => `
    <div class="cs-step">
      <span class="cs-num">${s.num}</span>
      <h4>${s.title}</h4>
      <p>${s.body}</p>
    </div>
  `;
  const connector = `<div class="cs-connector">${arrow}</div>`;

  return `
    <div class="cs-timeline">
      ${stepEl(steps[0])}
      ${connector}
      ${stepEl(steps[1])}
      ${connector}
      ${stepEl(steps[2])}
    </div>
  `;
}
