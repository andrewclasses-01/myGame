// XE BAY FERRARI — mẫu 3 (21/10/2026)
// Thân xe = "2023 Ferrari 296 GTS" (ddiaz-design, Sketchfab). Phần bay dựng bằng code:
// 4 miệng đẩy nằm sát sàn (phụt xuống, gần như không thấy), 4 ống đẩy đuôi (bay tới), 4 lỗ đẩy hông (giữ thăng bằng),
// đèn đỏ gầm, biển ANDREW TEAM. Đơn vị: MÉT, mũi xe = +z, mặt đất y = 0.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { computeBoundsTree, acceleratedRaycast } from "three-mesh-bvh";
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;


const MODEL_SCALE = 100;                 // mẫu gốc tính bằng 1/100 m
const WHEEL_R = 0.35;                    // bán kính bánh (m) — đo hộp bao cụm bánh
// vị trí ống đẩy (m), đo trên mẫu: thân rộng ±1,16 · dài −2,29…+2,28 · bánh trước z 1,13 · bánh sau z −1,47
// gầm: 2 ống ngay sau bánh trước (bánh trước z 1,13 r 0,35) + 2 ống sau bánh sau (bánh sau z −1,47)
const UNDER = [[-0.6, 0.7], [0.6, 0.7], [-0.6, -1.93], [0.6, -1.93]];
const UNDER_R = 0.026;
const REAR = { xs: [-0.4, -0.135, 0.135, 0.4], y: 0.575, r: 0.033 };   // 4 lỗ nhỏ xếp hàng trong dải lưới đen dưới đèn hậu
const SIDE = { zs: [1.75, -1.95], y: 0.45 };
const PLATE = { y: 0.4, w: 0.42 };


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
  hole: new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide }),   // lòng ống: đen tuyệt đối = sâu
  pipe: new THREE.MeshStandardMaterial({ color: 0x1c1d20, metalness: 0.85, roughness: 0.3, side: THREE.DoubleSide }),
  ledWhite: new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0xffffff, emissiveIntensity: 5 }),
  ledRed: new THREE.MeshStandardMaterial({ color: 0x220000, emissive: 0xff1a12, emissiveIntensity: 5 }),
  ledAmberRed: new THREE.MeshStandardMaterial({ color: 0x200500, emissive: 0xff3b1f, emissiveIntensity: 0 }),
  nozzleHot: new THREE.MeshStandardMaterial({ color: 0x0a0d18, emissive: 0x6fb6ff, emissiveIntensity: 0 }),
  rearHot: new THREE.MeshStandardMaterial({ color: 0x0a0d18, emissive: 0x8fc0ff, emissiveIntensity: 0 }),
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

// cột khói trắng (KHÔNG phát sáng): nón mở, hoà trộn thường, mờ dần về cuối + gợn chuyển động
function plumeMat() {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: { uT: { value: 0 }, uP: { value: 0 } },
    vertexShader: `varying vec2 vUv; varying vec3 vN, vV; void main(){ vUv=uv; vec4 mv=modelViewMatrix*vec4(position,1.); vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `uniform float uT,uP; varying vec2 vUv; varying vec3 vN, vV;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
      void main(){ float y=vUv.y;
        float edge=pow(abs(dot(normalize(vN),normalize(vV))),0.8);          // giữa đặc, mép mờ
        float turb=n2(vec2(vUv.x*10.,y*7.-uT*9.))*.5+n2(vec2(vUv.x*22.,y*15.-uT*16.))*.35;
        float a=uP*edge*(1.-pow(y,1.3))*(0.45+0.55*turb)*smoothstep(0.,0.06,y+0.02);
        gl_FragColor=vec4(vec3(0.93,0.95,0.98)*(0.85+0.15*turb),clamp(a,0.,0.85)); }`
  });
}

// ── Khói: hạt mềm, bay xuống rồi loang ra mặt đất, to dần, mờ dần
const SMOKE = 6000;
const sPos = new Float32Array(SMOKE * 3), sVel = new Float32Array(SMOKE * 3), sLife = new Float32Array(SMOKE), sMax = new Float32Array(SMOKE);
const sSize = new Float32Array(SMOKE), sAlpha = new Float32Array(SMOKE), sWarm = new Float32Array(SMOKE), sMul = new Float32Array(SMOKE);   // sMul: độ đặc riêng từng hạt
// sFol: phần tốc độ xe mà hạt còn bám theo (1 = đi cùng xe) · sLim: quãng (m) được bám theo trước khi bị gió cuốn · sDist: quãng đã đi
const sFol = new Float32Array(SMOKE), sLim = new Float32Array(SMOKE), sDist = new Float32Array(SMOKE), sGrow = new Float32Array(SMOKE), sDrag = new Float32Array(SMOKE);   // sGrow: độ nở riêng · sDrag: lực cản riêng
const sOwn = new Uint8Array(SMOKE);                                  // sOwn: hạt thuộc nhịp phụt số mấy (0 = hạt tự do)
const NB = 64, bEnv = new Float32Array(NB), bT = new Float32Array(NB), bLive = new Uint8Array(NB); let bNext = 0;
const B_EMIT = 0.11, B_HOLD = 0.07, B_FADE = 0.22;                    // phụt 0,11 s → giữ nguyên 0,07 s → cả dải mờ đều trong 0,22 s
function newBurst() { const b = bNext; bNext = (bNext + 1) % NB; bT[b] = 0; bEnv[b] = 1; bLive[b] = 1; return b; }
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
    void main(){ vec4 t=texture2D(uTex,gl_PointCoord); vec3 c=mix(vec3(.9,.92,.96),vec3(.8,.9,1.),vW*.7);
      gl_FragColor=vec4(c*(0.55+0.6*vW), t.a*vA); }`
});
const smoke = new THREE.Points(sGeo, smokeMat); smoke.frustumCulled = false; smoke.renderOrder = 4; scene.add(smoke);
for (let i = 0; i < SMOKE; i++) sPos[i * 3 + 1] = -99;
let sNext = 0, curDt = 1 / 60;
function puff(p, v, size, life, warm = 0, fol = 0, lim = 0, mul = 1, grow = 1, drag = 1.3, own = 0) {
  const i = sNext; sNext = (sNext + 1) % SMOKE;
  // rải đều dọc quãng đi trong 1 khung (chống khói rời thành cục khi bay nhanh)
  const j = Math.random(), back = S.speed * (1 - fol), tj = curDt * j, dj = (1 - Math.exp(-drag * tj)) / drag;
  sPos[i * 3] = p.x + v.x * dj; sPos[i * 3 + 1] = p.y + v.y * tj; sPos[i * 3 + 2] = p.z + v.z * dj - back * tj;
  sVel[i * 3] = v.x; sVel[i * 3 + 1] = v.y; sVel[i * 3 + 2] = v.z;
  sLife[i] = sMax[i] = life; sSize[i] = size; sWarm[i] = warm; sMul[i] = mul;
  sFol[i] = fol; sLim[i] = lim; sDist[i] = 0; sGrow[i] = grow; sDrag[i] = drag; sOwn[i] = own;
}

