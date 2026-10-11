// SPEED RUN mẫu 2 — GIAO DIỆN TAY LÁI iPAD (11/10/2026). Thầy: "điều khiển trái phải, tăng tốc phanh tương tự như các game Asphalt thông thường".
//   mountDrivePad(mount, { team, client, onBack }) ⇒ { setState({ s, rtt }), setInfo({ kmh, cells, ms, alarm, phase }) }
//   mountPadChooser(mount, { onPick })            — màn chọn đội
// Bố cục NGANG (cầm iPad 2 tay như Asphalt): NGÓN CÁI TRÁI = 2 nút ◀ ▶ to (giữ để lái, thả là về thẳng);
//   NGÓN CÁI PHẢI = BRAKE (bàn đạp trái) + BOOST (bàn đạp phải, to hơn); FIRE (tên lửa) ở góc trên phải, xa bàn đạp.
//   Ga TỰ ĐỘNG (như Asphalt): không chạm gì xe vẫn chạy khi còn năng lượng. Nút TILT: lái bằng NGHIÊNG iPad (thử nghiệm — iOS hỏi quyền lần đầu).
//   Giữa trên: đồng hồ km/h + 4 ô năng lượng + số tên lửa (game gửi sang 4 lần/giây) · báo động đỏ khi tên lửa đang bay tới.
//   pointerdown/up nhiều ngón cùng lúc (mỗi nút nhớ pointerId) · touch-action:none · chặn zoom/menu giữ lâu · giữ màn sáng (Wake Lock).
import { TEAM_META } from "./sr3d-padlink-2.js";

