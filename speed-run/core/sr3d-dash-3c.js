// SPEED RUN mẫu 3c — HÌNH VẼ TAP-LÔ DÙNG CHUNG cho màn lớn và iPad (15/10/2026), thay sr3d-dash-3b.js. Thầy (15/10):
//   · "bấm bên nào thì chỉ sáng một đoạn vô lăng của nửa bên đó, độ dài đoạn sáng = 1/4 vô lăng" ⇒ vành vô lăng có 2 cung 90° (.wg.wl trái / .wg.wr phải)
//     màu đội + quầng sáng, chỉ hiện cung bên đang bấm (cung quay theo vô lăng vì nằm trên vành).
//   · "Bàn đạp boost và phanh cần mô phỏng đúng xe thật: phần trên là cố định, phần dưới mới là phần được nhấn xuống" ⇒ 2 bàn đạp kiểu TREO:
//     giá + trục ở trên (cố định), nhóm .mv = tay đòn + mặt đạp quay quanh trục (CSS: .is-down .mv ⇒ lún xuống + ngắn lại = bị đạp ra xa).
//   · Nút tên lửa: KHÔNG chữ FIRE, chỉ icon 2 tên lửa CHÉO nhau; bấm ⇒ 1 tên lửa bay vút lên trong phạm vi nút (.sr-fly).
//     Tên lửa chờ (dựng đứng, nhỏ hơn icon trong nút) hiện tối đa 4 + "+x".

const ARC = r => ({ l: `M${(100 + r * Math.cos(Math.PI * .75)).toFixed(1)} ${(100 + r * Math.sin(Math.PI * .75)).toFixed(1)} A${r} ${r} 0 0 1 ${(100 + r * Math.cos(Math.PI * 1.25)).toFixed(1)} ${(100 + r * Math.sin(Math.PI * 1.25)).toFixed(1)}`,
  r: `M${(100 + r * Math.cos(-Math.PI * .25)).toFixed(1)} ${(100 + r * Math.sin(-Math.PI * .25)).toFixed(1)} A${r} ${r} 0 0 1 ${(100 + r * Math.cos(Math.PI * .25)).toFixed(1)} ${(100 + r * Math.sin(Math.PI * .25)).toFixed(1)}` });
const A = ARC(81);
export const WHEEL_SVG = `<svg viewBox="0 0 200 200" aria-hidden="true" overflow="visible">
  <defs><linearGradient id="srwg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3f48"/><stop offset=".5" stop-color="#16191e"/><stop offset="1" stop-color="#0b0d10"/></linearGradient>
    <filter id="srwglow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <path d="M100 8 A92 92 0 1 1 99.9 8 Z M100 30 A70 70 0 1 0 100.1 30 Z" fill="url(#srwg)" fill-rule="evenodd" stroke="#4a515c" stroke-width="1.5"/>
  <path class="wg wl" d="${A.l}" fill="none" stroke="var(--team)" stroke-width="19" stroke-linecap="round" filter="url(#srwglow)"/>
  <path class="wg wr" d="${A.r}" fill="none" stroke="var(--team)" stroke-width="19" stroke-linecap="round" filter="url(#srwglow)"/>
  <path d="M93 8.3 h14 v20 h-14 Z" fill="var(--team)"/>
  <path d="M32 112 L58 112 L66 132 L134 132 L142 112 L168 112 L162 140 L128 160 L72 160 L38 140 Z" fill="#14171b" stroke="#3a414b" stroke-width="1.5"/>
  <path d="M30 104 L58 104" stroke="#1d2127" stroke-width="12" stroke-linecap="round"/><path d="M142 104 L170 104" stroke="#1d2127" stroke-width="12" stroke-linecap="round"/>
  <circle cx="44" cy="124" r="7" fill="#c8262b"/><circle cx="156" cy="124" r="7" fill="#16a06a"/>
</svg>`;

