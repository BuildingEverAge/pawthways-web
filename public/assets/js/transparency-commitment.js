<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Pawthways — Transparency Commitment</title>
  <meta name="description" content="Pawthways transparency commitment: 40% of revenue donated. Live aggregates, proof documents and step-by-step verification instructions." />
  <link rel="canonical" href="https://pawthways-web.vercel.app/transparency-commitment.html" />

  <!-- Inline theme variables (kept for parity with site) -->
  <style>
    :root{
      --bg:#0f1724;
      --card:#0b1220;
      --muted:#9aa4b2;
      --accent:#ffb86b;
      --white:#eef2f7;
      --flow-text: var(--white);
      --svg-node-bg:#aee1ef;
      --svg-node-text:#0b1220;
      --svg-node-charity:#ffb3b3;
      --svg-node-production:#9ecbff;
      --svg-arrow:#7b8794;
      --chart-donation:#ff8b8b;
      --chart-production:#7fb3ff;
      --tooltip-bg:#07111a;
      --tooltip-border:rgba(255,255,255,0.03);
      font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    }
    [data-theme="light"] {
      --bg:#f8fafc;
      --card:#ffffff;
      --muted:#64748b;
      --accent:#f97316;
      --white:#0f172a;
      --flow-text:#0b1220;
      --svg-node-bg:#0ea5e9;
      --svg-node-text:#ffffff;
      --svg-node-charity:#ef4444;
      --svg-node-production:#3b82f6;
      --svg-arrow:#475569;
      --chart-donation:#ef4444;
      --chart-production:#3b82f6;
      --tooltip-bg:#ffffff;
      --tooltip-border:rgba(0,0,0,0.1);
    }
    html,body{height:100%;transition:background-color 0.3s ease, color 0.3s ease}
    body{margin:0;background:var(--bg);color:var(--white);line-height:1.45;-webkit-font-smoothing:antialiased}
    .wrap{max-width:1100px;margin:32px auto;padding:24px}
  </style>

  <!-- Page-specific CSS (assets folder) -->
  <link rel="stylesheet" href="/assets/css/transparency-commitment.css" />
  
  <!-- JSON-LD: WebPage + Organization -->
  <script type="application/ld+json">
  {
    "@context":"https://schema.org",
    "@type":"WebPage",
    "name":"Transparency Commitment — Pawthways",
    "url":"https://pawthways-web.vercel.app/transparency-commitment.html",
    "description":"How Pawthways allocates 40% of revenue to verified animal rescues, with public aggregates and proof documents.",
    "inLanguage":"en-US",
    "mainEntity":{
      "@type":"Organization",
      "name":"Pawthways",
      "url":"https://pawthways-web.vercel.app",
      "description":"Digital products that fund animal rescues — 40% of revenue donated to verified causes.",
      "logo":"https://pawthways-web.vercel.app/assets/images/logo.png"
    }
  }
  </script>
