// BALLOON POP 3D — lõi MẪU 1e (29/9/2026): như 1d + 2 TOA PHỤ (toa khách có người / toa than) giữa các toa đáp án,
// máy quay giữ toa trống đầu tiên TỐI ĐA ở giữa màn (toa sau còn ngoài mép), va chạm khi đúng chỉ 1/10, thùng rơi
// vào toa than ⇒ than văng + trừ điểm, người trong toa chi tiết (ngón tay), con vật trên đồi xa, bỏ dấu ✓ ở điểm.
// Lịch sử 1d: như 1c + tàu nhanh chậm tự nhiên, bỏ ✓/✗ (chỉ điểm bay lên, Points off),
// thùng đúng phải TRƯỢT dừng hẳn mới tính (quá mép thì rơi), từ quay vòng tới hết giờ, máy bay bay trái→phải,
// toa than chỉ hoa văn, thỉnh thoảng có TOA KHÁCH (coach-1d.js), cảnh 1d (west-world-1d.js).
// Lịch sử 1c: chép từ 1b + đường ray thật, mặt đất cỏ/bụi/xương rồng (west-world-1c.js),
// logo ANDREW STUDIO trên đầu máy, MÁY QUAY LIA THEO TÀU khi đầu máy tới 75% màn, thùng hàng có VẬT LÝ (quán tính, va, văng, nảy).
// Lịch sử 1b: chép từ bp3d.js rồi nâng đồ hoạ (cảnh viễn tây west-world.js,
// đầu máy hơi nước 4-4-0 + toa than + toa hàng gỗ, khinh khí cầu vỏ vải, hậu kỳ bloom + chỉnh màu). Tàu nhỏ lại (TS).
// Luật như Wordwall (thầy chốt 29/9): màn N có N toa định nghĩa; bấm nổ khinh khí cầu ⇒ thùng mang TỪ
// RƠI THẲNG xuống, phải canh cho rơi trúng toa đúng. Toa rộng cố định, đoàn tàu dài hơn màn thì chạy vòng.
// createBalloonPop({ mount, view: "side" | "top", words, wordsTitle })
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { createBpSound } from "./bp3d-sound.js";
import { createWestWorld, normalFromNoise, TRACK_TOP } from "./west-world-1e.js";
import { makeCoach, addPassengers, animatePassengers, makeCoalCar, COACH_LEN, COAL_LEN, COAL_LUMP, coalMaterial } from "./coach-1e.js";

const FONT = '"Baloo 2", system-ui, sans-serif';
const ASPECT = 16 / 10.5;                       // đúng khung act đơn của AWord
const PALETTE = [0x7a1a14, 0x1d4a2f, 0x1f3a6b, 0x4a1d3a, 0x2a2a2c, 0x16404a, 0x6b3a12, 0x243d5c, 0x5a2a14, 0x3d5a1f];
const CART_W = 6.2, CART_GAP = 0.45, CART_PITCH = CART_W + CART_GAP, ENGINE_LEN = 6.4, TENDER_LEN = 3.4;
const HEAD = ENGINE_LEN / 2 + CART_GAP + TENDER_LEN + CART_GAP;   // từ tâm đầu máy tới đầu toa hàng thứ nhất
const TS = 0.74, BS = 0.84, RAIL_TOP = 0.62;                      // tỉ lệ tàu, tỉ lệ khinh khí cầu, mặt ray
const ROOF_Y = 3.72, CRATE = 1.5, CRATE_W = 2.9, GRAV = 15;
const ROOF_W = RAIL_TOP + ROOF_Y * TS, CRATE_H = CRATE * TS / 2;   // nóc toa và nửa chiều cao thùng (thế giới)
const MAX_BLIMPS = 5;

const VIEWS = {
  side: { cam: [0, 4.6, 25], look: [0, 6.1, 0], fov: 36, lanes: [7.3, 9.1, 10.9], guide: false },
  top:  { cam: [0, 21, 19.5], look: [0, 5.5, -2.4], fov: 40, lanes: [8.0, 9.8, 11.6], guide: true },
};

const DEFAULTS = { timer: 120, levels: 10, pointsOff: 0, balloonSpeed: 2, trainSpeed: 2, bonusTime: true, bonusPoints: true, bonusX2: true };

