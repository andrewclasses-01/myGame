// SPEED RUN mẫu 3d — HÌNH VẼ TAP-LÔ DÙNG CHUNG cho màn lớn và iPad (15/10/2026), thay sr3d-dash-3c.js. Thầy (15/10):
//   · cung sáng 1/4 vành vô lăng MỜ DẦN ở 2 đầu (dải màu chuyển trong suốt dọc theo cung + nhoè), không cắt gọn như 3c.
//   · 2 bàn đạp (treo) RỘNG BẰNG NHAU, tay đòn kim loại GIỐNG HỆT nhau; ga cao hơn phanh. Bỏ chữ BOOST/BRAKE (nằm ở lõi/CSS) ⇒ bàn đạp dài thêm.
//   · Nút tên lửa: 2 quả ĐỨNG SONG SONG cạnh nhau (không chéo, không dính).
// Gốc 3c: vành có 2 cung .wg.wl/.wr · bàn đạp treo: giá trên cố định, nhóm .mv (tay đòn + mặt đạp) lún · .sr-fly quả bay trong nút · reserveHTML(n) ≤ 4 + "+x".

const P = (a, r) => [(100 + r * Math.cos(a)).toFixed(1), (100 + r * Math.sin(a)).toFixed(1)];
const arc = (a0, a1, r) => { const [x0, y0] = P(a0, r), [x1, y1] = P(a1, r); return `M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}`; };
const R = 81, LA = [Math.PI * .75, Math.PI * 1.25], RA = [-Math.PI * .25, Math.PI * .25];
const fade = (id, y0, y1) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${y0}" x2="0" y2="${y1}">
    <stop offset="0" style="stop-color:var(--team);stop-opacity:0"/><stop offset=".32" style="stop-color:var(--team);stop-opacity:1"/>
    <stop offset=".68" style="stop-color:var(--team);stop-opacity:1"/><stop offset="1" style="stop-color:var(--team);stop-opacity:0"/></linearGradient>`;
export const WHEEL_SVG = `<svg viewBox="0 0 200 200" aria-hidden="true" overflow="visible">
  <defs><linearGradient id="srwg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3f48"/><stop offset=".5" stop-color="#16191e"/><stop offset="1" stop-color="#0b0d10"/></linearGradient>
    ${fade("srwgf", 100 - R * Math.SQRT1_2 - 6, 100 + R * Math.SQRT1_2 + 6)}
    <filter id="srwglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <path d="M100 8 A92 92 0 1 1 99.9 8 Z M100 30 A70 70 0 1 0 100.1 30 Z" fill="url(#srwg)" fill-rule="evenodd" stroke="#4a515c" stroke-width="1.5"/>
  <path class="wg wl" d="${arc(LA[0], LA[1], R)}" fill="none" stroke="url(#srwgf)" stroke-width="19" stroke-linecap="butt" filter="url(#srwglow)"/>
  <path class="wg wr" d="${arc(RA[0], RA[1], R)}" fill="none" stroke="url(#srwgf)" stroke-width="19" stroke-linecap="butt" filter="url(#srwglow)"/>
  <path d="M93 8.3 h14 v20 h-14 Z" fill="var(--team)"/>
  <path d="M32 112 L58 112 L66 132 L134 132 L142 112 L168 112 L162 140 L128 160 L72 160 L38 140 Z" fill="#14171b" stroke="#3a414b" stroke-width="1.5"/>
  <path d="M30 104 L58 104" stroke="#1d2127" stroke-width="12" stroke-linecap="round"/><path d="M142 104 L170 104" stroke="#1d2127" stroke-width="12" stroke-linecap="round"/>
  <circle cx="44" cy="124" r="7" fill="#c8262b"/><circle cx="156" cy="124" r="7" fill="#16a06a"/>
</svg>`;

const ribs = (x, w, y0, y1, step, h) => { let s = ""; for (let y = y0; y <= y1; y += step) s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="#07080a"/><rect x="${x}" y="${y + h}" width="${w}" height="1" fill="rgba(255,255,255,.10)"/>`; return s; };
const DEFS = `<linearGradient id="srpm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4a5058"/><stop offset=".5" stop-color="#c3c9d1"/><stop offset="1" stop-color="#3e444c"/></linearGradient>
  <linearGradient id="srrub" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e3239"/><stop offset="1" stop-color="#121418"/></linearGradient>`;
