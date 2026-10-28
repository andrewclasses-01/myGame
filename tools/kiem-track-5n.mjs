// Kiểm hình đường RACING WORDS (mẫu 5n): node tools/kiem-track-5n.mjs [tên file track trong speed-run/core] — in LAP, khép vòng, đoạn thẳng dài nhất, khoảng cách 2 đoạn, dốc, trong / ngoài vòng.
const { buildTrack } = await import("file:///E:/LAP%20TRINH%20APP/myGame/speed-run/core/" + (process.argv[2] || "sr3d-track-5n.js"));
const t0 = performance.now(); const T = buildTrack(); const ms = performance.now() - t0;
console.log("LAP", T.LAP.toFixed(0), "TURN/2pi", (T.TURN / 2 / Math.PI).toFixed(4), "build ms", ms.toFixed(0), "minR", T.minR.toFixed(1));
// đoạn thẳng dài nhất (|kap| < 1/1000)
let run = 0, best = 0, at = 0; for (let s = 0; s < T.LAP; s++) { if (Math.abs(T.kapAt(s)) < 0.001) { run++; if (run > best) { best = run; at = s; } } else run = 0; }
console.log("doan thang dai nhat", best, "m tai", at);
let r2 = 0, b2 = 0; for (let s = 0; s < T.LAP; s++) { if (Math.abs(T.kapAt(s)) < 1/400) { r2++; b2 = Math.max(b2, r2); } else r2 = 0; }
console.log("doan R>400 dai nhat", b2);
// khoảng cách tối thiểu giữa 2 điểm cách nhau > 300 m dọc đường
let minSep = 1e9, ms2 = null; const P = []; for (let s = 0; s < T.LAP; s += 4) P.push([s, ...T.posAt(s)]);
for (let a = 0; a < P.length; a++) for (let b = a + 1; b < P.length; b++) { const ds = Math.min(P[b][0] - P[a][0], T.LAP - (P[b][0] - P[a][0])); if (ds < 300) continue; const d = Math.hypot(P[a][1] - P[b][1], P[a][2] - P[b][2]); if (d < minSep) { minSep = d; ms2 = [P[a][0], P[b][0]]; } }
console.log("min sep", minSep.toFixed(1), ms2);
console.log("ramps", T.rampSites.map(r => r.s.toFixed(0) + "(" + r.room.toFixed(0) + ")").join(" "));
console.log("twists", T.twistSites.map(r => r.s.toFixed(0) + "(" + r.room.toFixed(0) + ")").join(" "));
console.log("edges", T.straights.map(e => e.i + ":" + (e.s1 - e.s0).toFixed(0)).join(" "));
const W = T.dist; let inn = 0; for (const v of W.ins) if (v) inn++; console.log("dist", W.w, "x", W.h, "inside cells", inn, "inside(center)", T.insideAt(1300, 100).toFixed(2), "outside", T.insideAt(-200, 0));
// phía phải tim đường là trong vòng?
let ok = 0, tot = 0; for (let s = 0; s < T.LAP; s += 50) { const p = T.worldAt(s, 40); tot++; if (T.insideAt(p[0], p[1]) > 0.5) ok++; } console.log("phai = trong vong", ok + "/" + tot);
// R nhỏ nhất trên các cạnh lượn (bỏ 8 m sát cung)
let mk = 0, mks = 0; for (const e of T.straights) for (let s = e.s0 + 8; s < e.s1 - 8; s++) { const k = Math.abs(T.kapAt(s)); if (k > mk) { mk = k; mks = s; } }
console.log("canh luon: R nho nhat", (1 / mk).toFixed(0), "m tai", mks);
