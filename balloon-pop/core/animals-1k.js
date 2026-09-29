// CON VẬT — bản 1k (29/9/2026): gò đồi MỀM (bỏ gờ bậc thang) phủ cỏ thật; createChase làm lại — con vật GIỐNG THẬT
// (ngựa, linh dương sừng nhánh, sư tử cái, sói) phi nước đại ở đồng bằng RẤT XA, bụi tung sau chân.
// CON VẬT — bản 1j (29/9/2026): thêm KANGAROO (nhảy 2 chân, đuôi to chống đất) trên gò xa; createChase — thỉnh thoảng
// 2 con đuổi nhau chạy ngang vùng đất thấp phía xa (sư tử đuổi ngựa, sói đuổi gà…); đồi chữ mới (hillH) cho con vật húc chữ.
// Bản 1i: thêm createSignCharger — thỉnh thoảng một con vật to (bò tót, voi, ngựa, lạc đà, sư tử)
// từ sau đồi chữ Hollywood lao xuống HÚC ĐỔ một chữ, đứng nhìn rồi quay về.
// Bản 1f:
// • 8 loài: lạc đà, ngựa, sói đồng cỏ + (1f) sư tử, bò, lợn, voi, gà (đi 2 chân). Có khi đi cả đàn nhỏ.
// • Gò đồi dựng lại như địa hình thật: lưới cao độ nhiễu nhiều lớp, sống đồi lệch, sườn dốc lộ đá đỏ, đỉnh bạc màu,
//   vạt cỏ khô, đá sa thạch + bụi cây lác đác. Gò THẤP hơn (đỉnh ≈ 5) và gần hơn để không che chữ Hollywood phía sau.
// • Hành vi chung: từ nửa KHUẤT phía sau gò chạy lên đỉnh → đứng ngắm đoàn tàu, lắc lư vài giây →
//   quay đầu chạy khuất về phía xa (không đi ngang).
import * as THREE from "three";
import { makeNoise, mulberry, makeRockKit, farGrassKit, scatterFarGrass } from "./west-props-1k.js";

