/* revenue-init-prod.js
   Robust revenue chart:
   - espera Chart.js y canvas
   - fetch a /api/admin-stats
   - formato profesional (colores, tooltips, responsive)
   - idempotente
*/
(function(){
  const PAW_COLORS = {
    primary: '#0b7b5b',    // puedes cambiar al branding
    accent: '#ffb559',
    muted: '#9aa4a6',
    bg: '#ffffff'
  };

  function waitForChartAndCanvas(id, cb, tries = 0) {
    if (tries > 60) return console.warn('revenue-init-prod: timeout waiting Chart/canvas');
    if (typeof Chart === 'undefined') {
      return setTimeout(() => waitForChartAndCanvas(id, cb, tries + 1), 200);
    }
    const canvas = id ? document.querySelector('#' + id) : document.querySelector('canvas');
    if (!canvas) return setTimeout(() => waitForChartAndCanvas(id, cb, tries + 1), 200);
    cb(canvas);
  }

  function numberFormat(n){
    if (n === null || n === undefined) return '-';
    return Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(n);
  }

  function renderChart(canvas, data) {
    try {
      const prev = Chart.getChart(canvas);
      if (prev) prev.destroy();
    } catch(e){}

    const ctx = canvas.getContext('2d');
    // Data shaping: adapta a la estructura de tu API
    const total_sales = (data.total_sales !== undefined) ? data.total_sales : (data.totalSales || 0);
    const total_reserved = (data.total_reserved !== undefined) ? data.total_reserved : (data.totalReserved || 0);
    const pending = (data.pending !== undefined) ? data.pending : (data.pending || 0);

    const labels = ['Ventas', 'Reservado', 'Pendiente'];
    const values = [total_sales, total_reserved, pending];

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Valores (R$ o unidades)',
          data: values,
          backgroundColor: [PAW_COLORS.primary, PAW_COLORS.accent, PAW_COLORS.muted],
          borderColor: ['rgba(0,0,0,0.06)'],
          borderWidth: 1,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                const v = context.parsed.y;
                return `${context.dataset.label ? context.dataset.label + ': ' : ''}${numberFormat(v)}`;
              }
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            ticks: {
              callback: function(val) { return numberFormat(val); }
            },
            beginAtZero: true
          }
        },
        animation: { duration: 600, easing: 'easeOutQuart' }
      }
    });

    console.log('revenue-init-prod: chart rendered', values);
    return chart;
  }

  document.addEventListener('DOMContentLoaded', function(){
    // si quieres apuntar a un id concreto: pon 'revenueChart' como id del canvas
    const canvasId = (document.querySelector('#revenueChart') ? 'revenueChart' : null);

    waitForChartAndCanvas(canvasId, function(canvas){
      fetch('/api/admin-stats').then(r => {
        if (!r.ok) throw new Error('fetch admin-stats -> ' + r.status);
        return r.json();
      }).then(json => {
        renderChart(canvas, json);
      }).catch(err => {
        console.warn('revenue-init-prod: fetch failed, rendering fallback', err);
        renderChart(canvas, { total_sales: 0, total_reserved: 0, pending: 0 });
      });
    });
  });
})();
