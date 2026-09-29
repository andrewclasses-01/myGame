// BALLOON POP 3D — lõi game dùng chung cho các mẫu (29/9/2026).
// Luật như Wordwall (thầy chốt 29/9): màn N có N toa định nghĩa; bấm nổ khinh khí cầu ⇒ thùng mang TỪ
// RƠI THẲNG xuống, phải canh cho rơi trúng toa đúng. Toa rộng cố định, đoàn tàu dài hơn màn thì chạy vòng.
// createBalloonPop({ mount, view: "side" | "top", words, wordsTitle })
import * as THREE from "three";
import { createBpSound } from "./bp3d-sound.js";

const FONT = '"Baloo 2", system-ui, sans-serif';
const ASPECT = 16 / 10.5;                       // đúng khung act đơn của AWord
const PALETTE = [0xc0392b, 0x2e6fb5, 0x2f8f4e, 0x8e44ad, 0xd68910, 0x16a085, 0xb03a6f, 0x3d5a80, 0xa0522d, 0x1f7a8c];
const CART_W = 6.2, CART_GAP = 0.45, CART_PITCH = CART_W + CART_GAP, ENGINE_LEN = 6.4;
const ROOF_Y = 3.65, CRATE = 1.5, CRATE_W = 2.9, GRAV = 15;
const MAX_BLIMPS = 5;

const VIEWS = {
  side: { cam: [0, 6.6, 27.5], look: [0, 6.4, 0], fov: 38, lanes: [8.1, 10.35, 12.6], guide: false },
  top:  { cam: [0, 21, 19.5], look: [0, 5.5, -2.4], fov: 40, lanes: [8.0, 9.8, 11.6], guide: true },
};

const DEFAULTS = { timer: 120, levels: 10, balloonSpeed: 2, trainSpeed: 2, bonusTime: true, bonusPoints: true, bonusX2: true };

