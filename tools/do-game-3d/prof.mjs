// node prof.mjs <urlSubstr> "<js to trigger>" <ms>  ⇒ top hàm theo self-time + cây gọi nóng
const [, , match, trig, msS] = process.argv;
const ms = +msS || 1500;
const list = await (await fetch('http://127.0.0.1:9333/json')).json();
const t = list.find(x => x.type === 'page' && x.url.includes(match));
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Profiler.enable'); await send('Profiler.setSamplingInterval', { interval: 250 });
await send('Profiler.start');
await send('Runtime.evaluate', { expression: trig, userGesture: true });
await new Promise(r => setTimeout(r, ms));
const { result } = await send('Profiler.stop');
const P = result.profile, byId = new Map(P.nodes.map(n => [n.id, n]));
const dt = P.timeDeltas, self = new Map();
P.samples.forEach((s, k) => self.set(s, (self.get(s) || 0) + (dt[k] || 0)));
// self time theo hàm
const agg = new Map();
for (const [nid, us] of self) { const n = byId.get(nid), cf = n.callFrame; const key = `${cf.functionName || '(anon)'} ${cf.url.split('/').pop()}:${cf.lineNumber + 1}`; agg.set(key, (agg.get(key) || 0) + us); }
console.log('TOP SELF (ms)');
[...agg].sort((a, b) => b[1] - a[1]).slice(0, 25).forEach(([k, v]) => console.log((v / 1000).toFixed(1).padStart(8), k));
// tổng thời gian (self + con) theo hàm
const parent = new Map(); P.nodes.forEach(n => (n.children || []).forEach(c => parent.set(c, n.id)));
const tot = new Map();
for (const [nid, us] of self) { let cur = nid; const seen = new Set(); while (cur) { const n = byId.get(n2key(cur)); const cf = byId.get(cur).callFrame; const key = `${cf.functionName || '(anon)'} ${cf.url.split('/').pop()}:${cf.lineNumber + 1}`; if (!seen.has(key)) { tot.set(key, (tot.get(key) || 0) + us); seen.add(key); } cur = parent.get(cur); } }
function n2key(x) { return x; }
console.log('TOP TOTAL (ms)');
[...tot].sort((a, b) => b[1] - a[1]).slice(0, 30).forEach(([k, v]) => console.log((v / 1000).toFixed(1).padStart(8), k));
process.exit(0);
