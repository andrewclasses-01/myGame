// MAZE CHASE 3D — TÀU ANDREW CLASSES SĂN TÀU CON (mẫu 1j, 29/9/2026). Thầy: "tàu nhỏ còn 2/3 · xuất hiện chéo từ cạnh đáy màn hình (nửa trái
// hoặc phải), bay chéo lên, rượt đuổi 1 tàu nhỏ khác, bắn đạn từ 2 bên tàu thẳng tới tàu con; tàu con phát nổ ở chỗ NHÌN THẤY ĐƯỢC sau
// nhiều phát trúng · chữ ANDREW CLASSES ở GIỮA tàu, 1 chữ ngửa lên · bắn xong bay thẳng tiếp · lát sau quay lại săn con tàu khác hình dạng
// khác, cũng nổ · lửa giống thật, đẹp, chi tiết hơn · tàu chi tiết, giống thật hơn (đang như lego) · tàu con cũng chi tiết". Thầy chốt:
// 45–60 s/lượt; lượt sau vào từ hướng khác (dưới lên / trên xuống / đôi khi ngang hai bên), không trùng chỗ vào của lượt ngay trước.
import * as THREE from "three";

const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
function tex(w, h, draw, srgb = true) {
  const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const noShadow = o => o.traverse(m => { if (m.isMesh) { m.castShadow = false; m.receiveShadow = false; } });

// ---------------------------------------------------------------- LỬA ĐỘNG CƠ (shader): lõi xanh trắng + vòng sốc sáng + viền cam cuộn nhiễu
const FLAME_VS = `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`;
const FLAME_FS = `uniform float uTime; uniform float uPower; uniform vec3 uCore; uniform vec3 uEdge; uniform float uShock; uniform float uSeed;
  varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
  void main(){
    float v = vUv.y;                                         // 0 = miệng loa, 1 = đuôi lửa
    float face = pow(abs(dot(normalize(vN), normalize(vV))), 1.3); // giữa thân lửa sáng, mép mờ
    float turb = n(vec2(vUv.x * 9.0 + uSeed, v * 7.0 - uTime * 9.0)) * 0.6 + n(vec2(vUv.x * 21.0, v * 16.0 - uTime * 17.0)) * 0.4;
    float body = pow(1.0 - v, 1.6) * (0.55 + 0.6 * turb);
    float shock = uShock * pow(max(0.0, sin(v * 34.0 - uTime * 3.0)), 12.0) * (1.0 - v) * 1.4;   // vòng sốc (mach diamonds)
    vec3 col = mix(uCore, uEdge, smoothstep(0.05, 0.75, v + turb * 0.2)) * (body + shock) * uPower;
    float a = clamp((body + shock) * face * uPower, 0.0, 1.0);
    gl_FragColor = vec4(col * face, a);
  }`;
function flameMat(core, edge, shock, seed) {
  return new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uPower: { value: 1 }, uCore: { value: new THREE.Color(...core) }, uEdge: { value: new THREE.Color(...edge) }, uShock: { value: shock }, uSeed: { value: seed } },
    vertexShader: FLAME_VS, fragmentShader: FLAME_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false });
}
// một cụm lửa cho 1 miệng loa: lõi hẹp + thân rộng + quầng sáng tròn
const glowTexC = tex(64, 64, (g, s) => { const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.3, "rgba(255,255,255,.5)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, s, s); });
function makeFlame(r, len, opt = {}) {
  const g = new THREE.Group(), mats = [];
  const inner = flameMat(opt.core ?? [1.6, 2.1, 3.2], opt.mid ?? [0.9, 1.3, 2.6], 1, Math.random() * 50);
  const outer = flameMat(opt.edge1 ?? [1.2, 1.0, 1.4], opt.edge2 ?? [1.4, 0.55, 0.18], 0, Math.random() * 50);
  const c1 = new THREE.Mesh(new THREE.ConeGeometry(r * 0.66, len * 0.85, 20, 8, true).translate(0, len * 0.425, 0), inner);
  const c2 = new THREE.Mesh(new THREE.ConeGeometry(r * 1.05, len, 20, 8, true).translate(0, len * 0.5, 0), outer);
  c1.rotation.z = c2.rotation.z = Math.PI / 2;                         // mũi lửa hướng −x (ra sau tàu)
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexC, color: new THREE.Color(...(opt.halo ?? [0.35, 0.6, 1.3])), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  halo.scale.setScalar(r * 2.6);
  g.add(c2, c1, halo); mats.push(inner, outer);
  return { g, mats, halo, c1, c2, r };
}
function tickFlame(f, t, power = 1) {
  f.mats.forEach((m, i) => { m.uniforms.uTime.value = t + i * 3.1; m.uniforms.uPower.value = power * (0.92 + Math.random() * 0.12); });
  const j = 0.9 + Math.random() * 0.2; f.c2.scale.set(1, j, 1); f.halo.material.opacity = 0.45 + Math.random() * 0.2;
}

// ---------------------------------------------------------------- TÀU LỚN (dài 1, phóng to sau)
function buildHunter() {
  const HW = 0.3, HT = 0.07, HB = 0.05;
  const hc = x => HT * (0.5 - x), hw = x => HW * (0.5 - x);
  const ship = new THREE.Group(), body = new THREE.Group(); ship.add(body);
  // vỏ: tấm thép nhiều cỡ, đường ghép, rãnh tối, nắp tròn, vết bẩn — map + bump (độ phân giải cao)
  const plating = tex(2048, 1024, (g, w, h) => {
    g.fillStyle = "#8a9099"; g.fillRect(0, 0, w, h);
    for (let s = 0; s < 3; s++) for (let i = 0; i < [500, 1600, 4000][s]; i++) {
      const v = 118 + Math.floor(Math.random() * 44); g.fillStyle = `rgb(${v},${v + 2},${v + 6})`;
      const sw = [rnd(60, 180), rnd(18, 60), rnd(5, 16)][s], sh = [rnd(30, 90), rnd(10, 36), rnd(4, 10)][s];
      g.fillRect(Math.random() * w, Math.random() * h, sw, sh);
    }
    g.strokeStyle = "rgba(38,42,50,.45)"; g.lineWidth = 1;
    for (let x = 0; x < w; x += 24) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y < h; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.fillStyle = "rgba(28,31,38,.8)"; for (let i = 0; i < 90; i++) g.fillRect(Math.random() * w, Math.random() * h, rnd(60, 380), rnd(2, 5));
    for (let i = 0; i < 160; i++) { g.strokeStyle = "rgba(40,44,52,.6)"; g.lineWidth = 1.5; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, rnd(3, 9), 0, 7); g.stroke(); }
    for (let i = 0; i < 70; i++) { const x = Math.random() * w, y = Math.random() * h, r = rnd(40, 160), gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, "rgba(40,36,34,.18)"); gr.addColorStop(1, "rgba(40,36,34,0)"); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
    g.fillStyle = "#5a6069"; g.fillRect(0, h / 2 - 6, w, 12);
  });
  const hullMat = new THREE.MeshStandardMaterial({ map: plating, bumpMap: plating, bumpScale: 1.4, color: 0x9aa0a8, metalness: 0.45, roughness: 0.62, side: THREE.DoubleSide });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2a2e36, metalness: 0.6, roughness: 0.5 });
  // thân trên (2 mặt dốc) + bậc hông nhiều tầng + bụng
  const wedge = (hwS, top, bot, inset, mat) => {
    const N = [0.5 - inset, 0, 0], RL = [-0.5, 0, -hwS], RR = [-0.5, 0, hwS], T = [-0.5, top, 0], B = [-0.5, -bot, 0];
    const tris = [[N, T, RL], [N, RR, T], [N, RL, B], [N, B, RR], [RL, T, RR], [RL, RR, B]], pos = [], uv = [];
    tris.forEach(t => t.forEach(p => { pos.push(...p); uv.push(p[0] + 0.5, (p[2] + HW) / (2 * HW)); }));
    const gg = new THREE.BufferGeometry(); gg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); gg.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); gg.computeVertexNormals();
    return new THREE.Mesh(gg, mat);
  };
  body.add(wedge(HW, HT, HB, 0, hullMat));
  [[1.035, 0.004, 0.012, 0.012, darkMat], [1.06, -0.012, 0.006, 0.02, hullMat], [1.075, -0.022, 0.006, 0.03, darkMat]].forEach(([k, y, tp, inset, m]) => {
    const w = wedge(HW * k, tp, tp, inset, m); w.position.y = y; body.add(w);    // các tầng hông xếp lớp như ảnh
  });
  // chi tiết phủ boong: cỡ phân bố lệch (rất nhiều khối li ti, ít khối vừa), 3 loại hình
  const box = new THREE.BoxGeometry(1, 1, 1), cyl = new THREE.CylinderGeometry(0.5, 0.5, 1, 10);
  const gMat = new THREE.MeshStandardMaterial({ metalness: 0.5, roughness: 0.58 });
  const GN = 3200, CN = 420, gre = new THREE.InstancedMesh(box, gMat, GN), gcy = new THREE.InstancedMesh(cyl, gMat, CN);
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _c = new THREE.Color();
  let gi = 0, ci = 0;
  const shade = () => { const k = rnd(0.07, 0.15); return _c.setRGB(k, k * 1.01, k * 1.05); };   // cùng tông vỏ tàu (màu tuyến tính) ⇒ hết lấm tấm kiểu lego
  const addB = (x, y, z, sx, sy, sz, rx = 0, ry = 0) => { if (gi >= GN) return; _q.setFromEuler(_e.set(rx, ry, 0)); _m.compose(_p.set(x, y, z), _q, _s.set(sx, sy, sz)); gre.setMatrixAt(gi, _m); gre.setColorAt(gi, shade()); gi++; };
  const addC = (x, y, z, r, hh, rx = 0) => { if (ci >= CN) return; _q.setFromEuler(_e.set(rx, 0, 0)); _m.compose(_p.set(x, y, z), _q, _s.set(r, hh, r)); gcy.setMatrixAt(ci, _m); gcy.setColorAt(ci, shade()); ci++; };
  const onDeck = (x, z) => hc(x) * (1 - Math.abs(z) / Math.max(1e-4, hw(x)));
  const underText = (x, z) => x > -0.25 && x < 0.29 && Math.abs(z) < 0.05;   // dải boong dưới chữ ANDREW CLASSES để trống (chữ không bị khối chi tiết đâm xuyên)
  for (let i = 0; i < 2600; i++) {
    const x = 0.5 - Math.pow(Math.random(), 0.75) * 0.97, w = hw(x) * 0.97, z = rnd(-w, w), top = onDeck(x, z), sl = Math.atan2(hc(x), hw(x)) * Math.sign(z);
    if (underText(x, z)) continue;
    const big = Math.random() < 0.06, s = big ? rnd(0.008, 0.02) : Math.exp(rnd(Math.log(0.0012), Math.log(0.007)));
    const sy = s * rnd(0.3, 0.9);
    addB(x, top + sy * 0.4, z, s * rnd(1, 2.4), sy, s * rnd(0.6, 1.4), sl, Math.random() < 0.2 ? rnd(-0.3, 0.3) : 0);
  }
  for (let i = 0; i < 260; i++) { const x = rnd(-0.45, 0.35), w = hw(x) * 0.9, z = rnd(-w, w), top = onDeck(x, z), r = rnd(0.0015, 0.005), hh = rnd(0.002, 0.012); if (!underText(x, z)) addC(x, top + hh / 2, z, r, hh); }
  for (let i = 0; i < 40; i++) { const x = rnd(0.3, 0.45); addB(x, hc(x) + 0.003, rnd(-0.004, 0.004), rnd(0.01, 0.05), 0.005, 0.006); }   // sống lưng (phía mũi, ngoài vùng chữ)
  // tháp pháo 2 bên sườn (cũng là chỗ bắn đạn)
  const turrets = [];
  const turMat = new THREE.MeshStandardMaterial({ color: 0x7d838c, metalness: 0.6, roughness: 0.45 });
  for (const s of [-1, 1]) for (let i = 0; i < 6; i++) {
    const x = -0.35 + i * 0.13, z = s * hw(x) * 0.78, y = onDeck(x, z);
    const t = new THREE.Group(); t.position.set(x, y + 0.004, z); body.add(t);
    t.add(new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.011, 0.006, 14), turMat));
    const hd = new THREE.Mesh(new THREE.SphereGeometry(0.007, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), turMat); hd.position.y = 0.003; t.add(hd);
    for (const b of [-0.003, 0.003]) { const br = new THREE.Mesh(new THREE.CylinderGeometry(0.0012, 0.0012, 0.02, 6), darkMat); br.rotation.z = Math.PI / 2; br.position.set(0.01, 0.006, b); t.add(br); }
    turrets.push({ g: t, side: s });
  }
  // thượng tầng: khối vát cạnh xếp bậc + cửa sổ + chi tiết
  const supMat = new THREE.MeshStandardMaterial({ map: plating, color: 0x8b9199, metalness: 0.45, roughness: 0.6 });
  const bev = (sx, sy, sz) => {
    const sh = new THREE.Shape(), a = sx / 2, b = sz / 2, c = Math.min(a, b) * 0.22;
    sh.moveTo(-a + c, -b); sh.lineTo(a - c, -b); sh.lineTo(a, -b + c); sh.lineTo(a, b - c); sh.lineTo(a - c, b); sh.lineTo(-a + c, b); sh.lineTo(-a, b - c); sh.lineTo(-a, -b + c); sh.closePath();
    const gg = new THREE.ExtrudeGeometry(sh, { depth: sy, bevelEnabled: true, bevelThickness: sy * 0.18, bevelSize: sy * 0.18, bevelSegments: 1 }); gg.rotateX(-Math.PI / 2); gg.translate(0, -sy / 2, 0);
    return gg;
  };
  const tiers = [[-0.34, 0.26, 0.045, 0.22, 0.068], [-0.37, 0.19, 0.034, 0.16, 0.107], [-0.393, 0.14, 0.028, 0.115, 0.138], [-0.41, 0.095, 0.022, 0.08, 0.163]];
  const winMat = new THREE.MeshBasicMaterial({ toneMapped: false });
  const WN = 700, win = new THREE.InstancedMesh(box, winMat, WN); let wi = 0;
  const addW = (x, y, z, ry) => { if (wi >= WN) return; _q.setFromEuler(_e.set(0, ry, 0)); _m.compose(_p.set(x, y, z), _q, _s.set(0.0035, 0.0018, 0.001)); win.setMatrixAt(wi, _m); const on = Math.random() < 0.78, k = on ? rnd(1.3, 2.3) : 0.04; win.setColorAt(wi, _c.setRGB(k, k * 0.88, k * 0.62)); wi++; };
  tiers.forEach(([x, sx, sy, sz, y]) => {
    const m = new THREE.Mesh(bev(sx, sy, sz), supMat); m.position.set(x, y, 0); body.add(m);
    for (let k = 0; k < 90; k++) { const s = Math.exp(rnd(Math.log(0.0015), Math.log(0.008))); addB(x + rnd(-sx / 2, sx / 2) * 0.9, y + sy / 2 + 0.001 + s * 0.2, rnd(-sz / 2, sz / 2) * 0.9, s * 1.6, s * 0.5, s); }
    for (let r = 0; r < 3; r++) for (let i = 0; i < 16; i++) for (const s of [-1, 1]) addW(x + rnd(-sx / 2, sx / 2) * 0.9, y - sy * 0.3 + r * sy * 0.25, s * (sz / 2 + 0.0008), 0);
  });
  // cổ tháp + đài chỉ huy + 2 vòm cầu có đai + thanh chống
  const neck = new THREE.Mesh(bev(0.03, 0.05, 0.022), supMat); neck.position.set(-0.43, 0.2, 0); body.add(neck);
  const bridge = new THREE.Mesh(bev(0.058, 0.02, 0.17), supMat); bridge.position.set(-0.43, 0.233, 0); body.add(bridge);
  for (let i = 0; i < 40; i++) addW(-0.4 + 0.0012, 0.232 + (i % 2) * 0.003, -0.07 + (i / 40) * 0.14, Math.PI / 2);
  const domeMat = new THREE.MeshStandardMaterial({ color: 0xbfc5ce, metalness: 0.45, roughness: 0.4, flatShading: true });
  for (const z of [-0.06, 0.06]) {
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.007, 0.022, 10), supMat); st.position.set(-0.435, 0.252, z); body.add(st);
    const d = new THREE.Mesh(new THREE.IcosahedronGeometry(0.017, 3), domeMat); d.position.set(-0.435, 0.268, z); body.add(d);
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.017, 0.0015, 6, 24).rotateX(Math.PI / 2), darkMat); band.position.copy(d.position); body.add(band);
  }
  for (let i = 0; i < 60; i++) addB(-0.43 + rnd(-0.028, 0.028), 0.244, rnd(-0.08, 0.08), rnd(0.002, 0.008), rnd(0.001, 0.004), rnd(0.002, 0.009));
  // cửa sổ dọc các tầng hông
  for (const s of [-1, 1]) { const ang = Math.atan2(HW, 1) * s; for (let i = 0; i < 420; i++) { const x = rnd(-0.49, 0.46), lay = i % 3; addW(x, 0.004 - lay * 0.012, s * hw(x) * (1.035 + lay * 0.02) + s * 0.0008, -ang); } }
  gre.count = gi; gcy.count = ci; win.count = wi;
  [gre, gcy, win].forEach(m => { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; body.add(m); });
  // slogan: MỘT dòng ở giữa tàu, ngửa lên trên, sáng đèn
  const sloganTex = tex(1024, 160, (g, w, h) => {
    g.textAlign = "center"; g.textBaseline = "middle"; g.font = "900 110px 'Arial Black', Arial, sans-serif";
    g.shadowColor = "rgba(120,220,255,1)"; g.shadowBlur = 20; g.fillStyle = "#e6fbff"; g.fillText("ANDREW CLASSES", w / 2, h / 2 + 5, w - 30);
    g.shadowBlur = 0; g.fillText("ANDREW CLASSES", w / 2, h / 2 + 5, w - 30);
  });
  const sloganMat = new THREE.MeshBasicMaterial({ map: sloganTex, transparent: true, depthWrite: false, toneMapped: false, color: new THREE.Color(2, 2.3, 2.6) });
  const slogans = [false, true].map(flip => {
    const L = 0.5, H = L * 160 / 1024, x0 = 0.02;
    const geo = new THREE.PlaneGeometry(L, H); if (flip) geo.rotateZ(Math.PI);
    const m = new THREE.Mesh(geo, sloganMat);
    m.position.set(x0, hc(x0) + 0.006, 0); m.rotation.set(-Math.PI / 2, 0, 0);
    m.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), -Math.atan(HT));  // theo dốc sống lưng (cao dần về đuôi)
    m.renderOrder = 3; body.add(m); return { m, flip };
  });
  // động cơ: loa phụt tiện tròn (lathe) + lõi sáng + lửa shader
  const engMat = new THREE.MeshStandardMaterial({ color: 0x3b4048, metalness: 0.75, roughness: 0.35, side: THREE.DoubleSide });
  const coreMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 2.0, 2.8), toneMapped: false });
  const flames = [];
  [[0.032, 0, 0.03], [0.032, -0.072, 0.03], [0.032, 0.072, 0.03], [0.014, -0.125, 0.016], [0.014, 0.125, 0.016], [0.012, -0.038, 0.064], [0.012, 0.038, 0.064]].forEach(([r, z, y]) => {
    const prof = [[r * 0.7, 0], [r * 0.95, 0.01], [r * 1.12, 0.03], [r * 1.18, 0.045], [r * 1.05, 0.05]].map(([a, b]) => new THREE.Vector2(a, b));
    const bell = new THREE.Mesh(new THREE.LatheGeometry(prof, 28), engMat); bell.rotation.z = Math.PI / 2; bell.position.set(-0.49, y, z); body.add(bell);
    const core = new THREE.Mesh(new THREE.CircleGeometry(r * 0.95, 24), coreMat); core.rotation.y = -Math.PI / 2; core.position.set(-0.528, y, z); body.add(core);
    const f = makeFlame(r * 1.05, r * 9); f.g.position.set(-0.535, y, z); body.add(f.g); flames.push(f);
  });
  noShadow(ship);
  return { g: ship, body, turrets, flames, slogans, sloganMat, nozzles: flames.map(f => f.g.position.clone()) };
}

