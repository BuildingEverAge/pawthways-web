/* revenue-auto-init.js
   - Espera a Chart y a un canvas disponible
   - Pide /api/admin-stats y dibuja un chart sencillo con los datos
   - Idempotente: destruye chart existente si lo hubiera
*/
(function(){
  function waitForChartAndCanvas(cb, tries = 0) {
    if (typeof Chart === 'undefined' || tries > 50) {
      if (tries > 50) return console.warn('Timeout esperando Chart/canvas');
      return setTimeout(() => waitForChartAndCanvas(cb, tries + 1), 200);
    }
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      if (tries > 50) return console.warn('Timeout esperando canvas');
      return setTimeout(() => waitForChartAndCanvas(cb, tries + 1), 200);
    }
    cb(canvas);
  }

  function renderWithData(canvas, data) {
    try {
      const existing = Chart.getChart(canvas);
      if (existing) existing.destroy();
    } catch(e){ /* ignore */ }

    const ctx = canvas.getContext('2d');
    // construir dataset a partir de la respuesta (ajusta si tu API devuelve otra estructura)
    const labels = ['Total sales', 'Total reserved', 'Pending'];
    const values = [
      (data.total_sales !== undefined) ? data.total_sales : (data.totalSales || 0),
      (data.total_reserved !== undefined) ? data.total_reserved : (data.totalReserved || 0),
      (data.pending !== undefined) ? data.pending : (data.pending || 0)
    ];
    try {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Resumen',
            data: values,
            borderWidth: 1
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
      console.log('Revenue auto-init: gráfico renderizado con datos.', values);
    } catch(e){
      console.error('Revenue auto-init: error al crear Chart', e);
    }
  }

  // Ejecutar: esperar Chart y canvas, luego fetch y render
  document.addEventListener('DOMContentLoaded', function(){
    waitForChartAndCanvas(function(canvas){
      fetch('/api/admin-stats').then(r => {
        if (!r.ok) throw new Error('fetch admin-stats -> ' + r.status);
        return r.json();
      }).then(json => {
        renderWithData(canvas, json);
      }).catch(err => {
        console.warn('Revenue auto-init: fallo fetch, creando gráfico de fallback', err);
        // fallback sin datos
        renderWithData(canvas, { total_sales: 1, total_reserved: 0.5, pending: 0 });
      });
    });
  });
})();
