// =============================================================
// SPEED RUN 3D — XE ĐUA (mẫu 1, 11/10/2026)
// Dáng 5 mẫu xe CHÉP từ bãi xe cảnh phóng Rocket Race (rocket-race/game8/rr3d-launch.js:666–815, mẫu 4f):
// thân đùn từ dáng hông có vòm bánh, cabin thu hẹp dần lên nóc, kính tối, mâm 5 chấu, đèn pha/đèn hậu.
// Khác bản bãi xe: 1 đơn vị = 1 mét (bãi xe ×0,3) · mũi xe hướng −z (chiều chạy) · sơn theo MÀU ĐỘI ·
// bánh QUAY theo quãng đường · thân nhún/nghiêng (rig → body) · đèn phanh · lửa pô · số đội trên nóc · bóng blob (không shadow map).
// Mọi vật liệu đi qua `bend` (cong thế giới) để xe ở xa nằm đúng trên đường cong.
// =============================================================
import * as THREE from "three";

const TAU = Math.PI * 2;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
function canvas(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return [c, c.getContext("2d")]; }
function tex(c, srgb = true) { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }

export const MODELS = {
  lambo: { L: 4.52, W: 1.93, r: 0.34, wh: [0.85, 3.5], clr: 0.12, belt: 0.8, taper: 0.7, hl: 0.62, tl: 0.72,
    top: [[0.05, 0.3], [0.02, 0.62], [0.3, 0.9], [1.2, 1.0], [1.85, 1.16], [2.45, 1.15], [3.2, 0.82], [4.1, 0.6], [4.5, 0.36], [4.47, 0.22]],
    glass: [[1.5, 0.99], [1.92, 1.155], [2.45, 1.145], [3.17, 0.83], [2.9, 0.8], [1.7, 0.93]], roof: [1.95, 2.4] },
  porsche: { L: 4.52, W: 1.85, r: 0.34, wh: [0.95, 3.4], clr: 0.13, belt: 0.86, taper: 0.74, hl: 0.72, tl: 0.8,
    top: [[0.05, 0.35], [0.0, 0.72], [0.35, 0.95], [1.3, 1.22], [2.1, 1.3], [2.75, 1.22], [3.35, 0.88], [4.2, 0.72], [4.52, 0.45], [4.48, 0.25]],
    glass: [[1.15, 1.12], [1.72, 1.285], [2.62, 1.235], [3.32, 0.895], [3.02, 0.87], [1.38, 1.04]], roof: [1.75, 2.6] },
  ferrari: { L: 4.6, W: 1.98, r: 0.35, wh: [0.9, 3.55], clr: 0.11, belt: 0.82, taper: 0.7, hl: 0.66, tl: 0.76,
    top: [[0.05, 0.32], [0.0, 0.7], [0.4, 0.98], [1.4, 1.08], [1.95, 1.19], [2.5, 1.17], [3.2, 0.86], [4.1, 0.62], [4.6, 0.38], [4.55, 0.2]],
    glass: [[1.58, 1.06], [2.0, 1.185], [2.5, 1.165], [3.16, 0.87], [2.9, 0.84], [1.75, 0.98]], roof: [2.02, 2.46] },
  suv: { L: 4.6, W: 1.98, r: 0.42, wh: [0.8, 3.75], clr: 0.24, belt: 1.3, taper: 0.92, hl: 1.0, tl: 1.1,
    top: [[0.05, 0.5], [0.0, 1.2], [0.06, 1.88], [0.9, 1.95], [2.9, 1.95], [3.18, 1.88], [3.38, 1.32], [4.5, 1.22], [4.6, 0.8], [4.55, 0.5]],
    glass: [[0.18, 1.34], [0.22, 1.84], [2.93, 1.885], [3.26, 1.34]], roof: [0.4, 2.8] },
  sedan: { L: 5.1, W: 1.92, r: 0.36, wh: [1.1, 4.1], clr: 0.14, belt: 1.02, taper: 0.8, hl: 0.78, tl: 0.9,
    top: [[0.05, 0.4], [0.0, 0.85], [0.4, 1.0], [1.3, 1.1], [1.9, 1.45], [3.0, 1.48], [3.7, 1.1], [4.9, 0.9], [5.1, 0.6], [5.05, 0.32]],
    glass: [[1.38, 1.1], [1.93, 1.425], [3.0, 1.455], [3.66, 1.1]], roof: [2.0, 2.95] }
};

