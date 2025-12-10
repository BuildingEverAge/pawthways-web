/*
	Story by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var	$window = $(window),
		$body = $('body'),
		$wrapper = $('#wrapper');

	// Breakpoints.
		breakpoints({
			xlarge:   [ '1281px',  '1680px' ],
			large:    [ '981px',   '1280px' ],
			medium:   [ '737px',   '980px'  ],
			small:    [ '481px',   '736px'  ],
			xsmall:   [ '361px',   '480px'  ],
			xxsmall:  [ null,      '360px'  ]
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Browser fixes.

		// IE: Flexbox min-height bug.
			if (browser.name == 'ie')
				(function() {

					var flexboxFixTimeoutId;

					$window.on('resize.flexbox-fix', function() {

						var $x = $('.fullscreen');

						clearTimeout(flexboxFixTimeoutId);

						flexboxFixTimeoutId = setTimeout(function() {

							if ($x.prop('scrollHeight') > $window.height())
								$x.css('height', 'auto');
							else
								$x.css('height', '100vh');

						}, 250);

					}).triggerHandler('resize.flexbox-fix');

				})();

		// Object fit workaround.
			if (!browser.canUse('object-fit'))
				(function() {

					$('.banner .image, .spotlight .image').each(function() {

						var $this = $(this),
							$img = $this.children('img'),
							positionClass = $this.parent().attr('class').match(/image-position-([a-z]+)/);

						// Set image.
							$this
								.css('background-image', 'url("' + $img.attr('src') + '")')
								.css('background-repeat', 'no-repeat')
								.css('background-size', 'cover');

						// Set position.
							switch (positionClass.length > 1 ? positionClass[1] : '') {

								case 'left':
									$this.css('background-position', 'left');
									break;

								case 'right':
									$this.css('background-position', 'right');
									break;

								default:
								case 'center':
									$this.css('background-position', 'center');
									break;

							}

						// Hide original.
							$img.css('opacity', '0');

					});

				})();

	// Smooth scroll.
		$('.smooth-scroll').scrolly();
		$('.smooth-scroll-middle').scrolly({ anchor: 'middle' });

	// Wrapper.
		$wrapper.children()
			.scrollex({
				top:		'30vh',
				bottom:		'30vh',
				initialize:	function() {
					$(this).addClass('is-inactive');
				},
				terminate:	function() {
					$(this).removeClass('is-inactive');
				},
				enter:		function() {
					$(this).removeClass('is-inactive');
				},
				leave:		function() {

					var $this = $(this);

					if ($this.hasClass('onscroll-bidirectional'))
						$this.addClass('is-inactive');

				}
			});

	// Items.
		$('.items')
			.scrollex({
				top:		'30vh',
				bottom:		'30vh',
				delay:		50,
				initialize:	function() {
					$(this).addClass('is-inactive');
				},
				terminate:	function() {
					$(this).removeClass('is-inactive');
				},
				enter:		function() {
					$(this).removeClass('is-inactive');
				},
				leave:		function() {

					var $this = $(this);

					if ($this.hasClass('onscroll-bidirectional'))
						$this.addClass('is-inactive');

				}
			})
			.children()
				.wrapInner('<div class="inner"></div>');

	// Gallery.
		$('.gallery')
			.wrapInner('<div class="inner"></div>')
			.prepend(browser.mobile ? '' : '<div class="forward"></div><div class="backward"></div>')
			.scrollex({
				top:		'30vh',
				bottom:		'30vh',
				delay:		50,
				initialize:	function() {
					$(this).addClass('is-inactive');
				},
				terminate:	function() {
					$(this).removeClass('is-inactive');
				},
				enter:		function() {
					$(this).removeClass('is-inactive');
				},
				leave:		function() {

					var $this = $(this);

					if ($this.hasClass('onscroll-bidirectional'))
						$this.addClass('is-inactive');

				}
			})
			.children('.inner')
				//.css('overflow', 'hidden')
				.css('overflow-y', browser.mobile ? 'visible' : 'hidden')
				.css('overflow-x', browser.mobile ? 'scroll' : 'hidden')
				.scrollLeft(0);

		// Style #1.
			// ...

		// Style #2.
			$('.gallery')
				.on('wheel', '.inner', function(event) {

					var	$this = $(this),
						delta = (event.originalEvent.deltaX * 10);

					// Cap delta.
						if (delta > 0)
							delta = Math.min(25, delta);
						else if (delta < 0)
							delta = Math.max(-25, delta);

					// Scroll.
						$this.scrollLeft( $this.scrollLeft() + delta );

				})
				.on('mouseenter', '.forward, .backward', function(event) {

					var $this = $(this),
						$inner = $this.siblings('.inner'),
						direction = ($this.hasClass('forward') ? 1 : -1);

					// Clear move interval.
						clearInterval(this._gallery_moveIntervalId);

					// Start interval.
						this._gallery_moveIntervalId = setInterval(function() {
							$inner.scrollLeft( $inner.scrollLeft() + (5 * direction) );
						}, 10);

				})
				.on('mouseleave', '.forward, .backward', function(event) {

					// Clear move interval.
						clearInterval(this._gallery_moveIntervalId);

				});

		// Lightbox.
			$('.gallery.lightbox')
				.on('click', 'a', function(event) {

					var $a = $(this),
						$gallery = $a.parents('.gallery'),
						$modal = $gallery.children('.modal'),
						$modalImg = $modal.find('img'),
						href = $a.attr('href');

					// Not an image? Bail.
						if (!href.match(/\.(jpg|gif|png|mp4)$/))
							return;

					// Prevent default.
						event.preventDefault();
						event.stopPropagation();

					// Locked? Bail.
						if ($modal[0]._locked)
							return;

					// Lock.
						$modal[0]._locked = true;

					// Set src.
						$modalImg.attr('src', href);

					// Set visible.
						$modal.addClass('visible');

					// Focus.
						$modal.focus();

					// Delay.
						setTimeout(function() {

							// Unlock.
								$modal[0]._locked = false;

						}, 600);

				})
				.on('click', '.modal', function(event) {

					var $modal = $(this),
						$modalImg = $modal.find('img');

					// Locked? Bail.
						if ($modal[0]._locked)
							return;

					// Already hidden? Bail.
						if (!$modal.hasClass('visible'))
							return;

					// Lock.
						$modal[0]._locked = true;

					// Clear visible, loaded.
						$modal
							.removeClass('loaded')

					// Delay.
						setTimeout(function() {

							$modal
								.removeClass('visible')

							setTimeout(function() {

								// Clear src.
									$modalImg.attr('src', '');

								// Unlock.
									$modal[0]._locked = false;

								// Focus.
									$body.focus();

							}, 475);

						}, 125);

				})
				.on('keypress', '.modal', function(event) {

					var $modal = $(this);

					// Escape? Hide modal.
						if (event.keyCode == 27)
							$modal.trigger('click');

				})
				.prepend('<div class="modal" tabIndex="-1"><div class="inner"><img src="" /></div></div>')
					.find('img')
						.on('load', function(event) {

							var $modalImg = $(this),
								$modal = $modalImg.parents('.modal');

							setTimeout(function() {

								// No longer visible? Bail.
									if (!$modal.hasClass('visible'))
										return;

								// Set loaded.
									$modal.addClass('loaded');

							}, 275);

						});

})(jQuery);

/* === Transparency page logic — scoped & safe === */
(function(){
  // single init guard
  if (window._pwCommitmentInit) return;
  window._pwCommitmentInit = true;

  const root = document.querySelector('.tp-transparency');
  if (!root) return; // nothing to do on other pages

  // --- small helpers ---
  function fetchWithTimeout(url, opts = {}, timeout = 4500) {
    return new Promise((resolve) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      fetch(url, Object.assign({}, opts, { signal: controller.signal })).then(res => {
        clearTimeout(id);
        resolve(res);
      }).catch(err => { clearTimeout(id); resolve(null); });
    });
  }
  function safeNum(v){ const n = Number(String(v).replace(/[^\d.-]/g,'')); return isFinite(n)? n: 0; }
  function formatCurrency(n){ try { return new Intl.NumberFormat('en-GB',{ style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(n); } catch(e){ return '€' + Math.round(n); } }
  function escapeAttr(s){ return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function showGeneratedWarning(show){ const el = root.querySelector('#generatedWarning'); if (!el) return; el.style.display = show ? 'block' : 'none'; }

  async function validateThumbUrl(url, timeoutMs = 3000){
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(url, { method: 'HEAD', cache: 'no-store', signal: controller.signal });
      clearTimeout(id);
      if (!res.ok) return false;
      const ct = (res.headers.get('content-type') || '').toLowerCase();
      return ct.startsWith('image/');
    } catch(e){ return false; }
  }

  // --- renderStats ---
  async function renderStats(){
    const res = await fetchWithTimeout('/api/admin-stats');
    const main = root.querySelector('#main-content') || root;
    if (main) main.setAttribute('aria-busy','true');

    let json = null;
    try { if (res && res.ok) json = await res.json(); } catch(e){ json = null; }

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
    if (bar) { const safePercent = Math.min(100, Math.max(0, percent)); bar.style.width = safePercent + '%'; bar.setAttribute('aria-valuenow', safePercent); }

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
    try { list = await res.json(); } catch(e){ list = []; }
    if (!Array.isArray(list) || list.length === 0) { container.textContent = 'No proofs published yet.'; container.setAttribute('aria-busy','false'); return; }

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
      // validate thumb conservatively
      const ok = await validateThumbUrl(thumb);
      img.src = ok ? thumb : '/assets/img/proof-placeholder.png';
      img.onerror = function(){ this.src = '/assets/img/proof-placeholder.png'; this.onerror = null; };

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
      if (r && r.ok) isAvailable = true;
      else {
        csvUrl = '/assets/csv/transparency-latest.csv';
        const s = await fetchWithTimeout(csvUrl, { method:'HEAD' });
        if (s && s.ok) isAvailable = true;
      }
    } catch(e){
      csvUrl = '/assets/csv/transparency-latest.csv';
      try { const s = await fetchWithTimeout(csvUrl, { method:'HEAD' }); if (s && s.ok) isAvailable = true; } catch(e){}
    }

    if (isAvailable) {
      linkEl.href = csvUrl;
      statusEl.textContent = 'CSV available';
      statusEl.style.color = 'var(--success)';
      linkEl.classList.remove('disabled'); linkEl.removeAttribute('aria-disabled');
    } else {
      statusEl.textContent = 'CSV not available';
      statusEl.style.color = 'var(--danger)';
      linkEl.classList.add('disabled'); linkEl.setAttribute('aria-disabled','true'); linkEl.href = '#';
    }
  }

  // --- boot ---
  (async function boot(){
    await renderStats();
    await renderProofs();
    await checkCsvAvailability();
  })();

  // Expose for debugging
  window.pwTransparency = { renderStats, renderProofs, checkCsvAvailability };

})();