// ── Cụm xe (đơn vị MÉT; mũi xe = +z; mặt đất y = 0)
const car = new THREE.Group(); scene.add(car);          // nâng, nghiêng
const status = t => document.getElementById("st").textContent = t;
const parts = { under: [], rear: [], side: [], wheels: [], underGlow: null, underLight: null };
let bodyMeshes = null;

const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
loader.load("models/ferrari-296-gts.glb", (gltf) => {
  const model = gltf.scene;
  model.scale.setScalar(MODEL_SCALE);
  car.add(model); car.updateMatrixWorld(true);
  bodyMeshes = [];
  model.traverse(o => {
    if (!o.isMesh) return;
    o.castShadow = true; o.receiveShadow = true;
    const m = o.material;
    if (m.map) m.map.anisotropy = 8;
    if (/Paint/i.test(m.name)) { m.envMapIntensity = 1.2; }
    if (/Window/i.test(m.name)) { m.transparent = true; m.depthWrite = false; o.castShadow = false; }
  });
  // 4 bánh: dời mỗi cụm vào một trục quay đặt đúng tâm bánh (tâm hộp bao)
  const box = new THREE.Box3(), c = new THREE.Vector3();
  for (const key of ["LF", "RF", "LB", "RB"]) {
    const g = model.getObjectByName("Wheel_" + key); if (!g) continue;
    box.setFromObject(g); box.getCenter(c);
    const piv = new THREE.Group(); piv.position.copy(c); car.add(piv);
    piv.attach(g);                                                    // giữ nguyên vị trí thế giới
    parts.wheels.push(piv);
  }
  model.getObjectByName("Body").traverse(o => { if (o.isMesh && !/Window/i.test(o.material.name)) { o.geometry.computeBoundsTree(); bodyMeshes.push(o); } });
  buildAll();
  const ld = document.getElementById("loading"); ld.style.opacity = 0; setTimeout(() => ld.remove(), 700);
  window.__xe = { ready: true, parts, model };
}, (e) => { if (e.total) document.getElementById("pct").textContent = Math.round(e.loaded / e.total * 100) + "%"; },
   (err) => { document.getElementById("loading").textContent = "Lỗi tải mẫu xe: " + err.message; });

// bắn tia vào thân xe (toạ độ xe, mét) → {p, n} hoặc null
const ray = new THREE.Raycaster(); ray.firstHitOnly = true;
function hit(ox, oy, oz, dx, dy, dz) {
  car.updateMatrixWorld(true);
  const inv = car.matrixWorld.clone().invert();
  const o = new THREE.Vector3(ox, oy, oz).applyMatrix4(car.matrixWorld), d = new THREE.Vector3(dx, dy, dz).transformDirection(car.matrixWorld);
  ray.set(o, d);
  const h = ray.intersectObjects(bodyMeshes, false)[0];
  if (!h) return null;
  const n = h.face.normal.clone().transformDirection(h.object.matrixWorld).transformDirection(inv);
  if (n.dot(new THREE.Vector3(dx, dy, dz)) > 0) n.negate();
  return { p: h.point.applyMatrix4(inv), n };
}
function stick(obj, h, off = 0.004) {
  obj.position.copy(h.p).addScaledVector(h.n, off);
  obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), h.n);
}

// ống đẩy: ống tròn NHÔ ra khỏi vỏ (chân ống cắm sâu vào thân), viền đồng ở miệng, lòng ĐEN hoàn toàn.
// Trục +z cục bộ = hướng phụt ra ngoài. Miệng ống ở z = len. Trả về nhóm + điểm miệng (cục bộ).
function makeNozzle(R, len, embed = 0.05) {
  const g = new THREE.Group();
  const L = len + embed;
  const outer = new THREE.Mesh(new THREE.CylinderGeometry(R, R * 1.06, L, 28, 1, true), M.pipe);
  outer.rotation.x = Math.PI / 2; outer.position.z = len - L / 2;
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.82, R * 0.82, L, 28, 1, true), M.hole);
  inner.rotation.x = Math.PI / 2; inner.position.z = len - L / 2;
  const lip = new THREE.Mesh(new THREE.RingGeometry(R * 0.82, R * 1.0, 28), M.bronze); lip.position.z = len;
  const lipR = new THREE.Mesh(new THREE.TorusGeometry(R * 0.91, R * 0.09, 8, 28), M.bronze); lipR.position.z = len;
  const cap = new THREE.Mesh(new THREE.CircleGeometry(R * 0.82, 28), M.hole); cap.position.z = len * 0.25;   // đáy đen ngay trong ống (trước mặt vỏ xe)
  g.add(outer, inner, lip, lipR, cap);
  g.traverse(o => { if (o.isMesh && o.material !== M.hole) o.castShadow = true; });
  return g;
}
const Z_AXIS = new THREE.Vector3(0, 0, 1);

function buildAll() {
  buildUnderJets();
  buildRearJets();
  buildSideJets();
  buildUnderGlow();
  buildPlate();
  buildLauncher();
}

// ── Ống đẩy gầm: 4 ống nhỏ chĩa thẳng xuống (2 ngay sau bánh trước, 2 sau bánh sau); chỉ phụt khói mờ
function buildUnderJets() {
  for (const [x, z] of UNDER) {
    const h = hit(x, -2, z, 0, 1, 0); const y = h ? h.p.y : 0.14;
    const g = makeNozzle(UNDER_R, 0.03, 0.04);
    g.position.set(x, y, z); g.quaternion.setFromUnitVectors(Z_AXIS, new THREE.Vector3(0, -1, 0));
    car.add(g); parts.under.push({ g, x, z, y });
  }
}

// ── 4 ống đẩy đuôi: nhô ra sau khỏi vỏ, lòng đen; lơ lửng = xì khói nhẹ giữ cân, bay tới = khói mạnh
function buildRearJets() {
  for (const x of REAR.xs) {
    const h = hit(x, REAR.y, -6, 0, 0, 1);
    const g = makeNozzle(REAR.r, 0.045, 0.08);
    if (h) g.position.copy(h.p); else g.position.set(x, REAR.y, -2.25);
    g.quaternion.setFromUnitVectors(Z_AXIS, new THREE.Vector3(0, 0, -1));
    car.add(g); parts.rear.push({ g, x });
  }
}

// ── 4 ống đẩy hông (trước + sau mỗi bên): chĩa NGANG, vuông góc trục thân xe; phụt khói ngẫu nhiên giữ cân
function buildSideJets() {
  for (const s of [-1, 1]) for (const z of SIDE.zs) {
    const h = hit(s * 4, SIDE.y, z, -s, 0, 0); if (!h) continue;
    const g = makeNozzle(0.022, 0.03, 0.06);
    const out = new THREE.Vector3(s, 0, 0);
    g.position.copy(h.p); g.quaternion.setFromUnitVectors(Z_AXIS, out);
    car.add(g); parts.side.push({ g, s, z, pow: 0, next: Math.random(), out });
  }
}

// ── Đèn đỏ dưới gầm (mảnh, chỉ thấy quầng sáng lên khói)
function buildUnderGlow() {
  const g = new THREE.Group();
  const yb = (hit(0, -2, 0, 0, 1, 0)?.p.y ?? 0.12) - 0.006;
  for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.008, 2.2), M.ledAmberRed); m.position.set(s * 0.62, yb, -0.15); g.add(m); }
  car.add(g); parts.underGlow = g;
  const L = new THREE.PointLight(0xff3a20, 0, 18, 1.6); L.position.set(0, yb - 0.1, 0); car.add(L); parts.underLight = L;
}