// dáng hông: x = dọc xe (0 = ĐUÔI, L = MŨI), y = cao. Đổi sang cảnh: x → −z (mũi xe chạy về −z), bề ngang z → x.
const toScene = g => g.rotateY(Math.PI / 2);
function profileShape(M) {
  const s = new THREE.Shape(), [xr, xf] = M.wh, ar = M.r * 1.13, yb = M.clr;
  s.moveTo(M.top[0][0], M.top[0][1]); s.splineThru(M.top.slice(1).map(p => new THREE.Vector2(p[0], p[1])));
  s.lineTo(M.L - 0.08, yb); s.lineTo(xf + ar, yb); s.lineTo(xf + ar, M.r); s.absarc(xf, M.r, ar, 0, Math.PI, false); s.lineTo(xf - ar, yb);
  s.lineTo(xr + ar, yb); s.lineTo(xr + ar, M.r); s.absarc(xr, M.r, ar, 0, Math.PI, false); s.lineTo(xr - ar, yb); s.lineTo(0.08, yb); s.closePath();
  return s;
}
const topOf = M => Math.max(...M.top.map(t => t[1]));
function bodyGeo(M) {
  const bev = 0.09, w = M.W - bev * 2, g = new THREE.ExtrudeGeometry(profileShape(M), { depth: w, bevelEnabled: true, bevelThickness: 0.1, bevelSize: bev, bevelSegments: 3, curveSegments: 18 });
  g.translate(-M.L / 2, 0, -w / 2);
  const p = g.attributes.position, topY = topOf(M);
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); let z = p.getZ(i);
    z *= lerp(1, M.taper, smooth(M.belt - 0.05, topY, y));
    z *= 1 - 0.13 * smooth(0.72, 1, Math.abs(x) / (M.L / 2));
    p.setZ(i, z); }
  const cols = new Float32Array(p.count * 3);                      // bậu cửa / cản dưới sơn đen
  for (let i = 0; i < p.count; i++) { const y = p.getY(i), x = p.getX(i), ends = smooth(0.8, 0.97, Math.abs(x) / (M.L / 2));
    const k = y < M.clr + 0.13 ? 0.12 : (y < M.clr + 0.3 && ends > 0.5 ? 0.18 : 1); cols.set([k, k, k], i * 3); }
  g.setAttribute("color", new THREE.BufferAttribute(cols, 3));
  g.computeVertexNormals(); return toScene(g);
}
function glassGeo(M) {
  const cx = M.glass.reduce((a, p) => a + p[0], 0) / M.glass.length, cy = M.glass.reduce((a, p) => a + p[1], 0) / M.glass.length;
  const gp = M.glass.map(([x, y]) => [cx + (x - cx) * 1.04, cy + (y - cy) * 1.06]);
  const s = new THREE.Shape(); s.moveTo(...gp[0]); gp.slice(1).forEach(pt => s.lineTo(...pt)); s.closePath();
  const topY = topOf(M), wy = y => M.W * lerp(1, M.taper, smooth(M.belt - 0.05, topY, y)) + 0.06;
  const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false, curveSegments: 4 }); g.translate(0, 0, -0.5);
  const p = g.attributes.position; for (let i = 0; i < p.count; i++) { p.setX(i, p.getX(i) - M.L / 2); p.setZ(i, p.getZ(i) * wy(p.getY(i))); }
  g.computeVertexNormals(); return toScene(g);
}
function roofGeo(M) {
  const [a, b] = M.roof, w = (M.W - 0.18) * M.taper * 0.86;
  const g = new THREE.BoxGeometry(b - a, 0.04, w); g.translate((a + b) / 2 - M.L / 2, topOf(M) - 0.005, 0);
  return toScene(g);
}
const edgeX = (M, y, front) => { const pts = profileShape(M).getPoints(48); let best = front ? -1e9 : 1e9;
  for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; if ((a.y - y) * (b.y - y) > 0 || a.y === b.y) continue;
    const x = a.x + (b.x - a.x) * (y - a.y) / (b.y - a.y); best = front ? Math.max(best, x) : Math.min(best, x); } return best; };

