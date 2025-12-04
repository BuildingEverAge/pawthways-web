/* chart-loader.js
   Intenta usar el bundle local /assets/js/chart.umd.min.js,
   y si falla, carga Chart.js desde CDN.
*/
(function(){
  function loadCDN(){
    if (window._chartCdnLoaded) return;
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    s.defer = true;
    s.onload = function(){ console.log('Chart.js CDN loaded'); window._chartCdnLoaded = true; };
    s.onerror = function(){ console.error('Failed to load Chart.js CDN'); };
    document.head.appendChild(s);
  }

  if (typeof Chart === 'undefined') {
    fetch('/assets/js/chart.umd.min.js', { method: 'HEAD' }).then(function(r) {
      if (r.ok) {
        var s = document.createElement('script');
        s.src = '/assets/js/chart.umd.min.js';
        s.defer = true;
        s.onload = function(){ console.log('Chart.js local loaded'); };
        s.onerror = function(){ console.error('Local Chart.js failed, falling back'); loadCDN(); };
        document.head.appendChild(s);
      } else {
        loadCDN();
      }
    }).catch(function(){ loadCDN(); });
  }
})();
