// =============================================================
// ROCKET RACE 3D — lõi dùng chung cho các BẢN MẪU Fight 3D.
// Một cảnh Three.js toàn màn hình: vũ trụ (tinh vân, sao, hành tinh, mặt trời),
// 2 tên lửa dựng bằng code, lửa/khói/nổ bằng hạt, cổng đích, và BẢNG ĐÁP ÁN
// 3D gắn vào camera (luôn nằm đúng chỗ trên màn dù camera bay).
// Mỗi bản mẫu chỉ khai: đường bay (track), camera, bố cục bảng, hành tinh.
// =============================================================
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

export { THREE };

const V3 = THREE.Vector3;
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutBack = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const rand = (a, b) => a + Math.random() * (b - a);
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

const FONT_UI = '"Exo 2", "Segoe UI", sans-serif';
const FONT_URL = "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/fonts/helvetiker_bold.typeface.json";

export const TEAMS = [
  { name: "TEAM 1", pilot: "🐱", color: new THREE.Color("#3b8cff"), css: "#3b8cff" },
  { name: "TEAM 2", pilot: "🦊", color: new THREE.Color("#ff4757"), css: "#ff4757" }
];

export const SAMPLE_QUESTIONS = [
  { q: "Which planet is closest to the Sun?", a: ["Mercury", "Venus", "Mars", "Earth"] },
  { q: "What do we call a shooting star?", a: ["Meteor", "Comet", "Planet", "Asteroid"] },
  { q: "The Sun is a …", a: ["Star", "Moon", "Galaxy", "Comet"] },
  { q: "Who was the first person on the Moon?", a: ["Armstrong", "Gagarin", "Newton", "Einstein"] },
  { q: "Which planet has beautiful rings?", a: ["Saturn", "Jupiter", "Neptune", "Mars"] },
  { q: "A vehicle that travels in space is a …", a: ["Rocket", "Truck", "Boat", "Train"] },
  { q: "Our galaxy is called the …", a: ["Milky Way", "Big Dipper", "Orion", "Andromeda"] },
  { q: "The red planet is …", a: ["Mars", "Venus", "Pluto", "Mercury"] },
  { q: "An astronaut wears a …", a: ["Spacesuit", "Raincoat", "Swimsuit", "Pyjamas"] },
  { q: "The Moon goes around the …", a: ["Earth", "Sun", "Mars", "Jupiter"] }
];

// ---------- GLSL: nhiễu 3D + fbm (dùng cho tinh vân, hành tinh, lửa, quả cầu nổ) ----------
const GLSL_NOISE = `
float hash3(vec3 p){ p = fract(p*0.3183099 + 0.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float noise3(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f*f*(3.0-2.0*f);
  return mix(mix(mix(hash3(i+vec3(0,0,0)),hash3(i+vec3(1,0,0)),f.x), mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x), mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec3 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++){ s += a*noise3(p); p = p*2.03 + vec3(1.7,9.2,3.1); a *= 0.5; } return s; }
`;

// ---------- canvas helpers ----------
function canvasTex(canvas) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
function radialTex(stops, size = 128) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  const g = c.getContext("2d");
  const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => gr.addColorStop(o, col));
  g.fillStyle = gr; g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); return t;
}
function smokeTex() {
  const s = 128, c = document.createElement("canvas"); c.width = c.height = s;
  const g = c.getContext("2d");
  for (let i = 0; i < 18; i++) {
    const x = s / 2 + rand(-22, 22), y = s / 2 + rand(-22, 22), r = rand(18, 40);
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, "rgba(255,255,255,0.22)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, s, s);
  }
  return new THREE.CanvasTexture(c);
}

// Chữ lên canvas: co cỡ chữ tới khi VỪA, chỉ xuống dòng ở DẤU CÁCH (không bao giờ bẻ giữa một từ).
function fitLines(ctx, text, maxW, maxH, maxPx, minPx, maxLines, weight, family) {
  const words = String(text).split(/\s+/).filter(Boolean);
  for (let px = maxPx; px >= minPx; px -= 2) {
    ctx.font = `${weight} ${px}px ${family}`;
    if (words.some(w => ctx.measureText(w).width > maxW)) continue;
    const lines = []; let cur = "";
    for (const w of words) {
      const t = cur ? cur + " " + w : w;
      if (ctx.measureText(t).width <= maxW) cur = t; else { lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur);
    if (lines.length <= maxLines && lines.length * px * 1.12 <= maxH) return { px, lines };
  }
  ctx.font = `${weight} ${minPx}px ${family}`;
  return { px: minPx, lines: [words.join(" ")] };
}
function drawTextCanvas(canvas, text, o = {}) {
  const g = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  g.clearRect(0, 0, W, H);
  const { px, lines } = fitLines(g, text, W * (o.padX ?? 0.88), H * (o.padY ?? 0.86),
    o.maxPx ?? Math.floor(H * 0.62), o.minPx ?? 18, o.lines ?? 2, o.weight ?? 800, o.family ?? FONT_UI);
  g.font = `${o.weight ?? 800} ${px}px ${o.family ?? FONT_UI}`;
  g.textAlign = o.align ?? "center"; g.textBaseline = "middle";
  const x = o.align === "left" ? W * 0.06 : W / 2;
  const lh = px * 1.12, y0 = H / 2 - (lines.length - 1) * lh / 2 + px * 0.04;
  lines.forEach((ln, i) => {
    if (o.shadow !== false) { g.shadowColor = "rgba(0,0,0,0.65)"; g.shadowBlur = px * 0.18; g.shadowOffsetY = px * 0.06; }
    g.fillStyle = o.color ?? "#ffffff";
    g.fillText(ln, x, y0 + i * lh);
  });
}

function roundRectPath(p, w, h, r) {
  const x = -w / 2, y = -h / 2;
  p.moveTo(x + r, y); p.lineTo(x + w - r, y); p.quadraticCurveTo(x + w, y, x + w, y + r);
  p.lineTo(x + w, y + h - r); p.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  p.lineTo(x + r, y + h); p.quadraticCurveTo(x, y + h, x, y + h - r);
  p.lineTo(x, y + r); p.quadraticCurveTo(x, y, x + r, y);
  return p;
}
function frameGeo(w, h, r, t) {
  const s = roundRectPath(new THREE.Shape(), w, h, r);
  s.holes.push(roundRectPath(new THREE.Path(), w - 2 * t, h - 2 * t, Math.max(0.001, r - t)));
  return new THREE.ShapeGeometry(s, 12);
}

// =============================================================
// Hạt (lửa / tia lửa / khói) — một hệ Points, cập nhật trên CPU
// =============================================================
class Particles {
  constructor(max, { additive, map }) {
    this.max = max; this.idx = 0;
    this.pos = new Float32Array(max * 3); this.col = new Float32Array(max * 3);
    this.size = new Float32Array(max); this.alpha = new Float32Array(max);
    this.vel = new Float32Array(max * 3); this.life = new Float32Array(max); this.maxLife = new Float32Array(max);
    this.s0 = new Float32Array(max); this.s1 = new Float32Array(max);
    this.c0 = new Float32Array(max * 3); this.c1 = new Float32Array(max * 3);
    this.a0 = new Float32Array(max); this.drag = new Float32Array(max);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute("aColor", new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute("aSize", new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute("aAlpha", new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage));
    this.mat = new THREE.ShaderMaterial({
      uniforms: { uMap: { value: map }, uScale: { value: 800 }, uNear: { value: new THREE.Vector2(3, 11) } },
      vertexShader: `attribute vec3 aColor; attribute float aSize; attribute float aAlpha;
        uniform float uScale; uniform vec2 uNear; varying vec3 vC; varying float vA;
        void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); gl_Position = projectionMatrix*mv;
          gl_PointSize = aSize*uScale/max(0.1,-mv.z); vC = aColor; vA = aAlpha*smoothstep(uNear.x, uNear.y, -mv.z); }`,
      fragmentShader: `uniform sampler2D uMap; varying vec3 vC; varying float vA;
        void main(){ vec4 t = texture2D(uMap, gl_PointCoord); if (vA <= 0.001) discard; gl_FragColor = vec4(vC*t.rgb, t.a*vA); }`,
      transparent: true, depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending
    });
    this.points = new THREE.Points(geo, this.mat);
    this.points.frustumCulled = false;
    this.geo = geo;
  }
  emit(p) {
    const i = this.idx; this.idx = (this.idx + 1) % this.max;
    const i3 = i * 3;
    this.pos[i3] = p.pos.x; this.pos[i3 + 1] = p.pos.y; this.pos[i3 + 2] = p.pos.z;
    this.vel[i3] = p.vel ? p.vel.x : 0; this.vel[i3 + 1] = p.vel ? p.vel.y : 0; this.vel[i3 + 2] = p.vel ? p.vel.z : 0;
    this.life[i] = this.maxLife[i] = p.life;
    this.s0[i] = p.size; this.s1[i] = p.sizeEnd ?? p.size;
    const c0 = p.color, c1 = p.colorEnd || p.color;
    this.c0[i3] = c0.r; this.c0[i3 + 1] = c0.g; this.c0[i3 + 2] = c0.b;
    this.c1[i3] = c1.r; this.c1[i3 + 1] = c1.g; this.c1[i3 + 2] = c1.b;
    this.a0[i] = p.alpha ?? 1; this.drag[i] = p.drag ?? 0;
  }
  update(dt) {
    for (let i = 0; i < this.max; i++) {
      if (this.life[i] <= 0) { if (this.alpha[i] !== 0) { this.alpha[i] = 0; this.size[i] = 0; } continue; }
      this.life[i] -= dt;
      const i3 = i * 3, k = 1 - clamp(this.life[i] / this.maxLife[i], 0, 1);
      const d = Math.max(0, 1 - this.drag[i] * dt);
      this.vel[i3] *= d; this.vel[i3 + 1] *= d; this.vel[i3 + 2] *= d;
      this.pos[i3] += this.vel[i3] * dt; this.pos[i3 + 1] += this.vel[i3 + 1] * dt; this.pos[i3 + 2] += this.vel[i3 + 2] * dt;
      this.size[i] = lerp(this.s0[i], this.s1[i], k);
      this.col[i3] = lerp(this.c0[i3], this.c1[i3], k); this.col[i3 + 1] = lerp(this.c0[i3 + 1], this.c1[i3 + 1], k); this.col[i3 + 2] = lerp(this.c0[i3 + 2], this.c1[i3 + 2], k);
      this.alpha[i] = this.a0[i] * (k < 0.12 ? k / 0.12 : 1 - (k - 0.12) / 0.88);
      if (this.life[i] <= 0) { this.alpha[i] = 0; this.size[i] = 0; }
    }
    const a = this.geo.attributes;
    a.position.needsUpdate = a.aColor.needsUpdate = a.aSize.needsUpdate = a.aAlpha.needsUpdate = true;
  }
}

// =============================================================
// MÔI TRƯỜNG: tinh vân + sao + hành tinh + mặt trời
// =============================================================
function makeNebula(o) {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uC1: { value: new THREE.Color(o.c1) }, uC2: { value: new THREE.Color(o.c2) }, uC3: { value: new THREE.Color(o.c3) }, uBright: { value: o.bright ?? 1 } },
    vertexShader: `varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: GLSL_NOISE + `varying vec3 vDir; uniform float uTime, uBright; uniform vec3 uC1, uC2, uC3;
      void main(){ vec3 d = normalize(vDir);
        float band = exp(-pow(d.y*2.4 - 0.35*sin(d.x*2.7 + d.z*1.3), 2.0)*2.2);
        float n = fbm(d*2.1 + vec3(0.0, 0.0, uTime*0.003));
        float n2 = fbm(d*4.3 + n*1.8);
        float dust = fbm(d*9.0 + 4.0);
        vec3 col = mix(uC1, uC2, smoothstep(0.3, 0.85, n2)) * pow(n2, 2.4) * 1.5;
        col += uC3 * pow(n, 3.0) * band * 1.6;
        col *= (0.35 + band*0.9);
        col *= mix(1.0, 0.35, smoothstep(0.55, 0.8, dust) * band);   // dải bụi tối cắt ngang
        gl_FragColor = vec4(col * uBright, 1.0); }`
  });
  return new THREE.Mesh(new THREE.SphereGeometry(1500, 64, 32), mat);
}

function makeStars(count = 7000) {
  const pos = new Float32Array(count * 3), col = new Float32Array(count * 3), size = new Float32Array(count), ph = new Float32Array(count);
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const u = Math.random() * 2 - 1, t = Math.random() * TAU, r = rand(900, 1300), s = Math.sqrt(1 - u * u);
    // dày hơn ở dải Ngân Hà
    let y = u; if (Math.random() < 0.45) y = (Math.random() - 0.5) * 0.35;
    const ss = Math.sqrt(1 - y * y);
    pos[i * 3] = Math.cos(t) * ss * r; pos[i * 3 + 1] = y * r; pos[i * 3 + 2] = Math.sin(t) * ss * r;
    const temp = Math.random();
    c.setHSL(temp < 0.2 ? 0.08 : temp < 0.5 ? 0.6 : 0.62, temp < 0.5 ? 0.6 : 0.15, 0.8);
    const b = Math.random() < 0.03 ? rand(2.2, 4) : rand(0.35, 1.2);
    col[i * 3] = c.r * b; col[i * 3 + 1] = c.g * b; col[i * 3 + 2] = c.b * b;
    size[i] = b > 2 ? rand(3, 5) : rand(1, 2.4); ph[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  geo.setAttribute("aPhase", new THREE.BufferAttribute(ph, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPR: { value: 1 } },
    vertexShader: `attribute vec3 aColor; attribute float aSize; attribute float aPhase; uniform float uTime, uPR; varying vec3 vC;
      void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); gl_Position = projectionMatrix*mv;
        float tw = 0.7 + 0.3*sin(uTime*(0.8 + aPhase*2.5) + aPhase*40.0);
        gl_PointSize = aSize*uPR; vC = aColor*tw; }`,
    fragmentShader: `varying vec3 vC; void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(vC*a*a, 1.0); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false;
  return pts;
}

