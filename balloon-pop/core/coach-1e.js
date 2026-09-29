// TOA KHÁCH + TOA THAN — bản 1e (29/9/2026)
// • Người ngồi làm lại theo tỉ lệ thật: thân thon eo, cổ, đầu có mũi/cằm/tai, mũ (cao bồi / quả dưa / tóc búi),
//   tay 3 khớp (vai–khuỷu–cổ tay), BÀN TAY có 4 ngón + ngón cái, mỗi ngón 2 đốt cong được.
//   Nhìn qua rèm vải mờ nên thấy như bóng; động tác: nói chuyện (khoa tay, chỉ tay, xoè/nắm), giật mình (giơ 2 tay xoè ngón), ngước nhìn trần.
// • Toa than: toa hở chở đống than đen; thùng rơi trúng ⇒ than văng tung toé (lõi game xử lý trừ điểm).
import * as THREE from "three";

export const COACH_LEN = 7.2, COAL_LEN = 6.6;

export function makeCoach(paintHex, meshAdder, M) {
  const g = new THREE.Group(), add = meshAdder(g);
  const L = COACH_LEN, H = 2.5, D = 1.95, y0 = 1.1;
  const paint = new THREE.MeshPhysicalMaterial({ color: paintHex, metalness: 0.25, roughness: 0.4, clearcoat: 0.5 });
  add(new THREE.BoxGeometry(L, 0.26, 1.5), M.iron, 0, 0.95);
  add(new THREE.BoxGeometry(L, H, 0.08), paint, 0, y0 + H / 2, -D / 2 + 0.04);
  add(new THREE.BoxGeometry(0.08, H, D), paint, -L / 2 + 0.04, y0 + H / 2, 0);
  add(new THREE.BoxGeometry(0.08, H, D), paint, L / 2 - 0.04, y0 + H / 2, 0);
  add(new THREE.BoxGeometry(L, 0.08, D), M.woodDark, 0, y0 + 0.04, 0);
  const roof = add(new THREE.CylinderGeometry(1.25, 1.25, L + 0.3, 24, 1, false, -0.9, 1.8), M.iron, 0, y0 + H - 0.72, 0);
  roof.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(L - 0.2, H - 0.2), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.95, 0.66, 0.36) }));
  glow.position.set(0, y0 + H / 2, -D / 2 + 0.1); g.add(glow);
  const front = new THREE.Mesh(new THREE.PlaneGeometry(L, H), new THREE.MeshStandardMaterial({ map: coachSideTexture(paintHex), alphaTest: 0.5, roughness: 0.45, metalness: 0.15 }));
  front.position.set(0, y0 + H / 2, D / 2); front.castShadow = true; g.add(front);
  const curtain = new THREE.Mesh(new THREE.PlaneGeometry(L - 0.3, H * 0.42), new THREE.MeshStandardMaterial({ color: 0xe9d3a6, transparent: true, opacity: 0.4, roughness: 1, emissive: 0x2a1c0c, depthWrite: false }));
  curtain.position.set(0, y0 + H * 0.62, D / 2 - 0.06); curtain.renderOrder = 3; g.add(curtain);
  for (const bx of [-L / 2 + 1.3, L / 2 - 1.3]) add(new THREE.BoxGeometry(1.7, 0.22, 1.5), M.iron, bx, 0.62);
  return { group: g, y0, roof: y0 + H + 0.53, bogies: [-L / 2 + 1.3, L / 2 - 1.3] };
}