const SPECIES = {
  camel:    { body: [1.35, 0.62, 0.52], hump: 0.62, legUp: 0.85, legLo: 0.8, neck: 1.25, neckTilt: -0.7, head: 0.44, col: 0xc49a66, dark: 0x6a4a2c, pace: true, tail: "tuft", ears: 0.12, h0: 1.85, run: 3.4, sc: 1.25, herd: [1, 2] },
  horse:    { body: [1.15, 0.55, 0.42], legUp: 0.72, legLo: 0.72, neck: 0.85, neckTilt: -1.0, head: 0.58, col: 0x7a4a2a, dark: 0x1e140e, tail: "long", ears: 0.14, mane: true, h0: 1.55, run: 4.4, sc: 1.25, herd: [1, 3] },
  coyote:   { body: [0.62, 0.26, 0.22], legUp: 0.32, legLo: 0.3, neck: 0.3, neckTilt: -0.5, head: 0.3, col: 0xa08a6c, dark: 0x4a3c2c, tail: "bushy", ears: 0.12, light: true, h0: 0.66, run: 4.6, sc: 1.6, herd: [1, 2] },
  lion:     { body: [1.08, 0.34, 0.29], thick: 1.45, legUp: 0.5, legLo: 0.48, neck: 0.42, neckTilt: -0.35, head: 0.58, col: 0xc8964e, dark: 0x4e2e14, tail: "lion", ears: 0.1, lion: true, h0: 1.02, run: 4.8, sc: 1.35, herd: [1, 2] },
  cow:      { body: [1.25, 0.6, 0.52], legUp: 0.55, legLo: 0.55, neck: 0.5, neckTilt: 0.05, head: 0.62, col: 0xf1eee6, dark: 0x1b1a19, tail: "cow", ears: 0.13, cow: true, h0: 1.2, run: 3.5, sc: 1.3, herd: [1, 3] },
  pig:      { body: [0.8, 0.45, 0.42], legUp: 0.22, legLo: 0.2, neck: 0.18, neckTilt: 0.35, head: 0.46, col: 0xeaa29c, dark: 0xa45f5c, tail: "curl", ears: 0.16, pig: true, h0: 0.52, run: 3.3, sc: 1.55, herd: [2, 3] },
  elephant: { body: [1.85, 1.1, 0.95], legUp: 1.0, legLo: 0.95, thick: 2.0, neck: 0.35, neckTilt: 0.55, head: 1.0, col: 0x8b8680, dark: 0x4a4642, tail: "thin", ears: 0, elephant: true, h0: 2.35, run: 3.2, sc: 1.2, herd: [1, 2] },
  kangaroo: { roo: true, run: 4.4, sc: 1.55, herd: [1, 3], h0: 1.0, neckTilt: -0.9 },
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
  if (S.roo) return buildKangaroo();
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

// kangaroo: thân dựng nghiêng, đùi sau to + bàn chân dài, tay trước nhỏ, đuôi dày chạm đất, tai dài
function buildKangaroo() {
  const S = { ...SPECIES.kangaroo };
  const fur = new THREE.MeshStandardMaterial({ color: [0xb4764a, 0x9a6a48, 0xc08a5c][Math.floor(Math.random() * 3)], roughness: 0.95 });
  const pale = new THREE.MeshStandardMaterial({ color: 0xe6cfae, roughness: 0.95 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2a1d14, roughness: 0.8 });
  const g = new THREE.Group();
  const add = (geo, mat, parent, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m; };
  const body = new THREE.Group(); body.position.y = S.h0; body.rotation.z = 0.75; g.add(body);   // thân dựng nghiêng về trước
  add(new THREE.SphereGeometry(1, 22, 16), fur, body).scale.set(0.55, 0.32, 0.3);
  add(new THREE.SphereGeometry(1, 18, 12), pale, body, 0.05, -0.12, 0).scale.set(0.45, 0.22, 0.24);
  add(new THREE.SphereGeometry(1, 18, 12), fur, body, -0.35, 0.02, 0).scale.set(0.34, 0.34, 0.34);   // hông to
  const neck = new THREE.Group(); neck.rotation.order = "YZX"; neck.position.set(0.5, 0.08, 0); neck.rotation.z = -0.3; body.add(neck);
  add(new THREE.CylinderGeometry(0.1, 0.14, 0.3, 12), fur, neck, 0, 0.15, 0);
  const head = new THREE.Group(); head.position.y = 0.3; neck.add(head);
  const hd = new THREE.Group(); hd.rotation.z = -0.45; head.add(hd);
  add(new THREE.SphereGeometry(1, 16, 12), fur, hd, 0.04, 0.02, 0).scale.set(0.16, 0.13, 0.12);
  add(new THREE.SphereGeometry(1, 14, 10), fur, hd, 0.18, -0.02, 0).scale.set(0.13, 0.08, 0.08);
  add(new THREE.SphereGeometry(0.028, 8, 6), dark, hd, 0.3, -0.01, 0);
  for (const z of [-1, 1]) { add(new THREE.SphereGeometry(0.022, 8, 6), dark, hd, 0.1, 0.06, z * 0.09); const ear = add(new THREE.ConeGeometry(0.05, 0.22, 8), fur, hd, -0.02, 0.2, z * 0.07); ear.rotation.x = z * 0.25; ear.scale.z = 0.5; }
  // tay trước nhỏ
  for (const z of [-0.12, 0.12]) { const arm = add(new THREE.CylinderGeometry(0.035, 0.03, 0.26, 8), fur, body, 0.38, -0.2, z); arm.rotation.z = -0.9; }
  // đuôi dày
  const tail = new THREE.Group(); tail.position.set(-0.55, -0.1, 0); body.add(tail);
  const tg = new THREE.CylinderGeometry(0.03, 0.13, 1.1, 12); tg.translate(0, -0.55, 0);
  const tm = add(tg, fur, tail); tail.rotation.z = 0.9 - 0.75;
  // chân sau: đùi to + ống + bàn chân dài
  const legs = [];
  for (const z of [-0.15, 0.15]) {
    const hip = new THREE.Group(); hip.position.set(-0.3, -0.2, z); body.add(hip);
    add(new THREE.SphereGeometry(1, 14, 10), fur, hip, 0.05, -0.08, 0).scale.set(0.22, 0.3, 0.14);
    const knee = new THREE.Group(); knee.position.set(0.12, -0.34, 0); hip.add(knee);
    const shin = add(new THREE.CylinderGeometry(0.05, 0.04, 0.42, 10), fur, knee, -0.14, -0.14, 0); shin.rotation.z = 1.2;
    const foot = add(new THREE.BoxGeometry(0.34, 0.05, 0.08), dark, knee, -0.18 - 0.05, -0.33, 0); foot.rotation.z = -0.75;
    legs.push({ hip, knee, front: 0, side: z > 0 ? 1 : 0 });
  }
  g.traverse(o => { if (o.isMesh) o.receiveShadow = true; });
  return { g, body, neck, head, tail, legs, S, kind: "kangaroo", extra: {} };
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
    // 1k: gò MỀM — chỉ sóng đất to, thoải (bỏ gờ đá bậc thang + nhiễu nhỏ lởm chởm) ⇒ con vật leo lên đi xuống hợp lý
    const n = N(lx * 0.045, lz * 0.045) * 0.6 + N(lx * 0.1 + 7, lz * 0.1) * 0.22 + N(lx * 0.25, lz * 0.25 + 3) * 0.03;
    const y = H * Math.pow(b, 1.35) * (1 + n * 0.28) + n * 0.7 * b;
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
  const gtex = farGrassKit().groundTex.clone(); gtex.repeat.set(MW / 6, MD / 6); gtex.needsUpdate = true; void hillMap;
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, map: gtex, roughness: 1 });
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
  // 1k: cỏ thật (búi cỏ mảnh + bụi sa mạc) mọc thành vạt thay khối cầu xanh
  const patch = (x, z) => Math.max(0, Math.min(1, 0.5 + N(x * 0.07 + 30, z * 0.07) * 1.2 + N(x * 0.22, z * 0.22 + 4) * 0.35));
  scatterFarGrass(g, h, { n: 3000, ns: 90, rx: MW / 2 * 0.95, rz: MD / 2 * 0.9, cz: 0, seed: seed + 3, s0: 0.42, s1: 0.95,
    inside: (lx, lz) => shape(lx, lz) > 0.05, patch });
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
  if (A.S.roo) return animateRoo(A, moving, watching, trainX);
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
  const hillY = (sg, x, z) => sg.userData.hillH(x - sg.position.x, z - sg.position.z);
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

// kangaroo nhảy: 2 chân cùng nhịp, thân bật lên theo đường parabol, đuôi quất; đứng xem thì dựng người, tai vểnh
function animateRoo(A, moving, watching, trainX) {
  const ph = A.phase * 0.55, hop = moving ? Math.max(0, Math.sin(ph)) : 0;
  A.body.position.y = A.S.h0 + hop * 0.55;
  A.body.rotation.z = moving ? 0.95 - hop * 0.25 : 0.55 + Math.sin(A.t * 1.3) * 0.04;
  A.legs.forEach(L => { L.hip.rotation.z = moving ? -0.6 + hop * 1.1 : -0.2; L.knee.rotation.z = moving ? hop * 0.5 : 0; });
  A.tail.rotation.z = moving ? 0.15 + Math.sin(ph) * 0.35 : -0.35;
  const wx = trainX - A.g.position.x, wz = -A.g.position.z;
  let look = Math.atan2(-wz, wx) - A.yaw; look = Math.atan2(Math.sin(look), Math.cos(look));
  A.neck.rotation.y += ((watching ? Math.max(-0.8, Math.min(0.8, look)) : 0) - A.neck.rotation.y) * 0.06;
  A.head.rotation.x = watching ? Math.sin(A.t * 0.9 + A.sway) * 0.25 : 0;
}