export async function createBalloonPop({ mount, view = "side", words, wordsTitle = "" }) {
  const V = VIEWS[view] || VIEWS.side;
  const opt = { ...DEFAULTS, guide: V.guide };
  const sfx = createBpSound();
  try { await document.fonts.load(`800 60px ${FONT}`); await document.fonts.load(`600 60px ${FONT}`); await document.fonts.load(`italic 900 60px "Exo 2"`); } catch (e) { /* vẽ bằng font dự phòng */ }

  // ------------------------------------------------------------------ khung + HUD
  mount.innerHTML = HUD_HTML;
  const stage = mount.querySelector(".bp-stage");
  const canvas = stage.querySelector("canvas");
  const $ = s => stage.querySelector(s);
  const clockEl = $(".bp-clock"), progEl = $(".bp-prog i"), scoreEl = $(".bp-score b"), signEl = $(".bp-sign");
  const ovStart = $(".bp-ov-start"), ovEnd = $(".bp-ov-end"), ovPause = $(".bp-ov-pause"), ovAns = $(".bp-ov-ans");
  $(".bp-words").textContent = `${words.length} words${wordsTitle ? " · " + wordsTitle : ""}`;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  const PR = Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(PR);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(V.fov, ASPECT, 0.5, 4000);
  camera.position.set(...V.cam);
  camera.lookAt(...V.look);
  camera.updateMatrixWorld();

  function fit() {
    const W = window.innerWidth, Hh = window.innerHeight;
    let w = W, h = W / ASPECT;
    if (h > Hh) { h = Hh; w = h * ASPECT; }
    stage.style.width = Math.floor(w) + "px";
    stage.style.height = Math.floor(h) + "px";
    renderer.setSize(Math.floor(w), Math.floor(h), false);
    if (composer) { composer.setPixelRatio(PR); composer.setSize(Math.floor(w), Math.floor(h)); }
  }
  let composer = null;
  fit();
  window.addEventListener("resize", fit);
  document.addEventListener("fullscreenchange", fit);

  // nửa bề ngang nhìn thấy: HALF ở độ cao nóc toa (cho tàu), SKY ở làn khinh khí cầu cao nhất (cho trời)
  const halfAt = y => {
    const v = new THREE.Vector3(0, y, 0).project(camera), rc = new THREE.Raycaster(), p = new THREE.Vector3();
    rc.setFromCamera(new THREE.Vector2(1, v.y), camera);
    return rc.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), p) ? Math.abs(p.x) : 18;
  };
  const HALF = halfAt(ROOF_W);
  const SKY = Math.max(HALF, halfAt(V.lanes[2] + 1.5));

  const world = createWestWorld(scene, renderer);
  // quét 1 lượt: sửa mọi pháp tuyến bằng 0 còn sót trong cảnh
  { const seen = new Set(); scene.traverse(o => { const g = o.geometry; if (!g || seen.has(g) || !g.attributes.normal) return; seen.add(g); const n = g.attributes.normal; for (let i = 0; i < n.count; i++) { const l = n.getX(i) ** 2 + n.getY(i) ** 2 + n.getZ(i) ** 2; if (!(l > 1e-8)) { n.setXYZ(i, 0, 1, 0); n.needsUpdate = true; } } }); }

  // hậu kỳ điện ảnh: MSAA 4 mẫu (tránh lấp loá), bloom nhẹ cho mặt trời/đèn, chỉnh màu + vignette + hạt phim
  composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 }));
  composer.addPass(new RenderPass(scene, camera));
  // chốt an toàn: điểm ảnh NaN/Inf (từ bất kỳ vật liệu nào) bị xoá TRƯỚC bloom — không bao giờ loang thành màn đen nháy
  composer.addPass(new ShaderPass({
    uniforms: { tDiffuse: { value: null } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: `uniform sampler2D tDiffuse; varying vec2 vUv;
      void main(){ vec4 c = texture2D(tDiffuse, vUv); if (any(isnan(c)) || any(isinf(c))) c = vec4(0., 0., 0., 1.); gl_FragColor = min(c, vec4(64.)); }`,
  }));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.2, 0.32, 1.1);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const grade = new ShaderPass(GRADE_SHADER);
  composer.addPass(grade);
  fit();

  // ------------------------------------------------------------------ tài nguyên dùng chung
  const envelopeGeo = (() => {
    const pts = [];
    for (let i = 0; i <= 48; i++) {
      const t = i / 48, y = -3.4 + t * 6.8;
      let r = 1.2 * Math.pow(Math.sin(Math.PI * Math.min(0.999, Math.max(0.001, t))), 0.5);
      if (t > 0.55) r *= 1 - 0.42 * Math.pow((t - 0.55) / 0.45, 1.4);
      pts.push(new THREE.Vector2(Math.max(0.001, r), y));
    }
    const geo = new THREE.LatheGeometry(pts, 64); geo.rotateZ(-Math.PI / 2); return geo;
  })();
  const finGeo = (() => {
    const s = new THREE.Shape(); s.moveTo(-0.9, 0); s.lineTo(0.75, 0); s.lineTo(0.95, 1.05); s.lineTo(0.1, 1.05); s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 1 });
    geo.translate(0, 0, -0.03); geo.rotateX(Math.PI / 2); return geo;
  })();
  const G = {
    crate: new THREE.BoxGeometry(CRATE_W, CRATE, CRATE),
    shard: new THREE.PlaneGeometry(0.34, 0.22),
    blimp: new THREE.SphereGeometry(1, 40, 20),
    hitBlimp: new THREE.SphereGeometry(1, 12, 8),
    envelope: envelopeGeo, fin: finGeo,
    gondola: new THREE.CapsuleGeometry(0.3, 1.1, 6, 16),
    rope: new THREE.CylinderGeometry(0.012, 0.012, 0.55, 4),
    pod: new THREE.CapsuleGeometry(0.12, 0.35, 4, 10),
    blade: new THREE.BoxGeometry(0.03, 0.55, 0.08),
    banner: new THREE.PlaneGeometry(5.2, 1.26),
  };
  const woodN = normalFromNoise(256, 21, 1.6, 6); woodN.repeat.set(1, 1);
  const M = {
    iron: new THREE.MeshStandardMaterial({ color: 0x1d1d20, metalness: 0.75, roughness: 0.42 }),
    ironDouble: new THREE.MeshStandardMaterial({ color: 0x1d1d20, metalness: 0.75, roughness: 0.42, side: THREE.DoubleSide }),
    redIron: new THREE.MeshStandardMaterial({ color: 0x8a1d14, metalness: 0.35, roughness: 0.45 }),
    steel: new THREE.MeshStandardMaterial({ color: 0xb8bcc2, metalness: 1, roughness: 0.25 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xd9a441, metalness: 1, roughness: 0.22 }),
    brassDouble: new THREE.MeshStandardMaterial({ color: 0xd9a441, metalness: 1, roughness: 0.22, side: THREE.DoubleSide }),
    glass: new THREE.MeshStandardMaterial({ color: 0x151a22, metalness: 0.8, roughness: 0.08 }),
    lens: new THREE.MeshBasicMaterial({ color: new THREE.Color(4.0, 3.1, 1.8) }),
    cabWood: new THREE.MeshStandardMaterial({ map: plankTexture("#7a4526", "#5e331b", true), normalMap: woodN, roughness: 0.55, metalness: 0.05 }),
    boxcar: new THREE.MeshStandardMaterial({ map: plankTexture("#8a3b24", "#6d2c1a", true), normalMap: woodN, roughness: 0.82 }),
    woodDark: new THREE.MeshStandardMaterial({ color: 0x3b2618, roughness: 0.9 }),
    log: new THREE.MeshStandardMaterial({ color: 0x6b4a2e, roughness: 0.92 }),
    wheelDrive: new THREE.MeshStandardMaterial({ map: wheelTexture(true), metalness: 0.55, roughness: 0.45, alphaTest: 0.5 }),
    wheelSmall: new THREE.MeshStandardMaterial({ map: wheelTexture(false), metalness: 0.55, roughness: 0.45, alphaTest: 0.5 }),
    envelope: new THREE.MeshStandardMaterial({ map: fabricTexture(), color: 0xf2eee6, roughness: 0.55, metalness: 0.18 }),
    finRed: new THREE.MeshPhysicalMaterial({ color: 0xa3261b, roughness: 0.4, metalness: 0.2, clearcoat: 0.5 }),
    gondola: new THREE.MeshStandardMaterial({ map: plankTexture("#6b4428", "#4d2f1a", false), roughness: 0.6 }),
    gonWin: new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.25, 0.7) }),
    rope: new THREE.MeshStandardMaterial({ color: 0x3a2c20, roughness: 1 }),
    hit: new THREE.MeshBasicMaterial({ visible: false }),
    shard: new THREE.MeshStandardMaterial({ color: 0xece6da, roughness: 0.7, side: THREE.DoubleSide, transparent: true }),
    crateSide: new THREE.MeshStandardMaterial({ map: plankTexture("#b27a45", "#8c5a2e", false), normalMap: woodN, roughness: 0.85 }),
  };
  const smokeTex = softDotTexture();
  const flashTex = softDotTexture();
  // tài nguyên dùng chung: disposeTree() không được huỷ
  Object.values(G).forEach(x => { x.userData.shared = true; });
  Object.values(M).forEach(x => { x.userData.shared = true; if (x.map) x.map.userData.shared = true; if (x.normalMap) x.normalMap.userData.shared = true; });
  smokeTex.userData.shared = true;

  // ------------------------------------------------------------------ trạng thái
  const S = {
    state: "attract", paused: false, level: 0, timeLeft: opt.timer, score: 0, x2: 0,
    train: null, carts: [], trainX: 0, trainLen: 0, trainV: 0, introT: 0, clearT: 0,
    blimps: [], crates: [], fx: [], spawnT: 0, deck: [], levels: [], bag: [], lastTick: 99, chugT: 0,
    plane: null, time: 0, camX: 0, camTarget: 0, camV: 0, shake: 0, cars: [], coaches: [],
  };
  const sky = new THREE.Group(); scene.add(sky);
  const fxRoot = new THREE.Group(); scene.add(fxRoot);

  // ------------------------------------------------------------------ bộ câu theo màn
  const norm = s => String(s).trim().toUpperCase().replace(/\s+/g, " ");
  const allKeys = [...new Set(words.map(w => norm(w.keyword)))];
  function nextLevelItems(n) {
    const out = [], used = new Set();
    let guard = 0;
    while (out.length < n && guard++ < 500) {
      if (!S.bag.length) S.bag = shuffle(words.slice());
      const it = S.bag.pop();
      const k = norm(it.keyword);
      if (used.has(k)) { S.bag.unshift(it); if (S.bag.length <= out.length + 1) S.bag = shuffle(words.slice()); continue; }
      used.add(k); out.push(it);
    }
    return out;
  }

  // ------------------------------------------------------------------ đoàn tàu (đơn vị gốc; cả đoàn thu nhỏ TS, đặt trên mặt ray)
  function buildTrain(items, levelIdx) {
    if (S.train) { scene.remove(S.train); disposeTree(S.train); }
    const train = new THREE.Group();
    const paintHex = PALETTE[levelIdx % PALETTE.length];
    const engine = makeEngine(paintHex, levelIdx + 1);
    train.add(engine);
    const tender = makeTender(paintHex);
    tender.position.x = -ENGINE_LEN / 2 - CART_GAP - TENDER_LEN / 2;
    train.add(tender);
    // Sau toa than củi: [toa đáp án] · 2 toa phụ · [toa đáp án] · 2 toa phụ · ... Toa phụ = toa khách có người (62%)
    // hoặc toa than đen. 2 toa phụ đủ dài để toa đáp án kế tiếp luôn nằm NGOÀI mép trái khi toa trước ở giữa màn.
    let cursor = -HEAD;
    S.cars = []; S.coaches = [];
    const addFiller = () => {
      let car;
      if (Math.random() < 0.62) {
        const co = makeCoach([0x1f4a33, 0x5a1a1a, 0x1f3050, 0x4a3a1a][Math.floor(Math.random() * 4)], meshAdder, M);
        car = { type: "coach", group: co.group, len: COACH_LEN, roof: co.roof, bogies: co.bogies, people: addPassengers(co.group, co.y0), startleT: null };
        S.coaches.push(car);
      } else {
        const cc = makeCoalCar(meshAdder, M, [0x2c2c2e, 0x3a2a22, 0x2a3036][Math.floor(Math.random() * 3)]);
        car = { type: "coal", group: cc.group, len: COAL_LEN, roof: cc.roof, bogies: cc.bogies };
      }
      for (const bx of car.bogies) for (const s of [-1, 1]) for (const dx of [-0.52, 0.52]) wheel(car.group, 0.38, bx + dx, s * 0.82, false);
      car.localX = cursor - car.len / 2; car.group.position.x = car.localX;
      train.add(car.group); S.cars.push(car); cursor -= car.len + CART_GAP;
    };
    S.carts = items.map((it, i) => {
      if (i > 0) { addFiller(); addFiller(); }
      const cart = makeCart(it.definition, i);
      const localX = cursor - CART_W / 2; cart.position.x = localX; cursor -= CART_W + CART_GAP;
      train.add(cart);
      const c = { type: "answer", group: cart, item: it, key: norm(it.keyword), filled: false, localX, len: CART_W, roof: ROOF_Y };
      S.cars.push(c);
      return c;
    });
    S.wheels = []; S.rods = [];
    train.traverse(o => { if (o.userData.wheelR) S.wheels.push(o); if (o.userData.rod) S.rods.push(o); });
    train.scale.setScalar(TS);
    train.position.y = RAIL_TOP;
    S.train = train; S.engine = engine; S.wheelA = 0;
    S.trainLen = (ENGINE_LEN / 2 - cursor - CART_GAP) * TS;
    scene.add(train);
  }
  // trainX = mũi đầu máy (thế giới); gốc nhóm tàu = tâm đầu máy
  function placeTrain() { S.train.position.x = S.trainX - ENGINE_LEN / 2 * TS; }
  const cartWorldX = c => S.train.position.x + c.localX * TS;

  function meshAdder(g) {
    return (geo, mat, x, y, z = 0, rx = 0, ry = 0, rz = 0) => {
      const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz);
      m.castShadow = true; m.receiveShadow = true; g.add(m); return m;
    };
  }
  function wheel(g, r, x, z, drive) {
    const face = drive ? M.wheelDrive : M.wheelSmall;
    const w = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.16, 40), [M.iron, face, face]);
    w.rotation.x = Math.PI / 2; w.position.set(x, r, z);
    w.userData.wheelR = r; w.castShadow = true; g.add(w);
    return w;
  }

  function makeEngine(paintHex, num) {
    const g = new THREE.Group(), add = meshAdder(g);
    const paint = new THREE.MeshPhysicalMaterial({ color: paintHex, metalness: 0.3, roughness: 0.34, clearcoat: 0.7, clearcoatRoughness: 0.22 });
    const cylX = (r, len, mat, x, y, z = 0) => add(new THREE.CylinderGeometry(r, r, len, 36), mat, x, y, z, 0, 0, Math.PI / 2);
    // khung + dầm đệm trước
    add(new THREE.BoxGeometry(6.3, 0.3, 1.4), M.iron, -0.15, 1.08);
    add(new THREE.BoxGeometry(0.2, 0.46, 2.0), M.redIron, 3.1, 1.02);
    // nồi hơi + đai đồng + hộp khói
    cylX(0.8, 3.9, paint, 0.85, 2.05);
    for (const x of [-0.95, 0.15, 1.2, 2.25]) cylX(0.815, 0.08, M.brass, x, 2.05);
    cylX(0.86, 0.8, M.iron, 2.95, 2.05);
    cylX(0.6, 0.05, M.brass, 3.37, 2.05);
    // ống khói loe kiểu miền Tây
    add(new THREE.CylinderGeometry(0.2, 0.25, 0.85, 24), M.iron, 2.72, 3.25);
    add(new THREE.CylinderGeometry(0.7, 0.21, 1.0, 32, 1, true), M.ironDouble, 2.72, 4.15);
    add(new THREE.CylinderGeometry(0.66, 0.7, 0.36, 32), M.iron, 2.72, 4.83);
    add(new THREE.CylinderGeometry(0.34, 0.66, 0.22, 32), M.iron, 2.72, 5.1);
    // đèn pha hộp + kính phát sáng
    add(new THREE.BoxGeometry(0.62, 0.66, 0.66), M.redIron, 3.25, 3.25);
    add(new THREE.BoxGeometry(0.7, 0.08, 0.74), M.brass, 3.25, 3.62);
    add(new THREE.CylinderGeometry(0.1, 0.16, 0.26, 12), M.iron, 3.25, 3.78);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.24, 24), M.lens); lens.position.set(3.565, 3.24, 0); lens.rotation.y = Math.PI / 2; g.add(lens);
    // vòm hơi, vòm cát, chuông, còi
    for (const x of [1.45, 0.2]) {
      add(new THREE.CylinderGeometry(0.33, 0.38, 0.5, 28), M.brass, x, 3.02);
      add(new THREE.SphereGeometry(0.33, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), M.brass, x, 3.27);
    }
    const bell = new THREE.LatheGeometry([[0.001, 0.34], [0.12, 0.33], [0.16, 0.2], [0.2, 0.05], [0.26, 0]].map(([r, y]) => new THREE.Vector2(r, y)), 28);
    add(bell, M.brassDouble, 0.82, 2.88);
    add(new THREE.CylinderGeometry(0.05, 0.07, 0.42, 12), M.brass, -0.72, 3.0);
    // cabin gỗ đánh bóng + cửa sổ
    add(new THREE.BoxGeometry(2.1, 2.15, 1.95), M.cabWood, -1.95, 2.33);
    add(new THREE.BoxGeometry(2.2, 0.14, 2.05), paint, -1.95, 1.3);
    add(new THREE.BoxGeometry(2.55, 0.12, 2.35), M.iron, -1.95, 3.47);
    add(new THREE.BoxGeometry(2.3, 0.1, 2.1), paint, -1.95, 3.56);
    for (const s of [-1, 1]) for (const x of [-2.45, -1.5]) add(new THREE.BoxGeometry(0.62, 0.62, 0.02), M.glass, x, 2.72, s * 0.985);
    // gạt trâu (pilot) dạng thanh
    for (let i = -4; i <= 4; i++) {
      const z = i * 0.22, a = new THREE.Vector3(3.2, 0.98, z), b = new THREE.Vector3(4.05, 0.2, z * 0.3);
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, a.distanceTo(b), 6), M.redIron);
      bar.position.copy(a).add(b).multiplyScalar(0.5); bar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
      bar.castShadow = true; g.add(bar);
    }
    add(new THREE.BoxGeometry(0.08, 0.08, 1.9), M.redIron, 3.25, 0.95);
    // xy lanh
    for (const s of [-1, 1]) {
      cylX(0.3, 1.05, M.iron, 2.2, 1.28, s * 0.95);
      cylX(0.31, 0.06, M.brass, 1.68, 1.28, s * 0.95);
      cylX(0.31, 0.06, M.brass, 2.72, 1.28, s * 0.95);
    }
    // bánh: 2 dẫn hướng nhỏ + 2 bánh lái lớn (kiểu 4-4-0), thanh truyền quay theo tay quay
    for (const s of [-1, 1]) {
      wheel(g, 0.42, 2.55, s * 0.9, false); wheel(g, 0.42, 1.62, s * 0.9, false);
      wheel(g, 0.82, 0.35, s * 0.98, true); wheel(g, 0.82, -1.45, s * 0.98, true);
      const rod = add(new THREE.BoxGeometry(2.1, 0.1, 0.06), M.steel, -0.55, 0.82, s * 1.1);
      rod.userData.rod = { x0: -0.55, y0: 0.82, r: 0.3, ph: s > 0 ? 0 : Math.PI / 2 };
      const main = add(new THREE.BoxGeometry(2.0, 0.09, 0.05), M.steel, 1.35, 1.1, s * 1.16);
      main.userData.rod = { x0: 1.35, y0: 1.1, r: 0.3, ph: s > 0 ? 0 : Math.PI / 2, tilt: true };
    }
    // huy hiệu ANDREW STUDIO trên hông cabin + số màn trên 2 hông đèn pha
    const emblem = new THREE.MeshStandardMaterial({ map: emblemTexture(), metalness: 0.7, roughness: 0.3 });
    const numMat = new THREE.MeshStandardMaterial({ map: badgeTexture(num), metalness: 0.6, roughness: 0.35 });
    for (const s of [-1, 1]) {
      const badge = new THREE.Mesh(new THREE.CircleGeometry(0.46, 40), emblem);
      badge.position.set(-1.95, 1.88, s * 0.986); if (s < 0) badge.rotation.y = Math.PI; g.add(badge);
      const nb = new THREE.Mesh(new THREE.CircleGeometry(0.24, 28), numMat);
      nb.position.set(3.25, 3.25, s * 0.335); if (s < 0) nb.rotation.y = Math.PI; g.add(nb);
    }
    // bảng tên ANDREW STUDIO bằng đồng dọc thân nồi hơi
    for (const s of [-1, 1]) {
      const plate = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 0.42), new THREE.MeshStandardMaterial({ map: nameplateTexture(), metalness: 0.8, roughness: 0.28, transparent: true }));
      plate.position.set(0.55, 2.05, s * 0.84); if (s < 0) plate.rotation.y = Math.PI; g.add(plate);
    }
    g.userData.stack = new THREE.Vector3(2.72, 5.3, 0);
    return g;
  }

  function makeTender(paintHex) {
    const g = new THREE.Group(), add = meshAdder(g);
    const paint = new THREE.MeshPhysicalMaterial({ color: paintHex, metalness: 0.3, roughness: 0.36, clearcoat: 0.6, clearcoatRoughness: 0.25 });
    add(new THREE.BoxGeometry(TENDER_LEN, 0.28, 1.4), M.iron, 0, 0.98);
    add(new THREE.BoxGeometry(TENDER_LEN - 0.1, 1.15, 1.9), paint, 0, 1.7);
    add(new THREE.BoxGeometry(TENDER_LEN, 0.1, 1.98), M.brass, 0, 2.3);
    // hoa văn vàng trang trí trên hông toa than (chữ ANDREW STUDIO chỉ ở đầu máy)
    for (const s of [-1, 1]) {
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(TENDER_LEN - 0.3, 0.8), new THREE.MeshStandardMaterial({ map: ornamentTexture(), transparent: true, metalness: 0.5, roughness: 0.35 }));
      sign.position.set(0, 1.72, s * 0.96); if (s < 0) sign.rotation.y = Math.PI; g.add(sign);
    }
    add(new THREE.BoxGeometry(TENDER_LEN - 0.2, 0.08, 1.98), M.brass, 0, 1.18);
    const r = mulberry(9);
    for (let i = 0; i < 16; i++) {
      add(new THREE.CylinderGeometry(0.13, 0.13, 1.5 + r() * 0.3, 10), M.log, -1.3 + (i % 6) * 0.48 + r() * 0.1, 2.45 + Math.floor(i / 6) * 0.2, (r() - 0.5) * 0.5, Math.PI / 2, 0, (r() - 0.5) * 0.2);
    }
    for (const s of [-1, 1]) for (const x of [-1.15, -0.35, 0.45, 1.25]) wheel(g, 0.38, x, s * 0.9, false);
    return g;
  }

  function makeCart(definition) {
    const g = new THREE.Group(), add = meshAdder(g);
    add(new THREE.BoxGeometry(CART_W, 0.26, 1.5), M.iron, 0, 0.95);
    add(new THREE.BoxGeometry(CART_W - 0.1, 2.4, 1.95), [M.boxcar, M.boxcar, M.woodDark, M.woodDark, M.boxcar, M.boxcar], 0, 2.3);
    // đai sắt dọc + ngang
    for (const x of [-CART_W / 2 + 0.08, CART_W / 2 - 0.08]) for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.1, 2.44, 0.03), M.iron, x, 2.3, s * 0.99);
    for (const y of [1.14, 3.46]) for (const s of [-1, 1]) add(new THREE.BoxGeometry(CART_W - 0.05, 0.1, 0.03), M.iron, 0, y, s * 0.99);
    // mái + lối đi trên nóc
    add(new THREE.BoxGeometry(CART_W + 0.25, 0.14, 2.2), M.woodDark, 0, 3.57);
    add(new THREE.BoxGeometry(CART_W + 0.1, 0.07, 0.5), M.log, 0, ROOF_Y - 0.035);
    // bảng định nghĩa sơn trên hông toa (hướng về máy quay)
    const face = new THREE.Mesh(new THREE.PlaneGeometry(CART_W - 0.5, 2.1), new THREE.MeshBasicMaterial({ map: boardTexture(definition), color: new THREE.Color(1.04, 1.04, 1.04) }));
    face.position.set(0, 2.3, 1.0); g.add(face);
    // 2 giá chuyển hướng (bogie) 4 bánh
    for (const bx of [-CART_W / 2 + 1.1, CART_W / 2 - 1.1]) {
      add(new THREE.BoxGeometry(1.7, 0.22, 1.5), M.iron, bx, 0.62);
      for (const s of [-1, 1]) for (const dx of [-0.52, 0.52]) wheel(g, 0.38, bx + dx, s * 0.82, false);
    }
    add(new THREE.BoxGeometry(0.45, 0.14, 0.14), M.iron, CART_W / 2 + 0.2, 0.9);
    return g;
  }

  // ------------------------------------------------------------------ khinh khí cầu
  function laneFree(y, fromX) {
    return !S.blimps.some(b => Math.abs(b.baseY - y) < 0.5 && b.x > fromX - 8.5);
  }
  function drawKeyword() {
    const first = S.carts.find(c => !c.filled);
    const open = first ? [first.item.keyword] : [];
    if (!S.deck.length) {
      const inLevel = new Set(S.carts.map(c => c.key));
      const others = shuffle(words.filter(w => !inLevel.has(norm(w.keyword))).map(w => w.keyword));
      const nDis = Math.max(1, Math.min(3, Math.ceil(open.length * 0.6)));
      S.deck = shuffle([...open, ...open, ...others.slice(0, nDis)]);
    }
    let k = S.deck.pop();
    // từ của toa đã đầy thì đổi sang từ còn mở (không để trời đầy từ đã xong)
    const openSet = new Set(open.map(norm));
    const done = new Set(S.carts.filter(c => c.filled).map(c => c.key));
    if (done.has(norm(k)) && !openSet.has(norm(k)) && open.length) k = open[0];
    return k;
  }
  function spawnBlimp(x, attract) {
    const lanes = shuffle(V.lanes.slice());
    const spawnX = x ?? S.camX + SKY + 7;
    const y = lanes.find(l => x != null || laneFree(l, spawnX));
    if (y == null) return false;
    const bonusTypes = [opt.bonusTime && "time", opt.bonusPoints && "points", opt.bonusX2 && "x2"].filter(Boolean);
    const bonus = !attract && bonusTypes.length && Math.random() < 0.11 ? bonusTypes[Math.floor(Math.random() * bonusTypes.length)] : null;
    const word = bonus ? null : (attract ? words[Math.floor(Math.random() * words.length)].keyword : drawKeyword());
    const obj = bonus ? makeBonusBalloon(bonus) : makeBlimp(word);
    const b = { obj, word, bonus, x: spawnX, baseY: y, y, phase: Math.random() * 6, attract: !!attract, leaving: false, vy: 0 };
    obj.position.set(b.x, y, 0);
    obj.userData.blimp = b;
    sky.add(obj);
    if (opt.guide && !bonus && !attract) b.guide = makeGuide(y);
    if (b.guide) sky.add(b.guide);
    S.blimps.push(b);
    return true;
  }
  function makeBlimp(word) {
    const g = new THREE.Group();
    const env = new THREE.Mesh(G.envelope, M.envelope); env.castShadow = true; env.receiveShadow = true; g.add(env);
    // 4 cánh đuôi
    for (let i = 0; i < 4; i++) {
      const pivot = new THREE.Group(); pivot.rotation.x = i * Math.PI / 2 + Math.PI / 4;
      const fin = new THREE.Mesh(G.fin, M.finRed); fin.position.set(2.2, 0, 0.42); fin.castShadow = true;
      pivot.add(fin); g.add(pivot);
    }
    // khoang lái + dây treo + 2 động cơ cánh quạt
    const gon = new THREE.Mesh(G.gondola, M.gondola); gon.rotation.z = Math.PI / 2; gon.position.set(-0.3, -1.4, 0); gon.castShadow = true; g.add(gon);
    const win = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.14, 0.6), M.gonWin); win.position.set(-0.3, -1.33, 0); g.add(win);
    for (const [x, z] of [[-0.9, 0.2], [0.3, 0.2], [-0.9, -0.2], [0.3, -0.2]]) {
      const c = new THREE.Mesh(G.rope, M.rope); c.position.set(x, -1.05, z); c.rotation.z = x < 0 ? -0.25 : 0.25; g.add(c);
    }
    g.userData.props = [];
    for (const s of [-1, 1]) {
      const pod = new THREE.Mesh(G.pod, M.steel); pod.rotation.z = Math.PI / 2; pod.position.set(0.55, -1.3, s * 0.62); pod.castShadow = true; g.add(pod);
      const prop = new THREE.Group(); prop.position.set(0.95, -1.3, s * 0.62);
      for (let k = 0; k < 3; k++) { const b = new THREE.Mesh(G.blade, M.log); b.rotation.x = k * Math.PI * 2 / 3; prop.add(b); }
      g.add(prop); g.userData.props.push(prop);
    }
    const banner = new THREE.Mesh(G.banner, new THREE.MeshBasicMaterial({ map: wordTexture(word), transparent: true, depthWrite: false, color: new THREE.Color(1.04, 1.04, 1.04) }));
    banner.renderOrder = 5;
    g.add(banner); g.userData.banner = banner;
    const hit = new THREE.Mesh(G.hitBlimp, M.hit); hit.scale.set(3.8, 1.9, 1.9); g.add(hit); g.userData.hit = hit;
    g.scale.setScalar(BS);
    return g;
  }
  function makeBonusBalloon(type) {
    const g = new THREE.Group();
    const col = type === "time" ? 0x3f9cff : type === "points" ? 0xf2b726 : 0xa45cff;
    const mat = new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.18, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.08 });
    const ball = new THREE.Mesh(G.blimp, mat); ball.scale.set(1.15, 1.32, 1.15); ball.castShadow = true; g.add(ball);
    const knot = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.3, 12), mat); knot.position.y = -1.4; knot.rotation.x = Math.PI; g.add(knot);
    const str = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.8, 4), M.rope); str.position.y = -2.4; g.add(str);
    const icon = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshBasicMaterial({ map: iconTexture(type), transparent: true, depthWrite: false }));
    icon.renderOrder = 5; g.add(icon); g.userData.banner = icon;
    const hit = new THREE.Mesh(G.hitBlimp, M.hit); hit.scale.set(1.9, 2.1, 1.9); g.add(hit); g.userData.hit = hit;
    g.scale.setScalar(BS);
    return g;
  }
  function makeGuide(y) {
    const g = new THREE.Group();
    const h = y - 1.5 * BS - ROOF_W;
    const line = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, h, 5), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false }));
    line.position.y = ROOF_W + h / 2; g.add(line);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.8, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = ROOF_W + 0.08; g.add(ring);
    g.renderOrder = 4;
    return g;
  }
  function removeBlimp(b) {
    sky.remove(b.obj); disposeTree(b.obj);
    if (b.guide) { sky.remove(b.guide); disposeTree(b.guide); }
    const i = S.blimps.indexOf(b); if (i >= 0) S.blimps.splice(i, 1);
  }

  // ------------------------------------------------------------------ bấm
  const rc = new THREE.Raycaster(), ndc = new THREE.Vector2();
  canvas.addEventListener("pointerdown", e => {
    if (S.state !== "play" || S.paused) return;
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    rc.setFromCamera(ndc, camera);
    const hits = rc.intersectObjects(S.blimps.filter(b => !b.leaving && !b.attract).map(b => b.obj.userData.hit), false);
    if (hits.length) popBlimp(hits[0].object.parent.userData.blimp);
  });

  function popBlimp(b) {
    sfx.pop();
    burst(b.obj.position, b.bonus ? 12 : 22);
    puff(b.obj.position, b.bonus ? 0.8 : 1.4);
    removeBlimp(b);
    if (b.bonus) return applyBonus(b.bonus, b.obj.position);
    dropCrate(b.word, b.obj.position.x, b.obj.position.y - 1.45 * BS, -blimpV());
  }
  function applyBonus(type, pos) {
    sfx.bonus();
    if (type === "time") { S.timeLeft += 10; floatText("+10s", pos, "#7fd0ff"); flashClock("+10s"); }
    else if (type === "points") { S.score += 10; floatText("+10", pos, "#ffd34d"); updateHud(); }
    else { S.x2 += 3; floatText("×2", pos, "#d9a8ff"); scoreEl.parentElement.classList.add("is-x2"); }
  }

  // ------------------------------------------------------------------ thùng hàng — vật lý (1d)
  // Thùng mang quán tính của khinh khí cầu, va nóc toa ĐANG CHẠY. Đúng toa: TRƯỢT theo đà, dừng hẳn mới cộng điểm;
  // trượt quá mép thì rơi khỏi toa, không tính. Sai toa / trúng đầu máy, toa than, toa khách: văng lộn nhào xuống đất.
  const GROUND_Y = z => (Math.abs(z) < 1.35 ? 0.34 + Math.max(0, 0.14 * (1 - Math.abs(z) / 1.35)) : 0);
  function dropCrate(word, x, y, vx = 0) {
    const label = new THREE.MeshStandardMaterial({ map: crateTexture(word), normalMap: M.crateSide.normalMap, roughness: 0.85 });
    const mesh = new THREE.Mesh(G.crate, [M.crateSide, M.crateSide, label, M.crateSide, label, M.crateSide]);
    mesh.scale.setScalar(TS);
    mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.position.set(x, y, 0);
    scene.add(mesh);
    S.crates.push({ mesh, word, key: norm(word), half: CRATE_H,
      v: new THREE.Vector3(vx, 0.3, 0), w: new THREE.Vector3(0, 0, (Math.random() - 0.5) * 1.2), phase: "fall", t: 0, rest: 0 });
  }
  function bounceOff(c, strength, roofW = ROOF_W) {
    const cv = S.trainV;
    c.v.x = cv + (c.v.x - cv) * 0.35 + (Math.random() - 0.5) * 1.6;
    c.v.y = Math.abs(c.v.y) * 0.42 + 2.2 * strength;
    c.v.z = (2.4 + Math.random() * 1.4) * (Math.random() < 0.75 ? 1 : -1);
    c.w.set((Math.random() - 0.5) * 9, (Math.random() - 0.5) * 5, -(c.v.x - cv) * 1.6 - 3);
    c.mesh.position.y = roofW + c.half + 0.05;
    c.phase = "loose";
  }
  // người trong các toa khách gần chỗ va chạm giật mình
  function startle(x = S.camX) {
    for (const co of S.coaches) if (Math.abs(S.train.position.x + co.localX * TS - x) < 20) co.startleT = 0;
  }
  // thùng rơi vào TOA THAN: thùng văng, than bắn tung toé, trừ điểm
  function coalHit(c, car, impact, roofW) {
    sfx.wrong(); sfx.thud(); sfx.thud();
    bounceOff(c, 1.25, roofW);
    S.shake = Math.max(S.shake, 0.18 * impact);
    const p0 = c.mesh.position, cm = coalMaterial();
    for (let k = 0; k < 18; k++) {
      const m = new THREE.Mesh(COAL_LUMP, cm); m.castShadow = true;
      m.position.set(p0.x + (Math.random() - 0.5) * 1.6, roofW - 0.2, (Math.random() - 0.5) * 1.0);
      m.scale.setScalar(TS * (0.7 + Math.random() * 0.9));
      scene.add(m);
      S.fx.push({ obj: m, t: 0, life: 4 + Math.random(), kind: "coal", v: new THREE.Vector3(S.trainV + (Math.random() - 0.5) * 5, 3 + Math.random() * 5, (Math.random() < 0.7 ? 1 : -1) * (1.5 + Math.random() * 3)), w: new THREE.Vector3(Math.random() * 12, Math.random() * 12, Math.random() * 12) });
    }
    for (let k = 0; k < 6; k++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, color: 0x1c1a18, transparent: true, depthWrite: false, opacity: 0.7 }));
      s.position.set(p0.x + (Math.random() - 0.5) * 1.5, roofW + 0.3, (Math.random() - 0.5)); s.scale.setScalar(0.8); fxRoot.add(s);
      S.fx.push({ obj: s, t: 0, life: 1.2, kind: "smoke", v: new THREE.Vector3(S.trainV * 0.6 + (Math.random() - 0.5) * 2, 1.2 + Math.random(), (Math.random() - 0.5)), grow: 2.6 });
    }
    const pen = Math.max(2, opt.pointsOff);
    S.score -= pen;
    floatText("\u2212" + pen, p0.clone().add(new THREE.Vector3(0, 1.2, 0)), "#ff7b6b");
    updateHud();
  }
  function updateCrates(dt) {
    for (let i = S.crates.length - 1; i >= 0; i--) {
      const c = S.crates[i], p = c.mesh.position;
      c.t += dt;
      if (c.phase === "rest") {
        c.rest += dt;
        if (c.rest > 3.5) {
          const k = Math.max(0, 1 - (c.rest - 3.5) / 0.6);
          c.mesh.scale.setScalar(Math.max(0.001, k) * TS);
          if (k <= 0 || p.x < S.camX - HALF - 12) { removeCrate(c); S.crates.splice(i, 1); }
        }
        continue;
      }
      const prevBottom = p.y - c.half;
      c.v.y -= GRAV * dt;
      p.addScaledVector(c.v, dt);
      c.mesh.rotation.x += c.w.x * dt; c.mesh.rotation.y += c.w.y * dt; c.mesh.rotation.z += c.w.z * dt;
      const bottom = p.y - c.half;
      if (c.phase === "fall" && S.train) {
        const x = p.x;
        const car = S.cars.find(k => Math.abs(S.train.position.x + k.localX * TS - x) <= k.len * TS / 2 + 0.12);
        const onHead = !car && x <= S.trainX + 0.2 && x >= S.trainX - (ENGINE_LEN + CART_GAP + TENDER_LEN) * TS;
        const roofW = RAIL_TOP + (car ? car.roof : 3.5) * TS;
        if ((car || onHead) && prevBottom >= roofW && bottom <= roofW) {
          const impact = Math.min(1.6, Math.hypot(c.v.x - S.trainV, c.v.y) / 9);
          startle(x);
          if (car && car.type === "answer") {
            if (S.state === "play" && !car.filled && car.key === c.key) { landCorrect(c, car, impact); S.crates.splice(i, 1); continue; }
            if (S.state === "play") landWrong(c, impact); else bounceOff(c, 0.6);
            continue;
          }
          if (car && car.type === "coal") { coalHit(c, car, impact, roofW); continue; }
          sfx.thud(); bounceOff(c, 0.8, roofW); S.shake = Math.max(S.shake, 0.12 * impact); continue;
        }
      }
      const gy = GROUND_Y(p.z);
      if (bottom <= gy) {
        p.y = gy + c.half;
        const speed = Math.abs(c.v.y);
        if (Math.abs(p.z) < 1.6) {   // rơi vào lòng đường ray: nảy ra lề (không nằm chắn đường tàu)
          c.v.z = (p.z >= 0 ? 1 : -1) * (2.6 + Math.random()); c.v.y = Math.max(speed * 0.35, 2.4); c.v.x *= 0.7;
          c.w.x += (Math.random() - 0.5) * 6; sfx.thud(); if (c.phase === "fall") c.phase = "loose";
        } else if (speed > 1.6) {
          c.v.y = speed * 0.3; c.v.x *= 0.62; c.v.z *= 0.55; c.w.multiplyScalar(0.55);
          sfx.thud(); if (speed > 4) dust(p);
          if (c.phase === "fall") c.phase = "loose";
        } else {
          c.v.y = 0;
          const fr = Math.exp(-dt * 5.5); c.v.x *= fr; c.v.z *= fr; c.w.multiplyScalar(Math.exp(-dt * 7));
          const snap = a => { const t = Math.round(a / (Math.PI / 2)) * (Math.PI / 2); return a + (t - a) * Math.min(1, dt * 8); };
          c.mesh.rotation.x = snap(c.mesh.rotation.x); c.mesh.rotation.z = snap(c.mesh.rotation.z);
          if (Math.hypot(c.v.x, c.v.z) < 0.15 && c.w.length() < 0.3) { c.phase = "rest"; c.rest = 0; }
        }
      }
      if (p.x < S.camX - HALF - 14 || p.y < -5) { removeCrate(c); S.crates.splice(i, 1); }
    }
    // thùng vừa đáp đúng: TRƯỢT theo đà trên nóc; dừng hẳn mới cộng điểm, quá mép thì rơi
    for (const cart of S.carts) {
      const sl = cart.slide; if (!sl) continue;
      const m = cart.crate;
      m.position.x += sl.v * dt; sl.v *= Math.exp(-dt * 3.6);
      m.rotation.z *= Math.exp(-dt * 6); m.rotation.x *= Math.exp(-dt * 9); m.rotation.y *= Math.exp(-dt * 9);
      if (Math.abs(m.position.x) > CART_W / 2 - 0.2) { slideOff(cart, sl); continue; }
      if (Math.abs(sl.v) < 0.12) { cart.slide = null; scoreCart(cart); }
    }
  }
  function landCorrect(c, cart, impact) {
    cart.filled = true;
    const local = cart.group.worldToLocal(c.mesh.position.clone());
    scene.remove(c.mesh);
    cart.group.add(c.mesh);
    c.mesh.scale.set(1.18, 0.72, 1.18);
    c.mesh.position.set(local.x, ROOF_Y + CRATE / 2, 0);
    c.mesh.rotation.set(0, 0, c.mesh.rotation.z % 0.4);
    S.fx.push({ obj: c.mesh, t: 0, life: 0.4, kind: "squash" });
    cart.crate = c.mesh; cart.crateObj = c;
    cart.slide = { v: (c.v.x - S.trainV) / TS * 0.08 };   // thầy: trượt/giật chỉ bằng 1/10 bản 1d
    S.shake = Math.max(S.shake, 0.01 * impact);
    sfx.thud();
  }
  function scoreCart(cart) {
    const gain = S.x2 > 0 ? 10 : 5;
    if (S.x2 > 0) { S.x2--; if (!S.x2) scoreEl.parentElement.classList.remove("is-x2"); }
    S.score += gain;
    sfx.correct();
    const wp = new THREE.Vector3(); cart.crate.getWorldPosition(wp);
    floatText("+" + gain, wp.clone().add(new THREE.Vector3(0, 1.3, 0)), "#9dffa9");
    S.deck = [];
    updateHud();
    if (S.state === "play" && S.carts.every(k => k.filled && !k.slide)) levelClear();
  }
  // trượt quá mép: thùng rời toa, rơi xuống đất, toa lại trống — không tính điểm
  function slideOff(cart, sl) {
    const m = cart.crate, c = cart.crateObj, wp = new THREE.Vector3();
    m.getWorldPosition(wp);
    cart.group.remove(m); scene.add(m);
    m.position.copy(wp); m.scale.setScalar(TS);
    c.v.set(S.trainV + sl.v * TS, 1.2, 0.8); c.w.set(0, 0, -Math.sign(sl.v) * 4 - 2); c.phase = "loose"; c.t = 0;
    S.crates.push(c);
    cart.slide = null; cart.filled = false; cart.crate = null; cart.crateObj = null;
    S.deck = [];
    sfx.thud(); startle();
  }
  function landWrong(c, impact) {
    sfx.wrong(); sfx.thud();
    bounceOff(c, 1);
    S.shake = Math.max(S.shake, 0.16 * impact);
    if (opt.pointsOff > 0) {
      S.score -= opt.pointsOff;
      floatText("−" + opt.pointsOff, c.mesh.position.clone().add(new THREE.Vector3(0, 1.2, 0)), "#ff7b6b");
      updateHud();
    }
  }
  function removeCrate(c) {
    scene.remove(c.mesh);
    const lab = c.mesh.material[2]; lab.map.dispose(); lab.dispose();
  }

  // ------------------------------------------------------------------ hiệu ứng
  function burst(pos, n) {
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(G.shard, M.shard.clone());
      m.position.copy(pos).add(new THREE.Vector3((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 1.5, 0));
      const v = new THREE.Vector3((Math.random() - 0.5) * 9, Math.random() * 6, (Math.random() - 0.5) * 5);
      fxRoot.add(m);
      S.fx.push({ obj: m, v, life: 1.6, t: 0, spin: new THREE.Vector3(Math.random() * 9, Math.random() * 9, 0), kind: "shard" });
    }
  }
  function spriteOf(tex, w, h) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false, toneMapped: false }));
    s.scale.set(w, h, 1); s.renderOrder = 10; return s;
  }
  function puff(pos, k) {
    const f = spriteOf(flashTex, 5 * k, 5 * k); f.material.blending = THREE.AdditiveBlending; f.material.color = new THREE.Color(2.2, 1.9, 1.5); f.position.copy(pos); fxRoot.add(f);
    S.fx.push({ obj: f, t: 0, life: 0.28, kind: "flash", base: 5 * k });
    for (let i = 0; i < 7; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, color: 0xf3ece2, transparent: true, depthWrite: false, opacity: 0.8 }));
      s.position.copy(pos).add(new THREE.Vector3((Math.random() - 0.5) * 2.6 * k, (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 1.2)); s.scale.setScalar(1.2 * k); fxRoot.add(s);
      S.fx.push({ obj: s, t: 0, life: 1.1, kind: "smoke", v: new THREE.Vector3((Math.random() - 0.5) * 2, 0.6 + Math.random(), 0), grow: 3.2 * k });
    }
  }
  function popWord(pos) {
    const s = spriteOf(popTexture(), 3.4, 1.7); s.position.copy(pos); fxRoot.add(s);
    S.fx.push({ obj: s, t: 0, life: 0.55, kind: "pop", base: 3.4 });
  }
  function floatText(text, pos, color) {
    const s = spriteOf(textTexture(text, color), 2.6, 1.3); s.position.copy(pos); fxRoot.add(s);
    S.fx.push({ obj: s, t: 0, life: 1.1, kind: "float" });
  }
  function mark(ok, pos) {
    const s = spriteOf(markTexture(ok), 1.9, 1.9); s.position.copy(pos); s.position.y += 1.4; fxRoot.add(s);
    S.fx.push({ obj: s, t: 0, life: 1.0, kind: "mark" });
  }
  function dust(pos) {
    for (let i = 0; i < 6; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, color: 0xd9b48a, transparent: true, depthWrite: false, opacity: 0.8 }));
      s.position.set(pos.x + (Math.random() - 0.5) * 1.5, 0.5, pos.z + (Math.random() - 0.5) * 1.2); s.scale.setScalar(0.8);
      fxRoot.add(s);
      S.fx.push({ obj: s, t: 0, life: 0.8, kind: "smoke", v: new THREE.Vector3((Math.random() - 0.5) * 2, 1, 0), grow: 2.2 });
    }
  }
  function smokePuff() {
    if (!S.train) return;
    const p = S.engine.userData.stack.clone(); S.engine.localToWorld(p);
    const shade = 0.55 + Math.random() * 0.35;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, color: new THREE.Color(shade * 0.8, shade * 0.77, shade * 0.74), transparent: true, depthWrite: false, opacity: 0.55 }));
    s.position.copy(p); s.scale.setScalar(0.7); s.material.rotation = Math.random() * 6; fxRoot.add(s);
    S.fx.push({ obj: s, t: 0, life: 2.6, kind: "smoke", v: new THREE.Vector3(-0.6 - S.trainV * 0.55, 1.9 + Math.random() * 0.6, -0.4), grow: 4.2 });
  }
  function updateFx(dt) {
    for (let i = S.fx.length - 1; i >= 0; i--) {
      const f = S.fx[i]; f.t += dt; const k = f.t / f.life;
      if (f.kind === "squash") {   // thùng vừa đáp: nảy về dáng thật, không huỷ
        const e = Math.min(1, k), b = 1 + Math.sin(e * Math.PI * 2.5) * (1 - e) * 0.25;
        f.obj.scale.set(1 + (1 / b - 1) * 0.6, b, 1 + (1 / b - 1) * 0.6);
        if (k >= 1) { f.obj.scale.set(1, 1, 1); S.fx.splice(i, 1); }
        continue;
      }
      if (f.kind === "coal") {   // cục than bắn ra: rơi, nảy, lăn rồi mờ dần (hình + vật liệu dùng chung, không huỷ)
        const o = f.obj;
        f.v.y -= GRAV * dt; o.position.addScaledVector(f.v, dt);
        o.rotation.x += f.w.x * dt; o.rotation.y += f.w.y * dt; o.rotation.z += f.w.z * dt;
        const gy = GROUND_Y(o.position.z) + 0.1;
        if (o.position.y < gy) { o.position.y = gy; if (Math.abs(f.v.y) > 1.5) { f.v.y *= -0.32; f.v.x *= 0.6; f.v.z *= 0.6; } else { f.v.y = 0; f.v.x *= 0.85; f.v.z *= 0.85; f.w.multiplyScalar(0.85); } }
        if (k > 0.8) o.scale.setScalar(Math.max(0.001, (1 - k) / 0.2) * TS);
        if (k >= 1 || o.position.x < S.camX - HALF - 14) { scene.remove(o); S.fx.splice(i, 1); }
        continue;
      }
      if (k >= 1) { fxRoot.remove(f.obj); f.obj.material.map && f.obj.kind !== "keep" && f.kind !== "smoke" && f.obj.material.map.dispose(); f.obj.material.dispose(); S.fx.splice(i, 1); continue; }
      if (f.kind === "shard") {
        f.v.y -= 7 * dt; f.v.multiplyScalar(1 - dt * 1.6); f.obj.position.addScaledVector(f.v, dt);
        f.obj.rotation.x += f.spin.x * dt; f.obj.rotation.y += f.spin.y * dt; f.obj.material.opacity = 1 - k;
      } else if (f.kind === "flash") {
        const s = f.base * (0.6 + k * 0.8); f.obj.scale.set(s, s, 1); f.obj.material.opacity = 1 - k;
      } else if (f.kind === "pop") {
        const s = f.base * (0.5 + Math.min(1, k * 3) * 0.7); f.obj.scale.set(s, s / 2, 1); f.obj.material.opacity = k < 0.6 ? 1 : 1 - (k - 0.6) / 0.4;
      } else if (f.kind === "float" || f.kind === "mark") {
        f.obj.position.y += dt * 1.6; f.obj.material.opacity = k < 0.6 ? 1 : 1 - (k - 0.6) / 0.4;
      } else if (f.kind === "smoke") {
        f.obj.position.addScaledVector(f.v, dt); f.obj.scale.setScalar(0.8 + k * f.grow); f.obj.material.opacity = 0.7 * (1 - k);
      }
    }
  }

  // ------------------------------------------------------------------ máy bay kéo băng điểm
  function flyPlane(text) {
    if (S.plane) { scene.remove(S.plane.obj); disposeTree(S.plane.obj); }
    const g = new THREE.Group();
    const red = new THREE.MeshStandardMaterial({ color: 0xc8402e, roughness: 0.45, metalness: 0.2 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.25, 3.2, 14), red); body.rotation.z = Math.PI / 2; g.add(body);
    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.1, 4.6), red); wing.position.set(-0.3, 0.1, 0); g.add(wing);
    const wing2 = wing.clone(); wing2.position.y = 0.95; g.add(wing2);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.08), red); tail.position.set(1.5, 0.4, 0); g.add(tail);
    const prop = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.5, 0.14), M.iron); prop.position.set(-1.7, 0, 0); g.add(prop);
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.8, 4), M.iron); rope.rotation.z = Math.PI / 2; rope.position.set(2.5, 0, 0); g.add(rope);
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1.5), new THREE.MeshBasicMaterial({ map: bannerTexture(text), side: THREE.DoubleSide, toneMapped: false }));
    banner.position.set(6.6, 0, 0); g.add(banner);
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    g.rotation.y = Math.PI;   // mũi hướng +x: bay từ trái sang phải, băng kéo phía sau
    g.position.set(S.camX - SKY - 14, V.lanes[2] + 1.2, -3);
    scene.add(g);
    S.plane = { obj: g, prop, banner, t: 0 };
    sfx.plane();
  }
  function updatePlane(dt) {
    const p = S.plane; if (!p) return;
    p.t += dt;
    p.obj.position.x += 12 * dt;
    p.obj.position.y = V.lanes[2] + 1.2 + Math.sin(p.t * 2) * 0.25;
    p.prop.rotation.x += dt * 40;
    p.banner.quaternion.copy(p.obj.quaternion).invert().multiply(camera.quaternion).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.sin(p.t * 5) * 0.12));
    if (p.obj.position.x > S.camX + SKY + 22) { scene.remove(p.obj); disposeTree(p.obj); S.plane = null; }
  }

  // ------------------------------------------------------------------ nhịp ván
  function clearSky() {
    S.blimps.slice().forEach(removeBlimp);
    S.crates.forEach(removeCrate); S.crates = [];
  }
  function startGame() {
    sfx.unlock();
    clearSky();
    if (S.plane) { scene.remove(S.plane.obj); disposeTree(S.plane.obj); S.plane = null; }
    S.bag = []; S.levels = []; S.score = 0; S.x2 = 0; S.timeLeft = opt.timer; S.level = 0; S.lastTick = 99;
    scoreEl.parentElement.classList.remove("is-x2");
    clockEl.classList.remove("is-warn");
    [ovStart, ovEnd, ovPause, ovAns].forEach(o => o.hidden = true);
    S.paused = false;
    beginLevel(0);
    updateHud();
  }
  function beginLevel(i) {
    S.level = i;
    const n = Math.min(i + 1, opt.levels, allKeys.length);   // từ quay vòng: tàu chạy mãi tới hết giờ
    const items = nextLevelItems(n);
    buildTrain(items, i);
    S.levels[i] = S.carts;
    S.deck = [];
    // tàu chạy nhanh vào tới vị trí rồi mới tính giờ
    S.trainX = S.camX - HALF - 1;
    S.introFrom = S.trainX;
    S.introTo = S.camX - HALF * 0.4 + (ENGINE_LEN / 2 - S.carts[0].localX) * TS;   // toa đáp án đầu tiên dừng hơi trái giữa màn
    S.camTarget = S.camX;
    S.introT = 0;
    S.trainV = 0;
    placeTrain();
    S.state = "intro";
    signEl.textContent = "Level " + (i + 1);
    signEl.classList.remove("is-in"); void signEl.offsetWidth; signEl.classList.add("is-in");
    sfx.whistle();
    updateHud();
  }
  // tàu thật: lúc nhanh lúc chậm nhẹ (2 sóng chậm chồng nhau)
  function cruiseV() { return (1.2 + 0.6 * opt.trainSpeed) * (1 + 0.04 * (S.carts.length - 1)) * (1 + 0.11 * Math.sin(S.time * 0.21) + 0.05 * Math.sin(S.time * 0.57 + 1.3)); }
  function blimpV() { return 0.7 + 0.4 * opt.balloonSpeed; }

  function levelClear() {
    S.state = "clear"; S.clearT = 0;
    const bonus = Math.ceil(S.timeLeft);
    S.score += bonus;
    S.timeLeft += 5;
    flashClock("+5s");
    S.blimps.forEach(b => { b.leaving = true; b.vy = 0; });
    sfx.levelUp(); setTimeout(() => sfx.whistle(), 350);
    flyPlane("Score " + S.score);
    updateHud();
  }
  function endGame(win) {
    if (S.state === "over") return;
    S.state = "over";
    if (win) sfx.win(); else sfx.timesUp();
    S.blimps.forEach(b => { b.frozen = true; });
    setTimeout(() => {
      $(".bp-end-title").textContent = win ? "GAME COMPLETE" : "TIME'S UP";
      $(".bp-end-score").textContent = S.score;
      const done = S.levels.flat().filter(c => c.filled).length;
      $(".bp-end-sub").textContent = `${done} matched · ${S.level + 1} trains`;
      ovEnd.hidden = false;
    }, 900);
  }
  function showAnswers() {
    const rows = S.levels.map((lv, i) => lv.map(c => `<div class="bp-ans-row ${c.filled ? "ok" : "no"}"><span class="bp-ans-lv">L${i + 1}</span><span class="bp-ans-key">${esc(c.item.keyword)}</span><span class="bp-ans-def">${esc(c.item.definition)}</span><span class="bp-ans-mk">${c.filled ? "✓" : "✗"}</span></div>`).join("")).join("");
    $(".bp-ans-list").innerHTML = rows;
    ovEnd.hidden = true; ovAns.hidden = false;
  }

  // ------------------------------------------------------------------ vòng lặp
  function update(dt) {
    S.time += dt;
    const st = S.state;
    // tàu
    if (S.train) {
      let v = 0;
      if (st === "intro") {
        S.introT += dt;
        const k = Math.min(1, S.introT / 2.0), e = 1 - Math.pow(1 - k, 3);
        const nx = S.introFrom + (S.introTo - S.introFrom) * e;
        v = (nx - S.trainX) / Math.max(dt, 1e-4); S.trainX = nx;
        if (k >= 1) { S.state = "play"; S.spawnT = 0; spawnBlimp(S.camX + HALF * 0.55); spawnBlimp(S.camX + HALF * 0.05); }
      } else if (st === "play" || st === "over") {
        v = st === "play" ? cruiseV() : 0;
        S.trainX += v * dt;
      } else if (st === "clear") {
        S.clearT += dt;
        S.trainV = Math.min(26, (S.trainV || cruiseV()) + dt * 9);
        v = S.trainV; S.trainX += v * dt;
        if (S.trainX - S.trainLen > S.camX + HALF + 2 && S.clearT > 3.2) {
          beginLevel(S.level + 1);
        }
      }
      if (st !== "clear") S.trainV = v;
      placeTrain();
      const dx = v * dt;
      for (const w of S.wheels) w.rotation.y -= dx / (w.userData.wheelR * TS);
      S.wheelA -= dx / (0.82 * TS);
      for (const r of S.rods) { const u = r.userData.rod, a = S.wheelA + u.ph; r.position.x = u.x0 + Math.cos(a) * u.r; r.position.y = u.y0 + Math.sin(a) * u.r * (u.tilt ? 0.5 : 1); if (u.tilt) r.rotation.z = Math.sin(a) * 0.12; }
      if (v > 0.05) {
        S.smokeT = (S.smokeT || 0) - dt;
        if (S.smokeT <= 0) { smokePuff(); S.smokeT = Math.max(0.07, 0.26 - v * 0.02); }
        S.chugT -= dt; if (S.chugT <= 0) { sfx.chug(v); S.chugT = Math.max(0.16, 0.9 / (v + 0.6)); }
      }
    }
    // đồng hồ
    if (st === "play") {
      S.timeLeft -= dt;
      const s = Math.ceil(S.timeLeft);
      if (s <= 10 && s < S.lastTick && s > 0) { sfx.tick(); S.lastTick = s; clockEl.classList.add("is-warn"); }
      if (s > 10) { clockEl.classList.remove("is-warn"); S.lastTick = 99; }
      if (S.timeLeft <= 0) { S.timeLeft = 0; endGame(false); }
    }
    // khinh khí cầu
    const bv = blimpV();
    updateCamera(dt);
    if (st === "play" || st === "attract") {
      S.spawnT -= dt;
      const live = S.blimps.filter(b => !b.leaving).length;
      // khoảng cách giữa 2 khinh khí cầu tính theo tốc độ trôi TRÊN MÀN (bóng trôi + máy quay lia)
      const rel = bv + Math.max(0, S.camV);
      if (S.spawnT <= 0 && live < MAX_BLIMPS + (S.camV > 0.5 ? 1 : 0)) { if (spawnBlimp(undefined, st === "attract")) S.spawnT = (st === "attract" ? 11 : 6.5) / rel; else S.spawnT = 0.25; }
    }
    for (const b of S.blimps.slice()) {
      if (b.frozen) continue;
      if (b.leaving) { b.vy += dt * 9; b.baseY += b.vy * dt; if (b.baseY > 30) { removeBlimp(b); continue; } }
      else b.x -= bv * dt;
      b.y = b.baseY + Math.sin(S.time * 1.3 + b.phase) * 0.22;
      b.obj.position.set(b.x, b.y, 0);
      b.obj.rotation.z = Math.sin(S.time * 0.9 + b.phase) * 0.04;
      b.obj.userData.banner.quaternion.copy(camera.quaternion);
      b.obj.userData.banner.position.set(0, 0, 1.32);
      if (b.obj.userData.props) for (const pr of b.obj.userData.props) pr.rotation.x += dt * 30;
      if (b.guide) { b.guide.position.x = b.x; b.guide.visible = !b.leaving; }
      if (b.x < S.camX - SKY - 8) removeBlimp(b);
    }
    updateCrates(dt);
    updateFx(dt);
    updatePlane(dt);
    // đám mây trôi
    for (const co of S.coaches) {
      if (co.startleT != null) { co.startleT += dt; if (co.startleT > 2.3) co.startleT = null; }
      if (Math.abs(S.train.position.x + co.localX * TS - S.camX) < 24) animatePassengers(co.people, S.time, co.startleT);
    }
    world.update(dt, S.time, S.camX, S.trainX);
    S.shake *= Math.exp(-dt * 7);
    const sh = S.shake, jx = (Math.random() - 0.5) * sh, jy = (Math.random() - 0.5) * sh;
    camera.position.set(S.camX + V.cam[0] + Math.sin(S.time * 0.11) * 0.18 + jx, V.cam[1] + Math.sin(S.time * 0.17) * 0.07 + jy, V.cam[2]);
    camera.lookAt(S.camX + V.look[0] + Math.sin(S.time * 0.09) * 0.1 + jx * 0.5, V.look[1] + jy * 0.5, V.look[2]);
    grade.uniforms.time.value = S.time;
    updateHud();
  }

  // Máy quay: đứng yên tới khi mũi đầu máy chạm 75% bề ngang màn, rồi LIA THEO tàu liên tục (không bao giờ lùi).
  // Tàu dài hơn màn: ưu tiên giữ toa CHƯA đầy ngoài cùng bên trái ở ~25% màn để học sinh luôn thấy toa cần thả.
  // 1e (thầy): toa CHƯA có đáp án đầu tiên đi tới giữa màn thì máy quay lia theo, giữ nó TỐI ĐA ở chính giữa;
  // toa đáp án sau (cách 2 toa phụ) còn ở ngoài mép trái cho tới khi toa này được thả đúng.
  function updateCamera(dt) {
    if (S.train && (S.state === "play" || S.state === "intro")) {
      const cur = S.carts.find(c => !c.filled || c.slide);
      if (cur) S.camTarget = Math.max(S.camTarget, cartWorldX(cur));
    }
    const nx = S.camX + (S.camTarget - S.camX) * (1 - Math.exp(-dt * 5));
    S.camV = dt > 0 ? (nx - S.camX) / dt : 0;
    S.camX = nx;
  }
  function updateHud() {
    const t = Math.max(0, Math.ceil(S.timeLeft));
    clockEl.textContent = Math.floor(t / 60) + ":" + String(t % 60).padStart(2, "0");
    scoreEl.textContent = S.score;
    const lv = S.carts.length ? S.carts.filter(c => c.filled).length / S.carts.length : 0;
    const p = S.state === "attract" ? 0 : S.state === "clear" ? 1 : lv;   // tiến độ đoàn tàu hiện tại
    progEl.style.width = (p * 100).toFixed(1) + "%";
  }
  function flashClock(txt) {
    const f = document.createElement("div"); f.className = "bp-clock-plus"; f.textContent = txt;
    stage.querySelector(".bp-top").append(f); setTimeout(() => f.remove(), 1200);
  }

  let last = 0, raf = 0, manual = false;
  function frame(ts) {
    raf = requestAnimationFrame(frame);
    if (manual) return;
    const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0; last = ts;
    if (!S.paused) update(dt);
    composer.render(dt);
  }
  raf = requestAnimationFrame(frame);

  // ------------------------------------------------------------------ nút giao diện
  const press = (sel, fn) => $(sel).addEventListener("click", e => { e.stopPropagation(); fn(); });
  press(".bp-start", startGame);
  press(".bp-again", startGame);
  press(".bp-again2", startGame);
  press(".bp-again3", startGame);
  press(".bp-show", showAnswers);
  press(".bp-ans-back", () => { ovAns.hidden = true; ovEnd.hidden = false; });
  press(".bp-menu", () => { if (S.state === "attract" || S.state === "over") return; S.paused = true; ovPause.hidden = false; });
  press(".bp-resume", () => { S.paused = false; ovPause.hidden = true; last = 0; });
  press(".bp-sound", () => { sfx.setMuted(!sfx.muted); $(".bp-sound").classList.toggle("is-off", sfx.muted); });
  press(".bp-fs", () => { const el = mount; if (document.fullscreenElement) document.exitFullscreen(); else el.requestFullscreen?.(); });
  press(".bp-opt-open", () => { $(".bp-opts").hidden = !$(".bp-opts").hidden; });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && S.state === "play") $(".bp-menu").click(); });

  // bảng Options trên màn bắt đầu
  const OPT_ROWS = [
    ["timer", "Timer", 30, 600, 15, v => Math.floor(v / 60) + ":" + String(v % 60).padStart(2, "0")],
    ["levels", "Max cars", 1, 10, 1, v => v],
    ["pointsOff", "Points off", 0, 5, 1, v => v],
    ["balloonSpeed", "Balloon speed", 1, 5, 1, v => v],
    ["trainSpeed", "Train speed", 1, 5, 1, v => v],
  ];
  const optBox = $(".bp-opts");
  optBox.innerHTML = OPT_ROWS.map(([k, label]) => `<div class="bp-opt"><span>${label}</span><button data-k="${k}" data-d="-1">−</button><b data-v="${k}"></b><button data-k="${k}" data-d="1">+</button></div>`).join("") +
    `<div class="bp-chips">${[["bonusTime", "Extra time"], ["bonusPoints", "Points"], ["bonusX2", "Double score"], ["guide", "Drop guide"]].map(([k, l]) => `<button class="bp-chip" data-t="${k}">${l}</button>`).join("")}</div>`;
  function paintOpts() {
    OPT_ROWS.forEach(([k, , , , , f]) => { optBox.querySelector(`[data-v="${k}"]`).textContent = f(opt[k]); });
    optBox.querySelectorAll("[data-t]").forEach(b => b.classList.toggle("on", !!opt[b.dataset.t]));
  }
  optBox.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.k) { const r = OPT_ROWS.find(x => x[0] === b.dataset.k); opt[r[0]] = Math.max(r[2], Math.min(r[3], opt[r[0]] + r[4] * +b.dataset.d)); }
    if (b.dataset.t) opt[b.dataset.t] = !opt[b.dataset.t];
    paintOpts();
  });
  paintOpts();

  // bàn thử cho máy (khi khung xem trước bị ẩn rAF đứng)
  window.__bp = {
    S, opt, HALF, SKY, camera,
    start: startGame,
    step(n = 1, dt = 1 / 60) { manual = true; for (let i = 0; i < n; i++) if (!S.paused) update(dt); composer.render(dt); return S.state; },

    resume() { manual = false; last = 0; },
    render() { composer.render(0); },   // soi cận: đặt __bp.camera rồi gọi render()
    // thả thùng mang `word` ngay trên toa thứ `cartIdx`, có tính trước quãng tàu chạy trong lúc rơi
    testDrop(word, cartIdx = 0, fromY = 11) {
      const c = S.carts[cartIdx]; const tFall = Math.sqrt(2 * (fromY - ROOF_W - CRATE_H) / GRAV);
      dropCrate(word, cartWorldX(c) + cruiseV() * tFall, fromY, 0);
    },
    popWord(word) { const b = S.blimps.find(x => x.word && norm(x.word) === norm(word)); if (b) popBlimp(b); return !!b; },
  };
  return window.__bp;
}

