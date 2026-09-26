// =============================================================
// MẪU 4 — MÀN CHỜ + INTRO "PHÓNG TỪ MẶT ĐẤT" (thầy 26/9/2026)
// Hai tàu của game đứng trên 2 bệ phóng ở một trung tâm vũ trụ ven biển lúc hoàng hôn
// (tham khảo ảnh Starbase: tháp giàn + tay kẹp, bồn chứa nằm ngang, mây hơi cuồn cuộn khi phóng).
// START ⇒ đếm 3-2-1 → đánh lửa (mây hơi tràn ngang 2 bên bệ) → cất cánh → máy quay chuyển xuống
// ĐUỔI THEO ĐUÔI 2 tàu → tàu nghiêng dần về phương ngang, xích lại gần nhau → trời tối dần thành vũ trụ
// → trang hoà cảnh sang màn game (đúng góc đuổi của game) — onHandoff().
// Tàu = CHÍNH mô hình tàu của game (makeRocket), cùng màu đội, cùng vỏ.
// =============================================================
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { Water } from "three/addons/objects/Water.js";
import { makeRocket, TEAMS } from "./rr3d-core.js";

const V3 = THREE.Vector3;
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// ---------- nhiễu giá trị 2D/3D (JS) ----------
const nHash = (x, y, z) => { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); };
function vnoise(x, y, z = 0) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const c = (a, b, d) => nHash(xi + a, yi + b, zi + d);
  return lerp(lerp(lerp(c(0, 0, 0), c(1, 0, 0), u), lerp(c(0, 1, 0), c(1, 1, 0), u), v),
              lerp(lerp(c(0, 0, 1), c(1, 0, 1), u), lerp(c(0, 1, 1), c(1, 1, 1), u), v), w);
}
const fbm = (x, y) => vnoise(x, y) * 0.5 + vnoise(x * 2.03 + 7, y * 2.03) * 0.3 + vnoise(x * 4.1, y * 4.1 + 3) * 0.2;