// ── Biển số ANDREW TEAM đè lên biển sau có sẵn
function buildPlate() {
  const c = document.createElement("canvas"); c.width = 512; c.height = 128; const g = c.getContext("2d");
  const draw = () => {
    g.clearRect(0, 0, 512, 128);
    g.fillStyle = "#f2f3f0"; g.beginPath(); g.roundRect(3, 3, 506, 122, 14); g.fill();
    g.strokeStyle = "#1b1d22"; g.lineWidth = 5; g.beginPath(); g.roundRect(11, 11, 490, 106, 10); g.stroke();
    g.fillStyle = "#16181d"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = "900 58px 'Exo 2', Arial Black, sans-serif"; g.fillText("ANDREW TEAM", 256, 68, 460);
    tex.needsUpdate = true;
  };
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  draw(); document.fonts && document.fonts.ready.then(draw);
  const h = hit(0, PLATE.y, -6, 0, 0, 1); if (!h) return;
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(PLATE.w, PLATE.w / 4), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.15 }));
  plate.position.copy(h.p).add(new THREE.Vector3(0, 0, -0.008));
  plate.rotation.y = Math.PI;                                       // mặt chữ nhìn ra sau
  car.add(plate); parts.plate = plate;
}

// ── Bệ tên lửa (xe bay thay drone): gắn GIỮA nắp khoang máy sau cabin, thu chìm khi đỗ, nâng lên khi bay.
// Dáng nêm bọc giáp: mặt trước NGỬA LÊN một góc (đo bằng bắn tia: góc nhỏ nhất để đạn bay qua mui + 5° dư) chứa 2×2 nòng,
// nóc có chữ A nổi viền sáng, 2 bên có cánh tản nhiệt, dải đèn đỏ mép trước.
const POD = { z: -1.15, w: 0.46, up: 0.03, down: -0.19, len: 0.46, h: 0.17 };
function aShape(W, H, t) {                                            // chữ A nét đậm (rỗng giữa + thanh ngang)
  const sh = new THREE.Shape();
  sh.moveTo(-W / 2, 0); sh.lineTo(-W / 2 + t * 1.15, 0); sh.lineTo(-W * 0.19, H * 0.3); sh.lineTo(W * 0.19, H * 0.3);
  sh.lineTo(W / 2 - t * 1.15, 0); sh.lineTo(W / 2, 0); sh.lineTo(t * 0.55, H); sh.lineTo(-t * 0.55, H); sh.closePath();
  const hole = new THREE.Path(); hole.moveTo(-W * 0.12, H * 0.43); hole.lineTo(W * 0.12, H * 0.43); hole.lineTo(0, H * 0.74); hole.closePath();
  sh.holes.push(hole); return sh;
}
function buildLauncher() {
  const h = hit(0, 5, POD.z, 0, -1, 0); const y0 = h ? h.p.y : 0.94;
  const mount = new THREE.Group(); mount.position.set(0, y0, POD.z); car.add(mount);
  const lift = new THREE.Group(); mount.add(lift);
  // 1) góc ngửa: thử từ 8° tới 40°, lấy góc nhỏ nhất mà tia từ miệng nòng (vị trí đã nâng) không chạm vỏ xe, cộng 5° dư
  const mouthZ = POD.z + POD.len * 0.42, mouthY = y0 + POD.up + POD.h * 0.5;
  let elev = 30;
  for (let d = 8; d <= 40; d += 1) {
    const r = d * Math.PI / 180; let clear = true;
    for (const x of [-0.13, 0, 0.13]) for (const dy of [-0.03, 0.03]) { const t = hit(x, mouthY + dy, mouthZ, 0, Math.sin(r), Math.cos(r)); if (t && t.p.distanceTo(new THREE.Vector3(x, mouthY + dy, mouthZ)) < 6) clear = false; }
    if (clear) { elev = d + 5; break; }
  }
  const er = elev * Math.PI / 180;
  // 2) thân nêm: tiết diện dọc (z, y) đùn theo chiều ngang x, vát mép
  const L = POD.len, H = POD.h, fz = L * 0.42;                        // fz: chân mặt trước
  const topF = [fz - Math.sin(er) * H * 1.05, H];                     // mặt trước ngửa theo góc er
  const prof = new THREE.Shape();
  prof.moveTo(-L * 0.55, 0); prof.lineTo(fz, 0); prof.lineTo(topF[0], topF[1]);
  prof.lineTo(-L * 0.3, H * 0.8); prof.lineTo(-L * 0.55, H * 0.32); prof.closePath();
  const bodyG = new THREE.ExtrudeGeometry(prof, { depth: POD.w - 0.03, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2 });
  bodyG.rotateY(-Math.PI / 2); bodyG.translate((POD.w - 0.03) / 2, 0, 0);   // tiết diện nằm trong mặt (z, y)
  // ExtrudeGeometry dựng trong mặt (x, y) ⇒ đổi trục: x hình = z xe
  const gun = new THREE.MeshPhysicalMaterial({ color: 0x1b1e23, metalness: 0.85, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.3 });
  const body = new THREE.Mesh(bodyG, gun); body.castShadow = true; lift.add(body);
  // mặt trước: tấm ốp tối + 2×2 nòng theo trục ngửa
  const nrm = new THREE.Vector3(0, Math.sin(er), Math.cos(er)), upF = new THREE.Vector3(0, Math.cos(er), -Math.sin(er)); const tubes = [];
  const faceC = new THREE.Vector3(0, H * 0.5, (fz + topF[0]) / 2);
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(POD.w * 0.8, H * 0.9), new THREE.MeshStandardMaterial({ color: 0x07080a, metalness: 0.4, roughness: 0.55 }));
  plate.position.copy(faceC).addScaledVector(nrm, 0.004); plate.quaternion.setFromUnitVectors(Z_AXIS, nrm); lift.add(plate);
  for (const tx of [-0.13, 0, 0.13]) for (const tu of [0]) {           // 3 nòng một hàng ngang
    const tube = makeNozzle(0.03, 0.03, 0.14);
    tube.position.copy(faceC).add(new THREE.Vector3(tx, 0, 0)).addScaledVector(upF, tu).addScaledVector(nrm, 0.004);
    tube.quaternion.setFromUnitVectors(Z_AXIS, nrm); lift.add(tube); tubes.push(tube);
  }
  // dải đèn đỏ mép dưới mặt trước + 2 khe sáng hai bên nóc
  const ledMat = new THREE.MeshStandardMaterial({ color: 0x220000, emissive: 0xff1a12, emissiveIntensity: 1.5 });
  const led = new THREE.Mesh(new THREE.BoxGeometry(POD.w * 0.8, 0.005, 0.006), ledMat);
  led.position.set(0, 0.012, fz + 0.006); lift.add(led);
  // cánh tản nhiệt 2 bên (3 lá xiên)
  const slitMat = new THREE.MeshStandardMaterial({ color: 0x1a0800, emissive: 0xff6a1a, emissiveIntensity: 1.2 });
  for (const sx of [-1, 1]) {
    // khe sáng cam chạy dọc hông, chếch theo dáng nêm
    const slit = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.008, L * 0.62), slitMat);
    slit.position.set(sx * (POD.w / 2 + 0.003), H * 0.42, -L * 0.02); slit.rotation.x = -0.12; lift.add(slit);
    // 3 khe hút gió xiên phía sau
    for (let k = 0; k < 3; k++) { const v = new THREE.Mesh(new THREE.BoxGeometry(0.008, H * 0.28, 0.012), M.black);
      v.position.set(sx * (POD.w / 2 + 0.002), H * 0.24, -L * 0.42 + k * 0.035); v.rotation.x = -0.5; lift.add(v); }
    // viền đồng dọc mép nóc (từ đuôi tới mép trước)
    const a0 = new THREE.Vector3(sx * (POD.w / 2 - 0.012), H * 0.8 + 0.003, -L * 0.3), a1 = new THREE.Vector3(sx * (POD.w / 2 - 0.012), H + 0.003, topF[0]);
    const trim = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.005, a0.distanceTo(a1)), M.bronze);
    trim.position.copy(a0).add(a1).multiplyScalar(0.5); trim.quaternion.setFromUnitVectors(Z_AXIS, a1.clone().sub(a0).normalize()); lift.add(trim);
  }
  // nóc: chữ A nổi (đồng sáng) + viền phát sáng, nằm theo mặt nóc dốc nhẹ
  const topA = new THREE.Vector3(0, H * 0.8, -L * 0.3), topB = new THREE.Vector3(0, topF[1], topF[0]);
  const topN = new THREE.Vector3().subVectors(topB, topA).normalize(); topN.set(0, topN.z, -topN.y);   // pháp tuyến nóc (hướng lên)
  if (topN.y < 0) topN.negate();
  const aGeo = new THREE.ExtrudeGeometry(aShape(0.12, 0.11, 0.017), { depth: 0.008, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 1 });
  aGeo.translate(0, -0.055, 0);
  const aMat = new THREE.MeshStandardMaterial({ color: 0xc8925a, metalness: 1, roughness: 0.22, emissive: 0xff7a2a, emissiveIntensity: 0.25 });
  const A = new THREE.Mesh(aGeo, aMat);
  const aGlow = new THREE.Mesh(new THREE.ShapeGeometry(aShape(0.132, 0.121, 0.023)), new THREE.MeshBasicMaterial({ color: 0xff5a1a, transparent: true, opacity: 0.55, depthWrite: false }));
  aGlow.geometry.translate(0, -0.0605, 0);
  const aG = new THREE.Group(); aG.add(aGlow, A); A.position.z = 0.001;
  const mid = new THREE.Vector3().addVectors(topA, topB).multiplyScalar(0.5).addScaledVector(topN, 0.012);
  aG.position.copy(mid);
  // chữ nằm trên nóc, chân chữ hướng về sau xe (đọc được khi nhìn từ máy quay đuổi theo)
  const m = new THREE.Matrix4().makeBasis(new THREE.Vector3(-1, 0, 0), new THREE.Vector3().subVectors(topB, topA).normalize(), topN);
  aG.quaternion.setFromRotationMatrix(m); lift.add(aG);
  // trụ nâng (thấy khi bệ nâng lên)
  for (const sx of [-1, 1]) { const st = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.06), M.steel); st.position.set(sx * POD.w * 0.3, -0.11, -L * 0.05); lift.add(st); }
  lift.position.y = POD.down; parts.pod = { mount, lift, led, aMat, slitMat, elev, tubes };
}


