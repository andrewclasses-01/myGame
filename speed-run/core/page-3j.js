// SPEED RUN mẫu 3j (= vỏ 3i, lõi sr3d-3j.js, iPad pad-3j.html kênh srpad3j) · gốc: mẫu 3i (= vỏ 3h + XE 3D THẬT: tải trước 2 xe đã chọn rồi mới dựng game; ?cars=Y2,H4) — vỏ trang thử: khung game (rộng hết) + HÀNG NÚT 60 px kiểu AWord (game tự dựng, gom 1 nút góc phải) + BẢNG THỬ bên dưới.
// iPad: kênh bắt tay CỤC BỘ (localSignal) ⇒ mở pad-3h.html?t=0 / ?t=1 ở TAB KHÁC (kênh "srpad3h"); chế độ iPad chọn bằng nút iPad trong hàng nút cùng trình duyệt để thử tay lái (giao thức lái giữ nguyên mẫu 2).
// Tham số: ?steps=3..20 · ?laps=1..6 · ?cars=Y2,H4 (mã xe trong sr3d-xe3d.js) · ?bend=0..1 · ?ramps=0 · ?auto=1
import { createSpeedRun } from "./sr3d-3j.js";
import { XE, prepXe } from "./sr3d-xe3d.js";
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
  const padUrl = t => new URL("pad-3j.html?t=" + t, location.href).href;
  const remote = createPadHost({ signal: localSignal("srpad3j"), padUrl });
  window.__pad = remote;
  let game;
  try { game = createSpeedRun({ mount: document.getElementById("frame"), bar: document.getElementById("bar"), questions: QUESTIONS, title: TITLE, options, remote, onEvent: (k, v) => { if (k === "fps") fpsEl.textContent = v + " fps"; if (k === "padMode" && window.__paintPm) window.__paintPm(); } }); }
  catch (e) { document.getElementById("frame").textContent = "Lỗi dựng cảnh 3D: " + e.message; console.error(e); throw e; }
  window.__sr = game;
  if (QS.get("auto") === "1") { game.auto(true); game.start(); }

  const reloadWith = (k, v) => { const q = new URLSearchParams(location.search); if (v == null) q.delete(k); else q.set(k, v); location.search = q.toString(); };
  const B = (label, fn, cls = "") => { const b = document.createElement("button"); b.type = "button"; b.textContent = label; if (cls) b.className = cls; b.onclick = fn; return b; };
  const A = (label, href) => { const a = document.createElement("a"); a.href = href; a.target = "_blank"; a.textContent = label; return a; };
  const row = (title, ...els) => { const r = document.createElement("div"); r.className = "row"; const h = document.createElement("span"); h.className = "lbl"; h.textContent = title; r.append(h, ...els); panel.append(r); return r; };
  row("Trận", B("▶ START", () => game.start(), "go"), B("Tự chơi 85% / 60%", () => { game.auto(true, 0.85, 0.6); game.start(); }), B("Tự chơi ngang nhau", () => { game.auto(true, 0.8, 0.8); game.start(); }), B("Dừng tự chơi", () => game.auto(false)));
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
