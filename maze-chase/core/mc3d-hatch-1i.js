// MAZE CHASE 3D — NẮP BOONG (mẫu 1i, 29/9/2026). Thầy: "robot địch về vị trí xuất phát = sàn boong tàu mở ra, robot hạ xuống dưới
// boong, nắp đóng lại; ở vị trí xuất phát cũng mở boong, robot được đưa lên rồi đóng sàn lại" · robot mình cũng xuất hiện kiểu đó.
// Một nắp = khung viền sọc cảnh báo + 4 đèn góc nháy cam + lòng giếng tối (vẽ canvas: thành giếng + bệ nâng phát sáng) + 2 cánh cửa bản lề
// ở mép ngoài, mở SẬP XUỐNG (phần dưới mặt sàn bị sàn che ⇒ trông như cánh cửa lật vào lòng giếng).
// Robot "dưới boong" = đặt thấp hơn mặt sàn: sàn đục che mất, nhô dần lên khỏi lòng giếng.
import * as THREE from "three";

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const easeIO = u => u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;

function tex(w, h, draw) {
  const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

export function createHatches(parent, size = 2.9) {
  const S = size, half = S / 2;
  // lòng giếng: tối sâu, thành giếng có gờ + vạch đèn, đáy là bệ nâng viền xanh
  const pitTex = tex(256, 256, (g, w) => {
    g.fillStyle = "#020308"; g.fillRect(0, 0, w, w);
    for (let i = 0; i < 18; i++) {                                     // thành giếng thu nhỏ dần ⇒ cảm giác sâu
      const k = i / 18, m = 6 + k * 70, l = 18 + (1 - k) * 34;
      g.strokeStyle = `rgb(${l},${l + 4},${l + 14})`; g.lineWidth = 3; g.strokeRect(m, m, w - 2 * m, w - 2 * m);
    }
    g.strokeStyle = "rgba(56,189,248,.9)"; g.lineWidth = 4; g.strokeRect(80, 80, 96, 96);              // viền bệ nâng
    g.fillStyle = "#0b1426"; g.fillRect(84, 84, 88, 88);
    g.strokeStyle = "rgba(56,189,248,.35)"; g.lineWidth = 2; g.beginPath(); g.moveTo(84, 128); g.lineTo(172, 128); g.moveTo(128, 84); g.lineTo(128, 172); g.stroke();
  });
  const stripeTex = tex(256, 32, (g, w, h) => {
    g.fillStyle = "#1b1d22"; g.fillRect(0, 0, w, h);
    for (let x = -h; x < w + h; x += 28) { g.fillStyle = "#f5b301"; g.beginPath(); g.moveTo(x, h); g.lineTo(x + 14, h); g.lineTo(x + 14 + h, 0); g.lineTo(x + h, 0); g.fill(); }
  });
  const doorTex = tex(256, 256, (g, w) => {
    g.fillStyle = "#4a515e"; g.fillRect(0, 0, w, w);
    g.strokeStyle = "#2a2f38"; g.lineWidth = 4; g.strokeRect(10, 10, w - 20, w - 20);
    for (let y = 40; y < w - 30; y += 36) { g.fillStyle = "#3b414c"; g.fillRect(24, y, w - 48, 14); g.fillStyle = "rgba(255,255,255,.08)"; g.fillRect(24, y, w - 48, 2); }
    g.fillStyle = "#f5b301"; g.fillRect(0, 0, 14, w);                   // mép khép có sọc vàng
    for (let y = 0; y < w; y += 24) { g.fillStyle = "#1b1d22"; g.fillRect(0, y, 14, 12); }
    for (const [x, y] of [[26, 26], [w - 26, 26], [26, w - 26], [w - 26, w - 26]]) { g.fillStyle = "#8a93a3"; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); }
  });
  const pitGeo = new THREE.PlaneGeometry(S, S).rotateX(-Math.PI / 2);
  const railGeo = new THREE.BoxGeometry(S + 0.36, 0.1, 0.18);
  const doorGeo = new THREE.BoxGeometry(half, 0.07, S).translate(-half / 2, 0, 0);   // bản lề ở x = 0 (mép ngoài), lá cửa chìa vào tâm
  const lampGeo = new THREE.SphereGeometry(0.1, 10, 8);
  const glowGeo = new THREE.CylinderGeometry(half * 0.9, half * 0.9, 3.2, 24, 1, true).translate(0, 1.6, 0);

  const live = [], pool = [];                                            // nắp đã dùng xong được cất vào kho, lần sau lấy ra dùng lại
  function make(x, z) {
    const h = pool.pop() || build();
    h.g.position.set(x, 0, z); h.g.scale.set(1, 0.001, 1); parent.add(h.g);
    h.pitMat.opacity = 0; h.glowMat.opacity = 0; h.lampMat.emissiveIntensity = 0; h.leaves.forEach(l => { l.hinge.rotation.z = 0; });
    return h;
  }
  function build() {
    const g = new THREE.Group();
    const pitMat = new THREE.MeshBasicMaterial({ map: pitTex, transparent: true, opacity: 0, polygonOffset: true, polygonOffsetFactor: -3 });
    const pit = new THREE.Mesh(pitGeo, pitMat); pit.position.y = 0.025; pit.renderOrder = 1; g.add(pit);
    const railMat = new THREE.MeshStandardMaterial({ map: stripeTex, metalness: 0.5, roughness: 0.5 });
    for (let k = 0; k < 4; k++) {
      const r = new THREE.Mesh(railGeo, railMat); const a = k * Math.PI / 2;
      r.position.set(Math.sin(a) * (half + 0.09), 0.05, Math.cos(a) * (half + 0.09)); r.rotation.y = a; r.receiveShadow = true; g.add(r);
    }
    const lampMat = new THREE.MeshStandardMaterial({ color: 0x3a1a00, emissive: 0xff8a00, emissiveIntensity: 0 });
    for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const l = new THREE.Mesh(lampGeo, lampMat); l.position.set(sx * (half + 0.12), 0.14, sz * (half + 0.12)); g.add(l); }
    const doorMat = new THREE.MeshStandardMaterial({ map: doorTex, metalness: 0.6, roughness: 0.42 });
    const leaves = [1, -1].map(s => {
      const hinge = new THREE.Group(); hinge.position.set(s * half, 0.04, 0); g.add(hinge);
      const d = new THREE.Mesh(doorGeo, doorMat); d.castShadow = true; d.receiveShadow = true;
      if (s < 0) d.rotation.y = Math.PI;                              // lá bên trái: lật 180° để chìa về tâm
      hinge.add(d); return { hinge, s };
    });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const glow = new THREE.Mesh(glowGeo, glowMat); g.add(glow);
    g.scale.set(1, 0.001, 1);
    return { g, pitMat, railMat, lampMat, doorMat, leaves, glowMat };
  }

  // mode "rise": mở → nâng robot từ −depth lên 0 → đóng · "sink": mở → hạ robot từ 0 xuống −depth → đóng.
  // onLift(y) gọi mỗi khung; onHidden khi robot chìm hẳn (sink); onDone khi nắp đã đóng xong.
  function run(x, z, { mode = "rise", depth = 5, speed = 1, onLift, onHidden, onDone, onOpen } = {}) {
    const h = make(x, z);
    const T = { in: 0.18, open: 0.34, move: mode === "rise" ? 0.85 : 0.7, close: 0.32, out: 0.22 };
    for (const k in T) T[k] /= speed;
    const o = { h, mode, depth, T, t: 0, onLift, onHidden, onDone, onOpen, hidden: false, opened: false };
    if (mode === "rise" && onLift) onLift(-depth);
    live.push(o); return o;
  }
  function update(dt, time) {
    for (let i = live.length - 1; i >= 0; i--) {
      const o = live[i], T = o.T, h = o.h; o.t += dt;
      const t1 = T.in, t2 = t1 + T.open, t3 = t2 + T.move, t4 = t3 + T.close, t5 = t4 + T.out;
      const t = o.t;
      h.g.scale.y = t < t1 ? Math.max(0.001, t / t1) : t > t4 ? Math.max(0.001, 1 - (t - t4) / T.out) : 1;   // khung trồi lên / lún xuống
      const open = t < t1 ? 0 : t < t2 ? easeIO((t - t1) / T.open) : t < t3 ? 1 : t < t4 ? 1 - easeIO((t - t3) / T.close) : 0;
      h.leaves.forEach(l => { l.hinge.rotation.z = l.s * open * 1.75; });   // lật sập xuống lòng giếng
      h.pitMat.opacity = clamp(open * 1.6, 0, 1);
      h.lampMat.emissiveIntensity = t < t4 ? (Math.sin(time * 14) > 0 ? 3.2 : 0.3) : 0;
      h.glowMat.opacity = open * 0.28 * (t > t2 && t < t3 ? 1 : 0.5);
      if (!o.opened && t >= t2) { o.opened = true; o.onOpen && o.onOpen(); }
      if (o.onLift) {
        const u = clamp((t - t2) / T.move, 0, 1);
        const y = o.mode === "rise" ? -o.depth * (1 - easeOut(u)) : -o.depth * easeIn(u);
        o.onLift(t < t2 ? (o.mode === "rise" ? -o.depth : 0) : y);
      }
      if (o.mode === "sink" && !o.hidden && t >= t3) { o.hidden = true; o.onHidden && o.onHidden(); }
      if (t >= t5) { dispose(o); live.splice(i, 1); o.onDone && o.onDone(); }
    }
  }
  const easeOut = u => 1 - Math.pow(1 - u, 3), easeIn = u => u * u * u;
  function dispose(o) { parent.remove(o.h.g); pool.push(o.h); }
  function clear() { live.splice(0).forEach(dispose); }
  return { run, update, clear, get busy() { return live.length; } };
}