// ── TÊN LỬA: bắn từ 3 nòng (lần lượt trái → giữa → phải). Ra nòng theo góc ngửa, mồi đẩy rồi bẻ lái về TÂM NGẮM
//    trên mặt đường phía trước; chạm đất ⇒ nổ (cầu lửa + chớp sáng + khói + vệt cháy). Đường chạy cuộn về sau ⇒ mọi thứ chạm đất trôi theo.
const RK = { v0: 24, vMax: 85, acc: 140, turn: 6.5, cool: 0.38, life: 4 };   // turn: bẻ lái rad/s (cao ⇒ vòng cung thấp, không vọt lên trời)
const rockets = [], blasts = [];
const rkBodyM = new THREE.MeshStandardMaterial({ color: 0xd9dde2, metalness: 0.6, roughness: 0.35 });
const rkNoseM = new THREE.MeshStandardMaterial({ color: 0xff5a1a, emissive: 0x401000, metalness: 0.3, roughness: 0.4 });
const glowTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d");
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,240,1)"); gr.addColorStop(0.25, "rgba(255,200,90,.9)"); gr.addColorStop(0.6, "rgba(255,90,20,.35)"); gr.addColorStop(1, "rgba(255,40,0,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
function makeRocket() {
  const g = new THREE.Group();                                        // trục +z = mũi
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.26, 12), rkBodyM); body.rotation.x = Math.PI / 2; g.add(body);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.08, 12), rkNoseM); nose.rotation.x = Math.PI / 2; nose.position.z = 0.17; g.add(nose);
  for (let k = 0; k < 4; k++) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.05, 0.05), M.carbon); const a = k * Math.PI / 2;
    f.position.set(Math.cos(a) * 0.035, Math.sin(a) * 0.035, -0.1); f.rotation.z = a; g.add(f); }
  const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd08a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  flame.scale.setScalar(0.35); flame.position.z = -0.17; g.add(flame);
  g.userData.flame = flame; return g;
}
// tâm ngắm trên mặt đường
const reticle = new THREE.Group(); scene.add(reticle);
{ const rm = new THREE.MeshBasicMaterial({ color: 0xff6a2a, transparent: true, opacity: 0.85, depthWrite: false });
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.25, 48), rm); ring.rotation.x = -Math.PI / 2; reticle.add(ring);
  for (let k = 0; k < 4; k++) { const t = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.7), rm); t.rotation.x = -Math.PI / 2; t.rotation.z = k * Math.PI / 2; const a = k * Math.PI / 2;
    t.position.set(Math.sin(a) * 1.65, 0, Math.cos(a) * 1.65); reticle.add(t); }
  reticle.position.y = 0.03; reticle.visible = false; }
