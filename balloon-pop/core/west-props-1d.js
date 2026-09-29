// Phụ kiện cảnh viễn tây — bản 1d (29/9/2026)
// • cỏ thẻ cong nhiều loại (cỏ khô cao có bông, cỏ vàng xanh, cỏ lún phún) · đá sa thạch chi tiết (lưới mịn, vân lớp, khe tối)
// • xương rồng tai thỏ (opuntia) mọc NỐI NHAU từ gốc · saguaro cao, gân sâu, ngọn tròn
// • chữ kiểu HOLLYWOOD trên đồi xa ("ANDREW CLASSES", "NO HOMEWORK - NO FUN") lần lượt từng bảng
// • lạc đà thỉnh thoảng chạy ra xem đoàn tàu rồi chạy đi · đàn chim đuổi nhau, đôi khi có đại bàng rượt
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

export function mulberry(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function makeNoise(seed) {
  const r = mulberry(seed), perm = new Uint8Array(512), p = [...Array(256).keys()];
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const g = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]];
  const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
  const dot = (h, x, y) => { const v = g[h & 7]; return v[0] * x + v[1] * y; };
  return (x, y) => {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, xf = x - Math.floor(x), yf = y - Math.floor(y), u = fade(xf), v = fade(yf);
    const aa = perm[perm[X] + Y], ab = perm[perm[X] + Y + 1], ba = perm[perm[X + 1] + Y], bb = perm[perm[X + 1] + Y + 1];
    const x1 = dot(aa, xf, yf) + u * (dot(ba, xf - 1, yf) - dot(aa, xf, yf));
    const x2 = dot(ab, xf, yf - 1) + u * (dot(bb, xf - 1, yf - 1) - dot(ab, xf, yf - 1));
    return x1 + v * (x2 - x1);
  };
}
const N3 = makeNoise(71);
const n3 = (x, y, z) => N3(x + z * 0.71, y - z * 0.43) * 0.6 + N3(y * 1.3 + 5, z * 1.3 - x * 0.5) * 0.4;
function canvasTexture(w, h, draw, repeat = false) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// ============================================================ CỎ
// thẻ cắt chéo, mỗi thẻ có 3 đốt để uốn cong ra ngoài (trông có khối), pháp tuyến hướng lên
export function bentCards(n, w, h, bend) {
  const parts = [];
  for (let i = 0; i < n; i++) {
    const g = new THREE.PlaneGeometry(w, h, 2, 3); g.translate(0, h / 2, 0);
    const p = g.attributes.position;
    for (let k = 0; k < p.count; k++) { const y = p.getY(k) / h; p.setZ(k, p.getZ(k) + y * y * bend * (Math.abs(p.getX(k)) / (w / 2) * 0.5 + 0.5)); }
    g.rotateY(i * Math.PI / n + (i % 2) * 0.2);
    const nr = g.attributes.normal; for (let k = 0; k < nr.count; k++) nr.setXYZ(k, 0, 1, 0);
    parts.push(g);
  }
  return mergeGeometries(parts);
}
// kind: "tall" cỏ khô cao có bông · "tuft" cỏ vàng xanh búi dày · "stub" cỏ lún phún thấp
export function grassTexture(kind) {
  return canvasTexture(1024, 1024, (ctx, w, h) => {
    const r = mulberry(kind.length * 97 + 3);
    const count = kind === "stub" ? 520 : kind === "tuft" ? 440 : 300;
    const pal = kind === "tuft" ? [[176, 176, 84], [150, 160, 70], [214, 196, 104], [128, 146, 62]]
      : kind === "stub" ? [[200, 176, 110], [178, 160, 96], [150, 140, 84], [222, 200, 140]]
        : [[226, 204, 140], [206, 182, 118], [238, 222, 168], [180, 162, 104]];
    for (let i = 0; i < count; i++) {
      const spread = kind === "stub" ? 0.8 : 0.36;
      const x0 = w / 2 + (r() - 0.5) * w * spread;
      const len = h * (kind === "stub" ? 0.18 + r() * 0.35 : kind === "tuft" ? 0.4 + r() * 0.5 : 0.5 + r() * 0.48);
      const lean = (r() - 0.5) * w * (kind === "tall" ? 0.55 : 0.45), wid = (kind === "stub" ? 2 : 3) + r() * 4;
      const c = pal[Math.floor(r() * pal.length)];
      const grd = ctx.createLinearGradient(0, h, 0, h - len);
      grd.addColorStop(0, `rgb(${c[0] * 0.45 | 0},${c[1] * 0.45 | 0},${c[2] * 0.4 | 0})`);
      grd.addColorStop(0.5, `rgb(${c[0] * 0.85 | 0},${c[1] * 0.85 | 0},${c[2] * 0.8 | 0})`);
      grd.addColorStop(1, `rgb(${Math.min(255, c[0] * 1.08) | 0},${Math.min(255, c[1] * 1.08) | 0},${c[2] | 0})`);
      ctx.strokeStyle = grd; ctx.lineCap = "round";
      // lá thon dần: vẽ 3 đoạn với bề dày giảm dần
      const pts = []; for (let k = 0; k <= 3; k++) { const t = k / 3; pts.push([x0 + lean * t * t * (0.7 + r() * 0.3) + (r() - 0.5) * 6, h - len * t]); }
      for (let k = 0; k < 3; k++) { ctx.lineWidth = wid * (1 - k * 0.3); ctx.beginPath(); ctx.moveTo(pts[k][0], pts[k][1]); ctx.lineTo(pts[k + 1][0], pts[k + 1][1]); ctx.stroke(); }
      if (kind === "tall" && r() < 0.35) {   // bông cỏ
        const [tx, ty] = pts[3];
        for (let s = 0; s < 9; s++) { ctx.fillStyle = `rgba(${240},${226},${180},${0.9})`; ctx.beginPath(); ctx.ellipse(tx + (r() - 0.5) * 10, ty + s * 6, 3.5, 7, (r() - 0.5), 0, 7); ctx.fill(); }
      }
      if (kind === "tuft" && r() < 0.1) { const [tx, ty] = pts[3]; ctx.fillStyle = "rgb(236,200,70)"; ctx.beginPath(); ctx.arc(tx, ty, 5 + r() * 4, 0, 7); ctx.fill(); }
    }
  });
}

