// =============================================================
// SPEED RUN 3D — LÕI MẪU 2 "BUỒNG LÁI" (11/10/2026)
// Thầy (11/10, sau mẫu 1):
//   · "Chia màn hình làm 2, sử dụng góc nhìn thứ nhất làm điều khiển trong xe. Các thông số cũng hiển thị bên trong,
//      để chừa một dải trên hiện câu hỏi và bản đồ đường đua"
//   · "Sử dụng điều khiển là iPad, điều khiển trái phải, tăng tốc phanh tương tự như các game Asphalt thông thường"
//   · "Xe có trang bị tên lửa, có cơ chế bắn tương tự như rocket race, có thể tăng tốc hoặc phanh để tránh, có thể lái trái phải để tránh"
// ⇒ MÀN HÌNH: dải trên = câu hỏi đội 1 | BẢN ĐỒ đường đua | câu hỏi đội 2. Dưới = 2 nửa, mỗi nửa 1 máy quay TRONG XE của đội đó
//   (nắp capô màu đội 3D + cột kính + gương chiếu hậu + TAP-LÔ DOM: vô lăng có màn hình km/h + năng lượng, màn cảm ứng 4 đáp án + giá tên lửa + nút FIRE).
//   Tap-lô 2 đội đối xứng: màn đáp án ở MÉP NGOÀI (2 nhóm em đứng tách 2 bên bảng, như cột đáp án Rocket Race), vô lăng ở giữa.
// ⇒ LÁI kiểu Asphalt: xe TỰ CHẠY (ga tự động) khi còn năng lượng; ◀ ▶ lái liên tục trong nửa đường của đội; BOOST = chạy nhanh hơn;
//   BRAKE = phanh. Nguồn lái: iPad (padlink-2) > bàn phím (A/D/W/S/F · ←/→/↑/↓/Enter) > TỰ LÁI (không có iPad).
// ⇒ LUẬT NĂNG LƯỢNG (giữ "C lai" mẫu 1): mỗi câu ĐÚNG nạp đúng 1 ĐOẠN (80 m) quãng đường; xe chạy hết năng lượng là dừng đúng chỗ
//   (tốc độ trần √(2·DEC·E) ⇒ lăn chậm dần tới 0, không "trôi không mất tiền") ⇒ tổng quãng đường = tổng năng lượng, công bằng;
//   lái giỏi (BOOST, né tên lửa) chỉ làm tới SỚM hơn. Kho tối đa PHYS.CAP ô. SAI ⇒ phanh gấp + mất các ô ĐẦY đang dồn (giữ ô đang chạy dở).
// ⇒ TÊN LỬA (như Rocket Race): opt.streak câu đúng LIÊN TIẾP = +1 quả (tối đa opt.msMax), chạm FIRE / iPad FIRE / phím ⇒ bắn đối thủ.
//   Tên lửa bay vòng cung tới ĐIỂM RƠI DỰ ĐOÁN (vòng ngắm đỏ trên đường), khoá khi còn 1,1 s ⇒ lái lệch làn / BOOST / phanh để né.
//   Trúng ⇒ xe xoay tròn + mất opt.hitLoss ô năng lượng; sượt ⇒ khựng; trượt ⇒ "DODGED!". Không có iPad: trả lời ĐÚNG khi tên lửa đang
//   bay tới ⇒ xe tự đánh lái né (giữ luật né của Rocket Race).
// Bàn thử: window.__sr — start() · answer(team, ok) · auto(on, a0, a1) · give(team, ô) · arm(team, n) · fire(team) · drive(team, {steer,boost,brake}|null)
//          · step(n) · resume() · state() · camInfo() · missiles() · fps · res · destroy()
// =============================================================
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { Pass } from "three/addons/postprocessing/Pass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { makeCar } from "./sr3d-car-1.js";
import { createWorld, makeBend, HAZE } from "./sr3d-world-1.js";
import { makeAutoRes } from "./sr3d-autores.js";
import { createMissiles, MS } from "./sr3d-missile-2.js";

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const ease = t => t * t * (3 - 2 * t);
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// xr = biên tâm xe trong nửa đường của đội (dải phân cách bê tông ở giữa, rào hộ lan ở mép)
export const TEAMS = [{ name: "TEAM 1", color: "#3b8cff", lanes: [-2.4, -6.0], xr: [-8.3, -1.3] }, { name: "TEAM 2", color: "#ff7a00", lanes: [2.4, 6.0], xr: [1.3, 8.3] }];
// m, s: CRUISE 31 m/s ≈ 112 km/h (ga tự động) · VBOOST 47 ≈ 169 km/h · DEC = gia tốc "lăn tới chỗ hết năng lượng" · CAP = số ô tối đa
export const PHYS = { SEG: 80, CRUISE: 31, VBOOST: 47, ACC: 10, ACCB: 15, DEC: 9, HARD: 26, BRAKE: 22, LAT: 8.5, CAP: 4 };
export const DEFAULTS = { steps: 8, car: "lambo", bend: 0.75, streak: 3, msMax: 3, hitLoss: 2 };
const EYE = new THREE.Vector3(0, 1.1, 0.25), LOOK = new THREE.Vector3(0, 0.86, -9);       // mắt người lái (toạ độ THÂN xe, mũi −z), chúi 1,5°
// KHUNG NHÌN: phần 3D chỉ là khoảng TRÊN tap-lô DOM. Dịch ống kính (setViewOffset, không chúi máy ⇒ cột đèn vẫn thẳng đứng) để ĐƯỜNG CHÂN TRỜI
// nằm ở HORIZON (tỉ lệ từ mép trên của khoảng 3D). Capô 3D phủ dải dưới cùng của khoảng đó.
const HORIZON = 0.42;
const HOOD = { z0: -0.12, z1: -0.95, y0: 0.93, y1: 0.76, w: 1.9 };   // capô trong toạ độ thân xe: chân kính (z0, y0) → mũi (z1, y1)

const EMPTY = new THREE.Scene();
class SplitPass extends Pass {                        // vẽ 2 máy quay vào 2 nửa của cùng render target (MSAA) ⇒ bloom/OutputPass chạy 1 lần cho cả màn
  constructor(fn) { super(); this.fn = fn; this.needsSwap = false; }
  render(renderer, writeBuffer, readBuffer) { this.fn(renderer, readBuffer); }
}