let RIM = null, SHADOW = null, DECAL = {};
function rimTex() {
  if (RIM) return RIM;
  const [cv, g] = canvas(256, 256); g.fillStyle = "#1a1c1f"; g.fillRect(0, 0, 256, 256);
  const r0 = g.createRadialGradient(128, 128, 20, 128, 128, 128); r0.addColorStop(0, "#f0f2f4"); r0.addColorStop(0.8, "#b9bec4"); r0.addColorStop(1, "#6d7278");
  g.fillStyle = r0; g.beginPath(); g.arc(128, 128, 124, 0, TAU); g.fill();
  g.fillStyle = "#15171a"; for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; g.beginPath(); g.moveTo(128 + Math.cos(a + 0.2) * 40, 128 + Math.sin(a + 0.2) * 40); g.arc(128, 128, 108, a + 0.2, a + TAU / 5 - 0.2); g.closePath(); g.fill(); }
  g.fillStyle = "#e9ecef"; g.beginPath(); g.arc(128, 128, 22, 0, TAU); g.fill(); g.fillStyle = "#2a2d31"; g.beginPath(); g.arc(128, 128, 9, 0, TAU); g.fill();
  return (RIM = tex(cv));
}
function shadowTex() {
  if (SHADOW) return SHADOW;
  const [cv, g] = canvas(128, 256); const r0 = g.createRadialGradient(64, 128, 10, 64, 128, 128);
  r0.addColorStop(0, "rgba(0,0,0,.8)"); r0.addColorStop(0.55, "rgba(0,0,0,.5)"); r0.addColorStop(1, "rgba(0,0,0,0)");
  g.save(); g.scale(1, 2); g.fillStyle = r0; g.translate(0, -64); g.fillRect(0, 0, 128, 256); g.restore();
  return (SHADOW = tex(cv, false));
}
function decalTex(num, color) {                       // số đội trên nóc: tròn trắng viền màu đội, số màu đội (nhìn từ máy quay cao rất rõ)
  const k = num + color; if (DECAL[k]) return DECAL[k];
  const [cv, g] = canvas(256, 256);
  g.fillStyle = "#fff"; g.beginPath(); g.arc(128, 128, 118, 0, TAU); g.fill();
  g.lineWidth = 16; g.strokeStyle = color; g.beginPath(); g.arc(128, 128, 104, 0, TAU); g.stroke();
  g.fillStyle = color; g.font = "italic 900 170px 'Exo 2', 'Arial Black', sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(num), 132, 140);
  return (DECAL[k] = tex(cv));
}
function stripeGeo(M, x0, w) {                        // sọc đua chạy THEO dáng nóc (dải mỏng ôm đường viền trên của thân, nổi 1 cm)
  const pts = new THREE.SplineCurve(M.top.map(p => new THREE.Vector2(p[0], p[1]))).getPoints(48), up = 0.1, th = 0.025;
  const s = new THREE.Shape(); s.moveTo(pts[0].x, pts[0].y + up); pts.slice(1).forEach(p => s.lineTo(p.x, p.y + up));
  for (let i = pts.length - 1; i >= 0; i--) s.lineTo(pts[i].x, pts[i].y + up - th); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false, curveSegments: 2 }); g.translate(-M.L / 2, 0, x0 - w / 2);
  g.computeVertexNormals(); return toScene(g);
}
// ----- lửa pô: nón shader nhiễu cộng sáng -----
const FLAME_VS = `uniform vec2 uBend; uniform float uBendZ; varying vec2 vUv;
void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position,1.0); float d = min(w.z - uBendZ, 0.0); w.x += uBend.x*d*d; w.y -= uBend.y*d*d; gl_Position = projectionMatrix * viewMatrix * w; }`;
const FLAME_FS = `uniform float uT; uniform float uK; uniform vec3 uCol; varying vec2 vUv;
float h(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 45758.5); }
void main(){ float y = vUv.y; float n = h(vec2(floor(vUv.x*8.0), floor((y - uT*9.0)*10.0)));
  float a = smoothstep(0.0, 0.25, y) * (1.0 - y) * (0.65 + 0.35*n) * uK;
  vec3 c = mix(vec3(1.0,0.95,0.8), uCol, smoothstep(0.55, 0.0, y));
  gl_FragColor = vec4(c * a * 2.2, a); }`;

/**
 * makeCar({ model, color, num, bend, U }) — U = uniforms chung { uBend, uBendZ } để vật liệu shader tự viết cũng cong theo.
 * Trả { rig, body, M, update(dt, { dist, accel, brake, steer, boost, t }), setDim(on), dispose() }
 */
