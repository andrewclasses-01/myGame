// CON VẬT — bản 1i (29/9/2026): thêm createSignCharger — thỉnh thoảng một con vật to (bò tót, voi, ngựa, lạc đà, sư tử)
// từ sau đồi chữ Hollywood lao xuống HÚC ĐỔ một chữ, đứng nhìn rồi quay về.
// Bản 1f:
// • 8 loài: lạc đà, ngựa, sói đồng cỏ + (1f) sư tử, bò, lợn, voi, gà (đi 2 chân). Có khi đi cả đàn nhỏ.
// • Gò đồi dựng lại như địa hình thật: lưới cao độ nhiễu nhiều lớp, sống đồi lệch, sườn dốc lộ đá đỏ, đỉnh bạc màu,
//   vạt cỏ khô, đá sa thạch + bụi cây lác đác. Gò THẤP hơn (đỉnh ≈ 5) và gần hơn để không che chữ Hollywood phía sau.
// • Hành vi chung: từ nửa KHUẤT phía sau gò chạy lên đỉnh → đứng ngắm đoàn tàu, lắc lư vài giây →
//   quay đầu chạy khuất về phía xa (không đi ngang).
import * as THREE from "three";
import { makeNoise, mulberry, makeRockKit } from "./west-props-1i.js";

const SPECIES = {
  camel:    { body: [1.35, 0.62, 0.52], hump: 0.62, legUp: 0.85, legLo: 0.8, neck: 1.25, neckTilt: -0.7, head: 0.44, col: 0xc49a66, dark: 0x6a4a2c, pace: true, tail: "tuft", ears: 0.12, h0: 1.85, run: 3.4, sc: 1.25, herd: [1, 2] },
  horse:    { body: [1.15, 0.55, 0.42], legUp: 0.72, legLo: 0.72, neck: 0.85, neckTilt: -1.0, head: 0.58, col: 0x7a4a2a, dark: 0x1e140e, tail: "long", ears: 0.14, mane: true, h0: 1.55, run: 4.4, sc: 1.25, herd: [1, 3] },
  coyote:   { body: [0.62, 0.26, 0.22], legUp: 0.32, legLo: 0.3, neck: 0.3, neckTilt: -0.5, head: 0.3, col: 0xa08a6c, dark: 0x4a3c2c, tail: "bushy", ears: 0.12, light: true, h0: 0.66, run: 4.6, sc: 1.6, herd: [1, 2] },
  lion:     { body: [1.08, 0.34, 0.29], thick: 1.45, legUp: 0.5, legLo: 0.48, neck: 0.42, neckTilt: -0.35, head: 0.58, col: 0xc8964e, dark: 0x4e2e14, tail: "lion", ears: 0.1, lion: true, h0: 1.02, run: 4.8, sc: 1.35, herd: [1, 2] },
  cow:      { body: [1.25, 0.6, 0.52], legUp: 0.55, legLo: 0.55, neck: 0.5, neckTilt: 0.05, head: 0.62, col: 0xf1eee6, dark: 0x1b1a19, tail: "cow", ears: 0.13, cow: true, h0: 1.2, run: 3.5, sc: 1.3, herd: [1, 3] },
  pig:      { body: [0.8, 0.45, 0.42], legUp: 0.22, legLo: 0.2, neck: 0.18, neckTilt: 0.35, head: 0.46, col: 0xeaa29c, dark: 0xa45f5c, tail: "curl", ears: 0.16, pig: true, h0: 0.52, run: 3.3, sc: 1.55, herd: [2, 3] },
  elephant: { body: [1.85, 1.1, 0.95], legUp: 1.0, legLo: 0.95, thick: 2.0, neck: 0.35, neckTilt: 0.55, head: 1.0, col: 0x8b8680, dark: 0x4a4642, tail: "thin", ears: 0, elephant: true, h0: 2.35, run: 3.2, sc: 1.2, herd: [1, 2] },
  chicken:  { biped: true, run: 3.0, sc: 2.3, herd: [3, 5] },
};
const KINDS = Object.keys(SPECIES);