const WHEEL_SVG = `<svg viewBox="0 0 200 200" aria-hidden="true">
  <defs><linearGradient id="srwg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3f48"/><stop offset=".5" stop-color="#16191e"/><stop offset="1" stop-color="#0b0d10"/></linearGradient></defs>
  <path d="M100 8 A92 92 0 1 1 99.9 8 Z M100 30 A70 70 0 1 0 100.1 30 Z" fill="url(#srwg)" fill-rule="evenodd" stroke="#4a515c" stroke-width="1.5"/>
  <path d="M93 8.3 h14 v20 h-14 Z" fill="var(--team)"/>
  <path d="M32 112 L58 112 L66 132 L134 132 L142 112 L168 112 L162 140 L128 160 L72 160 L38 140 Z" fill="#14171b" stroke="#3a414b" stroke-width="1.5"/>
  <path d="M30 104 L58 104" stroke="#1d2127" stroke-width="12" stroke-linecap="round"/><path d="M142 104 L170 104" stroke="#1d2127" stroke-width="12" stroke-linecap="round"/>
  <circle cx="44" cy="124" r="7" fill="#c8262b"/><circle cx="156" cy="124" r="7" fill="#16a06a"/>
</svg>`;
const MS_ICON = `<svg viewBox="0 0 24 24"><path d="M12 2c2.2 1.9 3.3 4.3 3.3 7.2V15l2.2 2.4V20l-3-1.3-.8 1.8h-3.4l-.8-1.8-3 1.3v-2.6L8.7 15V9.2C8.7 6.3 9.8 3.9 12 2z" fill="currentColor"/></svg>`;
const IPAD_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="2.5" width="16" height="19" rx="2.5"/><path d="M10.5 18.5h3"/></svg>`;

export function createSpeedRun({ mount, questions, title = "SPEED RUN", options = {}, remote = null, onEvent = () => {} }) {
  const opt = { ...DEFAULTS, ...options };
  const L = clamp(opt.steps | 0, 3, 20), SEG = PHYS.SEG, FIN = L * SEG;

  // ---------- DOM ----------
  mount.classList.add("sr-root", "sr2");
  const half = i => `
    <div class="sr-half sr-half${i}" style="--team:${TEAMS[i].color}">
      <svg class="sr-frame" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 0 H100 V3.2 C70 5.4 30 5.4 0 3.2 Z" class="roof"/>
        <path d="M0 0 L8.5 0 L3.2 100 L0 100 Z" class="pil"/><path d="M100 0 L91.5 0 L96.8 100 L100 100 Z" class="pil"/>
        <path d="M8.5 0 L3.2 100" class="edge"/><path d="M91.5 0 L96.8 100" class="edge"/>
      </svg>
      <div class="sr-mirror"><span class="sr-mir-dir"></span><span class="sr-mir-txt"></span></div>
      <div class="sr-tag"><b>${2 - i}</b><span></span></div>
      <div class="sr-alarm"><b>⚠ MISSILE</b><span class="sr-alarm-t"></span><i class="sr-alarm-bar"><em></em></i></div>
      <div class="sr-toast"></div>
      <div class="sr-dash">
        <div class="sr-console">
          <div class="sr-ans"></div>
          <div class="sr-arms"><div class="sr-ms">${MS_ICON.repeat(3)}</div><button class="sr-fire" type="button">${MS_ICON}<span>FIRE</span></button><div class="sr-streak"><i></i><i></i><i></i></div></div>
        </div>
        <div class="sr-wheelbox"><div class="sr-wheel">${WHEEL_SVG}
          <div class="sr-screen"><div class="sr-src">AUTO</div><div class="sr-kmh"><span>0</span><small>km/h</small></div><div class="sr-cells"><i></i><i></i><i></i><i></i></div></div>
        </div></div>
      </div>
    </div>`;
  mount.innerHTML = `
    <div class="sr-strip">
      ${[0, 1].map(i => `<div class="sr-qbox sr-qbox${i}" style="--team:${TEAMS[i].color}"><b class="sr-qtag">${TEAMS[i].name}</b><div class="sr-q"></div></div>`).join("")}
      <div class="sr-map"><svg viewBox="0 0 1000 230" preserveAspectRatio="xMidYMid meet"></svg><div class="sr-gap"></div>
        ${remote ? `<button class="sr-ipadbtn" type="button" title="iPad steering wheels">${IPAD_ICON}</button>` : ""}</div>
    </div>
    <div class="sr-stage">
      <canvas class="sr-canvas"></canvas>
      ${half(0)}${half(1)}
      <div class="sr-divider"></div>
      <div class="sr-center">
        <div class="sr-title">SPEED RUN</div>
        <div class="sr-sub">${esc(title)}</div>
        <div class="sr-menu-btns"><button class="sr-start" type="button">▶&nbsp; START</button>
          ${remote ? `<button class="sr-ipadbig" type="button">${IPAD_ICON}<span>iPad steering</span></button>` : ""}</div>
        <div class="sr-help">Answer right = ENERGY · 3 in a row = MISSILE · Steer, BOOST or BRAKE to dodge</div>
        <div class="sr-lights"><i></i><i></i><i></i><i></i><i></i></div>
        <div class="sr-go">GO!</div>
      </div>
      <div class="sr-banner"></div>
      <div class="sr-result"><div class="sr-res-title"></div><div class="sr-res-rows"></div><button class="sr-again" type="button">PLAY AGAIN</button></div>
      <div class="sr-panel" hidden><div class="sr-panel-box"><button class="sr-panel-x" type="button" aria-label="Close">✕</button><h2>iPad steering wheels</h2><div class="sr-panel-body"></div></div></div>
    </div>`;
  const $ = s => mount.querySelector(s), $$ = s => [...mount.querySelectorAll(s)];
  const stage = $(".sr-stage"), cvs = $(".sr-canvas"), halves = [$(".sr-half0"), $(".sr-half1")], qboxes = [$(".sr-qbox0"), $(".sr-qbox1")];
  const H = halves.map((h, i) => ({
    el: h, dash: h.querySelector(".sr-dash"), ans: h.querySelector(".sr-ans"), fire: h.querySelector(".sr-fire"), ms: [...h.querySelectorAll(".sr-ms svg")], streak: [...h.querySelectorAll(".sr-streak i")],
    wheel: h.querySelector(".sr-wheel"), kmh: h.querySelector(".sr-kmh span"), cells: [...h.querySelectorAll(".sr-cells i")], src: h.querySelector(".sr-src"),
    tag: h.querySelector(".sr-tag"), tagT: h.querySelector(".sr-tag span"), mirDir: h.querySelector(".sr-mir-dir"), mirTxt: h.querySelector(".sr-mir-txt"),
    alarm: h.querySelector(".sr-alarm"), alarmT: h.querySelector(".sr-alarm-t"), alarmBar: h.querySelector(".sr-alarm-bar em"), toast: h.querySelector(".sr-toast"), q: qboxes[i].querySelector(".sr-q")
  }));

  // ---------- renderer / cảnh ----------
  const renderer = new THREE.WebGLRenderer({ canvas: cvs, antialias: false, powerPreference: "high-performance" });
  renderer.debug.checkShaderErrors = false;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const PR_MAX = Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(PR_MAX);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(HAZE, 140, 1150);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.55;
  const KEY = new THREE.Vector3(-0.45, 0.75, 0.5).normalize();
  const key = new THREE.DirectionalLight("#ffd9b3", 2.4); key.position.copy(KEY).multiplyScalar(100); scene.add(key, key.target);
  const rim = new THREE.DirectionalLight("#ff9a5c", 1.6); rim.position.set(38, 8, -92); scene.add(rim, rim.target);
  scene.add(new THREE.HemisphereLight("#ffd7b8", "#4a5236", 0.9));
  // lớp: 0 = cảnh chung · 1/2 = thân xe đội 0/1 · 3/4 = buồng lái (capô) đội 0/1 — máy quay đội i KHÔNG thấy thân xe mình, thấy capô mình
  const cams = [0, 1].map(() => new THREE.PerspectiveCamera(62, 1, 0.08, 2600));

  const U = { uBend: { value: new THREE.Vector2() }, uBendZ: { value: 0 } };
  const bend = makeBend(U);
  const world = createWorld({ scene, U, bend, keyDir: KEY });
  world.setTrack(L, SEG);
  const median = makeMedian(); scene.add(median.g);
  const missiles = createMissiles({ scene, bend, U });

  // ---------- xe + capô ----------
  let cars = [], hoods = [];
  function buildCars() {
    cars.forEach(c => { scene.remove(c.rig); c.dispose(); }); hoods.forEach(h => h.dispose());
    cars = TEAMS.map((tm, i) => { const c = makeCar({ model: opt.car, color: tm.color, num: i + 1, bend, U }); addPods(c); c.rig.traverse(o => o.layers.set(1 + i)); scene.add(c.rig); return c; });
    hoods = TEAMS.map((tm, i) => makeHood(cars[i], tm.color, 3 + i));
  }
  function addPods(c) {                                   // 2 ống phóng tên lửa dọc 2 mép nóc + đầu đạn đỏ (hiện theo số tên lửa)
    const M = c.M, topY = Math.max(...M.top.map(p => p[1])), z = -((M.roof[0] + M.roof[1]) / 2 - M.L / 2), xo = (M.W / 2) * M.taper * 0.66;
    const tubeG = new THREE.CylinderGeometry(0.08, 0.09, 1.0, 12).rotateX(Math.PI / 2), tipG = new THREE.ConeGeometry(0.075, 0.24, 12).rotateX(-Math.PI / 2);
    const tubeM = bend(new THREE.MeshStandardMaterial({ color: "#23272e", roughness: 0.45, metalness: 0.6 })), tipM = bend(new THREE.MeshStandardMaterial({ color: "#e23a32", emissive: new THREE.Color("#ff2a1a"), emissiveIntensity: 0.5, roughness: 0.3 }));
    c.tips = [];
    [-1, 1].forEach(s => {
      const t = new THREE.Mesh(tubeG, tubeM); t.position.set(s * xo, topY + 0.09, z); c.body.add(t);
      const tip = new THREE.Mesh(tipG, tipM); tip.position.set(s * xo, topY + 0.09, z - 0.6); c.body.add(tip); c.tips.push(tip);
    });
    const d0 = c.dispose; c.dispose = () => { d0(); tubeG.dispose(); tipG.dispose(); tubeM.dispose(); tipM.dispose(); };
  }
  function hoodTex(color) {
    const cv = document.createElement("canvas"); cv.width = 256; cv.height = 256; const g = cv.getContext("2d");
    g.fillStyle = color; g.fillRect(0, 0, 256, 256);
    const gr = g.createLinearGradient(0, 0, 256, 0); gr.addColorStop(0, "rgba(0,0,0,.35)"); gr.addColorStop(0.2, "rgba(0,0,0,0)"); gr.addColorStop(0.8, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,.35)");
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    g.fillStyle = "#f4f6f8"; g.fillRect(128 - 40, 0, 26, 256); g.fillRect(128 + 14, 0, 26, 256);          // 2 sọc đua như thân xe (±0,16 m)
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }
  function makeHood(car, color, layer) {                 // capô nhìn từ ghế lái (toạ độ THÂN xe) — kích thước "ăn gian" cho vừa dải dưới khoảng 3D (HOOD)
    const Ld = HOOD.z0 - HOOD.z1, g = new THREE.PlaneGeometry(HOOD.w, Ld, 24, 14).rotateX(-Math.PI / 2), p = g.attributes.position;
    for (let k = 0; k < p.count; k++) {
      const x0 = p.getX(k), z0 = p.getZ(k), f = clamp((Ld / 2 - z0) / Ld, 0, 1);   // f: 0 = chân kính → 1 = mũi (⚠️ phải kẹp: z0 lệch 1e-8 ⇒ f âm ⇒ pow(f, 1.4) = NaN ⇒ bloom loang ĐEN cả màn)
      const xn = x0 / (HOOD.w / 2), x = x0 * (1 - 0.12 * f);
      const y = HOOD.y0 - (HOOD.y0 - HOOD.y1) * Math.pow(f, 1.4) + 0.035 * (1 - xn * xn) - 0.1 * Math.pow(Math.abs(xn), 5) - 0.05 * Math.pow(f, 6) * Math.abs(xn);
      p.setXYZ(k, x, y, HOOD.z0 - f * Ld);
    }
    g.computeVertexNormals();
    const tex = hoodTex(color);
    const m = new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.42, metalness: 0.15, clearcoat: 0.6, clearcoatRoughness: 0.3, envMapIntensity: 0.6, fog: false });   // ít kim loại hơn thân xe: nhìn gần màu đội phải rõ, không loá trắng
    const hood = new THREE.Mesh(g, m);
    const dg = new THREE.PlaneGeometry(2.4, 0.5).rotateX(-Math.PI / 2 + 0.15).translate(0, HOOD.y0 - 0.02, HOOD.z0 + 0.22);   // mặt tap-lô tối dưới chân kính
    const dm = new THREE.MeshStandardMaterial({ color: "#15171b", roughness: 0.9, fog: false });
    const dash = new THREE.Mesh(dg, dm);
    const grp = new THREE.Group(); grp.add(hood, dash); grp.traverse(o => o.layers.set(layer)); car.body.add(grp);
    return { grp, dispose() { car.body.remove(grp); g.dispose(); dg.dispose(); m.dispose(); dm.dispose(); tex.dispose(); } };
  }
  function makeMedian() {                                 // dải phân cách bê tông giữa 2 nửa đường (bám máy quay như mặt đường)
    const LEN = 1440, SEGS = 360, mats = [], geos = [];
    const g = new THREE.Group();
    const add = (geo, mat, y) => { geos.push(geo); const m = new THREE.Mesh(geo, mat); m.position.y = y; m.frustumCulled = false; g.add(m); };
    const conc = bend(new THREE.MeshStandardMaterial({ color: "#b9b3a7", roughness: 0.88 })), refl = bend(new THREE.MeshStandardMaterial({ color: "#f2c230", emissive: new THREE.Color("#f2b020"), emissiveIntensity: 0.35, roughness: 0.4 }));
    mats.push(conc, refl);
    add(new THREE.BoxGeometry(0.66, 0.3, LEN, 1, 1, SEGS), conc, 0.15);
    add(new THREE.BoxGeometry(0.34, 0.36, LEN, 1, 1, SEGS), conc, 0.48);
    add(new THREE.BoxGeometry(0.36, 0.07, LEN, 1, 1, SEGS), refl, 0.6);
    return { g, place(camZ) { g.position.z = Math.floor(camZ / 48) * 48 - LEN / 2 + 200; }, dispose() { geos.forEach(x => x.dispose()); mats.forEach(x => x.dispose()); } };
  }
  buildCars();

  // ---------- hậu kỳ: 2 máy quay → 1 render target MSAA → bloom → output ----------
  const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, rt);
  let dashF = 0.3;                                        // tỉ lệ chiều cao tap-lô DOM / sân khấu (đo lúc fit) — phần dưới không cần vẽ 3D
  composer.addPass(new SplitPass((r, target) => {
    const w = target.width, h = target.height, hw = Math.floor(w / 2), dpx = Math.max(0, Math.floor(h * dashF) - 4);
    r.setRenderTarget(target); r.setScissorTest(false); r.setClearColor(0x06080d, 1); r.clear();
    for (let i = 0; i < 2; i++) {
      const x = i ? w - hw : 0;
      target.viewport.set(x, 0, hw, h); target.scissor.set(x, dpx, hw, h - dpx); target.scissorTest = true;
      r.setRenderTarget(target);
      prepView(i, h);
      r.render(scene, cams[i]);
    }
    target.viewport.set(0, 0, w, h); target.scissor.set(0, 0, w, h); target.scissorTest = false; r.setRenderTarget(target);
    // ⚠️ three.js "giải" MSAA (blit sang texture) ở CUỐI mỗi render() và phép blit BỊ scissor cắt ⇒ dải dưới tap-lô không bao giờ được giải,
    // giữ rác của khung trước; bloom cộng dồn vào đó mỗi khung tới tràn half-float (NaN) rồi loang ĐEN cả màn sau vài giây.
    // ⇒ vẽ 1 cảnh RỖNG không scissor, không xoá: chỉ để three giải MSAA trọn khung.
    const ac = r.autoClear; r.autoClear = false; r.render(EMPTY, cams[0]); r.autoClear = ac;
  }));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.32, 0.55, 0.92); composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ---------- trạng thái ----------
  const G = { phase: "menu", t: 0, countT: 0, winner: -1, endT: 0, queue: [], auto: false, acc: [0.85, 0.6], nextAuto: [0, 0], nextFire: [0, 0] };
  const fresh = i => ({ i, s: 0, v: 0, a: 0, x: TEAMS[i].lanes[0], vx: 0, yaw: 0, E: 0, steer: 0, boostK: 0, brake: 0, brakeT: 0, spinT: 0, spinDir: 1, shake: 0,
    ms: 0, streak: 0, ok: 0, bad: 0, hits: 0, lock: true, order: [], cur: null, smokeT: 0, aiLane: 0, keyT: -99, pad: { steer: 0, boost: 0, brake: 0 }, padT: -99,
    padSt: T0[i] ? T0[i].padSt : "", padOn: T0[i] ? T0[i].padOn : false, manual: null, fireT: -9, src: "ai", camK: 0, inc: null, done: false });
  const T0 = [null, null];
  const T = [fresh(0), fresh(1)];
  const later = (sec, fn) => G.queue.push({ at: G.t + sec, fn });

  function resetTeams() {
    T.forEach((t, i) => { T0[i] = t; T[i] = fresh(i); T0[i] = null; });
    missiles.clear(); G.winner = -1; G.queue = []; $(".sr-result").classList.remove("on"); $(".sr-banner").className = "sr-banner";
    halves.forEach(h => h.classList.remove("is-alarm", "is-locked", "is-win", "is-lose"));
  }

  // ---------- câu hỏi (mỗi đội 1 hàng riêng: câu ở dải trên, đáp án trên màn cảm ứng tap-lô) ----------
  const lenCls = n => n > 90 ? "xl" : n > 58 ? "l" : n > 30 ? "m" : "s";
  function nextQ(t) {
    if (!t.order.length) t.order = shuffle(questions.map((_, k) => k));
    const q = questions[t.order.shift()];
    t.cur = { q, answers: shuffle(q.answers.map(a => ({ text: a.text, correct: !!a.correct }))) };
    const h = H[t.i];
    h.q.textContent = q.question; h.q.dataset.len = lenCls(q.question.length);
    const ml = Math.max(...t.cur.answers.map(a => a.text.length));
    h.ans.dataset.n = t.cur.answers.length; h.ans.dataset.len = ml > 22 ? "l" : ml > 12 ? "m" : "s";
    h.ans.innerHTML = t.cur.answers.map((a, k) => `<button type="button" data-k="${k}"><span>${esc(a.text)}</span></button>`).join("");
    t.lock = false; h.el.classList.remove("is-qlock"); qboxes[t.i].classList.remove("fx-ok", "fx-bad");
  }
  H.forEach((h, i) => {
    h.ans.addEventListener("pointerdown", e => { const b = e.target.closest("button"); if (b) { e.preventDefault(); answer(i, +b.dataset.k); } });
    h.fire.addEventListener("pointerdown", e => { e.preventDefault(); fire(i); });
  });

  function answer(i, k) {
    const t = T[i];
    if (G.phase !== "race" || t.lock || t.done || !t.cur) return false;
    const ok = !!t.cur.answers[k]?.correct, btns = H[i].ans.querySelectorAll("button");
    t.lock = true; H[i].el.classList.add("is-qlock");
    btns[k]?.classList.add(ok ? "is-ok" : "is-bad");
    const qb = qboxes[i]; qb.classList.remove("fx-ok", "fx-bad"); void qb.offsetWidth; qb.classList.add(ok ? "fx-ok" : "fx-bad");
    if (ok) {
      t.ok++; t.streak++;
      const full = t.E >= PHYS.CAP * SEG - 0.5; t.E = Math.min(PHYS.CAP * SEG, t.E + SEG);
      if (t.streak >= opt.streak) { t.streak = 0; if (t.ms < opt.msMax) { t.ms++; toast(i, "+1 MISSILE", "ms"); } }
      else if (full) toast(i, "ENERGY FULL", "info");
      if (missiles.incoming(i) && t.src === "ai") { t.aiLane = 1 - t.aiLane; toast(i, "AUTO DODGE!", "ok"); }   // luật né Rocket Race khi không có người lái
      later(0.55, () => nextQ(t));
      onEvent("correct", { team: i, energy: t.E });
    } else {
      t.bad++; t.streak = 0;
      const full = Math.max(0, Math.ceil(t.E / SEG - 1e-3) - 1), lost = full * SEG;   // mất các ô ĐẦY đang dồn, giữ ô đang chạy dở
      t.E -= lost; t.brakeT = 0.55;
      t.cur.answers.forEach((a, j) => { if (a.correct) btns[j]?.classList.add("is-reveal"); });
      if (lost > 0) toast(i, "−" + full + " ⚡", "bad");
      later(1.3, () => nextQ(t));
      onEvent("wrong", { team: i, lost });
    }
    return ok;
  }
  function toast(i, text, kind) { const el = H[i].toast; el.textContent = text; el.className = "sr-toast"; void el.offsetWidth; el.className = "sr-toast on k-" + kind; }

  // ---------- tên lửa ----------
  function predict(j, tl) {                                // chỗ xe j SẼ ở sau tl giây (theo v, a hiện tại; không vượt quá năng lượng còn lại)
    const t = T[j], a = clamp(t.a, -PHYS.HARD, PHYS.ACCB);
    let ds = t.v * tl + 0.5 * a * tl * tl;
    if (a < 0 && t.v + a * tl < 0) ds = t.v * t.v / (-2 * a);
    ds = clamp(ds, 0, t.E + 0.5);
    const [x0, x1] = TEAMS[j].xr;
    return { s: t.s + ds, x: clamp(t.x + t.vx * Math.min(tl, 0.5), x0, x1) };
  }
  function fire(i) {
    const t = T[i], j = 1 - i;
    if (G.phase !== "race" || t.ms <= 0 || t.done || T[j].done || G.t - t.fireT < 1.0 || t.spinT > 0) return false;
    t.ms--; t.fireT = G.t;
    missiles.launch({ from: i, to: j, x: t.x, y: 1.7, z: -t.s - 0.2, predict: tl => predict(j, tl), color: TEAMS[i].color });
    toast(i, "MISSILE AWAY!", "ms");
    onEvent("fire", { team: i });
    return true;
  }
  function impact(h) {
    const tg = T[h.to], ds = tg.s - h.P.s, dx = tg.x - h.P.x;
    let kind = Math.abs(dx) < 1.55 && Math.abs(ds) < 3.4 ? "hit" : Math.hypot(dx, ds * 0.6) < 4.2 ? "graze" : "miss";
    if (tg.done || G.phase !== "race") kind = "miss";
    if (kind === "hit") {
      missiles.boom(tg.x, -tg.s, "hit");
      const lost = Math.min(tg.E, opt.hitLoss * SEG); tg.E -= lost;
      tg.spinT = 1.4; tg.spinDir = Math.random() < 0.5 ? -1 : 1; tg.v *= 0.55; tg.shake = 1; T[h.from].hits++;
      toast(h.to, lost > 0 ? `HIT! −${Math.round(lost / SEG)} ⚡` : "HIT!", "bad"); toast(h.from, "DIRECT HIT!", "ok");
    } else if (kind === "graze") {
      missiles.boom(h.P.x, -h.P.s, "graze");
      tg.v *= 0.6; tg.brakeT = 0.35; tg.shake = 0.6;
      toast(h.to, "GRAZED!", "bad"); toast(h.from, "CLOSE!", "info");
    } else {
      missiles.boom(h.P.x, -h.P.s, "miss");
      if (G.phase === "race") { toast(h.to, "DODGED!", "ok"); toast(h.from, "MISSED", "info"); }
    }
    onEvent("impact", { from: h.from, to: h.to, kind, dx: +dx.toFixed(2), ds: +ds.toFixed(2) });
  }

  // ---------- nhịp trận ----------
  function start() {
    if (G.phase === "count" || G.phase === "race") return false;
    resetTeams(); G.phase = "count"; G.countT = 0;
    mount.classList.add("is-count"); mount.classList.remove("is-menu", "is-end");
    const lights = $$(".sr-lights i"); lights.forEach(l => l.classList.remove("on"));
    for (let k = 0; k < 5; k++) later(0.6 + k * 0.55, () => lights[k].classList.add("on"));
    later(0.6 + 4 * 0.55 + 0.75 + Math.random() * 0.3, go);
    H.forEach(h => { h.q.textContent = ""; h.ans.innerHTML = ""; });
    closePanel();
    return true;
  }
  function go() {
    G.phase = "race"; mount.classList.remove("is-count"); mount.classList.add("is-race");
    $$(".sr-lights i").forEach(l => l.classList.remove("on"));
    const g = $(".sr-go"); g.classList.remove("pop"); void g.offsetWidth; g.classList.add("pop");
    T.forEach(t => nextQ(t)); G.nextAuto = [G.t + 1 + Math.random() * 2, G.t + 1 + Math.random() * 2];
  }
  function finish(w) {
    G.winner = w; G.endT = G.t; G.phase = "end"; mount.classList.remove("is-race"); mount.classList.add("is-end");
    T.forEach(t => { t.lock = true; t.done = true; }); halves.forEach(h => h.classList.add("is-qlock"));
    halves[w].classList.add("is-win"); halves[1 - w].classList.add("is-lose");
    const b = $(".sr-banner"); b.textContent = TEAMS[w].name + " WINS!"; b.style.setProperty("--team", TEAMS[w].color); b.className = "sr-banner on";
    later(3.2, () => {
      $(".sr-res-title").innerHTML = `<span style="color:${TEAMS[w].color}">${TEAMS[w].name}</span> WINS`;
      $(".sr-res-rows").innerHTML = T.map(t => `<div style="--team:${TEAMS[t.i].color}"><b>${TEAMS[t.i].name}</b><span>${Math.round(Math.min(t.s, FIN))} / ${FIN} m</span><span>✔ ${t.ok} · ✘ ${t.bad}</span><span>🚀 ${t.hits} hit${t.hits === 1 ? "" : "s"}</span></div>`).join("");
      $(".sr-result").classList.add("on");
    });
    onEvent("end", { winner: w });
  }
  $(".sr-start").addEventListener("click", () => start());
  $(".sr-again").addEventListener("click", () => start());
  mount.classList.add("is-menu");

  // ---------- iPad (bảng QR) ----------
  const panel = $(".sr-panel");
  function openPanel() { if (!remote) return; panel.hidden = false; try { remote.panel($(".sr-panel-body")); } catch (e) { $(".sr-panel-body").innerHTML = "<p>iPad link is not available.</p>"; } }
  function closePanel() { if (panel.hidden) return; panel.hidden = true; try { remote && remote.panelClosed && remote.panelClosed(); } catch (e) { /* */ } }
  $(".sr-ipadbtn")?.addEventListener("click", () => panel.hidden ? openPanel() : closePanel());
  $(".sr-ipadbig")?.addEventListener("click", openPanel);
  $(".sr-panel-x").addEventListener("click", closePanel);
  panel.addEventListener("pointerdown", e => { if (e.target === panel) closePanel(); });

  // ---------- điều khiển ----------
  const held = [new Set(), new Set()];
  const KEYMAP = { KeyA: [0, "l"], KeyD: [0, "r"], KeyW: [0, "b"], KeyS: [0, "k"], KeyF: [0, "f"], ArrowLeft: [1, "l"], ArrowRight: [1, "r"], ArrowUp: [1, "b"], ArrowDown: [1, "k"], Enter: [1, "f"], ShiftRight: [1, "f"] };
  const onKeyDown = e => {
    const m = KEYMAP[e.code]; if (!m || e.target.closest?.("input,textarea")) return;
    if (e.code.startsWith("Arrow")) e.preventDefault();
    const [i, k] = m; T[i].keyT = G.t;
    if (k === "f") { if (!e.repeat) fire(i); return; }
    held[i].add(k);
  };
  const onKeyUp = e => { const m = KEYMAP[e.code]; if (m) held[m[0]].delete(m[1]); };
  const onBlur = () => held.forEach(h => h.clear());
  window.addEventListener("keydown", onKeyDown); window.addEventListener("keyup", onKeyUp); window.addEventListener("blur", onBlur);

  function input(t) {
    if (t.padOn) { t.src = "pad"; return G.t - t.padT < 0.45 ? t.pad : { steer: 0, boost: 0, brake: 0 }; }   // iPad im > 450 ms ⇒ nhả hết (xe đi thẳng)
    if (G.t - t.keyT < 4) { t.src = "key"; const h = held[t.i]; return { steer: (h.has("r") ? 1 : 0) - (h.has("l") ? 1 : 0), boost: +h.has("b"), brake: +h.has("k") }; }
    if (t.manual) { t.src = "test"; return t.manual; }
    t.src = "ai";
    const tx = TEAMS[t.i].lanes[t.aiLane];
    return { steer: clamp((tx - t.x) * 0.6 - t.vx * 0.22, -1, 1), boost: t.E > SEG * 1.15 ? 1 : 0, brake: 0 };
  }

  // ---------- vật lý xe ----------
  function drive(t, dt) {
    const racing = G.phase === "race" && !t.done;
    let inp = { steer: 0, boost: 0, brake: 0 };
    if (racing && t.spinT <= 0) inp = input(t);
    else if (G.phase === "end") { const tx = TEAMS[t.i].lanes[t.aiLane]; inp = { steer: clamp((tx - t.x) * 0.5 - t.vx * 0.2, -1, 1), boost: 0, brake: G.t - G.endT > 1.2 ? 1 : 0 }; }
    t.steer += (inp.steer - t.steer) * Math.min(1, dt * 10);
    const braking = !!inp.brake || t.brakeT > 0;
    if (t.brakeT > 0) t.brakeT -= dt;
    // dọc: ga tự động tới CRUISE (BOOST tới VBOOST), trần √(2·DEC·E) ⇒ hết năng lượng là lăn chậm dần dừng đúng chỗ
    const vCap = Math.sqrt(2 * PHYS.DEC * Math.max(0, t.E)), vT = Math.min(inp.boost ? PHYS.VBOOST : PHYS.CRUISE, vCap);
    let a = 0;
    if (t.spinT > 0) a = -16;
    else if (braking) a = G.phase === "end" ? -9 : -PHYS.BRAKE;
    else if (t.v < vT - 0.05) a = Math.min((inp.boost ? PHYS.ACCB : PHYS.ACC) * (1 - 0.3 * t.v / PHYS.VBOOST), (vT - t.v) / dt);
    else if (t.v > vT + 0.05) { const need = t.E > 0.05 ? t.v * t.v / (2 * t.E) : PHYS.HARD; a = -Math.min(PHYS.HARD, Math.max(vCap <= vT + 0.01 ? need : 0, 5)); }
    t.v = Math.max(0, t.v + a * dt); t.a = a;
    const ds = t.v * dt; t.s += ds; if (G.phase !== "end") t.E = Math.max(0, t.E - ds);
    // ngang: lái liên tục trong nửa đường của đội; đứng yên thì không lách ngang được
    const latK = clamp(t.v / 8, 0, 1), vxT = (t.spinT > 0 ? 0 : t.steer) * PHYS.LAT * latK;
    t.vx += (vxT - t.vx) * Math.min(1, dt * 7); t.x += t.vx * dt;
    const [x0, x1] = TEAMS[t.i].xr;
    if (t.x < x0 || t.x > x1) {                             // quệt rào / dải phân cách: chậm lại + tia lửa
      const side = t.x < x0 ? -1 : 1; t.x = clamp(t.x, x0, x1); t.vx = -side * 0.6;
      if (t.v > 3) { t.v *= 1 - 1.2 * dt; if (Math.random() < 0.7) missiles.sparks.emit(t.x + side * 1.0, 0.5, -t.s + (Math.random() - 0.5) * 2, side * 2, 2 + Math.random() * 3, 3 + Math.random() * 4, 0.35, 0.12, 1, 0, 1); }
    }
    t.yaw = lerp(t.yaw, -Math.atan2(t.vx, Math.max(t.v, 5)) * 0.9, 1 - Math.exp(-dt * 8));
    if (t.spinT > 0) t.spinT = Math.max(0, t.spinT - dt);
    t.brake = braking || t.spinT > 0 ? 1 : a < -2 ? 0.35 : 0;
    t.boostK = lerp(t.boostK, a > 0.5 ? (inp.boost ? 1 : 0.35) : 0, 1 - Math.exp(-dt * 8));
    t.shake = Math.max(0, t.shake - dt * 1.6);
    if (((braking && t.v > 8) || t.spinT > 0) && t.v > 3) { t.smokeT -= dt; if (t.smokeT <= 0) { t.smokeT = 0.03; [-0.8, 0.8].forEach(o => missiles.smoke.emit(t.x + o, 0.25, -t.s + 1.3, (Math.random() - 0.5) * 1.6, 0.6 + Math.random() * 0.9, 2 + Math.random() * 3, 1.1 + Math.random() * 0.8, 0.9, 0.42, 2.6, 0.9)); } }
    if (G.winner < 0 && G.phase === "race" && t.s >= FIN) finish(t.i);
  }

  // ---------- máy quay trong xe ----------
  const V1 = new THREE.Vector3(), V2 = new THREE.Vector3(), V3 = new THREE.Vector3(), V4 = new THREE.Vector3();
  let camOverride = null;
  function updateCams(dt) {
    T.forEach((t, i) => {
      const car = cars[i], cam = cams[i];
      // camK: 0 = máy quay ĐUỔI sau xe mình (màn chờ / kết) · 1 = TRONG XE
      const want = G.phase === "menu" ? 0 : G.phase === "count" ? ease(clamp((G.countT - 0.3) / 2.6, 0, 1)) : G.phase === "end" && G.t - G.endT > 2.2 ? 0 : 1;
      t.camK = G.phase === "count" ? want : lerp(t.camK, want, 1 - Math.exp(-dt * 2.2));
      car.body.updateMatrixWorld(true);
      const eyeC = car.body.localToWorld(V1.copy(EYE)), lookC = car.body.localToWorld(V2.copy(LOOK));
      const orb = G.t * 0.22 + i * 2.1, back = G.phase === "end" ? 9 : 7.2;
      const eyeF = car.rig.localToWorld(V3.set(Math.sin(orb) * 2.6, G.phase === "end" ? 3.2 : 2.3, back)), lookF = car.rig.localToWorld(V4.set(0, 0.9, -3));
      const k = t.camK;
      cam.position.lerpVectors(eyeF, eyeC, k);
      const look = eyeF.copy(lookF).lerp(lookC, k);
      if (k > 0.5 && (t.shake > 0 || t.v > 20)) {           // rung nhẹ theo tốc độ + rung mạnh khi trúng đạn
        const sh = (0.006 * smooth(20, 47, t.v) + 0.06 * t.shake) * k;
        cam.position.x += (Math.random() - 0.5) * sh; cam.position.y += (Math.random() - 0.5) * sh;
      }
      if (camOverride && camOverride[i]) { cam.position.fromArray(camOverride[i].pos); look.fromArray(camOverride[i].look); }
      cam.lookAt(look);
      cam.rotateZ(car.body.rotation.z * 0.9 * k - t.steer * 0.025 * k);
      const fov = lerp(62, 80 + 10 * smooth(PHYS.CRUISE * 0.6, PHYS.VBOOST, t.v) + 3 * t.boostK, k);    // fov DỌC của khối nhìn ĐẦY ĐỦ (trước khi dịch ống kính)
      if (Math.abs(cam.fov - fov) > 0.01) { cam.fov = fov; lens(cam); }
      // lớp: trong xe ⇒ thấy capô mình, không thấy thân xe mình; ngoài xe ⇒ ngược lại
      cam.layers.set(0); cam.layers.enable(2 - i);
      if (k > 0.86) cam.layers.enable(3 + i); else cam.layers.enable(1 + i);
      cam.updateMatrixWorld();                             // nhãn đối thủ chiếu bằng ma trận NGAY khung này (không trễ 1 khung)
    });
  }
  // dịch ống kính: khối nhìn đối xứng quanh đường chân trời, cửa sổ = nửa màn (cả phần tap-lô che) sao cho chân trời ở HORIZON của khoảng 3D
  const LENS = { A: 1.2, full: 1.4 };
  function lens(cam) {
    const yh = HORIZON * (1 - dashF), below = 1 - yh;       // theo chiều cao nửa màn: chân trời cách mép trên yh, cách mép dưới below
    LENS.full = 2 * below;
    cam.aspect = LENS.A / LENS.full;
    cam.setViewOffset(LENS.A, LENS.full, 0, below - yh, LENS.A, 1);   // gọi luôn updateProjectionMatrix
  }
  function bendFor(i) {                                    // cong thế giới theo QUÃNG ĐƯỜNG của chính đội đó (mỗi nửa màn tự cong)
    const S = T[i].s, amt = opt.bend * (G.phase === "menu" ? 0.5 : 1);
    return [(0.0009 * Math.sin(S / 230 + 0.6) + 0.0004 * Math.sin(S / 83 + 1.3)) * amt, (0.00012 + 0.0001 * Math.sin(S / 170 + 0.4)) * amt];
  }
  function prepView(i, hPx) {
    const cam = cams[i], [bx, by] = bendFor(i);
    U.uBend.value.set(bx, by); U.uBendZ.value = cam.position.z;
    world.update(cam.position, G.t, Math.min(T[0].s, T[1].s) - 30, Math.max(T[0].s, T[1].s));
    median.place(cam.position.z);
    missiles.setScale(hPx * LENS.full / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2))));   // khối nhìn đầy đủ cao LENS.full lần nửa màn
  }

  // ---------- HUD ----------
  // bản đồ: đường lượn từ XUẤT PHÁT (trái) tới ĐÍCH (phải), vạch mỗi đoạn, 2 chấm xe + chấm đỏ tên lửa đang bay
  const mapSvg = $(".sr-map svg"), MAPN = 160, MP = [];
  for (let k = 0; k <= MAPN; k++) { const s = k / MAPN * FIN, x = 60 + k / MAPN * 870, y = 118 + 62 * Math.sin(s / 230 + 0.6) * 0.75 + 30 * Math.sin(s / 83 + 1.3) * 0.75 * Math.min(1, k / 12) * Math.min(1, (MAPN - k) / 12); MP.push([x, y]); }
  const mapAt = s => { const f = clamp(s / FIN, 0, 1) * MAPN, k = Math.min(MAPN - 1, Math.floor(f)), u = f - k; return [lerp(MP[k][0], MP[k + 1][0], u), lerp(MP[k][1], MP[k + 1][1], u)]; };
  const dPath = "M" + MP.map(p => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L");
  mapSvg.innerHTML = `<path d="${dPath}" class="m-edge"/><path d="${dPath}" class="m-road"/><path d="${dPath}" class="m-mid"/>
    ${Array.from({ length: L - 1 }, (_, k) => { const [x, y] = mapAt((k + 1) * SEG); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" class="m-tick"/>`; }).join("")}
    <g transform="translate(${MP[0][0] - 34} ${MP[0][1] - 20})"><rect width="18" height="40" rx="3" class="m-start"/></g>
    <g transform="translate(${MP[MAPN][0] + 14} ${MP[MAPN][1] - 26})" class="m-flag"><path d="M0 0 V52" /><rect x="2" y="0" width="34" height="24" class="m-chk"/></g>
    <g class="m-ms"></g>
    ${[0, 1].map(i => `<g class="m-car" data-i="${i}"><circle r="19" fill="${TEAMS[i].color}"/><text text-anchor="middle" dominant-baseline="central">${i + 1}</text></g>`).join("")}`;
  const mapCars = [...mapSvg.querySelectorAll(".m-car")], mapMs = mapSvg.querySelector(".m-ms"), gapEl = $(".sr-gap");
  const PJ = new THREE.Vector3();
  let hudT = 0, infoT = 0;
  function updateHUD(dt) {
    T.forEach((t, i) => {
      const [x, y] = mapAt(t.s); mapCars[i].setAttribute("transform", `translate(${x.toFixed(1)} ${(y + (i ? 9 : -9)).toFixed(1)})`);
      const h = H[i];
      h.wheel.style.transform = `rotate(${(t.steer * 70 + (t.spinT > 0 ? Math.sin(G.t * 40) * 6 : 0)).toFixed(1)}deg)`;
      // nhãn xe đối thủ trong khung nhìn của mình (chiếu toạ độ ĐÃ CONG)
      const o = T[1 - i], cam = cams[i], [bx, by] = bendFor(i), d = Math.min(-o.s - cam.position.z, 0);
      PJ.set(o.x + bx * d * d, 2.0 - by * d * d, -o.s); const dist = PJ.distanceTo(cam.position); PJ.project(cam);
      const yTop = (1 - PJ.y) / 2, show = G.phase === "race" && PJ.z < 1 && Math.abs(PJ.x) < 0.98 && yTop > 0.05 && yTop < 1 - dashF - 0.04 ? smooth(14, 40, dist) : 0;
      h.tag.style.opacity = show.toFixed(2);
      if (show > 0) { h.tag.style.left = ((PJ.x + 1) / 2 * 100).toFixed(2) + "%"; h.tag.style.top = (yTop * 100).toFixed(2) + "%"; }
      // báo động tên lửa đang bay tới
      const inc = missiles.incoming(i); t.inc = inc;
      h.el.classList.toggle("is-alarm", !!inc); h.el.classList.toggle("is-locked", !!(inc && inc.locked));
      if (inc) { h.alarmBar.style.transform = `scaleX(${clamp(inc.tLeft / MS.T, 0, 1).toFixed(3)})`; }
    });
    // chấm tên lửa trên bản đồ
    const act = missiles.active;
    if (mapMs.childElementCount !== act.length) mapMs.innerHTML = act.map(() => `<circle r="9" class="m-msdot"/>`).join("");
    act.forEach((m, k) => { const [x, y] = mapAt(m.P.s); mapMs.children[k].setAttribute("cx", x.toFixed(1)); mapMs.children[k].setAttribute("cy", (y + (m.to ? 9 : -9)).toFixed(1)); });
    hudT -= dt; if (hudT <= 0) {
      hudT = 0.08;
      const lead = T[0].s >= T[1].s ? 0 : 1, gap = Math.abs(T[0].s - T[1].s);
      gapEl.innerHTML = G.phase === "race" || G.phase === "end" ? (gap < 1 ? "NECK AND NECK" : `<b style="color:${TEAMS[lead].color}">${TEAMS[lead].name}</b> +${Math.round(gap)} m`) : `${FIN} m · ${L} segments`;
      T.forEach((t, i) => {
        const h = H[i], e = t.E / SEG;
        h.kmh.textContent = Math.round(t.v * 3.6);
        h.cells.forEach((c, k) => c.style.setProperty("--f", clamp(e - k, 0, 1).toFixed(3)));
        h.el.classList.toggle("is-empty", G.phase === "race" && t.E < 1 && t.v < 0.5);
        h.ms.forEach((m, k) => m.classList.toggle("on", k < t.ms));
        h.streak.forEach((s, k) => s.classList.toggle("on", k < t.streak));
        h.fire.classList.toggle("ready", t.ms > 0 && G.phase === "race");
        h.src.textContent = t.src === "pad" ? "iPAD" : t.src === "key" ? "KEYS" : t.src === "test" ? "TEST" : "AUTO";
        h.src.dataset.s = t.padOn ? (t.padSt === "relay" ? "relay" : "on") : "";
        const o = T[1 - i], d = o.s - t.s;
        h.mirDir.textContent = Math.abs(d) < 1 ? "◆" : d > 0 ? "▲" : "▼";
        h.mirTxt.innerHTML = `<b style="color:${TEAMS[1 - i].color}">${TEAMS[1 - i].name}</b> ${Math.abs(d) < 1 ? "level" : (d > 0 ? "ahead " : "behind ") + Math.round(Math.abs(d)) + " m"}`;
        h.tagT.textContent = Math.round(Math.abs(d)) + " m";
        if (t.inc) h.alarmT.textContent = t.inc.locked ? "DODGE!" : t.inc.tLeft.toFixed(1) + " s";
      });
    }
    infoT -= dt; if (infoT <= 0 && remote && remote.send) {     // gửi đồng hồ sang iPad 4 lần/giây
      infoT = 0.25;
      T.forEach((t, i) => { if (t.padOn) remote.send(i, `i:${Math.round(t.v * 3.6)},${(t.E / SEG).toFixed(1)},${t.ms},${t.inc ? (t.inc.locked ? 2 : 1) : 0},${G.phase}`); });
    }
  }

  // ---------- vòng vẽ ----------
  const AR = makeAutoRes({ max: PR_MAX, min: Math.min(0.8, PR_MAX), key: "speedrun-2", apply: pr => { renderer.setPixelRatio(pr); fit(true); },
    aa: { on: true, set: on => { const ns = on ? 4 : 0; for (const r of [composer.renderTarget1, composer.renderTarget2]) if (r.samples !== ns) { r.samples = ns; r.dispose(); } } } });
  let W = 0, Hh = 0;
  function fit(force) {
    const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h || (!force && w === W && h === Hh)) return;
    W = w; Hh = h; renderer.setSize(w, h, false); composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h);
    dashF = clamp(H[0].dash.offsetHeight / h, 0, 0.6);
    LENS.A = (w / 2) / h; cams.forEach(lens);
  }
  const ro = new ResizeObserver(() => fit()); ro.observe(stage); fit(true);

  let raf = 0, last = 0, manual = false, dead = false, fpsN = 0, fpsT = 0, fps = 0;
  function frame(dt) {
    G.t += dt;
    if (G.phase === "count") G.countT += dt;
    for (let i = G.queue.length - 1; i >= 0; i--) if (G.queue[i].at <= G.t) { const q = G.queue.splice(i, 1)[0]; q.fn(); }
    if (G.phase === "race" && G.auto) T.forEach((t, i) => {
      if (!t.lock && t.cur && G.t >= G.nextAuto[i]) {
        const ok = Math.random() < G.acc[i], ks = t.cur.answers.map((a, k) => [a.correct, k]).filter(([c]) => c === ok).map(([, k]) => k);
        answer(i, ks.length ? ks[Math.floor(Math.random() * ks.length)] : 0); G.nextAuto[i] = G.t + 1.4 + Math.random() * 2.6;
      }
      if (t.ms > 0 && G.t >= G.nextFire[i]) { fire(i); G.nextFire[i] = G.t + 2 + Math.random() * 4; }
    });
    if (G.phase === "race" || G.phase === "end") T.forEach(t => drive(t, dt));
    missiles.update(dt, G.t).forEach(impact);
    T.forEach((t, i) => {
      const c = cars[i]; c.rig.position.set(t.x, 0, -t.s);
      c.rig.rotation.y = t.yaw + (t.spinT > 0 ? t.spinDir * Math.PI * 2 * ease(1 - t.spinT / 1.4) : 0);
      c.update(dt, { dist: t.s, accel: t.a, brake: t.brake, steer: t.vx, boost: t.boostK, t: G.t });
      c.tips.forEach((tip, k) => { tip.visible = t.ms > k; });
    });
    updateCams(dt);
    updateHUD(dt);
  }
  function loop(now) {
    if (dead) return; raf = requestAnimationFrame(loop);
    if (manual) return;
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60); last = now;
    fit(); frame(dt); composer.render(); AR.frame(now);
    fpsN++; if (now - fpsT > 1000) { fps = fpsN; fpsN = 0; fpsT = now; onEvent("fps", fps); }
  }
  raf = requestAnimationFrame(loop);

  if (remote) remote.attach({
    press: (i, k) => { if (k === "fire") fire(i); },
    drive: (i, d) => { T[i].pad = d; T[i].padT = G.t; },
    status: (i, s) => { T[i].padSt = s; T[i].padOn = s === "on" || s === "relay"; onEvent("pad", { team: i, s }); },
  });

  const api = {
    start,
    answer: (i, ok) => { const t = T[i]; if (!t.cur) return false; const k = t.cur.answers.findIndex(a => !!a.correct === !!ok); return answer(i, k < 0 ? 0 : k); },
    auto(on = true, a0, a1) { G.auto = on; if (a0 != null) G.acc[0] = a0; if (a1 != null) G.acc[1] = a1; },
    give(i, n = 1) { T[i].E = Math.min(PHYS.CAP * SEG, T[i].E + n * SEG); },
    arm(i, n = 1) { T[i].ms = clamp(n, 0, opt.msMax); },
    fire, drive(i, d) { T[i].manual = d || null; },
    step(n = 1, dt = 1 / 60) { manual = true; for (let k = 0; k < n; k++) frame(dt); fit(true); composer.render(); },
    resume() { manual = false; last = 0; },
    state: () => ({ phase: G.phase, t: +G.t.toFixed(2), winner: G.winner, L, FIN, teams: T.map(t => ({ s: +t.s.toFixed(2), v: +t.v.toFixed(2), kmh: Math.round(t.v * 3.6), x: +t.x.toFixed(2), E: +t.E.toFixed(1), cells: +(t.E / SEG).toFixed(2), ms: t.ms, streak: t.streak, ok: t.ok, bad: t.bad, hits: t.hits, src: t.src, pad: t.padSt, spin: +t.spinT.toFixed(2), camK: +t.camK.toFixed(2), lock: t.lock })) }),
    camInfo: () => cams.map(c => ({ pos: c.position.toArray().map(v => +v.toFixed(2)), fov: +c.fov.toFixed(1), layers: c.layers.mask })),
    cam(o) { camOverride = o || null; },
    missiles: () => missiles.active,
    get fps() { return fps; }, get res() { return AR.info; }, get dashF() { return dashF; },
    renderer, scene, cams, composer, G, T,
    destroy() {
      if (dead) return; dead = true; cancelAnimationFrame(raf); ro.disconnect();
      window.removeEventListener("keydown", onKeyDown); window.removeEventListener("keyup", onKeyUp); window.removeEventListener("blur", onBlur);
      try { remote && remote.detach && remote.detach(); } catch (e) { /* */ }
      hoods.forEach(h => h.dispose()); cars.forEach(c => c.dispose()); world.dispose(); median.dispose(); missiles.dispose();
      composer.dispose(); rt.dispose(); pmrem.dispose(); scene.environment?.dispose();
      renderer.dispose(); renderer.forceContextLoss(); mount.innerHTML = ""; mount.classList.remove("sr-root", "sr2", "is-menu", "is-count", "is-race", "is-end");
      if (window.__sr === api) delete window.__sr;
    }
  };
  return api;
}