const flash = new THREE.PointLight(0xff8a3a, 0, 40, 1.6); scene.add(flash);
const _p = new THREE.Vector3(), _d = new THREE.Vector3(), _t = new THREE.Vector3();
function fireRocket() {
  const tubes = parts.pod.tubes; const tube = tubes[S.tube % tubes.length]; S.tube++;
  car.updateMatrixWorld(true);
  tube.localToWorld(_p.set(0, 0, 0.02)); _d.set(0, 0, 1).transformDirection(tube.matrixWorld);
  const m = makeRocket(); m.position.copy(_p); m.lookAt(_t.copy(_p).add(_d)); scene.add(m);
  const target = new THREE.Vector3(S.x, 0, S.aim);                   // khoá điểm trên mặt đường lúc bắn
  rockets.push({ m, v: _d.clone().multiplyScalar(RK.v0), target, t: 0 });
  for (let k = 0; k < 14; k++) { tmpV.copy(_d).multiplyScalar(2 + Math.random() * 3).add(new THREE.Vector3((Math.random() - .5) * 1.5, (Math.random() - .5) * 1.5, (Math.random() - .5) * 1.5));
    puff(_p, tmpV, 0.1, 0.5 + Math.random() * 0.4, 0.4, 0, 0, 1.2, 1, 3); }  // khói đầu nòng
  status("Phóng tên lửa!");
}
function explode(pos) {
  const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  const ball = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff7a2a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  core.position.copy(pos).setY(0.6); ball.position.copy(pos).setY(1.0); scene.add(core, ball);
  const scorch = new THREE.Mesh(new THREE.CircleGeometry(1.6, 32), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.6, depthWrite: false }));
  scorch.rotation.x = -Math.PI / 2; scorch.position.set(pos.x, 0.025, pos.z); scene.add(scorch);
  blasts.push({ core, ball, scorch, t: 0 });
  flash.position.set(pos.x, 1.5, pos.z); flash.intensity = 420;
  for (let k = 0; k < 46; k++) {                                     // khói nổ bung lên + loang
    const a = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 6;
    tmpV.set(Math.cos(a) * sp, 1.5 + Math.random() * 5, Math.sin(a) * sp);
    _p.set(pos.x + (Math.random() - .5) * 0.8, 0.3 + Math.random() * 0.6, pos.z + (Math.random() - .5) * 0.8);
    puff(_p, tmpV, 0.5 + Math.random() * 0.5, 1.6 + Math.random() * 1.6, 0, 0, 0, 1.3, 1.3, 1.8);   // khói nổ xám
  }
}
function updateRockets(dt) {
  // bắn
  S.fireCd = Math.max(0, S.fireCd - dt);
  const ready = S.pod > 0.85 && parts.pod && parts.pod.tubes.length;
  $("bFire").disabled = !ready;
  if (ready && (fireKey.k || fireKey.b) && S.fireCd <= 0) { fireRocket(); S.fireCd = RK.cool; }
  // tâm ngắm: phía trước xe trên mặt đường, theo làn xe
  reticle.visible = !!ready; reticle.position.x = S.x; reticle.position.z = S.aim; reticle.rotation.y += dt * 0.8;
  reticle.children[0].material.opacity = 0.55 + 0.3 * Math.sin(S.t * 6);
  // bay
  for (let i = rockets.length - 1; i >= 0; i--) {
    const r = rockets[i]; r.t += dt;
    r.target.z -= S.speed * dt;                                       // điểm trên đường trôi về sau theo tốc độ xe
    const sp = Math.min(RK.vMax, r.v.length() + RK.acc * dt);
    if (r.t > 0.12) {                                                 // ra khỏi nòng rồi mới bẻ lái về tâm ngắm
      _d.copy(r.target).sub(r.m.position).normalize(); _t.copy(r.v).normalize();
      const ang = _t.angleTo(_d), k = Math.min(1, RK.turn * dt / Math.max(ang, 1e-4));
      _t.lerp(_d, k).normalize(); r.v.copy(_t).multiplyScalar(sp);
    } else r.v.setLength(sp);
    r.m.position.addScaledVector(r.v, dt);
    r.m.lookAt(_t.copy(r.m.position).add(r.v));
    r.m.userData.flame.scale.setScalar(0.28 + Math.random() * 0.14);
    for (let k = 0; k < 7; k++) { tmpV.set((Math.random() - .5) * 0.5, (Math.random() - .5) * 0.5, (Math.random() - .5) * 0.5);
      _p.copy(r.m.position).addScaledVector(r.v, -dt * Math.random() - 0.004);
      puff(_p, tmpV, 0.13, 0.7 + Math.random() * 0.5, 0.3, 0, 0, 0.75, 0.8, 1.2); }   // vệt khói (đứng yên giữa trời ⇒ trôi theo tốc độ)
    if (r.m.position.y <= 0.05 || r.m.position.distanceTo(r.target) < 0.6 || r.t > RK.life) {
      _p.copy(r.m.position).setY(0); explode(_p); scene.remove(r.m); rockets.splice(i, 1);
    }
  }
  // nổ
  flash.intensity *= Math.exp(-9 * dt);
  for (let i = blasts.length - 1; i >= 0; i--) {
    const b = blasts[i]; b.t += dt; const dz = -S.speed * dt;
    b.core.position.z += dz; b.ball.position.z += dz; b.scorch.position.z += dz; flash.position.z += dz / Math.max(blasts.length, 1);
    b.core.scale.setScalar(1.5 + b.t * 22); b.core.material.opacity = Math.max(0, 1 - b.t / 0.25);
    b.ball.scale.setScalar(2.5 + b.t * 12); b.ball.position.y = 1 + b.t * 2; b.ball.material.opacity = Math.max(0, 1 - b.t / 0.55);
    b.scorch.material.opacity = 0.6 * Math.max(0, 1 - b.t / 4);
    if (b.t > 4) { scene.remove(b.core, b.ball, b.scorch); blasts.splice(i, 1); }
  }
}

// ── Trạng thái
// lift 0→1 lực đẩy gầm · alt độ cao (m) · fwd 0→1 ống đuôi · speed m/s
const S = { mode: "park", lift: 0, alt: 0, fwd: 0, speed: 0, t: 0, cam: 0, roll: 0, rollV: 0,
  x: 0, vx: 0, xHold: 0, yaw: 0, yawV: 0, steer: 0, steerIn: 0, sideNext: 0.5, pod: 0, cd: 0, fireCd: 0, tube: 0, aim: 42 };
// mode: park (đỗ) → count (đếm 3-2-1, bệ CHƯA hiện) → drive (chạy đường, bệ bật lên) ⇄ takeoff/hover/cruise/landing (bay) · stop (phanh về đỗ)   // x, vx: dạt ngang (m, m/s) · yaw: quay mũi · steer: lái (+1 = sang TRÁI xe = +x)
const ALT_HOVER = 3.6, V_MAX = 60, V_DRIVE = 32;                     // V_DRIVE: tốc độ chạy đường (≈115 km/h)
const $ = id => document.getElementById(id);
function setBtns() {
  const ground = S.mode === "park" || S.mode === "drive" || S.mode === "stop";
  $("bStart").disabled = !(S.mode === "park" || S.mode === "drive");
  $("bStart").textContent = S.mode === "drive" ? "■ DỪNG" : "▶ CHẠY";
  $("bUp").disabled = !(S.mode === "park" || S.mode === "drive");
  $("bGo").disabled = !(S.mode === "hover" || S.mode === "cruise");
  $("bGo").classList.toggle("on", S.mode === "cruise");
  $("bDown").disabled = !(S.mode === "hover" || S.mode === "cruise");
}
$("bUp").onclick = () => { S.mode = "takeoff"; status("Mở ống đẩy gầm · cất cánh…"); setBtns(); };
$("bStart").onclick = () => {
  if (S.mode === "park") { S.mode = "count"; S.cd = 3.6; showCount("3"); status("Chuẩn bị xuất phát…"); }
  else if (S.mode === "drive") { S.mode = "stop"; status("Phanh…"); }
  setBtns();
};
const cdEl = $("cd");
function showCount(t) { if (!cdEl) return; cdEl.textContent = t; cdEl.classList.remove("pop"); void cdEl.offsetWidth; cdEl.classList.add("pop"); }
// bắn: phím F / giữ nút BẮN
const fireKey = { k: false, b: false };
addEventListener("keydown", e => { if (e.code === "KeyF") { fireKey.k = true; e.preventDefault(); } });
addEventListener("keyup", e => { if (e.code === "KeyF") fireKey.k = false; });
{ const b = $("bFire"); b.addEventListener("pointerdown", e => { fireKey.b = true; b.setPointerCapture(e.pointerId); });
  for (const ev of ["pointerup", "pointercancel", "lostpointercapture"]) b.addEventListener(ev, () => { fireKey.b = false; }); }
