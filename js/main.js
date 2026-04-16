/* ============================================
   McLin "Duke" Sanders — Main JS
   Scroll animations, header, mobile nav
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Header scroll effect ---
  const header = document.querySelector('.site-header');
  let lastScroll = 0;

  // Sub-pages have 'scrolled' hardcoded — keep it always on those pages
  const isSubPage = header.classList.contains('scrolled');

  function handleHeaderScroll() {
    const scrollY = window.scrollY;
    if (isSubPage) {
      // Sub-pages: always keep scrolled (solid dark bg)
      header.classList.add('scrolled');
    } else {
      // Index page: toggle on scroll
      if (scrollY > 60) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  // --- Mobile nav ---
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navOverlay = document.querySelector('.nav-overlay');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      if (navOverlay) navOverlay.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    if (navOverlay) {
      navOverlay.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navOverlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    // Close mobile nav on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        if (navOverlay) navOverlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Scroll animations (Intersection Observer) ---
  const animatedElements = document.querySelectorAll('[data-animate]');

  if (animatedElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
  }

  // --- Trail journey-line scroll fill ---
  const journeyLine = document.getElementById('trails-journey-line');
  const trailsSection = document.getElementById('trails');

  if (journeyLine && trailsSection) {
    function updateJourneyLine() {
      const rect = trailsSection.getBoundingClientRect();
      const sectionH = trailsSection.offsetHeight;
      const viewH = window.innerHeight;
      // Progress: 0 when section top hits viewport bottom, 1 when section bottom hits viewport top
      const progress = Math.min(1, Math.max(0, (viewH - rect.top) / (sectionH + viewH)));
      journeyLine.style.height = (progress * 100) + '%';
    }
    window.addEventListener('scroll', updateJourneyLine, { passive: true });
    updateJourneyLine();
  }

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = header.offsetHeight + 20;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // --- Counter animation for stats ---
  const statNumbers = document.querySelectorAll('.stat-number');

  if (statNumbers.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));
  }

  function animateCounter(el) {
    const raw = el.getAttribute('data-count');
    const hasPlus = raw.includes('+');
    const hasComma = raw.includes(',');
    const target = parseInt(raw.replace(/[^0-9]/g, ''));
    const duration = 1800;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      let current = Math.floor(eased * target);

      let display = hasComma ? current.toLocaleString() : current.toString();
      if (hasPlus) display += '+';

      el.textContent = display;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // --- Current year in footer ---
  const yearEl = document.querySelector('.current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
