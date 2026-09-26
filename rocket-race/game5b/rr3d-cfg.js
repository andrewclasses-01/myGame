// ⭐ BẢN RẼ NHÁNH cho MẪU 5b — gốc chép từ AWord (tools/chep-game-aword.py) — commit AWord: 3964391 Ho so Dot 396+397: ghi push fa41729 + kiem live 3/3 ma bam; ghi chu intr
// Đừng sửa ở đây: sửa ở AWord rồi chạy lại tool.
export function RR3D_CFG(V) {
  const THREE = V.THREE;
  const P = (x, y, z) => new THREE.Vector3(x, y, z);
  const lerp = (a, b, t) => a + (b - a) * t;
  const Z0 = 0, Z1 = -64, NOSE = 2.9, GAP_HIGH = 3, LAST_STEPS = 3, CAM_SECS = 3.2;
  const EDGE = 0.3, CON_W = 17.5, CON_H = 33;
  let camK = 0, camLastT = 0;
  return {
    quality: "high", maxFps: 60, fov: 38, steps: 5, lives: 0, uiDepth: 9, rocketScale: 1.1, bannerY: 0.35, startY: 0.5, startCm: [22, 7],
    maxTiles: 6,
    // Đợt 397 (thầy): toàn cảnh ⇒ tàu lượn né đá vụn trôi ngược dọc làn (rr3d-view.js applyDodge)
    dodge: { every: [0.8, 1.7], speed: [9, 13], maxIn: 0.8, maxOut: 1.4, rocks: false },   // mẫu 5: bỏ đá, giữ lượn né
    portalVanish: true,                       // mẫu 5: tàu thắng biến mất trong cổng + loé sáng
    // Đợt 393 (thầy): chữ mở màn "bị to và lố quá" ⇒ nhỏ lại còn ~½ (0.55/0.7 → 0.26/0.34)
    introTitles: [{ text: "ANDREW CLASSES", at: 0.5, ms: 2300, size: 0.26 }, { text: "ROCKET RACE", at: 3.0, ms: 2300, size: 0.34 }], startAt: 5.4,
    questionMaxCm: 176,                       // Đợt 393: thanh câu hỏi dãn tới đây khi câu dài
    shatter: { pieces: 44 }, flyOut: true, skySpin: 0.006, turboLabel: "small",
    winBanner: { size: 0.3, y: -1.05, ms: 7000 },
    finale: { gateAfter: 1200, hits: 3, hitGap: 320, burnMs: 550, hitsAfter: 1300, strike: "streak" },   // 5b: đánh + nổ NHANH (trước ~6,6 s → ~3 s sau khi về đích)
    fovKick: 0, steadyUI: true,
    exhaust: { fire: 0.3, smoke: 0.9, flame: 0.45, smokeBack: 3.4, smokeLife: 0.75, smokeSize: 0.55, smokeSizeEnd: 2.4, smokeAlpha: 0.16 },
    nearFade: [7, 13], bloom: 0.6, ca: 0.0012,
    hull: { color: "#a9b1bd", roughness: 0.48, clearcoat: 0.35, env: 0.55 }, engineLight: 0.3,
    sunPos: P(-260, 150, -1300), sunScale: 300, rimPos: P(60, 40, 60),
    nebula: { c1: "#1d0d4a", c2: "#0d3e73", c3: "#4f7dd6", bright: 0.9 },
    planets: [
      { type: "ice", radius: 330, pos: P(40, -372, -520), a: "#08214d", b: "#1c6aa6", c: "#3f7a45", atmo: "#62b4ff", atmoPow: 2.2, tilt: 0.2 },
      { type: "gas", radius: 22, pos: P(170, 90, -700), a: "#b98a6a", b: "#e8d2b8", c: "#7a4a3a", atmo: "#ffd0a0", rings: true, ringColor: "#dcc8a8", tilt: 0.4 },
      { type: "gas", radius: 14, pos: P(-340, 120, -1150), a: "#a2452e", b: "#d9825a", c: "#5c1f14", atmo: "#ff9a6a", tilt: 0.2 },
      { type: "ice", radius: 9, pos: P(330, 210, -1250), a: "#6f93c9", b: "#cfe2f7", c: "#ffffff", atmo: "#a8d6ff", tilt: 0.1 },
      { type: "gas", radius: 30, pos: P(-620, 260, -1500), a: "#5b4a8f", b: "#b7a3dd", c: "#2e2152", atmo: "#c4a8ff", rings: true, ringColor: "#b9a8e0", tilt: 0.55, ringTilt: 0.6 },
      { type: "ice", radius: 5, pos: P(120, 150, -820), a: "#8a8a8a", b: "#c9c9c9", c: "#eeeeee", atmo: "#dddddd", tilt: 0.1 }
    ],
    gate: { pos: P(0, 0.2, Z1 - NOSE), normal: P(0, 0, 1), radius: 5.6, lamps: false },
    travelDir: P(0, 0, -1),
    dustBox: { c: P(0, 0, 0), s: P(56, 26, 90), follow: true },
    track(i, t, time) {
      const x = i === 0 ? -2.3 : 2.3;
      return { pos: P(x + Math.sin(time * 0.6 + i * 2) * 0.25, Math.sin(time * 0.9 + i) * 0.15, lerp(Z0, Z1, t)), dir: P(Math.cos(time * 0.6 + i * 2) * 0.03, 0, -1) };
    },
    camera({ t, trail, rockets, L }) {
      const dt = Math.max(0, Math.min(0.1, t - camLastT)); camLastT = t;
      const zc = lerp(Z0, Z1, Math.min(1, trail));
      const p0 = rockets[0].p, p1 = rockets[1].p;
      const want = (Math.abs(p0 - p1) >= GAP_HIGH || Math.max(p0, p1) >= L - LAST_STEPS) ? 1 : 0;
      camK += Math.max(-dt / CAM_SECS, Math.min(dt / CAM_SECS, want - camK));
      const k = camK * camK * (3 - 2 * camK);
      const chase = { pos: P(Math.sin(t * 0.21) * 0.6, 3.3 + Math.sin(t * 0.33) * 0.2, zc + 16.5), look: P(0, 0.1, zc - 14) };
      const zA = zc + 5, zB = Z1 - 8, zMid = (zA + zB) / 2, D = (zA - zB) * 1.05 + 8;
      const high = { pos: P(D * 0.8 + Math.sin(t * 0.15) * 1.2, D * 0.5, zMid), look: P(0, -1, zMid) };
      return { pos: chase.pos.lerp(high.pos, k), look: chase.look.lerp(high.look, k), mode: camK < 0.02 ? "chase" : "high" };
    },
    introSecs: 3.6,
    introCamera(k, cp) {
      const a = lerp(0.1, Math.PI, k);
      const pos = P(Math.sin(a) * 13 * (1 - k) + cp.pos.x * k, lerp(1.5, cp.pos.y, k), Math.cos(a) * -13 * (1 - k) + cp.pos.z * k);
      return { pos, look: P(0, 0, 0).lerp(cp.look, k * k) };
    },
    layout(_s, _z, _a, U) {
      const qW = 90, qH = 7, M = 2;
      return {
        question: { x: 0.5 - U.cw(qW) / 2, y: U.ch(M), w: U.cw(qW), h: U.ch(qH) },
        consoles: [
          { x: U.cw(EDGE), y: 0.5 - U.ch(CON_H) / 2, w: U.cw(CON_W), h: U.ch(CON_H), cols: 1, rows: 4, headerFrac: 0.11, rotY: 0.3, pivot: "outer", noPanel: true },
          { x: 1 - U.cw(EDGE + CON_W), y: 0.5 - U.ch(CON_H) / 2, w: U.cw(CON_W), h: U.ch(CON_H), cols: 1, rows: 4, headerFrac: 0.11, rotY: -0.3, pivot: "outer", noPanel: true }
        ]
      };
    }
  };
}