$("bGo").onclick = () => { S.mode = S.mode === "cruise" ? "hover" : "cruise"; status(S.mode === "cruise" ? "4 ống đuôi: bay tới!" : "Lơ lửng · ống hông giữ thăng bằng"); setBtns(); };
$("bDown").onclick = () => { S.mode = "landing"; status("Hạ cánh…"); setBtns(); };
const CAMS = ["Tự xoay", "Đuổi theo", "Bên hông", "Đuôi xe", "Gầm xe"];
$("bCam").onclick = () => { S.cam = (S.cam + 1) % CAMS.length; $("bCam").textContent = "🎥 " + CAMS[S.cam]; controls.enabled = S.cam === 0; };
addEventListener("keydown", e => { if (e.code === "Space") { e.preventDefault(); for (const b of ["bUp", "bGo"]) if (!$(b).disabled) { $(b).click(); break; } } });
// lái: ← / A = sang trái, → / D = sang phải (giữ phím / giữ nút)
const keys = { L: false, R: false }, btn = { L: false, R: false };
const keyOf = c => (c === "ArrowLeft" || c === "KeyA") ? "L" : (c === "ArrowRight" || c === "KeyD") ? "R" : null;
addEventListener("keydown", e => { const k = keyOf(e.code); if (k) { keys[k] = true; e.preventDefault(); } });
addEventListener("keyup", e => { const k = keyOf(e.code); if (k) keys[k] = false; });
for (const [id, k] of [["bL", "L"], ["bR", "R"]]) { const b = $(id); if (!b) continue;
  b.addEventListener("pointerdown", e => { btn[k] = true; b.setPointerCapture(e.pointerId); });
  for (const ev of ["pointerup", "pointercancel", "lostpointercapture"]) b.addEventListener(ev, () => { btn[k] = false; }); }
car.rotation.order = "YXZ";   // quay mũi trước, rồi chúc, rồi nghiêng
setBtns();

const ease = (cur, to, k, dt) => cur + (to - cur) * (1 - Math.exp(-k * dt));
const clock = new THREE.Clock();
const camOff = new THREE.Vector3(), tmp = new THREE.Vector3(), tmpV = new THREE.Vector3(), down = new THREE.Vector3();
const lerpTo = new THREE.Vector3();

function updateSmoke(dt) {
  for (let b = 0; b < NB; b++) if (bLive[b]) {                        // độ đậm chung của từng nhịp
    bT[b] += dt; const t = bT[b] - B_EMIT - B_HOLD;
    bEnv[b] = t <= 0 ? 1 : Math.max(0, 1 - t / B_FADE);
    if (bEnv[b] <= 0) bLive[b] = 0;
  }
  for (let i = 0; i < SMOKE; i++) {
    if (sLife[i] <= 0) { sAlpha[i] = 0; continue; }
    sLife[i] -= dt; const k = 1 - sLife[i] / sMax[i];
    let y = sPos[i * 3 + 1] + sVel[i * 3 + 1] * dt;
    if (y < 0.15 && sVel[i * 3 + 1] < 0) {        // chạm đất → loang ngang + bốc nhẹ
      y = 0.15; const sp = Math.hypot(sVel[i * 3], sVel[i * 3 + 2]) + Math.abs(sVel[i * 3 + 1]) * 0.6;
      const a = Math.random() * Math.PI * 2; sVel[i * 3] = Math.cos(a) * sp; sVel[i * 3 + 2] = Math.sin(a) * sp; sVel[i * 3 + 1] = 0.25 + Math.random() * 0.5;
      sMul[i] = 0.32 + Math.min(S.speed / 60, 1) * 0.18; sLife[i] *= 0.7; sMax[i] = Math.max(sMax[i] * 0.7, 0.01);   // lớp khói nằm đất loãng hơn, tan nhanh hơn
      sLim[i] = 0;                                   // chạm đất rồi thì bắt đầu bị tốc độ cuốn (nhả dần, không giật)
      sSize[i] += Math.min(S.speed / 60, 1) * 0.5;   // bay nhanh: hạt nằm đất to hơn để vệt liền, không lốm đốm
    }
    sDist[i] += Math.hypot(sVel[i * 3], sVel[i * 3 + 1], sVel[i * 3 + 2]) * dt;
    if (sDist[i] > sLim[i]) sFol[i] *= Math.exp(-2.2 * dt);   // quá quãng được bám → gió tốc độ cuốn dần về sau
    const fd = (1 - Math.exp(-sDrag[i] * dt)) / sDrag[i];          // quãng đúng khi vận tốc đang giảm theo lực cản
    sPos[i * 3] += sVel[i * 3] * fd; sPos[i * 3 + 1] = y; sPos[i * 3 + 2] += sVel[i * 3 + 2] * fd - S.speed * (1 - sFol[i]) * dt;
    const drag = Math.exp(-sDrag[i] * dt); sVel[i * 3] *= drag; sVel[i * 3 + 2] *= drag; sVel[i * 3 + 1] = (sVel[i * 3 + 1] < 0 && !sOwn[i]) ? sVel[i * 3 + 1] * Math.exp(-0.6 * dt) : sVel[i * 3 + 1] * drag;
    if (sOwn[i]) {                                                      // hạt của nhịp hông: đậm theo cả nhịp, nhịp tắt thì hạt tắt
      const d = Math.min(sDist[i] / 2.2, 1);                            // 0 = miệng ống, 1 = cuối luồng
      sSize[i] = (0.038 + sDist[i] * 0.136) * sGrow[i] + (sMax[i] - sLife[i]) * 0.085;   // hẹp hơn 15% (21/10)   // mảnh ở ống, loe dần, nở thêm chút theo thời gian
      const b = sOwn[i] - 1; sAlpha[i] = Math.min(1, (sMax[i] - sLife[i]) * 40) * 0.55 * sMul[i] * (1 - 0.7 * d) * bEnv[b];
      if (!bLive[b]) { sLife[i] = 0; sAlpha[i] = 0; }
    } else { sSize[i] += dt * (0.9 + k * 2.2) * sGrow[i]; sAlpha[i] = Math.min(1, k * 25) * (1 - k) * 0.55 * sMul[i]; }
    if (!sOwn[i]) sWarm[i] *= Math.exp(-1.5 * dt);
  }
  sGeo.attributes.position.needsUpdate = true; sGeo.attributes.aSize.needsUpdate = true; sGeo.attributes.aAlpha.needsUpdate = true; sGeo.attributes.aWarm.needsUpdate = true;
}