// ====================================================================== kết cấu vẽ bằng canvas
function canvasTex(w, h, draw) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const ctx = c.getContext("2d"); draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
function wrapFit(ctx, text, maxW, maxH, maxPx, minPx, weight, maxLines, lh = 1.08) {
  const words = String(text).split(/\s+/);
  for (let px = maxPx; px >= minPx; px -= 3) {
    ctx.font = `${weight} ${px}px ${FONT}`;
    const lines = []; let cur = "";
    for (const w of words) {
      const t = cur ? cur + " " + w : w;
      if (ctx.measureText(t).width <= maxW || !cur) cur = t; else { lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur);
    const widest = Math.max(...lines.map(l => ctx.measureText(l).width));
    if (lines.length <= maxLines && lines.length * px * lh <= maxH && widest <= maxW) return { lines, px };
  }
  ctx.font = `${weight} ${minPx}px ${FONT}`;
  return { lines: [String(text)], px: minPx };
}
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function drawLines(ctx, fit, cx, cy, lh = 1.08) {
  const total = fit.lines.length * fit.px * lh;
  fit.lines.forEach((l, i) => ctx.fillText(l, cx, cy - total / 2 + fit.px * lh * (i + 0.5) + fit.px * 0.06));
}
function boardTexture(text) {
  return canvasTex(1024, 400, (ctx, w, h) => {
    ctx.fillStyle = "#5a2e1a"; ctx.fillRect(0, 0, w, h);
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#fbf3e0"); g.addColorStop(1, "#efe0bf");
    ctx.fillStyle = g; roundRect(ctx, 14, 14, w - 28, h - 28, 18); ctx.fill();
    ctx.strokeStyle = "rgba(90,46,26,.35)"; ctx.lineWidth = 4; roundRect(ctx, 26, 26, w - 52, h - 52, 12); ctx.stroke();
    ctx.fillStyle = "#1c0c04"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const fit = wrapFit(ctx, text, w - 80, h - 56, 118, 40, 800, 3, 1.04);
    ctx.font = `800 ${fit.px}px ${FONT}`;
    drawLines(ctx, fit, w / 2, h / 2, 1.06);
  });
}
function wordTexture(word) {
  return canvasTex(1024, 248, (ctx, w, h) => {
    ctx.fillStyle = "rgba(20,24,34,.25)"; roundRect(ctx, 14, 20, w - 20, h - 26, 60); ctx.fill();
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#ffffff"); g.addColorStop(1, "#e7ecf3");
    ctx.fillStyle = g; roundRect(ctx, 6, 8, w - 20, h - 26, 60); ctx.fill();
    ctx.lineWidth = 8; ctx.strokeStyle = "#2c3e57"; ctx.stroke();
    ctx.fillStyle = "#15202e"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const fit = wrapFit(ctx, word, w - 110, h - 60, 150, 60, 800, 1);
    ctx.font = `800 ${fit.px}px ${FONT}`;
    drawLines(ctx, fit, w / 2 - 7, (h - 18) / 2);
  });
}
function crateTexture(word) {
  return canvasTex(780, 404, (ctx, w, h) => {
    drawPlanks(ctx, w, h);
    ctx.fillStyle = "#f7edd6"; roundRect(ctx, 42, 70, w - 84, h - 140, 20); ctx.fill();
    ctx.strokeStyle = "#5a2e1a"; ctx.lineWidth = 7; ctx.stroke();
    ctx.fillStyle = "#2a150a"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const fit = wrapFit(ctx, word, w - 130, h - 170, 150, 44, 800, 2, 1.0);
    ctx.font = `800 ${fit.px}px ${FONT}`;
    drawLines(ctx, fit, w / 2, h / 2, 1.0);
  });
}
function drawPlanks(ctx, w, h) {
  ctx.fillStyle = "#b07a45"; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? "#a86f3c" : "#b8824c"; ctx.fillRect(0, i * h / 5, w, h / 5 - 4); }
  ctx.fillStyle = "#6b3e1e"; for (let i = 1; i < 5; i++) ctx.fillRect(0, i * h / 5 - 4, w, 4);
  ctx.strokeStyle = "#5a3217"; ctx.lineWidth = 28; ctx.strokeRect(14, 14, w - 28, h - 28);
  ctx.fillStyle = "#3b2414"; for (const [x, y] of [[30, 30], [w - 30, 30], [30, h - 30], [w - 30, h - 30]]) { ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill(); }
}
function plankTexture(c1, c2, vertical) {
  const t = canvasTex(512, 512, (ctx, w, h) => {
    const r = mulberry(c1.length * 31 + (vertical ? 7 : 3)), n = 9;
    if (vertical) { ctx.translate(w, 0); ctx.rotate(Math.PI / 2); }
    for (let i = 0; i < n; i++) {
      const y0 = i * h / n;
      ctx.fillStyle = i % 2 ? c1 : c2; ctx.fillRect(0, y0, w, h / n);
      ctx.globalAlpha = 0.18;
      for (let k = 0; k < 40; k++) { ctx.fillStyle = r() < 0.5 ? "#000" : "#fff"; ctx.fillRect(r() * w, y0 + r() * h / n, 20 + r() * 120, 1 + r() * 2); }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(20,10,5,.75)"; ctx.fillRect(0, y0, w, 3);
      ctx.fillStyle = "rgba(30,15,8,.8)"; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(24 + k * 230, y0 + h / n / 2, 4, 0, 7); ctx.fill(); }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "rgba(40,20,10,.2)"); g.addColorStop(0.5, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(40,20,10,.35)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
// logo ANDREW STUDIO (như Rocket Race mẫu 4h): vòng tròn + mũi tên tên lửa đỏ, chữ nghiêng đậm Exo 2
function drawEmblem(ctx, cx, cy, R, ink) {
  ctx.lineWidth = R * 0.15; ctx.strokeStyle = ink; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "#e3342f"; ctx.beginPath(); ctx.moveTo(cx, cy - R * 0.72); ctx.lineTo(cx + R * 0.36, cy + R * 0.46); ctx.lineTo(cx, cy + R * 0.22); ctx.lineTo(cx - R * 0.36, cy + R * 0.46); ctx.closePath(); ctx.fill();
}
function emblemTexture() {
  return canvasTex(512, 512, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h * 0.4, 20, w / 2, h / 2, w / 2); g.addColorStop(0, "#f3d27a"); g.addColorStop(1, "#a8792a");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(w / 2, h / 2, w / 2 - 4, 0, 7); ctx.fill();
    ctx.fillStyle = "#16181c"; ctx.beginPath(); ctx.arc(w / 2, h / 2, w / 2 - 34, 0, 7); ctx.fill();
    drawEmblem(ctx, w / 2, h * 0.42, w * 0.2, "#f4f1ea");
    ctx.fillStyle = "#f3d27a"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = `italic 900 58px "Exo 2", "Arial Black", sans-serif`; ctx.fillText("ANDREW", w / 2, h * 0.73);
    ctx.font = `italic 800 34px "Exo 2", "Arial Black", sans-serif`; ctx.fillText("S T U D I O", w / 2, h * 0.83);
  });
}
function lockupTexture() {
  return canvasTex(1024, 240, (ctx, w, h) => {
    const cap = 92, R = cap * 0.8;
    ctx.font = `italic 900 ${cap / 0.7}px "Exo 2", "Arial Black", sans-serif`;
    const tw = ctx.measureText("ANDREW STUDIO").width, total = R * 2.15 + cap * 0.55 + tw, sc = Math.min(1, (w - 40) / total);
    ctx.translate(w / 2 - total * sc / 2, h / 2); ctx.scale(sc, sc);
    ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = 6; ctx.shadowOffsetY = 3;
    drawEmblem(ctx, R * 1.075, 0, R, "#f1cf72");
    const gr = ctx.createLinearGradient(0, -cap, 0, cap); gr.addColorStop(0, "#fff0b8"); gr.addColorStop(0.5, "#e9bb52"); gr.addColorStop(1, "#b3822c");
    ctx.fillStyle = gr; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.fillText("ANDREW STUDIO", R * 2.15 + cap * 0.55, cap * 0.5);
  });
}
function ornamentTexture() {
  return canvasTex(1024, 240, (ctx, w, h) => {
    const gold = ctx.createLinearGradient(0, 0, 0, h); gold.addColorStop(0, "#fff0b8"); gold.addColorStop(0.5, "#e2b24c"); gold.addColorStop(1, "#a77a28");
    ctx.strokeStyle = gold; ctx.fillStyle = gold; ctx.lineCap = "round";
    ctx.lineWidth = 7; ctx.beginPath(); ctx.roundRect(14, 14, w - 28, h - 28, 26); ctx.stroke();
    ctx.lineWidth = 2.5; ctx.beginPath(); ctx.roundRect(32, 32, w - 64, h - 64, 18); ctx.stroke();
    // cuộn lá góc
    const scroll = (x, y, sx, sy) => { ctx.save(); ctx.translate(x, y); ctx.scale(sx, sy); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(60, -10, 90, 30, 60, 50); ctx.bezierCurveTo(40, 64, 22, 40, 40, 30); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-8, 50, 30, 80, 48, 64); ctx.stroke(); ctx.restore(); };
    scroll(48, 48, 1, 1); scroll(w - 48, 48, -1, 1); scroll(48, h - 48, 1, -1); scroll(w - 48, h - 48, -1, -1);
    // hoạ tiết giữa: oval + ngôi sao miền Tây + 2 nhánh lá
    const cx = w / 2, cy = h / 2;
    ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(cx, cy, 70, 58, 0, 0, 7); ctx.stroke();
    ctx.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? 18 : 42; ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } ctx.closePath(); ctx.fill();
    for (const s of [-1, 1]) {
      ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx + s * 80, cy); ctx.bezierCurveTo(cx + s * 180, cy - 40, cx + s * 260, cy + 30, cx + s * 360, cy); ctx.stroke();
      for (let k = 0; k < 7; k++) { const x = cx + s * (110 + k * 38), y = cy + Math.sin(k) * 10; ctx.beginPath(); ctx.ellipse(x, y - 14, 14, 6, s * 0.6, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(x + s * 10, y + 14, 14, 6, -s * 0.6, 0, 7); ctx.fill(); }
    }
  });
}
function nameplateTexture() {
  return canvasTex(1024, 172, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#f7dc8e"); g.addColorStop(0.5, "#c89a3c"); g.addColorStop(1, "#8e6420");
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(4, 4, w - 8, h - 8, 80); ctx.fill();
    ctx.fillStyle = "#1c1410"; ctx.beginPath(); ctx.roundRect(16, 16, w - 32, h - 32, 70); ctx.fill();
    ctx.fillStyle = "#f3d27a"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = `italic 900 100px "Exo 2", "Arial Black", sans-serif`; if (ctx.letterSpacing !== undefined) ctx.letterSpacing = "10px";
    ctx.fillText("ANDREW STUDIO", w / 2, h / 2 + 6);
  });
}
function wheelTexture(drive) {

  return canvasTex(256, 256, (ctx) => {
    ctx.translate(128, 128);
    ctx.fillStyle = "#1a1a1c"; ctx.beginPath(); ctx.arc(0, 0, 126, 0, 7); ctx.arc(0, 0, 100, 0, 7, true); ctx.fill();
    ctx.fillStyle = drive ? "#8a1d14" : "#262628"; ctx.beginPath(); ctx.arc(0, 0, 104, 0, 7); ctx.arc(0, 0, 94, 0, 7, true); ctx.fill();
    ctx.strokeStyle = drive ? "#7a1a12" : "#222"; ctx.lineWidth = drive ? 9 : 11; ctx.lineCap = "round";
    const n = drive ? 16 : 10;
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 26, Math.sin(a) * 26); ctx.lineTo(Math.cos(a) * 98, Math.sin(a) * 98); ctx.stroke(); }
    if (drive) { ctx.fillStyle = "#6e1610"; ctx.beginPath(); ctx.arc(0, 0, 90, 2.2, 4.1); ctx.arc(0, 0, 50, 4.1, 2.2, true); ctx.fill(); }
    ctx.fillStyle = "#c9a045"; ctx.beginPath(); ctx.arc(0, 0, 26, 0, 7); ctx.fill();
    ctx.fillStyle = "#2a2a2a"; ctx.beginPath(); ctx.arc(0, 0, 10, 0, 7); ctx.fill();
  });
}
function fabricTexture() {
  const t = canvasTex(1024, 512, (ctx, w, h) => {
    ctx.fillStyle = "#e9e4da"; ctx.fillRect(0, 0, w, h);
    const r = mulberry(4);
    for (let i = 0; i < 24; i++) { ctx.fillStyle = `rgba(${150 + r() * 40},${140 + r() * 40},${130 + r() * 30},${0.08 + r() * 0.08})`; ctx.fillRect(i * w / 24, 0, w / 24, h); }
    ctx.strokeStyle = "rgba(90,80,70,.45)"; ctx.lineWidth = 2;
    for (let i = 0; i <= 24; i++) { ctx.beginPath(); ctx.moveTo(i * w / 24, 0); ctx.lineTo(i * w / 24, h); ctx.stroke(); }
    ctx.strokeStyle = "rgba(90,80,70,.25)"; ctx.lineWidth = 1.5;
    for (let j = 1; j < 10; j++) { ctx.beginPath(); ctx.moveTo(0, j * h / 10); ctx.lineTo(w, j * h / 10); ctx.stroke(); }
    // dải đỏ trang trí quanh thân
    ctx.fillStyle = "rgba(150,30,22,.9)"; ctx.fillRect(0, h * 0.62, w, 10); ctx.fillRect(0, h * 0.655, w, 4);
  });
  t.wrapS = THREE.RepeatWrapping;
  return t;
}

