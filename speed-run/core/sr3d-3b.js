// =============================================================
// SPEED RUN 3D — LÕI MẪU 3b (15/10/2026) — chép từ sr3d-3.js (mẫu 3 "đua vòng"), thầy chỉnh tiếp (15/10):
//   · BOOST (bàn đạp GA) bên TRÁI vô lăng, BRAKE (bàn đạp PHANH) bên PHẢI — vẽ đúng hình bàn đạp thật (sr3d-dash-3b.js, dùng chung với iPad)
//   · nút Control bằng cỡ các nút khác, dải nút thấp hơn (60 px) · màn khởi động: bỏ dòng hướng dẫn, bỏ tên bộ câu hỏi, bỏ nút iPad steering,
//     thêm ANDREW STUDIO trên chữ SPEED RUN
//   · NÚT iPAD = 3 CHẾ ĐỘ (nhớ localStorage "speedrun.padMode"): 0 TẮT iPad (đua + câu hỏi + trả lời trên màn lớn) ·
//     1 TRẢ LỜI TRÊN iPAD (đua trên màn lớn; câu hỏi CHỈ trên iPad, màn lớn chỉ hiện đáp án, không bấm được) ·
//     2 ĐUA TRÊN iPAD (iPad = vô lăng + bàn đạp Y HỆT game + nút tên lửa; màn lớn hiện đủ, vô lăng/bàn đạp trên màn lớn chỉ HIỆN theo iPad).
//   Giao thức thêm (sr3d-padlink-3b.js): game → iPad "m:<chế độ>" + "Q:<json câu hỏi>" (+ ghi vào kho bắt tay làm đường dự phòng) · iPad → game "a:<đáp án>:<số câu>".
// ---- gốc mẫu 3 ----
// SPEED RUN 3D — LÕI MẪU 3 "ĐUA VÒNG" (15/10/2026)
//   1. BỎ vạch cứng giữa 2 đội: lái sang đường của nhau được, VA CHẠM thật (húc đuôi, chèn hông, ép vào rào, chắn đầu) — 2 thân xe là
//      2 hình chữ nhật xoay (SAT), xung lực bảo toàn động lượng + văng đuôi theo điểm va.
//   2. CẦU NHẢY (sr3d-fx-3.js vẽ): lực đẩy lên/tới giữ xe trên không lâu, +20 % tốc độ lúc rời mép dốc; máy quay ra NGOÀI, thấp,
//      FOV +18 %, nhoè hướng tâm + rung lúc cất cánh / đáp đất, vệt gió sau đuôi; trên không ◀ ▶ = nghiêng/lượn nhẹ, PHANH = xoay tròn
//      (phanh thẳng = Flat Spin, phanh + lái = Barrel Roll) — mỗi vòng trọn khi đáp đất được +Nitro; đáp 4 bánh song song (< 15°) =
//      PERFECT LANDING (vọt đi + toé lửa/khói), nghiêng/lật = BAD LANDING (mất đà, nảy + nổ nhỏ, văng đuôi).
//      NITRO: giữ BOOST khi thanh Nitro còn ⇒ vọt tới VNITRO (lửa xanh), không cần năng lượng.
//   3. Dải trên THẤP hơn: câu hỏi đội 1 | BẢN ĐỒ (giữa) | câu hỏi đội 2; bỏ chữ TEAM trong khung, "TEAM n" hiện GIỮA khung khi chưa có câu.
//   4. ĐƯỜNG VÒNG: bản đồ là 1 vòng khép kín, đi nhiều vòng (opt.laps, mặc định ≈ số đoạn / 4); cổng LAP n mỗi mốc vòng; cong 3D theo khúc cua bản đồ.
//   5. TỐC ĐỘ TỐI THIỂU: xe luôn chạy ≥ VMIN (trừ khi trúng tên lửa ⇒ xoay + dừng tạm / phanh); năng lượng (câu đúng) cho chạy nhanh hơn.
//      KÉO GẦN: xe sau được bù tốc, xe trước bị hãm khi cách xa ⇒ không có cảnh 1 bên dừng chết, 1 bên băng băng về đích.
//   6. HÀNG NÚT CHỨC NĂNG kiểu AWord nhưng DỒN vào 1 nút ở góc phải (bấm ⇒ các nút bung sang trái; bấm chỗ khác ⇒ thu lại).
//   7. Không iPad vẫn chơi được: nút BOOST + PHANH trên tap-lô; bấm nửa trái/phải VÔ LĂNG để lái (sáng mờ màu đội bên đang bấm).
// Bàn thử: window.__sr — start() · toMenu() · answer(team, ok) · auto(on, a0, a1) · give(team, ô) · arm(team, n) · nitro(team, k) · fire(team)
//          · drive(team, {steer,boost,brake}|null) · place(team, s, x) · step(n) · resume() · state() · camInfo() · missiles() · ramps() · fps · res · destroy()
// =============================================================
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { Pass } from "three/addons/postprocessing/Pass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { makeCar } from "./sr3d-car-1.js";
import { createWorld, makeBend, HAZE } from "./sr3d-world-3.js";
import { makeAutoRes } from "./sr3d-autores.js";
import { createMissiles, MS } from "./sr3d-missile-2.js";
import { createRamps, createTrails, RadialBlurShader, RAMP, RAMP_SLOPE } from "./sr3d-fx-3.js";
import { WHEEL_SVG, GAS_SVG, BRAKE_SVG, MS_ICON } from "./sr3d-dash-3b.js";

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const ease = t => t * t * (3 - 2 * t);
const TAU = Math.PI * 2;
const wrapPI = a => a - TAU * Math.round(a / TAU);
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// mẫu 3: không còn nửa đường riêng — cả 2 xe chạy trên toàn mặt đường [−ROADX, ROADX]; lanes = làn tự lái thích
export const TEAMS = [{ name: "TEAM 1", color: "#3b8cff", lanes: [-2.4, -6.0] }, { name: "TEAM 2", color: "#ff7a00", lanes: [2.4, 6.0] }];
const ROADX = 8.3;
// m, s: VMIN 12 m/s ≈ 43 km/h (luôn chạy) · CRUISE 31 ≈ 112 · VBOOST 47 ≈ 169 · VNITRO 57 ≈ 205 · CAP = số ô năng lượng tối đa
export const PHYS = { SEG: 80, VMIN: 12, CRUISE: 31, VBOOST: 47, VNITRO: 57, ACC: 10, ACCB: 15, DEC: 9, HARD: 26, BRAKE: 22, LAT: 8.5, CAP: 4,
  CATCH: 25, CATCH_K: 90, GAP_MAX: 150 };                  // kéo gần: bắt đầu bù khi cách > 25 m, đủ mức ở 115 m; trần cứng 150 m
// bay: GUP = trọng lực lúc mới cất cánh (nhẹ ⇒ "lơ lửng"), G = sau đó · ROT = tốc độ xoay khi giữ phanh trên không (rad/s)
export const AIR = { BOOST: 1.2, VY0: 2.8, VYK: 0.55, GUP: 4.5, G: 10.5, LIFT_T: 0.45, ROT: 7.4, ROLL: 1.5, PERFECT: 15 * Math.PI / 180, OK: 32 * Math.PI / 180, NITRO_ROT: 0.34, NITRO_USE: 0.3 };
export const DEFAULTS = { steps: 12, laps: 0, car: "lambo", bend: 0.75, streak: 3, msMax: 3, hitLoss: 2, ramps: true };
const EYE = new THREE.Vector3(0, 1.1, 0.25), LOOK = new THREE.Vector3(0, 0.86, -9);
const HORIZON = 0.42;
const HOOD = { z0: -0.12, z1: -0.95, y0: 0.93, y1: 0.76, w: 1.9 };

const EMPTY = new THREE.Scene();
class SplitPass extends Pass {
  constructor(fn) { super(); this.fn = fn; this.needsSwap = false; }
  render(renderer, writeBuffer, readBuffer) { this.fn(renderer, readBuffer); }
}