function patchTexture(seed) {
  const c = document.createElement("canvas"); c.width = 256; c.height = 128;
  const ctx = c.getContext("2d"), r = mulberry(seed);
  ctx.fillStyle = "#f1eee6"; ctx.fillRect(0, 0, 256, 128);
  ctx.fillStyle = "#1b1a19";
  for (let i = 0; i < 9; i++) {
    const x = r() * 256, y = 20 + r() * 88, rr = 12 + r() * 26;
    ctx.beginPath();
    for (let k = 0; k <= 14; k++) { const a = k / 14 * Math.PI * 2, q = rr * (0.7 + r() * 0.5); ctx.lineTo(x + Math.cos(a) * q * 1.3, y + Math.sin(a) * q); }
    ctx.fill();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function build(kind) {
  const S = SPECIES[kind];
  if (S.biped) return buildChicken();
  const skin = new THREE.MeshStandardMaterial({ color: S.col, roughness: 0.92 });
  const hide = S.cow ? new THREE.MeshStandardMaterial({ map: patchTexture(Math.random() * 1000 | 0), roughness: 0.9 }) : skin;
  const dark = new THREE.MeshStandardMaterial({ color: S.dark, roughness: 0.95 });
  const light = new THREE.MeshStandardMaterial({ color: new THREE.Color(S.col).lerp(new THREE.Color(0xf0e6d6), 0.45), roughness: 0.95 });
  const ivory = new THREE.MeshStandardMaterial({ color: 0xf2ead8, roughness: 0.5 });
  const pink = new THREE.MeshStandardMaterial({ color: 0xe6a0a0, roughness: 0.8 });
  const g = new THREE.Group();
  const add = (geo, mat, parent, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m; };
  const [bl, bh, bw] = S.body, th = S.thick || 1;
  const body = new THREE.Group(); body.position.y = S.h0; g.add(body);
  // thân: ngực + bụng + mông nối liền, bụng sáng màu
  add(new THREE.SphereGeometry(1, 28, 18), hide, body).scale.set(bl, bh, bw);
  add(new THREE.SphereGeometry(1, 22, 16), hide, body, bl * 0.55, bh * 0.08, 0).scale.set(bl * 0.45, bh * 1.02, bw * 1.02);
  add(new THREE.SphereGeometry(1, 22, 16), hide, body, -bl * 0.55, bh * 0.1, 0).scale.set(bl * 0.45, bh * 1.0, bw * 1.04);
  if (!S.cow && !S.elephant) add(new THREE.SphereGeometry(1, 20, 12), light, body, 0, -bh * 0.35, 0).scale.set(bl * 0.8, bh * 0.6, bw * 0.85);
  if (S.hump) add(new THREE.SphereGeometry(1, 22, 16), skin, body, -0.05, bh * 0.75, 0).scale.set(S.hump * 0.95, S.hump * 0.85, bw * 0.8);
  if (S.cow) add(new THREE.SphereGeometry(1, 14, 10), pink, body, -bl * 0.45, -bh * 0.78, 0).scale.set(0.2, 0.14, 0.18);   // bầu vú
  // cổ (xoay được theo phương đứng để ngoái nhìn) + đầu
  const neck = new THREE.Group(); neck.rotation.order = "YZX";
  neck.position.set(bl * 0.82, bh * 0.35, 0); neck.rotation.z = -(Math.PI / 2 + S.neckTilt); body.add(neck);
  add(new THREE.CylinderGeometry(bw * 0.38 * th * (S.pig ? 1.5 : 1), bw * 0.55 * (S.pig ? 1.4 : 1), S.neck, 14), skin, neck, 0, S.neck / 2, 0);
  if (S.mane) { const mane = add(new THREE.BoxGeometry(0.06, S.neck * 0.95, 0.09), dark, neck, -bw * 0.32, S.neck / 2, 0); mane.rotation.z = 0.05; }
  const head = new THREE.Group(); head.position.y = S.neck; neck.add(head);
  const hd = new THREE.Group(); hd.rotation.z = (Math.PI / 2 + S.neckTilt) - (S.elephant ? 0 : 0.25); head.add(hd);
  const H = S.head, extra = {};
  if (S.elephant) {
    add(new THREE.SphereGeometry(1, 24, 18), skin, hd, H * 0.2, H * 0.1, 0).scale.set(H * 0.55, H * 0.6, H * 0.5);
    // vòi: chuỗi đốt thon dần, uốn cong được
    extra.trunk = [];
    let seg = new THREE.Group(); seg.position.set(H * 0.62, -H * 0.1, 0); hd.add(seg);
    for (let i = 0; i < 8; i++) {
      const r0 = H * (0.2 - i * 0.017), len = H * 0.22;
      add(new THREE.CylinderGeometry(r0 * 0.9, r0, len, 12), skin, seg, 0, -len / 2, 0);
      const nx = new THREE.Group(); nx.position.y = -len; seg.add(nx);
      seg.rotation.z = i === 0 ? -0.35 : 0.1; extra.trunk.push(seg); seg = nx;
    }
    // tai to phe phẩy + ngà
    extra.ears = [];
    const earMat = skin.clone(); earMat.side = THREE.DoubleSide;
    for (const z of [-1, 1]) {
      const ep = new THREE.Group(); ep.position.set(0, H * 0.15, z * H * 0.42); hd.add(ep);
      const ear = add(new THREE.CircleGeometry(H * 0.62, 20), earMat, ep, -H * 0.3, -H * 0.1, 0); ear.scale.set(0.85, 1.1, 1);
      ep.rotation.y = z * 0.35; extra.ears.push(ep);
      const tusk = add(new THREE.ConeGeometry(H * 0.06, H * 0.55, 10), ivory, hd, H * 0.62, -H * 0.38, z * H * 0.18);
      tusk.rotation.z = -Math.PI / 2 - 0.5;
    }
    for (const z of [-1, 1]) add(new THREE.SphereGeometry(H * 0.045, 10, 8), dark, hd, H * 0.55, H * 0.22, z * H * 0.34);
  } else {
    add(new THREE.SphereGeometry(1, 20, 14), skin, hd, H * 0.25, 0, 0).scale.set(H * 0.42, H * 0.34, H * 0.3);
    const muzzleMat = S.light || S.cow ? light : skin;
    if (S.lion) add(new THREE.SphereGeometry(1, 18, 12), light, hd, H * 0.58, -H * 0.1, 0).scale.set(H * 0.3, H * 0.24, H * 0.26);   // mõm sư tử ngắn, bè
    else add(new THREE.SphereGeometry(1, 18, 12), muzzleMat, hd, H * 0.72, -H * 0.08, 0).scale.set(H * 0.38, H * (S.pig ? 0.26 : 0.2), H * (S.pig ? 0.26 : 0.2));
    if (S.pig) { const sn = add(new THREE.CylinderGeometry(H * 0.13, H * 0.14, H * 0.1, 16), pink, hd, H * 1.1, -H * 0.08, 0); sn.rotation.z = Math.PI / 2; }
    else add(new THREE.SphereGeometry(H * 0.07, 10, 8), dark, hd, S.lion ? H * 0.86 : H * 1.06, -H * 0.06, 0);   // mũi/mõm
    for (const z of [-1, 1]) {
      add(new THREE.SphereGeometry(H * 0.05, 10, 8), dark, hd, H * 0.42, H * 0.12, z * H * 0.24);   // mắt
      const ear = add(new THREE.ConeGeometry(S.ears * 0.35, S.ears, 8), skin, hd, H * 0.08, H * 0.32, z * H * 0.17);
      ear.rotation.z = kind === "camel" ? 0.9 : S.pig ? -1.3 : S.cow ? 1.4 : 0.25; ear.rotation.x = z * (S.cow ? 1.2 : 0.25);
      if (S.pig) ear.scale.set(1.6, 1, 0.5);
      if (S.cow) { const horn = add(new THREE.ConeGeometry(0.035, 0.2, 8), ivory, hd, H * 0.12, H * 0.36, z * H * 0.12); horn.rotation.x = z * -0.9; }
    }
    if (S.mane) { const fl = add(new THREE.BoxGeometry(H * 0.3, 0.08, 0.1), dark, hd, H * 0.15, H * 0.33, 0); fl.rotation.z = -0.3; }
    if (S.lion) {   // bờm sư tử: vòng búi lông sẫm quanh đầu + cổ
      for (let i = 0; i < 16; i++) {
        const a = i / 16 * Math.PI * 2;
        add(new THREE.SphereGeometry(H * 0.26, 12, 10), dark, hd, -H * 0.02 + (i % 2) * 0.04, Math.cos(a) * H * 0.36, Math.sin(a) * H * 0.34).scale.set(0.9, 1.1, 1);
      }
      for (let i = 0; i < 6; i++) add(new THREE.SphereGeometry(bw * 0.52, 12, 10), dark, neck, -bw * 0.1, S.neck * (0.1 + i * 0.16), (i % 2 ? 1 : -1) * 0.05);
    }
  }
  // đuôi
  const tail = new THREE.Group(); tail.position.set(-bl * 0.98, bh * 0.35, 0); body.add(tail);
  if (S.tail === "long") { add(new THREE.CylinderGeometry(0.07, 0.14, 0.9, 10), dark, tail, 0, -0.45, 0); tail.rotation.z = -0.35; }
  else if (S.tail === "bushy") { add(new THREE.SphereGeometry(1, 14, 10), skin, tail, -0.18, -0.18, 0).scale.set(0.24, 0.08, 0.08); add(new THREE.SphereGeometry(0.06, 10, 8), dark, tail, -0.42, -0.26, 0); tail.rotation.z = 0.35; }
  else if (S.tail === "lion" || S.tail === "cow") { add(new THREE.CylinderGeometry(0.025, 0.035, 0.85, 8), skin, tail, 0, -0.42, 0); add(new THREE.SphereGeometry(0.075, 10, 8), dark, tail, 0, -0.86, 0).scale.set(1, 1.6, 1); tail.rotation.z = S.lion ? -0.6 : -0.12; }
  else if (S.tail === "curl") { const c = add(new THREE.TorusGeometry(0.07, 0.022, 6, 14, Math.PI * 1.7), skin, tail, -0.05, 0.02, 0); c.rotation.y = Math.PI / 2; }
  else if (S.tail === "thin") { add(new THREE.CylinderGeometry(0.03, 0.05, 0.9, 8), skin, tail, 0, -0.45, 0); add(new THREE.SphereGeometry(0.06, 8, 6), dark, tail, 0, -0.92, 0); tail.rotation.z = -0.1; }
  else { add(new THREE.CylinderGeometry(0.035, 0.05, 0.6, 8), skin, tail, 0, -0.3, 0); add(new THREE.SphereGeometry(0.08, 10, 8), dark, tail, 0, -0.62, 0); tail.rotation.z = -0.2; }
  // 4 chân 3 đoạn
  const legs = [];
  const lx = bl * 0.62, lz = bw * 0.55;
  for (const [x, z, front] of [[lx, lz, 1], [lx, -lz, 1], [-lx, lz, 0], [-lx, -lz, 0]]) {
    add(new THREE.SphereGeometry(1, 16, 12), hide, body, x * 0.92, -bh * 0.2, z * 0.8).scale.set(bh * 0.42, bh * 0.62, bw * 0.42);
    const hip = new THREE.Group(); hip.position.set(x, -bh * 0.35, z); body.add(hip);
    add(new THREE.CylinderGeometry(bh * 0.3 * th * 0.8, bh * 0.16 * th, S.legUp, 14), skin, hip, 0, -S.legUp / 2, 0);
    const knee = new THREE.Group(); knee.position.y = -S.legUp; hip.add(knee);
    add(new THREE.SphereGeometry(bh * 0.17 * th * 0.8, 12, 10), skin, knee);
    add(new THREE.CylinderGeometry(bh * 0.13 * th, bh * 0.1 * th * 1.05, S.legLo, 12), skin, knee, 0, -S.legLo / 2, 0);
    const hoof = add(new THREE.CylinderGeometry(bh * 0.12 * th, bh * 0.15 * th, S.legLo * 0.1, 12), S.elephant ? light : dark, knee, 0.01, -S.legLo, 0);
    if (kind === "camel") hoof.scale.set(1.8, 0.6, 1.5);
    legs.push({ hip, knee, front, side: z > 0 ? 1 : 0 });
  }
  g.traverse(o => { if (o.isMesh) o.receiveShadow = true; });
  return { g, body, neck, head, tail, legs, S, kind, extra };
}

// gà: đi 2 chân, gật đầu khi chạy, đuôi vểnh
function buildChicken() {
  const S = { ...SPECIES.chicken, h0: 0.36, neckTilt: -0.9 };
  const pal = [[0xf4efe4, 0xd8cfbf], [0xa0522d, 0x5a2a12], [0x2b2622, 0x5a3a20], [0xe0a050, 0xa8642a]][Math.floor(Math.random() * 4)];
  const feather = new THREE.MeshStandardMaterial({ color: pal[0], roughness: 0.95 });
  const feather2 = new THREE.MeshStandardMaterial({ color: pal[1], roughness: 0.95 });
  const red = new THREE.MeshStandardMaterial({ color: 0xc81e1e, roughness: 0.7 });
  const yellow = new THREE.MeshStandardMaterial({ color: 0xe8b23a, roughness: 0.7 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });
  const g = new THREE.Group();
  const add = (geo, mat, parent, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m; };
  const body = new THREE.Group(); body.position.y = S.h0; g.add(body);
  add(new THREE.SphereGeometry(1, 20, 14), feather, body).scale.set(0.2, 0.15, 0.13);
  add(new THREE.SphereGeometry(1, 16, 12), feather2, body, -0.02, 0.01, 0).scale.set(0.15, 0.1, 0.14);   // cánh
  const tail = new THREE.Group(); tail.position.set(-0.16, 0.06, 0); body.add(tail);
  for (let i = 0; i < 4; i++) { const f = add(new THREE.SphereGeometry(1, 10, 8), i % 2 ? feather2 : feather, tail, -0.03, 0.06 + i * 0.015, 0); f.scale.set(0.05, 0.13, 0.03); f.rotation.z = 0.5 + i * 0.25; }
  const neck = new THREE.Group(); neck.rotation.order = "YZX"; neck.position.set(0.13, 0.08, 0); neck.rotation.z = -0.35; body.add(neck);
  add(new THREE.CylinderGeometry(0.045, 0.065, 0.14, 10), feather, neck, 0, 0.07, 0);
  const head = new THREE.Group(); head.position.y = 0.15; neck.add(head);
  add(new THREE.SphereGeometry(0.06, 14, 10), feather, head);
  const beak = add(new THREE.ConeGeometry(0.018, 0.06, 8), yellow, head, 0.07, -0.01, 0); beak.rotation.z = -Math.PI / 2;
  for (let i = 0; i < 3; i++) add(new THREE.SphereGeometry(0.02, 8, 6), red, head, i * 0.022 - 0.01, 0.06 - Math.abs(i - 1) * 0.008, 0);   // mào
  add(new THREE.SphereGeometry(0.018, 8, 6), red, head, 0.05, -0.05, 0).scale.set(0.7, 1.4, 0.6);   // yếm
  for (const z of [-1, 1]) add(new THREE.SphereGeometry(0.009, 6, 4), dark, head, 0.035, 0.015, z * 0.045);
  const legs = [];
  for (const z of [-0.05, 0.05]) {
    const hip = new THREE.Group(); hip.position.set(0.01, -0.1, z); body.add(hip);
    add(new THREE.CylinderGeometry(0.035, 0.02, 0.12, 8), feather2, hip, 0, -0.06, 0);
    const knee = new THREE.Group(); knee.position.y = -0.12; hip.add(knee);
    add(new THREE.CylinderGeometry(0.009, 0.009, 0.14, 6), yellow, knee, 0, -0.07, 0);
    for (const a of [-0.5, 0, 0.5]) { const toe = add(new THREE.CylinderGeometry(0.006, 0.006, 0.06, 5), yellow, knee, 0.025, -0.14, a * 0.03); toe.rotation.set(a, 0, -Math.PI / 2); }
    legs.push({ hip, knee, front: 1, side: z > 0 ? 1 : 0 });
  }
  return { g, body, neck, head, tail, legs, S, kind: "chicken", extra: {} };
}

// ------------------------------------------------------------ gò đồi địa hình thật
const Y0 = -3.2, MZ = -72, MW = 72, MD = 54;
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function makeMound(seed, hillMap, rockKit) {
  const N = makeNoise(seed), r = mulberry(seed);
  const crest = 1 + r() * 2, H = 7.4 + r() * 1.2, skew = (r() - 0.5) * 0.35, bumpX = (r() - 0.5) * 14;
  const shape = (lx, lz) => {
    const ax = Math.abs(lx - bumpX * smooth(-20, 20, lz) + lz * skew) / (MW / 2);
    const hx = 1 - smooth(0.2, 1.0, ax);
    const dz = lz - crest;
    const hz = dz > 0 ? 1 - smooth(0, 1, dz / 24) : 1 - smooth(0, 1, -dz / 19);
    return hx * hz;
  };
  const h = (lx, lz) => {
    const b = shape(lx, lz);
    const n = N(lx * 0.05, lz * 0.05) * 0.5 + N(lx * 0.13 + 7, lz * 0.13) * 0.25 + N(lx * 0.35, lz * 0.35 + 3) * 0.08 + N(lx * 0.9 + 1, lz * 0.9) * 0.025;
    let y = H * Math.pow(b, 1.2) * (1 + n * 0.4) + n * 1.4 * b;
    // gờ đá phân lớp trên sườn dốc
    const ledge = Math.max(0, N(lx * 0.07 + 11, lz * 0.07) - 0.12) * 3;
    y += (Math.round(y * 1.2) / 1.2 - y) * Math.min(1, ledge) * 0.6;
    return Y0 + y;
  };
  const NX = 110, NZ = 80;
  const geo = new THREE.PlaneGeometry(MW, MD, NX, NZ); geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, h(p.getX(i), p.getZ(i)));
  geo.computeVertexNormals();
  const nr = geo.attributes.normal, col = new Float32Array(p.count * 3), c = new THREE.Color();
  // màu đỉnh = sắc nhân lên vân đất (cùng vân với mặt đất gần) ⇒ gò hoà vào cảnh, không bệt màu
  const cSand = new THREE.Color(0xf2cfa8), cRock = new THREE.Color(0xd08658), cDeep = new THREE.Color(0xa85e38), cTop = new THREE.Color(0xffe4c4), cScrub = new THREE.Color(0xbdb46e);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), ny = nr.getY(i);
    const steep = smooth(0.95, 0.72, ny), top = smooth(H * 0.55, H, y - Y0);
    c.copy(cSand).lerp(cTop, top * 0.6).lerp(cRock, steep * 0.85);
    const band = 0.5 + 0.5 * Math.sin((y - Y0) * 3.1 + N(x * 0.2, z * 0.2) * 2);
    c.lerp(cDeep, steep * band * 0.45);
    const sc = smooth(0.15, 0.45, N(x * 0.11 + 30, z * 0.11)) * (1 - steep) * (1 - top * 0.6);
    c.lerp(cScrub, sc * 0.55);
    c.multiplyScalar(0.92 + N(x * 1.3, z * 1.3) * 0.12);
    col.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, map: hillMap, roughness: 1 });
  const g = new THREE.Group();
  const m = new THREE.Mesh(geo, mat); m.receiveShadow = true; g.add(m);
  // đá lộ trên sườn + bụi cây khô lác đác
  let guard = 0;
  for (let k = 0; k < 14 && guard++ < 200; k++) {
    const lx = (r() - 0.5) * MW * 0.8, lz = (r() - 0.35) * MD * 0.7, b = shape(lx, lz);
    if (b < 0.12) { k--; continue; }
    const rock = new THREE.Mesh(rockKit.protos[k % rockKit.protos.length], rockKit.mat);
    const s = 0.5 + r() * 1.5; rock.scale.set(s * (1 + r()), s, s * (0.8 + r() * 0.6)); rock.rotation.y = r() * 6;
    rock.position.set(lx, h(lx, lz) - 0.15 * s, lz); g.add(rock);
  }
  const bushGeo = new THREE.IcosahedronGeometry(1, 1), bushMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true });
  const nb = 46, bushes = new THREE.InstancedMesh(bushGeo, bushMat, nb), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s3 = new THREE.Vector3();
  for (let k = 0; k < nb; k++) {
    const lx = (r() - 0.5) * MW * 0.85, lz = (r() - 0.4) * MD * 0.8;
    const s = 0.35 + r() * 0.6;
    m4.compose(v.set(lx, h(lx, lz) + s * 0.25, lz), q.setFromEuler(new THREE.Euler(0, r() * 6, 0)), s3.set(s * 1.3, s * 0.7, s));
    bushes.setMatrixAt(k, m4); bushes.setColorAt(k, new THREE.Color().setHSL(0.14 + r() * 0.05, 0.3, 0.2 + r() * 0.12));
  }
  g.add(bushes);
  return { g, h, shape, crest };
}

