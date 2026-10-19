// Bước 2: dedup + prune + weld + (simplify nếu quá maxTris) + meshopt. node mesh2.mjs <vào> <ra> [maxTris=0]
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune, weld, resample, simplify, meshopt, flatten, join } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptDecoder, MeshoptSimplifier } from "meshoptimizer";
import fs from "node:fs";
const [, , src, dst, mt] = process.argv; const maxTris = +(mt || 0);
await MeshoptEncoder.ready; await MeshoptDecoder.ready; await MeshoptSimplifier.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.encoder": MeshoptEncoder, "meshopt.decoder": MeshoptDecoder });
const doc = await io.read(src);
const tri = () => { let t = 0; for (const m of doc.getRoot().listMeshes()) for (const p of m.listPrimitives()) { const i = p.getIndices(), a = p.getAttribute("POSITION"); t += (i ? i.getCount() : a ? a.getCount() : 0) / 3; } return Math.round(t); };
const t0 = tri();
const steps = [dedup(), prune(), weld(), resample(), flatten(), join()];
if (maxTris && t0 > maxTris) steps.push(simplify({ simplifier: MeshoptSimplifier, ratio: maxTris / t0, error: 0.002, lockBorder: true }));
await doc.transform(...steps, prune(), meshopt({ encoder: MeshoptEncoder, level: "medium" }));
await io.write(dst, doc);
console.log("tris", t0, "→", tri(), "| prims", doc.getRoot().listMeshes().reduce((s, m) => s + m.listPrimitives().length, 0), "|", (fs.statSync(src).size / 1e6).toFixed(2), "MB →", (fs.statSync(dst).size / 1e6).toFixed(2), "MB");