export function makeCar({ model = "lambo", color = "#3b8cff", num = 1, bend = m => m, U }) {
  const M = MODELS[model] || MODELS.lambo;
  const rig = new THREE.Group(), body = new THREE.Group(); rig.add(body);
  const own = [];                                                // geo + mat để dispose
  const mk = (geo, mat) => { const m = new THREE.Mesh(geo, mat); own.push(geo); body.add(m); return m; };
  const team = new THREE.Color(color);
  const paint = bend(new THREE.MeshPhysicalMaterial({ color: team, vertexColors: true, roughness: 0.28, metalness: 0.45, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.2 }));
  const roofM = bend(new THREE.MeshPhysicalMaterial({ color: team, roughness: 0.28, metalness: 0.45, clearcoat: 1, clearcoatRoughness: 0.06 }));
  const glassM = bend(new THREE.MeshPhysicalMaterial({ color: "#0b0f14", roughness: 0.04, metalness: 0.85, envMapIntensity: 1.6 }));
  const stripeM = bend(new THREE.MeshStandardMaterial({ color: "#f4f6f8", roughness: 0.35, metalness: 0.1 }));
  const tireM = bend(new THREE.MeshStandardMaterial({ color: "#141517", roughness: 0.92 })), rimM = bend(new THREE.MeshStandardMaterial({ map: rimTex(), metalness: 0.8, roughness: 0.3 }));
  const headM = bend(new THREE.MeshStandardMaterial({ color: "#f4f6f8", emissive: new THREE.Color(0.9, 0.95, 1.0), emissiveIntensity: 1.4, roughness: 0.2 }));
  const tailM = bend(new THREE.MeshStandardMaterial({ color: "#5a0608", emissive: new THREE.Color(1.0, 0.04, 0.04), emissiveIntensity: 0.8, roughness: 0.3 }));
  const decalM = bend(new THREE.MeshStandardMaterial({ map: decalTex(num, color), roughness: 0.4, transparent: true, polygonOffset: true, polygonOffsetFactor: -2 }));
  const shadowM = bend(new THREE.MeshBasicMaterial({ map: shadowTex(), transparent: true, depthWrite: false, color: 0x000000, opacity: 0.9 }));
  const mats = [paint, roofM, glassM, stripeM, tireM, rimM, headM, tailM, decalM, shadowM];

  mk(bodyGeo(M), paint); mk(glassGeo(M), glassM); mk(roofGeo(M), roofM);
  mk(stripeGeo(M, -0.16, 0.16), stripeM); mk(stripeGeo(M, 0.16, 0.16), stripeM);
  const topY = topOf(M), roofMid = ((M.roof[0] + M.roof[1]) / 2 - M.L / 2);
  { const g = new THREE.PlaneGeometry(0.62, 0.62).rotateX(-Math.PI / 2); g.translate(0, topY + 0.115, -roofMid); mk(g, decalM); }   // −roofMid: dọc xe đổi chiều (mũi −z)
  // đèn: đẩy RA NGOÀI mép vát của thân (vát 0,09 m — bản bãi xe bị chìm, nhìn gần không thấy đèn).
  // Đèn hậu = 1 DẢI ngang gần hết bề rộng: góc đuổi sau lưng nhìn rõ, phanh là sáng bừng.
  { const x = edgeX(M, M.hl, true), z = -(x - M.L / 2) - 0.07;
    [-1, 1].forEach(s => { const g = new THREE.BoxGeometry(0.42, 0.08, 0.16); g.translate(s * (M.W / 2 - 0.38), M.hl, z); mk(g, headM); }); }
  { const x = edgeX(M, M.tl, false), z = -(x - M.L / 2) + 0.07, g = new THREE.BoxGeometry(M.W * 0.8, 0.075, 0.16); g.translate(0, M.tl, z); mk(g, tailM); }
  // cánh gió đuôi (xe thể thao): 2 chân + tấm cánh đen nhám, đặt trên nắp sau
  if (M.belt < 1.2) {
    const pts = new THREE.SplineCurve(M.top.map(p => new THREE.Vector2(p[0], p[1]))).getPoints(80);
    const yAt = x => { let best = pts[0]; pts.forEach(p => { if (Math.abs(p.x - x) < Math.abs(best.x - x)) best = p; }); return best.y + 0.09; };
    const xw = Math.min(0.45, M.L * 0.1), y0 = yAt(xw), zW = -(xw - M.L / 2), carbon = bend(new THREE.MeshStandardMaterial({ color: "#16181c", roughness: 0.55, metalness: 0.3 }));
    mats.push(carbon);
    [-1, 1].forEach(s => { const g = new THREE.BoxGeometry(0.06, 0.26, 0.14); g.translate(s * M.W * 0.3, y0 + 0.11, zW); mk(g, carbon); });
    const wing = new THREE.BoxGeometry(M.W * 0.94, 0.045, 0.36); wing.rotateX(-0.12); wing.translate(0, y0 + 0.25, zW + 0.04); mk(wing, carbon);
    [-1, 1].forEach(s => { const g = new THREE.BoxGeometry(0.03, 0.16, 0.4); g.translate(s * M.W * 0.47, y0 + 0.24, zW + 0.04); mk(g, roofM); });   // tấm chặn 2 đầu cánh màu đội
  }
  // bánh: lốp + mâm, mỗi bánh 1 nhóm quay quanh trục x
  const wheels = [];
  const tireG = new THREE.CylinderGeometry(M.r, M.r, 0.27, 28).rotateZ(Math.PI / 2), rimG = new THREE.CylinderGeometry(M.r * 0.68, M.r * 0.68, 0.275, 28).rotateZ(Math.PI / 2);
  own.push(tireG, rimG);
  M.wh.forEach((x, iAx) => [-1, 1].forEach(s => {
    const w = new THREE.Group(); w.position.set(s * (M.W / 2 - 0.2), M.r, -(x - M.L / 2));
    w.add(new THREE.Mesh(tireG, tireM)); w.add(new THREE.Mesh(rimG, [tireM, rimM, rimM])); rig.add(w); wheels.push({ g: w, front: iAx === 1 });
  }));
  // bóng blob tiếp đất (nằm ở rig, không nhún theo thân)
  { const g = new THREE.PlaneGeometry(M.W + 0.7, M.L + 0.9).rotateX(-Math.PI / 2); g.translate(0, 0.03, 0); own.push(g); const s = new THREE.Mesh(g, shadowM); s.renderOrder = -1; rig.add(s); }
  // lửa pô 2 ống
  const flameU = { uT: { value: 0 }, uK: { value: 0 }, uCol: { value: new THREE.Color("#ff6a1a") }, uBend: U.uBend, uBendZ: U.uBendZ };
  const flameM = new THREE.ShaderMaterial({ vertexShader: FLAME_VS, fragmentShader: FLAME_FS, uniforms: flameU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  mats.push(flameM);
  const flameG = new THREE.ConeGeometry(0.11, 1, 10, 1, true).translate(0, -0.5, 0).rotateX(-Math.PI / 2);   // đỉnh nón chĩa +z (ra sau xe)
  own.push(flameG);
  const flames = [-1, 1].map(s => { const f = new THREE.Mesh(flameG, flameM); f.position.set(s * 0.42, M.clr + 0.22, M.L / 2 + 0.02); f.renderOrder = 3; body.add(f); return f; });

  let spin = 0, pitch = 0, roll = 0;
  return {
    rig, body, M, wheels,
    /** dist: quãng đường (m) · accel: m/s² hiện tại · brake 0..1 · steer: vận tốc ngang (m/s) · boost 0..1 · t: giây */
    update(dt, { dist = 0, accel = 0, brake = 0, steer = 0, boost = 0, t = 0 } = {}) {
      spin = -dist / M.r;                                           // lăn về −z ⇒ quay quanh x âm
      wheels.forEach(w => { w.g.rotation.x = spin; w.g.rotation.y = w.front ? clamp(-steer * 0.08, -0.35, 0.35) : 0; });
      const tp = clamp(-accel * 0.0045, -0.05, 0.05);               // tăng tốc: mũi ngóc (đuôi nhún) · phanh: chúi
      pitch = lerp(pitch, tp, 1 - Math.exp(-dt * 6));
      roll = lerp(roll, clamp(steer * 0.035, -0.12, 0.12), 1 - Math.exp(-dt * 7));
      body.rotation.x = pitch; body.rotation.z = roll;
      body.position.y = Math.sin(t * 23 + num) * 0.006 * clamp(Math.abs(accel) / 10 + 0.3, 0, 1);
      tailM.emissiveIntensity = 0.8 + brake * 5;
      flameU.uT.value = t; flameU.uK.value = clamp(boost, 0, 1);
      flames.forEach(f => { f.scale.set(1, 1, 0.3 + boost * 1.4 + Math.random() * 0.15 * boost); f.visible = boost > 0.03; });
    },
    dispose() { own.forEach(g => g.dispose()); mats.forEach(m => m.dispose()); }
  };
}
