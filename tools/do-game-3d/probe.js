(() => {
  if (window.__probe) { window.__probe.reset(); return 'reset'; }
  const P = { fr: [], loaf: [], samp: [], ev: [], rd: [], err: [], t0: performance.now() };
  window.addEventListener('error', e => { P.err.push([Math.round(performance.now() - P.t0), String(e.message).slice(0, 120)]); });
  const wrapC = c => { if (!c || c.__w) return; c.__w = 1; const o = c.render.bind(c); c.render = (...a) => { P.rd.push(Math.round(performance.now() - P.t0)); return o(...a); }; };
  let last = 0, lastProg = -1, lastPhase = '', lastRes = '';
  const tick = now => {
    if (last) P.fr.push([Math.round(now - P.t0), +(now - last).toFixed(2)]);
    last = now;
    const sr = window.__sr;
    if (sr) wrapC(sr.composer); if (window.__rwI && window.__rwI.composer) wrapC(window.__rwI.composer);
    if (sr) {
      const ph = sr.G.phase + (sr.G.hold ? '/hold' : '') + (sr.G.paused ? '/paused' : '');
      if (ph !== lastPhase) { P.ev.push([Math.round(now - P.t0), 'phase', ph]); lastPhase = ph; }
      const np = sr.renderer.info.programs.length;
      if (np !== lastProg) { if (lastProg >= 0) P.ev.push([Math.round(now - P.t0), 'programs', lastProg + '->' + np]); lastProg = np; }
      const r = JSON.stringify(sr.res);
      if (r !== lastRes) { P.ev.push([Math.round(now - P.t0), 'res', r]); lastRes = r; }
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  try {
    new PerformanceObserver(l => { for (const e of l.getEntries()) P.loaf.push({ t: Math.round(e.startTime - P.t0), d: Math.round(e.duration), blk: Math.round(e.blockingDuration || 0), rs: Math.round(e.renderStart ? e.renderStart - e.startTime : 0), scr: (e.scripts || []).slice(0, 4).map(s => `${(s.sourceFunctionName || s.invoker || '').slice(0, 40)}@${(s.sourceURL || '').split('/').pop()}:${s.sourceCharPosition} ${Math.round(s.duration)}ms`) }); }).observe({ type: 'long-animation-frame', buffered: false });
  } catch (e) { P.ev.push([0, 'noloaf', String(e)]); }
  setInterval(() => {
    const sr = window.__sr; if (!sr) return;
    const i = sr.renderer.info, s = sr.state();
    P.samp.push({ t: Math.round(performance.now() - P.t0), ph: s.phase, fps: sr.fps, pr: sr.res.pr, aa: sr.res.aa, calls: i.render.calls, tri: i.render.triangles, geo: i.memory.geometries, tex: i.memory.textures, prog: i.programs.length, kmh: s.teams.map(t => t.kmh), s: s.teams.map(t => Math.round(t.s)), ms: s.teams.map(t => t.ms), heap: Math.round((performance.memory?.usedJSHeapSize || 0) / 1048576) });
  }, 1000);
  P.reset = () => { P.fr = []; P.loaf = []; P.samp = []; P.ev = []; P.rd = []; P.err = []; P.t0 = performance.now(); last = 0; };
  P.summary = (from = 0, to = 1e12) => {
    const f = P.fr.filter(x => x[0] >= from && x[0] <= to).map(x => x[1]);
    if (!f.length) return null;
    const s = [...f].sort((a, b) => a - b), q = p => s[Math.min(s.length - 1, Math.floor(p * s.length))];
    const dur = f.reduce((a, b) => a + b, 0);
    const rds = P.rd.filter(t => t >= from && t <= to).length, errs = P.err.filter(e => e[0] >= from && e[0] <= to).length;
    return { drawn: +(rds / dur * 1000).toFixed(1), errs, n: f.length, sec: +(dur / 1000).toFixed(1), fps: +(f.length / dur * 1000).toFixed(1), p50: q(0.5), p95: q(0.95), p99: q(0.99), max: s[s.length - 1], gt20: f.filter(x => x > 20).length, gt33: f.filter(x => x > 33.4).length, gt50: f.filter(x => x > 50).length, gt100: f.filter(x => x > 100).length };
  };
  window.__probe = P;
  return 'installed';
})()
