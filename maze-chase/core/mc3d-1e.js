// MAZE CHASE 3D — lõi MẪU 1e (29/9/2026): chép mc3d-1d.js + 4 ý thầy:
//   (1) ĐỔI NGƯỜI sau mỗi mạng mất (bị bắt / vào ô sai / dính bom): mỗi HS chơi 1 mạng ⇒ màn NEXT PLAYER đếm 3 giây, robot BAY VỀ
//       góc xuất phát, phi hành gia về giữa, HS mới nhận lại số bom đầu lượt · (2) sân xuất phát mở rộng 3×3 có chữ ANDREW STUDIO khắc
//       trên boong (mc3d-floor-1e.js) · (3) BOM đặt bằng nút giữa D-pad (hoặc Space/B): bom thành VẬT CẢN, robot đuổi tới sát bom ⇒ NỔ;
//       robot trong tầm vỡ tung thành xác cháy đen bốc khói nằm lại (mc3d-boom.js), không quay lại ở câu đó; người đứng sát cũng mất mạng;
//       bom nổ lan sang bom khác trong tầm · Options Bombs 0–10 (mỗi HS) + Bomb gift (cứ K câu đúng +1) · (4) nút chức năng ra NGOÀI
//       màn chơi (thanh dưới, kiểu Rocket Race).
// ---- ghi chú 1d: thầy chọn D-pad B (Ring = mặc định) + "làm sàn đẹp và chi tiết hơn,
//   sàn hiện tại trông giả quá" ⇒ sàn tàu vũ trụ PBR vẽ bằng mc3d-floor.js (màu + gồ ghề + độ bóng + đèn), vẽ lại mỗi câu.
// ---- ghi chú của 1c:
//   (1) 5 KIỂU D-PAD để chọn (Options ▸ D-pad style, hoặc ?dpad=glass|ring|keys|console|stick) ·
//   (2) chữ đáp án = BẢNG HOLOGRAM chiếu từ bệ lên, đáy bảng CAO HƠN đầu phi hành gia (hết cảnh người lẫn vào chữ);
//       tới bệ đúng: bảng lật ✓ + người nhảy mừng + tia sáng đưa người đi; bệ sai: bảng đỏ rung + người BỊ BẬT LÙI 1 ô ·
//   (3) sàn liền một mặt (bỏ chia ô), mép sàn có vách dày · (4) 10 MAP (mc3d-maps.js): hình trạm + kiểu mê cung + màu, mỗi câu một map.
// ---- ghi chú của 1b:
//   màu rõ ràng (sàn sáng · tường 1 họ xanh đậm · bệ vàng · địch đỏ/tím · người trắng-xanh) · phi hành gia + robot địch chi tiết hơn ·
//   chậm hơn nhiều (người 3 ô/s thay 5) · sáng hơn tổng thể. Mẫu 1/2/3 vẫn dùng mc3d.js (không đổi).
// Luật chép từ AWord `templates/maze-chase/maze-chase.js` (bản 2D đang LIVE) để sau này ghép vào AWord không lệch:
//   mê cung DFS + braid sinh MỖI câu · bệ đúng +1 điểm & sang câu · bệ sai ✗ mất tim + bệ bị loại ·
//   địch chạm ⇒ mất tim, văng về xuất phát, địch về góc xa, ân hạn 1,9 s · địch BFS đuổi + 22% ngẫu nhiên ·
//   Difficulty 1–10 ⇒ số địch (≤3→1, ≤6→2, ≤8→3, còn lại 4) + tốc độ địch (max(230, 400 − diff·14) ms/ô).
// Điều khiển (thầy chốt 29/9): phím mũi tên/WASD · D-pad sát mép màn · chạm/vuốt về PHÍA muốn đi so với nhân vật.
// Mọi hướng nhập vào là hướng TRÊN MÀN HÌNH; đổi sang hướng mê cung bằng cách chiếu 4 hướng quanh nhân vật lên màn
// ⇒ cùng một cách cho cả 3 góc máy (kể cả máy quay sau lưng xoay theo nhân vật).
// createMazeChase({ mount, view: "tilt" | "chase" | "top", questions, title })
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createMcSound } from "./mc3d-sound.js";
import { MAPS, genMap, makeDeck } from "./mc3d-maps.js";
import { createDeckPainter } from "./mc3d-floor-1e.js";
import { createBoomFX, makeBomb } from "./mc3d-boom.js";

const FONT = '"Baloo 2", system-ui, sans-serif';
const ASPECT = 16 / 10.5;                        // đúng khung act đơn của AWord
const COLS = 15, ROWS = 7, CELL = 4;             // lưới như bản 2D
const W = COLS * CELL, D = ROWS * CELL;
const WALL_T = 0.72, WALL_H = 1.6;
const PLAYER_SPEED = 3;                          // ô/giây (thầy 29/9: "quá nhanh, giảm khá nhiều"; mẫu 1 là 5, bản 2D 6,25)
const SPEED_SCALE = PLAYER_SPEED / 6.25;         // địch giữ đúng tỉ lệ tốc độ với người như bản 2D
const GRACE = 1.9, INVULN = 1.4, HOLD = 0.9, EJECT = 0.5;

const DIRS = {
  u: { dr: -1, dc: 0, opp: "d" }, d: { dr: 1, dc: 0, opp: "u" },
  l: { dr: 0, dc: -1, opp: "r" }, r: { dr: 0, dc: 1, opp: "l" },
};
const DK = ["u", "d", "l", "r"];
const ENEMY_SPOTS = [[0, 0], [ROWS - 1, COLS - 1], [0, COLS - 1], [ROWS - 1, 0]];
const SCREEN_VEC = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] };

const VIEWS = {
  tilt:  { label: "Chéo từ trên cao", kind: "fixed", dir: [0, 1.5, 1], fov: 32, labelY: 5.0, labelW: 1.8 },
  chase: { label: "Bám sau lưng", kind: "chase", overview: [0, 1.5, 1], fov: 52, back: 11, height: 11.5, ahead: 7, labelY: 4.6, labelW: 2.1, minimap: true },
  top:   { label: "Thẳng từ trên xuống", kind: "fixed", dir: [0, 1, 0.1], fov: 30, labelY: 1.3, labelW: 2.0 },
};
const DEFAULTS = { lives: 5, difficulty: 6, dpad: "r", dpadStyle: "ring", shuffle: true, bombs: 1, bombGift: 3 };
const SWAP_S = 3;                          // 1e: giây chờ đổi học sinh
const BLAST_R = 1.6 * 4, NEAR_R = 1.25 * 4; // tầm nổ hạ robot · tầm làm người mất mạng (đơn vị thế giới; ô = 4)
const BAR_H = 80;                          // thanh nút ngoài màn chơi (như Rocket Race)   // 1d: thầy chọn B · Ring
const DPAD_STYLES = ["glass", "ring", "keys", "console", "stick"];
const DPAD_STYLE_NAMES = { glass: "A · Glass", ring: "B · Ring", keys: "C · Keys", console: "D · Console", stick: "E · Stick" };
const DPAD_MODES = ["r", "l", "both", "off"];
const DPAD_NAMES = { r: "Right", l: "Left", both: "Both", off: "Off" };

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const ease = x => x * x * (3 - 2 * x);
const easeOutBack = x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const randi = n => Math.floor(Math.random() * n);
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = randi(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const key = (r, c) => r + "," + c;
const cellX = c => (c - (COLS - 1) / 2) * CELL;
const cellZ = r => (r - (ROWS - 1) / 2) * CELL;
const fmt = s => { s = Math.floor(s); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };

// ------------------------------------------------------------------ luật mê cung (chép bản 2D)
function genMaze() {
  const grid = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => ({ u: false, d: false, l: false, r: false, seen: false })));
  const inb = (r, c) => r >= 0 && r < ROWS && c >= 0 && c < COLS;
  const stack = [[randi(ROWS), randi(COLS)]];
  grid[stack[0][0]][stack[0][1]].seen = true;
  while (stack.length) {
    const [r, c] = stack[stack.length - 1];
    const opts = DK.filter(k => { const nr = r + DIRS[k].dr, nc = c + DIRS[k].dc; return inb(nr, nc) && !grid[nr][nc].seen; });
    if (!opts.length) { stack.pop(); continue; }
    const k = opts[randi(opts.length)], nr = r + DIRS[k].dr, nc = c + DIRS[k].dc;
    grid[r][c][k] = true; grid[nr][nc][DIRS[k].opp] = true; grid[nr][nc].seen = true;
    stack.push([nr, nc]);
  }
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {       // braid: mở thêm 1 tường ở mọi ngõ cụt
    const cl = grid[r][c];
    if (DK.filter(k => cl[k]).length > 1) continue;
    const cand = shuffle(["l", "r", "u", "d"].filter(k => inb(r + DIRS[k].dr, c + DIRS[k].dc) && !cl[k]));
    if (cand.length) { const k = cand[0]; cl[k] = true; grid[r + DIRS[k].dr][c + DIRS[k].dc][DIRS[k].opp] = true; }
  }
  return grid;
}
function bfsStep(grid, sr, sc, tr, tc) {
  if (sr === tr && sc === tc) return null;
  const prev = new Map(), seen = new Set([key(sr, sc)]), q = [[sr, sc]];
  while (q.length) {
    const [r, c] = q.shift();
    for (const k of DK) {
      if (!grid[r][c][k]) continue;
      const nr = r + DIRS[k].dr, nc = c + DIRS[k].dc, kk = key(nr, nc);
      if (seen.has(kk)) continue;
      seen.add(kk); prev.set(kk, key(r, c));
      if (nr === tr && nc === tc) {
        let cur = kk, parent = prev.get(cur);
        while (parent !== key(sr, sc)) { cur = parent; parent = prev.get(cur); }
        const [fr, fc] = cur.split(",").map(Number);
        return DK.find(d => sr + DIRS[d].dr === fr && sc + DIRS[d].dc === fc) || null;
      }
      q.push([nr, nc]);
    }
  }
  return null;
}
function pickSpots(n, sr, sc, grid, espots) {
  const all = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (!grid[r][c].on || grid[r][c].plaza) continue;              // 1c: map có ô trống (không sàn) · 1e: sân xuất phát
    const d = Math.abs(r - sr) + Math.abs(c - sc);
    // khác bản 2D: không đặt bệ sát góc địch xuất phát (địch về góc sau mỗi lần bắt ⇒ bệ cạnh góc bị "canh" mãi)
    const nearEnemy = espots.some(([er, ec]) => Math.abs(r - er) + Math.abs(c - ec) < 3);
    if (d >= 3 && !nearEnemy) all.push([r, c, d]);
  }
  shuffle(all);
  const chosen = [];
  for (const s of all) { if (chosen.length >= n) break; if (chosen.every(k => Math.abs(k[0] - s[0]) + Math.abs(k[1] - s[1]) >= 4)) chosen.push(s); }
  for (const s of all) { if (chosen.length >= n) break; if (!chosen.includes(s) && chosen.every(k => Math.abs(k[0] - s[0]) + Math.abs(k[1] - s[1]) >= 2)) chosen.push(s); }
  while (chosen.length < n && all.length) chosen.push(all[chosen.length]);
  return chosen.map(s => [s[0], s[1]]);
}

