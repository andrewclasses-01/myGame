// MÔ ĐẤT NHỎ GẦN ĐƯỜNG RAY — bản 1u (29/9/2026)
// Thầy: "tăng độ chi tiết của các mô đất nhỏ ở gần đường tàu và làm vài phiên bản để tôi chọn".
// Thay khối "gờ đá hộp" cũ bằng hình dựng chi tiết (lưới mịn, rãnh xói, vân tầng, màu từng đỉnh). 5 kiểu (?mo=0..4):
// 0 hiện tại (gờ đá hộp) · 1 gò xói mòn nhỏ (Atacama thu nhỏ, cùng chất với đồi chữ) · 2 mỏm sa thạch phân tầng
// · 3 đống đá tảng + sỏi · 4 trộn gò xói mòn + mỏm sa thạch.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { makeNoise, mulberry, makeRockKit } from "./west-props-1u.js";

export const MO_STYLES = ["Hiện tại (gờ đá hộp)", "Gò xói mòn nhỏ", "Mỏm sa thạch phân tầng", "Đống đá tảng + sỏi", "Trộn gò xói + mỏm đá"];
export const MO = (() => { try { const v = parseInt(new URLSearchParams(location.search).get("mo"), 10); return v >= 0 && v < MO_STYLES.length ? v : 1; } catch { return 1; } })();
const sst = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// ---- gò xói mòn nhỏ: vòm dẹt, sống lệch, rãnh toả từ đỉnh xuống (theo góc phương vị), đáy rãnh sẫm, muối đọng chân gò
function hummock(seed) {
  // lưới cao độ: 1–2 sống đao ngắn (mặt cắt tam giác) + rãnh xói dọc sườn (nhiễu gờ tần số cao theo x) — cùng cách dựng với đồi chữ
  const N = makeNoise(seed), N2 = makeNoise(seed + 5), r = mulberry(seed), g = new THREE.PlaneGeometry(2, 2, 140, 140); g.rotateX(-Math.PI / 2);
  const ridges = [[0, (r() - 0.5) * 0.3, 0.75 + r() * 0.2, 0.42 + r() * 0.12, 1]];
  if (r() < 0.7) ridges.push([(r() - 0.5) * 0.9, (r() - 0.5) * 0.6, 0.35 + r() * 0.2, 0.3, 0.55 + r() * 0.3]);
  const ridged = (Nn, x, z) => { const v = 1 - Math.abs(Nn(x, z)); return v * v; };
  const macro = (x, z) => { let h = 0; for (const [x0, z0, a, b, hi] of ridges) { const dx = (x - x0) / a, dz = (z - z0 + Math.sin(x * 2.2 + x0) * 0.08) / b, k = 1 - Math.abs(dz) - dx * dx; if (k > 0) h = Math.max(h, hi * Math.pow(k, 1.35)); } return h; };
  const p = g.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color(), H = new Float32Array(p.count);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), m = macro(x, z);
    const e = 0.03, sl = Math.min(1, (Math.abs(macro(x + e, z) - macro(x - e, z)) + Math.abs(macro(x, z + e) - macro(x, z - e))) / (2 * e) * 0.45);
    const warp = N(x * 1.5, z * 1.5) * 0.9, fl = ridged(N, x * 9 + warp, z * 1.6) * 0.75 + ridged(N2, x * 21 + warp * 2, z * 3.2) * 0.35 - 0.5;
    const y = m + fl * 0.13 * sl * Math.min(1, m * 5) + N2(x * 4, z * 4) * 0.02;
    H[i] = m; p.setY(i, m > 0.001 ? y : -0.06);
  }
  g.computeVertexNormals();
  const nr = g.attributes.normal;
  const deep = new THREE.Color(0x6e2c16), red = new THREE.Color(0xae4a26), org = new THREE.Color(0xd47c48), hi = new THREE.Color(0xeaa672), salt = new THREE.Color(0xe6e0d4), sand = new THREE.Color(0xc27e56);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), m = H[i], rel = y - m, ny = nr.getY(i);
    c.copy(sand).lerp(red, sst(0, 0.12, m)).lerp(org, sst(0.3, 0.9, y) * 0.7);
    c.lerp(deep, sst(0, -0.08, rel) * 0.8).lerp(hi, sst(0.01, 0.06, rel) * 0.6);
    c.lerp(salt, Math.max(0, sst(0.12, 0.0, m) * 0.7 + N(x * 5, z * 5) * 0.6 - 0.4) * 0.8);
    const lit = Math.max(0, nr.getX(i) * -0.55 + ny * 0.55 + nr.getZ(i) * 0.63);   // nắng xiên vẽ sẵn như đồi chữ
    c.multiplyScalar((0.6 + 0.6 * lit) * (0.92 + N(x * 12, z * 12) * 0.08));
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  g.scale(0.5, 1, 0.5);   // bề ngang 1 đơn vị ⇒ phóng theo w khi rải
  return g;
}
// ---- mỏm sa thạch: khối trụ dẹt, các lớp đá chồng nhau lệch mép, lớp mềm bị khoét lõm, mặt trên bào mòn
function outcrop(seed) {
  const N = makeNoise(seed), r = mulberry(seed), g = new THREE.CylinderGeometry(1, 1.12, 1, 72, 28, false);
  g.translate(0, 0.5, 0);
  const p = g.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color();
  const layers = 4 + Math.floor(r() * 3), elong = 1.4 + r() * 0.9;
  const pal = [new THREE.Color(0xc9683e), new THREE.Color(0xe39a62), new THREE.Color(0xb65532), new THREE.Color(0xf0c08a), new THREE.Color(0xd47a4a)];
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const a = Math.atan2(z, x), rad = Math.hypot(x, z);
    const L = y * layers, li = Math.floor(L), lf = L - li;
    const undercut = 1 - Math.pow(Math.sin(Math.PI * lf), 2) * 0.13 * (li % 2 ? 1 : 0.5);   // lớp mềm lõm vào
    const stepIn = 1 - li * 0.07 - N(a * 2 + li, li) * 0.08;                                 // lớp trên thụt vào
    const edge = 1 + N(Math.cos(a) * 2.5 + li * 3, Math.sin(a) * 2.5) * 0.18 + N(a * 8, y * 6) * 0.04;
    const k = rad > 0.01 ? undercut * stepIn * edge : 1;
    x *= k * elong; z *= k;
    if (rad < 0.999 && y > 0.99) y += N(x * 2, z * 2) * 0.05;                                  // mặt trên gồ ghề
    p.setXYZ(i, x, y, z);
    c.copy(pal[(li + seed) % pal.length]).multiplyScalar(0.88 + lf * 0.12 + N(x * 6, y * 20) * 0.08);
    if (lf < 0.08) c.multiplyScalar(0.72);                                                    // khe giữa các lớp
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
  return g;
}
// ---- đống đá tảng: 4–7 tảng chồng + vòng sỏi dưới chân (ghép sẵn thành một hình)
function boulders(seed, RK) {
  const r = mulberry(seed), parts = [], m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  const n = 4 + Math.floor(r() * 4);
  for (let k = 0; k < n; k++) {
    const s = k === 0 ? 1 : 0.35 + r() * 0.55, geo = RK.protos[(k + seed) % RK.protos.length].clone();
    const a = r() * 6, d = k === 0 ? 0 : 0.6 + r() * 0.7;
    m4.compose(new THREE.Vector3(Math.cos(a) * d, s * 0.35 + (k > 3 ? 0.5 : 0), Math.sin(a) * d), q.setFromEuler(e.set(r() * 3, r() * 6, r() * 3)), new THREE.Vector3(s * (0.9 + r() * 0.5), s * (0.7 + r() * 0.4), s));
    geo.applyMatrix4(m4); parts.push(geo);
  }
  for (let k = 0; k < 40; k++) {   // sỏi
    const geo = RK.pebble.clone(), a = r() * 6, d = 0.9 + r() * 1.3, s = 0.05 + r() * 0.12;
    m4.compose(new THREE.Vector3(Math.cos(a) * d, s * 0.3, Math.sin(a) * d), q.setFromEuler(e.set(r() * 3, r() * 3, r() * 3)), new THREE.Vector3(s * 1.4, s * 0.7, s));
    geo.applyMatrix4(m4);
    if (!geo.attributes.color) { const cc = new Float32Array(geo.attributes.position.count * 3).fill(0.62); geo.setAttribute("color", new THREE.BufferAttribute(cc, 3)); }
    parts.push(geo);
  }
  const keep = ["position", "normal", "color"];
  parts.forEach(g => { for (const k of Object.keys(g.attributes)) if (!keep.includes(k)) g.deleteAttribute(k); if (!g.attributes.color) g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3).fill(1), 3)); });
  return mergeGeometries(parts.map(g => g.index ? g.toNonIndexed() : g));
}

export function nearMoundKit(style = MO) {
  if (style === 0) return null;
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96 });
  mat.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>" + String.fromCharCode(10) + " totalEmissiveRadiance += diffuseColor.rgb * 0.12;"); };
  const RK = makeRockKit();
  const items = [];   // { geo, mat, w: [min,max] bề ngang, h: [min,max] cao, n: số mỗi khúc }
  if (style === 1 || style === 4) for (let k = 0; k < 4; k++) items.push({ geo: hummock(700 + k * 13), mat, w: [3.2, 8], h: [1.0, 2.8], n: style === 4 ? 4 : 7 });
  if (style === 2 || style === 4) for (let k = 0; k < 4; k++) items.push({ geo: outcrop(900 + k * 11), mat, w: [1.3, 3.2], h: [1.4, 3.0], n: style === 4 ? 3 : 6 });
  if (style === 3) for (let k = 0; k < 4; k++) items.push({ geo: boulders(1100 + k * 7, RK), mat: RK.mat.clone(), w: [0.9, 2.2], h: [0.8, 1.8], n: 7 });
  if (style === 3) items.forEach(it => { it.mat.vertexColors = true; });
  return { items };
}
