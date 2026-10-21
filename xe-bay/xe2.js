// XE BAY ROADSTER — mẫu 2 (21/10/2026)
// Thân xe = mẫu AI Sketchfab (khối liền). Mọi chi tiết còn lại dựng bằng code, bám ảnh xe thật
// (Desktop\TESTLA ROADSTER): dải LED trước + 2 đèn tròn, dải đèn đỏ đuôi, 4 lỗ xả đồng, biển ANDREW TEAM,
// 8 ống phụt dưới gầm (2 ống mỗi góc), 4 lỗ phụt hông giữ thăng bằng, bánh nan sao, đèn đỏ gầm, cửa cánh chim.
// Toạ độ: đơn vị MẪU GỐC (dài 1,9 · rộng 0,82 · cao 0,5), mũi xe = +z, mặt đất y = 0. Cả cụm phóng ×SCALE.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { computeBoundsTree, acceleratedRaycast } from "three-mesh-bvh";
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

const SCALE = 2.3;                       // 1 đơn vị mẫu ≈ 2,3 m
// số đo trên mẫu gốc (đo bằng tools trong phiên 21/10: điểm chạm đất + lát cắt ngang)
const WHEEL = { r: 0.158, w: 0.105, x: 0.358, zF: 0.53, zR: -0.632 };
const DOOR = { zF0: 0.31, zF1: 0.215, zR0: -0.2, zR1: -0.235, y0: 0.115, xMin: 0.165, hingeX: 0.15, hingeY: 0.485 };

// ── Cảnh đêm
const view = document.getElementById("view");
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
view.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const NIGHT = new THREE.Color(0x070b16);
scene.background = NIGHT;
scene.fog = new THREE.Fog(NIGHT, 40, 200);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.35;

const NARROW = () => innerWidth / innerHeight < 0.8;
const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 600);
camera.position.set(7.5, 2.6, 8).multiplyScalar(NARROW() ? 1.9 : 1);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.maxPolarAngle = Math.PI * 0.495; controls.minDistance = 3; controls.maxDistance = 40;
controls.target.set(0, 0.8, 0);

scene.add(new THREE.HemisphereLight(0x5a6f99, 0x15110e, 0.55));
const moon = new THREE.DirectionalLight(0xbfd2ff, 1.1);
moon.position.set(-10, 18, 6); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048);
Object.assign(moon.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 60 });
moon.shadow.bias = -0.0004;
scene.add(moon, moon.target);
// 2 đèn sân khấu chiếu vào xe (như buổi ra mắt)
for (const [x, c] of [[9, 0xffffff], [-9, 0xffd9c2]]) {
  const sp = new THREE.SpotLight(c, 55, 40, 0.45, 0.6, 1.6); sp.position.set(x, 9, 4); scene.add(sp, sp.target);
}

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.75, 0.5, 1.25);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ── Mặt đất: bê tông tối + vạch + đèn mép đường băng (cuộn theo tốc độ)
function concreteTex() {
  const c = document.createElement("canvas"); c.width = c.height = 512; const g = c.getContext("2d");
  g.fillStyle = "#24272c"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 12000; i++) { const v = 28 + Math.random() * 22 | 0; g.fillStyle = `rgb(${v},${v + 1},${v + 3})`; g.fillRect(Math.random() * 512, Math.random() * 512, 2, 2); }
  g.fillStyle = "#30343a"; g.fillRect(0, 254, 512, 3);               // khe nối tấm bê tông
  g.fillStyle = "#8b9098"; g.fillRect(250, 0, 12, 230);              // vạch giữa đứt
  g.fillRect(16, 0, 8, 512); g.fillRect(488, 0, 8, 512);             // vạch mép
  return c;
}
const rtex = new THREE.CanvasTexture(concreteTex());
rtex.wrapS = rtex.wrapT = THREE.RepeatWrapping; rtex.colorSpace = THREE.SRGBColorSpace; rtex.anisotropy = 8;
const RUN_W = 30, TILE = 30;
rtex.repeat.set(1, 600 / TILE);
const runway = new THREE.Mesh(new THREE.PlaneGeometry(RUN_W, 600), new THREE.MeshStandardMaterial({ map: rtex, roughness: 0.82, metalness: 0.05 }));
runway.rotation.x = -Math.PI / 2; runway.receiveShadow = true; scene.add(runway);
const field = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), new THREE.MeshStandardMaterial({ color: 0x0c0f12, roughness: 1 }));
field.rotation.x = -Math.PI / 2; field.position.y = -0.02; scene.add(field);
const edgeLights = new THREE.Group(); scene.add(edgeLights);
const edgeMat = new THREE.MeshBasicMaterial({ color: 0xffc56b });
for (let i = 0; i < 40; i++) for (const s of [-1, 1]) {
  const l = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), edgeMat); l.position.set(s * (RUN_W / 2 + 0.6), 0.1, -150 + i * 7.5); edgeLights.add(l);
}
// trời sao
{
  const N = 1500, p = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { const a = Math.random() * Math.PI * 2, e = Math.random() * 0.9 + 0.05, r = 450;
    p[i * 3] = Math.cos(a) * Math.cos(e) * r; p[i * 3 + 1] = Math.sin(e) * r; p[i * 3 + 2] = Math.sin(a) * Math.cos(e) * r; }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xcfdcff, size: 1.4, sizeAttenuation: false, fog: false })));
}

