// Bước 1 (riêng tiến trình — chung tiến trình với meshopt thì sharp lỗi "colourspace"): ảnh bề mặt ≤ texMax + webp. node tex.mjs <vào> <ra> [1024]
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS, EXTTextureWebP } from "@gltf-transform/extensions";
import sharp from "sharp";
const [, , src, dst, tm] = process.argv; const texMax = +(tm || 1024);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(src);
doc.createExtension(EXTTextureWebP).setRequired(true);
let n = 0;
for (const t of doc.getRoot().listTextures()) {
  const img = t.getImage(); if (!img) continue;
  const out = await sharp(Buffer.from(img)).resize(texMax, texMax, { fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  t.setImage(new Uint8Array(out)).setMimeType("image/webp"); n++;
}
await io.write(dst, doc); console.log("tex", n);
