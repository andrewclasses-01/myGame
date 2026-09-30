// STAR LOOT — ÂM THANH THẬT (mẫu 2i, 30/9/2026). Thay hẳn bộ tiếng tổng hợp (mc3d-sound-1p.js, "tiếng hoạt hình") bằng FILE THU ÂM THẬT
//   chuẩn điện ảnh trong thư mục ../am-thanh/ (nguồn Pixabay — giấy phép Pixabay: dùng miễn phí trong game, không cần ghi tên; danh sách
//   nguồn từng file ở ../am-thanh/NGUON.md). Giữ nguyên tên hàm của bộ cũ ⇒ lõi game gọi y như trước.
//   Kênh: master → nén mềm (DynamicsCompressor) → loa · music / sfx / amb (tiếng nền) / intro (tắt được một lượt khi bỏ qua intro).
//   Nhạc: một bài chạy tại một thời điểm, đổi bài = mờ chéo; tiếng nổ lớn ⇒ nhạc nhỏ xuống thoáng chốc (duck).
//   Tải trước: file tải về (fetch) ngay khi mở trang; giải mã khi có AudioContext (sau cú bấm đầu tiên). File thiếu ⇒ im lặng, không lỗi.
const DIR = new URL("../am-thanh/", import.meta.url).href;
// id: { v: âm lượng trộn, bus, loop }
const LIB = {
  nhac_menu: { v: 0.55, bus: "music", loop: true }, nhac_intro: { v: 1.0, bus: "music" }, nhac_choi: { v: 0.55, bus: "music", loop: true },
  nhac_thang: { v: 0.9, bus: "music" }, nhac_thua: { v: 0.85, bus: "music" },
  dong_co_tau: { v: 0.2, bus: "intro", loop: true }, dong_co_khoi: { v: 0.8, bus: "intro" }, tau_bay_qua: { v: 0.75, bus: "intro" },
  tang_toc: { v: 0.9, bus: "intro" }, lo_giun: { v: 0.9, bus: "intro" }, braam: { v: 0.85, bus: "intro" }, tieng_dong: { v: 0.8, bus: "intro" },
  riser: { v: 0.5, bus: "intro" }, hud_beep: { v: 0.35, bus: "intro" }, cua_khoang: { v: 0.7, bus: "intro" }, xi_hoi: { v: 0.45, bus: "intro" },
  jetpack: { v: 0.4, bus: "intro", loop: true }, servo: { v: 0.7, bus: "sfx" }, kim_loai: { v: 0.55, bus: "intro" },
  bao_dong: { v: 0.3, bus: "sfx", loop: true },
  click: { v: 0.6 }, hien_cau_hoi: { v: 0.55 }, tuong_dung: { v: 0.65 }, nap_boong: { v: 0.85 }, dem_nguoc: { v: 0.55 }, go: { v: 0.7 },
  buoc_chan: { v: 0.2 }, dung: { v: 0.65 }, sai: { v: 0.55 }, trung_don: { v: 1.5 }, dich_chuyen: { v: 0.55 }, dich_xuat_hien: { v: 0.65 },
  tich_tac: { v: 0.45 }, bom_no: { v: 0.9 }, ong_boong: { v: 0.3, bus: "amb", loop: true },
};

