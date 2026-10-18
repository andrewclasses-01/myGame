// Dò trục cánh quạt: lấy đỉnh ở lớp TRÊN CÙNG (y > y0 + frac·cao), gom k cụm theo (x, z) bằng k-means ⇒ in tâm + bán kính + dải y.
// node hubs.mjs <glb> <k> [frac=0.8]
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { MeshoptDecoder } from "meshoptimizer";
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.decoder": MeshoptDecoder });
const [, , file, kk, fr] = process.argv; const K = +kk || 4, frac = +(fr || 0.8);
const doc = await io.read(file); const P = [];
for (const n of doc.getRoot().listNodes()) {
  const m = n.getMesh(); if (!m) continue; const W = n.getWorldMatrix();
  for (const p of m.listPrimitives()) { const a = p.getAttribute("POSITION"); const v = [0, 0, 0];
    for (let i = 0; i < a.getCount(); i++) { a.getElement(i, v); const x = W[0] * v[0] + W[4] * v[1] + W[8] * v[2] + W[12], y = W[1] * v[0] + W[5] * v[1] + W[9] * v[2] + W[13], z = W[2] * v[0] + W[6] * v[1] + W[10] * v[2] + W[14]; P.push([x, y, z]); } }
}
let y0 = Infinity, y1 = -Infinity; P.forEach(p => { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
const top = P.filter(p => p[1] > y0 + frac * (y1 - y0));
let C = top.filter((_, i) => i % Math.max(1, Math.floor(top.length / K)) === 0).slice(0, K).map(p => [p[0], p[2]]);
for (let it = 0; it < 40; it++) { const S = C.map(() => [0, 0, 0]); top.forEach(p => { let b = 0, bd = 1e18; C.forEach((c, k) => { const d = (p[0] - c[0]) ** 2 + (p[2] - c[1]) ** 2; if (d < bd) { bd = d; b = k; } }); S[b][0] += p[0]; S[b][1] += p[2]; S[b][2]++; }); C = S.map((s, k) => s[2] ? [s[0] / s[2], s[1] / s[2]] : C[k]); }
const R = C.map(() => 0), Y = C.map(() => [Infinity, -Infinity]), N = C.map(() => 0);
top.forEach(p => { let b = 0, bd = 1e18; C.forEach((c, k) => { const d = (p[0] - c[0]) ** 2 + (p[2] - c[1]) ** 2; if (d < bd) { bd = d; b = k; } }); R[b] = Math.max(R[b], Math.sqrt(bd)); Y[b][0] = Math.min(Y[b][0], p[1]); Y[b][1] = Math.max(Y[b][1], p[1]); N[b]++; });
console.log(JSON.stringify({ y: [+y0.toFixed(3), +y1.toFixed(3)], top: top.length, hubs: C.map((c, k) => ({ x: +c[0].toFixed(3), z: +c[1].toFixed(3), r: +R[k].toFixed(3), y: Y[k].map(v => +v.toFixed(3)), n: N[k] })) }, null, 0));
