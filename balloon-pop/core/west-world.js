// Cảnh MIỀN VIỄN TÂY điện ảnh cho Balloon Pop 3D mẫu 1b (29/9/2026).
// Trời giờ vàng (shader: mặt trời, quầng, mây tích + mây ti trôi), nhiều lớp dãy núi xa có bậc thềm + vân đá,
// khối đá kiểu Monument Valley, nền cát gợn, bụi cây / đá / xương rồng saguaro, bụi vàng lấp lánh, kền kền lượn.
// Tất cả sinh bằng code — không tải ảnh ngoài.
import * as THREE from "three";

export const SUN_DIR = new THREE.Vector3(-0.32, 0.13, -0.94).normalize();

export function createWestWorld(scene, renderer) {
  const rnd = mulberry(11);
  const N = makeNoise(5);
  const fbm = (x, y, o = 5) => { let a = 0.5, f = 1, s = 0; for (let i = 0; i < o; i++) { s += a * N(x * f, y * f); f *= 2.03; a *= 0.5; } return s; };
  const ridged = (x, y, o = 6) => { let a = 0.5, f = 1, s = 0; for (let i = 0; i < o; i++) { const n = 1 - Math.abs(N(x * f, y * f)); s += a * n * n; f *= 2.1; a *= 0.5; } return s; };

  // ------------------------------------------------------------ bầu trời
  const skyUniforms = { sunDir: { value: SUN_DIR.clone() }, time: { value: 0 } };
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyUniforms,
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.); gl_Position = p.xyww; }`,
    fragmentShader: SKY_FRAG,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(2500, 64, 32), skyMat);
  sky.renderOrder = -10; sky.frustumCulled = false;
  scene.add(sky);

  // bản đồ môi trường (phản chiếu trời lên kim loại, sơn bóng)
  const envScene = new THREE.Scene();
  const envSky = new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), skyMat); envScene.add(envSky);
  const envGround = new THREE.Mesh(new THREE.CircleGeometry(90, 32), new THREE.MeshBasicMaterial({ color: 0x9a6a45 }));
  envGround.rotation.x = -Math.PI / 2; envGround.position.y = -2; envScene.add(envGround);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(envScene, 0.02);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.75;

  // ------------------------------------------------------------ ánh sáng giờ vàng
  scene.fog = new THREE.Fog(0xe9a98a, 320, 3400);
  const hemi = new THREE.HemisphereLight(0xa9c8f0, 0xa4643a, 0.85); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffc98f, 3.4);
  sun.position.copy(SUN_DIR).multiplyScalar(160);
  sun.target.position.set(0, 0, 0);
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 2048);
  Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 22, bottom: -22, near: 40, far: 320 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04; sun.shadow.radius = 3;
  scene.add(sun, sun.target);
  // ánh ngược nhẹ phía máy quay cho mặt trước bớt tối (điện ảnh: fill light)
  const fill = new THREE.DirectionalLight(0x9fb8e8, 0.55); fill.position.set(10, 12, 40); scene.add(fill);

  // ------------------------------------------------------------ mặt đất
  const groundGeo = new THREE.PlaneGeometry(9000, 5200, 300, 200);
  groundGeo.rotateX(-Math.PI / 2);
  const gp = groundGeo.attributes.position, gcol = new Float32Array(gp.count * 3);
  const cSand = new THREE.Color(0xd08a55), cRed = new THREE.Color(0xa85a33), cLight = new THREE.Color(0xe6b27c), cDark = new THREE.Color(0x7d4a2c), tmp = new THREE.Color();
  for (let i = 0; i < gp.count; i++) {
    const x = gp.getX(i), z = gp.getZ(i);
    const far = smooth(12, 70, Math.abs(z));
    let h = (fbm(x * 0.004, z * 0.004, 4) * 7 + fbm(x * 0.02, z * 0.02, 3) * 1.4) * far;
    if (z > 0) h *= 0.35;
    gp.setY(i, h - 0.05 * far);
    const n = fbm(x * 0.01 + 7, z * 0.01, 4), m = fbm(x * 0.05, z * 0.05 + 3, 3);
    tmp.copy(cSand).lerp(cRed, smooth(-0.15, 0.35, n)).lerp(cLight, smooth(0.1, 0.5, m) * 0.5).lerp(cDark, smooth(0.35, 0.6, -n) * 0.35);
    gcol.set([tmp.r, tmp.g, tmp.b], i * 3);
  }
  groundGeo.setAttribute("color", new THREE.BufferAttribute(gcol, 3));
  groundGeo.computeVertexNormals();
  const sandDetail = canvasNoiseTexture(512, 0.26, 91);
  sandDetail.repeat.set(300, 200);
  const sandNormal = normalFromNoise(512, 5, 2.2);
  sandNormal.repeat.set(300, 200);
  const ground = new THREE.Mesh(groundGeo, new THREE.MeshStandardMaterial({ vertexColors: true, map: sandDetail, normalMap: sandNormal, normalScale: new THREE.Vector2(0.6, 0.6), roughness: 0.97 }));
  ground.receiveShadow = true;
  scene.add(ground);

  // ------------------------------------------------------------ dãy núi xa (3 lớp, xa dần ngả tím xanh)
  const ranges = [
    { z: -1900, w: 7000, d: 700, amp: 230, f: 0.0011, seed: 1, tint: 0x7f7ea8, terr: 4 },
    { z: -1300, w: 5200, d: 500, amp: 150, f: 0.0017, seed: 2, tint: 0x9a7078, terr: 5 },
    { z: -880, w: 3800, d: 360, amp: 85, f: 0.0028, seed: 3, tint: 0xad6448, terr: 6 },
  ];
  for (const R of ranges) scene.add(makeRange(R));

  // khối đá mặt bàn / cột đá kiểu Monument Valley ở tầm trung
  const buttes = [
    [-230, -520, 34, 58], [-150, -600, 16, 78], [90, -560, 44, 46], [230, -640, 22, 84],
    [-420, -700, 60, 52], [430, -600, 40, 44], [-40, -760, 70, 50], [150, -820, 18, 92],
    [-560, -860, 80, 60], [600, -820, 60, 66],
  ];
  buttes.forEach(([x, z, r, h], i) => scene.add(makeButte(x, z, r, h, i)));

  // ------------------------------------------------------------ cây bụi, đá, xương rồng
  const scrubGeo = new THREE.IcosahedronGeometry(1, 2);
  { const p = scrubGeo.attributes.position; for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(p, i); v.multiplyScalar(1 + N(v.x * 2.5, v.y * 2.5 + v.z) * 0.35); p.setXYZ(i, v.x, v.y * 0.62, v.z); } scrubGeo.computeVertexNormals(); }
  const scrub = new THREE.InstancedMesh(scrubGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 }), 900);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s3 = new THREE.Vector3(), p3 = new THREE.Vector3();
  const scrubCols = [0x6f6b3a, 0x7a7445, 0x5c5a33, 0x8a7b4c, 0x6a5f3a];
  let k = 0;
  while (k < 900) {
    const z = -6 - Math.pow(rnd(), 1.6) * 230, x = (rnd() - 0.5) * (120 + -z * 2.6);
    if (Math.abs(z) < 5) continue;
    const sc = 0.3 + rnd() * 0.9;
    p3.set(x, groundH(x, z) + sc * 0.25, z); q.setFromEuler(new THREE.Euler(0, rnd() * 6, 0)); s3.set(sc * (1 + rnd() * 0.6), sc, sc);
    m4.compose(p3, q, s3); scrub.setMatrixAt(k, m4); scrub.setColorAt(k, new THREE.Color(scrubCols[k % 5]).offsetHSL(0, 0, (rnd() - 0.5) * 0.08)); k++;
  }
  scrub.castShadow = true; scrub.receiveShadow = true; scene.add(scrub);
  // bụi thấp tiền cảnh 2 bên mép (không che đường ray)
  const fore = new THREE.InstancedMesh(scrubGeo, scrub.material, 60);
  for (let i = 0; i < 60; i++) {
    const x = (rnd() < 0.5 ? -1 : 1) * (8 + rnd() * 30), z = 4 + rnd() * 16, sc = 0.25 + rnd() * 0.5;
    m4.compose(p3.set(x, groundH(x, z) + sc * 0.2, z), q.setFromEuler(new THREE.Euler(0, rnd() * 6, 0)), s3.set(sc * 1.4, sc, sc)); fore.setMatrixAt(i, m4);
    fore.setColorAt(i, new THREE.Color(scrubCols[i % 5]));
  }
  fore.castShadow = true; scene.add(fore);

  const rockGeo = new THREE.DodecahedronGeometry(1, 1);
  { const p = rockGeo.attributes.position; for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(p, i); v.multiplyScalar(1 + N(v.x * 1.7 + 4, v.y * 1.7 + v.z) * 0.3); p.setXYZ(i, v.x, v.y, v.z); } rockGeo.computeVertexNormals(); }
  const rocks = new THREE.InstancedMesh(rockGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, flatShading: true }), 260);
  for (let i = 0; i < 260; i++) {
    const z = -5 - Math.pow(rnd(), 1.4) * 160, x = (rnd() - 0.5) * (100 + -z * 2.4), sc = 0.15 + Math.pow(rnd(), 4) * 1.5;
    m4.compose(p3.set(x, groundH(x, z) + sc * 0.2, z), q.setFromEuler(new THREE.Euler(rnd(), rnd() * 6, rnd())), s3.set(sc * (1 + rnd()), sc * 0.7, sc));
    rocks.setMatrixAt(i, m4); rocks.setColorAt(i, new THREE.Color(0xa0643f).offsetHSL((rnd() - 0.5) * 0.02, 0, (rnd() - 0.5) * 0.12));
  }
  rocks.castShadow = true; rocks.receiveShadow = true; scene.add(rocks);

  const cactusMat = new THREE.MeshStandardMaterial({ color: 0x4d6b35, roughness: 0.75 });
  const saguaros = [[-24, -14, 5.5], [21, -18, 6.5], [-44, -30, 7], [37, -40, 8], [-9, -46, 6], [58, -26, 5], [-70, -60, 9], [12, -80, 7.5], [-36, -95, 8], [80, -90, 9], [-16, -22, 4.5], [30, -60, 6]];
  saguaros.forEach(([x, z, h], i) => scene.add(saguaro(x, groundH(x, z), z, h, cactusMat, mulberry(40 + i))));

  // ------------------------------------------------------------ bụi vàng lấp lánh trong nắng
  const dustN = 520, dpos = new Float32Array(dustN * 3), dseed = new Float32Array(dustN);
  for (let i = 0; i < dustN; i++) { dpos.set([(rnd() - 0.5) * 70, rnd() * 18, -20 + rnd() * 40], i * 3); dseed[i] = rnd() * 100; }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dpos, 3));
  dustGeo.setAttribute("seed", new THREE.BufferAttribute(dseed, 1));
  const dustMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { time: { value: 0 }, px: { value: renderer.getPixelRatio() } },
    vertexShader: `attribute float seed; uniform float time; uniform float px; varying float vA;
      void main(){ vec3 p = position; p.x += mod(time*0.6 + seed*7., 70.) - 35.; p.y += sin(time*0.4 + seed)*0.8; p.z += cos(time*0.3 + seed*1.7)*0.6;
        vec4 mv = modelViewMatrix * vec4(p,1.); gl_Position = projectionMatrix * mv;
        float tw = 0.5 + 0.5*sin(time*2.3 + seed*13.);
        vA = tw * smoothstep(60., 10., -mv.z);
        gl_PointSize = px * (2.0 + 3.0*tw) * (18. / -mv.z); }`,
    fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(1.0, 0.86, 0.6, a * vA * 0.55); }`,
  });
  const dust = new THREE.Points(dustGeo, dustMat); dust.frustumCulled = false; scene.add(dust);

  // ------------------------------------------------------------ kền kền lượn xa
  const birds = [];
  const birdMat = new THREE.MeshBasicMaterial({ color: 0x2a1f1c, side: THREE.DoubleSide, fog: true });
  for (let i = 0; i < 4; i++) {
    const g = new THREE.Group();
    const wingGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0.3), new THREE.Vector3(0, 0, -0.3), new THREE.Vector3(2.4, 0.2, 0)]);
    const l = new THREE.Mesh(wingGeo, birdMat), r = new THREE.Mesh(wingGeo, birdMat); r.scale.x = -1;
    g.add(l, r); g.userData = { l, r, a: rnd() * 6, rad: 18 + rnd() * 14, cx: -60 + rnd() * 140, cz: -150 - rnd() * 60, y: 55 + rnd() * 25, sp: 0.08 + rnd() * 0.05 };
    scene.add(g); birds.push(g);
  }

  function groundH(x, z) {
    const far = smooth(12, 70, Math.abs(z));
    let h = (fbm(x * 0.004, z * 0.004, 4) * 7 + fbm(x * 0.02, z * 0.02, 3) * 1.4) * far;
    if (z > 0) h *= 0.35;
    return h - 0.05 * far;
  }

  function makeRange({ z, w, d, amp, f, seed, tint, terr }) {
    const geo = new THREE.PlaneGeometry(w, d, 360, 70); geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position, col = new Float32Array(p.count * 3);
    const base = new THREE.Color(tint), hi = new THREE.Color(tint).offsetHSL(0.01, -0.05, 0.12), lo = new THREE.Color(tint).offsetHSL(-0.01, 0.05, -0.12), c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), lz = p.getZ(i), nz = lz / d;          // nz: -0.5 (xa) .. 0.5 (gần)
      const prof = smooth(0.5, -0.15, nz) * (0.55 + 0.45 * smooth(-0.5, 0.1, -Math.abs(x / w) * 2 + 0.3));
      let n = ridged(x * f + seed * 17, lz * f + seed * 5) * 1.25 - 0.18;
      n = Math.max(0, n);
      const t = n * terr, terraced = (Math.floor(t) + smooth(0.25, 0.75, t - Math.floor(t))) / terr;   // bậc thềm kiểu mesa
      const h = amp * (terraced * 0.8 + n * 0.2) * prof;
      p.setY(i, h);
      const band = 0.5 + 0.5 * Math.sin(h * 0.22 + N(x * 0.01, h * 0.05) * 2.5);
      c.copy(lo).lerp(base, smooth(0, amp * 0.3, h)).lerp(hi, band * 0.45);
      col.set([c.r, c.g, c.b], i * 3);
    }
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }));
    m.position.z = z; m.position.y = -2;
    return m;
  }

  function makeButte(x, z, r, h, i) {
    const geo = new THREE.CylinderGeometry(r, r, h, 72, 40, false);
    const p = geo.attributes.position, col = new Float32Array(p.count * 3);
    const cA = new THREE.Color(0xb3542e), cB = new THREE.Color(0xd07a48), cC = new THREE.Color(0x8e3f24), cTop = new THREE.Color(0xc98a5a), c = new THREE.Color();
    for (let k = 0; k < p.count; k++) {
      let vx = p.getX(k), vy = p.getY(k), vz = p.getZ(k);
      const t = (vy + h / 2) / h, a = Math.atan2(vz, vx), rr = Math.hypot(vx, vz);
      if (rr > 0.001) {
        let f = 1 + N(Math.cos(a) * 2 + i * 3, Math.sin(a) * 2 + t * 3) * 0.22 + N(a * 6, t * 9 + i) * 0.05;
        f += (Math.floor(t * 7) / 7 - t) * 0.06;                                  // gờ đá ngang
        if (t < 0.3) f *= 1 + Math.pow((0.3 - t) / 0.3, 1.6) * 1.1;             // chân đá đổ (talus)
        vx *= f; vz *= f;
      }
      const yy = t < 0.3 ? h * (0.3 * Math.pow(t / 0.3, 1.25)) : vy + h / 2;
      p.setXYZ(k, vx, yy, vz);
      const band = 0.5 + 0.5 * Math.sin(t * 38 + N(a * 2, t * 4) * 3);
      c.copy(cA).lerp(cB, band * 0.6).lerp(cC, smooth(0.35, 0.05, t) * 0.5);
      if (vy > h / 2 - 0.01 && rr < r * 0.999) c.copy(cTop);
      col.set([c.r, c.g, c.b], k * 3);
    }
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }));
    m.position.set(x, -1, z); m.rotation.y = i * 1.3;
    m.castShadow = false; m.receiveShadow = true;
    return m;
  }

  function saguaro(x, y, z, h, mat, r) {
    const g = new THREE.Group();
    const ribbed = (rad, len) => {
      const geo = new THREE.CylinderGeometry(rad, rad, len, 20, 6, false);
      const p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) { const vx = p.getX(i), vz = p.getZ(i), a = Math.atan2(vz, vx), f = 1 + Math.cos(a * 10) * 0.07; p.setX(i, vx * f); p.setZ(i, vz * f); }
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true;
      const top = new THREE.Mesh(new THREE.SphereGeometry(rad, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat); top.position.y = len / 2; m.add(top);
      return m;
    };
    const R = h * 0.075;
    const trunk = ribbed(R, h); trunk.position.y = h / 2; g.add(trunk);
    const arms = 1 + Math.floor(r() * 3);
    for (let i = 0; i < arms; i++) {
      const s = i % 2 ? 1 : -1, ay = h * (0.35 + r() * 0.3), up = h * (0.18 + r() * 0.2), out = R * 2.4;
      const elbow = new THREE.Mesh(new THREE.TorusGeometry(out / 2, R * 0.72, 12, 16, Math.PI / 2), mat);
      elbow.position.set(s * (R * 0.2), ay, 0); elbow.rotation.z = s > 0 ? -Math.PI / 2 : Math.PI; elbow.position.x += s * out / 2; elbow.position.y += out / 2 * 0;
      const arm = ribbed(R * 0.72, up); arm.position.set(s * (R * 0.2 + out), ay + out / 2 + up / 2, 0);
      const link = ribbed(R * 0.72, out / 2); link.rotation.z = Math.PI / 2; link.position.set(s * (R * 0.2 + out / 4), ay, 0);
      g.add(arm, link, elbow);
      elbow.visible = false;
      const joint = new THREE.Mesh(new THREE.SphereGeometry(R * 0.72, 14, 10), mat); joint.position.set(s * (R * 0.2 + out), ay, 0); g.add(joint);
      g.rotation.y = r() * 6;
    }
    g.position.set(x, y, z);
    return g;
  }

  return {
    sun, sky,
    update(dt, t) {
      skyUniforms.time.value = t;
      dustMat.uniforms.time.value = t;
      for (const b of birds) {
        const u = b.userData; u.a += dt * u.sp;
        b.position.set(u.cx + Math.cos(u.a) * u.rad, u.y + Math.sin(u.a * 2) * 2, u.cz + Math.sin(u.a) * u.rad);
        b.rotation.y = -u.a; b.rotation.z = 0.3;
        const fl = Math.sin(t * 3 + u.cx) * 0.25; u.l.rotation.z = fl; u.r.rotation.z = -fl;
      }
    },
  };
}

