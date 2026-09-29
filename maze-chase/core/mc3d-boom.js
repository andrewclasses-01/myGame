// MAZE CHASE 3D — VỤ NỔ + XÁC ROBOT (mẫu 1e, 29/9/2026). Thầy: "tạo vụ nổ phải siêu chân thực, khói lửa như thật";
// "robot nổ tung ra nhiều mảnh nằm rải rác trên sàn gần vị trí nổ, các mảnh cháy đen và bốc khói".
// explode(x, z): chớp sáng (đèn điểm có sẵn — KHÔNG thêm/bớt đèn giữa trận vì three.js dịch lại shader ⇒ khựng) + cầu lửa HDR
//   (trắng→vàng→cam→đỏ sẫm, bloom ăn) + khói đen cuộn bốc lên tan chậm + tàn lửa + sóng xung kích sát sàn + vết cháy xém.
// wreck(x, z, color): mảnh vỡ văng ra có vật lý (rơi, nảy, lăn, dừng), nguội từ đỏ than sang đen, bốc khói mãi tới hết câu.
import * as THREE from "three";

function tex(size, draw) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  draw(c.getContext("2d"), size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function blobTex(soft, holes) {     // cụm mây/lửa cuộn: đốm to + đốm nhỏ + lỗ thủng mờ ⇒ có "thớ", không phải quả cầu sáng trơn
  return tex(256, (g, s) => {
    const puff = (x, y, r, a) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(0.6, `rgba(255,255,255,${a * 0.45})`); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };
    for (let i = 0; i < 18; i++) { const a = Math.random() * 7, d = Math.random() * s * 0.16; puff(s / 2 + Math.cos(a) * d, s / 2 + Math.sin(a) * d, s * (0.14 + Math.random() * 0.16), soft); }
    for (let i = 0; i < 60; i++) { const a = Math.random() * 7, d = Math.random() * s * 0.3; puff(s / 2 + Math.cos(a) * d, s / 2 + Math.sin(a) * d, s * (0.03 + Math.random() * 0.06), soft * 0.8); }
    g.globalCompositeOperation = "destination-out";
    for (let i = 0; i < holes; i++) { const a = Math.random() * 7, d = Math.random() * s * 0.3; puff(s / 2 + Math.cos(a) * d, s / 2 + Math.sin(a) * d, s * (0.03 + Math.random() * 0.05), 0.5); }
    g.globalCompositeOperation = "source-over";
  });
}

