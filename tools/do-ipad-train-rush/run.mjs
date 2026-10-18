// node run.mjs <mod 1av|1ax> <lag ms> [giây ghi=30] — Chrome riêng (có cửa sổ, không bị đóng băng) qua CDP
import { spawn } from "node:child_process"; import { mkdtempSync } from "node:fs"; import { tmpdir } from "node:os"; import { join } from "node:path";
const [MOD = "1ax", LAG = "0", SEC = "30", LOST = ""] = process.argv.slice(2);
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe", PORT = 9400 + Math.floor(Math.random() * 400);
const ch = spawn(CHROME, [`--remote-debugging-port=${PORT}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "b1ax-"))}`, "--no-first-run", "--window-size=1100,900",
  "--disable-backgrounding-occluded-windows", "--disable-renderer-backgrounding", "--disable-background-timer-throttling", "--autoplay-policy=no-user-gesture-required", "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let ws, id = 0; const wait = new Map();
for (let i = 0; i < 60 && !ws; i++) { try { const l = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); const p = l.find(t => t.type === "page"); if (p) { ws = new WebSocket(p.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r); break; } } catch {} await sleep(250); }
ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && wait.has(m.id)) { const c = wait.get(m.id); wait.delete(m.id); m.error ? c.no(new Error(m.error.message)) : c.ok(m.result); } };
const call = (method, params = {}) => new Promise((ok, no) => { const i = ++id; wait.set(i, { ok, no }); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => { const r = await call("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 400)); return r.result.value; };
await call("Runtime.enable");
ws.addEventListener("message", e => { const m = JSON.parse(e.data); if (m.method === "Runtime.exceptionThrown") console.error("LOI", JSON.stringify(m.params.exceptionDetails).slice(0, 300)); if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") console.error("CONSOLE", JSON.stringify(m.params.args).slice(0, 300)); });
await call("Page.navigate", { url: `http://127.0.0.1:8899/bench/tr.html?mod=${MOD}&lag=${LAG}${LOST ? "&lost=1" : ""}` });
const P = "document.getElementById('f').contentWindow";
for (let i = 0; i < 120; i++) { await sleep(500); try { if (await ev(`!!(window.__f && __f.G.phase === "start" && ${P}.__pad)`)) break; } catch {} }
console.error("nap xong", await ev(`JSON.stringify({ph: window.__f && __f.G.phase, pad: !!${P}.__pad, err: (window.__e||[]).slice(0,3)})`).catch(e=>String(e)));
await ev(`__f.start(false)`);
for (let i = 0; i < 60; i++) { await sleep(250); if (await ev(`__f.G.phase === "play"`)) break; }
console.error("phase", await ev(`__f.G.phase`));
await ev(`__auto()`); await sleep(4000);
await ev(`${P}.__rec.length = 0; ${P}.__recOn = true`);
await sleep(+SEC * 1000);
await ev(`${P}.__recOn = false`);
const rec = await ev(`${P}.__rec`); const rafT = await ev(`${P}.__raf`);
const stat = await ev(`(() => { const s = ${P}.__pad.state; return { fps: s.stat.fps, gaps: s.stat.gaps.slice(), link: s.link.s, phase: __f.G.phase }; })()`);
const tapId = await ev(`(() => { const h = ${P}.__pad.hits.find(h => __f.core.rigs[0].blimps.some(b => b.id === h.id && !b.leaving)); if (!h) return null; ${P}.__pad.tap(h.id); return h.id; })()`); await sleep(400);
console.error("CHAM", tapId, await ev(`(() => { const b = __f.core.rigs[0].blimps.find(b => b.id === ${tapId}); return b ? (b.leaving ? "dang bay di" : "VAN CON") : "da no"; })()`));
console.error("KENH", JSON.stringify(await ev(`__f.pad.debug`)));
const bench = await ev(`${P}.__bench(150)`);
const errs = await ev(`(window.__errs||[]).length`).catch(() => 0);
{ const shot = await call("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 512, height: 384, scale: 2 } }); (await import("node:fs")).writeFileSync(`anh-${MOD}-${LAG}${LOST ? "-lac" : ""}.png`, Buffer.from(shot.data, "base64")); }
ws.close(); ch.kill();

// ---------------- phân tích
const CSS = 1 / 1.5, UPX = 1536 / 40 * CSS;   // canvas ×1,5 so với css · 1 đơn vị ≈ 25,6 px css
const dur = (rec.at(-1).t - rec[0].t) / 1000, iv = rec.slice(1).map((r, i) => r.t - rec[i].t);
const q = (a, p) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return +s[Math.min(s.length - 1, Math.floor(s.length * p))].toFixed(2); };
// sai lệch so với đường thẳng nối 2 khung bên cạnh (giật = điểm giữa lệch khỏi chuyển động đều)
function jitter(seq) { const e = []; for (let i = 1; i < seq.length - 1; i++) { const [t0, a] = seq[i - 1], [t1, b] = seq[i], [t2, c] = seq[i + 1]; if (t2 - t0 > 120) continue; e.push(Math.abs(b - (a + (c - a) * (t1 - t0) / (t2 - t0)))); } return e; }
const bx = [], by = [], cx = [], cy = []; const restY = [], sinks = []; let sinkN = 0; let lostUp = 0, lostUpMax = 0, lostN = 0, restN = 0;
const ids = new Set(rec.flatMap(r => r.b.map(b => b[0])));
for (const k of ids) { const s = rec.filter(r => r.b.some(b => b[0] === k)).map(r => { const b = r.b.find(b => b[0] === k); return [r.t, b[1] * CSS, b[2] * CSS]; });
  bx.push(...jitter(s.map(v => [v[0], v[1]]))); by.push(...jitter(s.map(v => [v[0], v[2]]))); }
const cids = new Set(rec.flatMap(r => r.c.map(c => c[4])));
for (const k of cids) {
  const s = rec.map(r => { const c = r.c.find(c => c[4] === k); return c ? [r.t, c[0] * UPX, c[1] * UPX, r.g[k]] : null; }).filter(Boolean);
  const tru = rec.map(r => r.truth && r.truth[k]).filter(v => v != null); if (tru.length && s.length) { const lowT = Math.min(...tru); const sink = Math.max(...s.map(v => lowT - v[2] / UPX)); sinks.push(sink); if (sink > 0.1) sinkN++; }
  const rest = s.filter(v => v[3] === 1); if (rest.length > 5) { restN++; cx.push(...jitter(rest.map(v => [v[0], v[1]]))); cy.push(...jitter(rest.map(v => [v[0], v[2]]))); }
  const lo = s.filter(v => v[3] === 2); if (lo.length > 2) { lostN++; restY.push(Math.min(...lo.map(v => v[2])) / UPX); let up = 0; for (let i = 1; i < lo.length; i++) { const d = lo[i][2] - lo[i - 1][2]; if (d > 0.5) { up++; lostUpMax = Math.max(lostUpMax, d); } } if (up) lostUp++; }
}
console.log(JSON.stringify({ mod: MOD, lag: +LAG, phase: stat.phase, link: stat.link, giay: +dur.toFixed(1), khung_ve: rec.length, fps_that: +(rec.length / dur).toFixed(1),
  raf_goc_ms: q(rafT.slice(1).map((t, i) => t - rafT[i]), .5), khoang_khung_ms: { p50: q(iv, .5), p95: q(iv, .95), max: q(iv, 1) }, tin_cach_ms: { p50: q(stat.gaps, .5), p95: q(stat.gaps, .95) },
  ve_ms_mot_khung: bench,
  khinh_khi_cau_giat_px: { so_qua: ids.size, ngang_p50: q(bx, .5), ngang_p95: q(bx, .95), doc_p50: q(by, .5), doc_p95: q(by, .95) },
  thung_tren_tau_giat_px: { so_thung: restN, ngang_p95: q(cx, .95), doc_p95: q(cy, .95), doc_max: q(cy, 1) },
  lun_qua_thuc_te: { so_thung: sinks.length, so_thung_lun_hon_0_1dv: sinkN, sau_nhat_don_vi: +Math.max(0, ...sinks).toFixed(2), p95: q(sinks, .95) },
  thung_lac: { so_thung: lostN, so_thung_nay_len: lostUp, nay_cao_nhat_px: +lostUpMax.toFixed(1), y_thap_nhat_don_vi: { p50: q(restY, .5), max: q(restY, 1) } } }));
process.exit(0);