// ---------------------------------------------------------------- TÀU CON (3 kiểu, dài ~1 rồi phóng to) — mũi hướng +x
function stdM(o) { return new THREE.MeshStandardMaterial({ metalness: 0.55, roughness: 0.45, ...o }); }
function panelTex(base, stripe) {
  return tex(256, 128, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 120; i++) { const v = Math.random() * 30 - 15; g.fillStyle = `rgba(${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${Math.abs(v) / 200})`; g.fillRect(Math.random() * w, Math.random() * h, rnd(10, 40), rnd(6, 20)); }
    g.strokeStyle = "rgba(0,0,0,.35)"; for (let x = 0; x < w; x += 20) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    g.fillStyle = stripe; g.fillRect(0, h * 0.42, w, h * 0.1);
  });
}
function buildFighter() {           // tiêm kích 4 cánh chữ X, thân nhọn, buồng lái kính, 4 động cơ, súng đầu cánh
  const g = new THREE.Group(), parts = [];
  const hull = stdM({ map: panelTex("#c9ccd2", "#b8452f"), color: 0xffffff }), dark = stdM({ color: 0x3a3f48 }), glass = stdM({ color: 0x0c1830, metalness: 0.9, roughness: 0.1 });
  const prof = [[0, 0.62], [0.035, 0.5], [0.06, 0.2], [0.07, -0.1], [0.075, -0.32], [0.06, -0.4], [0, -0.4]].map(([r, y]) => new THREE.Vector2(r, y));
  const fus = new THREE.Mesh(new THREE.LatheGeometry(prof, 18), hull); fus.rotation.z = -Math.PI / 2; g.add(fus); parts.push(fus);
  const can = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), glass); can.scale.set(1.8, 0.8, 1); can.position.set(0.08, 0.05, 0); g.add(can); parts.push(can);
  for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
    const w = new THREE.Group(); w.rotation.x = sz * sy * 0.28; g.add(w);
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.012, 0.5), hull); wing.position.set(-0.12, sy * 0.02, sz * 0.3); w.add(wing);
    const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.3, 14), dark); eng.rotation.z = Math.PI / 2; eng.position.set(-0.12, sy * 0.05, sz * 0.12); w.add(eng);
    const gun = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.5, 8), dark); gun.rotation.z = Math.PI / 2; gun.position.set(0.02, sy * 0.02, sz * 0.55); w.add(gun);
    parts.push(w);
  }
  return { g, parts, nozzles: [[-0.28, 0.05, 0.12], [-0.28, 0.05, -0.12], [-0.28, -0.05, 0.12], [-0.28, -0.05, -0.12]], flameR: 0.035 };
}
function buildFreighter() {         // tàu hàng hình đĩa: thân tròn dẹt, 2 càng trước, buồng lái ống bên hông, chảo ăng-ten, dải lửa sau
  const g = new THREE.Group(), parts = [];
  const hull = stdM({ map: panelTex("#b9bcc0", "#7a3b2f"), color: 0xffffff }), dark = stdM({ color: 0x3a3f48 });
  const prof = [[0, 0.07], [0.3, 0.06], [0.42, 0.03], [0.45, 0], [0.42, -0.03], [0.3, -0.05], [0, -0.06]].map(([r, y]) => new THREE.Vector2(r, y));
  const disc = new THREE.Mesh(new THREE.LatheGeometry(prof, 36), hull); g.add(disc); parts.push(disc);
  for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.05, 0.11), hull); m.position.set(0.5, 0, s * 0.1); g.add(m); parts.push(m); }
  const cock = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.28, 14), hull); cock.rotation.x = Math.PI / 2; cock.position.set(0.1, 0, 0.46); g.add(cock); parts.push(cock);
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 8, 0, Math.PI * 2, 0, Math.PI / 3), dark); dish.position.set(0.05, 0.1, -0.2); dish.rotation.x = -0.6; g.add(dish); parts.push(dish);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.04, 20), dark); top.position.y = 0.08; g.add(top); parts.push(top);
  for (let i = 0; i < 26; i++) { const a = rnd(0, 7), r = rnd(0.14, 0.4), b = new THREE.Mesh(new THREE.BoxGeometry(rnd(0.02, 0.06), 0.015, rnd(0.02, 0.05)), dark); b.position.set(Math.cos(a) * r, 0.06 - r * 0.04, Math.sin(a) * r); g.add(b); parts.push(b); }
  return { g, parts, nozzles: [[-0.44, 0, -0.18], [-0.45, 0, 0], [-0.44, 0, 0.18]], flameR: 0.05 };
}
function buildInterceptor() {       // tàu chặn: buồng lái cầu + 2 cánh lục giác đứng + khung nối
  const g = new THREE.Group(), parts = [];
  const hull = stdM({ color: 0x8e949c }), dark = stdM({ color: 0x2d3139 }), glass = stdM({ color: 0x101820, metalness: 0.9, roughness: 0.15 });
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 14), hull); g.add(ball); parts.push(ball);
  const win = new THREE.Mesh(new THREE.CircleGeometry(0.075, 8), glass); win.rotation.y = Math.PI / 2; win.position.x = 0.141; g.add(win); parts.push(win);
  for (const s of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.26), hull); arm.position.z = s * 0.17; g.add(arm); parts.push(arm);
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.02, 6), dark); w.rotation.x = Math.PI / 2; w.position.z = s * 0.3; g.add(w); parts.push(w);
    const frame = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.015, 4, 6), hull); frame.position.z = s * 0.3 + s * 0.012; g.add(frame); parts.push(frame);
    for (let k = 0; k < 6; k++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.4, 0.012), hull); sp.rotation.z = k * Math.PI / 3; sp.position.z = s * 0.3 + s * 0.013; g.add(sp); }
  }
  return { g, parts, nozzles: [[-0.14, 0, 0.05], [-0.14, 0, -0.05]], flameR: 0.03 };
}
const PREY = [buildFighter, buildFreighter, buildInterceptor];