export function createBoomFX(scene) {
  const fireTexes = [blobTex(0.6, 26), blobTex(0.6, 26), blobTex(0.6, 26)], smokeTexes = [blobTex(0.42, 18), blobTex(0.42, 18), blobTex(0.42, 18)];
  const fireTex = fireTexes[0];
  const scorchTex = tex(256, (g, s) => {
    for (let i = 0; i < 40; i++) {
      const a = Math.random() * 7, d = Math.random() * s * 0.22, r = s * (0.08 + Math.random() * 0.2);
      const x = s / 2 + Math.cos(a) * d, y = s / 2 + Math.sin(a) * d, gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, "rgba(10,8,6,.55)"); gr.addColorStop(1, "rgba(10,8,6,0)"); g.fillStyle = gr; g.fillRect(0, 0, s, s);
    }
    g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 2;   // vệt tia xém
    for (let i = 0; i < 30; i++) { const a = Math.random() * 7, r0 = s * 0.12, r1 = s * (0.3 + Math.random() * 0.18); g.beginPath(); g.moveTo(s / 2 + Math.cos(a) * r0, s / 2 + Math.sin(a) * r0); g.lineTo(s / 2 + Math.cos(a) * r1, s / 2 + Math.sin(a) * r1); g.stroke(); }
  });
  const ringTex = tex(256, (g, s) => {
    const gr = g.createRadialGradient(s / 2, s / 2, s * 0.3, s / 2, s / 2, s / 2);
    gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.75, "rgba(255,220,170,.9)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, s, s);
  });

  // ---- bể hạt dạng sprite (lửa: cộng sáng; khói: che phủ thường)
  const group = new THREE.Group(); scene.add(group);
  const mkPool = (n, additive, maps) => Array.from({ length: n }, (_, i) => { const map = maps[i % maps.length];
    const m = new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, rotation: Math.random() * 7 });
    const s = new THREE.Sprite(m); s.visible = false; group.add(s);
    return { s, m, life: 0, max: 1, vx: 0, vy: 0, vz: 0, s0: 1, s1: 1, spin: 0, kind: "" };
  });
  // lửa: PHỦ (không cộng sáng) — cộng sáng nhiều lớp chồng nhau ⇒ trắng kem như mây (đã thử); chỉ LÕI chớp đầu tiên là cộng sáng
  const fire = mkPool(90, false, fireTexes), smoke = mkPool(220, false, smokeTexes), core = mkPool(10, true, fireTexes);
  fire.forEach(p => { p.s.renderOrder = 8; }); smoke.forEach(p => { p.s.renderOrder = 7; }); core.forEach(p => { p.s.renderOrder = 9; });
  let fi = 0, si = 0;
  const FIRE_COL = [[1, 0.78, 0.38, 2.2], [1, 0.5, 0.12, 1.9], [0.92, 0.26, 0.05, 1.4], [0.42, 0.1, 0.03, 0.75], [0.1, 0.07, 0.06, 0.45]];   // vàng cam → cam đỏ → đỏ sẫm → khói nâu
  function fireColor(u, out) {          // u 0→1 dọc đời hạt; nhân > 1 ⇒ sáng HDR cho bloom
    const k = Math.min(FIRE_COL.length - 1.001, u * (FIRE_COL.length - 1)), i = Math.floor(k), f = k - i, a = FIRE_COL[i], b = FIRE_COL[i + 1];
    const m = a[3] + (b[3] - a[3]) * f;
    out.setRGB((a[0] + (b[0] - a[0]) * f) * m, (a[1] + (b[1] - a[1]) * f) * m, (a[2] + (b[2] - a[2]) * f) * m);
  }
  function spawnFire(x, y, z, big = 1) {
    const p = fire[fi++ % fire.length];
    const a = Math.random() * 7, sp = (2 + Math.random() * 5) * big;
    Object.assign(p, { life: 0, max: 0.55 + Math.random() * 0.55, vx: Math.cos(a) * sp, vy: 1.5 + Math.random() * 4.5, vz: Math.sin(a) * sp,
      s0: (0.7 + Math.random() * 0.9) * big, s1: (2.6 + Math.random() * 2.2) * big, spin: (Math.random() - 0.5) * 2, kind: "fire" });
    p.s.position.set(x + (Math.random() - 0.5) * 0.8, y + Math.random() * 0.6, z + (Math.random() - 0.5) * 0.8); p.s.visible = true;
  }
  function spawnSmoke(x, y, z, o = {}) {
    const p = smoke[si++ % smoke.length];
    const a = Math.random() * 7, sp = o.spread ?? (1 + Math.random() * 3);
    const grey = o.grey ?? (0.07 + Math.random() * 0.1);
    Object.assign(p, { life: -(o.delay || 0), max: o.max ?? (2.8 + Math.random() * 2.4), vx: Math.cos(a) * sp, vy: o.rise ?? (1.2 + Math.random() * 1.8), vz: Math.sin(a) * sp,
      s0: o.s0 ?? (1.5 + Math.random()), s1: o.s1 ?? (6 + Math.random() * 4), spin: (Math.random() - 0.5) * 0.8, kind: "smoke", op: o.op ?? 0.8 });
    p.m.color.setRGB(grey, grey, grey * 1.05);
    p.s.position.set(x + (Math.random() - 0.5) * 0.6, y, z + (Math.random() - 0.5) * 0.6); p.s.visible = false;
  }

  // ---- đèn chớp (thêm một lần lúc tạo, cường độ 0 khi rảnh)
  const flash = new THREE.PointLight(0xffa24a, 0, 34, 1.6); flash.position.set(0, 3, 0); scene.add(flash);
  let flashT = 9;

  // ---- sóng xung kích + vết xém + tàn lửa
  const rings = [], scorches = [];
  const ringGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  const sparks = [];
  const sparkGeo = new THREE.BufferGeometry(), NS = 260, sPos = new Float32Array(NS * 3), sCol = new Float32Array(NS * 3), sVel = new Float32Array(NS * 3), sLife = new Float32Array(NS);
  sparkGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3)); sparkGeo.setAttribute("color", new THREE.BufferAttribute(sCol, 3));
  const sparkPts = new THREE.Points(sparkGeo, new THREE.PointsMaterial({ size: 0.28, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, map: fireTex }));
  sparkPts.frustumCulled = false; sparkPts.renderOrder = 9; scene.add(sparkPts);
  let spi = 0;

  // ---- xác robot
  const wrecks = [];
  const FRAG_GEOS = [new THREE.BoxGeometry(0.5, 0.18, 0.4), new THREE.TetrahedronGeometry(0.34), new THREE.BoxGeometry(0.3, 0.3, 0.3),
    new THREE.SphereGeometry(0.4, 10, 6, 0, Math.PI, 0, Math.PI / 2), new THREE.TorusGeometry(0.3, 0.06, 6, 12, Math.PI), new THREE.CylinderGeometry(0.06, 0.06, 0.6, 6),
    new THREE.ConeGeometry(0.12, 0.4, 6), new THREE.BoxGeometry(0.6, 0.08, 0.25)];

  function explode(x, z, power = 1) {
    flash.position.set(x, 2.5, z); flashT = 0;
    for (let i = 0; i < core.length; i++) {                         // lõi chớp trắng-vàng, rất ngắn
      const p = core[i]; Object.assign(p, { life: 0, max: 0.16 + Math.random() * 0.12, vx: 0, vy: 0, vz: 0, s0: 1.5, s1: 4 + Math.random() * 2, spin: 0, kind: "core" });
      p.s.position.set(x + (Math.random() - 0.5), 1 + Math.random(), z + (Math.random() - 0.5)); p.s.visible = true;
    }
    for (let i = 0; i < 30 * power; i++) spawnFire(x, 0.6, z, power);
    for (let i = 0; i < 40 * power; i++) spawnSmoke(x, 0.8, z, { delay: 0.12 + Math.random() * 0.4, spread: 1.2 + Math.random() * 3, grey: 0.04 + Math.random() * 0.07, op: 0.9 });
    for (let i = 0; i < 14; i++) spawnSmoke(x, 0.2, z, { delay: 0.02, spread: 6 + Math.random() * 3, rise: 0.25, s0: 1, s1: 4, max: 1.8, grey: 0.25, op: 0.5 });   // bụi quét sàn
    for (let i = 0; i < 120 * power; i++) {
      const k = spi++ % NS, a = Math.random() * 7, sp = 6 + Math.random() * 14, up = 3 + Math.random() * 11;
      sPos.set([x, 0.8, z], k * 3); sVel.set([Math.cos(a) * sp, up, Math.sin(a) * sp], k * 3); sLife[k] = 0.6 + Math.random() * 1.2;
    }
    const rm = new THREE.MeshBasicMaterial({ map: ringTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffd9a0 });
    const ring = new THREE.Mesh(ringGeo, rm); ring.position.set(x, 0.12, z); ring.renderOrder = 6; scene.add(ring); rings.push({ m: ring, t: 0 });
    const sc = new THREE.Mesh(new THREE.PlaneGeometry(9, 9).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ map: scorchTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    sc.position.set(x, 0.03, z); sc.rotation.y = Math.random() * 7; scene.add(sc); scorches.push(sc);
  }

  function wreck(x, z, color) {
    const C = new THREE.Color(color), frags = [];
    for (let i = 0; i < 16; i++) {
      const hull = i % 3 !== 2;
      const mat = new THREE.MeshStandardMaterial({ color: hull ? C.clone() : new THREE.Color(0x2a2d38), metalness: 0.5, roughness: 0.45,
        emissive: new THREE.Color(0xff5a14), emissiveIntensity: 1.1, envMapIntensity: 0.3 });
      const m = new THREE.Mesh(FRAG_GEOS[i % FRAG_GEOS.length], mat); m.castShadow = true;
      m.scale.setScalar(0.8 + Math.random() * 0.7);
      m.position.set(x + (Math.random() - 0.5) * 0.6, 1.3 + Math.random() * 0.4, z + (Math.random() - 0.5) * 0.6);
      m.rotation.set(Math.random() * 7, Math.random() * 7, Math.random() * 7);
      scene.add(m);
      const a = Math.random() * 7, sp = 1.4 + Math.random() * 2.8;     // văng gần: nằm rải rác quanh chỗ nổ
      frags.push({ m, mat, vx: Math.cos(a) * sp, vy: 3.5 + Math.random() * 4.5, vz: Math.sin(a) * sp,
        wx: (Math.random() - 0.5) * 14, wy: (Math.random() - 0.5) * 14, wz: (Math.random() - 0.5) * 14, rest: false, base: mat.color.clone(), smokeT: Math.random() });
    }
    wrecks.push({ x, z, frags, t: 0, plumeT: 0 });
  }

  const _c = new THREE.Color(), CHAR = new THREE.Color(0x121212);
  function update(dt) {
    // chớp
    if (flashT < 1) { flashT += dt; flash.intensity = Math.max(0, 380 * Math.pow(1 - Math.min(1, flashT / 0.5), 2.2) * (0.85 + Math.random() * 0.3)); }
    else flash.intensity = 0;
    // lửa
    for (const p of fire) {
      if (!p.s.visible) continue;
      p.life += dt; const u = p.life / p.max;
      if (u >= 1) { p.s.visible = false; continue; }
      p.vx *= 1 - 3 * dt; p.vz *= 1 - 3 * dt; p.vy = p.vy * (1 - 1.5 * dt) + 2.2 * dt;
      p.s.position.x += p.vx * dt; p.s.position.y += p.vy * dt; p.s.position.z += p.vz * dt;
      p.s.scale.setScalar(p.s0 + (p.s1 - p.s0) * (1 - Math.pow(1 - u, 2.5)));
      fireColor(u, p.m.color); p.m.opacity = u < 0.06 ? u / 0.06 : 0.95 * (1 - Math.pow(u, 2.2));
      p.m.rotation += p.spin * dt;
    }
    for (const p of core) {
      if (!p.s.visible) continue;
      p.life += dt; const u = p.life / p.max;
      if (u >= 1) { p.s.visible = false; continue; }
      p.s.scale.setScalar(p.s0 + (p.s1 - p.s0) * u); p.m.color.setRGB(2.2, 1.6, 0.9); p.m.opacity = 0.55 * (1 - u);
    }
    // khói
    for (const p of smoke) {
      if (p.life < p.max && p.kind === "smoke") {
        p.life += dt;
        if (p.life < 0) continue;
        p.s.visible = true;
        const u = p.life / p.max;
        if (u >= 1) { p.s.visible = false; p.kind = ""; continue; }
        p.vx *= 1 - 1.6 * dt; p.vz *= 1 - 1.6 * dt; p.vy *= 1 - 0.35 * dt;
        p.s.position.x += p.vx * dt + 0.25 * dt; p.s.position.y += p.vy * dt; p.s.position.z += p.vz * dt;
        p.s.scale.setScalar(p.s0 + (p.s1 - p.s0) * Math.sqrt(u));
        p.m.opacity = p.op * (u < 0.12 ? u / 0.12 : Math.pow(1 - u, 1.4));
        p.m.rotation += p.spin * dt;
      }
    }
    // tàn lửa
    for (let k = 0; k < NS; k++) {
      if (sLife[k] <= 0) { sCol[k * 3] = sCol[k * 3 + 1] = sCol[k * 3 + 2] = 0; continue; }
      sLife[k] -= dt;
      sVel[k * 3 + 1] -= 18 * dt;
      for (let a = 0; a < 3; a++) { sVel[k * 3 + a] *= 1 - 0.8 * dt; sPos[k * 3 + a] += sVel[k * 3 + a] * dt; }
      if (sPos[k * 3 + 1] < 0.05) { sPos[k * 3 + 1] = 0.05; sVel[k * 3 + 1] *= -0.3; }
      const h = Math.min(1, sLife[k]); sCol[k * 3] = 3 * h; sCol[k * 3 + 1] = 1.3 * h * h; sCol[k * 3 + 2] = 0.3 * h * h * h;
    }
    sparkGeo.attributes.position.needsUpdate = true; sparkGeo.attributes.color.needsUpdate = true;
    // sóng xung kích
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i]; r.t += dt; const u = r.t / 0.45;
      if (u >= 1) { scene.remove(r.m); r.m.material.dispose(); rings.splice(i, 1); continue; }
      const s = 1 + 16 * (1 - Math.pow(1 - u, 3)); r.m.scale.set(s, 1, s); r.m.material.opacity = 1 - u;
    }
    // xác robot: vật lý mảnh + nguội dần + khói
    for (const w of wrecks) {
      w.t += dt;
      for (const f of w.frags) {
        if (!f.rest) {
          f.vy -= 22 * dt;
          f.m.position.x += f.vx * dt; f.m.position.y += f.vy * dt; f.m.position.z += f.vz * dt;
          f.m.rotation.x += f.wx * dt; f.m.rotation.y += f.wy * dt; f.m.rotation.z += f.wz * dt;
          const floorY = 0.12 * f.m.scale.x;
          if (f.m.position.y < floorY) {
            f.m.position.y = floorY; f.vy *= -0.32; f.vx *= 0.55; f.vz *= 0.55; f.wx *= 0.5; f.wy *= 0.5; f.wz *= 0.5;
            if (Math.abs(f.vy) < 0.8 && Math.hypot(f.vx, f.vz) < 0.4) { f.rest = true; f.m.rotation.x = Math.round(f.m.rotation.x / (Math.PI / 2)) * Math.PI / 2 * 0.7 + f.m.rotation.x * 0.3; }
          }
        }
        const cool = Math.min(1, w.t / 2.2);                          // nguội: đỏ than → đen xém
        f.mat.color.copy(_c.copy(f.base).lerp(CHAR, Math.min(1, w.t / 0.9)));
        f.mat.emissiveIntensity = 1.1 * Math.pow(1 - cool, 2) + (Math.sin(w.t * 3 + f.smokeT * 9) > 0.96 ? 0.6 : 0) * (1 - cool * 0.7);
        f.mat.roughness = 0.45 + 0.5 * Math.min(1, w.t / 1.4);
        f.smokeT -= dt;
        if (f.rest && f.smokeT <= 0) {                                // mỗi mảnh thỉnh thoảng nhả một làn khói mảnh
          f.smokeT = 0.5 + Math.random() * 1.1;
          spawnSmoke(f.m.position.x, f.m.position.y + 0.2, f.m.position.z, { spread: 0.3, rise: 1 + Math.random(), s0: 0.4, s1: 2.6, max: 2.6, grey: 0.12, op: 0.55 });
        }
      }
      w.plumeT -= dt;
      if (w.plumeT <= 0) {                                             // cột khói chính trên đống xác
        w.plumeT = 0.22;
        spawnSmoke(w.x + (Math.random() - 0.5), 0.5, w.z + (Math.random() - 0.5), { spread: 0.4, rise: 1.6 + Math.random() * 0.8, s0: 0.9, s1: 5, max: 3.6, grey: 0.09, op: 0.6 });
      }
    }
  }

  function clear() {
    wrecks.forEach(w => w.frags.forEach(f => { scene.remove(f.m); f.mat.dispose(); }));
    wrecks.length = 0;
    scorches.forEach(s => { scene.remove(s); s.material.dispose(); s.geometry.dispose(); }); scorches.length = 0;
    rings.forEach(r => { scene.remove(r.m); r.m.material.dispose(); }); rings.length = 0;
    fire.forEach(p => { p.s.visible = false; }); core.forEach(p => { p.s.visible = false; }); smoke.forEach(p => { p.s.visible = false; p.kind = ""; }); sLife.fill(0);
    flash.intensity = 0; flashT = 9;
  }
  return { explode, wreck, update, clear };
}

