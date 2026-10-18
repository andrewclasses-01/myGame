// TÁCH CÁNH QUẠT ra node riêng "PROP_<k>" (gốc node = trục quạt) để game cho quay quanh trục Y.
// node split.mjs <vào> <ra> '<json hubs [{x, z, y, r}]>'  — toạ độ THẾ GIỚI của mẫu gốc; tam giác có cả 3 đỉnh cách trục (ngang) < r và cao ≥ y ⇒ vào quạt đó.
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { MeshoptDecoder } from "meshoptimizer";
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.decoder": MeshoptDecoder });
const [, , src, dst, hj] = process.argv; const HUBS = JSON.parse(hj);
const doc = await io.read(src), root = doc.getRoot(), scene = root.getDefaultScene() || root.listScenes()[0], buf = root.listBuffers()[0];
const mul = (W, v) => [W[0] * v[0] + W[4] * v[1] + W[8] * v[2] + W[12], W[1] * v[0] + W[5] * v[1] + W[9] * v[2] + W[13], W[2] * v[0] + W[6] * v[1] + W[10] * v[2] + W[14]];
const rot = (W, v) => { const x = W[0] * v[0] + W[4] * v[1] + W[8] * v[2], y = W[1] * v[0] + W[5] * v[1] + W[9] * v[2], z = W[2] * v[0] + W[6] * v[1] + W[10] * v[2], l = Math.hypot(x, y, z) || 1; return [x / l, y / l, z / l]; };
const got = HUBS.map(() => []);   // [{prim, W, tris:[[a,b,c]...]}]
for (const node of root.listNodes()) {
  const mesh = node.getMesh(); if (!mesh) continue; const W = node.getWorldMatrix();
  for (const prim of mesh.listPrimitives()) {
    const pos = prim.getAttribute("POSITION"), idx = prim.getIndices(); if (!idx || prim.getMode() !== 4) continue;
    const P = []; const v = [0, 0, 0]; for (let i = 0; i < pos.getCount(); i++) { pos.getElement(i, v); P.push(mul(W, v)); }
    const ix = idx.getArray(), keep = [], per = HUBS.map(() => []);
    for (let t = 0; t < ix.length; t += 3) {
      const tri = [ix[t], ix[t + 1], ix[t + 2]];
      const h = HUBS.findIndex(H => tri.every(k => Math.hypot(P[k][0] - H.x, P[k][2] - H.z) < H.r && P[k][1] >= H.y));
      if (h < 0) keep.push(...tri); else per[h].push(tri);
    }
    if (per.every(a => !a.length)) continue;
    idx.setArray(new (ix.constructor)(keep));
    per.forEach((tris, h) => { if (tris.length) got[h].push({ prim, W, P, tris }); });
  }
}
got.forEach((parts, h) => {
  const H = HUBS[h], node = doc.createNode("PROP_" + h).setTranslation([H.x, H.y, H.z]), mesh = doc.createMesh("PROP_" + h); node.setMesh(mesh); scene.addChild(node);
  let n = 0;
  for (const { prim, W, P, tris } of parts) {
    const used = [...new Set(tris.flat())], map = new Map(used.map((k, i) => [k, i]));
    const np = doc.createPrimitive().setMaterial(prim.getMaterial());
    for (const sem of prim.listSemantics()) {
      const a = prim.getAttribute(sem), size = a.getElementSize(), arr = new Float32Array(used.length * size), e = new Array(size).fill(0);
      used.forEach((k, i) => { a.getElement(k, e); let o = e;
        if (sem === "POSITION") { o = P[k]; o = [o[0] - H.x, o[1] - H.y, o[2] - H.z]; } else if (sem === "NORMAL") o = rot(W, e);
        for (let c = 0; c < size; c++) arr[i * size + c] = o[c]; });
      np.setAttribute(sem, doc.createAccessor().setType(a.getType()).setArray(arr).setBuffer(buf));
    }
    np.setIndices(doc.createAccessor().setType("SCALAR").setArray(new Uint32Array(tris.flat().map(k => map.get(k)))).setBuffer(buf));
    mesh.addPrimitive(np); n += tris.length;
  }
  console.log("PROP_" + h, n, "tris");
});
await io.write(dst, doc);
