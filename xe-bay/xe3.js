// XE BAY FERRARI — mẫu 3 (21/10/2026)
// Thân xe = "2023 Ferrari 296 GTS" (ddiaz-design, Sketchfab). Phần bay dựng bằng code:
// 4 miệng đẩy nằm sát sàn (phụt xuống, gần như không thấy), 4 ống đẩy đuôi (bay tới), 4 lỗ đẩy hông (giữ thăng bằng),
// đèn đỏ gầm, biển ANDREW TEAM. Đơn vị: MÉT, mũi xe = +z, mặt đất y = 0.
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

// ── Trạng thái
// lift 0→1 lực đẩy gầm · alt độ cao (m) · fwd 0→1 ống đuôi · speed m/s
const S = { mode: "park", lift: 0, alt: 0, fwd: 0, speed: 0, t: 0, cam: 0, roll: 0, rollV: 0 };
const ALT_HOVER = 3.6, V_MAX = 60;
const $ = id => document.getElementById(id);
function setBtns() {
  $("bUp").disabled = S.mode !== "park";
  $("bGo").disabled = !(S.mode === "hover" || S.mode === "cruise");
  $("bGo").classList.toggle("on", S.mode === "cruise");
  $("bDown").disabled = !(S.mode === "hover" || S.mode === "cruise");
}
$("bUp").onclick = () => { S.mode = "takeoff"; status("Mở ống đẩy gầm · cất cánh…"); setBtns(); };
$("bGo").onclick = () => { S.mode = S.mode === "cruise" ? "hover" : "cruise"; status(S.mode === "cruise" ? "4 ống đuôi: bay tới!" : "Lơ lửng · ống hông giữ thăng bằng"); setBtns(); };
$("bDown").onclick = () => { S.mode = "landing"; status("Hạ cánh…"); setBtns(); };
const CAMS = ["Tự xoay", "Đuổi theo", "Bên hông", "Đuôi xe", "Gầm xe"];
$("bCam").onclick = () => { S.cam = (S.cam + 1) % CAMS.length; $("bCam").textContent = "🎥 " + CAMS[S.cam]; controls.enabled = S.cam === 0; };
addEventListener("keydown", e => { if (e.code === "Space") { e.preventDefault(); for (const b of ["bUp", "bGo"]) if (!$(b).disabled) { $(b).click(); break; } } });
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
      sSize[i] = (0.045 + sDist[i] * 0.16) * sGrow[i] + (sMax[i] - sLife[i]) * 0.1;   // mảnh ở ống, loe dần, nở thêm chút theo thời gian
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
  if (S.mode === "takeoff") {
    S.lift = ease(S.lift, 1, 2.2, dt);
    if (S.lift > 0.6) S.alt = ease(S.alt, ALT_HOVER, 0.8, dt);
    if (S.alt > ALT_HOVER - 0.15) { S.mode = "hover"; status("Lơ lửng · bấm BAY TỚI"); setBtns(); }
  } else if (S.mode === "hover") {
    S.fwd = ease(S.fwd, 0, 3, dt); S.speed = ease(S.speed, 0, 0.8, dt); S.alt = ease(S.alt, ALT_HOVER, 1.5, dt); S.lift = ease(S.lift, 1, 3, dt);
  } else if (S.mode === "cruise") {
    S.fwd = ease(S.fwd, 1, 2.5, dt); S.speed = ease(S.speed, V_MAX, 0.3, dt); S.alt = ease(S.alt, ALT_HOVER + 1.2, 0.6, dt); S.lift = ease(S.lift, 0.75, 2, dt);
  } else if (S.mode === "landing") {
    S.fwd = ease(S.fwd, 0, 3, dt); S.speed = ease(S.speed, 0, 1.2, dt);
    if (S.speed < 3) S.alt = Math.max(0, S.alt - dt * (0.5 + S.alt * 0.4));
    S.lift = S.alt > 0.02 ? ease(S.lift, 0.85, 3, dt) : ease(S.lift, 0, 2.5, dt);
    if (S.alt <= 0 && S.lift < 0.04) { S.mode = "park"; S.lift = 0; status("Đã đáp xuống đường băng"); setBtns(); }
  }

  // thăng bằng: xe chao nhẹ (lò xo), lỗ hông bên chúi xuống phun để đẩy lại
  const air = S.alt > 0.05 ? 1 : 0;
  S.rollV += (-S.roll * 6 - S.rollV * 1.2 + (Math.random() - 0.5) * 3.2 * air * S.lift) * dt;
  S.roll += S.rollV * dt; if (!air) { S.roll *= 0.9; S.rollV *= 0.9; }

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

  // ống hông: mỗi nhịp = 1 dải khói LIỀN phóng thẳng ngang ~2 m, rồi CẢ dải tan cùng lúc
  for (const j of parts.side) {
    j.next -= dt; j.emit = Math.max(0, (j.emit || 0) - dt);
    const need = air0 * -j.s * S.roll * 18;                            // bên chúi xuống thì phụt sớm
    if (air0 && j.emit <= 0 && (j.next <= 0 || (need > 0.6 && j.next < 0.9))) {
      j.burst = newBurst(); j.emit = B_EMIT; j.next = 0.3 + Math.random() * 1.0;
    }
    if (j.emit > 0) {
      const n = Math.floor(900 * dt + Math.random());
      for (let k = 0; k < n; k++) {
        j.g.localToWorld(tmp.set(0, 0, 0.04));
        tmpV.copy(j.out).multiplyScalar(2 + Math.random() * 26);   // 2–28 m/s, cản 13/s ⇒ mỗi hạt dừng ở 0,15–2,1 m ⇒ dải phủ đều từ miệng ống tới 2 m
        const vv = tmpV.length(), g1 = (Math.random() + Math.random() + Math.random() - 1.5), g2 = (Math.random() + Math.random() + Math.random() - 1.5);
        tmpV.y += g1 * vv * 0.09 + vv * 0.025; tmpV.z += g2 * vv * 0.09;   // loe ~±0,3 m ở cuối, hơi bốc lên
        tmpV.applyQuaternion(q);
        puff(tmp, tmpV, 0.06, 9, 1, 1, 1e9, 1.5, 0.6 + Math.random() * 0.8, 13, j.burst + 1);   // bám xe suốt đời hạt; sống theo nhịp (không tự tan lẻ)
      }
    }
  }

  // bánh quay theo tốc độ khi còn trên đất, lúc bay quay chậm dần
  for (const w of parts.wheels) w.rotation.x += dt * (S.alt < 0.05 ? S.speed / WHEEL_R : 0.4 * (1 - S.lift));

  // thân xe
  const bob = S.lift * air * (Math.sin(S.t * 1.6) * 0.1 + Math.sin(S.t * 2.7) * 0.04);
  const shake = S.lift * 0.006 + S.fwd * 0.008;
  car.position.set((Math.random() - 0.5) * shake, S.alt + bob, (Math.random() - 0.5) * shake);
  car.rotation.x = ease(car.rotation.x, S.mode === "cruise" ? 0.04 : (S.mode === "takeoff" && S.lift > 0.6 ? -0.03 : 0), 2, dt);
  car.rotation.z = S.roll;

  // cuộn mặt đất
  rtex.offset.y += S.speed * dt / TILE;
  for (const l of edgeLights.children) { l.position.z -= S.speed * dt; if (l.position.z < -150) l.position.z += 40 * 7.5; }
  updateSmoke(dt);

  // camera
  if (S.cam === 0) { controls.target.lerp(lerpTo.set(0, car.position.y + 0.6, 0), 0.08); controls.update(); }
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