// ---------------------------------------------------------------- người ngồi (đơn vị mét, nhìn nghiêng theo trục x)
const SIL = new THREE.MeshBasicMaterial({ color: 0x160f0a });
function limb(r0, r1, len) { const g = new THREE.CylinderGeometry(r1, r0, len, 10); g.translate(0, -len / 2, 0); return g; }
const GEO = {
  torso: (() => { const pts = [[0.001, 0], [0.13, 0], [0.145, 0.08], [0.14, 0.2], [0.17, 0.36], [0.19, 0.48], [0.18, 0.56], [0.1, 0.61], [0.05, 0.64], [0.001, 0.65]].map(([r, y]) => new THREE.Vector2(r, y));
    const g = new THREE.LatheGeometry(pts, 20); g.scale(1, 1, 0.62); return g; })(),
  neck: limb(0.05, 0.045, 0.16),
  skull: (() => { const g = new THREE.SphereGeometry(0.105, 20, 16); g.scale(1, 1.12, 0.92); return g; })(),
  jaw: (() => { const g = new THREE.SphereGeometry(0.075, 16, 12); g.scale(1.05, 0.8, 0.85); return g; })(),
  nose: new THREE.ConeGeometry(0.022, 0.05, 8),
  ear: (() => { const g = new THREE.SphereGeometry(0.025, 8, 6); g.scale(0.6, 1.2, 0.4); return g; })(),
  brim: new THREE.CylinderGeometry(0.21, 0.21, 0.028, 24),
  crown: new THREE.CylinderGeometry(0.085, 0.1, 0.13, 18),
  bowler: new THREE.SphereGeometry(0.11, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2),
  bun: new THREE.SphereGeometry(0.055, 12, 10),
  upper: limb(0.048, 0.04, 0.27),
  fore: limb(0.04, 0.032, 0.24),
  palm: (() => { const g = new THREE.BoxGeometry(0.08, 0.085, 0.028); g.translate(0, -0.042, 0); return g; })(),
  seg1: limb(0.0095, 0.0085, 0.038),
  seg2: limb(0.0085, 0.0072, 0.03),
  thumb1: limb(0.011, 0.0095, 0.035),
  thumb2: limb(0.0095, 0.008, 0.03),
  thigh: limb(0.075, 0.06, 0.4),
};
function hand(parent) {
  const h = new THREE.Group(); parent.add(h);
  h.add(new THREE.Mesh(GEO.palm, SIL));
  const fingers = [];
  const len = [0.95, 1.05, 1.0, 0.82];
  [-0.03, -0.01, 0.01, 0.03].forEach((x, i) => {
    const k1 = new THREE.Group(); k1.position.set(x, -0.085, 0); h.add(k1);
    const s1 = new THREE.Mesh(GEO.seg1, SIL); s1.scale.y = len[i]; k1.add(s1);
    const k2 = new THREE.Group(); k2.position.y = -0.038 * len[i]; k1.add(k2);
    const s2 = new THREE.Mesh(GEO.seg2, SIL); s2.scale.y = len[i]; k2.add(s2);
    fingers.push({ k1, k2 });
  });
  const t1 = new THREE.Group(); t1.position.set(0.04, -0.02, 0.012); t1.rotation.z = 0.7; h.add(t1);
  t1.add(new THREE.Mesh(GEO.thumb1, SIL));
  const t2 = new THREE.Group(); t2.position.y = -0.035; t1.add(t2); t2.add(new THREE.Mesh(GEO.thumb2, SIL));
  return { h, fingers, t1, t2 };
}
// gắn bộ phận vào khung và TRẢ VỀ bộ phận (Object3D.add trả về khung cha — dùng thẳng .position sẽ dời cả khung)
function part(parent, geo) { const m = new THREE.Mesh(geo, SIL); parent.add(m); return m; }
function person(face, kind) {
  const p = new THREE.Group();
  const torso = new THREE.Mesh(GEO.torso, SIL); p.add(torso);
  for (const z of [-0.08, 0.08]) { const t = new THREE.Mesh(GEO.thigh, SIL); t.position.set(0, 0.02, z); t.rotation.z = face * Math.PI / 2; p.add(t); }
  const neck = new THREE.Mesh(GEO.neck, SIL); neck.position.y = 0.72; neck.rotation.z = Math.PI; p.add(neck);
  const head = new THREE.Group(); head.position.y = 0.82; p.add(head);
  part(head, GEO.skull).position.set(-face * 0.01, 0.07, 0);
  part(head, GEO.jaw).position.set(face * 0.025, 0.0, 0);
  const nose = new THREE.Mesh(GEO.nose, SIL); nose.rotation.z = -face * Math.PI / 2; nose.position.set(face * 0.11, 0.06, 0); head.add(nose);
  for (const z of [-0.095, 0.095]) part(head, GEO.ear).position.set(-face * 0.01, 0.06, z);
  if (kind === "cowboy") {
    const brim = new THREE.Mesh(GEO.brim, SIL); brim.position.y = 0.15; brim.rotation.z = face * 0.08; head.add(brim);
    part(head, GEO.crown).position.y = 0.22;
  } else if (kind === "bowler") {
    const brim = new THREE.Mesh(GEO.brim, SIL); brim.scale.set(0.7, 1, 0.7); brim.position.y = 0.14; head.add(brim);
    part(head, GEO.bowler).position.y = 0.14;
  } else {
    part(head, GEO.bun).position.set(-face * 0.1, 0.13, 0);
  }
  const arms = [];
  for (const z of [0.2, -0.2]) {
    const sh = new THREE.Group(); sh.position.set(0, 0.56, z); p.add(sh);
    sh.add(new THREE.Mesh(GEO.upper, SIL));
    const el = new THREE.Group(); el.position.y = -0.27; sh.add(el);
    el.add(new THREE.Mesh(GEO.fore, SIL));
    const wr = new THREE.Group(); wr.position.y = -0.24; el.add(wr);
    arms.push({ sh, el, wr, hand: hand(wr) });
  }
  return { p, head, arms };
}

