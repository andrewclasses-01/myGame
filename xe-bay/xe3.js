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
const UNDER = [[-0.45, 0.55], [0.45, 0.55], [-0.45, -0.85], [0.45, -0.85]];
const REAR = { xs: [-0.56, -0.2, 0.2, 0.56], y: 0.63, r: 0.07 };   // nằm trong dải lưới đen dưới đèn hậu
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

function buildAll() {
  buildUnderJets();
  buildRearJets();
  buildSideJets();
  buildUnderGlow();
  buildPlate();
}

// ── Ống đẩy gầm: 4 miệng phẳng nằm SÁT sàn xe (gần như không thấy), phụt thẳng xuống
function buildUnderJets() {
  for (const [x, z] of UNDER) {
    const h = hit(x, -2, z, 0, 1, 0); const y = h ? h.p.y : 0.12;
    const g = new THREE.Group(); g.position.set(x, y - 0.004, z);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.052, 0.07, 28), M.black); ring.rotation.x = Math.PI / 2;
    const hot = new THREE.Mesh(new THREE.CircleGeometry(0.052, 28), M.nozzleHot); hot.rotation.x = Math.PI / 2; hot.position.y = -0.001;
    const fm = flameMat(0xeaf6ff, 0x2f7dff); const fl = flameCone(0.05, fm, 0.012); fl.position.y = -0.004;
    const cm = flameMat(0xffffff, 0x9fc4ff, 1); const col = flameCone(0.06, cm, 0.16); col.position.y = -0.004;   // cột khí trắng loe xuống đất
    g.add(ring, hot, fl, col); car.add(g);
    parts.under.push({ g, fl, fm, col, cm, x, z, y });
  }
}

// ── 4 ống đẩy đuôi: xếp hàng ngang ở khe khuếch tán dưới đuôi, phụt ra sau → đẩy xe bay tới
function buildRearJets() {
  for (const x of REAR.xs) {
    const h = hit(x, REAR.y, -6, 0, 0, 1);
    const g = new THREE.Group();
    if (h) g.position.copy(h.p).add(new THREE.Vector3(0, 0, -0.02)); else g.position.set(x, REAR.y, -2.25);
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1));   // luôn hướng thẳng ra sau
    const R = REAR.r;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R, R * 0.2, 12, 32), M.steel);
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.95, R * 0.95, 0.12, 28, 1, true), M.black); pipe.rotation.x = Math.PI / 2; pipe.position.z = -0.06;
    const hot = new THREE.Mesh(new THREE.CircleGeometry(R * 0.95, 28), M.rearHot); hot.position.z = -0.05;
    const fm = flameMat(0xfff4dc, 0x3b82ff); const fl = flameCone(R * 0.9, fm, 0.02); fl.rotation.x = -Math.PI / 2;   // dọc +z cục bộ = ra sau xe
    const fm2 = flameMat(0xffffff, 0x9cc8ff); const core = flameCone(R * 0.45, fm2); core.rotation.x = -Math.PI / 2;
    g.add(ring, pipe, hot, fl, core); car.add(g);
    parts.rear.push({ g, fl, fm, core, fm2, x });
  }
}

