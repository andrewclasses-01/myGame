// Tinh chỉnh trục quạt: quanh mỗi điểm đoán (x, z) bán kính S, lấy đỉnh có y cao nhất (top 8 %) ⇒ tâm trục; in phân bố y theo vòng bán kính.
// node hubfix.mjs <glb> '[[x,z],...]' S
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { MeshoptDecoder } from "meshoptimizer";
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.decoder": MeshoptDecoder });
const [, , file, hj, ss] = process.argv; const H = JSON.parse(hj), S = +ss;
const doc = await io.read(file); const P = [];
for (const n of doc.getRoot().listNodes()) { const m = n.getMesh(); if (!m) continue; const W = n.getWorldMatrix();
  for (const p of m.listPrimitives()) { const a = p.getAttribute("POSITION"); const v = [0, 0, 0];
    for (let i = 0; i < a.getCount(); i++) { a.getElement(i, v); P.push([W[0] * v[0] + W[4] * v[1] + W[8] * v[2] + W[12], W[1] * v[0] + W[5] * v[1] + W[9] * v[2] + W[13], W[2] * v[0] + W[6] * v[1] + W[10] * v[2] + W[14]]); } } }
for (const [hx, hz] of H) {
  const near = P.filter(p => Math.hypot(p[0] - hx, p[2] - hz) < S).sort((a, b) => b[1] - a[1]);
  const t = near.slice(0, Math.max(5, Math.floor(near.length * 0.08)));
  const cx = t.reduce((s, p) => s + p[0], 0) / t.length, cz = t.reduce((s, p) => s + p[2], 0) / t.length;
  const rings = [0.1, 0.2, 0.35, 0.5, 0.7, 0.9, 1.1].map(r => { const q = P.filter(p => { const d = Math.hypot(p[0] - cx, p[2] - cz); return d < r * S * 2 && d >= (r - 0.1) * S * 2; }); return q.length ? `${r}:${Math.min(...q.map(p => p[1])).toFixed(2)}..${Math.max(...q.map(p => p[1])).toFixed(2)}(${q.length})` : `${r}:-`; });
  console.log(JSON.stringify({ guess: [hx, hz], hub: [+cx.toFixed(3), +cz.toFixed(3)], top: +near[0][1].toFixed(3), n: near.length }), rings.join(" "));
}