// ============================================================ ĐÁ SA THẠCH
export function makeRockKit() {
  const protos = [];
  for (let s = 0; s < 4; s++) {
    const g = new THREE.IcosahedronGeometry(1, 5), p = g.attributes.position, col = new Float32Array(p.count * 3);
    const cBase = new THREE.Color(0xb86d3e), cLight = new THREE.Color(0xd9a06d), cDark = new THREE.Color(0x6e3a20), cTop = new THREE.Color(0xd8b08a), c = new THREE.Color();
    const sx = 1 + s * 0.25, ph = s * 3.7;
    for (let i = 0; i < p.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(p, i);
      const big = n3(v.x * 0.9 + ph, v.y * 0.9, v.z * 0.9) * 0.34, mid = n3(v.x * 2.6, v.y * 2.6 + ph, v.z * 2.6) * 0.1, fine = n3(v.x * 7, v.y * 7, v.z * 7 + ph) * 0.035;
      // lớp đá nằm ngang: bậc nhẹ theo độ cao
      const d = 1 + big + mid + fine;
      v.multiplyScalar(d);
      v.y = Math.round(v.y * 5) / 5 * 0.25 + v.y * 0.75;
      if (v.y < -0.35) v.y = -0.35 + (v.y + 0.35) * 0.15;   // đáy phẳng, nằm trên đất
      v.x *= sx; v.y *= 0.62;
      p.setXYZ(i, v.x, v.y, v.z);
      const band = 0.5 + 0.5 * Math.sin(v.y * 22 + N3(v.x * 2, v.z * 2) * 2);
      c.copy(cBase).lerp(cLight, band * 0.55).lerp(cDark, Math.max(0, -(big + mid) * 2.2)).lerp(cTop, Math.max(0, v.y) * 0.5);
      c.multiplyScalar(0.92 + (Math.random() - 0.5) * 0.12);
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
    protos.push(g);
  }
  const pebble = new THREE.IcosahedronGeometry(1, 1);
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.93 });
  return { protos, pebble, mat };
}

