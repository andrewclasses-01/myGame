// =============================================================
// SPEED RUN 3D — LÕI (mẫu 1, 11/10/2026) · thầy CHỐT 8 đề xuất ở NGHIEN CUU GAMEPLAY.md mục 7
// Khuôn B (như STAR LOOT): game TỰ VẼ TRỌN MÀN, tự giữ luật Fight 2 đội ⇒ sau này nối AWord qua host/remote.
// LUẬT NĂNG LƯỢNG "C · LAI": đường đua chia L ĐOẠN (vạch sáng ngang đường). Mỗi câu ĐÚNG nạp 1 đoạn ⇒ xe CHẠY LIÊN TỤC hết đoạn đó
//   rồi lăn chậm dần, dừng đúng vạch. Đúng liên tiếp ⇒ năng lượng dồn ⇒ xe không giảm tốc. SAI ⇒ phanh gấp, MẤT phần năng lượng đang dồn
//   (chỉ chạy nốt tới vạch của đoạn đang chạy dở), KHÔNG lùi. Xe nào chạm vạch đích trước thắng. Luật vẫn là NẤC (T.p) như Rocket Race.
// CAMERA: sau lưng 2 xe, cao hơn Rocket Race; độ cao + cự ly tăng LIÊN TỤC theo khoảng cách 2 xe (VIEWS.a "cao vừa");
//   VIEWS.b cao hơn nữa và khi bỏ xa quá thì chuyển sang góc TRỰC THĂNG bên hông thấy trọn đoạn giữa 2 xe.
// Chế độ mẫu 1: Fight 2 đội, câu RIÊNG từng đội (Different) — mỗi đội 1 cột đáp án bên mình.
// Bàn thử: window.__sr — start() · answer(team, ok) · auto(on, acc0, acc1) · lane(team, dir) · step(n) · resume() · state() · camInfo()
// =============================================================
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { makeCar } from "./sr3d-car-1.js";
import { createWorld, makeBend, LANES, HAZE } from "./sr3d-world-1.js";
import { makeAutoRes } from "./sr3d-autores.js";

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const ease = t => t * t * (3 - 2 * t);
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export const TEAMS = [{ name: "TEAM 1", color: "#3b8cff", lanes: LANES.left }, { name: "TEAM 2", color: "#ff7a00", lanes: LANES.right }];
// Vật lý (m, s): mỗi đoạn 80 m; 1 câu đúng khi đang đứng ⇒ chạy ~4,6 s, đỉnh ~120 km/h; dồn nhiều ⇒ tới 166 km/h
export const PHYS = { SEG: 80, VMAX: 46, ACC: 15, DEC: 11, HARD: 26 };
// Góc máy: h/back = độ cao / lùi sau xe đi sau (m) ở gap 0 → gap gFull; fov dọc. heli: [bắt đầu, xong] (m) — null = không có
export const VIEWS = {
  a: { name: "Cao vừa", h: [6.8, 42], back: [13.5, 56], gFull: 300, fov: [46, 52], heli: null },
  b: { name: "Cao hơn + trực thăng", h: [10, 52], back: [15, 54], gFull: 190, fov: [48, 52], heli: [170, 270] }
};
export const DEFAULTS = { steps: 8, car: "lambo", bend: 1 };