// giá + trục (cố định) và tay đòn (lún cùng mặt đạp) — GIỐNG HỆT nhau ở 2 bàn đạp
const BRACKET = `<g class="fx"><rect x="23" y="0" width="30" height="9" rx="2" fill="#1d2025" stroke="#4d545e"/><rect x="29" y="7" width="18" height="9" rx="2" fill="url(#srpm)"/>
  <circle cx="38" cy="12" r="3.4" fill="#2a2e34" stroke="#9aa2ad" stroke-width="1.2"/></g>`;
const ARM = `<path d="M34 12 H42 L43 74 Q38 80 33 74 Z" fill="url(#srpm)"/>`;
const bolts = (y0, y1) => `<circle cx="12" cy="${y0}" r="1.8" fill="#8f97a2"/><circle cx="64" cy="${y0}" r="1.8" fill="#8f97a2"/><circle cx="12" cy="${y1}" r="1.8" fill="#8f97a2"/><circle cx="64" cy="${y1}" r="1.8" fill="#8f97a2"/>`;

// 76 × 150 cả 2: mặt đạp rộng 68 bằng nhau · GA cao 84 (viền kim loại, có lớp boost dâng .sr-nfill) · PHANH cao 60 (viền đỏ)
export const GAS_SVG = `<svg viewBox="0 0 76 150" aria-hidden="true" class="sr-pedal-svg">
  <defs>${DEFS}<clipPath id="srgasclip"><rect x="4" y="62" width="68" height="84" rx="11"/></clipPath></defs>
  <g class="mv" style="transform-origin:38px 12px">
    ${ARM}
    <rect x="4" y="62" width="68" height="84" rx="11" fill="url(#srrub)" stroke="url(#srpm)" stroke-width="2.6"/>
    <g clip-path="url(#srgasclip)"><rect class="sr-nfill" x="0" y="62" width="76" height="88"/></g>
    ${ribs(13, 50, 70, 136, 8, 3.4)}${bolts(70, 138)}
  </g>
  ${BRACKET}
</svg>`;
export const BRAKE_SVG = `<svg viewBox="0 0 76 150" aria-hidden="true" class="sr-pedal-svg">
  <defs>${DEFS}</defs>
  <g class="mv" style="transform-origin:38px 12px">
    ${ARM}
    <rect x="4" y="70" width="68" height="60" rx="11" fill="url(#srrub)" stroke="#c43a32" stroke-width="2.6"/>
    ${ribs(13, 50, 79, 120, 8, 3.4)}${bolts(78, 122)}
  </g>
  ${BRACKET}
</svg>`;

// tên lửa mảnh (mũi lên)
const MS_PATH = `<path d="M12 1.2c1.15 1.05 1.75 2.6 1.75 4.4V15.6l2.35 2.6v2.2l-2.35-.95V20.6h-3.5v-1.15l-2.35.95v-2.2l2.35-2.6V5.6c0-1.8.6-3.35 1.75-4.4z" fill="currentColor"/><rect x="10.25" y="7.2" width="3.5" height="1.6" fill="rgba(0,0,0,.35)"/>`;
export const MS_ICON = `<svg viewBox="0 0 24 24">${MS_PATH}</svg>`;
export const FIRE_ICON = `<svg viewBox="0 0 24 24" class="sr-x2"><g transform="translate(-5.6 0)">${MS_PATH}</g><g transform="translate(5.6 0)">${MS_PATH}</g></svg>`;   // 2 quả ĐỨNG SONG SONG
export const FLY_HTML = `<i class="sr-fly"><svg viewBox="0 0 24 30">${MS_PATH}<path d="M10.4 21 Q12 29.5 13.6 21 Z" fill="#ffb347"/></svg></i>`;
export const reserveHTML = n => `${MS_ICON.repeat(Math.min(4, Math.max(0, n)))}${n > 4 ? `<b>+${n - 4}</b>` : ""}`;