export function createFarAnimals(scene, hillMat) {
  const hillMap = hillMat.map.clone(); hillMap.repeat.set(7, 5); hillMap.needsUpdate = true;
  const rockKit = makeRockKit();
  const mounds = [];
  for (let i = 0; i < 4; i++) {
    const md = makeMound(400 + i * 17, hillMap, rockKit);
    md.g.position.set(-70 + i * 130, 0, MZ); scene.add(md.g); mounds.push(md);
  }
  let herd = null, t = 0, wait = 6 + Math.random() * 5;

  function spawn(camX, kindWanted) {
    const mound = mounds.filter(m => Math.abs(m.g.position.x - camX) < 55).sort((a, b) => Math.abs(a.g.position.x - camX) - Math.abs(b.g.position.x - camX))[0];
    if (!mound) return false;
    const kind = kindWanted || KINDS[Math.floor(Math.random() * KINDS.length)], S = SPECIES[kind];
    const n = S.herd[0] + Math.floor(Math.random() * (S.herd[1] - S.herd[0] + 1));
    const cx = camX - mound.g.position.x + (Math.random() - 0.5) * 24;
    const side = Math.random() < 0.5 ? 1 : -1;
    const list = [];
    for (let i = 0; i < n; i++) {
      const A = build(kind); A.g.scale.setScalar(S.sc * (0.85 + Math.random() * 0.25));
      A.lx = Math.max(-26, Math.min(26, cx)) + (i - (n - 1) / 2) * (kind === "chicken" ? 1.3 : 3.6) + (Math.random() - 0.5);
      A.lz = -21 - Math.random() * 2 - i * 0.8;                       // khuất sau gò
      A.stopZ = mound.crest + 0.5 + Math.random() * 1.8;              // dừng trên đỉnh
      A.delay = i * 0.5 + Math.random() * 0.4;
      A.yaw = -Math.PI / 2; A.g.rotation.order = "YZX"; A.g.rotation.y = A.yaw;
      A.watchYaw = -Math.PI / 2 + side * (0.75 + Math.random() * 0.5);
      A.watchT = 3.5 + Math.random() * 2.5;
      A.st = "run"; A.t = 0; A.phase = Math.random() * 6; A.sway = Math.random() * 6;
      A.g.visible = false;
      scene.add(A.g); list.push(A);
    }
    herd = { mound, list };
    return true;
  }
  function dispose(A) { scene.remove(A.g); A.g.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { o.material.map?.dispose(); o.material.dispose(); } }); }

  return {
    mounds,
    // bàn thử: gọi ngay một đàn loài `kind`
    spawnNow(camX, kind) { if (herd) { herd.list.forEach(A => { if (!A.done) dispose(A); }); herd = null; } return spawn(camX, kind); },
    get herd() { return herd; },
    update(dt, camX, trainX) {
      for (const m of mounds) if (m.g.position.x < camX - 260) m.g.position.x += 520;
      if (!herd) { t += dt; if (t > wait) { if (spawn(camX)) t = 0; else t = wait - 2; } return; }
      const { mound } = herd, mx = mound.g.position.x;
      for (const A of herd.list) {
        if (A.done) continue;
        A.t += dt;
        if (A.t < A.delay) continue;
        A.g.visible = true;
        const S = A.S;
        let moving = false, want = A.yaw, speed = 0;
        if (A.st === "run") {
          moving = true; want = -Math.PI / 2; speed = S.run * Math.min(1, (A.stopZ - A.lz) / 2.5 + 0.25);
          A.lz += speed * dt;
          if (A.lz >= A.stopZ - 0.05) { A.st = "watch"; A.t0 = A.t; }
        } else if (A.st === "watch") {
          want = A.watchYaw;
          if (A.t - A.t0 > A.watchT) A.st = "turn";
        } else if (A.st === "turn") {
          want = Math.PI / 2; moving = true; speed = S.run * 0.25;
          A.lz -= speed * dt;
          if (Math.abs(Math.atan2(Math.sin(want - A.yaw), Math.cos(want - A.yaw))) < 0.35) A.st = "leave";
        } else if (A.st === "leave") {
          moving = true; want = Math.PI / 2; speed = S.run * 1.1;
          A.lz -= speed * dt;
          if (A.lz < -24) { A.done = true; dispose(A); continue; }
        }
        // quay thân từ từ (đường ngắn nhất luôn đi qua dáng nghiêng)
        let d = want - A.yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
        A.yaw += d * Math.min(1, dt * (A.st === "turn" ? 2.2 : 3));
        const y = mound.h(A.lx, A.lz);
        const fx = Math.cos(A.yaw), fz = -Math.sin(A.yaw);
        const slope = (mound.h(A.lx + fx * 0.6, A.lz + fz * 0.6) - mound.h(A.lx - fx * 0.6, A.lz - fz * 0.6)) / 1.2;
        A.g.position.set(mx + A.lx, y, MZ + A.lz);
        A.g.rotation.y = A.yaw;
        const watching = A.st === "watch";
        const sway = watching ? Math.sin((A.t + A.sway) * 1.6) : 0;
        A.g.rotation.z = Math.atan(slope) * 0.85 + sway * 0.03;
        A.g.rotation.x = watching ? Math.sin((A.t + A.sway) * 1.1) * 0.05 : 0;          // lắc lư dồn trọng tâm
        const gait = S.biped ? 9 : S.run > 4 ? 3.2 : 3.8;
        A.phase += dt * (moving ? Math.max(speed, S.run * 0.4) * gait : 0);
        animateBody(A, moving, watching, sway, trainX);
      }
      if (herd.list.every(A => A.done)) { herd = null; t = 0; wait = 12 + Math.random() * 14; }
    },
  };
}