export function addPassengers(coach, y0) {
  const people = [];
  const kinds = ["cowboy", "bowler", "lady", "cowboy"];
  const seats = [[-2.5, 1], [-1.35, -1], [0.9, 1], [2.1, -1]];
  seats.forEach(([x, face], i) => {
    if (Math.random() < 0.15) return;                     // thỉnh thoảng một ghế trống
    const q = person(face, kinds[(i + Math.floor(Math.random() * 3)) % 4]);
    q.p.position.set(x, y0 + 0.7, 0.1); q.p.scale.setScalar(1.18);
    coach.add(q.p);
    people.push({ ...q, face, y0: q.p.position.y, ph: Math.random() * 6, spk: Math.random() * 6, style: Math.floor(Math.random() * 3) });
  });
  return people;
}

// talk ⇄ startle: giật mình (nhổm, 2 tay giơ xoè ngón) → ngước nhìn trần → nói tiếp
export function animatePassengers(people, time, startleT) {
  for (const q of people) {
    const f = q.face;
    let jump = 0, armUp = 0, lookUp = 0, talk = 1;
    if (startleT != null && startleT < 2.3) {
      const s = startleT;
      jump = s < 0.35 ? Math.sin(s / 0.35 * Math.PI) * 0.06 : 0;
      armUp = s < 0.8 ? Math.min(1, s / 0.12) : Math.max(0, 1 - (s - 0.8) / 0.5);
      lookUp = s < 0.3 ? 0 : s < 1.9 ? Math.min(1, (s - 0.3) / 0.3) : Math.max(0, 1 - (s - 1.9) / 0.4);
      talk = s < 1.9 ? 0 : (s - 1.9) / 0.4;
    }
    const speaking = Math.sin(time * 0.55 + q.spk) > 0.15, g = speaking ? 1 : 0.2;
    q.p.position.y = q.y0 + jump;
    q.head.rotation.z = talk * f * 0.07 * Math.sin(time * 4.5 + q.ph) * g + lookUp * 0.6 * f;
    q.p.rotation.z = talk * f * 0.03 * Math.sin(time * 1.3 + q.ph);
    q.arms.forEach((a, i) => {
      // người đang nói: tay trước khoa, tay sau chỉ/nhấn nhá; người nghe: tay đặt trên đùi
      const w = i === 0 ? Math.max(0, Math.sin(time * 2.8 + q.ph)) : Math.max(0, Math.sin(time * 2.1 + q.ph + 2)) * 0.5;
      const k = talk * g * w;
      a.sh.rotation.z = f * ((0.35 + k * 1.0) * (1 - armUp) + armUp * 2.7);
      a.el.rotation.z = f * ((1.2 + k * 0.6) * (1 - armUp) + armUp * 0.25);
      a.wr.rotation.z = f * (0.2 * Math.sin(time * 3 + q.ph + i) * k - armUp * 0.3);
      // ngón tay: nghe = hơi cong; nói = xoè/chỉ/nắm theo "tính cách"; giật mình = xoè thẳng
      a.hand.fingers.forEach((fg, j) => {
        let c = 0.6;
        if (k > 0.2) c = q.style === 0 ? 0.15 : q.style === 1 ? (j === 0 ? 0.05 : 1.3) : 0.3 + 0.5 * Math.sin(time * 5 + j);
        c = c * (1 - armUp) - armUp * 0.08;
        fg.k1.rotation.z = f * c; fg.k2.rotation.z = f * c * 1.1;
      });
      a.hand.t1.rotation.z = 0.7 - armUp * 0.4; a.hand.t2.rotation.z = (1 - armUp) * 0.4;
    });
  }
}

