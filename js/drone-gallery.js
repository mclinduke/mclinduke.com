/* ============================================
   Drone Gallery — Grid + Lightbox
   ============================================ */

(function () {
  'use strict';

  const BASE = '../images/portfolio/drone/';

  const DRONE_IMAGES = [
    '10BFCCD5-FAB6-4B8C-B352-78F9322F681E_1_201_a.jpeg',
    '26EA1F83-B1A0-427D-BD54-542D24CFBB21_1_105_c.jpeg',
    '3E4D824E-D986-4611-B968-186647AD9B3A_1_105_c.jpeg',
    '439368A8-8517-4AE7-8EB5-5BB7EA2B8EFA_1_105_c.jpeg',
    '452154F1-1D28-468B-BF6C-4BC450031D70_1_201_a.jpeg',
    '4DB55258-901B-48AF-AADC-E145E365F722_1_105_c.jpeg',
    '563BDB23-6949-4E14-BE51-402CB4689672_1_105_c.jpeg',
    '87F85BB1-B6C1-42C0-88DD-B3B5464A6559_1_105_c.jpeg',
    '890D860D-7B3B-49A1-A6AB-18C208E35729_1_105_c.jpeg',
    'C7B4340B-22C1-4D60-8CC9-42F388E26D96_1_105_c.jpeg',
    'D2A3EB0F-5A97-4477-85B6-3CB204C1C94B_1_105_c.jpeg',
    'DFA93191-C6FB-41F9-9AF1-F297FB07C6F3_1_105_c.jpeg',
    'DJI_0476.jpeg',
    'DJI_0484.jpeg',
    'DJI_0502.jpeg',
    'DJI_0537.jpeg',
    'EF0D2309-29C1-47CB-8263-9370AA470E97_1_105_c.jpeg',
    'FB4FE4F6-80D0-48B9-88BB-E3C4FA8D8030_1_105_c.jpeg',
    'drone-02.jpg',
    'drone-06.jpg'
  ].map(f => BASE + f);

  // ── Render grid ──────────────────────────────────────────────
  const grid = document.getElementById('drone-grid');

  const imgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          const full = new Image();
          full.onload = () => { img.src = img.dataset.src; delete img.dataset.src; img.classList.add('loaded'); };
          full.src = img.dataset.src;
          imgObserver.unobserve(img);
        }
      }
    });
  }, { rootMargin: '400px 0px' });

  DRONE_IMAGES.forEach((src, idx) => {
    const div = document.createElement('div');
    div.className = 'drone-item';

    const img = document.createElement('img');
    img.dataset.src = src;
    img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2"><rect fill="%23201b14" width="3" height="2"/></svg>';
    img.alt = 'Drone aerial photography';
    img.loading = 'lazy';
    img.className = 'blur-up';

    div.appendChild(img);
    div.addEventListener('click', () => openLightbox(idx));
    imgObserver.observe(img);
    grid.appendChild(div);
  });

  // ── Lightbox ─────────────────────────────────────────────────
  const lightbox  = document.getElementById('dlb-lightbox');
  const dlbImg    = document.getElementById('dlb-img');
  const dlbCounter = document.getElementById('dlb-counter');
  const dlbSpinner = document.getElementById('dlb-spinner');
  const dlbClose  = document.getElementById('dlb-close');
  const dlbPrev   = document.getElementById('dlb-prev');
  const dlbNext   = document.getElementById('dlb-next');

  let lbIndex = 0;

  function openLightbox(index) {
    lbIndex = index;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    loadImage(index);
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    dlbImg.src = '';
  }

  function loadImage(index) {
    const src = DRONE_IMAGES[index];
    dlbImg.classList.add('loading');
    dlbSpinner.classList.add('visible');
    dlbCounter.textContent = `${index + 1} / ${DRONE_IMAGES.length}`;
    const pre = new Image();
    pre.onload = pre.onerror = () => {
      dlbImg.src = src;
      dlbImg.classList.remove('loading');
      dlbSpinner.classList.remove('visible');
    };
    pre.src = src;
  }

  function prevPhoto() { lbIndex = (lbIndex - 1 + DRONE_IMAGES.length) % DRONE_IMAGES.length; loadImage(lbIndex); }
  function nextPhoto() { lbIndex = (lbIndex + 1) % DRONE_IMAGES.length; loadImage(lbIndex); }

  dlbClose.addEventListener('click', closeLightbox);
  dlbPrev.addEventListener('click', prevPhoto);
  dlbNext.addEventListener('click', nextPhoto);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  prevPhoto();
    if (e.key === 'ArrowRight') nextPhoto();
  });

  let touchStartX = 0;
  lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { dx < 0 ? nextPhoto() : prevPhoto(); }
  }, { passive: true });

})();
