// MAZE CHASE 3D — TÀU VŨ TRỤ BAY QUA XA XA (mẫu 1i, 29/9/2026). Thầy: "thỉnh thoảng có một con tàu vũ trụ xa xa bay qua chầm chậm, thiết kế
// đẹp, có khói lửa đẩy, các bộ phận cực kỳ chi tiết, phong cách Star Wars (ảnh Star Destroyer), slogan ANDREW CLASSES khắc trên thân,
// chữ sáng đèn, thỉnh thoảng nhấp nháy rẹt rẹt như chập điện". Thầy chốt: ~45–60 s một chiếc.
// Dáng: thân hình nêm (mũi nhọn, đuôi rộng, sống lưng dốc dần về mũi) · đai hông tối có hàng cửa sổ sáng · ~1400 khối chi tiết (greeble)
// phủ mặt boong · thượng tầng bậc thang + cổ tháp + đài chỉ huy + 2 vòm cầu · 3 động cơ lớn + 4 nhỏ: lõi xanh trắng, lửa, vệt khói.
// Dựng ở chiều dài 1 rồi phóng to; đường bay tính theo máy quay: dải trời phía trên trạm, sau trạm (xa hơn trạm).
import * as THREE from "three";

const rnd = (a, b) => a + Math.random() * (b - a);
function tex(w, h, draw, srgb = true) {
  const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

export function createShip(scene, camera, opts = {}) {
  const LEN = opts.length ?? 120, DIST = opts.dist ?? 260, CROSS_S = opts.cross ?? 24;
  const HW = 0.31, HT = 0.075, HB = 0.05;                          // nửa bề ngang đuôi · chiều cao sống lưng ở đuôi · bụng
  const hc = x => HT * (0.5 - x);                                    // chiều cao sống lưng tại x (mũi 0 → đuôi HT)
  const hw = x => HW * (0.5 - x);                                    // nửa bề ngang tại x
  const ship = new THREE.Group(); ship.visible = false; scene.add(ship);
  const body = new THREE.Group(); body.scale.setScalar(LEN); ship.add(body);

  // ---- vỏ: tấm thép nhiều sắc xám + đường ghép + rãnh (map + bump)
  const plating = tex(1024, 512, (g, w, h) => {
    g.fillStyle = "#8f959e"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { const v = 120 + Math.floor(Math.random() * 60); g.fillStyle = `rgb(${v},${v + 3},${v + 8})`; g.fillRect(Math.random() * w, Math.random() * h, rnd(8, 70), rnd(6, 34)); }
    g.strokeStyle = "rgba(40,44,52,.55)"; g.lineWidth = 1;
    for (let x = 0; x < w; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y < h; y += 12) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.fillStyle = "rgba(30,33,40,.8)"; for (let i = 0; i < 40; i++) g.fillRect(Math.random() * w, Math.random() * h, rnd(40, 200), 3);   // rãnh dài
    g.fillStyle = "#5c626c"; g.fillRect(0, h / 2 - 5, w, 10);                                                                           // sống lưng
  });
  const hullMat = new THREE.MeshStandardMaterial({ map: plating, bumpMap: plating, bumpScale: 0.9, color: 0x7a8089, metalness: 0.5, roughness: 0.68, side: THREE.DoubleSide, flatShading: true });
  {
    const N = [0.5, 0, 0], RL = [-0.5, 0, -HW], RR = [-0.5, 0, HW], T = [-0.5, HT, 0], B = [-0.5, -HB, 0];
    const tris = [[N, T, RL], [N, RR, T], [N, RL, B], [N, B, RR], [RL, T, RR], [RL, RR, B]];
    const pos = [], uv = [];
    tris.forEach(t => t.forEach(p => { pos.push(...p); uv.push(p[0] + 0.5, (p[2] + HW) / (2 * HW)); }));
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.computeVertexNormals(); body.add(new THREE.Mesh(g, hullMat));
  }
  // ---- đai hông tối (rãnh giữa) — tấm tam giác dày, hơi rộng hơn thân
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2c3038, metalness: 0.6, roughness: 0.5 });
  {
    const s = new THREE.Shape(); s.moveTo(0.505, 0); s.lineTo(-0.5, -HW * 1.03); s.lineTo(-0.5, HW * 1.03); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.012, bevelEnabled: false }); g.rotateX(Math.PI / 2); g.translate(0, 0.004, 0);
    body.add(new THREE.Mesh(g, darkMat));
  }
  // ---- chi tiết phủ boong (instanced): khối thấp nghiêng theo mặt dốc, nhiều sắc xám; dày hơn về phía đuôi
  const box = new THREE.BoxGeometry(1, 1, 1);
  const GN = 2400;
  const greeb = new THREE.InstancedMesh(box, new THREE.MeshStandardMaterial({ metalness: 0.5, roughness: 0.55 }), GN);
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _c = new THREE.Color();
  let gi = 0;
  const addBox = (x, y, z, sx, sy, sz, rx = 0, shade = rnd(0.28, 0.52)) => {
    if (gi >= GN) return;
    _q.setFromEuler(_e.set(rx, 0, 0)); _m.compose(_p.set(x, y, z), _q, _s.set(sx, sy, sz)); greeb.setMatrixAt(gi, _m);
    greeb.setColorAt(gi, _c.setRGB(shade, shade * 1.01, shade * 1.05)); gi++;
  };
  for (let i = 0; i < 1900; i++) {
    const x = 0.5 - Math.pow(Math.random(), 0.7) * 0.98;          // dày về đuôi
    const w = hw(x) * 0.96, z = rnd(-w, w), top = hc(x) * (1 - Math.abs(z) / Math.max(1e-4, hw(x)));
    const slope = Math.atan2(hc(x), hw(x)) * Math.sign(z);
    const sy = rnd(0.001, 0.005);
    addBox(x, top + sy * 0.4, z, rnd(0.002, 0.013), sy, rnd(0.002, 0.009), slope);
  }
  for (let i = 0; i < 26; i++) { const x = rnd(-0.1, 0.42); addBox(x, hc(x) + 0.004, 0, rnd(0.01, 0.04), 0.008, 0.012, 0, 0.45); }   // chi tiết dọc sống lưng
  // ---- thượng tầng bậc thang + cổ tháp + đài chỉ huy + 2 vòm cầu
  const supMat = new THREE.MeshStandardMaterial({ map: plating, color: 0x878d96, metalness: 0.45, roughness: 0.6, flatShading: true });
  const tiers = [[-0.34, 0.27, 0.05, 0.23, 0.07], [-0.37, 0.2, 0.036, 0.17, 0.11], [-0.395, 0.15, 0.03, 0.12, 0.14], [-0.41, 0.1, 0.024, 0.085, 0.165]];
  tiers.forEach(([x, sx, sy, sz, y]) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), supMat); m.position.set(x, y, 0); body.add(m);
    for (let k = 0; k < 60; k++) addBox(x + rnd(-sx / 2, sx / 2) * 0.95, y + sy / 2 + 0.0015, rnd(-sz / 2, sz / 2) * 0.95, rnd(0.003, 0.011), rnd(0.0015, 0.006), rnd(0.002, 0.009));
    for (let k = 0; k < 18; k++) addBox(x + rnd(-sx / 2, sx / 2), y + rnd(-sy / 3, sy / 3), (Math.random() < 0.5 ? -1 : 1) * (sz / 2 + 0.002), rnd(0.006, 0.02), rnd(0.003, 0.01), 0.004, 0, 0.4);
  });
  { const neck = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.05, 0.024), supMat); neck.position.set(-0.43, 0.2, 0); body.add(neck);
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.02, 0.17), supMat); bridge.position.set(-0.43, 0.233, 0); body.add(bridge);
    const bwin = new THREE.Mesh(new THREE.BoxGeometry(0.002, 0.004, 0.14), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.9, 1.3), toneMapped: false }));
    bwin.position.set(-0.402, 0.235, 0); body.add(bwin);
    for (const z of [-0.06, 0.06]) {
      const st = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.006, 0.02, 8), supMat); st.position.set(-0.435, 0.252, z); body.add(st);
      const d = new THREE.Mesh(new THREE.SphereGeometry(0.017, 20, 14), new THREE.MeshStandardMaterial({ color: 0xc9ced6, metalness: 0.5, roughness: 0.45 })); d.position.set(-0.435, 0.268, z); body.add(d);
    }
    for (let k = 0; k < 40; k++) addBox(-0.43 + rnd(-0.027, 0.027), 0.244, rnd(-0.08, 0.08), rnd(0.003, 0.01), rnd(0.002, 0.005), rnd(0.003, 0.012)); }
  greeb.count = gi; greeb.instanceMatrix.needsUpdate = true; if (greeb.instanceColor) greeb.instanceColor.needsUpdate = true;
  body.add(greeb);
  // ---- cửa sổ sáng dọc đai hông + mặt thượng tầng (instanced, tắt ngẫu nhiên)
  const WN = 420, win = new THREE.InstancedMesh(box, new THREE.MeshBasicMaterial({ toneMapped: false }), WN);
  let wi = 0;
  const addWin = (x, y, z, rotY) => { if (wi >= WN) return; _q.setFromEuler(_e.set(0, rotY, 0)); _m.compose(_p.set(x, y, z), _q, _s.set(0.004, 0.0022, 0.0012)); win.setMatrixAt(wi, _m);
    const on = Math.random() < 0.8, k = on ? rnd(1.4, 2.4) : 0.05; win.setColorAt(wi, _c.setRGB(k, k * 0.86, k * 0.6)); wi++; };
  for (const s of [-1, 1]) {
    const ang = Math.atan2(HW, 1) * s;                                // mép hông chạy từ mũi về đuôi
    for (let i = 0; i < 170; i++) { const x = rnd(-0.49, 0.45), z = s * hw(x) * 1.03 + s * 0.0008; addWin(x, 0.0035 + (i % 3 === 0 ? -0.004 : 0), z, -ang); }
  }
  tiers.forEach(([x, sx, sy, sz, y]) => { for (let i = 0; i < 10; i++) for (const s of [-1, 1]) addWin(x + rnd(-sx / 2, sx / 2), y + rnd(-sy / 4, sy / 4), s * (sz / 2 + 0.0015), 0); });
  win.count = wi; win.instanceMatrix.needsUpdate = true; if (win.instanceColor) win.instanceColor.needsUpdate = true; body.add(win);

  // ---- slogan ANDREW CLASSES: chữ phát sáng dọc sống lưng (nằm theo dốc boong), thỉnh thoảng chập chờn
  const sloganTex = tex(1024, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.textAlign = "center"; g.textBaseline = "middle";
    g.font = "900 96px 'Arial Black', Arial, sans-serif";
    g.shadowColor = "rgba(120,220,255,1)"; g.shadowBlur = 18; g.fillStyle = "#e6fbff"; g.fillText("ANDREW CLASSES", w / 2, h / 2 + 4, w - 30);
    g.shadowBlur = 0; g.fillText("ANDREW CLASSES", w / 2, h / 2 + 4, w - 30);
  });
  const sloganMat = new THREE.MeshBasicMaterial({ map: sloganTex, transparent: true, depthWrite: false, toneMapped: false, color: new THREE.Color(2, 2.3, 2.6) });
  const slogans = [];
  // mỗi sườn 2 bản: xuôi + xoay 180° — tàu bay sang TRÁI thì dùng bản xoay để chữ không bị lộn ngược trên màn
  for (const s of [-1, 1]) for (const flip of [false, true]) {
    const x0 = 0.06, L = 0.5, H = L / 8;
    const geo = new THREE.PlaneGeometry(L, H); if (flip) geo.rotateZ(Math.PI);
    const m = new THREE.Mesh(geo, sloganMat);
    const z = s * hw(x0) * 0.45, y = hc(x0) * (1 - 0.45) + 0.004;
    m.position.set(x0, y, z);
    m.rotation.set(-Math.PI / 2, 0, 0);                               // nằm ngửa
    m.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), -Math.atan2(hc(x0), hw(x0)) * s);   // nghiêng theo dốc sườn
    m.renderOrder = 3; body.add(m); slogans.push({ m, s, flip });
  }
  // ---- động cơ: 3 lớn + 4 nhỏ ở mặt đuôi; lõi xanh-trắng, lửa (2 nón cộng sáng), khói
  const engMat = new THREE.MeshStandardMaterial({ color: 0x3b4048, metalness: 0.7, roughness: 0.4 });
  const coreMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 1.9, 2.6), toneMapped: false });
  const flames = [], nozzles = [];
  const ENG = [[0.034, 0, 0.03], [0.034, -0.075, 0.03], [0.034, 0.075, 0.03], [0.014, -0.13, 0.015], [0.014, 0.13, 0.015], [0.012, -0.04, 0.066], [0.012, 0.04, 0.066]];
  ENG.forEach(([r, z, y]) => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.1, 0.05, 20, 1, true), engMat); c.rotation.z = Math.PI / 2; c.position.set(-0.51, y, z); body.add(c);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.12, 8, 24), engMat); ring.rotation.y = Math.PI / 2; ring.position.set(-0.535, y, z); body.add(ring);
    const core = new THREE.Mesh(new THREE.CircleGeometry(r * 0.9, 20), coreMat); core.rotation.y = -Math.PI / 2; core.position.set(-0.533, y, z); body.add(core);
    const f1 = new THREE.Mesh(new THREE.ConeGeometry(r * 0.8, r * 5, 16, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.7, 1.1, 2.0), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    f1.rotation.z = Math.PI / 2; f1.position.set(-0.535 - r * 2.5, y, z); body.add(f1);
    const f2 = new THREE.Mesh(new THREE.ConeGeometry(r * 1.1, r * 8, 16, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.5, 0.25), transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    f2.rotation.z = Math.PI / 2; f2.position.set(-0.535 - r * 4, y, z); body.add(f2);
    flames.push({ f1, f2, r }); nozzles.push(new THREE.Vector3(-0.54 - r * 6, y, z));
  });
  ship.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });

  // ---- vệt khói sau đuôi (thế giới, không theo tàu)
  const smokeTex = tex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,.9)"); gr.addColorStop(0.5, "rgba(255,255,255,.35)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
  const SMK = 90, smoke = [];
  for (let i = 0; i < SMK; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, color: 0x9aa6bd, transparent: true, opacity: 0, depthWrite: false }));
    s.visible = false; scene.add(s); smoke.push({ s, life: 0, max: 1, v: new THREE.Vector3() });
  }
  let si = 0, smokeAcc = 0;

  // ---- đường bay: tính theo máy quay lúc xuất phát
  const A = new THREE.Vector3(), Bp = new THREE.Vector3(), vel = new THREE.Vector3();
  let t = 0, wait = opts.firstWait ?? rnd(12, 20), flying = false, glitch = 0, nextGlitch = rnd(2, 5);
  function ndcPoint(nx, ny, dist, out) {
    const v = new THREE.Vector3(nx, ny, 0.5).unproject(camera).sub(camera.position).normalize();
    return out.copy(camera.position).addScaledVector(v, dist);
  }
  function launch() {
    camera.updateMatrixWorld();
    const dir = Math.random() < 0.5 ? 1 : -1, ny = rnd(0.5, 0.56);   // dải trời ngay trên mép trạm, dưới thanh câu hỏi
    ndcPoint(-1.5 * dir, ny, DIST, A); ndcPoint(1.5 * dir, ny + rnd(-0.06, 0.06), DIST * rnd(0.95, 1.08), Bp);
    vel.copy(Bp).sub(A).divideScalar(CROSS_S);
    const f = vel.clone().setY(0).normalize();
    const toCam = camera.position.clone().sub(A).setY(0).normalize();
    f.lerp(toCam, 0.32).normalize();                                  // mũi hơi chếch về phía người xem ⇒ thấy dáng 3/4 như ảnh
    const up = new THREE.Vector3(0, 1, 0), zAx = new THREE.Vector3().crossVectors(f, up).normalize();
    ship.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(f, up, zAx));
    ship.position.copy(A); ship.visible = true; t = 0; flying = true;
    slogans.forEach(o => { o.m.visible = o.flip === (dir < 0); });
  }
  const _w = new THREE.Vector3();
  function update(dt, time) {
    if (!flying) { wait -= dt; if (wait <= 0) launch(); }
    else {
      t += dt; ship.position.addScaledVector(vel, dt);
      if (t >= CROSS_S) { flying = false; ship.visible = false; wait = rnd(45, 60); }
      flames.forEach((f, k) => { const j = 0.85 + Math.random() * 0.3; f.f1.scale.set(1, j, 1); f.f2.scale.set(1, 0.8 + Math.random() * 0.45, 1); f.f2.material.opacity = 0.16 + Math.random() * 0.12; });
      smokeAcc += dt * 26;
      while (smokeAcc > 1) {
        smokeAcc--; const n = nozzles[Math.floor(Math.random() * 3)], p = smoke[si++ % SMK];
        body.localToWorld(_w.copy(n)); p.s.position.copy(_w); p.s.visible = true; p.life = 0; p.max = rnd(2.2, 3.4);
        p.v.copy(vel).multiplyScalar(-0.12).add(new THREE.Vector3(rnd(-0.6, 0.6), rnd(-0.3, 0.6), rnd(-0.6, 0.6)));
      }
      // slogan: sáng đều, thỉnh thoảng chập "rẹt rẹt"
      nextGlitch -= dt;
      if (nextGlitch <= 0 && glitch <= 0) { glitch = rnd(0.25, 0.6); nextGlitch = rnd(2.5, 6); }
      let k = 1;
      if (glitch > 0) { glitch -= dt; const r = Math.random(); k = r < 0.35 ? 0.08 : r < 0.55 ? 0.45 : 1.15; }
      sloganMat.color.setRGB(2 * k, 2.3 * k, 2.6 * k);
    }
    for (const p of smoke) {
      if (!p.s.visible) continue;
      p.life += dt; const u = p.life / p.max;
      if (u >= 1) { p.s.visible = false; continue; }
      p.s.position.addScaledVector(p.v, dt); p.s.scale.setScalar(LEN * (0.03 + 0.12 * Math.sqrt(u)));
      p.s.material.opacity = 0.32 * (u < 0.1 ? u / 0.1 : 1 - u);
    }
  }
  return { update, launch, group: ship, get flying() { return flying; } };
}
