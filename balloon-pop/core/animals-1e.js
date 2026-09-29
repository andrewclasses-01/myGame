// CON VẬT trên ĐỒI XA — bản 1e (29/9/2026): lạc đà, ngựa hoang (mustang), sói đồng cỏ (coyote).
// Dựng khớp đầy đủ (thân cong, cổ, đầu có mõm/tai/mắt, 4 chân 3 đoạn: đùi–ống–móng, đuôi), dáng đi đúng loài
// (lạc đà đi "cùng bên", ngựa/sói đi chéo). Chỉ xuất hiện trên ĐỈNH CÁC GÒ ĐỒI XA (z ≈ -115): đi lên đỉnh, đứng nhìn
// đoàn tàu (quay đầu theo tàu), rồi đi xuống khuất sau đồi.
import * as THREE from "three";

const SPECIES = {
  camel:  { body: [1.35, 0.62, 0.52], hump: 0.62, legUp: 0.85, legLo: 0.8, neck: 1.25, neckTilt: -0.7, head: 0.44, col: 0xc49a66, dark: 0x6a4a2c, pace: true, tail: "tuft", ears: 0.12, mane: false, h0: 1.85, speed: 1.4 },
  horse:  { body: [1.15, 0.55, 0.42], hump: 0, legUp: 0.72, legLo: 0.72, neck: 0.85, neckTilt: -1.0, head: 0.58, col: 0x7a4a2a, dark: 0x1e140e, pace: false, tail: "long", ears: 0.14, mane: true, h0: 1.55, speed: 1.6 },
  coyote: { body: [0.62, 0.26, 0.22], hump: 0, legUp: 0.32, legLo: 0.3, neck: 0.3, neckTilt: -0.5, head: 0.3, col: 0xa08a6c, dark: 0x4a3c2c, pace: false, tail: "bushy", ears: 0.12, mane: false, h0: 0.66, speed: 1.9 },
};

