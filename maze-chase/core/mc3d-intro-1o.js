// MAZE CHASE 3D — INTRO ĐIỆN ẢNH (mẫu 1o, 29/9/2026). Thầy: "cần một đoạn intro thật đẹp, ngầu, điện ảnh giống như cách làm intro của
// Rocket Race. Hãy làm cho tôi vài bản để tôi chọn." Cách của Rocket Race: màn chờ ⇒ bấm START ⇒ cảnh điện ảnh ⇒ hoà thẳng vào game
// (cùng một cảnh 3D, cùng góc máy lúc nối), bấm ĐÚP để bỏ qua. Ở đây intro chạy NGAY TRONG cảnh của game (cùng trạm, tàu, robot, nắp
// boong…) và kết thúc ĐÚNG góc máy nhìn toàn mê cung ⇒ câu hỏi đầu hiện lên là vào chơi, không có cú cắt.
//   A · HẠM ĐỘI ĐẾN  — tàu ANDREW CLASSES khổng lồ lướt qua đầu máy quay (kiểu mở đầu Star Wars), máy quay lướt dọc thân tàu, lao
//                      xuống trạm, tường dựng lên theo đường máy quay, tên game đập vào màn.
//   B · THẢ ROBOT    — tàu treo trên trạm, bụng tàu thả một khoang đổ bộ; khoang rơi, phụt lửa hãm, đâm xuống ô xuất phát (sóng
//                      chấn động dựng tường), vỏ khoang bung ra, robot đứng dậy chào; robot địch trồi lên ở các góc.
//   C · BÁO ĐỘNG ĐỎ  — trạm tối om, đèn xoay đỏ, còi hú, chữ cảnh báo trên màn; máy quay lao sát sàn qua các hành lang (tường sập dựng
//                      lên ngay trước mặt), vọt lên, đèn bật lại từng khu, tên game bật sáng kiểu đèn neon.
// Không thêm ĐÈN mới (số đèn đổi ⇒ trình duyệt dịch lại mọi shader ⇒ khựng); chỉ đổi màu/cường độ đèn có sẵn. Vật riêng của intro được
// vẽ thử (làm nóng) dưới màn đen 2 khung đầu.
import * as THREE from "three";

const V3 = THREE.Vector3;
const clamp01 = x => Math.max(0, Math.min(1, x));
const seg = (T, a, b) => clamp01((T - a) / (b - a));
const eio = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eo = t => 1 - Math.pow(1 - t, 3);
const ei = t => t * t * t;
const rnd = (a, b) => a + Math.random() * (b - a);
const easeOutBack = t => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

function glowTex() {
  const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d");
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.3, "rgba(255,255,255,.55)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
}