// ============================================================ XƯƠNG RỒNG
export function makeCactusKit() {
  const sagMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.68 });
  const padMat = new THREE.MeshStandardMaterial({ map: padTexture(), roughness: 0.62 });
  const fruitMat = new THREE.MeshStandardMaterial({ color: 0xb02a4a, roughness: 0.45 });
  const flowerMat = new THREE.MeshStandardMaterial({ color: 0xf2cf3a, roughness: 0.5, emissive: 0x3a2a00 });
  // gân dọc + màu: rãnh tối, sống gân sáng (gai), gốc sẫm, ngọn sáng
  function ribbed(geo, ribs, radial, depth, yMin, yMax) {
    const p = geo.attributes.position, n = geo.attributes.normal, col = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) {
      const j = i % (radial + 1), a = j / radial * Math.PI * 2, rib = Math.cos(a * ribs);
      const d = (rib > 0 ? rib : rib * 0.6) * depth;
      p.setXYZ(i, p.getX(i) + n.getX(i) * d, p.getY(i) + n.getY(i) * d, p.getZ(i) + n.getZ(i) * d);
      const t = Math.min(1, Math.max(0, (p.getY(i) - yMin) / (yMax - yMin)));
      const ridge = Math.pow(rib * 0.5 + 0.5, 3);
      const base = [0.30 + 0.07 * t, 0.42 + 0.08 * t, 0.22 + 0.05 * t];
      const k = 0.55 + 0.45 * (rib * 0.5 + 0.5);
      col.set([base[0] * k + ridge * 0.16, base[1] * k + ridge * 0.14, base[2] * k + ridge * 0.08], i * 3);
    }
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals();
    return geo.index ? geo.toNonIndexed() : geo;
  }
  function saguaro(x, z, h, r) {
    const R = h * 0.07, parts = [];
    // thân thon nhẹ lên ngọn
    const trunk = new THREE.CylinderGeometry(R * 0.9, R * 1.04, h, 32, 14, true); trunk.translate(0, h / 2, 0);
    parts.push(ribbed(trunk, 14, 32, R * 0.12, 0, h));
    const top = new THREE.SphereGeometry(R * 0.9, 32, 10, 0, Math.PI * 2, 0, Math.PI / 2); top.scale(1, 0.8, 1); top.translate(0, h, 0);
    parts.push(ribbed(top, 14, 32, R * 0.1, 0, h));
    const arms = r() < 0.1 ? 0 : 1 + Math.floor(r() * 4);
    for (let i = 0; i < arms; i++) {
      const ang = i * (Math.PI * 2 / arms) + r() * 0.8, ay = h * (0.38 + r() * 0.28), out = R * (1.9 + r() * 1.1), up = h * (0.18 + r() * 0.25), rr = R * (0.62 + r() * 0.14);
      const dir = new THREE.Vector3(Math.cos(ang), 0, Math.sin(ang));
      const pts = [new THREE.Vector3(0, ay, 0), dir.clone().multiplyScalar(out * 0.55).setY(ay - rr * 0.1), dir.clone().multiplyScalar(out * 0.95).setY(ay + out * 0.35), dir.clone().multiplyScalar(out).setY(ay + out * 0.7 + up * 0.5), dir.clone().multiplyScalar(out * 1.02).setY(ay + out * 0.7 + up)];
      const tube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 36, rr, 24, false);
      parts.push(ribbed(tube, 11, 24, rr * 0.12, 0, h));
      const cap = new THREE.SphereGeometry(rr, 24, 8, 0, Math.PI * 2, 0, Math.PI / 2); cap.scale(1, 0.8, 1); cap.translate(pts[4].x, pts[4].y, pts[4].z);
      parts.push(ribbed(cap, 11, 24, rr * 0.1, 0, h));
    }
    const m = new THREE.Mesh(mergeGeometries(parts), sagMat); m.castShadow = true; m.receiveShadow = true;
    m.position.set(x, -0.15, z); m.rotation.y = r() * 6;
    return m;
  }
  // tai thỏ: mỗi tấm lá mọc từ mép trên tấm cha (nối liền), gốc chạm đất
  const padGeo = (() => {
    const g = new THREE.SphereGeometry(1, 26, 18), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const w = 0.52 * (1 - 0.25 * Math.max(0, -y));     // hình trứng ngược: dưới hẹp, trên rộng
      x *= w * (1 + N3(y * 3, x * 3) * 0.06); z *= 0.1 * (1 - Math.abs(y) * 0.4 + 0.25); y *= 0.66;
      p.setXYZ(i, x, y + 0.64, z);
    }
    g.computeVertexNormals(); return g;
  })();
  function opuntia(x, z, s, r) {
    const g = new THREE.Group();
    const grow = (parent, depth, tilt, yaw, sc) => {
      const pad = new THREE.Group();
      pad.rotation.set(0, yaw, tilt); pad.scale.setScalar(sc);
      const m = new THREE.Mesh(padGeo, padMat); m.castShadow = true; m.receiveShadow = true; pad.add(m);
      parent.add(pad);
      if (depth > 0) {
        const kids = 1 + Math.floor(r() * 2.2);
        for (let k = 0; k < kids; k++) {
          const joint = new THREE.Group(); joint.position.set((r() - 0.5) * 0.5, 1.18, 0); pad.add(joint);
          grow(joint, depth - 1, (r() - 0.5) * 1.1, (r() - 0.5) * 1.4, 0.72 + r() * 0.18);
        }
      } else if (r() < 0.6) {
        const n = 1 + Math.floor(r() * 3);
        for (let k = 0; k < n; k++) {
          const f = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), r() < 0.5 ? fruitMat : flowerMat);
          f.scale.set(1, 1.35, 1); f.position.set(-0.3 + k * 0.28, 1.28 - Math.abs(k - 1) * 0.06, 0); pad.add(f);
        }
      }
    };
    const bases = 2 + Math.floor(r() * 3);
    for (let i = 0; i < bases; i++) {
      const base = new THREE.Group(); base.position.set((r() - 0.5) * 0.9, -0.08, (r() - 0.5) * 0.7); g.add(base);
      grow(base, 1 + Math.floor(r() * 2), (r() - 0.5) * 0.7, r() * Math.PI, 0.9 + r() * 0.3);
    }
    g.scale.setScalar(s); g.position.set(x, 0, z); g.rotation.y = r() * 6;
    return g;
  }
  return { saguaro, opuntia };
}
function padTexture() {
  return canvasTexture(512, 512, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h * 0.45, 20, w / 2, h / 2, w * 0.6);
    g.addColorStop(0, "#9bb56a"); g.addColorStop(0.7, "#78964c"); g.addColorStop(1, "#6a6a52");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const r = mulberry(5);
    for (let i = 0; i < 1400; i++) { ctx.fillStyle = `rgba(${60 + r() * 60},${90 + r() * 50},${40 + r() * 30},.18)`; ctx.fillRect(r() * w, r() * h, 2 + r() * 5, 2 + r() * 5); }
    // mắt gai xếp lưới chéo, mỗi mắt có túm gai trắng
    for (let y = 18; y < h; y += 44) for (let x = (y / 44 % 2) * 26 + 10; x < w; x += 52) {
      const px = x + (r() - 0.5) * 6, py = y + (r() - 0.5) * 6;
      ctx.fillStyle = "#5b4a2a"; ctx.beginPath(); ctx.arc(px, py, 4.5, 0, 7); ctx.fill();
      ctx.fillStyle = "#e9dfb8"; ctx.beginPath(); ctx.arc(px, py, 2.6, 0, 7); ctx.fill();
      ctx.strokeStyle = "rgba(246,240,214,.9)"; ctx.lineWidth = 1.4;
      for (let k = 0; k < 3; k++) { const a = -1.9 + r() * 1.4; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(a) * 14, py + Math.sin(a) * 14); ctx.stroke(); }
    }
  });
}

