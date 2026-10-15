// =============================================================
// SPEED RUN 3D — XE 3D THẬT trong game (mẫu 3i, 15/10/2026)
// Bọc xe Sketchfab (sr3d-xe3d.js) thành ĐÚNG giao diện makeCar của sr3d-car-1.js để lõi game dùng như cũ:
//   { rig, body, M, wheels, update(dt, {dist, accel, brake, steer, boost, t}), dispose() }
// rig → body (nhún/nghiêng) → xe đã chuẩn hóa (mũi −z, bánh y 0). M đo từ khung bao thật: L, W, r (bán kính bánh), top/roof (độ cao nóc
// đo bằng tia chiếu từ trên xuống ⇒ bệ tên lửa đặt đúng trên nóc, không bị cánh gió đánh lừa).
// Bánh QUAY: nhận mảnh TRÒN ở 4 góc (xem chú thích ở dưới) ⇒ mỗi góc 1 trục quay; mẫu gộp cả 4 bánh vào 1 mảnh ⇒ không quay (vẫn chạy được).
// Đèn PHANH: vật liệu tên tail/brake/rear light/stop… ⇒ sáng đỏ khi phanh. Mọi vật liệu qua `bend` (thế giới cong).
// =============================================================
import * as THREE from "three";
import { XE, buildXe, setPaint } from "./sr3d-xe3d.js";

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const WHEEL_RE = /wheel|rim|tyre|tire|jante|pneu|rueda|llanta|felge|reifen|disc|disk|brake_?rotor|hub/i;
const NOT_WHEEL_RE = /steer|volant|spare|interior|cockpit|seat|calip|callip/i;
const TAIL_RE = /tail|brake_?light|rear_?light|stop_?light|lig?ht_?red|backlight|light_?r(ear)?\b|LIGT_RED/i;

let SHADOW = null;
function shadowTex() {
  if (SHADOW) return SHADOW;
  const c = document.createElement("canvas"); c.width = 128; c.height = 256; const g = c.getContext("2d");
  const r0 = g.createRadialGradient(64, 128, 10, 64, 128, 128);
  r0.addColorStop(0, "rgba(0,0,0,.8)"); r0.addColorStop(0.55, "rgba(0,0,0,.5)"); r0.addColorStop(1, "rgba(0,0,0,0)");
  g.save(); g.scale(1, 2); g.fillStyle = r0; g.translate(0, -64); g.fillRect(0, 0, 128, 256); g.restore();
  return (SHADOW = new THREE.CanvasTexture(c));
}
const FLAME_VS = `uniform vec2 uBend; uniform float uBendZ; varying vec2 vUv;
void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position,1.0); float d = min(w.z - uBendZ, 0.0); w.x += uBend.x*d*d; w.y -= uBend.y*d*d; gl_Position = projectionMatrix * viewMatrix * w; }`;
const FLAME_FS = `uniform float uT; uniform float uK; uniform vec3 uCol; varying vec2 vUv;
float h(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 45758.5); }
void main(){ float y = vUv.y; float n = h(vec2(floor(vUv.x*8.0), floor((y - uT*9.0)*10.0)));
  float a = smoothstep(0.0, 0.25, y) * (1.0 - y) * (0.65 + 0.35*n) * uK;
  vec3 c = mix(vec3(1.0,0.95,0.8), uCol, smoothstep(0.55, 0.0, y));
  gl_FragColor = vec4(c * a * 2.2, a); }`;

const nameChain = o => { let s = "", n = o; for (let k = 0; n && k < 4; k++, n = n.parent) s += " " + (n.name || ""); return s; };