function makePlanet(o, sunDir) {
  const g = new THREE.Group();
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uSun: { value: sunDir.clone() }, uTime: { value: 0 }, uType: { value: o.type === "ice" ? 1 : o.type === "lava" ? 2 : 0 },
      uA: { value: new THREE.Color(o.a) }, uB: { value: new THREE.Color(o.b) }, uC: { value: new THREE.Color(o.c) },
      uAtmo: { value: new THREE.Color(o.atmo) }
    },
    vertexShader: `varying vec3 vP; varying vec3 vWN; varying vec3 vWP;
      void main(){ vP = position; vWN = normalize(mat3(modelMatrix)*normal); vec4 wp = modelMatrix*vec4(position,1.0); vWP = wp.xyz; gl_Position = projectionMatrix*viewMatrix*wp; }`,
    fragmentShader: GLSL_NOISE + `varying vec3 vP; varying vec3 vWN; varying vec3 vWP;
      uniform vec3 uSun, uA, uB, uC, uAtmo; uniform float uTime, uType;
      void main(){ vec3 p = normalize(vP); vec3 col;
        if (uType < 0.5) {
          float t = p.y*5.0 + fbm(p*2.6 + vec3(uTime*0.01, 0.0, 0.0))*1.8;
          float b = 0.5 + 0.5*sin(t*3.1); float b2 = 0.5 + 0.5*sin(t*7.7 + 1.3);
          col = mix(uA, uB, b); col = mix(col, uC, b2*0.35);
          float s = smoothstep(0.22, 0.0, length(vec2(atan(p.z, p.x) - 0.9, (p.y + 0.28)*2.6)));
          col = mix(col, uC*1.15, s*0.85);
        } else if (uType < 1.5) {
          float n = fbm(p*2.4);
          col = mix(uA, uB, smoothstep(0.42, 0.6, n));
          col = mix(col, uC, smoothstep(0.62, 0.7, n));
          float cl = fbm(p*4.5 + vec3(uTime*0.015, 0.0, uTime*0.006));
          col = mix(col, vec3(0.95), smoothstep(0.52, 0.75, cl)*0.9);
          col = mix(col, vec3(0.92, 0.96, 1.0), smoothstep(0.78, 0.92, abs(p.y)));
        } else {
          float n = fbm(p*3.0);
          col = mix(uA, uB, smoothstep(0.35, 0.65, n));
          col += uC*pow(smoothstep(0.55, 0.62, fbm(p*6.0 + 2.0)), 2.0)*2.5;
        }
        vec3 N = normalize(vWN);
        float ndl = dot(N, uSun);
        float light = smoothstep(-0.12, 0.65, ndl);
        vec3 V = normalize(cameraPosition - vWP);
        float rim = pow(1.0 - max(dot(N, V), 0.0), 2.6);
        vec3 outc = col*light*1.15 + uAtmo*rim*smoothstep(-0.35, 0.4, ndl)*1.6;
        gl_FragColor = vec4(outc, 1.0); }`
  });
  const body = new THREE.Mesh(new THREE.SphereGeometry(o.radius, 128, 64), mat);
  body.rotation.z = o.tilt ?? 0.25;
  g.add(body);
  // khí quyển phát sáng
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(o.radius * 1.07, 96, 48), new THREE.ShaderMaterial({
    side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uSun: { value: sunDir.clone() }, uAtmo: { value: new THREE.Color(o.atmo) }, uPow: { value: o.atmoPow ?? 1.4 } },
    vertexShader: `varying vec3 vN; varying vec3 vWN; void main(){ vN = normalize(normalMatrix*normal); vWN = normalize(mat3(modelMatrix)*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `varying vec3 vN; varying vec3 vWN; uniform vec3 uSun, uAtmo; uniform float uPow;
      void main(){ float i = pow(clamp(0.72 + dot(vN, vec3(0.0,0.0,1.0)), 0.0, 1.0), 5.0);
        float lit = smoothstep(-0.45, 0.5, dot(vWN, uSun));
        gl_FragColor = vec4(uAtmo*i*lit*uPow, 1.0); }`
  }));
  g.add(atmo);
  if (o.rings) {
    const inner = o.radius * 1.35, outer = o.radius * 2.3;
    const rg = new THREE.RingGeometry(inner, outer, 256, 1);
    const rm = new THREE.ShaderMaterial({
      side: THREE.DoubleSide, transparent: true, depthWrite: false,
      uniforms: { uIn: { value: inner }, uOut: { value: outer }, uCol: { value: new THREE.Color(o.ringColor ?? "#d8c3a0") }, uSun: { value: sunDir.clone() } },
      vertexShader: `varying vec3 vP; varying vec3 vW; void main(){ vP = position; vW = (modelMatrix*vec4(position,1.0)).xyz; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: GLSL_NOISE + `varying vec3 vP; varying vec3 vW; uniform float uIn, uOut; uniform vec3 uCol, uSun;
        void main(){ float r = (length(vP.xy) - uIn)/(uOut - uIn);
          float bands = fbm(vec3(r*38.0, 0.0, 0.0))*0.8 + 0.2*sin(r*260.0);
          float a = smoothstep(0.0, 0.04, r)*smoothstep(1.0, 0.9, r)*clamp(bands, 0.0, 1.0);
          a *= 1.0 - 0.75*smoothstep(0.42, 0.46, r)*smoothstep(0.52, 0.48, r);   // khe Cassini
          gl_FragColor = vec4(uCol*(0.55 + bands*0.7), a*0.8); }`
    });
    const ring = new THREE.Mesh(rg, rm);
    ring.rotation.x = -Math.PI / 2 + (o.ringTilt ?? 0.35);
    ring.rotation.y = 0.2;
    g.add(ring);
  }
  g.position.copy(o.pos);
  g.userData.mat = mat;
  return g;
}

function makeSun(pos, scale = 220) {
  const g = new THREE.Group();
  const core = new THREE.Sprite(new THREE.SpriteMaterial({
    map: radialTex([[0, "rgba(255,255,255,1)"], [0.12, "rgba(255,250,235,1)"], [0.3, "rgba(255,210,150,0.45)"], [0.6, "rgba(255,150,90,0.12)"], [1, "rgba(255,120,60,0)"]], 256),
    color: new THREE.Color(6, 5.2, 4.4), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true
  }));
  core.scale.set(scale, scale, 1);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: radialTex([[0, "rgba(255,200,150,0.35)"], [0.5, "rgba(255,140,90,0.08)"], [1, "rgba(0,0,0,0)"]], 256),
    color: new THREE.Color(1.4, 1.1, 0.9), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true
  }));
  halo.scale.set(scale * 4, scale * 4, 1);
  g.add(halo, core); g.position.copy(pos);
  return g;
}

// =============================================================
// TÊN LỬA — dựng bằng code, mũi hướng +X
// =============================================================
function lathe(points, segs = 64) { return new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), segs); }

