// =============================================================
// ROCKET RACE 3D — TÊN LỬA TẤN CÔNG giữa 2 tàu (MẪU 6, thầy 26/9/2026)
// Luật (do trang game / rocket-race.js giữ — mô-đun này CHỈ VẼ):
//   · đúng 3 câu LIÊN TIẾP = +1 tên lửa (cả 2 ô tối đa 3 quả) — hiệu ứng nạp phải ngầu
//   · 2 ô liền nhau DƯỚI cột đáp án: ô nhỏ = quả dự phòng, ô lớn = quả đã LÊN NÒNG (chạm để bắn)
//   · lên nòng ⇒ thân tàu MỞ KHOANG, bệ đẩy quả tên lửa đỏ to lên nóc tàu
//   · bắn: bay vòng rộng ra, song song cạnh tàu địch rồi từ từ lao vào hơi ngang thân tàu
//   · 1,5 s cuối trước khi trúng: đội bị bắn trả lời ĐÚNG hoặc bấm BOOST ⇒ tàu vọt lên né, tên lửa bay hụt,
//     lao thêm một đoạn rồi nổ. BOOST có được khi đúng 5 câu liên tiếp, giữ tối đa 1 nút.
// Gắn vào rr3d-view.js qua `createMissiles(ctx)`; view gọi attach/buildConsole/poseRocket/tick/tap.
// =============================================================