// ── 4 lỗ đẩy hông (trước + sau mỗi bên): phun ngang từng luồng để giữ thăng bằng
function buildSideJets() {
  for (const s of [-1, 1]) for (const z of SIDE.zs) {
    const h = hit(s * 4, SIDE.y, z, -s, 0, 0); if (!h) continue;
    const g = new THREE.Group(); stick(g, h, 0.002);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.007, 8, 22), M.steel);
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.03, 22), M.nozzleHot);
    const fm = flameMat(0xffffff, 0x7fb2ff, 0.4); const fl = flameCone(0.03, fm, 0.08); fl.rotation.x = -Math.PI / 2;
    g.add(ring, hole, fl); car.add(g);
    parts.side.push({ g, fl, fm, s, z, pow: 0, out: h.n.clone() });
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
  // ống gầm
  for (const p of parts.under) {
    p.fm.uniforms.uT.value = S.t; p.cm.uniforms.uT.value = S.t + 0.7;
    const fl = 0.85 + 0.15 * Math.sin(S.t * 37 + p.x * 9 + p.z * 5);
    p.fm.uniforms.uP.value = S.lift * fl; p.fl.scale.set(1, 0.1 + S.lift * 0.35 * fl, 1);
    p.cm.uniforms.uP.value = S.lift * 0.32;
    const toGround = S.alt + p.y + 0.05;
    p.col.scale.set(1 + S.alt * 0.08, Math.max(0.05, Math.min(toGround, 4.5)), 1 + S.alt * 0.08);
    if (S.lift > 0.05) {
      const n = Math.floor(S.lift * 70 * dt + Math.random());
      for (let k = 0; k < n; k++) {
        p.g.localToWorld(tmp.set(0, -0.05, 0));
        tmpV.set((Math.random() - 0.5) * 1.2, -(14 + Math.random() * 5), (Math.random() - 0.5) * 1.2).applyQuaternion(q);
        puff(tmp, tmpV, 0.4 + Math.random() * 0.35, 1.6 + Math.random() * 1.6, 0.9);
      }
    }
  }
  M.nozzleHot.emissiveIntensity = S.lift * 4;
  // 4 ống đuôi
  for (const r of parts.rear) {
    r.fm.uniforms.uT.value = S.t + r.x; r.fm2.uniforms.uT.value = S.t + 1.7 + r.x;
    const f = 0.88 + 0.12 * Math.sin(S.t * 41 + r.x * 13);
    r.fm.uniforms.uP.value = S.fwd * f; r.fm2.uniforms.uP.value = S.fwd * f;
    const len = 0.15 + S.fwd * (1.3 + 0.15 * Math.sin(S.t * 33 + r.x * 7));
    r.fl.scale.set(1, len, 1); r.core.scale.set(1, len * 0.55, 1);
    if (S.fwd > 0.2 && Math.random() < S.fwd * 0.8) {
      r.g.localToWorld(tmp.set(0, 0, 0.3 + len * 0.6));
      tmpV.set((Math.random() - 0.5) * 0.6, (Math.random() - 0.3) * 0.5, -6 - Math.random() * 4).applyQuaternion(q);
      puff(tmp, tmpV, 0.3, 0.9 + Math.random() * 0.6, 0.25);
    }
  }
  M.rearHot.emissiveIntensity = S.fwd * 6;
  M.ledAmberRed.emissiveIntensity = Math.max(S.lift, air) * 4;
  parts.underLight.intensity = S.lift * 30;

  // lỗ hông: bên nào chúi xuống thì phun bên đó; thêm nhịp ngẫu nhiên nhỏ khi lơ lửng
  for (const j of parts.side) {
    const need = air * Math.max(0, -j.s * S.roll * 18 + (Math.random() < 0.004 * S.lift ? 1 : 0));
    j.pow = Math.max(j.pow - dt * 3.5, Math.min(1, need));
    j.fm.uniforms.uT.value = S.t; j.fm.uniforms.uP.value = j.pow;
    j.fl.scale.set(1, 0.05 + j.pow * 0.45, 1);
    if (j.pow > 0.3 && Math.random() < 0.25) {
      j.g.localToWorld(tmp.set(0, 0, 0.05));
      tmpV.copy(j.out).applyQuaternion(q).multiplyScalar(8 + Math.random() * 3); tmpV.y += 0.3;
      puff(tmp, tmpV, 0.08, 0.35 + Math.random() * 0.2, 0.2);
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
  composer.render();
}
renderer.setAnimationLoop(tick);
addEventListener("resize", () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight); });
window.__S = S; window.__dbg = { bloom, renderer, scene, camera, car, hit };
