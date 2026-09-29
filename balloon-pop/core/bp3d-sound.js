// Âm thanh Balloon Pop 3D — tổng hợp bằng Web Audio, không dùng file (kho myGame công khai,
// không phát tán mp3 của Wordwall). Mọi hàm an toàn khi chưa có AudioContext (chưa bấm START).
export function createBpSound() {
  let ac = null, master = null, noiseBuf = null, muted = false;

  function ensure() {
    if (ac) { if (ac.state === "suspended") ac.resume(); return true; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ac = new AC();
    master = ac.createGain();
    master.gain.value = muted ? 0 : 0.9;
    master.connect(ac.destination);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 1.5, ac.sampleRate);
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
  function tone(type, f0, f1, dur, peak, delay = 0, dest = master) {
    const t = T() + delay, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    env(g, t, 0.006, peak, dur);
    o.connect(g).connect(dest); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, peak, ftype, freq, q = 1, delay = 0) {
    const t = T() + delay, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noiseBuf; f.type = ftype; f.frequency.value = freq; f.Q.value = q;
    env(g, t, 0.004, peak, dur);
    s.connect(f).connect(g).connect(master); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  }

  return {
    unlock: ensure,
    get muted() { return muted; },
    setMuted(m) { muted = m; if (master) master.gain.value = m ? 0 : 0.9; },
    pop()      { if (!ok()) return; noise(0.12, 0.7, "bandpass", 1900, 0.8); tone("sine", 700, 140, 0.16, 0.35); },
    correct()  { if (!ok()) return; tone("sine", 1320, 1320, 0.35, 0.28); tone("sine", 1760, 1760, 0.45, 0.22, 0.09); noise(0.08, 0.25, "lowpass", 500); },
    wrong()    { if (!ok()) return; tone("square", 190, 110, 0.32, 0.12); noise(0.14, 0.35, "lowpass", 380); },
    thud()     { if (!ok()) return; noise(0.16, 0.45, "lowpass", 260); },
    bonus()    { if (!ok()) return; [0, 0.07, 0.14, 0.21].forEach((d, i) => tone("triangle", 880 * Math.pow(1.26, i), 880 * Math.pow(1.26, i), 0.18, 0.2, d)); },
    whistle()  {
      if (!ok()) return;
      const t = T(), g = ac.createGain(), f = ac.createBiquadFilter();
      f.type = "bandpass"; f.frequency.value = 900; f.Q.value = 2;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.06);
      g.gain.setValueAtTime(0.25, t + 0.5); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
      [523, 659, 784].forEach(fr => { const o = ac.createOscillator(); o.type = "sawtooth"; o.frequency.value = fr; o.connect(f); o.start(t); o.stop(t + 0.85); });
      f.connect(g).connect(master);
    },
    chug(speed) { if (!ok()) return; noise(0.09, 0.05 + Math.min(0.08, speed * 0.008), "bandpass", 300, 1.2); },
    tick()     { if (!ok()) return; tone("square", 1500, 1500, 0.03, 0.08); },
    levelUp()  { if (!ok()) return; [523, 659, 784, 1047].forEach((f, i) => tone("triangle", f, f, 0.28, 0.22, i * 0.1)); },
    plane() {
      if (!ok()) return;
      const t = T(), o = ac.createOscillator(), lfo = ac.createOscillator(), lg = ac.createGain(), f = ac.createBiquadFilter(), g = ac.createGain();
      o.type = "sawtooth"; o.frequency.value = 95; lfo.frequency.value = 22; lg.gain.value = 18;
      lfo.connect(lg).connect(o.frequency); f.type = "lowpass"; f.frequency.value = 700;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.1, t + 1.4);
      g.gain.setValueAtTime(0.1, t + 2.6); g.gain.exponentialRampToValueAtTime(0.0001, t + 4.6);
      o.connect(f).connect(g).connect(master); o.start(t); lfo.start(t); o.stop(t + 4.7); lfo.stop(t + 4.7);
    },
    win()      { if (!ok()) return; [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone("triangle", f, f, 0.3, 0.24, i * 0.12)); },
    timesUp()  { if (!ok()) return; [660, 520, 400, 300].forEach((f, i) => tone("square", f, f * 0.97, 0.26, 0.12, i * 0.16)); },
  };
}
