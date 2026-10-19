// node profspike.mjs <urlSubstr> "<js chạy (Promise) trong lúc ghi>" [ngưỡng ms=35]  (5h, 19/10/2026)
// CPU profiler suốt 1 kịch bản dài ⇒ tìm các đoạn mẫu liền nhau có 'loop' trong ngăn xếp kéo dài > ngưỡng ⇒ in top hàm (self) + ngăn xếp nặng nhất của MỖI cú.
const [, , match, trig, thrS] = process.argv;
const THR = +thrS || 35;
const list = await (await fetch('http://127.0.0.1:9333/json')).json();
const t = list.find(x => x.type === 'page' && x.url.includes(match));
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Profiler.enable'); await send('Profiler.setSamplingInterval', { interval: 500 });
await send('Profiler.start');
const ev = await send('Runtime.evaluate', { expression: trig, awaitPromise: true, returnByValue: true, userGesture: true });
const { result } = await send('Profiler.stop');
console.log('RUN', JSON.stringify(ev.result?.result?.value ?? ev.result?.exceptionDetails ?? '').slice(0, 300));
const P = result.profile, byId = new Map(P.nodes.map(n => [n.id, n])), parent = new Map();
P.nodes.forEach(n => (n.children || []).forEach(c => parent.set(c, n.id)));
const name = n => `${n.callFrame.functionName || '(anon)'}@${(n.callFrame.url || '').split('/').pop()}:${n.callFrame.lineNumber + 1}`;
const stack = idn => { const s = []; let x = idn; while (x != null) { const n = byId.get(x); s.push(n); x = parent.get(x); } return s; };
let ts = P.startTime; const S = P.samples.map((sid, k) => { ts += P.timeDeltas[k]; return { t: ts / 1000, id: sid }; });
const inLoop = s => stack(s.id).some(n => n.callFrame.functionName === 'loop');
const spikes = []; let cur = null;
for (const s of S) { if (inLoop(s)) { if (!cur) cur = { t0: s.t, t1: s.t, ss: [] }; cur.t1 = s.t; cur.ss.push(s); } else if (cur) { if (cur.t1 - cur.t0 > THR) spikes.push(cur); cur = null; } }
for (const sp of spikes) {
  const self = {}, path = {};
  for (const s of sp.ss) { const st = stack(s.id); self[name(st[0])] = (self[name(st[0])] || 0) + 0.5;
    const p = st.slice(0, 9).map(name).reverse().filter(x => !x.startsWith('(root)')).slice(-7).join(' > '); path[p] = (path[p] || 0) + 0.5; }
  console.log(`\n== cú ${Math.round(sp.t1 - sp.t0)} ms @ ${Math.round(sp.t0 - S[0].t)} ms`);
  console.log(' self:', Object.entries(self).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => `${k} ${v}ms`).join(' | '));
  Object.entries(path).sort((a, b) => b[1] - a[1]).slice(0, 3).forEach(([k, v]) => console.log(`  ${v}ms ${k}`));
}
console.log('\nSỐ CÚ >', THR, 'ms:', spikes.length);
process.exit(0);
