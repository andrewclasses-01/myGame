// SPEED RUN mẫu 3b — HÌNH VẼ TAP-LÔ DÙNG CHUNG cho màn lớn và iPad (15/10/2026)
// Thầy (15/10): "Nút boost và brake ở 2 bên vô lăng (boost bên trái, brake bên phải) và phải vẽ lại đúng hình dáng của bàn đạp ga và phanh trong thực tế"
//   · iPad chế độ "đua trong iPad" phải hiện vô lăng + bàn đạp Y HỆT trong game ⇒ cả 2 bên import từ đây.
// Bàn đạp GA: kiểu "organ pedal" (tấm cao, bản lề ở CHÂN, mặt cao su gân ngang, khung kim loại) — trong SVG có lớp .sr-nfill = thanh NITRO dâng từ dưới.
// Bàn đạp PHANH: tay đòn kim loại thả từ trên xuống + mặt đạp rộng thấp, cao su gân ngang, viền đỏ.

export const WHEEL_SVG = `<svg viewBox="0 0 200 200" aria-hidden="true">
  <defs><linearGradient id="srwg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3f48"/><stop offset=".5" stop-color="#16191e"/><stop offset="1" stop-color="#0b0d10"/></linearGradient></defs>
  <path d="M100 8 A92 92 0 1 1 99.9 8 Z M100 30 A70 70 0 1 0 100.1 30 Z" fill="url(#srwg)" fill-rule="evenodd" stroke="#4a515c" stroke-width="1.5"/>
  <path d="M93 8.3 h14 v20 h-14 Z" fill="var(--team)"/>
  <path d="M32 112 L58 112 L66 132 L134 132 L142 112 L168 112 L162 140 L128 160 L72 160 L38 140 Z" fill="#14171b" stroke="#3a414b" stroke-width="1.5"/>
  <path d="M30 104 L58 104" stroke="#1d2127" stroke-width="12" stroke-linecap="round"/><path d="M142 104 L170 104" stroke="#1d2127" stroke-width="12" stroke-linecap="round"/>
  <circle cx="44" cy="124" r="7" fill="#c8262b"/><circle cx="156" cy="124" r="7" fill="#16a06a"/>
</svg>`;

const ribs = (x, w, y0, y1, step, h) => { let s = ""; for (let y = y0; y <= y1; y += step) s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="#07080a"/><rect x="${x}" y="${y + h}" width="${w}" height="1" fill="rgba(255,255,255,.10)"/>`; return s; };

// GA: 60 × 140 — tấm đạp cao hơi thuôn ở trên, bản lề + đế dưới chân
export const GAS_SVG = `<svg viewBox="0 0 60 140" aria-hidden="true" class="sr-pedal-svg">
  <defs>
    <linearGradient id="srgas" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#16181c"/><stop offset=".5" stop-color="#2b2f36"/><stop offset="1" stop-color="#121418"/></linearGradient>
    <linearGradient id="srmet" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5b626c"/><stop offset=".45" stop-color="#c9ced6"/><stop offset="1" stop-color="#4a5058"/></linearGradient>
    <clipPath id="srgasclip"><path d="M11 6 Q11 3 14 3 H46 Q49 3 49 6 L53 112 Q53 116 49 116 H11 Q7 116 7 112 Z"/></clipPath>
  </defs>
  <rect x="10" y="118" width="40" height="9" rx="2" fill="url(#srmet)"/>
  <rect x="4" y="126" width="52" height="11" rx="3" fill="#1a1d22" stroke="#444b55" stroke-width="1"/>
  <circle cx="12" cy="131.5" r="2" fill="#9aa2ad"/><circle cx="48" cy="131.5" r="2" fill="#9aa2ad"/>
  <path d="M11 6 Q11 3 14 3 H46 Q49 3 49 6 L53 112 Q53 116 49 116 H11 Q7 116 7 112 Z" fill="url(#srgas)" stroke="url(#srmet)" stroke-width="2.4"/>
  <g clip-path="url(#srgasclip)"><rect class="sr-nfill" x="0" y="0" width="60" height="120"/></g>
  ${ribs(14, 32, 12, 104, 8.4, 3.6)}
  <path d="M14 6 H46" stroke="rgba(255,255,255,.25)" stroke-width="1"/>
</svg>`;

// PHANH: 76 × 140 — tay đòn thả từ trên + mặt đạp rộng
export const BRAKE_SVG = `<svg viewBox="0 0 76 140" aria-hidden="true" class="sr-pedal-svg">
  <defs>
    <linearGradient id="srbrk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c3037"/><stop offset="1" stop-color="#121418"/></linearGradient>
    <linearGradient id="srarm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4a5058"/><stop offset=".5" stop-color="#b9bfc8"/><stop offset="1" stop-color="#3e444c"/></linearGradient>
  </defs>
  <path d="M33 0 H43 L42 66 Q38 72 34 66 Z" fill="url(#srarm)"/>
  <rect x="29" y="2" width="18" height="8" rx="2" fill="#22262c" stroke="#555c66"/>
  <rect x="4" y="62" width="68" height="62" rx="11" fill="url(#srbrk)" stroke="#c43a32" stroke-width="2.6"/>
  <rect x="8" y="66" width="60" height="54" rx="8" fill="none" stroke="rgba(255,255,255,.08)"/>
  ${ribs(13, 50, 72, 112, 8, 3.4)}
  <circle cx="12" cy="70" r="1.8" fill="#8f97a2"/><circle cx="64" cy="70" r="1.8" fill="#8f97a2"/><circle cx="12" cy="116" r="1.8" fill="#8f97a2"/><circle cx="64" cy="116" r="1.8" fill="#8f97a2"/>
</svg>`;

export const MS_ICON = `<svg viewBox="0 0 24 24"><path d="M12 2c2.2 1.9 3.3 4.3 3.3 7.2V15l2.2 2.4V20l-3-1.3-.8 1.8h-3.4l-.8-1.8-3 1.3v-2.6L8.7 15V9.2C8.7 6.3 9.8 3.9 12 2z" fill="currentColor"/></svg>`;
