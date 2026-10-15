// đo thời gian GPU từng pass của composer (EXT_disjoint_timer_query_webgl2). window.__gpuT(composer, renderer, ms) ⇒ {pass: avg ms}
(() => {
  window.__gpuT = (composer, renderer, ms = 4000, label = '') => new Promise(res => {
    const gl = renderer.getContext(), ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');
    if (!ext) return res('no ext');
    const pend = [], acc = {}, cnt = {};
    const orig = composer.passes.map(p => p.render);
    composer.passes.forEach((p, k) => {
      const name = k + ':' + (p.constructor.name || 'pass');
      const o = p.render;
      p.render = function (...a) {
        const q = gl.createQuery(); gl.beginQuery(ext.TIME_ELAPSED_EXT, q);
        const r = o.apply(this, a);
        gl.endQuery(ext.TIME_ELAPSED_EXT); pend.push([q, name]); return r;
      };
    });
    const t0 = performance.now();
    const poll = () => {
      for (let i = pend.length - 1; i >= 0; i--) {
        const [q, n] = pend[i];
        if (gl.getQueryParameter(q, gl.QUERY_RESULT_AVAILABLE)) {
          if (!gl.getParameter(ext.GPU_DISJOINT_EXT)) { const v = gl.getQueryParameter(q, gl.QUERY_RESULT) / 1e6; acc[n] = (acc[n] || 0) + v; cnt[n] = (cnt[n] || 0) + 1; }
          gl.deleteQuery(q); pend.splice(i, 1);
        }
      }
      if (performance.now() - t0 < ms) return requestAnimationFrame(poll);
      composer.passes.forEach((p, k) => { p.render = orig[k]; });
      const out = { label }; let tot = 0;
      for (const n in acc) { out[n] = +(acc[n] / cnt[n]).toFixed(2); tot += acc[n] / cnt[n]; }
      out.total = +tot.toFixed(2); out.frames = Math.max(...Object.values(cnt));
      res(out);
    };
    requestAnimationFrame(poll);
  });
  return 'gpuT ok';
})()
