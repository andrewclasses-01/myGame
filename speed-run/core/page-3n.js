// RACING WORDS mẫu 3n (= vỏ 3m + INTRO XƯỞNG ANDREW STUDIO sr3d-intro-3n.js; lõi sr3d-3n.js, iPad pad-3n.html kênh srpad3n) · gốc 3m · gốc 3l · gốc 3k · gốc 3j (= vỏ 3i) · gốc: mẫu 3i (= vỏ 3h + XE 3D THẬT: tải trước 2 xe đã chọn rồi mới dựng game; ?cars=Y2,H4) — vỏ trang thử: khung game (rộng hết) + HÀNG NÚT 60 px kiểu AWord (game tự dựng, gom 1 nút góc phải) + BẢNG THỬ bên dưới.
// iPad: kênh bắt tay CỤC BỘ (localSignal) ⇒ mở pad-3h.html?t=0 / ?t=1 ở TAB KHÁC (kênh "srpad3h"); chế độ iPad chọn bằng nút iPad trong hàng nút cùng trình duyệt để thử tay lái (giao thức lái giữ nguyên mẫu 2).
// Tham số: ?steps=3..20 · ?laps=1..6 · ?cars=Y2,H4 (mã xe trong sr3d-xe3d.js) · ?bend=0..1 · ?ramps=0 · ?auto=1
import { createSpeedRun } from "./sr3d-3n.js";
import { XE, prepXe } from "./sr3d-xe3d.js";
import { createIntro } from "./sr3d-intro-3n.js";
import { createSound } from "./sr3d-sound-3n.js";
import { createPadHost, localSignal } from "./sr3d-padlink-3e.js";
import { QUESTIONS, TITLE } from "../../maze-chase/core/questions-sample.js";

