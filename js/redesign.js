/* Redesign — "The Long Traverse"
   Preload, custom cursor, HUD, scroll-linked animations, horizontal traverse,
   number counters, reveal observer. Vanilla JS + Lenis (loaded externally).
*/
(() => {
  'use strict';
  const D = document;
  const W = window;
  const root = D.documentElement;
  const body = D.body;
  const reduced = W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = W.matchMedia('(hover: none)').matches;

  /* ──────────────── Preload ──────────────── */
  const preload = D.getElementById('rd-preload');
  const coordsEl = D.getElementById('rd-preload-coords');
  if (preload && coordsEl) {
    const target = 'CALIBRATING · 40.6461° N, 111.4980° W';
    let i = 0;
    const delay = reduced ? 10 : 28;
    const tick = () => {
      coordsEl.textContent = target.slice(0, i++);
      if (i <= target.length) setTimeout(tick, delay);
      else {
        setTimeout(() => {
          preload.classList.add('is-done');
          body.classList.add('is-ready');
        }, reduced ? 50 : 400);
      }
    };
    setTimeout(tick, reduced ? 50 : 600);
  } else {
    body.classList.add('is-ready');
  }

  /* ──────────────── Reveal observer ──────────────── */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); revealObs.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  D.querySelectorAll('.rd-reveal').forEach(el => revealObs.observe(el));

  /* ──────────────── Counters ──────────────── */
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const formatN = (n, suffix) => {
    const s = Math.round(n).toLocaleString('en-US');
    return suffix ? s + suffix : s;
  };
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      countObs.unobserve(el);
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const dur = 1600;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        el.textContent = formatN(target * easeOut(p), suffix);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });
  D.querySelectorAll('[data-count]').forEach(el => countObs.observe(el));

  /* ──────────────── HUD ──────────────── */
  const hudRailFill = D.getElementById('rd-hud-rail-fill');
  const hudRailDot = D.getElementById('rd-hud-rail-dot');
  const hudDist = D.getElementById('rd-hud-distance');
  const hudSection = D.getElementById('rd-hud-section');
  const hudCoords = D.getElementById('rd-hud-coords');

  const sectionMap = [
    { id: 'rd-hero',      label: '§ 00 · Trailhead',   coords: '40.6461° N · 111.4980° W' },
    { id: 'rd-dossier',   label: '§ I · The Subject',  coords: '32.4617° N · 090.1153° W' },
    { id: 'rd-stats',     label: '§ I.b · Record',     coords: '06,500 mi · recorded' },
    { id: 'rd-traverse',  label: '§ II · Traverse',    coords: 'Variable · 10 trailheads' },
    { id: 'rd-fieldwork', label: '§ III · Fieldwork',  coords: '2134 m · FAA Part 107' },
    { id: 'rd-press',     label: '§ IV · Press',       coords: 'Referenced · 02' },
    { id: 'rd-ee',        label: '§ V · Expedition',   coords: 'Sierra · San Juan · Alps' },
    { id: 'rd-footer',    label: '§ End · Inquire',    coords: '40.6461° N · 111.4980° W' }
  ];
  // IO doesn't fire reliably for sections taller than viewport (traverse is 500vh).
  // Use manual "which section's top is above viewport midline" in the scroll loop.
  const sectionEls = sectionMap.map(m => ({ ...m, el: D.getElementById(m.id) })).filter(x => x.el);
  let activeSectionId = null;
  const updateActiveSection = () => {
    const probe = W.innerHeight * 0.4;
    let current = sectionEls[0];
    for (const s of sectionEls) {
      const r = s.el.getBoundingClientRect();
      if (r.top <= probe) current = s;
    }
    if (current && current.id !== activeSectionId) {
      activeSectionId = current.id;
      if (hudSection) hudSection.textContent = current.label;
      if (hudCoords) hudCoords.textContent = current.coords;
      D.querySelectorAll('.rd-nav-inner a[href^="#"]').forEach(a => {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + current.id);
      });
    }
  };

  /* ──────────────── Scroll linked: distance + rail + traverse ──────────────── */
  const traversePin = D.getElementById('rd-traverse-pin');
  const traverseTrack = D.getElementById('rd-traverse-track');
  const elevProgress = D.getElementById('rd-elev-progress');
  let elevLen = 0;
  if (elevProgress && elevProgress.getTotalLength) {
    try { elevLen = elevProgress.getTotalLength(); elevProgress.style.strokeDasharray = elevLen; elevProgress.style.strokeDashoffset = elevLen; } catch (e) {}
  }

  const clamp01 = v => Math.max(0, Math.min(1, v));
  let rafId = null;
  const onScroll = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      const scrollY = W.scrollY || W.pageYOffset;
      const docH = D.documentElement.scrollHeight - W.innerHeight;
      const p = clamp01(scrollY / docH);

      // Distance counter
      if (hudDist) hudDist.textContent = String(Math.round(p * 6500)).padStart(4, '0');

      // Active section + nav
      updateActiveSection();

      // Rail
      if (hudRailFill) hudRailFill.style.height = (p * 100) + '%';
      if (hudRailDot) hudRailDot.style.top = (p * 100) + '%';

      // Horizontal traverse (pinned section)
      if (traversePin && traverseTrack && !reduced && W.innerWidth > 720) {
        const rect = traversePin.getBoundingClientRect();
        const total = traversePin.offsetHeight - W.innerHeight;
        const localP = clamp01(-rect.top / total);
        const trackW = traverseTrack.scrollWidth;
        const maxShift = Math.max(0, trackW - W.innerWidth + 144);
        traverseTrack.style.transform = `translate3d(${-localP * maxShift}px, 0, 0)`;

        if (elevProgress && elevLen) {
          elevProgress.style.strokeDashoffset = String(elevLen * (1 - localP));
        }
      }
    });
  };
  W.addEventListener('scroll', onScroll, { passive: true });
  W.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ──────────────── Smooth anchor scrolling ──────────────── */
  D.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = a.getAttribute('href');
      if (target.length <= 1) return;
      const el = D.querySelector(target);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    });
  });
})();
