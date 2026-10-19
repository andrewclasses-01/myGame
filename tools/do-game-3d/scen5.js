(async () => {
  // 5f+ (19/10/2026): xưởng 12 s → START → phim → 5 đèn → đua tự động cả ván (drone bắn đạn đều nếu bật, 2 xe chênh tốc để cách xa) → kết quả → PLAY AGAIN 25 s.
  // Cài đặt (drone / traffic / sky) đặt bằng localStorage TRƯỚC khi tải lại trang (runfull5.sh) ⇒ prewarm thấy đúng như máy thầy.
  const P = window.__probe, sr = window.__sr, I = window.__rwI, C = window.__cfg || {};
  const now = () => Math.round(performance.now() - P.t0), sleep = ms => new Promise(r => setTimeout(r, ms));
  const acc = C.acc || [0.9, 0.55];
  for (let k = 0; k < 120 && !sr.warm; k++) await sleep(500);
  await sleep(1500);
  P.reset(); P.marks = []; P.gpu = []; P.draws = []; const mark = n => P.marks.push([now(), n]);
  const drawT = setInterval(() => { const d = sr.draws; if (d && d.calls) P.draws.push([now(), sr.G.phase, d.calls, d.tris, d.drone]); }, 2000);
  mark('garage ' + JSON.stringify({ drone: sr.drone.set.on ? sr.drone.set.n : 0, tr: sr.trafficMode }));
  await sleep(12000);
  mark('START'); document.querySelector('.ri-start').click();
  for (let k = 0; k < 400 && sr.G.phase === 'menu'; k++) await sleep(50);
  mark('phase ' + sr.G.phase);
  for (let k = 0; k < 400 && sr.G.phase === 'count'; k++) await sleep(50);
  mark('phase ' + sr.G.phase);
  sr.auto(true, acc[0], acc[1]);
  // drone: mỗi 1,6 s đổi loại đạn, ngắm xe ngẫu nhiên, bắn (đủ vệt / khói / dấu điểm rơi / nổ)
  let kSel = 0;
  const fireT = setInterval(() => {
    if (sr.G.phase !== 'race') return;
    sr.drone.drones.filter(d => d.used).forEach(d => {
      const st = sr.state(), tg = st.teams[Math.random() < 0.5 ? 0 : 1];
      sr.drone.sel(kSel % 3, d.n); sr.drone.aim(tg.x, 28 + Math.random() * 20, d.n); sr.drone.fire(d.n);
    });
    kSel++;
  }, 1600);
  let gpuDone = false;
  for (let k = 0; k < 6000 && sr.G.phase === 'race'; k++) {
    await sleep(100);
    if (!gpuDone && k === 250 && window.__gpuT) { gpuDone = true; mark('gpu'); P.gpu.push(await window.__gpuT(sr.composer, sr.renderer, 4000, 'race')); mark('gpu end'); }
  }
  clearInterval(fireT);
  mark('phase ' + sr.G.phase);
  await sleep(8000);
  mark('again'); const again = document.querySelector('.sr-again'); if (again) again.click(); else sr.start();
  for (let k = 0; k < 400 && sr.G.phase !== 'race'; k++) await sleep(50);
  mark('race2'); sr.auto(true, acc[0], acc[1]);
  await sleep(25000);
  mark('done'); clearInterval(drawT);
  return JSON.stringify({ cars: sr.cars(), warm: sr.warm, gpu: P.gpu });
})()
