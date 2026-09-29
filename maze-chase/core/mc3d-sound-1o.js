// 1o (29/9): + bộ tiếng INTRO điện ảnh (`intro.*`) đi qua một kênh riêng ⇒ bỏ qua intro là tắt sạch.
// Âm thanh Maze Chase 3D — tổng hợp bằng Web Audio, không dùng file (kho myGame công khai, không phát tán
// mp3 của Wordwall). Mọi hàm an toàn khi chưa có AudioContext (chưa bấm START).
export function createMcSound() {
  let ac = null, master = null, noiseBuf = null, muted = false, hum = null;

  function ensure() {
    if (ac) { if (ac.state === "suspended") ac.resume(); return true; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ac = new AC();
    master = ac.createGain();
    master.gain.value = muted ? 0 : 0.9;
    master.connect(ac.destination);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }
  const ok = () => ac && !muted;
  const T = () => ac.currentTime;

  function env(g, t, a, peak, dec) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
  }
  function tone(type, f0, f1, dur, peak, delay = 0) {
    const t = T() + delay, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    env(g, t, 0.006, peak, dur);
    o.connect(g).connect(master); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, peak, ftype, f0, q = 1, delay = 0, f1 = f0) {
    const t = T() + delay, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noiseBuf; f.type = ftype; f.Q.value = q;
    f.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    env(g, t, 0.004, peak, dur);
    s.connect(f).connect(g).connect(master); s.start(t, Math.random() * 1); s.stop(t + dur + 0.05);
  }

  // ---------------- 1o: TIẾNG INTRO (kênh riêng `ibus`, tắt được một lượt)
  let ibus = null, shaper = null;
  const bus = () => { if (!ibus) { ibus = ac.createGain(); ibus.gain.value = 1; ibus.connect(master); } return ibus; };
  function drive() {                                           // méo nhẹ cho tiếng "braam" dày
    if (shaper) return shaper;
    shaper = ac.createWaveShaper(); const n = 1024, c = new Float32Array(n);
    for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; c[i] = Math.tanh(x * 2.4); }
    shaper.curve = c; return shaper;
  }
  function swell(g, t, att, peak, dur) {                       // lên dần (tuyến tính) rồi tắt dần (mũ)
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(att + 0.02, dur));
  }
  function nz(o) {                                             // tiếng ồn lọc: {dur, peak, type, f0, f1, q, delay, att, p0, p1}
    const t = T() + (o.delay || 0), src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = noiseBuf; src.loop = true; f.type = o.type || "lowpass"; f.Q.value = o.q ?? 0.8;
    f.frequency.setValueAtTime(o.f0, t); if (o.f1 && o.f1 !== o.f0) f.frequency.exponentialRampToValueAtTime(o.f1, t + o.dur);
    swell(g, t, o.att ?? 0.01, o.peak, o.dur);
    let out = g;
    if (ac.createStereoPanner && o.p0 !== undefined) { const p = ac.createStereoPanner(); p.pan.setValueAtTime(o.p0, t); p.pan.linearRampToValueAtTime(o.p1 ?? o.p0, t + o.dur); g.connect(p); out = p; }
    src.connect(f).connect(g); out.connect(bus()); src.start(t, Math.random()); src.stop(t + o.dur + 0.1);
  }
  function os(o) {                                             // dao động: {type, f0, f1, dur, peak, delay, att, det, lp, glide}
    const t = T() + (o.delay || 0), v = ac.createOscillator(), g = ac.createGain();
    v.type = o.type || "sine"; v.frequency.setValueAtTime(o.f0, t); if (o.f1 && o.f1 !== o.f0) v.frequency.exponentialRampToValueAtTime(o.f1, t + (o.glide ?? o.dur));
    if (o.det) v.detune.value = o.det;
    swell(g, t, o.att ?? 0.01, o.peak, o.dur);
    let node = v;
    if (o.lp) { const f = ac.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = o.lp; v.connect(f); node = f; }
    node.connect(g).connect(bus()); v.start(t); v.stop(t + o.dur + 0.1);
  }
  const intro = {
    stop() { if (!ibus) return; try { ibus.gain.setTargetAtTime(0.0001, T(), 0.08); } catch (e) { /* bỏ qua */ } ibus = null; },
    // "BRAAM" điện ảnh: hợp âm răng cưa trầm, méo nhẹ, bộ lọc mở bừng rồi khép dần
    braam(delay = 0, root = 43.65, peak = 0.3) {
      if (!ok()) return;
      const t = T() + delay, lp = ac.createBiquadFilter(), g = ac.createGain(), d = drive(), mix = ac.createGain();
      lp.type = "lowpass"; lp.Q.value = 3; lp.frequency.setValueAtTime(160, t); lp.frequency.exponentialRampToValueAtTime(1500, t + 0.3); lp.frequency.exponentialRampToValueAtTime(240, t + 3.2);
      swell(g, t, 0.06, peak, 3.6);
      mix.gain.value = 0.22; mix.connect(d); d.connect(lp); lp.connect(g).connect(bus());
      [1, 1.5, 2, 3].forEach(k => [-9, 9].forEach(det => { const v = ac.createOscillator(); v.type = "sawtooth"; v.frequency.value = root * k; v.detune.value = det; v.connect(mix); v.start(t); v.stop(t + 3.8); }));
      os({ type: "sine", f0: root, f1: root * 0.97, dur: 3.4, peak: peak * 1.1, delay, att: 0.04 });
    },
    rumble(dur = 3, peak = 0.35, delay = 0) { if (!ok()) return; nz({ dur, peak, type: "lowpass", f0: 70, f1: 110, q: 0.7, delay, att: dur * 0.55 }); os({ type: "sine", f0: 34, f1: 30, dur, peak: peak * 0.8, delay, att: dur * 0.5 }); },
    whoosh(dur = 1.4, peak = 0.3, delay = 0, f0 = 250, f1 = 2600, p0 = -0.8, p1 = 0.8) { if (!ok()) return; nz({ dur, peak, type: "bandpass", f0, f1, q: 1.1, delay, att: dur * 0.62, p0, p1 }); },
    engine(dur = 4, peak = 0.16, delay = 0, f0 = 62, f1 = 44) {    // tàu lớn gầm qua (tụt giọng như hiệu ứng Doppler)
      if (!ok()) return;
      [0, 7].forEach(det => os({ type: "sawtooth", f0, f1, dur, peak: peak * 0.6, delay, att: dur * 0.45, det, lp: 380 }));
      nz({ dur, peak, type: "lowpass", f0: 260, f1: 140, q: 0.9, delay, att: dur * 0.45 });
    },
    impact(delay = 0, big = 1) {
      if (!ok()) return;
      os({ type: "sine", f0: 78, f1: 26, dur: 1.2 * big, peak: 0.55 * big, delay, att: 0.004, glide: 0.9 });
      nz({ dur: 1.1 * big, peak: 0.5 * big, type: "lowpass", f0: 2600, f1: 110, q: 0.6, delay, att: 0.004 });
      nz({ dur: 0.18, peak: 0.25, type: "highpass", f0: 3500, q: 0.7, delay, att: 0.002 });
    },
    riser(dur = 2, peak = 0.16, delay = 0) { if (!ok()) return; nz({ dur, peak, type: "highpass", f0: 300, f1: 7000, q: 0.9, delay, att: dur * 0.96 }); os({ type: "sine", f0: 180, f1: 1500, dur, peak: peak * 0.6, delay, att: dur * 0.96 }); },
    shimmer(delay = 0, peak = 0.07) { if (!ok()) return; [2093, 2637, 3136, 4186].forEach((f, i) => os({ type: "sine", f0: f, dur: 2.4 - i * 0.3, peak, delay: delay + i * 0.05, att: 0.01 })); },
    siren(dur = 4, peak = 0.07, delay = 0) {                   // còi báo động lên xuống
      if (!ok()) return;
      const t = T() + delay, v = ac.createOscillator(), lfo = ac.createOscillator(), lg = ac.createGain(), f = ac.createBiquadFilter(), g = ac.createGain();
      v.type = "sawtooth"; v.frequency.value = 700; lfo.frequency.value = 0.85; lg.gain.value = 190; lfo.connect(lg).connect(v.frequency);
      f.type = "lowpass"; f.frequency.value = 1800; swell(g, t, 0.15, peak, dur);
      v.connect(f).connect(g).connect(bus()); v.start(t); lfo.start(t); v.stop(t + dur + 0.1); lfo.stop(t + dur + 0.1);
    },
    beep(f = 1400, delay = 0, peak = 0.06) { if (!ok()) return; os({ type: "square", f0: f, dur: 0.07, peak, delay, att: 0.002 }); },
    thud(delay = 0, peak = 0.3) { if (!ok()) return; os({ type: "sine", f0: 95, f1: 42, dur: 0.32, peak, delay, att: 0.003 }); nz({ dur: 0.25, peak: peak * 0.6, type: "lowpass", f0: 700, f1: 160, delay, att: 0.003 }); },
    hiss(dur = 1.2, peak = 0.12, delay = 0) { if (!ok()) return; nz({ dur, peak, type: "highpass", f0: 2600, f1: 5200, q: 0.5, delay, att: 0.05 }); },
    servo(delay = 0) { if (!ok()) return; os({ type: "sawtooth", f0: 240, f1: 520, dur: 0.32, peak: 0.05, delay, att: 0.02, lp: 1400 }); },
    clank(delay = 0) { if (!ok()) return; [420, 1130, 2370].forEach((f, i) => os({ type: "triangle", f0: f, dur: 0.5 - i * 0.12, peak: 0.12, delay, att: 0.002 })); nz({ dur: 0.12, peak: 0.2, type: "bandpass", f0: 3000, q: 2, delay, att: 0.002 }); },
    powerUp(delay = 0) { if (!ok()) return; os({ type: "sine", f0: 70, f1: 520, dur: 1.1, peak: 0.18, delay, att: 0.9, glide: 1.0 }); os({ type: "square", f0: 140, f1: 1040, dur: 1.0, peak: 0.03, delay, att: 0.9, lp: 2400 }); },
    heart(delay = 0) { if (!ok()) return; os({ type: "sine", f0: 58, f1: 40, dur: 0.22, peak: 0.35, delay, att: 0.004 }); os({ type: "sine", f0: 54, f1: 38, dur: 0.22, peak: 0.25, delay: delay + 0.22, att: 0.004 }); },
    laser(delay = 0) { if (!ok()) return; os({ type: "square", f0: 1800, f1: 260, dur: 0.18, peak: 0.05, delay, att: 0.002, lp: 3200 }); },
  };

  return {
    intro,
    unlock: ensure,
    get muted() { return muted; },
    setMuted(m) { muted = m; if (master) master.gain.value = m ? 0 : 0.9; },
    click()    { if (!ok()) return; tone("sine", 900, 600, 0.06, 0.12); },
    reveal()   { if (!ok()) return; noise(0.9, 0.18, "bandpass", 300, 0.8, 0, 2400); tone("sine", 220, 440, 0.8, 0.08); },
    build()    { if (!ok()) return; noise(0.7, 0.22, "lowpass", 180, 1, 0, 900); tone("triangle", 90, 180, 0.6, 0.12); },
    sink()     { if (!ok()) return; noise(0.6, 0.18, "lowpass", 900, 1, 0, 160); tone("triangle", 180, 80, 0.5, 0.1); },
    count()    { if (!ok()) return; tone("sine", 880, 880, 0.18, 0.22); },
    go()       { if (!ok()) return; tone("sine", 1320, 1320, 0.4, 0.26); tone("triangle", 660, 1320, 0.3, 0.12); },
    step(i)    { if (!ok()) return; noise(0.05, 0.05, "bandpass", i % 2 ? 1500 : 1150, 3); },
    correct()  { if (!ok()) return; [0, 0.08, 0.16].forEach((d, i) => tone("sine", [1047, 1319, 1568][i], [1047, 1319, 1568][i], 0.4, 0.2, d)); noise(0.25, 0.08, "highpass", 5000, 0.7, 0.05); },
    wrong()    { if (!ok()) return; tone("square", 210, 120, 0.34, 0.1); tone("sawtooth", 150, 90, 0.3, 0.06, 0.05); },
    hit()      { if (!ok()) return; noise(0.35, 0.5, "lowpass", 1400, 1, 0, 200); tone("sawtooth", 300, 60, 0.4, 0.14); },
    teleport() { if (!ok()) return; tone("sine", 300, 1800, 0.45, 0.14); noise(0.45, 0.1, "bandpass", 800, 2, 0, 4000); },
    enemy()    { if (!ok()) return; tone("square", 520, 700, 0.12, 0.06); tone("square", 700, 520, 0.12, 0.06, 0.12); },
    tick()     { if (!ok()) return; tone("square", 1500, 1500, 0.03, 0.06); },
    win()      { if (!ok()) return; [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone("triangle", f, f, 0.32, 0.22, i * 0.12)); },
    over()     { if (!ok()) return; [440, 370, 311, 262].forEach((f, i) => tone("triangle", f, f * 0.98, 0.34, 0.18, i * 0.2)); },
    humOn() {
      if (!ok() || hum) return;
      const t = T(), g = ac.createGain(), f = ac.createBiquadFilter(), o1 = ac.createOscillator(), o2 = ac.createOscillator();
      o1.type = "sawtooth"; o1.frequency.value = 55; o2.type = "sine"; o2.frequency.value = 82.4;
      f.type = "lowpass"; f.frequency.value = 260;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.035, t + 2);
      o1.connect(f); o2.connect(f); f.connect(g).connect(master); o1.start(); o2.start();
      hum = { g, o1, o2 };
    },
    humOff() {
      if (!hum) return;
      const h = hum; hum = null;
      try { const t = T(); h.g.gain.cancelScheduledValues(t); h.g.gain.setValueAtTime(h.g.gain.value, t); h.g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8); h.o1.stop(t + 0.9); h.o2.stop(t + 0.9); } catch (e) { /* đã dừng */ }
    },
    suspend() { if (ac && ac.state === "running") ac.suspend(); },
    resume()  { if (ac && ac.state === "suspended") ac.resume(); },
  };
}
