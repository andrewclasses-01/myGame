(async () => {
  const P = window.__probe, sr = window.__sr, I = window.__rwI;
  const now = () => Math.round(performance.now() - P.t0);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  P.marks = [];
  const mark = n => P.marks.push([now(), n]);
  // chờ prewarm xong
  for (let k = 0; k < 120 && !sr.warm; k++) await sleep(500);
  mark('warmed ' + JSON.stringify(sr.warm));
  await sleep(1500);
  P.reset(); P.marks = []; mark('garage');
  await sleep(12000);
  mark('START'); document.querySelector('.ri-start').click();
  for (let k = 0; k < 400 && sr.G.phase === 'menu'; k++) await sleep(50);
  mark('phase ' + sr.G.phase);
  for (let k = 0; k < 400 && sr.G.phase === 'count'; k++) await sleep(50);
  mark('phase ' + sr.G.phase);
  sr.auto(true, 0.8, 0.7);
  for (let k = 0; k < 6000 && sr.G.phase === 'race'; k++) await sleep(100);
  mark('phase ' + sr.G.phase);
  await sleep(10000);
  mark('done');
  return 'ok';
})()
