// SPEED RUN mẫu 2 — vỏ trang thử: khung game kiểu TOMKO (rộng hết, cao = min(½ rộng, màn − dải nút)) + BẢNG THỬ bên dưới.
// iPad: kênh bắt tay CỤC BỘ (localSignal) ⇒ mở pad-2.html?t=0 / ?t=1 ở TAB KHÁC cùng trình duyệt để thử tay lái.
// Tham số: ?steps=3..20 · ?car=lambo|porsche|ferrari|suv|sedan · ?bend=0..1 · ?auto=1
import { createSpeedRun } from "./sr3d-2.js";
import { createPadHost, localSignal } from "./sr3d-padlink-2.js";
import { QUESTIONS, TITLE } from "../../maze-chase/core/questions-sample.js";

export function boot() {
  const QS = new URLSearchParams(location.search);
  const options = { steps: +(QS.get("steps") || 8), car: QS.get("car") || "lambo", bend: QS.has("bend") ? +QS.get("bend") : 0.75 };
  const panel = document.getElementById("below");
  const fpsEl = document.createElement("span");
  const padUrl = t => new URL("pad-2.html?t=" + t, location.href).href;
  const remote = createPadHost({ signal: localSignal(), padUrl });
  window.__pad = remote;
  let game;
  try { game = createSpeedRun({ mount: document.getElementById("frame"), questions: QUESTIONS, title: TITLE, options, remote, onEvent: (k, v) => { if (k === "fps") fpsEl.textContent = v + " fps"; } }); }
  catch (e) { document.getElementById("frame").textContent = "Lỗi dựng cảnh 3D: " + e.message; console.error(e); throw e; }
  window.__sr = game;
  if (QS.get("auto") === "1") { game.auto(true); game.start(); }

  const reloadWith = (k, v) => { const q = new URLSearchParams(location.search); if (v == null) q.delete(k); else q.set(k, v); location.search = q.toString(); };
  const B = (label, fn, cls = "") => { const b = document.createElement("button"); b.type = "button"; b.textContent = label; if (cls) b.className = cls; b.onclick = fn; return b; };
  const A = (label, href) => { const a = document.createElement("a"); a.href = href; a.target = "_blank"; a.textContent = label; return a; };
  const row = (title, ...els) => { const r = document.createElement("div"); r.className = "row"; const h = document.createElement("span"); h.className = "lbl"; h.textContent = title; r.append(h, ...els); panel.append(r); return r; };
  row("Trận", B("▶ START", () => game.start(), "go"), B("Tự chơi 85% / 60%", () => { game.auto(true, 0.85, 0.6); game.start(); }), B("Tự chơi ngang nhau", () => { game.auto(true, 0.8, 0.8); game.start(); }), B("Dừng tự chơi", () => game.auto(false)));
  row("Đội 1", B("ĐÚNG", () => game.answer(0, true), "t1"), B("SAI", () => game.answer(0, false), "bad"), B("+2 ô năng lượng", () => game.give(0, 2), "t1"), B("Nạp 3 tên lửa", () => game.arm(0, 3), "t1"), B("BẮN (F)", () => game.fire(0), "t1"));
  row("Đội 2", B("ĐÚNG", () => game.answer(1, true), "t2"), B("SAI", () => game.answer(1, false), "bad"), B("+2 ô năng lượng", () => game.give(1, 2), "t2"), B("Nạp 3 tên lửa", () => game.arm(1, 3), "t2"), B("BẮN (Enter)", () => game.fire(1), "t2"));
  row("Lái thử", Object.assign(document.createElement("span"), { textContent: "Đội 1: A/D lái · W BOOST · S phanh · F bắn — Đội 2: ←/→ · ↑ BOOST · ↓ phanh · Enter bắn. Không chạm phím 4 s ⇒ xe tự lái lại.", className: "hint" }));
  row("iPad (thử)", A("Tay lái đội 1 (tab mới)", padUrl(0)), A("Tay lái đội 2 (tab mới)", padUrl(1)), Object.assign(document.createElement("span"), { textContent: "Thử trên máy này: mở 2 tab trên, cùng trình duyệt. iPad THẬT cần kênh bắt tay của AWord.", className: "hint" }));
  row("Số đoạn", ...[5, 8, 10, 12].map(n => B(String(n), () => reloadWith("steps", n), n === options.steps ? "is-on" : "")));
  row("Xe", ...["lambo", "porsche", "ferrari", "suv", "sedan"].map(c => B(c, () => reloadWith("car", c), c === options.car ? "is-on" : "")));
  row("Cong đường", ...[[0, "TẮT"], [0.5, "nhẹ"], [0.75, "vừa"], [1, "mạnh"]].map(([v, l]) => B(l, () => reloadWith("bend", v), v === options.bend ? "is-on" : "")),
    B("Toàn màn hình", () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()));
  const info = document.createElement("div"); info.className = "info"; panel.append(info);
  info.append(fpsEl); const txt = document.createElement("span"); info.append(txt);
  setInterval(() => { const s = game.state();
    txt.textContent = " · " + s.teams.map((t, i) => `đội ${i + 1}: ${Math.round(t.s)}/${s.FIN} m, ${t.kmh} km/h, năng lượng ${t.cells} ô, tên lửa ${t.ms}, lái ${t.src}${t.pad ? " (iPad " + t.pad + ")" : ""}`).join(" · "); }, 250);
}
