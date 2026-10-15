// =============================================================
// SPEED RUN 3D — XE 3D THẬT mẫu 3j (15/10/2026) = sr3d-car-3i.js + thầy chỉnh:
//   · BUỒNG LÁI THẬT: mũi xe nhìn từ ghế lái = CHÍNH mũi xe đang chọn (bản sao xe, CẮT bằng mặt phẳng ở chân kính chắn gió — clippingPlanes,
//     lõi phải bật renderer.localClippingEnabled); mắt tài xế (eye/look) tính theo từng xe: sau chân kính 0,32 m, cao hơn mép capô 0,15 m.
//     Chân kính = điểm đầu tiên (từ mũi ra sau) tia chiếu xuống trúng vật liệu KÍNH.
//   · BIỂN SỐ "ANDREW TEAM" trước + sau: xe có mảnh biển gốc (License_Plate / ManufacturerPlate) ⇒ ẩn biển gốc, đặt đúng chỗ đó;
//     không có ⇒ dò mặt cản (tia ngang, lấy chỗ mặt phẳng quay ra ngoài ở độ cao gần 0,45 m sau / 0,36 m trước).
//   · TRÚNG TÊN LỬA: burn() chọn 1 điểm trên thân (tia từ bên hông/nóc) ⇒ lõi phun LỬA + khói tại đó ~2,6 s, rồi vết CHÁY ĐEN loang lổ
//     (DecalGeometry dán lên chính mảnh thân) hiện dần và ở lại tới hết trận (clearBurns khi đua lại).
// ---- gốc 3i ----
// SPEED RUN 3D — XE 3D THẬT trong game (mẫu 3i, 15/10/2026)
// Bọc xe Sketchfab (sr3d-xe3d.js) thành ĐÚNG giao diện makeCar của sr3d-car-1.js để lõi game dùng như cũ:
//   { rig, body, M, wheels, update(dt, {dist, accel, brake, steer, boost, t}), dispose() }
// rig → body (nhún/nghiêng) → xe đã chuẩn hóa (mũi −z, bánh y 0). M đo từ khung bao thật: L, W, r (bán kính bánh), top/roof (độ cao nóc
// đo bằng tia chiếu từ trên xuống ⇒ bệ tên lửa đặt đúng trên nóc, không bị cánh gió đánh lừa).
// Bánh QUAY: nhận mảnh TRÒN ở 4 góc (xem chú thích ở dưới) ⇒ mỗi góc 1 trục quay; mẫu gộp cả 4 bánh vào 1 mảnh ⇒ không quay (vẫn chạy được).
// Đèn PHANH: vật liệu tên tail/brake/rear light/stop… ⇒ sáng đỏ khi phanh. Mọi vật liệu qua `bend` (thế giới cong).
// =============================================================
import * as THREE from "three";
import { DecalGeometry } from "three/addons/geometries/DecalGeometry.js";
import { XE, buildXe, setPaint } from "./sr3d-xe3d.js";

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const WHEEL_RE = /wheel|rim|tyre|tire|jante|pneu|rueda|llanta|felge|reifen|disc|disk|brake_?rotor|hub/i;
const NOT_WHEEL_RE = /steer|volant|spare|interior|cockpit|seat|calip|callip/i;
const TAIL_RE = /tail|brake_?light|rear_?light|stop_?light|lig?ht_?red|backlight|light_?r(ear)?\b|LIGT_RED/i;