/** makeCar3d({ id, color, num, bend, U }) — xe phải được prepXe(id) xong trước (buildXe đồng bộ). */
export function makeCar3d({ id = XE[0].id, color = "#3b8cff", num = 1, bend = m => m, U }) {
  const xe = buildXe(id), cfg = xe.userData.cfg;
  setPaint(xe, color);
  const rig = new THREE.Group(), body = new THREE.Group(); rig.add(body); body.add(xe);
  const sz = xe.userData.size;                                     // x = rộng, y = cao, z = dài
  const mats = new Set();
  xe.traverse(o => { if (!o.isMesh) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => mats.add(m)); o.castShadow = o.receiveShadow = false; o.frustumCulled = false; });
  mats.forEach(m => { bend(m); if (m.envMapIntensity !== undefined) m.envMapIntensity = Math.max(m.envMapIntensity, 1.1); });
  xe.updateMatrixWorld(true);

  // ---- độ cao nóc: tia từ trên xuống ở giữa xe, dải dọc −25 % … +12 % chiều dài ----
  const ray = new THREE.Raycaster(), meshes = []; xe.traverse(o => { if (o.isMesh && !(o.material.transparent && o.material.opacity < 0.5)) meshes.push(o); });
  let roofY = sz.y * 0.85, roofZ = 0, best = -1;
  for (let k = 0; k <= 10; k++) {
    const z = lerp(-0.25, 0.12, k / 10) * sz.z;
    ray.set(new THREE.Vector3(0, sz.y + 2, z), new THREE.Vector3(0, -1, 0));
    const h = ray.intersectObjects(meshes, false)[0];
    if (h && h.point.y > best && h.point.y < sz.y * 0.98) { best = h.point.y; roofZ = z; }
  }
  if (best > 0.6) roofY = best;

  // ---- bánh: nhận theo HÌNH DẠNG (tên mảnh mỗi mẫu một kiểu): mảnh TRÒN nhìn ngang (cao ≈ dài), ở 4 góc xe, gần mặt đất.
  //   Lốp = mảnh tròn lớn nhất mỗi góc (cao 0,45–0,95 m); mâm/đĩa = mảnh tròn nhỏ hơn có tâm trùng lốp ⇒ quay cùng. Kẹp phanh không tròn ⇒ đứng yên.
  //   Mẫu gộp cả 4 bánh (hoặc bánh + thân) vào 1 mảnh ⇒ không đủ 4 góc ⇒ bánh không quay.
  const parts = [];
  xe.traverse(o => {
    if (!o.isMesh) return; const nm = nameChain(o) + " " + (Array.isArray(o.material) ? "" : o.material.name);
    if (NOT_WHEEL_RE.test(o.name + " " + (Array.isArray(o.material) ? "" : o.material.name))) return;
    const b = new THREE.Box3().setFromObject(o), s = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
    const round = Math.abs(s.y - s.z) < 0.14 * Math.max(s.y, s.z), corner = Math.abs(c.x) > sz.x * 0.25 && Math.abs(c.z) > sz.z * 0.14;
    if (round && corner && s.x < 0.6 && s.y > 0.15 && s.y < 0.95 && c.y < 0.62 && Math.abs(c.y - s.y / 2) < 0.18) parts.push({ o, b, s, c });
  });
  const groups = new Map();
  for (const key of ["LF", "RF", "LB", "RB"]) {
    const q = parts.filter(p => (p.c.x > 0 ? "R" : "L") + (p.c.z < 0 ? "F" : "B") === key);
    const tire = q.filter(p => p.s.y >= 0.45).sort((u, v) => v.s.y - u.s.y)[0];
    if (!tire) continue;
    groups.set(key, q.filter(p => p.s.y <= tire.s.y + 0.02 && Math.hypot(p.c.y - tire.c.y, p.c.z - tire.c.z) < 0.12 && Math.abs(p.c.x - tire.c.x) < 0.35));
  }
  // không đủ 4 góc ⇒ thử lại theo TÊN mảnh (wheel/rim/tyre…) như bản đầu — Aventador chỉ nhận được cách này
  if (groups.size < 4) {
    groups.clear();
    xe.traverse(o => {
      if (!o.isMesh) return; const nm = nameChain(o) + " " + (Array.isArray(o.material) ? "" : o.material.name);
      if (!WHEEL_RE.test(nm) || NOT_WHEEL_RE.test(o.name + " " + (Array.isArray(o.material) ? "" : o.material.name))) return;
      const b = new THREE.Box3().setFromObject(o), s = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
      if (Math.max(s.x, s.y, s.z) > 1.0 || s.y < 0.25 || c.y > 0.75 || Math.abs(c.x) < sz.x * 0.2 || Math.abs(c.z) < sz.z * 0.12) return;
      const key = (c.x > 0 ? "R" : "L") + (c.z < 0 ? "F" : "B");
      if (!groups.has(key)) groups.set(key, []); groups.get(key).push({ o, b });
    });
  }
  const wheels = [];
  let rSum = 0, rN = 0;
  if (groups.size === 4) for (const [key, parts] of groups) {
    const b = new THREE.Box3(); parts.forEach(p => b.union(p.b));
    const c = b.getCenter(new THREE.Vector3()), r = b.getSize(new THREE.Vector3()).y / 2;
    rSum += r; rN++;
    const piv = new THREE.Group(); piv.position.copy(c); body.add(piv);
    const spin = new THREE.Group(); piv.add(spin);
    body.updateMatrixWorld(true);
    parts.forEach(p => spin.attach(p.o));
    wheels.push({ g: spin, steer: piv, front: key[1] === "F" });
  }
  const M = { L: sz.z, W: sz.x, r: rN ? rSum / rN : 0.34, clr: 0.12, belt: 0.8, taper: 0.7,
    top: [[0, roofY]], roof: [sz.z / 2 - roofZ, sz.z / 2 - roofZ], id, name: cfg.name };   // lõi tính zr = −((roof0+roof1)/2 − L/2) = roofZ

  // ---- đèn phanh ----
  const tails = [...mats].filter(m => TAIL_RE.test(m.name) && m.emissive);
  tails.forEach(m => { m.userData.e0 = m.emissive.clone(); m.userData.i0 = m.emissiveIntensity; });

  // ---- bóng blob (lõi tách nó ra khỏi rig theo renderOrder −1) ----
  const own = [];
  const shadowM = bend(new THREE.MeshBasicMaterial({ map: shadowTex(), transparent: true, depthWrite: false, color: 0x000000, opacity: 0.9 }));
  { const g = new THREE.PlaneGeometry(M.W + 0.7, M.L + 0.9).rotateX(-Math.PI / 2); g.translate(0, 0.03, 0); own.push(g); const s = new THREE.Mesh(g, shadowM); s.renderOrder = -1; rig.add(s); }
  // ---- lửa pô ----
  const flameU = { uT: { value: 0 }, uK: { value: 0 }, uCol: { value: new THREE.Color("#ff6a1a") }, uBend: U.uBend, uBendZ: U.uBendZ };
  const flameM = new THREE.ShaderMaterial({ vertexShader: FLAME_VS, fragmentShader: FLAME_FS, uniforms: flameU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const flameG = new THREE.ConeGeometry(0.11, 1, 10, 1, true).translate(0, -0.5, 0).rotateX(-Math.PI / 2); own.push(flameG);
  const flames = [-1, 1].map(s => { const f = new THREE.Mesh(flameG, flameM); f.position.set(s * 0.36, 0.38, M.L / 2 + 0.02); f.renderOrder = 3; body.add(f); return f; });

  let pitch = 0, roll = 0, braking = -1;
  return {
    rig, body, M, wheels, id,
    update(dt, { dist = 0, accel = 0, brake = 0, steer = 0, boost = 0, t = 0 } = {}) {
      const spin = -dist / M.r;
      wheels.forEach(w => { w.g.rotation.x = spin; w.steer.rotation.y = w.front ? clamp(-steer * 0.08, -0.35, 0.35) : 0; });
      pitch = lerp(pitch, clamp(-accel * 0.0045, -0.05, 0.05), 1 - Math.exp(-dt * 6));
      roll = lerp(roll, clamp(steer * 0.035, -0.12, 0.12), 1 - Math.exp(-dt * 7));
      body.rotation.x = pitch; body.rotation.z = roll;
      body.position.y = Math.sin(t * 23 + num) * 0.006 * clamp(Math.abs(accel) / 10 + 0.3, 0, 1);
      const b = brake > 0.05 ? 1 : 0;
      if (b !== braking) { braking = b; tails.forEach(m => { if (b) { m.emissive.setRGB(1, 0.05, 0.03); m.emissiveIntensity = 4; } else { m.emissive.copy(m.userData.e0); m.emissiveIntensity = m.userData.i0; } }); }
      flameU.uT.value = t; flameU.uK.value = clamp(boost, 0, 1);
      flames.forEach(f => { f.scale.set(1, 1, 0.3 + boost * 1.4 + Math.random() * 0.15 * boost); f.visible = boost > 0.03; });
    },
    dispose() { own.forEach(g => g.dispose()); mats.forEach(m => m.dispose()); shadowM.dispose(); flameM.dispose(); }
  };
}