// ---------- kết cấu vẽ tay ----------
function canvasTex(c, srgb = true) { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
function softTex(size = 128) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  const g = c.getContext("2d"), gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.3, "rgba(255,255,255,.7)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, size, size); return canvasTex(c, false);
}
function puffTex(shaded = false) {
  const s = 256, c = document.createElement("canvas"); c.width = c.height = s;
  const g = c.getContext("2d");
  const blob = (x, y, r, a) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(0.6, `rgba(255,255,255,${a * 0.4})`); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, s, s); };
  for (let i = 0; i < 16; i++) { const a = rand(0, TAU), d = rand(0, 44); blob(s / 2 + Math.cos(a) * d, s / 2 + Math.sin(a) * d, rand(46, 80), 0.16); }
  for (let i = 0; i < 46; i++) { const a = rand(0, TAU), d = Math.sqrt(Math.random()) * 72; blob(s / 2 + Math.cos(a) * d, s / 2 + Math.sin(a) * d, rand(12, 32), rand(0.1, 0.24)); }
  g.globalCompositeOperation = "destination-in";
  const m = g.createRadialGradient(s / 2, s / 2, s * 0.2, s / 2, s / 2, s / 2); m.addColorStop(0, "#000"); m.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = m; g.fillRect(0, 0, s, s);
  if (shaded) {                                   // mây có khối: đỉnh sáng, bụng tối (hạt mây phóng không xoay quá ±25°)
    g.globalCompositeOperation = "source-atop";
    const sh = g.createLinearGradient(0, 0, 0, s); sh.addColorStop(0, "rgba(255,255,255,0)"); sh.addColorStop(0.55, "rgba(120,110,112,.25)"); sh.addColorStop(1, "rgba(70,62,66,.6)");
    g.fillStyle = sh; g.fillRect(0, 0, s, s);
  }
  return canvasTex(c, false);
}
// normal map sóng biển tự sinh (lặp liền mép): tổng các sóng sin tần số nguyên
function waterNormals() {
  const N = 256, c = document.createElement("canvas"); c.width = c.height = N;
  const g = c.getContext("2d"), img = g.createImageData(N, N);
  const W = [[3, 1, 1], [1, 4, 0.8], [5, -2, 0.5], [-4, 3, 0.45], [7, 5, 0.25], [-9, 2, 0.2], [11, -7, 0.12], [2, 13, 0.1]].map(([a, b, amp]) => ({ a, b, amp, ph: rand(0, TAU) }));
  const H = (x, y) => W.reduce((s, w) => s + w.amp * Math.sin(TAU * (w.a * x + w.b * y) / N + w.ph), 0);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const dx = H(x + 1, y) - H(x - 1, y), dy = H(x, y + 1) - H(x, y - 1);
    const n = new V3(-dx * 2.2, -dy * 2.2, 1).normalize();
    const i = (y * N + x) * 4;
    img.data[i] = (n.x * 0.5 + 0.5) * 255; img.data[i + 1] = (n.y * 0.5 + 0.5) * 255; img.data[i + 2] = (n.z * 0.5 + 0.5) * 255; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
// vách nhà xưởng: tôn sóng dọc + vệt bẩn + vài ô đèn
function hangarTex() {
  const c = document.createElement("canvas"); c.width = 512; c.height = 1024;
  const g = c.getContext("2d");
  g.fillStyle = "#b9bcc0"; g.fillRect(0, 0, 512, 1024);
  for (let x = 0; x < 512; x += 8) { g.fillStyle = x % 16 ? "rgba(0,0,0,.08)" : "rgba(255,255,255,.1)"; g.fillRect(x, 0, 4, 1024); }
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(60,50,40,${rand(0.03, 0.08)})`; g.fillRect(rand(0, 512), rand(0, 1024), rand(10, 60), rand(80, 400)); }
  g.fillStyle = "#6d7278"; g.fillRect(60, 380, 392, 644);             // cửa cuốn lớn
  for (let y = 380; y < 1024; y += 14) { g.fillStyle = "rgba(0,0,0,.12)"; g.fillRect(60, y, 392, 3); }
  g.fillStyle = "#1c2a44"; g.fillRect(0, 60, 512, 26);                // dải tên
  return canvasTex(c);
}

// ---------- hạt (hơi/khói/lửa) ----------
class Particles {
  constructor(max, { additive, map }) {
    this.max = max; this.idx = 0;
    const F = n => new Float32Array(n);
    Object.assign(this, { pos: F(max * 3), col: F(max * 3), size: F(max), alpha: F(max), rot: F(max), vel: F(max * 3), life: F(max), maxLife: F(max),
      s0: F(max), s1: F(max), c0: F(max * 3), c1: F(max * 3), a0: F(max), drag: F(max), rise: F(max) });
    const geo = new THREE.BufferGeometry();
    [["position", this.pos, 3], ["aColor", this.col, 3], ["aSize", this.size, 1], ["aAlpha", this.alpha, 1], ["aRot", this.rot, 1]]
      .forEach(([n, a, k]) => geo.setAttribute(n, new THREE.BufferAttribute(a, k).setUsage(THREE.DynamicDrawUsage)));
    this.mat = new THREE.ShaderMaterial({
      uniforms: { uMap: { value: map }, uScale: { value: 800 } },
      vertexShader: `attribute vec3 aColor; attribute float aSize; attribute float aAlpha; attribute float aRot;
        uniform float uScale; varying vec3 vC; varying float vA; varying float vR;
        void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); gl_Position = projectionMatrix*mv;
          gl_PointSize = min(aSize*uScale/max(0.1,-mv.z), 2048.0); vC = aColor; vA = aAlpha; vR = aRot; }`,
      fragmentShader: `uniform sampler2D uMap; varying vec3 vC; varying float vA; varying float vR;
        void main(){ if (vA <= 0.002) discard; vec2 q = gl_PointCoord - 0.5; float c = cos(vR), s = sin(vR);
          q = vec2(c*q.x - s*q.y, s*q.x + c*q.y) + 0.5; vec4 t = texture2D(uMap, clamp(q, 0.0, 1.0));
          gl_FragColor = vec4(vC*t.rgb, t.a*vA); }`,
      transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending
    });
    this.points = new THREE.Points(geo, this.mat); this.points.frustumCulled = false; this.geo = geo;
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
  update(dt) {
    for (let i = 0; i < this.max; i++) {
      if (this.life[i] <= 0) { if (this.alpha[i] !== 0) { this.alpha[i] = 0; this.size[i] = 0; } continue; }
      this.life[i] -= dt;
      const i3 = i * 3, k = 1 - clamp(this.life[i] / this.maxLife[i], 0, 1), d = Math.max(0, 1 - this.drag[i] * dt);
      this.vel[i3] *= d; this.vel[i3 + 1] = this.vel[i3 + 1] * d + this.rise[i] * dt; this.vel[i3 + 2] *= d;
      this.pos[i3] += this.vel[i3] * dt; this.pos[i3 + 1] += this.vel[i3 + 1] * dt; this.pos[i3 + 2] += this.vel[i3 + 2] * dt;
      this.size[i] = lerp(this.s0[i], this.s1[i], 1 - Math.pow(1 - k, 2));
      for (let j = 0; j < 3; j++) this.col[i3 + j] = lerp(this.c0[i3 + j], this.c1[i3 + j], k);
      this.alpha[i] = this.a0[i] * (k < 0.08 ? k / 0.08 : 1 - (k - 0.08) / 0.92);
      if (this.life[i] <= 0) { this.alpha[i] = 0; this.size[i] = 0; }
    }
    const a = this.geo.attributes;
    a.position.needsUpdate = a.aColor.needsUpdate = a.aSize.needsUpdate = a.aAlpha.needsUpdate = true;
  }
}

// ---------- khung thép: mọi thanh là một thể hiện của hộp đơn vị ----------
class Struts {
  constructor() { this.m = []; }
  bar(a, b, t = 0.08, t2 = t) {           // thanh từ a tới b, tiết diện t × t2
    const d = new V3().subVectors(b, a), len = d.length();
    const q = new THREE.Quaternion().setFromUnitVectors(new V3(0, 1, 0), d.clone().normalize());
    this.m.push(new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), q, new V3(t, len, t2)));
  }
  box(c, sx, sy, sz) { this.m.push(new THREE.Matrix4().compose(c, new THREE.Quaternion(), new V3(sx, sy, sz))); }
  mesh(mat) {
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat, this.m.length);
    this.m.forEach((m, i) => im.setMatrixAt(i, m));
    im.castShadow = true; im.receiveShadow = true;
    return im;
  }
}
// tháp giàn vuông: 4 cột góc, đai ngang mỗi tầng, giằng chữ X trên 4 mặt
function towerStruts(S, base, H, W, level = 0.78) {
  const h = W / 2, C = [[-h, -h], [h, -h], [h, h], [-h, h]];
  C.forEach(([x, z]) => S.bar(base.clone().add(new V3(x, 0, z)), base.clone().add(new V3(x, H, z)), 0.2));
  for (let y = 0; y <= H + 1e-6; y += level) {
    for (let k = 0; k < 4; k++) {
      const [x0, z0] = C[k], [x1, z1] = C[(k + 1) % 4];
      S.bar(base.clone().add(new V3(x0, y, z0)), base.clone().add(new V3(x1, y, z1)), 0.09);
      if (y + level <= H + 1e-6) {
        S.bar(base.clone().add(new V3(x0, y, z0)), base.clone().add(new V3(x1, y + level, z1)), 0.05);
        S.bar(base.clone().add(new V3(x1, y, z1)), base.clone().add(new V3(x0, y + level, z0)), 0.05);
      }
    }
  }
}
// dầm giàn (tay kẹp): 4 thanh biên + giằng zig-zag hai mặt bên
function trussStruts(S, a, b, hgt = 0.45, wid = 0.4, n = 8) {
  const d = new V3().subVectors(b, a), up = new V3(0, 1, 0), side = new V3().crossVectors(d, up).normalize().multiplyScalar(wid / 2), U = up.clone().multiplyScalar(hgt / 2);
  const corners = [side.clone().add(U), side.clone().sub(U), side.clone().negate().sub(U), side.clone().negate().add(U)];
  corners.forEach(o => S.bar(a.clone().add(o), b.clone().add(o), 0.07));
  for (let i = 0; i < n; i++) {
    const p0 = a.clone().addScaledVector(d, i / n), p1 = a.clone().addScaledVector(d, (i + 1) / n);
    [[0, 1], [3, 2], [0, 3]].forEach(([u, v]) => S.bar(p0.clone().add(corners[i % 2 ? u : v]), p1.clone().add(corners[i % 2 ? v : u]), 0.04));
  }
}

export async function createLaunch(cfg) {
  const container = cfg.container;
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cfg.pixelRatio ?? 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.append(renderer.domElement);
  const scene = new THREE.Scene();
  // sương khí quyển: mỏng ở mặt đất, dày dần khi bay lên (che vân lặp của mặt biển nhìn từ trên cao), tối dần thành vũ trụ
  const HAZE = new THREE.Color(0.6, 0.46, 0.5), SPACE = new THREE.Color(0.012, 0.018, 0.04);
  scene.fog = new THREE.Fog(HAZE.clone(), 300, 4000);
  const camera = new THREE.PerspectiveCamera(cfg.fov ?? 38, 2, 0.1, 30000);
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.5, 0.55, 0.92);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ----- bầu trời hoàng hôn + mặt trời sát chân trời -----
  const sunDir = new V3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - (cfg.sunElev ?? 3.2)), THREE.MathUtils.degToRad(cfg.sunAzim ?? 128));
  // Trời hoàng hôn TỰ VẼ (Sky của three.js cháy trắng một mảng lớn quanh mặt trời ở độ cao 3°): đỉnh xanh
  // chạng vạng → giữa hồng tím → chân trời cam đào, phía mặt trời cam rực + quầng + đĩa mặt trời nhỏ.
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uSun: { value: sunDir.clone() }, uZen: { value: new THREE.Color(0.09, 0.16, 0.36) }, uMid: { value: new THREE.Color(0.46, 0.34, 0.45) },
                uHor: { value: new THREE.Color(0.95, 0.55, 0.36) }, uSunCol: { value: new THREE.Color(1.5, 0.62, 0.22) }, uAway: { value: new THREE.Color(0.48, 0.42, 0.6) }, uFog: { value: new THREE.Color() }, uFogK: { value: 0 } },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix*modelViewMatrix*vec4(position,1.0); gl_Position = p.xyww; }`,
    fragmentShader: `uniform vec3 uSun, uZen, uMid, uHor, uSunCol, uAway, uFog; uniform float uFogK; varying vec3 vDir;
      void main(){ vec3 d = normalize(vDir); float h = d.y;
        float sd = max(dot(d, normalize(uSun)), 0.0);
        float side = dot(normalize(d.xz + 1e-5), normalize(uSun.xz + 1e-5))*0.5 + 0.5;       // 1 = phía mặt trời
        vec3 hor = mix(uAway, uHor, smoothstep(0.1, 0.9, side));
        vec3 c = mix(hor, uMid, smoothstep(0.0, 0.18, h));
        c = mix(c, uZen, smoothstep(0.15, 0.75, h));
        c += uSunCol*pow(sd, 18.0)*0.9 + uSunCol*pow(sd, 3.0)*0.18*(1.0 - smoothstep(0.0, 0.4, h));   // quầng
        c += vec3(3.0, 2.3, 1.5)*smoothstep(0.99955, 0.99975, sd);                                  // đĩa mặt trời
        c = mix(c, hor*0.55, smoothstep(0.0, -0.08, h));                                            // dưới chân trời
        c = mix(c, uFog, uFogK*(1.0 - smoothstep(-0.02, 0.22, h)));                                 // chân trời hoà vào sương
        gl_FragColor = vec4(c, 1.0); }`
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(15000, 48, 24), skyMat);
  sky.renderOrder = -2;
  scene.add(sky);
  const pmrem = new THREE.PMREMGenerator(renderer);
  { const envScene = new THREE.Scene(); envScene.add(new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), skyMat));
    scene.environment = pmrem.fromScene(envScene).texture; scene.environmentIntensity = 0.8; }

  const sun = new THREE.DirectionalLight(0xffb37a, 3.4);
  sun.position.copy(sunDir).multiplyScalar(120);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 40, bottom: -30, near: 1, far: 400 });
  sun.shadow.bias = -0.0004;
  scene.add(sun, sun.target);
  scene.add(new THREE.HemisphereLight(0xb9a6d6, 0x3a3025, 0.9));

  // mây mỏng thấp sát chân trời (ửng hồng)
  const cloudTex = puffTex(), clouds = [];
  for (let i = 0; i < 26; i++) {
    const az = THREE.MathUtils.degToRad(rand(40, 250)), el = THREE.MathUtils.degToRad(rand(1.5, 9));
    const d = rand(4000, 7000);
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, color: new THREE.Color().setHSL(0.03 + rand(-0.02, 0.04), 0.5, rand(0.55, 0.75)), transparent: true, opacity: rand(0.25, 0.55), depthWrite: false, fog: false }));
    m.position.setFromSphericalCoords(d, Math.PI / 2 - el, az);
    m.scale.set(rand(500, 1300), rand(60, 150), 1);
    scene.add(m); clouds.push(m);
  }

  // ----- biển -----
  const water = new Water(new THREE.PlaneGeometry(40000, 40000), {
    textureWidth: 512, textureHeight: 512, waterNormals: waterNormals(), sunDirection: sunDir.clone(),
    sunColor: 0xffc08a, waterColor: 0x0e2a36, distortionScale: 0.4, fog: true, alpha: 1
  });
  water.rotation.x = -Math.PI / 2;
  water.material.uniforms.size.value = 3;
  scene.add(water);

  // ----- đất: đảo phẳng (bãi cỏ khô + cát ven bờ), bờ cỏ tiền cảnh, dải đất xa -----
  function landPatch(w, d, segW, segD, inside, cx = 0, cz = 0) {
    const g = new THREE.PlaneGeometry(w, d, segW, segD); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position, col = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) + cx, z = p.getZ(i) + cz;
      const k = inside(x, z);                               // 1 = đất liền, 0 = dưới nước
      const n = fbm(x * 0.05, z * 0.05);
      p.setY(i, lerp(-1.6, 0.12 + (n - 0.5) * 0.12, smooth(0, 0.25, k)));
      const sand = 1 - smooth(0.25, 0.55, k);
      const grass = new THREE.Color().setRGB(lerp(0.16, 0.34, n), lerp(0.2, 0.3, n), lerp(0.08, 0.14, n));
      grass.lerp(new THREE.Color(0.58, 0.5, 0.36), sand * 0.85);
      col[i * 3] = grass.r; col[i * 3 + 1] = grass.g; col[i * 3 + 2] = grass.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0 }));
    m.position.set(cx, 0, cz); m.receiveShadow = true;
    return m;
  }
  const islandK = (x, z) => 1 - (Math.pow(x / 105, 2) + Math.pow((z + 16) / 30, 2)) + (fbm(x * 0.03, z * 0.03) - 0.5) * 0.35;
  scene.add(landPatch(240, 90, 240, 90, islandK, 0, -16));
  // bờ cỏ tiền cảnh (giữa máy quay và đầm nước, như ảnh chụp từ bờ bên kia)
  const bankK = (x, z) => 1 - Math.pow((z - 27) / 2.6, 2) + (fbm(x * 0.08, z * 0.08) - 0.5) * 0.8;
  scene.add(landPatch(260, 12, 260, 12, bankK, 0, 27));
  // dải đất rất xa sau khu phóng
  scene.add(landPatch(1400, 60, 140, 6, (x, z) => 1 - Math.pow((z + 520) / 22, 2) + (fbm(x * 0.01, 1) - 0.5) * 0.6, 0, -520));

  // bụi cây: tiền cảnh + ven đảo (khối tròn tối)
  {
    const g = new THREE.IcosahedronGeometry(1, 1), mats = [new THREE.MeshStandardMaterial({ color: "#23301c", roughness: 1 }), new THREE.MeshStandardMaterial({ color: "#2d3a22", roughness: 1 })];
    const add = (x, y, z, s) => { const m = new THREE.Mesh(g, mats[Math.random() < 0.5 ? 0 : 1]); m.position.set(x, y, z); m.scale.set(s * rand(1, 1.8), s * rand(0.5, 0.9), s); m.castShadow = true; scene.add(m); };
    for (let i = 0; i < 140; i++) { const x = rand(-90, 90); add(x, 0.18, 27 + rand(-1.2, 1.0), rand(0.12, 0.42)); }
    for (let i = 0; i < 70; i++) { const x = rand(-90, 90); if (Math.abs(x) < 26) continue; add(x, 0.1, rand(8, 13), rand(0.3, 1.0)); }
  }

  // ----- vật liệu công trình -----
  const steel = new THREE.MeshStandardMaterial({ color: "#3b3f45", metalness: 0.65, roughness: 0.55, envMapIntensity: 0.6 });
  const steelLight = new THREE.MeshStandardMaterial({ color: "#8b8f94", metalness: 0.6, roughness: 0.45 });
  const concrete = new THREE.MeshStandardMaterial({ color: "#8e8c86", roughness: 0.92 });
  const whiteTank = new THREE.MeshStandardMaterial({ color: "#d6d8da", metalness: 0.35, roughness: 0.35 });
  const S = new Struts();

  // ----- 2 bệ phóng + 2 tháp -----
  const PAD_X = cfg.padX ?? 8, MOUNT_H = 1.6, TOWER_H = 8.6, TOWER_W = 1.5;
  const sc = cfg.rocketScale ?? 1.1;
  const NOZ = 2.52 * sc;                               // đáy loa phụt → tâm tàu
  const pads = [-PAD_X, PAD_X].map((x, i) => {
    const base = new V3(x, 0.12, 0);
    // sân bê tông + rãnh thoát lửa
    const slab = new THREE.Mesh(new THREE.BoxGeometry(11, 0.3, 11), concrete); slab.position.set(x, 0.1, 0); slab.receiveShadow = true; scene.add(slab);
    // bàn phóng: mặt bàn vuông khoét lỗ tròn + 6 chân
    const topShape = new THREE.Shape(); topShape.moveTo(-1.7, -1.7); topShape.lineTo(1.7, -1.7); topShape.lineTo(1.7, 1.7); topShape.lineTo(-1.7, 1.7); topShape.closePath();
    const hole = new THREE.Path(); hole.absarc(0, 0, 0.75, 0, TAU, true); topShape.holes.push(hole);
    const topG = new THREE.ExtrudeGeometry(topShape, { depth: 0.35, bevelEnabled: false }); topG.rotateX(-Math.PI / 2);
    const top = new THREE.Mesh(topG, steelLight); top.position.set(x, MOUNT_H - 0.35, 0); top.castShadow = top.receiveShadow = true; scene.add(top);
    for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + 0.3; S.bar(new V3(x + Math.cos(a) * 1.35, 0.2, Math.sin(a) * 1.35), new V3(x + Math.cos(a) * 1.25, MOUNT_H - 0.3, Math.sin(a) * 1.25), 0.28); }
    // tháp phía NGOÀI mỗi bệ
    const tx = x + (i === 0 ? -3.3 : 3.3);
    towerStruts(S, new V3(tx, 0.2, 0), TOWER_H, TOWER_W);
    S.box(new V3(tx, TOWER_H + 0.35, 0), TOWER_W + 0.5, 0.25, TOWER_W + 0.5);
    S.bar(new V3(tx, TOWER_H + 0.4, 0), new V3(tx, TOWER_H + 3.2, 0), 0.08);           // cột thu lôi
    // tay kẹp "đũa": 2 dầm giàn ôm hai bên thân tàu + xe trượt
    const armY = MOUNT_H + NOZ + 2.2 * sc, inner = i === 0 ? 1 : -1;
    const from = tx + inner * TOWER_W / 2, to = x + inner * 1.2;
    const arms = new THREE.Group();
    const AS = new Struts();
    [-1.05, 1.05].forEach(z => trussStruts(AS, new V3(0, 0, z * 0.5), new V3(to - from + inner * 0.6, 0, z), 0.42, 0.34, 9));
    AS.box(new V3(0, 0, 0), 0.9, 1.1, 2.4);
    const armMesh = AS.mesh(steel); arms.add(armMesh); arms.position.set(from, armY, 0); scene.add(arms);
    // tay tiếp nhiên liệu (QD)
    trussStruts(S, new V3(from, MOUNT_H + NOZ - 0.4, 0.4), new V3(x + inner * 0.62, MOUNT_H + NOZ - 0.4, 0.4), 0.32, 0.26, 6);
    // đèn đỏ đỉnh tháp
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 0.2, 0.15) }));
    beacon.position.set(tx, TOWER_H + 3.25, 0); scene.add(beacon);
    return { x, base, arms, armOpen: 0, inner, beacon, tx };
  });
  // ống dẫn từ khu bồn tới bệ
  [-PAD_X, PAD_X].forEach(x => { for (let k = 0; k < 3; k++) S.bar(new V3(x * 0.6 - 3 + k * 0.5, 0.35, -14), new V3(x + (x < 0 ? 1.2 : -1.2) + k * 0.2 - 0.2, 0.35, -5.2), 0.22); });

  // ----- khu bồn chứa: bồn nằm ngang (như ảnh), bồn đứng, bồn cầu -----
  {
    // bồn nằm ngang (trục dọc theo x, nhìn NGANG như ảnh Starbase): 2 dãy × 3 bồn, đặt trên giá đỡ
    const capG = new THREE.CapsuleGeometry(0.8, 5.6, 8, 24); capG.rotateZ(Math.PI / 2);
    [[-16, -13], [-8.6, -13], [-1.2, -13], [-16, -15.4], [-8.6, -15.4], [-1.2, -15.4]].forEach(([x, z]) => {
      const m = new THREE.Mesh(capG, whiteTank); m.position.set(x, 1.3, z); m.castShadow = m.receiveShadow = true; scene.add(m);
      [-2.2, 0, 2.2].forEach(dx => S.box(new V3(x + dx, 0.35, z), 0.3, 0.5, 1.3));
    });
    const vG = new THREE.CylinderGeometry(1.3, 1.3, 7, 28), dome = new THREE.SphereGeometry(1.3, 28, 12, 0, TAU, 0, Math.PI / 2);
    [[-26, -12], [-29, -15], [-26, -18], [22, -24]].forEach(([x, z]) => { const m = new THREE.Mesh(vG, whiteTank); m.position.set(x, 3.6, z); const d = new THREE.Mesh(dome, whiteTank); d.position.set(x, 7.1, z); m.castShadow = d.castShadow = true; scene.add(m, d); });
    const sG = new THREE.SphereGeometry(2, 32, 20);
    [[16, -16], [20, -13]].forEach(([x, z]) => { const m = new THREE.Mesh(sG, whiteTank); m.position.set(x, 2.8, z); m.castShadow = true; scene.add(m); for (let k = 0; k < 4; k++) { const a = k / 4 * TAU; S.bar(new V3(x + Math.cos(a) * 1.6, 0.2, z + Math.sin(a) * 1.6), new V3(x + Math.cos(a) * 1.6, 2.4, z + Math.sin(a) * 1.6), 0.18); } });
    // nhà xưởng cao (high bay) + nhà thấp
    const hT = hangarTex();
    const hb = new THREE.Mesh(new THREE.BoxGeometry(9, 17, 7), [steelLight, steelLight, concrete, concrete, new THREE.MeshStandardMaterial({ map: hT, roughness: 0.7, metalness: 0.2 }), steelLight]);
    hb.position.set(34, 8.6, -22); hb.castShadow = hb.receiveShadow = true; scene.add(hb);
    [[-40, -20, 10, 4, 6], [44, -12, 8, 3, 8], [-46, -30, 6, 5, 6], [28, -34, 12, 3.5, 5]].forEach(([x, z, w, h, d]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), concrete); b.position.set(x, h / 2 + 0.1, z); b.castShadow = b.receiveShadow = true; scene.add(b); });
    // cột đèn
    [[-16, 6], [16, 6], [-3, -9], [3, -9]].forEach(([x, z]) => S.bar(new V3(x, 0.1, z), new V3(x, 7, z), 0.12));
  }
  scene.add(S.mesh(steel));

  // ----- 2 tàu của game, đứng trên bệ -----
  const Q_UP = new THREE.Quaternion().setFromUnitVectors(new V3(1, 0, 0), new V3(0, 1, 0));
  const rockets = TEAMS.map((t, i) => {
    const r = makeRocket(t, i, cfg.hull);
    r.rig.scale.setScalar(sc);
    r.rig.position.set(pads[i].x, MOUNT_H + NOZ, 0);
    r.rig.quaternion.copy(Q_UP);
    r.model.traverse(o => { if (o.isMesh) { o.castShadow = true; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { m.fog = false; }); } });   // tàu luôn rõ, không chìm sương
    r.flameGroup.visible = false; r.nozzleGlow.visible = false; r.light.intensity = 0;
    scene.add(r.rig);
    return Object.assign(r, { v: 0, y0: r.rig.position.y, lx: pads[i].x, alt: 0, dist: 0 });
  });

  // ----- hạt: hơi lạnh xả, mây hơi phóng, lửa, khói vệt -----
  const PUFF = puffTex(), CUMULUS = puffTex(true), SOFT = softTex();
  const steam = new Particles(2600, { additive: false, map: PUFF });
  const clouds3 = new Particles(4200, { additive: false, map: CUMULUS });
  const fire = new Particles(2600, { additive: true, map: SOFT });
  scene.add(clouds3.points, steam.points, fire.points);
  const padLight = pads.map(p => { const l = new THREE.PointLight(0xff9a4a, 0, 70, 1.6); l.position.set(p.x, 1.2, 1.5); scene.add(l); return l; });

  // ----- sao (hiện dần khi lên cao) -----
  const starG = new THREE.BufferGeometry(); { const n = 4000, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const v = new V3(rand(-1, 1), rand(-0.2, 1), rand(-1, 1)).normalize().multiplyScalar(9000); a.set([v.x, v.y, v.z], i * 3); } starG.setAttribute("position", new THREE.BufferAttribute(a, 3)); }
  const stars = new THREE.Points(starG, new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false }));
  scene.add(stars);
  // màn "không gian": cầu tối bao máy quay, đục dần theo độ cao (trời hoàng hôn → đen vũ trụ)
  const spaceMat = new THREE.MeshBasicMaterial({ color: SPACE.clone(), side: THREE.BackSide, transparent: true, opacity: 0, depthWrite: false, fog: false });
  const space = new THREE.Mesh(new THREE.SphereGeometry(8500, 32, 16), spaceMat); space.renderOrder = -1; scene.add(space);

  // ----- trạng thái -----
  const G = { phase: "idle", t: 0, tl: 0, shake: 0, handed: false };
  const camBase = { pos: new V3(), look: new V3() };
  const endCam = cfg.endCam || { pos: new V3(0, 3.3, 16.5), look: new V3(0, 0.1, -14) };   // góc đuổi của game (so với tâm 2 tàu)
  const LANES = cfg.lanes || [-2.3, 2.3];
  const T = { ign: 2.3, lift: 3.0, chase: 6.2, pitch0: 8.2, pitch1: 15.5, fade: cfg.fadeAt ?? 16.2 };
  const Q_FWD = new THREE.Quaternion().setFromUnitVectors(new V3(1, 0, 0), new V3(0, 0, -1));

  function idleCam(t) {                         // màn chờ: máy quay trôi chậm dọc bờ bên kia
    const k = (Math.sin(t * 0.06) + 1) / 2;
    return { pos: new V3(lerp(-9, 7, k), 1.9 + Math.sin(t * 0.11) * 0.25, 31), look: new V3(lerp(-2, 2, k), 6.6, 0) };
  }
  function ventVapor(dt) {                       // hơi lạnh xả trắng trượt dọc thân tàu (như ảnh thật)
    rockets.forEach(r => {
      if (Math.random() < dt * 22) {
        const p = r.rig.position.clone().add(new V3(rand(-0.5, 0.5), rand(-1.5, 2.2) * sc, rand(-0.3, 0.6)));
        steam.emit({ pos: p, vel: new V3(rand(-0.3, 0.3), rand(-0.9, -0.2), rand(0, 0.4)), life: rand(1.2, 2.4), size: rand(0.25, 0.5), sizeEnd: rand(1, 1.8),
          color: new THREE.Color(0.95, 0.93, 0.92), colorEnd: new THREE.Color(0.85, 0.84, 0.86), alpha: 0.35, drag: 0.4 });
      }
    });
  }
  const cWarm = new THREE.Color(), cCool = new THREE.Color();
  function padCloud(dt, pad, rate) {             // mây hơi khổng lồ tràn NGANG hai bên bệ, cuộn lên
    let n = rate * dt; while (n > 0) {
      if (n < 1 && Math.random() > n) break; n -= 1;
      const side = Math.random() < 0.5 ? -1 : 1, column = Math.random() < 0.12;     // 12% cuộn lên thành cột (lệch khỏi thân tàu)
      const dir = column ? new V3(rand(-0.3, 0.3), 0, rand(-0.3, 0.3)) : new V3(side * rand(0.55, 1), 0, rand(-0.55, 0.45)).normalize();
      const sp = column ? 1 : rand(3.5, 12);
      const b = rand(0.5, 1.05);
      cWarm.setRGB(1.35 * b, 0.92 * b, 0.6 * b); cCool.setRGB(0.86 * b, 0.82 * b, 0.84 * b);
      clouds3.emit({ pos: new V3(pad.x + (column ? side * rand(1.6, 3) : rand(-0.8, 0.8)), rand(0.5, 1.6), rand(-0.8, 0.8) + (column ? -1.2 : 0)), vel: dir.multiplyScalar(sp).add(new V3(0, column ? rand(4, 8) : rand(0.4, 2.8), 0)),
        life: rand(5, 9), size: rand(2, 3.6), sizeEnd: rand(9, 15), color: cWarm.clone(), colorEnd: cCool.clone(), alpha: rand(0.85, 0.97), drag: rand(0.6, 1.1), rise: column ? 0.1 : rand(0.25, 0.7), rot: rand(-0.45, 0.45) });
    }
  }
  function nozzle(r) { return new V3(-2.5, 0, 0).applyMatrix4(r.ship.matrixWorld); }

  function tick(dt) {
    G.t += dt;
    const t = G.phase === "idle" ? 0 : (G.tl += dt);
    water.material.uniforms.time.value += dt * 0.45;
    pads.forEach((p, i) => { p.beacon.visible = Math.sin(G.t * 3 + i) > 0.2; });
    let cam;
    if (G.phase === "idle") { ventVapor(dt); cam = idleCam(G.t); }
    else {
      // --- đánh lửa → cất cánh → bay ---
      const lit = t >= T.ign;
      rockets.forEach((r, i) => {
        r.flameGroup.visible = r.nozzleGlow.visible = lit;
        const pow = lit ? (t < T.lift ? lerp(0.6, 1.6, (t - T.ign) / (T.lift - T.ign)) : 1.8) * (0.9 + Math.random() * 0.2) : 0;
        r.flameGroup.scale.set(1.35, (1.3 + pow * 1.6) * (0.92 + Math.random() * 0.16), 1.35);
        [r.flameOuter, r.flameInner].forEach(m => { m.material.uniforms.uTime.value = G.t + i; m.material.uniforms.uPow.value = pow * 0.7; });
        r.light.intensity = lit ? 25 * pow : 0;
        if (t >= T.lift) {
          const tt = t - T.lift;
          const acc = tt < 4 ? 2.4 : 9;
          r.v = Math.min(95, r.v + acc * dt);
          // chương trình nghiêng: đứng → nằm ngang theo hướng bay của game (−z), xích về làn của game
          const pk = ease(smooth(T.pitch0, T.pitch1, t));
          const dir = new V3(0, Math.cos(pk * Math.PI / 2), -Math.sin(pk * Math.PI / 2));
          r.rig.position.addScaledVector(dir, r.v * dt);
          const lk = smooth(T.chase, T.pitch1 - 1, t);
          r.rig.position.x = lerp(r.lx, LANES[i], ease(lk)) + Math.sin(G.t * 0.7 + i * 2) * 0.12 * lk;
          r.rig.quaternion.copy(Q_UP).slerp(Q_FWD, pk);
        }
        r.rig.updateMatrixWorld(true);
        // khói vệt + lửa phụt sau khi rời bệ
        if (lit) {
          const nz = nozzle(r);
          const nearPad = r.rig.position.y - r.y0 < 14;
          // vệt khói: rải ĐỀU theo quãng đường bay (mỗi ~0,5 đv một búi) — không thành từng cục rời khi tàu bay nhanh
          if (t >= T.lift && !nearPad && r.lastNz) {
            const seg = nz.distanceTo(r.lastNz), n = Math.min(40, Math.ceil(seg / 0.5)), fa = 1 - smooth(10, 14.5, t);
            for (let k = 0; k < n && fa > 0.02; k++) {
              const p = r.lastNz.clone().lerp(nz, (k + Math.random()) / n);
              steam.emit({ pos: p.add(new V3(rand(-0.25, 0.25), rand(-0.25, 0.25), rand(-0.25, 0.25))), vel: new V3(rand(-0.5, 0.5), rand(-0.5, 0.5), rand(-0.5, 0.5)),
                life: rand(2.2, 3.8), size: rand(0.7, 1.1), sizeEnd: rand(3.5, 5.5), color: new THREE.Color(0.95, 0.8, 0.68), colorEnd: new THREE.Color(0.7, 0.7, 0.74), alpha: 0.32 * fa, drag: 0.8 });
            }
          }
          r.lastNz = nz.clone();
          if (t < T.lift + 1.2 && Math.random() < 0.9) fire.emit({ pos: nz, vel: new V3(1, 0, 0).applyQuaternion(r.rig.quaternion).multiplyScalar(-rand(6, 12)),
            life: rand(0.12, 0.28), size: rand(0.45, 0.8), sizeEnd: 0.15, color: new THREE.Color(3, 2.1, 1.1), colorEnd: new THREE.Color(1.4, 0.35, 0.05), alpha: 0.8, drag: 1 });
        }
      });
      // mây hơi ở chân bệ (mạnh nhất lúc rời bệ, tắt dần)
      pads.forEach((p, i) => {
        const r = rockets[i];
        const hgt = r.rig.position.y - r.y0;
        const rate = t < T.ign ? 0 : 170 * (t < T.lift ? (t - T.ign) / (T.lift - T.ign) : Math.max(0, 1 - hgt / 26));
        padCloud(dt, p, rate);
        // quầng lửa cam rực ở chân bệ (lửa dội xuống rãnh, hắt lên mây)
        if (t >= T.ign && hgt < 12 && Math.random() < dt * 45) fire.emit({ pos: new V3(p.x + rand(-2.5, 2.5), rand(0.4, 1.8), rand(-1.5, 1.5)), vel: new V3(rand(-4, 4), rand(0.5, 2), rand(-1, 1)),
          life: rand(0.3, 0.6), size: rand(2.5, 4.5), sizeEnd: 1, color: new THREE.Color(2.2, 1.1, 0.35), colorEnd: new THREE.Color(0.9, 0.25, 0.04), alpha: 0.5, drag: 2 });
        padLight[i].intensity = t < T.ign ? 0 : 900 * Math.max(0, 1 - hgt / 34) * (0.8 + Math.random() * 0.4) * Math.min(1, (t - T.ign) * 2);
        // tay kẹp mở ra lúc đánh lửa
        p.armOpen = clamp(p.armOpen + (t >= T.ign - 0.4 ? dt * 0.8 : 0), 0, 1);
        p.arms.rotation.y = p.inner * ease(p.armOpen) * 0.7;
      });
      G.shake = t < T.ign ? 0 : Math.max(0, 1 - Math.max(0, t - T.lift) / 5) * 0.9;

      // --- máy quay ---
      const mid = rockets[0].rig.position.clone().add(rockets[1].rig.position).multiplyScalar(0.5);
      if (t < T.chase) {
        // cảnh rộng từ bờ bên kia, đẩy nhẹ vào + ngước lên theo tàu
        const k = ease(clamp(t / T.chase, 0, 1));
        cam = { pos: new V3(lerp(-2, -1, k), lerp(1.9, 1.3, k), lerp(31, 28, k)), look: new V3(0, Math.max(6.6, mid.y * 0.85), 0) };
      } else {
        // ĐUỔI THEO ĐUÔI: bám phía sau-dưới đuôi 2 tàu, xoay dần về đúng góc đuổi của game khi tàu nằm ngang
        const pk = ease(smooth(T.pitch0, T.pitch1, t));
        const fwd = new V3(0, Math.cos(pk * Math.PI / 2), -Math.sin(pk * Math.PI / 2));
        const q = new THREE.Quaternion().setFromUnitVectors(new V3(0, 0, -1), fwd);
        const off = endCam.pos.clone().applyQuaternion(q);                // (0,3.3,16.5) xoay theo hướng bay
        const lookOff = endCam.look.clone().applyQuaternion(q);
        const chasePos = mid.clone().add(off.multiplyScalar(lerp(1.35, 1, pk))), chaseLook = mid.clone().add(lookOff);
        const wide = { pos: new V3(-1, 1.3, 28), look: new V3(0, Math.max(6.6, mid.y * 0.85), 0) };
        const k = ease(smooth(T.chase, T.chase + 2.4, t));
        cam = { pos: wide.pos.lerp(chasePos, k), look: wide.look.lerp(chaseLook, k) };
      }
      // trời tối dần theo độ cao → vũ trụ
      const alt = mid.y;
      const dk = Math.max(smooth(40, 420, alt), smooth(11.5, T.fade, t));
      scene.fog.color.copy(HAZE).lerp(SPACE, dk);
      const fk = smooth(15, 160, alt);
      scene.fog.near = lerp(300, 6, fk); scene.fog.far = lerp(4000, 260, fk);
      skyMat.uniforms.uFog.value.copy(scene.fog.color); skyMat.uniforms.uFogK.value = fk;
      spaceMat.opacity = dk;
      clouds.forEach(c => { c.material.opacity = (c.userData.a0 ??= c.material.opacity) * (1 - smooth(0.1, 0.6, dk)); }); stars.material.opacity = smooth(120, 520, alt);
      renderer.toneMappingExposure = lerp(1.0, 1.1, dk);
      if (!G.handed && t >= T.fade) { G.handed = true; cfg.onHandoff && cfg.onHandoff(); }
    }
    // pha đuổi: bám CỨNG (tàu tăng tốc tới ~95 đv/s — làm mượt kiểu lerp sẽ tụt lại hàng chục đv); cảnh rộng thì êm
    const follow = G.phase === "idle" || G.tl >= T.chase ? 1 : Math.min(1, dt * 4);
    camBase.pos.lerp(cam.pos, follow);
    camBase.look.lerp(cam.look, G.phase === "idle" || G.tl >= T.chase ? 1 : Math.min(1, dt * 5));
    camera.position.copy(camBase.pos);
    if (G.shake > 0) camera.position.add(new V3(rand(-1, 1), rand(-1, 1), 0).multiplyScalar(0.06 * G.shake));
    camera.lookAt(camBase.look);
    space.position.copy(camera.position); stars.position.copy(camera.position);
    steam.update(dt); clouds3.update(dt); fire.update(dt);
    composer.render(dt);
  }

  // ----- khung hình -----
  let W = 0, H = 0;
  function resize() {
    if (!container.clientWidth || !container.clientHeight) return;
    W = container.clientWidth; H = container.clientHeight;
    renderer.setSize(W, H); composer.setSize(W, H);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    const s = (H * renderer.getPixelRatio()) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    steam.mat.uniforms.uScale.value = s; fire.mat.uniforms.uScale.value = s; clouds3.mat.uniforms.uScale.value = s;
  }
  window.addEventListener("resize", resize);
  new ResizeObserver(resize).observe(container);
  resize();
  const c0 = idleCam(0); camBase.pos.copy(c0.pos); camBase.look.copy(c0.look);

  const clock = new THREE.Clock();
  let raf = 0, manual = false, dead = false, fps = 0, fN = 0, fT = 0;
  function frame() {
    if (dead) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, clock.getDelta());
    fN++; fT += dt; if (fT >= 0.5) { fps = Math.round(fN / fT); fN = 0; fT = 0; cfg.onFps && cfg.onFps(fps); }
    if (!manual) tick(dt);
  }
  raf = requestAnimationFrame(frame);

  return {
    start() { if (G.phase !== "idle") return false; G.phase = "launch"; G.tl = 0; return true; },
    get phase() { return G.phase; },
    get t() { return G.tl; },
    T,
    step(n = 1, dt = 1 / 60) { manual = true; for (let i = 0; i < n; i++) tick(dt); },
    resume() { manual = false; clock.getDelta(); },
    stop() { dead = true; cancelAnimationFrame(raf); },
    destroy() { dead = true; cancelAnimationFrame(raf); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); },
    renderer, scene, camera, water, sky, spaceMat, rockets
  };
}