</head>
<body>
  <main class="wrap" role="main">

    <!-- ===== Header (kept identical to how-revenue-works for parity) ===== -->
    <header>
      <div class="header-main">
        <h1>Transparency Commitment — Pawthways</h1>
        <p class="lead">We reserve <strong>40% of revenue</strong> to fund verified animal rescues. Below: live aggregates, proofs and step-by-step verification instructions.</p>
        <div style="margin-top:10px" class="top-row">
          <div class="badge">40% → Donated</div>
          <div style="margin-left:12px" class="muted-plain"><a href="/transparency.html" style="color:var(--accent);text-decoration:none">View dashboard</a></div>
        </div>
      </div>

      <div class="header-actions">
        <button id="themeToggle" class="theme-toggle" aria-label="Toggle light/dark theme" aria-pressed="false" type="button">
          <svg class="theme-icon" aria-hidden="true" viewBox="0 0 24 24">
            <path id="sunIcon" d="M12 18a6 6 0 100-12 6 6 0 000 12zM12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"/>
            <path id="moonIcon" style="display:none" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
          </svg>
          <span class="theme-label">Theme</span>
        </button>

        <div class="last-updated-box">
          <div class="last-updated-label">Last updated</div>
          <div class="last-updated-value" id="last-updated-large">—</div>
        </div>

        <div class="share-buttons">
          <a id="share-twitter" title="Share on Twitter" style="color:var(--muted);text-decoration:none;font-size:14px">Share</a>
        </div>
      </div>
    </header>

    <!-- ===== HERO ===== -->
    <section id="hero" class="card full" aria-labelledby="hero-title">
      <h2 id="hero-title">Our Transparency Commitment</h2>
      <p class="small">40% of Pawthways revenue is reserved to fund verified animal rescues. We publish aggregated metrics and proof documents so anyone can verify the flow.</p>
      <p class="tp-meta">If you need a full report, email: <a href="mailto:contact.pawthways@gmail.com">contact.pawthways@gmail.com</a></p>
      <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;">
        <a class="tp-cta cta" href="/transparency.html" aria-label="Open transparency dashboard">Open Dashboard</a>
        <a class="tp-secondary" href="mailto:contact.pawthways@gmail.com?subject=Transparency%20report%20request" aria-label="Request a report">Request a report</a>
      </div>
      <figure class="tp-hero-image" role="img" aria-label="Pawthways transparency illustration" style="margin-top:12px;">
        <img src="/assets/images/paw-transparency.jpg" alt="Pawthways transparency illustration" loading="lazy" style="width:320px;max-width:100%;border-radius:10px" />
      </figure>
    </section>

    <!-- ===== WHAT WE PUBLISH ===== -->
    <section id="what-we-publish" class="card full" aria-labelledby="publish-title">
      <h3 id="publish-title">What we publish</h3>
      <ul>
        <li>Monthly aggregated totals (no PII)</li>
        <li>Proof documents: receipts, invoices, audit summaries (PDF)</li>
        <li>Monthly CSV extract of donations (when available)</li>
        <li>Audit reports and reconciliation notes</li>
      </ul>
    </section>

    <!-- ===== HOW TO VERIFY (curl examples) ===== -->
    <section id="how-to-verify" class="card full" aria-labelledby="verify-title">
      <h3 id="verify-title">How to verify (quick)</h3>
      <ol>
        <li>Check live aggregates: <code>/api/admin-stats</code></li>
        <li>Open proof documents and compare totals: <code>/api/transparency-proofs?limit=6</code></li>
        <li>Match totals with monthly CSV if published</li>
        <li>Validate generated timestamps vs receipt timestamps</li>
      </ol>

      <h4>Example cURL (for PR checks)</h4>
      <pre class="tp-code">curl -s https://pawthways-web.vercel.app/api/admin-stats | jq .</pre>
      <pre class="tp-code">curl -s "https://pawthways-web.vercel.app/api/transparency-proofs?limit=3" | jq .</pre>
      <p class="tp-note">Replace domain with your staging domain when testing.</p>
    </section>

    <!-- ===== 4-STEP VISUAL + FLOW (SVG pair) ===== -->
    <section class="card full" aria-labelledby="flow-title">
      <h3 id="flow-title">4-Step verification & flow</h3>
      <div class="flow-wrapper" style="margin-top:12px;">
        <!-- Desktop SVG (kept from how-revenue-works) -->
        <div id="flow-desktop" role="img" aria-label="Interactive revenue flow (desktop)">
          <svg id="flow-svg-desktop" viewBox="0 0 1000 360" preserveAspectRatio="xMidYMid meet" aria-hidden="false">
            <g id="desktop-group">
              <!-- nodes copied from original for parity -->
              <g class="node" data-title="Production & Growth (60%)" data-desc="60% for team, marketing, content production">
                <circle cx="160" cy="80" r="60" fill="var(--svg-node-production)"></circle>
                <text x="160" y="88" text-anchor="middle">Production & Growth (60%)</text>
              </g>
              <g class="node" data-title="Digital product sales" data-desc="Sales of products on Whop">
                <circle cx="150" cy="230" r="50" fill="var(--svg-node-bg)"></circle>
                <text x="150" y="238" text-anchor="middle">Digital Product Sales</text>
              </g>
              <g class="node" data-title="Whop (platform)" data-desc="Payment processing">
                <circle cx="380" cy="160" r="55" fill="var(--svg-node-bg)"></circle>
                <text x="380" y="168" text-anchor="middle">Whop</text>
              </g>
              <g class="node" data-title="Generated revenue" data-desc="Revenue registered in the DB">
                <circle cx="620" cy="160" r="78" fill="var(--svg-node-bg)"></circle>
                <text x="620" y="168" text-anchor="middle">Generated Revenue</text>
              </g>
              <g class="node" data-title="Donations (40%)" data-desc="40% redirected to verified NGOs">
                <circle cx="900" cy="230" r="62" fill="var(--svg-node-charity)"></circle>
                <text x="900" y="238" text-anchor="middle">Charitable Causes (40%)</text>
              </g>
              <defs>
                <marker id="arrow-desktop" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto">
                  <path d="M0,0 L10,5 L0,10 z" fill="var(--svg-arrow)"></path>
                </marker>
              </defs>
              <path d="M195 220 C260 200 320 180 345 172"
                stroke="var(--svg-arrow)" stroke-width="5" stroke-linecap="round" fill="none" marker-end="url(#arrow-desktop)"></path>
              <path d="M435 160 C500 160 560 160 570 160"
                stroke="var(--svg-arrow)" stroke-width="5" stroke-linecap="round" fill="none" marker-end="url(#arrow-desktop)"></path>
              <path d="M680 185 C740 198 800 210 840 222"
                stroke="var(--svg-arrow)" stroke-width="5" stroke-linecap="round" fill="none" marker-end="url(#arrow-desktop)"></path>
              <path d="M580 135 C520 118 400 100 260 96"
                stroke="var(--svg-arrow)" stroke-width="5" stroke-linecap="round" fill="none" marker-end="url(#arrow-desktop)"></path>
            </g>
          </svg>
        </div>

        <!-- Mobile fallback SVG (kept) -->
        <div id="flow-mobile" aria-hidden="true" role="img">
          <svg id="flow-svg-mobile" viewBox="0 0 360 640" style="width:100%;height:100%">
            <g class="node"><circle cx="180" cy="120" r="46" fill="var(--svg-node-bg)"></circle><text x="180" y="128">Digital Product Sales</text></g>
            <path d="M180 160 L180 220" stroke="var(--svg-arrow)" stroke-width="3" fill="none" marker-end="url(#arrow-mobile)"></path>
            <g class="node"><circle cx="180" cy="260" r="46" fill="var(--svg-node-bg)"></circle><text x="180" y="268">Whop</text></g>
            <path d="M180 300 L180 360" stroke="var(--svg-arrow)" stroke-width="3" fill="none" marker-end="url(#arrow-mobile)"></path>
            <g class="node"><circle cx="180" cy="400" r="56" fill="var(--svg-node-bg)"></circle><text x="180" y="408">Generated Revenue</text></g>
            <path d="M180 440 L180 500" stroke="var(--svg-arrow)" stroke-width="3" fill="none" marker-end="url(#arrow-mobile)"></path>
            <g class="node"><circle cx="180" cy="560" r="56" fill="var(--svg-node-charity)"></circle><text x="180" y="568">Charitable Causes (40%)</text></g>
            <defs>
              <marker id="arrow-mobile" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--svg-arrow)"></path></marker>
            </defs>
          </svg>
        </div>
      </div>
    </section>

    <!-- ===== CHART + KPIs (aside) ===== -->
    <section class="grid">
      <article class="card full" aria-labelledby="kpi-summary">
        <h3 id="kpi-summary">Quick numbers (live)</h3>
        <div class="kpiRow" id="kpiRow">
          <div class="kpiBox"><div class="label">Total revenue</div><div class="value" id="k_total_revenue">—</div></div>
          <div class="kpiBox"><div class="label">Total reserved / donated</div><div class="value" id="k_total_reserved">—</div></div>
          <div class="kpiBox"><div class="label">Donation %</div><div class="value" id="k_donation_pct">—</div></div>
          <div class="kpiBox"><div class="label">Pending allocations</div><div class="value" id="k_pending">—</div></div>
        </div>
        <p class="small">Values sourced from <code>/api/admin-stats</code>. If the endpoint fails, friendly fallback values will display.</p>
      </article>

      <aside class="card" aria-labelledby="chart-title">
        <h4 id="chart-title">Interactive distribution</h4>
        <p class="muted" style="margin-top:6px">Real-time when the endpoint is available. Click legends to toggle slices.</p>
        <div style="margin-top:10px"><canvas id="revenuePie" width="320" height="320" aria-label="Revenue distribution pie chart" role="img"></canvas></div>
        <div style="margin-top:12px" id="chart-note" class="muted">Last updated: <span id="last-updated">--</span></div>
        <div style="margin-top:14px">
          <a href="/shop.html" class="cta" id="buy-now">Buy a pack — 40% goes to animal rescues</a>
          <a style="margin-left:10px;color:var(--muted)" href="/transparency.html">Full dashboard</a>
        </div>
      </aside>
    </section>

    <!-- ===== WHY WE DONATE ===== -->
    <section id="why" class="card full" aria-labelledby="why-title">
      <h3 id="why-title">Why we donate</h3>
      <ul>
        <li>To fund verified animal rescues and give tangible impact.</li>
        <li>To keep financial flows open and auditable.</li>
        <li>To model sustainable giving embedded in product revenue.</li>
      </ul>
      <p class="tp-small">We allocate 40% of revenue to verified partners. Our selection criteria prioritize accountability and impact.</p>
    </section>

    <!-- ===== PROOFS (API-driven) ===== -->
    <section id="proofs-section" class="card full" aria-labelledby="proofs-title">
      <h3 id="proofs-title">Recent proofs</h3>
      <div id="tp_proofs_list" class="tp-proofs proofs" role="list" aria-live="polite">
        <div class="tp-muted">Loading proofs…</div>
      </div>
      <p class="tp-small">All proof PDFs open in a new tab. <!-- needs-legal-review: Verify PDFs do not contain PII --> </p>
    </section>

    <!-- ===== FAQ ===== -->
    <section id="faq" class="card full" aria-labelledby="faq-title">
      <h3 id="faq-title">FAQ</h3>
      <dl>
        <dt>How can I request a detailed report?</dt>
        <dd>Email <a href="mailto:contact.pawthways@gmail.com">contact.pawthways@gmail.com</a> — subject: "Transparency report request".</dd>
        <dt>What if an NGO rejects the donation?</dt>
        <dd>We keep proof documents and reassign funds to verified alternatives; contact us to review specific cases.</dd>
        <dt>Can I verify timestamps?</dt>
        <dd>Yes — compare the PDF's generated_at / receipt timestamps with the public aggregates and CSV exports.</dd>
      </dl>
    </section>

    <!-- ===== CTA & FOOTER ===== -->
    <section id="final-cta" class="card full">
      <h3 id="cta-title">Get involved</h3>
      <p class="tp-small">Buy a pack or request a report. Every purchase funds real rescues.</p>
      <a class="tp-cta cta" href="/shop.html" aria-label="See products">See products — help animals</a>
    </section>

    <footer role="contentinfo" style="margin-top:18px">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
        <div>© Pawthways — Transparency & responsibility.</div>
        <nav aria-label="Legal links"><a href="/terms.html">Terms</a> · <a href="/privacy.html">Privacy</a></nav>
      </div>
    </footer>

  </main>

  <div id="svgTooltip" class="svg-tooltip" role="tooltip" aria-hidden="true"></div>

  <!-- ===== SCRIPTS (defensive loading & orchestration) ===== -->
  <!-- Chart loader (tries local, falls back to CDN) -->
  <script src="/assets/js/chart-loader.js" defer></script>

  <!-- Proof fallback (already uploaded and reviewed) -->
  <script src="/assets/js/proof-fallback.js" defer></script>

  <!-- Revenue chart init (production grade, reviewed) -->
  <script src="/assets/js/revenue-init-prod.js" defer></script>

  <!-- Page orchestrator (safe, idempotent) -->
  <script src="/assets/js/transparency-commitment.js" defer></script>

  <!-- Inline: theme toggle + svg tooltip behavior (keeps parity with original implementation) -->
  <script>
    (function(){
      // svg tooltip handlers (re-usable and safe)
      const tooltip = document.getElementById('svgTooltip');
      const nodes = document.querySelectorAll('#flow-svg-desktop .node, #flow-svg-mobile .node');
      function showTooltip(e, title, desc) {
        const clientX = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || 0;
        const clientY = e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY) || 0;
        tooltip.style.left = (clientX + 12) + 'px';
        tooltip.style.top = (clientY + 12) + 'px';
        tooltip.innerHTML = '<strong style="color:var(--flow-text)">' + title + '</strong><div style="margin-top:6px;font-size:13px;color:var(--flow-text)">' + desc + '</div>';
        tooltip.style.display = 'block';
        tooltip.setAttribute('aria-hidden','false');
      }
      function hideTooltip(){ tooltip.style.display = 'none'; tooltip.setAttribute('aria-hidden','true'); }
      nodes.forEach(g => {
        const title = g.getAttribute('data-title') || '';
        const desc = g.getAttribute('data-desc') || '';
        g.style.cursor = 'pointer';
        g.addEventListener('mousemove', (e)=> showTooltip(e, title, desc));
        g.addEventListener('mouseleave', hideTooltip);
        g.addEventListener('touchstart', (e)=> { e.preventDefault(); showTooltip(e.touches[0], title, desc); }, {passive:false});
        g.addEventListener('touchend', hideTooltip);
      });
    })();
  </script>

</body>
</html>
