// INTRO ĐIỆN ẢNH — Balloon Pop 3D mẫu 1p (29/9/2026)
// Thầy: "một đoạn intro thật đẹp, ngầu, điện ảnh giống cách làm intro của Rocket race … vài bản để tôi chọn".
// Cách làm như Rocket Race: bấm START ⇒ một cảnh quay dựng sẵn (máy quay bay theo kịch bản, dải đen điện ảnh,
// chữ ANDREW CLASSES presents → BALLOON POP đập xuống + tiếng bùm), cuối cảnh máy quay TRÔI VỀ ĐÚNG góc nhìn của ván chơi
// trong lúc đoàn tàu đang lao tới đúng tốc độ vào ga ⇒ nối liền, không giật. Chạm màn hình = bỏ qua.
// 4 bản (?intro=1..4): 1 Cần cẩu toàn cảnh · 2 Bám theo đoàn tàu · 3 Đại bàng bay · 4 Phim cao bồi.
import * as THREE from "three";

export const INTROS = [
  null,
  { name: "Cần cẩu toàn cảnh", dur: 13, settle: 2.4, presents: 0.9, slam: 8.1 },
  { name: "Bám theo đoàn tàu", dur: 12, settle: 2.2, presents: 0.6, slam: 8.6 },
  { name: "Đại bàng bay", dur: 12, settle: 2.4, presents: 1.0, slam: 7.3 },
  { name: "Phim cao bồi", dur: 13, settle: 2.4, presents: 0.8, slam: 8.5, sepia: true },
];
export const INTRO_ID = (() => { try { const v = parseInt(new URLSearchParams(location.search).get("intro"), 10); return v >= 0 && v < INTROS.length ? v : 1; } catch { return 1; } })();

const E = x => { x = Math.min(1, Math.max(0, x)); return x * x * x * (x * (x * 6 - 15) + 10); };   // smootherstep
const lerp = (a, b, t) => a + (b - a) * t;
const L3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const pose = (p, l, fov = 38, roll = 0) => ({ p, l, fov, roll });
const mixPose = (A, B, t) => pose(L3(A.p, B.p, t), L3(A.l, B.l, t), lerp(A.fov, B.fov, t), lerp(A.roll, B.roll, t));
// chuỗi cảnh: mỗi cảnh bắt đầu ở `at`; `mix` giây đầu hoà từ cảnh trước (0 = cắt cảnh)
function seq(t, segs) {
  let k = 0; while (k + 1 < segs.length && t >= segs[k + 1].at) k++;
  const s = segs[k], P = s.f(t);
  if (k > 0 && s.mix > 0 && t < s.at + s.mix) return mixPose(segs[k - 1].f(t), P, E((t - s.at) / s.mix));
  return P;
}