function badgeTexture(n) {
  return canvasTex(128, 128, (ctx, w, h) => {
    ctx.fillStyle = "#f6d36b"; ctx.beginPath(); ctx.arc(64, 64, 58, 0, 7); ctx.fill();
    ctx.strokeStyle = "#6b4a14"; ctx.lineWidth = 6; ctx.stroke();
    ctx.fillStyle = "#3b2508"; ctx.font = `800 76px ${FONT}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(String(n), 64, 70);
  });
}
function iconTexture(type) {
  return canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#ffffff"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = 10;
    if (type === "time") { ctx.font = `800 120px ${FONT}`; ctx.fillText("+10s", 128, 138); }
    else if (type === "points") { ctx.font = `800 170px ${FONT}`; ctx.fillText("$", 128, 140); }
    else { ctx.font = `800 140px ${FONT}`; ctx.fillText("×2", 128, 140); }
  });
}
function popTexture() {
  return canvasTex(512, 256, (ctx, w, h) => {
    ctx.translate(w / 2, h / 2); ctx.fillStyle = "#ffd23f";
    ctx.beginPath(); for (let i = 0; i < 24; i++) { const r = i % 2 ? 80 : 124, a = i / 24 * Math.PI * 2; ctx.lineTo(Math.cos(a) * r * 1.8, Math.sin(a) * r * 0.9); } ctx.closePath(); ctx.fill();
    ctx.font = `800 120px ${FONT}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.lineWidth = 14; ctx.strokeStyle = "#7a1e3a"; ctx.strokeText("POP!", 0, 8); ctx.fillStyle = "#ff5c8a"; ctx.fillText("POP!", 0, 8);
  });
}
function textTexture(text, color) {
  return canvasTex(256, 128, (ctx, w, h) => {
    ctx.font = `800 92px ${FONT}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.lineWidth = 12; ctx.strokeStyle = "rgba(20,20,30,.8)"; ctx.strokeText(text, w / 2, h / 2 + 6); ctx.fillStyle = color; ctx.fillText(text, w / 2, h / 2 + 6);
  });
}
function markTexture(ok) {
  return canvasTex(256, 256, (ctx) => {
    ctx.fillStyle = ok ? "#22c55e" : "#ef4444"; ctx.beginPath(); ctx.arc(128, 128, 110, 0, 7); ctx.fill();
    ctx.lineWidth = 12; ctx.strokeStyle = "#ffffff"; ctx.stroke();
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 30; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath();
    if (ok) { ctx.moveTo(72, 132); ctx.lineTo(112, 172); ctx.lineTo(186, 92); } else { ctx.moveTo(84, 84); ctx.lineTo(172, 172); ctx.moveTo(172, 84); ctx.lineTo(84, 172); }
    ctx.stroke();
  });
}
function bannerTexture(text) {
  return canvasTex(1024, 240, (ctx, w, h) => {
    ctx.fillStyle = "#fff6dc"; roundRect(ctx, 8, 8, w - 16, h - 16, 20); ctx.fill();
    ctx.lineWidth = 10; ctx.strokeStyle = "#b8452f"; ctx.stroke();
    ctx.fillStyle = "#7a2416"; ctx.font = `800 150px ${FONT}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(text, w / 2, h / 2 + 10);
  });
}
function softDotTexture() {
  return canvasTex(128, 128, (ctx) => {
    const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  });
}

