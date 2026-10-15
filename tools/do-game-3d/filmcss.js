(async () => {
  const I = __rwI, s = __sr, P = __probe, sl = ms => new Promise(r => setTimeout(r, ms)), R = I.renderer, o = R.__o;
  const V = [
    ['orig', ''],
    ['noblur', '@keyframes riBigX{0%{opacity:0;transform:translate(-50%,-50%) scale(1.7)}14%{opacity:1;transform:translate(-50%,-50%) scale(1)}75%{opacity:1;transform:translate(-50%,-50%) scale(1.04)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.12)}} .rw-root .ri-root.is-big .ri-big{animation-name:riBigX;will-change:transform,opacity}'],
    ['noblur+lightshadow', '@keyframes riBigX{0%{opacity:0;transform:translate(-50%,-50%) scale(1.7)}14%{opacity:1;transform:translate(-50%,-50%) scale(1)}75%{opacity:1;transform:translate(-50%,-50%) scale(1.04)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.12)}} .rw-root .ri-root.is-big .ri-big{animation-name:riBigX;will-change:transform,opacity} .rw-root .ri-big{text-shadow:0 0 3cqh rgba(255,120,40,.85)}'],
  ];
  const css = document.createElement('style'); document.head.append(css);
  const out = [];
  for (const [n, rule] of V) {
    css.textContent = rule;
    s.toMenu(); await sl(2500);
    R.setPixelRatio = () => {}; o(0.7); I.composer.setPixelRatio(0.7); I.composer.setSize(I.root.clientWidth, I.root.clientHeight); await sl(1200);
    const a = performance.now() - P.t0;
    document.querySelector('.ri-start').click();
    for (let k = 0; k < 300 && s.G.phase === 'menu'; k++) await sl(50);
    s.hold(true); R.setPixelRatio = o;
    const fr = P.fr.filter(f => f[0] >= a);
    const win = fr.filter(f => f[0] - a > 9000 && f[0] - a < 11500);
    out.push({ n, all: P.summary(a, performance.now() - P.t0), title_gt20: win.filter(f => f[1] > 20).length, title_n: win.length });
  }
  css.remove();
  return JSON.stringify(out);
})()
