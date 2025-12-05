/*
  transparency-commitment.js
  Orchestrator for the Transparency Commitment page.
  Responsibilities:
   - Fetch /api/admin-stats and /api/transparency-proofs with timeout and aliases
   - Render KPIs and proofs, with graceful fallbacks
   - Initialize/Update Chart.js pie chart when available (id: revenuePie)
   - Theme toggle persistence
   - Error-safe and production hardened
*/

(function () {
  'use strict';

  /* ---------- Config ---------- */
  const API = {
    stats: '/api/admin-stats',
    proofs: '/api/transparency-proofs?limit=6'
  };
  const FETCH_TIMEOUT = 4500;
  const DEFAULTS = {
    total_revenue: 0,
    total_reserved: 0,
    pending: 0,
    donation_pct: 40
  };

  /* ---------- Helpers ---------- */
  function log() { console.log('[TC]', ...arguments); }

  function safeText(selector, txt) {
    const el = document.getElementById(selector);
    if (el) el.textContent = (txt === undefined || txt === null) ? '—' : String(txt);
  }

  function safeHTML(selector, html) {
    const el = document.getElementById(selector);
    if (el) el.innerHTML = html || '';
  }

  function fetchWithTimeout(url, opts = {}) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), FETCH_TIMEOUT);
      fetch(url, opts)
        .then(r => {
          clearTimeout(timer);
          if (!r.ok) return reject(new Error('http ' + r.status));
          resolve(r.json());
        })
        .catch(err => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  /* ---------- Normalize varying API shapes ---------- */
  function pickStatAliases(data) {
    const get = key =>
      data[key] ??
      data?.[key.toLowerCase()] ??
      data?.[key.replace(/[_\s-]/g, '')] ??
      0;

    const totalRevenue =
      data.total_revenue ??
      data.totalRevenue ??
      data.total_sales ??
      get('total_revenue');

    const totalReserved =
      data.total_reserved ??
      data.totalReserved ??
      data.total_donated ??
      get('total_reserved');

    const pending =
      data.pending ??
      data.pending_allocations ??
      get('pending');

    const donationPct =
      data.donation_pct ??
      data.donationPct ??
      Math.round((totalReserved / (totalRevenue || 1)) * 100);

    const generated_at =
      data.generated_at ??
      data.last_updated ??
      data.updated_at ??
      null;

    return {
      totalRevenue: Number(totalRevenue) || 0,
      totalReserved: Number(totalReserved) || 0,
      pending: Number(pending) || 0,
      donationPct: Number(donationPct) || DEFAULTS.donation_pct,
      generated_at
    };
  }

  /* ---------- Render KPIs ---------- */
  function renderKpis(stats) {
    safeText('k_total_revenue', formatCurrency(stats.totalRevenue));
    safeText('k_total_reserved', formatCurrency(stats.totalReserved));
    safeText('k_donation_pct', stats.donationPct + '%');
    safeText('k_pending', formatCurrency(stats.pending));

    const last = stats.generated_at ? formatDate(stats.generated_at) : '—';
    const lastSmall = document.getElementById('last-updated');
    const lastLarge = document.getElementById('last-updated-large');

    if (lastSmall) lastSmall.textContent = last;
    if (lastLarge) lastLarge.textContent = last;
  }

  function formatCurrency(n) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(Number(n || 0));
    } catch {
      return '$' + Math.round(Number(n || 0)).toLocaleString();
    }
  }

  function formatDate(v) {
    const d = typeof v === 'number' ? new Date(v) : new Date(String(v));
    if (isNaN(d)) return '—';
    return d.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  }

  /* ---------- Chart ---------- */
  let revenueChart = null;

  function ensureChart(stats) {
    const canvas = document.getElementById('revenuePie');
    if (!canvas) return;

    const production = Math.max(0, stats.totalRevenue - stats.totalReserved);
    const donation = Math.max(0, stats.totalReserved);
    const data = [production, donation];

    if (typeof Chart === 'undefined') {
      log('Chart.js missing — skipping chart');
      return;
    }

    const ctx = canvas.getContext('2d');

    if (revenueChart) {
      revenueChart.data.datasets[0].data = data;
      revenueChart.update();
      return;
    }

    revenueChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Production & Growth', 'Donations (40%)'],
        datasets: [
          {
            data,
            backgroundColor: [
              getCssVar('--chart-production') || '#7fb3ff',
              getCssVar('--chart-donation') || '#ff8b8b'
            ]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  function getCssVar(name) {
    try {
      return getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
    } catch {
      return null;
    }
  }

  /* ---------- Proofs ---------- */
  function renderProofs(list) {
    const container = document.getElementById('tp_proofs_list');
    if (!container) return;

    if (!Array.isArray(list) || list.length === 0) {
      container.innerHTML = `<div class="tp-muted">No proofs available at the moment.</div>`;
      return;
    }

    const html = list
      .map(p => {
        const url = p.pdf_url || p.doc_url || p.url || '#';
        const thumb = p.thumbnail_url || p.thumb_url || null;
        const title =
          p.title ||
          p.name ||
          (url.split('/').pop() || 'Proof document');

        const date = p.generated_at || p.created_at || '';
        const safeTitle = escapeHtml(title);
        const safeDate = date
          ? `<div class="tp-proof-date">${escapeHtml(String(date))}</div>`
          : '';

        const img = thumb
          ? `<img loading="lazy" src="${escapeAttr(
              thumb
            )}" alt="${safeTitle}" class="tp-proof-thumb" />`
          : `<div class="tp-proof-thumb-fallback">PDF</div>`;

        return `
          <article class="tp-proof">
            <a href="${escapeAttr(
              url
            )}" target="_blank" rel="noopener noreferrer" class="tp-proof-link">
              ${img}
              <div class="tp-proof-meta">
                <div class="tp-proof-title">${safeTitle}</div>
                ${safeDate}
              </div>
            </a>
          </article>
        `;
      })
      .join('');

    container.innerHTML = `<div class="tp-proofs-grid">${html}</div>`;
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[
        c
      ];
    });
  }

  function escapeAttr(s) {
    return String(s || '').replace(/"/g, '%22');
  }

  /* ---------- Theme Toggle ---------- */
  function initThemeToggle() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;

    const current =
      localStorage.getItem('paw_theme') ||
      document.documentElement.getAttribute('data-theme') ||
      '';

    if (current) document.documentElement.setAttribute('data-theme', current);

    btn.addEventListener('click', () => {
      const now =
        document.documentElement.getAttribute('data-theme') === 'light'
          ? ''
          : 'light';

      if (now)
        document.documentElement.setAttribute('data-theme', now);
      else document.documentElement.removeAttribute('data-theme');

      localStorage.setItem('paw_theme', now);
      btn.setAttribute('aria-pressed', now === 'light');
    });
  }

  /* ---------- Init ---------- */
  async function init() {
    initThemeToggle();

    const statsPromise = fetchWithTimeout(API.stats).catch(err => {
      log('stats failed:', err);
      return null;
    });

    const proofsPromise = fetchWithTimeout(API.proofs).catch(err => {
      log('proofs failed:', err);
      return null;
    });

    const [stats, proofs] = await Promise.all([
      statsPromise,
      proofsPromise
    ]);

    const normalized = stats
      ? pickStatAliases(stats)
      : pickStatAliases(DEFAULTS);

    renderKpis(normalized);
    ensureChart(normalized);

    if (!proofs) {
      if (window.__PROOF_FALLBACK__) {
        renderProofs(window.__PROOF_FALLBACK__);
      } else {
        renderProofs([]);
      }
    } else {
      renderProofs(
        Array.isArray(proofs)
          ? proofs
          : proofs.items || proofs.data || []
      );
    }

    const share = document.getElementById('share-twitter');
    if (share) {
      const url = location.href;
      share.setAttribute(
        'href',
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          'Pawthways transparency — 40% donated'
        )}&url=${encodeURIComponent(url)}`
      );
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