const ribs = (x, w, y0, y1, step, h) => { let s = ""; for (let y = y0; y <= y1; y += step) s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="#07080a"/><rect x="${x}" y="${y + h}" width="${w}" height="1" fill="rgba(255,255,255,.10)"/>`; return s; };
const METAL = id => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4a5058"/><stop offset=".5" stop-color="#c3c9d1"/><stop offset="1" stop-color="#3e444c"/></linearGradient>`;
const RUBBER = id => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e3239"/><stop offset="1" stop-color="#121418"/></linearGradient>`;
const BRACKET = (cx) => `<g class="fx"><rect x="${cx - 15}" y="0" width="30" height="9" rx="2" fill="#1d2025" stroke="#4d545e"/><rect x="${cx - 9}" y="7" width="18" height="9" rx="2" fill="url(#srpm)"/>
  <circle cx="${cx}" cy="12" r="3.4" fill="#2a2e34" stroke="#9aa2ad" stroke-width="1.2"/></g>`;

// GA (treo): 60 × 140 — giá trên cố định · tay đòn mảnh · mặt đạp CAO hẹp (có lớp Nitro/boost dâng .sr-nfill)
export const GAS_SVG = `<svg viewBox="0 0 60 140" aria-hidden="true" class="sr-pedal-svg">
  <defs>${METAL("srpm")}${RUBBER("srgasr")}<clipPath id="srgasclip"><rect x="11" y="50" width="38" height="86" rx="7"/></clipPath></defs>
  <g class="mv" style="transform-origin:30px 12px">
    <path d="M27.5 12 H32.5 L33 52 H27 Z" fill="url(#srpm)"/>
    <rect x="11" y="50" width="38" height="86" rx="7" fill="url(#srgasr)" stroke="url(#srpm)" stroke-width="2.2"/>
    <g clip-path="url(#srgasclip)"><rect class="sr-nfill" x="0" y="50" width="60" height="90"/></g>
    ${ribs(16, 28, 57, 126, 8, 3.4)}
  </g>
  ${BRACKET(30)}
</svg>`;

// PHANH (treo): 76 × 140 — giá trên cố định · tay đòn dày · mặt đạp RỘNG thấp viền đỏ
export const BRAKE_SVG = `<svg viewBox="0 0 76 140" aria-hidden="true" class="sr-pedal-svg">
  <defs>${METAL("srpm")}${RUBBER("srbrkr")}</defs>
  <g class="mv" style="transform-origin:38px 12px">
    <path d="M34 12 H42 L43 72 Q38 78 33 72 Z" fill="url(#srpm)"/>
    <rect x="4" y="70" width="68" height="62" rx="11" fill="url(#srbrkr)" stroke="#c43a32" stroke-width="2.6"/>
    ${ribs(13, 50, 79, 120, 8, 3.4)}
    <circle cx="12" cy="78" r="1.8" fill="#8f97a2"/><circle cx="64" cy="78" r="1.8" fill="#8f97a2"/><circle cx="12" cy="124" r="1.8" fill="#8f97a2"/><circle cx="64" cy="124" r="1.8" fill="#8f97a2"/>
  </g>
  ${BRACKET(38)}
</svg>`;

// tên lửa mảnh (mũi lên): thân + mũi nhọn + cánh đuôi + đai
const MS_PATH = `<path d="M12 1.2c1.15 1.05 1.75 2.6 1.75 4.4V15.6l2.35 2.6v2.2l-2.35-.95V20.6h-3.5v-1.15l-2.35.95v-2.2l2.35-2.6V5.6c0-1.8.6-3.35 1.75-4.4z" fill="currentColor"/><rect x="10.25" y="7.2" width="3.5" height="1.6" fill="rgba(0,0,0,.35)"/>`;
export const MS_ICON = `<svg viewBox="0 0 24 24">${MS_PATH}</svg>`;                                   // 1 quả dựng đứng (tên lửa chờ)
export const FIRE_ICON = `<svg viewBox="0 0 24 24" class="sr-x2"><g transform="rotate(-32 12 12)">${MS_PATH}</g><g transform="rotate(32 12 12)">${MS_PATH}</g></svg>`;
export const FLY_HTML = `<i class="sr-fly"><svg viewBox="0 0 24 30">${MS_PATH}<path d="M10.4 21 Q12 29.5 13.6 21 Z" fill="#ffb347"/></svg></i>`;
/** tên lửa chờ: tối đa 4 icon dựng đứng + "+x" */
export const reserveHTML = n => `${MS_ICON.repeat(Math.min(4, Math.max(0, n)))}${n > 4 ? `<b>+${n - 4}</b>` : ""}`;