// ------------------------------------------------------------------ HUD
const IC = {
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path class="w" d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/><path class="x" d="m16 9 6 6m0-6-6 6"/></svg>',
  full: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
};
const BOMB_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="10" cy="14" r="7"/><rect x="12.2" y="5.6" width="4" height="3" rx=".8" transform="rotate(45 14.2 7.1)"/><path d="M16.8 4.2c.8-1.4 2.2-1.9 3.4-1.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="7.6" cy="11.6" r="1.6" fill="#fff" opacity=".45"/></svg>';
const DPAD = `<i class="base"></i><i class="knob"></i><button class="u" data-d="u">▲</button><button class="l" data-d="l">◀</button><button class="hub" data-bomb="1" title="Bomb">${BOMB_SVG}<b>1</b></button><button class="r" data-d="r">▶</button><button class="d" data-d="d">▼</button>`;
const HUD_HTML = `
<div class="mc-stage">
  <canvas class="mc-gl"></canvas>
  <div class="mc-top" hidden><div class="mc-clock">0:00</div><div class="mc-q"><span></span></div>
    <div class="mc-right"><div class="mc-bombs">${BOMB_SVG}<b>1</b></div><div class="mc-lives"></div><div class="mc-score">✓ <b>0</b></div></div></div>
  <canvas class="mc-mini" hidden></canvas>
  <div class="mc-bigq" hidden><b class="mc-mapname"></b><span></span></div>
  <div class="mc-count" hidden></div>
  <div class="mc-swap" hidden><div class="mc-swap-k">NEXT PLAYER</div><div class="mc-swap-n">3</div><div class="mc-swap-s"></div></div>
  <div class="mc-dpad is-l" hidden>${DPAD}</div>
  <div class="mc-dpad is-r" hidden>${DPAD}</div>
  <div class="mc-ov mc-ov-start"><div class="mc-card">
    <div class="mc-kicker"></div><h1>MAZE CHASE</h1><p class="mc-sub"></p>
    <p class="mc-how">Run to the correct answer, whilst avoiding the enemies.</p>
    <button class="mc-big mc-go">START</button>
    <button class="mc-link mc-optbtn">Options</button>
    <div class="mc-opts" hidden>
      <div class="mc-opt" data-k="lives"><span>Lives</span><button data-s="-1">−</button><output></output><button data-s="1">+</button></div>
      <div class="mc-opt" data-k="difficulty"><span>Difficulty</span><button data-s="-1">−</button><output></output><button data-s="1">+</button></div>
      <div class="mc-opt" data-k="dpadStyle"><span>D-pad style</span><button data-s="-1">‹</button><output></output><button data-s="1">›</button></div>
      <div class="mc-opt" data-k="dpad"><span>D-pad</span><button data-s="-1">‹</button><output></output><button data-s="1">›</button></div>
      <div class="mc-opt" data-k="bombs"><span>Bombs (each player)</span><button data-s="-1">−</button><output></output><button data-s="1">+</button></div>
      <div class="mc-opt" data-k="bombGift"><span>Bomb gift (every N correct)</span><button data-s="-1">−</button><output></output><button data-s="1">+</button></div>
      <div class="mc-opt" data-k="shuffle"><span>Shuffle questions</span><button data-s="-1">‹</button><output></output><button data-s="1">›</button></div>
    </div>
  </div></div>
  <div class="mc-ov mc-ov-pause" hidden><div class="mc-card"><h2>Paused</h2>
    <button class="mc-big mc-resume">Resume</button><button class="mc-mid mc-restart">Start again</button><button class="mc-link mc-tomenu">Back to start screen</button></div></div>
  <div class="mc-ov mc-ov-end" hidden><div class="mc-card">
    <div class="mc-kicker mc-end-title"></div><div class="mc-end-score"></div><p class="mc-sub mc-end-sub"></p>
    <button class="mc-big mc-again">Start again</button><button class="mc-link mc-showans">Show answers</button>
    <div class="mc-ans" hidden></div>
  </div></div>
</div>
<div class="mc-outbar">
  <button class="mc-tool mc-menu" title="Menu">${IC.menu}<span>MENU</span></button>
  <button class="mc-tool mc-sound" title="Sound">${IC.sound}<span>SOUND</span></button>
  <button class="mc-tool mc-full" title="Full screen">${IC.full}<span>FULL SCREEN</span></button>
</div>`;

// ------------------------------------------------------------------ vật liệu vẽ bằng canvas
function canvasTex(w, h, draw, srgb = true) {
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  draw(cv.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(cv);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
// 1c: sàn LIỀN một mặt theo hình map (thầy: "sàn chia ngăn thành các ô trông rất rối mắt") — không kẻ ô;
// chỉ có vân kim loại mờ + tối dần sát mép trống. Ô không có sàn = trong suốt (alphaTest) ⇒ thấy vũ trụ bên dưới.
const FLOOR_P = 96;
let _noise = null;
function floorNoise() {
  if (_noise) return _noise;
  const n = document.createElement("canvas"); n.width = 60; n.height = 28;
  const g = n.getContext("2d");
  for (let y = 0; y < 28; y++) for (let x = 0; x < 60; x++) { const v = 118 + Math.random() * 20; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x, y, 1, 1); }
  return (_noise = n);
}
function paintFloor(cv, grid, theme) {
  const P = FLOOR_P, w = COLS * P, h = ROWS * P;
  cv.width = w; cv.height = h;
  const g = cv.getContext("2d"); g.clearRect(0, 0, w, h);
  const on = (r, c) => r >= 0 && r < ROWS && c >= 0 && c < COLS && grid[r][c].on;
  const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, theme.floor[0]); gr.addColorStop(1, theme.floor[1]);
  g.fillStyle = gr;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (on(r, c)) g.fillRect(c * P - 0.5, r * P - 0.5, P + 1, P + 1);
  g.save(); g.globalCompositeOperation = "source-atop";
  g.globalAlpha = 0.16; g.filter = "blur(6px)"; g.drawImage(floorNoise(), 0, 0, w, h); g.filter = "none";
  g.globalAlpha = 0.05; g.fillStyle = "#fff";
  for (let y = 0; y < h; y += 5) if (Math.random() < 0.5) g.fillRect(0, y, w, 1);           // vân chải kim loại, rất mờ
  g.globalAlpha = 1;
  const edge = (x, y, dx, dy, len, horiz) => {           // tối dần sát mép sàn
    const sh = horiz ? g.createLinearGradient(x, y, x, y + dy) : g.createLinearGradient(x, y, x + dx, y);
    sh.addColorStop(0, "rgba(0,0,0,.35)"); sh.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = sh;
    if (horiz) g.fillRect(x, Math.min(y, y + dy), len, Math.abs(dy)); else g.fillRect(Math.min(x, x + dx), y, Math.abs(dx), len);
  };
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (!on(r, c)) continue;
    const x = c * P, y = r * P;
    if (!on(r - 1, c)) edge(x, y, 0, 26, P, true);
    if (!on(r + 1, c)) edge(x, y + P, 0, -26, P, true);
    if (!on(r, c - 1)) edge(x, y, 26, 0, P, false);
    if (!on(r, c + 1)) edge(x + P, y, -26, 0, P, false);
  }
  g.restore();
}
function solarTex() {
  return canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = "#0a1330"; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) {
      const gr = g.createLinearGradient(x, y, x + 32, y + 32); gr.addColorStop(0, "#1c3b8a"); gr.addColorStop(1, "#10245e");
      g.fillStyle = gr; g.fillRect(x + 2, y + 2, 28, 28);
    }
    g.fillStyle = "#c0c8d8"; g.fillRect(0, h / 2 - 3, w, 6);
  });
}
function planetTex() {
  return canvasTex(1024, 512, (g, w, h) => {
    const bands = ["#3b1d6e", "#5a2a8c", "#7a3fa8", "#4b2a7c", "#9a5ab8", "#5d2f86", "#3a1f5c", "#6f3a9a"];
    for (let y = 0; y < h; y++) {
      const t = y / h, i = Math.floor((t * 7 + Math.sin(t * 40) * 0.25 + 8) % 8);
      g.fillStyle = bands[i]; g.fillRect(0, y, w, 1);
    }
    g.globalAlpha = 0.18;
    for (let i = 0; i < 260; i++) { g.fillStyle = Math.random() < 0.5 ? "#e7c8ff" : "#241040"; g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 30 + Math.random() * 120, 3 + Math.random() * 7, 0, 0, 7); g.fill(); }
  });
}
function glowTex(inner = "rgba(255,255,255,1)", outer = "rgba(255,255,255,0)") {
  return canvasTex(128, 128, (g) => {
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, inner); gr.addColorStop(1, outer);
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  });
}
const LABEL_STYLE = {
  idle: { bg: ["rgba(26,32,64,.95)", "rgba(14,18,40,.95)"], line: "#ffc53d", glow: "rgba(255,197,61,.7)", mark: "" },
  ok:   { bg: ["rgba(20,90,50,.95)", "rgba(10,60,32,.95)"], line: "#86efac", glow: "rgba(74,222,128,.9)", mark: "✓ " },
  bad:  { bg: ["rgba(110,20,30,.95)", "rgba(70,10,18,.95)"], line: "#fca5a5", glow: "rgba(248,113,113,.9)", mark: "✗ " },
};
function drawLabel(cv, text, style) {
  const g = cv.getContext("2d"), w = cv.width, h = cv.height, S = LABEL_STYLE[style];
  g.clearRect(0, 0, w, h);
  g.save(); g.shadowColor = S.glow; g.shadowBlur = 26;
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, S.bg[0]); gr.addColorStop(1, S.bg[1]);
  g.fillStyle = gr; g.beginPath(); g.roundRect(18, 18, w - 36, h - 36, 34); g.fill(); g.restore();
  g.lineWidth = 7; g.strokeStyle = S.line; g.beginPath(); g.roundRect(18, 18, w - 36, h - 36, 34); g.stroke();
  const t = S.mark + text;
  let fs = 104;
  g.font = `800 ${fs}px ${FONT}`;
  while (g.measureText(t).width > w - 90 && fs > 30) { fs -= 3; g.font = `800 ${fs}px ${FONT}`; }
  g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
  g.shadowColor = "rgba(0,0,0,.5)"; g.shadowBlur = 8; g.shadowOffsetY = 3;
  g.fillText(t, w / 2, h / 2 + fs * 0.06);
}

