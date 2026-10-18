// Liệt kê node có mesh: tên, tên mesh, số tam giác, tâm + cỡ hộp bao (toạ độ thế giới) — để dò cánh quạt.
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { getBounds } from "@gltf-transform/functions";
import { MeshoptDecoder } from "meshoptimizer";
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.decoder": MeshoptDecoder });
const doc = await io.read(process.argv[2]);
const out = [];
for (const n of doc.getRoot().listNodes()) {
  const m = n.getMesh(); if (!m) continue;
  let tris = 0; for (const p of m.listPrimitives()) { const i = p.getIndices(), a = p.getAttribute("POSITION"); tris += (i ? i.getCount() : a.getCount()) / 3; }
  const b = getBounds(n), c = b.min.map((v, k) => +((v + b.max[k]) / 2).toFixed(3)), s = b.min.map((v, k) => +(b.max[k] - v).toFixed(3));
  out.push(`${n.getName()} | ${m.getName()} | ${Math.round(tris)} | c ${c} | s ${s}`);
}
console.log(out.length + " nodes"); console.log(out.slice(0, +(process.argv[3] || 60)).join("\n"));
