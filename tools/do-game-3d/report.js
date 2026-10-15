(() => {
  const P = window.__probe, M = P.marks || [];
  const seg = [];
  for (let i = 0; i < M.length - 1; i++) seg.push({ from: M[i][1], to: M[i + 1][1], ms: M[i + 1][0] - M[i][0], ...P.summary(M[i][0], M[i + 1][0]) });
  const loaf = P.loaf.filter(l => l.d > 60).sort((a, b) => b.d - a.d).slice(0, 25);
  const big = P.fr.filter(f => f[1] > 50).map(f => f[0] + ':' + Math.round(f[1]));
  const samp = P.samp.filter((_, k) => k % 5 === 0);
  return JSON.stringify({ errs: (P.err || []).slice(0, 5), nerr: (P.err || []).length, marks: M, seg, ev: P.ev.slice(0, 60), big: big.slice(0, 120), nbig: big.length, loaf, samp }, null, 0);
})()