// ------------------------------------------------------------------ shader
const SKY_SHADER = {
  uniforms: { uTime: { value: 0 } },
  vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }`,
  fragmentShader: `
    varying vec3 vDir; uniform float uTime;
    float h(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
    float n(vec3 x){ vec3 i = floor(x), f = fract(x); f = f*f*(3.0-2.0*f);
      return mix(mix(mix(h(i+vec3(0,0,0)),h(i+vec3(1,0,0)),f.x), mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),
                 mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x), mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y), f.z); }
    float fbm(vec3 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++){ s += a * n(p); p *= 2.03; a *= 0.5; } return s; }
    void main(){
      vec3 d = normalize(vDir);
      float y = d.y * 0.5 + 0.5;
      vec3 col = mix(vec3(0.035, 0.02, 0.09), vec3(0.11, 0.04, 0.22), smoothstep(0.1, 0.9, y));
      float neb = fbm(d * 2.4 + vec3(0.0, 0.0, uTime * 0.004));
      float neb2 = fbm(d * 5.0 + vec3(3.1, 1.7, 0.0));
      col += vec3(0.42, 0.10, 0.55) * pow(smoothstep(0.42, 0.85, neb), 1.6) * 0.9;
      col += vec3(0.08, 0.22, 0.55) * pow(smoothstep(0.5, 0.9, neb2), 2.0) * 0.8;
      col += vec3(0.6, 0.25, 0.7) * pow(max(0.0, 1.0 - abs(d.y + 0.15) * 3.0), 3.0) * 0.12;
      gl_FragColor = vec4(max(col, vec3(0.0)), 1.0);
    }`,
};
const ATMO_SHADER = {
  uniforms: { uColor: { value: new THREE.Color(0xb36bff) } },
  vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `varying vec3 vN; varying vec3 vV; uniform vec3 uColor; void main(){ float f = pow(clamp(1.0 - abs(dot(vN, vV)), 0.0, 1.0), 3.0); gl_FragColor = vec4(uColor * f * 1.6, f); }`,
};
const BEAM_SHADER = {
  uniforms: { uColor: { value: new THREE.Color(0x38bdf8) }, uOpacity: { value: 1 }, uTime: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `varying vec2 vUv; uniform vec3 uColor; uniform float uOpacity; uniform float uTime;
    void main(){ float a = pow(1.0 - vUv.y, 1.7) * (0.6 + 0.4 * sin(vUv.y * 22.0 - uTime * 5.0)) * uOpacity; gl_FragColor = vec4(uColor * a, a); }`,
};
const GRADE_SHADER = {
  uniforms: { tDiffuse: { value: null }, uVig: { value: 0.18 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uVig; varying vec2 vUv;
    void main(){ vec4 c = texture2D(tDiffuse, vUv); vec3 col = c.rgb;
      if (!(col.r == col.r) || !(col.g == col.g) || !(col.b == col.b)) col = vec3(0.0);
      float l = dot(col, vec3(0.299, 0.587, 0.114)); col = mix(vec3(l), col, 1.08);
      vec2 q = vUv - 0.5; col *= 1.0 - uVig * dot(q, q) * 2.2;
      gl_FragColor = vec4(max(col, vec3(0.0)), c.a); }`,
};
const NAN_SHADER = {   // bẫy myGame: 1 điểm ảnh NaN bị bloom loang thành mảng đen ⇒ gột trước bloom
  uniforms: { tDiffuse: { value: null } },
  vertexShader: GRADE_SHADER.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse; varying vec2 vUv; void main(){ vec4 c = texture2D(tDiffuse, vUv);
    if (!(c.r == c.r) || !(c.g == c.g) || !(c.b == c.b) || c.r > 1e4 || c.g > 1e4 || c.b > 1e4) c = vec4(0.0, 0.0, 0.0, 1.0); gl_FragColor = c; }`,
};

// ------------------------------------------------------------------ nhân vật
function std(o) { return new THREE.MeshStandardMaterial({ envMapIntensity: 0.55, ...o }); }
// ---- MẪU 1b: phi hành gia + robot địch chi tiết hơn (thầy 29/9: "hơi xấu, cần chi tiết hơn nữa")
function makeAstronaut() {
  const g = new THREE.Group(), body = new THREE.Group();
  g.add(body);
  const suit = std({ color: 0xf1f3f7, roughness: 0.62, metalness: 0.02, envMapIntensity: 0.4 });
  const fabric = std({ color: 0xc9cfda, roughness: 0.8, metalness: 0 });
  const dark = std({ color: 0x2b3345, roughness: 0.45, metalness: 0.7 });
  const blue = std({ color: 0x2563eb, roughness: 0.4, metalness: 0.2, emissive: 0x1d4ed8, emissiveIntensity: 0.25 });
  const gold = std({ color: 0xffc861, metalness: 1, roughness: 0.14, envMapIntensity: 1.6 });
  const glass = std({ color: 0x0f172a, metalness: 0.9, roughness: 0.1, envMapIntensity: 1.4 });
  const lamp = std({ color: 0xffffff, emissive: 0xfff4d6, emissiveIntensity: 2.4 });
  const mk = (geo, mat, x, y, z, parent = body, cast = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; parent.add(m); return m; };

  // thân
  const torso = mk(new THREE.CapsuleGeometry(0.44, 0.34, 8, 20), suit, 0, 1.02, 0); torso.scale.z = 0.86;
  const belt = mk(new THREE.TorusGeometry(0.42, 0.065, 10, 32), dark, 0, 0.78, 0); belt.rotation.x = Math.PI / 2; belt.scale.y = 0.86;
  mk(new THREE.BoxGeometry(0.16, 0.1, 0.06), gold, 0, 0.78, 0.37);
  const collar = mk(new THREE.TorusGeometry(0.33, 0.08, 10, 32), dark, 0, 1.4, 0); collar.rotation.x = Math.PI / 2;
  // bảng điều khiển ngực
  mk(new THREE.BoxGeometry(0.44, 0.28, 0.07), dark, 0, 1.1, 0.37);
  mk(new THREE.BoxGeometry(0.2, 0.1, 0.02), std({ color: 0x0b3b4a, emissive: 0x22d3ee, emissiveIntensity: 1.6 }), -0.08, 1.15, 0.41, body, false);
  [[0xef4444, 0.1], [0x22c55e, 0.16], [0xfacc15, 0.22]].forEach(([c, x]) =>
    mk(new THREE.CylinderGeometry(0.028, 0.028, 0.03, 12), std({ color: c, emissive: c, emissiveIntensity: 1.4 }), x - 0.06, 1.05, 0.41, body, false).rotation.x = Math.PI / 2);
  mk(new THREE.BoxGeometry(0.14, 0.05, 0.02), blue, -0.18, 1.3, 0.35, body, false);   // phù hiệu vai trái
  // mũ
  const helmet = new THREE.Group(); helmet.position.y = 1.8; body.add(helmet);
  mk(new THREE.SphereGeometry(0.5, 32, 24), suit, 0, 0, 0, helmet);
  mk(new THREE.SphereGeometry(0.505, 32, 16, Math.PI / 2 - 1.0, 2.0, 0.85, 1.15), gold, 0, 0, 0, helmet, false);
  [-1, 1].forEach(s => {
    const ear = mk(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 18), fabric, s * 0.49, 0.02, 0, helmet); ear.rotation.z = Math.PI / 2;
    const l = mk(new THREE.CylinderGeometry(0.06, 0.07, 0.12, 12), lamp, s * 0.43, 0.24, 0.2, helmet, false); l.rotation.x = Math.PI / 2;
  });
  mk(new THREE.CylinderGeometry(0.018, 0.018, 0.34, 6), dark, 0.2, 0.55, -0.12, helmet);
  const tip = mk(new THREE.SphereGeometry(0.055, 12, 8), std({ color: 0xff4d6d, emissive: 0xff4d6d, emissiveIntensity: 3 }), 0.2, 0.74, -0.12, helmet, false);
  // ba lô
  mk(new THREE.BoxGeometry(0.68, 0.78, 0.32), suit, 0, 1.08, -0.46);
  mk(new THREE.BoxGeometry(0.5, 0.5, 0.04), fabric, 0, 1.12, -0.63);
  for (let i = 0; i < 3; i++) mk(new THREE.BoxGeometry(0.34, 0.035, 0.03), dark, 0, 1.28 - i * 0.09, -0.66, body, false);
  [-1, 1].forEach(s => { const t = mk(new THREE.CylinderGeometry(0.1, 0.1, 0.62, 16), blue, s * 0.37, 1.1, -0.5); t.material = blue; });
  const jets = [-0.16, 0.16].map(x => mk(new THREE.CylinderGeometry(0.08, 0.12, 0.16, 14), std({ color: 0x1e293b, emissive: 0x60a5fa, emissiveIntensity: 0 }), x, 0.64, -0.5));
  // tay: vai → khuỷu → găng
  const arms = [-1, 1].map(s => {
    const pv = new THREE.Group(); pv.position.set(s * 0.5, 1.3, 0); body.add(pv);
    mk(new THREE.SphereGeometry(0.17, 16, 12), suit, 0, 0, 0, pv);
    const up = mk(new THREE.CapsuleGeometry(0.12, 0.22, 4, 12), suit, s * 0.04, -0.22, 0, pv); up.rotation.z = s * 0.12;
    mk(new THREE.TorusGeometry(0.12, 0.03, 6, 16), blue, s * 0.06, -0.3, 0, pv).rotation.x = Math.PI / 2;
    mk(new THREE.CapsuleGeometry(0.11, 0.2, 4, 12), fabric, s * 0.07, -0.5, 0.02, pv);
    mk(new THREE.SphereGeometry(0.12, 14, 10), dark, s * 0.08, -0.7, 0.03, pv);
    return pv;
  });
  // chân: hông → gối → ủng
  const legs = [-1, 1].map(s => {
    const pv = new THREE.Group(); pv.position.set(s * 0.2, 0.66, 0); body.add(pv);
    mk(new THREE.CapsuleGeometry(0.15, 0.16, 4, 12), suit, 0, -0.14, 0, pv);
    mk(new THREE.SphereGeometry(0.1, 12, 8), blue, 0, -0.3, 0.1, pv);
    mk(new THREE.CapsuleGeometry(0.13, 0.12, 4, 12), fabric, 0, -0.42, 0, pv);
    const boot = mk(new THREE.BoxGeometry(0.26, 0.14, 0.36), dark, 0, -0.6, 0.05, pv);
    mk(new THREE.BoxGeometry(0.27, 0.04, 0.37), blue, 0, -0.52, 0.05, pv, false);
    void boot;
    return pv;
  });
  g.scale.setScalar(1.75);
  return { g, body, legs, arms, jets, tip };
}
function makeDrone(color) {
  const g = new THREE.Group(), body = new THREE.Group();
  g.add(body);
  const C = new THREE.Color(color);
  const hull = std({ color: C, metalness: 0.35, roughness: 0.38, envMapIntensity: 0.35 });
  const dark = std({ color: 0x1a1d2b, metalness: 0.75, roughness: 0.35 });
  const steel = std({ color: 0x8c93a8, metalness: 0.85, roughness: 0.28 });
  const glowC = C.clone().lerp(new THREE.Color(0xffffff), 0.35);
  const glow = std({ color: glowC, emissive: glowC, emissiveIntensity: 2.6 });
  const mk = (geo, mat, x, y, z, parent = body, cast = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; parent.add(m); return m; };

  // vỏ 2 nửa, khe sáng giữa
  mk(new THREE.SphereGeometry(0.68, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), hull, 0, 0.06, 0);
  mk(new THREE.SphereGeometry(0.64, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), dark, 0, -0.04, 0);
  const band = mk(new THREE.TorusGeometry(0.66, 0.045, 8, 40), glow, 0, 0.01, 0, body, false); band.rotation.x = Math.PI / 2;
  // tấm giáp trên + vạch
  const crown = mk(new THREE.CylinderGeometry(0.3, 0.42, 0.16, 6), dark, 0, 0.68, 0); crown.rotation.y = Math.PI / 6;
  const collar = mk(new THREE.TorusGeometry(0.5, 0.05, 8, 36), steel, 0, 0.5, 0, body, false); collar.rotation.x = Math.PI / 2;
  for (let i = 0; i < 4; i++) mk(new THREE.BoxGeometry(0.03, 0.2, 0.02), dark, -0.3 + i * 0.07, 0.3, -0.63, body, false);   // khe tản nhiệt sau lưng
  // mắt: khe ngang phát sáng trên mặt nạ tối
  mk(new THREE.SphereGeometry(0.695, 32, 12, Math.PI / 2 - 0.85, 1.7, 1.2, 0.5), dark, 0, 0.06, 0, body, false);
  const eye = mk(new THREE.CapsuleGeometry(0.06, 0.5, 4, 12), std({ color: glowC, emissive: glowC, emissiveIntensity: 3.2 }), 0, 0.2, 0.64, body, false);
  eye.rotation.z = Math.PI / 2; eye.scale.z = 0.45;
  const pupil = mk(new THREE.SphereGeometry(0.1, 14, 10), std({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 3 }), 0, 0.2, 0.68, body, false);
  // ăng-ten
  mk(new THREE.CylinderGeometry(0.02, 0.03, 0.4, 6), steel, 0.12, 0.95, -0.05);
  const tip = mk(new THREE.SphereGeometry(0.06, 10, 8), glow, 0.12, 1.16, -0.05, body, false);
  // tay kẹp 2 bên
  const arms = [-1, 1].map(s => {
    const pv = new THREE.Group(); pv.position.set(s * 0.66, -0.02, 0.05); body.add(pv);
    mk(new THREE.SphereGeometry(0.13, 14, 10), dark, 0, 0, 0, pv);
    const a1 = mk(new THREE.CylinderGeometry(0.055, 0.055, 0.34, 8), steel, s * 0.14, -0.14, 0.06, pv); a1.rotation.z = s * 0.8;
    mk(new THREE.SphereGeometry(0.075, 10, 8), dark, s * 0.27, -0.26, 0.1, pv);
    const a2 = mk(new THREE.CylinderGeometry(0.045, 0.045, 0.3, 8), steel, s * 0.3, -0.4, 0.2, pv); a2.rotation.x = 0.7;
    mk(new THREE.SphereGeometry(0.07, 10, 8), dark, s * 0.3, -0.52, 0.31, pv);
    [-1, 1].forEach(k => { const cl = mk(new THREE.ConeGeometry(0.035, 0.18, 6), steel, s * 0.3 + k * 0.045, -0.56, 0.4, pv); cl.rotation.x = Math.PI / 2 + 0.5; cl.rotation.z = -k * 0.3; });
    return pv;
  });
  // vây sau
  [-1, 1].forEach(s => { const f = mk(new THREE.BoxGeometry(0.05, 0.3, 0.34), hull, s * 0.24, 0.36, -0.6); f.rotation.z = s * 0.3; });
  // động cơ dưới + lửa
  mk(new THREE.CylinderGeometry(0.26, 0.2, 0.2, 18), dark, 0, -0.66, 0);
  const noz = mk(new THREE.TorusGeometry(0.2, 0.04, 8, 24), glow, 0, -0.76, 0, body, false); noz.rotation.x = Math.PI / 2;
  const flame = mk(new THREE.ConeGeometry(0.19, 0.6, 18, 1, true), new THREE.MeshBasicMaterial({ color: glowC, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false }), 0, -1.06, 0, body, false);
  flame.rotation.x = Math.PI;
  g.scale.setScalar(1.6);
  return { g, body, arms, flame, tip, pupil };
}

// ================================================================== GAME
export async function createMazeChase({ mount, view = "tilt", questions, title = "" }) {
  const V = VIEWS[view] || VIEWS.tilt;
  const opt = { ...DEFAULTS };
  const sfx = createMcSound();
  try { await document.fonts.load(`800 60px ${FONT}`); await document.fonts.load(`700 60px ${FONT}`); } catch (e) { /* font dự phòng */ }

  mount.innerHTML = HUD_HTML;
  const stage = mount.querySelector(".mc-stage");
  const $ = s => stage.querySelector(s);
  const canvas = $(".mc-gl");
  const topEl = $(".mc-top"), clockEl = $(".mc-clock"), qEl = $(".mc-q"), qSpan = $(".mc-q span"), livesEl = $(".mc-lives"), scoreEl = $(".mc-score b");
  const bigq = $(".mc-bigq"), countEl = $(".mc-count"), mini = $(".mc-mini"), bar = { hidden: false };   // 1e: thanh nút ở ngoài, luôn hiện
  const swapEl = $(".mc-swap"), swapN = $(".mc-swap-n"), swapS = $(".mc-swap-s"), bombsEl = $(".mc-bombs");
  const $$ = s => mount.querySelector(s);
  const dpads = { l: $(".mc-dpad.is-l"), r: $(".mc-dpad.is-r") };
  const ovStart = $(".mc-ov-start"), ovPause = $(".mc-ov-pause"), ovEnd = $(".mc-ov-end");
  $(".mc-kicker").textContent = "Maze chase 3D · " + V.label;
  $(".mc-sub").textContent = `${questions.length} questions${title ? " · " + title : ""}`;

  // ---------------------------------------------------------------- renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  const PR = Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(PR);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(V.fov, ASPECT, 0.3, 5000);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  let composer = null, stageW = 1, stageH = 1;
  function fit() {
    const Wn = window.innerWidth, Hn = window.innerHeight - BAR_H;          // 1e: chừa thanh nút bên dưới
    let w = Wn, h = Wn / ASPECT;
    if (h > Hn) { h = Hn; w = h * ASPECT; }
    stageW = Math.floor(w); stageH = Math.floor(h);
    stage.style.width = stageW + "px"; stage.style.height = stageH + "px";
    renderer.setSize(stageW, stageH, false);
    if (composer) { composer.setPixelRatio(PR); composer.setSize(stageW, stageH); }
    const r = mini.getBoundingClientRect();
    mini.width = Math.max(2, Math.round(r.width * PR)); mini.height = Math.max(2, Math.round(r.height * PR));
    miniBase = null;
  }
  let miniBase = null;
  window.addEventListener("resize", fit);
  document.addEventListener("fullscreenchange", fit);

  composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 }));
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new ShaderPass(NAN_SHADER));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.32, 0.4, 0.95);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  composer.addPass(new ShaderPass(GRADE_SHADER));
  fit();

  // ---------------------------------------------------------------- vũ trụ
  const sky = new THREE.Mesh(new THREE.SphereGeometry(2000, 48, 24), new THREE.ShaderMaterial({ ...SKY_SHADER, side: THREE.BackSide, depthWrite: false }));
  sky.renderOrder = -10; scene.add(sky);
  function stars(n, size, rad) {
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(rad);
      pos.set([v.x, v.y, v.z], i * 3);
      const c = new THREE.Color().setHSL(0.55 + Math.random() * 0.25, 0.5, 0.75 + Math.random() * 0.25);
      col.set([c.r, c.g, c.b], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const p = new THREE.Points(geo, new THREE.PointsMaterial({ size, sizeAttenuation: false, vertexColors: true, map: glowTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    p.renderOrder = -9; scene.add(p); return p;
  }
  const starsA = stars(2600, 2.2 * PR, 1500), starsB = stars(260, 4.5 * PR, 1400);
  const planet = new THREE.Mesh(new THREE.SphereGeometry(170, 64, 48), std({ map: planetTex(), roughness: 0.85, metalness: 0, envMapIntensity: 0.2 }));
  planet.position.set(-300, -160, -640); planet.rotation.z = 0.35; scene.add(planet);
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(182, 48, 32), new THREE.ShaderMaterial({ ...ATMO_SHADER, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide }));
  atmo.position.copy(planet.position); scene.add(atmo);
  const moon = new THREE.Mesh(new THREE.SphereGeometry(46, 40, 30), std({ color: 0x5d7bd8, roughness: 0.7, emissive: 0x0a1540, emissiveIntensity: 0.4 }));
  moon.position.set(460, 90, -980); scene.add(moon);
  const ringM = new THREE.Mesh(new THREE.RingGeometry(62, 96, 64), new THREE.MeshBasicMaterial({ color: 0x9fb7ff, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }));
  ringM.position.copy(moon.position); ringM.rotation.set(1.2, 0.3, 0.2); scene.add(ringM);
  const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex("rgba(255,220,180,1)", "rgba(255,120,200,0)"), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  sun.position.set(900, 420, -1500); sun.scale.setScalar(520); scene.add(sun);

  // ánh sáng
  scene.add(new THREE.HemisphereLight(0xc8d4ff, 0x2e2a48, 0.75));
  const sunL = new THREE.DirectionalLight(0xfff1e0, 2.6);
  sunL.position.set(26, 50, 22); sunL.castShadow = true;
  sunL.shadow.mapSize.set(2048, 2048);
  Object.assign(sunL.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 140 });
  sunL.shadow.bias = -0.0006; sunL.shadow.normalBias = 0.03;
  scene.add(sunL);
  const rim = new THREE.DirectionalLight(0xc084fc, 0.9); rim.position.set(-30, 20, -40); scene.add(rim);
  const graze = new THREE.DirectionalLight(0xdbe7ff, 0.7); graze.position.set(-40, 12, 30); scene.add(graze);   // 1d: nắng xiên thấp làm nổi gân/rãnh sàn

  // ---------------------------------------------------------------- trạm vũ trụ
  const station = new THREE.Group(); scene.add(station);
  const metal = std({ color: 0x2a3148, metalness: 0.8, roughness: 0.4 });
  const under = new THREE.Mesh(new THREE.CylinderGeometry(D * 0.42, D * 0.2, 6, 8), std({ color: 0x1c2133, metalness: 0.8, roughness: 0.5 }));
  under.position.y = -4.4; under.rotation.y = Math.PI / 8; under.scale.x = 2.1;   // 1c: bỏ — map có ô trống thì lộ khối tối
  // 1d: sàn PBR — 4 lớp vẽ bằng canvas (mc3d-floor.js)
  const deck = createDeckPainter(COLS, ROWS), dc = deck.canvases;
  const deckTex = k => { const t = new THREE.CanvasTexture(dc[k]); t.anisotropy = 16; if (k === "color" || k === "emit") t.colorSpace = THREE.SRGBColorSpace; return t; };
  const floorTex = deckTex("color"), floorNrm = deckTex("normal"), floorRgh = deckTex("rough"), floorEmi = deckTex("emit");
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), std({
    map: floorTex, alphaTest: 0.5, normalMap: floorNrm, normalScale: new THREE.Vector2(1.3, 1.3),
    roughnessMap: floorRgh, roughness: 1, metalness: 0.5, emissiveMap: floorEmi, emissive: 0xffffff, emissiveIntensity: 1.6, envMapIntensity: 0.55 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = 0.005; floor.receiveShadow = true; station.add(floor);
  const floorBot = new THREE.Mesh(new THREE.PlaneGeometry(W, D), std({ map: floorTex, alphaTest: 0.5, color: 0x3a3f50, side: THREE.DoubleSide, metalness: 0.6, roughness: 0.5 }));
  floorBot.rotation.x = -Math.PI / 2; floorBot.position.y = -1.2; station.add(floorBot);
  const solar = solarTex();
  [-1, 1].forEach(s => {
    const truss = new THREE.Mesh(new THREE.BoxGeometry(10, 0.5, 0.8), metal); truss.position.set(s * (W / 2 + 6.6), -0.8, 0); station.add(truss);
    for (const z of [-D * 0.28, D * 0.28]) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(16, 0.18, 11), std({ map: solar, metalness: 0.85, roughness: 0.22, envMapIntensity: 1.1 }));
      p.position.set(s * (W / 2 + 13), -0.9, z); p.rotation.x = s * 0.12; p.castShadow = true; station.add(p);
    }
  });
  const beacons = [];

  // ---------------------------------------------------------------- tường (InstancedMesh, dựng lại MỖI câu)
  const MAXW = (ROWS + 1) * COLS + (COLS + 1) * ROWS, MAXP = (ROWS + 1) * (COLS + 1);
  const boxGeo = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  const wallMesh = new THREE.InstancedMesh(boxGeo, std({ color: 0x1745c8, metalness: 0.1, roughness: 0.45, envMapIntensity: 0.1 }), MAXW);
  const capMesh = new THREE.InstancedMesh(boxGeo, std({ color: 0x1f5fff, emissive: 0x2f7bff, emissiveIntensity: 0.55, roughness: 0.35, envMapIntensity: 0.1 }), MAXW);
  const postMesh = new THREE.InstancedMesh(boxGeo, std({ color: 0x1238a8, metalness: 0.1, roughness: 0.45, envMapIntensity: 0.1 }), MAXP);
  const postCap = new THREE.InstancedMesh(boxGeo, std({ color: 0x0b2a6b, emissive: 0x60a5fa, emissiveIntensity: 1.1 }), MAXP);
  [wallMesh, postMesh].forEach(m => { m.castShadow = true; m.receiveShadow = true; });
  const skirtMesh = new THREE.InstancedMesh(boxGeo, std({ color: 0x2a3148, metalness: 0.7, roughness: 0.4 }), MAXW);
  skirtMesh.receiveShadow = true;
  [wallMesh, capMesh, postMesh, postCap, skirtMesh].forEach(m => { m.count = 0; m.frustumCulled = false; station.add(m); });
  const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _q = new THREE.Quaternion();
  let walls = [], posts = [];
  function applyTheme(th) {
    wallMesh.material.color.setHex(th.wall); capMesh.material.color.setHex(th.cap); capMesh.material.emissive.setHex(th.capE);
    postMesh.material.color.setHex(th.post); postCap.material.emissive.setHex(th.postE);
  }
  const wallAnim = { dir: 0, t: 0, ox: 0, oz: 0 };
  function layoutWalls(grid) {
    walls = []; posts = [];
    const postSet = new Set();
    const addPost = (r, c) => { const k = key(r, c); if (!postSet.has(k)) { postSet.add(k); posts.push({ x: (c - COLS / 2) * CELL, z: (r - ROWS / 2) * CELL }); } };
    const on = (r, c) => r >= 0 && r < ROWS && c >= 0 && c < COLS && grid[r][c].on;
    const skirts = [];
    for (let r = 0; r <= ROWS; r++) for (let c = 0; c < COLS; c++) {
      const a = on(r - 1, c), b = on(r, c);
      if ((a || b) && !(a && b && grid[r - 1][c].d)) { walls.push({ x: cellX(c), z: (r - ROWS / 2) * CELL, sx: CELL, sz: WALL_T }); addPost(r, c); addPost(r, c + 1); }
      if (a !== b) skirts.push({ x: cellX(c), z: (r - ROWS / 2) * CELL, sx: CELL + WALL_T, sz: WALL_T });
    }
    for (let c = 0; c <= COLS; c++) for (let r = 0; r < ROWS; r++) {
      const a = on(r, c - 1), b = on(r, c);
      if ((a || b) && !(a && b && grid[r][c - 1].r)) { walls.push({ x: (c - COLS / 2) * CELL, z: cellZ(r), sx: WALL_T, sz: CELL }); addPost(r, c); addPost(r + 1, c); }
      if (a !== b) skirts.push({ x: (c - COLS / 2) * CELL, z: cellZ(r), sx: WALL_T, sz: CELL + WALL_T });
    }
    skirts.forEach((k, i) => { _m.compose(_p.set(k.x, -1.2, k.z), _q, _s.set(k.sx, 1.2, k.sz)); skirtMesh.setMatrixAt(i, _m); });
    skirtMesh.count = skirts.length; skirtMesh.instanceMatrix.needsUpdate = true;
    wallMesh.count = capMesh.count = walls.length;
    postMesh.count = postCap.count = posts.length;
  }
  function paintWalls() {
    const maxD = Math.hypot(W, D) / 2 + 1;
    let done = true;
    const kOf = (x, z) => {
      const dl = Math.hypot(x - wallAnim.ox, z - wallAnim.oz) / maxD * 0.55;
      if (wallAnim.dir > 0) { const u = clamp((wallAnim.t - dl) / 0.5, 0, 1); if (u < 1) done = false; return Math.max(0, easeOutBack(u)); }
      const u = clamp((wallAnim.t - dl * 0.5) / 0.35, 0, 1); if (u < 1) done = false; return 1 - u * u;
    };
    walls.forEach((w, i) => {
      const k = kOf(w.x, w.z), h = Math.max(0.001, WALL_H * k);
      _m.compose(_p.set(w.x, 0, w.z), _q, _s.set(w.sx, h, w.sz)); wallMesh.setMatrixAt(i, _m);
      _m.compose(_p.set(w.x, h, w.z), _q, _s.set(w.sx * 0.98, k > 0.02 ? 0.09 : 0.001, w.sz * 1.08)); capMesh.setMatrixAt(i, _m);
    });
    posts.forEach((p, i) => {
      const k = kOf(p.x, p.z), h = Math.max(0.001, (WALL_H + 0.25) * k);
      _m.compose(_p.set(p.x, 0, p.z), _q, _s.set(0.78, h, 0.78)); postMesh.setMatrixAt(i, _m);
      _m.compose(_p.set(p.x, h, p.z), _q, _s.set(0.5, k > 0.02 ? 0.1 : 0.001, 0.5)); postCap.setMatrixAt(i, _m);
    });
    [wallMesh, capMesh, postMesh, postCap].forEach(m => { m.instanceMatrix.needsUpdate = true; });
    return done;
  }

  // ---------------------------------------------------------------- bệ đáp án
  // 1c: bệ phẳng sát sàn (người đứng LÊN được) + máy chiếu giữa bệ + chùm sáng loe lên + BẢNG HOLOGRAM có đáy cao hơn đầu người
  const padGeo = new THREE.CylinderGeometry(1.45, 1.52, 0.07, 40);
  const ringGeo = new THREE.TorusGeometry(1.42, 0.07, 10, 48);
  const SIGN_Y = V.labelY;                                      // đáy bảng (đầu phi hành gia ≈ 4,2)
  const beamGeo = new THREE.CylinderGeometry(1.7, 0.32, SIGN_Y, 40, 1, true).translate(0, SIGN_Y / 2, 0);
  const projGeo = new THREE.CylinderGeometry(0.34, 0.42, 0.16, 20);
  const PAD_COL = { idle: 0xffc53d, ok: 0x4ade80, bad: 0xf87171 };
  let pads = [];
  function makePad(r, c, text, correct, i) {
    const g = new THREE.Group(); g.position.set(cellX(c), 0, cellZ(r)); station.add(g);
    const base = new THREE.Mesh(padGeo, std({ color: 0x1b2135, metalness: 0.7, roughness: 0.35 })); base.position.y = 0.035; base.receiveShadow = true; g.add(base);
    const ringMat = std({ color: 0x06202e, emissive: PAD_COL.idle, emissiveIntensity: 2.4 });
    const ring = new THREE.Mesh(ringGeo, ringMat); ring.rotation.x = Math.PI / 2; ring.position.y = 0.075; g.add(ring);
    const proj = new THREE.Mesh(projGeo, ringMat); proj.position.y = 0.1; g.add(proj);
    const beamMat = new THREE.ShaderMaterial({ ...BEAM_SHADER, uniforms: THREE.UniformsUtils.clone(BEAM_SHADER.uniforms), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    beamMat.uniforms.uOpacity.value = 0.22;
    const beam = new THREE.Mesh(beamGeo, beamMat); beam.position.y = 0.1; g.add(beam);
    const cv = document.createElement("canvas"); cv.width = 512; cv.height = 200;
    drawLabel(cv, text, "idle");
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const lw = V.labelW * CELL, lh = lw * 200 / 512;
    const sign = new THREE.Group(); sign.position.y = SIGN_Y; g.add(sign);
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(lw, lh).translate(0, lh / 2, 0),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
    lab.renderOrder = 5; sign.add(lab);
    g.scale.setScalar(0.001);
    return { r, c, text, correct, g, ringMat, beamMat, lab, sign, cv, tex, resolved: false, state: "idle", born: i * 0.08, fade: -1, flip: -1, shake: -1 };
  }
  function setPadState(p, st) {
    p.state = st; p.ringMat.emissive.setHex(PAD_COL[st]); p.beamMat.uniforms.uColor.value.setHex(PAD_COL[st]);
    p.beamMat.uniforms.uOpacity.value = st === "idle" ? 0.22 : 0.6;
    drawLabel(p.cv, p.text, st); p.tex.needsUpdate = true;
  }
  function clearPads() {
    pads.forEach(p => { station.remove(p.g); p.tex.dispose(); p.lab.material.dispose(); p.lab.geometry.dispose(); p.ringMat.dispose(); p.beamMat.dispose(); p.g.children[0].material.dispose(); });
    pads = [];
  }

  // ---------------------------------------------------------------- người chơi + địch
  const astro = makeAstronaut(); station.add(astro.g); astro.g.visible = false;
  const boom = createBoomFX(scene);
  let bombs = [], bombsLeft = 0, correctSinceGift = 0;
  // 1e: dựng sẵn vật liệu nổ/xác/bom lúc tải trang (đo: lần nổ đầu khựng 0,28 s vì trình duyệt dịch shader lần đầu)
  { const wb = makeBomb(); wb.g.position.set(0, -60, 0); station.add(wb.g);
    boom.explode(0, 0, 0.2); boom.wreck(0, 0, 0xe53935); boom.update(0.016);
    try { renderer.compile(scene, camera); composer.render(); } catch (e) { /* bỏ qua */ }
    boom.clear(); station.remove(wb.g); }
  const pLight = new THREE.PointLight(0x7dd3fc, 0, 12, 2); pLight.position.y = 5; astro.g.add(pLight);
  const shield = new THREE.Mesh(new THREE.SphereGeometry(1.6, 24, 16), new THREE.ShaderMaterial({ ...ATMO_SHADER, uniforms: { uColor: { value: new THREE.Color(0x7dd3fc) } }, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  shield.position.y = 1.3; shield.visible = false; astro.g.add(shield);
  const tpBeam = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 12, 32, 1, true).translate(0, 6, 0),
    new THREE.ShaderMaterial({ ...BEAM_SHADER, uniforms: THREE.UniformsUtils.clone(BEAM_SHADER.uniforms), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  tpBeam.visible = false; station.add(tpBeam);
  const drones = [0xe53935, 0xa855f7, 0xe53935, 0xa855f7].map(c => { const d = makeDrone(c); d.color = c; d.g.visible = false; station.add(d.g); return d; });

  // ---------------------------------------------------------------- hạt
  const NP = 900;
  const pPos = new Float32Array(NP * 3), pCol = new Float32Array(NP * 3), pVel = new Float32Array(NP * 3), pBase = new Float32Array(NP * 3), pLife = new Float32Array(NP), pMax = new Float32Array(NP);
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3)); pGeo.setAttribute("color", new THREE.BufferAttribute(pCol, 3));
  const parts = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.55, vertexColors: true, map: glowTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  parts.frustumCulled = false; parts.renderOrder = 6; scene.add(parts);
  let pNext = 0;
  function burst(x, y, z, hex, n, spd = 7, up = 4, life = 0.9) {
    const c = new THREE.Color(hex);
    for (let k = 0; k < n; k++) {
      const i = pNext; pNext = (pNext + 1) % NP;
      pPos.set([x, y, z], i * 3);
      const v = new THREE.Vector3().randomDirection().multiplyScalar(spd * (0.3 + Math.random() * 0.7));
      pVel.set([v.x, Math.abs(v.y) * 0.6 + up * Math.random(), v.z], i * 3);
      pBase.set([c.r, c.g, c.b], i * 3);
      pMax[i] = pLife[i] = life * (0.6 + Math.random() * 0.6);
    }
  }
  function updateParts(dt) {
    for (let i = 0; i < NP; i++) {
      if (pLife[i] <= 0) { pCol[i * 3] = pCol[i * 3 + 1] = pCol[i * 3 + 2] = 0; continue; }
      pLife[i] -= dt;
      const k = Math.max(0, pLife[i] / pMax[i]);
      pVel[i * 3 + 1] -= 6 * dt;
      for (let a = 0; a < 3; a++) { pVel[i * 3 + a] *= 1 - 1.4 * dt; pPos[i * 3 + a] += pVel[i * 3 + a] * dt; pCol[i * 3 + a] = pBase[i * 3 + a] * k * 2; }
    }
    pGeo.attributes.position.needsUpdate = true; pGeo.attributes.color.needsUpdate = true;
  }

  // ---------------------------------------------------------------- máy quay
  const cam = { pos: new THREE.Vector3(), look: new THREE.Vector3(), blend: 0, yaw: Math.PI, trauma: 0 };
  function fixedPose(dirArr, fov) {
    camera.fov = fov; camera.aspect = ASPECT; camera.updateProjectionMatrix();
    const dir = new THREE.Vector3(...dirArr).normalize();
    const pts = [];
    for (const x of [-W / 2 - 0.8, W / 2 + 0.8]) for (const z of [-D / 2 - 0.8, D / 2 + 0.8]) for (const y of [0, WALL_H + 0.3]) pts.push(new THREE.Vector3(x, y, z));
    const top = 1 - 2 * 0.12, bot = -1 + 2 * 0.04, side = 1 - 2 * 0.025;
    const target = new THREE.Vector3(); let dist = 80;
    for (let it = 0; it < 40; it++) {
      camera.position.copy(target).addScaledVector(dir, dist); camera.lookAt(target); camera.updateMatrixWorld();
      let x0 = 9, x1 = -9, y0 = 9, y1 = -9;
      for (const p of pts) { const v = p.clone().project(camera); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y); }
      const sc = Math.max((x1 - x0) / (2 * side), (y1 - y0) / (top - bot));
      dist *= Math.pow(sc, 0.85);
      const dy = (y0 + y1) / 2 - (top + bot) / 2, up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
      target.addScaledVector(up, dy * dist * Math.tan(THREE.MathUtils.degToRad(fov / 2)) * 0.9);
    }
    return { pos: camera.position.clone(), look: target.clone() };
  }
  const overview = fixedPose(V.kind === "chase" ? V.overview : V.dir, V.kind === "chase" ? 32 : V.fov);
  camera.fov = V.fov; camera.updateProjectionMatrix();
  function chasePose() {
    const p = astro.g.position, f = new THREE.Vector3(Math.sin(cam.yaw), 0, Math.cos(cam.yaw));
    return { pos: new THREE.Vector3(p.x - f.x * V.back, V.height, p.z - f.z * V.back), look: new THREE.Vector3(p.x + f.x * V.ahead, 0.4, p.z + f.z * V.ahead) };
  }
  let camOverride = null;   // bàn thử: __mc.cam([x,y,z],[x,y,z]) soi gần; __mc.cam() trả lại
  function updateCamera(dt) {
    let pos = overview.pos, look = overview.look, fov = V.fov;
    if (camOverride) { pos = camOverride.pos; look = camOverride.look; }
    if (V.kind === "chase") {
      const want = (phase === "play" || phase === "hold") ? 1 : 0;
      cam.blend += (want - cam.blend) * Math.min(1, dt * (want ? 1.9 : 2.6));
      const tgtYaw = pl.heading;
      let dy = tgtYaw - cam.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      cam.yaw += dy * Math.min(1, dt * 3.4);
      const cp = chasePose(), b = ease(clamp(cam.blend, 0, 1));
      pos = overview.pos.clone().lerp(cp.pos, b); look = overview.look.clone().lerp(cp.look, b);
      fov = THREE.MathUtils.lerp(32, V.fov, b);
    }
    cam.trauma = Math.max(0, cam.trauma - dt * 1.8);
    const s = cam.trauma * cam.trauma * 0.6;
    camera.position.copy(pos).add(new THREE.Vector3((Math.random() - 0.5) * s, (Math.random() - 0.5) * s, (Math.random() - 0.5) * s));
    if (Math.abs(camera.fov - fov) > 0.01) { camera.fov = fov; camera.updateProjectionMatrix(); }
    camera.lookAt(look);
  }

  // ---------------------------------------------------------------- trạng thái ván
  let phase = "menu", paused = false, gameT = 0, playT = 0, jobs = [];
  let grid = null, order = [], qi = 0, results = [], lives = 5, score = 0, enemyCount = 2, enemySpeed = 3, graceUntil = 0, invulnUntil = 0;
  let firstQ = true, autoplay = false, stepN = 0, autoTo = null;
  let START = { r: Math.floor(ROWS / 2), c: Math.floor(COLS / 2) }, espots = [[0, 0], [ROWS - 1, COLS - 1], [0, COLS - 1], [ROWS - 1, 0]];
  let nextMap = makeDeck(), curMap = null, logo = null;
  // 1e: sân xuất phát (tới 5×3) quanh ô xuất phát — mở hết vách giữa các ô có sàn; hàng NGAY DƯỚI chỗ xuất phát (gần máy quay)
  // khắc ANDREW STUDIO, rộng tới 5 ô (ít nhất 3) ⇒ chữ to, không bị người đứng che
  function openPlaza() {
    const onC = (r, c) => r >= 0 && r < ROWS && c >= 0 && c < COLS && grid[r][c].on;
    const { r: sr, c: sc } = START;
    for (let r = sr - 1; r <= sr + 1; r++) for (let c = sc - 2; c <= sc + 2; c++) {
      if (!onC(r, c)) continue;
      grid[r][c].plaza = true;                               // không đặt bệ đáp án trong sân (khỏi đè chữ)
      if (c < sc + 2 && onC(r, c + 1)) { grid[r][c].r = true; grid[r][c + 1].l = true; }
      if (r < sr + 1 && onC(r + 1, c)) { grid[r][c].d = true; grid[r + 1][c].u = true; }
    }
    for (const r of [sr + 1, sr - 1]) {
      if (!(onC(r, sc - 1) && onC(r, sc) && onC(r, sc + 1))) continue;
      const wide = onC(r, sc - 2) && onC(r, sc + 2), lg = { r, c0: wide ? sc - 2 : sc - 1, c1: wide ? sc + 2 : sc + 1 };
      // bảng hologram treo cao ⇒ trên màn bị đẩy LÊN ~1 ô: bệ ở hàng ngay dưới chữ sẽ che chữ ⇒ cấm đặt bệ ở đó
      for (let c = lg.c0 - 1; c <= lg.c1 + 1; c++) if (onC(r + 1, c)) grid[r + 1][c].plaza = true;
      return lg;
    }
    return null;
  }
  function useMap(m) {                      // dựng một map: lưới + sàn + màu + vách mép
    curMap = genMap(m); grid = curMap.grid; START = curMap.start; espots = curMap.enemySpots;
    logo = openPlaza();
    applyTheme(curMap.theme); deck.paint(grid, curMap.theme, START, logo);
    [floorTex, floorNrm, floorRgh, floorEmi].forEach(t => { t.needsUpdate = true; });
    layoutWalls(grid);
  }
  const pl = { r: 0, c: 0, nr: 0, nc: 0, t: 0, moving: false, dir: "u", queued: null, speed: PLAYER_SPEED, heading: Math.PI, eject: 0, walk: 0, bounce: false, cheer: 0, leave: 0 };
  let ens = [];
  const later = (sec, fn) => jobs.push({ at: gameT + sec, fn });

  const open = (e, d) => !!(grid && grid[e.r][e.c][d]);
  const bombAt = (r, c) => bombs.find(b => b.r === r && b.c === c && !b.gone);
  function entityPos(e) {
    const x0 = cellX(e.c), z0 = cellZ(e.r);
    if (!e.moving) return [x0, z0];
    return [x0 + (cellX(e.nc) - x0) * e.t, z0 + (cellZ(e.nr) - z0) * e.t];
  }
  function moveEntity(e, dt, decide, arrive) {
    let rem = dt * e.speed, guard = 4;
    while (rem > 0 && guard--) {
      if (!e.moving) {
        const d = decide(e);
        if (!d) break;
        e.dir = d; e.nr = e.r + DIRS[d].dr; e.nc = e.c + DIRS[d].dc; e.t = 0; e.moving = true;
      }
      const need = 1 - e.t;
      if (rem < need) { e.t += rem; rem = 0; }
      else { rem -= need; e.r = e.nr; e.c = e.nc; e.t = 0; e.moving = false; if (arrive(e) === false) break; }
    }
  }
  function decidePlayer(e) {
    if (e.bounce) { e.bounce = false; e.dir = null; e.queued = null; autoTo = null; return null; }   // vừa bị bật lùi khỏi bệ sai: đứng lại
    if (autoTo) { const d = bfsStep(grid, e.r, e.c, autoTo[0], autoTo[1]); if (d) return d; autoTo = null; }
    if (autoplay) {
      const tgt = pads.find(p => p.correct && !p.resolved);
      if (tgt) { const d = bfsStep(grid, e.r, e.c, tgt.r, tgt.c); if (d) return d; }
    }
    const free = d => open(e, d) && !bombAt(e.r + DIRS[d].dr, e.c + DIRS[d].dc);   // 1e: bom chặn đường
    if (e.queued && free(e.queued)) { const d = e.queued; e.queued = null; return d; }
    return e.dir && free(e.dir) ? e.dir : null;
  }
  function decideEnemy(e) {
    const opts = DK.filter(k => open(e, k));
    if (!opts.length) return null;
    const pick = decideEnemy0(e, opts);
    const b = pick && bombAt(e.r + DIRS[pick].dr, e.c + DIRS[pick].dc);
    if (b) { detonate(b); return null; }                    // 1e: đuổi tới sát bom ⇒ dừng lại, bom nổ
    return pick;
  }
  function decideEnemy0(e, opts) {
    if (Math.random() < 0.22) {
      const fwd = opts.filter(k => k !== DIRS[e.dir]?.opp);
      const pool = fwd.length ? fwd : opts;
      return pool[randi(pool.length)];
    }
    return bfsStep(grid, e.r, e.c, pl.r, pl.c) || opts[randi(opts.length)];
  }
  function queueDir(d) {
    if (phase !== "play" && phase !== "count") { return; }
    if (pl.bounce) return;
    if (pl.moving && d === DIRS[pl.dir].opp && !bombAt(pl.r, pl.c)) {   // quay đầu giữa hành lang: đổi ngay (trừ khi quay vào ô bom)
      [pl.r, pl.nr] = [pl.nr, pl.r]; [pl.c, pl.nc] = [pl.nc, pl.c]; pl.t = 1 - pl.t; pl.dir = d; pl.queued = null; return;
    }
    pl.queued = d;
  }
  // hướng TRÊN MÀN → hướng mê cung: chiếu 4 hướng quanh nhân vật lên màn, lấy hướng khớp nhất
  function screenToGrid(vx, vy) {
    const len = Math.hypot(vx, vy); if (len < 1e-6) return null;
    vx /= len; vy /= len;
    const [x, z] = entityPos(pl), o = new THREE.Vector3(x, 1, z).project(camera);
    let best = null, bd = -2;
    for (const k of DK) {
      const p = new THREE.Vector3(x + DIRS[k].dc * CELL, 1, z + DIRS[k].dr * CELL).project(camera);
      let sx = p.x - o.x, sy = -(p.y - o.y); const l = Math.hypot(sx, sy) || 1; sx /= l; sy /= l;
      const dot = sx * vx + sy * vy; if (dot > bd) { bd = dot; best = k; }
    }
    return best;
  }
  function playerScreen() {
    const [x, z] = entityPos(pl), v = new THREE.Vector3(x, 1.3, z).project(camera);
    return [(v.x + 1) / 2 * stageW, (1 - v.y) / 2 * stageH];
  }

  // ---------------------------------------------------------------- HUD phụ
  function renderLives() {   // nhiều tim quá thì gọn thành "♥ N" cho khỏi tràn dải trên
    livesEl.innerHTML = opt.lives > 6 ? `<i>♥</i><span>${lives}</span>`
      : Array.from({ length: opt.lives }, (_, i) => `<i class="${i < lives ? "" : "is-lost"}">♥</i>`).join("");
  }
  function fitBanner() {
    qEl.style.maxWidth = ""; let fs = 2.6;
    qSpan.style.fontSize = fs + "cqw";
    while (fs > 1.3 && (qSpan.scrollHeight > qEl.clientHeight * 0.96 || qSpan.scrollWidth > qEl.clientWidth)) { fs -= 0.1; qSpan.style.fontSize = fs.toFixed(2) + "cqw"; }
  }
  function showCount(txt) {
    countEl.hidden = false; countEl.textContent = txt;
    countEl.classList.remove("is-pop"); void countEl.offsetWidth; countEl.classList.add("is-pop");
  }
  function minus(worldPos, txt) {
    const v = worldPos.clone().project(camera), el = document.createElement("div");
    el.className = "mc-minus"; el.textContent = txt;
    el.style.left = ((v.x + 1) / 2 * 100) + "%"; el.style.top = ((1 - v.y) / 2 * 100) + "%";
    stage.appendChild(el); setTimeout(() => el.remove(), 1200);
  }
  function applyDpad() {
    const on = phase !== "menu" && phase !== "end";
    Object.values(dpads).forEach(dp => { dp.dataset.style = opt.dpadStyle; });
    dpads.l.hidden = !(on && (opt.dpad === "l" || opt.dpad === "both"));
    dpads.r.hidden = !(on && (opt.dpad === "r" || opt.dpad === "both"));
  }
  function drawMini() {
    if (!V.minimap || mini.hidden) return;
    const g = mini.getContext("2d"), w = mini.width, h = mini.height, pad = 6 * PR;
    const cs = Math.min((w - pad * 2) / COLS, (h - pad * 2) / ROWS), ox = (w - cs * COLS) / 2, oy = (h - cs * ROWS) / 2;
    if (!miniBase && grid) {
      miniBase = document.createElement("canvas"); miniBase.width = w; miniBase.height = h;
      const b = miniBase.getContext("2d");
      b.strokeStyle = "rgba(255,160,80,.9)"; b.lineWidth = Math.max(1, cs * 0.12); b.lineCap = "round"; b.beginPath();
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const x = ox + c * cs, y = oy + r * cs, cl = grid[r][c];
        if (!cl.u) { b.moveTo(x, y); b.lineTo(x + cs, y); }
        if (!cl.l) { b.moveTo(x, y); b.lineTo(x, y + cs); }
        if (r === ROWS - 1 && !cl.d) { b.moveTo(x, y + cs); b.lineTo(x + cs, y + cs); }
        if (c === COLS - 1 && !cl.r) { b.moveTo(x + cs, y); b.lineTo(x + cs, y + cs); }
      }
      b.stroke();
    }
    g.clearRect(0, 0, w, h);
    if (miniBase) g.drawImage(miniBase, 0, 0);
    const dot = (x, z, col, rad) => { g.fillStyle = col; g.beginPath(); g.arc(ox + (x / CELL + (COLS - 1) / 2 + 0.5) * cs, oy + (z / CELL + (ROWS - 1) / 2 + 0.5) * cs, rad, 0, 7); g.fill(); };
    pads.forEach(p => { if (p.fade < 0) dot(cellX(p.c), cellZ(p.r), p.state === "ok" ? "#4ade80" : p.state === "bad" ? "#f87171" : "#7dd3fc", cs * 0.32); });
    ens.forEach(e => { const [x, z] = entityPos(e); dot(x, z, e.color, cs * 0.26); });
    const [px, pz] = entityPos(pl); dot(px, pz, "#ffffff", cs * 0.3);
  }

  // ---------------------------------------------------------------- nhịp ván
  function startGame() {
    sfx.unlock(); sfx.click(); sfx.humOn();
    order = questions.map((q, i) => i); if (opt.shuffle) shuffle(order);
    results = order.map(i => ({ q: questions[i], correct: false, wrong: [] }));
    qi = 0; score = 0; lives = opt.lives; playT = 0; firstQ = true; jobs = []; paused = false; nextMap = makeDeck();
    bombsLeft = opt.bombs; correctSinceGift = 0; clearBombs(); paintBombs(); swapEl.hidden = true; invulnUntil = 0;
    const diff = opt.difficulty;
    enemyCount = diff <= 3 ? 1 : diff <= 6 ? 2 : diff <= 8 ? 3 : 4;
    enemySpeed = 1000 / Math.max(230, 400 - diff * 14) * SPEED_SCALE;
    ovStart.hidden = ovEnd.hidden = ovPause.hidden = true;
    topEl.hidden = false; bar.hidden = false; mini.hidden = !V.minimap;
    scoreEl.textContent = "0"; renderLives();
    fit();
    nextQuestion();
  }
  function nextQuestion() {
    phase = "intro"; applyDpad();
    const q = results[qi].q;
    clearBombs();
    const m = nextMap(); useMap(m); miniBase = null;
    $(".mc-mapname").textContent = "Map · " + m.name;
    wallAnim.dir = -1; wallAnim.t = 99; paintWalls();          // tường nằm phẳng chờ dựng
    clearPads();
    Object.assign(pl, { r: START.r, c: START.c, t: 0, moving: false, queued: null, eject: 0, bounce: false, cheer: 0, leave: 0 });
    const d0 = DK.find(k => open(pl, k)) || "u";
    pl.dir = null;                                           // đứng yên chờ lệnh đầu tiên (như Wordwall)
    pl.heading = Math.atan2(DIRS[d0].dc, DIRS[d0].dr);
    if (firstQ) cam.yaw = pl.heading;
    astro.g.visible = false;
    ens = []; drones.forEach(d => { d.g.visible = false; });
    qSpan.textContent = q.question || "";
    requestAnimationFrame(fitBanner);
    bigq.querySelector("span").textContent = q.question || "";
    bigq.hidden = false; bigq.classList.remove("is-out"); bigq.classList.add("is-in");
    sfx.reveal();
    later(firstQ ? 2.2 : 1.7, () => { bigq.classList.add("is-out"); later(0.4, () => { bigq.hidden = true; }); buildMaze(q); });
  }
  function buildMaze(q) {
    phase = "build";
    wallAnim.dir = 1; wallAnim.t = 0; wallAnim.ox = cellX(START.c); wallAnim.oz = cellZ(START.r);
    sfx.build();
    const answers = shuffle(q.answers.filter(a => a && a.text != null).slice());
    const spots = pickSpots(answers.length, START.r, START.c, grid, espots);
    pads = answers.map((a, i) => makePad(spots[i][0], spots[i][1], a.text, !!a.correct, i));
    later(0.5, () => { appearPlayer(); });
    later(0.8, () => {
      ens = [];
      for (let i = 0; i < enemyCount; i++) {
        const [r, c] = espots[i % espots.length], d = drones[i];
        ens.push({ r, c, nr: r, nc: c, t: 0, moving: false, dir: "u", speed: enemySpeed, drone: d, color: i % 2 ? "#c084fc" : "#ef4444", born: gameT + i * 0.12, heading: 0, fly: null });
        d.g.visible = true; d.g.scale.setScalar(0.001);
      }
      sfx.enemy();
    });
    later(1.3, () => {
      phase = "count"; applyDpad();
      const seq = firstQ ? ["3", "2", "1", "GO!"] : ["GO!"];
      seq.forEach((s, i) => later(i * 0.8, () => { showCount(s); s === "GO!" ? sfx.go() : sfx.count(); }));
      later((seq.length - 1) * 0.8 + 0.25, () => { phase = "play"; graceUntil = gameT + GRACE; firstQ = false; });
      later(seq.length * 0.8 + 0.2, () => { countEl.hidden = true; });
    });
  }
  // ================= 1e: BOM
  function paintBombs() {
    bombsEl.querySelector("b").textContent = bombsLeft;
    bombsEl.classList.toggle("is-empty", bombsLeft <= 0);
    Object.values(dpads).forEach(dp => { const h = dp.querySelector(".hub"); h.querySelector("b").textContent = bombsLeft; h.classList.toggle("is-empty", bombsLeft <= 0); });
  }
  function placeBomb() {
    if (phase !== "play" || pl.eject > 0 || bombsLeft <= 0) { if (phase === "play" && bombsLeft <= 0) sfx.wrong(); return; }
    const r = pl.moving && pl.t > 0.5 ? pl.nr : pl.r, c = pl.moving && pl.t > 0.5 ? pl.nc : pl.c;
    if (bombAt(r, c) || pads.some(p => p.r === r && p.c === c && p.fade < 0)) return;
    const b = makeBomb(); b.g.position.set(cellX(c), 0, cellZ(r)); b.g.scale.setScalar(0.01); station.add(b.g);
    bombs.push({ r, c, obj: b, t: 0, gone: false });
    bombsLeft--; paintBombs(); sfx.click(); sfx.tick();
  }
  function detonate(b) {
    if (b.gone) return;
    b.gone = true; station.remove(b.obj.g);
    const x = cellX(b.c), z = cellZ(b.r);
    boom.explode(x, z, 1); sfx.hit(); sfx.boom?.();
    cam.trauma = 1; stage.classList.remove("is-shake"); void stage.offsetWidth; stage.classList.add("is-shake");
    // robot trong tầm ⇒ vỡ tung, nằm lại thành xác; KHÔNG quay lại ở câu này
    for (const e of ens.slice()) {
      const [ex, ez] = entityPos(e);
      if (Math.hypot(ex - x, ez - z) < BLAST_R) {
        e.drone.g.visible = false; boom.wreck(ex, ez, e.drone.color ?? (e.color === "#ef4444" ? 0xe53935 : 0xa855f7));
        ens.splice(ens.indexOf(e), 1);
      }
    }
    // bom khác trong tầm nổ lan theo
    for (const o of bombs) if (!o.gone && Math.hypot(cellX(o.c) - x, cellZ(o.r) - z) < BLAST_R) later(0.12, () => detonate(o));
    // người đứng sát ⇒ dính bom, mất mạng
    const [px, pz] = entityPos(pl);
    if (phase === "play" && pl.eject <= 0 && gameT > invulnUntil && Math.hypot(px - x, pz - z) < NEAR_R) hitPlayer("bomb");
  }
  function clearBombs() { bombs.forEach(b => { if (!b.gone) station.remove(b.obj.g); }); bombs = []; boom.clear(); }

  // ================= 1e: ĐỔI NGƯỜI — mỗi HS 1 mạng
  function startSwap(delay) {
    phase = "swap"; applyDpad();
    later(delay, () => {
      if (phase !== "swap") return;
      // robot bay về góc xuất phát (theo đường cong), người về giữa sân
      ens.forEach((e, i) => { const [x, z] = entityPos(e), [r, c] = espots[i % espots.length]; e.fly = { from: [x, z], t: 0 }; Object.assign(e, { r, c, t: 0, moving: false }); });
      Object.assign(pl, { r: START.r, c: START.c, t: 0, moving: false, queued: null, dir: null, bounce: false, eject: 0 });
      astro.g.visible = false;
      bombsLeft = opt.bombs; paintBombs();
      swapEl.hidden = false; swapS.textContent = `Player ${opt.lives - lives + 1} of ${opt.lives}`;
      for (let k = 0; k < SWAP_S; k++) later(k, () => {
        swapN.textContent = SWAP_S - k; swapN.classList.remove("is-pop"); void swapN.offsetWidth; swapN.classList.add("is-pop"); sfx.count();
        if (k === SWAP_S - 1) appearPlayer();
      });
      later(SWAP_S, () => { swapEl.hidden = true; if (phase !== "swap") return; phase = "play"; graceUntil = gameT + 1.2; invulnUntil = 0; applyDpad(); sfx.go(); });
    });
  }
  function hitPlayer(why) {
    sfx.hit(); cam.trauma = 0.8;
    const [x, z] = entityPos(pl);
    burst(x, 1.3, z, why === "bomb" ? 0xff7a1a : 0xffa94d, 90, 10, 6, 1);
    stage.classList.remove("is-shake"); void stage.offsetWidth; stage.classList.add("is-shake");
    invulnUntil = gameT + 99; pl.eject = EJECT;
    loseLife();
  }

  function appearPlayer() {
    astro.g.visible = true; astro.g.scale.setScalar(0.001);
    const [x, z] = entityPos(pl);
    tpBeam.position.set(x, 0, z); tpBeam.visible = true; tpBeam.userData.t = 0;
    burst(x, 1, z, 0x7dd3fc, 40, 5, 5, 0.8);
    sfx.teleport();
  }
  function checkPad() {
    const p = pads.find(p => !p.resolved && p.r === pl.r && p.c === pl.c);
    if (!p) return true;
    p.resolved = true;
    const wp = new THREE.Vector3(cellX(p.c), 2, cellZ(p.r));
    if (p.correct) {
      setPadState(p, "ok"); score++; scoreEl.textContent = score; results[qi].correct = true;
      p.flip = 0; pl.cheer = HOLD; pl.heading = 0;                     // quay mặt về phía máy quay mà mừng
      if (opt.bombGift > 0 && ++correctSinceGift >= opt.bombGift) { correctSinceGift = 0; if (bombsLeft < 10) { bombsLeft++; paintBombs(); later(0.3, () => sfx.win?.()); } }   // 1e: tặng bom
      burst(wp.x, SIGN_Y + 1.2, wp.z, 0x4ade80, 120, 9, 6, 1.2); sfx.correct();
      phase = "hold"; applyDpad();
      later(HOLD, endQuestion);
      return false;
    }
    setPadState(p, "bad"); results[qi].wrong.push(p.text); p.shake = 0;
    burst(wp.x, 0.6, wp.z, 0xf87171, 70, 7, 3, 0.8); sfx.wrong(); cam.trauma = 0.45;
    later(0.7, () => { p.fade = 0; sfx.sink(); });
    // bị BẬT LÙI 1 ô về phía vừa đi tới (không đứng lẫn trong bệ đang tan)
    const back = pl.dir ? DIRS[pl.dir].opp : DK.find(k => open(pl, k));
    loseLife();                                            // 1e: sau đó đổi người (bật lùi vẫn diễn trong lúc chờ)
    if ((phase === "swap" || phase === "play") && back && open(pl, back)) {
      pl.dir = back; pl.nr = pl.r + DIRS[back].dr; pl.nc = pl.c + DIRS[back].dc; pl.t = 0; pl.moving = true; pl.queued = null; pl.bounce = true;
    }
    return true;
  }
  function loseLife() {
    lives = Math.max(0, lives - 1); renderLives();
    if (lives <= 0) { phase = "dead"; later(0.9, () => endGame("over")); return; }
    startSwap(0.9);                                        // 1e: mỗi mạng một học sinh ⇒ đổi người
  }
  function hitByEnemy() { hitPlayer("enemy"); }
  function endQuestion() {
    pl.leave = 0.6; const [lx, lz] = entityPos(pl);
    tpBeam.position.set(lx, 0, lz); tpBeam.visible = true; tpBeam.userData.t = 0; sfx.teleport();
    wallAnim.dir = -1; wallAnim.t = 0; wallAnim.ox = cellX(pl.c); wallAnim.oz = cellZ(pl.r);
    sfx.sink();
    pads.forEach(p => { if (p.fade < 0 && !p.correct) p.fade = 0; });
    ens.forEach(e => { const [x, z] = entityPos(e); burst(x, 1.3, z, e.color, 30, 5, 3, 0.6); e.drone.g.visible = false; });
    ens = [];
    later(0.75, () => {
      const p = pads.find(p => p.correct); if (p) p.fade = 0;
      qi++;
      if (qi >= results.length) endGame("complete"); else nextQuestion();
    });
  }
  function endGame(kind) {
    phase = "end"; applyDpad(); sfx.humOff();
    kind === "complete" ? sfx.win() : sfx.over();
    $(".mc-end-title").textContent = kind === "complete" ? "Game complete" : "Game over";
    $(".mc-end-score").textContent = `${score} / ${results.length}`;
    $(".mc-end-sub").textContent = "Time " + fmt(playT);
    const ans = $(".mc-ans"); ans.hidden = true;
    ans.innerHTML = results.map((r, i) => {
      const right = (r.q.answers.find(a => a.correct) || {}).text || "";
      return `<div class="${r.correct ? "" : "no"}"><span>${i + 1}.</span><span>${escapeHtml(r.q.question)}</span><b>${r.correct ? "✓" : "✗"} ${escapeHtml(right)}</b></div>`;
    }).join("");
    later(0.6, () => { ovEnd.hidden = false; });
  }
  function toMenu() {
    phase = "menu"; paused = false; jobs = []; sfx.humOff();
    ovPause.hidden = ovEnd.hidden = true; ovStart.hidden = false; topEl.hidden = true; bar.hidden = true; mini.hidden = true; countEl.hidden = true; bigq.hidden = true;
    clearPads(); clearBombs(); swapEl.hidden = true; ens = []; drones.forEach(d => { d.g.visible = false; }); astro.g.visible = false;
    wallAnim.dir = -1; wallAnim.t = 0; applyDpad();
  }
  function setPaused(p) {
    if (phase === "menu" || phase === "end") return;
    paused = p; ovPause.hidden = !p;
    p ? sfx.suspend() : sfx.resume();
  }

  // ---------------------------------------------------------------- vòng cập nhật
  function update(dt) {
    if (paused) return;
    gameT += dt;
    for (let i = 0; i < jobs.length; i++) { if (jobs[i].at <= gameT) { const j = jobs.splice(i--, 1)[0]; j.fn(); } }
    if (phase !== "menu" && phase !== "end") { playT += dt; clockEl.textContent = fmt(playT); }

    // tường
    if (wallAnim.dir !== 0 && wallAnim.t < 3) { wallAnim.t += dt; paintWalls(); }

    // người chơi
    if (pl.eject > 0) pl.eject -= dt;                       // 1e: văng người chạy cả lúc đang chờ đổi người
    if (phase === "swap" && pl.bounce && pl.moving) moveEntity(pl, dt, () => null, () => { pl.bounce = false; return false; });
    if (phase === "play") {
      if (pl.eject > 0) { /* đang văng */ }
      else {
        moveEntity(pl, dt, decidePlayer, () => { if (++stepN % 2 === 0) sfx.step(stepN / 2); return checkPad(); });
        if (pl.moving) pl.heading = Math.atan2(DIRS[pl.dir].dc, DIRS[pl.dir].dr);
      }
      for (const e of ens) {
        if (gameT < e.born + 0.4) continue;
        moveEntity(e, dt, decideEnemy, () => true);
        if (e.moving) e.heading = Math.atan2(DIRS[e.dir].dc, DIRS[e.dir].dr);
      }
      for (const e of ens) if (bombAt(e.r, e.c)) detonate(bombAt(e.r, e.c));   // robot đã đang lao vào ô bom lúc bom được đặt
      if (phase === "play" && pl.eject <= 0 && gameT > graceUntil && gameT > invulnUntil) {
        const [px, pz] = entityPos(pl);
        if (ens.some(e => { const [x, z] = entityPos(e); return Math.hypot(x - px, z - pz) < CELL * 0.55; })) hitByEnemy();
      }
    }

    // hình nhân vật
    const [px, pz] = entityPos(pl);
    astro.g.position.set(px, 0.02, pz);
    const s0 = astro.g.scale.x;
    if (astro.g.visible && pl.eject <= 0 && !(pl.leave > 0) && s0 < 1.75) astro.g.scale.setScalar(Math.min(1.75, s0 + dt * 3.6));
    let dh = pl.heading - astro.g.rotation.y; dh = Math.atan2(Math.sin(dh), Math.cos(dh));
    astro.g.rotation.y += dh * Math.min(1, dt * 14);
    const walking = phase === "play" && pl.moving && pl.eject <= 0;
    pl.walk += dt * (walking ? 8 : 0);
    const sw = walking ? Math.sin(pl.walk) * 0.55 : 0;
    astro.legs[0].rotation.x = sw; astro.legs[1].rotation.x = -sw;
    astro.arms[0].rotation.x = -sw * 0.7; astro.arms[1].rotation.x = sw * 0.7;
    astro.body.position.y = walking ? Math.abs(Math.sin(pl.walk)) * 0.12 : Math.sin(gameT * 2.2) * 0.05;
    astro.jets.forEach(j => { j.material.emissiveIntensity = walking ? 3 : 0.4; });
    astro.arms[0].rotation.z = 0; astro.arms[1].rotation.z = 0;
    if (pl.bounce && pl.moving) { astro.body.position.y = Math.sin(pl.t * Math.PI) * 0.9; astro.body.rotation.x = -0.35 * Math.sin(pl.t * Math.PI); }
    else astro.body.rotation.x *= 0.8;
    if (pl.cheer > 0) {                                   // nhảy mừng: giơ 2 tay, bật lên 2 lần
      pl.cheer -= dt; const k = HOLD - pl.cheer;
      astro.arms[0].rotation.x = astro.arms[1].rotation.x = -2.7; astro.arms[0].rotation.z = -0.35; astro.arms[1].rotation.z = 0.35;
      astro.body.position.y = Math.abs(Math.sin(k * 7)) * 0.3;
    }
    if (pl.leave > 0) {                                   // tia sáng đưa người đi trước khi mê cung sụp
      pl.leave -= dt; const u = clamp(1 - pl.leave / 0.6, 0, 1);
      astro.g.scale.setScalar(Math.max(0.001, 1.75 * (1 - u))); astro.body.position.y = u * 4;
      if (pl.leave <= 0) astro.g.visible = false;
    }
    if (pl.eject > 0) { const u = 1 - pl.eject / EJECT; astro.body.position.y = u * 3.5; astro.body.rotation.y += dt * 18; astro.g.scale.setScalar(1.75 * (1 - u)); }
    else astro.body.rotation.y *= 0.8;
    const inv = gameT < invulnUntil || (phase === "play" && gameT < graceUntil);
    shield.visible = astro.g.visible && inv; if (shield.visible) shield.material.uniforms.uColor.value.setHex(Math.sin(gameT * 20) > 0 ? 0x7dd3fc : 0x1e3a8a);
    if (tpBeam.visible) { tpBeam.userData.t += dt; const u = tpBeam.userData.t / 0.8; tpBeam.material.uniforms.uOpacity.value = Math.max(0, 1 - u); tpBeam.material.uniforms.uTime.value = gameT; if (u >= 1) tpBeam.visible = false; }

    // địch
    for (const e of ens) {
      let [x, z] = entityPos(e), lift = 0; const g = e.drone.g;
      if (e.fly) {                                           // 1e: bay vòng lên rồi đáp xuống góc xuất phát
        e.fly.t += dt / 1.1; const u = Math.min(1, e.fly.t), k = ease(u);
        x = e.fly.from[0] + (x - e.fly.from[0]) * k; z = e.fly.from[1] + (z - e.fly.from[1]) * k; lift = Math.sin(u * Math.PI) * 4;
        if (u >= 1) e.fly = null;
      }
      g.position.set(x, 1.45 + lift + Math.sin(gameT * 3 + e.born) * 0.14, z);
      const sc = g.scale.x; if (gameT > e.born && sc < 1.6) g.scale.setScalar(Math.min(1.6, sc + dt * 3.6));
      let d = e.heading - g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); g.rotation.y += d * Math.min(1, dt * 8);
      e.drone.body.rotation.z = Math.sin(gameT * 4 + e.born) * 0.08;
      e.drone.flame.scale.set(1, 0.8 + Math.random() * 0.45, 1);
      e.drone.arms.forEach((a, k) => { a.rotation.x = Math.sin(gameT * 3 + k * 1.7 + e.born) * 0.35; });
      e.drone.tip.material.emissiveIntensity = Math.sin(gameT * 6 + e.born) > 0 ? 3.5 : 0.8;
    }

    // bệ
    for (const p of pads) {
      const age = gameT - (p.bornT ?? (p.bornT = gameT)) - p.born;
      let s = clamp(age / 0.45, 0, 1); s = s > 0 ? easeOutBack(s) : 0.001;
      if (p.fade >= 0) { p.fade += dt; const u = clamp(p.fade / 0.45, 0, 1); s *= 1 - u; if (u >= 1) p.g.visible = false; }
      p.g.scale.setScalar(Math.max(0.001, s));
      p.beamMat.uniforms.uTime.value = gameT;
      p.sign.position.y = SIGN_Y + Math.sin(gameT * 1.8 + p.c) * 0.08;
      p.sign.quaternion.copy(camera.quaternion);                       // bảng luôn quay mặt về máy quay
      if (p.flip >= 0) { p.flip += dt; const u = clamp(p.flip / 0.6, 0, 1); p.sign.rotateZ(Math.sin(u * Math.PI * 3) * 0.08 * (1 - u)); p.sign.scale.setScalar(1 + Math.sin(u * Math.PI) * 0.22); }   // nảy phồng (lật 360° làm chữ ngược giữa chừng)
      if (p.shake >= 0) { p.shake += dt; p.sign.position.x = Math.sin(p.shake * 50) * 0.25 * Math.max(0, 1 - p.shake / 0.5); }
      p.beamMat.uniforms.uOpacity.value = (p.state === "idle" ? 0.2 : 0.55) + Math.sin(gameT * 3 + p.c) * 0.04;
    }

    beacons.forEach(b => { b.m.material.emissiveIntensity = (Math.sin(gameT * 3 + b.ph) > 0.6) ? 4 : 0.3; });
    sky.material.uniforms.uTime.value = gameT;
    planet.rotation.y += dt * 0.01; station.rotation.y = 0;
    starsA.rotation.y += dt * 0.002; starsB.rotation.y += dt * 0.002;
    updateParts(dt);
    boom.update(dt);
    for (const b of bombs) {                                 // 1e: bom rơi xuống + ngòi lấp lánh + đèn đỏ + vòng cảnh báo
      if (b.gone) continue;
      b.t += dt; b.obj.g.scale.setScalar(1.25 * Math.min(1, easeOutBack(Math.min(1, b.t / 0.35))));
      b.obj.spark.scale.setScalar(0.45 + Math.random() * 0.35); b.obj.spark.material.opacity = 0.7 + Math.random() * 0.3;
      b.obj.led.material.emissiveIntensity = Math.sin(gameT * 8) > 0 ? 4 : 0.3;
      b.obj.warn.material.opacity = 0.25 + 0.25 * (0.5 + 0.5 * Math.sin(gameT * 5));
    }
    updateCamera(dt);
  }
  function render() { composer.render(); drawMini(); }

  // ---------------------------------------------------------------- điều khiển
  const KEYS = { ArrowUp: "u", ArrowDown: "d", ArrowLeft: "l", ArrowRight: "r", w: "u", s: "d", a: "l", d: "r", W: "u", S: "d", A: "l", D: "r" };
  window.addEventListener("keydown", e => {
    if (e.key === "Escape") { setPaused(!paused); return; }
    if ((e.key === " " || e.key === "b" || e.key === "B") && !paused) { e.preventDefault(); placeBomb(); return; }
    const k = KEYS[e.key]; if (!k || paused) return;
    e.preventDefault();
    const g = screenToGrid(...SCREEN_VEC[k]); if (g) queueDir(g);
  });
  Object.values(dpads).forEach(dp => dp.querySelectorAll("button").forEach(b => {
    b.addEventListener("pointerdown", e => {
      e.preventDefault(); e.stopPropagation(); if (paused) return;
      if (b.dataset.bomb) { placeBomb(); b.classList.add("is-on"); setTimeout(() => b.classList.remove("is-on"), 160); return; }   // 1e: nút giữa = BOM
      const g = screenToGrid(...SCREEN_VEC[b.dataset.d]); if (g) queueDir(g);
      b.classList.add("is-on"); setTimeout(() => b.classList.remove("is-on"), 140);
    });
  }));
  // kiểu E "stick": kéo núm (hoặc chạm vào mép đế) — đổi hướng khi núm lệch quá 25% bán kính
  Object.values(dpads).forEach(dp => {
    const knob = dp.querySelector(".knob"); let drag = null, lastDir = null;
    const moveTo = e => {
      const r = dp.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, R0 = r.width / 2;
      let dx = e.clientX - cx, dy = e.clientY - cy; const L = Math.hypot(dx, dy), m = R0 * 0.42;
      if (L > m) { dx *= m / L; dy *= m / L; }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      if (L < R0 * 0.25) return;
      const sd = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "r" : "l") : (dy > 0 ? "d" : "u");
      if (sd !== lastDir) { lastDir = sd; const g = screenToGrid(...SCREEN_VEC[sd]); if (g) queueDir(g); }
    };
    dp.addEventListener("pointerdown", e => {
      if (dp.dataset.style !== "stick" || paused) return;
      e.preventDefault(); drag = e.pointerId; lastDir = null; dp.classList.add("is-drag"); try { dp.setPointerCapture(e.pointerId); } catch (_) { /* ảo */ } moveTo(e);
    });
    dp.addEventListener("pointermove", e => { if (drag === e.pointerId) moveTo(e); });
    const end = e => { if (drag !== e.pointerId) return; drag = null; dp.classList.remove("is-drag"); knob.style.transform = ""; };
    dp.addEventListener("pointerup", end); dp.addEventListener("pointercancel", end);
  });
  // chạm / vuốt trên màn (chơi đơn): vuốt ⇒ theo hướng vuốt; chạm ⇒ theo phía chỗ chạm so với nhân vật
  let touch = null;
  canvas.addEventListener("pointerdown", e => {
    if (phase !== "play" && phase !== "count") return;
    const r = stage.getBoundingClientRect();
    touch = { x: e.clientX - r.left, y: e.clientY - r.top, used: false, id: e.pointerId };
  });
  canvas.addEventListener("pointermove", e => {
    if (!touch || touch.used || e.pointerId !== touch.id) return;
    const r = stage.getBoundingClientRect(), dx = e.clientX - r.left - touch.x, dy = e.clientY - r.top - touch.y;
    if (Math.hypot(dx, dy) > stageW * 0.035) { touch.used = true; const g = screenToGrid(dx, dy); if (g) queueDir(g); }
  });
  canvas.addEventListener("pointerup", e => {
    if (!touch || e.pointerId !== touch.id) return;
    const t = touch; touch = null;
    if (t.used) return;
    const [sx, sy] = playerScreen(), dx = t.x - sx, dy = t.y - sy;
    if (Math.hypot(dx, dy) < stageW * 0.02) return;
    const g = screenToGrid(dx, dy); if (g) queueDir(g);
  });
  canvas.addEventListener("pointercancel", () => { touch = null; });

  // ---------------------------------------------------------------- nút
  const OPT_SPEC = {
    lives: { min: 1, max: 10, show: v => v },
    difficulty: { min: 1, max: 10, show: v => v },
    dpad: { list: DPAD_MODES, show: v => DPAD_NAMES[v] },
    dpadStyle: { list: DPAD_STYLES, show: v => DPAD_STYLE_NAMES[v] },
    bombs: { min: 0, max: 10, show: v => v },
    bombGift: { min: 0, max: 10, show: v => v ? v : "Off" },
    shuffle: { list: [true, false], show: v => v ? "On" : "Off" },
  };
  function paintOpts() { stage.querySelectorAll(".mc-opt").forEach(row => { row.querySelector("output").textContent = OPT_SPEC[row.dataset.k].show(opt[row.dataset.k]); }); }
  stage.querySelectorAll(".mc-opt button").forEach(b => b.addEventListener("click", () => {
    const k = b.closest(".mc-opt").dataset.k, sp = OPT_SPEC[k], s = +b.dataset.s;
    if (sp.list) { const i = sp.list.indexOf(opt[k]); opt[k] = sp.list[(i + s + sp.list.length) % sp.list.length]; }
    else opt[k] = clamp(opt[k] + s, sp.min, sp.max);
    paintOpts(); applyDpad(); sfx.unlock(); sfx.click();
  }));
  paintOpts();
  $(".mc-optbtn").addEventListener("click", () => { const o = $(".mc-opts"); o.hidden = !o.hidden; });
  $(".mc-go").addEventListener("click", startGame);
  $(".mc-again").addEventListener("click", startGame);
  $(".mc-restart").addEventListener("click", () => { setPaused(false); jobs = []; startGame(); });
  $(".mc-resume").addEventListener("click", () => setPaused(false));
  $(".mc-tomenu").addEventListener("click", toMenu);
  $$(".mc-menu").addEventListener("click", () => setPaused(true));
  $(".mc-showans").addEventListener("click", () => { const a = $(".mc-ans"); a.hidden = !a.hidden; });
  const sBtn = $$(".mc-sound");
  sBtn.addEventListener("click", () => { sfx.setMuted(!sfx.muted); sBtn.classList.toggle("is-off", sfx.muted); });
  $$(".mc-full").addEventListener("click", () => { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.(); });

  // ---------------------------------------------------------------- màn chờ: mê cung dựng sẵn làm nền
  { const q = new URLSearchParams(location.search).get("dpad"); if (DPAD_STYLES.includes(q)) opt.dpadStyle = q; }
  paintOpts(); applyDpad();
  useMap(MAPS[0]); wallAnim.dir = 1; wallAnim.t = 99; paintWalls(); wallAnim.dir = 0;

  let last = performance.now(), manual = false;
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!manual) { update(dt); render(); }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // bàn thử (khung xem trước bị ẩn ⇒ rAF không chạy: lái tay bằng step)
  const api = {
    start: startGame,
    step(n = 1, dt = 1 / 60) { manual = true; for (let i = 0; i < n; i++) update(dt); render(); return api.state(); },
    resume() { manual = false; last = performance.now(); },
    snap() { render(); return canvas.toDataURL("image/jpeg", 0.85); },
    go(dir) { queueDir(dir); },
    bomb: () => placeBomb(),
    detonateAt(r, c) { const b = bombAt(r, c); if (b) detonate(b); },
    dropBomb(r, c) { if (bombAt(r, c)) return; const b = makeBomb(); b.g.position.set(cellX(c), 0, cellZ(r)); station.add(b.g); bombs.push({ r, c, obj: b, t: 0, gone: false }); },
    enemyNext: () => ens.map(e => ({ at: [e.r, e.c], open: DK.filter(k => open(e, k)).map(k => [e.r + DIRS[k].dr, e.c + DIRS[k].dc]) })), bombs: () => bombs.filter(b => !b.gone).map(b => [b.r, b.c]), bombsLeft: () => bombsLeft,
    autoTo(r, c) { autoTo = [r, c]; },
    cam(p, l) { camOverride = p ? { pos: new THREE.Vector3(...p), look: new THREE.Vector3(...l) } : null; },
    where() { const [x, z] = entityPos(pl); return { player: [x, z], enemies: ens.map(e => entityPos(e)) }; },
    press(screenDir) { const g = screenToGrid(...SCREEN_VEC[screenDir]); if (g) queueDir(g); return g; },
    set autoplay(v) { autoplay = !!v; }, get autoplay() { return autoplay; },
    opt, sfx, maps: MAPS, useMap: i => { useMap(MAPS[i]); wallAnim.dir = 1; wallAnim.t = 99; paintWalls(); }, map: () => curMap && curMap.map.name,
    state: () => ({ phase, qi, lives, score, time: +playT.toFixed(2), player: [pl.r, pl.c, pl.dir, pl.moving], enemies: ens.map(e => [e.r, e.c]), pads: pads.map(p => [p.r, p.c, p.text, p.correct, p.state]) }),
  };
  window.__mc = api;
  return api;
}

function escapeHtml(s) { return String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