export async function createBalloonPop({ mount, view = "side", words, wordsTitle = "" }) {
  const V = VIEWS[view] || VIEWS.side;
  const opt = { ...DEFAULTS, guide: V.guide };
  const sfx = createBpSound();
  try { await document.fonts.load(`800 60px ${FONT}`); await document.fonts.load(`600 60px ${FONT}`); } catch (e) { /* vẽ bằng font dự phòng */ }

  // ------------------------------------------------------------------ khung + HUD
  mount.innerHTML = HUD_HTML;
  const stage = mount.querySelector(".bp-stage");
  const canvas = stage.querySelector("canvas");
  const $ = s => stage.querySelector(s);
  const clockEl = $(".bp-clock"), progEl = $(".bp-prog i"), scoreEl = $(".bp-score b"), signEl = $(".bp-sign");
  const ovStart = $(".bp-ov-start"), ovEnd = $(".bp-ov-end"), ovPause = $(".bp-ov-pause"), ovAns = $(".bp-ov-ans");
  $(".bp-words").textContent = `${words.length} words${wordsTitle ? " · " + wordsTitle : ""}`;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xe9c9a4, 70, 300);
  const camera = new THREE.PerspectiveCamera(V.fov, ASPECT, 0.5, 900);
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
  }
  fit();
  window.addEventListener("resize", fit);
  document.addEventListener("fullscreenchange", fit);

  // nửa bề ngang nhìn thấy: HALF ở độ cao nóc toa (cho tàu), SKY ở làn khinh khí cầu cao nhất (cho trời)
  const halfAt = y => {
    const v = new THREE.Vector3(0, y, 0).project(camera), rc = new THREE.Raycaster(), p = new THREE.Vector3();
    rc.setFromCamera(new THREE.Vector2(1, v.y), camera);
    return rc.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), p) ? Math.abs(p.x) : 18;
  };
  const HALF = halfAt(ROOF_Y);
  const SKY = Math.max(HALF, halfAt(V.lanes[2] + 1.5));

  buildWorld(scene, renderer);

  // ------------------------------------------------------------------ tài nguyên dùng chung
  const G = {
    wheelBig: new THREE.CylinderGeometry(0.62, 0.62, 0.28, 20),
    wheelSmall: new THREE.CylinderGeometry(0.45, 0.45, 0.26, 18),
    crate: new THREE.BoxGeometry(CRATE_W, CRATE, CRATE),
    shard: new THREE.TetrahedronGeometry(0.28),
    blimp: new THREE.SphereGeometry(1, 36, 18),
    hitBlimp: new THREE.SphereGeometry(1, 12, 8),
  };
  const M = {
    iron: new THREE.MeshStandardMaterial({ color: 0x2a2a2e, metalness: 0.6, roughness: 0.45 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xd4a73a, metalness: 0.8, roughness: 0.3 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x6d3b22, roughness: 0.85 }),
    woodDark: new THREE.MeshStandardMaterial({ color: 0x4a2716, roughness: 0.9 }),
    silver: new THREE.MeshStandardMaterial({ color: 0xe3e8ef, metalness: 0.2, roughness: 0.38, emissive: 0x23262c }),
    fin: new THREE.MeshStandardMaterial({ color: 0x9aa4b2, metalness: 0.5, roughness: 0.4 }),
    gondola: new THREE.MeshStandardMaterial({ color: 0x5a3a24, roughness: 0.8 }),
    hit: new THREE.MeshBasicMaterial({ visible: false }),
    shard: new THREE.MeshStandardMaterial({ color: 0xe6ebf2, metalness: 0.6, roughness: 0.3, transparent: true }),
    crateSide: new THREE.MeshStandardMaterial({ map: plankTexture(), roughness: 0.85 }),
  };
  const smokeTex = softDotTexture();
  // tài nguyên dùng chung: disposeTree() không được huỷ
  Object.values(G).forEach(x => { x.userData.shared = true; });
  Object.values(M).forEach(x => { x.userData.shared = true; if (x.map) x.map.userData.shared = true; });
  smokeTex.userData.shared = true;

  // ------------------------------------------------------------------ trạng thái
  const S = {
    state: "attract", paused: false, level: 0, timeLeft: opt.timer, score: 0, x2: 0,
    train: null, carts: [], trainX: 0, trainLen: 0, trainV: 0, introT: 0, clearT: 0,
    blimps: [], crates: [], fx: [], spawnT: 0, deck: [], levels: [], bag: [], lastTick: 99, chugT: 0,
    plane: null, time: 0,
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

  // ------------------------------------------------------------------ đoàn tàu
  function buildTrain(items, levelIdx) {
    if (S.train) { scene.remove(S.train); disposeTree(S.train); }
    const color = PALETTE[levelIdx % PALETTE.length];
    const train = new THREE.Group();
    const engine = makeEngine(color, levelIdx + 1);
    train.add(engine);
    S.carts = items.map((it, i) => {
      const cart = makeCart(it.definition);
      cart.position.x = -ENGINE_LEN / 2 - CART_GAP - CART_W / 2 - i * CART_PITCH;
      train.add(cart);
      return { group: cart, item: it, key: norm(it.keyword), filled: false, localX: cart.position.x };
    });
    S.wheels = [];
    train.traverse(o => { if (o.userData.wheelR) S.wheels.push(o); });
    S.train = train;
    S.trainLen = ENGINE_LEN / 2 + items.length * CART_PITCH + ENGINE_LEN / 2;
    scene.add(train);
  }
  // trainX = mũi đầu máy (thế giới); đầu máy tâm ở trainX - ENGINE_LEN/2
  function placeTrain() { S.train.position.x = S.trainX - ENGINE_LEN / 2; }
  const cartWorldX = c => S.train.position.x + c.localX;

  function makeEngine(color, num) {
    const g = new THREE.Group();
    const paint = new THREE.MeshStandardMaterial({ color, metalness: 0.35, roughness: 0.4 });
    const add = (geo, mat, x, y, z = 0, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = true; g.add(m); return m; };
    add(new THREE.BoxGeometry(6.2, 0.5, 2.1), M.iron, 0, 0.95);
    add(new THREE.CylinderGeometry(0.92, 0.92, 3.7, 28), paint, 0.9, 2.1, 0, 0, 0, Math.PI / 2);
    add(new THREE.CylinderGeometry(0.95, 0.95, 0.12, 28), M.brass, 2.75, 2.1, 0, 0, 0, Math.PI / 2);
    add(new THREE.CylinderGeometry(0.97, 0.97, 0.1, 28), M.brass, 0.1, 2.1, 0, 0, 0, Math.PI / 2);
    add(new THREE.CylinderGeometry(0.5, 0.3, 1.3, 16), M.iron, 2.2, 3.4);
    add(new THREE.CylinderGeometry(0.58, 0.58, 0.18, 16), M.iron, 2.2, 4.08);
    add(new THREE.SphereGeometry(0.38, 16, 10), M.brass, 1.0, 3.0);
    add(new THREE.BoxGeometry(2.2, 2.3, 2.2), paint, -1.9, 2.35);
    add(new THREE.BoxGeometry(2.6, 0.18, 2.6), M.iron, -1.9, 3.58);
    add(new THREE.BoxGeometry(1.2, 0.8, 0.05), new THREE.MeshStandardMaterial({ color: 0xffe9a8, emissive: 0x6b5520, roughness: 0.2 }), -1.9, 2.75, 1.11);
    add(new THREE.CylinderGeometry(0.22, 0.22, 0.3, 14), M.brass, 3.05, 2.55, 0, 0, 0, Math.PI / 2);
    const catcher = add(new THREE.ConeGeometry(0.95, 1.1, 4), M.iron, 3.35, 0.75, 0, 0, Math.PI / 4, -Math.PI / 2);
    catcher.scale.set(1, 1, 0.7);
    // số màn trên hông cabin
    const badge = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.95), new THREE.MeshBasicMaterial({ map: badgeTexture(num), transparent: true }));
    badge.position.set(-1.9, 1.75, 1.115); g.add(badge);
    for (const side of [-1, 1]) {
      for (const [x, big] of [[-1.9, 1], [-0.4, 1], [1.2, 0], [2.4, 0]]) {
        const w = new THREE.Mesh(big ? G.wheelBig : G.wheelSmall, M.iron);
        w.rotation.x = Math.PI / 2; w.position.set(x, big ? 0.62 : 0.45, side * 1.0);
        w.userData.wheelR = big ? 0.62 : 0.45; w.castShadow = true; g.add(w);
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.3, 10), M.brass);
        hub.rotation.x = Math.PI / 2; hub.position.copy(w.position); hub.position.z += side * 0.02; g.add(hub);
      }
    }
    const rod = add(new THREE.BoxGeometry(1.6, 0.1, 0.06), M.brass, -1.15, 0.62, 1.16);
    rod.userData.rod = true;
    g.userData.stack = new THREE.Vector3(2.2, 4.3, 0);
    return g;
  }

  function makeCart(definition) {
    const g = new THREE.Group();
    const add = (geo, mat, x, y, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
    add(new THREE.BoxGeometry(CART_W, 0.35, 2.0), M.iron, 0, 0.92);
    add(new THREE.BoxGeometry(CART_W - 0.1, 2.5, 1.8), M.wood, 0, 2.35);
    add(new THREE.BoxGeometry(CART_W + 0.1, 0.12, 1.96), M.woodDark, 0, ROOF_Y - 0.03);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(CART_W - 0.3, 2.3), new THREE.MeshBasicMaterial({ map: boardTexture(definition), toneMapped: false }));
    face.position.set(0, 2.35, 0.915); g.add(face);
    for (const side of [-1, 1]) for (const x of [-2.2, 2.2]) {
      const w = new THREE.Mesh(G.wheelSmall, M.iron);
      w.rotation.x = Math.PI / 2; w.position.set(x, 0.45, side * 0.95); w.userData.wheelR = 0.45; w.castShadow = true; g.add(w);
    }
    add(new THREE.BoxGeometry(0.5, 0.14, 0.14), M.iron, CART_W / 2 + 0.2, 0.85);
    return g;
  }

  // ------------------------------------------------------------------ khinh khí cầu
  function laneFree(y, fromX) {
    return !S.blimps.some(b => Math.abs(b.baseY - y) < 0.5 && b.x > fromX - 8.5);
  }
  function drawKeyword() {
    const open = S.carts.filter(c => !c.filled).map(c => c.item.keyword);
    if (!S.deck.length) {
      const inLevel = new Set(S.carts.map(c => c.key));
      const others = shuffle(words.filter(w => !inLevel.has(norm(w.keyword))).map(w => w.keyword));
      const nDis = Math.max(1, Math.min(3, Math.ceil(open.length * 0.6)));
      S.deck = shuffle([...open, ...open, ...others.slice(0, nDis)]);
    }
    let k = S.deck.pop();
    // từ của toa đã đầy thì đổi sang từ còn mở (không để trời đầy từ đã xong)
    const openSet = new Set(open.map(norm));
    const inLevel = new Set(S.carts.map(c => c.key));
    if (inLevel.has(norm(k)) && !openSet.has(norm(k)) && open.length) k = open[Math.floor(Math.random() * open.length)];
    return k;
  }
  function spawnBlimp(x, attract) {
    const lanes = shuffle(V.lanes.slice());
    const spawnX = x ?? SKY + 7;
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
    const body = new THREE.Mesh(G.blimp, M.silver); body.scale.set(3.3, 1.2, 1.2); body.castShadow = true; g.add(body);
    for (let i = 0; i < 4; i++) {
      const pivot = new THREE.Group(); pivot.rotation.x = i * Math.PI / 2;
      const fin = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.06, 0.9), M.fin);
      fin.position.set(2.95, 0, 0.62); fin.castShadow = true;
      pivot.add(fin); g.add(pivot);
    }
    const gon = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.45, 0.6), M.gondola); gon.position.set(-0.2, -1.35, 0); gon.castShadow = true; g.add(gon);
    for (const x of [-0.7, 0.3]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 5), M.iron); r.position.set(x, -1.05, 0); g.add(r); }
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 1.35), new THREE.MeshBasicMaterial({ map: wordTexture(word), transparent: true, toneMapped: false, depthWrite: false }));
    banner.renderOrder = 5;
    g.add(banner); g.userData.banner = banner;
    const hit = new THREE.Mesh(G.hitBlimp, M.hit); hit.scale.set(3.9, 1.9, 1.9); g.add(hit); g.userData.hit = hit;
    return g;
  }
  function makeBonusBalloon(type) {
    const g = new THREE.Group();
    const col = type === "time" ? 0x5fb4ff : type === "points" ? 0xf4c542 : 0xb57bff;
    const ball = new THREE.Mesh(G.blimp, new THREE.MeshStandardMaterial({ color: col, roughness: 0.25, metalness: 0.15 }));
    ball.scale.set(1.15, 1.3, 1.15); ball.castShadow = true; g.add(ball);
    const knot = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.3, 8), ball.material); knot.position.y = -1.38; knot.rotation.x = Math.PI; g.add(knot);
    const str = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.6, 4), M.iron); str.position.y = -2.3; g.add(str);
    const icon = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshBasicMaterial({ map: iconTexture(type), transparent: true, depthWrite: false, toneMapped: false }));
    icon.renderOrder = 5; g.add(icon); g.userData.banner = icon;
    const hit = new THREE.Mesh(G.hitBlimp, M.hit); hit.scale.set(1.9, 2.1, 1.9); g.add(hit); g.userData.hit = hit;
    return g;
  }
  function makeGuide(y) {
    const g = new THREE.Group();
    const h = y - 1.5 - ROOF_Y;
    const line = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, h, 5), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false }));
    line.position.y = ROOF_Y + h / 2; g.add(line);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.8, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = ROOF_Y + 0.08; g.add(ring);
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
    burst(b.obj.position, b.bonus ? 10 : 16);
    popWord(b.obj.position);
    removeBlimp(b);
    if (b.bonus) return applyBonus(b.bonus, b.obj.position);
    dropCrate(b.word, b.obj.position.x, b.obj.position.y - 1.6);
  }
  function applyBonus(type, pos) {
    sfx.bonus();
    if (type === "time") { S.timeLeft += 10; floatText("+10s", pos, "#7fd0ff"); flashClock("+10s"); }
    else if (type === "points") { S.score += 10; floatText("+10", pos, "#ffd34d"); updateHud(); }
    else { S.x2 += 3; floatText("×2", pos, "#d9a8ff"); scoreEl.parentElement.classList.add("is-x2"); }
  }

  // ------------------------------------------------------------------ thùng hàng
  function dropCrate(word, x, y) {
    const mats = [M.crateSide, M.crateSide, new THREE.MeshStandardMaterial({ map: crateTexture(word), roughness: 0.85 }), M.crateSide, new THREE.MeshStandardMaterial({ map: crateTexture(word), roughness: 0.85 }), M.crateSide];
    const mesh = new THREE.Mesh(G.crate, mats);
    mesh.castShadow = true;
    mesh.position.set(x, y, 0);
    scene.add(mesh);
    S.crates.push({ mesh, word, key: norm(word), vx: 0, vy: 0, spin: 0, phase: "fall", t: 0 });
  }
  function updateCrates(dt) {
    for (let i = S.crates.length - 1; i >= 0; i--) {
      const c = S.crates[i];
      c.t += dt;
      if (c.phase === "fall" || c.phase === "bounce" || c.phase === "miss") {
        const prevBottom = c.mesh.position.y - CRATE / 2;
        c.vy -= GRAV * dt;
        c.mesh.position.x += c.vx * dt;
        c.mesh.position.y += c.vy * dt;
        c.mesh.rotation.z += c.spin * dt;
        const bottom = c.mesh.position.y - CRATE / 2;
        if (c.phase === "fall" && prevBottom >= ROOF_Y && bottom <= ROOF_Y && S.train) {
          const x = c.mesh.position.x;
          const cart = S.carts.find(k => Math.abs(cartWorldX(k) - x) <= CART_W / 2 + 0.25);
          const onEngine = !cart && Math.abs((S.train.position.x) - x) <= ENGINE_LEN / 2 + 0.2;
          if (cart && S.state !== "play") { c.phase = "miss"; c.vy = 3.5; c.vx = -2; c.spin = 4; continue; }
          if (cart && !cart.filled && cart.key === c.key) { landCorrect(c, cart); S.crates.splice(i, 1); continue; }
          if (cart) { landWrong(c, cart); continue; }
          if (onEngine) { c.mesh.position.y = ROOF_Y + CRATE / 2 + 0.6; c.vy = 3.5; c.vx = -2.5; c.spin = 3; c.phase = "miss"; sfx.thud(); continue; }
        }
        if (bottom <= 0.3) {
          c.mesh.position.y = 0.3 + CRATE / 2; c.phase = "ground"; c.t = 0; sfx.thud();
          dust(c.mesh.position);
        }
      } else if (c.phase === "ground") {
        if (c.t > 0.7) {
          const k = Math.max(0, 1 - (c.t - 0.7) / 0.5);
          c.mesh.scale.setScalar(Math.max(0.001, k));
          if (k <= 0) { scene.remove(c.mesh); disposeCrate(c.mesh); S.crates.splice(i, 1); }
        }
      }
    }
  }
  function landCorrect(c, cart) {
    cart.filled = true;
    scene.remove(c.mesh);
    c.mesh.rotation.set(0, 0, 0);
    c.mesh.position.set(0, ROOF_Y + CRATE / 2, 0);
    c.mesh.scale.set(1.18, 0.72, 1.18);
    S.fx.push({ obj: c.mesh, t: 0, life: 0.4, kind: "squash" });
    cart.group.add(c.mesh);
    cart.crate = c.mesh;
    const gain = S.x2 > 0 ? 10 : 5;
    if (S.x2 > 0) { S.x2--; if (!S.x2) scoreEl.parentElement.classList.remove("is-x2"); }
    S.score += gain;
    sfx.correct();
    const wp = new THREE.Vector3(); c.mesh.getWorldPosition(wp);
    mark(true, wp); floatText("+" + gain, wp.clone().add(new THREE.Vector3(2.4, 1.6, 0)), "#9dffa9");
    S.deck = [];
    updateHud();
    if (S.carts.every(k => k.filled)) levelClear();
  }
  function landWrong(c, cart) {
    sfx.wrong();
    const wp = c.mesh.position.clone(); wp.y = ROOF_Y + 1;
    mark(false, wp);
    c.phase = "miss"; c.vy = 4.2; c.vx = (Math.random() < 0.5 ? -1 : 1) * 2.2; c.spin = 5;
    stage.classList.add("is-shake"); setTimeout(() => stage.classList.remove("is-shake"), 320);
  }
  function disposeCrate(mesh) { const m = mesh.material; [m[2], m[4]].forEach(x => { x.map.dispose(); x.dispose(); }); }

  // ------------------------------------------------------------------ hiệu ứng
  function burst(pos, n) {
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(G.shard, M.shard.clone());
      m.position.copy(pos);
      const v = new THREE.Vector3((Math.random() - 0.5) * 12, Math.random() * 8 - 1, (Math.random() - 0.5) * 6);
      fxRoot.add(m);
      S.fx.push({ obj: m, v, life: 0.9, t: 0, spin: new THREE.Vector3(Math.random() * 9, Math.random() * 9, 0), kind: "shard" });
    }
  }
  function spriteOf(tex, w, h) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false, toneMapped: false }));
    s.scale.set(w, h, 1); s.renderOrder = 10; return s;
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
    const p = S.train.children[0].userData.stack.clone(); S.train.children[0].localToWorld(p);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, color: 0xeeeeee, transparent: true, depthWrite: false, opacity: 0.75 }));
    s.position.copy(p); s.scale.setScalar(0.9); fxRoot.add(s);
    S.fx.push({ obj: s, t: 0, life: 1.8, kind: "smoke", v: new THREE.Vector3(-0.8 - S.trainV * 0.3, 2.2, -0.3), grow: 3.4 });
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
      if (k >= 1) { fxRoot.remove(f.obj); f.obj.material.map && f.obj.kind !== "keep" && f.kind !== "smoke" && f.obj.material.map.dispose(); f.obj.material.dispose(); S.fx.splice(i, 1); continue; }
      if (f.kind === "shard") {
        f.v.y -= 14 * dt; f.obj.position.addScaledVector(f.v, dt);
        f.obj.rotation.x += f.spin.x * dt; f.obj.rotation.y += f.spin.y * dt; f.obj.material.opacity = 1 - k;
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
    g.position.set(SKY + 12, V.lanes[2] + 1.2, -3);
    scene.add(g);
    S.plane = { obj: g, prop, banner, t: 0 };
    sfx.plane();
  }
  function updatePlane(dt) {
    const p = S.plane; if (!p) return;
    p.t += dt;
    p.obj.position.x -= 9.5 * dt;
    p.obj.position.y = V.lanes[2] + 1.2 + Math.sin(p.t * 2) * 0.25;
    p.prop.rotation.x += dt * 40;
    p.banner.quaternion.copy(camera.quaternion).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.sin(p.t * 5) * 0.12));
    if (p.obj.position.x < -SKY - 20) { scene.remove(p.obj); disposeTree(p.obj); S.plane = null; }
  }

  // ------------------------------------------------------------------ nhịp ván
  function clearSky() {
    S.blimps.slice().forEach(removeBlimp);
    S.crates.forEach(c => { scene.remove(c.mesh); disposeCrate(c.mesh); }); S.crates = [];
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
    const n = Math.min(i + 1, allKeys.length);
    const items = nextLevelItems(n);
    buildTrain(items, i);
    S.levels[i] = S.carts;
    S.deck = [];
    // tàu chạy nhanh vào tới vị trí rồi mới tính giờ
    S.trainX = -HALF - 1;
    S.introFrom = S.trainX;
    S.introTo = -HALF + ENGINE_LEN + CART_GAP + CART_W + 2;   // toa đầu nằm trong màn
    S.introT = 0;
    S.trainV = 0;
    placeTrain();
    S.state = "intro";
    signEl.textContent = "Level " + (i + 1);
    signEl.classList.remove("is-in"); void signEl.offsetWidth; signEl.classList.add("is-in");
    sfx.whistle();
    updateHud();
  }
  function cruiseV() { return (0.9 + 0.55 * opt.trainSpeed) * (1 + 0.05 * (S.carts.length - 1)); }
  function blimpV() { return 1.4 + 0.65 * opt.balloonSpeed; }

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
      $(".bp-end-sub").textContent = `${done} matched · level ${S.level + 1} of ${opt.levels}`;
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
        if (k >= 1) { S.state = "play"; S.spawnT = 0; spawnBlimp(HALF * 0.55); spawnBlimp(HALF * 0.05); }
      } else if (st === "play" || st === "over") {
        v = st === "play" ? cruiseV() : 0;
        S.trainX += v * dt;
        if (S.trainX - S.trainLen > HALF + 1) S.trainX = -HALF - 0.5;
      } else if (st === "clear") {
        S.clearT += dt;
        S.trainV = Math.min(14, (S.trainV || cruiseV()) + dt * 6);
        v = S.trainV; S.trainX += v * dt;
        if (S.trainX - S.trainLen > HALF + 2 && S.clearT > 3.2) {
          if (S.level + 1 >= opt.levels) endGame(true);
          else beginLevel(S.level + 1);
        }
      }
      if (st !== "clear") S.trainV = v;
      placeTrain();
      const dx = v * dt;
      for (const w of S.wheels) w.rotation.y -= dx / w.userData.wheelR;
      if (v > 0.05) {
        S.smokeT = (S.smokeT || 0) - dt;
        if (S.smokeT <= 0) { smokePuff(); S.smokeT = Math.max(0.12, 0.45 - v * 0.03); }
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
    if (st === "play" || st === "attract") {
      S.spawnT -= dt;
      const live = S.blimps.filter(b => !b.leaving).length;
      if (S.spawnT <= 0 && live < MAX_BLIMPS) { if (spawnBlimp(undefined, st === "attract")) S.spawnT = (st === "attract" ? 3.2 : 1.9) * (2.7 / bv); else S.spawnT = 0.3; }
    }
    for (const b of S.blimps.slice()) {
      if (b.frozen) continue;
      if (b.leaving) { b.vy += dt * 9; b.baseY += b.vy * dt; if (b.baseY > 30) { removeBlimp(b); continue; } }
      else b.x -= bv * dt;
      b.y = b.baseY + Math.sin(S.time * 1.3 + b.phase) * 0.22;
      b.obj.position.set(b.x, b.y, 0);
      b.obj.rotation.z = Math.sin(S.time * 0.9 + b.phase) * 0.04;
      b.obj.userData.banner.quaternion.copy(camera.quaternion);
      b.obj.userData.banner.position.set(0, 0, 1.35);
      if (b.guide) { b.guide.position.x = b.x; b.guide.visible = !b.leaving; }
      if (b.x < -SKY - 8) removeBlimp(b);
    }
    updateCrates(dt);
    updateFx(dt);
    updatePlane(dt);
    // đám mây trôi
    for (const c of CLOUDS) { c.position.x -= dt * c.userData.v; if (c.position.x < -170) c.position.x = 170; }
    updateHud();
  }

  function updateHud() {
    const t = Math.max(0, Math.ceil(S.timeLeft));
    clockEl.textContent = Math.floor(t / 60) + ":" + String(t % 60).padStart(2, "0");
    scoreEl.textContent = S.score;
    const lv = S.carts.length ? S.carts.filter(c => c.filled).length / S.carts.length : 0;
    const p = S.state === "attract" ? 0 : Math.min(1, (S.level + (S.state === "clear" ? 1 : lv)) / opt.levels);
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
    renderer.render(scene, camera);
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
    ["levels", "Levels", 1, 10, 1, v => v],
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
    step(n = 1, dt = 1 / 60) { manual = true; for (let i = 0; i < n; i++) if (!S.paused) update(dt); renderer.render(scene, camera); return S.state; },
    resume() { manual = false; last = 0; },
    // thả thùng mang `word` ngay trên toa thứ `cartIdx`, có tính trước quãng tàu chạy trong lúc rơi
    testDrop(word, cartIdx = 0, fromY = 11) {
      const c = S.carts[cartIdx]; const tFall = Math.sqrt(2 * (fromY - ROOF_Y - CRATE / 2) / GRAV);
      dropCrate(word, cartWorldX(c) + cruiseV() * tFall, fromY);
    },
    popWord(word) { const b = S.blimps.find(x => x.word && norm(x.word) === norm(word)); if (b) popBlimp(b); return !!b; },
  };
  return window.__bp;
}