export async function boot() {
  const QS = new URLSearchParams(location.search);
  const options = { steps: +(QS.get("steps") || 12), laps: +(QS.get("laps") || 0), bend: QS.has("bend") ? +QS.get("bend") : 0.75, ramps: QS.get("ramps") !== "0" };
  const panel = document.getElementById("below");
  const fpsEl = document.createElement("span");
  // 3i: xe 2 đội = ?cars= > lần chọn trước (localStorage) > mặc định; tải xong 2 xe mới dựng game
  let saved = null; try { saved = JSON.parse(localStorage.getItem("speedrun.cars") || "null"); } catch (e) { /* */ }
  const cars = (QS.get("cars") || "").split(",").filter(Boolean).length === 2 ? QS.get("cars").split(",") : Array.isArray(saved) && saved.length === 2 ? saved : ["Y2", "H4"];
  options.cars = cars.map((id, i) => XE.some(x => x.id === id) ? id : ["Y2", "H4"][i]);
  const frame = document.getElementById("frame");
  frame.innerHTML = '<div style="height:100%;display:flex;align-items:center;justify-content:center;color:#8893a3;font:600 15px system-ui;letter-spacing:1px">LOADING CARS…</div>';
  await Promise.all(options.cars.map(prepXe));
  frame.innerHTML = "";
  const padUrl = t => new URL("pad-3n.html?t=" + t, location.href).href;
  const remote = createPadHost({ signal: localSignal("srpad3n"), padUrl });
  window.__pad = remote;
  let game;
  try { game = createSpeedRun({ mount: document.getElementById("frame"), bar: document.getElementById("bar"), questions: QUESTIONS, title: TITLE, options, remote, onEvent: (k, v) => { if (k === "fps") fpsEl.textContent = v + " fps"; if (k === "padMode" && window.__paintPm) window.__paintPm(); onGameEvent(k, v); } }); }
  catch (e) { document.getElementById("frame").textContent = "Lỗi dựng cảnh 3D: " + e.message; console.error(e); throw e; }
  window.__sr = game;
  // 3n: INTRO xưởng ANDREW STUDIO phủ kín khung game ở màn chờ; START ⇒ phim ~12 s ⇒ chớp sáng ⇒ game.start() (máy quay vào buồng lái, 5 đèn, GO)
  const frameEl = document.getElementById("frame");
  const after = document.createElement("div"); after.style.cssText = "position:absolute;inset:0;z-index:49;background:#fff;opacity:0;pointer-events:none;transition:opacity .6s ease-out"; frameEl.appendChild(after);
  let introOn = true;
  const intro = createIntro({ mount: frameEl, cars: options.cars, title: "RACING WORDS",
    onSetCar: (i, id) => game.setCar(i, id),
    onCue: (n, t) => introCue(n, t),
    onHandoff: () => { introOn = false; game.hold(false); game.start(); after.style.transition = "none"; after.style.opacity = "1";
      requestAnimationFrame(() => { intro.hide(); after.style.transition = "opacity .6s ease-out"; after.style.opacity = "0"; }); } });
  window.__intro = intro;
  game.hold(true);
  // ---------- 3n: ÂM THANH (file thật ở speed-run/sfx/, thiếu file ⇒ im lặng) ----------
  const S = createSound(); window.__sound = S; S.load();
  const PAN = [-0.55, 0.55];
  let idleAmb = false;
  window.addEventListener("pointerdown", () => { if (!idleAmb && introOn) { idleAmb = true; S.loop("garage", true, { fade: 1.5 }); } }, { capture: true });
  function introCue(n, t) {
    if (n === "start") { S.play("mIntro"); S.loop("garage", true); }
    else if (n === "lights") S.play("lights", { rate: 0.94 + Math.random() * 0.12, gain: 0.8 + 0.05 * t, pan: (t - 2) * 0.2 });
    else if (n === "sign") S.play("lights", { rate: 0.8, gain: 0.7 });
    else if (n === "engine") { S.play("start", { pan: PAN[t] }); setTimeout(() => S.loop("rev" + t, true, { name: "rev", pan: PAN[t], fade: 0.8 }), 900); }
    else if (n === "pop") S.play("pop", { pan: PAN[t ?? 0], rate: 0.9 + Math.random() * 0.2, gain: introOn && window.__intro.state !== "play" ? 0.45 : 1 });
    else if (n === "door") S.play("door");
    else if (n === "rollout") { [0, 1].forEach(i => S.loop("rev" + i, true, { name: "rev", rate: 1.35, gain: 1.3, pan: PAN[i] })); S.play("screech", { gain: 0.7 }); S.play("flyby", { delay: 1.3 }); }   // tiếng vút qua: đỉnh ở giây thứ 2 của file ⇒ trúng lúc xe lướt máy quay (~11 s)
    else if (n === "title") S.play("hit");
    else if (n === "handoff") { S.loop("rev0", false, { fade: 0.8 }); S.loop("rev1", false, { fade: 0.8 }); S.loop("garage", false, { fade: 1 }); }
  }
  // trận đua: máy 2 xe (cao độ theo tốc độ, lệch trái/phải theo nửa màn), gió khi nhanh / bay, nhạc nền, sự kiện
  let lastPhase = "menu", lights = 0;
  setInterval(() => {
    const st = game.state(), ph = st.phase, racing = ph === "count" || ph === "race" || ph === "end";
    if (ph !== lastPhase) {
      if (ph === "count") { S.loop("mRace", true, { fade: 2 }); lights = 0; }
      if (ph === "race") S.play("go");
      if (ph === "end") { S.loop("mRace", false, { fade: 1.2 }); S.play("win"); S.play("crowd", { delay: 0.3 }); setTimeout(() => S.play("mResult"), 1400); }
      if (ph === "menu") { S.stopAll(0.8); idleAmb = false; }
      lastPhase = ph;
    }
    if (ph === "count") { const n = Math.min(5, Math.floor((game.G.countT - 0.6) / 0.55) + 1); while (lights < n && lights < 5) { lights++; S.play("lightsBeep", { rate: 1 }); } }
    S.pause(!!game.G.paused);
    st.teams.forEach((t, i) => {
      const T = game.T[i], v = t.v, boostK = Math.max(T.boostK || 0, T.nitroK || 0);
      S.loop("engine" + i, racing, { name: "engine", rate: 0.85 + v / 45 + boostK * 0.1, gain: 0.55 + 0.35 * boostK, pan: PAN[i] });   // máy Lamborghini: chậm ~1,2× · boost ~1,9×
      S.loop("wind" + i, racing && (v > 25 || t.air), { name: "wind", gain: Math.min(1, (v - 20) / 25) + (t.air ? 0.4 : 0), pan: PAN[i] });
      S.loop("fire" + i, racing && (T.burnT || 0) > 0, { name: "fire", pan: PAN[i] });
      if (T.nitroK > 0.6 && !T._sBoost) { T._sBoost = true; S.play("boost", { pan: PAN[i] }); } else if (T.nitroK < 0.2) T._sBoost = false;
      if (t.spin > 0 && !T._sSpin) { T._sSpin = true; S.play("screech", { pan: PAN[i] }); } else if (t.spin <= 0) T._sSpin = false;
      if (t.ms > (T._sMs ?? t.ms)) S.play("reload", { pan: PAN[i] }); T._sMs = t.ms;                      // thêm tên lửa ⇒ tiếng nạp
    });
  }, 50);
  // tiếng bấm nút: chọn xe, START, nút trả lời, hàng nút, MENU
  frameEl.addEventListener("pointerdown", e => { if (e.target.closest("button")) S.play("click"); }, { capture: true });
  document.getElementById("bar").addEventListener("pointerdown", e => { if (e.target.closest("button")) S.play("click"); }, { capture: true });
  const tb = document.querySelector('#bar [data-k="sound"]');
  if (tb) { tb.classList.toggle("is-off", !S.fxOn); tb.addEventListener("click", () => { const on = !tb.classList.contains("is-off"); S.setBus("fx", on); S.setBus("music", on); }); }
  function gameSound(k, v) {
    if (k === "correct") S.play("correct", { pan: PAN[v.team] });
    else if (k === "wrong") S.play("wrong", { pan: PAN[v.team] });
    else if (k === "fire") S.play("mLaunch", { pan: PAN[v.team] });
    else if (k === "impact") { if (v.kind === "hit") S.play("boom", { pan: PAN[v.to] }); else S.play("boom", { gain: 0.55, rate: 1.15, pan: PAN[v.to] }); }
    else if (k === "land") S.play("land", { pan: PAN[v.team], gain: v.kind === "bad" ? 1 : 0.8 });
    else if (k === "bump") S.play("crash", { gain: 0.8 });
    else if (k === "takeoff") S.play("flyby", { gain: 0.5, rate: 1.2, pan: PAN[v.team ?? 0] });
  }
  function onGameEvent(k, v) {
    gameSound(k, v || {});
    if (k === "menu" && intro) { introOn = true; game.hold(true); intro.show(); }
    if (k === "car" && intro && intro.cars[v.team] !== v.id) intro.setCar(v.team, v.id, false);
  }
  // nút thử / tự chơi gọi thẳng game.start() ⇒ intro tự ẩn
  setInterval(() => { if (introOn && game.state().phase !== "menu") { introOn = false; intro.hide(); game.hold(false); } }, 200);
  if (QS.get("auto") === "1") { game.auto(true); game.start(); }

  const reloadWith = (k, v) => { const q = new URLSearchParams(location.search); if (v == null) q.delete(k); else q.set(k, v); location.search = q.toString(); };
  const B = (label, fn, cls = "") => { const b = document.createElement("button"); b.type = "button"; b.textContent = label; if (cls) b.className = cls; b.onclick = fn; return b; };
  const A = (label, href) => { const a = document.createElement("a"); a.href = href; a.target = "_blank"; a.textContent = label; return a; };
  const row = (title, ...els) => { const r = document.createElement("div"); r.className = "row"; const h = document.createElement("span"); h.className = "lbl"; h.textContent = title; r.append(h, ...els); panel.append(r); return r; };
  row("Trận", B("▶ START (intro)", () => intro.play(), "go"), B("Bỏ intro, đua ngay", () => game.start()), B("Tự chơi 85% / 60%", () => { game.auto(true, 0.85, 0.6); game.start(); }), B("Tự chơi ngang nhau", () => { game.auto(true, 0.8, 0.8); game.start(); }), B("Dừng tự chơi", () => game.auto(false)));
  row("Đội 1", B("ĐÚNG", () => game.answer(0, true), "t1"), B("SAI", () => game.answer(0, false), "bad"), B("+2 ô năng lượng", () => game.give(0, 2), "t1"), B("Nạp 3 tên lửa", () => game.arm(0, 3), "t1"), B("BẮN (F)", () => game.fire(0), "t1"), B("Đầy BOOST", () => game.give(0, 4), "t1"));
  row("Đội 2", B("ĐÚNG", () => game.answer(1, true), "t2"), B("SAI", () => game.answer(1, false), "bad"), B("+2 ô năng lượng", () => game.give(1, 2), "t2"), B("Nạp 3 tên lửa", () => game.arm(1, 3), "t2"), B("BẮN (Enter)", () => game.fire(1), "t2"), B("Đầy BOOST", () => game.give(1, 4), "t2"));
  row("Thử nhanh", B("2 xe tới ngay trước cầu nhảy", () => { const r = game.ramps()[0]; if (!r) return; game.place(0, r.s - 70, r.x); game.place(1, r.s - 76, r.x + (r.x > 0 ? -3.5 : 3.5)); }),
    B("2 xe song song sát nhau", () => { const s = game.state().teams[0].s; game.place(0, s, -1.2); game.place(1, s, 1.2); }),
    B("Xe 1 lên dốc MỘT NỬA (lộn trục dọc)", () => { const st = game.state(), r = game.ramps().find(q => q.s > st.teams[0].s + 40) || game.ramps()[0]; if (!r) return;
      game.place(0, r.s - 45, r.x + (r.x > 0 ? -1 : 1) * (r.w / 2)); game.drive(0, { steer: 0, boost: 0, brake: 0 }); setTimeout(() => game.drive(0, null), 4000); }),
    B("Bắn trúng xe 2 (khói đen)", () => { game.arm(0, 1); game.fire(0); }));
  row("Lái thử", Object.assign(document.createElement("span"), { textContent: "Trên màn: bấm nửa trái/phải VÔ LĂNG để lái · BOOST · BRAKE. Bàn phím đội 1: A/D · W BOOST · S phanh · F bắn — đội 2: ←/→ · ↑ · ↓ · Enter. Đúng ⇒ nạp thanh BOOST (không tự tăng tốc), giữ BOOST để dùng. Trên không: giữ PHANH = xoay 360 (thêm ◀/▶ = lộn ngang) ⇒ +BOOST.", className: "hint" }));
  row("iPad (thử)", A("iPad đội 1 (tab mới)", padUrl(0)), A("iPad đội 2 (tab mới)", padUrl(1)), Object.assign(document.createElement("span"), { textContent: "Mở 2 tab trên, cùng trình duyệt. iPad THẬT cần kênh bắt tay của AWord.", className: "hint" }));
  const pmBtns = ["1. Tắt iPad", "2. Trả lời trên iPad", "3. Đua trên iPad"].map((l, k) => B(l, () => { game.setPadMode(k); paintPm(); }));
  const paintPm = () => pmBtns.forEach((b, k) => b.classList.toggle("is-on", game.padMode === k));
  window.__paintPm = paintPm; row("Chế độ iPad", ...pmBtns, Object.assign(document.createElement("span"), { textContent: "(= nút iPad trong hàng nút của game)", className: "hint" })); paintPm();
  row("Số đoạn", ...[8, 12, 16, 20].map(n => B(String(n), () => reloadWith("steps", n), n === options.steps ? "is-on" : "")));
  row("Số vòng", B("Tự động", () => reloadWith("laps", null), !options.laps ? "is-on" : ""), ...[1, 2, 3, 4].map(n => B(String(n), () => reloadWith("laps", n), n === options.laps ? "is-on" : "")));
  [0, 1].forEach(i => row("Xe đội " + (i + 1), ...XE.map(x => B(x.id, () => game.setCar(i, x.id).then(() => paintCars()), "t" + (i + 1)))));
  const paintCars = () => panel.querySelectorAll(".row").forEach(r => { const m = /Xe đội (\d)/.exec(r.textContent); if (!m) return; const cur = game.cars()[+m[1] - 1];
    r.querySelectorAll("button").forEach(b => b.classList.toggle("is-on", b.textContent === cur)); });
  paintCars(); setInterval(paintCars, 800);
  const info = document.createElement("div"); info.className = "info"; panel.append(info);
  info.append(fpsEl); const txt = document.createElement("span"); info.append(txt);
  setInterval(() => { const s = game.state();
    txt.textContent = ` · ${s.LAPS} vòng × ${s.LAP} m · ` + s.teams.map((t, i) => `đội ${i + 1}: ${Math.round(t.s)}/${s.FIN} m, ${t.kmh} km/h${t.air ? " (BAY " + t.y + " m)" : ""}, năng lượng ${t.cells} ô, nitro ${Math.round(t.N * 100)}%, tên lửa ${t.ms}, lái ${t.src}${t.pad ? " (iPad " + t.pad + ")" : ""}`).join(" · "); }, 250);
}
