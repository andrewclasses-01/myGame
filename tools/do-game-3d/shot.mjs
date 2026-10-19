// node shot.mjs <urlSubstr> <out.png> [scale]  — chụp trang qua CDP
import fs from 'node:fs';
const [, , match, out, sc] = process.argv;
const list = await (await fetch('http://127.0.0.1:9333/json')).json();
const t = list.find(x => x.type === 'page' && x.url.includes(match));
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id === 1) { fs.writeFileSync(out, Buffer.from(m.result.data, 'base64')); process.exit(0); } };
ws.send(JSON.stringify({ id: 1, method: 'Page.captureScreenshot', params: { format: 'jpeg', quality: 80, clip: { x: 0, y: 0, width: 3072, height: 1504, scale: +sc || 0.5 } } }));