export function createCine({ stage, camera, gradeU, sfx, baseFov }) {
  // ---------------------------------------------------------------- lớp chữ + dải đen điện ảnh
  const ov = document.createElement("div"); ov.className = "bp-cine"; ov.hidden = true;
  ov.innerHTML = `<i class="bp-cine-bar top"></i><i class="bp-cine-bar bot"></i>
    <div class="bp-cine-pre"><span class="a">ANDREW CLASSES</span><span class="b">presents</span></div>
    <div class="bp-cine-title"><span>BALLOON POP</span></div>
    <div class="bp-cine-skip">Tap to skip ▸▸</div>`;
  stage.append(ov);
  const pre = ov.querySelector(".bp-cine-pre"), ttl = ov.querySelector(".bp-cine-title");
  ["pointerdown", "click"].forEach(ev => ov.addEventListener(ev, e => { e.stopPropagation(); if (ev === "click") api.skip(); }));   // chạm = bỏ qua

  // ---------------------------------------------------------------- tiếng điện ảnh (Web Audio tự tổng hợp)
  let ac = null, out = null, nb = null, wind = null;
  function audio() {
    if (ac) { if (ac.state === "suspended") ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ac = new AC(); out = ac.createGain(); out.gain.value = 0.9; out.connect(ac.destination);
    nb = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate); const d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const on = () => ac && !sfx.muted;
  function noiseSrc(type, f, q) { const s = ac.createBufferSource(), fl = ac.createBiquadFilter(); s.buffer = nb; s.loop = true; fl.type = type; fl.frequency.value = f; fl.Q.value = q; s.connect(fl); return { s, fl }; }
  function boom() {   // chữ đập xuống: nổ trầm + dội
    if (!on()) return; const t = ac.currentTime;
    const o = ac.createOscillator(), g = ac.createGain(); o.type = "sine"; o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(28, t + 1.4);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.85, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2); o.connect(g).connect(out); o.start(t); o.stop(t + 2.3);
    const n = noiseSrc("lowpass", 900, 0.7), ng = ac.createGain(); n.fl.frequency.setValueAtTime(2400, t); n.fl.frequency.exponentialRampToValueAtTime(120, t + 1.2);
    ng.gain.setValueAtTime(0.0001, t); ng.gain.exponentialRampToValueAtTime(0.6, t + 0.01); ng.gain.exponentialRampToValueAtTime(0.0001, t + 1.6); n.fl.connect(ng).connect(out); n.s.start(t); n.s.stop(t + 1.7);
  }
  function riser(dur) {   // dồn lên trước cú đập
    if (!on()) return; const t = ac.currentTime, n = noiseSrc("bandpass", 300, 3), g = ac.createGain();
    n.fl.frequency.setValueAtTime(250, t); n.fl.frequency.exponentialRampToValueAtTime(4200, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.22, t + dur); g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.05);
    n.fl.connect(g).connect(out); n.s.start(t); n.s.stop(t + dur + 0.1);
  }
  function whoosh(dur = 0.9, peak = 0.35) {
    if (!on()) return; const t = ac.currentTime, n = noiseSrc("bandpass", 600, 1.4), g = ac.createGain();
    n.fl.frequency.setValueAtTime(300, t); n.fl.frequency.exponentialRampToValueAtTime(2200, t + dur * 0.45); n.fl.frequency.exponentialRampToValueAtTime(260, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + dur * 0.45); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.fl.connect(g).connect(out); n.s.start(t); n.s.stop(t + dur + 0.05);
  }
  function cry() {   // tiếng chim ưng kêu xa
    if (!on()) return; const t = ac.currentTime + 0.05;
    for (const [d, f0] of [[0, 2300], [0.55, 2100]]) {
      const o = ac.createOscillator(), g = ac.createGain(), v = ac.createOscillator(), vg = ac.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(f0, t + d); o.frequency.exponentialRampToValueAtTime(f0 * 0.62, t + d + 0.5);
      v.frequency.value = 38; vg.gain.value = 60; v.connect(vg).connect(o.frequency);
      g.gain.setValueAtTime(0.0001, t + d); g.gain.exponentialRampToValueAtTime(0.07, t + d + 0.04); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.55);
      o.connect(g).connect(out); o.start(t + d); v.start(t + d); o.stop(t + d + 0.6); v.stop(t + d + 0.6);
    }
  }
  function windOn() {   // gió sa mạc suốt cảnh
    if (!on() || wind) return; const n = noiseSrc("lowpass", 520, 0.6), g = ac.createGain(), t = ac.currentTime;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 1.5); n.fl.connect(g).connect(out); n.s.start(t);
    wind = { n, g };
  }
  function windOff(fade = 1.2) { if (!wind) return; const t = ac.currentTime; wind.g.gain.cancelScheduledValues(t); wind.g.gain.setValueAtTime(wind.g.gain.value, t); wind.g.gain.exponentialRampToValueAtTime(0.0001, t + fade); wind.n.s.stop(t + fade + 0.1); wind = null; }

  // ---------------------------------------------------------------- kịch bản từng bản
  let I = null, id = 0, T = 0, ctx = null, cues = [], fired = new Set(), shake = 0, active = false;
  const G = () => { const w = ctx.sway ? ctx.sway() : [0, 0, 0];   // cùng độ trôi nhẹ của máy quay ván chơi ⇒ khung nối không nhích
    return pose([ctx.C + ctx.V.cam[0] + w[0], ctx.V.cam[1] + w[1], ctx.V.cam[2]], [ctx.C + ctx.V.look[0] + w[2], ctx.V.look[1], ctx.V.look[2]], baseFov); };
  const H = t => ctx.head(t);

  function shots(k) {
    if (k === 1) {   // CẦN CẨU TOÀN CẢNH: lướt qua đồi chữ → sà xuống đường ray, tàu ào qua → bay song song đầu máy → vút lên
      const sx = ctx.sign ? ctx.sign.x : H(0) + 60, Xp = H(7.0) + 2.5;
      return [
        { at: 0, f: t => pose([sx - 26 + t * 5, 23 - t * 0.8, -128 - t * 3.5], [sx + 4 + t * 1.5, 19.5, -203], 34) },
        { at: 4.0, mix: 2.3, f: t => pose([Xp + 1.5, lerp(3.2, 1.25, E((t - 4) / 2.6)), 7.2], [Math.min(H(t) + 1, Xp + 2.5), 1.9, 0], 40) },
        { at: 7.25, mix: 0.9, f: t => pose([H(t) - 1.2, 2.1, 7.8], [H(t) + 3.2, 2.5, 0], 38) },
        { at: 9.4, mix: 1.4, f: t => pose([H(t) - 10, 10.5, 24], [H(t) + 3, 3.5, 0], 38) },
      ];
    }
    if (k === 2) {   // BÁM THEO ĐOÀN TÀU: cận bánh + thanh truyền → lên ống khói → lùi dọc các toa → cần cẩu lên cao
      return [
        { at: 0, f: t => pose([H(t) + 0.4 - t * 0.35, 0.8, 3.3], [H(t) - 1.1, 0.9, 0.4], 34) },
        { at: 2.8, mix: 1.3, f: t => pose([H(t) + 1.6, 3.7, 4.4], [H(t) + 0.7, 3.9, 0], 40) },
        { at: 5.1, mix: 1.1, f: t => { const u = E((t - 5.1) / 3.1), x = H(t) - 2 - u * Math.max(6, ctx.len - 5); return pose([x, 2.6, 6.4], [x - 1.2, 2.3, 0], 42); } },
        { at: 8.2, mix: 1.4, f: t => pose([H(t) - 12, 10.5, 30], [H(t) - 3, 5.2, 0], 40) },
      ];
    }
    if (k === 3) {   // ĐẠI BÀNG BAY: lượn thấp qua gò đồi, xương rồng, cắt ngang trước mũi tàu rồi quay về góc chơi
      const X = H(6.4), pts = [[-105, 32, -165], [-76, 19, -98], [-42, 8.5, -46], [-6, 4.6, -9], [38, 3.6, 12], [64, 6.5, 24]].map(q => new THREE.Vector3(X + q[0], q[1], q[2]));
      const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal"), tan = new THREE.Vector3(), tan2 = new THREE.Vector3();
      return [{ at: 0, f: t => {
        const u = Math.min(1, t / 9.6), p = curve.getPoint(u); curve.getTangent(u, tan); curve.getTangent(Math.min(1, u + 0.04), tan2);
        const turn = Math.atan2(tan.x * tan2.z - tan.z * tan2.x, tan.x * tan2.x + tan.z * tan2.z);   // đổi hướng ⇒ nghiêng cánh
        let l = [p.x + tan.x * 12, p.y + tan.y * 12 - 1.2, p.z + tan.z * 12];
        const w = E((t - 5.4) / 2.2); l = L3(l, [H(t) + 1, 2.4, 0], w);
        return pose([p.x, p.y, p.z], l, 44, Math.max(-0.3, Math.min(0.3, -turn * 4)) * (1 - w));
      } }];
    }
    // k === 4 — PHIM CAO BỒI: bóng xương rồng ngược nắng → tàu lao thẳng vào ống kính → tàu vụt qua sát máy → toàn cảnh, màu về
    const cac = ctx.saguaro, Xc = H(6.0) + 2, Xs = H(6.95);
    const A = cac ? (t => { const d = lerp(34, 26, E(t / 2.9)) * Math.max(0.6, cac.h / 12), hx = 0.32, hz = 0.94; return pose([cac.x + hx * d + 2.5, 1.1 + t * 0.1, cac.z + hz * d], [cac.x - 1.5, cac.h * 0.5, cac.z], 30); })
      : (t => pose([H(0) + 60, 1.2, 9], [H(0) + 70, 4, -40], 30));
    return [
      { at: 0, f: A },
      { at: 2.9, f: t => pose([Xc, 1.05 + (t - 2.9) * 0.12, 0], [H(t) - 2, 1.7, 0], 24) },
      { at: 5.6, f: t => pose([Xs, 0.95, 5.3], [H(t) + 1.2, 1.9, 0], 40) },
      { at: 8.2, f: t => pose([H(t) - 8, 11 + (t - 8.2) * 0.6, 40], [H(t) - 2, 2.2, 0], 38) },
    ];
  }

  let SEG = null;
  function poseAt(t) {
    const S0 = I.dur - I.settle;
    const P = seq(Math.min(t, I.dur), SEG);
    if (t <= S0) return P;
    // máy quay trôi về ĐÚNG góc nhìn ván chơi (đi vòng lên một chút cho mềm)
    const u = E((t - S0) / I.settle), g = G();
    const R = mixPose(P, g, u); R.p[1] += Math.sin(Math.PI * u) * 1.2;
    return R;
  }
  const up = new THREE.Vector3(), fw = new THREE.Vector3();
  function apply(P, dt) {
    shake *= Math.exp(-dt * 6);
    const j = shake, jx = (Math.random() - 0.5) * j, jy = (Math.random() - 0.5) * j;
    camera.position.set(P.p[0] + jx, P.p[1] + jy, P.p[2]);
    camera.up.set(0, 1, 0); camera.lookAt(P.l[0] + jx * 0.5, P.l[1] + jy * 0.5, P.l[2]);
    if (P.roll) { fw.set(0, 0, -1).applyQuaternion(camera.quaternion); camera.rotateOnWorldAxis(fw, P.roll); }
    if (Math.abs(camera.fov - P.fov) > 1e-3) { camera.fov = P.fov; camera.updateProjectionMatrix(); }
  }

  function cue(at, fn) { cues.push({ at, fn }); }
  function begin(k, c) {
    id = k; I = INTROS[k]; ctx = c; T = 0; fired = new Set(); cues = []; shake = 0; active = true;
    SEG = shots(k);
    audio(); windOn();
    ov.hidden = false; ov.className = "bp-cine is-on" + (I.sepia ? " is-film" : "");
    pre.classList.remove("is-in"); ttl.classList.remove("is-in", "is-out");
    cue(I.presents, () => { pre.classList.add("is-in"); });
    cue(I.slam - 1.6, () => riser(1.6));
    cue(I.slam, () => { ttl.classList.add("is-in"); boom(); shake = 0.35; });
    cue(I.dur - I.settle - 0.2, () => { ttl.classList.add("is-out"); ov.classList.add("is-open"); whoosh(1.4, 0.25); });
    if (k === 1) { cue(4.1, () => whoosh(1.8, 0.3)); cue(5.2, () => sfx.whistle()); cue(6.7, () => whoosh(0.9, 0.5)); }
    if (k === 2) { cue(3.0, () => sfx.whistle()); cue(8.2, () => whoosh(1.4, 0.3)); }
    if (k === 3) { cue(0.4, cry); cue(3.0, () => whoosh(1.6, 0.25)); cue(5.9, () => { sfx.whistle(); whoosh(1.0, 0.45); }); cue(7.0, cry); }
    if (k === 4) { cue(0.3, cry); cue(3.2, () => sfx.whistle()); cue(4.9, () => sfx.whistle()); cue(6.6, () => whoosh(0.8, 0.6)); cue(2.9, () => whoosh(0.35, 0.15)); cue(5.6, () => whoosh(0.35, 0.15)); cue(8.2, () => whoosh(0.35, 0.15)); }
    gradeU.sepia.value = I.sepia ? 1 : 0;
    apply(poseAt(0), 0);
  }
  function finish() {
    active = false; windOff(); ov.hidden = true; gradeU.sepia.value = 0;
    camera.up.set(0, 1, 0); camera.fov = baseFov; camera.updateProjectionMatrix();
  }
  const api = {
    get active() { return active; },
    get t() { return T; },
    get dur() { return I ? I.dur : 0; },
    durationOf: k => INTROS[k].dur,
    begin,
    // trả về true khi xong (máy quay đã về đúng góc chơi)
    update(dt) {
      if (!active) return true;
      T += dt;
      for (const c of cues) if (T >= c.at && !fired.has(c)) { fired.add(c); c.fn(); }
      if (I.sepia) gradeU.sepia.value = 1 - E((T - 8.2) / 2.0);
      apply(poseAt(T), dt);
      if (T >= I.dur) { finish(); return true; }
      return false;
    },
    // bỏ qua: nhảy tới đoạn trôi về góc chơi
    skip() { if (!active) return; const S0 = I.dur - I.settle; if (T < S0 - 0.3) { T = S0 - 0.3; for (const c of cues) if (c.at < T) fired.add(c); pre.classList.remove("is-in"); ttl.classList.add("is-in"); ov.classList.add("is-open"); } },
    finish,
  };
  return api;
}
