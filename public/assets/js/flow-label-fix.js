(function(){
  function fixFlowLabels(){
    try {
      const svg = document.getElementById('flow-svg');
      if (!svg) return;
      svg.querySelectorAll('text').forEach(t => {
        // center-align and readable size
        t.setAttribute('text-anchor', 'middle');
        t.style.fontSize = '13px';
        t.style.fontWeight = '700';
        // strong fill for light circles
        t.setAttribute('fill', '#0b1220');
        // dark outline to increase contrast against any background
        t.setAttribute('stroke', 'rgba(7,17,26,0.95)');
        t.setAttribute('stroke-width', '3');
        t.setAttribute('paint-order', 'stroke');
        // slight vertical nudge to center text better inside circles
        const yAttr = t.getAttribute('y');
        if (yAttr !== null) {
          const y = parseFloat(yAttr);
          if (!isNaN(y)) t.setAttribute('y', (y + 2).toString());
        }
      });
      // subtle circle stroke to separate text from edges
      svg.querySelectorAll('circle').forEach(c => {
        c.setAttribute('stroke', 'rgba(0,0,0,0.06)');
        c.setAttribute('stroke-width', '1');
      });
    } catch(e){
      console.error('flow-label-fix error', e);
    }
  }

  // run on DOMContentLoaded and observe changes to reapply if DOM updates
  document.addEventListener('DOMContentLoaded', function(){
    fixFlowLabels();
    const svg = document.getElementById('flow-svg');
    if (!svg) return;
    const mo = new MutationObserver(() => fixFlowLabels());
    mo.observe(svg, { childList: true, subtree: true, attributes: true });
  });
})();