// --------------------------------------------------------------------- shader bầu trời
const SKY_FRAG = `
uniform vec3 sunDir; uniform float time; varying vec3 vDir;
float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.-2.*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y); }
float fbm(vec2 p){ float s = 0., a = .5; for(int i=0;i<6;i++){ s += a*noise(p); p = p*2.03 + vec2(1.7, 9.2); a *= .5; } return s; }
void main(){
  vec3 d = normalize(vDir);
  float h = d.y;
  float sd = max(dot(d, sunDir), 0.);
  // trời: chân trời cam hồng -> xanh ngọc nhạt -> xanh thẳm
  vec3 hor = vec3(1.00, 0.60, 0.36), rose = vec3(0.93, 0.62, 0.58), mid = vec3(0.34, 0.56, 0.86), zen = vec3(0.07, 0.19, 0.46);
  vec3 col = mix(hor, rose, smoothstep(0.0, 0.05, h));
  col = mix(col, mid, smoothstep(0.03, 0.17, h));
  col = mix(col, zen, smoothstep(0.15, 0.7, h));
  col = mix(col, vec3(0.80, 0.52, 0.36), smoothstep(0.0, -0.08, h));
  // nắng: quầng gọn quanh mặt trời, dải vàng sát chân trời
  float hz = 1. - smoothstep(0.0, 0.25, abs(h));
  col += vec3(1.0, 0.55, 0.22) * pow(sd, 10.) * 0.35 * hz;
  col += vec3(1.0, 0.70, 0.38) * pow(sd, 60.) * 0.7;
  col += vec3(1.0, 0.85, 0.60) * pow(sd, 700.) * 1.2;
  col += vec3(1.0, 0.95, 0.85) * smoothstep(0.99955, 0.9998, sd) * 9.;
  if (h > -0.01) {
    float hh = max(h, 0.0);
    vec2 uv = d.xz / (hh + 0.10);
    vec2 w = vec2(time * 0.008, time * 0.003);
    // mây tích: khối dày, bụng tím xám, viền vàng rực phía mặt trời
    float cu = fbm(uv * 0.42 + w);
    float cov = smoothstep(0.50, 0.66, cu) * smoothstep(0.01, 0.08, hh) * (1. - smoothstep(0.45, 0.9, hh));
    float dens = smoothstep(0.52, 0.85, cu);
    float top = fbm(uv * 0.42 + w + vec2(0.0, -0.06));          // nhìn về phía trên của khối mây để giả ánh sáng
    float lightSide = clamp((cu - top) * 6. + 0.5, 0., 1.);
    vec3 belly = vec3(0.46, 0.38, 0.50), lit = vec3(1.0, 0.86, 0.70);
    vec3 shade = mix(belly, lit, 0.35 + 0.65 * lightSide * (1. - dens * 0.5));
    shade = mix(shade, vec3(1.0, 0.72, 0.42), pow(sd, 6.) * 0.75);
    float rim = smoothstep(0.50, 0.56, cu) * (1. - smoothstep(0.56, 0.66, cu));
    shade += vec3(1.0, 0.68, 0.32) * rim * (0.35 + 1.6 * pow(sd, 5.));
    col = mix(col, shade, cov * 0.95);
    // mây ti mảnh trên cao, bắt nắng hồng
    float ci = fbm(vec2(uv.x * 0.18, uv.y * 1.3) + w * 1.6 + 11.);
    float cir = smoothstep(0.60, 0.80, ci) * smoothstep(0.06, 0.3, hh) * (1. - cov);
    col = mix(col, vec3(1.0, 0.80, 0.70) + vec3(0.25, 0.1, 0.) * pow(sd, 4.), cir * 0.4);
  }
  gl_FragColor = vec4(col, 1.);
}`;

