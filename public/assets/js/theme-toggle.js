(function(){
  // theme-toggle.js
  const KEY = 'pawthways_theme';
  function applyTheme(t){
    document.body.classList.remove('light','dark');
    document.body.classList.add(t);
    // update aria-pressed on the toggle if present
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) btn.setAttribute('aria-pressed', (t === 'dark').toString());
  }

  function detectInitialTheme(){
    const saved = localStorage.getItem(KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    // fallback to system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    return 'dark';
  }

  function toggleTheme(){
    const current = document.body.classList.contains('light') ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    localStorage.setItem(KEY, next);
    applyTheme(next);
    // dispatch event so other scripts can react (optional)
    window.dispatchEvent(new CustomEvent('pawthways:theme-changed', { detail: { theme: next } }));
  }

  document.addEventListener('DOMContentLoaded', function(){
    // ensure a theme is set early
    const theme = detectInitialTheme();
    applyTheme(theme);

    // attach handler to button
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) {
      btn.addEventListener('click', function(e){
        e.preventDefault();
        toggleTheme();
      });
    }

    // expose toggle for manual calls
    window.pawthwaysToggleTheme = toggleTheme;
  });
})();