// ------------------------------------------------------------ 1k: 2 con ĐUỔI NHAU — làm lại GIỐNG THẬT, chạy ở RẤT XA
// Thầy: "các con chạy đằng sau quá xấu và thiếu chi tiết … giống y như thật … đuổi nhau ở rất xa".
// • Thân/cổ/đầu/chân dựng bằng ỐNG TRƠN (loft) theo mặt cắt thật (mông tròn, bụng thon, ngực sâu), màu lông đổ bóng
//   ngược (lưng sẫm, bụng sáng) + vằn/đốm riêng từng loài; chân nhiều khớp (vai–khuỷu–gối–cổ chân, hông–gối–khoeo).
// • Dáng chạy phi nước đại thật: 4 chân lệch nhịp (ngựa/linh dương kiểu chéo, sư tử/sói kiểu xoay vòng), thân nhún + chúi,
//   gập chân lúc vung, đuôi bay; bụi đất tung sau chân.
// • Chạy trên đồng bằng xa (z ≈ -118, bám độ cao mặt đất thật — cùng công thức shader groundH).
const f32 = Math.fround;
const fr = x => f32(x - Math.floor(x));
const K1 = f32(233.34), K2 = f32(851.73), K3 = f32(23.45), K4 = f32(2.02), K5 = f32(3.1), K6 = f32(1.7);
function h21(x, y) { x = fr(f32(x * K1)); y = fr(f32(y * K2)); const d = f32(f32(x * f32(x + K3)) + f32(y * f32(y + K3))); x = f32(x + d); y = f32(y + d); return fr(f32(x * y)); }
function vn(x, y) { const ix = Math.floor(x), iy = Math.floor(y), fx = f32(x - ix), fy = f32(y - iy), ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = h21(ix, iy), b = h21(ix + 1, iy), c = h21(ix, iy + 1), d = h21(ix + 1, iy + 1);
  return (a * (1 - ux) + b * ux) * (1 - uy) + (c * (1 - ux) + d * ux) * uy; }
function fbm4(x, y) { x = f32(x); y = f32(y); let s = 0, a = 0.5; for (let i = 0; i < 5; i++) { s += a * vn(x, y); x = f32(f32(x * K4) + K5); y = f32(f32(y * K4) + K6); a *= 0.5; } return s; }
const sst = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export function groundHeight(x, z) {   // = groundH() trong shader mặt đất (west-world)
  const far = sst(45, 170, -z);
  const hills = Math.max(0, fbm4(f32(x) * f32(0.0035), f32(z) * f32(0.0035)) - 0.36) * 80 * far;
  const mid = (fbm4(f32(x) * f32(0.02), f32(z) * f32(0.02)) - 0.5) * 3.2 * sst(22, 70, -z);
  const near = (vn(x * 0.12, z * 0.12) - 0.5) * 0.22 * sst(3, 9, Math.abs(z));
  return hills + mid + near;
}

// ống trơn theo đường cong trong mặt phẳng dọc (x tới, y lên); keys: [x, y, nửa-bề-ngang, nửa-bề-cao, hệ-số-bụng]
function loft(keys, col, rings = 26, seg = 18) {
  const curve = new THREE.CatmullRomCurve3(keys.map(k => new THREE.Vector3(k[0], k[1], 0)), false, "centripetal");
  const n = keys.length - 1, pos = [], cl = [], idx = [];
  const K = (u, j, d) => { const f = u * n, i = Math.min(n - 1, Math.floor(f)), t = f - i, s = t * t * (3 - 2 * t); return (keys[i][j] ?? d) * (1 - s) + (keys[i + 1][j] ?? d) * s; };
  const c3 = new THREE.Color();
  for (let a = 0; a <= rings; a++) {
    const u = a / rings, c = curve.getPoint(u), tg = curve.getTangent(u), ux = -tg.y, uy = tg.x;
    const rz = K(u, 2, 0.1), ry = K(u, 3, 0.1), bel = K(u, 4, 1);
    for (let b = 0; b <= seg; b++) {
      const th = b / seg * Math.PI * 2 - Math.PI / 2, s = Math.sin(th)   // đường nối vòng nằm dưới bụng (không lộ vệt gãy bên hông)
     , co = Math.cos(th), yy = s * ry * (s < 0 ? bel : 1);
      const px = c.x + ux * yy, py = c.y + uy * yy, pz = co * rz * (1 - 0.12 * Math.max(0, -s));
      pos.push(px, py, pz);
      col(c3, u, s, co, px, py, pz);
      const fur = 0.93 + 0.14 * vn(px * 23 + pz * 7, py * 23 - pz * 5);   // vân lông
      cl.push(c3.r * fur, c3.g * fur, c3.b * fur);
    }
  }
  for (let a = 0; a < rings; a++) for (let b = 0; b < seg; b++) { const i0 = a * (seg + 1) + b, i1 = i0 + seg + 1; idx.push(i0, i1, i0 + 1, i1, i1 + 1, i0 + 1); }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(cl, 3));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}
