// node listen.mjs <urlSubstr> "<js>" <ms>  — in lỗi / console trong lúc chạy js
const [, , match, trig, msS] = process.argv;
const list = await (await fetch('http://127.0.0.1:9333/json')).json();
const t = list.find(x => x.type === 'page' && x.url.includes(match));
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
let id = 0; const send = (m, p = {}) => ws.send(JSON.stringify({ id: ++id, method: m, params: p }));
ws.onmessage = e => { const m = JSON.parse(e.data);
  if (m.method === 'Runtime.exceptionThrown') console.log('EXC', JSON.stringify(m.params.exceptionDetails).slice(0, 1200));
  if (m.method === 'Runtime.consoleAPICalled' && /error|warn/.test(m.params.type)) console.log('CON', m.params.type, JSON.stringify(m.params.args.map(a => a.value ?? a.description)).slice(0, 800));
  if (m.id === 99) console.log('RES', JSON.stringify(m.result).slice(0, 500)); };
send('Runtime.enable');
setTimeout(() => ws.send(JSON.stringify({ id: 99, method: 'Runtime.evaluate', params: { expression: trig, awaitPromise: true, returnByValue: true, userGesture: true } })), 300);
setTimeout(() => process.exit(0), +msS || 5000);