function tick(dtForce) {
  const dt = dtForce || Math.min(clock.getDelta(), 0.05); S.t += dt; curDt = dt;
  if (!bodyMeshes) { composer.render(); return; }

  // máy trạng thái
  if (S.mode === "count") {
    const before = Math.ceil(S.cd - 0.6); S.cd -= dt; const now = Math.ceil(S.cd - 0.6);
    if (now !== before) showCount(now > 0 ? String(now) : "GO!");
    if (S.cd <= 0.6 && before > 0) { S.mode = "drive"; status("Chạy trên đường · bệ tên lửa bật lên · F = BẮN"); setBtns(); }
  } else if (S.mode === "drive") {
    S.speed = ease(S.speed, V_DRIVE, 0.45, dt);
  } else if (S.mode === "stop") {
    S.speed = Math.max(0, S.speed - dt * 14);
    if (S.speed <= 0) { S.mode = "park"; status("Đã dừng"); setBtns(); }
  } else if (S.mode === "takeoff") {
    S.lift = ease(S.lift, 1, 2.2, dt);
    if (S.lift > 0.6) S.alt = ease(S.alt, ALT_HOVER, 0.8, dt);
    if (S.alt > ALT_HOVER - 0.15) { const go = S.speed > 5; S.mode = go ? "cruise" : "hover"; status(go ? "Bay tới · 4 ống đuôi" : "Lơ lửng · bấm BAY TỚI"); setBtns(); }
  } else if (S.mode === "hover") {
    S.fwd = ease(S.fwd, 0, 3, dt); S.speed = ease(S.speed, 0, 0.8, dt); S.alt = ease(S.alt, ALT_HOVER, 1.5, dt); S.lift = ease(S.lift, 1, 3, dt);
  } else if (S.mode === "cruise") {
    S.fwd = ease(S.fwd, 1, 2.5, dt); S.speed = ease(S.speed, V_MAX, 0.3, dt); S.alt = ease(S.alt, ALT_HOVER + 1.2, 0.6, dt); S.lift = ease(S.lift, 0.75, 2, dt);
  } else if (S.mode === "landing") {
    S.fwd = ease(S.fwd, 0, 3, dt); S.speed = ease(S.speed, Math.min(S.speed, V_DRIVE), 1.2, dt);   // đáp xuống khi vẫn chạy ⇒ về chạy đường
    S.alt = Math.max(0, S.alt - dt * (0.5 + S.alt * 0.4));
    S.lift = S.alt > 0.02 ? ease(S.lift, 0.85, 3, dt) : ease(S.lift, 0, 2.5, dt);
    if (S.alt <= 0 && S.lift < 0.04) { const run = S.speed > 3; S.mode = run ? "drive" : "park"; S.lift = 0; status(run ? "Đã đáp · chạy tiếp trên đường" : "Đã đáp xuống đường băng"); setBtns(); }
  }

  const air = S.alt > 0.05 ? 1 : 0;
  S.steerIn = (air || S.speed > 1) ? ((keys.L || btn.L) ? 1 : 0) - ((keys.R || btn.R) ? 1 : 0) : 0;   // chạy đường cũng lái được (bằng bánh)
  S.steer = ease(S.steer, S.steerIn, 6, dt);

  const q = car.getWorldQuaternion(new THREE.Quaternion());
  // ống gầm: chỉ khói mờ (hạt mềm), phụt xuống rồi loang ra mặt đất
  for (const p of parts.under) {
    if (S.lift > 0.05) {
      const n = Math.floor(S.lift * (210 + S.speed * 3) * dt + Math.random());
      for (let k = 0; k < n; k++) {
        p.g.localToWorld(tmp.set((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, 0.04));
        tmpV.set((Math.random() - 0.5) * 0.9, -(11 + Math.random() * 6), (Math.random() - 0.5) * 0.9).applyQuaternion(q);
        puff(tmp, tmpV, 0.26 + Math.random() * 0.2, 1.4 + Math.random() * 1.6, 0, 0.92, 99, 1 + Math.min(S.speed / 60, 1) * 0.4);
      }
    }
  }
  // 4 ống đuôi: lơ lửng xì nhẹ (giữ cân), bay tới xì mạnh
  const air0 = S.alt > 0.05 ? 1 : 0;
  const rearPow = Math.max(S.fwd, air0 * S.lift * (0.22 + 0.08 * Math.sin(S.t * 2.3)));
  for (const r of parts.rear) {
    const n = Math.floor(rearPow * (S.fwd > 0.3 ? 220 : 55) * dt + Math.random());
    for (let k = 0; k < n; k++) {
      r.g.localToWorld(tmp.set(0, 0, 0.06));
      tmpV.set((Math.random() - 0.5) * 0.5, (Math.random() - 0.2) * 0.35, -(1.5 + rearPow * 9 + Math.random() * 2)).applyQuaternion(q);
      puff(tmp, tmpV, 0.07 + rearPow * 0.08, 0.7 + Math.random() * 0.7, 0, 1, 0.8, 1.5);
    }
  }
  M.ledAmberRed.emissiveIntensity = Math.max(S.lift, air) * 4;
  parts.underLight.intensity = S.lift * 10;

  // ── ống hông theo VẬT LÝ: ống bên s phun khí ra phía s ⇒ đẩy xe về phía −s; ống trước/sau tạo mô-men quay mũi.
  //    Lực ngang Fx = −s · F ; mô-men quanh trục đứng τ = z_ống · Fx  (z > 0 = ống trước).
  //    Lơ lửng / bay thẳng: mỗi lúc CHỈ 1 ống, chọn ống sửa đúng độ dạt + quay mũi. Lái trái ⇒ ống bên PHẢI (s = −1) phụt đẩy xe sang trái.
  const F_SIDE = 2.6, F_STEER = 6.5, V_SIDE = 5;                       // V_SIDE: tốc độ dạt ngang tối đa khi lái (m/s)                                   // gia tốc ngang 1 nhịp (m/s²): giữ cân · khi lái
  let active = null;
  for (const j of parts.side) { j.emit = Math.max(0, (j.emit || 0) - dt); if (j.emit > 0) active = j; }
  S.sideNext -= dt;
  if (air0 && !active && S.sideNext <= 0) {
    let fx, ty;
    if (Math.abs(S.steerIn) > 0) {                                     // đang lái: cần lực về phía lái (tới 5 m/s thì thôi đẩy), mũi quay theo
      fx = S.steerIn * S.vx < V_SIDE ? S.steerIn : 0; ty = (S.steerIn * 0.12 - S.yaw) * 3 - S.yawV;
      S.xHold = S.x + S.vx * 0.9;                                      // thả tay: phanh dừng ở gần chỗ này
    } else {                                                           // giữ cân: kéo về chỗ đứng + triệt quay mũi
      fx = -((S.x - S.xHold) * 1.0 + S.vx * 2.2); ty = -(S.yaw * 3 + S.yawV * 2);
      if (Math.abs(fx) < 0.05) fx = (Math.random() - 0.5) * 0.1;      // gần như đứng yên: vẫn nhích nhẹ (cố giữ cân)
    }
    const big = Math.min(Math.abs(fx), 4);                             // lệch nhiều (vd vừa thả lái) ⇒ phụt mạnh + dồn dập hơn
    const sSide = fx > 0 ? -1 : 1;                                      // muốn Fx > 0 ⇒ phun ở bên −x (s = −1)
    const zSign = Math.sign(ty || 1) * Math.sign(-sSide);              // τ = z · Fx ⇒ dấu z = dấu τ · dấu Fx
    const j = parts.side.find(q => q.s === sSide && Math.sign(q.z) === zSign) || parts.side.find(q => q.s === sSide);
    if (j && fx !== 0) { j.burst = newBurst(); j.emit = B_EMIT; active = j; j.kick = S.steerIn ? F_STEER : F_SIDE + big * 1.6; }
    S.sideNext = S.steerIn ? 0.08 + Math.random() * 0.1 : big > 0.8 ? 0.06 + Math.random() * 0.1 : 0.35 + Math.random() * 0.75;
  }
  if (active) {                                                        // lực của nhịp đang phụt tác động lên xe
    const Fx = -active.s * active.kick;
    S.vx += Fx * dt;
    S.yawV += active.z * Fx * 0.12 * dt;
    const n = Math.floor(900 * dt + Math.random());
    for (let k = 0; k < n; k++) {
      active.g.localToWorld(tmp.set(0, 0, 0.04));
      tmpV.copy(active.out).multiplyScalar(2 + Math.random() * 26);   // 2–28 m/s, cản 13/s ⇒ mỗi hạt dừng ở 0,15–2,1 m ⇒ dải phủ đều từ miệng ống tới 2 m
      const vv = tmpV.length(), g1 = (Math.random() + Math.random() + Math.random() - 1.5), g2 = (Math.random() + Math.random() + Math.random() - 1.5);
      tmpV.y += g1 * vv * 0.077 + vv * 0.025; tmpV.z += g2 * vv * 0.077;   // loe ~±0,3 m ở cuối, hơi bốc lên
      tmpV.applyQuaternion(q);
      puff(tmp, tmpV, 0.05, 9, 1, 1, 1e9, 1.2, 0.6 + Math.random() * 0.8, 13, active.burst + 1);   // bám xe suốt đời hạt; cả dải tan cùng lúc
    }
  }
  // động lực ngang: gió nhiễu (khi bay) + cản không khí; giữ trong đường băng
  if (air0) { S.vx += (Math.random() - 0.5) * 1.6 * dt; S.yawV += (Math.random() - 0.5) * 0.35 * dt; }
  S.vx *= Math.exp(-0.35 * dt); S.yawV *= Math.exp(-0.9 * dt);
  S.x += S.vx * dt; S.yaw += S.yawV * dt;
  if (Math.abs(S.x) > 11) { S.x = Math.sign(S.x) * 11; S.vx = 0; S.xHold = S.x; }
  if (!air0) {                                                        // trên đường: lái bằng bánh (đổi làn), không dùng ống hông
    S.vx = ease(S.vx, S.steerIn * 4.5 * Math.min(1, S.speed / 8), 3, dt); S.yawV = 0;
    S.yaw = ease(S.yaw, S.steerIn * 0.07 * Math.min(1, S.speed / 8), 4, dt); S.xHold = S.x;
  }
  // nghiêng thân theo hướng dạt (dạt sang trái +x ⇒ nghiêng trái = rotation.z âm) + chao nhẹ
  S.roll = ease(S.roll, air0 * (-S.vx * 0.02 - S.steer * 0.04 + Math.sin(S.t * 1.3) * 0.012), 3, dt);   // ~8° khi lái hết cỡ

  // bệ tên lửa: nâng lên khi bay, thu chìm khi đỗ
  const podOn = air0 || (S.speed > 0.3 && S.mode !== "count");
  S.pod = ease(S.pod, podOn ? 1 : 0, 4, dt);
  parts.pod.lift.position.y = POD.down + (POD.up - POD.down) * THREE.MathUtils.smoothstep(S.pod, 0, 1);
  parts.pod.led.material.emissiveIntensity = 0.5 + 1.2 * S.pod; parts.pod.aMat.emissiveIntensity = 0.15 + 0.5 * S.pod; parts.pod.slitMat.emissiveIntensity = 0.3 + 1.4 * S.pod;

  // bánh quay theo tốc độ khi còn trên đất, lúc bay quay chậm dần
  for (const w of parts.wheels) w.rotation.x += dt * (S.alt < 0.05 ? S.speed / WHEEL_R : 0.4 * (1 - S.lift));
  updateRockets(dt);

  // thân xe
  const bob = S.lift * air * (Math.sin(S.t * 1.6) * 0.1 + Math.sin(S.t * 2.7) * 0.04);
  const shake = S.lift * 0.006 + S.fwd * 0.008;
  car.position.set(S.x + (Math.random() - 0.5) * shake, S.alt + bob, (Math.random() - 0.5) * shake);
  car.rotation.x = ease(car.rotation.x, S.mode === "cruise" ? 0.04 : (S.mode === "takeoff" && S.lift > 0.6 ? -0.03 : 0), 2, dt);
  car.rotation.z = S.roll; car.rotation.y = S.yaw;

  // cuộn mặt đất
  rtex.offset.y += S.speed * dt / TILE;
  for (const l of edgeLights.children) { l.position.z -= S.speed * dt; if (l.position.z < -150) l.position.z += 40 * 7.5; }
  updateSmoke(dt);

  // camera
  if (window.__camFix) window.__camFix(camera, car);                 // bàn thử: khoá máy quay để chụp kiểm tra
  else if (S.cam === 0) { const ox = controls.target.x; controls.target.lerp(lerpTo.set(car.position.x, car.position.y + 0.6, 0), 0.08); camera.position.x += controls.target.x - ox; controls.update(); }
  else {
    const n = NARROW() ? 1.8 : 1;
    if (S.cam === 1) camOff.set(2.6, 2 + S.alt * 0.15, -10 - S.fwd * 2);
    else if (S.cam === 2) camOff.set(9, 1, 0.5);
    else if (S.cam === 3) camOff.set(0.8, 1, -6);
    else camOff.set(4, -Math.min(S.alt, 2.5) + 0.3, 1.5);
    camOff.multiplyScalar(n);
    camera.position.lerp(tmp.copy(car.position).add(camOff), 0.08);
    if (camera.position.y < 0.15) camera.position.y = 0.15;
    camera.lookAt(car.position.x, car.position.y + (S.cam === 4 ? 0.1 : 0.6), car.position.z + (S.cam === 1 ? 3 : 0));
  }
  camera.fov = ease(camera.fov, 40 + S.fwd * 10, 2, dt); camera.updateProjectionMatrix();
  smokeMat.uniforms.uScale.value = renderer.domElement.height / renderer.getPixelRatio() / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)) * renderer.getPixelRatio();
  moon.position.set(car.position.x - 10, car.position.y + 18, 6); moon.target.position.copy(car.position);

  $("alt").textContent = Math.max(0, S.alt).toFixed(1);
  $("spd").textContent = Math.round(S.speed * 3.6);
  if (!noRender) composer.render();
}
renderer.setAnimationLoop(() => tick());
addEventListener("resize", () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight); });
window.__S = S; window.__dbg = { bloom, renderer, scene, camera, car, hit };
let noRender = false;
window.__step = (n, dt = 1 / 60) => { noRender = true; for (let i = 0; i < n; i++) { if (i === n - 1) noRender = false; tick(dt); } };   // bàn thử: tự chạy n khung khi khung xem bị ẩn