export function createMcSound() {
  let ac = null, master = null, muted = false;
  const bus = {}, buf = {}, raw = {};
  // tải trước file (chưa cần AudioContext)
  Object.keys(LIB).forEach(id => { raw[id] = fetch(DIR + id + ".mp3").then(r => (r.ok ? r.arrayBuffer() : null)).catch(() => null); });
  function decodeAll() {
    Object.keys(LIB).forEach(id => {
      if (buf[id] !== undefined) return; buf[id] = null;
      raw[id].then(ab => (ab ? ac.decodeAudioData(ab.slice(0)) : null)).then(b => { buf[id] = b || false; if (b && pend[id]) pend[id].forEach(f => f()); delete pend[id]; }).catch(() => { buf[id] = false; delete pend[id]; });
    });
  }
  const pend = {};   // lệnh phát trong lúc file đang giải mã (vd nhạc intro lúc vừa bấm START) ⇒ phát ngay khi xong nếu còn kịp
  function ensure() {
    if (ac) { if (ac.state === "suspended") ac.resume(); return true; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    ac = new AC();
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.knee.value = 10; comp.ratio.value = 3.5; comp.attack.value = 0.004; comp.release.value = 0.25;
    master = ac.createGain(); master.gain.value = muted ? 0 : 1; master.connect(comp).connect(ac.destination);
    bus.music = ac.createGain(); bus.music.connect(master);
    bus.sfx = ac.createGain(); bus.sfx.connect(master);
    bus.amb = ac.createGain(); bus.amb.connect(master);
    newIntroBus();
    decodeAll();
    return true;
  }
  function newIntroBus() { bus.intro = ac.createGain(); bus.intro.connect(master); }
  const ok = () => ac && !muted;
  const now = () => ac.currentTime;

  // phát một file: o = { v, rate, delay, loop, fade (vào), dur (tự tắt sau dur giây, mờ ra `out`), out, offset, pan, bus }
  function play(id, o = {}) {
    if (!ac) return null;
    const L = LIB[id]; if (!L) return null;
    const b = buf[id];
    if (!b) {   // chưa giải mã xong ⇒ xếp hàng, phát ngay khi xong nếu chưa trễ quá `late` giây
      if (!o._late && buf[id] !== false) { const t0 = now(); (pend[id] = pend[id] || []).push(() => { if (now() - t0 < (o.late ?? 0.6)) { const h = play(id, { ...o, _late: 1 }); if (h && o.onStart) o.onStart(h); } }); }
      return null;
    }
    const t = now() + (o.delay || 0), src = ac.createBufferSource(), g = ac.createGain();
    src.buffer = b; src.loop = !!(o.loop ?? L.loop); if (o.rate) src.playbackRate.value = o.rate;
    const vol = (o.v ?? 1) * L.v;
    if (o.fade) { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + o.fade); } else g.gain.setValueAtTime(vol, t);
    let out = g;
    if (o.pan && ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = o.pan; g.connect(p); out = p; }
    src.connect(g); out.connect(bus[o.bus || L.bus || "sfx"]);
    src.start(t, o.offset || 0);
    const h = { src, g, stop(f = 0.3) { try { const n = now(); g.gain.cancelScheduledValues(n); g.gain.setValueAtTime(g.gain.value, n); g.gain.linearRampToValueAtTime(0.0001, n + f); src.stop(n + f + 0.05); } catch (e) { /* đã dừng */ } } };
    if (o.dur) { const end = t + o.dur, f = o.out ?? 0.5; g.gain.setValueAtTime(vol, Math.max(t + (o.fade || 0), end - f)); g.gain.linearRampToValueAtTime(0.0001, end); src.stop(end + 0.05); }
    return h;
  }
  // nhạc nền: một bài một lúc, đổi bài mờ chéo
  let song = null, songId = "";
  function music(id, fade = 1.5, o = {}) {
    if (!ok()) return;
    if (songId === id && song) return;
    if (song) song.stop(fade);
    songId = id; song = play(id, { fade, late: 8, ...o, onStart: h => { if (songId === id) song = h; else h.stop(0.2); } });
  }
  function musicStop(fade = 1.2) { if (song) song.stop(fade); song = null; songId = ""; }
  function duck(depth = 0.35, hold = 0.6, back = 1.4) {
    if (!ac) return; const g = bus.music.gain, n = now();
    g.cancelScheduledValues(n); g.setValueAtTime(g.value, n); g.linearRampToValueAtTime(depth, n + 0.06); g.setValueAtTime(depth, n + hold); g.linearRampToValueAtTime(1, n + hold + back);
  }
  const loops = {};   // tiếng lặp đặt tên (động cơ, báo động, tiếng nền)
  function loopOn(key, id, o = {}) { if (!ok() || loops[key]) return; loops[key] = play(id, { loop: true, fade: 1, ...o }); }
  function loopOff(key, f = 0.8) { if (loops[key]) { loops[key].stop(f); delete loops[key]; } }
  const vary = (a = 0.06) => 1 + (Math.random() * 2 - 1) * a;

  // ---------------- tiếng INTRO (kênh riêng, tắt được cả lượt)
  const intro = {
    stop() { if (!ac) return; const b = bus.intro; try { b.gain.setTargetAtTime(0.0001, now(), 0.1); } catch (e) { /* bỏ qua */ } setTimeout(() => { try { b.disconnect(); } catch (e) { /* bỏ qua */ } }, 800); newIntroBus(); delete loops.engine; delete loops.jet; },
    music(id, fade = 1.2) { music(id, fade); },
    engineOn(fade = 2.5, v = 1) { loopOn("engine", "dong_co_tau", { fade, v }); },
    engineOff(f = 1.5) { loopOff("engine", f); },
    ignite(delay = 0) { if (ok()) play("dong_co_khoi", { delay }); },
    braam(delay = 0) { if (ok()) { play("braam", { delay }); setTimeout(() => duck(0.45, 1.2, 2), delay * 1000); } },
    impact(delay = 0) { if (ok()) play("tieng_dong", { delay }); },
    riser(lead = 0) { if (!ok()) return; const b = buf.riser; play("riser", { offset: b && lead ? Math.max(0, b.duration - lead) : 0 }); },   // lead: tiếng dâng KẾT THÚC sau `lead` giây
    boost(delay = 0) { if (ok()) play("tang_toc", { delay }); },
    warp(delay = 0) { if (ok()) { play("lo_giun", { delay }); setTimeout(() => duck(0.5, 0.8, 1.6), delay * 1000); } },
    flyby(delay = 0, pan = 0) { if (ok()) play("tau_bay_qua", { delay, pan }); },
    beep(delay = 0, rate = 1) { if (ok()) play("hud_beep", { delay, rate }); },
    door(delay = 0) { if (ok()) play("cua_khoang", { delay }); },
    hiss(delay = 0) { if (ok()) play("xi_hoi", { delay }); },
    jet(dur = 2.5, delay = 0) { if (ok()) play("jetpack", { delay, dur, fade: 0.25, out: 0.6, loop: true }); },
    servo(delay = 0) { if (ok()) play("servo", { delay, rate: vary(0.05) }); },
    clank(delay = 0) { if (ok()) play("kim_loai", { delay }); },
  };

  if (typeof window !== "undefined") window.__snd = { buf, loops, bus, get song() { return songId; }, get ctx() { return ac; } };   // bàn thử
  return {
    intro,
    unlock: ensure,
    music, musicStop,
    get muted() { return muted; },
    setMuted(m) { muted = m; if (master) master.gain.setTargetAtTime(m ? 0 : 1, now(), 0.05); },
    click()    { if (ok()) play("click", { rate: vary(0.03) }); },
    reveal()   { if (ok()) play("hien_cau_hoi"); },
    build()    { if (ok()) play("tuong_dung"); },
    sink()     { if (ok()) play("nap_boong", { rate: 0.92 }); },
    count()    { if (ok()) play("dem_nguoc"); },
    go()       { if (ok()) { play("go"); music("nhac_choi", 2.5); } },   // bắt đầu chạy ⇒ nhạc chơi (mờ chéo từ nhạc intro)
    step(i)    { if (ok()) play("buoc_chan", { rate: vary(0.07), v: 0.8 + 0.2 * Math.random(), pan: i % 2 ? 0.08 : -0.08 }); },
    correct()  { if (ok()) play("dung"); },
    wrong()    { if (ok()) play("sai"); },
    hit()      { if (ok()) play("trung_don", { rate: vary(0.05) }); },
    boom()     { if (ok()) { play("bom_no", { rate: vary(0.05) }); duck(0.4, 0.5, 1.2); } },
    teleport() { if (ok()) play("dich_chuyen", { rate: vary(0.04) }); },
    enemy()    { if (ok()) play("dich_xuat_hien"); },
    tick()     { if (ok()) play("tich_tac"); },
    win()      { if (ok()) { musicStop(0.4); play("nhac_thang"); } },
    over()     { if (ok()) { musicStop(0.4); play("nhac_thua"); } },
    alarm(on)  { if (on) loopOn("alarm", "bao_dong", { fade: 0.3 }); else loopOff("alarm", 1.2); },
    menu()     { if (ok()) music("nhac_menu", 2); },
    humOn()    { loopOn("hum", "ong_boong", { fade: 2 }); },
    humOff()   { loopOff("hum", 0.8); loopOff("alarm", 0.6); },
    suspend()  { if (ac && ac.state === "running") ac.suspend(); },
    resume()   { if (ac && ac.state === "suspended") ac.resume(); },
  };
}
