// =============================================================
// MẪU 4e (thầy 26/9/2026): cây THẬT hơn (thẻ lá, 3 loại) · máy quay luôn trôi quanh bệ lúc đếm 3-2-1 · sau 3-2-1 chỉ ~6,5 s
// tàu lên + máy quay vòng ra sau là NHẢY TỐC ĐỘ vào game (bớt rườm rà) · chữ ANDREW STUDIO mờ trên nền bệ · sửa nhấp nháy xanh
// (mặt nước / nền ngoài rìa đánh nhau độ sâu: near 0,5 → 1,5, nền ngoài −0,06 → −3, nước 0,09 → 0,25) · tàu dựng bằng makeRocket
// của BẢN GAME MỚI NHẤT (rocket-race/aword/, chép từ AWord bằng tools/chep-game-aword.py).
// Kế thừa MẪU 4d (thầy 26/9/2026: "bản đồ thiết kế lại để THỰC SỰ giống ảnh" nhà xưởng SpaceX ở 39A): dựng lại TOÀN BỘ bố cục
// theo ảnh — máy quay trên cao phía tây nam nhìn về bắc: nhà xưởng lớn tường trắng mái xanh xám ở tiền cảnh trái (chữ
// ANDREW STUDIO chếch nghiêng như chữ SPACEX, cửa lớn đầu hồi có tấm cửa nâng chéo, dãy nhà phụ thấp dọc chân tường);
// phải = đường + BÃI XE đầy ô tô 3D + nhà trắng mái bằng; giữa trái = đồng cỏ rào trắng + đường VÒNG; xa = rừng bụi
// Florida xanh thẫm + ĐẦM nước xanh dài + mái vòm trắng; xa phải = DỐC bê tông chạy chéo lên GÒ BỆ PHÓNG cao (2 bệ);
// chân trời biển; trời xanh giữa trưa có mây rải rác. Bố cục ở assets/4d/layout.json (chung với tools/tao-dia-hinh-4d.py).
// Kế thừa MẪU 4c (thầy 26/9/2026, ảnh nhà xưởng SpaceX nhìn từ drone): MỞ ĐẦU như ảnh — nhà xưởng lớn trắng mái xanh xám
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
import { makeRocket, DEFAULT_TEAMS as TEAMS } from "../aword/rr3d-view.js";   // tàu giống hệt game mới nhất