const C = h => new THREE.Color(h);
// bảng loài (đơn vị ≈ mét; sc phóng lên cho dễ thấy ở xa)
const REAL = {
  horse: {
    sc: 1.35, run: 12, freq: 2.0, rotary: false, amp: 0.55,
    pal: () => { const v = [[0x7a4526, 0x1c120c, 0xb88a64], [0x9a5a2e, 0x4a2a16, 0xd2a57c], [0x8f8272, 0x2e2822, 0xcfc4b6], [0x3a2a20, 0x120c08, 0x6a5444]][Math.floor(Math.random() * 4)]; return { coat: C(v[0]), point: C(v[1]), belly: C(v[2]) }; },
    torso: [[-1.02, 1.36, 0.03, 0.03], [-0.97, 1.38, 0.19, 0.22], [-0.8, 1.38, 0.29, 0.31], [-0.52, 1.34, 0.31, 0.34, 1.05], [-0.15, 1.29, 0.32, 0.37, 1.12], [0.25, 1.3, 0.31, 0.38, 1.12], [0.6, 1.34, 0.26, 0.37, 1.05], [0.82, 1.32, 0.18, 0.27], [0.92, 1.28, 0.04, 0.05]],
    neckAt: [0.62, 1.5], neck: [[-0.06, -0.12, 0.21, 0.36], [0.18, 0.3, 0.16, 0.27], [0.37, 0.63, 0.11, 0.18], [0.47, 0.8, 0.095, 0.14]], neckTilt: -0.12,
    head: [[-0.07, 0.03, 0.1, 0.12], [0.06, 0.0, 0.12, 0.15], [0.28, -0.13, 0.09, 0.115], [0.48, -0.26, 0.075, 0.095], [0.56, -0.3, 0.025, 0.035]],
    ears: { at: [0.0, 0.12], len: 0.14, w: 0.035 }, mane: true, eye: [0.1, 0.05, 0.1],
    tailAt: [-1.0, 1.52], tail: [[0, 0, 0.05, 0.06], [-0.18, -0.16, 0.08, 0.09], [-0.34, -0.45, 0.1, 0.07], [-0.42, -0.78, 0.07, 0.04], [-0.44, -0.9, 0.01, 0.01]], tailLift: -0.75, tailDark: true,
    front: { at: [0.55, 1.07, 0.15], segs: [[0.5, [[0, 0.1, 0.12, 0.14], [0, -0.25, 0.085, 0.1], [0, -0.5, 0.055, 0.065]], 0], [0.36, [[0, 0, 0.045, 0.055], [0, -0.36, 0.04, 0.05]], 0], [0.21, [[0, 0, 0.048, 0.055], [0.02, -0.13, 0.045, 0.05], [0.03, -0.21, 0.062, 0.07]], 0.18]] },
    hind: { at: [-0.64, 1.2, 0.15], segs: [[0.44, [[0, 0.16, 0.16, 0.22], [0, -0.2, 0.12, 0.15], [0, -0.44, 0.065, 0.08]], 0.35], [0.38, [[0, 0, 0.065, 0.08], [0, -0.38, 0.045, 0.058]], -0.85], [0.34, [[0, 0, 0.042, 0.05], [0, -0.34, 0.04, 0.047]], 0.55], [0.18, [[0, 0, 0.045, 0.05], [0.02, -0.11, 0.045, 0.05], [0.03, -0.18, 0.06, 0.068]], 0.05]] },
    hoof: true,
  },
  pronghorn: {
    sc: 1.5, run: 12.5, freq: 2.5, rotary: false, amp: 0.6,
    pal: () => ({ coat: C(0xb67a44), point: C(0x2a1c12), belly: C(0xf4ede0) }),
    torso: [[-0.62, 0.92, 0.02, 0.02], [-0.58, 0.94, 0.12, 0.14], [-0.46, 0.95, 0.17, 0.19], [-0.25, 0.92, 0.18, 0.21, 1.05], [0.05, 0.9, 0.18, 0.22, 1.1], [0.32, 0.93, 0.16, 0.22], [0.48, 0.92, 0.11, 0.17], [0.55, 0.9, 0.03, 0.04]],
    neckAt: [0.4, 1.02], neck: [[-0.02, -0.04, 0.1, 0.15], [0.12, 0.2, 0.07, 0.1], [0.24, 0.4, 0.055, 0.075], [0.28, 0.47, 0.05, 0.065]], neckTilt: -0.08,
    head: [[-0.04, 0.02, 0.06, 0.065], [0.05, 0.0, 0.07, 0.08], [0.18, -0.07, 0.05, 0.06], [0.28, -0.13, 0.038, 0.045], [0.31, -0.15, 0.01, 0.015]],
    ears: { at: [-0.01, 0.07], len: 0.1, w: 0.025 }, horns: true, eye: [0.06, 0.035, 0.065],
    tailAt: [-0.6, 1.0], tail: [[0, 0, 0.035, 0.04], [-0.06, -0.06, 0.03, 0.03], [-0.09, -0.12, 0.005, 0.005]], tailLift: -0.4,
    front: { at: [0.34, 0.74, 0.085], segs: [[0.3, [[0, 0.06, 0.065, 0.08], [0, -0.15, 0.045, 0.055], [0, -0.3, 0.03, 0.035]], 0], [0.28, [[0, 0, 0.024, 0.03], [0, -0.28, 0.02, 0.026]], 0], [0.16, [[0, 0, 0.024, 0.028], [0.015, -0.11, 0.022, 0.026], [0.02, -0.16, 0.03, 0.036]], 0.15]] },
    hind: { at: [-0.42, 0.86, 0.085], segs: [[0.3, [[0, 0.1, 0.09, 0.13], [0, -0.14, 0.07, 0.09], [0, -0.3, 0.035, 0.045]], 0.35], [0.28, [[0, 0, 0.035, 0.045], [0, -0.28, 0.024, 0.03]], -0.85], [0.26, [[0, 0, 0.022, 0.028], [0, -0.26, 0.02, 0.025]], 0.55], [0.12, [[0, 0, 0.022, 0.026], [0.012, -0.08, 0.022, 0.026], [0.018, -0.12, 0.03, 0.034]], 0.05]] },
    hoof: true, pronghorn: true,
  },
  lioness: {
    sc: 1.45, run: 12.5, freq: 2.3, rotary: true, amp: 0.8, flex: 0.09,
    pal: () => ({ coat: C(0xc2904e), point: C(0x6a4a2a), belly: C(0xecd8b4) }),
    torso: [[-0.8, 0.74, 0.03, 0.03], [-0.74, 0.76, 0.16, 0.17], [-0.56, 0.77, 0.2, 0.22], [-0.22, 0.73, 0.19, 0.22, 1.0], [0.18, 0.74, 0.2, 0.25, 1.05], [0.48, 0.78, 0.19, 0.26], [0.64, 0.76, 0.13, 0.18], [0.7, 0.74, 0.03, 0.04]],
    neckAt: [0.56, 0.82], neck: [[-0.04, 0.0, 0.15, 0.18], [0.14, 0.05, 0.13, 0.15], [0.28, 0.08, 0.11, 0.12]], neckTilt: 0,
    head: [[-0.06, 0.0, 0.1, 0.11], [0.07, 0.02, 0.12, 0.12], [0.19, -0.01, 0.1, 0.09], [0.28, -0.04, 0.065, 0.06], [0.32, -0.05, 0.02, 0.02]],
    roundEars: [0.0, 0.11, 0.08], eye: [0.14, 0.05, 0.075], nose: true,
    tailAt: [-0.77, 0.84], tail: [[0, 0, 0.035, 0.035], [-0.28, -0.16, 0.03, 0.03], [-0.55, -0.2, 0.025, 0.025], [-0.8, -0.1, 0.02, 0.02], [-0.86, -0.06, 0.005, 0.005]], tailLift: -0.2, tuft: true,
    front: { at: [0.48, 0.62, 0.1], segs: [[0.3, [[0, 0.12, 0.1, 0.13], [0, -0.14, 0.07, 0.085], [0, -0.3, 0.05, 0.06]], 0], [0.24, [[0, 0, 0.05, 0.06], [0, -0.24, 0.04, 0.045]], 0], [0.08, [[0, 0, 0.042, 0.048], [0.03, -0.05, 0.05, 0.06], [0.05, -0.08, 0.05, 0.065]], 0.2]] },
    hind: { at: [-0.56, 0.7, 0.1], segs: [[0.3, [[0, 0.14, 0.13, 0.18], [0, -0.12, 0.09, 0.12], [0, -0.3, 0.05, 0.06]], 0.4], [0.28, [[0, 0, 0.05, 0.06], [0, -0.28, 0.035, 0.045]], -0.95], [0.16, [[0, 0, 0.034, 0.04], [0, -0.16, 0.034, 0.04]], 0.5], [0.07, [[0, 0, 0.04, 0.045], [0.03, -0.04, 0.045, 0.06], [0.05, -0.07, 0.045, 0.06]], 0.05]] },
  },
  wolf: {
    sc: 1.55, run: 12, freq: 2.4, rotary: true, amp: 0.75, flex: 0.07,
    pal: () => { const v = [[0x8a7f72, 0x3a342e, 0xe2dbd0], [0x9a8266, 0x4a3a2a, 0xe8dcc6]][Math.floor(Math.random() * 2)]; return { coat: C(v[0]), point: C(v[1]), belly: C(v[2]) }; },
    torso: [[-0.6, 0.66, 0.03, 0.03], [-0.55, 0.68, 0.12, 0.14], [-0.4, 0.69, 0.15, 0.17], [-0.12, 0.66, 0.15, 0.18, 1.0], [0.2, 0.68, 0.16, 0.22, 1.05], [0.42, 0.72, 0.15, 0.22], [0.54, 0.7, 0.1, 0.15], [0.59, 0.68, 0.03, 0.04]],
    neckAt: [0.46, 0.78], neck: [[-0.04, -0.02, 0.12, 0.16], [0.12, 0.05, 0.1, 0.12], [0.24, 0.1, 0.08, 0.09]], neckTilt: 0,
    head: [[-0.05, 0.0, 0.08, 0.085], [0.06, 0.01, 0.09, 0.09], [0.16, -0.01, 0.06, 0.06], [0.28, -0.04, 0.035, 0.035], [0.31, -0.045, 0.01, 0.01]],
    ears: { at: [0.0, 0.08], len: 0.1, w: 0.035, sep: 0.05 }, eye: [0.1, 0.035, 0.05], nose: true, ruff: true,
    tailAt: [-0.58, 0.74], tail: [[0, 0, 0.04, 0.04], [-0.14, -0.1, 0.07, 0.07], [-0.3, -0.22, 0.08, 0.08], [-0.44, -0.3, 0.05, 0.05], [-0.5, -0.33, 0.01, 0.01]], tailLift: -0.35, tailTip: true,
    front: { at: [0.4, 0.56, 0.08], segs: [[0.27, [[0, 0.1, 0.07, 0.09], [0, -0.12, 0.05, 0.06], [0, -0.27, 0.035, 0.04]], 0], [0.22, [[0, 0, 0.034, 0.04], [0, -0.22, 0.027, 0.032]], 0], [0.07, [[0, 0, 0.028, 0.032], [0.02, -0.045, 0.034, 0.045], [0.035, -0.07, 0.034, 0.045]], 0.2]] },
    hind: { at: [-0.44, 0.64, 0.08], segs: [[0.27, [[0, 0.12, 0.1, 0.14], [0, -0.1, 0.07, 0.09], [0, -0.27, 0.04, 0.045]], 0.4], [0.25, [[0, 0, 0.04, 0.045], [0, -0.25, 0.028, 0.034]], -0.95], [0.15, [[0, 0, 0.026, 0.03], [0, -0.15, 0.026, 0.03]], 0.5], [0.06, [[0, 0, 0.03, 0.034], [0.02, -0.04, 0.034, 0.045], [0.035, -0.06, 0.034, 0.045]], 0.05]] },
  },
};

