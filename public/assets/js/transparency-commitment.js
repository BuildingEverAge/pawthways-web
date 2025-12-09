// transparency-commitment.js
if (window._pwCommitmentInit) {
  console.warn('transparency-commitment: already initialized');
} else {
  window._pwCommitmentInit = true;
}

async function fetchWithTimeout(url, opts = {}, timeout = 4500){
  const controller = new AbortController();
  const id = setTimeout(()=>controller.abort(), timeout);
  try{
    const res = await fetch(url, {...opts, signal: controller.signal});
    clearTimeout(id);
    if(!res.ok) throw new Error('network:' + res.status);
    const ct = (res.headers.get('content-type') || '').toLowerCase();
    if(ct.includes('application/json')) return { json: await res.json(), contentType: ct };
    return { text: await res.text(), contentType: ct };
  }catch(e){
    clearTimeout(id);
    console.warn('fetchWithTimeout error:', e);
    return null;
  }
}

function formatCurrency(num){
  if (num == null || Number.isNaN(Number(num))) return '—';
  return '€ ' + Number(num).toFixed(2);
}

function safeNum(v){ if(v==null) return 0; if(typeof v==='string') v = v.replace(/[^0-9.-]/g,''); return Number(v)||0 }
// --- helpers ---
function escapeAttr(s){
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function showGeneratedWarning(show){
  const el = document.getElementById('generatedWarning');
  if (!el) return;
  el.style.display = show ? 'block' : 'none';
}

async function validateThumbUrl(url){
  try {
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    if (!res.ok) return false;
    const ct = (res.headers.get('content-type') || '').toLowerCase();
    return ct.startsWith('image/');
  } catch (e) {
    // Be conservative: if HEAD fails (CORS/network), return false to avoid broken thumbnails.
    return false;
  }
}

async function renderStats(){
  const res = await fetchWithTimeout('/api/admin-stats');
  const main = document.getElementById('main-content');
  if (main) main.setAttribute('aria-busy','true');

  if (!res || !res.json) {
    document.getElementById('totalRevenue').textContent = '—';
    document.getElementById('totalReserved').textContent = '—';
    document.getElementById('totalDonated').textContent = '—';
    document.getElementById('lastUpdated').textContent = 'API failed';
    if (main) main.setAttribute('aria-busy','false');
    return;
  }

  const stats = res.json;
  const totalRevenue = safeNum(stats.total_sales ?? stats.totalRevenue ?? stats.total_revenue ?? stats.sales_total);
  const totalReserved = safeNum(stats.total_reserved ?? stats.totalReserved ?? stats.reserved ?? stats.total_donated);
  const totalDonated = safeNum(stats.total_donated ?? stats.totalDonated ?? stats.donated ?? stats.total_distributed);
  const generatedAt = stats.generated_at ?? stats.generatedAt ?? stats.updated_at ?? stats.timestamp ?? null;

  document.getElementById('totalRevenue').textContent = totalRevenue ? formatCurrency(totalRevenue) : '—';
  document.getElementById('totalReserved').textContent = totalReserved ? formatCurrency(totalReserved) : '—';
  document.getElementById('totalDonated').textContent = totalDonated ? formatCurrency(totalDonated) : '—';
  const pending = safeNum(stats.pending ?? stats.to_distribute ?? stats.remaining ?? stats.pending_amount);
  const pendingEl = document.getElementById('pending');
  if (pendingEl) pendingEl.textContent = pending ? formatCurrency(pending) : '—';

  // generated_at warning
  const generatedAtCheck = stats.generated_at ?? stats.generatedAt ?? stats.updated_at ?? stats.timestamp ?? null;
  if (!generatedAtCheck) showGeneratedWarning(true); else showGeneratedWarning(false);

  const percent = totalRevenue ? Math.round((totalDonated / totalRevenue) * 100) : 0;
  document.getElementById('donationPercent').textContent = percent + '%';

  const bar = document.getElementById('donationBar');
  const safePercent = Math.min(100, Math.max(0, percent));
  bar.style.width = safePercent + '%';
  bar.setAttribute('aria-valuenow', safePercent);

  document.getElementById('lastUpdated').textContent = generatedAt ? (new Date(generatedAt)).toLocaleString() : '—';

  if (stats.needs_legal_review) {
    document.getElementById('needsLegal').textContent = 'Needs legal review';
  } else {
    document.getElementById('needsLegal').textContent = 'Not marked';
  }

  if (main) main.setAttribute('aria-busy','false');
}

// Replace renderProofs() with this improved version
async function renderProofs(){
  const container = document.getElementById('proofs');
  container.setAttribute('aria-busy','true');
  container.innerHTML = '';

  const r = await fetchWithTimeout('/api/transparency-proofs?limit=6');
  if (!r || !r.json) {
    document.getElementById('proofFallback').style.display = 'block';
    container.setAttribute('aria-busy','false');
    return;
  }

  const arr = r.json;
  if (!Array.isArray(arr) || !arr.length) {
    container.insertAdjacentHTML('beforeend','<div class="muted-plain">No proofs published yet.</div>');
    container.setAttribute('aria-busy','false');
    return;
  }

  for (const p of arr.slice(0,6)) {
    const docUrl = p.doc_url ?? p.pdf_url ?? p.url ?? '#';
    const thumb = p.thumbnail_url ?? p.thumb_url ?? p.thumb ?? null;
    const title = (p.title ?? p.name ?? 'Donation receipt').toString();
    const dateRaw = p.date ?? p.created_at ?? p.timestamp ?? '';
    const dateText = dateRaw ? (new Date(dateRaw)).toLocaleDateString() : '';

    const card = document.createElement('article');
    card.className = 'proof card fade-in';
    card.setAttribute('role','article');
    card.setAttribute('tabindex','0');

    // image or placeholder
    if (thumb) {
      const isValid = await validateThumbUrl(thumb);
      const img = document.createElement('img');
      img.alt = title;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = isValid ? thumb : '/assets/img/proof-placeholder.png';
      img.onerror = function(){ this.src = '/assets/img/proof-placeholder.png'; };
      card.appendChild(img);
    } else {
      const ph = document.createElement('div');
      ph.className = 'proof-placeholder';
      ph.appendChild(document.createTextNode('No thumbnail'));
      card.appendChild(ph);
    }

    // meta
    const meta = document.createElement('div');
    meta.className = 'proof-meta';
    const metaId = 'proof-meta-' + (p.id ?? Math.random().toString(36).slice(2,8));
    meta.id = metaId;
    card.setAttribute('aria-describedby', metaId);
    
    if (dateText) {
      const dateDiv = document.createElement('div');
      dateDiv.appendChild(document.createTextNode(dateText));
      meta.appendChild(dateDiv);
    }
    if (p.amount) {
      const amountDiv = document.createElement('div');
      amountDiv.appendChild(document.createTextNode(`Amount: ${p.amount}`));
      meta.appendChild(amountDiv);
    }
    card.appendChild(meta);

    // link
    const link = document.createElement('a');
    link.href = docUrl || '#';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'proof-link';
    link.setAttribute('aria-label', `Open proof: ${escapeAttr(title)}`);
    link.appendChild(document.createTextNode('Open proof'));

    // verify PDF HEAD and annotate
    (async function verifyPdf(url, anchor){
      try {
        const h = await fetch(url, { method: 'HEAD', cache: 'no-store' });
        const ct = h && h.headers ? (h.headers.get('content-type') || '') : '';
        const length = h && h.headers ? (Number(h.headers.get('content-length')) || 0) : 0;
        if (!(h && h.ok && ct.includes('pdf'))) {
          anchor.title = 'Proof link — not verified as PDF';
          console.warn('Proof not verified as PDF:', url, 'content-type:', ct);
        }
        if (length && length > 10 * 1024 * 1024) {
          anchor.title = 'Large file (>10MB) — consider downloading separately';
        }
      } catch(e){
        // ignore, best-effort
      }
    })(docUrl, link);

    card.appendChild(link);
    container.appendChild(card);
  }

  container.setAttribute('aria-busy','false');
  document.getElementById('proofFallback').style.display = 'none';
}

(function themeInit(){
  const el = document.documentElement;
  const btn = document.getElementById('themeToggle');
  const saved = localStorage.getItem('pawthways-theme') || 'light';
  el.setAttribute('data-theme', saved);
  if (btn) {
    btn.setAttribute('aria-pressed', saved === 'dark');
    btn.addEventListener('click', ()=>{
      const next = el.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      el.setAttribute('data-theme', next);
      btn.setAttribute('aria-pressed', next==='dark');
      localStorage.setItem('pawthways-theme', next);
    });
  }
})();

(async function boot(){
  try {
    await Promise.all([renderStats(), renderProofs()]);
    const main = document.getElementById('main-content');
    if (main) main.setAttribute('aria-busy','false');
  } catch (e) {
    console.warn('boot error', e);
    const main = document.getElementById('main-content');
    if (main) main.setAttribute('aria-busy','false');
  }
})();

// CSV availability check — updates the UI link/status
async function checkCsvAvailability(){
  try {
    const res = await fetch('/api/transparency-csv?latest=true', { method: 'HEAD', cache: 'no-store' });
    const statusEl = document.getElementById('csvStatus');
    const linkEl = document.getElementById('csvLink');
    if (!statusEl || !linkEl) return;
    if (res && res.ok) {
      // ensure link points to the CSV (HEAD success)
      linkEl.href = '/api/transparency-csv?latest=true';
      statusEl.textContent = 'CSV available';
    } else {
      statusEl.textContent = 'CSV not available';
      // disable link visually
      linkEl.classList.add('disabled');
      linkEl.setAttribute('aria-disabled','true');
      linkEl.href = '#';
    }
  } catch (e) {
    const statusEl = document.getElementById('csvStatus');
    if (statusEl) statusEl.textContent = 'CSV check failed';
  }
}

// call it after boot finish
if (window._pwCommitmentInit) {
  // small timeout so it runs after initial UI paint
  setTimeout(checkCsvAvailability, 600);
}

// Optional: IntersectionObserver lazy fill (progressive enhancement)
(function lazyHeroImg(){
  const img = document.querySelector('.hero-img');
  if (!img) return;
  if ('loading' in HTMLImageElement.prototype) return; // browser supports native lazy
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if (e.isIntersecting){
        const src = img.getAttribute('data-src') || img.src;
        if (src) img.src = src;
        io.disconnect();
      }
    });
  });
  io.observe(img);
})();