// ---- quả bom đặt trên sàn: thân cầu thép đen + chóp + ngòi có tia lửa + đèn đỏ nhấp nháy + vòng cảnh báo sàn
export function makeBomb() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.62, 28, 20), new THREE.MeshStandardMaterial({ color: 0x15171d, metalness: 0.6, roughness: 0.35 }));
  body.position.y = 0.62; body.castShadow = true; g.add(body);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.05, 8, 32), new THREE.MeshStandardMaterial({ color: 0x5b606e, metalness: 0.9, roughness: 0.3 }));
  band.position.y = 0.62; band.rotation.x = Math.PI / 2; g.add(band);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.22, 16), new THREE.MeshStandardMaterial({ color: 0x8a8f9c, metalness: 0.9, roughness: 0.25 }));
  cap.position.y = 1.28; g.add(cap);
  const fuse = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 1.38, 0), new THREE.Vector3(0.12, 1.6, 0.05), new THREE.Vector3(0.28, 1.68, 0.1)]), 12, 0.035, 6),
    new THREE.MeshStandardMaterial({ color: 0x8b6b3d, roughness: 0.9 }));
  g.add(fuse);
  const spark = new THREE.Sprite(new THREE.SpriteMaterial({ color: new THREE.Color(4, 2.4, 0.8), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    map: (() => { const c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d"); const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "#fff"); gr.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })() }));
  spark.position.set(0.28, 1.7, 0.1); spark.scale.setScalar(0.6); g.add(spark);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), new THREE.MeshStandardMaterial({ color: 0x300000, emissive: 0xff2020, emissiveIntensity: 3 }));
  led.position.set(0, 0.95, 0.5); g.add(led);
  const warn = new THREE.Mesh(new THREE.RingGeometry(1.25, 1.5, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0.5, depthWrite: false }));
  warn.position.y = 0.06; g.add(warn);
  g.scale.setScalar(1.25);
  return { g, spark, led, warn };
}