const V3 = THREE.Vector3;
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const ASSETS = new URL("../assets/4d/", import.meta.url).href;
const TERR = 400;                            // phủ của ảnh địa hình toàn cảnh (khớp tools/tao-dia-hinh-4d.py); tấm chi tiết đọc từ layout.json

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
  const HAZE = new THREE.Color(0.66, 0.76, 0.88), SPACE = new THREE.Color(0.012, 0.018, 0.04);
  const FOG_N = 300, FOG_F = 2600;                                // trời trong như ảnh: chỉ mờ ở chân trời
  scene.fog = new THREE.Fog(HAZE.clone(), FOG_N, FOG_F);
  const camera = new THREE.PerspectiveCamera(cfg.fov ?? 38, 2, 1.5, 20000);
  // ⛔ NHẤP NHÁY (4b): EffectComposer mặc định vẽ vào render target KHÔNG khử răng cưa ⇒ thanh thép/hàng rào mảnh
  // lấp loá khi máy quay trôi. Render target có MSAA 4 mẫu.
  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(16, 16, { type: THREE.HalfFloatType, samples: 4 }));
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.45, 0.5, 0.9);
  composer.addPass(bloom); composer.addPass(new OutputPass());
  const loader = new THREE.TextureLoader();
  const load = (f, srgb = true) => new Promise((res, rej) => loader.load(ASSETS + f, t => { if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); res(t); }, undefined, rej));
  const LAY = await (await fetch(ASSETS + "layout.json")).json();
  await Promise.all([document.fonts?.load('italic 900 200px "Exo 2"'), document.fonts?.load('900 200px "Exo 2"')].map(p => p?.catch(() => {})));
  const [tAlb, tNor, tMask, tSite] = await Promise.all([load("terrain-albedo.jpg"), load("terrain-normal.jpg", false), load("terrain-mask.png", false), load("site-albedo.jpg")]);

  // ----- trời XANH GIỮA TRƯA như ảnh (nắng cao sau lưng máy quay, hơi trái) -----
  const sunDir = new V3(...LAY.sun).normalize();                    // khớp hướng đổ bóng trong ảnh địa hình
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uSun: { value: sunDir.clone() }, uZen: { value: new THREE.Color(0.03, 0.14, 0.5) }, uHor: { value: new THREE.Color(0.42, 0.6, 0.88) }, uFog: { value: HAZE.clone() }, uFogK: { value: 0 } },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix*modelViewMatrix*vec4(position,1.0); gl_Position = p.xyww; }`,
    fragmentShader: `uniform vec3 uSun, uZen, uHor, uFog; uniform float uFogK; varying vec3 vDir;
      void main(){ vec3 d = normalize(vDir); float h = d.y; float sd = max(dot(d, normalize(uSun)), 0.0);
        vec3 c = mix(uHor, uZen, smoothstep(0.0, 0.45, h));
        c = mix(c, vec3(0.74, 0.82, 0.92), (1.0 - smoothstep(0.0, 0.035, h))*0.5);   /* dải sương mỏng sát chân trời */
        c += vec3(1.2, 1.0, 0.8)*pow(sd, 60.0)*0.8 + vec3(0.4, 0.35, 0.3)*pow(sd, 6.0)*0.3;
        c = mix(c, uHor*0.9, smoothstep(0.02, -0.1, h));
        c = mix(c, uFog, uFogK*(1.0 - smoothstep(-0.05, 0.3, h)));
        gl_FragColor = vec4(c, 1.0); }`
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(12000, 48, 24), skyMat); sky.renderOrder = -2; scene.add(sky);
  // mây tích trắng RẢI RÁC khắp trời như ảnh (đáy phẳng hơi xám, đỉnh bông sáng) — mờ dần khi bay lên
  const cloudSprites = [];
  { const mk = seed => { const s2 = 256, [c, g] = canvas(s2, s2 / 2);
      for (let i = 0; i < 34; i++) { const x = rand(40, 216), r = rand(12, 34), y = rand(62, 100) - (1 - Math.abs(x - 128) / 90) * rand(0, 30);
        const gr = g.createRadialGradient(x - r * 0.2, y - r * 0.4, 0, x, y, r); gr.addColorStop(0, "rgba(255,255,255,.95)"); gr.addColorStop(0.6, "rgba(238,242,248,.7)"); gr.addColorStop(1, "rgba(215,224,238,0)"); g.fillStyle = gr; g.fillRect(0, 0, s2, s2 / 2); }
      g.globalCompositeOperation = "destination-in"; const m = g.createLinearGradient(0, 0, 0, s2 / 2); m.addColorStop(0, "#000"); m.addColorStop(0.78, "#000"); m.addColorStop(0.9, "rgba(0,0,0,0)"); g.fillStyle = m; g.fillRect(0, 0, s2, s2 / 2);
      return tex(c); };
    const cts = [0, 1, 2, 3].map(mk);
    for (let i = 0; i < 70; i++) { const az = rand(0, TAU), el = THREE.MathUtils.degToRad(Math.pow(Math.random(), 1.6) * 24 + 2.5), d = rand(6000, 9000);
      const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: cts[i % 4], transparent: true, opacity: rand(0.7, 0.95), depthWrite: false, fog: false }));
      const w = rand(380, 900) * (1 - el / 1.2); m.position.setFromSphericalCoords(d, Math.PI / 2 - el, az); m.scale.set(w, w * rand(0.34, 0.5), 1); m.renderOrder = -1; scene.add(m); cloudSprites.push(m); } }
  const pmrem = new THREE.PMREMGenerator(renderer);
  { const es = new THREE.Scene(); es.add(new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), skyMat)); scene.environment = pmrem.fromScene(es).texture; scene.environmentIntensity = 0.9; }

  // nắng trưa trắng; khung bóng phủ CẢ nhà xưởng + bãi xe (tây nam) lẫn gò bệ (gốc) — 4096² ≈ 20 điểm ảnh bóng / đv
  const sun = new THREE.DirectionalLight(0xfff6ea, 2.6);
  sun.target.position.set(-48, 0, 42);
  sun.position.copy(sun.target.position).addScaledVector(sunDir, 300); sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -100, right: 100, top: 100, bottom: -100, near: 1, far: 700 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);
  scene.add(camera);
  scene.add(new THREE.HemisphereLight(0xc9dcf5, 0x5f6a48, 0.8));

  // ----- mặt đất: ảnh địa hình + ảnh khu phóng chi tiết -----
  // hạt mịn theo toạ độ thế giới (ảnh chi tiết ~32 điểm/đv vẫn mờ ở tiền cảnh 4K) — tắt dần khi xa (chống lấp loá)
  const microGrain = (sh, k) => {
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec2 vGW;").replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvGW = (modelMatrix*vec4(transformed,1.0)).xz;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", `#include <common>
      varying vec2 vGW; float gh(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7)))*43758.5453); }
      float gn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(gh(i), gh(i+vec2(1,0)), f.x), mix(gh(i+vec2(0,1)), gh(i+vec2(1,1)), f.x), f.y); }`)
      .replace("#include <map_fragment>", `#include <map_fragment>
      { vec2 p = vGW*${k.toFixed(2)}; float fw = length(fwidth(p)); float a = 1.0 - smoothstep(0.25, 0.9, fw);
        float g = gn(p)*0.6 + gn(p*2.7)*0.4; diffuseColor.rgb *= mix(1.0, 0.86 + 0.28*g, a); }`);
  };
  const groundMat = new THREE.MeshStandardMaterial({ map: tAlb, color: new THREE.Color(0.9, 0.9, 0.9), normalMap: tNor, normalScale: new THREE.Vector2(1.2, 1.2), roughness: 0.95, metalness: 0 });
  groundMat.onBeforeCompile = sh => microGrain(sh, 1.6);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(TERR * 2, TERR * 2), groundMat);
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const [TX0, TX1, TZ0, TZ1] = LAY.tile;
  const site = new THREE.Mesh(new THREE.PlaneGeometry(TX1 - TX0, TZ1 - TZ0), new THREE.MeshStandardMaterial({ map: tSite, color: new THREE.Color(0.86, 0.86, 0.86), roughness: 0.9, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2 }));
  site.rotation.x = -Math.PI / 2; site.position.set((TX0 + TX1) / 2, 0.05, (TZ0 + TZ1) / 2); site.receiveShadow = true;
  // mép tấm chi tiết mờ dần vào tấm toàn cảnh (không lộ đường cắt)
  site.material.onBeforeCompile = sh => {
    microGrain(sh, 1.6);
    sh.fragmentShader = sh.fragmentShader.replace("#include <map_fragment>", `#include <map_fragment>
      { vec2 e = min(vMapUv, 1.0 - vMapUv); diffuseColor.a *= smoothstep(0.0, 0.04, min(e.x, e.y)); }`);
  };
  site.material.transparent = true; site.material.depthWrite = false; site.renderOrder = 1;
  scene.add(site);
  // ngoài rìa ảnh: đất/biển xa chìm trong sương chân trời
  const outer = new THREE.Mesh(new THREE.PlaneGeometry(40000, 40000), new THREE.MeshStandardMaterial({ color: new THREE.Color(0.08, 0.16, 0.2), roughness: 0.6, metalness: 0 }));
  outer.rotation.x = -Math.PI / 2; outer.position.y = -3; scene.add(outer);
  // mặt nước động: gợn + lấp lánh nắng + BỌT SÓNG chạy vào bờ (theo mặt nạ: R nước, G cách bờ, B biển)
  const waterMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uMask: { value: tMask }, uTime: { value: 0 }, uSun: { value: sunDir.clone() }, uFogC: { value: HAZE.clone() }, uFogN: { value: FOG_N }, uFogF: { value: FOG_F } },
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
  water.rotation.x = -Math.PI / 2; water.position.y = 0.25; water.renderOrder = 2; scene.add(water);

  // ----- vật liệu -----
  const steel = new THREE.MeshStandardMaterial({ color: "#3a3d42", metalness: 0.7, roughness: 0.55, envMapIntensity: 0.7 });
  const steelLight = new THREE.MeshStandardMaterial({ color: "#8d9197", metalness: 0.7, roughness: 0.4 });
  const inox = new THREE.MeshStandardMaterial({ color: "#c8ccd1", metalness: 0.95, roughness: 0.22, envMapIntensity: 1.1 });
  const concrete = new THREE.MeshStandardMaterial({ color: "#9b9992", roughness: 0.92 });
  const darkMat = new THREE.MeshStandardMaterial({ color: "#1e2126", metalness: 0.5, roughness: 0.6 });
  const S = new Struts();

  // ----- GÒ BỆ PHÓNG (như 39A: sân bê tông nâng cao, sườn dốc sáng) + DỐC lên từ phía nhà xưởng -----
  const MD = LAY.mound, PY = MD.h;
  {
    const e = MD.slope, T = [[MD.x0, MD.z0], [MD.x1, MD.z0], [MD.x1, MD.z1], [MD.x0, MD.z1]], Bm = [[MD.x0 - e, MD.z0 - e], [MD.x1 + e, MD.z0 - e], [MD.x1 + e, MD.z1 + e], [MD.x0 - e, MD.z1 + e]];
    const pos = [], uv = [], grp = [];
    // mặt trên (2 tam giác) — uv phủ đúng hình chữ nhật cho ảnh mặt sân
    const tp = (x, z) => { pos.push(x, PY, z); uv.push((x - MD.x0) / (MD.x1 - MD.x0), 1 - (z - MD.z0) / (MD.z1 - MD.z0)); };
    [[0, 3, 2], [0, 2, 1]].forEach(tri => tri.forEach(k => tp(...T[k])));
    // 4 sườn
    for (let k = 0; k < 4; k++) { const a = T[k], b = T[(k + 1) % 4], A = Bm[k], B = Bm[(k + 1) % 4];
      [[a, PY, 0], [A, -0.05, 1], [B, -0.05, 1], [a, PY, 0], [B, -0.05, 1], [b, PY, 0]].forEach(([p, y, v]) => { pos.push(p[0], y, p[1]); uv.push(0, v); }); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.addGroup(0, 6, 0); g.addGroup(6, 24, 1); g.computeVertexNormals();
    const topT = (() => {                                   // mặt sân: tấm bê tông sáng, ron, vết cháy quanh 2 bệ, rãnh thoát lửa
      const W = 2048, Hh = Math.round(2048 * (MD.z1 - MD.z0) / (MD.x1 - MD.x0)), [c, gg] = canvas(W, Hh), sx = W / (MD.x1 - MD.x0);
      gg.fillStyle = "#b9b6ad"; gg.fillRect(0, 0, W, Hh);
      for (let x = 0; x < W; x += sx * 3) for (let y = 0; y < Hh; y += sx * 3) { gg.fillStyle = `rgba(${Math.random() < 0.5 ? "0,0,0" : "255,255,255"},${rand(0.02, 0.06)})`; gg.fillRect(x, y, sx * 3, sx * 3); }
      gg.strokeStyle = "rgba(90,88,84,.35)"; gg.lineWidth = 2; for (let x = 0; x < W; x += sx * 3) { gg.beginPath(); gg.moveTo(x, 0); gg.lineTo(x, Hh); gg.stroke(); } for (let y = 0; y < Hh; y += sx * 3) { gg.beginPath(); gg.moveTo(0, y); gg.lineTo(W, y); gg.stroke(); }
      [-9, 9].forEach(px => { const cx = (px - MD.x0) * sx, cy = (0 - MD.z0) * sx;
        const r = gg.createRadialGradient(cx, cy, 0, cx, cy, sx * 7); r.addColorStop(0, "rgba(25,22,20,.85)"); r.addColorStop(0.5, "rgba(40,36,32,.45)"); r.addColorStop(1, "rgba(40,36,32,0)"); gg.fillStyle = r; gg.fillRect(cx - sx * 8, cy - sx * 8, sx * 16, sx * 16);
        gg.fillStyle = "#26282b"; gg.fillRect(cx - sx * 1.3, cy - sx * 1.3, sx * 2.6, (MD.z1 - 0) * sx + sx * 1.3);          // rãnh thoát lửa chạy về phía nam
      });
      // 4e: ANDREW STUDIO MỜ sơn trên nền bệ (dải phía bắc, sau 2 bệ — rãnh lửa chạy về nam nên không đè chữ)
      gg.save(); gg.globalAlpha = 0.24; gg.fillStyle = "#1c2c5a"; gg.textAlign = "center"; gg.textBaseline = "middle";
      const fy = (-7.6 - MD.z0) * sx, fs = sx * 3.6;
      gg.font = `italic 900 ${fs}px "Exo 2", "Bahnschrift", "Arial Black", sans-serif`;
      if (gg.letterSpacing !== undefined) gg.letterSpacing = `${fs * 0.12}px`;
      gg.fillText("ANDREW STUDIO", W / 2 + sx * 2.2, fy);
      const lx = W / 2 - sx * 17.5, lr = sx * 1.9;
      gg.lineWidth = lr * 0.16; gg.strokeStyle = "#1c2c5a"; gg.beginPath(); gg.arc(lx, fy, lr, 0, TAU); gg.stroke();
      gg.fillStyle = "#b8322d"; gg.beginPath(); gg.moveTo(lx, fy - lr * 0.72); gg.lineTo(lx + lr * 0.36, fy + lr * 0.46); gg.lineTo(lx, fy + lr * 0.22); gg.lineTo(lx - lr * 0.36, fy + lr * 0.46); gg.closePath(); gg.fill();
      gg.restore();
      return tex(c); })();
    const moundM = new THREE.Mesh(g, [new THREE.MeshStandardMaterial({ map: topT, roughness: 0.9 }), new THREE.MeshStandardMaterial({ color: "#b3ad9b", roughness: 0.95 })]);
    moundM.receiveShadow = true; moundM.castShadow = true; scene.add(moundM);
    // DỐC 3D như ảnh: nền đường bê tông ĐẮP NỔI chạy chéo từ nhà xưởng, CAO DẦN lên mặt gò; mặt = 2 làn bê tông + dải cỏ giữa, sườn đắp sáng
    const [A, B] = LAY.ramp, ru = new V3(B[0] - A[0], 0, B[1] - A[1]); const Lr = ru.length(); ru.normalize();
    const rn = new V3(-ru.z, 0, ru.x), OL = -10.5, OR = 5.8, SIDE = 2.6, t1 = Lr + 4, NS = 40;
    const P = (t, o, y) => new V3(A[0] + ru.x * t + rn.x * o, y, A[1] + ru.z * t + rn.z * o);
    const hAt = t => 0.14 + (PY - 0.16) * smooth(0.18, 1, t / Lr);
    const rampT = (() => { const [c, g2] = canvas(512, 2048), X = o => (o - OL) / (OR - OL) * 512;
      g2.fillStyle = "#ddd9cf"; g2.fillRect(0, 0, 512, 2048);
      for (let y = 0; y < 2048; y += 64) { g2.fillStyle = `rgba(0,0,0,${rand(0.015, 0.05)})`; g2.fillRect(0, y, 512, 64); g2.fillStyle = "rgba(120,116,108,.35)"; g2.fillRect(0, y, 512, 2); }
      g2.fillStyle = "#6f7f46"; g2.fillRect(X(-3.2), 0, X(-1.6) - X(-3.2), 2048);                           // dải cỏ giữa 2 làn
      for (let i = 0; i < 900; i++) { g2.fillStyle = `rgba(${Math.random() < 0.5 ? "40,60,20" : "140,150,90"},.25)`; g2.fillRect(X(-3.2) + rand(0, X(-1.6) - X(-3.2)), rand(0, 2048), 3, rand(4, 14)); }
      g2.fillStyle = "rgba(140,134,122,.28)"; [-8.3, -4.4, -0.4, 3.6].forEach(o => g2.fillRect(X(o) - 9, 0, 18, 2048));   // vệt bánh xe tải
      g2.fillStyle = "#ecebe6"; g2.fillRect(0, 0, X(-9.5), 2048); g2.fillRect(X(4.8), 0, 512 - X(4.8), 2048);       // lề sáng
      const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, Lr / 30); return t; })();
    const rpos = [], ruv = [];
    for (let k = 0; k <= NS; k++) { const t = t1 * k / NS, h = Math.min(hAt(t), PY - 0.02), v = t / Lr;
      [[OL - SIDE, 0.03, 0], [OL, h, 0], [OR, h, 1], [OR + SIDE, 0.03, 1]].forEach(([o, y, u]) => { const q = P(t, o, y); rpos.push(q.x, q.y, q.z); ruv.push(u, v); }); }
    const rtop = [], rside = [];
    for (let k = 0; k < NS; k++) { const a0 = k * 4, b0 = a0 + 4;
      rtop.push(a0 + 1, b0 + 1, b0 + 2, a0 + 1, b0 + 2, a0 + 2);
      rside.push(a0, b0, b0 + 1, a0, b0 + 1, a0 + 1, a0 + 2, b0 + 2, b0 + 3, a0 + 2, b0 + 3, a0 + 3); }
    const rg = new THREE.BufferGeometry(); rg.setAttribute("position", new THREE.Float32BufferAttribute(rpos, 3)); rg.setAttribute("uv", new THREE.Float32BufferAttribute(ruv, 2));
    rg.setIndex([...rtop, ...rside]); rg.addGroup(0, rtop.length, 0); rg.addGroup(rtop.length, rside.length, 1); rg.computeVertexNormals();
    const ramp = new THREE.Mesh(rg, [new THREE.MeshStandardMaterial({ map: rampT, roughness: 0.9, side: THREE.DoubleSide }), new THREE.MeshStandardMaterial({ color: "#d2ccbb", roughness: 0.95, side: THREE.DoubleSide })]);
    ramp.receiveShadow = true; ramp.castShadow = true; scene.add(ramp);
  }

  // ----- 2 bệ phóng + 2 tháp tay kẹp (trên mặt gò: nhóm padG nâng lên PY) -----
  const padG = new THREE.Group(); padG.position.y = PY; scene.add(padG);
  const PAD_X = 9, MOUNT_H = 1.7, TOWER_H = 9.2, TOWER_W = 1.45;
  const sc = cfg.rocketScale ?? 1.1, NOZ = 2.52 * sc;
  const SP = new Struts();
  const pads = [-PAD_X, PAD_X].map((x, i) => {
    const S = SP, scene = padG;                          /* mọi thứ của bệ vẽ trong nhóm nâng */
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

  padG.add(SP.mesh(steel));

  // ----- khu bồn chứa inox (sau gò, phía bắc) + giàn ống lên mặt gò -----
  {
    const vt = new THREE.CylinderGeometry(1.15, 1.15, 6.2, 36), dome = new THREE.SphereGeometry(1.15, 36, 14, 0, TAU, 0, Math.PI / 2);
    [[-18, -34], [-15, -34], [-12, -34], [-9, -34], [-18, -30.5], [-15, -30.5], [-12, -30.5]].forEach(([x, z]) => {
      const m = new THREE.Mesh(vt, inox); m.position.set(x, 3.1, z); const d = new THREE.Mesh(dome, inox); d.position.set(x, 6.2, z);
      m.castShadow = d.castShadow = true; m.receiveShadow = true; scene.add(m, d);
      S.bar(new V3(x + 1.15, 0.2, z), new V3(x + 1.15, 6.4, z), 0.06);
    });
    const hz = new THREE.CapsuleGeometry(0.85, 6, 8, 28); hz.rotateZ(Math.PI / 2);
    [[2, -35], [2, -32.8], [2, -30.6], [11, -35], [11, -32.8], [11, -30.6]].forEach(([x, z]) => {
      const m = new THREE.Mesh(hz, inox); m.position.set(x, 1.25, z); m.castShadow = m.receiveShadow = true; scene.add(m);
      [-2.4, 0, 2.4].forEach(dx => S.box(new V3(x + dx, 0.3, z), 0.3, 0.6, 1.3));
    });
    const sp = new THREE.SphereGeometry(2.1, 40, 24);
    [[18, -33]].forEach(([x, z]) => { const m = new THREE.Mesh(sp, inox); m.position.set(x, 3.2, z); m.castShadow = true; scene.add(m); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; S.bar(new V3(x + Math.cos(a) * 1.7, 0, z + Math.sin(a) * 1.7), new V3(x + Math.cos(a) * 1.7, 2.8, z + Math.sin(a) * 1.7), 0.16); } });
    // giàn ống: từ khu bồn chạy trên mặt đất, leo sườn gò, tới 2 bệ
    [-PAD_X, PAD_X].forEach(x => { for (let k = 0; k < 3; k++) { const o = k * 0.35, xx = x * 0.4 + o;
      S.bar(new V3(xx, 0.5, -28), new V3(xx, 0.5, MD.z0 - MD.slope), 0.18);
      S.bar(new V3(xx, 0.5, MD.z0 - MD.slope), new V3(xx, PY + 0.5, MD.z0), 0.18);
      S.bar(new V3(xx, PY + 0.5, MD.z0), new V3(xx, PY + 0.5, -5), 0.18);
      S.bar(new V3(xx, PY + 0.5, -5), new V3(x - Math.sign(x) * 1.5 + o, PY + 0.5, -2), 0.18); } });
  }

  // ----- khung toạ độ theo trục nhà xưởng (u dọc nhà, n pháp tuyến mặt có chữ) — khớp layout.json -----
  const HG = LAY.hangar, HA = THREE.MathUtils.degToRad(HG.ang);
  const HU = new V3(Math.sin(HA), 0, -Math.cos(HA)), HN = new V3(Math.cos(HA), 0, Math.sin(HA));
  const HP = (u, n, y = 0) => new V3(HG.c[0], y, HG.c[1]).addScaledVector(HU, u).addScaledVector(HN, n);
  const HROT = Math.PI / 2 - HA;                       // quay nhóm: trục x cục bộ = u, trục z cục bộ = n
  const panelWall = (w, h, draw) => {                  // tường tôn trắng: sóng dọc + gân ngang mờ + vết bẩn chân tường
    const S2 = 110, [c, g] = canvas(Math.min(8192, Math.round(w * S2)), Math.round(h * S2)), W = c.width, H = c.height;
    g.fillStyle = "#eef0f2"; g.fillRect(0, 0, W, H);
    for (let x = 0; x < W; x += 11) { g.fillStyle = x % 22 ? "rgba(0,0,0,.035)" : "rgba(255,255,255,.4)"; g.fillRect(x, 0, 4, H); }
    g.fillStyle = "rgba(0,0,0,.05)"; for (let y = H * 0.33; y < H; y += H * 0.33) g.fillRect(0, y, W, 3);
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(90,85,75,${rand(0.01, 0.035)})`; g.fillRect(rand(0, W), H * rand(0.6, 1), rand(20, 120), rand(30, 200)); }
    g.fillStyle = "rgba(60,60,58,.18)"; g.fillRect(0, H - 8, W, 8);
    if (draw) draw(g, W, H);
    const t = tex(c); return new THREE.MeshStandardMaterial({ map: t, roughness: 0.62, metalness: 0.05 });
  };
  const logo = (g, lx, ly, lr, ink) => {              // logo tròn + mũi tên tên lửa đỏ (thay lá cờ trong ảnh)
    g.lineWidth = lr * 0.15; g.strokeStyle = ink; g.beginPath(); g.arc(lx, ly, lr, 0, TAU); g.stroke();
    g.fillStyle = "#d9302b"; g.beginPath(); g.moveTo(lx, ly - lr * 0.72); g.lineTo(lx + lr * 0.36, ly + lr * 0.46); g.lineTo(lx, ly + lr * 0.22); g.lineTo(lx - lr * 0.36, ly + lr * 0.46); g.closePath(); g.fill();
  };
  const roofMetal = (w, d) => {                        // tôn mái xanh xám: sóng chạy TỪ DIỀM LÊN NÓC như ảnh
    const [c, g] = canvas(2048, 1024);
    g.fillStyle = "#93aabf"; g.fillRect(0, 0, 2048, 1024);
    const step = 2048 / (w * 2.2);
    for (let x = 0; x < 2048; x += step) { g.fillStyle = "rgba(255,255,255,.16)"; g.fillRect(x, 0, Math.max(1.5, step * 0.18), 1024); g.fillStyle = "rgba(0,0,0,.07)"; g.fillRect(x + step * 0.2, 0, Math.max(1.5, step * 0.12), 1024); }
    for (let i = 0; i < 50; i++) { g.fillStyle = `rgba(255,255,255,${rand(0.015, 0.05)})`; g.fillRect(rand(0, 2048), rand(0, 1024), rand(60, 400), rand(40, 300)); }
    const t = tex(c); return new THREE.MeshStandardMaterial({ map: t, roughness: 0.42, metalness: 0.45, envMapIntensity: 0.8 });
  };
  const concreteSmooth = new THREE.MeshStandardMaterial({ color: "#b8b6b0", roughness: 0.9 });
  const trimWhite = new THREE.MeshStandardMaterial({ color: "#eceef0", roughness: 0.6 });
  const doorWhite = new THREE.MeshStandardMaterial({ color: "#d4d8dc", roughness: 0.7 });

  // ----- NHÀ XƯỞNG LỚN (như ảnh) -----
  {
    const W = HG.w, D = HG.d, H = HG.h, RISE = 1.35, OV = 0.45;
    const g = new THREE.Group(); g.position.set(HG.c[0], 0, HG.c[1]); g.rotation.y = HROT; scene.add(g);
    const facade = panelWall(W, H, (c, Wp, Hp) => {    // mặt dài quay về máy quay: logo tròn (chỗ lá cờ) + ANDREW STUDIO chữ nghiêng xanh đậm
      const ink = "#1c2c5a";
      logo(c, Wp * 0.2, Hp * 0.47, Hp * 0.17, ink);
      c.fillStyle = ink; c.textBaseline = "middle"; c.textAlign = "left";
      c.font = `italic 900 ${Hp * 0.2}px "Exo 2", "Bahnschrift", "Arial Black", sans-serif`;
      if (c.letterSpacing !== undefined) c.letterSpacing = `${Hp * 0.035}px`;
      c.fillText("ANDREW STUDIO", Wp * 0.34, Hp * 0.34);
      c.fillStyle = "#dfe2e5"; c.fillRect(Wp * 0.16, Hp * 0.8, Wp * 0.035, Hp * 0.2);            // cửa đi nhỏ dưới logo
      c.fillStyle = "rgba(0,0,0,.25)"; c.fillRect(Wp * 0.16, Hp * 0.8, Wp * 0.035, 3);
    });
    const back = panelWall(W, H), farEnd = panelWall(D, H);
    const nearEnd = panelWall(D, H, (c, Wp, Hp) => {   // đầu hồi gần: cửa lớn mở, trong tối
      const gr = c.createLinearGradient(0, Hp * 0.18, 0, Hp); gr.addColorStop(0, "#1a1c1f"); gr.addColorStop(1, "#383a3c");
      c.fillStyle = gr; c.fillRect(Wp * 0.1, Hp * 0.18, Wp * 0.8, Hp * 0.82);
      c.fillStyle = "rgba(255,210,150,.12)"; for (let i = 0; i < 5; i++) c.fillRect(Wp * (0.2 + i * 0.13), Hp * 0.3, Wp * 0.06, 4);   // đèn trong xưởng
    });
    const body = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), [farEnd, nearEnd, concreteSmooth, concreteSmooth, facade, back]);
    body.position.y = H / 2; body.castShadow = body.receiveShadow = true; g.add(body);
    // mái 2 dốc rất thoải: 2 tấm nghiêng + 2 tam giác đầu hồi + diềm trắng
    const rm = roofMetal(W, D), half = D / 2 + OV, slopeL = Math.hypot(half, RISE), tilt = Math.atan2(RISE, half);
    [-1, 1].forEach(sgn => {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(W + OV * 2, slopeL), rm);
      p.rotation.order = "YXZ"; p.rotation.x = -Math.PI / 2 + sgn * tilt; p.position.set(0, H + RISE / 2, sgn * half / 2);
      p.castShadow = p.receiveShadow = true; g.add(p);
      const f = new THREE.Mesh(new THREE.BoxGeometry(W + OV * 2, 0.28, 0.12), trimWhite); f.position.set(0, H - 0.05, sgn * half); g.add(f);   // diềm
    });
    const gable = new THREE.Shape(); gable.moveTo(-half, 0); gable.lineTo(0, RISE); gable.lineTo(half, 0); gable.closePath();
    [-1, 1].forEach(sgn => { const m = new THREE.Mesh(new THREE.ShapeGeometry(gable), trimWhite); m.rotation.y = sgn * Math.PI / 2; m.position.set(sgn * (W / 2 + 0.01), H, 0); g.add(m); });
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(W + OV * 2, 0.12, 0.5), new THREE.MeshStandardMaterial({ color: "#aebfcf", roughness: 0.4, metalness: 0.5 })); ridge.position.set(0, H + RISE + 0.02, 0); g.add(ridge);
    // tấm cửa nâng chéo ở đầu hồi gần (mảng trắng nghiêng to trong ảnh) + ray 2 bên
    { const len = H * 0.42, a = 0.5, door = new THREE.Mesh(new THREE.BoxGeometry(len, 0.35, D * 0.84), doorWhite);
      door.position.set(-W / 2 - Math.cos(a) * len / 2, H * 0.9 - Math.sin(a) * len / 2, 0); door.rotation.z = a; door.castShadow = true; g.add(door); }
    [-1, 1].forEach(s => { const r = new THREE.Mesh(new THREE.BoxGeometry(0.3, H * 0.84, 0.3), trimWhite); r.position.set(-W / 2 - 0.15, H * 0.42, s * D * 0.41); g.add(r); });
    // dãy nhà phụ thấp dọc chân mặt có chữ (nửa xa), mái bằng xanh xám, dải cửa sổ
    const aW = W * 0.5, aD = 3.6, aH = 3.3;
    const annexFront = panelWall(aW, aH, (c, Wp, Hp) => { c.fillStyle = "#3b4654"; for (let x = Wp * 0.04; x < Wp * 0.96; x += Wp * 0.07) c.fillRect(x, Hp * 0.34, Wp * 0.045, Hp * 0.22); });
    const annexSide = panelWall(aD, aH);
    const annex = new THREE.Mesh(new THREE.BoxGeometry(aW, aH, aD), [annexSide, annexSide, new THREE.MeshStandardMaterial({ color: "#9cb0c2", roughness: 0.55, metalness: 0.3 }), concreteSmooth, annexFront, annexSide]);
    annex.position.set(W / 2 - aW / 2, aH / 2, D / 2 + aD / 2); annex.castShadow = annex.receiveShadow = true; g.add(annex);
    const aTrim = new THREE.Mesh(new THREE.BoxGeometry(aW + 0.2, 0.22, aD + 0.2), trimWhite); aTrim.position.set(W / 2 - aW / 2, aH + 0.05, D / 2 + aD / 2); g.add(aTrim);
    // thiết bị ngổn ngang trước cửa lớn (thùng, pallet, xe nâng)
    { const eq = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: 0.7 }), 9), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
      for (let k = 0; k < 9; k++) { const sx = rand(0.5, 1.3), sy = rand(0.4, 0.8), sz = rand(0.5, 1.3);
        m4.compose(HP(-W / 2 - rand(3, 11), rand(-D / 2, D / 2), sy / 2), q.setFromAxisAngle(new V3(0, 1, 0), HROT + rand(-0.3, 0.3)), new V3(sx, sy, sz)); eq.setMatrixAt(k, m4);
        eq.setColorAt(k, c.set(["#e8e8e4", "#c9a33a", "#8c9096", "#e8e8e4", "#5b6470"][k % 5])); }
      eq.castShadow = eq.receiveShadow = true; scene.add(eq); }
  }

  // ----- nhà phụ (theo trục nhà xưởng) + nhà nhỏ cuối đường vòng -----
  LAY.buildings.forEach(b => {
    const wF = panelWall(b.w, b.h, (c, Wp, Hp) => { c.fillStyle = "#3b4654"; for (let x = Wp * 0.05; x < Wp * 0.95; x += Wp * 0.09) c.fillRect(x, Hp * 0.3, Wp * 0.05, Hp * 0.25); }), wS = panelWall(b.d, b.h);
    const roofM = new THREE.MeshStandardMaterial({ color: b.roof, roughness: 0.6, metalness: 0.25 });
    const m = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), [wS, wS, roofM, concreteSmooth, wF, wF]);
    m.position.copy(HP(b.u, b.n, b.h / 2)); m.rotation.y = HROT; m.castShadow = m.receiveShadow = true; scene.add(m);
    const t = new THREE.Mesh(new THREE.BoxGeometry(b.w + 0.2, 0.18, b.d + 0.2), trimWhite); t.position.copy(HP(b.u, b.n, b.h + 0.05)); t.rotation.y = HROT; scene.add(t);
    for (let k = 0; k < Math.round(b.w / 5); k++) S.box(HP(b.u - b.w / 2 + 2 + k * 4.5, b.n - b.d * 0.2, b.h + 0.45), 0.9, 0.6, 0.9, HROT);   // máy lạnh
  });
  LAY.xbuildings.forEach(b => {
    const wS = panelWall(b.w, b.h), m = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), [wS, wS, new THREE.MeshStandardMaterial({ color: "#c9ced3", roughness: 0.6 }), concreteSmooth, wS, wS]);
    m.position.set(b.c[0], b.h / 2, b.c[1]); m.castShadow = m.receiveShadow = true; scene.add(m);
  });

  // ----- BÃI XE: ô tô 3D (thân + cabin kính tối) -----
  {
    const pk = LAY.parking, cars = [];
    pk.rows.forEach(row => { for (let u = pk.u0 + 1.0; u < pk.u1 - 1.5 - 0.5; u += pk.slot) if (Math.random() < 0.78) cars.push({ u: u + pk.slot / 2 + rand(-0.06, 0.06), n: row.n + row.dir * (pk.depth / 2 + rand(-0.08, 0.08)) }); });
    // vài xe đậu dọc đường + xe tải trên đường dọc dốc
    const bodyG = new THREE.BoxGeometry(0.58, 0.34, 1.36); bodyG.translate(0, 0.25, 0);
    const cabG = new THREE.BoxGeometry(0.52, 0.26, 0.74); cabG.translate(0, 0.54, -0.06);
    const glass = new THREE.MeshStandardMaterial({ color: "#20252c", roughness: 0.15, metalness: 0.6 });
    const paint = new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.5 });
    const cabTop = new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.5 });
    const bodies = new THREE.InstancedMesh(bodyG, paint, cars.length), cabs = new THREE.InstancedMesh(cabG, [glass, glass, cabTop, glass, glass, glass], cars.length);
    const PAL = ["#f2f3f5", "#f2f3f5", "#e9eaec", "#1b1d21", "#1b1d21", "#9aa0a8", "#6d737b", "#2a4f8f", "#a3262a", "#c9ccd1"];
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color();
    cars.forEach((c, i) => {
      q.setFromAxisAngle(new V3(0, 1, 0), HROT + (Math.random() < 0.5 ? 0 : Math.PI) + rand(-0.04, 0.04));
      m4.compose(HP(c.u, c.n), q, new V3(1, 1, 1)); bodies.setMatrixAt(i, m4); cabs.setMatrixAt(i, m4);
      col.set(PAL[(Math.random() * PAL.length) | 0]); bodies.setColorAt(i, col); cabs.setColorAt(i, col);
    });
    [bodies, cabs].forEach(m => { m.castShadow = true; m.receiveShadow = true; scene.add(m); });
    // cột đèn bãi xe
    for (let u = pk.u0 + 4; u < pk.u1; u += 10) [pk.n0 + 5.6, pk.n0 + 17.6].forEach(n => { const p = HP(u, n); S.bar(p, p.clone().setY(4.2), 0.08); S.box(p.clone().setY(4.25), 0.6, 0.12, 0.25, HROT); });
    // xe tải + container dọc đường bên dốc (như ảnh)
    const [A, B] = LAY.ramp, ru = new V3(B[0] - A[0], 0, B[1] - A[1]).normalize(), rn = new V3(-ru.z, 0, ru.x), ry = Math.atan2(ru.x, ru.z);
    const truckM = new THREE.MeshStandardMaterial({ color: "#eceef0", roughness: 0.5 }), cabM = new THREE.MeshStandardMaterial({ color: "#2f6fb0", roughness: 0.4, metalness: 0.3 });
    [[14, 9.6], [30, 8.4], [47, 9.6]].forEach(([t, o]) => {
      const p = new V3(A[0], 0, A[1]).addScaledVector(ru, t).addScaledVector(rn, o);
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 3.0), truckM); box.position.copy(p).setY(0.65); box.rotation.y = ry; box.castShadow = true; scene.add(box);
      const cab = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 0.8), cabM); cab.position.copy(p).addScaledVector(ru, 1.95).setY(0.5); cab.rotation.y = ry; cab.castShadow = true; scene.add(cab);
    });
    for (let k = 0; k < 7; k++) { const p = HP(28 + k * 1.3, -12 - (k % 2) * 3.2, 0.5); S.box(p, 0.9, 1.0, 2.6, HROT + Math.PI / 2); }   // container trắng sau nhà nhỏ
  }

  // ----- xa: mái vòm trắng, tháp nước, cột xa ven biển -----
  {
    const white = new THREE.MeshStandardMaterial({ color: "#f3f4f5", roughness: 0.5 });
    const dm = new THREE.Mesh(new THREE.SphereGeometry(3.2, 32, 16, 0, TAU, 0, Math.PI / 2), white); dm.position.set(-86, 0.8, -92); dm.castShadow = true; scene.add(dm);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.3, 0.8, 32), white); base.position.set(-86, 0.4, -92); scene.add(base);
    [[-150, -40], [70, -70]].forEach(([x, z]) => { const s = new THREE.Mesh(new THREE.SphereGeometry(1.6, 24, 12), white); s.position.set(x, 7.5, z); s.castShadow = true; scene.add(s);
      for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + 0.4; S.bar(new V3(x + Math.cos(a) * 1.4, 0, z + Math.sin(a) * 1.4), new V3(x + Math.cos(a) * 0.9, 7, z + Math.sin(a) * 0.9), 0.14); } });
    [[95, -40, 14], [150, 10, 11], [40, -110, 12]].forEach(([x, z, h]) => { towerStruts(S, new V3(x, 0, z), h, 1.1, 0.8); });
  }

  // ----- CÂY (4e, thầy: "chân thực hơn, nhiều lá hơn, không phải khối đơn điệu"): tán = hàng chục THẺ LÁ (ảnh chùm lá vẽ sẵn,
  // cắt theo alpha + alphaToCoverage trên render target MSAA ⇒ mép lá mịn, không lấp loá), pháp tuyến HƯỚNG RA từ tâm tán ⇒ sáng tối
  // mềm như khối lá thật; trong tán tối hơn ngoài. 3 loại kiểu rừng bụi Florida: SỒI tán tròn nhiều chùm · CỌ LÙN lá quạt · THÔNG thân cao.
  {
    const leafTex = kind => {
      const s = 512, [c, g] = canvas(s, s);
      if (kind === "fan") {                                  // lá cọ quạt: nhiều phiến mảnh toả từ một điểm dưới đáy
        for (let f = 0; f < 3; f++) { const ox = s / 2 + rand(-40, 40), oy = s - 8, a0 = rand(-0.4, 0.4) - Math.PI / 2;
          for (let k = 0; k < 26; k++) { const a = a0 + (k / 25 - 0.5) * 2.3, L = rand(0.62, 0.92) * s * 0.52;
            const h = rand(70, 105), l = rand(20, 36); g.strokeStyle = `hsl(${h},${rand(30, 48)}%,${l}%)`; g.lineWidth = rand(5, 9); g.lineCap = "round";
            g.beginPath(); g.moveTo(ox, oy); g.quadraticCurveTo(ox + Math.cos(a) * L * 0.5, oy + Math.sin(a) * L * 0.5 - 10, ox + Math.cos(a) * L, oy + Math.sin(a) * L + L * 0.12); g.stroke(); } }
      } else {                                               // chùm lá rộng: ~1100 lá bầu dục, dày ở giữa, thưa ra mép, sáng lệch trên-trái
        for (let i = 0; i < 1100; i++) {
          const a = rand(0, TAU), d = Math.pow(Math.random(), 0.75) * s * 0.44, x = s / 2 + Math.cos(a) * d, y = s / 2 + Math.sin(a) * d * 0.92;
          const lit = clamp(0.5 - (x - s / 2) / s * 0.6 - (y - s / 2) / s * 0.9 + rand(-0.25, 0.25), 0, 1);
          const h = kind === "pine" ? rand(95, 125) : rand(78, 112), sat = rand(28, 50), l = (kind === "pine" ? 12 : 15) + lit * 26 + rand(-4, 4);
          g.save(); g.translate(x, y); g.rotate(rand(0, TAU));
          const rx = kind === "pine" ? rand(9, 15) : rand(6, 11), ry = kind === "pine" ? rand(1.2, 2) : rand(2.6, 4.6);
          g.fillStyle = `hsl(${h},${sat}%,${l}%)`; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, TAU); g.fill();
          g.strokeStyle = `hsla(${h},${sat}%,${l * 0.6}%,.6)`; g.lineWidth = 1; g.beginPath(); g.moveTo(-rx, 0); g.lineTo(rx, 0); g.stroke();   // gân lá
          g.restore();
        }
      }
      const t = tex(c); t.generateMipmaps = true; return t;
    };
    const TEX = { oak: leafTex("oak"), pine: leafTex("pine"), fan: leafTex("fan") };
    const fixNormal = sh => { sh.fragmentShader = sh.fragmentShader.replace("#include <normal_fragment_begin>", THREE.ShaderChunk.normal_fragment_begin.replace("normal *= faceDirection;", "")); };
    const leafMat = map => { const m = new THREE.MeshStandardMaterial({ map, alphaTest: 0.5, alphaToCoverage: true, side: THREE.DoubleSide, vertexColors: true, roughness: 0.82, metalness: 0 });
      m.onBeforeCompile = fixNormal; return m; };
    const barkMat = new THREE.MeshStandardMaterial({ color: "#4a3b2c", roughness: 1, vertexColors: true });
    // dựng một cây mẫu: blobs = [cx, cy, cz, r, số thẻ, cỡ thẻ]; trunk = [bán kính, cao]
    function treeGeo({ blobs = [], fans = 0, fanSize = 1, trunk = null }) {
      const P = [], N = [], U = [], Cc = [], I = [];
      const center = new V3(); blobs.forEach(b => center.add(new V3(b[0], b[1], b[2]))); if (blobs.length) center.divideScalar(blobs.length);
      const minY = blobs.length ? Math.min(...blobs.map(b => b[1] - b[3])) : 0, maxY = blobs.length ? Math.max(...blobs.map(b => b[1] + b[3])) : 1;
      const quad = (cs, nrm, shade) => { const o = P.length / 3;
        cs.forEach((p, k) => { P.push(p.x, p.y, p.z); const n = nrm(p); N.push(n.x, n.y, n.z); U.push(k === 0 || k === 3 ? 0 : 1, k < 2 ? 0 : 1); const s2 = shade(p); Cc.push(s2, s2, s2); });
        I.push(o, o + 1, o + 2, o, o + 2, o + 3); };
      blobs.forEach(([bx, by, bz, r, n, sz]) => {
        const bc = new V3(bx, by, bz);
        for (let k = 0; k < n; k++) {
          const dir = new V3(rand(-1, 1), rand(-0.55, 1), rand(-1, 1)).normalize(), p = bc.clone().addScaledVector(dir, r * Math.pow(Math.random(), 0.5));
          const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rand(0, TAU), rand(0, TAU), rand(0, TAU))), u = new V3(1, 0, 0).applyQuaternion(q), v = new V3(0, 1, 0).applyQuaternion(q), w = sz * rand(0.8, 1.25) / 2;
          const cs = [p.clone().addScaledVector(u, -w).addScaledVector(v, -w), p.clone().addScaledVector(u, w).addScaledVector(v, -w), p.clone().addScaledVector(u, w).addScaledVector(v, w), p.clone().addScaledVector(u, -w).addScaledVector(v, w)];
          quad(cs, c2 => c2.clone().sub(center).setY((c2.y - center.y) * 0.8 + 0.35).normalize(),
            c2 => { const hk = clamp((c2.y - minY) / (maxY - minY), 0, 1), rk = clamp(c2.distanceTo(bc) / r, 0, 1); return 0.42 + 0.4 * hk + 0.28 * rk; });
        }
      });
      for (let k = 0; k < fans; k++) {                      // lá quạt cọ lùn: thẻ đứng xoè ra quanh gốc, nghiêng ngoài
        const a = k / fans * TAU + rand(-0.3, 0.3), tilt = rand(0.35, 0.95), sz = fanSize * rand(0.75, 1.15);
        const out = new V3(Math.cos(a), 0, Math.sin(a)), side = new V3(-Math.sin(a), 0, Math.cos(a)), up = new V3(0, Math.cos(tilt), 0).addScaledVector(out, Math.sin(tilt));
        const b0 = out.clone().multiplyScalar(0.05);
        const cs = [b0.clone().addScaledVector(side, -sz / 2), b0.clone().addScaledVector(side, sz / 2), b0.clone().addScaledVector(side, sz / 2).addScaledVector(up, sz), b0.clone().addScaledVector(side, -sz / 2).addScaledVector(up, sz)];
        quad(cs, () => up.clone().multiplyScalar(0.6).add(new V3(0, 0.6, 0)).normalize(), c2 => 0.55 + 0.45 * clamp(c2.y / sz, 0, 1));
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); g.setAttribute("normal", new THREE.Float32BufferAttribute(N, 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute(U, 2)); g.setAttribute("color", new THREE.Float32BufferAttribute(Cc, 3)); g.setIndex(I);
      if (!trunk) return { geo: g, mats: null };
      const tg = new THREE.CylinderGeometry(trunk[0] * 0.7, trunk[0], trunk[1], 6, 1, true); tg.translate(0, trunk[1] / 2, 0);
      tg.setAttribute("color", new THREE.Float32BufferAttribute(new Array(tg.attributes.position.count * 3).fill(1), 3));
      const idx = g.index.count, merged = new THREE.BufferGeometry();
      ["position", "normal", "uv", "color"].forEach(n => { const a = g.attributes[n].array, b = tg.attributes[n].array, arr = new Float32Array(a.length + b.length); arr.set(a); arr.set(b, a.length); merged.setAttribute(n, new THREE.BufferAttribute(arr, g.attributes[n].itemSize)); });
      const off = g.attributes.position.count, ti = Array.from(tg.index.array, v => v + off);
      merged.setIndex([...g.index.array, ...ti]); merged.addGroup(0, idx, 0); merged.addGroup(idx, ti.length, 1);
      return { geo: merged, trunk: true };
    }
    const KINDS = {
      oak: { ...treeGeo({ blobs: [[0, 1.3, 0, 0.85, 18, 0.8], [0.7, 1.0, 0.3, 0.65, 12, 0.7], [-0.65, 1.05, -0.35, 0.65, 12, 0.7], [0.15, 1.8, -0.1, 0.6, 10, 0.65], [-0.25, 0.9, 0.65, 0.55, 9, 0.65], [0.4, 0.85, -0.6, 0.5, 8, 0.6]], trunk: [0.08, 0.9] }), map: TEX.oak, n: 8000 },
      fan: { ...treeGeo({ fans: 14, fanSize: 0.95 }), map: TEX.fan, n: 6000 },
      pine: { ...treeGeo({ blobs: [[0, 3.25, 0, 0.5, 11, 0.6], [0.32, 2.85, 0.12, 0.4, 8, 0.5], [-0.28, 3.0, -0.2, 0.42, 8, 0.5], [0.05, 3.6, 0, 0.32, 6, 0.45]], trunk: [0.06, 3.3] }), map: TEX.pine, n: 900 }
    };
    const inField = (x, z) => LAY.fields.some(([x0, x1, z0, z1]) => x > x0 - 3 && x < x1 + 3 && z > z0 - 3 && z < z1 + 3);
    const [A, B] = LAY.ramp, segD = (x, z) => { const vx = B[0] - A[0], vz = B[1] - A[1], t = clamp(((x - A[0]) * vx + (z - A[1]) * vz) / (vx * vx + vz * vz), 0, 1); return Math.hypot(x - A[0] - vx * t, z - A[1] - vz * t); };
    const inLake = (x, z) => LAY.lakes.some(([cx, cz, rx, rz, ang]) => { const a = THREE.MathUtils.degToRad(ang), u = (x - cx) * Math.cos(a) + (z - cz) * Math.sin(a), v = -(x - cx) * Math.sin(a) + (z - cz) * Math.cos(a); return (u / (rx + 6)) ** 2 + (v / (rz + 6)) ** 2 < 1; });
    const coast = (x, z) => x * 0.55 - z * 0.835 - 95;
    const clump = (x, z) => (Math.sin(x * 0.071) + Math.sin(z * 0.093 + 1.3) + Math.sin((x + z) * 0.047 + 2.1) + Math.sin((x - z) * 0.13)) / 4;   // chỗ rậm chỗ thưa
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color();
    Object.entries(KINDS).forEach(([kind, K]) => {
      const mats = K.trunk ? [leafMat(K.map), barkMat] : leafMat(K.map);
      const im = new THREE.InstancedMesh(K.geo, mats, K.n);
      let n = 0;
      for (let i = 0; i < K.n * 12 && n < K.n; i++) {
        const x = rand(-230, 120), z = rand(-160, 190);
        if (inLake(x, z) || coast(x, z) > -12 || segD(x, z) < 19) continue;
        const edge = inField(x, z);
        if (edge && !(kind === "fan" && Math.random() < 0.04)) continue;           // vài bụi cọ lác đác trên cỏ
        if (!edge && Math.random() > 0.55 + 0.45 * smooth(-0.35, 0.35, clump(x, z))) continue;
        const s = kind === "oak" ? rand(0.7, 1.45) : kind === "fan" ? rand(0.6, 1.15) : rand(0.85, 1.3);
        m4.compose(new V3(x, 0, z), q.setFromAxisAngle(new V3(0, 1, 0), rand(0, TAU)), new V3(s * rand(0.9, 1.1), s * rand(0.85, 1.15), s * rand(0.9, 1.1)));
        im.setMatrixAt(n, m4); im.setColorAt(n, col.setHSL(rand(0.2, 0.3), rand(0.1, 0.35), rand(0.62, 0.9))); n++;
      }
      im.count = n; im.castShadow = true; im.receiveShadow = true; scene.add(im);
    });
  }
  scene.add(S.mesh(steel));

  // ----- 2 tàu của game trên bệ -----
  const Q_UP = new THREE.Quaternion().setFromUnitVectors(new V3(1, 0, 0), new V3(0, 1, 0));
  const Q_FWD = new THREE.Quaternion().setFromUnitVectors(new V3(1, 0, 0), new V3(0, 0, -1));
  const rockets = TEAMS.map((t, i) => {
    const r = makeRocket(t, i, cfg.hull);
    r.rig.scale.setScalar(sc); r.rig.position.set(pads[i].x, PY + MOUNT_H + NOZ, 0); r.rig.quaternion.copy(Q_UP);
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
  clouds.mat.uniforms.uPadA.value.set(-PAD_X, PY + 1, 0); clouds.mat.uniforms.uPadB.value.set(PAD_X, PY + 1, 0);
  // vẽ SAU mặt đất trong suốt (tấm khu phóng renderOrder 1, mặt nước 2) — nếu không, tấm khu phóng đè mất mây
  steam.points.renderOrder = 5; clouds.points.renderOrder = 6; fire.points.renderOrder = 7;
  scene.add(clouds.points, steam.points, fire.points);
  const padLight = pads.map(p => { const l = new THREE.PointLight(0xff8f40, 0, 60, 1.5); l.position.set(p.x, PY + 2.5, 0); scene.add(l); return l; });

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
  const AERIAL = { pos: new V3(-7, 24 + PY, 46), look: new V3(1.5, 4.5 + PY, 0) };
  const ORB = { a0: Math.atan2(AERIAL.pos.x, AERIAL.pos.z), r: Math.hypot(AERIAL.pos.x, AERIAL.pos.z) };

  const IDLE = cfg.idle || { pos: [-95, 28, 128], look: [-86, 3, 26] };
  const FOV0 = cfg.fov ?? 38, IDLE_FOV = cfg.idleFov ?? 46;    // màn chờ góc rộng như ảnh drone; thu về góc game khi bay tới bệ
  function idleCam(t) {                                    // như ẢNH: drone trên cao phía tây nam nhà xưởng, nhìn về bắc — trôi rất nhẹ
    const k = Math.sin(t * 0.05);
    return { pos: new V3(IDLE.pos[0] + k * 2.5, IDLE.pos[1] + Math.sin(t * 0.08) * 0.6, IDLE.pos[2] - k * 1.5), look: new V3(IDLE.look[0] + k * 1.5, IDLE.look[1], IDLE.look[2]) };
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
      clouds.emit({ pos: new V3(pad.x + rand(-1, 1), PY + rand(0.3, 1.4), rand(-1, 1)), vel: dir.multiplyScalar(sp).add(new V3(0, rand(0.5, 3.5), 0)),
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
          r.v = Math.min(95, r.v + (tt < 1.2 ? 4.5 : 11) * dt);          /* 4e: lên nhanh hơn — vượt máy quay sau ~2,7 s */
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
        if (k > 0 && Math.random() < dt * 50) fire.emit({ pos: new V3(p.x + rand(-2.5, 2.5), PY + rand(0.3, 1.5), rand(-2.5, 2.5)), vel: new V3(rand(-4, 4), rand(0.5, 2), rand(-4, 4)),
          life: rand(0.3, 0.6), size: rand(2.5, 4.5), sizeEnd: 1, color: new THREE.Color(2.2, 1.1, 0.35), colorEnd: new THREE.Color(0.9, 0.25, 0.04), alpha: 0.55, drag: 2 });
        padLight[i].intensity = 260 * k * (0.8 + Math.random() * 0.4);
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
      // 4e: máy quay KHÔNG LÚC NÀO đứng yên — trôi vòng chậm quanh khu bệ + tiến nhẹ vào trong lúc đếm 3-2-1, tiếp tục khi cất cánh
      const orb = ORB.a0 + t * 0.06, rad = ORB.r * (1 - 0.12 * smooth(0, T.lift + 2, t));
      const aerial = { pos: new V3(Math.sin(orb) * rad, AERIAL.pos.y + Math.sin(t * 0.7) * 0.5 + Math.max(0, t - T.lift) * 0.8, Math.cos(orb) * rad), look: AERIAL.look.clone() };
      // nhìn theo tàu khi tàu lên (tàu lao THẲNG VỀ phía máy quay)
      aerial.look.lerp(mid.clone().add(new V3(0, -2, 0)), smooth(T.lift + 0.3, T.lift + 2.4, t) * 0.9);
      const A = { pos: ic.pos.lerp(aerial.pos, k0), look: ic.look.lerp(aerial.look, k0) };
      follow = t < T.move ? 1 : Math.min(1, dt * 3);
      // 2) tàu VỤT QUA độ cao máy quay ⇒ máy quay quay theo, tụt ra sau đuôi, đuổi theo
      if (!G.passT && t >= T.lift && (mid.y > A.pos.y + 2 || t > T.lift + 3.2)) { G.passT = t; T.pitch1 = t + 3.4; T.warp = t + 2.4; T.fade = t + 3.9; }   /* 4e: 3-2-1 xong → ~6,5 s là vào game */
      if (G.passT) {
        const pk = ease(smooth(G.passT + 0.4, T.pitch1, t));
        const fwd = new V3(0, Math.cos(pk * Math.PI / 2), -Math.sin(pk * Math.PI / 2));
        const q = new THREE.Quaternion().setFromUnitVectors(new V3(0, 0, -1), fwd);
        const chase = { pos: mid.clone().add(endCam.pos.clone().applyQuaternion(q).multiplyScalar(lerp(1.35, 1, pk))), look: mid.clone().add(endCam.look.clone().applyQuaternion(q)) };
        const kc = ease(smooth(G.passT, G.passT + 1.7, t));
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
      camera.fov = lerp(IDLE_FOV, FOV0, k0) + 24 * w * (G.handed ? Math.max(0, 1 - (t - T.fade) / 0.9) : 1);
      camera.updateProjectionMatrix();
      renderer.toneMappingExposure = 0.9 + 1.6 * Math.exp(-Math.pow((t - T.fade) / 0.18, 2)) * (G.passT ? 1 : 0);
      const fk = smooth(30, 180, alt);
      scene.fog.color.copy(HAZE).lerp(SPACE, dk);
      scene.fog.near = lerp(FOG_N, 6, fk); scene.fog.far = lerp(FOG_F, 260, fk);
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
  camera.fov = IDLE_FOV; camera.updateProjectionMatrix(); resize();

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
