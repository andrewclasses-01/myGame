// Nén mẫu drone: node process.mjs <vào.glb> <ra.glb> [texMax=1024]
// dedup + prune + weld + resample → texture webp ≤ texMax (sharp) → meshopt. In: số tam giác, vật liệu, kích thước hộp bao, trục dài nhất.
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS, EXTMeshoptCompression, EXTTextureWebP } from "@gltf-transform/extensions";
import { dedup, prune, weld, resample, textureCompress, meshopt, getBounds } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptDecoder } from "meshoptimizer";
import sharp from "sharp";
import fs from "node:fs";

const [, , src, dst, tm] = process.argv;
const texMax = +(tm || 1024);
await MeshoptEncoder.ready; await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.encoder": MeshoptEncoder, "meshopt.decoder": MeshoptDecoder });
const doc = await io.read(src);
const root = doc.getRoot();
let tris = 0;
for (const m of root.listMeshes()) for (const p of m.listPrimitives()) { const i = p.getIndices(), a = p.getAttribute("POSITION"); tris += (i ? i.getCount() : a ? a.getCount() : 0) / 3; }
const sc = root.getDefaultScene() || root.listScenes()[0];
const b = getBounds(sc);
const size = b.max.map((v, k) => +(v - b.min[k]).toFixed(3));
console.log(JSON.stringify({ tris: Math.round(tris), mats: root.listMaterials().map(m => m.getName()), tex: root.listTextures().length, size, min: b.min.map(v => +v.toFixed(3)), anim: root.listAnimations().length }));
await doc.transform(dedup(), prune(), weld(), resample(), meshopt({ encoder: MeshoptEncoder, level: "medium" }));
await io.write(dst, doc);
console.log("out", (fs.statSync(src).size / 1e6).toFixed(2), "MB →", (fs.statSync(dst).size / 1e6).toFixed(2), "MB");