// ============================================================ CHỮ KIỂU HOLLYWOOD TRÊN ĐỒI XA
export function createHillSigns(scene, soilMat) {
  const TEXTS = ["ANDREW CLASSES", "NO HOMEWORK - NO FUN"];
  const Z = -215, LETTER_H = 9;
  let font = null, idx = 0, cur = null, nextAt = null;
  new FontLoader().load("https://cdn.jsdelivr.net/npm/three@0.170.0/examples/fonts/helvetiker_bold.typeface.json", f => { font = f; }, undefined, () => { font = "fail"; });
  const letterMat = new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.55, metalness: 0.1 });
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x4a3a2c, roughness: 0.9 });
  function build(text, x) {
    const g = new THREE.Group(), r = mulberry(text.length * 7 + idx);
    const chars = [...text];
    let cx = 0; const glyphs = [];
    for (const ch of chars) {
      if (ch === " ") { cx += LETTER_H * 0.55; continue; }
      let geo;
      if (font && font !== "fail") { geo = new TextGeometry(ch, { font, size: LETTER_H, depth: 0.5, curveSegments: 6, bevelEnabled: false }); geo.computeBoundingBox(); }
      else { geo = new THREE.BoxGeometry(LETTER_H * 0.7, LETTER_H, 0.5); geo.translate(LETTER_H * 0.35, LETTER_H / 2, 0); geo.computeBoundingBox(); }
      const bb = geo.boundingBox, lw = (bb.max.x - bb.min.x) * 0.82;
      const m = new THREE.Mesh(geo, letterMat); m.scale.x = 0.82; m.castShadow = true; m.receiveShadow = true;
      m.position.set(cx - bb.min.x * 0.82, (r() - 0.5) * 0.8, 0); m.rotation.set(-0.12 + (r() - 0.5) * 0.05, (r() - 0.5) * 0.06, (r() - 0.5) * 0.05);
      g.add(m); glyphs.push(m);
      // giàn chống phía sau
      for (const px of [0.25, 0.75]) { const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, LETTER_H * 1.15, 6), poleMat); pole.position.set(m.position.x + lw * px, LETTER_H * 0.45, -1.1); pole.rotation.x = 0.28; g.add(pole); }
      cx += lw + LETTER_H * 0.2;
    }
    g.children.forEach(o => { o.position.x -= cx / 2; });
    // đồi đỡ chữ: gò đất thoai thoải cùng màu nền
    const hill = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), soilMat);
    hill.scale.set(cx * 0.75 + 30, 26, 36); hill.position.set(0, -4, -14); hill.receiveShadow = true;
    const signs = new THREE.Group(); signs.add(hill);
    g.position.set(0, 12.5, 12); signs.add(g);
    signs.position.set(x + cx / 2, 0, Z);
    signs.userData.width = cx;
    scene.add(signs);
    return signs;
  }
  return {
    update(camX, halfFar) {
      if (!font) return;
      if (!cur) {
        const x = nextAt == null ? camX + 10 : Math.max(nextAt, camX + halfFar + 20);
        cur = build(TEXTS[idx % TEXTS.length], x); idx++;
      } else if (cur.position.x + cur.userData.width / 2 + 45 < camX - halfFar) {
        scene.remove(cur); cur.traverse(o => { if (o.geometry && o.geometry.type !== "SphereGeometry") o.geometry.dispose(); });
        cur = null; nextAt = camX + halfFar + 90;   // bảng sau hiện một lát sau khi bảng trước đã qua
      }
    },
  };
}