// Quick verification checks for timeline
async function quickTimelineChecks(){
  const map = [
    { id: 'step-1', url: '/api/admin-stats', type: 'json' },
    { id: 'step-2', url: '/api/transparency-proofs?limit=1', type: 'json' },
    { id: 'step-3', url: '/assets/csv/transparency-latest.csv', type: 'head' },
  ];
  const now = new Date();
  const lastCheckedEl = document.getElementById('timelineLastChecked');
  if (lastCheckedEl) lastCheckedEl.textContent = now.toLocaleString();

  for (const m of map){
    const stateEl = document.querySelector(`#${m.id} .step-state`);
    if (!stateEl) continue;
    // set pending
    stateEl.setAttribute('data-state','unknown');
    try {
      if (m.type === 'json'){
        const r = await fetchWithTimeout(m.url, {}, 3500);
        if (r && r.json) {
          // simple validation: json object or array length
          const ok = (typeof r.json === 'object') && (Array.isArray(r.json) ? r.json.length >= 0 : true);
          stateEl.setAttribute('data-state', ok ? 'ok' : 'fail');
        } else {
          stateEl.setAttribute('data-state','fail');
        }
      } else if (m.type === 'head'){
        // HEAD fetch for CSV
        try {
          const h = await fetch(m.url, { method: 'HEAD', cache:'no-store' , signal: (new AbortController()).signal});
          stateEl.setAttribute('data-state', h && h.ok ? 'ok' : 'fail');
        } catch(e){
          stateEl.setAttribute('data-state','fail');
        }
      }
    } catch(e){
      stateEl.setAttribute('data-state','fail');
    }
  }
}

// bind to button
const runBtn = document.getElementById('runChecks');
if (runBtn) {
  runBtn.addEventListener('click', async function(){
    runBtn.setAttribute('disabled','true');
    runBtn.textContent = 'Checking…';
    await quickTimelineChecks();
    runBtn.removeAttribute('disabled');
    runBtn.textContent = 'Run quick checks';
  });
}