const IPAD_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="2.5" width="16" height="19" rx="2.5"/><path d="M10.5 18.5h3"/></svg>`;
// hàng nút kiểu AWord (icon Lucide như TRAIN RUSH)
const TOOL_ICON = {
  more: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path class="w" d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/><path class="x" d="m16 9 6 6m0-6-6 6"/></svg>',
  folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/></svg>',
  options: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h10M18 6h2M4 12h4M10 12h10M4 18h13M21 18h-1"/><circle cx="16" cy="6" r="2.2"/><circle cx="7" cy="12" r="2.2"/><circle cx="17" cy="18" r="2.2"/></svg>',
  ipad: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="2.5" width="15" height="19" rx="2.2"/><path d="M11 18.3h2"/></svg>',
  fs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>',
};

// bản đồ đường vòng (khung SVG 1000 × 200, chạy THEO chiều kim đồng hồ ⇒ cua phải là chính): điểm neo Catmull-Rom khép kín
const MAP_PTS = [[95, 112], [150, 44], [300, 26], [430, 58], [540, 34], [700, 24], [860, 40], [930, 98], [880, 162], [740, 176], [610, 150], [470, 176], [300, 172], [160, 168]];

export function createSpeedRun({ mount, bar = null, questions, title = "SPEED RUN", options = {}, remote = null, onEvent = () => {} }) {
  const opt = { ...DEFAULTS, ...options };
  const L = clamp(opt.steps | 0, 3, 20), SEG = PHYS.SEG, FIN = L * SEG;
  const LAPS = clamp(opt.laps > 0 ? opt.laps | 0 : Math.max(1, Math.round(L / 4)), 1, 6), LAP = FIN / LAPS;

  // ---------- DOM ----------
  mount.classList.add("sr-root", "sr2", "sr3");
  const half = i => `
    <div class="sr-half sr-half${i}" style="--team:${TEAMS[i].color}">
      <svg class="sr-frame" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 0 H100 V3.2 C70 5.4 30 5.4 0 3.2 Z" class="roof"/>
        <path d="M0 0 L8.5 0 L3.2 100 L0 100 Z" class="pil"/><path d="M100 0 L91.5 0 L96.8 100 L100 100 Z" class="pil"/>
        <path d="M8.5 0 L3.2 100" class="edge"/><path d="M91.5 0 L96.8 100" class="edge"/>
      </svg>
      <div class="sr-speed"></div>
      <div class="sr-mirror"><span class="sr-mir-dir"></span><span class="sr-mir-txt"></span></div>
      <div class="sr-tag"><b>${2 - i}</b><span></span></div>
      <div class="sr-alarm"><b>⚠ MISSILE</b><span class="sr-alarm-t"></span><i class="sr-alarm-bar"><em></em></i></div>
      <div class="sr-toast"></div>
      <div class="sr-dash">
        <div class="sr-console">
          <div class="sr-ans"></div>
          <div class="sr-arms"><div class="sr-ms">${MS_ICON.repeat(3)}</div><button class="sr-fire" type="button">${MS_ICON}<span>FIRE</span></button><div class="sr-streak"><i></i><i></i><i></i></div></div>
        </div>
        <div class="sr-drive">
          <button class="sr-pedal sr-boost" type="button">${GAS_SVG}<span>BOOST</span></button>
          <div class="sr-wheelbox"><i class="sr-wglow l"></i><i class="sr-wglow r"></i><div class="sr-wheel">${WHEEL_SVG}
            <div class="sr-screen"><div class="sr-src">AUTO</div><div class="sr-kmh"><span>0</span><small>km/h</small></div><div class="sr-cells"><i></i><i></i><i></i><i></i></div><div class="sr-nbar"><em></em></div></div>
          </div></div>
          <button class="sr-pedal sr-brake" type="button">${BRAKE_SVG}<span>BRAKE</span></button>
        </div>
      </div>
    </div>`;
  const qbox = i => `<div class="sr-qbox sr-qbox${i}" style="--team:${TEAMS[i].color}"><b class="sr-qtag">${TEAMS[i].name}</b><div class="sr-q"></div><div class="sr-qipad">${IPAD_ICON}<span>QUESTION ON THE iPAD</span></div></div>`;
  mount.innerHTML = `
    <div class="sr-strip">
      ${qbox(0)}
      <div class="sr-map"><div class="sr-lap"></div><svg viewBox="40 10 940 180" preserveAspectRatio="xMidYMid meet"></svg><div class="sr-gap"></div></div>
      ${qbox(1)}
    </div>
    <div class="sr-stage">
      <canvas class="sr-canvas"></canvas>
      ${half(0)}${half(1)}
      <div class="sr-divider"></div>
      <div class="sr-center">
        <div class="sr-studio"><i></i><span>ANDREW STUDIO</span><i></i></div>
        <div class="sr-title">SPEED RUN</div>
        <div class="sr-menu-btns"><button class="sr-start" type="button">▶&nbsp; START</button></div>
        <div class="sr-lights"><i></i><i></i><i></i><i></i><i></i></div>
        <div class="sr-go">GO!</div>
      </div>
      <div class="sr-banner"></div>
      <div class="sr-result"><div class="sr-res-title"></div><div class="sr-res-rows"></div><button class="sr-again" type="button">PLAY AGAIN</button></div>
      <div class="sr-panel" hidden><div class="sr-panel-box"><button class="sr-panel-x" type="button" aria-label="Close">✕</button><h2 class="sr-panel-h">iPad</h2><div class="sr-panel-body"></div></div></div>
    </div>`;
  const $ = s => mount.querySelector(s), $$ = s => [...mount.querySelectorAll(s)];
  const stage = $(".sr-stage"), cvs = $(".sr-canvas"), halves = [$(".sr-half0"), $(".sr-half1")], qboxes = [$(".sr-qbox0"), $(".sr-qbox1")];
  const H = halves.map((h, i) => ({
    el: h, dash: h.querySelector(".sr-dash"), ans: h.querySelector(".sr-ans"), fire: h.querySelector(".sr-fire"), ms: [...h.querySelectorAll(".sr-ms svg")], streak: [...h.querySelectorAll(".sr-streak i")],
    wheel: h.querySelector(".sr-wheel"), wbox: h.querySelector(".sr-wheelbox"), kmh: h.querySelector(".sr-kmh span"), cells: [...h.querySelectorAll(".sr-cells i")], src: h.querySelector(".sr-src"),
    nbar: h.querySelector(".sr-nbar em"), nitro: h.querySelector(".sr-boost .sr-nfill"), boost: h.querySelector(".sr-boost"), brake: h.querySelector(".sr-brake"),
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
  const cams = [0, 1].map(() => new THREE.PerspectiveCamera(62, 1, 0.08, 2600));

  const U = { uBend: { value: new THREE.Vector2() }, uBendZ: { value: 0 } };
  const bend = makeBend(U);
  const world = createWorld({ scene, U, bend, keyDir: KEY });
  world.setTrack(L, SEG, LAP);
  const missiles = createMissiles({ scene, bend, U });
  const ramps = createRamps({ scene, bend });
  const trails = createTrails({ scene, bend });
  // dốc: mỗi vòng 2 dốc (≈ 1/3 và 2/3 vòng), lệch về 2 nửa đường xen kẽ ⇒ phải lái sang mới lên được dốc, dễ tranh nhau
  function layRamps() {
    const out = [];
    if (opt.ramps) for (let k = 0; k < LAPS; k++) [[0.3, k % 2 ? 4.1 : -4.1], [0.7, k % 2 ? -4.1 : 4.1]].forEach(([f, x]) => {
      const s = k * LAP + f * LAP; if (s > 90 && s < FIN - 70) out.push({ s: Math.round(s), x, w: 7 });
    });
    ramps.set(out);
  }
  layRamps();

  // ---------- xe + capô ----------
  let cars = [], hoods = [], shadows = [];
  function buildCars() {
    cars.forEach(c => { scene.remove(c.rig); c.dispose(); }); hoods.forEach(h => h.dispose()); shadows.forEach(s => scene.remove(s));
    cars = TEAMS.map((tm, i) => { const c = makeCar({ model: opt.car, color: tm.color, num: i + 1, bend, U }); addPods(c); c.rig.traverse(o => o.layers.set(1 + i)); c.rig.rotation.order = "YXZ"; scene.add(c.rig); return c; });
    hoods = TEAMS.map((tm, i) => makeHood(cars[i], tm.color, 3 + i));
    // bóng blob tách khỏi rig: xe bay lên thì bóng vẫn nằm trên mặt đường (nhạt + to dần theo độ cao)
    shadows = cars.map(c => { const s = c.rig.children.find(o => o.renderOrder === -1); c.rig.remove(s); scene.add(s); return s; });
  }
  function addPods(c) {
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
    g.fillStyle = "#f4f6f8"; g.fillRect(128 - 40, 0, 26, 256); g.fillRect(128 + 14, 0, 26, 256);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }
  function makeHood(car, color, layer) {
    const Ld = HOOD.z0 - HOOD.z1, g = new THREE.PlaneGeometry(HOOD.w, Ld, 24, 14).rotateX(-Math.PI / 2), p = g.attributes.position;
    for (let k = 0; k < p.count; k++) {
      const x0 = p.getX(k), z0 = p.getZ(k), f = clamp((Ld / 2 - z0) / Ld, 0, 1);   // ⚠️ phải kẹp: f âm ⇒ pow = NaN ⇒ bloom loang ĐEN cả màn
      const xn = x0 / (HOOD.w / 2), x = x0 * (1 - 0.12 * f);
      const y = HOOD.y0 - (HOOD.y0 - HOOD.y1) * Math.pow(f, 1.4) + 0.035 * (1 - xn * xn) - 0.1 * Math.pow(Math.abs(xn), 5) - 0.05 * Math.pow(f, 6) * Math.abs(xn);
      p.setXYZ(k, x, y, HOOD.z0 - f * Ld);
    }
    g.computeVertexNormals();
    const tex = hoodTex(color);
    const m = new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.42, metalness: 0.15, clearcoat: 0.6, clearcoatRoughness: 0.3, envMapIntensity: 0.6, fog: false });
    const hood = new THREE.Mesh(g, m);
    const dg = new THREE.PlaneGeometry(2.4, 0.5).rotateX(-Math.PI / 2 + 0.15).translate(0, HOOD.y0 - 0.02, HOOD.z0 + 0.22);
    const dm = new THREE.MeshStandardMaterial({ color: "#15171b", roughness: 0.9, fog: false });
    const dash = new THREE.Mesh(dg, dm);
    const grp = new THREE.Group(); grp.add(hood, dash); grp.traverse(o => o.layers.set(layer)); car.body.add(grp);
    return { grp, dispose() { car.body.remove(grp); g.dispose(); dg.dispose(); m.dispose(); dm.dispose(); tex.dispose(); } };
  }
  buildCars();

  // ---------- hậu kỳ: 2 máy quay → 1 render target MSAA → bloom → nhoè hướng tâm → output ----------
  const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, rt);
  let dashF = 0.3;
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
    // ⚠️ giải MSAA trọn khung (blit bị scissor cắt ⇒ dải dưới tap-lô giữ rác ⇒ NaN loang đen) — xem mẫu 2
    const ac = r.autoClear; r.autoClear = false; r.render(EMPTY, cams[0]); r.autoClear = ac;
  }));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.32, 0.55, 0.92); composer.addPass(bloom);
  const blurPass = new ShaderPass(RadialBlurShader); composer.addPass(blurPass);
  composer.addPass(new OutputPass());

  // ---------- trạng thái ----------
  const G = { phase: "menu", t: 0, countT: 0, winner: -1, endT: 0, queue: [], auto: false, acc: [0.85, 0.6], nextAuto: [0, 0], nextFire: [0, 0], bumpT: 0 };
  const T0 = [null, null];
  const fresh = i => ({ i, s: 0, v: 0, a: 0, x: TEAMS[i].lanes[0], vx: 0, px: 0, yaw: 0, yk: 0, ykV: 0, E: 0, N: 0, steer: 0, boostK: 0, nitroK: 0, brake: 0, brakeT: 0, spinT: 0, spinDir: 1, shake: 0,
    y: 0, vy: 0, air: false, airT: 0, ap: 0, ar: 0, ay: 0, flip: 0, flipDir: 1, flipGoal: null, bad: false, lbT: 0, jk: 0, blurB: 0, ramp: null, lapShown: 1,
    ms: 0, streak: 0, ok: 0, bad_: 0, hits: 0, lock: true, order: [], cur: null, smokeT: 0, aiLane: 0, aiFlipT: 0, aiDodgeT: -9, keyT: -99, touchT: -99, pad: { steer: 0, boost: 0, brake: 0 }, padT: -99,
    padSt: T0[i] ? T0[i].padSt : "", padOn: T0[i] ? T0[i].padOn : false, manual: null, fireT: -9, src: "ai", camK: 0, inc: null, done: false, brakeHeld: false, qn: 0, pick: -1, pickOk: false, inp: { steer: 0, boost: 0, brake: 0 } });
  const T = [fresh(0), fresh(1)];
  const later = (sec, fn) => G.queue.push({ at: G.t + sec, fn });

  function resetTeams() {
    T.forEach((t, i) => { T0[i] = t; T[i] = fresh(i); T0[i] = null; });
    missiles.clear(); trails.reset(); G.winner = -1; G.queue = []; $(".sr-result").classList.remove("on"); $(".sr-banner").className = "sr-banner";
    halves.forEach(h => h.classList.remove("is-alarm", "is-locked", "is-win", "is-lose", "is-air", "is-nitro"));
  }

  // ---------- câu hỏi ----------
  let qSeq = 0;                                             // số câu toàn cục (không đặt lại khi chơi lại) ⇒ iPad bỏ được lệnh cũ
  function shareQ(t) {                                      // câu hỏi + đáp án + kết quả ⇒ iPad (chế độ 1 trả lời trên iPad)
    if (!remote || !remote.share) return;
    const c = G.phase === "race" ? t.cur : null;
    remote.share(t.i, "q", JSON.stringify({ n: t.qn, ph: G.phase, q: c ? c.q.question : "", a: c ? c.answers.map(a => a.text) : [], lock: !!t.lock, pick: t.pick, ok: t.pickOk ? 1 : 0,
      rev: c && t.pick >= 0 && !t.pickOk ? c.answers.map((a, j) => a.correct ? j : -1).filter(j => j >= 0) : [] }));
  }
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
    t.qn = ++qSeq; t.pick = -1; t.pickOk = false; shareQ(t);
  }
  H.forEach((h, i) => {
    h.ans.addEventListener("pointerdown", e => { const b = e.target.closest("button"); if (b && padMode !== 1) { e.preventDefault(); answer(i, +b.dataset.k); } });   // chế độ 1: trả lời trên iPad
    h.fire.addEventListener("pointerdown", e => { e.preventDefault(); fire(i); });
  });

  function answer(i, k) {
    const t = T[i];
    if (G.phase !== "race" || t.lock || t.done || !t.cur) return false;
    const ok = !!t.cur.answers[k]?.correct, btns = H[i].ans.querySelectorAll("button");
    t.lock = true; H[i].el.classList.add("is-qlock");
    btns[k]?.classList.add(ok ? "is-ok" : "is-bad");
    t.pick = k; t.pickOk = ok;
    const qb = qboxes[i]; qb.classList.remove("fx-ok", "fx-bad"); void qb.offsetWidth; qb.classList.add(ok ? "fx-ok" : "fx-bad");
    if (ok) {
      t.ok++; t.streak++;
      const full = t.E >= PHYS.CAP * SEG - 0.5; t.E = Math.min(PHYS.CAP * SEG, t.E + SEG);
      if (t.streak >= opt.streak) { t.streak = 0; if (t.ms < opt.msMax) { t.ms++; toast(i, "+1 MISSILE", "ms"); } }
      else if (full) toast(i, "ENERGY FULL", "info");
      if (missiles.incoming(i) && t.src === "ai") { t.aiLane = 1 - t.aiLane; t.aiDodgeT = G.t; toast(i, "AUTO DODGE!", "ok"); }
      later(0.55, () => nextQ(t));
      onEvent("correct", { team: i, energy: t.E });
    } else {
      t.bad_++; t.streak = 0;
      const full = Math.max(0, Math.ceil(t.E / SEG - 1e-3) - 1), lost = full * SEG;
      t.E -= lost; t.brakeT = 0.55;
      t.cur.answers.forEach((a, j) => { if (a.correct) btns[j]?.classList.add("is-reveal"); });
      if (lost > 0) toast(i, "−" + full + " ⚡", "bad");
      later(1.3, () => nextQ(t));
      onEvent("wrong", { team: i, lost });
    }
    shareQ(t);
    return ok;
  }
  const toastAt = [-9, -9];
  function toast(i, text, kind) { const el = H[i].toast; el.textContent = text; el.className = "sr-toast"; void el.offsetWidth; el.className = "sr-toast on k-" + kind; toastAt[i] = G.t; }

  // ---------- tên lửa ----------
  function predict(j, tl) {
    const t = T[j], a = clamp(t.a, -PHYS.HARD, PHYS.ACCB);
    let ds = t.v * tl + 0.5 * a * tl * tl;
    if (a < 0 && t.v + a * tl < 0) ds = t.v * t.v / (-2 * a);
    ds = Math.max(ds, 0);
    return { s: t.s + ds, x: clamp(t.x + (t.vx + t.px) * Math.min(tl, 0.5), -ROADX, ROADX) };
  }
  function fire(i) {
    const t = T[i], j = 1 - i;
    if (G.phase !== "race" || t.ms <= 0 || t.done || T[j].done || G.t - t.fireT < 1.0 || t.spinT > 0) return false;
    t.ms--; t.fireT = G.t;
    missiles.launch({ from: i, to: j, x: t.x, y: 1.7 + t.y, z: -t.s - 0.2, predict: tl => predict(j, tl), color: TEAMS[i].color });
    toast(i, "MISSILE AWAY!", "ms");
    onEvent("fire", { team: i });
    return true;
  }
  function impact(h) {
    const tg = T[h.to], ds = tg.s - h.P.s, dx = tg.x - h.P.x;
    let kind = Math.abs(dx) < 1.55 && Math.abs(ds) < 3.4 ? "hit" : Math.hypot(dx, ds * 0.6) < 4.2 ? "graze" : "miss";
    if (tg.done || G.phase !== "race") kind = "miss";
    const jumped = kind !== "miss" && tg.y > 1.6;                // đang bay cao trên cầu nhảy ⇒ tên lửa nổ dưới gầm
    if (jumped) kind = "miss";
    if (kind === "hit") {
      missiles.boom(tg.x, -tg.s, "hit");
      const lost = Math.min(tg.E, opt.hitLoss * SEG); tg.E -= lost;
      tg.spinT = 1.4; tg.spinDir = Math.random() < 0.5 ? -1 : 1; tg.v *= 0.55; tg.shake = 1; tg.blurB = 0.8; T[h.from].hits++;
      toast(h.to, lost > 0 ? `HIT! −${Math.round(lost / SEG)} ⚡` : "HIT!", "bad"); toast(h.from, "DIRECT HIT!", "ok");
    } else if (kind === "graze") {
      missiles.boom(h.P.x, -h.P.s, "graze");
      tg.v *= 0.6; tg.brakeT = 0.35; tg.shake = 0.6;
      toast(h.to, "GRAZED!", "bad"); toast(h.from, "CLOSE!", "info");
    } else {
      missiles.boom(h.P.x, -h.P.s, "miss");
      if (G.phase === "race") { toast(h.to, jumped ? "JUMPED IT!" : "DODGED!", "ok"); toast(h.from, "MISSED", "info"); }
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
    closePanel(); tools.close(); T.forEach(shareQ);
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
      $(".sr-res-rows").innerHTML = T.map(t => `<div style="--team:${TEAMS[t.i].color}"><b>${TEAMS[t.i].name}</b><span>${Math.round(Math.min(t.s, FIN))} / ${FIN} m</span><span>✔ ${t.ok} · ✘ ${t.bad_}</span><span>🚀 ${t.hits} hit${t.hits === 1 ? "" : "s"}</span></div>`).join("");
      $(".sr-result").classList.add("on");
    });
    T.forEach(shareQ);
    onEvent("end", { winner: w });
  }
  function toMenu() {                                       // Menu ▸ về màn chờ (bỏ trận đang chơi)
    resetTeams(); G.phase = "menu";
    mount.classList.remove("is-count", "is-race", "is-end"); mount.classList.add("is-menu");
    H.forEach(h => { h.q.textContent = ""; h.ans.innerHTML = ""; h.el.classList.remove("is-qlock"); });
    T.forEach(shareQ);
  }
  $(".sr-start").addEventListener("click", () => start());
  $(".sr-again").addEventListener("click", () => start());
  mount.classList.add("is-menu");

  // ---------- iPad (bảng) ----------
  const panel = $(".sr-panel");
  const PADM_KEY = "speedrun.padMode";
  let padMode = opt.padMode != null ? opt.padMode : (() => { try { const v = +localStorage.getItem(PADM_KEY); return v === 1 || v === 2 ? v : 0; } catch (e) { return 0; } })();
  const PM = [
    { t: "iPad OFF", d: "Race, questions and answers all on the big screen.", ic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4.5" y="2.5" width="15" height="19" rx="2.2"/><path d="M3 3l18 18"/></svg>' },
    { t: "Answer on iPad", d: "Race on the big screen. The question shows ONLY on the iPad — the big screen shows just the answers.", ic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="2.5" width="15" height="19" rx="2.2"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.4M12 16.6v.1"/></svg>' },
    { t: "Drive on iPad", d: "The iPad is the steering wheel, BOOST and BRAKE pedals + missile button. The big screen shows everything; its wheel and pedals just follow the iPad.", ic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.2"/><path d="M3.8 10.5h6M14.2 10.5h6M12 14.2v6"/></svg>' },
  ];
  function openPanel() {
    panel.hidden = false;
    const body = $(".sr-panel-body");
    body.innerHTML = `<div class="sr-pm">${PM.map((m, k) => `<button type="button" class="sr-pm-o${k === padMode ? " on" : ""}" data-m="${k}"><i>${m.ic}</i><b>${k + 1}. ${m.t}</b><span>${m.d}</span></button>`).join("")}</div><div class="sr-pm-pair"></div>`;
    body.querySelectorAll(".sr-pm-o").forEach(b => b.addEventListener("click", () => setPadMode(+b.dataset.m)));
    const pair = body.querySelector(".sr-pm-pair");
    if (padMode && remote) { try { remote.panel(pair, padMode === 1 ? "Each team's iPad shows the question and the answer buttons." : "Each team's iPad shows the steering wheel, BOOST / BRAKE pedals and the missile button."); } catch (e) { pair.innerHTML = "<p>iPad link is not available.</p>"; } }
    else { try { remote && remote.panelClosed && remote.panelClosed(); } catch (e) { /* */ } pair.innerHTML = `<p class="sr-pn-note">Choose mode 2 or 3 to link the iPads.</p>`; }
  }
  function closePanel() { if (panel.hidden) return; panel.hidden = true; try { remote && remote.panelClosed && remote.panelClosed(); } catch (e) { /* */ } }
  function setPadMode(m) {
    padMode = m; try { localStorage.setItem(PADM_KEY, String(m)); } catch (e) { /* */ }
    mount.classList.toggle("pm1", m === 1); mount.classList.toggle("pm2", m === 2);
    touch.forEach(x => x.clear()); paintTouch();
    if (remote && remote.share) [0, 1].forEach(i => remote.share(i, "m", String(m)));
    T.forEach(shareQ);
    if (!panel.hidden) openPanel();
    onEvent("padMode", m);
  }
  $(".sr-panel-x").addEventListener("click", closePanel);
  panel.addEventListener("pointerdown", e => { if (e.target === panel) closePanel(); });

  // ---------- hàng nút chức năng: 1 nút góc phải, bấm ⇒ bung các nút sang trái, bấm chỗ khác ⇒ thu lại ----------
  const tools = (() => {
    if (!bar) return { close() {}, dispose() {} };
    bar.classList.add("sr-bar");
    bar.innerHTML = `<div class="sr-tools">
        <button class="sr-tool" data-k="menu" title="Menu">${TOOL_ICON.menu}</button>
        <button class="sr-tool" data-k="sound" title="Sound">${TOOL_ICON.sound}</button>
        <button class="sr-tool" data-k="folder" title="Switch activity">${TOOL_ICON.folder}</button>
        <button class="sr-tool" data-k="options" title="Options">${TOOL_ICON.options}</button>
        ${remote ? `<button class="sr-tool" data-k="ipad" title="iPad">${TOOL_ICON.ipad}</button>` : ""}
        <button class="sr-tool" data-k="fs" title="Full screen">${TOOL_ICON.fs}</button>
      </div><button class="sr-toolmain" type="button" title="Controls" aria-label="Controls">${TOOL_ICON.more}</button><div class="sr-tooltip"></div>`;
    const main = bar.querySelector(".sr-toolmain"), tip = bar.querySelector(".sr-tooltip");
    let tipT = 0;
    const say = txt => { tip.textContent = txt; tip.classList.add("on"); clearTimeout(tipT); tipT = setTimeout(() => tip.classList.remove("on"), 1800); };
    const open = () => bar.classList.add("is-open"), close = () => bar.classList.remove("is-open");
    main.addEventListener("click", () => bar.classList.contains("is-open") ? close() : open());
    bar.querySelector(".sr-tools").addEventListener("click", e => {
      const b = e.target.closest(".sr-tool"); if (!b) return;
      const k = b.dataset.k;
      if (k === "menu") { toMenu(); close(); }
      else if (k === "sound") { b.classList.toggle("is-off"); say(b.classList.contains("is-off") ? "Sound off" : "Sound on"); }
      else if (k === "folder") say("Switch activity — có khi ghép AWord");
      else if (k === "options") say("Options — có khi ghép AWord");
      else if (k === "ipad") { panel.hidden ? openPanel() : closePanel(); close(); }
      else if (k === "fs") { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.(); close(); }
    });
    const outside = e => { if (bar.classList.contains("is-open") && !bar.contains(e.target)) close(); };
    document.addEventListener("pointerdown", outside, true);
    return { close, dispose() { document.removeEventListener("pointerdown", outside, true); bar.innerHTML = ""; bar.classList.remove("sr-bar", "is-open"); } };
  })();

  // ---------- điều khiển: bàn phím · nút trên màn (BOOST/PHANH, nửa vô lăng) · iPad ----------
  const held = [new Set(), new Set()], touch = [new Map(), new Map()];   // touch: pointerId → "l"|"r"|"b"|"k"
  const KEYMAP = { KeyA: [0, "l"], KeyD: [0, "r"], KeyW: [0, "b"], KeyS: [0, "k"], KeyF: [0, "f"], ArrowLeft: [1, "l"], ArrowRight: [1, "r"], ArrowUp: [1, "b"], ArrowDown: [1, "k"], Enter: [1, "f"], ShiftRight: [1, "f"] };
  const onKeyDown = e => {
    const m = KEYMAP[e.code]; if (!m || e.target.closest?.("input,textarea")) return;
    if (e.code.startsWith("Arrow")) e.preventDefault();
    const [i, k] = m; T[i].keyT = G.t;
    if (k === "f") { if (!e.repeat) fire(i); return; }
    held[i].add(k);
  };
  const onKeyUp = e => { const m = KEYMAP[e.code]; if (m) held[m[0]].delete(m[1]); };
  const onBlur = () => { held.forEach(h => h.clear()); touch.forEach(t => t.clear()); paintTouch(); };
  window.addEventListener("keydown", onKeyDown); window.addEventListener("keyup", onKeyUp); window.addEventListener("blur", onBlur);
  function paintTouch() {
    H.forEach((h, i) => { const v = [...touch[i].values()];
      const t = T[i], man = t.src === "pad" || t.src === "touch" || t.src === "key", p = t.inp;   // nhấn tay HOẶC iPad/phím đang giữ ⇒ vô lăng sáng + bàn đạp lún
      h.wbox.classList.toggle("is-l", v.includes("l") || (man && p.steer < -0.3)); h.wbox.classList.toggle("is-r", v.includes("r") || (man && p.steer > 0.3));
      h.boost.classList.toggle("is-down", v.includes("b") || (man && !!p.boost)); h.brake.classList.toggle("is-down", v.includes("k") || (man && !!p.brake)); });
  }
  function bindHold(el, i, kindOf) {                       // giữ để lái/đạp — nhiều ngón cùng lúc được (mỗi pointerId 1 việc)
    const down = e => { e.preventDefault(); if (padMode === 2) return; try { el.setPointerCapture(e.pointerId); } catch (x) { /* */ } touch[i].set(e.pointerId, kindOf(e)); T[i].touchT = G.t; paintTouch(); };
    const move = e => { if (!touch[i].has(e.pointerId)) return; const k = kindOf(e); if (k !== touch[i].get(e.pointerId)) { touch[i].set(e.pointerId, k); paintTouch(); } T[i].touchT = G.t; };
    const up = e => { if (touch[i].delete(e.pointerId)) paintTouch(); };
    el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move);
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(n => el.addEventListener(n, up));
  }
  H.forEach((h, i) => {
    bindHold(h.wbox, i, e => { const r = h.wbox.getBoundingClientRect(); return e.clientX < r.left + r.width / 2 ? "l" : "r"; });   // nửa trái/phải VÔ LĂNG
    bindHold(h.boost, i, () => "b"); bindHold(h.brake, i, () => "k");
  });

  function input(t) {
    if (t.padOn && padMode === 2) { t.src = "pad"; return G.t - t.padT < 0.45 ? t.pad : { steer: 0, boost: 0, brake: 0 }; }
    const tv = [...touch[t.i].values()], hk = held[t.i];
    if (tv.length || G.t - t.touchT < 4 || G.t - t.keyT < 4) {
      t.src = t.touchT > t.keyT ? "touch" : "key";
      const has = k => hk.has(k) || tv.includes(k);
      return { steer: (has("r") ? 1 : 0) - (has("l") ? 1 : 0), boost: +has("b"), brake: +has("k") };
    }
    if (t.manual) { t.src = "test"; return t.manual; }
    t.src = "ai";
    return aiInput(t);
  }
  // tự lái: giữ làn · nhắm dốc phía trước · vượt khi xe kia chắn đầu · né tên lửa · dùng Nitro khi nhiều · thỉnh thoảng xoay 360 trên không
  function aiInput(t) {
    const o = T[1 - t.i];
    let tx = TEAMS[t.i].lanes[t.aiLane];
    const dodging = t.inc && G.t - t.aiDodgeT < 2.5;
    const ra = ramps.ahead(t.s, 110);
    if (ra && !dodging && !t.air) tx = clamp(ra.r.x, -ROADX + 1.2, ROADX - 1.2);
    const ds = o.s - t.s, dx = o.x - t.x;
    if (!dodging && ds > 0 && ds < 16 && Math.abs(dx) < 2.4 && t.v > o.v + 0.5) tx = clamp(o.x + (o.x > 0 ? -3.8 : 3.8), -ROADX + 1, ROADX - 1);
    if (t.air) return { steer: 0, boost: 0, brake: G.t < t.aiFlipT ? 1 : 0 };
    return { steer: clamp((tx - t.x) * 0.6 - (t.vx + t.px) * 0.22, -1, 1), boost: (t.E > SEG * 1.15 || t.N > 0.55) ? 1 : 0, brake: 0 };
  }

  // ---------- vật lý xe ----------
  function drive(t, dt) {
    const racing = G.phase === "race" && !t.done, o = T[1 - t.i];
    let inp = { steer: 0, boost: 0, brake: 0 };
    if (racing && t.spinT <= 0) inp = input(t);
    else if (G.phase === "end") { const tx = TEAMS[t.i].lanes[t.aiLane]; inp = { steer: clamp((tx - t.x) * 0.5 - t.vx * 0.2, -1, 1), boost: 0, brake: G.t - G.endT > 1.2 ? 1 : 0 }; }
    t.inp = inp;
    t.steer += (inp.steer - t.steer) * Math.min(1, dt * 10);
    const brakeEdge = inp.brake && !t.brakeHeld; t.brakeHeld = !!inp.brake;

    if (t.air) flyStep(t, dt, inp, brakeEdge);
    else {
      const braking = !!inp.brake || t.brakeT > 0;
      if (t.brakeT > 0) t.brakeT -= dt;
      // KÉO GẦN: xe sau được bù tốc, xe trước bị hãm (không dưới VMIN) — chỉ khi đang đua và cả 2 còn chạy
      const gap = o.s - t.s, live = racing && !o.done;
      const behind = live ? smooth(PHYS.CATCH, PHYS.CATCH + PHYS.CATCH_K, gap) : 0, ahead = live ? smooth(PHYS.CATCH, PHYS.CATCH + PHYS.CATCH_K, -gap) : 0;
      const vMin = (racing ? PHYS.VMIN : 0) + 14 * behind;
      const nitroOn = !!inp.boost && t.N > 0.01 && racing;
      if (nitroOn) t.N = Math.max(0, t.N - AIR.NITRO_USE * dt);
      const vE = Math.sqrt(vMin * vMin + 2 * PHYS.DEC * Math.max(0, t.E));          // năng lượng ⇒ trần tốc độ giảm dần mượt về VMIN khi cạn
      let vT = nitroOn ? PHYS.VNITRO : Math.max(vMin, Math.min(inp.boost ? PHYS.VBOOST : PHYS.CRUISE, vE) + 6 * behind);
      vT = Math.max(vT * (1 - 0.32 * ahead), racing ? PHYS.VMIN : 0);
      if (live && -gap > PHYS.GAP_MAX) vT = Math.min(vT, Math.max(o.v, PHYS.VMIN * 0.6));    // trần cứng: không bỏ xa quá 150 m
      if (t.lbT > 0) { t.lbT -= dt; vT += 12; }                                      // Landing Boost
      if (!racing && G.phase !== "end") vT = 0;
      let a = 0;
      if (t.spinT > 0) a = -26;                                                       // trúng tên lửa: xoay + DỪNG tạm
      else if (braking) a = G.phase === "end" ? -9 : -PHYS.BRAKE;
      else if (t.v < vT - 0.05) a = Math.min((nitroOn || t.lbT > 0 ? 24 : inp.boost ? PHYS.ACCB : PHYS.ACC) * (1 - 0.25 * t.v / PHYS.VNITRO), (vT - t.v) / dt);
      else if (t.v > vT + 0.05) a = -clamp((t.v - vT) * 1.6, 3, PHYS.HARD);
      t.v = Math.max(0, t.v + a * dt); t.a = a;
      t.nitroK = lerp(t.nitroK, nitroOn ? 1 : 0, 1 - Math.exp(-dt * 8));
      // ngang: lái liên tục trên CẢ mặt đường; đứng yên thì không lách ngang được; px = lực đẩy ngoài (va chạm) tắt dần
      const latK = clamp(t.v / 8, 0, 1), vxT = (t.spinT > 0 ? 0 : t.steer) * PHYS.LAT * latK;
      t.vx += (vxT - t.vx) * Math.min(1, dt * 7);
      t.yaw = lerp(t.yaw, -Math.atan2(t.vx + t.px * 0.5, Math.max(t.v, 5)) * 0.9, 1 - Math.exp(-dt * 8));
      t.brake = braking || t.spinT > 0 ? 1 : a < -2 ? 0.35 : 0;
      t.boostK = lerp(t.boostK, a > 0.5 || nitroOn ? (inp.boost ? 1 : 0.35) : 0, 1 - Math.exp(-dt * 8));
      if (((braking && t.v > 8) || t.spinT > 0) && t.v > 3) { t.smokeT -= dt; if (t.smokeT <= 0) { t.smokeT = 0.03; [-0.8, 0.8].forEach(k => missiles.smoke.emit(t.x + k, 0.25, -t.s + 1.3, (Math.random() - 0.5) * 1.6, 0.6 + Math.random() * 0.9, 2 + Math.random() * 3, 1.1 + Math.random() * 0.8, 0.9, 0.42, 2.6, 0.9)); } }
    }
    const s0 = t.s, ds = t.v * dt; t.s += ds; if (G.phase !== "end") t.E = Math.max(0, t.E - ds);
    t.x += (t.vx + t.px) * dt; t.px *= Math.exp(-dt * 2.2);
    // cầu nhảy: trên dốc ⇒ cao theo mặt dốc; vừa qua mép ⇒ CẤT CÁNH
    if (!t.air) {
      const rp = ramps.find(t.x, t.s);
      if (rp) { t.y = rp.h; t.ap = RAMP_SLOPE; t.ramp = rp.r; }
      else if (t.ramp) {
        const r = t.ramp; t.ramp = null;
        if (s0 <= r.s + RAMP.LEN + 0.01 && t.s >= r.s + RAMP.LEN - 0.6) takeOff(t);
        else { t.y = 0; t.ap = 0; }                                                   // lách ra khỏi dốc giữa chừng ⇒ rớt xuống
      } else { t.y = 0; t.ap = lerp(t.ap, 0, 1 - Math.exp(-dt * 10)); }
    }
    // rào hộ lan 2 mép đường
    if (t.x < -ROADX || t.x > ROADX) {
      const side = t.x < -ROADX ? -1 : 1; t.x = clamp(t.x, -ROADX, ROADX); t.vx = -side * 0.6; t.px = -side * Math.min(Math.abs(t.px) * 0.3, 1.5);
      if (t.v > 3 && !t.air) { t.v *= 1 - 1.2 * dt; if (Math.random() < 0.7) missiles.sparks.emit(t.x + side * 1.0, 0.5, -t.s + (Math.random() - 0.5) * 2, side * 2, 2 + Math.random() * 3, 3 + Math.random() * 4, 0.35, 0.12, 1, 0, 1); }
    }
    // văng đuôi (va chạm / đáp đất xấu): lò xo tắt dần
    t.ykV += (-26 * t.yk - 6 * t.ykV) * dt; t.yk += t.ykV * dt;
    if (t.spinT > 0) t.spinT = Math.max(0, t.spinT - dt);
    t.shake = Math.max(0, t.shake - dt * 1.6); t.blurB = Math.max(0, t.blurB - dt * 1.8);
    if (G.winner < 0 && G.phase === "race" && t.s >= FIN) finish(t.i);
    // qua mốc vòng
    const lap = Math.min(LAPS, Math.floor(t.s / LAP) + 1);
    if (G.phase === "race" && lap > t.lapShown) { t.lapShown = lap; toast(t.i, lap === LAPS ? "FINAL LAP!" : "LAP " + lap, "info"); }
  }
  function takeOff(t) {
    t.air = true; t.airT = 0; t.v = Math.min(t.v * AIR.BOOST, PHYS.VNITRO * 1.15);              // +20 % tốc độ ngay lúc rời mép dốc
    t.vy = Math.min(8.2, AIR.VY0 + t.v * Math.sin(RAMP_SLOPE) * AIR.VYK + t.v * 0.035);                     // lực phóng LÊN + TỚI (không chỉ quán tính dốc)
    t.y = RAMP.H; t.ap = RAMP_SLOPE; t.ar = 0; t.ay = 0; t.flip = 0; t.flipGoal = null; t.bad = false;
    t.shake = Math.max(t.shake, 0.55); t.blurB = 1;
    if (t.src === "ai" && Math.random() < 0.6) t.aiFlipT = G.t + 0.12;                           // tự lái: thỉnh thoảng xoay 1 vòng
    onEvent("takeoff", { team: t.i, v: +t.v.toFixed(1) });
  }
  function flyStep(t, dt, inp, brakeEdge) {
    t.airT += dt;
    t.vy -= (t.airT < AIR.LIFT_T ? AIR.GUP : AIR.G) * dt; t.y += t.vy * dt;
    t.a = 0; t.boostK = lerp(t.boostK, 0.3, 1 - Math.exp(-dt * 4)); t.brake = 0;
    // điều khiển nhẹ: ◀ ▶ = nghiêng (roll) + lượn hướng (yaw) + trôi ngang chút
    t.vx += inp.steer * 2.2 * dt;
    if (!t.flip && !t.bad) { t.ar += inp.steer * AIR.ROLL * dt; t.ay += inp.steer * 0.45 * dt; }
    // PHANH trên không = xoay tròn: phanh thẳng ⇒ Flat Spin (quanh trục đứng) · phanh + lái ⇒ Barrel Roll (quanh trục dọc)
    if (brakeEdge && !t.bad && !t.flip) { t.flip = Math.abs(inp.steer) > 0.35 ? 2 : 1; t.flipDir = t.flip === 2 ? Math.sign(inp.steer) : (Math.sign(inp.steer) || (t.i ? -1 : 1)); t.flipGoal = null; }
    if (t.flip) {
      const w = AIR.ROT * t.flipDir * dt;
      if (inp.brake) t.flipGoal = null;
      else if (t.flipGoal == null) { const cur = t.flip === 1 ? t.ay : t.ar; t.flipGoal = (t.flipDir > 0 ? Math.ceil(cur / TAU - 0.02) : Math.floor(cur / TAU + 0.02)) * TAU; }   // nhả phanh ⇒ tự xoay NỐT tới vòng trọn
      if (t.flip === 1) t.ay += w; else t.ar += w;
      if (t.flipGoal != null) { const cur = t.flip === 1 ? t.ay : t.ar; if ((t.flipGoal - cur) * t.flipDir <= 0) { if (t.flip === 1) t.ay = t.flipGoal; else t.ar = t.flipGoal; t.flip = 0; t.flipGoal = null; } }
    } else if (!inp.steer) {                                                                          // tự cân nhẹ về thăng bằng (vòng trọn gần nhất)
      const k = 1 - Math.exp(-dt * 2.4); t.ar += (Math.round(t.ar / TAU) * TAU - t.ar) * k * 0.6; t.ay += (Math.round(t.ay / TAU) * TAU - t.ay) * k * 0.35;
    }
    // chúc mũi theo quỹ đạo (đầu bay ngóc lên, cuối hơi chúc) — nhẹ để mặc định đáp được
    t.ap = lerp(t.ap, Math.atan2(t.vy, Math.max(t.v, 8)) * 0.45, 1 - Math.exp(-dt * 3));
    if (t.y <= 0 && t.vy < 0) land(t);
  }
  function land(t) {
    const eP = Math.abs(t.ap), eR = Math.abs(wrapPI(t.ar)), eY = Math.abs(wrapPI(t.ay)), err = Math.max(eP, eR, eY);
    const rots = Math.max(0, Math.round(Math.abs(t.ay) / TAU - 0.15)) + Math.max(0, Math.round(Math.abs(t.ar) / TAU - 0.15));
    const wasBad = t.bad, name = spinName(t);
    t.air = false; t.y = 0; t.vy = 0; t.airT = 0; t.flip = 0; t.flipGoal = null;
    if (wasBad) { t.bad = false; t.ap = 0; t.ar = 0; t.ay = 0; t.shake = Math.max(t.shake, 0.4); return; }   // cú nảy sau đáp xấu
    const X = t.x, Z = -t.s;
    if (err < AIR.OK) {
      const perfect = err < AIR.PERFECT;
      if (rots > 0) t.N = Math.min(1, t.N + AIR.NITRO_ROT * rots + (perfect ? 0.1 : 0));
      if (perfect) {
        t.lbT = 1.0; t.v += 8; t.shake = Math.max(t.shake, 0.55); t.blurB = 0.9;
        for (let k = 0; k < 28; k++) { const sd = k % 2 ? 1 : -1; missiles.sparks.emit(X + sd * 0.8, 0.15, Z + 1.4, sd * (1 + Math.random() * 3), 1 + Math.random() * 4, 4 + Math.random() * 8, 0.4 + Math.random() * 0.3, 0.14, 1, 0, 1); }
        [-0.8, 0.8].forEach(k => { for (let n = 0; n < 6; n++) missiles.smoke.emit(X + k, 0.3, Z + 1.5, (Math.random() - 0.5) * 2, 0.5 + Math.random(), 3 + Math.random() * 3, 1.0 + Math.random() * 0.6, 1.0, 0.5, 2.8, 1); });
        toast(t.i, rots > 0 ? `PERFECT! ${name} ×${rots} +NITRO` : "PERFECT LANDING!", "ok");
      } else { t.shake = Math.max(t.shake, 0.45); if (rots > 0) toast(t.i, `${name} ×${rots} +NITRO`, "ms"); }
      t.ap = 0; t.ar = 0; t.ay = 0;
      onEvent("land", { team: t.i, kind: perfect ? "perfect" : "ok", rots, err: +(err * 180 / Math.PI).toFixed(1) });
    } else {                                                                                                // đáp nghiêng / lật ⇒ mất đà, nảy, nổ nhỏ, văng đuôi
      t.v *= 0.45; t.bad = true; t.air = true; t.vy = 3.4; t.y = 0.02; t.airT = AIR.LIFT_T;
      t.yk = clamp(wrapPI(t.ay), -1.2, 1.2) || (Math.random() < 0.5 ? -0.7 : 0.7); t.ykV = 0; t.ay = 0; t.ar = 0; t.ap = 0.12;
      t.shake = 1; t.blurB = 0.7; missiles.boom(X, Z, "miss");
      for (let k = 0; k < 30; k++) missiles.sparks.emit(X + (Math.random() - 0.5) * 2, 0.3, Z + (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 10, 2 + Math.random() * 6, (Math.random() - 0.5) * 10, 0.5, 0.15, 1, 0, 1);
      toast(t.i, "BAD LANDING!", "bad");
      onEvent("land", { team: t.i, kind: "bad", rots, err: +(err * 180 / Math.PI).toFixed(1) });
    }
  }
  const spinName = t => Math.abs(t.ar) > Math.abs(t.ay) ? "BARREL ROLL" : "360 SPIN";

  // ---------- va chạm 2 xe: 2 hình chữ nhật xoay trên mặt đường (x, s) — SAT + xung lực ----------
  function collide() {
    const A = T[0], B = T[1]; if (Math.abs(A.y - B.y) > 1.1) return;
    const M = cars[0].M, hw = M.W / 2 + 0.04, hl = M.L / 2;
    const ya = A.yaw + A.yk, yb = B.yaw + B.yk;
    const fa = [-Math.sin(ya), Math.cos(ya)], ra = [Math.cos(ya), Math.sin(ya)], fb = [-Math.sin(yb), Math.cos(yb)], rb = [Math.cos(yb), Math.sin(yb)];
    const d = [B.x - A.x, B.s - A.s];
    if (d[0] * d[0] + d[1] * d[1] > 36) return;
    const dot = (p, q) => p[0] * q[0] + p[1] * q[1];
    let best = 1e9, n = null;
    for (const ax of [fa, ra, fb, rb]) {
      const pa = hl * Math.abs(dot(fa, ax)) + hw * Math.abs(dot(ra, ax)), pb = hl * Math.abs(dot(fb, ax)) + hw * Math.abs(dot(rb, ax));
      const dd = dot(d, ax), ov = pa + pb - Math.abs(dd);
      if (ov <= 0) return;
      if (ov < best) { best = ov; n = dd >= 0 ? ax : [-ax[0], -ax[1]]; }
    }
    // tách: mỗi xe lùi nửa độ chồng theo pháp tuyến
    A.x -= n[0] * best / 2; A.s -= n[1] * best / 2; B.x += n[0] * best / 2; B.s += n[1] * best / 2;
    const ua = [A.vx + A.px, A.v], ub = [B.vx + B.px, B.v], vn = (ub[0] - ua[0]) * n[0] + (ub[1] - ua[1]) * n[1];
    const P = [(A.x + B.x) / 2, (A.s + B.s) / 2];                // điểm va (gần đúng)
    if (vn < 0) {
      const e = 0.28, j = -(1 + e) * vn / 2;
      // dọc: đổi thẳng tốc độ chạy; ngang: thành lực đẩy px (tắt dần) ⇒ "ép" được nhau
      A.v = Math.max(0, A.v - j * n[1]); B.v = Math.max(0, B.v + j * n[1]);
      A.px -= j * n[0] * 1.15; B.px += j * n[0] * 1.15;
      // văng đuôi theo điểm va (mô-men = r × J)
      const kick = (t, sgn) => { const r = [P[0] - t.x, P[1] - t.s], Jx = sgn * j * n[0], Js = sgn * j * n[1]; t.ykV += clamp((r[0] * Js - r[1] * Jx) * 0.11, -3.5, 3.5); };
      kick(A, -1); kick(B, 1);
      const hard = clamp(j / 7, 0, 1);
      A.shake = Math.max(A.shake, 0.25 + 0.6 * hard); B.shake = Math.max(B.shake, 0.25 + 0.6 * hard);
      for (let k = 0; k < 6 + 30 * hard; k++) missiles.sparks.emit(P[0], 0.55, -P[1], (Math.random() - 0.5) * 8, 1 + Math.random() * 4, (Math.random() - 0.5) * 8 + 3, 0.35 + Math.random() * 0.3, 0.14, 1, 0, 1);
      if (j > 2.2 && G.t - G.bumpT > 1.1 && G.phase === "race") {
        G.bumpT = G.t; const word = j > 7 ? "SLAM!" : "BUMP!";
        [0, 1].forEach(i => { if (G.t - toastAt[i] > 0.8) toast(i, word, "info"); });
      }
      onEvent("bump", { j: +j.toFixed(2), n: n.map(v => +v.toFixed(2)) });
    } else if (Math.abs(ub[1] - ua[1]) > 1.5 && Math.random() < 0.5) {      // cọ hông khi chạy song song ⇒ tia lửa
      missiles.sparks.emit(P[0], 0.5, -P[1], (Math.random() - 0.5) * 4, 1 + Math.random() * 2, 4, 0.3, 0.12, 1, 0, 1);
    }
  }

  // ---------- máy quay ----------
  const V1 = new THREE.Vector3(), V2 = new THREE.Vector3(), V3 = new THREE.Vector3(), V4 = new THREE.Vector3(), V5 = new THREE.Vector3(), V6 = new THREE.Vector3();
  let camOverride = null;
  function updateCams(dt) {
    T.forEach((t, i) => {
      const car = cars[i], cam = cams[i];
      const want = G.phase === "menu" ? 0 : G.phase === "count" ? ease(clamp((G.countT - 0.3) / 2.6, 0, 1)) : G.phase === "end" && G.t - G.endT > 2.2 ? 0 : 1;
      t.camK = G.phase === "count" ? want : lerp(t.camK, want, 1 - Math.exp(-dt * 2.2));
      // jk: máy quay NHẢY — trên không lùi RA NGOÀI, thấp, rộng (FOV +18 %); đáp đất thì về lại ghế lái
      t.jk = lerp(t.jk, t.air && !t.bad ? 1 : 0, 1 - Math.exp(-dt * (t.air ? 5 : 2.6)));
      car.body.updateMatrixWorld(true);
      const eyeC = car.body.localToWorld(V1.copy(EYE)), lookC = car.body.localToWorld(V2.copy(LOOK));
      const orb = G.t * 0.22 + i * 2.1, back = G.phase === "end" ? 9 : 7.2;
      const fx = -Math.sin(t.yaw), fz = -Math.cos(t.yaw);         // máy quay ngoài chỉ theo HƯỚNG CHẠY (không theo cú xoay của xe)
      const eyeF = V3.set(t.x - fx * back + Math.sin(orb) * 2.6, t.y + (G.phase === "end" ? 3.2 : 2.3), -t.s - fz * back), lookF = V4.set(t.x + fx * 3, t.y * 0.6 + 0.9, -t.s + fz * 3);
      const side = i ? 2.0 : -2.0;
      const eyeJ = V5.set(t.x + side - fx * 8.6, 0.8 + t.y * 0.35, -t.s - fz * 8.6), lookJ = V6.set(t.x + fx * 5, 0.5 + t.y * 1.0, -t.s + fz * 5);   // nhìn ngay xe ⇒ xe nằm quanh đường chân trời
      const k = t.camK, j = t.jk * k;
      cam.position.lerpVectors(eyeF, eyeC, k).lerp(eyeJ, j);
      const look = eyeF.copy(lookF).lerp(lookC, k).lerp(lookJ, j);
      const sh = (0.006 * smooth(20, 47, t.v) + 0.075 * t.shake) * Math.max(k, 0.4);
      if (sh > 0.0005) { cam.position.x += (Math.random() - 0.5) * sh; cam.position.y += (Math.random() - 0.5) * sh; }
      if (camOverride && camOverride[i]) { cam.position.fromArray(camOverride[i].pos); look.fromArray(camOverride[i].look); }
      cam.lookAt(look);
      cam.rotateZ((car.body.rotation.z * 0.9 - t.steer * 0.025) * k * (1 - t.jk));
      let fov = lerp(62, 80 + 10 * smooth(PHYS.CRUISE * 0.6, PHYS.VBOOST, t.v) + 3 * t.boostK + 5 * t.nitroK, k);
      fov *= 1 + 0.18 * t.jk;
      if (Math.abs(cam.fov - fov) > 0.01) { cam.fov = fov; lens(cam); }
      cam.layers.set(0); cam.layers.enable(2 - i);
      if (k * (1 - t.jk) > 0.86) cam.layers.enable(3 + i); else cam.layers.enable(1 + i);
      cam.updateMatrixWorld();
    });
  }
  const LENS = { A: 1.2, full: 1.4 };
  function lens(cam) {
    const yh = HORIZON * (1 - dashF), below = 1 - yh;
    LENS.full = 2 * below;
    cam.aspect = LENS.A / LENS.full;
    cam.setViewOffset(LENS.A, LENS.full, 0, below - yh, LENS.A, 1);
  }

  // ---------- bản đồ đường vòng + cong 3D theo khúc cua ----------
  const curve = new THREE.CatmullRomCurve3(MAP_PTS.map(([x, y]) => new THREE.Vector3(x, y, 0)), true, "centripetal");
  const MAPN = 400, MP = curve.getSpacedPoints(MAPN).slice(0, MAPN).map(v => [v.x, v.y]);
  const KAP = (() => {                                       // độ cong (rad / m thế giới) tại từng điểm — dương = cua PHẢI (chiều kim đồng hồ trên màn)
    const th = MP.map((p, k) => { const q = MP[(k + 1) % MAPN]; return Math.atan2(q[1] - p[1], q[0] - p[0]); });
    const raw = th.map((a, k) => wrapPI(th[(k + 1) % MAPN] - a) / (LAP / MAPN));
    return raw.map((_, k) => { let s = 0; for (let d = -6; d <= 6; d++) s += raw[(k + d + MAPN) % MAPN]; return s / 13; });
  })();
  const lapU = s => (((s % LAP) + LAP) % LAP) / LAP;
  const mapAt = s => { const f = lapU(s) * MAPN, k = Math.floor(f) % MAPN, u = f - Math.floor(f), a = MP[k], b = MP[(k + 1) % MAPN]; return [lerp(a[0], b[0], u), lerp(a[1], b[1], u)]; };
  const kapAt = s => KAP[Math.floor(lapU(s) * MAPN) % MAPN];
  function bendFor(i) {                                      // khúc cua 3D lấy từ độ cong bản đồ ~30–150 m phía trước (+ đổ dốc nhẹ như mẫu 2)
    const S = T[i].s, amt = opt.bend * (G.phase === "menu" ? 0.5 : 1);
    let k = 0; for (let d = 30; d <= 150; d += 30) k += kapAt(S + d); k /= 5;
    return [clamp(k * 0.085, -0.0024, 0.0024) * amt, (0.00012 + 0.0001 * Math.sin(S / 170 + 0.4)) * amt];
  }
  const bxS = [0, 0];
  function prepView(i, hPx) {
    const cam = cams[i], [bx, by] = bendFor(i);
    bxS[i] = lerp(bxS[i], bx, 0.08);                         // mượt: khúc cua vào dần
    U.uBend.value.set(bxS[i], by); U.uBendZ.value = cam.position.z;
    world.update(cam.position, G.t, Math.min(T[0].s, T[1].s) - 30, Math.max(T[0].s, T[1].s));
    missiles.setScale(hPx * LENS.full / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2))));
  }
  const mapSvg = $(".sr-map svg");
  const dPath = "M" + MP.map(p => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L") + " Z";
  const sf = (() => { const a = MP[0], b = MP[3], ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI; return `translate(${a[0].toFixed(1)} ${a[1].toFixed(1)}) rotate(${ang.toFixed(1)})`; })();
  mapSvg.innerHTML = `<path d="${dPath}" class="m-edge"/><path d="${dPath}" class="m-road"/><path d="${dPath}" class="m-mid"/>
    ${Array.from({ length: L - 1 }, (_, k) => { const u = lapU((k + 1) * SEG); if (u < 0.01 || u > 0.99) return ""; const [x, y] = mapAt((k + 1) * SEG); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" class="m-tick"/>`; }).join("")}
    ${ramps.list.filter(r => r.s < LAP).map(r => { const [x, y] = mapAt(r.s + RAMP.LEN); return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" class="m-ramp"><path d="M-9 6 L0 -9 L9 6 Z"/></g>`; }).join("")}
    <g transform="${sf}"><rect x="-3" y="-17" width="6" height="34" class="m-start"/></g>
    <g class="m-ms"></g>
    ${[0, 1].map(i => `<g class="m-car" data-i="${i}"><circle r="15" fill="${TEAMS[i].color}"/><text text-anchor="middle" dominant-baseline="central">${i + 1}</text></g>`).join("")}`;
  const mapCars = [...mapSvg.querySelectorAll(".m-car")], mapMs = mapSvg.querySelector(".m-ms"), gapEl = $(".sr-gap"), lapEl = $(".sr-lap");

  // ---------- HUD ----------
  const PJ = new THREE.Vector3();
  let hudT = 0, infoT = 0;
  const blurK = [0, 0];
  function updateHUD(dt) {
    T.forEach((t, i) => {
      const [x, y] = mapAt(t.s); mapCars[i].setAttribute("transform", `translate(${x.toFixed(1)} ${(y + (i ? 6 : -6)).toFixed(1)})`);
      const h = H[i];
      h.wheel.style.transform = `rotate(${(t.steer * 70 + (t.spinT > 0 ? Math.sin(G.t * 40) * 6 : 0)).toFixed(1)}deg)`;
      const o = T[1 - i], cam = cams[i], d = Math.min(-o.s - cam.position.z, 0);
      PJ.set(o.x + bxS[i] * d * d, 2.0 + o.y - bendFor(i)[1] * d * d, -o.s); const dist = PJ.distanceTo(cam.position); PJ.project(cam);
      const yTop = (1 - PJ.y) / 2, show = G.phase === "race" && PJ.z < 1 && Math.abs(PJ.x) < 0.98 && yTop > 0.05 && yTop < 1 - dashF - 0.04 ? smooth(14, 40, dist) : 0;
      h.tag.style.opacity = show.toFixed(2);
      if (show > 0) { h.tag.style.left = ((PJ.x + 1) / 2 * 100).toFixed(2) + "%"; h.tag.style.top = (yTop * 100).toFixed(2) + "%"; }
      const inc = missiles.incoming(i); t.inc = inc;
      h.el.classList.toggle("is-alarm", !!inc); h.el.classList.toggle("is-locked", !!(inc && inc.locked));
      if (inc) { h.alarmBar.style.transform = `scaleX(${clamp(inc.tLeft / MS.T, 0, 1).toFixed(3)})`; }
      h.el.classList.toggle("is-air", t.jk > 0.3); h.el.classList.toggle("is-nitro", t.nitroK > 0.3);
      // nhoè: khi bay + lúc cất cánh/đáp đất + khi Nitro / rất nhanh
      blurK[i] = lerp(blurK[i], Math.max(t.jk * 0.75, t.blurB, 0.45 * t.nitroK + 0.25 * smooth(PHYS.VBOOST, PHYS.VNITRO, t.v)), 1 - Math.exp(-dt * 10));
    });
    blurPass.uniforms.uK.value.set(blurK[0], blurK[1]);
    const cy = 1 - HORIZON * (1 - dashF); blurPass.uniforms.uC0.value.set(0.25, cy); blurPass.uniforms.uC1.value.set(0.75, cy);
    const act = missiles.active;
    if (mapMs.childElementCount !== act.length) mapMs.innerHTML = act.map(() => `<circle r="8" class="m-msdot"/>`).join("");
    act.forEach((m, k) => { const [x, y] = mapAt(m.P.s); mapMs.children[k].setAttribute("cx", x.toFixed(1)); mapMs.children[k].setAttribute("cy", (y + (m.to ? 6 : -6)).toFixed(1)); });
    hudT -= dt; if (hudT <= 0) {
      hudT = 0.08; paintTouch();
      const lead = T[0].s >= T[1].s ? 0 : 1, gap = Math.abs(T[0].s - T[1].s);
      gapEl.innerHTML = G.phase === "race" || G.phase === "end" ? (gap < 1 ? "NECK AND NECK" : `<b style="color:${TEAMS[lead].color}">${TEAMS[lead].name}</b><br>+${Math.round(gap)} m`) : `${FIN} m`;
      const lapLead = Math.min(LAPS, Math.floor(Math.max(T[0].s, T[1].s) / LAP) + 1);
      lapEl.innerHTML = `<small>LAP</small>${G.phase === "menu" || G.phase === "count" ? 1 : lapLead}/${LAPS}`;
      T.forEach((t, i) => {
        const h = H[i], e = t.E / SEG;
        h.kmh.textContent = Math.round(t.v * 3.6);
        h.cells.forEach((c, k) => c.style.setProperty("--f", clamp(e - k, 0, 1).toFixed(3)));
        h.nbar.style.transform = `scaleX(${t.N.toFixed(3)})`; h.nitro.style.transform = `scaleY(${t.N.toFixed(3)})`;
        h.boost.classList.toggle("has-nitro", t.N > 0.01);
        h.ms.forEach((m, k) => m.classList.toggle("on", k < t.ms));
        h.streak.forEach((s, k) => s.classList.toggle("on", k < t.streak));
        h.fire.classList.toggle("ready", t.ms > 0 && G.phase === "race");
        h.src.textContent = t.src === "pad" ? "iPAD" : t.src === "key" ? "KEYS" : t.src === "touch" ? "TOUCH" : t.src === "test" ? "TEST" : "AUTO";
        h.src.dataset.s = t.padOn ? (t.padSt === "relay" ? "relay" : "on") : "";
        const o = T[1 - i], d = o.s - t.s;
        h.mirDir.textContent = Math.abs(d) < 1 ? "◆" : d > 0 ? "▲" : "▼";
        h.mirTxt.innerHTML = `<b style="color:${TEAMS[1 - i].color}">${TEAMS[1 - i].name}</b> ${Math.abs(d) < 1 ? "level" : (d > 0 ? "ahead " : "behind ") + Math.round(Math.abs(d)) + " m"}`;
        h.tagT.textContent = Math.round(Math.abs(d)) + " m";
        if (t.inc) h.alarmT.textContent = t.inc.locked ? "DODGE!" : t.inc.tLeft.toFixed(1) + " s";
      });
    }
    infoT -= dt; if (infoT <= 0 && remote && remote.send) {
      infoT = 0.25;
      T.forEach((t, i) => { if (t.padOn) remote.send(i, `i:${Math.round(t.v * 3.6)},${(t.E / SEG).toFixed(1)},${t.ms},${t.inc ? (t.inc.locked ? 2 : 1) : 0},${G.phase},${t.N.toFixed(2)}`); });
    }
  }

  // ---------- vòng vẽ ----------
  const AR = makeAutoRes({ max: PR_MAX, min: Math.min(0.8, PR_MAX), key: "speedrun-3b", apply: pr => { renderer.setPixelRatio(pr); fit(true); },
    aa: { on: true, set: on => { const ns = on ? 4 : 0; for (const r of [composer.renderTarget1, composer.renderTarget2]) if (r.samples !== ns) { r.samples = ns; r.dispose(); } } } });
  let W = 0, Hh = 0;
  function fit(force) {
    const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h || (!force && w === W && h === Hh)) return;
    W = w; Hh = h; renderer.setSize(w, h, false); composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h);
    dashF = clamp(H[0].dash.offsetHeight / h, 0, 0.6);
    LENS.A = (w / 2) / h; cams.forEach(lens);
  }
  const ro = new ResizeObserver(() => fit()); ro.observe(stage); fit(true);

  const RC = new THREE.Vector3(), RA = new THREE.Vector3();
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
    if (G.phase === "race" || G.phase === "end") { T.forEach(t => drive(t, dt)); collide(); collide(); }
    missiles.update(dt, G.t).forEach(impact);
    T.forEach((t, i) => {
      const c = cars[i]; c.rig.position.set(t.x, t.y, -t.s);
      c.rig.rotation.set(t.ap, t.yaw + t.yk + t.ay + (t.spinT > 0 ? t.spinDir * TAU * ease(1 - t.spinT / 1.4) : 0), t.ar);
      c.update(dt, { dist: t.s, accel: t.a, brake: t.brake, steer: t.vx, boost: Math.max(t.boostK, t.nitroK), t: G.t });
      c.tips.forEach((tip, k) => { tip.visible = t.ms > k; });
      const hy = t.ramp ? 0 : t.y, sh = shadows[i];
      sh.position.set(t.x, 0.03 + (t.ramp ? t.y : 0), -t.s); sh.rotation.y = t.yaw + t.yk; sh.scale.setScalar(1 + hy * 0.12); sh.material.opacity = 0.9 / (1 + hy * 0.35);
      // vệt gió: 2 góc sau, đậm khi bay / Nitro / rất nhanh
      const k = Math.max(t.air && !t.bad ? 1 : 0, t.nitroK, 0.5 * smooth(PHYS.VBOOST - 2, PHYS.VNITRO, t.v));
      c.rig.updateMatrixWorld(true);
      const M = c.M;
      c.rig.localToWorld(RA.set(-M.W * 0.42, 0.75, M.L / 2 - 0.1)); c.rig.localToWorld(RC.set(M.W * 0.42, 0.75, M.L / 2 - 0.1));
      trails.push(i, RA, RC, k);
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
    answer: (i, k, n) => { if (padMode === 1 && T[i].qn === n) answer(i, k); },
  });
  setPadMode(padMode);

  const api = {
    start, toMenu, setPadMode, get padMode() { return padMode; },
    answer: (i, ok) => { const t = T[i]; if (!t.cur) return false; const k = t.cur.answers.findIndex(a => !!a.correct === !!ok); return answer(i, k < 0 ? 0 : k); },
    auto(on = true, a0, a1) { G.auto = on; if (a0 != null) G.acc[0] = a0; if (a1 != null) G.acc[1] = a1; },
    give(i, n = 1) { T[i].E = Math.min(PHYS.CAP * SEG, T[i].E + n * SEG); },
    arm(i, n = 1) { T[i].ms = clamp(n, 0, opt.msMax); },
    nitro(i, k = 1) { T[i].N = clamp(k, 0, 1); },
    place(i, s, x) { const t = T[i]; if (s != null) t.s = s; if (x != null) t.x = x; t.air = false; t.y = 0; t.ramp = null; },
    fire, drive(i, d) { T[i].manual = d || null; },
    step(n = 1, dt = 1 / 60) { manual = true; for (let k = 0; k < n; k++) frame(dt); fit(true); composer.render(); },
    resume() { manual = false; last = 0; },
    state: () => ({ phase: G.phase, t: +G.t.toFixed(2), winner: G.winner, L, FIN, LAP: +LAP.toFixed(1), LAPS, teams: T.map(t => ({ s: +t.s.toFixed(2), v: +t.v.toFixed(2), kmh: Math.round(t.v * 3.6), x: +t.x.toFixed(2), y: +t.y.toFixed(2), air: t.air, E: +t.E.toFixed(1), cells: +(t.E / SEG).toFixed(2), N: +t.N.toFixed(2), ms: t.ms, streak: t.streak, ok: t.ok, bad: t.bad_, hits: t.hits, src: t.src, pad: t.padSt, spin: +t.spinT.toFixed(2), camK: +t.camK.toFixed(2), jk: +t.jk.toFixed(2), ay: +t.ay.toFixed(2), ar: +t.ar.toFixed(2), ap: +t.ap.toFixed(2), lock: t.lock })) }),
    camInfo: () => cams.map(c => ({ pos: c.position.toArray().map(v => +v.toFixed(2)), fov: +c.fov.toFixed(1), layers: c.layers.mask })),
    cam(o) { camOverride = o || null; },
    missiles: () => missiles.active,
    ramps: () => ramps.list,
    get fps() { return fps; }, get res() { return AR.info; }, get dashF() { return dashF; },
    renderer, scene, cams, composer, G, T,
    destroy() {
      if (dead) return; dead = true; cancelAnimationFrame(raf); ro.disconnect();
      window.removeEventListener("keydown", onKeyDown); window.removeEventListener("keyup", onKeyUp); window.removeEventListener("blur", onBlur);
      try { remote && remote.detach && remote.detach(); } catch (e) { /* */ }
      tools.dispose();
      hoods.forEach(h => h.dispose()); cars.forEach(c => c.dispose()); shadows.forEach(s => scene.remove(s)); world.dispose(); missiles.dispose(); ramps.dispose(); trails.dispose();
      composer.dispose(); rt.dispose(); pmrem.dispose(); scene.environment?.dispose();
      renderer.dispose(); renderer.forceContextLoss(); mount.innerHTML = ""; mount.classList.remove("sr-root", "sr2", "sr3", "is-menu", "is-count", "is-race", "is-end");
      if (window.__sr === api) delete window.__sr;
    }
  };
  return api;
}