function build(kind) {
  const S = SPECIES[kind];
  const skin = new THREE.MeshStandardMaterial({ color: S.col, roughness: 0.92 });
  const dark = new THREE.MeshStandardMaterial({ color: S.dark, roughness: 0.95 });
  const light = new THREE.MeshStandardMaterial({ color: new THREE.Color(S.col).lerp(new THREE.Color(0xf0e6d6), 0.45), roughness: 0.95 });
  const g = new THREE.Group();
  const add = (geo, mat, parent, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m; };
  const [bl, bh, bw] = S.body;
  const body = new THREE.Group(); body.position.y = S.h0; g.add(body);
  // thân: ngực + bụng + mông nối liền, bụng sáng màu
  add(new THREE.SphereGeometry(1, 28, 18), skin, body, 0, 0, 0).scale.set(bl, bh, bw);
  add(new THREE.SphereGeometry(1, 22, 16), skin, body, bl * 0.55, bh * 0.08, 0).scale.set(bl * 0.45, bh * 1.02, bw * 1.02);
  add(new THREE.SphereGeometry(1, 22, 16), skin, body, -bl * 0.55, bh * 0.1, 0).scale.set(bl * 0.45, bh * 1.0, bw * 1.04);
  add(new THREE.SphereGeometry(1, 20, 12), light, body, 0, -bh * 0.35, 0).scale.set(bl * 0.8, bh * 0.6, bw * 0.85);
  if (S.hump) { add(new THREE.SphereGeometry(1, 22, 16), skin, body, -0.05, bh * 0.75, 0).scale.set(S.hump * 0.95, S.hump * 0.85, bw * 0.8); }
  // cổ cong (2 đoạn) + đầu
  // cổ vươn ra trước-lên: xoay trục +y một góc âm quanh z
  const neck = new THREE.Group(); neck.position.set(bl * 0.82, bh * 0.35, 0); neck.rotation.z = -(Math.PI / 2 + S.neckTilt); body.add(neck);
  const n1 = add(new THREE.CylinderGeometry(bw * 0.38, bw * 0.55, S.neck, 14), skin, neck, 0, S.neck / 2, 0);
  if (S.mane) { const mane = add(new THREE.BoxGeometry(0.06, S.neck * 0.95, 0.09), dark, neck, -bw * 0.32, S.neck / 2, 0); mane.rotation.z = 0.05; }
  const head = new THREE.Group(); head.position.y = S.neck; neck.add(head);
  const hd = new THREE.Group(); hd.rotation.z = (Math.PI / 2 + S.neckTilt) - 0.25; head.add(hd);   // đầu nằm gần ngang
  add(new THREE.SphereGeometry(1, 20, 14), skin, hd, S.head * 0.25, 0, 0).scale.set(S.head * 0.42, S.head * 0.34, S.head * 0.3);
  add(new THREE.SphereGeometry(1, 18, 12), kind === "coyote" ? light : skin, hd, S.head * 0.72, -S.head * 0.08, 0).scale.set(S.head * 0.38, S.head * 0.2, S.head * 0.2);
  add(new THREE.SphereGeometry(S.head * 0.07, 10, 8), dark, hd, S.head * 1.06, -S.head * 0.06, 0);   // mũi/mõm
  for (const z of [-1, 1]) {
    add(new THREE.SphereGeometry(S.head * 0.05, 10, 8), dark, hd, S.head * 0.42, S.head * 0.12, z * S.head * 0.24);   // mắt
    const ear = add(new THREE.ConeGeometry(S.ears * 0.35, S.ears, 8), kind === "coyote" ? skin : skin, hd, S.head * 0.08, S.head * 0.32, z * S.head * 0.17);
    ear.rotation.z = kind === "camel" ? 0.9 : 0.25; ear.rotation.x = z * 0.25;
  }
  if (S.mane) { const fl = add(new THREE.BoxGeometry(S.head * 0.3, 0.08, 0.1), dark, hd, S.head * 0.15, S.head * 0.33, 0); fl.rotation.z = -0.3; }
  // đuôi
  const tail = new THREE.Group(); tail.position.set(-bl * 0.98, bh * 0.35, 0); body.add(tail);
  if (S.tail === "long") { const t = add(new THREE.CylinderGeometry(0.07, 0.14, 0.9, 10), dark, tail, 0, -0.45, 0); t.rotation.z = 0; tail.rotation.z = -0.35; }
  else if (S.tail === "bushy") { add(new THREE.SphereGeometry(1, 14, 10), skin, tail, -0.18, -0.18, 0).scale.set(0.24, 0.08, 0.08); add(new THREE.SphereGeometry(0.06, 10, 8), dark, tail, -0.42, -0.26, 0); tail.rotation.z = 0.35; }
  else { add(new THREE.CylinderGeometry(0.035, 0.05, 0.6, 8), skin, tail, 0, -0.3, 0); add(new THREE.SphereGeometry(0.08, 10, 8), dark, tail, 0, -0.62, 0); tail.rotation.z = -0.2; }
  // 4 chân 3 đoạn
  const legs = [];
  const lx = bl * 0.62, lz = bw * 0.55;
  for (const [x, z, front] of [[lx, lz, 1], [lx, -lz, 1], [-lx, lz, 0], [-lx, -lz, 0]]) {
    // khối cơ vai/hông nối chân vào thân + đùi to thon dần + ống chân + khớp
    add(new THREE.SphereGeometry(1, 16, 12), skin, body, x * 0.92, -bh * 0.2, z * 0.8).scale.set(bh * 0.42, bh * 0.62, bw * 0.42);
    const hip = new THREE.Group(); hip.position.set(x, -bh * 0.35, z); body.add(hip);
    add(new THREE.CylinderGeometry(bh * 0.3, bh * 0.16, S.legUp, 14), skin, hip, 0, -S.legUp / 2, 0);
    const knee = new THREE.Group(); knee.position.y = -S.legUp; hip.add(knee);
    add(new THREE.SphereGeometry(bh * 0.17, 12, 10), skin, knee);
    add(new THREE.CylinderGeometry(bh * 0.13, bh * 0.1, S.legLo, 12), skin, knee, 0, -S.legLo / 2, 0);
    const hoof = add(new THREE.CylinderGeometry(bh * 0.12, bh * 0.15, S.legLo * 0.1, 12), dark, knee, 0.01, -S.legLo, 0);
    if (kind === "camel") hoof.scale.set(1.8, 0.6, 1.5);
    legs.push({ hip, knee, front, side: z > 0 ? 1 : 0 });
  }
  g.traverse(o => { if (o.isMesh) o.receiveShadow = true; });
  return { g, body, neck, head, tail, legs, S };
}

