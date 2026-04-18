/* ============================================
   Interactive Trail Map — Leaflet.js
   Three Regional Panels
   ============================================ */
(function () {
  'use strict';

  const container = document.getElementById('trail-map-container');
  if (!container) return;

  // ── Trail data ──────────────────────────────
  const TRAILS = [
    { key: 'pct',        lat: 37.74,  lng: -119.57, name: 'Pacific Crest Trail',   year: '2025 · Thru-Hike',    stats: '2,650 mi · Mexico → Canada',                   href: 'pages/pacific-crest-trail.html', intl: false, region: 'usa' },
    { key: 'at',         lat: 37.50,  lng: -79.50,  name: 'Appalachian Trail',      year: '2020 · Thru-Hike',    stats: '2,193 mi · Georgia → Maine',                   href: 'pages/appalachian-trail.html',   intl: false, region: 'usa' },
    { key: 'colorado',   lat: 38.50,  lng: -106.00, name: 'Colorado Trail',         year: '2022 · Thru-Hike',    stats: '485 mi · Durango → Denver',                    href: 'pages/colorado-trail.html',      intl: false, region: 'usa' },
    { key: 'pinhoti',    lat: 33.50,  lng: -86.30,  name: 'Pinhoti Trail',          year: '2023 · Thru-Hike',    stats: '335 mi · Alabama → Georgia',                   href: 'pages/pinhoti-trail.html',       intl: false, region: 'usa' },
    { key: 'bmt',        lat: 35.10,  lng: -84.00,  name: 'Benton MacKaye Trail',   year: '2025 · Winter',        stats: '150 mi · GA → TN',                             href: 'pages/benton-mackaye-trail.html',intl: false, region: 'usa' },
    { key: 'trt',        lat: 39.10,  lng: -120.00, name: 'Tahoe Rim Trail',        year: '2023',                 stats: '170 mi · Loop around Lake Tahoe',              href: 'pages/tahoe-rim-trail.html',     intl: false, region: 'usa' },
    { key: 'uinta',      lat: 40.70,  lng: -110.50, name: 'Uinta Highline Trail',   year: '2023 · Solo',          stats: '86 mi · Utah backcountry',                     href: 'pages/uinta-highline-trail.html',intl: false, region: 'usa' },
    { key: 'lost-coast',  lat: 40.05,  lng: -124.10, name: 'Lost Coast Trail',        year: '2023',                 stats: '25 mi · N. California coast',                  href: 'pages/lost-coast-trail.html',         intl: false, region: 'usa' },
    { key: 'eagle-rock', lat: 34.57,  lng: -94.13,  name: 'Eagle Rock Loop',         year: '2025 · Backpack',      stats: '26.8 mi · Ouachita Mountains, AR',             href: 'pages/eagle-rock-loop.html',          intl: false, region: 'usa' },
    { key: 'escalante',  lat: 37.77,  lng: -111.59, name: 'Escalante Canyon Loop',   year: '2026 · Canyon Route',  stats: '25.1 mi · 4,019 ft gain · Utah',               href: 'pages/escalante-canyon-loop.html',    intl: false, region: 'usa' },
    { key: 'whitney',    lat: 36.58,  lng: -118.29, name: 'Mount Whitney',           year: '2025 · Summit',        stats: '14,505 ft · via PCT · Sierra Nevada, CA',      href: 'pages/mount-whitney.html',            intl: false, region: 'usa' },
    { key: 'shasta',     lat: 41.41,  lng: -122.19, name: 'Mount Shasta',            year: '2025 · Mountaineering',stats: '14,179 ft · Cascade Range, CA',                href: 'pages/mount-shasta.html',             intl: false, region: 'usa' },
    { key: 'tmb',        lat: 45.83,  lng: 6.86,    name: 'Tour du Mont Blanc',     year: '2024 · International', stats: '100 mi · France · Italy · Switzerland',         href: 'pages/tour-du-mont-blanc.html',  intl: true,  region: 'alps' },
    { key: 'ebc',        lat: 28.00,  lng: 86.85,   name: 'Everest Base Camp',      year: '2024 · Expedition',    stats: '~50 mi · 17,700 ft · Nepal',                   href: 'pages/everest-base-camp.html',   intl: true,  region: 'nepal' }
  ];

  // ── Trail route polylines (approximate waypoints) ──
  const TRAIL_ROUTES = {
    pct: [
      [32.59, -116.47], [33.90, -117.65], [35.40, -118.30], [36.58, -118.77],
      [37.74, -119.57], [39.10, -120.00], [40.40, -121.50], [42.00, -122.20],
      [43.60, -122.10], [45.50, -121.75], [46.85, -121.50], [48.99, -120.78]
    ],
    at: [
      [34.63, -84.19], [35.56, -83.50], [36.60, -81.70], [37.50, -79.50],
      [38.73, -78.35], [39.90, -77.05], [40.98, -75.20], [41.50, -74.30],
      [42.70, -73.17], [43.73, -72.29], [44.27, -71.30], [45.90, -68.92]
    ],
    colorado: [
      [37.28, -107.88], [37.80, -107.10], [38.50, -106.00], [39.15, -105.50], [39.74, -105.00]
    ],
    pinhoti: [
      [33.00, -86.50], [33.50, -86.30], [34.00, -85.60], [34.63, -84.19]
    ],
    bmt: [
      [34.63, -84.19], [35.10, -84.00], [35.56, -83.50]
    ],
    trt: [
      [39.27, -120.10], [39.20, -119.80], [38.95, -119.90], [38.95, -120.15], [39.10, -120.25], [39.27, -120.10]
    ],
    uinta: [
      [40.75, -111.10], [40.72, -110.50], [40.70, -110.00]
    ],
    'lost-coast': [
      [40.44, -124.41], [40.05, -124.10], [39.93, -123.99]
    ],
    'eagle-rock': [
      [34.50, -94.25], [34.55, -94.18], [34.63, -94.08], [34.68, -94.10], [34.62, -94.20], [34.50, -94.25]
    ],
    escalante: [
      [37.85, -111.70], [37.80, -111.55], [37.72, -111.50], [37.68, -111.62], [37.75, -111.75], [37.85, -111.70]
    ],
    whitney: [
      [36.45, -118.05], [36.53, -118.15], [36.58, -118.29]
    ],
    shasta: [
      [41.30, -122.25], [41.37, -122.21], [41.41, -122.19]
    ],
    tmb: [
      [45.90, 6.87], [45.85, 7.05], [45.75, 6.98], [45.77, 6.80], [45.83, 6.72], [45.90, 6.87]
    ],
    ebc: [
      [27.69, 86.73], [27.80, 86.75], [27.90, 86.82], [28.00, 86.85]
    ]
  };

  // ── Region configs ─────────────────────────
  const REGION_CONFIG = {
    usa:   { center: [38, -98],     zoom: 4, minZoom: 3, maxZoom: 10 },
    alps:  { center: [45.83, 6.86], zoom: 8, minZoom: 6, maxZoom: 13 },
    nepal: { center: [27.9, 86.8],  zoom: 8, minZoom: 6, maxZoom: 13 }
  };

  // ── Tile factory ────────────────────────────
  function makeTiles() {
    return L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 16
      }
    );
  }

  // ── Custom marker icon ─────────────────────
  function trailIcon(intl) {
    return L.divIcon({
      className: 'trail-marker-icon' + (intl ? ' intl' : ''),
      html: '<span class="marker-pulse"></span><span class="marker-inner"></span>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -14]
    });
  }

  // ── Popup HTML ─────────────────────────────
  function popupHTML(t) {
    return `
      <div class="trail-popup-year">${t.year}</div>
      <div class="trail-popup-name">${t.name}</div>
      <div class="trail-popup-stats">${t.stats}</div>
      <a class="trail-popup-cta" href="${t.href}">Explore trail →</a>
    `;
  }

  // ── Build each regional map ────────────────
  const maps = {};
  var initialized = {};

  function initMap(region) {
    if (initialized[region]) {
      maps[region].invalidateSize();
      return;
    }

    const el = document.getElementById('map-' + region);
    if (!el) return;

    const cfg = REGION_CONFIG[region];
    const map = L.map(el, {
      center: cfg.center,
      zoom: cfg.zoom,
      minZoom: cfg.minZoom,
      maxZoom: cfg.maxZoom,
      zoomControl: true,
      scrollWheelZoom: false,
      layers: [makeTiles()]
    });

    const group = L.featureGroup();
    const markerLatLngs = [];

    const abbr = {
      at:'AT', pct:'PCT', colorado:'CT', pinhoti:'PIN', bmt:'BMT',
      trt:'TRT', uinta:'UHT', 'lost-coast':'LCT', 'eagle-rock':'ERL',
      escalante:'ECL', whitney:'WHIT', shasta:'SHAS', tmb:'TMB', ebc:'EBC'
    };
    TRAILS.filter(t => t.region === region).forEach(t => {
      const marker = L.marker([t.lat, t.lng], { icon: trailIcon(t.intl) })
        .bindPopup(popupHTML(t), { maxWidth: 220, closeButton: true })
        .bindTooltip(abbr[t.key] || t.name, {
          permanent: true, direction: 'right', offset: [10, 0],
          className: 'trail-marker-label'
        });
      group.addLayer(marker);
      markerLatLngs.push([t.lat, t.lng]);

      const coords = TRAIL_ROUTES[t.key];
      if (coords) {
        group.addLayer(L.polyline(coords, {
          color: '#6b8f71',
          weight: 2.5,
          opacity: 0.6,
          dashArray: '6 4',
          lineCap: 'round'
        }));
      }
    });

    group.addTo(map);

    if (markerLatLngs.length > 1) {
      map.fitBounds(L.latLngBounds(markerLatLngs).pad(0.12));
    }

    maps[region] = map;
    initialized[region] = true;
  }

  // ── Region tab switching ───────────────────
  const btnBar = container.querySelector('.trail-map-regions');
  const panels = container.querySelectorAll('.trail-map-panel');

  function activateRegion(region) {
    btnBar.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    const matching = btnBar.querySelector('[data-region="' + region + '"]');
    if (matching) matching.classList.add('active');

    panels.forEach(p => {
      if (p.dataset.panel === region) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });

    // Lazy-init map on first show
    setTimeout(function () { initMap(region); }, 50);
  }

  btnBar.addEventListener('click', function (e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    activateRegion(btn.dataset.region);
  });

  // ── Scroll-triggered entrance ──────────────
  const section = document.querySelector('.trail-world-map-section');
  if (section) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          section.classList.add('in-view');
          initMap('usa');
          observer.unobserve(section);
        }
      });
    }, { threshold: 0.15 });
    observer.observe(section);
  }

})();
