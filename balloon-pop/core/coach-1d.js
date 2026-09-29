// TOA KHÁCH có người ngồi (1d, 29/9/2026): cửa sổ che rèm vải mờ, chỉ thấy BÓNG người (đội mũ cao bồi) nhờ đèn trong toa.
// Bình thường: nói chuyện, khoa tay bàn bạc. Có thùng rơi trúng tàu: giật mình (nhổm lên, giơ tay), ngước nhìn trần, rồi nói tiếp.
import * as THREE from "three";

export const COACH_LEN = 7.2;

export function makeCoach(paintHex, meshAdder, M) {
  const g = new THREE.Group(), add = meshAdder(g);
  const L = COACH_LEN, H = 2.5, D = 1.95, y0 = 1.1;
  const paint = new THREE.MeshPhysicalMaterial({ color: paintHex, metalness: 0.25, roughness: 0.4, clearcoat: 0.5 });
  add(new THREE.BoxGeometry(L, 0.26, 1.5), M.iron, 0, 0.95);
  // vách sau + 2 đầu + sàn + mái vòm (vách trước là tấm có lỗ cửa sổ)
  add(new THREE.BoxGeometry(L, H, 0.08), paint, 0, y0 + H / 2, -D / 2 + 0.04);
  add(new THREE.BoxGeometry(0.08, H, D), paint, -L / 2 + 0.04, y0 + H / 2, 0);
  add(new THREE.BoxGeometry(0.08, H, D), paint, L / 2 - 0.04, y0 + H / 2, 0);
  add(new THREE.BoxGeometry(L, 0.08, D), M.woodDark, 0, y0 + 0.04, 0);
  const roof = add(new THREE.CylinderGeometry(1.25, 1.25, L + 0.3, 24, 1, false, -0.9, 1.8), M.iron, 0, y0 + H - 0.72, 0);
  roof.rotation.set(-Math.PI / 2, 0, Math.PI / 2);   // trục dọc theo toa, vòm quay lên trên
  // tường trong phát sáng ấm (đèn dầu trong toa) — làm nền cho bóng người hiện lên rèm
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(L - 0.2, H - 0.2), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.95, 0.66, 0.36) }));
  glow.position.set(0, y0 + H / 2, -D / 2 + 0.1); g.add(glow);
  // vách trước có cửa sổ (kết cấu có lỗ trong suốt)
  const front = new THREE.Mesh(new THREE.PlaneGeometry(L, H), new THREE.MeshStandardMaterial({ map: coachSideTexture(paintHex), alphaTest: 0.5, roughness: 0.45, metalness: 0.15 }));
  front.position.set(0, y0 + H / 2, D / 2); front.castShadow = true; g.add(front);
  // rèm vải mờ ngay sau cửa sổ
  const curtain = new THREE.Mesh(new THREE.PlaneGeometry(L - 0.3, H * 0.42), new THREE.MeshStandardMaterial({ color: 0xe9d3a6, transparent: true, opacity: 0.42, roughness: 1, emissive: 0x2a1c0c, depthWrite: false }));
  curtain.position.set(0, y0 + H * 0.62, D / 2 - 0.06); curtain.renderOrder = 3; g.add(curtain);
  // bánh 2 giá chuyển hướng
  return { group: g, paint, y0 };
}

// người ngồi (bóng tối) — 4 người ngồi từng cặp đối diện
export function addPassengers(coach, y0) {
  const shadow = new THREE.MeshBasicMaterial({ color: 0x1a120c });
  const people = [];
  const seats = [[-2.4, 1], [-1.2, -1], [1.0, 1], [2.3, -1]];
  for (const [x, face] of seats) {
    const p = new THREE.Group(); p.position.set(x, y0 + 0.72, 0.15);
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 0.55, 4, 10), shadow); torso.position.y = 0.45; p.add(torso);
    const head = new THREE.Group(); head.position.y = 1.05; p.add(head);
    head.add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), shadow));
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.04, 18), shadow); brim.position.y = 0.14; head.add(brim);
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.24, 14), shadow); crown.position.y = 0.27; head.add(crown);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 6), shadow); nose.rotation.z = -face * Math.PI / 2; nose.position.set(face * 0.2, -0.02, 0); head.add(nose);
    const arms = [];
    for (const s of [0, 1]) {
      const sh = new THREE.Group(); sh.position.set(face * 0.05, 0.72, s ? 0.18 : -0.18); p.add(sh);
      const up = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.34, 3, 8), shadow); up.position.y = -0.2; sh.add(up);
      const el = new THREE.Group(); el.position.y = -0.4; sh.add(el);
      const fore = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.3, 3, 8), shadow); fore.position.y = -0.18; el.add(fore);
      arms.push({ sh, el });
    }
    coach.add(p);
    people.push({ p, head, arms, face, ph: Math.random() * 6, spk: Math.random() });
  }
  return people;
}

