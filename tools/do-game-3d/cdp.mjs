// node cdp.mjs <urlSubstr> <jsFile|-e expr> [timeoutMs]
import fs from 'node:fs';
const [, , match, a, b, c] = process.argv;
let expr, tmo;
if (a === '-e') { expr = b; tmo = +c || 60000; } else { expr = fs.readFileSync(a, 'utf8'); tmo = +b || 60000; }
const list = await (await fetch('http://127.0.0.1:9333/json')).json();
const t = list.find(x => x.type === 'page' && (x.url.includes(match) || x.id === match));
if (!t) { console.log('NO TARGET', list.map(x => x.url).join('\n')); process.exit(1); }
const ws = new WebSocket(t.webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const timer = setTimeout(() => { console.log('TIMEOUT'); process.exit(2); }, tmo);
const res = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true, userGesture: true });
clearTimeout(timer);
if (res.result?.exceptionDetails) console.log('EXC', JSON.stringify(res.result.exceptionDetails).slice(0, 1500));
const v = res.result?.result?.value;
console.log(typeof v === 'string' ? v : JSON.stringify(v, null, 1));
ws.close(); process.exit(0);
