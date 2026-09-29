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

  return {
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
