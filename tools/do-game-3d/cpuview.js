// CPU ms của composer.render + từng renderer.render (theo camera) trong trận — window.__cpuV(ms)
(() => {
  window.__cpuV = (ms = 5000) => new Promise(res => {
    const sr = window.__sr, r = sr.renderer, oR = r.render.bind(r), oC = sr.composer.render.bind(sr.composer);
    const acc = {}, cnt = {}, calls = {}; const add = (k, v, c) => { acc[k] = (acc[k] || 0) + v; cnt[k] = (cnt[k] || 0) + 1; if (c != null) calls[k] = (calls[k] || 0) + c; };
    r.render = (s, cam) => { const n0 = r.info.render.calls, t = performance.now(); oR(s, cam); const k = cam === sr.cams[0] ? 'cam0' : cam === sr.cams[1] ? 'cam1' : cam === sr.drone.cam ? 'dcam' : 'other'; add(k, performance.now() - t, r.info.render.calls - n0); };
    sr.composer.render = (...a) => { const t = performance.now(); oC(...a); add('composer', performance.now() - t); };
    setTimeout(() => { r.render = oR; sr.composer.render = oC; const o = {}; for (const k in acc) o[k] = { ms: +(acc[k] / cnt[k]).toFixed(2), n: cnt[k], calls: calls[k] ? Math.round(calls[k] / cnt[k]) : undefined }; res(JSON.stringify(o)); }, ms);
  });
  return 'cpuV ok';
})()
