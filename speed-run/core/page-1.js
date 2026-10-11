// SPEED RUN mẫu 1 — vỏ trang thử: khung game kiểu TOMKO (rộng hết, cao = min(½ rộng, màn − dải nút)) + BẢNG THỬ bên dưới.
// Tham số: ?steps=3..20 · ?car=lambo|porsche|ferrari|suv|sedan · ?bend=0|1 · ?auto=1
import { createSpeedRun, VIEWS } from "./sr3d-1.js";
import { QUESTIONS, TITLE } from "../../maze-chase/core/questions-sample.js";

export function boot(view) {
  const QS = new URLSearchParams(location.search);
  const options = { steps: +(QS.get("steps") || 8), car: QS.get("car") || "lambo", bend: QS.get("bend") === "0" ? 0 : 1 };
  const panel = document.getElementById("below");
  const fpsEl = document.createElement("span");
  let game;
  try { game = createSpeedRun({ mount: document.getElementById("frame"), view, questions: QUESTIONS, title: TITLE, options, onEvent: (k, v) => { if (k === "fps") fpsEl.textContent = v + " fps"; } }); }
  catch (e) { document.getElementById("frame").textContent = "Lỗi dựng cảnh 3D: " + e.message; console.error(e); throw e; }
  window.__sr = game;
  if (QS.get("auto") === "1") { game.auto(true); game.start(); }

  const reloadWith = (k, v) => { const q = new URLSearchParams(location.search); if (v == null) q.delete(k); else q.set(k, v); location.search = q.toString(); };
  const B = (label, fn, cls = "") => { const b = document.createElement("button"); b.type = "button"; b.textContent = label; if (cls) b.className = cls; b.onclick = fn; return b; };
  const row = (title, ...els) => { const r = document.createElement("div"); r.className = "row"; const h = document.createElement("span"); h.className = "lbl"; h.textContent = title; r.append(h, ...els); panel.append(r); return r; };
  row("Trận", B("▶ START", () => game.start(), "go"), B("Tự chơi 85% / 60%", () => { game.auto(true, 0.85, 0.6); game.start(); }), B("Tự chơi 2 đội ngang nhau", () => { game.auto(true, 0.8, 0.8); game.start(); }), B("Dừng tự chơi", () => game.auto(false)));
  row("Đội 1", B("ĐÚNG", () => game.answer(0, true), "t1"), B("SAI", () => game.answer(0, false), "bad"), B("+3 đoạn (bỏ xa)", () => game.give(0, 3), "t1"), B("Đổi làn (A/D)", () => game.lane(0, game.T[0].lane ? 1 : -1), "t1"));
  row("Đội 2", B("ĐÚNG", () => game.answer(1, true), "t2"), B("SAI", () => game.answer(1, false), "bad"), B("+3 đoạn (bỏ xa)", () => game.give(1, 3), "t2"), B("Đổi làn (←/→)", () => game.lane(1, game.T[1].lane ? -1 : 1), "t2"));
  const links = Object.entries(VIEWS).map(([k, v]) => { const a = document.createElement("a"); a.href = (k === "a" ? "mau-1a-cao-vua.html" : "mau-1b-truc-thang.html") + location.search; a.textContent = "Góc " + k.toUpperCase() + " · " + v.name; if (k === view) a.className = "cur"; return a; });
  row("Góc máy", ...links);
  row("Số đoạn", ...[5, 8, 10, 12].map(n => B(String(n), () => reloadWith("steps", n), n === options.steps ? "is-on" : "")));
  row("Xe", ...["lambo", "porsche", "ferrari", "suv", "sedan"].map(c => B(c, () => reloadWith("car", c), c === options.car ? "is-on" : "")));
  row("Cong đường", B(options.bend ? "BẬT" : "TẮT", () => reloadWith("bend", options.bend ? "0" : null), options.bend ? "is-on" : ""), B("Toàn màn hình", () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()));
  const info = document.createElement("div"); info.className = "info"; panel.append(info);
  info.append(fpsEl); const txt = document.createElement("span"); info.append(txt);
  setInterval(() => { const s = game.state(), c = game.camInfo();
    txt.textContent = ` · khoảng cách ${c.gap} m · máy quay cao ${c.y} m · trực thăng ${Math.round(c.kh * 100)}% · ` + s.teams.map((t, i) => `đội ${i + 1}: ${t.p}/${s.L} đoạn, ${t.kmh} km/h, năng lượng ${t.energy}`).join(" · "); }, 250);
}