export function createMissiles(X) {
  const { THREE, scene, rockets, cfg, fire, smoke, burst, explosion, sfx, labelOn, shake, stall, hitList,
    frameGeo, RoundedBoxGeometry, canvasTex, radialTex, FONT_UI, G } = X;
  const V3 = THREE.Vector3;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const smooth = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  const easeOutBack = t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const MC = Object.assign({ dur: 3.4, window: 1.5, out: 5.5, ammoCm: 8, boostCm: 5.2, gapCm: 0.9 }, cfg.missiles || {});
  const TRAVEL = cfg.travelDir.clone().normalize(), UP = new V3(0, 1, 0);

  // ---------------------------------------------------------------- mô hình tên lửa (dọc +X, dài 2,3 đv)
  const mRed = new THREE.MeshPhysicalMaterial({ color: "#d4121e", metalness: 0.35, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.08,
    emissive: new THREE.Color("#ff1a24"), emissiveIntensity: 0.22, envMapIntensity: 0.8 });
  const mRedDark = new THREE.MeshPhysicalMaterial({ color: "#8e0b14", metalness: 0.4, roughness: 0.35, clearcoat: 0.8, emissive: new THREE.Color("#ff1a24"), emissiveIntensity: 0.1 });
  const mWhite = new THREE.MeshPhysicalMaterial({ color: "#eef0f3", metalness: 0.2, roughness: 0.35, clearcoat: 0.6 });
  const mDark = new THREE.MeshStandardMaterial({ color: "#23272f", metalness: 0.85, roughness: 0.35 });
  const mPit = new THREE.MeshStandardMaterial({ color: "#07080b", metalness: 0.5, roughness: 0.8 });
  const mGlow = new THREE.MeshBasicMaterial({ color: new THREE.Color(4.2, 0.35, 0.25) });
  const alongX = g => { g.rotateZ(-Math.PI / 2); return g; };                 // dựng dọc +Y → nằm dọc +X
  const lat = (pts, segs = 32) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), segs);
  const GEO = (() => {
    const nosePts = []; for (let i = 0; i <= 12; i++) { const y = i / 12 * 0.62; nosePts.push([Math.max(0.001, 0.2 * Math.pow(1 - Math.pow(y / 0.62, 2), 0.55)), y]); }
    const fs = new THREE.Shape(); fs.moveTo(0, 0); fs.lineTo(0.46, 0); fs.lineTo(0.3, 0.3); fs.lineTo(0.08, 0.3); fs.closePath();
    const fin = new THREE.ExtrudeGeometry(fs, { depth: 0.035, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2 });
    fin.translate(-1.1, 0.17, -0.0175);
    const flame = new THREE.ConeGeometry(0.15, 1.2, 16, 1, true); flame.rotateZ(Math.PI / 2); flame.translate(-1.75, 0, 0);
    return {
      body: alongX(new THREE.CylinderGeometry(0.2, 0.2, 1.5, 32)).translate(-0.2, 0, 0),
      nose: alongX(lat(nosePts)).translate(0.55, 0, 0),
      band: alongX(new THREE.CylinderGeometry(0.204, 0.204, 0.07, 32, 1, true)),
      glow: alongX(new THREE.CylinderGeometry(0.207, 0.207, 0.045, 32, 1, true)).translate(-0.86, 0, 0),
      tail: alongX(lat([[0.001, -0.2], [0.13, -0.2], [0.17, -0.12], [0.2, 0]])).translate(-0.95, 0, 0),
      fin, flame
    };
  })();
  const flareTex = radialTex([[0, "rgba(255,255,255,1)"], [0.2, "rgba(255,220,190,0.9)"], [0.5, "rgba(255,90,60,0.3)"], [1, "rgba(0,0,0,0)"]], 128);
  function makeMissile() {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(GEO.body, mRed), new THREE.Mesh(GEO.nose, mRed), new THREE.Mesh(GEO.tail, mDark), new THREE.Mesh(GEO.glow, mGlow));
    [0.43, -0.72].forEach(x => { const b = new THREE.Mesh(GEO.band, mWhite); b.position.x = x; g.add(b); });
    for (let k = 0; k < 4; k++) { const f = new THREE.Mesh(GEO.fin, mRedDark); f.rotation.x = k * Math.PI / 2 + Math.PI / 4; g.add(f); }
    const flame = new THREE.Mesh(GEO.flame, new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 1.5, 0.45), transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    const flare = new THREE.Sprite(new THREE.SpriteMaterial({ map: flareTex, color: new THREE.Color(5, 2.2, 1), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    flare.position.x = -1.25; flare.scale.setScalar(1.1);
    flame.visible = flare.visible = false;
    g.add(flame, flare);
    return { g, flame, flare };
  }

  // ---------------------------------------------------------------- khoang + bệ phóng trên nóc tàu
  // Góc đuổi nhìn TỪ SAU LƯNG ⇒ quả nằm dọc thân tàu chỉ thấy cái đuôi tròn. Bệ nâng quả lên rồi NGÓC MŨI ~22° ⇒ thân đỏ
  // hiện rõ cả chiều dài trên màn; quả to hơn 20% (cả lúc bay).
  const Y_DOWN = 0.18, Y_UP = 1.05, DOOR = 1.9, PITCH = 0.38, MOUNT_S = 1.2;
  function attach(r) {
    const bay = new THREE.Group(); bay.position.set(-0.3, 0, 0); r.ship.add(bay);
    const pit = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.03, 0.4), mPit); pit.position.y = 0.566; bay.add(pit);
    const mk = (z, sgn) => {
      const h = new THREE.Group(); h.position.set(0, 0.59, z);
      const d = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.03, 0.2), r.hullMat); d.position.z = -sgn * 0.1; h.add(d);
      const edge = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.034, 0.025), r.teamMat); edge.position.z = -sgn * 0.19; h.add(edge);
      bay.add(h); return h;
    };
    const hL = mk(0.2, 1), hR = mk(-0.2, -1);
    const lift = new THREE.Group(); lift.position.y = Y_DOWN; bay.add(lift);
    const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.42, 0.08), mDark); pylon.position.y = -0.3; lift.add(pylon);
    const ms = makeMissile(); ms.g.scale.setScalar(MOUNT_S); lift.add(ms.g); ms.g.visible = false;
    r.mis = { bay, hL, hR, lift, ms, open: 0, rise: 0, wantRise: 0 };
  }
  function poseMount(r, dt) {
    const m = r.mis; if (!m) return;
    m.bay.visible = r.model.visible && !r.wreck && !r.hidden;
    if (m.wantRise > m.rise) { if (m.open >= 0.97) m.rise = Math.min(m.wantRise, m.rise + dt / 0.55); }
    else m.rise = Math.max(m.wantRise, m.rise - dt / 0.3);
    const openT = (m.wantRise > 0 || m.rise > 0.03) ? 1 : 0;
    m.open = clamp(m.open + clamp(openT - m.open, -dt / 0.45, dt / 0.35), 0, 1);
    const a = smooth(m.open) * DOOR;
    m.hL.rotation.x = a; m.hR.rotation.x = -a;
    m.lift.position.y = lerp(Y_DOWN, Y_UP, m.rise < 1 ? smooth(m.rise) : 1);
    m.lift.rotation.z = smooth((m.rise - 0.55) / 0.45) * PITCH;         // lên hết thì ngóc mũi
    if (m.ms.g.visible && m.rise >= 1) m.ms.g.position.y = Math.sin(G.t * 3 + r.idx) * 0.015;
  }

  // ---------------------------------------------------------------- trạng thái kho (do trang game đặt)
  const A = [0, 1].map(() => ({ reserve: 0, loaded: false, pips: 0, pipsMax: 3, full: false, boost: false, boostPips: 0, boostMax: 5, locked: false, on: true }));
  const UI = [null, null];
  const pending = [];                 // hẹn giờ theo NHỊP CẢNH (tạm dừng/bàn thử bước khung vẫn đúng)
  const later = (t, fn) => pending.push({ t, fn });

  // ---------------------------------------------------------------- ô chứa + nút BOOST dưới cột đáp án
  function slotBox(w, h, team) {
    const g = new THREE.Group();
    const r = Math.min(w, h) * 0.16;
    const slab = new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.06, 4, r),
      new THREE.MeshPhysicalMaterial({ color: new THREE.Color("#070b16"), metalness: 0.7, roughness: 0.45, envMapIntensity: 0.2 })   /* ĐẶC: vệt bụi tốc độ không vẽ đè lên ô */);
    const rimMat = new THREE.MeshBasicMaterial({ color: team.color.clone().multiplyScalar(1.6), transparent: true, opacity: 0.95, depthWrite: false });
    const rim = new THREE.Mesh(frameGeo(w + 0.03, h + 0.03, r * 1.05, Math.min(w, h) * 0.035), rimMat); rim.position.z = 0.035;
    const cv = document.createElement("canvas"); cv.width = 512; cv.height = Math.max(8, Math.round(512 * h / w));
    const tex = canvasTex(cv);
    const txt = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    txt.position.z = 0.26; txt.renderOrder = 3;
    g.add(slab, rim, txt);
    return { g, slab, rim, rimMat, cv, tex, txt, w, h, key: "" };
  }
  const fat = (g, k) => g.scale.set(k, k * 1.35, k * 1.35);   // quả trong ô: mập hơn 35% cho dễ nhìn
  function buildConsole(con, inner, s, pad, cm) {
    const side = con.side, team = rockets[side].team;
    const areaW = s.w - pad * 2;
    const gapX = 0.8 * cm, ammoH = MC.ammoCm * cm, boostH = MC.boostCm * cm, gap = MC.gapCm * cm;
    const yAmmo = -s.h / 2 - gap - ammoH / 2, yBoost = yAmmo - ammoH / 2 - gap - boostH / 2;
    const resW = areaW * 0.42 - gapX / 2, chW = areaW * 0.58 - gapX / 2;
    const inSign = side === 0 ? 1 : -1;                         // phía TRONG (giữa màn) = ô lên nòng
    const xRes = -inSign * (areaW / 2 - resW / 2), xCh = inSign * (areaW / 2 - chW / 2);
    const res = slotBox(resW, ammoH, team); res.g.position.set(xRes, yAmmo, 0.05); inner.add(res.g);
    const ch = slotBox(chW, ammoH, team); ch.g.position.set(xCh, yAmmo, 0.05); inner.add(ch.g);
    // quả dự phòng (nhỏ, 2 hàng) + quả lên nòng (to) — mũi chĩa về phía tàu địch
    const miniS = resW * 0.8 / 2.3, bigS = chW * 0.86 / 2.3;
    const minis = [0.16, -0.12].map(fy => { const m = makeMissile(); m.g.scale.setScalar(miniS); m.g.position.set(0, fy * ammoH, 0.14); m.g.rotation.y = inSign > 0 ? 0 : Math.PI; m.g.visible = false; res.g.add(m.g); return m; });
    const big = makeMissile(); big.g.scale.setScalar(bigS); big.g.position.set(0, 0.08 * ammoH, 0.2); big.g.rotation.y = inSign > 0 ? 0 : Math.PI; big.g.visible = false; ch.g.add(big.g);
    const glowSp = new THREE.Sprite(new THREE.SpriteMaterial({ map: flareTex, color: new THREE.Color(4, 0.5, 0.35), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }));
    glowSp.scale.set(chW * 1.3, ammoH * 1.3, 1); glowSp.position.z = 0.2; ch.g.add(glowSp);
    const resGlow = glowSp.clone(); resGlow.material = glowSp.material.clone(); resGlow.scale.set(resW * 1.4, ammoH * 1.4, 1); res.g.add(resGlow);
    // con thoi: quả nhỏ bay từ ô dự phòng sang ô lên nòng lúc nạp
    const shuttle = makeMissile(); shuttle.g.visible = false; shuttle.g.rotation.y = big.g.rotation.y; inner.add(shuttle.g);
    // nút BOOST (cả bề ngang)
    const bst = slotBox(areaW, boostH, team); bst.g.position.set(0, yBoost, 0.05); inner.add(bst.g);
    // khung cảnh báo đỏ bao cả cột (đáp án + ô chứa + BOOST)
    const top = s.h / 2, bot = yBoost - boostH / 2, fh = top - bot + pad, fw = s.w + pad * 0.6;
    const warnMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 0.35, 0.3), transparent: true, opacity: 0, depthWrite: false });
    const warn = new THREE.Mesh(frameGeo(fw, fh, Math.min(fw, fh) * 0.06, Math.min(fw, fh) * 0.014), warnMat);
    warn.position.set(0, (top + bot) / 2, 0.02); warn.visible = false; inner.add(warn);
    [[ch.slab, "fire"], [bst.slab, "boost"]].forEach(([m, kind]) => { m.userData.ammo = { side, kind }; hitList.push(m); });
    const U = { res, ch, bst, minis, big, glowSp, resGlow, shuttle, warn, warnMat, inSign, miniS, bigS, ammoH, press: { fire: 0, boost: 0 },
      pop: [0, 0], popBig: 0, load: null, fireK: 0, shakeK: 0, flash: 0 };
    UI[side] = U;
    paintAll(side, true);
  }
  // chữ trên các ô (vẽ lại khi trạng thái hiển thị đổi)
  function pips(g, n, max, cx, cy, rad, on, off) {
    const step = rad * 2.7, x0 = cx - (max - 1) * step / 2;
    for (let i = 0; i < max; i++) { g.beginPath(); g.arc(x0 + i * step, cy, rad, 0, Math.PI * 2); g.fillStyle = i < n ? on : off; g.fill(); }
  }
  function label(g, txt, x, y, px, col, weight = 800) {
    g.font = `${weight} ${px}px ${FONT_UI}`; g.textAlign = "center"; g.textBaseline = "middle";
    g.shadowColor = "rgba(0,0,0,.7)"; g.shadowBlur = px * 0.2; g.fillStyle = col; g.fillText(txt, x, y); g.shadowBlur = 0;
  }
  function paintAll(side, force) {
    const U = UI[side]; if (!U) return;
    const a = A[side], inc = incoming(side), win = inc <= MC.window;
    // ô dự phòng: chữ SPARE + chấm tiến độ tới quả kế tiếp
    { const S = U.res, key = [a.full, a.pips, a.locked, a.on].join();
      if (force || S.key !== key) { S.key = key; const g = S.cv.getContext("2d"), W = S.cv.width, H = S.cv.height; g.clearRect(0, 0, W, H);
        label(g, "SPARE", W / 2, H * 0.14, H * 0.13, "rgba(255,255,255,.55)");
        if (!a.on) label(g, "OFF", W / 2, H * 0.86, H * 0.13, "rgba(255,255,255,.35)");
        else if (a.full) label(g, "FULL", W / 2, H * 0.86, H * 0.14, "#ff8a8a");
        else pips(g, a.pips, a.pipsMax, W / 2, H * 0.86, H * 0.055, "#ff4a4a", "rgba(255,255,255,.18)");
        S.tex.needsUpdate = true; } }
    // ô lên nòng
    { const S = U.ch, key = [a.loaded, a.locked, a.on].join();
      if (force || S.key !== key) { S.key = key; const g = S.cv.getContext("2d"), W = S.cv.width, H = S.cv.height; g.clearRect(0, 0, W, H);
        if (!a.on) label(g, "MISSILES OFF", W / 2, H / 2, H * 0.13, "rgba(255,255,255,.35)");
        else if (a.locked) label(g, "LOCKED", W / 2, H * 0.84, H * 0.14, "rgba(255,255,255,.4)");
        else if (a.loaded) label(g, "TAP TO FIRE", W / 2, H * 0.86, H * 0.13, "#ffffff", 900);
        else label(g, "EMPTY", W / 2, H / 2, H * 0.16, "rgba(255,255,255,.3)");
        S.tex.needsUpdate = true; } }
    // BOOST
    { const S = U.bst;
      const mode = a.locked ? "locked" : win && a.boost ? "now" : win ? "answer" : inc < Infinity ? "incoming" : a.boost ? "ready" : "charge";
      const key = [mode, a.boostPips].join();
      if (force || S.key !== key) { S.key = key; S.mode = mode; const g = S.cv.getContext("2d"), W = S.cv.width, H = S.cv.height; g.clearRect(0, 0, W, H);
        const px = H * 0.4;
        if (mode === "now") label(g, "⚡ BOOST NOW!", W / 2, H / 2, px * 1.05, "#ffffff", 900);
        else if (mode === "answer") label(g, "⚠ ANSWER TO DODGE!", W / 2, H / 2, px * 0.66, "#ffd0d0", 900);
        else if (mode === "incoming") label(g, a.boost ? "⚠ MISSILE! · BOOST" : "⚠ MISSILE!", W / 2, H / 2, px * 0.85, "#ffb0b0", 900);
        else if (mode === "ready") label(g, "⚡ BOOST READY", W / 2, H / 2, px * 0.9, "#bff4ff", 900);
        else if (mode === "locked") label(g, "BOOST", W / 2, H / 2, px * 0.8, "rgba(255,255,255,.3)");
        else { label(g, "BOOST", W * 0.3, H / 2, px * 0.8, "rgba(255,255,255,.5)"); pips(g, a.boostPips, a.boostMax, W * 0.7, H / 2, H * 0.1, "#6fe7ff", "rgba(255,255,255,.18)"); }
        S.tex.needsUpdate = true; } }
  }
  function tickUI(side, dt) {
    const U = UI[side]; if (!U) return;
    const a = A[side], inc = incoming(side), win = inc <= MC.window;
    paintAll(side, false);
    // quả dự phòng: hiện theo số lượng (tối đa 2 ô) + nảy lên khi vừa có
    const shown = a.on ? Math.min(2, a.reserve) : 0;
    U.minis.forEach((m, i) => {
      const vis = i < shown;
      if (vis && !m.g.visible) U.pop[i] = 1;
      m.g.visible = vis;
      U.pop[i] = Math.max(0, U.pop[i] - dt / 0.55);
      const k = U.pop[i] > 0 ? easeOutBack(1 - U.pop[i]) : 1;
      fat(m.g, U.miniS * Math.max(0.01, k));
    });
    // con thoi nạp đạn
    if (U.load) {
      U.load.t += dt; const k = smooth(U.load.t / 0.5);
      const p0 = U.res.g.position.clone().add(new V3(0, 0.16 * U.ammoH, 0.14)), p1 = U.ch.g.position.clone().add(new V3(0, 0.1 * U.ammoH, 0.16));
      U.shuttle.g.visible = true;
      U.shuttle.g.position.lerpVectors(p0, p1, k); U.shuttle.g.position.z += Math.sin(k * Math.PI) * 0.35;
      fat(U.shuttle.g, lerp(U.miniS, U.bigS, k));
      if (U.load.t >= 0.5) { U.load = null; U.shuttle.g.visible = false; U.popBig = 1; U.flash = 1; }
    }
    const bigVis = a.on && a.loaded && !U.load && U.fireK <= 0;
    U.big.g.visible = bigVis || U.fireK > 0;
    U.popBig = Math.max(0, U.popBig - dt / 0.5);
    if (U.fireK > 0) {                     // bắn: quả to phóng vút về phía giữa màn rồi mất
      U.fireK = Math.max(0, U.fireK - dt / 0.3); const k = 1 - U.fireK;
      U.big.g.position.x = U.inSign * k * k * U.ch.w * 1.2; fat(U.big.g, U.bigS * (1 + k * 0.5));
      U.big.flame.visible = U.big.flare.visible = true;
      if (U.fireK <= 0) { U.big.g.position.x = 0; U.big.flame.visible = U.big.flare.visible = false; }
    } else {
      const k = U.popBig > 0 ? easeOutBack(1 - U.popBig) : 1;
      fat(U.big.g, U.bigS * Math.max(0.01, k));
      U.big.g.position.y = 0.08 * U.ammoH + Math.sin(G.t * 2.2) * 0.01;
    }
    // ánh đỏ ô lên nòng (đập nhịp khi sẵn sàng) + loé khi vừa nạp/có quả mới
    U.flash = Math.max(0, U.flash - dt * 1.6);
    const ready = bigVis && !a.locked;
    U.glowSp.material.opacity = (ready ? 0.1 + 0.08 * Math.sin(G.t * 5) : 0) + U.flash * 0.8;
    U.resGlow.material.opacity = Math.max(0, U.resGlowK = Math.max(0, (U.resGlowK || 0) - dt * 1.4)) * 0.9;
    const tc = rockets[side].team.color;
    U.ch.rimMat.color.copy(ready ? new THREE.Color(4, 0.6, 0.45).multiplyScalar(0.8 + 0.25 * Math.sin(G.t * 5)) : tc.clone().multiplyScalar(a.on ? 1.2 : 0.35));
    U.res.rimMat.color.copy(tc.clone().multiplyScalar(a.on ? 1.2 : 0.35));
    // nhấn
    ["fire", "boost"].forEach(k => { U.press[k] = Math.max(0, U.press[k] - dt * 4); });
    U.ch.g.scale.setScalar(1 - U.press.fire * 0.05);
    U.shakeK = Math.max(0, U.shakeK - dt * 3);
    U.bst.g.scale.setScalar(1 - U.press.boost * 0.05);
    U.bst.g.position.x = U.shakeK > 0 ? Math.sin(G.t * 60) * 0.03 * U.shakeK : 0;
    const bm = U.bst.mode;
    const pul = 0.5 + 0.5 * Math.sin(G.t * (win ? 16 : 7));
    U.bst.rimMat.color.copy(bm === "now" ? new THREE.Color(0.8, 3.2, 4).multiplyScalar(0.7 + 0.6 * pul)
      : bm === "answer" || bm === "incoming" ? new THREE.Color(4, 0.4, 0.35).multiplyScalar(0.5 + 0.6 * pul)
      : bm === "ready" ? new THREE.Color(0.5, 2.2, 2.8) : tc.clone().multiplyScalar(0.4));
    U.bst.slab.material.color.set(bm === "now" ? "#0b3a4a" : bm === "answer" || bm === "incoming" ? "#3a0a10" : "#070b16");
    // khung cảnh báo đỏ: chậm khi tên lửa đang bay, NHANH trong 1,5 s cuối
    U.warn.visible = inc < Infinity;
    U.warnMat.opacity = inc < Infinity ? (win ? 0.35 + 0.65 * pul : 0.15 + 0.3 * pul) : 0;
  }

  // ---------------------------------------------------------------- tên lửa đang bay
  const pool = [0, 1, 2, 3, 4, 5].map(() => { const m = makeMissile(); m.g.visible = false; m.g.scale.setScalar((cfg.rocketScale ?? 1) * MOUNT_S); scene.add(m.g); return m; });
  const flights = [];
  let nextId = 1;
  const reticleTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d");
    g.strokeStyle = "#ff3b3b"; g.lineWidth = 10; g.shadowColor = "#ff2020"; g.shadowBlur = 18;
    g.beginPath(); g.arc(128, 128, 92, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 8; [[128, 12, 128, 60], [128, 196, 128, 244], [12, 128, 60, 128], [196, 128, 244, 128]].forEach(([a, b, c2, d]) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c2, d); g.stroke(); });
    return canvasTex(c);
  })();
  const reticles = rockets.map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: reticleTex, color: new THREE.Color(2.4, 0.5, 0.45), transparent: true, depthWrite: false, depthTest: false, opacity: 0 })); s.renderOrder = 5; s.visible = false; scene.add(s); return s; });
  const shipPos = (r, out = new V3()) => out.setFromMatrixPosition(r.ship.matrixWorld);
  function bez(p0, p1, p2, p3, u, out) {
    const a = (1 - u) ** 3, b = 3 * (1 - u) ** 2 * u, c = 3 * (1 - u) * u * u, d = u ** 3;
    return out.set(0, 0, 0).addScaledVector(p0, a).addScaledVector(p1, b).addScaledVector(p2, c).addScaledVector(p3, d);
  }
  function ctrl(f, T) {
    const out = new V3(Math.sign(T.x) || (f.to === 0 ? -1 : 1), 0, 0);
    // vòng RỘNG theo khoảng cách 2 tàu (tàu địch ở xa ⇒ vòng rộng hơn, trên màn vẫn thấy rõ là "vòng ra")
    const far = Math.abs(T.z - f.p0.z);
    return { p1: f.p0.clone().addScaledVector(UP, 3.4 + far * 0.04).addScaledVector(TRAVEL, 3),
      p2: T.clone().addScaledVector(out, MC.out + far * 0.12).addScaledVector(UP, 1.0).addScaledVector(TRAVEL, -2.5) };
  }
  function launch(from, to) {
    const r = rockets[from], m = pool.find(p => !p.g.visible); if (!m || !r.mis) return 0;
    const src = r.mis.ms.g;
    const p0 = new V3(), q0 = new THREE.Quaternion();
    if (src.visible) { src.getWorldPosition(p0); src.getWorldQuaternion(q0); }
    else { shipPos(r, p0).addScaledVector(UP, 1.1); q0.setFromUnitVectors(new V3(1, 0, 0), TRAVEL); }
    src.visible = false; r.mis.wantRise = 0; r.mis.rise = 0;           // quả trên nóc rời bệ ⇒ bệ thụt, khoang đóng
    m.g.position.copy(p0); m.g.quaternion.copy(q0); m.g.visible = true; m.flame.visible = m.flare.visible = true;
    const f = { id: nextId++, m, from, to, t: 0, dur: MC.dur, p0, prev: p0.clone(), dodged: false, anchor: null, passed: false, after: 0, vel: new V3(), warned: false, beepT: 0 };
    flights.push(f);
    // khói phụt lúc rời bệ
    for (let i = 0; i < 16; i++) smoke.emit({ pos: p0.clone().add(new V3(rand(-0.4, 0.4), rand(-0.2, 0.2), rand(-0.4, 0.4))), vel: new V3(rand(-1.5, 1.5), rand(0.5, 2), rand(-1.5, 1.5)), life: rand(1.2, 1.9), size: 0.5, sizeEnd: 2.4, color: new THREE.Color(0.75, 0.75, 0.8), alpha: 0.4, drag: 1.2 });
    burst(p0, { n: 50, speed: 6, color: new THREE.Color(5, 2.2, 0.8), colorEnd: new THREE.Color(1.5, 0.2, 0.05), size: 0.18, life: 0.5 });
    sfx("mlaunch", 1);
    shake(0.2);
    if (UI[from]) UI[from].fireK = 1;
    return f.id;
  }
  function timeLeft(f) { return f.passed || f.dodged ? Infinity : Math.max(0, f.dur - f.t); }
  function incoming(side) { let m = Infinity; flights.forEach(f => { if (f.to === side) m = Math.min(m, timeLeft(f)); }); return m; }
  function dodge(side) {
    let any = false;
    flights.forEach(f => {
      if (f.to !== side || f.dodged || f.passed || f.dur - f.t > MC.window + 0.05) return;
      f.dodged = true; f.anchor = shipPos(rockets[side]); any = true;
    });
    if (any) {
      const r = rockets[side]; if (!r.surge) r.surge = { t: 0, back: 0 }; r.boost = 1;
      labelOn(r, "DODGE!", "#7fe6ff"); sfx("mdodge", 1); sfx("boost", 0.6);
      burst(new V3().setFromMatrixPosition(r.ship.matrixWorld).addScaledVector(TRAVEL, -2.6), { n: 90, speed: 9, color: new THREE.Color(1.2, 2.6, 5), colorEnd: new THREE.Color(0.2, 0.4, 1.6), size: 0.24, life: 0.6 });
    }
    return any;
  }
  // tàu né: VỌT LÊN phía trước rồi TỪ TỪ về chỗ cũ (không cộng nấc) — giữ ở phía trước tới khi quả tên lửa bay qua hẳn
  function poseRocket(r, i, dt) {
    const s = r.surge; if (!s) return;
    s.t += dt;
    const hold = flights.some(f => f.to === i && f.dodged && f.t < f.dur + 0.35);
    if (s.t > 0.35 && !hold) s.back += dt / 1.4;
    const k = (1 - Math.pow(1 - clamp(s.t / 0.35, 0, 1), 3)) * (1 - smooth(s.back));
    r.rig.position.addScaledVector(TRAVEL, 3.4 * k);
    if (s.back >= 1) r.surge = null;
  }
  function airburst(pos, sc = 0.6) { explosion(pos, sc); sfx("boom", 0.55); }
  function stepFlights(dt) {
    for (let i = flights.length - 1; i >= 0; i--) {
      const f = flights[i]; const m = f.m;
      f.t += dt;
      const T = f.anchor ? f.anchor : shipPos(rockets[f.to]);
      let pos;
      if (!f.passed) {
        const k = clamp(f.t / f.dur, 0, 1), u = 0.72 * k + 0.28 * k * k * (3 - 2 * k);   // hơi chậm lúc đầu, lao vào ở cuối
        const c = ctrl(f, T);
        pos = bez(f.p0, c.p1, c.p2, T, u, new V3());
        if (k >= 1) {
          f.passed = true;
          if (!f.dodged) {                                   // TRÚNG
            flights.splice(i, 1); m.g.visible = false; m.flame.visible = m.flare.visible = false;
            explosion(T.clone(), 0.75); sfx("hit2", 1); sfx("boom", 0.7);
            stall(rockets[f.to]);
            X.onEnd && X.onEnd(f.to, "hit", f.from);
            continue;
          }
          X.onEnd && X.onEnd(f.to, "miss", f.from);            // né được: bay HỤT, lao tiếp một đoạn rồi nổ
          f.vel.copy(pos).sub(f.prev).divideScalar(Math.max(1e-4, dt));
          if (f.vel.length() < 8) f.vel.setLength(8);
        }
      }
      if (f.passed) {
        f.after += dt; f.vel.multiplyScalar(1 + dt * 0.8);
        pos = m.g.position.clone().addScaledVector(f.vel, dt);
        if (f.after > 1.0) { flights.splice(i, 1); m.g.visible = false; m.flame.visible = m.flare.visible = false; airburst(pos); continue; }
      }
      // hướng mũi theo đường bay
      const vel = pos.clone().sub(f.prev);
      if (vel.lengthSq() > 1e-8) { const q = new THREE.Quaternion().setFromUnitVectors(new V3(1, 0, 0), vel.clone().normalize()); m.g.quaternion.slerp(q, f.t < 0.15 ? 0.25 : 0.6); }
      m.g.position.copy(pos);
      // vệt lửa + khói trắng rải đều theo QUÃNG ĐƯỜNG
      const dist = vel.length(), n = Math.min(20, Math.ceil(dist / 0.1));
      const tail = new V3(-1.25 * (cfg.rocketScale ?? 1) * MOUNT_S, 0, 0).applyQuaternion(m.g.quaternion);
      for (let j = 0; j < n; j++) {
        const p = f.prev.clone().lerp(pos, (j + 1) / n).add(tail);
        fire.emit({ pos: p, vel: new V3(rand(-0.3, 0.3), rand(-0.3, 0.3), rand(-0.3, 0.3)), life: rand(0.15, 0.3), size: 0.45, sizeEnd: 0.08, color: new THREE.Color(4, 1.8, 0.6), colorEnd: new THREE.Color(1.4, 0.2, 0.05), drag: 1 });
        if (j % 2 === 0) smoke.emit({ pos: p.clone(), vel: new V3(rand(-0.2, 0.2), rand(0, 0.3), rand(-0.2, 0.2)), life: rand(1.1, 1.7), size: 0.3, sizeEnd: 1.4, color: new THREE.Color(0.8, 0.8, 0.84), alpha: 0.26, drag: 0.6 });
      }
      m.flame.scale.set(1, 0.85 + Math.random() * 0.3, 1);
      f.prev.copy(pos);
      // còi khoá mục tiêu: bíp thưa khi đang bay, DỒN DẬP trong 1,5 s cuối
      const left = f.dur - f.t;
      if (!f.passed && !f.dodged) { f.beepT -= dt; if (f.beepT <= 0) { sfx("mwarn", left <= MC.window ? 0.9 : 0.5); f.beepT = left <= MC.window ? 0.16 : 0.5; } }
    }
    // tâm ngắm đỏ trên tàu bị nhắm
    reticles.forEach((s, side) => {
      const inc = incoming(side);
      s.visible = inc < Infinity;
      if (!s.visible) return;
      shipPos(rockets[side], s.position);
      const win = inc <= MC.window, pul = 0.5 + 0.5 * Math.sin(G.t * (win ? 18 : 6));
      const sc = (win ? 2.6 : 3.6) * (cfg.rocketScale ?? 1) * (1 + 0.08 * pul);
      s.scale.set(sc, sc, 1); s.material.rotation += dt * (win ? 3 : 1);
      s.material.opacity = 0.5 + 0.5 * pul;
    });
  }

  // ---------------------------------------------------------------- hiệu ứng NẠP (ngầu): năng lượng đỏ hút vào tàu → bùng → quả mới hiện
  const ringGeo = new THREE.RingGeometry(0.9, 1.0, 96);
  const rings = [0, 1, 2, 3].map(() => { const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 0.5, 0.35), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); m.visible = false; scene.add(m); return { m, t: 9, r: null }; });
  function chargeFx(side) {
    const r = rockets[side], c = shipPos(r);
    for (let i = 0; i < 130; i++) {
      const d = new V3(rand(-1, 1), rand(-0.6, 1), rand(-1, 1)).normalize(), R = rand(2.6, 4.8), life = rand(0.34, 0.48);
      fire.emit({ pos: c.clone().addScaledVector(d, R), vel: d.clone().multiplyScalar(-R / life), life, size: rand(0.14, 0.26), sizeEnd: 0.06, color: new THREE.Color(4.5, 0.55, 0.35), colorEnd: new THREE.Color(3, 1.4, 0.6), drag: 0 });
    }
    sfx("mcharge", 1);
    later(0.46, () => {
      const p = shipPos(r);
      burst(p, { n: 140, speed: 11, color: new THREE.Color(5, 0.9, 0.55), colorEnd: new THREE.Color(1.5, 0.1, 0.05), size: 0.22, life: 0.6 });
      rings.slice(0, 2).forEach((o, k) => { const x = rings.find(z => z.t > 1.2) || o; x.t = -k * 0.08; x.r = r; x.m.visible = true; });
      labelOn(r, "MISSILE +1", "#ff6a6a");
      shake(0.25);
      if (UI[side]) { UI[side].resGlowK = 1; }
    });
  }
  function stepRings(dt) {
    rings.forEach(o => {
      if (o.t > 1.2) return;
      o.t += dt; if (o.t < 0) return;
      const k = o.t / 0.7;
      o.m.position.copy(shipPos(o.r)); o.m.quaternion.copy(X.camera.quaternion);
      o.m.scale.setScalar(0.5 + k * 5.5); o.m.material.opacity = Math.max(0, 0.9 * (1 - k));
      if (o.t > 0.7) { o.m.visible = false; o.t = 9; }
    });
  }
  function loadFx(side) {
    const r = rockets[side]; if (!r.mis) return;
    r.mis.ms.g.visible = true; r.mis.ms.g.position.y = 0; r.mis.wantRise = 1; if (r.mis.rise > 0.5) r.mis.rise = 0;
    if (UI[side]) UI[side].load = { t: 0 };
    sfx("mload", 1);
  }
  function clearAll() {
    for (let i = flights.length - 1; i >= 0; i--) { const f = flights[i]; const p = f.m.g.position.clone(); f.m.g.visible = false; f.m.flame.visible = f.m.flare.visible = false; airburst(p, 0.5); }
    flights.length = 0;
  }

  // ---------------------------------------------------------------- nhịp cảnh + chạm
  function tick(dt) {
    for (let i = pending.length - 1; i >= 0; i--) { const p = pending[i]; p.t -= dt; if (p.t <= 0) { pending.splice(i, 1); p.fn(); } }
    rockets.forEach(r => poseMount(r, dt));
    stepFlights(dt); stepRings(dt);
    mGlow.color.setRGB(4.2 * (0.75 + 0.25 * Math.sin(G.t * 6)), 0.35, 0.25);
    UI.forEach((u, side) => tickUI(side, dt));
  }
  function tap(info) {
    const U = UI[info.side]; if (!U) return;
    if (info.kind === "fire") { U.press.fire = 1; if (X.onFire) X.onFire(info.side); }
    else { U.press.boost = 1; if (X.onBoost) X.onBoost(info.side); }
  }
  function refuse(side, kind) { const U = UI[side]; if (!U) return; if (kind === "boost") U.shakeK = 1; else U.press.fire = 1; }

  rockets.forEach(attach);
  return {
    buildConsole, poseRocket, tick, tap,
    api: {
      setArsenal(side, st) { Object.assign(A[side], st); paintAll(side, false); },
      chargeFx, loadFx, launch, dodge, incoming, clearAll, refuse,
      get flights() { return flights.map(f => ({ id: f.id, from: f.from, to: f.to, t: +f.t.toFixed(2), left: +(f.dur - f.t).toFixed(2), dodged: f.dodged, passed: f.passed })); },
      get arsenal() { return A.map(a => ({ ...a })); },
      windowSecs: MC.window
    }
  };
}
