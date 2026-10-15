const [, , match, ...cmds] = process.argv;
const list = await (await fetch('http://127.0.0.1:9333/json')).json();
const t = list.find(x => x.type === 'page' && x.url.includes(match));
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
let id = 0; ws.onmessage = e => { const s = String(e.data); console.log(s.slice(0, 400)); };
for (const c of cmds) { const [m, p] = c.split('|'); ws.send(JSON.stringify({ id: ++id, method: m, params: p ? JSON.parse(p) : {} })); }
setTimeout(() => process.exit(0), 4000);
