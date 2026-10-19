// Bước 1 (tiến trình riêng — sharp chung tiến trình với meshopt hay lỗi): ảnh bề mặt → webp.
// Ảnh MÀU (baseColor/emissive) ≤ texMax, ảnh phụ (normal/roughness/occlusion…) ≤ texMax/2.
// node tex2.mjs <vào.glb> <ra.glb> [1024]
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS, EXTTextureWebP } from "@gltf-transform/extensions";
import { MeshoptDecoder, MeshoptEncoder } from "meshoptimizer";
import sharp from "sharp";
await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const [, , src, dst, tm] = process.argv; const texMax = +(tm || 1024);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.decoder": MeshoptDecoder, "meshopt.encoder": MeshoptEncoder });
const doc = await io.read(src);
doc.createExtension(EXTTextureWebP).setRequired(true);
const color = new Set();
for (const m of doc.getRoot().listMaterials()) { if (m.getBaseColorTexture()) color.add(m.getBaseColorTexture()); if (m.getEmissiveTexture()) color.add(m.getEmissiveTexture()); }
let n = 0;
for (const t of doc.getRoot().listTextures()) {
  const img = t.getImage(); if (!img) continue;
  const lim = color.has(t) ? texMax : texMax / 2;
  const out = await sharp(Buffer.from(img)).resize(lim, lim, { fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  t.setImage(new Uint8Array(out)).setMimeType("image/webp"); n++;
}
await io.write(dst, doc); console.log("tex", n);