// ====================================================================== cảnh sa mạc
const CLOUDS = [];
function buildWorld(scene, renderer) {
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(0x4f8fd6) }, mid: { value: new THREE.Color(0x9cc6ea) }, hor: { value: new THREE.Color(0xf3d2ad) } },
    vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
    fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 hor; varying vec3 vP;
      void main(){ float h = normalize(vP).y; vec3 c = mix(hor, mid, smoothstep(-0.02, 0.12, h)); c = mix(c, top, smoothstep(0.12, 0.55, h)); gl_FragColor = vec4(c, 1.); }`,
  });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(600, 32, 16), skyMat));

  scene.add(new THREE.HemisphereLight(0xcfe3ff, 0xc28a5a, 1.1));
  const sun = new THREE.DirectionalLight(0xfff1d6, 2.4);
  sun.position.set(-14, 40, 24); sun.target.position.set(0, 0, 0);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -42, right: 42, top: 30, bottom: -30, near: 5, far: 110 });
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshStandardMaterial({ map: sandTexture(renderer), color: 0xf0c490, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

  // nền đường ray
  const ballast = new THREE.Mesh(new THREE.BoxGeometry(600, 0.22, 3.4), new THREE.MeshStandardMaterial({ color: 0x8f7a66, roughness: 1 }));
  ballast.position.y = 0.11; ballast.receiveShadow = true; scene.add(ballast);
  const sleeperGeo = new THREE.BoxGeometry(0.4, 0.14, 2.6), sleepers = new THREE.InstancedMesh(sleeperGeo, new THREE.MeshStandardMaterial({ color: 0x5a3b26, roughness: 0.95 }), 300);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 300; i++) { m4.makeTranslation(-150 + i, 0.29, 0); sleepers.setMatrixAt(i, m4); }
  sleepers.receiveShadow = true; scene.add(sleepers);
  const railMat = new THREE.MeshStandardMaterial({ color: 0x9aa0a8, metalness: 0.8, roughness: 0.35 });
  for (const z of [-0.78, 0.78]) { const r = new THREE.Mesh(new THREE.BoxGeometry(600, 0.16, 0.14), railMat); r.position.set(0, 0.42, z); r.receiveShadow = true; scene.add(r); }

  // núi đá mặt bàn (mesa) xa
  const rnd = mulberry(7);
  const mesaCols = [0xc0643a, 0xb5563a, 0xcf7a4a, 0xa94d33];
  for (let i = 0; i < 26; i++) {
    const x = -260 + rnd() * 520, z = -70 - rnd() * 170, r = 8 + rnd() * 22, h = 10 + rnd() * 26;
    const mat = new THREE.MeshStandardMaterial({ color: mesaCols[i % 4], roughness: 0.95, flatShading: true });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.72, r * 1.15, h, 7 + (i % 3)), mat);
    base.position.set(x, h / 2, z); base.rotation.y = rnd() * 3; scene.add(base);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.78, r * 0.72, h * 0.12, 7 + (i % 3)), new THREE.MeshStandardMaterial({ color: 0xe0a070, roughness: 0.95, flatShading: true }));
    cap.position.set(x, h + h * 0.06, z); cap.rotation.y = base.rotation.y; scene.add(cap);
  }
  // xương rồng + đá sau đường ray
  const cactusMat = new THREE.MeshStandardMaterial({ color: 0x4f8a3c, roughness: 0.8 });
  const rockMat = new THREE.MeshStandardMaterial({ color: 0xb07a52, roughness: 0.95, flatShading: true });
  for (let i = 0; i < 40; i++) {
    const x = -90 + rnd() * 180, z = -4 - rnd() * 50;
    if (rnd() < 0.55) scene.add(cactus(x, z, 1.2 + rnd() * 2.2, cactusMat, rnd));
    else { const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6 + rnd() * 1.8), rockMat); r.position.set(x, 0.3, z); r.scale.y = 0.6; r.rotation.y = rnd() * 3; r.castShadow = true; r.receiveShadow = true; scene.add(r); }
  }
  for (let i = 0; i < 10; i++) {
    const side = i % 2 ? 1 : -1, x = side * (24 + rnd() * 30), z = 4 + rnd() * 14;
    scene.add(cactus(x, z, 1.4 + rnd() * 1.5, cactusMat, rnd));
  }
  // mây
  const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, emissive: 0x333333 });
  for (let i = 0; i < 9; i++) {
    const g = new THREE.Group();
    for (let k = 0; k < 6; k++) { const s = new THREE.Mesh(new THREE.SphereGeometry(3 + rnd() * 3, 14, 10), cloudMat); s.position.set(k * 3.2 - 8, rnd() * 2, rnd() * 3); s.scale.y = 0.7; g.add(s); }
    g.position.set(-170 + rnd() * 340, 34 + rnd() * 22, -60 - rnd() * 80);
    g.userData.v = 0.6 + rnd() * 0.8;
    scene.add(g); CLOUDS.push(g);
  }
}
function cactus(x, z, h, mat, rnd) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CapsuleGeometry(0.28 * h / 2, h, 6, 12), mat); trunk.position.y = h / 2 + 0.2; g.add(trunk);
  for (const s of [-1, 1]) if (rnd() < 0.8) {
    const ah = h * (0.3 + rnd() * 0.25);
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.2 * h / 2, ah, 6, 10), mat);
    arm.position.set(s * 0.55 * h / 2 + s * 0.2, h * (0.45 + rnd() * 0.25) + ah / 2, 0); g.add(arm);
    const link = new THREE.Mesh(new THREE.CapsuleGeometry(0.18 * h / 2, 0.35 * h / 2, 4, 8), mat);
    link.rotation.z = Math.PI / 2; link.position.set(s * 0.35 * h / 2, arm.position.y - ah / 2, 0); g.add(link);
  }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; } });
  g.position.set(x, 0, z); g.rotation.y = rnd() * 3;
  return g;
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
    ctx.fillStyle = "#33190c"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const fit = wrapFit(ctx, text, w - 90, h - 64, 112, 40, 700, 3, 1.06);
    ctx.font = `700 ${fit.px}px ${FONT}`;
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
function plankTexture() { return canvasTex(256, 256, drawPlanks); }
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
function sandTexture(renderer) {
  const t = canvasTex(512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#e3b27a"; ctx.fillRect(0, 0, w, h);
    const r = mulberry(3);
    for (let i = 0; i < 9000; i++) { const v = r(); ctx.fillStyle = v < 0.5 ? "rgba(160,100,55,.18)" : "rgba(255,235,200,.22)"; ctx.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 2); }
    for (let i = 0; i < 40; i++) { ctx.fillStyle = "rgba(150,95,55,.10)"; ctx.beginPath(); ctx.ellipse(r() * w, r() * h, 20 + r() * 60, 8 + r() * 20, r() * 3, 0, 7); ctx.fill(); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(70, 70); t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
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
    <div class="bp-score">✓ <b>0</b></div>
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
