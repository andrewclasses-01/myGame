// STAR LOOT — INTRO (mẫu 1q, 29/9/2026). Chép mc3d-intro-1p.js + ý thầy:
//   • Màn START chỉ còn tên STAR LOOT + nút START (thiên hà + hạm đội đậu phía sau).
//   • Bỏ vệt sáng toàn màn khi đổi không gian. Thay bằng: tàu bay chầm chậm ở vùng đầu ⇒ khung CẢNH BÁO (ENEMY LOCATED · POSITION: tên
//     act · TARGET: số từ) hiện lâu cho đọc rõ ⇒ tàu lao dần đi, máy quay chuyển êm từ góc rộng ra SAU LƯNG tàu ⇒ tàu xuyên 3 LỖ GIUN
//     (đĩa xoáy mở ra phía trước; chạm vào là trắng chói loà rồi hiện ra ở vùng khác: xanh ngọc ⇒ đỏ cam có lỗ đen ⇒ căn cứ địch).
//   • Tới nơi: máy quay lùi ra góc rộng, bụng tàu mở, robot nhảy ra, bụng đóng lại; máy quay nhìn toàn cảnh robot bay xuống gầm mê cung.
//   • Máy quay lướt êm về sát boong: robot trồi lên QUAY LƯNG (thấy ANDREW TEAM trên ba lô) ⇒ quay mặt lại ⇒ lùi về góc chơi ⇒ vào game.
//   Mọi góc máy chuyển chậm, không cắt. Bấm ĐÚP để bỏ qua. ?robots=2 xem thử thả 2 robot (Fight).
// Không thêm ĐÈN mới. Lỗ giun / bụi sao / hành tinh vẽ thử dưới màn đen lúc tải trang.
import * as THREE from "three";

const V3 = THREE.Vector3;
const clamp01 = x => Math.max(0, Math.min(1, x));
const seg = (T, a, b) => clamp01((T - a) / (b - a));
const eio = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eo = t => 1 - Math.pow(1 - t, 3);
const rnd = (a, b) => a + Math.random() * (b - a);
const lerp = (a, b, k) => a + (b - a) * k;

