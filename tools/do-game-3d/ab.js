(async () => {
  const P = window.__probe, s = window.__sr, sleep = ms => new Promise(r => setTimeout(r, ms));
  const R = s.renderer;
  // khoá độ nét cố định cho công bằng
  const PR = +(window.__abPR || 0.8);
  if (!R.__lockPR) { R.__origSPR = R.setPixelRatio; R.__lockPR = true; R.setPixelRatio = function () { return R.__origSPR.call(this, PR); }; }
  R.__origSPR.call(R, PR); s.composer.setPixelRatio(PR); window.dispatchEvent(new Event('resize'));
  const css = document.createElement('style'); css.id = 'abcss';
  const variants = window.__abVariants || [
    ['normal', ''],
    ['nofilter', '.aw-rw-host *{filter:none!important;backdrop-filter:none!important}'],
    ['normal2', ''],
  ];
  const out = [];
  if (s.G.phase !== 'race') { s.start(); await sleep(5500); }
  s.auto(true, 0.8, 0.7);
  for (const [name, rule] of variants) {
    css.textContent = rule; if (!css.isConnected) document.head.append(css);
    await sleep(1500);
    const a = performance.now() - P.t0, d0 = new Date().toISOString();
    await sleep(window.__abMs || 12000);
    const b = performance.now() - P.t0;
    out.push({ name, from: d0, to: new Date().toISOString(), phase: s.G.phase, ...P.summary(a, b) });
    if (s.G.phase !== 'race') { s.start(); await sleep(5500); s.auto(true, 0.8, 0.7); }
  }
  css.remove();
  return JSON.stringify(out);
})()