function buildReal(kind) {
  const D = REAL[kind], P = D.pal();
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x14100c, roughness: 0.45 });
  const hornMat = new THREE.MeshStandardMaterial({ color: 0x1a1512, roughness: 0.5 });
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const mesh = (geo, m = mat) => { const o = new THREE.Mesh(geo, m); o.castShadow = true; return o; };
  const cc = new THREE.Color();
  // màu thân: đổ bóng ngược (lưng sẫm hơn, bụng sáng) + vệt riêng từng loài
  const torsoCol = (c, u, s, co, px, py, pz) => {
    c.copy(P.coat).lerp(P.belly, sst(0.05, -0.75, s));
    c.multiplyScalar(1 - Math.max(0, s) * 0.12);
    if (D.pronghorn) { if (u < 0.14 && s < 0.6) c.copy(P.belly); c.lerp(P.belly, sst(-0.12, -0.35, s)); }   // mông trắng + bụng/sườn dưới trắng
    if (kind === "wolf") { if (s > 0.35 && u > 0.2 && u < 0.8) c.lerp(P.point, 0.35); }
  };
  body.add(mesh(loft(D.torso, torsoCol, 32, 22)));
  // cổ + bờm + đầu
  const neck = new THREE.Group(); neck.position.set(D.neckAt[0], D.neckAt[1], 0); neck.rotation.z = D.neckTilt; body.add(neck);
  const nk = D.neck;
  neck.add(mesh(loft(nk, (c, u, s) => { c.copy(P.coat).lerp(P.belly, sst(0.1, -0.8, s) * (D.pronghorn ? 1 : 0.8)); if (D.pronghorn && u > 0.35 && u < 0.55 && s < 0) c.copy(P.belly); }, 16, 16)));
  if (D.mane) {   // bờm: dải lông sẫm dọc sống cổ
    const mk = []; for (let i = 0; i < nk.length; i++) { const a = nk[Math.max(0, i - 1)], b = nk[Math.min(nk.length - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1; mk.push([nk[i][0] - ty / l * nk[i][3] * 0.9, nk[i][1] + tx / l * nk[i][3] * 0.9, 0.03, 0.07]); }
    mk[mk.length - 1][3] = 0.1;
    neck.add(mesh(loft(mk, c => c.copy(P.point), 14, 10)));
  }
  if (D.ruff) neck.add(mesh(loft([[-0.06, -0.04, 0.13, 0.17], [0.06, 0.02, 0.14, 0.16], [0.14, 0.05, 0.11, 0.12]], (c, u, s) => c.copy(P.coat).lerp(P.belly, sst(0.2, -0.6, s)).multiplyScalar(1.05), 10, 16)));
  const last = nk[nk.length - 1], head = new THREE.Group(); head.position.set(last[0], last[1], 0); neck.add(head);
  const hk = D.head;
  head.add(mesh(loft(hk, (c, u, s) => { c.copy(P.coat).lerp(P.belly, sst(0.0, -0.8, s) * 0.8); if (u > 0.8) c.lerp(P.point, kind === "horse" ? 0.3 : 0.55); if (D.pronghorn && u > 0.72) c.copy(P.point); }, 20, 16)));
  const eye = D.eye; for (const z of [-1, 1]) { const e = mesh(new THREE.SphereGeometry(0.018 * (kind === "horse" ? 1.3 : 1), 8, 6), dark); e.position.set(eye[0], eye[1], z * eye[2]); head.add(e); }
  if (D.nose) { const n = mesh(new THREE.SphereGeometry(1, 10, 8), dark); n.scale.set(0.02, 0.018, 0.024); const t = hk[hk.length - 2]; n.position.set(t[0] + 0.02, t[1] + 0.012, 0); head.add(n); }
  if (D.ears) for (const z of [-1, 1]) {
    const e = mesh(new THREE.ConeGeometry(D.ears.w, D.ears.len, 8)); e.geometry.translate(0, D.ears.len / 2, 0);
    const ec = new Float32Array(e.geometry.attributes.position.count * 3); for (let i = 0; i < ec.length; i += 3) { cc.copy(P.coat).lerp(P.point, 0.35); ec[i] = cc.r; ec[i + 1] = cc.g; ec[i + 2] = cc.b; } e.geometry.setAttribute("color", new THREE.BufferAttribute(ec, 3));
    e.scale.z = 0.55; e.position.set(D.ears.at[0], D.ears.at[1], z * (D.ears.sep ?? 0.05)); e.rotation.set(z * 0.25, 0, 0.35); head.add(e);
  }
  if (D.roundEars) for (const z of [-1, 1]) { const e = mesh(new THREE.SphereGeometry(1, 10, 8), dark); e.scale.set(0.02, 0.04, 0.035); e.position.set(D.roundEars[0], D.roundEars[1], z * D.roundEars[2]); head.add(e); }
  if (D.horns) for (const z of [-1, 1]) {
    const cv = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.0, 0.07, 0), new THREE.Vector3(-0.02, 0.13, 0), new THREE.Vector3(-0.055, 0.16, 0)]);
    const h = mesh(new THREE.TubeGeometry(cv, 8, 0.012, 6), hornMat); h.position.set(0.02, 0.06, z * 0.035); head.add(h);
    const prong = mesh(new THREE.ConeGeometry(0.01, 0.04, 6), hornMat); prong.position.set(0.015, 0.1, z * 0.035); prong.rotation.z = -0.9; head.add(prong);
  }
  // đuôi
  const tail = new THREE.Group(); tail.position.set(D.tailAt[0], D.tailAt[1], 0); body.add(tail);
  tail.add(mesh(loft(D.tail, (c, u) => { c.copy(D.tailDark ? P.point : P.coat); if (D.tailTip && u > 0.8) c.copy(P.point); if (D.pronghorn) c.copy(P.belly); }, 16, 12)));
  if (D.tuft) { const t = D.tail[D.tail.length - 2], s = mesh(new THREE.SphereGeometry(1, 10, 8), dark); s.scale.set(0.07, 0.045, 0.045); s.position.set(t[0], t[1], 0); tail.add(s); }
  // chân: chuỗi khớp, mỗi đốt một ống trơn; phía dưới sẫm dần (ngựa: "chân đen")
  const legs = [];
  for (const [def, front] of [[D.front, 1], [D.hind, 0]]) for (const side of [-1, 1]) {
    const hip = new THREE.Group(); hip.position.set(def.at[0], def.at[1], side * def.at[2]); body.add(hip);
    const joints = []; let parent = hip, drop = 0;
    const total = def.segs.reduce((a, s) => a + s[0], 0);
    def.segs.forEach(([L, keys0, rest], k) => {
      const keys = k ? keys0 : [[0, keys0[0][1] + 0.1 * (L / 0.45), keys0[0][2] * 0.9, keys0[0][3]], ...keys0];   // đầu đốt chìm hẳn vào thân (liền khối, không lòi ra)
      const j = new THREE.Group(); if (k) j.position.y = -def.segs[k - 1][0]; parent.add(j);
      const d0 = drop;
      j.add(mesh(loft(keys, (c, u, s, co, px, py) => {
        const f = (d0 - py) / total;   // 0 ở vai/hông → 1 ở móng
        c.copy(P.coat).lerp(P.belly, (1 - f) * sst(0.2, -0.9, co * (front ? 1 : -1)) * 0.2);
        if (D.hoof && f > 0.62) c.lerp(P.point, kind === "horse" ? sst(0.62, 0.72, f) : sst(0.85, 0.95, f));
        if (!D.hoof && f > 0.9) c.multiplyScalar(0.92);
        if (D.pronghorn && k === 0) c.lerp(P.belly, 0.25);
      }, 12, 12)));
      if (k && k < def.segs.length) { const kn = mesh(new THREE.SphereGeometry(keys[0][2] * 1.05, 10, 8)); kn.geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(kn.geometry.attributes.position.count * 3).fill(0), 3)); kn.material = mat; kn.scale.set(keys[0][3] / keys[0][2], 1, 1);
        const kc = kn.geometry.attributes.color; const f = drop / total; cc.copy(P.coat); if (D.hoof && f > 0.62) cc.lerp(P.point, kind === "horse" ? 1 : 0); for (let i = 0; i < kc.count; i++) kc.setXYZ(i, cc.r, cc.g, cc.b); j.add(kn); }
      if (D.hoof && k === def.segs.length - 1) { const hf = mesh(new THREE.CylinderGeometry(keys[2][2] * 0.95, keys[2][2] * 1.12, 0.05, 12), dark); hf.position.set(keys[2][0], keys[2][1] - 0.01, 0); hf.scale.x = keys[2][3] / keys[2][2]; j.add(hf); }
      j.rotation.z = rest; j.userData.rest = rest; joints.push(j); parent = j; drop += L;
    });
    legs.push({ joints, front, side });
  }
  g.traverse(o => { if (o.isMesh) o.receiveShadow = true; });
  g.scale.setScalar(D.sc * (0.92 + Math.random() * 0.12));
  return { g, body, neck, head, tail, legs, D, kind, phase: Math.random(), baseY: 0 };
}