function cv(w, h, draw) { const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const glowTex = () => cv(64, 64, (g, s) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.3, "rgba(255,255,255,.55)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
// thiên hà xoắn ốc: lõi vàng trắng, cánh tay xanh/hồng, bụi tối xen giữa
function galaxyTex(core, arm1, arm2, arms = 3) {
  return cv(1024, 1024, (g, S) => {
    const c = S / 2;
    let gr = g.createRadialGradient(c, c, 0, c, c, S * 0.46); gr.addColorStop(0, `rgba(${core},0.95)`); gr.addColorStop(0.08, `rgba(${core},0.55)`); gr.addColorStop(0.35, `rgba(${arm1},0.12)`); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 14000; i++) {
      const arm = i % arms, r = Math.pow(Math.random(), 0.75) * S * 0.46, th = arm * Math.PI * 2 / arms + r / (S * 0.46) * 5.2 + rnd(-0.35, 0.35) * (1 - r / (S * 0.5) * 0.6);
      const x = c + Math.cos(th) * r, y = c + Math.sin(th) * r, k = r / (S * 0.46);
      const col = k < 0.2 ? core : Math.random() < 0.55 ? arm1 : arm2;
      g.fillStyle = `rgba(${col},${(0.25 + Math.random() * 0.5) * (1 - k * 0.6)})`; const sz = Math.random() < 0.04 ? 3 : 1.4; g.fillRect(x, y, sz, sz);
    }
    for (let i = 0; i < 90; i++) { const th = rnd(0, 6.28), r = rnd(0.1, 0.42) * S, x = c + Math.cos(th) * r, y = c + Math.sin(th) * r, rr = rnd(8, 26); const gg = g.createRadialGradient(x, y, 0, x, y, rr); gg.addColorStop(0, `rgba(${Math.random() < 0.5 ? arm1 : arm2},0.35)`); gg.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gg; g.fillRect(x - rr, y - rr, 2 * rr, 2 * rr); }
  });
}
function bandTex(cols) {
  return cv(512, 256, (g, w, h) => {
    for (let y = 0; y < h; y++) { const k = y / h, i = Math.floor((Math.sin(k * 23 + Math.sin(k * 7) * 2) * 0.5 + 0.5) * (cols.length - 0.001)); g.fillStyle = cols[i]; g.fillRect(0, y, w, 1); }
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? "255,255,255" : "0,0,0"},${rnd(0.03, 0.09)})`; g.fillRect(rnd(0, w), rnd(0, h), rnd(30, 180), rnd(2, 8)); }
  });
}
function ringTex(inner, outer) {
  return cv(512, 16, (g, w, h) => { for (let x = 0; x < w; x++) { const k = x / w; g.fillStyle = `rgba(${k < 0.5 ? inner : outer},${(0.25 + 0.6 * Math.abs(Math.sin(k * 40))) * Math.sin(k * Math.PI)})`; g.fillRect(x, 0, 1, h); } });
}

// bầu trời mỗi thiên hà: nền (dưới, trên) · tinh vân 1 · tinh vân 2 · dải sáng — ENEMY = màu trời của game (điểm kết)
const SKIES = {
  home:  [[0.02, 0.02, 0.07], [0.08, 0.05, 0.2], [0.6, 0.12, 0.62], [0.05, 0.42, 0.66], [0.95, 0.55, 0.3]],
  teal:  [[0.01, 0.035, 0.05], [0.03, 0.12, 0.15], [0.06, 0.52, 0.42], [0.2, 0.34, 0.75], [0.35, 0.85, 0.6]],
  ember: [[0.06, 0.012, 0.02], [0.17, 0.04, 0.05], [0.75, 0.2, 0.08], [0.55, 0.36, 0.08], [0.95, 0.45, 0.2]],
  enemy: [[0.035, 0.02, 0.09], [0.11, 0.04, 0.22], [0.42, 0.10, 0.55], [0.08, 0.22, 0.55], [0.6, 0.25, 0.7]],
};

export function createIntro(ctx) {
  const { scene, fleet, snd } = ctx;
  let T = 0, active = false, cues = [], onDone = null, menuOn = false, menuT = 0, prep = 0, galaxy = "home";

  // ---------------- lớp chữ điện ảnh
  const ov = document.createElement("div"); ov.className = "mc-cine black";
  ov.innerHTML = `<i class="cine-bar t"></i><i class="cine-bar b"></i>
    <div class="cine-alert"><div class="al-h"><i>▲</i>ENEMY LOCATED</div><div class="al-l">POSITION: <b></b></div><div class="al-l">TARGET: <b></b></div></div>
    <div class="cine-pre"><span>ANDREW STUDIO</span><em>PRESENTS</em></div>
    <div class="cine-title"><b data-t="STAR LOOT">STAR LOOT</b><i></i></div>
    <div class="cine-skip">Double-click to skip</div><i class="cine-flash"></i><i class="cine-fade"></i>`;
  ctx.stage.appendChild(ov);
  const $ = s => ov.querySelector(s);
  $(".cine-title i").textContent = ctx.subtitle || "";
  const on = (sel, c, v = true) => (sel === ".mc-cine" ? ov : $(sel)).classList.toggle(c, v);
  function flash(k = 1, long = false) { const f = $(".cine-flash"); f.style.setProperty("--k", k); f.classList.remove("go"); f.classList.toggle("long", long); void f.offsetWidth; f.classList.add("go"); }
  const al = $(".cine-alert"), alL = [...ov.querySelectorAll(".cine-alert .al-h, .cine-alert .al-l")];   // 1q: khung cảnh báo

  // ---------------- bầu trời
  function setSky(name) {
    galaxy = name; const s = SKIES[name], u = ctx.sky.uniforms;
    ["uB0", "uB1", "uN1", "uN2", "uBand"].forEach((k, i) => u[k].value.setRGB(...s[i]));
  }

  // ---------------- cảnh vật mỗi thiên hà (xa: đi theo máy quay; gần: đứng yên để thấy thị sai)
  const gTex = glowTex();
  const farG = new THREE.Group(); scene.add(farG);                    // đi theo máy quay (vô cực)
  const addGal = (tex, pos, size, rot, tint) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, color: new THREE.Color(...tint) }));
    m.position.copy(pos); m.rotation.set(...rot); m.renderOrder = -5; farG.add(m); return m;
  };
  const planetMat = (tex, rough = 0.8) => new THREE.MeshStandardMaterial({ map: tex, roughness: rough, metalness: 0, envMapIntensity: 0.25 });
  const rimMat = col => new THREE.ShaderMaterial({ ...ctx.atmo, uniforms: { uColor: { value: new THREE.Color(col) } }, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  function planet(r, tex, col, pos, ring) {
    const g = new THREE.Group(); g.position.copy(pos);
    const p = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 32), planetMat(tex)); g.add(p);
    const a = new THREE.Mesh(new THREE.SphereGeometry(r * 1.06, 48, 32), rimMat(col)); g.add(a);
    if (ring) { const rg = new THREE.Mesh(new THREE.RingGeometry(r * 1.35, r * 2.3, 96, 1), new THREE.MeshBasicMaterial({ map: ringTex(ring[0], ring[1]), transparent: true, side: THREE.DoubleSide, depthWrite: false }));
      const uv = rg.geometry.attributes.uv, pp = rg.geometry.attributes.position; for (let i = 0; i < uv.count; i++) { const d = Math.hypot(pp.getX(i), pp.getY(i)); uv.setXY(i, (d - r * 1.35) / (r * 0.95), 0.5); }
      rg.rotation.x = -Math.PI / 2 + 0.35; rg.rotation.y = 0.2; g.add(rg); }
    g.userData.spin = p; return g;
  }
  // HOME: thiên hà xoắn lớn trước mặt + 3 hành tinh nhiều màu
  const home = new THREE.Group(); scene.add(home);
  const homeFar = [addGal(galaxyTex("255,240,210", "140,190,255", "255,140,220"), new V3(60, 190, 980), 900, [0.45, 0.2, 0.4], [1.5, 1.5, 1.6]),
    addGal(galaxyTex("255,230,190", "255,160,120", "180,140,255", 2), new V3(460, -60, 900), 320, [0.1, -0.5, -0.9], [1.1, 1.1, 1.2])];
  home.add(planet(120, bandTex(["#6d3fb8", "#9b59d0", "#e59bd6", "#f3c4a0", "#7a3ca8"]), 0xd58cff, new V3(380, -40, 1380), ["255,210,170", "200,160,255"]));
  home.add(planet(46, bandTex(["#2f8fc9", "#6ad0e8", "#e9f7ff", "#3a78c2"]), 0x8fe3ff, new V3(-300, 150, 1300)));
  home.add(planet(22, bandTex(["#c9612f", "#e8a15a", "#f5d18a", "#9c4424"]), 0xffb07a, new V3(-190, -30, 1080)));
  // TEAL: hành tinh vành đai khổng lồ + vệ tinh
  const teal = new THREE.Group(); scene.add(teal); teal.visible = false;
  const tealFar = [addGal(galaxyTex("220,255,240", "90,230,200", "120,170,255"), new V3(260, 120, 960), 760, [0.2, -0.3, 0.9], [1.3, 1.4, 1.4])];
  teal.add(planet(170, bandTex(["#1f6f6a", "#39a58f", "#9fe0c4", "#2c8f86", "#dff5e6"]), 0x7affd8, new V3(-420, -120, 1420), ["210,255,235", "140,210,255"]));
  teal.add(planet(28, bandTex(["#b8c4d8", "#e6ecf5", "#8e9bb3"]), 0xcfe3ff, new V3(-150, 90, 1150)));
  // EMBER: lỗ đen với đĩa bồi tụ cam vàng
  const ember = new THREE.Group(); scene.add(ember); ember.visible = false;
  const emberFar = [addGal(galaxyTex("255,220,170", "255,120,60", "255,200,90"), new V3(-300, 60, 950), 700, [-0.3, 0.4, 0.2], [1.3, 1.1, 1.0])];
  const bh = new THREE.Group(); bh.position.set(260, 70, 1380); ember.add(bh);
  bh.add(new THREE.Mesh(new THREE.SphereGeometry(60, 40, 24), new THREE.MeshBasicMaterial({ color: 0x000000 })));
  const disk = new THREE.Mesh(new THREE.RingGeometry(70, 210, 128, 1), new THREE.MeshBasicMaterial({ map: cv(512, 16, (g, w, h) => { for (let x = 0; x < w; x++) { const k = x / w; g.fillStyle = `rgba(255,${Math.round(210 - 150 * k)},${Math.round(120 - 110 * k)},${Math.pow(1 - k, 1.4) * (0.6 + 0.4 * Math.abs(Math.sin(k * 60)))})`; g.fillRect(x, 0, 1, h); } }),
    transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, color: new THREE.Color(2.2, 1.6, 1.2) }));
  { const uv = disk.geometry.attributes.uv, pp = disk.geometry.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (Math.hypot(pp.getX(i), pp.getY(i)) - 70) / 140, 0.5); }
  disk.rotation.x = -Math.PI / 2 + 0.28; bh.add(disk);
  const bhGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: gTex, color: new THREE.Color(2.4, 1.2, 0.5), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); bhGlow.scale.setScalar(380); bh.add(bhGlow);
  ember.add(planet(34, bandTex(["#5a1f14", "#8c3a1c", "#c2622a", "#3b140e"]), 0xff7a3a, new V3(-200, -70, 1180)));
  const SETS = { home: [home, homeFar], teal: [teal, tealFar], ember: [ember, emberFar] };
  function showSet(name) { Object.entries(SETS).forEach(([k, [g, far]]) => { const v = k === name; g.visible = v; far.forEach(m => { m.visible = v; }); }); }


  // ---------------- LỖ GIUN: đĩa xoáy sáng (shader) + quầng sáng — mở ra phía trước, tàu lao vào ⇒ chói loà ⇒ sang vùng khác
  const PORTAL_FS = `uniform float uT, uI, uOpen; uniform vec3 uA, uB; varying vec2 vUv;
    void main() {
      vec2 p = vUv * 2.0 - 1.0; float r = length(p) / max(uOpen, 0.001); if (r > 1.0) discard;
      float a = atan(p.y, p.x), lr = log(r + 0.03);
      float s1 = sin(a * 4.0 + lr * 9.0 - uT * 4.2) * 0.5 + 0.5, s2 = sin(a * 7.0 - lr * 15.0 + uT * 2.6) * 0.5 + 0.5;
      float rim = smoothstep(0.72, 0.96, r) * (1.0 - smoothstep(0.96, 1.0, r));
      float core = pow(max(0.0, 1.0 - r * 1.25), 3.2);
      vec3 c = mix(uB, uA, s1) * (0.25 + 0.95 * s1 * s2) * (0.35 + 0.8 * r);
      c += uA * rim * 1.8 + vec3(1.0, 0.97, 0.94) * core * 1.4;
      gl_FragColor = vec4(c * uI * smoothstep(1.0, 0.86, r), 1.0);
    }`;
  const PORTAL_VS = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
  function makePortal(a, b) {
    const g = new THREE.Group(); g.visible = false; scene.add(g);
    const m = new THREE.ShaderMaterial({ vertexShader: PORTAL_VS, fragmentShader: PORTAL_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: { uT: { value: 0 }, uI: { value: 1 }, uOpen: { value: 1 }, uA: { value: new THREE.Color(...a) }, uB: { value: new THREE.Color(...b) } } });
    const disk = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), m); disk.scale.setScalar(250); g.add(disk);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: gTex, color: new THREE.Color(...a).multiplyScalar(0.8), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    halo.scale.setScalar(330); g.add(halo);
    return { g, m, halo };
  }
  const portals = [makePortal([0.35, 0.8, 1.4], [0.45, 0.2, 0.9]), makePortal([0.4, 1.3, 0.95], [0.9, 0.45, 0.15]), makePortal([1.4, 0.55, 0.25], [0.75, 0.15, 0.7])];

  // ---------------- bụi sao lấp lánh quanh tàu lúc bay nhanh (cho thấy tốc độ; KHÔNG phải vệt sáng toàn màn)
  const ND = 360, dPos = new Float32Array(ND * 3);
  const dGeo = new THREE.BufferGeometry(); dGeo.setAttribute("position", new THREE.BufferAttribute(dPos, 3));
  const dMat = new THREE.PointsMaterial({ map: gTex, size: 2.6, color: new THREE.Color(0.75, 0.85, 1.0), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  const dust = new THREE.Points(dGeo, dMat); dust.frustumCulled = false; dust.visible = false; scene.add(dust);
  const dustSeed = (i, zc, near) => dPos.set([rnd(-260, 260), rnd(-120, 200), zc + (near ? rnd(-80, 520) : rnd(360, 560))], i * 3);
  let dustK = 0;
  function tickDust(zc) {
    dust.visible = dustK > 0.01; dMat.opacity = dustK; if (!dust.visible) return;
    for (let i = 0; i < ND; i++) if (dPos[i * 3 + 2] < zc - 90) dustSeed(i, zc, false);
    dGeo.attributes.position.needsUpdate = true;
  }
  function resetDust(zc) { for (let i = 0; i < ND; i++) dustSeed(i, zc, true); dGeo.attributes.position.needsUpdate = true; }

  // ---------------- hạm đội hộ tống (bản sao tàu ANDREW CLASSES, nhỏ hơn) + cửa khoang dưới bụng tàu mẹ
  const escorts = [[-46, -6, -40, 0.62], [46, -10, -52, 0.62], [0, 20, -90, 0.5]].map(([x, y, z, k]) => {
    const g = fleet.group.clone(true); g.visible = false; g.children[0].scale.setScalar(47 * k); scene.add(g); return { g, off: new V3(x, y, z), k };
  });
  const body = fleet.group.children[0];
  const hangar = new THREE.Group(); hangar.position.set(0.02, -0.0262, 0); hangar.visible = false; body.add(hangar);
  const hglow = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.032), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.2, 2.2, 2.8), toneMapped: false, side: THREE.DoubleSide }));
  hglow.rotation.x = Math.PI / 2; hangar.add(hglow);
  const leafM = new THREE.MeshStandardMaterial({ color: 0x5b6069, metalness: 0.6, roughness: 0.45 });
  const leaves = [-1, 1].map(s => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.002, 0.034), leafM); l.position.set(s * 0.0125, -0.0012, 0); hangar.add(l); return { l, s }; });

  // ---------------- hạt (lửa phản lực ba lô)
  const parts = Array.from({ length: 160 }, () => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: gTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    s.visible = false; scene.add(s); return { s, life: 0, max: 1, v: new V3(), s0: 1, s1: 1, c0: new THREE.Color(), c1: new THREE.Color(), a: 1, drag: 0 };
  });
  let pi = 0;
  function emit(pos, vel, life, s0, s1, c0, c1, a = 1, drag = 1) {
    const p = parts[pi++ % parts.length]; p.s.position.copy(pos); p.v.copy(vel); p.life = 0; p.max = life; p.s0 = s0; p.s1 = s1; p.c0.setRGB(...c0); p.c1.setRGB(...c1); p.a = a; p.drag = drag; p.s.visible = true;
  }
  function tickParts(dt) {
    for (const p of parts) {
      if (!p.s.visible) continue; p.life += dt; const k = p.life / p.max; if (k >= 1) { p.s.visible = false; continue; }
      p.v.multiplyScalar(Math.exp(-p.drag * dt)); p.s.position.addScaledVector(p.v, dt);
      p.s.scale.setScalar(p.s0 + (p.s1 - p.s0) * Math.sqrt(k)); p.s.material.color.copy(p.c0).lerp(p.c1, k); p.s.material.opacity = p.a * (1 - k);
    }
  }

  // ---------------- robot bay bằng phản lực (đội hình: robot mình + đồng đội nếu Fight)
  const tv = new V3(), tv2 = new V3(), tv3 = new V3();
  function flyPose(R, pos, vel, t) {
    const g = R.g; g.visible = true; g.position.copy(pos); g.scale.setScalar(1.75);
    tv.copy(vel).normalize(); tv2.copy(pos).add(tv); g.up.set(0, 1, 0); g.lookAt(tv2);    // +z của robot hướng theo đường bay
    R.body.rotation.set(1.05 + 0.08 * Math.sin(t * 3), 0, 0.12 * Math.sin(t * 1.7)); R.body.position.y = 0;   // nằm rạp kiểu siêu nhân, đầu dẫn
    R.legs[0].rotation.x = 0.25 + 0.1 * Math.sin(t * 5); R.legs[1].rotation.x = 0.35 - 0.1 * Math.sin(t * 5);
    R.arms[0].rotation.x = 0.5; R.arms[1].rotation.x = 0.5; R.arms[0].rotation.z = -0.35; R.arms[1].rotation.z = 0.35;
    R.jets.forEach(j => { j.material.emissiveIntensity = 6; });
    R.g.updateMatrixWorld(true);
    R.jets.forEach(j => {
      j.getWorldPosition(tv3); tv2.set(0, -1, 0).transformDirection(R.body.matrixWorld);
      for (let i = 0; i < 2; i++) emit(tv3, tv2.clone().multiplyScalar(rnd(10, 18)).addScaledVector(vel, 0.5), rnd(0.14, 0.28), 0.3, 0.95, [2.6, 2.0, 1.2], [1.2, 0.3, 0.05], 0.85, 2);
    });
  }

  // ---------------- tiện ích
  const cp = new V3(), cl = new V3(), wp = new V3(), wl = new V3(), hp = new V3(), hl = new V3();
  const setCam = (p, l, fov, roll = 0) => ctx.setCam(p, l, fov, roll);
  const curve = pts => new THREE.CatmullRomCurve3(pts, false, "centripetal");
  const at = (t, fn) => cues.push({ t, fn, done: false });
  const shipAt = (x, y, z, out) => fleet.group.localToWorld(out.set(x, y, z));
  const FWD = new V3(0, 0, 1), BACK = new V3(0, 0, -1);
  function placeFleet(pos, fwd, bank, speed, pow, show = true) {
    fleet.cine.set(pos, fwd, bank, speed); fleet.cine.power(pow);
    escorts.forEach(e => { e.g.visible = show; e.g.quaternion.copy(fleet.group.quaternion); e.g.position.copy(pos).add(tv.copy(e.off).applyQuaternion(fleet.group.quaternion)); });
  }
  // vị trí hạm đội ở màn chờ
  const MENU = { ship: new V3(-20, 34, 860), cam: new V3(70, 66, 560), look: new V3(-10, 70, 1300) };

  // ============================================================== KỊCH BẢN (giây) — chậm, êm, không cắt cảnh
  const AL = 3.9, AL_OUT = 9.6;                       // cảnh báo ENEMY LOCATED: hiện 3.9 ⇒ tắt 9.6 (đủ lâu để đọc)
  const ACC = 9.4, CH0 = 10.2, CH1 = 13.6;            // tàu lao đi · máy quay chuyển dần từ góc rộng ra SAU LƯNG tàu
  const JS = [14.6, 17.9, 21.2];                      // 3 lần xuyên lỗ giun (lần 3 = tới căn cứ địch)
  const J3 = JS[2], WIDE0 = J3 + 0.9, WIDE1 = J3 + 4.0;  // tới nơi: máy quay rộng dần ra
  const HOPEN = [J3 + 2.6, J3 + 3.5], DROP = J3 + 3.7, HCLOSE = [DROP + 1.0, DROP + 1.9];
  const UNDER = DROP + 4.8, DECK0 = UNDER - 1.1, DECK1 = UNDER + 1.3, RISE = UNDER + 1.1;
  const TURN = RISE + 2.9, BACKOUT = TURN + 1.5, DUR = BACKOUT + 3.6;
  const O = () => ctx.overview;
  let S = null, flight = [], seg0 = 0, deckPos = new V3(), deckLook = new V3();
  // đường bay của tàu trong từng vùng không gian (vị trí z theo thời gian) — lỗ giun đặt đúng chỗ tàu sẽ tới
  const shipZ = (T) => {
    if (T < JS[0]) { const a = Math.max(0, T - ACC); return MENU.ship.z + 4 * T + 8 * a * a; }
    const t = T - (T < JS[1] ? JS[0] : JS[1]); return 780 + 84 * t + 5 * t * t;
  };
  function setupCues() {
    cues = [];
    const A = ctx.act, N = ctx.target;
    at(0.0, () => { snd.rumble(3.4, 0.24); snd.engine(4.0, 0.1, 0.1, 50, 62); on(".mc-cine", "bars"); snd.braam(0.2, 43.65, 0.22); });
    at(0.5, () => on(".cine-pre", "in"));
    at(3.1, () => on(".cine-pre", "out"));
    at(AL, () => { al.classList.add("in"); alL[0].classList.add("on"); snd.siren && snd.siren(1.6, 0.05); snd.beep(1500); snd.beep(1500, 0.14); snd.beep(1500, 0.28); });
    at(AL + 1.0, () => { alL[1].querySelector("b").textContent = A; alL[1].classList.add("on"); snd.beep(1100); });
    at(AL + 1.9, () => { alL[2].querySelector("b").textContent = `${N} WORDS`; alL[2].classList.add("on"); snd.beep(1100); snd.beep(900, 0.12); });
    at(AL_OUT, () => { al.classList.add("out"); });
    at(ACC - 0.2, () => { snd.rumble(4.5, 0.3); snd.engine(4.5, 0.14, 0, 45, 90); snd.whoosh(3.5, 0.12, 0.6, 200, 1400, -0.3, 0.3); });
    JS.forEach((j, i) => {
      at(j - 2.6, () => { snd.riser && snd.riser(2.2, 0.06); });
      at(j - 0.9, () => snd.warp());
      at(j - 0.1, () => { flash(1, true); ctx.shake(0.35); });
      if (i === 2) at(j + 0.3, () => snd.braam(0.05, 38.9, 0.26));
    });
    at(HOPEN[0], () => { hangar.visible = true; snd.clank(); snd.hiss(1.1, 0.12); });
    at(DROP - 0.02, () => buildFlight());                         // đường bay dựng lúc nhảy (tàu mẹ đã treo trên trạm)
    at(DROP, () => { snd.jet(4.6); snd.whoosh(3.0, 0.2, 0.2, 300, 2600, -0.6, 0.6); });
    at(HCLOSE[0], () => { snd.clank(); snd.servo && snd.servo(); });
    at(RISE, () => { ctx.robot.rise(1.05, deckPos); ctx.teammate.rise(1.05, deckPos); });
    at(TURN, () => { snd.servo && snd.servo(); });
    at(BACKOUT + 0.5, () => { on(".cine-title", "slam"); flash(0.6); snd.impact(0, 0.9); snd.shimmer(0.05); });
    at(BACKOUT + 0.6, () => { fleet.cine.power(2); snd.engine(2.4, 0.1, 0, 60, 110); });
    at(DUR - 0.8, () => { on(".cine-title", "out"); on(".mc-cine", "bars", false); });
  }
  function buildFlight() {                                           // đường bay của robot: từ cửa khoang ⇒ lượn rộng ⇒ sát mép boong ⇒ luồn xuống dưới
    const st = ctx.start(), sx = st.x, sz = st.z, D2 = ctx.D / 2;
    const h0 = shipAt(0.02 * fleet.cine.sc, -0.03 * fleet.cine.sc, 0, new V3());
    const mk = (dx) => curve([h0.clone().add(new V3(dx, 0, 0)), h0.clone().add(new V3(dx + 3, -9, 4)), new V3(sx + 36 + dx, 34, sz + 40), new V3(sx + 22 + dx, 16, sz + 46),
      new V3(sx + 6 + dx, 3, D2 + 8), new V3(sx + dx * 0.4, -3.5, D2 - 2), new V3(sx + dx * 0.3, -5.5, sz + 2)]);
    flight = [mk(0)]; if (ctx.teammate.on) flight.push(mk(-6));
  }
  function tickShip(T) {
    if (T < JS[0]) {                                                  // vùng 1: bay chầm chậm ⇒ lao dần đi, hơi ngóc lên
      const a = Math.max(0, T - ACC), k = seg(T, ACC, JS[0]);
      placeFleet(tv.set(MENU.ship.x, MENU.ship.y + 0.7 * a * a + Math.sin(T * 0.6) * 0.8, shipZ(T)), tv2.set(0, 0.06 * k, 1), 0.03 * Math.sin(T * 0.8), 4 + 16 * a, 0.5 + 1.3 * eio(k));
    } else if (T < J3) {                                              // vùng 2, 3: vừa thoát lỗ giun, lao tiếp tới lỗ giun sau
      const t = T - (T < JS[1] ? JS[0] : JS[1]);
      placeFleet(tv.set(-20 + 6 * Math.sin(t * 0.9), 40 + 3 * Math.sin(t * 0.7), shipZ(T)), FWD, 0.07 * Math.sin(t * 0.9 + 0.5), 84 + 10 * t, 1.8);
    } else {                                                          // tới căn cứ địch: hãm dần, treo trên trạm rồi bỏ đi
      const t = T - J3, go = Math.max(0, T - BACKOUT - 0.6), z = 20 + 440 * Math.exp(-t * 0.75) - 26 * go * go;
      placeFleet(tv.set(-6, 60 + 16 * Math.exp(-t), z), BACK, 0.05 * Math.sin(t * 0.7), 330 * Math.exp(-t * 0.75), go > 0 ? 2 : 1 + Math.exp(-t * 2));
    }
  }
  function tickPortals(T, dt) {
    portals.forEach((p, i) => {
      const j = JS[i], t0 = j - 2.7, on_ = T >= t0 && T < j + 0.12; p.g.visible = on_; if (!on_) return;
      p.g.position.set(i === 0 ? MENU.ship.x : -20 + 6 * Math.sin((j - (i === 1 ? JS[0] : JS[1])) * 0.9), (i === 0 ? MENU.ship.y + 0.7 * Math.pow(j - ACC, 2) : 40) + 6, shipZ(j - 1e-3));
      p.m.uniforms.uT.value += dt;
      p.m.uniforms.uOpen.value = eo(seg(T, t0, t0 + 1.4));
      p.m.uniforms.uI.value = 0.9 + 2.6 * Math.pow(seg(T, j - 0.7, j), 2);
      p.g.rotation.z += dt * 0.6; p.halo.material.opacity = 0.32 * p.m.uniforms.uOpen.value;
    });
  }
  function chasePose(outP, outL) { const sc = fleet.cine.sc; shipAt(-1.3 * sc, 0.33 * sc, 0, outP); shipAt(1.25 * sc, 0.06 * sc, 0, outL); }
  function tickCam(T) {
    const o = O(), st = ctx.start();
    if (T < CH1) {                                                    // góc rộng (như màn chờ, trôi chậm, ngắm dần theo tàu) ⇒ chuyển dần ra sau lưng tàu
      wp.copy(MENU.cam).add(tv.set(Math.sin(T * 0.07) * 6 + 1.2 * T, Math.sin(T * 0.11) * 2, 3 * T));
      wl.copy(MENU.look).lerp(fleet.group.position, 0.3 * seg(T, 1, 9));
      const k = eio(seg(T, CH0, CH1));
      if (k > 0) { chasePose(hp, hl); wp.lerp(hp, k); wl.lerp(hl, k); }
      setCam(wp, wl, 44 + 4 * k, -0.02 * (1 - k));
    } else if (T < WIDE0) {                                           // sau lưng tàu, xuyên các lỗ giun
      chasePose(cp, cl); setCam(cp, cl, 48 + 3 * seg(T, JS[0] - 0.6, JS[0]) * (1 - seg(T, JS[0], JS[0] + 0.5)), 0.02 * Math.sin(T * 0.7));
    } else if (T < DECK0) {                                           // tới nơi: lùi ra góc rộng — thấy tàu treo trên trạm, bụng mở, robot bay xuống
      if (!S) { chasePose(cp, cl); S = { p: cp.clone(), l: cl.clone() }; }
      const k = eio(seg(T, WIDE0, WIDE1)), f = seg(T, WIDE1, DECK0);
      wp.set(104 - 22 * f, 40 - 11 * f, 48 - 6 * f);                  // đứng NGANG bên trạm: tàu mẹ hãm lại ngang khung, thấy cả tàu lẫn mặt trạm
      wl.set(-2, 31 - 10 * f, 6);
      if (flight.length && T > DROP) wl.lerp(ctx.astro.g.position, 0.45 * eio(seg(T, DROP, DROP + 1.2)));
      chasePose(hp, hl); hp.lerp(wp, k); hl.lerp(wl, k); cp.copy(hp); cl.copy(hl); setCam(cp, cl, lerp(48, 50, k), 0);
    } else if (T < BACKOUT) {                                         // lướt êm về sát boong ô xuất phát — robot trồi lên quay lưng, rồi quay mặt
      if (!S.deck) {
        S.deck = curve([cp.clone(), new V3(st.x + 22, 12, st.z + 34), deckPos.clone()]);
        S.deckL = curve([cl.clone(), new V3(st.x + 2, 2, st.z + 4), deckLook.clone()]);
      }
      const u = eio(seg(T, DECK0, DECK1)), push = eio(seg(T, DECK1, BACKOUT));
      S.deck.getPoint(u, cp); S.deckL.getPoint(u, cl);
      cp.add(tv.set(-0.4 * push, 0.2 * push, -0.6 * push)); cl.y += 0.5 * seg(T, RISE, RISE + 1.8);
      setCam(cp, cl, lerp(50, 40, u), 0);
    } else {                                                          // lùi dần về góc chơi
      if (!S.back) { S.back = curve([cp.clone(), new V3(st.x + 7, 10, st.z + 22), o.pos.clone()]); S.backL = curve([cl.clone(), new V3(st.x, 1, st.z - 2), o.look.clone()]); }
      const u = eio(seg(T, BACKOUT, DUR - 0.2)); S.back.getPoint(u, cp); S.backL.getPoint(u, cl); setCam(cp, cl, lerp(40, o.fov, u), 0);
    }
  }

  // ---------------- màn chờ: thiên hà + hạm đội đậu, lửa nhỏ, máy quay trôi rất chậm
  function menuTick(dt) {
    menuT += dt;
    placeFleet(tv.copy(MENU.ship).setY(MENU.ship.y + Math.sin(menuT * 0.6) * 0.8), FWD, 0.02 * Math.sin(menuT * 0.4), 2, 0.45);
    cp.copy(MENU.cam).add(tv2.set(Math.sin(menuT * 0.07) * 6, Math.sin(menuT * 0.11) * 2, 0)); setCam(cp, MENU.look, 44, 0);
    farG.position.copy(cp);
    spinPlanets(dt);
  }
  const spinPlanets = dt => [home, teal, ember].forEach(g => g.children.forEach(p => { if (p.userData.spin) p.userData.spin.rotation.y += dt * 0.02; }));
  function resetAlert() { al.classList.remove("in", "out"); alL.forEach(l => l.classList.remove("on")); }

  const api = {
    get active() { return active; },
    // ---- màn chờ (gọi lúc tải trang + mỗi lần về màn chờ)
    menu() {
      active = false; menuOn = true; cues = []; setSky("home"); showSet("home");
      ctx.prepMap(); ctx.useMap();                                    // map câu 1 dựng SẴN ở màn chờ (trạm khuất sau lưng máy quay) ⇒ lúc tới căn cứ không khựng
      fleet.cine.begin(2.0); escorts.forEach(e => { e.g.visible = true; }); hangar.visible = false; portals.forEach(p => { p.g.visible = false; }); dustK = 0; dust.visible = false;
      ov.hidden = false; ov.classList.remove("bars", "fadein"); resetAlert(); ["in", "out"].forEach(c => $(".cine-pre").classList.remove(c)); ["slam", "out"].forEach(c => $(".cine-title").classList.remove(c));
      on(".cine-skip", "hide", true);
      menuTick(0);
    },
    start(done) {
      onDone = done; active = true; menuOn = false; T = 0; S = null; ov.hidden = false; ov.classList.remove("black", "fadein"); on(".cine-skip", "hide", false);
      flight = []; seg0 = 0; resetAlert(); setupCues();
      const st = ctx.start(); deckPos.set(st.x + 2.8, 2.9, st.z + 9.0); deckLook.set(st.x, 1.5, st.z);
    },
    update(dt) {
      if (prep < 3) {                                                 // 3 khung đầu lúc tải: vẽ thử cảnh TỚI CĂN CỨ (tàu mẹ + hộ tống trên trạm, máy quay sau lưng) — đo: không làm thì khựng 70 ms lúc tới nơi
        prep++; setSky("enemy"); showSet("none");
        portals.forEach(p => { p.g.visible = false; });
        placeFleet(tv.set(-6, 60 + 16 * Math.exp(-0.3), 20 + 440 * Math.exp(-0.2)), BACK, 0, 300, 1.5); chasePose(cp, cl); setCam(cp, cl, 48, 0);
        farG.position.copy(cp); return;
      }
      if (prep < 6) {                                                 // 3 khung tiếp: mọi cảnh vật các thiên hà hiện trước máy quay để trình duyệt dịch shader, dưới màn đen
        prep++; if (prep === 4) { setSky("home"); showSet("home"); }
        const all = [home, teal, ember, ...homeFar, ...tealFar, ...emberFar]; all.forEach(o => { o.visible = true; });
        hangar.visible = true; for (let i = 0; i < 4; i++) emit(MENU.ship, new V3(), 0.1, 1, 1, [1, 1, 1], [1, 1, 1], 0.01);
        portals.forEach((p, i) => { p.g.visible = true; p.g.position.set(MENU.ship.x + i * 40, MENU.ship.y, MENU.ship.z + 200); });
        dustK = 0.01; resetDust(MENU.ship.z); dust.visible = true;
        if (prep === 6) { hangar.visible = false; portals.forEach(p => { p.g.visible = false; }); dustK = 0; dust.visible = false; showSet("home"); ov.classList.remove("black"); ov.classList.add("fadein"); }
        menuTick(dt); return;
      }
      if (menuOn) { menuTick(dt); return; }
      if (!active) return;
      T += dt;
      for (const c of cues) if (!c.done && c.t <= T) { c.done = true; c.fn(); }
      // xuyên lỗ giun: đổi vùng không gian đúng lúc màn hình trắng loá
      if (T >= JS[0] + 0.15 && galaxy === "home") { setSky("teal"); showSet("teal"); resetDust(780); }
      if (T >= JS[1] + 0.15 && galaxy === "teal") { setSky("ember"); showSet("ember"); resetDust(780); }
      if (T >= J3 + 0.15 && galaxy === "ember") { setSky("enemy"); showSet("none"); }
      tickShip(T);
      tickPortals(T, dt);
      dustK = galaxy === "enemy" ? 0 : 0.85 * seg(T, ACC + 0.5, ACC + 2.5);
      // cửa khoang: hai lá trượt mở ⇒ robot nhảy ⇒ đóng lại
      const open = eo(seg(T, HOPEN[0], HOPEN[1])) * (1 - eio(seg(T, HCLOSE[0], HCLOSE[1])));
      leaves.forEach(({ l, s }) => { l.position.x = s * (0.0125 + 0.026 * open); });
      if (T > HCLOSE[1] && hangar.visible) hangar.visible = false;
      // robot bay
      if (T >= DROP && T < UNDER && flight.length) {
        const u = eio(seg(T, DROP, UNDER)) * 0.35 + seg(T, DROP, UNDER) * 0.65;
        ctx.robot.free(true);
        flight.forEach((f, i) => { const R = i === 0 ? ctx.astro : ctx.teammate.model; const p = f.getPointAt(u), v = f.getTangentAt(Math.min(0.999, u)).multiplyScalar(26); flyPose(R, p, v, T + i); if (p.y < -2.4) R.g.visible = false; });
      } else if (T >= UNDER && T < RISE) { ctx.astro.g.visible = false; if (ctx.teammate.model) ctx.teammate.model.g.visible = false; }
      if (T >= TURN && T < BACKOUT + 0.5) { const k = eio(seg(T, TURN, TURN + 1.3)); ctx.robot.turn(k); ctx.teammate.turn(k); }
      tickCam(Math.min(T, DUR));
      farG.position.copy(camera().position);
      tickDust(camera().position.z);
      tickParts(dt); spinPlanets(dt);
      if (T >= DUR) api.finish();
    },
    finish() {
      const cb = onDone; active = false; hangar.visible = false; ov.hidden = true; dustK = 0; dust.visible = false; portals.forEach(p => { p.g.visible = false; });
      escorts.forEach(e => { e.g.visible = false; }); fleet.cine.end(); ctx.clearCam(); ctx.robot.free(false);
      parts.forEach(p => { p.s.visible = false; });
      cb && cb();
    },
    skip() {                                                           // bấm đúp: nhảy tới cuối — robot đứng sẵn ở ô xuất phát
      if (!active) return; snd.stop();
      if (galaxy !== "enemy") { setSky("enemy"); showSet("none"); }
      ctx.robot.place(); ctx.teammate.clear(); api.finish();
    },
    abort() { if (!active) return; snd.stop(); active = false; ov.hidden = true; dustK = 0; dust.visible = false; portals.forEach(p => { p.g.visible = false; }); escorts.forEach(e => { e.g.visible = false; }); fleet.cine.end(); ctx.clearCam(); ctx.robot.free(false); ctx.teammate.clear(); setSky("enemy"); showSet("none"); },
    get times() { return { AL, ACC, CH0, CH1, JS, DROP, UNDER, RISE, TURN, BACKOUT, DUR }; },
  };
  const camera = () => ctx.camera;
  window.__intro = { api, dbg: () => ({ D: ctx.D, st: ctx.start(), ov: ctx.overview, T, ship: fleet.group.position.clone(), robot: ctx.astro.g.position.clone(), cam: camera().position.clone() }) };   // móc thử
  return api;
}