// ---------------------------------------------------------------- toa than
const COAL_MAT = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.45, metalness: 0.35 });
export const COAL_LUMP = (() => { const g = new THREE.DodecahedronGeometry(0.16, 0); return g; })();
export function coalMaterial() { return COAL_MAT; }
export function makeCoalCar(meshAdder, M, paintHex) {
  const g = new THREE.Group(), add = meshAdder(g);
  const L = COAL_LEN, y0 = 1.1, H = 1.25, D = 1.9;
  const side = new THREE.MeshStandardMaterial({ color: paintHex, roughness: 0.75, metalness: 0.3 });
  add(new THREE.BoxGeometry(L, 0.26, 1.5), M.iron, 0, 0.95);
  add(new THREE.BoxGeometry(L, 0.12, D), M.iron, 0, y0 + 0.06);
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(L, H, 0.1), side, 0, y0 + H / 2, s * (D / 2 - 0.05));
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.1, H, D), side, s * (L / 2 - 0.05), y0 + H / 2, 0);
  // gân sắt dọc hông
  for (let i = 0; i <= 6; i++) for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.08, H, 0.04), M.iron, -L / 2 + 0.2 + i * (L - 0.4) / 6, y0 + H / 2, s * (D / 2 + 0.01));
  // đống than: gò + nhiều cục than trên mặt
  const heap = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), COAL_MAT);
  heap.scale.set(L / 2 - 0.2, 0.75, D / 2 - 0.12); heap.position.y = y0 + H - 0.25; heap.receiveShadow = true; g.add(heap);
  const n = 70, lumps = new THREE.InstancedMesh(COAL_LUMP, COAL_MAT, n), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  for (let i = 0; i < n; i++) {
    const u = Math.random() * 2 - 1, v = Math.random() * 2 - 1; if (u * u + v * v > 1) { i--; continue; }
    const x = u * (L / 2 - 0.3), z = v * (D / 2 - 0.2), y = y0 + H - 0.25 + 0.75 * Math.sqrt(Math.max(0, 1 - u * u - v * v));
    m4.compose(new THREE.Vector3(x, y, z), q.setFromEuler(e.set(Math.random() * 3, Math.random() * 3, Math.random() * 3)), new THREE.Vector3(1, 1, 1).multiplyScalar(0.6 + Math.random() * 0.9));
    lumps.setMatrixAt(i, m4);
  }
  lumps.castShadow = true; g.add(lumps);
  for (const bx of [-L / 2 + 1.2, L / 2 - 1.2]) add(new THREE.BoxGeometry(1.7, 0.22, 1.5), M.iron, bx, 0.62);
  return { group: g, roof: y0 + H + 0.45, bogies: [-L / 2 + 1.2, L / 2 - 1.2] };
}

function coachSideTexture(paintHex) {
  const c = document.createElement("canvas"); c.width = 1024; c.height = 356;
  const ctx = c.getContext("2d"), w = c.width, h = c.height;
  ctx.fillStyle = "#" + new THREE.Color(paintHex).getHexString(); ctx.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 16) { ctx.fillStyle = "rgba(0,0,0,.14)"; ctx.fillRect(x, 0, 2, h); }
  ctx.strokeStyle = "#d9b25a"; ctx.lineWidth = 5; ctx.strokeRect(10, 10, w - 20, h - 20);
  ctx.lineWidth = 2; ctx.strokeRect(22, 22, w - 44, h - 44);
  ctx.fillStyle = "#d9b25a"; ctx.fillRect(22, h * 0.8, w - 44, 4);
  const n = 6, ww = 104, wh = 128, gap = (w - n * ww) / (n + 1), wy = h * 0.2;
  for (let i = 0; i < n; i++) {
    const x = gap + i * (ww + gap);
    ctx.fillStyle = "#3b2414"; ctx.beginPath(); ctx.roundRect(x - 9, wy - 9, ww + 18, wh + 18, 16); ctx.fill();
    ctx.save(); ctx.globalCompositeOperation = "destination-out"; ctx.beginPath(); ctx.roundRect(x, wy, ww, wh, 12); ctx.fill(); ctx.restore();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

// tài nguyên dùng chung giữa các toa: disposeTree() của lõi game không được huỷ
Object.values(GEO).forEach(g => { g.userData.shared = true; });
[SIL, COAL_MAT, COAL_LUMP].forEach(x => { x.userData.shared = true; });