export function createSpeedRun({ mount, view = "a", questions, title = "SPEED RUN", options = {}, onEvent = () => {} }) {
  const opt = { ...DEFAULTS, ...options };
  const V = VIEWS[view] || VIEWS.a;
  let L = clamp(opt.steps | 0, 3, 20);
  const SEG = PHYS.SEG;

  // ---------- DOM ----------
  mount.classList.add("sr-root");
  mount.innerHTML = `
    <canvas class="sr-canvas"></canvas>
    <div class="sr-hud">
      <div class="sr-prog"><div class="sr-prog-track"></div><div class="sr-prog-flag">🏁</div></div>
      ${[0, 1].map(i => `
      <div class="sr-col sr-col${i}" style="--team:${TEAMS[i].color}">
        <div class="sr-team">${TEAMS[i].name}</div>
        <div class="sr-q"></div>
        <div class="sr-ans"></div>
        <div class="sr-meter"><div class="sr-energy"><i></i><i></i><i></i><i></i><b></b></div><div class="sr-speed"><span>0</span> km/h</div></div>
      </div>`).join("")}
      <div class="sr-center">
        <div class="sr-title">SPEED RUN</div>
        <div class="sr-sub">${esc(title)}</div>
        <button class="sr-start" type="button">▶&nbsp; START</button>
        <div class="sr-lights"><i></i><i></i><i></i><i></i><i></i></div>
        <div class="sr-go">GO!</div>
      </div>
      ${[0, 1].map(i => `<div class="sr-mark sr-mark${i}" style="--team:${TEAMS[i].color}"><b>${i + 1}</b></div>`).join("")}
      <div class="sr-banner"></div>
      <div class="sr-result"><div class="sr-res-title"></div><div class="sr-res-rows"></div><button class="sr-again" type="button">PLAY AGAIN</button></div>
    </div>`;
  const $ = s => mount.querySelector(s), $$ = s => [...mount.querySelectorAll(s)];
  const cvs = $(".sr-canvas"), cols = [$(".sr-col0"), $(".sr-col1")];
  const progTrack = $(".sr-prog-track");

  // ---------- renderer / cảnh ----------
  const renderer = new THREE.WebGLRenderer({ canvas: cvs, antialias: false, powerPreference: "high-performance" });
  renderer.debug.checkShaderErrors = false;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const PR_MAX = Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(PR_MAX);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(HAZE, 140, 1150);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.55;
  const camera = new THREE.PerspectiveCamera(V.fov[0], 2, 0.3, 2600);
  const KEY = new THREE.Vector3(-0.45, 0.75, 0.5).normalize();                    // đèn chính từ SAU-TRÁI-CAO: thân xe nhìn từ sau vẫn sáng rõ màu đội
  const key = new THREE.DirectionalLight("#ffd9b3", 2.4); key.position.copy(KEY).multiplyScalar(100); scene.add(key, key.target);
  const rim = new THREE.DirectionalLight("#ff9a5c", 1.6); rim.position.set(38, 8, -92); scene.add(rim, rim.target);   // ngược sáng mặt trời
  scene.add(new THREE.HemisphereLight("#ffd7b8", "#4a5236", 0.9));

  const U = { uBend: { value: new THREE.Vector2() }, uBendZ: { value: 0 } };
  const bend = makeBend(U);
  const world = createWorld({ scene, U, bend, keyDir: KEY });
  world.setTrack(L, SEG);

  // hậu kỳ: MSAA 4 + bloom nhẹ (đèn đường, đèn hậu, mặt trời trên biển)
  const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.32, 0.55, 0.92); composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ---------- xe ----------
  let cars = [];
  function buildCars() {
    cars.forEach(c => { scene.remove(c.rig); c.dispose(); });
    cars = TEAMS.map((tm, i) => { const c = makeCar({ model: opt.car, color: tm.color, num: i + 1, bend, U }); scene.add(c.rig); return c; });
  }
  buildCars();

  // ---------- khói lốp (Points có cong) ----------
  const NS = 260;
  const smk = { pos: new Float32Array(NS * 3), a: new Float32Array(NS), sz: new Float32Array(NS), vel: new Float32Array(NS * 3), life: new Float32Array(NS), max: new Float32Array(NS), i: 0 };
  const smkG = new THREE.BufferGeometry();
  smkG.setAttribute("position", new THREE.BufferAttribute(smk.pos, 3)); smkG.setAttribute("aA", new THREE.BufferAttribute(smk.a, 1)); smkG.setAttribute("aS", new THREE.BufferAttribute(smk.sz, 1));
  const smkM = new THREE.ShaderMaterial({ transparent: true, depthWrite: false,
    uniforms: { uBend: U.uBend, uBendZ: U.uBendZ, uScale: { value: 400 } },
    vertexShader: `uniform vec2 uBend; uniform float uBendZ; uniform float uScale; attribute float aA; attribute float aS; varying float vA;
      void main(){ vec4 w = modelMatrix * vec4(position,1.0); float d = min(w.z - uBendZ, 0.0); w.x += uBend.x*d*d; w.y -= uBend.y*d*d;
        vec4 mv = viewMatrix * w; gl_Position = projectionMatrix * mv; gl_PointSize = aS * uScale / -mv.z; vA = aA; }`,
    fragmentShader: `varying float vA; void main(){ vec2 p = gl_PointCoord - 0.5; float r = length(p); if (r > 0.5) discard; float a = smoothstep(0.5, 0.1, r) * vA; gl_FragColor = vec4(vec3(0.82,0.80,0.78), a); }` });
  const smoke = new THREE.Points(smkG, smkM); smoke.frustumCulled = false; smoke.renderOrder = 5; scene.add(smoke);
  function puff(x, y, z, k = 1) {
    const i = smk.i = (smk.i + 1) % NS;
    smk.pos.set([x + (Math.random() - 0.5) * 0.4, y, z], i * 3);
    smk.vel.set([(Math.random() - 0.5) * 1.6, 0.6 + Math.random() * 0.9, 2 + Math.random() * 3], i * 3);
    smk.life[i] = smk.max[i] = 1.1 + Math.random() * 0.8; smk.sz[i] = 0.9 * k; smk.a[i] = 0.5 * k;
  }
  function tickSmoke(dt) {
    for (let i = 0; i < NS; i++) { if (smk.life[i] <= 0) { smk.a[i] = 0; continue; }
      smk.life[i] -= dt; const t = 1 - smk.life[i] / smk.max[i];
      for (let k = 0; k < 3; k++) smk.pos[i * 3 + k] += smk.vel[i * 3 + k] * dt;
      smk.sz[i] += dt * 2.6; smk.a[i] = 0.42 * (1 - t) * smooth(0, 0.08, t); }
    smkG.attributes.position.needsUpdate = smkG.attributes.aA.needsUpdate = smkG.attributes.aS.needsUpdate = true;
  }

  // ---------- trạng thái ----------
  const G = { phase: "menu", t: 0, countT: 0, winner: -1, endT: 0, queue: [], auto: false, acc: [0.85, 0.6], nextAuto: [0, 0] };
  const T = [0, 1].map(i => ({ i, p: 0, s: 0, v: 0, a: 0, x: TEAMS[i].lanes[0], lane: 0, vx: 0, brake: 0, boost: 0, streak: 0, ok: 0, bad: 0, lock: true, order: [], qi: -1, cur: null, smokeT: 0 }));
  const later = (sec, fn) => G.queue.push({ at: G.t + sec, fn });

  function resetTeams() {
    T.forEach(t => Object.assign(t, { p: 0, s: 0, v: 0, a: 0, x: TEAMS[t.i].lanes[0], lane: 0, vx: 0, brake: 0, boost: 0, streak: 0, ok: 0, bad: 0, lock: true, order: [], qi: -1, cur: null }));
    G.winner = -1; G.queue = []; $(".sr-result").classList.remove("on"); $(".sr-banner").className = "sr-banner";
  }

  // ---------- câu hỏi (mỗi đội 1 hàng riêng) ----------
  function nextQ(t) {
    if (!t.order.length) t.order = shuffle(questions.map((_, k) => k));
    const q = questions[t.order.shift()];
    t.cur = { q, answers: shuffle(q.answers.map(a => ({ text: a.text, correct: !!a.correct }))) };
    const c = cols[t.i];
    c.querySelector(".sr-q").textContent = q.question;
    c.querySelector(".sr-ans").innerHTML = t.cur.answers.map((a, k) => `<button type="button" data-k="${k}"><span>${esc(a.text)}</span></button>`).join("");
    t.lock = false; c.classList.remove("is-locked");
  }
  cols.forEach((c, i) => c.querySelector(".sr-ans").addEventListener("pointerdown", e => { const b = e.target.closest("button"); if (b) { e.preventDefault(); answer(i, +b.dataset.k); } }));

  function answer(i, k) {
    const t = T[i];
    if (G.phase !== "race" || t.lock || G.winner >= 0 || !t.cur) return false;
    const ok = !!t.cur.answers[k]?.correct, btns = cols[i].querySelectorAll(".sr-ans button");
    t.lock = true; cols[i].classList.add("is-locked");
    btns[k]?.classList.add(ok ? "is-ok" : "is-bad");
    if (ok) {
      t.ok++; t.streak++; t.p = Math.min(L, t.p + 1);
      flash(i, "ok"); later(0.55, () => nextQ(t));
      onEvent("correct", { team: i, p: t.p });
    } else {
      t.bad++; t.streak = 0;
      const keep = Math.min(t.p, Math.ceil(t.s / SEG - 1e-3));            // chỉ còn năng lượng chạy NỐT tới vạch đoạn đang chạy dở
      const lost = t.p - keep; t.p = keep;
      t.cur.answers.forEach((a, j) => { if (a.correct) btns[j]?.classList.add("is-reveal"); });
      flash(i, "bad"); later(1.3, () => nextQ(t));
      onEvent("wrong", { team: i, lost });
    }
    return ok;
  }
  function flash(i, kind) { const c = cols[i]; c.classList.remove("fx-ok", "fx-bad"); void c.offsetWidth; c.classList.add("fx-" + kind); }

  // ---------- nhịp trận ----------
  function start() {
    if (G.phase === "count" || G.phase === "race") return false;
    resetTeams(); G.phase = "count"; G.countT = 0;
    mount.classList.add("is-count"); mount.classList.remove("is-menu", "is-end");
    const lights = $$(".sr-lights i"); lights.forEach(l => l.classList.remove("on"));
    for (let k = 0; k < 5; k++) later(0.5 + k * 0.55, () => lights[k].classList.add("on"));
    later(0.5 + 4 * 0.55 + 0.75 + Math.random() * 0.3, go);
    T.forEach(t => { t.order = []; });
    return true;
  }
  function go() {
    G.phase = "race"; mount.classList.remove("is-count"); mount.classList.add("is-race");
    $$(".sr-lights i").forEach(l => l.classList.remove("on"));
    const g = $(".sr-go"); g.classList.remove("pop"); void g.offsetWidth; g.classList.add("pop");
    T.forEach(t => nextQ(t)); G.nextAuto = [G.t + 1 + Math.random() * 2, G.t + 1 + Math.random() * 2];
  }
  function finish(w) {
    G.winner = w; G.endT = G.t; G.phase = "end"; mount.classList.remove("is-race"); mount.classList.add("is-end");
    T.forEach(t => { t.lock = true; }); cols.forEach(c => c.classList.add("is-locked"));
    const b = $(".sr-banner"); b.textContent = TEAMS[w].name + " WINS!"; b.style.setProperty("--team", TEAMS[w].color); b.className = "sr-banner on";
    later(2.6, () => {
      $(".sr-res-title").innerHTML = `<span style="color:${TEAMS[w].color}">${TEAMS[w].name}</span> WINS`;
      $(".sr-res-rows").innerHTML = T.map(t => `<div style="--team:${TEAMS[t.i].color}"><b>${TEAMS[t.i].name}</b><span>${Math.min(L, t.p)} / ${L} segments</span><span>✔ ${t.ok} · ✘ ${t.bad}</span></div>`).join("");
      $(".sr-result").classList.add("on");
    });
    onEvent("end", { winner: w });
  }
  $(".sr-start").addEventListener("click", () => start());
  $(".sr-again").addEventListener("click", () => start());
  mount.classList.add("is-menu");

  // ---------- vật lý xe ----------
  function drive(t, dt) {
    const fin = L * SEG, target = t.p >= L ? fin + 110 : t.p * SEG, rem = target - t.s;
    const vDes = rem > 0 ? Math.min(PHYS.VMAX, Math.sqrt(2 * PHYS.DEC * rem)) : 0;
    let a = 0;
    if (t.v < vDes - 0.01) a = Math.min(PHYS.ACC, (vDes - t.v) / dt);
    else if (t.v > vDes + 0.01) { const need = rem > 0.05 ? t.v * t.v / (2 * rem) : PHYS.HARD * 2; a = -Math.min(Math.max(PHYS.DEC, need), PHYS.HARD); }
    t.v = Math.max(0, t.v + a * dt);
    t.s += t.v * dt; if (t.s >= target) { t.s = target; t.v = 0; }
    t.a = a;
    const hard = clamp((-a - PHYS.DEC * 1.2) / (PHYS.HARD - PHYS.DEC * 1.2), 0, 1);
    t.brake = a < -0.5 ? 0.25 + 0.75 * hard : 0;
    t.boost = lerp(t.boost, a > 0.5 ? clamp(0.35 + (t.p - t.s / SEG) * 0.3, 0, 1) : 0, 1 - Math.exp(-dt * 8));
    const tx = TEAMS[t.i].lanes[t.lane], nx = lerp(t.x, tx, 1 - Math.exp(-dt * 4.5)); t.vx = (nx - t.x) / Math.max(dt, 1e-4); t.x = nx;
    if (hard > 0.15 && t.v > 4) { t.smokeT -= dt; if (t.smokeT <= 0) { t.smokeT = 0.025; [-0.8, 0.8].forEach(o => puff(t.x + o, 0.25, -t.s + 1.3, 0.7 + hard)); } }
    if (G.winner < 0 && t.s >= fin - 0.01 && t.p >= L) finish(t.i);
  }

  // ---------- máy quay ----------
  const cam = { pos: new THREE.Vector3(-9, 3.2, -16), look: new THREE.Vector3(0, 0.8, 0), fov: V.fov[0], k: 0, kh: 0, gap: 0 };
  const want = { pos: new THREE.Vector3(), look: new THREE.Vector3(), fov: 46 };
  let camOverride = null;
  function chaseCam(out) {
    const s0 = Math.min(T[0].s, T[1].s), s1 = Math.max(T[0].s, T[1].s), gap = s1 - s0, mid = (s0 + s1) / 2;
    const k = smooth(0, V.gFull, gap);
    const h = lerp(V.h[0], V.h[1], k), back = lerp(V.back[0], V.back[1], k);
    out.pos.set(Math.sin(G.t * 0.21) * 0.4, h, -s0 + back);
    // nhìn xuống sao cho CẢ 2 xe trong khung: góc chúi = trung bình góc tới xe sau và xe trước (+ lệch nhẹ lên trên khi 2 xe sát nhau để thấy đường phía trước)
    const aRear = Math.atan2(h - 0.7, back), aLead = Math.atan2(h - 0.7, back + gap);
    const pitch = lerp((aRear + aLead) / 2 - 0.05, aRear * 0.5 + aLead * 0.5, k);
    out.look.set(0, h - Math.tan(pitch) * 40, -s0 + back - 40);
    out.fov = lerp(V.fov[0], V.fov[1], k);
    let kh = 0;
    if (V.heli) {
      kh = ease(smooth(V.heli[0], V.heli[1], gap));
      if (kh > 0) {
        const hf = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(out.fov) / 2) * camera.aspect);
        const d = (gap * 0.5 + 25) / (Math.tan(hf / 2) * 0.5);           // chỉ dùng ~½ bề ngang giữa: 2 bên là cột đáp án
        const hp = new THREE.Vector3(d * 0.42, d * 0.9, -mid + 8), hl = new THREE.Vector3(0, 0, -mid);   // trực thăng nhìn dốc xuống: đường nằm ngang giữa màn
        out.pos.lerp(hp, kh); out.look.lerp(hl, kh);
      }
    }
    cam.k = k; cam.kh = kh; cam.gap = gap;
    return out;
  }
  function updateCamera(dt) {
    if (G.phase === "menu") {                                           // màn chờ: trôi chậm trước mũi 2 xe
      const a = G.t * 0.12; want.pos.set(Math.sin(a) * 4 - 6, 3.0 + Math.sin(G.t * 0.3) * 0.3, -15 + Math.cos(a) * 2); want.look.set(0, 0.9, -1); want.fov = 44;
      cam.k = cam.kh = cam.gap = 0;
    } else if (G.phase === "count") {                                   // 3-2-1: bay vòng từ trước mũi ra sau lưng
      const k = ease(clamp(G.countT / 3.4, 0, 1)), c = chaseCam({ pos: new THREE.Vector3(), look: new THREE.Vector3() });
      want.pos.set(-6, 3, -15).lerp(c.pos, k); want.pos.x += Math.sin(k * Math.PI) * -9; want.look.set(0, 0.9, -1).lerp(c.look, k); want.fov = lerp(44, c.fov, k);
    } else if (G.phase === "end" && G.winner >= 0 && G.t - G.endT > 1.4) {   // kết: bám xe thắng
      const w = T[G.winner], a = 0.9 + Math.sin((G.t - G.endT - 1.4) * 0.3 - Math.PI / 2) * 1.0;   // lượn phía PHẢI (phía biển, không vào hàng cây): từ sau lưng ra trước mũi
      want.pos.set(w.x + Math.sin(a) * 10, 4.2, -w.s + Math.cos(a) * 10); want.look.set(w.x, 0.9, -w.s); want.fov = 44;
    } else chaseCam(want);
    if (camOverride) { want.pos.fromArray(camOverride.pos); want.look.fromArray(camOverride.look); if (camOverride.fov) want.fov = camOverride.fov; }
    const kk = 1 - Math.exp(-dt * (G.phase === "count" ? 6 : G.phase === "end" ? 3.5 : 2.4));
    cam.pos.lerp(want.pos, kk); cam.look.lerp(want.look, kk); cam.fov = lerp(cam.fov, want.fov, kk);
    camera.position.copy(cam.pos); camera.lookAt(cam.look);
    if (Math.abs(camera.fov - cam.fov) > 0.01) { camera.fov = cam.fov; camera.updateProjectionMatrix(); }
    // cong thế giới: uốn theo quãng đường; tắt dần khi 2 xe xa nhau (máy quay cao nhìn xa) và ở góc trực thăng
    const S = Math.min(T[0].s, T[1].s), amt = opt.bend * (1 - smooth(60, 220, cam.gap)) * (1 - cam.kh) * (G.phase === "menu" ? 0.6 : 1);
    U.uBend.value.set((0.0009 * Math.sin(S / 230 + 0.6) + 0.0004 * Math.sin(S / 83 + 1.3)) * amt, (0.00012 + 0.0001 * Math.sin(S / 170 + 0.4)) * amt);
    U.uBendZ.value = camera.position.z;
    // máy quay càng cao sương càng lùi xa (góc cao/trực thăng nhìn đường từ xa vẫn rõ)
    const fk = smooth(15, 260, camera.position.y); world.setFog(lerp(140, 700, fk), lerp(1150, 2600, fk)); scene.fog.near = lerp(140, 700, fk); scene.fog.far = lerp(1150, 2600, fk);
  }

  // ---------- HUD ----------
  progTrack.innerHTML = Array.from({ length: L + 1 }, (_, k) => `<i style="left:${k / L * 100}%"></i>`).join("") + TEAMS.map((tm, i) => `<b class="sr-dot${i}" style="--team:${tm.color}">${i + 1}</b>`).join("");
  const dots = [progTrack.querySelector(".sr-dot0"), progTrack.querySelector(".sr-dot1")];
  const meters = cols.map(c => ({ cells: [...c.querySelectorAll(".sr-energy i")], more: c.querySelector(".sr-energy b"), spd: c.querySelector(".sr-speed span") }));
  // nhãn số đội bay trên xe (chiếu toạ độ xe ĐÃ CONG lên màn) — hiện dần khi xe ở xa để máy quay cao vẫn không mất dấu xe dẫn
  const marks = [$(".sr-mark0"), $(".sr-mark1")], MP = new THREE.Vector3();
  function updateMarks() {
    const bx = U.uBend.value.x, by = U.uBend.value.y, cz = U.uBendZ.value;
    T.forEach((t, i) => {
      const z = -t.s, d = Math.min(z - cz, 0); MP.set(t.x + bx * d * d, 2.4 - by * d * d, z);
      const dist = MP.distanceTo(camera.position); MP.project(camera);
      const inView = MP.z < 1 && Math.abs(MP.x) < 1.02 && MP.y > -1.02 && MP.y < 1.1;
      const show = G.phase !== "menu" && inView ? smooth(28, 70, dist) : 0;
      const el = marks[i]; el.style.opacity = show.toFixed(2);
      if (show > 0) { el.style.left = clamp((MP.x + 1) / 2, 0.02, 0.98) * 100 + "%"; el.style.top = clamp((1 - MP.y) / 2, 0.06, 0.97) * 100 + "%"; el.style.setProperty("--sc", lerp(1, 0.8, smooth(80, 400, dist)).toFixed(2)); }
    });
  }
  let hudT = 0;
  function updateHUD(dt) {
    updateMarks();
    T.forEach((t, i) => { dots[i].style.left = clamp(t.s / (L * SEG), 0, 1) * 100 + "%"; });
    hudT -= dt; if (hudT > 0) return; hudT = 0.08;
    T.forEach((t, i) => {
      const e = Math.max(0, t.p - t.s / SEG), m = meters[i];                   // năng lượng còn lại = số đoạn chưa chạy
      m.cells.forEach((c, k) => c.style.setProperty("--f", clamp(e - k, 0, 1).toFixed(3)));
      m.more.textContent = e > 4.02 ? "+" + Math.ceil(e - 4) : "";
      m.spd.textContent = Math.round(t.v * 3.6);
    });
  }

  // ---------- vòng vẽ ----------
  const AR = makeAutoRes({ max: PR_MAX, min: Math.min(0.8, PR_MAX), key: "speedrun-" + view, apply: pr => { renderer.setPixelRatio(pr); fit(true); },
    aa: { on: true, set: on => { const ns = on ? 4 : 0; for (const r of [composer.renderTarget1, composer.renderTarget2]) if (r.samples !== ns) { r.samples = ns; r.dispose(); } } } });
  let W = 0, H = 0;
  function fit(force) {
    const w = mount.clientWidth, h = mount.clientHeight; if (!w || !h || (!force && w === W && h === H)) return;
    W = w; H = h; renderer.setSize(w, h, false); composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    smkM.uniforms.uScale.value = (h * renderer.getPixelRatio()) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
  }
  const ro = new ResizeObserver(() => fit()); ro.observe(mount); fit(true);

  let raf = 0, last = 0, manual = false, dead = false, fpsN = 0, fpsT = 0, fps = 0;
  function frame(dt) {
    G.t += dt;
    if (G.phase === "count") G.countT += dt;
    for (let i = G.queue.length - 1; i >= 0; i--) if (G.queue[i].at <= G.t) { const q = G.queue.splice(i, 1)[0]; q.fn(); }
    if (G.phase === "race" && G.auto) T.forEach((t, i) => {
      if (t.lock || !t.cur || G.t < G.nextAuto[i]) return;
      const ok = Math.random() < G.acc[i], ks = t.cur.answers.map((a, k) => [a.correct, k]).filter(([c]) => c === ok).map(([, k]) => k);
      answer(i, ks.length ? ks[Math.floor(Math.random() * ks.length)] : 0); G.nextAuto[i] = G.t + 1.6 + Math.random() * 3.2;
    });
    if (G.phase === "race" || G.phase === "end") T.forEach(t => drive(t, dt));
    T.forEach((t, i) => { cars[i].rig.position.set(t.x, 0, -t.s); cars[i].update(dt, { dist: t.s, accel: t.a, brake: t.brake, steer: t.vx, boost: t.boost, t: G.t }); });
    tickSmoke(dt);
    updateCamera(dt);
    world.update(camera.position, G.t, Math.min(T[0].s, T[1].s, -camera.position.z), Math.max(T[0].s, T[1].s));
    updateHUD(dt);
  }
  function loop(now) {
    if (dead) return; raf = requestAnimationFrame(loop);
    if (manual) return;
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60); last = now;
    fit(); frame(dt); composer.render(); AR.frame(now);
    fpsN++; if (now - fpsT > 1000) { fps = fpsN; fpsN = 0; fpsT = now; onEvent("fps", fps); }
  }
  raf = requestAnimationFrame(loop);

  // phím thử: A/D đội 1 đổi làn, ←/→ đội 2
  const onKey = e => { const m = { KeyA: [0, -1], KeyD: [0, 1], ArrowLeft: [1, -1], ArrowRight: [1, 1] }[e.code]; if (m) lane(m[0], m[1]); };
  window.addEventListener("keydown", onKey);
  function lane(i, dir) {                                    // dir −1 = sang trái, +1 = sang phải (trong 2 làn của đội)
    const t = T[i], ls = TEAMS[i].lanes, cur = ls[t.lane], other = ls[1 - t.lane];
    if (Math.sign(other - cur) === Math.sign(dir)) t.lane = 1 - t.lane; return t.lane;
  }

  const api = {
    start, answer: (i, ok) => { const t = T[i]; if (!t.cur) return false; const k = t.cur.answers.findIndex(a => !!a.correct === !!ok); return answer(i, k < 0 ? 0 : k); },
    auto(on = true, a0, a1) { G.auto = on; if (a0 != null) G.acc[0] = a0; if (a1 != null) G.acc[1] = a1; },
    lane, give(i, n = 1) { T[i].p = Math.min(L, T[i].p + n); },     // bàn thử: nạp thẳng n đoạn
    step(n = 1, dt = 1 / 60) { manual = true; for (let k = 0; k < n; k++) frame(dt); fit(true); composer.render(); },
    resume() { manual = false; last = 0; },
    state: () => ({ phase: G.phase, t: +G.t.toFixed(2), winner: G.winner, L, teams: T.map(t => ({ p: t.p, s: +t.s.toFixed(2), v: +t.v.toFixed(2), kmh: Math.round(t.v * 3.6), lane: t.lane, x: +t.x.toFixed(2), ok: t.ok, bad: t.bad, energy: +(t.p - t.s / SEG).toFixed(2), lock: t.lock })) }),
    camInfo: () => ({ gap: +cam.gap.toFixed(1), k: +cam.k.toFixed(3), kh: +cam.kh.toFixed(3), y: +camera.position.y.toFixed(2), z: +camera.position.z.toFixed(2), x: +camera.position.x.toFixed(2), fov: +camera.fov.toFixed(1), bend: [U.uBend.value.x, U.uBend.value.y] }),
    cam(o) { camOverride = o || null; },
    get fps() { return fps; }, get res() { return AR.info; },
    renderer, scene, camera, G, T,
    destroy() {
      if (dead) return; dead = true; cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener("keydown", onKey);
      cars.forEach(c => c.dispose()); world.dispose(); smkG.dispose(); smkM.dispose();
      composer.dispose(); rt.dispose(); pmrem.dispose(); scene.environment?.dispose();
      renderer.dispose(); renderer.forceContextLoss(); mount.innerHTML = ""; mount.classList.remove("sr-root", "is-menu", "is-count", "is-race", "is-end");
      if (window.__sr === api) delete window.__sr;
    }
  };
  return api;
}
