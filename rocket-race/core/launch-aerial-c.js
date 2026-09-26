// =============================================================
// MẪU 4c (thầy 26/9/2026, ảnh nhà xưởng SpaceX nhìn từ drone): MỞ ĐẦU như ảnh — nhà xưởng lớn trắng mái xanh xám
// chữ ANDREW STUDIO ở tiền cảnh, bãi xe, bãi cỏ, ao hồ; 2 BỆ PHÓNG Ở XA. START ⇒ máy quay mới bay lại gần 2 tàu (độ cao
// vừa phải, như màn chờ của 4b). Đuổi đuôi: trời lốm đốm SAO → NHẢY TỐC ĐỘ vượt thời gian (sao kéo vệt, nới góc nhìn,
// loé sáng) nối vào màn chơi. Sửa NHẤP NHÁY của 4b (render target composer không MSAA ⇒ thanh thép mảnh răng cưa
// lấp loá khi flycam bay; đốm nắng trên nước nhỏ hơn 1 điểm ảnh).
// Kế thừa MẪU 4b — INTRO "PHÓNG TỪ MẶT ĐẤT", GÓC NHÌN TỪ TRÊN CAO (thầy 26/9/2026, ảnh Starship nhìn từ drone)
// Mặt đất = ẢNH ĐỊA HÌNH sinh sẵn (tools/tao-dia-hinh.py): biển + sóng, bãi cát, đụn cây bụi, đầm lầy,
// khu phóng (bê tông, đường, bãi xe). Trên đó là công trình 3D: 2 bệ + 2 tháp tay kẹp, khu bồn inox,
// nhà xưởng lớn mái in "ANDREW STUDIO", biển hiệu ANDREW STUDIO ở cổng, cột đèn, bụi cây.
// Màn chờ: flycam bay vòng chậm. START ⇒ máy quay lên cao nhìn xuống (như ảnh) → 3-2-1 → đánh lửa, mây khói
// nâu cuồn cuộn tràn ra, ửng cam ở chân → 2 tàu lao lên VỤT QUA máy quay → máy quay quay theo đuổi đuôi →
// tàu nằm ngang, trời tối thành vũ trụ → onHandoff() (trang hoà cảnh sang màn game).
// =============================================================
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { makeRocket, TEAMS } from "./rr3d-core.js";

const V3 = THREE.Vector3;
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const ASSETS = new URL("../assets/", import.meta.url).href;
const TERR = 240, SITE = 80;                 // phủ của ảnh địa hình / ảnh khu phóng (khớp tools/tao-dia-hinh.py)