function animateBody(A, moving, watching, sway, trainX) {
  const S = A.S, ph = A.phase, gallop = S.run > 4 && moving && A.st !== "turn";
  A.legs.forEach(L => {
    let off;
    if (S.biped || S.pace) off = L.side * Math.PI;
    else if (gallop) off = (L.front ? 0 : Math.PI * 0.9) + L.side * 0.35;          // phi nước đại: 2 chân trước gần cùng nhịp
    else off = ((L.front ^ L.side) ? Math.PI : 0) + (L.front ? 0 : Math.PI / 2);
    const s = moving ? Math.sin(ph + off) : 0;
    L.hip.rotation.z = s * (gallop ? 0.62 : S.biped ? 0.7 : 0.42);
    const bend = moving ? Math.max(0, Math.sin(ph + off + 1.3)) * (gallop ? 1.1 : 0.7) : 0;
    L.knee.rotation.z = S.biped ? -bend * 0.9 : (L.front ? -1 : 1) * bend;
  });
  const bob = moving ? Math.abs(Math.sin(ph)) * (gallop ? 0.06 : 0.025) : 0;
  A.body.position.y = S.h0 * (1 + bob);
  A.body.rotation.z = gallop ? Math.sin(ph) * 0.06 : 0;
  if (S.biped) A.neck.rotation.z = -0.35 + (moving ? Math.sin(ph * 2) * 0.25 : Math.sin(A.t * 2.4) * 0.12);   // gà gật đầu
  else A.neck.rotation.z = -(Math.PI / 2 + S.neckTilt) + (moving ? Math.sin(ph * 2) * 0.05 : -0.08 + sway * 0.05);
  // đứng ngắm: ngoái cổ về phía đoàn tàu, đầu nghiêng qua lại
  const wx = trainX - A.g.position.x, wz = -A.g.position.z;
  let look = Math.atan2(-wz, wx) - A.yaw; look = Math.atan2(Math.sin(look), Math.cos(look));
  const target = watching ? Math.max(-0.7, Math.min(0.7, look)) : 0;
  A.neck.rotation.y += (target - A.neck.rotation.y) * 0.06;
  A.head.rotation.x = watching ? Math.sin(A.t * 0.9 + A.sway) * 0.22 : 0;
  A.tail.rotation.x = Math.sin(A.t * 3 + A.sway) * 0.25;
  const ex = A.extra;
  if (ex.ears) ex.ears.forEach((e, i) => { e.rotation.y = (i ? 1 : -1) * (0.35 + Math.max(0, Math.sin(A.t * 2.2 + i)) * 0.35); });
  if (ex.trunk) ex.trunk.forEach((sg, i) => { sg.rotation.z = (i === 0 ? -0.35 : 0.1) + Math.sin(A.t * 1.4 - i * 0.5) * (watching ? 0.12 : 0.06) + (watching && i > 4 ? -0.25 : 0); });
}