// --------------------------------------------------------------------- tiện ích
function smooth(a, b, x) { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
export function mulberry(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function makeNoise(seed) {
  const r = mulberry(seed), perm = new Uint8Array(512), p = [...Array(256).keys()];
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const g = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]];
  const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
  const dot = (h, x, y) => { const v = g[h & 7]; return v[0] * x + v[1] * y; };
  return (x, y) => {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, xf = x - Math.floor(x), yf = y - Math.floor(y), u = fade(xf), v = fade(yf);
    const aa = perm[perm[X] + Y], ab = perm[perm[X] + Y + 1], ba = perm[perm[X + 1] + Y], bb = perm[perm[X + 1] + Y + 1];
    const x1 = dot(aa, xf, yf) + u * (dot(ba, xf - 1, yf) - dot(aa, xf, yf));
    const x2 = dot(ab, xf, yf - 1) + u * (dot(bb, xf - 1, yf - 1) - dot(ab, xf, yf - 1));
    return x1 + v * (x2 - x1);
  };
}
function canvasNoiseTexture(size, amt, seed) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  const ctx = c.getContext("2d"), img = ctx.createImageData(size, size), r = mulberry(seed);
  const Nn = makeNoise(seed);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const n = Nn(x / 24, y / 24) * 0.5 + Nn(x / 6, y / 6) * 0.3 + (r() - 0.5) * 0.6;
    const v = Math.round(255 * (1 - amt * 0.5 + n * amt));
    const i = (y * size + x) * 4; img.data[i] = img.data[i + 1] = img.data[i + 2] = Math.max(0, Math.min(255, v)); img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
export function normalFromNoise(size, seed, strength, scale = 10) {
  const Nn = makeNoise(seed), r = mulberry(seed + 1), H = new Float32Array(size * size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) H[y * size + x] = Nn(x / scale, y / scale) * 0.6 + Nn(x / 3, y / 3) * 0.3 + (r() - 0.5) * 0.35;
  const c = document.createElement("canvas"); c.width = c.height = size;
  const ctx = c.getContext("2d"), img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const hL = H[y * size + ((x - 1 + size) % size)], hR = H[y * size + ((x + 1) % size)], hD = H[((y - 1 + size) % size) * size + x], hU = H[((y + 1) % size) * size + x];
    const v = new THREE.Vector3((hL - hR) * strength, (hD - hU) * strength, 1).normalize();
    const i = (y * size + x) * 4; img.data[i] = (v.x * 0.5 + 0.5) * 255; img.data[i + 1] = (v.y * 0.5 + 0.5) * 255; img.data[i + 2] = (v.z * 0.5 + 0.5) * 255; img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