// phi nước đại: pha từng chân (ngựa/linh dương: chéo — sau trái, sau phải, trước trái, trước phải; mèo/sói: xoay vòng)
function gallop(A, dt, speedK = 1) {
  const D = A.D; A.phase = (A.phase + dt * D.freq * speedK) % 1;
  const ph = A.phase, ds = 0.36, TAU = Math.PI * 2;
  const offs = D.rotary ? { h: [0, 0.1], f: [0.58, 0.48] } : { h: [0, 0.1], f: [0.44, 0.54] };
  for (const L of A.legs) {
    let p = (ph - (L.front ? offs.f : offs.h)[L.side > 0 ? 1 : 0] + 1) % 1, hipA, fold;
    if (p < ds) { const u = p / ds; hipA = D.amp * (1 - 2 * u); fold = 0; }
    else { const u = (p - ds) / (1 - ds); hipA = -D.amp + 2 * D.amp * (0.5 - 0.5 * Math.cos(Math.PI * u)); fold = Math.sin(Math.PI * Math.min(1, u * 1.15)); }
    const J = L.joints, r = j => J[j].userData.rest;
    if (L.front) {
      J[0].rotation.z = r(0) + hipA * 0.85 + fold * 0.25;
      J[1].rotation.z = r(1) - fold * 1.7 + Math.max(0, -hipA) * 0.1;
      J[2].rotation.z = r(2) - fold * 0.7 + (p < ds ? Math.sin(Math.PI * p / ds) * 0.35 : 0);
    } else {
      J[0].rotation.z = r(0) + hipA * 0.75 - fold * 0.1;
      J[1].rotation.z = r(1) - fold * 0.45;
      J[2].rotation.z = r(2) + fold * 0.85;
      J[3].rotation.z = r(3) - fold * 0.6 + (p < ds ? Math.sin(Math.PI * p / ds) * 0.3 : 0);
    }
  }
  // thân: nhún 1 lần mỗi sải (pha bay), chúi đầu lên xuống; mèo/sói: lưng co duỗi
  A.body.position.y = 0.05 * Math.cos(TAU * (ph - 0.75)) * (A.D.rotary ? 1.2 : 1);
  A.body.rotation.z = 0.07 * Math.sin(TAU * (ph + 0.15));
  if (D.flex) A.body.scale.x = 1 + D.flex * Math.sin(TAU * (ph - 0.3));
  A.neck.rotation.z = D.neckTilt - 0.1 * Math.sin(TAU * (ph + 0.1));
  A.head.rotation.z = 0.08 * Math.sin(TAU * (ph + 0.35));
  A.tail.rotation.z = D.tailLift + 0.12 * Math.sin(TAU * ph * 2);
  A.tail.rotation.y = 0.15 * Math.sin(TAU * ph);
}

