(async () => {
  // chơi thật bằng DOM trên trang live: bấm START, trả lời (80 % đúng / 70 % đúng), bắn tên lửa khi có — đo khung bằng __probe
  const P = window.__probe, sleep = ms => new Promise(r => setTimeout(r, ms));
  const act = window.__liveAct;
  const norm = s => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const key = new Map(act.content.questions.map(q => [norm(q.question), q.answers]));
  P.reset(); P.marks = []; const now = () => Math.round(performance.now() - P.t0), mark = n => P.marks.push([now(), n]);
  for (let k = 0; k < 120 && !document.querySelector('.ri-start'); k++) await sleep(500);
  await sleep(8000);
  mark('garage'); await sleep(12000);
  mark('START'); document.querySelector('.ri-start').click();
  const phase = () => { const r = document.querySelector('.sr-root'); return r ? (r.classList.contains('is-race') ? 'race' : r.classList.contains('is-count') ? 'count' : r.classList.contains('is-end') ? 'end' : 'menu') : '?'; };
  for (let k = 0; k < 400 && phase() !== 'count' && phase() !== 'race'; k++) await sleep(50);
  mark('count');
  for (let k = 0; k < 400 && phase() !== 'race'; k++) await sleep(50);
  mark('race');
  const acc = [0.8, 0.7], next = [0, 0]; let clicks = 0, fires = 0;
  const t0 = performance.now();
  while (phase() === 'race' && performance.now() - t0 < 240000) {
    const halves = [...document.querySelectorAll('.sr-half')];
    const qs = [...document.querySelectorAll('.sr-qbox .sr-q')];
    for (let i = 0; i < 2; i++) {
      if (performance.now() < next[i]) continue;
      const h = halves[i]; if (!h) continue;
      const btns = [...h.querySelectorAll('.sr-ans button')].filter(b => !b.disabled && b.offsetParent);
      const ans = key.get(norm(qs[i] && qs[i].textContent));
      if (btns.length && ans) {
        const ok = Math.random() < acc[i];
        const want = btns.filter(b => { const a = ans.find(x => norm(x.text) === norm(b.textContent)); return a && !!a.correct === ok; });
        const b = want[0] || btns[0];
        b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); b.click(); clicks++;
        next[i] = performance.now() + 1400 + Math.random() * 2600;
      }
      const f = h.querySelector('.sr-fire.ready'); if (f && Math.random() < 0.02) { f.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); f.click(); fires++; }
    }
    await sleep(100);
  }
  mark('end'); await sleep(8000); mark('done');
  return JSON.stringify({ clicks, fires, phase: phase() });
})()
