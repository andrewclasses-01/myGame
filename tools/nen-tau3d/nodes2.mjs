// Liệt kê node có mesh: tên node, vật liệu, số tam giác, hộp bao thế giới. node nodes2.mjs <glb>
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { getBounds } from "@gltf-transform/functions";
import { MeshoptDecoder } from "meshoptimizer";
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.decoder": MeshoptDecoder });
const doc = await io.read(process.argv[2]);
for (const n of doc.getRoot().listNodes()) {
  const m = n.getMesh(); if (!m) continue;
  const b = getBounds(n);
  const tris = m.listPrimitives().reduce((s, p) => s + (p.getIndices() ? p.getIndices().getCount() : p.getAttribute("POSITION").getCount()) / 3, 0);
  console.log(n.getName().padEnd(28), m.listPrimitives().map(p => p.getMaterial()?.getName()).join(",").padEnd(24), String(Math.round(tris)).padStart(6),
    "min", b.min.map(v => v.toFixed(2)).join(","), "max", b.max.map(v => v.toFixed(2)).join(","));
}