const CHASE_PAIRS = [["pronghorn", "lioness"], ["horse", "lioness"], ["pronghorn", "wolf"], ["horse", "wolf"], ["horse", "horse"]];   // [con chạy trốn, con đuổi]
export function createChase(scene) {
  let C = null, t = 0, wait = 10 + Math.random() * 10;
  const Z = -118;
  const dustTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d"), gr = x.createRadialGradient(32, 32, 2, 32, 32, 31); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.5, "rgba(255,255,255,.45)"); gr.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); return t; })();
  const puffs = [];
  function dust(x, y, z, s) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: dustTex, color: 0xd9b48c, transparent: true, depthWrite: false, opacity: 0.5, fog: true }));
    sp.position.set(x, y + 0.3 * s, z); scene.add(sp);
    puffs.push({ sp, t: 0, life: 1.1 + Math.random() * 0.8, s0: (0.7 + Math.random() * 0.5) * s, vx: (Math.random() - 0.5) * 1.2, vy: 0.4 + Math.random() * 0.6 });
  }
  function spawn(camX) {
    const [pk, ck] = CHASE_PAIRS[Math.floor(Math.random() * CHASE_PAIRS.length)], dir = Math.random() < 0.5 ? 1 : -1;
    const mk = k => { const A = buildReal(k); A.g.rotation.order = "YZX"; scene.add(A.g); return A; };
    const prey = mk(pk), chaser = mk(ck);
    const x0 = camX - dir * 95;
    C = { dir, prey, chaser, px: x0, cx: x0 - dir * 9, pz: Z, cz: Z + 1.5, t: 0, speed: 11 + Math.random() * 2.5, pd: 0, cd: 0 };
    return true;
  }
  function kill() { for (const A of [C.prey, C.chaser]) { scene.remove(A.g); A.g.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); } C = null; }
  function place(A, x, z, ox, oz, dt, spd, key) {
    const dx = x - ox, dz = z - oz, yaw = Math.atan2(-dz, dx);
    const y = groundHeight(x, z), s = A.g.scale.x;
    const fx = Math.cos(yaw), fz = -Math.sin(yaw), slope = (groundHeight(x + fx * 1.5, z + fz * 1.5) - groundHeight(x - fx * 1.5, z - fz * 1.5)) / 3;
    A.g.position.set(x, y - 0.03, z); A.g.rotation.y = yaw; A.g.rotation.z = Math.atan(slope) * 0.8;
    gallop(A, dt, spd / A.D.run);
    C[key] += dt; if (C[key] > 0.07) { C[key] = 0; dust(x - fx * 0.9 * s, y, z - fz * 0.9 * s, s); }
  }
  return {
    trigger(camX) { if (C) kill(); return spawn(camX); },
    get active() { return C; },
    update(dt, camX) {
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i]; p.t += dt; const k = p.t / p.life;
        p.sp.position.x += p.vx * dt; p.sp.position.y += p.vy * dt * (1 - k);
        p.sp.scale.setScalar(p.s0 * (1 + k * 2.2)); p.sp.material.opacity = 0.45 * (1 - k) * Math.min(1, p.t * 8);
        if (k >= 1) { scene.remove(p.sp); p.sp.material.dispose(); puffs.splice(i, 1); }
      }
      if (!C) { t += dt; if (t > wait) { spawn(camX); t = 0; } return; }
      C.t += dt;
      const ox = C.px, oz = C.pz, ocx = C.cx, ocz = C.cz;
      // con chạy trốn: lượn đổi hướng; con đuổi: lúc áp sát, lúc bị bỏ lại (khoảng cách co giãn)
      const sp = C.speed * (1 + 0.06 * Math.sin(C.t * 0.9));
      C.px += C.dir * sp * dt; C.pz = Z + Math.sin(C.t * 0.8) * 3.5 + Math.sin(C.t * 1.9) * 1.2;
      const gap = 5.5 + 3 * Math.sin(C.t * 0.55 + 1), tx = C.px - C.dir * gap, tz = Z + Math.sin((C.t - 0.35) * 0.8) * 3.5 + Math.sin((C.t - 0.35) * 1.9) * 1.2;
      C.cx += C.dir * sp * dt + (tx - C.cx) * Math.min(1, dt * 1.5); C.cz += (tz - C.cz) * Math.min(1, dt * 2.0);
      const cs = Math.hypot(C.cx - ocx, C.cz - ocz) / Math.max(dt, 1e-4);
      place(C.prey, C.px, C.pz, ox, oz, dt, sp, "pd"); place(C.chaser, C.cx, C.cz, ocx, ocz, dt, cs, "cd");
      if ((C.px - camX) * C.dir > 105) { kill(); wait = 25 + Math.random() * 25; }
    },
  };
}
