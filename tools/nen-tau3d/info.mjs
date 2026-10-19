// node info.mjs <glb> — tóm tắt: tam giác, mesh/node, vật liệu (màu, texture), texture (cỡ, kiểu), hộp bao, hoạt ảnh
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { getBounds } from "@gltf-transform/functions";
import { MeshoptDecoder } from "meshoptimizer";
import fs from "node:fs";
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.decoder": MeshoptDecoder });
const f = process.argv[2];
const doc = await io.read(f);
const root = doc.getRoot();
let tris = 0, prims = 0;
for (const m of root.listMeshes()) for (const p of m.listPrimitives()) { prims++; const i = p.getIndices(), a = p.getAttribute("POSITION"); tris += (i ? i.getCount() : a ? a.getCount() : 0) / 3; }
const sc = root.getDefaultScene() || root.listScenes()[0];
const b = getBounds(sc);
const size = b.max.map((v, k) => +(v - b.min[k]).toFixed(3));
const texInfo = root.listTextures().map(t => { const s = t.getSize(); return `${t.getMimeType()} ${s ? s.join("x") : "?"} ${((t.getImage()?.byteLength || 0) / 1024).toFixed(0)}KB`; });
console.log(JSON.stringify({
  file: f.split(/[\\/]/).pop(), MB: +(fs.statSync(f).size / 1e6).toFixed(2), tris: Math.round(tris), prims, meshes: root.listMeshes().length, nodes: root.listNodes().length,
  size, min: b.min.map(v => +v.toFixed(3)), max: b.max.map(v => +v.toFixed(3)), anim: root.listAnimations().length,
  mats: root.listMaterials().map(m => `${m.getName()}|${m.getBaseColorFactor().map(v => +v.toFixed(2)).join(",")}|tex:${m.getBaseColorTexture() ? 1 : 0}|em:${m.getEmissiveTexture() ? 1 : 0}|${m.getAlphaMode()}`),
  tex: texInfo
}, null, 1));
