// TÁCH CÁNH QUẠT theo MẢNH LIỀN (bản 2, 19/10/2026 — bản 1 cắt theo bán kính sót đầu cánh dài của Mavic).
// node split2.mjs <vào> <ra> '<json hubs [{x, z, y}]>' [maxR=2.4] [maxH=0.35] [maxTris=900] [dry]
//   Mảnh liền = tam giác nối nhau qua đỉnh chung (đỉnh trùng toạ độ coi như một). Mảnh là CÁNH QUẠT khi: dẹt (cao ≤ maxH), không quá lớn (≤ maxTris tam giác),
//   tâm cách trục gần nhất ≤ maxR theo phương ngang, đáy mảnh ≥ y trục − 0,3. Gán vào trục GẦN NHẤT ⇒ node "PROP_<k>" (gốc node = trục, y = đáy thấp nhất của các mảnh).
//   "dry" ⇒ chỉ in danh sách mảnh, không ghi file.
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { MeshoptDecoder } from "meshoptimizer";
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.decoder": MeshoptDecoder });
const [, , src, dst, hj, mr, mh, mt, dry] = process.argv;
const HUBS = JSON.parse(hj), MAXR = +(mr || 2.4), MAXH = +(mh || 0.35), MAXT = +(mt || 900);
const doc = await io.read(src), root = doc.getRoot(), scene = root.getDefaultScene() || root.listScenes()[0], buf = root.listBuffers()[0];
const mul = (W, v) => [W[0] * v[0] + W[4] * v[1] + W[8] * v[2] + W[12], W[1] * v[0] + W[5] * v[1] + W[9] * v[2] + W[13], W[2] * v[0] + W[6] * v[1] + W[10] * v[2] + W[14]];
const rot = (W, v) => { const x = W[0] * v[0] + W[4] * v[1] + W[8] * v[2], y = W[1] * v[0] + W[5] * v[1] + W[9] * v[2], z = W[2] * v[0] + W[6] * v[1] + W[10] * v[2], l = Math.hypot(x, y, z) || 1; return [x / l, y / l, z / l]; };
const got = HUBS.map(() => []);
for (const node of root.listNodes()) {
  const mesh = node.getMesh(); if (!mesh) continue; const W = node.getWorldMatrix();
  for (const prim of mesh.listPrimitives()) {
    const pos = prim.getAttribute("POSITION"), idx = prim.getIndices(); if (!idx || prim.getMode() !== 4) continue;
    const P = []; const v = [0, 0, 0]; for (let i = 0; i < pos.getCount(); i++) { pos.getElement(i, v); P.push(mul(W, v)); }
    // union-find trên đỉnh, đỉnh trùng toạ độ (làm tròn 1e-4) gộp chung
    const par = P.map((_, i) => i), f = i => { while (par[i] !== i) { par[i] = par[par[i]]; i = par[i]; } return i; }, u = (a, b) => { a = f(a); b = f(b); if (a !== b) par[a] = b; };
    const key = new Map(); P.forEach((p, i) => { const k = p.map(x => Math.round(x * 1e4)).join(","); if (key.has(k)) u(i, key.get(k)); else key.set(k, i); });
    const ix = idx.getArray(); for (let t = 0; t < ix.length; t += 3) { u(ix[t], ix[t + 1]); u(ix[t], ix[t + 2]); }
    const comp = new Map();
    for (let t = 0; t < ix.length; t += 3) { const r = f(ix[t]); if (!comp.has(r)) comp.set(r, { tris: [], mn: [1e9, 1e9, 1e9], mx: [-1e9, -1e9, -1e9] }); const c = comp.get(r); c.tris.push([ix[t], ix[t + 1], ix[t + 2]]);
      for (const k of [ix[t], ix[t + 1], ix[t + 2]]) for (let a = 0; a < 3; a++) { c.mn[a] = Math.min(c.mn[a], P[k][a]); c.mx[a] = Math.max(c.mx[a], P[k][a]); } }
    const moved = new Set(), per = HUBS.map(() => []);
    for (const [r, c] of comp) {
      const cx = (c.mn[0] + c.mx[0]) / 2, cz = (c.mn[2] + c.mx[2]) / 2, h = c.mx[1] - c.mn[1];
      let hb = -1, hd = 1e9; HUBS.forEach((H, k) => { const d = Math.hypot(cx - H.x, cz - H.z); if (d < hd) { hd = d; hb = k; } });
      const ok = h <= MAXH && c.tris.length <= MAXT && hd <= MAXR && c.mn[1] >= HUBS[hb].y - 0.3;
      if (dry && (ok || hd < MAXR)) console.log(ok ? "PROP" : "    ", "hub", hb, "tris", c.tris.length, "h", h.toFixed(2), "d", hd.toFixed(2), "y", c.mn[1].toFixed(2), c.mx[1].toFixed(2), "w", (c.mx[0] - c.mn[0]).toFixed(2), (c.mx[2] - c.mn[2]).toFixed(2));
      if (ok) { per[hb].push(...c.tris); moved.add(r); }
    }
    if (dry) continue;
    const keep = []; for (let t = 0; t < ix.length; t += 3) if (!moved.has(f(ix[t]))) keep.push(ix[t], ix[t + 1], ix[t + 2]);
    idx.setArray(new Uint32Array(keep));
    per.forEach((tris, h) => { if (tris.length) got[h].push({ prim, W, P, tris }); });
  }
}
if (dry) process.exit(0);
got.forEach((parts, h) => {
  const H = HUBS[h]; let y0 = 1e9; parts.forEach(({ P, tris }) => tris.flat().forEach(k => { y0 = Math.min(y0, P[k][1]); }));
  const node = doc.createNode("PROP_" + h).setTranslation([H.x, y0, H.z]), mesh = doc.createMesh("PROP_" + h); node.setMesh(mesh); scene.addChild(node);
  let n = 0;
  for (const { prim, W, P, tris } of parts) {
    const used = [...new Set(tris.flat())], map = new Map(used.map((k, i) => [k, i]));
    const np = doc.createPrimitive().setMaterial(prim.getMaterial());
    for (const sem of prim.listSemantics()) {
      const a = prim.getAttribute(sem), size = a.getElementSize(), arr = new Float32Array(used.length * size), e = new Array(size).fill(0);
      used.forEach((k, i) => { a.getElement(k, e); let o = e;
        if (sem === "POSITION") o = [P[k][0] - H.x, P[k][1] - y0, P[k][2] - H.z]; else if (sem === "NORMAL") o = rot(W, e);
        for (let c = 0; c < size; c++) arr[i * size + c] = o[c]; });
      np.setAttribute(sem, doc.createAccessor().setType(a.getType()).setArray(arr).setBuffer(buf));
    }
    np.setIndices(doc.createAccessor().setType("SCALAR").setArray(new Uint32Array(tris.flat().map(k => map.get(k)))).setBuffer(buf));
    mesh.addPrimitive(np); n += tris.length;
  }
  console.log("PROP_" + h, n, "tris");
});
await io.write(dst, doc);
