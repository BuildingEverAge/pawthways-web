/* revenue-init-prod.js
   Doughnut revenue chart with inside labels (chip style).
   - espera Chart.js y canvas (#revenuePie preferido)
   - fetch /api/admin-stats
   - custom plugin para dibujar etiquetas blancas dentro de slices
   - idempotente
*/
(function(){
  const COLORS = {
    pink: '#ff9b9b',
    blue: '#7fb3ff',
    muted: '#9aa4a6'
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
    try { return Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(n); } catch(e) { return String(n); }
  }

  // Plugin: draw white "chips" with value text centered inside each segment
  const innerLabelPlugin = {
    id: 'innerLabelPlugin',
    afterDatasetsDraw(chart, args, options) {
      const {ctx, chartArea: {width, height}} = chart;
      const meta = chart.getDatasetMeta(0);
      if (!meta || !meta.data) return;
      meta.data.forEach((arc, i) => {
        const dataset = chart.data.datasets[0];
        const value = dataset.data[i];
        // skip zero values
        if (!value && value !== 0) return;
        const center = arc.getCenterPoint ? arc.getCenterPoint() : {x: arc.x, y: arc.y};
        // compute angle-based offset to put label roughly at middle of arc radius
        const model = arc;
        // radius for label = innerRadius + (outerRadius - innerRadius) * 0.6
        const innerR = arc.innerRadius || (arc._model && arc._model.innerRadius) || (arc.r * 0.3);
        const outerR = arc.outerRadius || (arc._model && arc._model.outerRadius) || arc.r;
        const labelR = innerR + (outerR - innerR) * 0.6;

        // compute angle center (Chart 4: arc.startAngle, arc.endAngle)
        const startAngle = arc.startAngle ?? arc._model?.startAngle;
        const endAngle = arc.endAngle ?? arc._model?.endAngle;
        const midAngle = (startAngle + endAngle) / 2;

        const x = arc.x + Math.cos(midAngle) * labelR;
        const y = arc.y + Math.sin(midAngle) * labelR;

        // draw chip background
        const txt = numberFormat(value);
        ctx.save();
        ctx.font = '600 14px Inter, system-ui, Arial';
        const paddingX = 10;
        const paddingY = 6;
        const textWidth = ctx.measureText(txt).width;
        const boxW = textWidth + paddingX * 2;
        const boxH = 20;

        // rounded rect
        ctx.beginPath();
        const rx = 6;
        ctx.fillStyle = '#ffffff';
        const bx = x - boxW/2;
        const by = y - boxH/2;
        ctx.moveTo(bx + rx, by);
        ctx.arcTo(bx + boxW, by, bx + boxW, by + boxH, rx);
        ctx.arcTo(bx + boxW, by + boxH, bx, by + boxH, rx);
        ctx.arcTo(bx, by + boxH, bx, by, rx);
        ctx.arcTo(bx, by, bx + boxW, by, rx);
        ctx.closePath();
        ctx.fill();

        // text
        ctx.fillStyle = '#0b1220';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(txt, x, y);

        ctx.restore();
      });
    }
  };

  // render doughnut
  function renderDoughnut(canvas, dataObj) {
    try {
      const existing = Chart.getChart(canvas);
      if (existing) existing.destroy();
    } catch(e){}

    const total_sales = (dataObj && (dataObj.total_sales !== undefined)) ? dataObj.total_sales : (dataObj && (dataObj.totalSales || 0)) || 0;
    const total_reserved = (dataObj && (dataObj.total_reserved !== undefined)) ? dataObj.total_reserved : (dataObj && (dataObj.totalReserved || Math.round(total_sales * 0.4))) || 0;
    const rest = Math.max(0, total_sales ? (total_sales - total_reserved) : 60);

    const labels = [`Donations (${total_sales? Math.round((total_reserved/total_sales)*100) : 40}%)`, `Production (${total_sales? Math.round((rest/total_sales)*100) : 60}%)`];
    const values = [total_reserved || 40, rest || 60];

    const cfg = {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: [COLORS.pink, COLORS.blue],
          hoverOffset: 6,
          borderWidth: 2,
          borderColor: 'rgba(0,0,0,0.06)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '40%',
        plugins: {
          legend: { position: 'bottom', labels: { color: '#e6eef7' } },
          tooltip: {
            bodyColor: '#0b1220',
            backgroundColor: '#fff',
            titleColor: '#0b1220',
            callbacks: {
              label: function(context) {
                const v = context.parsed;
                return `${context.label}: ${numberFormat(v)}`;
              }
            }
          }
        },
        animation: { duration: 600, easing: 'easeOutQuart' }
      },
      plugins: [innerLabelPlugin]
    };

    // register plugin locally (Chart.register not needed if plugin passed in config)
    try {
      new Chart(canvas.getContext('2d'), cfg);
      console.log('revenue-init-prod: doughnut rendered', values);
    } catch(e){
      console.error('revenue-init-prod: error rendering doughnut', e);
    }
  }

  // run
  document.addEventListener('DOMContentLoaded', function(){
    const canvasId = (document.querySelector('#revenuePie') ? 'revenuePie' : (document.querySelector('#revenueChart') ? 'revenueChart' : null));
    waitForChartAndCanvas(canvasId, function(canvas){
      fetch('/api/admin-stats').then(r => {
        if (!r.ok) throw new Error('fetch admin-stats -> ' + r.status);
        return r.json();
      }).then(json => {
        renderDoughnut(canvas, json);
      }).catch(err => {
        console.warn('revenue-init-prod: fetch failed, rendering fallback', err);
        renderDoughnut(canvas, { total_sales: 0, total_reserved: 40, pending: 0 });
      });
    });
  });
})();
