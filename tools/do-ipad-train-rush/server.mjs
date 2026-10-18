// máy chủ tĩnh bàn đo: /bench/* = thư mục này · còn lại = myGame
import http from "node:http"; import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = "E:/LAP TRINH APP/myGame", PORT = +process.argv[2] || 8899;
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".ogg": "audio/ogg", ".wav": "audio/wav", ".glb": "model/gltf-binary", ".svg": "image/svg+xml" };
http.createServer((q, r) => {
  let u = decodeURIComponent(q.url.split("?")[0]);
  const f = u.startsWith("/bench/") ? path.join(HERE, u.slice(7)) : path.join(ROOT, u);
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { "content-type": MIME[path.extname(f)] || "application/octet-stream", "cache-control": "no-store" }); r.end(b); });
}).listen(PORT, "127.0.0.1", () => console.log("bench on", PORT));