// ---------------------------------------------------------------- HẠM ĐỘI
export function createFleet(scene, camera, opts = {}) {
  const LEN = opts.length ?? 47, DIST = opts.dist ?? 330, CROSS_S = opts.cross ?? 19, PREY_LEN = LEN * 0.3;
  const H = buildHunter(); H.body.scale.setScalar(LEN); H.g.visible = false; scene.add(H.g);
  const preyBuilt = PREY.map(fn => { const p = fn(); p.g.scale.setScalar(PREY_LEN); p.g.visible = false; scene.add(p.g);
    p.flames = p.nozzles.map(n => { const f = makeFlame(p.flameR, p.flameR * 7, { core: [1.8, 1.6, 1.2], mid: [1.6, 1.0, 0.5], edge1: [1.4, 0.8, 0.4], edge2: [1.2, 0.4, 0.1], halo: [1.6, 1.0, 0.5] }); f.g.position.set(...n); p.g.add(f.g); return f; });
    noShadow(p.g); p.parts.forEach(q => { q.userData.home = { p: q.position.clone(), r: q.rotation.clone() }; }); return p; });

  // đạn laser + tia lửa trúng + vụ nổ (bể dùng lại)
  const boltGeo = new THREE.CylinderGeometry(0.35, 0.35, 9, 8).rotateZ(Math.PI / 2);
  const bolts = Array.from({ length: 36 }, () => { const m = new THREE.Mesh(boltGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 0.5, 0.4), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexC, color: new THREE.Color(2.4, 0.4, 0.3), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false })); glow.scale.set(6, 6, 1); m.add(glow);
    m.visible = false; scene.add(m); return { m, v: new THREE.Vector3(), life: 0, hit: false }; });
  const fireTex = tex(128, 128, (g, s) => { for (let i = 0; i < 16; i++) { const a = rnd(0, 7), d = rnd(0, s * 0.18), x = s / 2 + Math.cos(a) * d, y = s / 2 + Math.sin(a) * d, r = rnd(s * 0.15, s * 0.3), gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, "rgba(255,255,255,.7)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, s, s); } });
  const puffs = Array.from({ length: 70 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: fireTex, transparent: true, depthWrite: false })); s.visible = false; scene.add(s); return { s, life: 0, max: 1, v: new THREE.Vector3(), s0: 1, s1: 2, kind: "" }; });
  let pi = 0;
  const puff = (pos, kind, o = {}) => { const p = puffs[pi++ % puffs.length]; p.s.position.copy(pos); p.s.visible = true; p.life = 0; p.max = o.max ?? 1; p.kind = kind; p.s0 = o.s0 ?? 3; p.s1 = o.s1 ?? 10; p.v.set(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).multiplyScalar(o.sp ?? 6).add(o.drift ?? new THREE.Vector3());
    p.s.material.blending = kind === "smoke" ? THREE.NormalBlending : THREE.AdditiveBlending; p.s.material.rotation = rnd(0, 7); };

  // vệt khói sau tàu lớn (thế giới)
  const smk = Array.from({ length: 70 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexC, color: 0x9aa6bd, transparent: true, opacity: 0, depthWrite: false })); s.visible = false; scene.add(s); return { s, life: 0, max: 1, v: new THREE.Vector3() }; });
  let smi = 0, smAcc = 0;

  // ---- đường bay theo màn hình (NDC) — 6 cửa vào, không trùng lượt trước
  const ENTRIES = ["BL", "BR", "TL", "TR", "L", "R"];
  let lastEntry = null, lastPrey = -1;
  const ndc = (nx, ny, dist, out) => out.copy(camera.position).addScaledVector(new THREE.Vector3(nx, ny, 0.5).unproject(camera).sub(camera.position).normalize(), dist);
  function pathFor(e) {
    const band = () => Math.random() < 0.5 ? rnd(0.56, 0.7) : rnd(-0.8, -0.64);
    switch (e) {
      case "BL": { const x = rnd(-0.85, -0.2); return [[x, -1.35], [x + rnd(0.7, 1.3), 1.35]]; }
      case "BR": { const x = rnd(0.2, 0.85); return [[x, -1.35], [x - rnd(0.7, 1.3), 1.35]]; }
      case "TL": { const x = rnd(-0.85, -0.2); return [[x, 1.35], [x + rnd(0.7, 1.3), -1.35]]; }
      case "TR": { const x = rnd(0.2, 0.85); return [[x, 1.35], [x - rnd(0.7, 1.3), -1.35]]; }
      case "L": { const y = band(); return [[-1.4, y], [1.4, y + rnd(-0.06, 0.06)]]; }
      default: { const y = band(); return [[1.4, y], [-1.4, y + rnd(-0.06, 0.06)]]; }
    }
  }
  const S = new THREE.Vector3(), E = new THREE.Vector3(), dir = new THREE.Vector3(), side = new THREE.Vector3(), upv = new THREE.Vector3();
  let state = "wait", wait = opts.firstWait ?? rnd(12, 20), t = 0, P = null, hits = 0, need = 6, fireT = 0, fireSide = 1, preyDead = false, deadT = 0, len = 1;
  const visibleZone = v => { const q = v.clone().project(camera); return (q.y > 0.5 || q.y < -0.6 || Math.abs(q.x) > 0.9) && Math.abs(q.x) < 0.98 && Math.abs(q.y) < 0.95; };
  const onScreen = v => { const q = v.clone().project(camera); return Math.abs(q.x) < 1 && Math.abs(q.y) < 1 && q.z < 1; };
  function orient(obj, fwd) {
    const f = fwd.clone().normalize(), u0 = new THREE.Vector3(0, 1, 0), z = new THREE.Vector3().crossVectors(f, u0).normalize(), u = new THREE.Vector3().crossVectors(z, f).normalize();
    obj.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(f, u, z));
  }
  function launch() {
    camera.updateMatrixWorld();
    const e = pick(ENTRIES.filter(x => x !== lastEntry)); lastEntry = e;
    const [[x0, y0], [x1, y1]] = pathFor(e);
    ndc(x0, y0, DIST, S); ndc(x1, y1, DIST * rnd(0.97, 1.05), E);
    dir.copy(E).sub(S); len = dir.length(); dir.normalize();
    side.crossVectors(dir, camera.up).normalize(); upv.crossVectors(side, dir).normalize();
    let k; do { k = Math.floor(Math.random() * PREY.length); } while (k === lastPrey); lastPrey = k; P = preyBuilt[k];
    P.parts.forEach(q => { q.position.copy(q.userData.home.p); q.rotation.copy(q.userData.home.r); q.visible = true; });
    P.flames.forEach(f => { f.g.visible = true; });
    H.g.visible = true; P.g.visible = true; orient(H.g, dir); orient(P.g, dir);
    const sx = new THREE.Vector3(1, 0, 0).applyQuaternion(H.g.quaternion), a = H.g.position.clone().copy(S).project(camera), b = S.clone().addScaledVector(sx, 20).project(camera);
    H.slogans.forEach(o => { o.m.visible = o.flip === (b.x < a.x); });   // chữ luôn xuôi trên màn
    state = "fly"; t = 0; hits = 0; need = 5 + Math.floor(Math.random() * 3); preyDead = false; fireT = 1.2; deadT = 0;
  }
  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3(), muzzle = new THREE.Vector3();
  function update(dt, time) {
    if (state === "wait") { wait -= dt; if (wait <= 0) launch(); }
    if (state === "fly") {
      t += dt; const u = t / CROSS_S;
      H.g.position.copy(S).addScaledVector(dir, u * len);
      // tàu con: chạy trước ~1,6 thân tàu, lạng lách né đạn
      if (!preyDead) {
        const lead = LEN * 1.6 + Math.sin(t * 0.7) * LEN * 0.2;
        P.g.position.copy(H.g.position).addScaledVector(dir, lead).addScaledVector(side, Math.sin(t * 1.3) * LEN * 0.22).addScaledVector(upv, Math.sin(t * 0.9 + 1) * LEN * 0.12);
        tmp.copy(dir).multiplyScalar(10).addScaledVector(side, Math.cos(t * 1.3) * 3.5); orient(P.g, tmp);
        P.g.rotateX(Math.cos(t * 1.3) * 0.6);                        // nghiêng cánh khi lạng
        P.flames.forEach(f => tickFlame(f, time, 1));
        // bắn: 2 bên sườn luân phiên, khi cả hai đã vào màn
        fireT -= dt;
        if (fireT <= 0 && onScreen(H.g.position) && onScreen(P.g.position)) {
          fireT = rnd(0.22, 0.4); fireSide = -fireSide;
          const cand = H.turrets.filter(q => q.side === fireSide), tr = pick(cand);
          tr.g.getWorldPosition(muzzle);
          const b = bolts.find(x => !x.m.visible) || bolts[0];
          const willHit = hits < need - 1 || visibleZone(P.g.position);
          const aim = tmp2.copy(P.g.position).addScaledVector(dir, 12);   // ngắm đón đầu
          if (!willHit || Math.random() < 0.25) aim.addScaledVector(side, rnd(4, 9) * (Math.random() < 0.5 ? -1 : 1)).addScaledVector(upv, rnd(-4, 4));   // trượt
          b.v.copy(aim).sub(muzzle).normalize().multiplyScalar(260); b.m.position.copy(muzzle); orient(b.m, b.v); b.m.visible = true; b.life = 0;
          b.hit = aim.distanceTo(P.g.position) < 14; b.target = aim.clone();
          puff(muzzle, "flash", { max: 0.12, s0: 2, s1: 4, sp: 0 });
        }
      }
      // đạn bay
      for (const b of bolts) {
        if (!b.m.visible) continue;
        b.life += dt; b.m.position.addScaledVector(b.v, dt);
        if (b.life > 2.5) { b.m.visible = false; continue; }
        if (b.hit && !preyDead && b.m.position.distanceTo(P.g.position) < PREY_LEN * 0.6) {
          b.m.visible = false; hits++;
          puff(P.g.position, "spark", { max: 0.35, s0: 3, s1: 7, sp: 10 }); puff(P.g.position, "smoke", { max: 1.6, s0: 3, s1: 8, sp: 3 });
          if (hits >= need && visibleZone(P.g.position)) explodePrey();
        }
      }
      if (preyDead) {
        deadT += dt;
        for (const q of P.parts) { q.position.addScaledVector(q.userData.v, dt / PREY_LEN); q.rotation.x += q.userData.w.x * dt; q.rotation.y += q.userData.w.y * dt; q.rotation.z += q.userData.w.z * dt; if (deadT > 2.5) q.visible = false; }
      }
      // khói đuôi + lửa + slogan chập chờn
      H.flames.forEach(f => tickFlame(f, time, 1));
      smAcc += dt * 18;
      while (smAcc > 1) { smAcc--; const n = H.nozzles[Math.floor(Math.random() * 3)], p = smk[smi++ % smk.length]; H.body.localToWorld(tmp.copy(n).add(new THREE.Vector3(-0.06, 0, 0))); p.s.position.copy(tmp); p.s.visible = true; p.life = 0; p.max = rnd(2, 3.2); p.v.copy(dir).multiplyScalar(-len / CROSS_S * 0.1).add(new THREE.Vector3(rnd(-0.5, 0.5), rnd(-0.3, 0.5), rnd(-0.5, 0.5))); }
      const g = Math.random(); H.sloganMat.color.setRGB(2, 2.3, 2.6).multiplyScalar(glitch(dt) ? (g < 0.4 ? 0.08 : g < 0.6 ? 0.45 : 1.15) : 1);
      if (u >= 1) { state = "wait"; wait = rnd(45, 60); H.g.visible = false; P.g.visible = false; bolts.forEach(b => { b.m.visible = false; }); }
    }
    for (const p of smk) { if (!p.s.visible) continue; p.life += dt; const k = p.life / p.max; if (k >= 1) { p.s.visible = false; continue; } p.s.position.addScaledVector(p.v, dt); p.s.scale.setScalar(LEN * (0.03 + 0.1 * Math.sqrt(k))); p.s.material.opacity = 0.28 * (k < 0.1 ? k / 0.1 : 1 - k); }
    for (const p of puffs) {
      if (!p.s.visible) continue; p.life += dt; const k = p.life / p.max; if (k >= 1) { p.s.visible = false; continue; }
      p.s.position.addScaledVector(p.v, dt); p.v.multiplyScalar(Math.exp(-2 * dt)); p.s.scale.setScalar(p.s0 + (p.s1 - p.s0) * Math.sqrt(k));
      const m = p.s.material;
      if (p.kind === "fire") { const c = k < 0.3 ? [3, 2.2, 1.2] : k < 0.6 ? [2.2, 0.9, 0.3] : [0.6, 0.2, 0.08]; m.color.setRGB(...c); m.opacity = 1 - k; }
      else if (p.kind === "smoke") { m.color.setRGB(0.12, 0.12, 0.13); m.opacity = 0.55 * (1 - k); }
      else if (p.kind === "spark") { m.color.setRGB(3, 2, 1); m.opacity = 1 - k; }
      else { m.color.setRGB(4, 3, 2); m.opacity = 1 - k; }
    }
  }
  let gl = 0, glNext = rnd(2, 5);
  function glitch(dt) { glNext -= dt; if (glNext <= 0 && gl <= 0) { gl = rnd(0.25, 0.6); glNext = rnd(2.5, 6); } if (gl > 0) { gl -= dt; return true; } return false; }
  function explodePrey() {
    preyDead = true; deadT = 0;
    const c = P.g.position.clone();
    puff(c, "flash", { max: 0.25, s0: 10, s1: 30, sp: 0 });
    for (let i = 0; i < 18; i++) puff(c, "fire", { max: rnd(0.6, 1.2), s0: rnd(3, 6), s1: rnd(10, 18), sp: rnd(6, 14) });
    for (let i = 0; i < 14; i++) puff(c, "smoke", { max: rnd(1.5, 2.6), s0: rnd(4, 7), s1: rnd(12, 20), sp: rnd(3, 7) });
    for (let i = 0; i < 10; i++) puff(c, "spark", { max: rnd(0.4, 0.9), s0: 1, s1: 2, sp: rnd(20, 34) });
    P.flames.forEach(f => { f.g.visible = false; });
    P.parts.forEach(q => { q.userData.v = new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).normalize().multiplyScalar(rnd(4, 12)).add(dir.clone().multiplyScalar(4)); q.userData.w = new THREE.Vector3(rnd(-6, 6), rnd(-6, 6), rnd(-6, 6)); });
  }
  return { update, launch, group: H.g, get flying() { return state === "fly"; }, warmObjects: () => [H.g, ...preyBuilt.map(p => p.g)] };
}
