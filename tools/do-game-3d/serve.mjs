// AWord web cục bộ (no-store) — /templates/racing-words/* lấy từ thư mục trong root.txt + móc window.__sr vào rw-3*.js
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
const DIR = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
const WEB = 'E:/LAP TRINH APP/AWord/web';
const rootNow = () => fs.readFileSync(path.join(DIR, 'root.txt'), 'utf8').trim();
const CT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.glb': 'model/gltf-binary', '.mp3': 'audio/mpeg', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.wasm': 'application/wasm', '.txt': 'text/plain' };
const PORT = +process.argv[2] || 5733;
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  let f;
  const RW = '/templates/racing-words/';
  if (p.startsWith('/__bench/')) f = path.join(DIR, p.slice(9));
  else if (p.startsWith(RW)) f = path.join(rootNow(), p.slice(RW.length)); else f = path.join(WEB, p);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('404'); }
  let buf = fs.readFileSync(f);
  if (p.startsWith(RW) && /\/3d\/rw-3\w+\.js$/.test(p)) {
    const s = buf.toString('utf8'), s2 = s.replace(/return \{\s*\n\s*game, intro,/, m0 => 'window.__sr = game; window.__rwI = intro;\n  ' + m0);
    if (s2 === s) console.log('HOOK FAIL', p);
    buf = Buffer.from(s2, 'utf8');
  }
  if (p.startsWith(RW)) console.log(new Date().toISOString().slice(11, 19), p.slice(RW.length), buf.length);
  res.writeHead(200, { 'Content-Type': CT[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Content-Length': buf.length, 'Cache-Control': 'no-store' });
  res.end(buf);
}).listen(PORT, 'localhost', () => console.log('serve on', PORT));
