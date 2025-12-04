/* proof-fallback.js
   Añade comportamientos de fallback a thumbnails (.proof-thumb)
   sin modificar el resto del código: setea lazy loading, alt y un onerror seguro.
*/
(function(){
  function ensureFallback(img) {
    try {
      if (!img) return;
      if (img.dataset._pfProcessed) return;
      img.dataset._pfProcessed = '1';

      if (!img.getAttribute('alt')) img.setAttribute('alt', img.getAttribute('data-title') || 'proof');
      if (!img.loading) img.loading = 'lazy';

      if (!img.src || img.src.trim() === '' || img.src.indexOf('your-cdn.example') !== -1) {
        img.src = '/assets/img/proof-placeholder.svg';
        img.setAttribute('aria-hidden', 'true');
      }

      img.onerror = function() {
        if (!this.dataset.fallback) {
          this.dataset.fallback = '1';
          try { this.src = '/assets/img/proof-placeholder.svg'; } catch(e) {}
          this.setAttribute('aria-hidden', 'true');
        }
      };
    } catch(e){ console.error('proof-fallback error', e); }
  }

  function scanAndAttach() {
    var imgs = document.querySelectorAll('img.proof-thumb');
    imgs.forEach(function(i){ ensureFallback(i); });
  }

  document.addEventListener('DOMContentLoaded', function(){
    scanAndAttach();
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        m.addedNodes && m.addedNodes.forEach(function(node){
          if (node && node.nodeType === 1) {
            if (node.matches && node.matches('img.proof-thumb')) {
              ensureFallback(node);
            } else {
              node.querySelectorAll && node.querySelectorAll('img.proof-thumb').forEach(ensureFallback);
            }
          }
        });
      });
    });
    observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
  });

})();