export function createFarAnimals(scene, hillMat) {
  // 3 gò đồi xa (dời lên trước khi khuất sau), con vật chỉ xuất hiện trên đỉnh gò
  const Z = -118, RX = 36, RZ = 20, HT = 19, Y0 = -4;
  const mounds = [];
  for (let i = 0; i < 3; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), hillMat);
    m.scale.set(RX, HT, RZ); m.position.set(-60 + i * 150, Y0, Z); m.receiveShadow = true;
    scene.add(m); mounds.push(m);
  }
  const surf = (m, x) => { const dx = (x - m.position.x) / RX; return Y0 + HT * Math.sqrt(Math.max(0, 1 - dx * dx)); };
  let A = null, st = "wait", t = 0, wait = 10 + Math.random() * 8, mound = null, dir = 1, phase = 0;
  function spawn(camX) {
    const kinds = ["camel", "horse", "coyote"];
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    mound = mounds.filter(m => Math.abs(m.position.x - camX) < 55).sort((a, b) => Math.abs(a.position.x - camX) - Math.abs(b.position.x - camX))[0];
    if (!mound) return false;
    A = build(kind); A.g.scale.setScalar(kind === "coyote" ? 1.6 : 1.25);
    dir = Math.random() < 0.5 ? 1 : -1;
    A.x = mound.position.x - dir * RX * 0.8;
    A.stopX = mound.position.x + (Math.random() - 0.5) * RX * 0.3;
    scene.add(A.g); st = "enter"; t = 0;
    return true;
  }
  return {
    update(dt, camX, trainX) {
      for (const m of mounds) if (m.position.x < camX - 260) m.position.x += 450;
      t += dt;
      if (st === "wait") { if (t > wait && spawn(camX)) { } else if (t > wait) { t = wait - 3; } return; }
      const S = A.S;
      let moving = true, want = dir > 0 ? 0 : Math.PI;
      if (st === "enter") { A.x += dir * S.speed * dt; if ((A.stopX - A.x) * dir <= 0) { st = "watch"; t = 0; } }
      else if (st === "watch") {
        moving = false;
        want = Math.atan2(A.g.position.z - 0, trainX - A.x);        // quay mặt về phía đoàn tàu (trục +x là hướng mặt)
        if (t > 6) { st = "leave"; t = 0; }
      } else if (st === "leave") {
        A.x += dir * S.speed * 1.3 * dt;
        if (Math.abs(A.x - mound.position.x) > RX * 0.95) { scene.remove(A.g); A.g.traverse(o => { if (o.geometry) o.geometry.dispose(); }); A = null; st = "wait"; t = 0; wait = 22 + Math.random() * 25; return; }
      }
      const y = surf(mound, A.x);
      const slope = (surf(mound, A.x + 0.5) - surf(mound, A.x - 0.5));
      A.g.position.set(A.x, y, Z + 2);
      let d = want - A.g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); A.g.rotation.y += d * Math.min(1, dt * 2.5);
      A.g.rotation.z = Math.atan(slope) * Math.cos(A.g.rotation.y) * 0.8;
      phase += dt * (moving ? S.speed * 4.2 : 0);
      A.legs.forEach((L, i) => {
        // lạc đà: 2 chân cùng bên cùng nhịp; ngựa/sói: chân chéo cùng nhịp
        const off = S.pace ? L.side * Math.PI : ((L.front ^ L.side) ? Math.PI : 0) + (L.front ? 0 : Math.PI / 2);
        const s = moving ? Math.sin(phase + off) : 0;
        L.hip.rotation.z = s * 0.42;
        L.knee.rotation.z = moving ? (L.front ? -1 : 1) * Math.max(0, Math.sin(phase + off + 1.3)) * 0.7 : 0;
      });
      A.body.position.y = S.h0 + (moving ? Math.abs(Math.sin(phase)) * S.h0 * 0.025 : 0);
      A.neck.rotation.z = -(Math.PI / 2 + S.neckTilt) + (moving ? Math.sin(phase * 2) * 0.05 : -0.1 + Math.sin(t * 1.5) * 0.04);
      A.head.rotation.x = moving ? 0 : Math.sin(t * 0.9) * 0.25;         // đứng xem: đầu nghiêng qua lại
      A.tail.rotation.x = Math.sin(t * 3) * 0.2;
    },
  };
}