// ====================================================================== tiện ích
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function mulberry(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function disposeTree(o) {
  o.traverse(x => {
    if (x.isMesh || x.isSprite) {
      if (x.geometry && !x.geometry.userData.shared) x.geometry.dispose?.();
      const mats = Array.isArray(x.material) ? x.material : [x.material];
      mats.forEach(m => { if (m && !m.userData.shared) { m.map && !m.map.userData.shared && m.map.dispose(); m.dispose(); } });
    }
  });
}

const GRADE_SHADER = {
  uniforms: { tDiffuse: { value: null }, time: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float time; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      float l = dot(c, vec3(0.299, 0.587, 0.114));
      c = mix(c, c * c * (3. - 2. * c), 0.16);
      c += vec3(-0.012, 0.0, 0.02) * (1. - l) + vec3(0.03, 0.012, -0.02) * l;
      c = mix(vec3(l), c, 1.08);
      float v = smoothstep(0.95, 0.3, length((vUv - 0.5) * vec2(1.25, 1.0)));
      c *= mix(0.74, 1.0, v);
      c += (h(vUv * 900. + fract(time)) - 0.5) * 0.02;
      gl_FragColor = vec4(c, 1.);
    }`,
};
const ICON = {
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path class="w" d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/><path class="x" d="m16 9 6 6m0-6-6 6"/></svg>',
  fs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>',
};
const HUD_HTML = `
<div class="bp-stage">
  <canvas></canvas>
  <div class="bp-top">
    <div class="bp-clock">0:00</div>
    <div class="bp-prog"><i></i></div>
    <div class="bp-score"><b>0</b></div>
  </div>
  <div class="bp-sign">Level 1</div>
  <button class="bp-btn-ic bp-menu" aria-label="Menu">${ICON.menu}</button>
  <div class="bp-br"><button class="bp-btn-ic bp-sound" aria-label="Sound">${ICON.sound}</button><button class="bp-btn-ic bp-fs" aria-label="Full screen">${ICON.fs}</button></div>

  <div class="bp-ov bp-ov-start">
    <div class="bp-card">
      <div class="bp-kicker">Balloon pop</div>
      <h1>BALLOON POP</h1>
      <p class="bp-words"></p>
      <button class="bp-big bp-start">START</button>
      <p class="bp-how">Pop the balloons to drop each keyword onto its matching definition.</p>
      <button class="bp-link bp-opt-open">Options</button>
      <div class="bp-opts" hidden></div>
    </div>
  </div>
  <div class="bp-ov bp-ov-pause" hidden>
    <div class="bp-card"><h2>PAUSED</h2><button class="bp-big bp-resume">Resume</button><button class="bp-mid bp-again3">Start again</button></div>
  </div>
  <div class="bp-ov bp-ov-end" hidden>
    <div class="bp-card"><div class="bp-kicker bp-end-title">TIME'S UP</div><div class="bp-kicker2">Score</div><div class="bp-end-score">0</div><p class="bp-end-sub"></p>
      <button class="bp-mid bp-show">Show answers</button><button class="bp-big bp-again">Start again</button></div>
  </div>
  <div class="bp-ov bp-ov-ans" hidden>
    <div class="bp-card bp-card-wide"><h2>Show answers</h2><div class="bp-ans-list"></div>
      <div class="bp-ans-foot"><button class="bp-mid bp-ans-back">Back</button><button class="bp-big bp-again2">Start again</button></div></div>
  </div>
</div>`;
