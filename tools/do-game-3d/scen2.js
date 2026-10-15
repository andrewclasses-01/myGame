(async () => {
  // tình huống nặng: đổi xe ở xưởng (Y4 + H7), START, đua tự động cả ván, PLAY AGAIN (chạm đúp bỏ phim) đua thêm 30 s
  const P = window.__probe, sr = window.__sr, I = window.__rwI;
  const now = () => Math.round(performance.now() - P.t0), sleep = ms => new Promise(r => setTimeout(r, ms));
  for (let k = 0; k < 120 && !sr.warm; k++) await sleep(500);
  P.reset(); P.marks = []; const mark = n => P.marks.push([now(), n]);
  mark('garage');
  await sleep(3000);
  mark('swap Y4'); await I.setCar(0, 'Y4');
  await sleep(1500);
  mark('swap H7'); await I.setCar(1, 'H7');
  for (let k = 0; k < 60; k++) { await sleep(500); if (sr.warm && sr.cars().join() === 'Y4,H7') break; }
  mark('swapped ' + sr.cars().join());
  await sleep(8000);
  mark('START'); document.querySelector('.ri-start').click();
  for (let k = 0; k < 400 && sr.G.phase === 'menu'; k++) await sleep(50);
  mark('phase ' + sr.G.phase);
  for (let k = 0; k < 400 && sr.G.phase === 'count'; k++) await sleep(50);
  mark('phase ' + sr.G.phase);
  sr.auto(true, 0.8, 0.7);
  for (let k = 0; k < 6000 && sr.G.phase === 'race'; k++) await sleep(100);
  mark('phase ' + sr.G.phase);
  await sleep(6000);
  mark('again'); const again = document.querySelector('.sr-again'); if (again) again.click(); else sr.start();
  await sleep(300);
  if (I.state === 'play') { mark('skip'); I.skip(); }
  for (let k = 0; k < 400 && sr.G.phase !== 'race'; k++) await sleep(50);
  mark('race2'); sr.auto(true, 0.8, 0.7);
  await sleep(30000);
  mark('done');
  return JSON.stringify({ cars: sr.cars(), warm: sr.warm });
})()