// ---------- kết cấu ----------
function canvas(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return [c, c.getContext("2d")]; }
function tex(c, srgb = true) { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
function softTex(size = 128) {
  const [c, g] = canvas(size, size), gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.3, "rgba(255,255,255,.7)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, size, size); return tex(c, false);
}
// búi mây nhìn từ trên: nhiều bướu tròn sáng, khe giữa các bướu TỐI (tự che bóng) ⇒ khối "súp lơ"
function billowTex() {
  // nhiều bướu MỀM chồng nhau (gradient tới trong suốt, không viền cứng); mỗi bướu sáng lệch trên-trái, tối dưới-phải
  const s = 256, [c, g] = canvas(s, s);
  const bumps = [];
  for (let i = 0; i < 70; i++) { const a = rand(0, TAU), d = Math.pow(Math.random(), 0.7) * 78; bumps.push([s / 2 + Math.cos(a) * d, s / 2 + Math.sin(a) * d, rand(14, 38)]); }
  bumps.sort((a, b) => a[1] - b[1]);
  bumps.forEach(([x, y, r]) => {
    const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.05, x, y, r);
    const hi = Math.round(rand(225, 255)), lo = Math.round(rand(120, 160));
    gr.addColorStop(0, `rgba(${hi},${hi},${hi},.95)`); gr.addColorStop(0.5, `rgba(${(hi + lo) >> 1},${(hi + lo) >> 1},${(hi + lo) >> 1},.8)`);
    gr.addColorStop(0.85, `rgba(${lo},${lo},${lo},.35)`); gr.addColorStop(1, `rgba(${lo},${lo},${lo},0)`);
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  });
  g.globalCompositeOperation = "destination-in";
  const m = g.createRadialGradient(s / 2, s / 2, s * 0.18, s / 2, s / 2, s / 2); m.addColorStop(0, "#000"); m.addColorStop(0.75, "rgba(0,0,0,.8)"); m.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = m; g.fillRect(0, 0, s, s);
  return tex(c, false);
}
function puffTex() {
  const s = 128, [c, g] = canvas(s, s);
  for (let i = 0; i < 20; i++) { const x = s / 2 + rand(-22, 22), y = s / 2 + rand(-22, 22), r = rand(16, 36); const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, "rgba(255,255,255,.22)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, s, s); }
  return tex(c, false);
}
// mái nhà xưởng: màng mái xám, ron, cửa trời, máy lạnh + CHỮ "ANDREW STUDIO" sơn trắng khổng lồ + logo
function roofTex(w, d) {
  const S = 180, [c, g] = canvas(Math.round(w * S / 10) * 10, Math.round(d * S / 10) * 10);
  const W = c.width, H = c.height;
  g.fillStyle = "#46494e"; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? "255,255,255" : "0,0,0"},${rand(0.02, 0.05)})`; g.fillRect(rand(0, W), rand(0, H), rand(20, 200), rand(20, 200)); }
  g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 3; for (let x = 0; x < W; x += S * 0.6) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  g.strokeStyle = "#d8dadc"; g.lineWidth = 10; g.strokeRect(5, 5, W - 10, H - 10);                 // gờ mái
  // chữ
  g.fillStyle = "#f4f4f2"; g.textAlign = "center"; g.textBaseline = "middle";
  const fs = Math.min(W / 5.4, H / 3.2);
  g.font = `900 ${fs}px "Bahnschrift", "Segoe UI Black", "Arial Black", sans-serif`;
  g.fillText("ANDREW", W / 2 + fs * 0.35, H * 0.36);
  g.font = `700 ${fs * 0.62}px "Bahnschrift", "Segoe UI", sans-serif`;
  g.fillText("S T U D I O", W / 2 + fs * 0.35, H * 0.64);
  // logo: vòng tròn + mũi tên tên lửa
  const lx = W * 0.13, ly = H / 2, lr = fs * 0.62;
  g.lineWidth = fs * 0.09; g.strokeStyle = "#f4f4f2"; g.beginPath(); g.arc(lx, ly, lr, 0, TAU); g.stroke();
  g.fillStyle = "#e3342f"; g.beginPath(); g.moveTo(lx, ly - lr * 0.72); g.lineTo(lx + lr * 0.34, ly + lr * 0.45); g.lineTo(lx, ly + lr * 0.22); g.lineTo(lx - lr * 0.34, ly + lr * 0.45); g.closePath(); g.fill();
  return tex(c);
}
// vách tôn sóng + dải cửa kính + chữ gắn tường
function wallTex(w, h, sign) {
  const S = 120, [c, g] = canvas(Math.round(w * S), Math.round(h * S));
  const W = c.width, H = c.height;
  g.fillStyle = "#a9adb2"; g.fillRect(0, 0, W, H);
  for (let x = 0; x < W; x += 10) { g.fillStyle = x % 20 ? "rgba(0,0,0,.07)" : "rgba(255,255,255,.12)"; g.fillRect(x, 0, 5, H); }
  for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(80,70,60,${rand(0.02, 0.06)})`; g.fillRect(rand(0, W), H * rand(0.3, 1), rand(10, 90), rand(40, 300)); }
  g.fillStyle = "#2c3440"; g.fillRect(0, H * 0.9, W, H * 0.1);                                    // chân tường tối
  if (sign) {
    g.fillStyle = "#1e2530"; g.font = `900 ${H * 0.1}px "Bahnschrift", "Segoe UI Black", sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText("ANDREW STUDIO", W / 2, H * 0.14);
    g.fillStyle = "#56606c"; g.fillRect(W * 0.2, H * 0.34, W * 0.6, H * 0.56);                   // cửa cuốn lớn
    for (let y = H * 0.34; y < H * 0.9; y += 12) { g.fillStyle = "rgba(0,0,0,.12)"; g.fillRect(W * 0.2, y, W * 0.6, 3); }
  } else {
    g.fillStyle = "#2a3a4c"; for (let x = W * 0.05; x < W * 0.95; x += W * 0.1) g.fillRect(x, H * 0.35, W * 0.07, H * 0.14);
  }
  return tex(c);
}
// biển hiệu cổng: tường đá tối + chữ inox + logo, đèn hắt
function signTex() {
  const [c, g] = canvas(2048, 512);
  const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#2b2f36"); gr.addColorStop(1, "#1a1d22");
  g.fillStyle = gr; g.fillRect(0, 0, 2048, 512);
  for (let i = 0; i < 1600; i++) { g.fillStyle = `rgba(255,255,255,${rand(0.01, 0.05)})`; g.fillRect(rand(0, 2048), rand(0, 512), rand(1, 6), rand(1, 3)); }
  g.strokeStyle = "rgba(255,255,255,.08)"; g.lineWidth = 2; for (let x = 0; x < 2048; x += 256) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke(); }
  const metal = g.createLinearGradient(0, 150, 0, 360); metal.addColorStop(0, "#ffffff"); metal.addColorStop(0.5, "#b9c0c8"); metal.addColorStop(1, "#eef1f4");
  g.fillStyle = metal; g.textBaseline = "middle"; g.textAlign = "left";
  g.font = `900 200px "Bahnschrift", "Segoe UI Black", "Arial Black", sans-serif`;
  g.shadowColor = "rgba(0,0,0,.6)"; g.shadowBlur = 18; g.shadowOffsetY = 8;
  g.fillText("ANDREW", 470, 215);
  g.font = `600 118px "Bahnschrift", "Segoe UI", sans-serif`;
  g.fillText("S  T  U  D  I  O", 478, 385);
  g.shadowBlur = 0; g.shadowOffsetY = 0;
  // logo
  g.lineWidth = 22; g.strokeStyle = metal; g.beginPath(); g.arc(260, 256, 150, 0, TAU); g.stroke();
  g.fillStyle = "#e3342f"; g.beginPath(); g.moveTo(260, 140); g.lineTo(318, 330); g.lineTo(260, 292); g.lineTo(202, 330); g.closePath(); g.fill();
  return tex(c);
}

// ---------- hạt ----------
class Particles {
  constructor(max, { additive, map, warm = false, sorted = false }) {
    this.max = max; this.idx = 0; this.sorted = sorted;
    const F = n => new Float32Array(n);
    Object.assign(this, { pos: F(max * 3), col: F(max * 3), size: F(max), alpha: F(max), rot: F(max), vel: F(max * 3), life: F(max), maxLife: F(max),
      s0: F(max), s1: F(max), c0: F(max * 3), c1: F(max * 3), a0: F(max), drag: F(max), rise: F(max) });
    const geo = new THREE.BufferGeometry();
    [["position", this.pos, 3], ["aColor", this.col, 3], ["aSize", this.size, 1], ["aAlpha", this.alpha, 1], ["aRot", this.rot, 1]]
      .forEach(([n, a, k]) => geo.setAttribute(n, new THREE.BufferAttribute(a, k).setUsage(THREE.DynamicDrawUsage)));
    if (sorted) { this.order = new Uint32Array(max); geo.setIndex(new THREE.BufferAttribute(this.order, 1).setUsage(THREE.DynamicDrawUsage)); }
    this.mat = new THREE.ShaderMaterial({
      uniforms: { uMap: { value: map }, uScale: { value: 800 }, uPadA: { value: new V3() }, uPadB: { value: new V3() }, uFire: { value: 0 } },
      defines: warm ? { WARM: 1 } : {},
      vertexShader: `attribute vec3 aColor; attribute float aSize; attribute float aAlpha; attribute float aRot;
        uniform float uScale; uniform vec3 uPadA, uPadB; uniform float uFire; varying vec3 vC; varying float vA; varying float vR;
        void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); gl_Position = projectionMatrix*mv;
          gl_PointSize = min(aSize*uScale/max(0.1,-mv.z), 2048.0); vC = aColor; vA = aAlpha; vR = aRot;
          #ifdef WARM
          // mây ửng CAM ở gần chân bệ (lửa hắt từ dưới lên), càng cao càng nguội
          vec3 p = position; float dA = length((p - uPadA)*vec3(1.0, 1.6, 1.0)), dB = length((p - uPadB)*vec3(1.0, 1.6, 1.0));
          float w = max(exp(-dA*dA/140.0), exp(-dB*dB/140.0))*uFire;
          vC = mix(vC, vC*vec3(2.4, 1.05, 0.38), clamp(w*1.2, 0.0, 1.0));
          #endif
        }`,
      fragmentShader: `uniform sampler2D uMap; varying vec3 vC; varying float vA; varying float vR;
        void main(){ if (vA <= 0.002) discard; vec2 q = gl_PointCoord - 0.5; float c = cos(vR), s = sin(vR);
          q = vec2(c*q.x - s*q.y, s*q.x + c*q.y) + 0.5; vec4 t = texture2D(uMap, clamp(q, 0.0, 1.0));
          gl_FragColor = vec4(vC*t.rgb, t.a*vA); }`,
      transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending
    });
    this.points = new THREE.Points(geo, this.mat); this.points.frustumCulled = false; this.geo = geo;
    this.key = sorted ? new Float32Array(max) : null;
  }
  emit(p) {
    const i = this.idx; this.idx = (this.idx + 1) % this.max; const i3 = i * 3;
    this.pos[i3] = p.pos.x; this.pos[i3 + 1] = p.pos.y; this.pos[i3 + 2] = p.pos.z;
    this.vel[i3] = p.vel.x; this.vel[i3 + 1] = p.vel.y; this.vel[i3 + 2] = p.vel.z;
    this.life[i] = this.maxLife[i] = p.life; this.s0[i] = p.size; this.s1[i] = p.sizeEnd ?? p.size;
    const a = p.color, b = p.colorEnd || p.color;
    this.c0[i3] = a.r; this.c0[i3 + 1] = a.g; this.c0[i3 + 2] = a.b; this.c1[i3] = b.r; this.c1[i3 + 1] = b.g; this.c1[i3 + 2] = b.b;
    this.a0[i] = p.alpha ?? 1; this.drag[i] = p.drag ?? 0; this.rise[i] = p.rise ?? 0; this.rot[i] = p.rot ?? rand(0, TAU);
  }
  update(dt, cam) {
    let n = 0;
    for (let i = 0; i < this.max; i++) {
      if (this.life[i] <= 0) { if (this.alpha[i] !== 0) { this.alpha[i] = 0; this.size[i] = 0; } continue; }
      this.life[i] -= dt;
      const i3 = i * 3, k = 1 - clamp(this.life[i] / this.maxLife[i], 0, 1), d = Math.max(0, 1 - this.drag[i] * dt);
      this.vel[i3] *= d; this.vel[i3 + 1] = this.vel[i3 + 1] * d + this.rise[i] * dt; this.vel[i3 + 2] *= d;
      this.pos[i3] += this.vel[i3] * dt; this.pos[i3 + 1] += this.vel[i3 + 1] * dt; this.pos[i3 + 2] += this.vel[i3 + 2] * dt;
      this.size[i] = lerp(this.s0[i], this.s1[i], 1 - Math.pow(1 - k, 2));
      for (let j = 0; j < 3; j++) this.col[i3 + j] = lerp(this.c0[i3 + j], this.c1[i3 + j], k);
      this.alpha[i] = this.a0[i] * (k < 0.08 ? k / 0.08 : 1 - Math.pow((k - 0.08) / 0.92, 2));
      if (this.life[i] <= 0) { this.alpha[i] = 0; this.size[i] = 0; continue; }
      if (this.sorted) { const dx = this.pos[i3] - cam.x, dy = this.pos[i3 + 1] - cam.y, dz = this.pos[i3 + 2] - cam.z; this.key[i] = dx * dx + dy * dy + dz * dz; this.order[n++] = i; }
    }
    if (this.sorted) {                          // vẽ XA → GẦN: búi mây che nhau đúng thứ tự
      const ord = this.order.subarray(0, n), key = this.key;
      ord.sort((a, b) => key[b] - key[a]);
      this.geo.index.needsUpdate = true; this.geo.setDrawRange(0, n);
    }
    const a = this.geo.attributes;
    a.position.needsUpdate = a.aColor.needsUpdate = a.aSize.needsUpdate = a.aAlpha.needsUpdate = true;
  }
}

// ---------- khung thép (InstancedMesh hộp đơn vị) ----------
class Struts {
  constructor() { this.m = []; }
  bar(a, b, t = 0.08, t2 = t) {
    const d = new V3().subVectors(b, a), len = d.length();
    const q = new THREE.Quaternion().setFromUnitVectors(new V3(0, 1, 0), d.clone().normalize());
    this.m.push(new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), q, new V3(t, len, t2)));
  }
  box(c, sx, sy, sz, ry = 0) { this.m.push(new THREE.Matrix4().compose(c, new THREE.Quaternion().setFromAxisAngle(new V3(0, 1, 0), ry), new V3(sx, sy, sz))); }
  mesh(mat) {
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat, this.m.length);
    this.m.forEach((m, i) => im.setMatrixAt(i, m)); im.castShadow = true; im.receiveShadow = true; return im;
  }
}
function towerStruts(S, base, H, W, level = 0.62) {
  const h = W / 2, Cn = [[-h, -h], [h, -h], [h, h], [-h, h]];
  Cn.forEach(([x, z]) => S.bar(base.clone().add(new V3(x, 0, z)), base.clone().add(new V3(x, H, z)), 0.18));
  // cột giữa (ray thang máy) + lõi
  S.bar(base.clone().add(new V3(0, 0, 0)), base.clone().add(new V3(0, H, 0)), 0.34);
  for (let y = 0; y <= H + 1e-6; y += level) {
    for (let k = 0; k < 4; k++) {
      const [x0, z0] = Cn[k], [x1, z1] = Cn[(k + 1) % 4];
      S.bar(base.clone().add(new V3(x0, y, z0)), base.clone().add(new V3(x1, y, z1)), 0.075);
      if (y + level <= H + 1e-6) {
        S.bar(base.clone().add(new V3(x0, y, z0)), base.clone().add(new V3(x1, y + level, z1)), 0.045);
        S.bar(base.clone().add(new V3(x1, y, z1)), base.clone().add(new V3(x0, y + level, z0)), 0.045);
      }
    }
    if (Math.round(y / level) % 3 === 0) S.box(base.clone().add(new V3(0, y, 0)), W * 0.96, 0.05, W * 0.96);   // sàn thao tác
  }
}
function trussStruts(S, a, b, hgt = 0.45, wid = 0.4, n = 8) {
  const d = new V3().subVectors(b, a), up = new V3(0, 1, 0), side = new V3().crossVectors(d, up).normalize().multiplyScalar(wid / 2), U = up.clone().multiplyScalar(hgt / 2);
  const cs = [side.clone().add(U), side.clone().sub(U), side.clone().negate().sub(U), side.clone().negate().add(U)];
  cs.forEach(o => S.bar(a.clone().add(o), b.clone().add(o), 0.06));
  for (let i = 0; i < n; i++) {
    const p0 = a.clone().addScaledVector(d, i / n), p1 = a.clone().addScaledVector(d, (i + 1) / n);
    [[0, 1], [3, 2], [0, 3], [1, 2]].forEach(([u, v]) => S.bar(p0.clone().add(cs[i % 2 ? u : v]), p1.clone().add(cs[i % 2 ? v : u]), 0.035));
  }
}

export async function createLaunch(cfg) {
  const container = cfg.container;
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cfg.pixelRatio ?? 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.9;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.append(renderer.domElement);
  const scene = new THREE.Scene();
  const HAZE = new THREE.Color(0.62, 0.72, 0.84), SPACE = new THREE.Color(0.012, 0.018, 0.04);
  scene.fog = new THREE.Fog(HAZE.clone(), 140, 700);
  const camera = new THREE.PerspectiveCamera(cfg.fov ?? 38, 2, 0.5, 20000);
  // ⛔ NHẤP NHÁY (4b): EffectComposer mặc định vẽ vào render target KHÔNG khử răng cưa ⇒ thanh thép/hàng rào mảnh
  // lấp loá khi máy quay trôi. Render target có MSAA 4 mẫu.
  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(16, 16, { type: THREE.HalfFloatType, samples: 4 }));
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.45, 0.5, 0.9);
  composer.addPass(bloom); composer.addPass(new OutputPass());
  const loader = new THREE.TextureLoader();
  const load = (f, srgb = true) => new Promise((res, rej) => loader.load(ASSETS + f, t => { if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); res(t); }, undefined, rej));
  const [tAlb, tNor, tMask, tSite] = await Promise.all([load("terrain-albedo.jpg"), load("terrain-normal.jpg", false), load("terrain-mask.png", false), load("site-albedo.jpg")]);

  // ----- trời ban chiều (hiện ở góc flycam + lúc bay lên) -----
  const sunDir = new V3(-0.55, 0.62, -0.56).normalize();          // khớp hướng đổ bóng đụn trong ảnh địa hình
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uSun: { value: sunDir.clone() }, uZen: { value: new THREE.Color(0.12, 0.3, 0.66) }, uHor: { value: new THREE.Color(0.6, 0.72, 0.86) }, uFog: { value: HAZE.clone() }, uFogK: { value: 0 } },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix*modelViewMatrix*vec4(position,1.0); gl_Position = p.xyww; }`,
    fragmentShader: `uniform vec3 uSun, uZen, uHor, uFog; uniform float uFogK; varying vec3 vDir;
      void main(){ vec3 d = normalize(vDir); float h = d.y; float sd = max(dot(d, normalize(uSun)), 0.0);
        vec3 c = mix(uHor, uZen, smoothstep(0.0, 0.6, h));
        c += vec3(1.2, 1.0, 0.8)*pow(sd, 60.0)*0.8 + vec3(0.4, 0.35, 0.3)*pow(sd, 6.0)*0.3;
        c = mix(c, uHor*0.9, smoothstep(0.02, -0.1, h));
        c = mix(c, uFog, uFogK*(1.0 - smoothstep(-0.05, 0.3, h)));
        gl_FragColor = vec4(c, 1.0); }`
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(12000, 48, 24), skyMat); sky.renderOrder = -2; scene.add(sky);
  // mây tích trắng thấp gần chân trời (như ảnh) — mờ dần khi bay lên
  const cloudSprites = [];
  { const ct = (() => { const s2 = 256, [c, g] = canvas(s2, s2); for (let i = 0; i < 40; i++) { const x = rand(40, 216), y = rand(90, 170), r = rand(18, 50); const gr = g.createRadialGradient(x, y - r * 0.3, 0, x, y, r); gr.addColorStop(0, "rgba(255,255,255,.9)"); gr.addColorStop(0.7, "rgba(235,240,248,.5)"); gr.addColorStop(1, "rgba(220,228,240,0)"); g.fillStyle = gr; g.fillRect(0, 0, s2, s2); } return tex(c); })();
    for (let i = 0; i < 40; i++) { const az = rand(0, TAU), el = THREE.MathUtils.degToRad(rand(2, 12)), d = rand(5000, 9000);
      const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: ct, transparent: true, opacity: rand(0.55, 0.9), depthWrite: false, fog: false }));
      m.position.setFromSphericalCoords(d, Math.PI / 2 - el, az); m.scale.set(rand(500, 1200), rand(160, 320), 1); m.renderOrder = -1; scene.add(m); cloudSprites.push(m); } }
  const pmrem = new THREE.PMREMGenerator(renderer);
  { const es = new THREE.Scene(); es.add(new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), skyMat)); scene.environment = pmrem.fromScene(es).texture; scene.environmentIntensity = 0.9; }

  const sun = new THREE.DirectionalLight(0xfff0dc, 2.3);
  sun.position.copy(sunDir).multiplyScalar(160); sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 1, far: 420 });
  sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);
  scene.add(camera);
  scene.add(new THREE.HemisphereLight(0xc6d6ee, 0x6b5a44, 0.75));

  // ----- mặt đất: ảnh địa hình + ảnh khu phóng chi tiết -----
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(TERR * 2, TERR * 2), new THREE.MeshStandardMaterial({ map: tAlb, color: new THREE.Color(0.86, 0.86, 0.86), normalMap: tNor, normalScale: new THREE.Vector2(1.2, 1.2), roughness: 0.95, metalness: 0 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const site = new THREE.Mesh(new THREE.PlaneGeometry(SITE * 2, SITE * 2), new THREE.MeshStandardMaterial({ map: tSite, color: new THREE.Color(0.8, 0.8, 0.8), roughness: 0.9, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2 }));
  site.rotation.x = -Math.PI / 2; site.position.y = 0.05; site.receiveShadow = true;
  // mép tấm khu phóng mờ dần vào tấm toàn cảnh (không lộ đường cắt)
  site.material.onBeforeCompile = sh => {
    sh.fragmentShader = sh.fragmentShader.replace("#include <map_fragment>", `#include <map_fragment>
      { vec2 e = min(vMapUv, 1.0 - vMapUv); diffuseColor.a *= smoothstep(0.0, 0.06, min(e.x, e.y)); }`);
  };
  site.material.transparent = true; site.material.depthWrite = false; site.renderOrder = 1;
  scene.add(site);
  // biển ngoài rìa ảnh (đảo chắn giữa biển)
  const outer = new THREE.Mesh(new THREE.PlaneGeometry(40000, 40000), new THREE.MeshStandardMaterial({ color: new THREE.Color(0.05, 0.15, 0.2), roughness: 0.6, metalness: 0 }));
  outer.rotation.x = -Math.PI / 2; outer.position.y = -0.06; scene.add(outer);
  // mặt nước động: gợn + lấp lánh nắng + BỌT SÓNG chạy vào bờ (theo mặt nạ: R nước, G cách bờ, B biển)
  const waterMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uMask: { value: tMask }, uTime: { value: 0 }, uSun: { value: sunDir.clone() }, uFogC: { value: HAZE.clone() }, uFogN: { value: 140 }, uFogF: { value: 700 } },
    vertexShader: `varying vec2 vUv; varying vec3 vW; void main(){ vUv = uv; vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `uniform sampler2D uMask; uniform float uTime, uFogN, uFogF; uniform vec3 uSun, uFogC; varying vec2 vUv; varying vec3 vW;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7)))*43758.5453); }
      float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
      void main(){
        vec4 m = texture2D(uMask, vUv); if (m.r < 0.5) discard;
        vec2 p = vW.xz;
        float r1 = n2(p*1.6 + vec2(uTime*0.6, uTime*0.4)), r2 = n2(p*3.7 - vec2(uTime*0.9, -uTime*0.5));
        vec3 nrm = normalize(vec3((r1 - 0.5)*0.35 + (r2 - 0.5)*0.2, 1.0, (r2 - 0.5)*0.35 - (r1 - 0.5)*0.2));
        vec3 V = normalize(cameraPosition - vW), Hh = normalize(normalize(uSun) + V);
        float dist = length(cameraPosition - vW);
        float spec = pow(max(dot(nrm, Hh), 0.0), 70.0)*0.55*(1.0 - smoothstep(40.0, 160.0, dist));
        float fres = pow(1.0 - max(V.y, 0.0), 4.0)*0.35;
        // bọt: vạch sóng dời VÀO bờ theo thời gian, chỉ ngoài biển (B), tan dần ra khơi
        float d = m.g*30.0;
        float wave = smoothstep(0.82, 1.0, sin(d*1.25 + uTime*1.6 + n2(p*0.08)*6.0)*0.5 + 0.5);
        float brk = smoothstep(0.35, 0.7, n2(vec2(p.x*0.12 + p.y*0.08, d*0.6)));
        float foam = wave*brk*m.b*(1.0 - smoothstep(4.0, 20.0, d))*0.75;
        vec3 col = vec3(0.85, 0.9, 0.92)*foam + vec3(1.0, 0.95, 0.85)*spec + vec3(0.7, 0.8, 0.9)*fres;
        float a = clamp(foam + spec + fres, 0.0, 1.0);
        float fd = smoothstep(uFogN, uFogF, length(cameraPosition - vW));
        col = mix(col, uFogC, fd); a *= 1.0 - fd*0.8;
        gl_FragColor = vec4(col, a); }`
  });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(TERR * 2, TERR * 2), waterMat);
  water.rotation.x = -Math.PI / 2; water.position.y = 0.09; water.renderOrder = 2; scene.add(water);

  // ----- vật liệu -----
  const steel = new THREE.MeshStandardMaterial({ color: "#3a3d42", metalness: 0.7, roughness: 0.55, envMapIntensity: 0.7 });
  const steelLight = new THREE.MeshStandardMaterial({ color: "#8d9197", metalness: 0.7, roughness: 0.4 });
  const inox = new THREE.MeshStandardMaterial({ color: "#c8ccd1", metalness: 0.95, roughness: 0.22, envMapIntensity: 1.1 });
  const concrete = new THREE.MeshStandardMaterial({ color: "#9b9992", roughness: 0.92 });
  const darkMat = new THREE.MeshStandardMaterial({ color: "#1e2126", metalness: 0.5, roughness: 0.6 });
  const S = new Struts();

  // ----- 2 bệ phóng + 2 tháp tay kẹp -----
  const PAD_X = 9, MOUNT_H = 1.7, TOWER_H = 9.2, TOWER_W = 1.45;
  const sc = cfg.rocketScale ?? 1.1, NOZ = 2.52 * sc;
  const pads = [-PAD_X, PAD_X].map((x, i) => {
    const out = i === 0 ? -1 : 1;
    // bàn phóng: vòng tròn đỡ tàu + mặt bàn vuông + 6 chân + 20 ngàm giữ + tấm chắn lửa dưới
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.16, 12, 40), steelLight); ring.rotation.x = Math.PI / 2; ring.position.set(x, MOUNT_H, 0); ring.castShadow = true; scene.add(ring);
    const topShape = new THREE.Shape(); topShape.moveTo(-1.9, -1.9); topShape.lineTo(1.9, -1.9); topShape.lineTo(1.9, 1.9); topShape.lineTo(-1.9, 1.9); topShape.closePath();
    const hole = new THREE.Path(); hole.absarc(0, 0, 0.95, 0, TAU, true); topShape.holes.push(hole);
    const tg = new THREE.ExtrudeGeometry(topShape, { depth: 0.32, bevelEnabled: false }); tg.rotateX(-Math.PI / 2);
    const top = new THREE.Mesh(tg, steel); top.position.set(x, MOUNT_H - 0.32, 0); top.castShadow = top.receiveShadow = true; scene.add(top);
    for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + 0.26; S.bar(new V3(x + Math.cos(a) * 1.55, 0, Math.sin(a) * 1.55), new V3(x + Math.cos(a) * 1.4, MOUNT_H - 0.3, Math.sin(a) * 1.4), 0.3); }
    for (let k = 0; k < 20; k++) { const a = k / 20 * TAU; S.box(new V3(x + Math.cos(a) * 0.78, MOUNT_H + 0.12, Math.sin(a) * 0.78), 0.12, 0.22, 0.2, -a); }
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.14, 40), darkMat); plate.position.set(x, 0.08, 0); plate.receiveShadow = true; scene.add(plate);
    // tháp phía ngoài
    const tx = x + out * 4.6;
    towerStruts(S, new V3(tx, 0, 0), TOWER_H, TOWER_W);
    S.box(new V3(tx, TOWER_H + 0.25, 0), TOWER_W + 0.7, 0.3, TOWER_W + 0.7);
    S.box(new V3(tx - out * 0.2, TOWER_H + 0.9, 0.3), 0.8, 1.0, 0.8);                                   // nhà tời trên đỉnh
    S.bar(new V3(tx + out * 0.3, TOWER_H + 0.4, -0.3), new V3(tx + out * 0.3, TOWER_H + 3.4, -0.3), 0.07);  // cột thu lôi
    // tay kẹp "đũa": 2 dầm giàn dài, xe trượt ôm tháp
    const armY = MOUNT_H + NOZ + 1.9 * sc, from = tx - out * TOWER_W / 2;
    const arms = new THREE.Group(); const AS = new Struts();
    const reach = x - from - out * 0.2;
    [-1.0, 1.0].forEach(zz => trussStruts(AS, new V3(0, 0, zz * 0.55), new V3(reach, 0, zz * 1.02), 0.46, 0.36, 10));
    AS.box(new V3(-out * 0.1, 0, 0), 0.7, 1.3, 2.5);
    arms.add(AS.mesh(steel)); arms.position.set(from, armY, 0); scene.add(arms);
    // tay tiếp nhiên liệu (QD) + ống
    trussStruts(S, new V3(from, MOUNT_H + NOZ + 0.9, 0.35), new V3(x - out * 0.62, MOUNT_H + NOZ + 0.9, 0.35), 0.3, 0.26, 7);
    // đèn đỏ đỉnh tháp
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 0.3, 0.2) }));
    beacon.position.set(tx + out * 0.3, TOWER_H + 3.5, -0.3); scene.add(beacon);
    // 4 cột đèn pha quanh bệ
    [[-7, -7], [7, -7], [-7, 7], [7, 7]].forEach(([dx, dz]) => { S.bar(new V3(x + dx, 0, dz), new V3(x + dx, 5.5, dz), 0.14); S.box(new V3(x + dx, 5.6, dz), 0.8, 0.2, 0.3, Math.atan2(dx, dz)); });
    return { x, arms, armOpen: 0, out, beacon };
  });

  // ----- khu bồn chứa inox (sân z −24…−12) -----
  {
    const vt = new THREE.CylinderGeometry(1.15, 1.15, 6.2, 36), dome = new THREE.SphereGeometry(1.15, 36, 14, 0, TAU, 0, Math.PI / 2);
    [[-18, -21], [-15, -21], [-12, -21], [-9, -21], [-18, -17.5], [-15, -17.5], [-12, -17.5]].forEach(([x, z]) => {
      const m = new THREE.Mesh(vt, inox); m.position.set(x, 3.1, z); const d = new THREE.Mesh(dome, inox); d.position.set(x, 6.2, z);
      m.castShadow = d.castShadow = true; m.receiveShadow = true; scene.add(m, d);
      S.bar(new V3(x + 1.15, 0.2, z), new V3(x + 1.15, 6.4, z), 0.06);                                    // thang
    });
    const hz = new THREE.CapsuleGeometry(0.85, 6, 8, 28); hz.rotateZ(Math.PI / 2);
    [[2, -22], [2, -19.8], [2, -17.6], [11, -22], [11, -19.8], [11, -17.6]].forEach(([x, z]) => {
      const m = new THREE.Mesh(hz, inox); m.position.set(x, 1.25, z); m.castShadow = m.receiveShadow = true; scene.add(m);
      [-2.4, 0, 2.4].forEach(dx => S.box(new V3(x + dx, 0.3, z), 0.3, 0.6, 1.3));
    });
    const sp = new THREE.SphereGeometry(2.1, 40, 24);
    [[18, -20]].forEach(([x, z]) => { const m = new THREE.Mesh(sp, inox); m.position.set(x, 3.2, z); m.castShadow = true; scene.add(m); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; S.bar(new V3(x + Math.cos(a) * 1.7, 0, z + Math.sin(a) * 1.7), new V3(x + Math.cos(a) * 1.7, 2.8, z + Math.sin(a) * 1.7), 0.16); } });
    // giàn ống từ khu bồn tới 2 bệ
    [-PAD_X, PAD_X].forEach(x => { for (let k = 0; k < 3; k++) { const off = k * 0.35; S.bar(new V3(x * 0.4 + off, 0.5, -12), new V3(x * 0.4 + off, 0.5, -5), 0.18); S.bar(new V3(x * 0.4 + off, 0.5, -5), new V3(x - Math.sign(x) * 1.5 + off, 0.5, -2), 0.18); } });
  }

  // ----- nhà xưởng lớn ANDREW STUDIO (sân x 22…40, z 10…26) + nhà phụ -----
  function building(cx, cz, w, d, h, roofT, wallFront, wallSide) {
    const mats = [wallSide, wallSide, new THREE.MeshStandardMaterial({ map: roofT, roughness: 0.85 }), concrete, wallFront, wallSide];
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats); b.position.set(cx, h / 2, cz); b.castShadow = b.receiveShadow = true; scene.add(b);
    return b;
  }
  // NHÀ XƯỞNG LỚN kiểu ảnh: tường trắng, mái xanh xám dốc nhẹ có gờ, chữ ANDREW STUDIO xanh đậm cỡ lớn + logo trên mặt
  // dài hướng NAM (quay về flycam), cửa cuốn khổng lồ ở đầu hồi ĐÔNG, dãy nhà phụ thấp sát chân mặt nam
  {
    const W = 34, D = 16, H = 11, cx = -23, cz = 46;
    const white = c => new THREE.MeshStandardMaterial({ map: c, roughness: 0.7, metalness: 0.05 });
    const facade = (() => {                               // mặt nam: tôn trắng + chữ + logo
      const [c, g] = canvas(3400, 1100);
      g.fillStyle = "#e9ecef"; g.fillRect(0, 0, 3400, 1100);
      for (let x = 0; x < 3400; x += 14) { g.fillStyle = x % 28 ? "rgba(0,0,0,.045)" : "rgba(255,255,255,.35)"; g.fillRect(x, 0, 6, 1100); }
      for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(90,80,70,${rand(0.015, 0.04)})`; g.fillRect(rand(0, 3400), rand(500, 1100), rand(20, 120), rand(80, 500)); }
      g.fillStyle = "#1f3057"; g.textBaseline = "middle"; g.textAlign = "left";
      g.font = `900 300px "Bahnschrift", "Segoe UI Black", "Arial Black", sans-serif`;
      g.fillText("ANDREW STUDIO", 1080, 470);
      const lx = 620, ly = 470, lr = 230;                   // logo
      g.lineWidth = 34; g.strokeStyle = "#1f3057"; g.beginPath(); g.arc(lx, ly, lr, 0, TAU); g.stroke();
      g.fillStyle = "#e3342f"; g.beginPath(); g.moveTo(lx, ly - lr * 0.72); g.lineTo(lx + lr * 0.34, ly + lr * 0.45); g.lineTo(lx, ly + lr * 0.22); g.lineTo(lx - lr * 0.34, ly + lr * 0.45); g.closePath(); g.fill();
      g.fillStyle = "#c9ced4"; g.fillRect(2900, 760, 180, 340);                     // cửa đi
      return tex(c);
    })();
    const plain = (w, h, door) => {
      const [c, g] = canvas(Math.round(w * 90), Math.round(h * 90));
      g.fillStyle = "#e6e9ec"; g.fillRect(0, 0, c.width, c.height);
      for (let x = 0; x < c.width; x += 14) { g.fillStyle = x % 28 ? "rgba(0,0,0,.045)" : "rgba(255,255,255,.35)"; g.fillRect(x, 0, 6, c.height); }
      if (door) {                                          // cửa cuốn đầu hồi
        g.fillStyle = "#8f979f"; g.fillRect(c.width * 0.12, c.height * 0.12, c.width * 0.76, c.height * 0.88);
        for (let y = c.height * 0.12; y < c.height; y += 10) { g.fillStyle = "rgba(0,0,0,.12)"; g.fillRect(c.width * 0.12, y, c.width * 0.76, 3); }
      }
      return tex(c);
    };
    const roof = (() => {
      const [c, g] = canvas(2048, 1024);
      g.fillStyle = "#7f98ad"; g.fillRect(0, 0, 2048, 1024);
      for (let x = 0; x < 2048; x += 10) { g.fillStyle = x % 20 ? "rgba(0,0,0,.06)" : "rgba(255,255,255,.1)"; g.fillRect(x, 0, 5, 1024); }
      for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(255,255,255,${rand(0.02, 0.06)})`; g.fillRect(rand(0, 2048), rand(0, 1024), rand(40, 300), rand(40, 200)); }
      g.fillStyle = "rgba(20,30,40,.25)"; g.fillRect(0, 500, 2048, 24);               // nóc mái
      return tex(c);
    })();
    const wallN = white(plain(W, H, false)), wallE = white(plain(D, H, true)), wallW = white(plain(D, H, false));
    const body = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), [wallE, wallW, concrete, concrete, white(facade), wallN]);
    body.position.set(cx, H / 2, cz); body.castShadow = body.receiveShadow = true; scene.add(body);
    // mái dốc 2 bên (lăng trụ tam giác thấp) + gờ mái
    const rs = new THREE.Shape(); rs.moveTo(-D / 2 - 0.4, 0); rs.lineTo(0, 1.6); rs.lineTo(D / 2 + 0.4, 0); rs.closePath();
    const rg = new THREE.ExtrudeGeometry(rs, { depth: W + 0.8, bevelEnabled: false }); rg.rotateY(Math.PI / 2); rg.translate(-(W + 0.8) / 2, 0, 0);
    const roofM = new THREE.Mesh(rg, new THREE.MeshStandardMaterial({ map: roof, roughness: 0.55, metalness: 0.35 }));
    roofM.position.set(cx, H, cz); roofM.castShadow = true; scene.add(roofM);
    // dãy nhà phụ thấp sát chân mặt nam (như ảnh)
    const annex = new THREE.Mesh(new THREE.BoxGeometry(W * 0.62, 3.4, 3.2), [wallW, wallW, new THREE.MeshStandardMaterial({ color: "#8da3b5", roughness: 0.6, metalness: 0.3 }), concrete, white(plain(W * 0.62, 3.4, false)), wallW]);
    annex.position.set(cx + W * 0.16, 1.7, cz + D / 2 + 1.6); annex.castShadow = annex.receiveShadow = true; scene.add(annex);
    // mái hắt đầu hồi phía tây (như ảnh)
    const can = new THREE.Mesh(new THREE.BoxGeometry(6, 0.3, 9), new THREE.MeshStandardMaterial({ color: "#f1f3f5", roughness: 0.6 }));
    can.position.set(cx - W / 2 - 2.6, 6.2, cz); can.rotation.z = 0.35; can.castShadow = true; scene.add(can);
    // máy lạnh trên mái
    for (let k = 0; k < 5; k++) S.box(new V3(cx - 12 + k * 5.5, H + 1.0, cz - 3.5), 1.4, 0.8, 1.4);
  }
  // nhà phụ trắng mái xanh (đông bãi xe) + nhà nhỏ giữa vòng đường cong
  const smallWall = new THREE.MeshStandardMaterial({ color: "#e4e7ea", roughness: 0.75 });
  const smallRoof = new THREE.MeshStandardMaterial({ color: "#8ea4b6", roughness: 0.6, metalness: 0.3 });
  [[41, 44, 12, 10, 4.5], [39, 58, 12, 6, 3.6], [-58, 14, 6, 6, 3]].forEach(([x, z, w, d, h]) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [smallWall, smallWall, smallRoof, concrete, smallWall, smallWall]);
    b.position.set(x, h / 2, z); b.castShadow = b.receiveShadow = true; scene.add(b);
  });

  // ----- BIỂN HIỆU CỔNG "ANDREW STUDIO" (bên đường vào, quay về phía nam) -----
  {
    const g = new THREE.Group();
    const face = new THREE.MeshStandardMaterial({ map: signTex(), roughness: 0.55, metalness: 0.35 });
    const stone = new THREE.MeshStandardMaterial({ color: "#2a2d33", roughness: 0.8 });
    const wall = new THREE.Mesh(new THREE.BoxGeometry(10, 2.5, 0.6), [stone, stone, stone, stone, face, stone]); wall.position.y = 1.55; wall.castShadow = true; g.add(wall);
    const base = new THREE.Mesh(new THREE.BoxGeometry(11, 0.3, 1.4), concrete); base.position.y = 0.15; base.receiveShadow = true; g.add(base);
    // bồn cây trước biển
    const bush = new THREE.MeshStandardMaterial({ color: "#2e4424", roughness: 1 });
    for (let k = 0; k < 12; k++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(rand(0.3, 0.5), 1), bush); b.position.set(-5 + k * 0.9 + rand(-0.2, 0.2), 0.45, 0.9); b.castShadow = true; g.add(b); }
    // 2 đèn hắt lên chữ
    [-3, 3].forEach(x => { const l = new THREE.SpotLight(0xfff0d0, 30, 6, 0.8, 0.6); l.position.set(x, 0.3, 2.2); l.target.position.set(x, 1.8, 0); g.add(l, l.target); });
    g.position.set(19.5, 0, 68); g.rotation.y = -0.55;         // cạnh đường cổng vào, quay về phía flycam
    scene.add(g);
  }

  // ----- bụi cây 3D quanh khu (tạo chiều sâu khi flycam bay) -----
  {
    const geo = new THREE.IcosahedronGeometry(1, 1);
    const N = 1600, im = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: "#2f3b25", roughness: 1 }), N);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color();
    let n = 0;
    for (let i = 0; i < N * 3 && n < N; i++) {
      const x = rand(-110, 100), z = rand(-70, 110);
      if (x > -70 && x < 62 && z > -34 && z < 78) continue;                // chừa khu công ty (bãi cỏ)
      if (x * 0.55 - z * 0.835 > 56) continue;                               // không mọc trên bãi biển
      const s = rand(0.25, 1.1);
      m4.compose(new V3(x, s * 0.35, z), q.setFromAxisAngle(new V3(0, 1, 0), rand(0, TAU)), new V3(s * rand(1, 1.6), s * rand(0.5, 0.8), s));
      im.setMatrixAt(n, m4); im.setColorAt(n, col.setHSL(rand(0.2, 0.28), rand(0.2, 0.35), rand(0.14, 0.24))); n++;
    }
    im.count = n; im.castShadow = true; im.receiveShadow = true; scene.add(im);
  }
  scene.add(S.mesh(steel));

  // ----- 2 tàu của game trên bệ -----
  const Q_UP = new THREE.Quaternion().setFromUnitVectors(new V3(1, 0, 0), new V3(0, 1, 0));
  const Q_FWD = new THREE.Quaternion().setFromUnitVectors(new V3(1, 0, 0), new V3(0, 0, -1));
  const rockets = TEAMS.map((t, i) => {
    const r = makeRocket(t, i, cfg.hull);
    r.rig.scale.setScalar(sc); r.rig.position.set(pads[i].x, MOUNT_H + NOZ, 0); r.rig.quaternion.copy(Q_UP);
    r.model.traverse(o => { if (o.isMesh) { o.castShadow = true; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { m.fog = false; }); } });
    r.flameGroup.visible = false; r.nozzleGlow.visible = false; r.light.intensity = 0;
    scene.add(r.rig);
    return Object.assign(r, { v: 0, y0: r.rig.position.y, lx: pads[i].x });
  });

  // ----- hạt -----
  const BILLOW = billowTex(), PUFF = puffTex(), SOFT = softTex();
  const clouds = new Particles(4200, { additive: false, map: BILLOW, warm: true, sorted: true });
  const steam = new Particles(2400, { additive: false, map: PUFF });
  const fire = new Particles(2400, { additive: true, map: SOFT });
  clouds.mat.uniforms.uPadA.value.set(-PAD_X, 1, 0); clouds.mat.uniforms.uPadB.value.set(PAD_X, 1, 0);
  // vẽ SAU mặt đất trong suốt (tấm khu phóng renderOrder 1, mặt nước 2) — nếu không, tấm khu phóng đè mất mây
  steam.points.renderOrder = 5; clouds.points.renderOrder = 6; fire.points.renderOrder = 7;
  scene.add(clouds.points, steam.points, fire.points);
  const padLight = pads.map(p => { const l = new THREE.PointLight(0xff8f40, 0, 60, 1.5); l.position.set(p.x, 2.5, 0); scene.add(l); return l; });

  // sao + cầu "vũ trụ"
  const starG = new THREE.BufferGeometry(); { const n = 4000, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const v = new V3(rand(-1, 1), rand(-0.2, 1), rand(-1, 1)).normalize().multiplyScalar(9000); a.set([v.x, v.y, v.z], i * 3); } starG.setAttribute("position", new THREE.BufferAttribute(a, 3)); }
  const stars = new THREE.Points(starG, new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false })); scene.add(stars);
  const bsG = new THREE.BufferGeometry(); { const n = 260, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const v = new V3(rand(-1, 1), rand(0.05, 1), rand(-1, 1)).normalize().multiplyScalar(8800); a.set([v.x, v.y, v.z], i * 3); } bsG.setAttribute("position", new THREE.BufferAttribute(a, 3)); }
  const brightStars = new THREE.Points(bsG, new THREE.PointsMaterial({ color: 0xffffff, size: 2.8, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false, toneMapped: false })); scene.add(brightStars);
  // vệt sao nhảy tốc độ: đoạn thẳng trong KHÔNG GIAN MÁY QUAY, lao về phía máy quay, dài ra theo tốc độ
  const warp = (() => {
    const N = 1400, pos = new Float32Array(N * 6), P = [];
    for (let i = 0; i < N; i++) { const a = rand(0, TAU), r = 7 + Math.pow(Math.random(), 0.7) * 40; /* chừa tâm: không che 2 tàu */ P.push({ x: Math.cos(a) * r, y: Math.sin(a) * r * 0.62, z: -rand(5, 420) }); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
    const mat = new THREE.LineBasicMaterial({ color: new THREE.Color(0.75, 0.88, 1.6), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, fog: false });
    const L = new THREE.LineSegments(g, mat); L.frustumCulled = false; L.renderOrder = 20; camera.add(L);
    return { set(w, dt) {
      mat.opacity = Math.min(1, w * 1.4); L.visible = w > 0.002;
      if (!L.visible) return;
      const v = 40 + w * 900, len = 0.5 + w * 70;
      for (let i = 0; i < N; i++) { const p = P[i]; p.z += v * dt; if (p.z > -1) p.z -= 420; const j = i * 6;
        pos[j] = p.x; pos[j + 1] = p.y; pos[j + 2] = p.z; pos[j + 3] = p.x; pos[j + 4] = p.y; pos[j + 5] = p.z - len; }
      g.attributes.position.needsUpdate = true;
    } };
  })();
  const spaceMat = new THREE.MeshBasicMaterial({ color: SPACE.clone(), side: THREE.BackSide, transparent: true, opacity: 0, depthWrite: false, fog: false });
  const space = new THREE.Mesh(new THREE.SphereGeometry(8500, 32, 16), spaceMat); space.renderOrder = -1; scene.add(space);

  // ----- nhịp -----
  const G = { phase: "idle", t: 0, tl: 0, shake: 0, handed: false, passT: 0 };
  const camBase = { pos: new V3(), look: new V3() };
  const endCam = { pos: new V3(0, 3.3, 16.5), look: new V3(0, 0.1, -14) };
  const LANES = cfg.lanes || [-2.3, 2.3];
  const T = { move: 4.2, ign: 5.0, lift: 5.8, pitch1: 0, fade: 0, warp: 0 };   // pitch1/fade/warp tính khi tàu vụt qua máy quay
  // góc chờ phóng: gần 2 tàu, độ cao vừa phải (như màn chờ của 4b)
  const AERIAL = { pos: new V3(-7, 24, 46), look: new V3(1.5, 4.5, 0) };

  function idleCam(t) {                                    // flycam như ảnh: trên cao phía tây nam nhà xưởng, nhìn qua mái về 2 bệ ở xa
    const k = Math.sin(t * 0.05);
    return { pos: new V3(-78 + k * 5, 24 + Math.sin(t * 0.08) * 1.2, 90 - k * 4), look: new V3(2 + k * 3, 1, 12) };
  }
  function ventVapor(dt) {
    rockets.forEach(r => {
      if (Math.random() < dt * 18) steam.emit({ pos: r.rig.position.clone().add(new V3(rand(-0.5, 0.5), rand(-1.5, 2) * sc, rand(-0.5, 0.5))), vel: new V3(rand(-0.4, 0.4), rand(-0.9, -0.2), rand(-0.4, 0.4)),
        life: rand(1.2, 2.4), size: rand(0.25, 0.5), sizeEnd: rand(1, 1.8), color: new THREE.Color(0.95, 0.94, 0.93), colorEnd: new THREE.Color(0.86, 0.86, 0.88), alpha: 0.35, drag: 0.4 });
    });
  }
  const cA = new THREE.Color(), cB = new THREE.Color();
  function padCloud(dt, pad, rate) {                       // mây khói NÂU tràn ra mọi phía (mạnh theo trục rãnh lửa ±x), cuộn lên
    let n = rate * dt;
    while (n > 0) {
      if (n < 1 && Math.random() > n) break; n -= 1;
      const a = Math.random() < 0.55 ? (Math.random() < 0.5 ? 0 : Math.PI) + rand(-0.6, 0.6) : rand(0, TAU);
      const dir = new V3(Math.cos(a), 0, Math.sin(a));
      const sp = rand(4, 14), b = rand(0.45, 1.0);
      cA.setRGB(0.84 * b, 0.70 * b, 0.56 * b); cB.setRGB(0.70 * b, 0.62 * b, 0.54 * b);
      clouds.emit({ pos: new V3(pad.x + rand(-1, 1), rand(0.3, 1.4), rand(-1, 1)), vel: dir.multiplyScalar(sp).add(new V3(0, rand(0.5, 3.5), 0)),
        life: rand(6, 11), size: rand(2.2, 3.6), sizeEnd: rand(9, 16), color: cA.clone(), colorEnd: cB.clone(), alpha: rand(0.88, 0.98), drag: rand(0.55, 0.95), rise: rand(0.3, 0.8) });
    }
  }
  function nozzle(r) { return new V3(-2.5, 0, 0).applyMatrix4(r.ship.matrixWorld); }

  function tick(dt) {
    G.t += dt;
    const t = G.phase === "idle" ? 0 : (G.tl += dt);
    waterMat.uniforms.uTime.value = G.t;
    pads.forEach((p, i) => { p.beacon.visible = Math.sin(G.t * 3 + i) > 0.2; });
    let cam, follow = 1;
    if (G.phase === "idle") { ventVapor(dt); cam = idleCam(G.t); }
    else {
      const lit = t >= T.ign;
      if (t < T.ign) ventVapor(dt);
      rockets.forEach((r, i) => {
        r.flameGroup.visible = r.nozzleGlow.visible = lit;
        const pow = lit ? (t < T.lift ? lerp(0.6, 1.6, (t - T.ign) / (T.lift - T.ign)) : 1.8) * (0.9 + Math.random() * 0.2) : 0;
        r.flameGroup.scale.set(1.4, (1.4 + pow * 1.7) * (0.92 + Math.random() * 0.16), 1.4);
        [r.flameOuter, r.flameInner].forEach(m => { m.material.uniforms.uTime.value = G.t + i; m.material.uniforms.uPow.value = pow * 0.7; });
        r.light.intensity = lit ? 25 * pow : 0;
        if (t >= T.lift) {
          const tt = t - T.lift;
          r.v = Math.min(95, r.v + (tt < 3.5 ? 2.6 : 10) * dt);
          const pk = G.passT ? ease(smooth(G.passT + 0.4, T.pitch1, t)) : 0;
          const dir = new V3(0, Math.cos(pk * Math.PI / 2), -Math.sin(pk * Math.PI / 2));
          r.rig.position.addScaledVector(dir, r.v * dt);
          const lk = G.passT ? smooth(G.passT, T.pitch1 - 1, t) : 0;
          r.rig.position.x = lerp(r.lx, LANES[i], ease(lk)) + Math.sin(G.t * 0.7 + i * 2) * 0.1 * lk;
          r.rig.quaternion.copy(Q_UP).slerp(Q_FWD, pk);
        }
        r.rig.updateMatrixWorld(true);
        if (lit) {
          const nz = nozzle(r);
          const hgt = r.rig.position.y - r.y0;
          // vệt khói trắng sau đuôi (rải đều theo quãng bay)
          if (t >= T.lift && hgt > 3 && r.lastNz) {
            const seg = nz.distanceTo(r.lastNz), n = Math.min(40, Math.ceil(seg / 0.45)), fa = G.passT ? 1 - smooth(G.passT + 1, G.passT + 5, t) : 1;
            for (let k = 0; k < n && fa > 0.02; k++) steam.emit({ pos: r.lastNz.clone().lerp(nz, (k + Math.random()) / n).add(new V3(rand(-0.2, 0.2), rand(-0.2, 0.2), rand(-0.2, 0.2))), vel: new V3(rand(-0.4, 0.4), rand(-0.4, 0.4), rand(-0.4, 0.4)),
              life: rand(2.2, 3.6), size: rand(0.6, 1.0), sizeEnd: rand(3, 4.5), color: new THREE.Color(0.98, 0.97, 0.96), colorEnd: new THREE.Color(0.86, 0.86, 0.88), alpha: 0.4 * fa, drag: 0.8 });
          }
          r.lastNz = nz.clone();
          if (t < T.lift + 1.5) fire.emit({ pos: nz, vel: new V3(1, 0, 0).applyQuaternion(r.rig.quaternion).multiplyScalar(-rand(6, 12)), life: rand(0.12, 0.3), size: rand(0.5, 0.9), sizeEnd: 0.15, color: new THREE.Color(3, 2.1, 1.1), colorEnd: new THREE.Color(1.4, 0.35, 0.05), alpha: 0.8, drag: 1 });
        }
      });
      // mây khói ở chân bệ + quầng lửa + đèn cam hắt
      let fireK = 0;
      pads.forEach((p, i) => {
        const r = rockets[i], hgt = r.rig.position.y - r.y0;
        const k = t < T.ign ? 0 : (t < T.lift ? (t - T.ign) / (T.lift - T.ign) : Math.max(0, 1 - hgt / 30));
        fireK = Math.max(fireK, k);
        padCloud(dt, p, 150 * k);
        if (k > 0 && Math.random() < dt * 50) fire.emit({ pos: new V3(p.x + rand(-2.5, 2.5), rand(0.3, 1.5), rand(-2.5, 2.5)), vel: new V3(rand(-4, 4), rand(0.5, 2), rand(-4, 4)),
          life: rand(0.3, 0.6), size: rand(2.5, 4.5), sizeEnd: 1, color: new THREE.Color(2.2, 1.1, 0.35), colorEnd: new THREE.Color(0.9, 0.25, 0.04), alpha: 0.55, drag: 2 });
        padLight[i].intensity = 700 * k * (0.8 + Math.random() * 0.4);
        p.armOpen = clamp(p.armOpen + (t >= T.ign - 0.5 ? dt * 0.8 : 0), 0, 1);
        p.arms.rotation.y = -p.out * ease(p.armOpen) * 0.75;
      });
      clouds.mat.uniforms.uFire.value = lerp(clouds.mat.uniforms.uFire.value, fireK > 0 ? 1 : 0, Math.min(1, dt * (fireK > 0 ? 4 : 0.35)));
      G.shake = t < T.ign ? 0 : Math.max(0, 1 - Math.max(0, t - T.lift) / 5) * 0.9;

      // --- máy quay ---
      const mid = rockets[0].rig.position.clone().add(rockets[1].rig.position).multiplyScalar(0.5);
      // 1) từ flycam bay tới góc DRONE NHÌN XUỐNG (như ảnh), rồi từ từ lên cao
      const k0 = ease(smooth(0, T.move, t));
      const ic = idleCam(G.t);
      const aerial = { pos: AERIAL.pos.clone().add(new V3(0, Math.max(0, t - T.lift) * 0.5, 0)), look: AERIAL.look.clone() };
      // nhìn theo tàu khi tàu lên (tàu lao THẲNG VỀ phía máy quay)
      aerial.look.lerp(mid.clone().add(new V3(0, -2, 0)), smooth(T.lift + 0.5, T.lift + 3.5, t) * 0.9);
      const A = { pos: ic.pos.lerp(aerial.pos, k0), look: ic.look.lerp(aerial.look, k0) };
      follow = t < T.move ? 1 : Math.min(1, dt * 3);
      // 2) tàu VỤT QUA độ cao máy quay ⇒ máy quay quay theo, tụt ra sau đuôi, đuổi theo
      if (!G.passT && mid.y > A.pos.y + 2) { G.passT = t; T.pitch1 = t + 4.6; T.warp = t + 4.2; T.fade = t + 5.7; }
      if (G.passT) {
        const pk = ease(smooth(G.passT + 0.4, T.pitch1, t));
        const fwd = new V3(0, Math.cos(pk * Math.PI / 2), -Math.sin(pk * Math.PI / 2));
        const q = new THREE.Quaternion().setFromUnitVectors(new V3(0, 0, -1), fwd);
        const chase = { pos: mid.clone().add(endCam.pos.clone().applyQuaternion(q).multiplyScalar(lerp(1.35, 1, pk))), look: mid.clone().add(endCam.look.clone().applyQuaternion(q)) };
        const kc = ease(smooth(G.passT, G.passT + 2.2, t));
        // luôn NHÌN VÀO 2 tàu trong lúc chuyển (không mất dấu), vị trí trượt dần ra sau đuôi
        cam = { pos: A.pos.lerp(chase.pos, kc), look: mid.clone().lerp(chase.look, ease(smooth(0.35, 1, kc))) };
        follow = kc >= 1 ? 1 : Math.min(1, dt * 6);
      } else cam = A;
      // trời tối dần thành vũ trụ
      const alt = mid.y;
      const dk = G.passT ? Math.max(smooth(60, 420, alt), smooth(G.passT + 0.6, T.warp, t)) : 0;
      spaceMat.opacity = dk; stars.material.opacity = smooth(0.35, 0.95, dk);
      cloudSprites.forEach(c => { c.material.opacity = (c.userData.a0 ??= c.material.opacity) * (1 - smooth(0.05, 0.4, dk)); });
      // vài ngôi sao SÁNG lốm đốm ngay khi đuổi đuôi (trời còn xanh thẫm)
      brightStars.material.opacity = G.passT ? smooth(G.passT + 0.3, G.passT + 2.0, t) : 0;
      // NHẢY TỐC ĐỘ: sao kéo thành vệt lao qua, nới góc nhìn, loé sáng lúc hoà cảnh
      const w = G.passT ? ease(smooth(T.warp, T.fade, t)) * (G.handed ? Math.max(0.25, 1 - (t - T.fade) / 0.9) : 1) : 0;
      warp.set(w, dt);
      camera.fov = (cfg.fov ?? 38) + 24 * w * (G.handed ? Math.max(0, 1 - (t - T.fade) / 0.9) : 1);
      camera.updateProjectionMatrix();
      renderer.toneMappingExposure = 0.9 + 1.6 * Math.exp(-Math.pow((t - T.fade) / 0.18, 2)) * (G.passT ? 1 : 0);
      const fk = smooth(30, 180, alt);
      scene.fog.color.copy(HAZE).lerp(SPACE, dk);
      scene.fog.near = lerp(140, 6, fk); scene.fog.far = lerp(700, 260, fk);
      waterMat.uniforms.uFogC.value.copy(scene.fog.color); waterMat.uniforms.uFogN.value = scene.fog.near; waterMat.uniforms.uFogF.value = scene.fog.far;
      skyMat.uniforms.uFog.value.copy(scene.fog.color); skyMat.uniforms.uFogK.value = fk;
      if (!G.handed && G.passT && t >= T.fade) { G.handed = true; cfg.onHandoff && cfg.onHandoff(); }
    }
    camBase.pos.lerp(cam.pos, follow);
    camBase.look.lerp(cam.look, follow);
    camera.position.copy(camBase.pos);
    if (G.shake > 0) camera.position.add(new V3(rand(-1, 1), rand(-1, 1), rand(-1, 1)).multiplyScalar(0.07 * G.shake));
    camera.lookAt(camBase.look);
    space.position.copy(camera.position); stars.position.copy(camera.position); brightStars.position.copy(camera.position);
    steam.update(dt, camera.position); clouds.update(dt, camera.position); fire.update(dt, camera.position);
    composer.render(dt);
  }

  // ----- khung hình -----
  function resize() {
    if (!container.clientWidth || !container.clientHeight) return;
    const W = container.clientWidth, H = container.clientHeight;
    renderer.setSize(W, H); composer.setSize(W, H);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    const s = (H * renderer.getPixelRatio()) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    [steam, clouds, fire].forEach(p => { p.mat.uniforms.uScale.value = s; });
  }
  window.addEventListener("resize", resize);
  new ResizeObserver(resize).observe(container);
  resize();
  const c0 = idleCam(0); camBase.pos.copy(c0.pos); camBase.look.copy(c0.look);

  const clock = new THREE.Clock();
  let raf = 0, manual = false, dead = false, fN = 0, fT = 0;
  function frame() {
    if (dead) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, clock.getDelta());
    fN++; fT += dt; if (fT >= 0.5) { cfg.onFps && cfg.onFps(Math.round(fN / fT)); fN = 0; fT = 0; }
    if (!manual) tick(dt);
  }
  raf = requestAnimationFrame(frame);

  return {
    start() { if (G.phase !== "idle") return false; G.phase = "launch"; G.tl = 0; return true; },
    get phase() { return G.phase; }, get t() { return G.tl; }, T,
    step(n = 1, dt = 1 / 60) { manual = true; for (let i = 0; i < n; i++) tick(dt); },
    resume() { manual = false; clock.getDelta(); },
    stop() { dead = true; cancelAnimationFrame(raf); },
    destroy() { dead = true; cancelAnimationFrame(raf); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); },
    renderer, scene, camera, rockets, G, clouds, steam, fire
  };
}