// biển số ANDREW TEAM (EU dài 520 × 110 mm): nền trắng, viền đen, dải màu đội bên trái có chữ AT
const PLATE = {};
function plateTex(color) {
  if (PLATE[color]) return PLATE[color];
  const c = document.createElement("canvas"); c.width = 1024; c.height = 216; const g = c.getContext("2d");
  const rr = (x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  g.fillStyle = "#111"; rr(0, 0, 1024, 216, 26); g.fill();
  g.fillStyle = "#f4f5f2"; rr(10, 10, 1004, 196, 18); g.fill();
  g.fillStyle = color; rr(10, 10, 118, 196, 18); g.fill(); g.fillRect(90, 10, 38, 196);
  g.fillStyle = "#fff"; g.font = "italic 900 54px 'Exo 2', 'Arial Black', sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("AT", 69, 112);
  g.strokeStyle = "#111"; g.lineWidth = 7; rr(22, 22, 980, 172, 12); g.stroke();
  g.fillStyle = "#111"; g.font = "italic 900 124px 'Exo 2', 'Arial Black', sans-serif"; g.fillText("ANDREW TEAM", 570, 116, 840);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return (PLATE[color] = t);
}
// vết cháy: mảng đen loang lổ, mép rách (nhiều đốm chồng nhau), lõi hơi nâu cháy
let SCORCH = null;
function scorchTex() {
  if (SCORCH) return SCORCH;
  const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d");
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let k = 0; k < 70; k++) {
    const a = rnd() * Math.PI * 2, d = Math.pow(rnd(), 0.8) * 92, x = 128 + Math.cos(a) * d, y = 128 + Math.sin(a) * d, r = 14 + rnd() * 38 * (1 - d / 140);
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(8,6,5,${0.55 + rnd() * 0.35})`); gr.addColorStop(0.7, "rgba(12,9,7,.35)"); gr.addColorStop(1, "rgba(12,9,7,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  const core = g.createRadialGradient(128, 128, 0, 128, 128, 60); core.addColorStop(0, "rgba(40,22,10,.55)"); core.addColorStop(1, "rgba(40,22,10,0)");
  g.fillStyle = core; g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return (SCORCH = t);
}
const isGlass = m => !!m && m.transparent && /glass|window|wind|luna|vetro|vitre|win_|crist/i.test(m.name) && !/head|tail|light|red|badge|turn|int/i.test(m.name);
const PLATE_RE = /licen[sc]e_?plate(?!_?light)|manufacturer_?plate|number_?plate/i;

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
  // 3j: lõi chuyển xe sang lớp riêng của đội ⇒ tia phải quét MỌI lớp (burn sau này)
  const ray = new THREE.Raycaster(), meshes = []; ray.layers.enableAll(); xe.traverse(o => { if (o.isMesh && !(o.material.transparent && o.material.opacity < 0.5)) meshes.push(o); });
  let roofY = sz.y * 0.85, roofZ = 0, best = -1;
  for (let k = 0; k <= 10; k++) {
    const z = lerp(-0.25, 0.12, k / 10) * sz.z;
    ray.set(new THREE.Vector3(0, sz.y + 2, z), new THREE.Vector3(0, -1, 0));
    const h = ray.intersectObjects(meshes, false)[0];
    if (h && h.point.y > best && h.point.y < sz.y * 0.98) { best = h.point.y; roofZ = z; }
  }
  if (best > 0.6) roofY = best;

  // ---- 3j: chân kính chắn gió (zWS) + mép capô (hoodY) + mắt tài xế ----
  const all = []; xe.traverse(o => { if (o.isMesh) all.push(o); });
  const DOWN = new THREE.Vector3(0, -1, 0), V = (x, y, z) => new THREE.Vector3(x, y, z);
  let zWS = null;
  for (let z = -sz.z / 2 + 0.3; z < roofZ + 0.3 && zWS == null; z += 0.03)
    for (const x of [0, 0.22, -0.22]) {
      ray.set(V(x, sz.y + 2, z), DOWN); const h = ray.intersectObjects(all, false)[0];
      if (h && h.point.y > 0.55 && isGlass(h.object.material)) { zWS = z; break; }
    }
  if (zWS == null) zWS = roofZ - 0.9;
  let hoodY = 0;
  for (const x of [0, 0.25, -0.25, 0.45, -0.45]) { ray.set(V(x, sz.y + 2, zWS - 0.06), DOWN); const h = ray.intersectObjects(meshes, false).find(q => !isGlass(q.object.material)); if (h) hoodY = Math.max(hoodY, h.point.y); }
  if (hoodY < 0.5) hoodY = 0.85;
  // mắt SÁT mép capô (cao hơn 0,15 m, sau chân kính 0,32 m): màn chỉ thấy được tới ~25° dưới tầm mắt (dưới nữa là bảng điều khiển) ⇒ mắt cao thì capô
  // (siêu xe dốc xuống rất nhanh) lọt hết xuống dưới bảng; mắt thấp ⇒ capô + 2 vè trước nằm gọn trong khung như capô giả của mẫu cũ
  const eye = V(0, hoodY + 0.15, zWS + 0.32), look = V(0, eye.y - 0.24, eye.z - 9);
  const zCut = zWS + 0.02;

  // ---- 3j: biển số ANDREW TEAM trước + sau ----
  const plates = [], plateM = bend(new THREE.MeshStandardMaterial({ map: plateTex(color), roughness: 0.38, metalness: 0.1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  const plateG = new THREE.PlaneGeometry(0.46, 0.098);
  const addPlate = (p, rear) => { const m = new THREE.Mesh(plateG, plateM); m.position.copy(p); m.rotation.y = rear ? 0 : Math.PI; body.add(m); plates.push(m); };
  const orig = []; xe.traverse(o => { if (o.isMesh && PLATE_RE.test(o.name + " " + (o.parent?.name || ""))) orig.push(o); });
  const done = { rear: false, front: false };
  orig.forEach(o => { const b = new THREE.Box3().setFromObject(o), c = b.getCenter(V(0, 0, 0)); const rear = c.z > 0; if (done[rear ? "rear" : "front"]) { o.visible = false; return; }
    o.visible = false; done[rear ? "rear" : "front"] = true; addPlate(V(0, c.y, rear ? b.max.z + 0.012 : b.min.z - 0.012), rear); });
  for (const rear of [true, false]) {
    if (done[rear ? "rear" : "front"]) continue;
    const yGoal = rear ? 0.45 : 0.36, dir = V(0, 0, rear ? -1 : 1); let pick = null;
    for (let y = 0.26; y <= 0.66; y += 0.02) {
      ray.set(V(0, y, rear ? sz.z : -sz.z), dir); const h = ray.intersectObjects(meshes, false)[0];
      if (!h || !h.face) continue;
      const n = h.face.normal.clone().transformDirection(h.object.matrixWorld);
      if ((rear ? n.z : -n.z) < 0.8 || Math.abs(h.point.z) < sz.z * 0.4) continue;
      // cả 2 mép biển (±0,2 m) cũng phải trúng gần cùng độ sâu ⇒ chỗ phẳng đủ rộng
      let flat = true; for (const x of [-0.2, 0.2]) { ray.set(V(x, y, rear ? sz.z : -sz.z), dir); const q = ray.intersectObjects(meshes, false)[0]; if (!q || Math.abs(q.point.z - h.point.z) > 0.07) flat = false; }
      if (!flat) continue;
      const sc = Math.abs(y - yGoal); if (!pick || sc < pick.sc) pick = { sc, p: V(0, y, h.point.z + (rear ? 0.014 : -0.014)) };
    }
    if (pick) addPlate(pick.p, rear);
  }

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
  const burns = [];
  return {
    rig, body, M, wheels, id, eye, look,
    /** mũi xe nhìn từ ghế lái: bản sao xe CẮT ở chân kính (giữ phần z ≤ zCut) + tấm táp-lô tối phía sau. update() mỗi khung trước khi vẽ. */
    hoodView() {
      const h = buildXe(id); setPaint(h, color);
      const local = new THREE.Plane(V(0, 0, -1), zCut), wp = new THREE.Plane(), hm = new Set();
      h.traverse(o => { if (!o.isMesh) return; o.frustumCulled = false; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => hm.add(m)); if (PLATE_RE.test(o.name + " " + (o.parent?.name || ""))) o.visible = false; });
      hm.forEach(m => { m.clippingPlanes = [wp]; m.fog = false; bend(m); });
      const dg = new THREE.PlaneGeometry(2.6, 1.2).rotateX(-Math.PI / 2 + 0.12).translate(0, hoodY - 0.03, zCut + 0.62);
      const dm = new THREE.MeshStandardMaterial({ color: "#121418", roughness: 0.92, fog: false });
      const grp = new THREE.Group(); grp.add(h, new THREE.Mesh(dg, dm));
      return { grp, update() { grp.updateMatrixWorld(true); wp.copy(local).applyMatrix4(grp.matrixWorld); },
        dispose() { hm.forEach(m => m.dispose()); dg.dispose(); dm.dispose(); } };
    },
    /** trúng tên lửa: chọn chỗ cháy trên thân ⇒ { p, n } (toạ độ body); lõi phun lửa ở đó; vết cháy hiện dần sau `delay` giây */
    burn(delay = 2.2) {
      body.updateMatrixWorld(true);
      const inv = body.matrixWorld.clone().invert();
      const paint = new Set(xe.userData.paint), wheelSet = new Set(); wheels.forEach(w => w.g.traverse(o => wheelSet.add(o)));
      for (let k = 0; k < 24; k++) {
        // chỗ cháy phải là THÂN SƠN (vết đen nổi trên màu đội) — 16 lần đầu chỉ nhận vật liệu sơn, sau đó nhận mọi chỗ trừ bánh; tia hông cao 0,55–0,9 m
        const side = Math.random() < 0.5 ? -1 : 1, z = (Math.random() - 0.5) * M.L * 0.62, top = Math.random() < 0.5;
        const o = top ? V((Math.random() - 0.5) * M.W * 0.5, M.top[0][1] + 2, z) : V(side * (M.W + 1.5), 0.55 + Math.random() * 0.35, z);
        const oW = body.localToWorld(o.clone()), dW = top ? V(0, -1, 0) : body.localToWorld(V(-side, 0, 0)).sub(body.localToWorld(V(0, 0, 0))).normalize();
        ray.set(oW, dW); const h = ray.intersectObjects(meshes, false)[0];
        if (!h || !h.face || wheelSet.has(h.object) || h.point.y < 0.42 || (k < 16 && paint.size && !paint.has(h.object.material))) continue;
        const nW = h.face.normal.clone().transformDirection(h.object.matrixWorld);
        let geo; try {
          const ori = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), nW));
          ori.z = Math.random() * Math.PI * 2;
          geo = new DecalGeometry(h.object, h.point, ori, V(0.95, 0.95, 0.7));
        } catch (e) { continue; }
        if (!geo.attributes.position || geo.attributes.position.count < 3) { geo.dispose(); continue; }
        geo.applyMatrix4(inv);
        const m = bend(new THREE.MeshStandardMaterial({ map: scorchTex(), transparent: true, opacity: 0, depthWrite: false, roughness: 1, metalness: 0, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
        const d = new THREE.Mesh(geo, m); d.layers.mask = rig.layers.mask; d.frustumCulled = false; body.add(d);
        burns.push({ d, m, t: -delay });
        return { p: h.point.clone().applyMatrix4(inv), n: nW.clone().transformDirection(inv).normalize() };
      }
      return null;
    },
    clearBurns() { burns.forEach(b => { body.remove(b.d); b.d.geometry.dispose(); b.m.dispose(); }); burns.length = 0; },
    update(dt, { dist = 0, accel = 0, brake = 0, steer = 0, boost = 0, t = 0 } = {}) {
      const spin = -dist / M.r;
      wheels.forEach(w => { w.g.rotation.x = spin; w.steer.rotation.y = w.front ? clamp(-steer * 0.08, -0.35, 0.35) : 0; });
      pitch = lerp(pitch, clamp(-accel * 0.0045, -0.05, 0.05), 1 - Math.exp(-dt * 6));
      roll = lerp(roll, clamp(steer * 0.035, -0.12, 0.12), 1 - Math.exp(-dt * 7));
      body.rotation.x = pitch; body.rotation.z = roll;
      body.position.y = Math.sin(t * 23 + num) * 0.006 * clamp(Math.abs(accel) / 10 + 0.3, 0, 1);
      const b = brake > 0.05 ? 1 : 0;
      if (b !== braking) { braking = b; tails.forEach(m => { if (b) { m.emissive.setRGB(1, 0.05, 0.03); m.emissiveIntensity = 4; } else { m.emissive.copy(m.userData.e0); m.emissiveIntensity = m.userData.i0; } }); }
      burns.forEach(b => { b.t += dt; b.m.opacity = 0.93 * clamp(b.t / 1.4, 0, 1); });   // vết cháy hiện dần khi lửa tàn
      flameU.uT.value = t; flameU.uK.value = clamp(boost, 0, 1);
      flames.forEach(f => { f.scale.set(1, 1, 0.3 + boost * 1.4 + Math.random() * 0.15 * boost); f.visible = boost > 0.03; });
    },
    dispose() { own.forEach(g => g.dispose()); mats.forEach(m => m.dispose()); shadowM.dispose(); flameM.dispose(); plateM.dispose(); plateG.dispose(); burns.forEach(b => { b.d.geometry.dispose(); b.m.dispose(); }); }
  };
}