// ============================================================ LẠC ĐÀ chạy ra xem tàu
export function createCamel(scene) {
  const tan = new THREE.MeshStandardMaterial({ color: 0xc39463, roughness: 0.95 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x5a3d26, roughness: 0.95 });
  const g = new THREE.Group();
  const add = (geo, mat, parent, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m; };
  const body = new THREE.Group(); body.position.y = 1.75; g.add(body);
  add(new THREE.SphereGeometry(1, 24, 16), tan, body, 0, 0, 0).scale.set(1.25, 0.62, 0.55);
  add(new THREE.SphereGeometry(0.62, 20, 14), tan, body, -0.05, 0.5, 0).scale.set(1.15, 0.95, 0.8);   // bướu
  // cổ + đầu
  const neck = new THREE.Group(); neck.position.set(1.05, 0.15, 0); body.add(neck);
  const nk = add(new THREE.CylinderGeometry(0.17, 0.26, 1.25, 12), tan, neck, 0.35, 0.35, 0); nk.rotation.z = -0.75;
  const head = new THREE.Group(); head.position.set(0.72, 0.85, 0); neck.add(head);
  add(new THREE.SphereGeometry(0.22, 16, 12), tan, head, 0.15, 0, 0).scale.set(1.9, 0.9, 0.85);
  add(new THREE.SphereGeometry(0.05, 8, 6), dark, head, 0.18, 0.1, 0.15);
  add(new THREE.SphereGeometry(0.05, 8, 6), dark, head, 0.18, 0.1, -0.15);
  add(new THREE.ConeGeometry(0.05, 0.14, 6), tan, head, -0.05, 0.2, 0.1);
  add(new THREE.ConeGeometry(0.05, 0.14, 6), tan, head, -0.05, 0.2, -0.1);
  const tail = add(new THREE.CylinderGeometry(0.04, 0.02, 0.6, 6), dark, body, -1.25, -0.1, 0); tail.rotation.z = 0.5;
  // 4 chân: đùi + ống chân có khớp gối
  const legs = [];
  for (const [lx, lz] of [[0.75, 0.28], [0.75, -0.28], [-0.8, 0.28], [-0.8, -0.28]]) {
    const hip = new THREE.Group(); hip.position.set(lx, -0.25, lz); body.add(hip);
    add(new THREE.CylinderGeometry(0.12, 0.09, 0.8, 8), tan, hip, 0, -0.4, 0);
    const knee = new THREE.Group(); knee.position.y = -0.8; hip.add(knee);
    add(new THREE.CylinderGeometry(0.075, 0.06, 0.72, 8), tan, knee, 0, -0.36, 0);
    add(new THREE.SphereGeometry(0.1, 8, 6), dark, knee, 0.03, -0.72, 0).scale.set(1.4, 0.5, 1.1);
    legs.push({ hip, knee, side: lz > 0 ? 0 : Math.PI });
  }
  g.visible = false; g.scale.setScalar(1.15);
  scene.add(g);
  let st = "wait", t = 0, wait = 14 + Math.random() * 10, dir = 1, stopX = 0, speed = 0, phase = 0;
  return {
    update(dt, camX, trainX) {
      t += dt;
      if (st === "wait") { if (t > wait) { st = "enter"; t = 0; dir = Math.random() < 0.5 ? 1 : -1; g.position.set(camX - dir * 34, 0, -16 - Math.random() * 10); stopX = camX + (Math.random() - 0.5) * 16; g.visible = true; speed = 5.5; } return; }
      let moving = true;
      if (st === "enter") { g.position.x += dir * speed * dt; g.rotation.y = dir > 0 ? 0 : Math.PI; if ((stopX - g.position.x) * dir <= 0) { st = "watch"; t = 0; } }
      else if (st === "watch") {
        moving = false;
        // quay mặt về phía đoàn tàu (trục +x của mô hình là hướng mặt)
        const want = Math.atan2(g.position.z, trainX - g.position.x);
        let d = want - g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d));
        g.rotation.y += d * Math.min(1, dt * 2);
        if (t > 5 + Math.random() * 0.02) { st = "leave"; t = 0; dir = Math.random() < 0.5 ? 1 : -1; }
      } else if (st === "leave") {
        g.position.x += dir * 6.5 * dt; g.position.z -= 2.6 * dt;
        g.rotation.y += ((dir > 0 ? 0.35 : Math.PI - 0.35) - g.rotation.y) * Math.min(1, dt * 3);
        if (Math.abs(g.position.x - camX) > 60 || t > 12) { st = "wait"; t = 0; wait = 35 + Math.random() * 30; g.visible = false; }
      }
      // dáng chạy: đùi vung, gối gập, thân nhún; đứng xem thì đầu gật nhẹ
      phase += dt * (moving ? 9 : 0);
      for (const L of legs) {
        const a = moving ? Math.sin(phase + L.side) : 0;
        L.hip.rotation.z = a * 0.55; L.knee.rotation.z = moving ? -Math.max(0, Math.sin(phase + L.side + 1.2)) * 0.9 : 0;
      }
      body.position.y = 1.75 + (moving ? Math.abs(Math.sin(phase)) * 0.1 : 0);
      neck.rotation.z = moving ? Math.sin(phase * 2) * 0.06 : Math.sin(t * 2) * 0.05 + 0.1;
      head.rotation.z = moving ? 0 : Math.sin(t * 1.3) * 0.12;
    },
  };
}

