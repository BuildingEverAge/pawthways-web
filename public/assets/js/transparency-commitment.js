/**
 * Transparency Commitment Module
 * Handles data fetching and rendering for /transparency-commitment.html
 * Requires: page wrapper to have class="tp-transparency"
 */

(function(window, document){
  'use strict';
  
  // Guard: Only run on transparency pages
  const root = document.querySelector('.tp-transparency');
  if (!root) return;
  
  // Single init guard
  if (window._pwCommitmentInit) return;
  window._pwCommitmentInit = true;

  // --- Helper functions ---
  function fetchWithTimeout(url, opts = {}, timeout = 4500) {
    return new Promise((resolve) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      fetch(url, Object.assign({}, opts, { signal: controller.signal }))
        .then(res => {
          clearTimeout(id);
          resolve(res);
        })
        .catch(err => { 
          clearTimeout(id); 
          resolve(null); 
        });
    });
  }

  function safeNum(v){ 
    const n = Number(String(v).replace(/[^\d.-]/g,'')); 
    return isFinite(n) ? n : 0; 
  }

  function formatCurrency(n){ 
    try { 
      return new Intl.NumberFormat('en-GB', { 
        style:'currency', 
        currency:'EUR', 
        maximumFractionDigits:0 
      }).format(n); 
    } catch(e){ 
      return '€' + Math.round(n); 
    } 
  }

  function escapeAttr(s){ 
    return String(s||'')
      .replace(/&/g,'&amp;')
      .replace(/"/g,'&quot;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;'); 
  }

  function showGeneratedWarning(show){ 
    const el = root.querySelector('#generatedWarning'); 
    if (!el) return; 
    el.style.display = show ? 'block' : 'none'; 
  }

  async function validateThumbUrl(url, timeoutMs = 3000){
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(url, { 
        method: 'HEAD', 
        cache: 'no-store', 
        signal: controller.signal 
      });
      clearTimeout(id);
      if (!res.ok) return false;
      const ct = (res.headers.get('content-type') || '').toLowerCase();
      return ct.startsWith('image/');
    } catch(e){ 
      return false; 
    }
  }

  // --- renderStats ---
  async function renderStats(){
    const res = await fetchWithTimeout('/api/admin-stats');
    const main = root.querySelector('#main-content') || root;
    if (main) main.setAttribute('aria-busy','true');

    let json = null;
    try { 
      if (res && res.ok) json = await res.json(); 
    } catch(e){ 
      json = null; 
    }

    const totalRevenueEl = root.querySelector('#totalRevenue');
    const totalReservedEl = root.querySelector('#totalReserved');
    const totalDonatedEl = root.querySelector('#totalDonated');
    const lastUpdatedEl = root.querySelector('#lastUpdated');
    const pendingEl = root.querySelector('#pending');
    const percentEl = root.querySelector('#donationPercent');
    const bar = root.querySelector('#donationBar');

    if (!json) {
      if (totalRevenueEl) totalRevenueEl.textContent = '—';
      if (totalReservedEl) totalReservedEl.textContent = '—';
      if (totalDonatedEl) totalDonatedEl.textContent = '—';
      if (lastUpdatedEl) lastUpdatedEl.textContent = 'API failed';
      if (main) main.setAttribute('aria-busy','false');
      showGeneratedWarning(true);
      return;
    }

    const stats = json;
    const totalRevenue = safeNum(stats.total_sales ?? stats.totalRevenue ?? stats.total_revenue ?? stats.sales_total);
    const totalReserved = safeNum(stats.total_reserved ?? stats.totalReserved ?? stats.reserved ?? stats.total_donated);
    const totalDonated = safeNum(stats.total_donated ?? stats.totalDonated ?? stats.donated ?? stats.total_distributed);
    const generatedAt = stats.generated_at ?? stats.generatedAt ?? stats.updated_at ?? stats.timestamp ?? null;

    if (totalRevenueEl) totalRevenueEl.textContent = totalRevenue ? formatCurrency(totalRevenue) : '—';
    if (totalReservedEl) totalReservedEl.textContent = totalReserved ? formatCurrency(totalReserved) : '—';
    if (totalDonatedEl) totalDonatedEl.textContent = totalDonated ? formatCurrency(totalDonated) : '—';
    if (pendingEl) pendingEl.textContent = safeNum(stats.pending ?? stats.to_distribute ?? stats.remaining ?? stats.pending_amount) ? formatCurrency(safeNum(stats.pending ?? stats.to_distribute ?? stats.remaining ?? stats.pending_amount)) : '—';

    const percent = totalRevenue ? Math.round((totalDonated / totalRevenue) * 100) : 0;
    if (percentEl) percentEl.textContent = percent + '%';
    if (bar) { 
      const safePercent = Math.min(100, Math.max(0, percent)); 
      bar.style.width = safePercent + '%'; 
      bar.setAttribute('aria-valuenow', safePercent); 
    }

    if (lastUpdatedEl) lastUpdatedEl.textContent = generatedAt ? (new Date(generatedAt)).toLocaleString() : '—';
    showGeneratedWarning(!generatedAt);

    if (main) main.setAttribute('aria-busy','false');
  }

  // --- renderProofs ---
  async function renderProofs(){
    const res = await fetchWithTimeout('/api/transparency-proofs');
    const container = root.querySelector('#proofs');
    if (!container) return;
    container.innerHTML = '';
    
    if (!res || !res.ok) {
      container.textContent = 'No proofs available.';
      container.setAttribute('aria-busy','false');
      return;
    }
    
    let list = [];
    try { 
      list = await res.json(); 
    } catch(e){ 
      list = []; 
    }
    
    if (!Array.isArray(list) || list.length === 0) { 
      container.textContent = 'No proofs published yet.'; 
      container.setAttribute('aria-busy','false'); 
      return; 
    }

    for (const p of list.slice(0,6)) {
      const card = document.createElement('article');
      card.className = 'proof fade-in';
      const thumb = p.thumbnail_url ?? p.thumb_url ?? p.thumbnail ?? '/assets/img/proof-placeholder.png';
      const title = p.title ?? 'Proof';
      const date = p.date ?? p.published_at ?? '';
      const doc = p.doc_url ?? p.pdf_url ?? p.url ?? '#';

      const img = document.createElement('img');
      img.alt = title;
      img.loading = 'lazy';
      img.decoding = 'async';
      
      // Validate thumb conservatively
      const ok = await validateThumbUrl(thumb);
      img.src = ok ? thumb : '/assets/img/proof-placeholder.png';
      img.onerror = function(){ 
        this.src = '/assets/img/proof-placeholder.png'; 
        this.onerror = null; 
      };

      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.innerHTML = `<strong>${escapeAttr(title)}</strong><small>${escapeAttr(date)} · ${escapeAttr(p.amount ?? '')}</small>`;

      const a = document.createElement('a');
      a.href = doc || '#';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.appendChild(img);

      card.appendChild(a);
      card.appendChild(meta);
      container.appendChild(card);
    }
    container.setAttribute('aria-busy','false');
  }

  // --- check CSV availability ---
  async function checkCsvAvailability(){
    const statusEl = root.querySelector('#csvStatus');
    const linkEl = root.querySelector('#csvLink');
    if (!statusEl || !linkEl) return;

    let csvUrl = '/api/transparency-csv?latest=true';
    let isAvailable = false;
    
    try {
      const r = await fetchWithTimeout(csvUrl, { method:'HEAD' });
      if (r && r.ok) {
        isAvailable = true;
      } else {
        csvUrl = '/assets/csv/transparency-latest.csv';
        const s = await fetchWithTimeout(csvUrl, { method:'HEAD' });
        if (s && s.ok) isAvailable = true;
      }
    } catch(e){
      csvUrl = '/assets/csv/transparency-latest.csv';
      try { 
        const s = await fetchWithTimeout(csvUrl, { method:'HEAD' }); 
        if (s && s.ok) isAvailable = true; 
      } catch(e){}
    }

    if (isAvailable) {
      linkEl.href = csvUrl;
      statusEl.textContent = 'CSV available';
      statusEl.style.color = 'var(--success)';
      linkEl.classList.remove('disabled'); 
      linkEl.removeAttribute('aria-disabled');
    } else {
      statusEl.textContent = 'CSV not available';
      statusEl.style.color = 'var(--danger)';
      linkEl.classList.add('disabled'); 
      linkEl.setAttribute('aria-disabled','true'); 
      linkEl.href = '#';
    }
  }

  // --- Expose API ---
  window.pwTransparency = {
    renderStats,
    renderProofs,
    checkCsvAvailability,
    initAll: async function(){
      try {
        await renderStats();
        await renderProofs();
        await checkCsvAvailability();
      } catch(e){
        console.warn('pwTransparency.initAll failed', e);
      }
    }
  };

  // --- Auto-boot ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.pwTransparency.initAll);
  } else {
    window.pwTransparency.initAll();
  }

})(window, document);