const CSS = `
html,body{margin:0;height:100%;overflow:hidden;background:#05060a;overscroll-behavior:none}
.dp,.dpc{position:fixed;inset:0;font-family:"Exo 2",system-ui,sans-serif;color:#e2e8f0;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;
  background:radial-gradient(120% 90% at 50% 0%,#18233a 0%,#07090f 60%,#030408 100%)}
.dp{touch-action:none}
.dp::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:0;box-shadow:inset 0 0 18vmin rgba(255,30,20,.9)}
.dp[data-alarm="1"]::after{animation:dpa .5s ease-in-out infinite alternate}
.dp[data-alarm="2"]::after{animation:dpa .15s ease-in-out infinite alternate}
@keyframes dpa{from{opacity:.2}to{opacity:.95}}
.dp-b{position:absolute;border:0;padding:0;cursor:pointer;display:grid;place-items:center;color:#e0f2fe;touch-action:none;
  background:linear-gradient(180deg,rgba(30,44,74,.95),rgba(12,18,34,.97));box-shadow:inset 0 0 0 .5vmin rgba(125,211,252,.7),0 1.2vmin 2.4vmin rgba(0,0,0,.55);transition:transform .06s,background .06s}
.dp-b svg{width:46%;height:46%;overflow:visible}
.dp-b span{position:absolute;bottom:7%;left:0;right:0;text-align:center;font:900 max(14px,2.2vmin) "Exo 2",sans-serif;letter-spacing:.16em}
.dp-b.is-on{transform:scale(.94);background:linear-gradient(180deg,#0ea5e9,#0369a1)}
.dp-l,.dp-r{bottom:max(5vmin,env(safe-area-inset-bottom));width:min(23vw,30vmin);height:min(46vh,46vmin);border-radius:5vmin}
.dp-l{left:max(4vmin,env(safe-area-inset-left))}
.dp-r{left:calc(max(4vmin,env(safe-area-inset-left)) + min(23vw,30vmin) + 3vmin)}
.dp-brake,.dp-boost{bottom:max(5vmin,env(safe-area-inset-bottom));border-radius:4vmin}
.dp-boost{right:max(4vmin,env(safe-area-inset-right));width:min(19vw,26vmin);height:min(56vh,56vmin);
  background:linear-gradient(180deg,rgba(90,40,10,.95),rgba(40,16,4,.97));box-shadow:inset 0 0 0 .5vmin #fb923c,0 1.2vmin 2.4vmin rgba(0,0,0,.55);color:#ffedd5}
.dp-boost.is-on{background:linear-gradient(180deg,#fb923c,#c2410c)}
.dp-brake{right:calc(max(4vmin,env(safe-area-inset-right)) + min(19vw,26vmin) + 3vmin);width:min(15vw,21vmin);height:min(34vh,34vmin);
  background:linear-gradient(180deg,rgba(60,20,24,.95),rgba(26,8,10,.97));box-shadow:inset 0 0 0 .5vmin #f87171,0 1.2vmin 2.4vmin rgba(0,0,0,.55);color:#fee2e2}
.dp-brake.is-on{background:linear-gradient(180deg,#ef4444,#991b1b)}
.dp-fire{top:max(4vmin,env(safe-area-inset-top));right:max(4vmin,env(safe-area-inset-right));width:min(19vw,24vmin);aspect-ratio:1;border-radius:50%;
  background:radial-gradient(circle at 40% 35%,#4a1a10,#1c0a06 75%);box-shadow:inset 0 0 0 .5vmin #7c2d12,0 1.2vmin 2.4vmin rgba(0,0,0,.55);color:#7c4a3a}
.dp-fire.ready{color:#fff;background:radial-gradient(circle at 40% 35%,#ff7a4a,#c2290e 75%);box-shadow:inset 0 0 0 .5vmin #fed7aa,0 0 5vmin rgba(255,90,40,.6)}
.dp-fire.is-on{transform:scale(.92)}
.dp-fire b{position:absolute;top:6%;right:6%;min-width:4.4vmin;height:4.4vmin;border-radius:2.2vmin;background:#fff;color:#c2290e;font:900 3vmin/4.4vmin "Exo 2",sans-serif}
.dp-top{position:absolute;left:max(2.4vmin,env(safe-area-inset-left));top:max(2.4vmin,env(safe-area-inset-top));display:flex;align-items:center;gap:1.4vmin}
.dp-back{width:max(44px,5.6vmin);height:max(44px,5.6vmin);border-radius:50%;border:1px solid rgba(140,210,255,.4);background:rgba(255,255,255,.06);color:#cbd5e1;display:grid;place-items:center;cursor:pointer;padding:0}
.dp-back svg{width:55%;height:55%}
.dp-team{font:italic 900 max(22px,3.4vmin) "Exo 2",sans-serif;letter-spacing:.1em;color:var(--tc)}
.dp-st{display:flex;align-items:center;gap:.8vmin;font-weight:700;font-size:max(15px,2vmin);color:#cbd5e1}
.dp-st i{width:max(11px,1.4vmin);height:max(11px,1.4vmin);border-radius:50%;background:#64748b}
.dp[data-s="on"] .dp-st i{background:#4ade80;box-shadow:0 0 12px #4ade80}
.dp[data-s="relay"] .dp-st i{background:#facc15}
.dp[data-s="connecting"] .dp-st i,.dp[data-s="nogame"] .dp-st i{animation:dpb 1s steps(2) infinite}
@keyframes dpb{50%{opacity:.2}}
.dp-rtt{font:600 max(13px,1.6vmin) ui-monospace,Consolas,monospace;color:#94a3b8}
.dp-gauge{position:absolute;left:50%;top:max(3vmin,env(safe-area-inset-top));transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:1vmin;
  padding:1.4vmin 3vmin;border-radius:3vmin;background:rgba(5,10,18,.8);border:2px solid color-mix(in srgb,var(--tc) 60%,transparent)}
.dp-kmh{font:italic 900 9vmin/1 "Exo 2",sans-serif;color:#fff}.dp-kmh small{font:800 2.2vmin "Exo 2",sans-serif;color:#9fb4e0;margin-left:.6vmin}
.dp-cells{display:flex;gap:.8vmin;width:30vmin}
.dp-cells i{flex:1;height:2.2vmin;border-radius:.6vmin;background:linear-gradient(90deg,#ffd23f calc(var(--f,0)*100%),rgba(255,255,255,.12) 0)}
.dp-warn{font:italic 900 3.4vmin "Exo 2",sans-serif;color:#ff8a80;letter-spacing:.1em;min-height:3.6vmin}
.dp-tilt{position:absolute;left:max(2.4vmin,env(safe-area-inset-left));top:calc(max(2.4vmin,env(safe-area-inset-top)) + max(56px,7.4vmin));padding:1.4vmin 3vmin;border-radius:99px;border:2px solid rgba(140,210,255,.4);
  background:rgba(255,255,255,.05);color:#cbd5e1;font:800 max(14px,2.2vmin) "Exo 2",sans-serif;letter-spacing:.12em;cursor:pointer;display:flex;gap:2vmin;align-items:center}
.dp-tilt.on{border-color:#4ade80;color:#bbf7d0}
.dp-tilt em{font-style:normal;color:#94a3b8;font-weight:700}
.dp.is-tilt .dp-l,.dp.is-tilt .dp-r{opacity:.25}
.dp-msg{position:absolute;left:0;right:0;top:46%;text-align:center;font-size:max(15px,2.2vmin);color:#94a3b8;pointer-events:none}
.dp[data-s="on"] .dp-msg{display:none}
.dpc{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4vmin;padding:4vmin;box-sizing:border-box}
.dpc h1{margin:0;font:italic 900 max(30px,6vmin) "Exo 2",sans-serif;letter-spacing:.08em;color:#fff3dd}
.dpc p{margin:0;font-size:max(17px,2.4vmin);color:#94a3b8}
.dpc-row{display:flex;gap:5vmin;flex-wrap:wrap;justify-content:center}
.dpc-b{width:min(38vmin,380px);aspect-ratio:1.2;border-radius:4vmin;border:3px solid var(--tc);background:rgba(255,255,255,.04);color:var(--tc);cursor:pointer;padding:0;
  font:italic 900 max(28px,5vmin) "Exo 2",sans-serif;letter-spacing:.1em;box-shadow:0 0 4vmin color-mix(in srgb,var(--tc) 30%,transparent)}
.dpc-b:active{transform:scale(.96)}
`;
const ARROW = d => `<svg viewBox="0 0 24 24"><path d="${d < 0 ? "M16 3 L5 12 L16 21 Z" : "M8 3 L19 12 L8 21 Z"}" fill="currentColor"/></svg>`;
const MS = `<svg viewBox="0 0 24 24" style="transform:rotate(45deg)"><path d="M12 2c2.2 1.9 3.3 4.3 3.3 7.2V15l2.2 2.4V20l-3-1.3-.8 1.8h-3.4l-.8-1.8-3 1.3v-2.6L8.7 15V9.2C8.7 6.3 9.8 3.9 12 2z" fill="currentColor"/></svg>`;
const FLAME = `<svg viewBox="0 0 24 24"><path d="M12 2c1 4 5 5.5 5 10.5A5 5 0 0 1 7 12.5c0-2 1-3.3 2-4.2.2 1.6 1 2.6 2 3-1-3.2.2-6.7 1-9.3z" fill="currentColor"/></svg>`;
const BRAKE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="12" cy="12" r="7"/><path d="M4 6a10 10 0 0 0 0 12M20 6a10 10 0 0 1 0 12" stroke-linecap="round"/><path d="M12 8.5v4" stroke-linecap="round"/><circle cx="12" cy="15.3" r=".6" fill="currentColor"/></svg>`;
const BACK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>';
const TXT = { on: "Connected", relay: "Connected (slow)", connecting: "Connecting…", nogame: "Waiting for the game" };
const MSG = { relay: "No direct link on this Wi-Fi — steering goes the slow way.", connecting: "Linking to SPEED RUN… (if this stays, open the iPad panel on the big screen)", nogame: "Open SPEED RUN on the big screen — this iPad links by itself." };
let styled = false;
function style() { if (styled) return; styled = true; const st = document.createElement("style"); st.textContent = CSS; document.head.append(st); }
function noGestures(root) { ["contextmenu", "dblclick", "gesturestart", "touchmove"].forEach(ev => root.addEventListener(ev, e => e.preventDefault(), { passive: false })); }

export function mountDrivePad(mount, { team, client, onBack }) {
  style();
  const t = team ? 1 : 0, m = TEAM_META[t];
  mount.innerHTML = `<div class="dp" style="--tc:${m.color}" data-s="nogame" data-alarm="0">
    <button class="dp-b dp-l" data-k="l">${ARROW(-1)}</button><button class="dp-b dp-r" data-k="r">${ARROW(1)}</button>
    <button class="dp-b dp-brake" data-k="k">${BRAKE}<span>BRAKE</span></button><button class="dp-b dp-boost" data-k="b">${FLAME}<span>BOOST</span></button>
    <button class="dp-b dp-fire" data-k="f">${MS}<b>0</b></button>
    <div class="dp-top">${onBack ? `<button class="dp-back" aria-label="Choose team">${BACK}</button>` : ""}<b class="dp-team">${m.name}</b><span class="dp-st"><i></i><span></span></span><span class="dp-rtt"></span></div>
    <div class="dp-gauge"><div class="dp-kmh">0<small>km/h</small></div><div class="dp-cells"><i></i><i></i><i></i><i></i></div><div class="dp-warn"></div></div>
    <button class="dp-tilt">TILT <em>off</em></button>
    <div class="dp-msg"></div></div>`;
  const root = mount.firstElementChild, $ = s => root.querySelector(s);
  const down = { l: new Set(), r: new Set(), k: new Set(), b: new Set() };
  let tilt = false, g0 = null, tiltSteer = 0, info = { ms: 0 };
  const send = () => {
    const steer = tilt ? tiltSteer : (down.r.size ? 1 : 0) - (down.l.size ? 1 : 0);
    client.drive(steer, down.b.size > 0, down.k.size > 0);
  };
  root.querySelectorAll(".dp-b").forEach(b => {
    const k = b.dataset.k;
    b.addEventListener("pointerdown", e => {
      e.preventDefault();
      if (k === "f") { client.send("fire"); b.classList.add("is-on"); setTimeout(() => b.classList.remove("is-on"), 160); return; }
      try { b.setPointerCapture(e.pointerId); } catch (er) { /* */ }
      down[k].add(e.pointerId); b.classList.add("is-on"); send();
    });
    const up = e => { if (!down[k] || !down[k].delete(e.pointerId)) return; if (!down[k].size) b.classList.remove("is-on"); send(); };
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(ev => b.addEventListener(ev, up));
  });
  // TILT: thành phần trọng lực theo trục NGANG của màn (đổi theo hướng xoay iPad); lúc bật lấy tư thế hiện tại làm "thẳng"
  const scrAngle = () => ((screen.orientation && screen.orientation.angle) ?? window.orientation ?? 0) * Math.PI / 180;
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const onMotion = e => {
    const g = e.accelerationIncludingGravity; if (!g || g.x == null) return;
    const a = scrAngle(), gx = (g.x * Math.cos(a) - g.y * Math.sin(a)) * (ios ? -1 : 1);
    if (g0 == null) g0 = gx;
    const d = gx - g0, dz = Math.abs(d) < 0.6 ? 0 : d - Math.sign(d) * 0.6;
    const v = Math.max(-1, Math.min(1, dz / 3.2));
    if (Math.abs(v - tiltSteer) > 0.03) { tiltSteer = v; send(); }
  };
  $(".dp-tilt").addEventListener("click", async () => {
    if (!tilt) {
      try { if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === "function") { const r = await DeviceMotionEvent.requestPermission(); if (r !== "granted") return; } } catch (e) { return; }
      tilt = true; g0 = null; window.addEventListener("devicemotion", onMotion);
    } else { tilt = false; tiltSteer = 0; window.removeEventListener("devicemotion", onMotion); }
    root.classList.toggle("is-tilt", tilt); $(".dp-tilt").classList.toggle("on", tilt); $(".dp-tilt em").textContent = tilt ? "on · hold level = straight" : "off"; send();
  });
  root.querySelector(".dp-back")?.addEventListener("click", () => onBack());
  noGestures(root);
  let lock = null;
  const keep = async () => { if (lock || !("wakeLock" in navigator) || document.visibilityState !== "visible") return; try { lock = await navigator.wakeLock.request("screen"); lock.addEventListener("release", () => { lock = null; }); } catch (e) { /* */ } };
  keep(); document.addEventListener("visibilitychange", keep); root.addEventListener("pointerdown", keep, { once: true });
  return {
    setState({ s, rtt }) {
      root.dataset.s = s;
      $(".dp-st > span").textContent = TXT[s] || "";
      $(".dp-rtt").textContent = s === "on" && rtt ? rtt + " ms" : "";
      $(".dp-msg").textContent = MSG[s] || "";
    },
    setInfo(i) {
      info = i;
      $(".dp-kmh").firstChild.textContent = i.kmh;
      root.querySelectorAll(".dp-cells i").forEach((c, k) => c.style.setProperty("--f", Math.max(0, Math.min(1, i.cells - k)).toFixed(2)));
      $(".dp-fire b").textContent = i.ms; $(".dp-fire").classList.toggle("ready", i.ms > 0 && i.phase === "race");
      root.dataset.alarm = String(i.alarm || 0);
      $(".dp-warn").textContent = i.alarm === 2 ? "DODGE!" : i.alarm === 1 ? "⚠ MISSILE" : i.phase === "race" && i.cells < 0.02 && i.kmh === 0 ? "ANSWER FOR ENERGY" : "";
    },
  };
}

export function mountPadChooser(mount, { onPick }) {
  style();
  mount.innerHTML = `<div class="dpc"><h1>SPEED RUN · iPad wheel</h1><p>Choose this iPad's team</p>
    <div class="dpc-row">${[0, 1].map(t => `<button class="dpc-b" data-t="${t}" style="--tc:${TEAM_META[t].color}">${TEAM_META[t].name}</button>`).join("")}</div>
    <p>Hold the iPad sideways with both hands: left thumb ◀ ▶ · right thumb BRAKE / BOOST · FIRE top right.</p></div>`;
  mount.querySelectorAll(".dpc-b").forEach(b => b.addEventListener("click", () => onPick(+b.dataset.t)));
  noGestures(mount.firstElementChild);
}