// ── Vật liệu chung
const M = {
  carbon: new THREE.MeshStandardMaterial({ color: 0x15171b, metalness: 0.6, roughness: 0.38 }),
  steel: new THREE.MeshStandardMaterial({ color: 0x9aa3ad, metalness: 1, roughness: 0.22 }),
  bronze: new THREE.MeshStandardMaterial({ color: 0xb07a45, metalness: 1, roughness: 0.3 }),
  black: new THREE.MeshStandardMaterial({ color: 0x050506, metalness: 0.2, roughness: 0.6 }),
  ledWhite: new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0xffffff, emissiveIntensity: 5 }),
  ledRed: new THREE.MeshStandardMaterial({ color: 0x220000, emissive: 0xff1a12, emissiveIntensity: 5 }),
  ledAmberRed: new THREE.MeshStandardMaterial({ color: 0x200500, emissive: 0xff3b1f, emissiveIntensity: 0 }),
  nozzleHot: new THREE.MeshStandardMaterial({ color: 0x0a0d18, emissive: 0x6fb6ff, emissiveIntensity: 0 }),
};

// lửa phụt: nón mở, shader cộng sáng; gốc loe ở y=0, nhọn về y=-1
function flameMat(core, edge, soft = 0) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uT: { value: 0 }, uP: { value: 0 }, uCore: { value: new THREE.Color(core) }, uEdge: { value: new THREE.Color(edge) }, uSoft: { value: soft } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform float uT,uP,uSoft; uniform vec3 uCore,uEdge; varying vec2 vUv;
      float h(float n){return fract(sin(n)*43758.5453);}
      void main(){ float y=vUv.y; float a=sin(vUv.x*6.2832*3.+uT*40.)*.5+.5;
        float n=h(floor(vUv.x*24.)+floor(uT*30.))*.35;
        float f=pow(1.-y,1.4+uSoft*2.)*(0.75+0.25*a)-n*y*(1.-uSoft);
        vec3 c=mix(uEdge,uCore,pow(1.-y,3.));
        float rings=(0.6+0.4*sin(y*40.-uT*60.))*(1.-uSoft);
        gl_FragColor=vec4(c*(1.3+rings*.6),clamp(f,0.,1.)*uP); }`
  });
}
function flameCone(r, mat, rb = 0) {
  const g = new THREE.CylinderGeometry(rb, r, 1, 20, 1, true); g.rotateX(Math.PI); g.translate(0, -0.5, 0);
  const m = new THREE.Mesh(g, mat); m.renderOrder = 5; return m;
}

// ── Khói: hạt mềm, bay xuống rồi loang ra mặt đất, to dần, mờ dần
const SMOKE = 2600;
const sPos = new Float32Array(SMOKE * 3), sVel = new Float32Array(SMOKE * 3), sLife = new Float32Array(SMOKE), sMax = new Float32Array(SMOKE);
const sSize = new Float32Array(SMOKE), sAlpha = new Float32Array(SMOKE), sWarm = new Float32Array(SMOKE);
const sGeo = new THREE.BufferGeometry();
sGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
sGeo.setAttribute("aSize", new THREE.BufferAttribute(sSize, 1));
sGeo.setAttribute("aAlpha", new THREE.BufferAttribute(sAlpha, 1));
sGeo.setAttribute("aWarm", new THREE.BufferAttribute(sWarm, 1));
const smokeTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d");
  for (let k = 0; k < 6; k++) { const x = 40 + Math.random() * 48, y = 40 + Math.random() * 48, r = 30 + Math.random() * 30;
    const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, "rgba(255,255,255,.55)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }
  return new THREE.CanvasTexture(c); })();
const smokeMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false,
  uniforms: { uTex: { value: smokeTex }, uScale: { value: innerHeight / 2 } },
  vertexShader: `uniform float uScale; attribute float aSize, aAlpha, aWarm; varying float vA, vW;
    void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mv; gl_PointSize=aSize*uScale/-mv.z; vA=aAlpha; vW=aWarm; }`,
  fragmentShader: `uniform sampler2D uTex; varying float vA, vW;
    void main(){ vec4 t=texture2D(uTex,gl_PointCoord); vec3 c=mix(vec3(.86,.88,.93),vec3(1.,.62,.55),vW);
      gl_FragColor=vec4(c*(0.55+0.5*vW), t.a*vA); }`
});
const smoke = new THREE.Points(sGeo, smokeMat); smoke.frustumCulled = false; smoke.renderOrder = 4; scene.add(smoke);
for (let i = 0; i < SMOKE; i++) sPos[i * 3 + 1] = -99;
let sNext = 0;
function puff(p, v, size, life, warm = 0) {
  const i = sNext; sNext = (sNext + 1) % SMOKE;
  sPos[i * 3] = p.x; sPos[i * 3 + 1] = p.y; sPos[i * 3 + 2] = p.z;
  sVel[i * 3] = v.x; sVel[i * 3 + 1] = v.y; sVel[i * 3 + 2] = v.z;
  sLife[i] = sMax[i] = life; sSize[i] = size; sWarm[i] = warm;
}

// ── Cụm xe
const car = new THREE.Group(); scene.add(car);          // nâng, nghiêng (đơn vị mét)
const rig = new THREE.Group(); car.add(rig);             // đơn vị mẫu gốc
const status = t => document.getElementById("st").textContent = t;

// Đổi thuộc tính lượng tử hoá (meshopt) sang Float32 để cắt/raycast chính xác
function toFloat(geo) {
  const g = new THREE.BufferGeometry();
  for (const k of ["position", "normal", "uv"]) { const a = geo.getAttribute(k); if (!a) continue;
    const out = new Float32Array(a.count * a.itemSize);
    for (let i = 0; i < a.count; i++) for (let j = 0; j < a.itemSize; j++) out[i * a.itemSize + j] = a.getComponent(i, j);
    g.setAttribute(k, new THREE.BufferAttribute(out, a.itemSize)); }
  g.setIndex(geo.index ? Array.from(geo.index.array) : null);
  return g;
}

const parts = { seals: [], pods: [], side: [], wheels: [], doors: [], interior: null, underGlow: null, underLight: null };
let bodyMesh = null;

const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
loader.load("models/roadster-2026.glb", (gltf) => {
  gltf.scene.updateMatrixWorld(true);
  let src = null; gltf.scene.traverse(o => { if (o.isMesh && !src) src = o; });
  const geo = toFloat(src.geometry); geo.applyMatrix4(src.matrixWorld);
  const map = src.material.map; map.anisotropy = 8;
  const paint = new THREE.MeshPhysicalMaterial({ map, roughness: 0.42, metalness: 0.15, clearcoat: 0.35, clearcoatRoughness: 0.4, side: THREE.FrontSide });
  bodyMesh = new THREE.Mesh(geo, paint); bodyMesh.castShadow = true; bodyMesh.receiveShadow = true;
  geo.computeBoundsTree();
  rig.add(bodyMesh);
  buildAll(geo, paint);
  rig.scale.setScalar(SCALE);
  const ld = document.getElementById("loading"); ld.style.opacity = 0; setTimeout(() => ld.remove(), 700);
  window.__xe = { ready: true, parts };
}, (e) => { if (e.total) document.getElementById("pct").textContent = Math.round(e.loaded / e.total * 100) + "%"; },
   (err) => { document.getElementById("loading").textContent = "Lỗi tải mẫu xe: " + err.message; });

// bắn tia vào thân xe (toạ độ mẫu gốc) → {p, n} hoặc null
const ray = new THREE.Raycaster(); ray.firstHitOnly = true;
function hit(ox, oy, oz, dx, dy, dz) {
  ray.set(new THREE.Vector3(ox, oy, oz), new THREE.Vector3(dx, dy, dz).normalize());
  const h = ray.intersectObject(bodyMesh, false)[0];
  if (!h) return null;
  const n = h.face.normal.clone(); if (n.dot(ray.ray.direction) > 0) n.negate();
  return { p: h.point.clone(), n };
}
// đặt vật lên bề mặt: trục +z của vật quay theo pháp tuyến
function stick(obj, h, off = 0.002) {
  obj.position.copy(h.p).addScaledVector(h.n, off);
  obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), h.n);
}
// dải sáng chạy theo bề mặt: lấy mẫu dọc x tại độ cao y, bắn từ phía dir (+1 trước / -1 sau)
function stripAlong(y, x0, x1, h, dir, mat, off = 0.004, n = 40) {
  const pos = [], idx = [];
  for (let i = 0; i <= n; i++) {
    const x = x0 + (x1 - x0) * i / n;
    const r = hit(x, y, dir * 2, 0, 0, -dir); if (!r) continue;
    const p = r.p.addScaledVector(r.n, off);
    pos.push(p.x, p.y - h / 2, p.z, p.x, p.y + h / 2, p.z);
  }
  for (let i = 0; i < pos.length / 6 - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat); m.material.side = THREE.DoubleSide; return m;
}

function buildAll(geo, paint) {
  buildDoors(geo, paint);
  buildFront();
  buildRear();
  buildWheels();
  buildUnderJets();
  buildSideJets();
  buildUnderGlow();
  buildInterior();
}

// ── Đèn trước: 1 dải LED mảnh hết bề ngang mũi + 2 đèn tròn ở 2 góc trên
function buildFront() {
  const bar = stripAlong(0.163, -0.29, 0.29, 0.009, 1, M.ledWhite, 0.004, 48); rig.add(bar);
  for (const s of [-1, 1]) {
    const h = hit(s * 0.255, 0.205, 2, 0, 0, -1); if (!h) continue;
    const g = new THREE.Group();
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.019, 0.004, 8, 24), M.steel);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.018, 24), M.ledWhite);
    g.add(rim, lens); stick(g, h, 0.003); rig.add(g);
    // đèn chiếu thật ra phía trước
    const sp = new THREE.SpotLight(0xeaf2ff, 40, 30, 0.35, 0.5, 1.5);
    sp.position.copy(h.p); sp.target.position.copy(h.p).add(new THREE.Vector3(0, -0.15, 3)); rig.add(sp, sp.target);
  }
}

// ── Đuôi: dải đèn đỏ hết bề ngang, đèn hông đỏ, 4 lỗ xả đồng, biển ANDREW TEAM + đèn soi biển
function buildRear() {
  rig.add(stripAlong(0.352, -0.33, 0.33, 0.011, -1, M.ledRed, 0.004, 48));
  for (const s of [-1, 1]) {   // đèn hông đỏ nhỏ ở góc sau
    const h = hit(2 * s, 0.25, -0.86, -s, 0, 0); if (!h) continue;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.008), M.ledRed); stick(m, h, 0.003); rig.add(m);
  }
  for (const x of [-0.18, -0.06, 0.06, 0.18]) {
    const h = hit(x, 0.15, -2, 0, 0, 1); if (!h) continue;
    const g = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.006, 10, 28), M.bronze);
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 20, 1, true), M.black); pipe.rotation.x = Math.PI / 2; pipe.position.z = -0.02;
    const back = new THREE.Mesh(new THREE.CircleGeometry(0.02, 20), M.black); back.position.z = -0.035;
    g.add(ring, pipe, back); stick(g, h, 0.004); rig.add(g);
  }
  // biển số
  const c = document.createElement("canvas"); c.width = 512; c.height = 256; const g = c.getContext("2d");
  g.fillStyle = "#f4f5f2"; g.beginPath(); g.roundRect(4, 4, 504, 248, 26); g.fill();
  g.strokeStyle = "#1b1d22"; g.lineWidth = 6; g.beginPath(); g.roundRect(14, 14, 484, 228, 20); g.stroke();
  g.fillStyle = "#16181d"; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = "900 104px 'Exo 2', Arial Black, sans-serif"; g.fillText("ANDREW", 256, 104);
  g.font = "800 62px 'Exo 2', Arial, sans-serif"; g.fillText("T E A M", 256, 192);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const ph = hit(0, 0.235, -2, 0, 0, 1);
  if (ph) {
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.134, 0.067), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35, metalness: 0.1, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.18 }));
    stick(plate, ph, 0.006); plate.up.set(0, 1, 0);
    // giữ biển đứng thẳng (không nghiêng theo bề mặt quá nhiều)
    plate.lookAt(plate.position.clone().add(new THREE.Vector3(0, 0, -1)));
    rig.add(plate);
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.004, 0.006), M.ledWhite); lamp.position.copy(plate.position).add(new THREE.Vector3(0, 0.04, -0.004)); rig.add(lamp);
    parts.plate = plate;
    // chờ font web tải xong thì vẽ lại chữ cho đúng font
    document.fonts && document.fonts.ready.then(() => { g.clearRect(0, 0, 512, 256);
      g.fillStyle = "#f4f5f2"; g.beginPath(); g.roundRect(4, 4, 504, 248, 26); g.fill();
      g.strokeStyle = "#1b1d22"; g.lineWidth = 6; g.beginPath(); g.roundRect(14, 14, 484, 228, 20); g.stroke();
      g.fillStyle = "#16181d"; g.font = "900 104px 'Exo 2', Arial Black, sans-serif"; g.fillText("ANDREW", 256, 104);
      g.font = "800 62px 'Exo 2', Arial, sans-serif"; g.fillText("T E A M", 256, 192); tex.needsUpdate = true; });
  }
}

// ── Bánh: đĩa trắng, 5 cặp nan đen hình sao, logo T giữa, lốp đen có chữ thành lốp
function wheelTextures() {
  const c = document.createElement("canvas"); c.width = c.height = 512; const g = c.getContext("2d");
  g.fillStyle = "#0b0b0c"; g.fillRect(0, 0, 512, 512);
  g.fillStyle = "#7d8288"; g.font = "700 19px Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
  for (const [txt, a0] of [["ANDREW TEAM", -Math.PI / 2], ["ROADSTER · FLY", Math.PI / 2]]) {
    const R = 226; const step = 0.055; const a = a0 - (txt.length - 1) * step / 2;
    for (let i = 0; i < txt.length; i++) { const t = a + i * step; g.save(); g.translate(256 + Math.cos(t) * R, 256 + Math.sin(t) * R); g.rotate(t + Math.PI / 2); g.fillText(txt[i], 0, 0); g.restore(); }
  }
  const side = new THREE.CanvasTexture(c); side.colorSpace = THREE.SRGBColorSpace;
  const k = document.createElement("canvas"); k.width = k.height = 128; const q = k.getContext("2d");
  q.fillStyle = "#1a1c20"; q.beginPath(); q.arc(64, 64, 62, 0, Math.PI * 2); q.fill();
  q.fillStyle = "#e9ecef"; q.font = "900 84px Arial Black, sans-serif"; q.textAlign = "center"; q.textBaseline = "middle"; q.fillText("T", 64, 70);
  const cap = new THREE.CanvasTexture(k); cap.colorSpace = THREE.SRGBColorSpace;
  return { side, cap };
}
function makeWheel(s) {
  const T = wheelTextures.cache ||= wheelTextures();
  const R = WHEEL.r, Wd = WHEEL.w, rimR = R * 0.68;
  const w = new THREE.Group();             // trục quay = x
  const spin = new THREE.Group(); w.add(spin);
  // lốp: lathe theo tiết diện bo tròn
  const prof = [];
  for (let i = 0; i <= 16; i++) { const t = i / 16 * Math.PI; prof.push(new THREE.Vector2(rimR + (R - rimR) * (0.55 + 0.45 * Math.sin(t)), -Wd / 2 + Wd * i / 16)); }
  const tireG = new THREE.LatheGeometry(prof, 48); tireG.rotateZ(Math.PI / 2);
  const tire = new THREE.Mesh(tireG, new THREE.MeshStandardMaterial({ color: 0x0d0d0e, roughness: 0.85 })); tire.castShadow = true; spin.add(tire);
  // thành lốp có chữ (vòng phẳng phía ngoài)
  const wallG = new THREE.RingGeometry(rimR * 1.0, R * 0.985, 64, 1);
  { const uv = wallG.attributes.uv, p = wallG.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / (2 * R) + 0.5, p.getY(i) / (2 * R) + 0.5); }
  const wall = new THREE.Mesh(wallG, new THREE.MeshStandardMaterial({ map: T.side, roughness: 0.8 }));
  wall.rotation.y = s * Math.PI / 2; wall.position.x = s * (Wd / 2 + 0.001); spin.add(wall);
  // đĩa trắng (hơi lõm vào trong)
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(rimR, rimR, 0.01, 48), new THREE.MeshPhysicalMaterial({ color: 0xeceef0, roughness: 0.3, metalness: 0.3, clearcoat: 0.8 }));
  disc.rotation.z = Math.PI / 2; disc.position.x = s * (Wd / 2 - 0.012); spin.add(disc);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(rimR, 0.004, 8, 48), M.steel); lip.rotation.y = Math.PI / 2; lip.position.x = s * (Wd / 2 - 0.004); spin.add(lip);
  // 5 cặp nan đen (mỗi cặp 2 lưỡi chụm lại ở tâm, toả ra ở vành)
  const bladeG = new THREE.BoxGeometry(0.006, rimR * 0.92, 0.011); bladeG.translate(0, rimR * 0.46, 0);
  const bladeM = new THREE.MeshStandardMaterial({ color: 0x0c0d10, metalness: 0.7, roughness: 0.28 });
  const edgeM = new THREE.MeshStandardMaterial({ color: 0x7e858e, metalness: 1, roughness: 0.2 });
  for (let k = 0; k < 5; k++) for (const side of [-1, 1]) {
    const b = new THREE.Group(); b.rotation.x = k * Math.PI * 2 / 5;
    const bl = new THREE.Mesh(bladeG, bladeM); bl.rotation.x = side * 0.13; bl.position.x = s * (Wd / 2 - 0.004);
    const ed = new THREE.Mesh(bladeG, edgeM); ed.scale.set(0.5, 1, 0.35); ed.rotation.x = side * 0.13; ed.position.x = s * (Wd / 2 - 0.0005); ed.position.z = side * 0.004;
    b.add(bl, ed); spin.add(b);
  }
  // nắp giữa logo T
  const capM = new THREE.Mesh(new THREE.CircleGeometry(0.022, 32), new THREE.MeshStandardMaterial({ map: T.cap, metalness: 0.5, roughness: 0.3 }));
  capM.rotation.y = s * Math.PI / 2; capM.position.x = s * (Wd / 2 + 0.002); spin.add(capM);
  // kẹp phanh đỏ (không quay)
  const cal = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.05, 0.03), new THREE.MeshStandardMaterial({ color: 0xb3140f, roughness: 0.4 }));
  cal.position.set(s * (Wd / 2 - 0.03), 0.055, -0.04); w.add(cal);
  w.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { w, spin };
}
function buildWheels() {
  for (const z of [WHEEL.zF, WHEEL.zR]) for (const s of [-1, 1]) {
    const { w, spin } = makeWheel(s);
    w.position.set(s * WHEEL.x, WHEEL.r, z); rig.add(w); parts.wheels.push(spin);
  }
}

// ── 8 ống phụt dưới gầm: 2 ống mỗi góc, phụt thẳng xuống
function buildUnderJets() {
  const spots = [];
  for (const s of [-1, 1]) for (const [zc, f] of [[WHEEL.zF + 0.2, 1], [WHEEL.zR - 0.19, -1]]) {
    spots.push([s * 0.28, zc - f * 0.03], [s * 0.21, zc + f * 0.035]);
  }
  for (const [x, z] of spots) {
    const h = hit(x, -1, z, 0, 1, 0); const y = h ? h.p.y : 0.06;
    const pod = new THREE.Group(); pod.position.set(x, y, z);
    const tilt = new THREE.Group(); pod.add(tilt);
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.026, 0.035, 20, 1, true), M.steel); bell.position.y = -0.0175; tilt.add(bell);
    const mount = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 20), M.carbon); tilt.add(mount);
    const hot = new THREE.Mesh(new THREE.CircleGeometry(0.022, 20), M.nozzleHot); hot.rotation.x = Math.PI / 2; hot.position.y = -0.03; tilt.add(hot);
    const fm = flameMat(0xeaf6ff, 0x2f7dff); const fl = flameCone(0.024, fm, 0.004); fl.position.y = -0.035; tilt.add(fl);
    const cm = flameMat(0xffffff, 0x9fc4ff, 1); const col = flameCone(0.03, cm, 0.07); col.position.y = -0.035; tilt.add(col);   // cột khí trắng loe dần xuống đất
    bell.castShadow = true;
    rig.add(pod); parts.pods.push({ pod, tilt, fl, fm, col, cm, x, z, y });
  }
}

// ── 4 lỗ phụt hông (trước + sau mỗi bên), phun ngang từng luồng để giữ thăng bằng
function buildSideJets() {
  for (const s of [-1, 1]) for (const z of [0.8, -0.84]) {
    const h = hit(s * 2, 0.12, z, -s, 0, 0); if (!h) continue;
    const g = new THREE.Group(); stick(g, h, 0.001);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.003, 8, 20), M.steel);
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.012, 20), M.nozzleHot);
    const fm = flameMat(0xffffff, 0x7fb2ff, 0.4); const fl = flameCone(0.012, fm, 0.03); fl.rotation.x = -Math.PI / 2;   // phụt dọc +z cục bộ = ra ngoài
    g.add(ring, hole, fl); rig.add(g);
    parts.side.push({ g, fl, fm, s, z, t: 0, pow: 0, out: h.n.clone(), at: h.p.clone() });
  }
}

// ── Đèn đỏ dưới gầm (dải sáng dọc 2 bên sàn + đèn rọi xuống khói)
function buildUnderGlow() {
  const g = new THREE.Group();
  for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.004, 0.95), M.ledAmberRed); m.position.set(s * 0.3, 0.043, -0.05); g.add(m); }
  for (const z of [0.32, -0.42]) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.004, 0.01), M.ledAmberRed); m.position.set(0, 0.043, z); g.add(m); }
  rig.add(g); parts.underGlow = g;
  const L = new THREE.PointLight(0xff3a20, 0, 8, 1.6); L.position.set(0, 0.0, 0); rig.add(L); parts.underLight = L;
}

// ── Cửa cánh chim: cắt tam giác vùng cửa ra mẫu riêng, xoay quanh bản lề dọc mép mái
function buildDoors(geo, paint) {
  const P = geo.attributes.position.array, I = geo.index.array;
  const keep = [], door = { "-1": [], "1": [] };
  const zF = y => DOOR.zF0 + (DOOR.zF1 - DOOR.zF0) * (y - DOOR.y0) / (DOOR.hingeY - DOOR.y0);
  const zR = y => DOOR.zR0 + (DOOR.zR1 - DOOR.zR0) * (y - DOOR.y0) / (DOOR.hingeY - DOOR.y0);
  // gioăng đen chạy theo 2 mép cửa trên thân xe — che mép cắt răng cưa của lưới AI (bắn tia TRƯỚC khi cắt)
  const seal = new THREE.MeshStandardMaterial({ color: 0x0b0c0e, roughness: 0.7, side: THREE.DoubleSide });
  for (const s of [-1, 1]) for (const edge of [zF, zR]) {
    const pos = [], idx = [], N = 18;
    for (let i = 0; i <= N; i++) {
      const y = DOOR.y0 + (DOOR.hingeY - 0.03 - DOOR.y0) * i / N, z = edge(y);
      const h = hit(s * 2, y, z, -s, 0, 0); if (!h) continue;
      const q = h.p.addScaledVector(h.n, 0.003);
      pos.push(q.x, q.y, q.z - 0.022, q.x, q.y, q.z + 0.022);
    }
    for (let i = 0; i < pos.length / 6 - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    const sm = new THREE.Mesh(g, seal); sm.visible = false; rig.add(sm); parts.seals.push(sm);   // chỉ hiện khi cửa mở
  }
  for (let t = 0; t < I.length; t += 3) {
    const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3;
    const cx = (P[a] + P[b] + P[c]) / 3, cy = (P[a + 1] + P[b + 1] + P[c + 1]) / 3, cz = (P[a + 2] + P[b + 2] + P[c + 2]) / 3;
    const inDoor = Math.abs(cx) > DOOR.xMin && cy > DOOR.y0 && cy < DOOR.hingeY + 0.01 && cz < zF(cy) && cz > zR(cy);
    if (inDoor) door[cx > 0 ? "1" : "-1"].push(I[t], I[t + 1], I[t + 2]); else keep.push(I[t], I[t + 1], I[t + 2]);
  }
  geo.setIndex(keep);
  const doorMat = paint.clone(); doorMat.side = THREE.DoubleSide;
  for (const s of [-1, 1]) {
    const dg = new THREE.BufferGeometry();
    for (const k of ["position", "normal", "uv"]) dg.setAttribute(k, geo.getAttribute(k));
    dg.setIndex(door[String(s)]);
    const piv = new THREE.Group(); piv.position.set(s * DOOR.hingeX, DOOR.hingeY, 0);
    const m = new THREE.Mesh(dg, doorMat); m.position.set(-s * DOOR.hingeX, -DOOR.hingeY, 0); m.castShadow = true;
    piv.add(m); rig.add(piv); parts.doors.push({ piv, s });
  }
  geo.computeBoundsTree();   // tính lại sau khi bớt tam giác cửa
}

// ── Khoang lái (chỉ hiện khi mở cửa): sàn, 2 ghế, táp-lô, vô lăng, vách trong
function buildInterior() {
  const g = new THREE.Group();
  const trim = new THREE.MeshStandardMaterial({ color: 0x1b1c20, roughness: 0.7 });
  const seat = new THREE.MeshStandardMaterial({ color: 0x24252b, roughness: 0.55 });
  const accent = new THREE.MeshStandardMaterial({ color: 0x1a0d06, emissive: 0xff6a2a, emissiveIntensity: 1.6 });
  const box = (w, h, d, x, y, z, m, rx = 0) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.rotation.x = rx; g.add(b); return b; };
  box(0.62, 0.01, 0.6, 0, 0.1, 0.02, trim);                         // sàn
  box(0.62, 0.3, 0.01, 0, 0.25, -0.24, trim);                       // vách sau
  box(0.62, 0.12, 0.14, 0, 0.27, 0.3, trim, -0.35);                 // táp-lô
  box(0.5, 0.006, 0.006, 0, 0.3, 0.255, accent);                    // dải đèn cam táp-lô
  box(0.07, 0.14, 0.5, 0, 0.16, 0.02, trim);                        // bệ giữa
  for (const s of [-1, 1]) {
    box(0.15, 0.045, 0.2, s * 0.165, 0.14, -0.05, seat);            // đệm ngồi
    box(0.15, 0.24, 0.045, s * 0.165, 0.27, -0.17, seat, 0.32);     // lưng ghế
    box(0.004, 0.18, 0.004, s * 0.12, 0.27, -0.16, accent, 0.32);   // viền cam
    box(0.012, 0.07, 0.5, s * 0.335, 0.15, 0.03, trim);             // bậu cửa thấp (để nhìn thấy ghế)
  }
  const sw = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.008, 10, 28, Math.PI * 1.4), seat);
  sw.position.set(0.165, 0.29, 0.2); sw.rotation.set(-0.5, 0, Math.PI * 0.8); g.add(sw);   // vô lăng (ghế lái bên trái = +x)
  g.visible = false; rig.add(g); parts.interior = g;
}

// ── Trạng thái
// lift 0→1 lực phụt · alt độ cao (m) · fwd 0→1 bay tới · speed m/s · door 0→1 cửa
const S = { mode: "park", lift: 0, alt: 0, fwd: 0, speed: 0, t: 0, cam: 0, door: 0, doorOpen: false, roll: 0, rollV: 0 };
const ALT_HOVER = 3.6, V_MAX = 55;
const $ = id => document.getElementById(id);
function setBtns() {
  $("bUp").disabled = S.mode !== "park" || S.door > 0.02;
  $("bGo").disabled = !(S.mode === "hover" || S.mode === "cruise");
  $("bGo").classList.toggle("on", S.mode === "cruise");
  $("bDown").disabled = !(S.mode === "hover" || S.mode === "cruise");
  $("bDoor").disabled = S.mode !== "park";
  $("bDoor").textContent = S.doorOpen ? "🚪 ĐÓNG CỬA" : "🚪 MỞ CỬA";
}
$("bUp").onclick = () => { S.mode = "takeoff"; status("Mở 8 ống phụt gầm · cất cánh…"); setBtns(); };
$("bGo").onclick = () => { S.mode = S.mode === "cruise" ? "hover" : "cruise"; status(S.mode === "cruise" ? "Ống phụt ngả về sau · bay tới!" : "Lơ lửng · ống hông giữ thăng bằng"); setBtns(); };
$("bDown").onclick = () => { S.mode = "landing"; status("Hạ cánh…"); setBtns(); };
$("bDoor").onclick = () => { S.doorOpen = !S.doorOpen; status(S.doorOpen ? "Mở cửa cánh chim" : "Đóng cửa"); setBtns(); };
const CAMS = ["Tự xoay", "Đuổi theo", "Bên hông", "Đuôi xe", "Gầm xe"];
$("bCam").onclick = () => { S.cam = (S.cam + 1) % CAMS.length; $("bCam").textContent = "🎥 " + CAMS[S.cam]; controls.enabled = S.cam === 0; };
addEventListener("keydown", e => { if (e.code === "Space") { e.preventDefault(); for (const b of ["bUp", "bGo"]) if (!$(b).disabled) { $(b).click(); break; } } });
setBtns();

const ease = (cur, to, k, dt) => cur + (to - cur) * (1 - Math.exp(-k * dt));
const clock = new THREE.Clock();
const camOff = new THREE.Vector3(), tmp = new THREE.Vector3(), tmpV = new THREE.Vector3(), down = new THREE.Vector3();
const lerpTo = new THREE.Vector3();

function updateSmoke(dt) {
  for (let i = 0; i < SMOKE; i++) {
    if (sLife[i] <= 0) { sAlpha[i] = 0; continue; }
    sLife[i] -= dt; const k = 1 - sLife[i] / sMax[i];
    let y = sPos[i * 3 + 1] + sVel[i * 3 + 1] * dt;
    if (y < 0.15 && sVel[i * 3 + 1] < 0) {        // chạm đất → loang ngang + bốc nhẹ
      y = 0.15; const sp = Math.hypot(sVel[i * 3], sVel[i * 3 + 2]) + Math.abs(sVel[i * 3 + 1]) * 0.6;
      const a = Math.random() * Math.PI * 2; sVel[i * 3] = Math.cos(a) * sp; sVel[i * 3 + 2] = Math.sin(a) * sp; sVel[i * 3 + 1] = 0.25 + Math.random() * 0.5;
    }
    sPos[i * 3] += sVel[i * 3] * dt; sPos[i * 3 + 1] = y; sPos[i * 3 + 2] += (sVel[i * 3 + 2] - S.speed) * dt;
    const drag = Math.exp(-1.3 * dt); sVel[i * 3] *= drag; sVel[i * 3 + 2] *= drag; sVel[i * 3 + 1] = sVel[i * 3 + 1] < 0 ? sVel[i * 3 + 1] * Math.exp(-0.6 * dt) : sVel[i * 3 + 1] * drag;
    sSize[i] += dt * (0.9 + k * 2.2);
    sAlpha[i] = Math.min(1, k * 8) * (1 - k) * 0.55;
    sWarm[i] *= Math.exp(-1.5 * dt);
  }
  sGeo.attributes.position.needsUpdate = true; sGeo.attributes.aSize.needsUpdate = true; sGeo.attributes.aAlpha.needsUpdate = true; sGeo.attributes.aWarm.needsUpdate = true;
}

function tick() {
  const dt = Math.min(clock.getDelta(), 0.05); S.t += dt;
  if (!bodyMesh) { composer.render(); return; }

  // máy trạng thái
  if (S.mode === "takeoff") {
    S.lift = ease(S.lift, 1, 2.2, dt);
    if (S.lift > 0.6) S.alt = ease(S.alt, ALT_HOVER, 0.8, dt);
    if (S.alt > ALT_HOVER - 0.15) { S.mode = "hover"; status("Lơ lửng · bấm BAY TỚI"); setBtns(); }
  } else if (S.mode === "hover") {
    S.fwd = ease(S.fwd, 0, 3, dt); S.speed = ease(S.speed, 0, 0.8, dt); S.alt = ease(S.alt, ALT_HOVER, 1.5, dt); S.lift = ease(S.lift, 1, 3, dt);
  } else if (S.mode === "cruise") {
    S.fwd = ease(S.fwd, 1, 2.5, dt); S.speed = ease(S.speed, V_MAX, 0.32, dt); S.alt = ease(S.alt, ALT_HOVER + 1.2, 0.6, dt);
  } else if (S.mode === "landing") {
    S.fwd = ease(S.fwd, 0, 3, dt); S.speed = ease(S.speed, 0, 1.2, dt);
    if (S.speed < 3) S.alt = Math.max(0, S.alt - dt * (0.5 + S.alt * 0.4));
    S.lift = S.alt > 0.02 ? ease(S.lift, 0.8, 3, dt) : ease(S.lift, 0, 2.5, dt);
    if (S.alt <= 0 && S.lift < 0.04) { S.mode = "park"; S.lift = 0; status("Đã đáp xuống đường băng"); setBtns(); }
  }
  S.door = THREE.MathUtils.clamp(S.door + (S.doorOpen ? dt : -dt) / 1.6, 0, 1);
  if (S.mode === "park") setBtns();

  // cửa cánh chim
  const dOpen = THREE.MathUtils.smootherstep(S.door, 0, 1);
  for (const d of parts.doors) d.piv.rotation.z = d.s * dOpen * 1.15;
  parts.interior.visible = S.door > 0.005;
  for (const sm of parts.seals) sm.visible = S.door > 0.005;

  // thăng bằng: xe chao nhẹ (lò xo), ống hông bên thấp phun để đẩy lại
  const air = S.alt > 0.05 ? 1 : 0;
  S.rollV += (-S.roll * 6 - S.rollV * 1.2 + (Math.random() - 0.5) * 3.2 * air * S.lift) * dt;
  S.roll += S.rollV * dt; if (!air) { S.roll *= 0.9; S.rollV *= 0.9; }

  // ống phụt gầm
  const thrust = S.lift;
  for (const p of parts.pods) {
    p.tilt.rotation.x = ease(p.tilt.rotation.x, -S.fwd * 0.55, 3, dt);     // ngả về sau khi bay tới
    p.fm.uniforms.uT.value = S.t; p.cm.uniforms.uT.value = S.t + 0.7;
    const fl = 0.85 + 0.15 * Math.sin(S.t * 37 + p.x * 50);
    p.fm.uniforms.uP.value = thrust * fl; p.fl.scale.set(1, 0.06 + thrust * 0.14 * fl, 1);
    const toGround = (S.alt / SCALE + p.y + 0.02) / Math.cos(p.tilt.rotation.x);
    p.cm.uniforms.uP.value = thrust * 0.35; p.col.scale.set(1 + S.alt * 0.05, Math.max(0.05, Math.min(toGround, 1.6)), 1 + S.alt * 0.05);
    // khói: phun từ miệng ống, hướng theo ống
    if (thrust > 0.05) {
      const n = Math.floor(thrust * 85 * dt + Math.random());
      for (let k = 0; k < n; k++) {
        p.tilt.localToWorld(tmp.set(0, -0.04, 0));
        down.set(0, -1, 0).applyQuaternion(p.tilt.getWorldQuaternion(new THREE.Quaternion()));
        const v = 14 + Math.random() * 5;
        tmpV.copy(down).multiplyScalar(v).add(new THREE.Vector3((Math.random() - 0.5) * 1.2, 0, (Math.random() - 0.5) * 1.2));
        puff(tmp, tmpV, 0.35 + Math.random() * 0.3, 1.6 + Math.random() * 1.6, 0.9);
      }
    }
  }
  M.nozzleHot.emissiveIntensity = thrust * 4;
  M.ledAmberRed.emissiveIntensity = Math.max(S.lift, S.alt > 0 ? 1 : 0) * 4;
  parts.underLight.intensity = S.lift * 12;

  // ống hông: bên nào chúi xuống thì phun bên đó (đẩy lên); thêm nhịp ngẫu nhiên nhỏ khi lơ lửng
  for (const j of parts.side) {
    const need = air * Math.max(0, -j.s * S.roll * 18 + (Math.random() < 0.004 * S.lift ? 1 : 0));
    j.pow = Math.max(j.pow - dt * 3.5, Math.min(1, need));
    j.fm.uniforms.uT.value = S.t; j.fm.uniforms.uP.value = j.pow;
    j.fl.scale.set(1, 0.05 + j.pow * 0.22, 1);
    if (j.pow > 0.25 && Math.random() < 0.7) {
      j.g.localToWorld(tmp.set(0, 0, 0.02));
      tmpV.copy(j.out).applyQuaternion(rig.getWorldQuaternion(new THREE.Quaternion())).multiplyScalar(9 + Math.random() * 3); tmpV.y += 0.4;
      puff(tmp, tmpV, 0.12, 0.5 + Math.random() * 0.3, 0.2);
    }
  }

  // bánh quay theo tốc độ khi còn trên đất, lúc bay quay chậm dần
  for (const w of parts.wheels) w.rotation.x += dt * (S.alt < 0.05 ? S.speed / (WHEEL.r * SCALE) : 0.3 * (1 - S.lift));

  // thân xe
  const bob = S.lift * air * (Math.sin(S.t * 1.6) * 0.1 + Math.sin(S.t * 2.7) * 0.04);
  const shake = S.lift * 0.006 + S.fwd * 0.006;
  car.position.set((Math.random() - 0.5) * shake, S.alt + bob, (Math.random() - 0.5) * shake);
  car.rotation.x = ease(car.rotation.x, S.mode === "cruise" ? 0.05 : (S.mode === "takeoff" && S.lift > 0.6 ? -0.03 : 0), 2, dt);
  car.rotation.z = S.roll;

  // cuộn mặt đất
  rtex.offset.y += S.speed * dt / TILE;
  for (const l of edgeLights.children) { l.position.z -= S.speed * dt; if (l.position.z < -150) l.position.z += 40 * 7.5; }
  updateSmoke(dt);

  // camera
  if (S.cam === 0) { controls.target.lerp(lerpTo.set(0, car.position.y + 0.6, 0), 0.08); controls.update(); }
  else {
    const n = NARROW() ? 1.8 : 1;
    if (S.cam === 1) camOff.set(2.2, 1.8 + S.alt * 0.15, -9 - S.fwd * 2);
    else if (S.cam === 2) camOff.set(8.5, 0.9, 0.5);
    else if (S.cam === 3) camOff.set(0.6, 0.9, -4.2);
    else camOff.set(3.5, -Math.min(S.alt, 2.5) + 0.25, 1.2);
    camOff.multiplyScalar(n);
    camera.position.lerp(tmp.copy(car.position).add(camOff), 0.08);
    if (camera.position.y < 0.12) camera.position.y = 0.12;
    camera.lookAt(car.position.x, car.position.y + (S.cam === 4 ? 0.1 : 0.55), car.position.z + (S.cam === 1 ? 3 : 0));
  }
  camera.fov = ease(camera.fov, 40 + S.fwd * 10, 2, dt); camera.updateProjectionMatrix();
  smokeMat.uniforms.uScale.value = renderer.domElement.height / renderer.getPixelRatio() / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)) * renderer.getPixelRatio();
  moon.position.set(car.position.x - 10, car.position.y + 18, 6); moon.target.position.copy(car.position);

  $("alt").textContent = Math.max(0, S.alt).toFixed(1);
  $("spd").textContent = Math.round(S.speed * 3.6);
  composer.render();
}
renderer.setAnimationLoop(tick);
addEventListener("resize", () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight); });
window.__S = S; window.__dbg = { bloom, renderer, scene, camera, rig, hit };