// hoạt cảnh: talk ⇄ startle (giật mình → nhìn trần → nói tiếp)
export function animatePassengers(people, dt, time, startleT) {
  for (const q of people) {
    const f = q.face;
    let jump = 0, armUp = 0, lookUp = 0, talk = 1;
    if (startleT != null && startleT < 2.2) {
      const s = startleT;
      jump = s < 0.35 ? Math.sin(s / 0.35 * Math.PI) * 0.14 : 0;
      armUp = s < 0.7 ? Math.min(1, s / 0.15) : Math.max(0, 1 - (s - 0.7) / 0.5);
      lookUp = s < 0.3 ? 0 : s < 1.8 ? Math.min(1, (s - 0.3) / 0.3) : Math.max(0, 1 - (s - 1.8) / 0.4);
      talk = s < 1.8 ? 0 : (s - 1.8) / 0.4;
    }
    // nói chuyện: lần lượt từng người "nói" (khoa tay, gật đầu), người kia nghe
    const speaking = Math.sin(time * 0.6 + q.spk * 6) > 0.1;
    const g = speaking ? 1 : 0.25;
    q.p.position.y = q.p.userData.y0 ?? (q.p.userData.y0 = q.p.position.y);
    q.p.position.y = q.p.userData.y0 + jump;
    q.head.rotation.z = (-f * 0.08 * Math.sin(time * 5 + q.ph) * g) * talk + lookUp * 0.7 * f * -0 + 0;
    q.head.rotation.x = 0;
    q.head.rotation.z += lookUp * 0.55 * f;          // ngửa đầu nhìn lên trần
    for (let i = 0; i < 2; i++) {
      const a = q.arms[i], gest = i === 0 ? Math.max(0, Math.sin(time * 3.2 + q.ph)) : Math.max(0, Math.sin(time * 2.6 + q.ph + 2)) * 0.6;
      const tz = talk * g * gest;
      a.sh.rotation.z = f * (0.25 + tz * 1.2) * (1 - armUp) + f * armUp * 2.6;
      a.el.rotation.z = f * (0.9 + tz * 0.8) * (1 - armUp) + f * armUp * 0.4;
    }
  }
}

function coachSideTexture(paintHex) {
  const c = document.createElement("canvas"); c.width = 1024; c.height = 356;
  const ctx = c.getContext("2d"), w = c.width, h = c.height;
  const col = "#" + new THREE.Color(paintHex).getHexString();
  ctx.fillStyle = col; ctx.fillRect(0, 0, w, h);
  // ván dọc
  for (let x = 0; x < w; x += 16) { ctx.fillStyle = "rgba(0,0,0,.14)"; ctx.fillRect(x, 0, 2, h); }
  // viền vàng trang trí
  ctx.strokeStyle = "#d9b25a"; ctx.lineWidth = 5; ctx.strokeRect(10, 10, w - 20, h - 20);
  ctx.lineWidth = 2; ctx.strokeRect(22, 22, w - 44, h - 44);
  ctx.fillStyle = "#d9b25a"; ctx.fillRect(22, h * 0.8, w - 44, 4);
  // 6 cửa sổ (lỗ trong suốt) có khung gỗ
  const n = 6, ww = 104, wh = 128, gap = (w - n * ww) / (n + 1), wy = h * 0.2;
  for (let i = 0; i < n; i++) {
    const x = gap + i * (ww + gap);
    ctx.fillStyle = "#3b2414"; ctx.beginPath(); ctx.roundRect(x - 9, wy - 9, ww + 18, wh + 18, 16); ctx.fill();
    ctx.clearRect(x, wy, ww, wh);
    ctx.save(); ctx.globalCompositeOperation = "destination-out"; ctx.beginPath(); ctx.roundRect(x, wy, ww, wh, 12); ctx.fill(); ctx.restore();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