function makeRocket(team, idx, H = {}) {
  const rig = new THREE.Group();        // vị trí + hướng bay
  const ship = new THREE.Group();       // nhấp nhô, lắc, xoay
  rig.add(ship);
  const model = new THREE.Group();      // mô hình dựng dọc trục +Y, xoay về +X
  model.rotation.z = -Math.PI / 2;
  ship.add(model);

  const hullMat = new THREE.MeshPhysicalMaterial({ color: H.color ?? "#e8edf3", metalness: H.metalness ?? 0.6, roughness: H.roughness ?? 0.26, clearcoat: H.clearcoat ?? 1, clearcoatRoughness: 0.12, envMapIntensity: H.env ?? 1 });
  const teamMat = new THREE.MeshPhysicalMaterial({ color: team.color, metalness: 0.45, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1, emissive: team.color, emissiveIntensity: 0.12 });
  const darkMat = new THREE.MeshStandardMaterial({ color: "#2a2f38", metalness: 0.9, roughness: 0.35 });

  // thân: đuôi → hông → mũi (ogive)
  // ogive liền mạch: thân trắng tới y=1.1, phần mũi màu đội từ 1.1 → 2.25
  const ogive = y => Math.max(0.001, 0.58 * Math.pow(Math.max(0, 1 - Math.pow((y - 0.5) / 1.75, 2)), 0.62));
  const body = [[0.001, -1.9], [0.42, -1.9], [0.5, -1.6], [0.56, -1.2], [0.58, -0.6], [0.58, 0.5]];
  for (let i = 1; i <= 8; i++) { const y = 0.5 + i / 8 * 0.6; body.push([ogive(y), y]); }
  const hull = new THREE.Mesh(lathe(body), hullMat);
  const nosePts = [];
  for (let i = 0; i <= 16; i++) { const y = 1.1 + i / 16 * 1.15; nosePts.push([ogive(y), y]); }
  const nose = new THREE.Mesh(lathe(nosePts), teamMat);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.585, 0.585, 0.26, 64, 1, true), teamMat);
  band.position.y = -0.95;
  const band2 = new THREE.Mesh(new THREE.CylinderGeometry(0.585, 0.585, 0.06, 64, 1, true), darkMat);
  band2.position.y = 0.55;
  const nozzle = new THREE.Mesh(lathe([[0.26, -1.9], [0.3, -2.05], [0.4, -2.35], [0.46, -2.5], [0.43, -2.52], [0.36, -2.36], [0.24, -2.05]], 48), darkMat);
  const nozzleGlow = new THREE.Mesh(new THREE.CircleGeometry(0.34, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 1.6, 0.6), side: THREE.DoubleSide }));
  nozzleGlow.rotation.x = Math.PI / 2; nozzleGlow.position.y = -2.3;
  model.add(hull, nose, band, band2, nozzle, nozzleGlow);

  // cánh: 4 cánh vuốt
  const fs = new THREE.Shape();
  fs.moveTo(0, 0); fs.lineTo(0.62, -0.55); fs.lineTo(0.66, -1.05); fs.lineTo(0.0, -0.8); fs.closePath();
  const finGeo = new THREE.ExtrudeGeometry(fs, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 3 });
  finGeo.translate(0, 0, -0.035);
  for (let k = 0; k < 4; k++) {
    const f = new THREE.Mesh(finGeo, teamMat);
    const a = k * Math.PI / 2 + Math.PI / 4;
    f.position.set(Math.cos(a) * 0.5, -1.0, Math.sin(a) * 0.5);
    f.rotation.y = -a;
    model.add(f);
  }

  // cửa sổ + phi công (phía +Z của mô hình = phía camera ở góc nhìn ngang)
  const ringM = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.045, 16, 48), darkMat);
  ringM.position.set(0, 0.75, 0.56);
  const pc = document.createElement("canvas"); pc.width = pc.height = 128;
  const pg = pc.getContext("2d");
  const grd = pg.createRadialGradient(64, 64, 10, 64, 64, 64); grd.addColorStop(0, "#1c2a44"); grd.addColorStop(1, "#070b14");
  pg.fillStyle = grd; pg.beginPath(); pg.arc(64, 64, 64, 0, TAU); pg.fill();
  pg.font = '84px "Segoe UI Emoji","Apple Color Emoji",sans-serif'; pg.textAlign = "center"; pg.textBaseline = "middle"; pg.fillText(team.pilot, 64, 72);
  const pilot = new THREE.Mesh(new THREE.CircleGeometry(0.22, 32), new THREE.MeshBasicMaterial({ map: canvasTex(pc) }));
  pilot.position.set(0, 0.75, 0.545);
  const glass = new THREE.Mesh(new THREE.SphereGeometry(0.235, 32, 16, 0, TAU, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: "#aee3ff", metalness: 0, roughness: 0.03, transparent: true, opacity: 0.28, clearcoat: 1, envMapIntensity: 2.5 }));
  glass.rotation.x = Math.PI / 2; glass.scale.z = 0.35; glass.position.set(0, 0.75, 0.55);
  model.add(pilot, glass, ringM);

  // số đội sơn trên thân (mặt +Z)
  const nc = document.createElement("canvas"); nc.width = 256; nc.height = 256;
  const ng = nc.getContext("2d"); ng.font = `900 200px ${FONT_UI}`; ng.textAlign = "center"; ng.textBaseline = "middle";
  ng.fillStyle = team.css; ng.fillText(String(idx + 1), 128, 138);
  const numMat = new THREE.MeshStandardMaterial({ map: canvasTex(nc), transparent: true, metalness: 0.3, roughness: 0.4 });
  const numGeo = new THREE.CylinderGeometry(0.586, 0.586, 0.62, 32, 1, true, -0.55, 1.1);
  const num = new THREE.Mesh(numGeo, numMat);
  num.position.y = -0.25; num.rotation.y = Math.PI / 2 - Math.PI / 2;   // mở góc quanh +Z
  model.add(num);
  const num2 = num.clone(); num2.rotation.y = Math.PI; model.add(num2);  // mặt bên kia

  // lửa: 2 nón chồng (lõi trắng + vỏ cam), shader nhiễu cuộn
  const flameMat = (core, outer, pow) => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 }, uPow: { value: 1 }, uCore: { value: new THREE.Color(...core) }, uCol: { value: new THREE.Color(...outer) }, uK: { value: pow } },
    vertexShader: `varying vec2 vUv; varying vec3 vN; void main(){ vUv = uv; vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: GLSL_NOISE + `varying vec2 vUv; varying vec3 vN; uniform float uTime, uPow, uK; uniform vec3 uCore, uCol;
      void main(){ float y = clamp(1.0 - vUv.y, 0.0, 1.0);    // 1 ở miệng loa, 0 ở đầu lửa (kẹp: pow số âm = NaN)
        float n = noise3(vec3(vUv.x*8.0, vUv.y*5.0 + uTime*14.0, uTime*2.0));
        float edge = pow(abs(vN.z), 0.8);
        float a = pow(y, uK)*(0.55 + 0.7*n)*edge;
        vec3 c = mix(uCol, uCore, pow(y, 2.5));
        gl_FragColor = vec4(c*a*uPow, a); }`
  });
  const flameGroup = new THREE.Group();
  flameGroup.position.y = -2.45;
  // ConeGeometry: đỉnh +Y. Lật (rotateX PI) rồi dời xuống nửa chiều cao ⇒ đáy ở gốc (miệng loa), đỉnh ra sau (-Y).
  const outerGeo = new THREE.ConeGeometry(0.42, 2.6, 32, 8, true); outerGeo.rotateX(Math.PI); outerGeo.translate(0, -1.3, 0);
  const flameOuter = new THREE.Mesh(outerGeo, flameMat([4, 3.2, 2], [3.2, 0.9, 0.2], 1.4));
  const innerGeo = new THREE.ConeGeometry(0.22, 1.5, 32, 6, true); innerGeo.rotateX(Math.PI); innerGeo.translate(0, -0.75, 0);
  const flameInner = new THREE.Mesh(innerGeo, flameMat([6, 6, 6], [3, 2.6, 1.8], 1.0));
  flameGroup.add(flameOuter, flameInner);
  model.add(flameGroup);

  const light = new THREE.PointLight(0xff8a3d, 12, 9, 2);
  light.position.set(-2.9, 0, 0);
  ship.add(light);

  // khiên sáng khi turbo (vỏ trong suốt)
  const shield = new THREE.Mesh(new THREE.SphereGeometry(1.7, 32, 16), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uCol: { value: new THREE.Color(0.12, 0.5, 1.1) }, uA: { value: 0 } },
    vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `varying vec3 vN; uniform vec3 uCol; uniform float uA; void main(){ float f = pow(1.0 - abs(vN.z), 4.0); gl_FragColor = vec4(uCol*f*uA, f*uA); }`
  }));
  shield.scale.set(1.9, 0.75, 0.75); shield.position.x = 0.1;
  ship.add(shield);

  const mats = [hullMat, teamMat];
  const base = mats.map(m => ({ color: m.color.clone(), rough: m.roughness, metal: m.metalness }));
  return {
    team, idx, rig, ship, model, hullMat, teamMat, mats, base, flameGroup, flameOuter, flameInner, light, shield, nozzleGlow,
    // trạng thái chuyển động
    p: 0, vis: 0, thrust: 1, boost: 0, stall: 0, turbo: 0, dmg: 0, wreck: false, exploding: 0, hidden: false,
    homeRun: false, wob: Math.random() * TAU, sparkT: 0, smokeT: 0
  };
}

function setDamageLook(r) {
  const k = r.wreck ? 1 : [0, 0.25, 0.5, 0.75][r.dmg] || 0;
  r.mats.forEach((m, i) => {
    const b = r.base[i];
    m.color.copy(b.color).lerp(new THREE.Color("#1a1512"), k * 0.85);
    m.roughness = lerp(b.rough, 0.95, k);
    m.metalness = lerp(b.metal, 0.2, k);
  });
  r.teamMat.emissiveIntensity = r.wreck ? 0 : 0.12;
}

// =============================================================
// CỔNG ĐÍCH
// =============================================================
function makeGate(radius) {
  const g = new THREE.Group();
  const metal = new THREE.MeshPhysicalMaterial({ color: "#9aa4b5", metalness: 1, roughness: 0.25, clearcoat: 1 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, radius * 0.07, 24, 128), metal);
  const glowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.2, 3.2, 3.6) });
  const glow = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.93, radius * 0.018, 12, 128), glowMat);
  const glow2 = new THREE.Mesh(new THREE.TorusGeometry(radius * 1.07, radius * 0.012, 12, 128), glowMat);
  g.add(ring, glow, glow2);
  // 12 đèn định vị
  const lampMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 3, 1.2) });
  const lamps = [];
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * TAU;
    const l = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.045, 12, 8), lampMat.clone());
    l.position.set(Math.cos(a) * radius, Math.sin(a) * radius, radius * 0.08);
    g.add(l); lamps.push(l);
  }
  // màng năng lượng
  const film = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.92, 96), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 }, uFlash: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: GLSL_NOISE + `varying vec2 vUv; uniform float uTime, uFlash;
      void main(){ vec2 c = vUv - 0.5; float r = length(c)*2.0;
        float n = fbm(vec3(c*4.0, uTime*0.3));
        float rings = 0.5 + 0.5*sin(r*28.0 - uTime*3.0);
        float a = (0.05 + 0.1*n*rings)*smoothstep(1.0, 0.6, r) + uFlash*(1.0 - r)*0.9;
        gl_FragColor = vec4(vec3(0.4, 1.4, 1.8)*a*2.0, a); }`
  }));
  g.add(film);
  g.userData = { lamps, film, glowMat };
  return g;
}

// =============================================================
// CHỮ 3D (banner)
// =============================================================
let fontPromise = null;
function loadFont() { if (!fontPromise) fontPromise = new Promise((res, rej) => new FontLoader().load(FONT_URL, res, undefined, rej)); return fontPromise; }

// =============================================================
// createRace(config) — dựng cả trận
// =============================================================
export async function createRace(cfg) {
  const container = cfg.container;
  await Promise.all([document.fonts.load(`800 60px "Exo 2"`), document.fonts.load(`900 60px "Exo 2"`)]).catch(() => {});
  const font = await loadFont().catch(() => null);

  // ----- renderer + hậu kỳ -----
  // ?debug: giữ khung hình đã vẽ để công cụ chụp màn hình đọc được (chỉ dùng khi kiểm thử)
  const debug = /[?&]debug/.test(location.search);
  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance", preserveDrawingBuffer: debug });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = cfg.exposure ?? 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.append(renderer.domElement);
  renderer.domElement.style.touchAction = "none";

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.45;

  const camera = new THREE.PerspectiveCamera(cfg.fov ?? 40, 16 / 9, 0.1, 4000);
  scene.add(camera);

  let quality = new URLSearchParams(location.search).get("q") || cfg.quality || "ultra";
  // bề rộng vật lý của màn (cm) — mặc định TOMKO 86" 16:9; đổi bằng ?cm=
  const SCREEN_CM = +new URLSearchParams(location.search).get("cm") || cfg.screenCm || 190.4;
  // Quy theo bề rộng CỬA SỔ (trên TOMKO game chạy toàn màn ⇒ = bề rộng màn); cửa sổ nhỏ hơn thì là bản thu nhỏ đúng tỉ lệ.
  const pxPerCm = () => window.innerWidth / SCREEN_CM;
  const Q = { ultra: { pr: 2, samples: 4, bloom: true }, high: { pr: 1.25, samples: 4, bloom: true }, low: { pr: 1, samples: 0, bloom: false } };
  const rt = new THREE.WebGLRenderTarget(16, 16, { type: THREE.HalfFloatType, samples: Q[quality].samples });
  const composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  // ⛔ Một điểm ảnh NaN/Inf (vd. pow số âm trong shader) bị bloom làm nhoè thành MẢNG ĐEN to —
  // gột sạch trước khi vào bloom.
  composer.addPass(new ShaderPass({
    uniforms: { tDiffuse: { value: null } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `uniform sampler2D tDiffuse; varying vec2 vUv;
      void main(){ vec4 c = texture2D(tDiffuse, vUv);
        if (any(isnan(c.rgb)) || any(isinf(c.rgb))) c = vec4(0.0);
        gl_FragColor = vec4(clamp(c.rgb, 0.0, 64.0), 1.0); }`
  }));
  const bloom = new UnrealBloomPass(new THREE.Vector2(16, 16), cfg.bloom ?? 0.85, 0.65, 1.05);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const grade = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uGrain: { value: 1 }, uCA: { value: cfg.ca ?? 0.0045 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime, uGrain, uCA; uniform vec2 uRes; varying vec2 vUv;
      void main(){ vec2 c = vUv - 0.5; float d = length(c*vec2(uRes.x/uRes.y, 1.0))*0.8;
        vec2 off = c*d*uCA;   // lệch màu ở rìa — ô chữ nằm ở rìa thì phải nhỏ, không chữ bị nhoè đôi
        vec3 col = vec3(texture2D(tDiffuse, vUv + off).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - off).b);
        col *= mix(1.0, 0.72, smoothstep(0.45, 1.0, d));
        float g = fract(sin(dot(vUv*uRes + fract(uTime)*97.0, vec2(12.9898, 78.233)))*43758.5453);
        col += (g - 0.5)*0.03*uGrain;
        gl_FragColor = vec4(col, 1.0); }`
  });
  composer.addPass(grade);

  // ----- môi trường -----
  const sunDir = cfg.sunPos.clone().normalize();
  const nebula = makeNebula(cfg.nebula || { c1: "#2b1055", c2: "#0b4a7a", c3: "#b0487a" });
  const stars = makeStars();
  scene.add(nebula, stars);
  const sun = makeSun(cfg.sunPos, cfg.sunScale ?? 220);
  scene.add(sun);
  const sunLight = new THREE.DirectionalLight(0xfff1e0, 3.2);
  sunLight.position.copy(cfg.sunPos);
  scene.add(sunLight);
  scene.add(new THREE.HemisphereLight(0x6b8cff, 0x1a0f24, 0.55));
  const rimLight = new THREE.DirectionalLight(0x7fb2ff, 1.4);
  rimLight.position.copy(cfg.rimPos || new V3(-50, 20, -80));
  scene.add(rimLight);
  const planets = (cfg.planets || []).map(p => { const m = makePlanet(p, sunDir); scene.add(m); return m; });

  // bụi tốc độ — vệt sáng lướt ngược hướng bay
  const DUST = 420;
  const dustPos = new Float32Array(DUST * 6);
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3).setUsage(THREE.DynamicDrawUsage));
  const dust = new THREE.LineSegments(dustGeo, new THREE.LineBasicMaterial({ color: new THREE.Color(0.55, 0.75, 1.2), transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false }));
  dust.frustumCulled = false;
  scene.add(dust);
  const dustBox = cfg.dustBox || { c: new V3(0, 0, 0), s: new V3(60, 30, 40) };
  const dustP = [];
  for (let i = 0; i < DUST; i++) dustP.push(new V3(rand(-1, 1) * dustBox.s.x / 2, rand(-1, 1) * dustBox.s.y / 2, rand(-1, 1) * dustBox.s.z / 2));

  // hạt
  const fire = new Particles(4000, { additive: true, map: radialTex([[0, "rgba(255,255,255,1)"], [0.25, "rgba(255,255,255,0.7)"], [1, "rgba(255,255,255,0)"]], 64) });
  const smoke = new Particles(2400, { additive: false, map: smokeTex() });
  scene.add(smoke.points, fire.points);
  if (cfg.nearFade) { fire.mat.uniforms.uNear.value.set(...cfg.nearFade); smoke.mat.uniforms.uNear.value.set(...cfg.nearFade); }

  // cổng đích
  const gate = makeGate(cfg.gate.radius);
  gate.position.copy(cfg.gate.pos);
  gate.quaternion.setFromUnitVectors(new V3(0, 0, 1), cfg.gate.normal.clone().normalize());
  scene.add(gate);

  // tên lửa
  const rockets = TEAMS.map((t, i) => { const r = makeRocket(t, i, cfg.hull); r.rig.scale.setScalar(cfg.rocketScale ?? 1); r.nozzleGlow.material.color.multiplyScalar(cfg.exhaust?.flame ?? 1); scene.add(r.rig); return r; });

  // ----- trạng thái trận -----
  const L = cfg.steps ?? 5;
  const LIVES = cfg.lives ?? 3;
  const G = {
    phase: "intro", t: 0, round: -1, order: shuffle(SAMPLE_QUESTIONS.map((_, i) => i)),
    q: null, answers: [[], []], picked: [null, null], settled: false, lives: [LIVES, LIVES], streak: [0, 0],
    winner: null, auto: false, autoT: 0
  };
  let trauma = 0;           // rung camera
  let fovKick = 0;
  let introT = 0;

  // =========================================================
  // BẢNG 3D gắn vào camera
  // =========================================================
  const ui = new THREE.Group();
  camera.add(ui);
  const uiLight = new THREE.PointLight(0xdfe8ff, 6, 14, 2);
  uiLight.position.set(0, 2.5, 1.5);
  camera.add(uiLight);
  const UID = cfg.uiDepth ?? 6;
  const hitList = [];
  const consoles = [];
  let questionPanel = null, startBtn = null;

  function screenToLocal(sx, sy, depth = UID) {       // sx, sy: 0..1 (trái→phải, trên→dưới)
    const hh = depth * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), hw = hh * camera.aspect;
    return new V3((sx * 2 - 1) * hw, (1 - sy * 2) * hh, -depth);
  }
  function screenSize(w, h, depth = UID) {
    const hh = depth * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), hw = hh * camera.aspect;
    return { w: w * 2 * hw, h: h * 2 * hh };
  }

  function glassPanel(w, h, color, opacity = 0.55) {
    const g = new THREE.Group();
    const r = Math.min(w, h) * 0.08;
    const slab = new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.06, 4, r),
      new THREE.MeshPhysicalMaterial({ color: new THREE.Color("#060b18"), metalness: 0.8, roughness: 0.4, transparent: true, opacity, clearcoat: 0.5, depthWrite: false, envMapIntensity: 0.25 }));
    // viền sáng = KHUNG rỗng (không phải tấm đặc — tấm đặc sẽ lộ qua kính mờ)
    const edge = new THREE.Mesh(frameGeo(w + 0.03, h + 0.03, r * 1.05, Math.min(w, h) * 0.012),
      new THREE.MeshBasicMaterial({ color: color.clone().multiplyScalar(1.8), transparent: true, opacity: 0.95, depthWrite: false }));
    edge.position.z = 0.035;
    g.add(slab, edge);
    return g;
  }

  function makeTile(w, h, team) {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: team.color.clone().multiplyScalar(0.42), metalness: 0.7, roughness: 0.34, clearcoat: 0.3, clearcoatRoughness: 0.25, envMapIntensity: 0.22,
      emissive: team.color, emissiveIntensity: 0.12
    });
    const r = Math.min(w, h) * 0.18;
    const body = new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.1, 5, r), bodyMat);
    const rimMat = new THREE.MeshBasicMaterial({ color: team.color.clone().multiplyScalar(1.5), transparent: true, opacity: 1 });
    const rim = new THREE.Mesh(new RoundedBoxGeometry(w + 0.05, h + 0.05, 0.08, 4, r * 1.05), rimMat);
    rim.position.z = -0.05;
    // vệt sáng lướt trên mặt ô (khoe độ bóng)
    const cv = document.createElement("canvas"); cv.width = 768; cv.height = Math.round(768 * h / w);
    const tex = canvasTex(cv);
    const text = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.94, h * 0.9), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    text.position.z = 0.055;
    const mark = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false, opacity: 0 }));
    mark.scale.set(h * 0.7, h * 0.7, 1); mark.position.set(w * 0.5 - h * 0.28, h * 0.3, 0.2);
    g.add(rim, body, text, mark);
    const tile = { g, body, bodyMat, rim, rimMat, text, cv, tex, mark, team, w, h, press: 0, flip: 0, pendingText: null, state: "idle", shake: 0, pulse: 0, label: "" };
    body.userData.tile = tile;
    return tile;
  }
  function setTileText(tile, txt) {
    tile.label = txt;
    drawTextCanvas(tile.cv, txt, { lines: 2, maxPx: Math.floor(tile.cv.height * 0.5) });
    tile.tex.needsUpdate = true;
  }
  const markTex = { ok: null, bad: null };
  function mkMark(sym, col) {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const g = c.getContext("2d");
    g.fillStyle = col; g.beginPath(); g.arc(64, 64, 58, 0, TAU); g.fill();
    g.strokeStyle = "#fff"; g.lineWidth = 16; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath();
    if (sym === "ok") { g.moveTo(34, 66); g.lineTo(56, 88); g.lineTo(96, 42); } else { g.moveTo(40, 40); g.lineTo(88, 88); g.moveTo(88, 40); g.lineTo(40, 88); }
    g.stroke();
    return canvasTex(c);
  }
  markTex.ok = mkMark("ok", "#16c47f"); markTex.bad = mkMark("bad", "#ff3b4e");

  function makeHeader(w, h, team) {
    const cv = document.createElement("canvas"); cv.width = 1024; cv.height = Math.round(1024 * h / w);
    const tex = canvasTex(cv);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    const hd = { m, cv, tex, team };
    return hd;
  }
  function drawHeader(hd, lives) {
    const g = hd.cv.getContext("2d"), W = hd.cv.width, H = hd.cv.height;
    g.clearRect(0, 0, W, H);
    const px = Math.floor(H * 0.62);
    g.font = `${px}px "Segoe UI Emoji", sans-serif`; g.textBaseline = "middle"; g.textAlign = "left";
    let x = W * 0.03;
    // huy hiệu tròn màu đội
    g.fillStyle = hd.team.css; g.beginPath(); g.arc(x + H * 0.42, H / 2, H * 0.42, 0, TAU); g.fill();
    g.fillText(hd.team.pilot, x + H * 0.08, H / 2 + px * 0.06);
    x += H * 0.98;
    // tên + tim phải VỪA bề ngang còn lại — co cỡ chữ nếu bàn hẹp (mẫu 2: bàn dọc)
    let fs = Math.floor(H * 0.56);
    const room = W - x - W * 0.02;
    for (; fs > 12; fs -= 2) {
      g.font = `900 ${fs}px ${FONT_UI}`;
      if (g.measureText(hd.team.name).width + fs * 0.6 + LIVES * fs * 1.0 <= room) break;
    }
    g.fillStyle = "#fff"; g.shadowColor = "rgba(0,0,0,.6)"; g.shadowBlur = 10;
    g.fillText(hd.team.name, x, H / 2 + 2);
    x += g.measureText(hd.team.name).width + fs * 0.6;
    for (let i = 0; i < LIVES; i++) { g.fillStyle = i < lives ? "#ff5a7a" : "rgba(255,255,255,0.18)"; g.fillText("♥", x + i * fs * 1.0, H / 2 + 2); }
    hd.tex.needsUpdate = true;
  }

  function buildUI() {
    // dọn cũ
    [...ui.children].forEach(c => ui.remove(c));
    hitList.length = 0; consoles.length = 0;
    // ⭐ Cỡ THẬT theo cm trên màn (TOMKO 86" 4K rộng ~190 cm): 1 ô đáp án không cần to bằng quyển sách.
    const U = { cw: cm => cm * pxPerCm() / W, ch: cm => cm * pxPerCm() / H };
    const L0 = cfg.layout(screenToLocal, screenSize, camera.aspect, U);

    // thanh câu hỏi
    {
      const r = L0.question;
      const p = screenToLocal(r.x + r.w / 2, r.y + r.h / 2, r.depth ?? UID);
      const s = screenSize(r.w, r.h, r.depth ?? UID);
      const g = new THREE.Group();
      const panel = glassPanel(s.w, s.h, new THREE.Color("#8fd3ff"), 0.8);
      const cv = document.createElement("canvas"); cv.width = 2048; cv.height = Math.round(2048 * s.h / s.w);
      const tex = canvasTex(cv);
      const tm = new THREE.Mesh(new THREE.PlaneGeometry(s.w * 0.96, s.h * 0.9), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
      tm.position.z = 0.04;
      g.add(panel, tm); g.position.copy(p);
      if (r.rotX) g.rotation.x = r.rotX;
      ui.add(g);
      questionPanel = { g, cv, tex, tm, text: "" };
      if (G.q) setQuestionText(G.q.q);
      else setQuestionText(cfg.title || "ROCKET RACE");
    }
    // 2 bàn đáp án
    L0.consoles.forEach((c, side) => {
      const team = TEAMS[side];
      const depth = c.depth ?? UID;
      const p = screenToLocal(c.x + c.w / 2, c.y + c.h / 2, depth);
      const s = screenSize(c.w, c.h, depth);
      // pivot "outer" (2d): xoay quanh MÉP NGOÀI ⇒ nghiêng bao nhiêu mép ngoài vẫn dính đúng mép màn
      const outer = c.pivot === "outer";
      const grp = new THREE.Group();
      const inner = new THREE.Group(); grp.add(inner);
      if (outer) {
        const edgeX = side === 0 ? c.x : c.x + c.w;
        grp.position.copy(screenToLocal(edgeX, c.y + c.h / 2, depth));
        inner.position.x = side === 0 ? s.w / 2 : -s.w / 2;
      } else grp.position.copy(p);
      if (c.rotY) grp.rotation.y = c.rotY;
      if (c.rotX) grp.rotation.x = c.rotX;
      if (!c.noPanel) {                       // noPanel (2d): không kính, không viền — chỉ còn ô + tên đội
        const panel = glassPanel(s.w, s.h, team.color, 0.62);
        panel.position.z = -0.1;
        inner.add(panel);
      }
      const headerH = s.h * (c.headerFrac ?? 0.2);
      const pad = Math.min(s.w, s.h) * 0.07;
      const hd = makeHeader(s.w - pad * 2, headerH, team);
      const headerOnTop = c.header !== "bottom";
      hd.m.position.set(0, headerOnTop ? s.h / 2 - pad * 0.6 - headerH / 2 : -s.h / 2 + pad * 0.6 + headerH / 2, 0.02);
      inner.add(hd.m);
      drawHeader(hd, G.lives[side]);
      const cols = c.cols, rows = c.rows;
      const areaH = s.h - headerH - pad * 2.2, areaW = s.w - pad * 2;
      const gap = Math.min(areaW, areaH) * 0.07;
      const tw = (areaW - gap * (cols - 1)) / cols, th = (areaH - gap * (rows - 1)) / rows;
      const y0 = headerOnTop ? (s.h / 2 - pad * 1.4 - headerH) : (s.h / 2 - pad);
      const tiles = [];
      for (let k = 0; k < cols * rows; k++) {
        const col = k % cols, row = Math.floor(k / cols);
        const t = makeTile(tw, th, team);
        t.g.position.set(-areaW / 2 + tw / 2 + col * (tw + gap), y0 - th / 2 - row * (th + gap), 0.05);
        t.home = t.g.position.clone();
        t.side = side; t.idx = k;
        inner.add(t.g);
        hitList.push(t.body);
        tiles.push(t);
        const cur = G.answers[side][k];
        setTileText(t, cur ? cur.text : "");
        t.g.visible = G.phase !== "intro" && G.phase !== "start";
      }
      ui.add(grp);
      consoles.push({ grp, tiles, header: hd, side });
    });
    // nút START
    {
      const s = cfg.startCm ? screenSize(U.cw(cfg.startCm[0]), U.ch(cfg.startCm[1])) : screenSize(0.24, 0.14);
      const t = makeTile(s.w, s.h, { color: new THREE.Color("#ffb020"), css: "#ffb020" });
      t.bodyMat.color.set("#6b4300"); t.rimMat.color.setRGB(3.2, 2.1, 0.4);
      setTileText(t, "▶  START");
      t.g.position.copy(screenToLocal(0.5, cfg.startY ?? 0.5));
      t.isStart = true;
      ui.add(t.g); hitList.push(t.body);
      t.g.visible = G.phase === "start" || G.phase === "over";
      startBtn = t;
    }
  }
  function setQuestionText(txt) {
    if (!questionPanel) return;
    questionPanel.text = txt;
    drawTextCanvas(questionPanel.cv, txt, { lines: 1, maxPx: Math.floor(questionPanel.cv.height * 0.62), weight: 800 });
    questionPanel.tex.needsUpdate = true;
  }

  // =========================================================
  // BANNER chữ 3D
  // =========================================================
  const banners = [];
  const shadeTex = radialTex([[0, "rgba(0,0,8,0.75)"], [0.55, "rgba(0,0,8,0.45)"], [1, "rgba(0,0,8,0)"]], 128);
  function banner(text, kind = "gold", ms = 1100, size = 0.55) {
    if (!font) return;
    const geo = new TextGeometry(text, { font, size, depth: size * 0.28, curveSegments: 8, bevelEnabled: true, bevelThickness: size * 0.06, bevelSize: size * 0.035, bevelSegments: 4 });
    geo.computeBoundingBox(); geo.center();
    const cols = { gold: ["#ffcf4a", [1.8, 1.0, 0.1]], red: ["#ff5a5a", [2.2, 0.2, 0.15]], cyan: ["#6fe7ff", [0.2, 1.6, 2.6]], white: ["#ffffff", [1.2, 1.3, 1.6]] }[kind];
    const face = new THREE.MeshPhysicalMaterial({ color: cols[0], metalness: 1, roughness: 0.18, clearcoat: 1, emissive: new THREE.Color(...cols[1]), emissiveIntensity: 0.3, transparent: true });
    const mesh = new THREE.Mesh(geo, face);
    const holder = new THREE.Group();
    // quầng tối mềm phía sau chữ ⇒ chữ vàng đọc được cả trên nền sáng (mặt trời, vụ nổ)
    const bb = geo.boundingBox;
    const shade = new THREE.Sprite(new THREE.SpriteMaterial({ map: shadeTex, transparent: true, depthWrite: false, opacity: 0.85 }));
    shade.scale.set((bb.max.x - bb.min.x) * 1.5, (bb.max.y - bb.min.y) * 3.2, 1);
    shade.position.z = -size * 0.6;
    holder.add(shade, mesh);
    holder.position.set(0, cfg.bannerY ?? 0.2, -7);
    ui.add(holder);
    banners.push({ holder, mesh, face, t: 0, ms: ms / 1000 });
  }
  function updateBanners(dt) {
    for (let i = banners.length - 1; i >= 0; i--) {
      const b = banners[i]; b.t += dt;
      const inT = 0.35, outT = 0.35;
      let s = 1, a = 1;
      if (b.t < inT) s = easeOutBack(b.t / inT);
      else if (b.t > b.ms - outT) { const k = (b.t - (b.ms - outT)) / outT; s = 1 + k * 0.6; a = 1 - k; }
      b.holder.scale.setScalar(Math.max(0.001, s));
      b.mesh.rotation.y = Math.sin(b.t * 1.6) * 0.12;
      b.mesh.rotation.x = Math.sin(b.t * 1.2) * 0.05;
      b.face.opacity = a;
      b.holder.children[0].material.opacity = 0.85 * a;
      if (b.t >= b.ms) { ui.remove(b.holder); b.mesh.geometry.dispose(); banners.splice(i, 1); }
    }
  }

  // =========================================================
  // HIỆU ỨNG
  // =========================================================
  const tmpV = new V3(), tmpV2 = new V3(), tmpQ = new THREE.Quaternion();
  function nozzleWorld(r, out) { return out.set(-2.55, 0, 0).applyMatrix4(r.ship.matrixWorld); }
  function forwardWorld(r, out) { return out.set(1, 0, 0).applyQuaternion(r.rig.quaternion); }

  function emitExhaust(r, dt) {
    if (r.hidden || r.wreck || r.exploding > 0) return;
    const f = forwardWorld(r, tmpV2);
    const n = nozzleWorld(r, tmpV);
    const power = r.stall > 0 ? 0.15 : 1 + r.boost * 1.8;
    const turbo = r.turbo > 0;
    const EX = cfg.exhaust || {};
    const count = Math.round((turbo ? 60 : 40) * power * dt * 60 / 6 * (EX.fire ?? 1));
    for (let i = 0; i < count; i++) {
      const sp = rand(7, 12) * (0.6 + power * 0.4);
      fire.emit({
        pos: n.clone().add(new V3(rand(-0.12, 0.12), rand(-0.12, 0.12), rand(-0.12, 0.12))),
        vel: f.clone().multiplyScalar(-sp).add(new V3(rand(-0.6, 0.6), rand(-0.6, 0.6), rand(-0.6, 0.6))),
        life: rand(0.16, 0.34), size: rand(0.45, 0.75), sizeEnd: 0.1,
        color: turbo ? new THREE.Color(0.5, 1.3, 2.6) : new THREE.Color(3, 1.8, 0.7),
        colorEnd: turbo ? new THREE.Color(0.1, 0.2, 0.8) : new THREE.Color(1.2, 0.25, 0.04), drag: 2
      });
    }
    if (Math.random() < dt * 22 * (EX.smoke ?? 1)) {
      smoke.emit({
        pos: n.clone().addScaledVector(f, -(EX.smokeBack ?? 1.6)).add(new V3(rand(-0.15, 0.15), rand(-0.15, 0.15), rand(-0.15, 0.15))), vel: f.clone().multiplyScalar(-rand(2.5, 4)).add(new V3(rand(-0.3, 0.3), rand(-0.1, 0.4), rand(-0.3, 0.3))),
        life: rand(1.2, 2.0) * (EX.smokeLife ?? 1), size: EX.smokeSize ?? 0.9, sizeEnd: EX.smokeSizeEnd ?? 3.2, color: new THREE.Color(0.55, 0.58, 0.66), alpha: EX.smokeAlpha ?? 0.22, drag: 0.8
      });
    }
  }
  function damageFx(r, dt) {
    if (r.hidden || r.exploding > 0) return;
    const lvl = r.wreck ? 3 : r.dmg;
    if (!lvl) return;
    const c = tmpV.setFromMatrixPosition(r.ship.matrixWorld);
    r.smokeT -= dt;
    if (r.smokeT <= 0) {
      r.smokeT = [0, 0.14, 0.08, 0.04][lvl];
      const dark = r.wreck ? 0.12 : [0, 0.5, 0.3, 0.16][lvl];
      smoke.emit({ pos: c.clone().add(new V3(rand(-0.5, 0.5), rand(0.1, 0.4), rand(-0.3, 0.3))), vel: new V3(rand(-1.5, -0.5), rand(0.6, 1.6), rand(-0.3, 0.3)),
        life: rand(1.4, 2.6), size: 0.6, sizeEnd: r.wreck ? 4 : 2.6, color: new THREE.Color(dark, dark, dark * 1.05), alpha: r.wreck ? 0.55 : 0.4, drag: 0.5 });
    }
    r.sparkT -= dt;
    if (r.sparkT <= 0 && !r.wreck) {
      r.sparkT = rand(0.25, 0.9) / lvl;
      for (let i = 0; i < 10 * lvl; i++) fire.emit({ pos: c.clone().add(new V3(rand(-0.6, 0.6), rand(-0.2, 0.4), 0.3)), vel: new V3(rand(-4, 4), rand(-1, 5), rand(-2, 2)),
        life: rand(0.2, 0.5), size: 0.12, sizeEnd: 0.02, color: new THREE.Color(5, 3, 1), colorEnd: new THREE.Color(2, 0.4, 0), drag: 1 });
    }
    if (lvl >= 3 && !r.wreck && Math.random() < dt * 30) {
      fire.emit({ pos: c.clone().add(new V3(rand(-0.8, 0.4), rand(0, 0.5), 0.35)), vel: new V3(rand(-2, -0.5), rand(0.5, 2), 0),
        life: rand(0.25, 0.45), size: 0.5, sizeEnd: 0.1, color: new THREE.Color(4, 1.8, 0.4), colorEnd: new THREE.Color(1.5, 0.2, 0), drag: 1 });
    }
  }
  function burst(pos, { n = 40, speed = 8, color = new THREE.Color(5, 3, 1), colorEnd = new THREE.Color(2, 0.3, 0), size = 0.2, life = 0.8 } = {}) {
    for (let i = 0; i < n; i++) {
      const d = new V3(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize().multiplyScalar(speed * rand(0.4, 1));
      fire.emit({ pos: pos.clone(), vel: d, life: life * rand(0.5, 1), size, sizeEnd: size * 0.2, color, colorEnd, drag: 1.4 });
    }
  }
  // quả cầu lửa nổ
  const booms = [];
  function explosion(pos) {
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uAge: { value: 0 }, uTime: { value: 0 } },
      vertexShader: GLSL_NOISE + `uniform float uAge, uTime; varying float vN; varying vec3 vNorm;
        void main(){ float n = fbm(normal*2.2 + uTime*1.8); vN = n; vNorm = normalize(normalMatrix*normal);
          vec3 p = position + normal*n*0.7; gl_Position = projectionMatrix*modelViewMatrix*vec4(p,1.0); }`,
      fragmentShader: `uniform float uAge; varying float vN; varying vec3 vNorm;
        void main(){ float heat = clamp(1.3 - uAge*1.6 + vN*0.6, 0.0, 1.0);
          vec3 c = mix(vec3(0.35,0.05,0.01), vec3(1.6,0.7,0.15), smoothstep(0.2,0.7,heat)); c = mix(c, vec3(2.4,2.0,1.5), smoothstep(0.85,1.0,heat));
          float f = pow(abs(vNorm.z), 0.6);
          float a = (1.0 - smoothstep(0.55, 1.0, uAge))*f*0.75;
          gl_FragColor = vec4(c*a, a); }`
    });
    const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 24), mat);
    ball.position.copy(pos);
    const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.2, 0.9, 0.6), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.0, 96), ringMat);
    ring.position.copy(pos);
    const flash = new THREE.PointLight(0xffb070, 90, 40, 2);
    flash.position.copy(pos);
    scene.add(ball, ring, flash);
    // mảnh vỡ
    const debris = [];
    for (let i = 0; i < 16; i++) {
      const m = new THREE.Mesh(new THREE.TetrahedronGeometry(rand(0.08, 0.22)), new THREE.MeshStandardMaterial({ color: "#6d6660", metalness: 0.8, roughness: 0.4, emissive: new THREE.Color(3, 1, 0.2), emissiveIntensity: 1 }));
      m.position.copy(pos);
      m.userData.v = new V3(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize().multiplyScalar(rand(4, 11));
      m.userData.s = new V3(rand(-8, 8), rand(-8, 8), rand(-8, 8));
      scene.add(m); debris.push(m);
    }
    burst(pos, { n: 160, speed: 16, size: 0.2, life: 1.1, color: new THREE.Color(2.4, 1.4, 0.5), colorEnd: new THREE.Color(1, 0.15, 0) });
    for (let i = 0; i < 40; i++) smoke.emit({ pos: pos.clone().add(new V3(rand(-0.6, 0.6), rand(-0.6, 0.6), rand(-0.6, 0.6))), vel: new V3(rand(-3, 3), rand(-2, 3), rand(-3, 3)),
      life: rand(1.6, 3), size: 1.2, sizeEnd: 5.5, color: new THREE.Color(0.14, 0.12, 0.12), alpha: 0.6, drag: 1.2 });
    booms.push({ ball, mat, ring, ringMat, flash, debris, t: 0 });
    trauma = Math.min(1, trauma + 0.9);
  }
  function updateBooms(dt) {
    for (let i = booms.length - 1; i >= 0; i--) {
      const b = booms[i]; b.t += dt;
      const k = b.t / 1.6;
      b.mat.uniforms.uAge.value = k; b.mat.uniforms.uTime.value += dt;
      b.ball.scale.setScalar(0.4 + easeOutBack(Math.min(1, b.t / 0.5)) * 3.2 + b.t * 0.6);
      b.ring.scale.setScalar(1 + b.t * 16);
      b.ring.quaternion.copy(camera.quaternion);
      b.ringMat.opacity = Math.max(0, 1 - b.t * 1.8);
      b.flash.intensity = Math.max(0, 90 * (1 - b.t * 2.2));
      b.debris.forEach(d => {
        d.position.addScaledVector(d.userData.v, dt); d.userData.v.multiplyScalar(1 - dt * 0.6);
        d.rotation.x += d.userData.s.x * dt; d.rotation.y += d.userData.s.y * dt;
        d.material.emissiveIntensity = Math.max(0, 1 - b.t * 0.5);
        if (Math.random() < dt * 20) smoke.emit({ pos: d.position.clone(), vel: new V3(0, 0.3, 0), life: 0.9, size: 0.25, sizeEnd: 1, color: new THREE.Color(0.2, 0.2, 0.2), alpha: 0.4 });
      });
      if (b.t > 3.5) {
        scene.remove(b.ball, b.ring, b.flash); b.debris.forEach(d => scene.remove(d));
        booms.splice(i, 1);
      }
    }
  }
  function fireworks(pos) {
    const palette = [[4, 1.2, 0.6], [0.6, 2.4, 4], [3.6, 3.2, 0.6], [0.8, 4, 1.4], [3.6, 0.8, 3.6]];
    for (let k = 0; k < 6; k++) {
      setTimeout(() => {
        const c = palette[k % palette.length];
        const p = pos.clone().add(new V3(rand(-6, 6), rand(-3, 5), rand(-4, 2)));
        burst(p, { n: 160, speed: 9, color: new THREE.Color(...c), colorEnd: new THREE.Color(c[0] * 0.3, c[1] * 0.3, c[2] * 0.3), size: 0.18, life: 1.4 });
      }, k * 260);
    }
  }

  // =========================================================
  // LUẬT TRẬN (bản mẫu: Same words, trả lời đúng trước ăn câu)
  // =========================================================
  function nextRound() {
    G.round++;
    const q = SAMPLE_QUESTIONS[G.order[G.round % G.order.length]];
    G.q = q; G.picked = [null, null]; G.settled = false;
    setQuestionText(q.q);
    const ans = q.a.map((t, i) => ({ text: t, correct: i === 0 }));
    G.answers = [shuffle(ans), shuffle(ans)];
    consoles.forEach(c => c.tiles.forEach((t, k) => {
      t.pendingText = G.answers[c.side][k] ? G.answers[c.side][k].text : "";
      t.flip = 1;            // lật ô 3D, đổi chữ ở nửa vòng
      t.state = "idle"; t.mark.material.opacity = 0; t.g.visible = true;
      t.shake = 0;
    }));
    G.lockUntil = G.t + 0.55;
  }
  function onTap(tile) {
    if (tile.isStart) { if (G.phase === "start") startCountdown(); else if (G.phase === "over") restart(); return; }
    if (G.phase !== "play" || G.settled || G.t < G.lockUntil) return;
    const side = tile.side;
    if (G.picked[side] != null || G.lives[side] <= 0) return;
    const ans = G.answers[side][tile.idx];
    if (!ans) return;
    G.picked[side] = tile.idx;
    tile.press = 1;
    const r = rockets[side];
    if (ans.correct) {
      tile.state = "picked";
      G.streak[side]++;
      advance(r, 1);
      settleRound(side);
    } else {
      tile.state = "wrong"; tile.shake = 1;
      G.streak[side] = 0;
      stallRocket(r);
      loseLife(side);
      consoles[side].tiles.forEach(t => { if (t !== tile) t.state = "locked"; });
      if (G.picked[1 - side] != null || G.lives[1 - side] <= 0) settleRound(null);
    }
  }
  function settleRound(winnerSide) {
    if (G.settled) return;
    G.settled = true;
    // lộ đáp án: ô đúng xanh, ô bị chọn sai đỏ
    consoles.forEach(c => c.tiles.forEach((t, k) => {
      const a = G.answers[c.side][k]; if (!a) return;
      if (a.correct) { t.state = "correct"; t.mark.material.map = markTex.ok; t.mark.material.opacity = 1; t.mark.material.needsUpdate = true; t.pulse = 1; }
      else if (G.picked[c.side] === k) { t.state = "wrong"; t.mark.material.map = markTex.bad; t.mark.material.opacity = 1; t.mark.material.needsUpdate = true; }
      else t.state = "dim";
    }));
    if (G.phase !== "play") return;
    setTimeout(() => { if (G.phase === "play") nextRound(); }, 1500);
  }
  function advance(r, n) {
    r.p = Math.min(L, r.p + n);
    r.boost = 1; fovKick = 1;
    const n0 = nozzleWorld(r, new V3());
    burst(n0, { n: 60, speed: 6, color: new THREE.Color(2, 2.6, 4), colorEnd: new THREE.Color(0.4, 0.6, 2), size: 0.25, life: 0.6 });
    if (G.streak[r.idx] >= 3 && r.turbo <= 0) { r.turbo = 4.5; banner("TURBO!", "cyan", 1100, 0.5); }
    if (r.p >= L) raceWon(r);
  }
  function stallRocket(r) {
    r.stall = 1.1;
    trauma = Math.min(1, trauma + 0.35);
    const c = new V3().setFromMatrixPosition(r.ship.matrixWorld);
    burst(c, { n: 50, speed: 7, size: 0.14, life: 0.5 });
    for (let i = 0; i < 8; i++) smoke.emit({ pos: c.clone(), vel: new V3(rand(-2, 1), rand(0, 2), rand(-1, 1)), life: 1.4, size: 0.6, sizeEnd: 2.5, color: new THREE.Color(0.25, 0.25, 0.27), alpha: 0.5, drag: 1 });
  }
  function loseLife(side) {
    G.lives[side] = Math.max(0, G.lives[side] - 1);
    drawHeader(consoles[side].header, G.lives[side]);
    const r = rockets[side];
    const lost = LIVES - G.lives[side];
    r.dmg = G.lives[side] > 0 ? Math.min(3, Math.ceil(3 * lost / LIVES)) : 3;
    setDamageLook(r);
    if (G.lives[side] <= 0) {
      blowUp(r);
      setTimeout(() => raceWon(rockets[1 - side], true), 700);
    }
  }
  function blowUp(r) {
    if (r.wreck || r.exploding > 0) return;
    r.exploding = 0.001;
    explosion(new V3().setFromMatrixPosition(r.ship.matrixWorld));
    setTimeout(() => { r.wreck = true; r.exploding = 0; setDamageLook(r); }, 350);
  }
  function raceWon(w, loserDown) {
    if (G.phase !== "play") return;
    G.phase = "over"; G.winner = w.idx; G.settled = true;
    const loser = rockets[1 - w.idx];
    if (w.p < L) { w.p = L; w.homeRun = true; w.boost = 1; }
    banner(w.team.name + " WINS!", "gold", 3200, 0.62);
    const gp = gate.position.clone();
    setTimeout(() => { gate.userData.flash = 1; fireworks(gp); }, w.homeRun ? 1100 : 350);
    if (!loserDown) setTimeout(() => blowUp(loser), w.homeRun ? 1100 : 650);
    setQuestionText(w.team.pilot + "  " + w.team.name + " WINS!");
    setTimeout(() => { if (G.phase === "over") { startBtn.g.visible = true; setTileText(startBtn, "↻  PLAY AGAIN"); } }, 3400);
  }
  function startCountdown() {
    G.phase = "count"; startBtn.g.visible = false;
    banners.forEach(b => { b.t = Math.max(b.t, b.ms - 0.35); });   // chữ tiêu đề nhường chỗ cho 3-2-1
    const seq = ["3", "2", "1", "GO!"];
    seq.forEach((s, i) => setTimeout(() => banner(s, i === 3 ? "gold" : "white", 850, i === 3 ? 0.9 : 1.0), i * 900));
    setTimeout(() => { G.phase = "play"; consoles.forEach(c => c.tiles.forEach(t => (t.g.visible = true))); nextRound(); }, 3600);
  }
  function restart() {
    rockets.forEach(r => { r.p = 0; r.vis = 0; r.dmg = 0; r.wreck = false; r.exploding = 0; r.stall = 0; r.boost = 0; r.turbo = 0; r.homeRun = false; setDamageLook(r); r.ship.rotation.set(0, 0, 0); });
    G.lives = [LIVES, LIVES]; G.streak = [0, 0]; G.round = -1; G.order = shuffle(G.order); G.winner = null; G.q = null;
    consoles.forEach(c => { drawHeader(c.header, LIVES); c.tiles.forEach(t => { t.g.visible = false; t.state = "idle"; t.mark.material.opacity = 0; }); });
    startBtn.g.visible = false;
    setQuestionText(cfg.title || "ROCKET RACE");
    startCountdown();
  }

  // =========================================================
  // chạm
  // =========================================================
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  renderer.domElement.addEventListener("pointerdown", e => {
    const rect = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    camera.updateMatrixWorld();
    ray.setFromCamera(ndc, camera);
    const vis = hitList.filter(m => { let o = m; while (o) { if (!o.visible) return false; o = o.parent; } return true; });
    const hit = ray.intersectObjects(vis, false)[0];
    if (hit) onTap(hit.object.userData.tile);
  });

  // =========================================================
  // khung hình
  // =========================================================
  let W = 0, H = 0;
  function resize() {
    W = container.clientWidth; H = container.clientHeight;
    const pr = Math.min(window.devicePixelRatio || 1, Q[quality].pr);
    renderer.setPixelRatio(pr);
    renderer.setSize(W, H, false);
    renderer.domElement.style.width = W + "px"; renderer.domElement.style.height = H + "px";
    composer.setPixelRatio(pr); composer.setSize(W, H);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    grade.uniforms.uRes.value.set(W * pr, H * pr);
    stars.material.uniforms.uPR.value = pr;
    const s = (H * pr) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    fire.mat.uniforms.uScale.value = s; smoke.mat.uniforms.uScale.value = s;
    buildUI();
  }
  let rsT = 0;
  window.addEventListener("resize", () => { clearTimeout(rsT); rsT = setTimeout(resize, 120); });
  resize();

  function setQuality(qn) {
    quality = qn;
    bloom.enabled = Q[qn].bloom;
    grade.uniforms.uGrain.value = qn === "low" ? 0 : 1;
    resize();
  }

  const clock = new THREE.Clock();
  let fpsN = 0, fpsT = 0, fps = 0;
  const camBase = { pos: new V3(), look: new V3() };
  G.phase = "intro";

  let manual = false;       // bàn thử: tự bước khung hình (khung xem trước không chạy rAF đều)
  // Giới hạn khung hình (TOMKO chỉ hiện 60 Hz — vẽ hơn là phí GPU)
  let lastFrame = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    if (cfg.maxFps && now - lastFrame < 1000 / cfg.maxFps - 2) return;
    lastFrame = now;
    const dt = Math.min(0.05, clock.getDelta());
    if (!manual) tick(dt);
  }
  function tick(dt) {
    G.t += dt;
    fpsN++; fpsT += dt; if (fpsT >= 0.5) { fps = Math.round(fpsN / fpsT); fpsN = 0; fpsT = 0; cfg.onFps && cfg.onFps(fps); }

    // tên lửa
    rockets.forEach((r, i) => {
      r.boost = Math.max(0, r.boost - dt * 1.4);
      r.stall = Math.max(0, r.stall - dt);
      r.turbo = Math.max(0, r.turbo - dt);
      const k = r.homeRun ? 2.2 : 3.0;
      r.vis += (r.p - r.vis) * Math.min(1, dt * k);
      const t01 = r.vis / L;
      const pose = cfg.track(i, t01, G.t);
      r.rig.position.copy(pose.pos);
      tmpQ.setFromUnitVectors(new V3(1, 0, 0), pose.dir.clone().normalize());
      r.rig.quaternion.slerp(tmpQ, Math.min(1, dt * 6));
      // nhấp nhô + lắc
      const bob = Math.sin(G.t * 2.4 + r.wob) * 0.12;
      const jit = r.stall > 0 ? 0.08 : 0;
      r.ship.position.set(r.boost * 0.5 + rand(-jit, jit), bob + rand(-jit, jit), rand(-jit, jit));
      if (r.wreck) { r.ship.rotation.x += dt * 0.6; r.ship.rotation.z += dt * 0.25; r.ship.position.y -= 0.3; }
      else { r.ship.rotation.x = Math.sin(G.t * 1.3 + r.wob) * 0.18 + (r.stall > 0 ? Math.sin(G.t * 40) * 0.08 : 0); r.ship.rotation.z = Math.sin(G.t * 2.4 + r.wob + 0.5) * 0.03; }
      r.model.visible = !(r.exploding > 0 && r.exploding < 0.3);
      if (r.exploding > 0) r.exploding += dt;
      // lửa
      const on = !r.wreck && r.exploding === 0;
      const pow = r.stall > 0 ? 0.25 + Math.random() * 0.35 : 1 + r.boost * 1.6 + (r.turbo > 0 ? 0.6 : 0);
      r.flameGroup.visible = on;
      r.flameGroup.scale.set(1 + r.boost * 0.3, (0.9 + pow * 0.55) * (0.92 + Math.random() * 0.16), 1 + r.boost * 0.3);
      [r.flameOuter, r.flameInner].forEach(m => { m.material.uniforms.uTime.value = G.t + i; m.material.uniforms.uPow.value = pow * (cfg.exhaust?.flame ?? 1); });
      if (r.turbo > 0) { r.flameOuter.material.uniforms.uCol.value.setRGB(0.4, 1.6, 4); r.flameOuter.material.uniforms.uCore.value.setRGB(3, 5, 7); }
      else { r.flameOuter.material.uniforms.uCol.value.setRGB(3.2, 0.9, 0.2); r.flameOuter.material.uniforms.uCore.value.setRGB(4, 3.2, 2); }
      r.nozzleGlow.visible = on;
      r.light.intensity = on ? (10 + r.boost * 30) * (cfg.engineLight ?? 1) * pow * (0.85 + Math.random() * 0.3) : 0;
      r.light.color.set(r.turbo > 0 ? 0x6cc8ff : 0xff8a3d);
      r.shield.material.uniforms.uA.value = lerp(r.shield.material.uniforms.uA.value, r.turbo > 0 ? 0.9 : 0, dt * 5);
    });
    scene.updateMatrixWorld();
    rockets.forEach(r => { emitExhaust(r, dt); damageFx(r, dt); });

    // cổng
    gate.userData.film.material.uniforms.uTime.value = G.t;
    gate.userData.flash = Math.max(0, (gate.userData.flash || 0) - dt * 0.8);
    gate.userData.film.material.uniforms.uFlash.value = gate.userData.flash;
    gate.userData.lamps.forEach((l, i) => { const on = (Math.floor(G.t * 6) + i) % 12 < 4 || gate.userData.flash > 0; l.material.color.setRGB(on ? 5 : 0.6, on ? 3.6 : 0.4, on ? 1.2 : 0.1); });
    gate.rotation.z += dt * 0.05;

    // camera
    const lead = Math.max(rockets[0].vis, rockets[1].vis) / L, trail = Math.min(rockets[0].vis, rockets[1].vis) / L;
    const cp = cfg.camera({ t: G.t, lead, trail, phase: G.phase, rockets, L });
    if (G.phase === "intro") {
      introT += dt;
      const k = easeInOut(Math.min(1, introT / (cfg.introSecs ?? 3.2)));
      const ip = cfg.introCamera ? cfg.introCamera(k, cp) : cp;
      camBase.pos.copy(ip.pos); camBase.look.copy(ip.look);
      if (introT >= (cfg.introSecs ?? 3.2)) {
        G.phase = "start"; startBtn.g.visible = true;
        banner("ROCKET RACE", "gold", 2400, 0.62);
      }
    } else {
      camBase.pos.lerp(cp.pos, Math.min(1, dt * 1.8));
      camBase.look.lerp(cp.look, Math.min(1, dt * 1.8));
    }
    trauma = Math.max(0, trauma - dt * 1.3);
    const sh = trauma * trauma;
    camera.position.copy(camBase.pos).add(new V3(rand(-1, 1) * sh * 0.5, rand(-1, 1) * sh * 0.5, 0));
    camera.lookAt(camBase.look);
    fovKick = Math.max(0, fovKick - dt * 2);
    const fovT = (cfg.fov ?? 40) + fovKick * 1.5;
    if (Math.abs(camera.fov - fovT) > 0.01) { camera.fov = fovT; camera.updateProjectionMatrix(); }

    // nền đi theo camera (xa vô cực)
    nebula.position.copy(camera.position); stars.position.copy(camera.position);
    nebula.material.uniforms.uTime.value = G.t; stars.material.uniforms.uTime.value = G.t;
    planets.forEach(p => { p.userData.mat.uniforms.uTime.value = G.t; p.children[0].rotation.y += dt * 0.01; });

    // bụi tốc độ
    const travel = cfg.travelDir.clone().normalize();
    const speed = 22 + Math.max(rockets[0].boost, rockets[1].boost) * 40 + (rockets.some(r => r.turbo > 0) ? 30 : 0);
    const len = 0.6 + speed * 0.03;
    const center = dustBox.follow ? camera.position : dustBox.c;
    for (let i = 0; i < DUST; i++) {
      const p = dustP[i];
      p.addScaledVector(travel, -speed * dt);
      ["x", "y", "z"].forEach(a => { const h = dustBox.s[a] / 2; if (p[a] < -h) p[a] += h * 2; else if (p[a] > h) p[a] -= h * 2; });
      const j = i * 6;
      dustPos[j] = center.x + p.x; dustPos[j + 1] = center.y + p.y; dustPos[j + 2] = center.z + p.z;
      dustPos[j + 3] = center.x + p.x + travel.x * len; dustPos[j + 4] = center.y + p.y + travel.y * len; dustPos[j + 5] = center.z + p.z + travel.z * len;
    }
    dustGeo.attributes.position.needsUpdate = true;

    fire.update(dt); smoke.update(dt);
    updateBooms(dt);
    updateBanners(dt);

    // ô đáp án: nhấn, lật, rung, trạng thái
    consoles.forEach(c => c.tiles.forEach(t => updateTile(t, dt)));
    if (startBtn) { startBtn.pulse = (startBtn.pulse || 0) + dt; startBtn.g.scale.setScalar(1 + Math.sin(startBtn.pulse * 3) * 0.03); startBtn.rimMat.color.setRGB(3 + Math.sin(startBtn.pulse * 3), 2 + Math.sin(startBtn.pulse * 3) * 0.6, 0.4); }
    if (questionPanel) questionPanel.g.position.y += Math.sin(G.t * 1.2) * 0.0006;

    // tự chơi (bảng thử)
    if (G.auto && G.phase === "play" && !G.settled && G.t > G.lockUntil) {
      G.autoT -= dt;
      if (G.autoT <= 0) {
        G.autoT = rand(0.5, 1.6);
        const side = Math.random() < 0.5 ? 0 : 1;
        if (G.picked[side] == null && G.lives[side] > 0) {
          const good = Math.random() < 0.7;
          const k = G.answers[side].findIndex(a => a.correct === good);
          if (k >= 0) onTap(consoles[side].tiles[k]);
        }
      }
    }
    if (G.auto && G.phase === "over" && startBtn.g.visible) { G.autoT -= dt; if (G.autoT < -2) { G.autoT = 0; restart(); } }
    if (G.auto && G.phase === "start") startCountdown();

    grade.uniforms.uTime.value = G.t;
    composer.render(dt);
  }

  function updateTile(t, dt) {
    t.press = Math.max(0, t.press - dt * 4);
    t.shake = Math.max(0, t.shake - dt * 2.2);
    t.pulse = Math.max(0, t.pulse - dt * 0.8);
    let rotX = 0;
    if (t.flip > 0) {
      const before = t.flip;
      t.flip = Math.max(0, t.flip - dt * 2.6);
      if (before > 0.5 && t.flip <= 0.5 && t.pendingText != null) { setTileText(t, t.pendingText); t.pendingText = null; }
      rotX = (1 - t.flip) * Math.PI * 2 * 0.5;   // nửa vòng đầu: lật đi, nửa sau: lật về
      rotX = t.flip > 0.5 ? (1 - t.flip) * Math.PI : -t.flip * Math.PI;
    }
    t.g.rotation.x = rotX;
    t.g.position.copy(t.home);
    t.g.position.z += -t.press * 0.08;
    if (t.shake > 0) t.g.position.x += Math.sin(G.t * 60) * 0.04 * t.shake;
    const sc = 1 - t.press * 0.04 + t.pulse * 0.06 * Math.sin(G.t * 12);
    t.g.scale.setScalar(sc);
    const tc = t.team.color;
    let body = tc.clone().multiplyScalar(0.42), rim = tc.clone().multiplyScalar(1.5), emis = 0.3, txtOp = 1;
    if (t.state === "picked") { rim = new THREE.Color(3, 3, 3.4); emis = 0.35; }
    else if (t.state === "correct") { body = new THREE.Color("#0f6b45"); rim = new THREE.Color(0.4, 3.6, 1.6); emis = 0.35 + t.pulse; }
    else if (t.state === "wrong") { body = new THREE.Color("#6b0f1c"); rim = new THREE.Color(3.6, 0.4, 0.5); emis = 0.3; }
    else if (t.state === "locked" || t.state === "dim") { body = new THREE.Color("#1b1f29"); rim = tc.clone().multiplyScalar(0.25); emis = 0.02; txtOp = 0.45; }
    t.bodyMat.color.lerp(body, Math.min(1, dt * 10));
    t.rimMat.color.lerp(rim, Math.min(1, dt * 10));
    t.bodyMat.emissiveIntensity = emis;
    t.bodyMat.emissive.copy(t.state === "correct" ? new THREE.Color("#16c47f") : t.state === "wrong" ? new THREE.Color("#ff3b4e") : tc);
    t.text.material.opacity = txtOp;
  }

  requestAnimationFrame(frame);

  return {
    setQuality,
    sim(side, correct) {
      if (G.phase === "start") { startCountdown(); return; }
      if (G.phase !== "play") return;
      const k = G.answers[side].findIndex(a => a.correct === correct);
      if (k >= 0) { G.lockUntil = 0; onTap(consoles[side].tiles[k]); }
    },
    turbo(side) { const r = rockets[side]; r.turbo = 4.5; banner("TURBO!", "cyan", 1100, 0.5); },
    explode(side) { if (G.phase !== "play") return; G.lives[side] = 1; loseLife(side); },
    restart() { if (G.phase === "intro") return; restart(); },
    auto(on) { G.auto = on; G.autoT = 0.5; },
    step(n = 1, dt = 1 / 60) { manual = true; for (let i = 0; i < n; i++) tick(dt); },
    resume() { manual = false; clock.getDelta(); },
    rockets, camera,
    // bàn thử: chép khung hình vừa vẽ ra một ảnh tĩnh phủ màn (khung xem trước ẩn không chụp được canvas WebGL)
    snap() {
      let img = document.getElementById("__snap");
      if (!img) { img = document.createElement("img"); img.id = "__snap"; img.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:4;pointer-events:none"; document.body.append(img); }
      img.src = renderer.domElement.toDataURL("image/jpeg", 0.9);
      return img.src.length;
    },
    unsnap() { document.getElementById("__snap")?.remove(); },
    get state() { return G; }
  };
}