// ============================================================ ĐÀN CHIM đuổi nhau, đôi khi có ĐẠI BÀNG rượt
export function createBirdFlocks(scene) {
  const small = new THREE.MeshStandardMaterial({ color: 0x2c2420, roughness: 1, side: THREE.DoubleSide });
  const eagleMat = new THREE.MeshStandardMaterial({ color: 0x3b2716, roughness: 1, side: THREE.DoubleSide });
  const white = new THREE.MeshStandardMaterial({ color: 0xf2efe6, roughness: 1 });
  const wingGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0.25), new THREE.Vector3(0, 0, -0.35), new THREE.Vector3(0.35, 0.05, -0.1), new THREE.Vector3(1.6, 0.1, -0.35)]);
  wingGeo.setIndex([0, 1, 2, 0, 2, 3]); wingGeo.computeVertexNormals();
  function bird(eagle) {
    const g = new THREE.Group(), mat = eagle ? eagleMat : small;
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), mat); b.scale.set(1, 0.8, 2.4); g.add(b);
    if (eagle) { const h = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), white); h.position.z = 0.55; g.add(h); const t = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 6), white); t.rotation.x = -Math.PI / 2; t.position.z = -0.7; g.add(t); }
    const l = new THREE.Mesh(wingGeo, mat), r = new THREE.Mesh(wingGeo, mat); r.scale.x = -1; g.add(l, r);
    g.userData = { l, r, ph: Math.random() * 6 };
    g.scale.setScalar(eagle ? 2.4 : 1.1);
    scene.add(g); return g;
  }
  let flock = null, wait = 8 + Math.random() * 8, t = 0;
  function spawn(camX) {
    const dir = Math.random() < 0.5 ? 1 : -1;
    const n = 6 + Math.floor(Math.random() * 6);
    flock = { dir, t: 0, lead: new THREE.Vector3(camX - dir * 150, 45 + Math.random() * 15, -130 - Math.random() * 60), birds: [], eagle: null };
    for (let i = 0; i < n; i++) flock.birds.push({ m: bird(false), off: new THREE.Vector3((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 8), sp: 0.6 + Math.random() * 0.8, k: Math.random() * 6 });
    if (Math.random() < 0.5) flock.eagle = { m: bird(true), lag: 14 };
  }
  const tmp = new THREE.Vector3(), prev = new THREE.Vector3();
  return {
    update(dt, time, camX) {
      if (!flock) { t += dt; if (t > wait) { t = 0; spawn(camX); } return; }
      const F = flock; F.t += dt;
      const speed = F.eagle ? 17 : 12;
      F.lead.x += F.dir * speed * dt; F.lead.y += Math.sin(F.t * 0.7) * 3 * dt; F.lead.z += Math.cos(F.t * 0.5) * 4 * dt;
      for (const b of F.birds) {
        prev.copy(b.m.position);
        // đuổi nhau: vị trí trong đàn xoay vòng, vượt lên rồi tụt lại
        tmp.set(Math.sin(F.t * b.sp + b.k) * 7 + b.off.x, Math.cos(F.t * b.sp * 1.3 + b.k) * 3 + b.off.y, Math.sin(F.t * b.sp * 0.8 + b.k * 2) * 5 + b.off.z);
        if (F.eagle) tmp.multiplyScalar(0.7 + 0.3 * Math.sin(F.t * 3 + b.k));
        b.m.position.copy(F.lead).add(tmp);
        if (prev.lengthSq() > 0) { tmp.subVectors(b.m.position, prev); if (tmp.lengthSq() > 1e-6) b.m.lookAt(b.m.position.clone().add(tmp)); }
        const f = Math.sin(time * (F.eagle ? 18 : 13) + b.m.userData.ph) * 0.7; b.m.userData.l.rotation.z = f; b.m.userData.r.rotation.z = -f;
      }
      if (F.eagle) {
        const e = F.eagle.m; prev.copy(e.position);
        const target = F.birds[Math.floor(F.t / 3) % F.birds.length].m.position;
        e.position.copy(target).add(tmp.set(-F.dir * (6 + Math.sin(F.t * 1.7) * 4), 3 + Math.sin(F.t * 2.3) * 2.5, Math.cos(F.t * 1.1) * 3));
        if (prev.lengthSq() > 0) { tmp.subVectors(e.position, prev); if (tmp.lengthSq() > 1e-6) e.lookAt(e.position.clone().add(tmp)); }
        const f = Math.sin(time * 6 + 1) * 0.45; e.userData.l.rotation.z = f; e.userData.r.rotation.z = -f;
      }
      if (Math.abs(F.lead.x - camX) > 190 && F.t > 5) {
        [...F.birds.map(b => b.m), F.eagle && F.eagle.m].filter(Boolean).forEach(m => scene.remove(m));
        flock = null; wait = 22 + Math.random() * 25;
      }
    },
  };
}
