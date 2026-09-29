// STAR LOOT (tên cũ Maze Chase 3D) — INTRO CỐT TRUYỆN (mẫu 1p, 29/9/2026). Thầy chọn bản A (hạm đội đến) rồi đổi cốt truyện:
//   robot của ta thuộc HẠM ĐỘI ANDREW CLASSES, ở trên tàu ANDREW CLASSES cùng đồng đội, tới căn cứ địch để thu CHIẾN LỢI PHẨM (các từ đúng).
//   • Màn START: cả một thiên hà bao la, nhiều hành tinh, màu lung linh (khung đầu của intro nhưng đứng yên) — bấm START mới chạy.
//   • "ANDREW STUDIO PRESENTS" · hạm đội xuyên qua NHIỀU THIÊN HÀ (nhảy siêu tốc), tìm ra trạm vũ trụ của địch (= mê cung).
//   • Robot NHẢY ra khỏi tàu (cửa khoang dưới bụng), bay bằng động cơ phản lực ở hộp sau lưng, lượn rồi luồn xuống DƯỚI mê cung.
//     Đấu đơn: 1 robot · đấu Fight: 2 robot (game chưa có Fight ⇒ xem thử bằng ?robots=2).
//   • Máy quay lướt sát boong tới ô xuất phát: nắp mở, robot được đẩy lên từ dưới sàn ⇒ máy quay lùi dần về góc chơi ⇒ vào game NGAY chỗ đó.
//   Mọi cảnh nối liền, không cắt (các lần nhảy siêu tốc có chớp sáng che chỗ đổi thiên hà). Bấm ĐÚP để bỏ qua.
// Không thêm ĐÈN mới. Hành tinh/thiên hà/lỗ đen/vệt siêu tốc/tàu hộ tống dựng sẵn và vẽ thử dưới màn đen lúc tải trang.
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
  ov.innerHTML = `<i class="cine-bar t"></i><i class="cine-bar b"></i><div class="cine-hud"></div>
    <div class="cine-pre"><span>ANDREW STUDIO</span><em>PRESENTS</em></div>
    <div class="cine-title"><b data-t="STAR LOOT">STAR LOOT</b><i></i></div>
    <div class="cine-skip">Double-click to skip</div><i class="cine-flash"></i><i class="cine-fade"></i>`;
  ctx.stage.appendChild(ov);
  const $ = s => ov.querySelector(s);
  $(".cine-title i").textContent = ctx.subtitle || "";
  const on = (sel, c, v = true) => (sel === ".mc-cine" ? ov : $(sel)).classList.toggle(c, v);
  function flash(k = 1) { const f = $(".cine-flash"); f.style.setProperty("--k", k); f.classList.remove("go"); void f.offsetWidth; f.classList.add("go"); }
  function hudLine(text, cls = "") { const d = document.createElement("div"); d.className = "cine-line " + cls; d.textContent = text; $(".cine-hud").appendChild(d); }

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

  // ---------------- vệt siêu tốc (nhiều nét sáng quanh máy quay, lao về phía sau)
  const NS = 520, sPos = new Float32Array(NS * 6), sDat = [];
  for (let i = 0; i < NS; i++) sDat.push({ a: rnd(0, 6.28), r: 6 + Math.pow(Math.random(), 0.6) * 60, z: -rnd(5, 400) });
  const sGeo = new THREE.BufferGeometry(); sGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
  const sMat = new THREE.LineBasicMaterial({ color: new THREE.Color(1.6, 1.9, 2.6), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  const streaks = new THREE.LineSegments(sGeo, sMat); streaks.frustumCulled = false; streaks.renderOrder = 20; scene.add(streaks);
  let warpK = 0;                                                      // 0 = tắt · 1 = hết cỡ
  function tickStreaks(dt, camPos, camQ) {
    streaks.visible = warpK > 0.01; if (!streaks.visible) return;
    streaks.position.copy(camPos); streaks.quaternion.copy(camQ);
    const sp = 60 + 900 * warpK, len = 2 + 70 * warpK * warpK;
    for (let i = 0; i < NS; i++) {
      const d = sDat[i]; d.z += sp * dt; if (d.z > 4) { d.z = -rnd(250, 420); d.a = rnd(0, 6.28); }
      const x = Math.cos(d.a) * d.r, y = Math.sin(d.a) * d.r;
      sPos.set([x, y, d.z, x, y, d.z - len], i * 6);
    }
    sGeo.attributes.position.needsUpdate = true; sMat.opacity = Math.min(1, warpK * 1.4);
  }

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

  // ---------------- hạt (lửa phản lực ba lô, khói)
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
  const q0 = new THREE.Quaternion(), mtx = new THREE.Matrix4(), UP = new V3(0, 1, 0), tv = new V3(), tv2 = new V3(), tv3 = new V3();
  function flyPose(R, pos, vel, t) {
    const g = R.g; g.visible = true; g.position.copy(pos); g.scale.setScalar(1.75);
    tv.copy(vel).normalize(); tv2.copy(pos).add(tv); g.up.set(0, 1, 0); g.lookAt(tv2);    // +z của robot hướng theo đường bay
    R.body.rotation.set(1.05 + 0.08 * Math.sin(t * 3), 0, 0.12 * Math.sin(t * 1.7)); R.body.position.y = 0;   // nằm rạp kiểu siêu nhân, đầu dẫn
    R.legs[0].rotation.x = 0.25 + 0.1 * Math.sin(t * 5); R.legs[1].rotation.x = 0.35 - 0.1 * Math.sin(t * 5);
    R.arms[0].rotation.x = 0.5; R.arms[1].rotation.x = 0.5; R.arms[0].rotation.z = -0.35; R.arms[1].rotation.z = 0.35;
    R.jets.forEach(j => { j.material.emissiveIntensity = 6; });
    // lửa phụt ra từ 2 miệng ba lô, theo trục "xuống" của thân robot
    R.g.updateMatrixWorld(true);
    R.jets.forEach(j => {
      j.getWorldPosition(tv3); tv2.set(0, -1, 0).transformDirection(R.body.matrixWorld);
      for (let i = 0; i < 2; i++) emit(tv3, tv2.clone().multiplyScalar(rnd(10, 18)).addScaledVector(vel, 0.5), rnd(0.14, 0.28), 0.3, 0.95, [2.6, 2.0, 1.2], [1.2, 0.3, 0.05], 0.85, 2);
    });
  }

  // ---------------- tiện ích
  const cp = new V3(), cl = new V3();
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

  // ============================================================== KỊCH BẢN (giây)
  const J1 = 3.3, J2 = 6.0, J3 = 8.4, DROP = 12.2, UNDER = 15.1, RISE = 15.2, BACKOUT = 16.5, DUR = 18.7;
  const O = () => ctx.overview;
  let S = null, flight = [], shipPath = null;
  function setupCues() {
    cues = [];
    at(0.0, () => { snd.rumble(3.4, 0.28); snd.engine(3.5, 0.13, 0.1, 50, 70); on(".mc-cine", "bars"); snd.braam(0.2, 43.65, 0.24); });
    at(0.4, () => on(".cine-pre", "in"));
    at(2.9, () => on(".cine-pre", "out"));
    at(J1 - 0.9, () => snd.warp());
    at(J1 + 0.05, () => { flash(0.95); ctx.shake(0.4); });
    at(J2 - 0.9, () => snd.warp());
    at(J2 + 0.05, () => { flash(0.95); ctx.shake(0.4); });
    at(J3 - 0.9, () => snd.warp());
    at(J3 + 0.05, () => { flash(1); ctx.shake(0.5); snd.braam(0.1, 38.9, 0.3); });
    at(J3 + 0.6, () => { hudLine("TARGET LOCATED", "ok"); snd.beep(1400); snd.beep(1400, 0.12); });
    at(J3 + 1.3, () => { hudLine("ENEMY BASE · SECTOR 7"); snd.beep(1100); });
    at(J3 + 2.0, () => { hudLine("LOOT: WORDS DETECTED", "blink"); snd.beep(900); snd.beep(900, 0.1); });
    at(DROP - 1.4, () => { on(".cine-hud", "out"); hangar.visible = true; snd.clank(); snd.hiss(1.1, 0.12); });
    at(DROP - 0.02, () => buildFlight());                         // đường bay dựng lúc nhảy (tàu mẹ đã treo trên trạm)
    at(DROP, () => { snd.jet(3.0); snd.whoosh(2.6, 0.22, 0.2, 300, 2600, -0.6, 0.6); });
    at(RISE, () => { ctx.robot.rise(1.5); ctx.teammate.rise(1.5); });
    at(BACKOUT + 0.35, () => { on(".cine-title", "slam"); flash(0.7); snd.impact(0, 0.9); snd.shimmer(0.05); });
    at(BACKOUT + 0.4, () => { fleet.cine.power(2); snd.engine(2.2, 0.1, 0, 60, 110); });
    at(DUR - 0.7, () => { on(".cine-title", "out"); on(".mc-cine", "bars", false); });
  }
  function buildFlight() {                                           // đường bay của robot: từ cửa khoang ⇒ lượn ⇒ sát mép boong ⇒ luồn xuống dưới
    const st = ctx.start(), sx = st.x, sz = st.z, D2 = ctx.D / 2;
    const h0 = shipAt(0.02 * fleet.cine.sc, -0.03 * fleet.cine.sc, 0, new V3());
    const mk = (dx) => curve([h0.clone().add(new V3(dx, 0, 0)), h0.clone().add(new V3(dx + 2, -7, 3)), new V3(sx + 30 + dx, 30, sz + 44), new V3(sx + 14 + dx, 12, sz + 36),
      new V3(sx + 4 + dx, 2.2, D2 + 5), new V3(sx + dx * 0.4, -3.5, D2 - 2), new V3(sx + dx * 0.3, -5.5, sz + 2)]);
    flight = [mk(0)]; if (ctx.teammate.on) flight.push(mk(-6));
  }
  function tickShip(T) {
    if (T < J1) {                                                    // đậu rồi tăng tốc lao vào thiên hà
      const d = 10 * T * T; placeFleet(tv.copy(MENU.ship).setZ(MENU.ship.z + d + 1.5 * Math.sin(T)), FWD, 0.03 * Math.sin(T * 0.8), 20 * T, 0.5 + 1.2 * seg(T, 0.4, J1));
    } else if (T < J2) {                                             // thiên hà xanh ngọc: hạm đội thoát siêu tốc từ sau lưng máy quay, lướt qua
      const t = T - J1; placeFleet(tv.set(-26, 36, 520 + 520 * (1 - Math.exp(-t * 1.6))), FWD, -0.12 * Math.exp(-t), 832 * Math.exp(-t * 1.6), 1.2 + 0.8 * Math.exp(-t * 2));
    } else if (T < J3) {                                             // thiên hà đỏ cam: bay ngang qua lỗ đen
      const t = T - J2; placeFleet(tv.set(40 - 30 * t, 44, 700 + 90 * t), tv2.set(-0.25, 0, 1).normalize(), 0.1, 90, 1.4);
    } else {                                                         // tới căn cứ địch: thoát siêu tốc, hãm dần, treo trên trạm rồi bỏ đi
      const t = T - J3, z = 20 + 520 * Math.exp(-t * 1.05) - (T > BACKOUT + 0.4 ? 26 * Math.pow(T - BACKOUT - 0.4, 2) : 0);
      placeFleet(tv.set(-6, 60 + 16 * Math.exp(-t), z), BACK, 0.05 * Math.sin(t * 0.7), 546 * Math.exp(-t * 1.05), T > BACKOUT + 0.4 ? 2 : 1 + Math.exp(-t * 2));
    }
  }
  function tickCam(T, dt) {
    const o = O();
    if (T < J1) {                                                    // S1: sau lưng hạm đội, nhìn về thiên hà; đẩy nhẹ theo
      const u = seg(T, 0, J1); cp.copy(MENU.cam).lerp(tv.set(58, 60, 610), eio(u)); cl.copy(MENU.look);
      setCam(cp, cl, 44 - 6 * u, -0.03 * u);
    } else if (T < J2) {                                             // S2: máy quay đứng, hạm đội thoát siêu tốc lướt qua bên trái
      const u = seg(T, J1, J2); cp.set(30, 46, 690 + 40 * u); cl.copy(fleet.group.position).lerp(tv.set(-60, 30, 1300), 0.35); setCam(cp, cl, 50, 0.04);
    } else if (T < J3) {                                             // S3: bám song song mạn tàu, lỗ đen phía sau
      shipAt(0.05 * fleet.cine.sc, 0.12 * fleet.cine.sc, 0.55 * fleet.cine.sc, cp); shipAt(0.35 * fleet.cine.sc, 0, -0.2 * fleet.cine.sc, cl);
      setCam(cp, cl, 48, 0.06);
    } else if (T < DROP - 1.5) {                                     // S4: tới căn cứ — tàu lướt qua đầu máy quay, trạm hiện dần
      const u = seg(T, J3, DROP - 1.5); cp.set(24 - 6 * u, 36 - 6 * u, 330 - 120 * u); cl.set(-4, 26 - 16 * u, 0); setCam(cp, cl, 46 - 4 * u, -0.04 + 0.04 * u);
    } else if (T < DROP) {                                           // S5: lại gần bụng tàu — cửa khoang mở
      if (!S) S = { p: cp.clone(), l: cl.clone() };
      const u = eio(seg(T, DROP - 1.5, DROP)), h = shipAt(0.02 * fleet.cine.sc, -0.03 * fleet.cine.sc, 0, tv3.clone());
      cp.copy(S.p).lerp(tv.copy(h).add(tv2.set(18, -12, 22)), u); cl.copy(S.l).lerp(h, u); setCam(cp, cl, 44 - 4 * u, 0);
    } else if (T < RISE && flight.length) {                          // S6: bám theo robot bay (sau lưng, hơi cao), rồi lướt sát boong tới ô xuất phát
      const u = seg(T, DROP, UNDER), st = ctx.start();
      const p = flight[0].getPointAt(Math.min(1, u)), v = flight[0].getTangentAt(Math.min(0.999, u));
      const chase = tv.copy(p).addScaledVector(v, -9).add(tv2.set(0, 3.2, 0));
      const deck = tv2.set(st.x + 3, 2.6, st.z + 8.5);
      const k = eio(seg(u, 0.62, 1));                                 // robot luồn xuống dưới mép boong ⇒ máy quay ở lại trên boong, lướt tới ô xuất phát
      cp.copy(chase).lerp(deck, k); cp.y = Math.max(cp.y, 2.2);
      cl.copy(p).addScaledVector(v, 5).lerp(tv3.set(st.x, 0.6, st.z), k);
      setCam(cp, cl, 52 - 10 * k, 0.12 * Math.sin(T * 1.3) * (1 - k));
    } else if (T < BACKOUT) {                                        // S7: sát boong — nắp mở, robot được đẩy lên
      const st = ctx.start(), u = seg(T, RISE, BACKOUT); cp.set(st.x + 3 - 0.8 * u, 2.6 + 0.4 * u, st.z + 8.5 - 0.8 * u); cl.set(st.x, 0.6 + 1.6 * u, st.z); setCam(cp, cl, 42, 0);
    } else {                                                         // S8: lùi dần về góc chơi
      if (!S.back) { S.back = curve([cp.clone(), new V3(ctx.start().x + 6, 10, ctx.start().z + 20), o.pos.clone()]); S.backL = curve([cl.clone(), new V3(ctx.start().x, 1, ctx.start().z - 2), o.look.clone()]); }
      const u = eio(seg(T, BACKOUT, DUR - 0.2)); S.back.getPoint(u, cp); S.backL.getPoint(u, cl); setCam(cp, cl, lerp(42, o.fov, u), 0);
    }
  }

  // ---------------- màn chờ: thiên hà + hạm đội đậu, lửa nhỏ, máy quay trôi rất chậm
  function menuTick(dt) {
    menuT += dt;
    placeFleet(tv.copy(MENU.ship).setY(MENU.ship.y + Math.sin(menuT * 0.6) * 0.8), FWD, 0.02 * Math.sin(menuT * 0.4), 2, 0.45);
    cp.copy(MENU.cam).add(tv2.set(Math.sin(menuT * 0.07) * 6, Math.sin(menuT * 0.11) * 2, 0)); setCam(cp, MENU.look, 44, 0);
    farG.position.copy(cp);
    home.children.forEach(p => { if (p.userData.spin) p.userData.spin.rotation.y += dt * 0.02; });
  }

  let prepHold = 0;
  const api = {
    get active() { return active; },
    // ---- màn chờ (gọi lúc tải trang + mỗi lần về màn chờ)
    menu() {
      active = false; menuOn = true; cues = []; setSky("home"); showSet("home");
      ctx.prepMap(); ctx.useMap();                                    // map câu 1 dựng SẴN ở màn chờ (trạm khuất sau lưng máy quay) ⇒ lúc tới căn cứ không khựng
      fleet.cine.begin(2.0); escorts.forEach(e => { e.g.visible = true; }); hangar.visible = false;
      ov.hidden = false; ov.classList.remove("bars", "fadein"); $(".cine-hud").innerHTML = ""; ["in", "out"].forEach(c => $(".cine-pre").classList.remove(c)); ["slam", "out"].forEach(c => $(".cine-title").classList.remove(c));
      on(".cine-skip", "hide", true);
      menuTick(0);
    },
    start(done) {
      onDone = done; active = true; menuOn = false; T = 0; S = null; ov.hidden = false; ov.classList.remove("black", "fadein"); on(".cine-skip", "hide", false);
      flight = []; setupCues();
    },
    update(dt) {
      if (prep < 3) {                                                 // 3 khung đầu lúc tải: mọi cảnh vật hiện trước máy quay để trình duyệt dịch shader, dưới màn đen
        prep++;
        const all = [home, teal, ember, ...homeFar, ...tealFar, ...emberFar]; all.forEach(o => { o.visible = true; });
        warpK = 1; hangar.visible = true; for (let i = 0; i < 4; i++) emit(MENU.ship, new V3(), 0.1, 1, 1, [1, 1, 1], [1, 1, 1], 0.01);
        tickStreaks(0.016, camera().position, camera().quaternion);
        if (prep === 3) { warpK = 0; hangar.visible = false; showSet("home"); ov.classList.remove("black"); ov.classList.add("fadein"); }
        menuTick(dt); return;
      }
      if (menuOn) { menuTick(dt); tickStreaks(dt, camera().position, camera().quaternion); return; }
      if (!active) return;
      T += dt;
      for (const c of cues) if (!c.done && c.t <= T) { c.done = true; c.fn(); }
      // nhảy siêu tốc: vệt sáng dâng lên trước mỗi mốc, đổi thiên hà đúng lúc chớp sáng
      const w = (j) => seg(T, j - 0.9, j) * (1 - seg(T, j, j + 0.45));
      warpK = Math.max(w(J1), w(J2), w(J3));
      if (T >= J1 && galaxy === "home") { setSky("teal"); showSet("teal"); }
      if (T >= J2 && galaxy === "teal") { setSky("ember"); showSet("ember"); }
      if (T >= J3 && galaxy === "ember") { setSky("enemy"); showSet("none"); }
      tickShip(T);
      // cửa khoang: hai lá trượt ra
      const open = eo(seg(T, DROP - 1.3, DROP - 0.6)); leaves.forEach(({ l, s }) => { l.position.x = s * (0.0125 + 0.026 * open); });
      // robot bay
      if (T >= DROP && T < UNDER && flight.length) {
        const u = seg(T, DROP, UNDER);
        ctx.robot.free(true);
        flight.forEach((f, i) => { const R = i === 0 ? ctx.astro : ctx.teammate.model; const p = f.getPointAt(u), v = f.getTangentAt(Math.min(0.999, u)).multiplyScalar(30); flyPose(R, p, v, T + i); if (p.y < -2.4) R.g.visible = false; });
      } else if (T >= UNDER && T < RISE) { ctx.astro.g.visible = false; if (ctx.teammate.model) ctx.teammate.model.g.visible = false; }
      tickCam(Math.min(T, DUR), dt);
      farG.position.copy(camera().position);
      tickStreaks(dt, camera().position, camera().quaternion);
      tickParts(dt);
      if (T >= DUR) api.finish();
    },
    finish() {
      const cb = onDone; active = false; warpK = 0; streaks.visible = false; hangar.visible = false; ov.hidden = true;
      escorts.forEach(e => { e.g.visible = false; }); fleet.cine.end(); ctx.clearCam(); ctx.robot.free(false);
      parts.forEach(p => { p.s.visible = false; });
      cb && cb();
    },
    skip() {                                                           // bấm đúp: nhảy tới cuối — robot đứng sẵn ở ô xuất phát
      if (!active) return; snd.stop();
      if (galaxy !== "enemy") { setSky("enemy"); showSet("none"); }
      ctx.robot.place(); ctx.teammate.clear(); api.finish();
    },
    abort() { if (!active) return; snd.stop(); active = false; warpK = 0; streaks.visible = false; ov.hidden = true; escorts.forEach(e => { e.g.visible = false; }); fleet.cine.end(); ctx.clearCam(); ctx.robot.free(false); ctx.teammate.clear(); setSky("enemy"); showSet("none"); },
  };
  const camera = () => ctx.camera;
  return api;
}