export function createIntro(ctx) {
  const { scene, station, fleet, snd } = ctx;
  let V = null, T = 0, prep = -1, active = false, cues = [], onDone = null;

  // ---------------- lớp chữ điện ảnh (DOM trên canvas)
  const ov = document.createElement("div"); ov.className = "mc-cine"; ov.hidden = true;
  ov.innerHTML = `<i class="cine-bar t"></i><i class="cine-bar b"></i><div class="cine-hud"></div>
    <div class="cine-pre"><span>ANDREW CLASSES</span><em>PRESENTS</em></div>
    <div class="cine-title"><b data-t="MAZE CHASE">MAZE CHASE</b><i></i></div>
    <div class="cine-skip">Double-click to skip</div><i class="cine-flash"></i><i class="cine-fade"></i>`;
  ctx.stage.appendChild(ov);
  const $ = s => ov.querySelector(s);
  $(".cine-title i").textContent = ctx.subtitle || "";
  const on = (sel, c, v = true) => (sel === ".mc-cine" ? ov : $(sel)).classList.toggle(c, v);
  function flash(k = 1) { const f = $(".cine-flash"); f.style.setProperty("--k", k); f.classList.remove("go"); void f.offsetWidth; f.classList.add("go"); }
  function hudLine(text, cls = "") { const d = document.createElement("div"); d.className = "cine-line " + cls; d.textContent = text; $(".cine-hud").appendChild(d); }

  // ---------------- hạt sáng/khói riêng của intro (vệt lửa khoang, bụi va chạm)
  const gTex = glowTex();
  const parts = Array.from({ length: 140 }, () => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: gTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    s.visible = false; scene.add(s); return { s, life: 0, max: 1, v: new V3(), s0: 1, s1: 1, c0: new THREE.Color(), c1: new THREE.Color(), a: 1, drag: 0 };
  });
  let pi = 0;
  function emit(pos, vel, life, s0, s1, c0, c1, a = 1, add = true, drag = 1) {
    const p = parts[pi++ % parts.length];
    p.s.position.copy(pos); p.v.copy(vel); p.life = 0; p.max = life; p.s0 = s0; p.s1 = s1; p.c0.setRGB(...c0); p.c1.setRGB(...c1); p.a = a; p.drag = drag;
    p.s.material.blending = add ? THREE.AdditiveBlending : THREE.NormalBlending; p.s.visible = true;
  }
  function tickParts(dt) {
    for (const p of parts) {
      if (!p.s.visible) continue; p.life += dt; const k = p.life / p.max; if (k >= 1) { p.s.visible = false; continue; }
      p.v.multiplyScalar(Math.exp(-p.drag * dt)); p.s.position.addScaledVector(p.v, dt);
      p.s.scale.setScalar(p.s0 + (p.s1 - p.s0) * Math.sqrt(k)); p.s.material.color.copy(p.c0).lerp(p.c1, k); p.s.material.opacity = p.a * (1 - k);
    }
  }

  // ---------------- B: KHOANG ĐỔ BỘ (4 cánh vỏ bung ra quanh bản lề đáy + chóp nón + loa hãm)
  const pod = (() => {
    const g = new THREE.Group(); g.visible = false; station.add(g);
    const hull = new THREE.MeshStandardMaterial({ color: 0xc9ced6, metalness: 0.6, roughness: 0.35, side: THREE.DoubleSide });
    const dark = new THREE.MeshStandardMaterial({ color: 0x2a2f38, metalness: 0.7, roughness: 0.42 });
    const lite = new THREE.MeshStandardMaterial({ color: 0x0b1a2b, emissive: 0x7dd3fc, emissiveIntensity: 3.2 });
    const hot = new THREE.MeshStandardMaterial({ color: 0x331100, emissive: 0xff7a1a, emissiveIntensity: 0 });
    const R = 1.7, H = 3.7, petals = [];
    for (let i = 0; i < 4; i++) {
      const hinge = new THREE.Group(); hinge.rotation.y = i * Math.PI / 2; g.add(hinge);
      const piv = new THREE.Group(); piv.position.z = R; hinge.add(piv);
      const sh = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.86, R, H, 20, 1, true, -Math.PI / 4 + 0.03, Math.PI / 2 - 0.06), hull); sh.position.set(0, H / 2, -R); piv.add(sh);
      const st = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.905, R * 0.915, 0.16, 20, 1, true, -Math.PI / 4 + 0.08, Math.PI / 2 - 0.16), lite); st.position.set(0, H * 0.7, -R); piv.add(st);
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.16, H * 0.92, 0.12), dark); rib.position.set(0, H / 2, -0.06); piv.add(rib);
      petals.push(piv);
    }
    const cap = new THREE.Mesh(new THREE.ConeGeometry(R * 0.88, 1.5, 24), hull); cap.position.y = H + 0.75; g.add(cap);
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6), dark); ant.position.y = H + 1.8; g.add(ant);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), lite); tip.position.y = H + 2.25; g.add(tip);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R * 1.02, 0.14, 8, 32).rotateX(Math.PI / 2), dark); ring.position.y = 0.12; g.add(ring);
    const noz = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.8, 0.5, 18), hot); noz.position.y = -0.2; g.add(noz);
    return { g, petals, cap, hot, lite };
  })();

  // ---------------- C: ĐÈN XOAY ĐỎ trên các cột mép trạm (chỉ vật tự sáng + lưỡi sáng cộng màu — không phải đèn thật)
  const beacons = (() => {
    const W = ctx.W, D = ctx.D, list = [];
    const domeM = new THREE.MeshStandardMaterial({ color: 0x300000, emissive: 0xff2020, emissiveIntensity: 4 });
    const baseM = new THREE.MeshStandardMaterial({ color: 0x23262d, metalness: 0.7, roughness: 0.4 });
    const bladeM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 0.12, 0.08), transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false });
    const bladeG = new THREE.ConeGeometry(2.2, 12, 20, 1, true).translate(0, -6, 0).rotateZ(Math.PI / 2);
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1], [0, 1], [-1, 0], [1, 0]].map(([a, b]) => [a * (W / 2 + 0.2), b * (D / 2 + 0.2)])) {
      const g = new THREE.Group(); g.position.set(x, 1.95, z); g.visible = false; station.add(g);
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.4, 0.3, 14), baseM));
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), domeM); dome.position.y = 0.15; g.add(dome);
      const blades = new THREE.Group(); blades.position.y = 0.3; g.add(blades);
      for (const s of [1, -1]) { const b = new THREE.Mesh(bladeG, bladeM); b.rotation.y = s > 0 ? 0 : Math.PI; blades.add(b); }
      blades.rotation.y = Math.random() * 6.28;
      list.push({ g, blades });
    }
    return { list, domeM, bladeM };
  })();

  // ---------------- tiện ích máy quay
  const cp = new V3(), cl = new V3();
  const setCam = (p, l, fov, roll = 0) => ctx.setCam(p, l, fov, roll);
  const curve = pts => new THREE.CatmullRomCurve3(pts, false, "centripetal");
  const O = ctx.overview;                                             // góc máy của game (điểm KẾT mọi intro)
  const Sx = ctx.start.x, Sz = ctx.start.z;
  const at = (t, fn) => cues.push({ t, fn, done: false });
  const shipLocal = (x, y, z, out) => fleet.group.localToWorld(out.set(x, y, z));

  // ============================================================== A · HẠM ĐỘI ĐẾN
  const A = {
    dur: 13.4, scale: 3.2,
    shipZ(T) {                                                        // quãng đường dọc −z: nhanh (150) ⇒ hãm dần (30) ⇒ tăng tốc rời đi
      const z0 = 900;
      if (T < 3) return z0 - 150 * T;
      if (T < 7) { const u = T - 3; return z0 - 450 - (150 * u - 15 * u * u); }   // v: 150 → 30
      const u = T - 7; return z0 - 450 - 360 - (30 * u + (u > 1.6 ? 38 * (u - 1.6) * (u - 1.6) : 0));
    },
    setup() {
      fleet.cine.begin(this.scale); ctx.walls.flat();
      at(0.0, () => { snd.rumble(4.2, 0.32); snd.engine(5, 0.16, 0.2, 64, 42); on(".mc-cine", "bars"); });
      at(0.6, () => on(".cine-pre", "in"));
      at(1.0, () => snd.whoosh(1.8, 0.26, 0, 180, 1800, 0.6, -0.6));
      at(3.2, () => on(".cine-pre", "out"));
      at(3.6, () => { snd.braam(0, 43.65, 0.28); });
      at(5.4, () => { fleet.cine.aim(new V3(Sx - 40, 10, Sz - 120)); });
      at(5.9, () => { fleet.cine.fire(new V3(-160, 40, -700)); snd.laser(); });
      at(6.15, () => { fleet.cine.fire(new V3(-150, 60, -720)); snd.laser(); });
      at(7.3, () => snd.whoosh(1.6, 0.3, 0, 400, 3200, -0.4, 0.4));
      at(8.4, () => { ctx.walls.rise(Sx, Sz); snd.thud(0, 0.25); snd.thud(0.25, 0.2); snd.thud(0.5, 0.18); });
      at(8.9, () => snd.engine(3, 0.12, 0, 70, 90));
      at(9.6, () => snd.riser(1.8, 0.16));
      at(11.4, () => { this.title(); fleet.cine.end(); });
      at(12.8, () => { on(".cine-title", "out"); on(".mc-cine", "bars", false); ctx.walls.sink(); snd.shimmer(0, 0.03); });
    },
    title() { on(".cine-title", "slam"); flash(0.9); snd.impact(0, 1); snd.shimmer(0.05); ctx.shake(0.5); },
    tick(T) {
      const L = 47 * this.scale, z = this.shipZ(T), sp = new V3(12 - 60 * (1 - Math.exp(-T / 5)), 92 - 18 * clamp01(T / 8), z);
      const bank = 0.08 * Math.sin(T * 0.6) - 0.12 * seg(T, 4, 7) + 0.1 * seg(T, 8.5, 10.5);
      fleet.cine.set(sp, new V3(-0.05, -0.02, -1), bank, T < 3 ? 150 : T < 7 ? 150 - 30 * (T - 3) : 30 + 76 * Math.max(0, T - 8.6));
      if (T < 3.6) {                                                  // S1: tàu khổng lồ lướt qua ĐẦU máy quay rồi xa dần về phía trạm
        const u = seg(T, 0, 3.6);
        cp.set(22 - 6 * u, 40 + 3 * u, 700); cl.set(-18, 34 - 10 * u, 60);
        setCam(cp, cl, 52 - 4 * u, -0.05 + 0.05 * u);
      } else if (T < 7.2) {                                           // S2: lướt dọc thân tàu từ đuôi tới mũi, thấy chữ + súng hông
        const u = eio(seg(T, 3.6, 7.2));
        shipLocal(-0.42 * L + 0.9 * L * u, 0.2 * L - 0.08 * L * u, 0.46 * L - 0.26 * L * u, cp);
        shipLocal(-0.1 * L + 0.95 * L * u, 0.02 * L - 0.35 * L * u, 0.05 * L * (1 - u), cl);
        cl.lerp(tmp.set(Sx, 0, Sz), eio(seg(u, 0.5, 1)));             // cuối cảnh: mắt nhìn chuyển dần xuống trạm (nối cảnh lao xuống)
        setCam(cp, cl, 44 - 6 * u, 0.12 * (1 - u));
      } else if (T < 11.4) {                                          // S3: lao xuống trạm, lướt sát mê cung (tường dựng theo), vòng lên góc game
        if (!this.dive) {
          const p0 = cp.clone(), l0 = cl.clone();
          this.dive = curve([p0, new V3(Sx + 16, 34, Sz + 30), new V3(Sx + 6, 6, Sz + 21), new V3(Sx - 5, 18, Sz + 36), O.pos.clone()]);
          this.diveL = curve([l0, new V3(Sx, 0, Sz - 4), new V3(Sx - 2, 1, Sz - 8), new V3(Sx, 0, Sz - 4), O.look.clone()]);
        }
        const u0 = seg(T, 7.2, 11.4), u = 0.5 * u0 + 0.5 * eio(u0);
        this.dive.getPoint(u, cp); this.diveL.getPoint(u, cl);
        setCam(cp, cl, 38 - 6 * u, 0.18 * Math.sin(u * Math.PI));
      } else setCam(O.pos, O.look, O.fov, 0);
    },
  };

  // ============================================================== B · THẢ ROBOT
  const B = {
    dur: 14.2, scale: 2.2, drop: 3.8, land: 6.6,
    setup() {
      fleet.cine.begin(this.scale); ctx.walls.flat();
      pod.g.visible = false; pod.petals.forEach(p => { p.rotation.x = 0; }); pod.cap.position.y = 3.7 + 0.75; pod.cap.rotation.set(0, 0, 0); pod.hot.emissiveIntensity = 0;
      at(0.0, () => { snd.rumble(3.8, 0.28); on(".mc-cine", "bars"); });
      at(0.4, () => snd.braam(0, 41.2, 0.26));
      at(0.7, () => on(".cine-pre", "in"));
      at(3.1, () => on(".cine-pre", "out"));
      at(this.drop - 0.25, () => { snd.clank(); snd.hiss(0.9, 0.1); });
      at(this.drop, () => { pod.g.visible = true; snd.whoosh(2.8, 0.28, 0, 200, 3800, 0, 0); });
      at(this.land - 0.45, () => { snd.hiss(0.5, 0.2); snd.engine(0.55, 0.2, 0, 90, 140); });
      at(this.land, () => {
        ctx.boom.explode(Sx, Sz, 1.15); snd.impact(0, 1.25); flash(0.55); ctx.shake(1);
        ctx.walls.rise(Sx, Sz); for (let i = 0; i < 26; i++) { const a = rnd(0, 6.28); emit(new V3(Sx, 0.4, Sz), new V3(Math.cos(a) * rnd(8, 16), rnd(0.5, 2.5), Math.sin(a) * rnd(8, 16)), rnd(0.8, 1.4), 1.2, 4.5, [0.5, 0.45, 0.42], [0.08, 0.07, 0.07], 0.5, false, 2.4); }
      });
      at(this.land + 0.9, () => { snd.hiss(1.4, 0.14); snd.servo(0.1); });
      at(this.land + 1.15, () => ctx.robot.set({ show: true, heading: this.faceCam(), salute: false }));
      at(this.land + 1.9, () => { ctx.robot.set({ show: true, heading: this.faceCam(), salute: true }); snd.servo(); snd.shimmer(0.2, 0.04); });
      at(this.land + 2.3, () => { ctx.enemies.rise(); snd.beep(700, 0); snd.beep(520, 0.14); snd.beep(700, 0.5); snd.beep(520, 0.64); });
      at(11.3, () => snd.riser(1.2, 0.14));
      at(12.5, () => { A.title(); fleet.cine.end(); });
      at(13.4, () => { ctx.robot.sink(); ctx.enemies.sink(); on(".cine-title", "out"); on(".mc-cine", "bars", false); });
      at(13.7, () => ctx.walls.sink());
    },
    faceCam() { return Math.atan2(O.pos.x - Sx, O.pos.z - Sz); },
    podY(T) { if (T < this.drop) return 92; const u = seg(T, this.drop, this.land); return 92 - 92 * (0.35 * u + 0.65 * u * u * u); },
    tick(T, dt) {
      const L = 47 * this.scale;
      fleet.cine.set(new V3(-30 + T * 4, 98, Sz - 4), new V3(1, 0, 0.05), 0.03 * Math.sin(T * 0.7), 4);
      // khoang: rơi, xoay nhẹ, loa hãm đỏ rực + phụt lửa trước lúc chạm; sau khi chạm bung vỏ, chóp bật lên; cuối cảnh bay lên trả về tàu
      const lift = -5 * eio(seg(T, 13.3, 14.1));                     // cuối cảnh: khoang chìm xuống boong cùng robot
      pod.g.position.set(Sx, T < this.land ? this.podY(T) : lift, Sz); pod.g.rotation.y = T < this.land ? T * 1.4 : pod.g.rotation.y;
      const brake = seg(T, this.land - 0.5, this.land) * (T < this.land + 0.2 ? 1 : 0);
      pod.hot.emissiveIntensity = 4 * brake;
      if (T > this.drop && T < this.land) {
        const n = brake > 0 ? 3 : 1;
        for (let i = 0; i < n; i++) emit(tmp.set(Sx + rnd(-0.3, 0.3), pod.g.position.y - 0.4, Sz + rnd(-0.3, 0.3)), new V3(rnd(-1, 1), brake > 0 ? -rnd(10, 18) : rnd(6, 12), rnd(-1, 1)),
          rnd(0.25, 0.5), brake > 0 ? 1.4 : 0.7, brake > 0 ? 3.4 : 2.2, [2.4, 1.3, 0.45], [0.6, 0.12, 0.03], brake > 0 ? 0.9 : 0.6, true, 1.2);
      }
      const open = eo(seg(T, this.land + 0.8, this.land + 1.6));
      pod.petals.forEach(p => { p.rotation.x = 1.48 * open; });       // bung gần nằm rạp xuống sàn
      pod.cap.position.y = 3.7 + 0.75 + 2.2 * open; pod.cap.rotation.z = 0.5 * open;
      if (T > 14) pod.g.visible = false;
      // máy quay
      if (T < 3.4) {                                                  // S1: toàn cảnh xa — trạm nhỏ dưới tàu khổng lồ, hành tinh phía sau
        const u = seg(T, 0, 3.4); cp.set(-250 + 40 * u, 30 + 10 * u, 290 - 40 * u); cl.set(-6, 46, -4); setCam(cp, cl, 34 - 3 * u, 0.04);
      } else if (T < 5.0) {                                           // S2: dưới bụng tàu nhìn lên — khoang nhả ra rơi xuống
        const u = seg(T, 3.4, 5.0); cp.set(Sx + 26 - 6 * u, 54 - 6 * u, Sz + 30); cl.set(Sx, 92 - 30 * seg(T, this.drop, 5.0), Sz - 4); setCam(cp, cl, 48, -0.1);
      } else if (T < this.land) {                                     // S3: bám theo khoang rơi, trạm lớn dần bên dưới
        const u = seg(T, 5.0, this.land), y = pod.g.position.y;
        cp.set(Sx + 9 - 3 * u, Math.max(y + 14 - 8 * u, 13), Sz + 12 + 4 * u); cl.set(Sx, Math.max(y - 6, 0), Sz); setCam(cp, cl, 50 - 8 * u, 0.15 * Math.sin(T * 3));
      } else if (T < 10.2) {                                          // S4: sát mặt boong — vỏ bung, robot đứng dậy chào, địch trồi lên
        const u = eio(seg(T, this.land, 10.2));
        cp.set(Sx + 11 - 17 * u, 4.2 - 0.6 * u, Sz + 12 - 1 * u); cl.set(Sx, 2.2, Sz); setCam(cp, cl, 40, 0);
      } else if (T < 12.4) {                                          // S5: kéo lùi lên góc game
        if (!this.back) { this.back = curve([cp.clone(), new V3(Sx - 10, 12, Sz + 22), new V3(O.pos.x - 8, O.pos.y * 0.7, O.pos.z * 0.9), O.pos.clone()]); this.backL = curve([cl.clone(), new V3(Sx, 1.6, Sz - 2), O.look.clone()]); }
        const u = eio(seg(T, 10.2, 12.4)); this.back.getPoint(u, cp); this.backL.getPoint(u, cl); setCam(cp, cl, 40 - 8 * u, 0);
      } else setCam(O.pos, O.look, O.fov, 0);
    },
  };
  const tmp = new V3();

  // ============================================================== C · BÁO ĐỘNG ĐỎ
  const C = {
    dur: 13.4,
    setup() {
      ctx.walls.flat(); ctx.dim(0.06); beacons.list.forEach(b => { b.g.visible = true; });
      this.path = ctx.path();                                         // hành lang từ góc xa nhất tới ô xuất phát (tâm các ô)
      ctx.enemies.show(); ctx.enemies.hideNear(this.path[0][0], this.path[0][1]);   // robot ở góc máy quay xuất phát sẽ che kín hình
      const pts = this.path.map(([x, z]) => new V3(x, 1.25, z));
      this.run = curve(pts); this.runLen = this.run.getLength();
      at(0.0, () => { on(".mc-cine", "bars"); on(".mc-cine", "red"); snd.siren(7.6, 0.075, 0.2); });
      [0.3, 1.25, 2.2, 3.1, 4.0, 4.9, 5.8, 6.7].forEach(t => at(t, () => snd.heart()));
      at(0.5, () => { hudLine("⚠  WARNING", "big"); snd.beep(1600); snd.beep(1600, 0.12); });
      at(1.2, () => { hudLine("INTRUDER DETECTED"); snd.beep(1200); });
      at(1.9, () => { hudLine("SECTOR 7 · LOCKDOWN"); snd.beep(1200); });
      at(2.6, () => { hudLine("ACTIVATING MAZE DEFENCE", "blink"); snd.beep(900); snd.beep(900, 0.1); });
      at(3.2, () => { on(".cine-hud", "out"); snd.whoosh(4.2, 0.22, 0, 300, 1400, 0, 0); });
      for (let t = 3.4; t < 7.3; t += 0.34) at(t, () => snd.thud(0, 0.16));
      at(7.4, () => { snd.powerUp(); snd.whoosh(1.4, 0.26, 0, 500, 4000, -0.3, 0.3); });
      at(7.9, () => { $(".cine-hud").innerHTML = ""; hudLine("SYSTEM ONLINE", "ok"); on(".cine-hud", "out", false); on(".mc-cine", "red", false); });
      at(9.0, () => on(".cine-hud", "out"));
      at(9.7, () => snd.riser(1.2, 0.14));
      at(10.9, () => { on(".cine-title", "neon"); snd.impact(0, 0.9); flash(0.5); snd.shimmer(0.1); ctx.shake(0.35); });
      at(12.3, () => { ctx.enemies.sink(); on(".cine-title", "out"); on(".mc-cine", "bars", false); });
      at(12.7, () => ctx.walls.sink());
    },
    tick(T, dt) {
      beacons.list.forEach((b, i) => { b.blades.rotation.y += dt * (3.2 + i * 0.13); });
      const alarm = 1 - seg(T, 7.4, 8.0);
      beacons.bladeM.opacity = 0.16 * alarm; beacons.domeM.emissiveIntensity = 0.3 + 3.7 * alarm * (0.6 + 0.4 * Math.sin(T * 9));
      // đèn bật lại từng khu (chập chờn) sau 7,6 s
      const k = T < 7.6 ? 0.06 : Math.min(1, 0.06 + 0.94 * seg(T, 7.6, 9.0) * (Math.random() < 0.18 && T < 8.8 ? 0.35 : 1));
      ctx.dim(k);
      const red = alarm * (0.55 + 0.45 * Math.sin(T * 5.3));
      if (T < 3.2) {                                                  // S1: sát sàn trong bóng tối, đẩy chậm dọc hành lang đầu
        const u = seg(T, 0, 3.2), p0 = this.run.getPointAt(0), p1 = this.run.getPointAt(Math.min(1, 6 / this.runLen));
        cp.copy(p0).lerp(p1, 0.45 * u); cp.y = 1.1 + 0.2 * u; cl.copy(p1).lerp(p0, -1.2); cl.y = 1.0;
        setCam(cp, cl, 58, 0.06 * Math.sin(T * 0.8));
        ctx.walls.front(this.path[0][0], this.path[0][1], 13);
      } else if (T < 7.4) {                                           // S2: lao như tên bắn qua hành lang; tường sập dựng ngay trước mặt
        const u = eio(seg(T, 3.2, 7.4)), s = u * 0.97;
        this.run.getPointAt(s, cp); this.run.getPointAt(Math.min(1, s + 5 / this.runLen), cl);
        this.run.getTangentAt(s, tmp); const t2 = this.run.getTangentAt(Math.min(1, s + 3 / this.runLen));
        const turn = tmp.x * t2.z - tmp.z * t2.x;
        this.roll = (this.roll || 0) + (Math.max(-0.32, Math.min(0.32, turn * 0.8)) - (this.roll || 0)) * Math.min(1, dt * 4);
        cp.y = 1.25 + 0.15 * Math.sin(T * 13) * 0.3; cl.y = 1.1;
        setCam(cp, cl, 62 + 6 * Math.sin(u * Math.PI), this.roll);
        ctx.walls.front(this.path[0][0], this.path[0][1], Math.max(13, s * this.runLen + 9));
      } else if (T < 10.8) {                                          // S3: vọt lên khỏi hành lang, xoay về góc game; đèn bật lại
        if (!this.up) {
          const p0 = cp.clone(), l0 = cl.clone();
          this.up = curve([p0, new V3(Sx, 9, Sz + 3), new V3(Sx + 6, 30, Sz + 26), O.pos.clone()]); this.upL = curve([l0, new V3(Sx, 1, Sz - 6), new V3(Sx, 0, Sz - 4), O.look.clone()]);
        }
        const u = eio(seg(T, 7.4, 10.8)); this.up.getPoint(u, cp); this.upL.getPoint(u, cl); setCam(cp, cl, 62 - 30 * u, this.roll * (1 - u));
        ctx.walls.front(this.path[0][0], this.path[0][1], this.runLen + 10 + 90 * u);
      } else setCam(O.pos, O.look, O.fov, 0);
      ctx.redLight(cp, red * 7);
    },
  };

  const VARIANTS = { a: A, b: B, c: C };

  // ---------------- điều khiển chung
  function reset() {
    cues = []; T = 0; ov.classList.remove("bars", "red"); $(".cine-hud").innerHTML = ""; $(".cine-hud").classList.remove("out");
    ["in", "out"].forEach(c => $(".cine-pre").classList.remove(c)); ["slam", "neon", "out"].forEach(c => $(".cine-title").classList.remove(c));
    A.dive = null; B.back = null; C.up = null; C.roll = 0;
  }
  function cleanup() {
    active = false; ov.hidden = true; reset();
    parts.forEach(p => { p.s.visible = false; });
    pod.g.visible = false; beacons.list.forEach(b => { b.g.visible = false; });
    if (fleet.cine.active) fleet.cine.end();
    ctx.dim(1); ctx.redLight(null, 0); ctx.clearCam(); ctx.enemies.clear(); ctx.robot.set({ show: false });
  }
  return {
    get active() { return active; },
    start(variant, done) {
      V = VARIANTS[variant] || A; onDone = done; reset(); active = true; ov.hidden = false; ov.classList.add("black");
      prep = 0;                                                       // 2 khung đầu dưới màn đen: làm nóng shader
      V.setup();
      pod.g.visible = true; pod.g.position.set(Sx, 3, Sz); beacons.list.forEach(b => { b.g.visible = true; });
      for (let i = 0; i < 6; i++) emit(new V3(Sx, 2, Sz), new V3(), 0.2, 1, 1, [1, 1, 1], [1, 1, 1], 0.01, i % 2 === 0);
      ctx.warm();
    },
    update(dt) {
      if (!active) return;
      if (prep >= 0) {                                                // khung làm nóng: dựng góc đầu, vẽ thật dưới màn đen
        prep++;
        if (prep === 1) { V.tick(0, 0); return; }
        if (V !== B) pod.g.visible = false; if (V !== C) beacons.list.forEach(b => { b.g.visible = false; });
        prep = -1; ov.classList.remove("black"); ov.classList.add("fadein");
        return;
      }
      T += dt;
      for (const c of cues) if (!c.done && c.t <= T) { c.done = true; c.fn(); }
      V.tick(Math.min(T, V.dur), dt);
      tickParts(dt);
      if (T >= V.dur) { const cb = onDone; cleanup(); ov.classList.remove("fadein"); cb && cb(); }
    },
    skip() { if (!active) return; snd.stop(); const cb = onDone; cleanup(); cb && cb(); },
    abort() { if (!active) return; snd.stop(); cleanup(); },
  };
}
