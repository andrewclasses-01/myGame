(async () => {
  const I = __rwI, s = __sr, R = I.renderer, P = __probe, sl = ms => new Promise(r => setTimeout(r, ms));
  const o = R.__o || (R.__o = R.setPixelRatio.bind(R));
  const prs = window.__filmPRs || [1, 0.85, 0.7];
  const out = [];
  for (const pr of prs) {
    if (s.G.phase !== 'menu') { s.toMenu(); await sl(2500); }
    R.setPixelRatio = () => {}; o(pr); I.composer.setPixelRatio(pr); I.composer.setSize(I.root.clientWidth, I.root.clientHeight);
    await sl(1500);
    // đo GPU RenderPass theo từng khung trong phim
    const gl = R.getContext(), ext = gl.getExtension('EXT_disjoint_timer_query_webgl2'), rp = I.composer.passes[0], orig = rp.render, q = [], ser = [];
    const t0 = performance.now();
    rp.render = function (...a) { const qq = gl.createQuery(); gl.beginQuery(ext.TIME_ELAPSED_EXT, qq); const r = orig.apply(this, a); gl.endQuery(ext.TIME_ELAPSED_EXT); q.push([qq, performance.now() - t0]); return r; };
    const a = performance.now() - P.t0;
    document.querySelector('.ri-start').click();
    for (let k = 0; k < 300 && s.G.phase === 'menu'; k++) { await sl(50); for (let i = q.length - 1; i >= 0; i--) if (gl.getQueryParameter(q[i][0], gl.QUERY_RESULT_AVAILABLE)) { ser.push([Math.round(q[i][1]), +(gl.getQueryParameter(q[i][0], gl.QUERY_RESULT) / 1e6).toFixed(1)]); gl.deleteQuery(q[i][0]); q.splice(i, 1); } }
    const b = performance.now() - P.t0;
    rp.render = orig;
    // gom theo giây phim
    const bySec = {}; ser.forEach(([t, v]) => { const k = Math.floor(t / 1000); (bySec[k] = bySec[k] || []).push(v); });
    const secs = Object.entries(bySec).map(([k, v]) => k + ':' + (v.reduce((x, y) => x + y, 0) / v.length).toFixed(1)).join(' ');
    out.push({ pr, ...P.summary(a, b), gpuRPbySec: secs });
    s.hold(true); await sl(500);
  }
  R.setPixelRatio = o;
  return JSON.stringify(out, null, 0);
})()