// ------------------------------------------------------------ 1i: con vật HÚC ĐỔ chữ Hollywood
// Đồi đỡ chữ (west-props createHillSigns): elipxoit tâm (X0, -4, -229), bán trục (sx, 31, 36); chữ ở z ≈ -203, chân chữ y ≈ 17.
export function createSignCharger(scene, signs) {
  const CHARGERS = [["cow", 2.8], ["elephant", 2.2], ["horse", 2.6], ["camel", 2.4], ["lion", 2.8]];
  let A = null, t = 0, wait = 14 + Math.random() * 10;
  const hillY = (sg, x, z) => {
    const hill = sg.userData.hill, sx = hill.scale.x, cx = sg.position.x + hill.position.x, cz = sg.position.z + hill.position.z;
    const q = 1 - ((x - cx) / sx) ** 2 - ((z - cz) / hill.scale.z) ** 2;
    return hill.position.y + hill.scale.y * Math.sqrt(Math.max(0, q));
  };
  function spawn(camX) {
    const sg = signs.current(); if (!sg) return false;
    const glyphs = sg.userData.glyphs.map((m, i) => ({ m, i })).filter(o => !o.m.userData.down);
    if (!glyphs.length) return false;
    const wp = new THREE.Vector3();
    const vis = glyphs.filter(o => { o.m.getWorldPosition(wp); o.x = wp.x + (o.m.userData.w || 3) / 2; o.z = wp.z; return Math.abs(o.x - camX) < 45; });
    if (!vis.length) return false;
    const pick = vis[Math.floor(Math.random() * vis.length)];
    const [kind, sc] = CHARGERS[Math.floor(Math.random() * CHARGERS.length)];
    A = build(kind); A.g.scale.setScalar(sc); A.g.rotation.order = "YZX";
    A.sg = sg; A.target = pick; A.x = pick.x; A.z = pick.z - 46; A.yaw = -Math.PI / 2;
    A.front = (A.S.body ? A.S.body[0] * 1.02 + (A.S.head || 0.4) * 0.45 : 0.6) * sc;   // đầu/sừng chạm đúng lưng chữ
    A.stopZ = pick.z - 0.4 - A.front; A.st = "charge"; A.t = 0; A.phase = 0; A.sway = Math.random() * 6;
    scene.add(A.g);
    return true;
  }
  function dispose() { scene.remove(A.g); A.g.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { o.material.map?.dispose(); o.material.dispose(); } }); A = null; }
  return {
    get active() { return A; },
    trigger(camX) { if (A) dispose(); return spawn(camX); },
    update(dt, camX, trainX) {
      if (!A) { t += dt; if (t > wait) { if (spawn(camX)) t = 0; else t = wait - 3; } return; }
      if (!A.sg.parent) { dispose(); return; }   // bảng chữ đã được thay
      A.t += dt;
      const S = A.S;
      let moving = true, speed = 0, want = -Math.PI / 2;
      if (A.st === "charge") {
        speed = S.run * 1.5 * Math.min(1, A.t / 1.2 + 0.3);   // lấy đà rồi lao
        A.z += speed * dt;
        if (A.z >= A.stopZ) { A.z = A.stopZ; A.st = "hit"; A.t = 0; signs.knock(A.target.i); }
      } else if (A.st === "hit") {
        moving = false; A.z -= Math.max(0, 0.6 - A.t) * 2 * dt;          // bật lùi nhẹ sau cú húc
        if (A.t > 2.6) { A.st = "turn"; A.t = 0; }
      } else if (A.st === "turn") {
        want = Math.PI / 2; speed = S.run * 0.3; A.z -= speed * dt;
        if (Math.abs(Math.atan2(Math.sin(want - A.yaw), Math.cos(want - A.yaw))) < 0.3) A.st = "leave";
      } else {
        want = Math.PI / 2; speed = S.run * 1.1; A.z -= speed * dt;
        if (A.z < A.target.z - 50) { dispose(); t = 0; wait = 30 + Math.random() * 25; return; }
      }
      let d = want - A.yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
      A.yaw += d * Math.min(1, dt * 2.4);
      const y = hillY(A.sg, A.x, A.z), fx = Math.cos(A.yaw), fz = -Math.sin(A.yaw);
      const slope = (hillY(A.sg, A.x + fx, A.z + fz) - hillY(A.sg, A.x - fx, A.z - fz)) / 2;
      A.g.position.set(A.x, y, A.z); A.g.rotation.y = A.yaw; A.g.rotation.z = Math.atan(slope) * 0.9;
      A.phase += dt * (moving ? Math.max(speed, S.run * 0.4) * (S.run > 4 ? 3.2 : 3.8) / (A.g.scale.x * 0.6) : 0);
      const watching = A.st === "hit" && A.t > 0.6;
      animateBody(A, moving, watching, watching ? Math.sin(A.t * 1.6) : 0, trainX);
      if (A.st === "charge" && A.neck) A.neck.rotation.z += 0.35;   // cúi đầu lao tới
    },
  };
}
